/**
 * Header → column mapping suggestion. The fuzzy matcher is the same
 * heuristic the Bridge wizard uses for its AI-suggested field mappings
 * (bridgeService.generateMappings delegates here) — normalize both
 * sides and accept containment either way.
 */

/** Lowercase and strip everything but letters/digits. */
export function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Spreadsheet-isms → canonical token ("Part No" → "part number"). */
const TOKEN_ALIASES: Record<string, string> = {
  no: 'number',
  num: 'number',
  '#': 'number',
  qty: 'quantity',
  desc: 'description',
  std: 'standard',
  amt: 'amount',
  loc: 'location',
  uom: 'unit',
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9#]+/)
    .filter(Boolean)
    .map((t) => TOKEN_ALIASES[t] ?? t);
}

const tokensMatch = (a: string, b: string) =>
  a === b || (a.length >= 2 && b.startsWith(a)) || (b.length >= 2 && a.startsWith(b));

export interface MatchableField {
  /** snake_case target column, e.g. 'unit_price'. */
  column: string;
  /** Human label, e.g. 'Unit price'. */
  label: string;
}

/**
 * Find the best target field for a source header, or null.
 * Two passes: normalized containment ("Product Description" ⊇
 * "Description"), then aliased token coverage so spreadsheet
 * abbreviations land ("Part No" → part_number, "Std Cost" →
 * standard_cost). A field matches when every one of its tokens is
 * covered by a header token.
 */
export function matchHeaderToField<T extends MatchableField>(
  header: string,
  fields: T[],
): T | null {
  const norm = normalizeHeader(header);
  if (!norm) return null;

  const byContainment = fields.find((f) => {
    const label = normalizeHeader(f.label);
    const column = f.column.replace(/_/g, '');
    return norm === column || norm.includes(label) || label.includes(norm);
  });
  if (byContainment) return byContainment;

  const headerTokens = tokenize(header);
  return (
    fields.find((f) => {
      const fieldTokens = tokenize(f.column.replace(/_/g, ' '));
      return (
        fieldTokens.length > 0 &&
        fieldTokens.every((ft) => headerTokens.some((ht) => tokensMatch(ht, ft)))
      );
    }) ?? null
  );
}

export interface HeaderMapping {
  /** Source CSV header text. */
  header: string;
  /** Index of the header in the upload. */
  headerIndex: number;
  /** Target column key, or null = skip this source column. */
  targetKey: string | null;
  /** True when the engine suggested the target (vs user-set). */
  suggested: boolean;
}

/** Suggest a mapping for every source header against the adapter columns. */
export function suggestMappings(
  headers: string[],
  columns: { key: string; label: string }[],
): HeaderMapping[] {
  const fields = columns.map((c) => ({ column: c.key, label: c.label }));
  const taken = new Set<string>();
  return headers.map((header, headerIndex) => {
    const match = matchHeaderToField(header, fields.filter((f) => !taken.has(f.column)));
    if (match) taken.add(match.column);
    return {
      header,
      headerIndex,
      targetKey: match?.column ?? null,
      suggested: match !== null,
    };
  });
}
