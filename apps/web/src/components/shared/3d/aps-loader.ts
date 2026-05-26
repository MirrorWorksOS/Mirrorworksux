/**
 * APS Viewer v7 loader — pulls the runtime JS + CSS from Autodesk's CDN.
 *
 * Singleton: the APS bundle attaches `Autodesk.Viewing` to `window` and can
 * only be initialised once per page. This module guards both the script load
 * and the `Initializer` call so multiple `<MirrorViewer>` instances coexist.
 */

const APS_VIEWER_VERSION = '7.*';
const APS_JS_URL = `https://developer.api.autodesk.com/modelderivative/v2/viewers/${APS_VIEWER_VERSION}/viewer3D.min.js`;
const APS_CSS_URL = `https://developer.api.autodesk.com/modelderivative/v2/viewers/${APS_VIEWER_VERSION}/style.min.css`;

declare global {
  interface Window {
    Autodesk?: {
      Viewing: ApsViewing;
    };
  }
}

interface Vec3Like {
  x: number;
  y: number;
  z: number;
}

export interface ApsCameraSnapshot {
  position: Vec3Like;
  target: Vec3Like;
  up: Vec3Like;
}

export interface ApsViewerInstance {
  start(): number;
  loadDocumentNode(doc: unknown, viewable: unknown): Promise<unknown>;
  finish(): void;
  resize(): void;
  setLightPreset(idx: number): void;
  setTheme(theme: string): void;
  fitToView(dbIds?: number[]): boolean;
  getCamera(): { position: Vec3Like; target: Vec3Like; up: Vec3Like };
  isolate(dbIds?: number[]): void;
  getIsolatedNodes(): number[];
  getSelection(): number[];
  select(dbIds: number[]): void;
  clearSelection(): void;
  navigation: {
    setRequestHomeView(b: boolean): void;
    fitBounds(immediate: boolean, bounds?: unknown): void;
    setView(position: Vec3Like, target: Vec3Like): void;
    setCameraUpVector(up: Vec3Like): void;
  };
  setActiveNavigationTool(tool: string): void;
  addEventListener(type: string, cb: (e: unknown) => void): void;
  removeEventListener(type: string, cb: (e: unknown) => void): void;
  getScreenShot(w: number, h: number, cb: (blobUrl: string) => void): void;
}

interface ApsViewing {
  Initializer(
    options: {
      env: string;
      getAccessToken: (cb: (token: string, expiresIn: number) => void) => void;
    },
    onInit: () => void,
  ): void;
  GuiViewer3D: new (container: HTMLElement, config?: Record<string, unknown>) => ApsViewerInstance;
  Document: {
    load(
      urn: string,
      onSuccess: (doc: { getRoot(): { getDefaultGeometry(): unknown } }) => void,
      onError: (errorCode: number, message: string) => void,
    ): void;
  };
}

let scriptPromise: Promise<void> | null = null;
let initialised = false;

/** Insert the APS JS + CSS tags once; subsequent calls return the same promise. */
export function ensureApsScriptLoaded(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('APS Viewer requires a browser'));
  }
  if (window.Autodesk?.Viewing) {
    scriptPromise = Promise.resolve();
    return scriptPromise;
  }

  scriptPromise = new Promise<void>((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = APS_CSS_URL;
    document.head.appendChild(css);

    const script = document.createElement('script');
    script.src = APS_JS_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load APS Viewer bundle'));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/** Initialise the APS Viewing runtime exactly once with a token-getter. */
export function ensureApsInitialised(
  getAccessToken: (cb: (token: string, expiresIn: number) => void) => void,
): Promise<ApsViewing> {
  return ensureApsScriptLoaded().then(
    () =>
      new Promise<ApsViewing>((resolve, reject) => {
        const Viewing = window.Autodesk?.Viewing;
        if (!Viewing) {
          reject(new Error('Autodesk.Viewing missing after script load'));
          return;
        }
        if (initialised) {
          resolve(Viewing);
          return;
        }
        Viewing.Initializer(
          { env: 'AutodeskProduction', getAccessToken },
          () => {
            initialised = true;
            resolve(Viewing);
          },
        );
      }),
  );
}
