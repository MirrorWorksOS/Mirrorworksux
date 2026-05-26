/**
 * Client-side upload helper. Drives the three-step pipeline:
 *
 *   1. startUpload     → Convex returns a signed S3 URL + uploadKey + modelId
 *   2. browser PUTs    → file bytes go straight to APS OSS (S3-compatible)
 *   3. finishUpload    → Convex finalizes + kicks off Model Derivative job
 *
 * After step 3 the MirrorViewer subscribes to `api.mirrorview.getActiveModel`
 * via Convex's reactive query, so progress + final URN flow into the UI
 * automatically — no client polling required.
 */
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import type { ViewerContext } from './mirrorViewer';

export interface UploadProgress {
  phase: 'starting' | 'uploading' | 'finalizing' | 'translating' | 'done';
  percent: number;
}

export type UploadProgressCallback = (p: UploadProgress) => void;

function getClient(): ConvexHttpClient {
  const url = import.meta.env.VITE_CONVEX_URL as string | undefined;
  if (!url) throw new Error('VITE_CONVEX_URL not set');
  return new ConvexHttpClient(url);
}

function putToS3(
  signedUrl: string,
  file: File,
  onProgress: (loaded: number, total: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', signedUrl);
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) onProgress(ev.loaded, ev.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`S3 PUT failed: ${xhr.status} ${xhr.responseText}`));
    };
    xhr.onerror = () => reject(new Error('S3 PUT network error'));
    xhr.send(file);
  });
}

export interface UploadResult {
  modelId: Id<'mirrorviewModels'>;
  urn: string;
}

export async function uploadCadFile(
  file: File,
  context: ViewerContext,
  onProgress: UploadProgressCallback = () => {},
): Promise<UploadResult> {
  const client = getClient();

  onProgress({ phase: 'starting', percent: 0 });
  const start = (await client.action(api.aps.startUpload, {
    fileName: file.name,
    sizeBytes: file.size,
    ownerType: context.ownerType,
    ownerId: context.ownerId,
  })) as {
    modelId: Id<'mirrorviewModels'>;
    signedUrl: string;
    uploadKey: string;
    bucketKey: string;
    objectKey: string;
  };

  onProgress({ phase: 'uploading', percent: 0 });
  await putToS3(start.signedUrl, file, (loaded, total) => {
    onProgress({
      phase: 'uploading',
      percent: total > 0 ? Math.round((loaded / total) * 100) : 0,
    });
  });

  onProgress({ phase: 'finalizing', percent: 100 });
  const finish = (await client.action(api.aps.finishUpload, {
    modelId: start.modelId,
    uploadKey: start.uploadKey,
    bucketKey: start.bucketKey,
    objectKey: start.objectKey,
  })) as { urn: string };

  onProgress({ phase: 'translating', percent: 0 });
  return { modelId: start.modelId, urn: finish.urn };
}
