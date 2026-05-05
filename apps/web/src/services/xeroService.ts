/**
 * Xero integration service. Currently mock-backed but typed so that the
 * backend can be swapped in by replacing the implementations of these
 * functions — call signatures stay the same.
 */
import {
  mockXeroAccounts,
  mockXeroBrandingThemes,
  mockXeroMappingConfig,
  mockXeroOrganisation,
  mockXeroSyncEntities,
  mockXeroTaxRates,
  mockXeroTrackingCategories,
} from '@/services/mock/xero';
import type {
  XeroAccount,
  XeroBrandingTheme,
  XeroMappingConfig,
  XeroOrganisation,
  XeroSyncEntity,
  XeroTaxRate,
  XeroTrackingCategory,
} from '@/types/xero';

// In-memory mutable copy so unsaved-then-saved state survives within a
// session without the source mock being mutated.
let savedConfig: XeroMappingConfig = JSON.parse(
  JSON.stringify(mockXeroMappingConfig),
) as XeroMappingConfig;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getOrganisation(): Promise<XeroOrganisation> {
  await delay(60);
  return mockXeroOrganisation;
}

export async function getAccounts(): Promise<XeroAccount[]> {
  await delay(120);
  return mockXeroAccounts.filter((a) => a.Status === 'ACTIVE');
}

export async function getTaxRates(): Promise<XeroTaxRate[]> {
  await delay(60);
  return mockXeroTaxRates.filter((t) => t.Status === 'ACTIVE');
}

export async function getTrackingCategories(): Promise<XeroTrackingCategory[]> {
  await delay(60);
  return mockXeroTrackingCategories.filter((t) => t.Status === 'ACTIVE');
}

export async function getBrandingThemes(): Promise<XeroBrandingTheme[]> {
  await delay(40);
  return [...mockXeroBrandingThemes].sort((a, b) => a.SortOrder - b.SortOrder);
}

export async function getSyncEntities(): Promise<XeroSyncEntity[]> {
  await delay(20);
  return mockXeroSyncEntities;
}

export async function getMappingConfig(): Promise<XeroMappingConfig> {
  await delay(80);
  return JSON.parse(JSON.stringify(savedConfig)) as XeroMappingConfig;
}

export async function saveMappingConfig(
  next: XeroMappingConfig,
): Promise<XeroMappingConfig> {
  await delay(220);
  savedConfig = {
    ...JSON.parse(JSON.stringify(next)),
    updatedAt: new Date().toISOString(),
  } as XeroMappingConfig;
  return JSON.parse(JSON.stringify(savedConfig)) as XeroMappingConfig;
}

/**
 * Re-fetch fresh data from "Xero" — in mock mode this is a noop that
 * just resolves after a short delay so the UI can show a spinner.
 */
export async function pullLatest(): Promise<{
  accounts: number;
  taxRates: number;
  trackingCategories: number;
  brandingThemes: number;
}> {
  await delay(700);
  return {
    accounts: mockXeroAccounts.length,
    taxRates: mockXeroTaxRates.length,
    trackingCategories: mockXeroTrackingCategories.length,
    brandingThemes: mockXeroBrandingThemes.length,
  };
}

/**
 * Naive fuzzy matcher used by Auto-map by name. Strips non-alphanumerics
 * and lowercases both sides, then scores by token overlap.
 */
function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

export interface AutoMapSuggestion {
  sourceKey: string;
  sourceLabel: string;
  /** Candidate Xero account code; empty if no good match. */
  suggestedCode: string;
  suggestedName: string;
  /** 0..1 confidence score. */
  score: number;
}

export function suggestAccountMappings(
  unmappedLabels: { sourceKey: string; sourceLabel: string }[],
  accounts: XeroAccount[],
): AutoMapSuggestion[] {
  return unmappedLabels.map(({ sourceKey, sourceLabel }) => {
    const sourceTokens = tokenize(sourceLabel);
    let best: { acc: XeroAccount | null; score: number } = { acc: null, score: 0 };
    for (const acc of accounts) {
      const accTokens = tokenize(`${acc.Code} ${acc.Name}`);
      const overlap = sourceTokens.filter((t) => accTokens.includes(t)).length;
      const score = sourceTokens.length === 0 ? 0 : overlap / sourceTokens.length;
      if (score > best.score) best = { acc, score };
    }
    return {
      sourceKey,
      sourceLabel,
      suggestedCode: best.acc?.Code ?? '',
      suggestedName: best.acc?.Name ?? '',
      score: best.score,
    };
  });
}
