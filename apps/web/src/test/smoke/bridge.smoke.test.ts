import { describe, expect, it } from 'vitest';
import { bridgeService } from '@/services';
import { runBridgeFileIngestPipeline } from '@/services';

describe('bridge smoke', () => {
  it('runs the mock bridge ingest pipeline', async () => {
    const session = await bridgeService.createSession();
    const file = new File(
      ['Company Name,Email\nAcme,ops@acme.com'],
      'customers.csv',
      { type: 'text/csv' },
    );

    const result = await runBridgeFileIngestPipeline(session.sessionId, file);

    expect(result.bridgeFile.id).toBeTruthy();
    expect(result.analysed.analysisStatus).toBe('complete');
    expect(result.mappings.length).toBeGreaterThan(0);
  }, 15000);
});
