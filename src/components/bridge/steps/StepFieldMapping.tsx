/**
 * Step 4 — AI-assisted field mapping.
 */
import { useMemo, useState, useCallback } from 'react';
import { useBridge } from '@/hooks/useBridge';
import { Button } from '@/components/ui/button';
import { BridgeSegmentedSkipPrimary } from '@/components/bridge/BridgeSegmentedActions';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FieldMappingRow } from '@/components/bridge/FieldMappingRow';
import { bridgeService } from '@/services/bridgeService';
import { Save } from 'lucide-react';
import type { FieldMapping } from '@/types/bridge';

const HIGH_CONFIDENCE = 0.85;

function rowNeedsAttention(m: FieldMapping): boolean {
  if (m.mappingStatus === 'skipped') return true;
  if (!m.targetColumn) return true;
  if (m.userConfirmed) return false;
  if (m.aiConfidence != null && m.aiConfidence >= HIGH_CONFIDENCE) return false;
  return true;
}

export function StepFieldMapping() {
  const { files, mappings, updateMapping, goToNextStep, goToPreviousStep } = useBridge();
  const [attentionOnly, setAttentionOnly] = useState(true);

  const fileEntries = files
    .filter((f) => f.analysisStatus === 'complete')
    .map((f) => ({
      file: f,
      mappings: mappings[f.id] || [],
      targetFields: bridgeService.getTargetFields(f.detectedEntityType || 'unknown'),
    }));

  const totalMapped = fileEntries.reduce(
    (acc, e) => acc + e.mappings.filter((m) => m.targetColumn !== null).length,
    0
  );
  const totalFields = fileEntries.reduce((acc, e) => acc + e.mappings.length, 0);

  const attentionCount = useMemo(
    () =>
      files
        .filter((f) => f.analysisStatus === 'complete')
        .reduce((acc, f) => {
          const list = mappings[f.id] || [];
          return acc + list.filter(rowNeedsAttention).length;
        }, 0),
    [files, mappings]
  );

  const handleUpdateMapping = (fileId: string) => (mappingId: string, update: Partial<FieldMapping>) => {
    updateMapping(fileId, mappingId, update);
  };

  const acceptHighConfidenceAll = useCallback(() => {
    for (const file of files.filter((f) => f.analysisStatus === 'complete')) {
      const list = mappings[file.id] || [];
      for (const m of list) {
        if (
          m.mappingStatus === 'suggested' &&
          m.targetColumn &&
          m.aiConfidence != null &&
          m.aiConfidence >= HIGH_CONFIDENCE &&
          !m.userConfirmed
        ) {
          updateMapping(file.id, m.id, {
            userConfirmed: true,
            mappingStatus: 'confirmed',
          });
        }
      }
    }
    toast.message('High-confidence matches confirmed', {
      description: 'You can still change any field before continuing.',
    });
  }, [files, mappings, updateMapping]);

  const filterRows = (rows: FieldMapping[]) =>
    attentionOnly ? rows.filter(rowNeedsAttention) : rows;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-medium tracking-tight">Map your data to MirrorWorks</h2>
          <p className="text-sm text-muted-foreground">
            We&apos;ve matched your columns to MirrorWorks fields. Confirm or change targets here — nothing is written to
            your live data until you run the import on the next step.
          </p>
        </div>
        <Badge variant="outline" className="text-sm shrink-0 self-start">
          {totalMapped} of {totalFields} mapped
        </Badge>
      </div>

      {attentionCount > 0 && (
        <p className="text-sm font-medium text-foreground rounded-[var(--shape-lg)] border border-[var(--mw-warning)]/30 bg-[color-mix(in_srgb,var(--mw-warning)_10%,white)] dark:bg-[color-mix(in_srgb,var(--mw-warning)_12%,var(--card))] px-4 py-3">
          {attentionCount} column{attentionCount === 1 ? '' : 's'} need your attention — unmapped, skipped, or lower
          confidence.
        </p>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[var(--shape-lg)] border border-[var(--neutral-200)] bg-[var(--neutral-50)] px-4 py-3">
        <div className="flex items-center gap-3">
          <Switch id="bridge-attention-only" checked={attentionOnly} onCheckedChange={setAttentionOnly} />
          <Label htmlFor="bridge-attention-only" className="text-sm font-normal cursor-pointer">
            Show only columns that need attention
          </Label>
        </div>
        <Button type="button" variant="outline" className="h-12 min-h-[48px] shrink-0" onClick={acceptHighConfidenceAll}>
          Accept all high-confidence matches
        </Button>
      </div>

      {fileEntries.length === 1 ? (
        <div className="space-y-3">
          {filterRows(fileEntries[0].mappings).length === 0 ? (
            <p className="text-sm text-muted-foreground">All columns look good — turn off the filter to review everything.</p>
          ) : (
            filterRows(fileEntries[0].mappings).map((m) => (
              <FieldMappingRow
                key={m.id}
                mapping={m}
                targetFields={fileEntries[0].targetFields}
                onUpdate={(update) => handleUpdateMapping(fileEntries[0].file.id)(m.id, update)}
              />
            ))
          )}
        </div>
      ) : (
        <Tabs defaultValue={fileEntries[0]?.file.id}>
          <TabsList className="w-full justify-start">
            {fileEntries.map((entry) => {
              const mapped = entry.mappings.filter((m) => m.targetColumn !== null).length;
              return (
                <TabsTrigger key={entry.file.id} value={entry.file.id} className="gap-2">
                  {entry.file.detectedEntityType || entry.file.fileName}
                  <Badge variant="secondary" className="text-xs">
                    {mapped}/{entry.mappings.length}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {fileEntries.map((entry) => (
            <TabsContent key={entry.file.id} value={entry.file.id} className="space-y-3 mt-4">
              {filterRows(entry.mappings).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  All columns look good for this file — turn off the filter to review everything.
                </p>
              ) : (
                filterRows(entry.mappings).map((m) => (
                  <FieldMappingRow
                    key={m.id}
                    mapping={m}
                    targetFields={entry.targetFields}
                    onUpdate={(update) => handleUpdateMapping(entry.file.id)(m.id, update)}
                  />
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" className="h-12 min-h-[48px]" onClick={goToPreviousStep}>
          Back
        </Button>
        <BridgeSegmentedSkipPrimary
          order="skip-first"
          skipLabel="Save as template"
          primaryLabel="Confirm mappings"
          skipIcon={Save}
          onSkip={() =>
            toast.message('Template saved (preview)', {
              description: 'Reusable mapping layouts will be available in a future release.',
            })
          }
          onPrimary={goToNextStep}
          skipTooltip="Store this column mapping as a template for the next import (prototype preview)."
          primaryTooltip="Continue to review imported rows before running the import."
        />
      </div>
    </div>
  );
}
