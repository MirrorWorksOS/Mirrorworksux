/**
 * Step 4 — AI-assisted field mapping.
 */
import { useBridge } from '@/hooks/useBridge';
import { Button } from '@/components/ui/button';
import { BridgeSegmentedSkipPrimary } from '@/components/bridge/BridgeSegmentedActions';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FieldMappingRow } from '@/components/bridge/FieldMappingRow';
import { bridgeService } from '@/services/bridgeService';
import { Save } from 'lucide-react';
import type { FieldMapping } from '@/types/bridge';

export function StepFieldMapping() {
  const { files, mappings, updateMapping, goToNextStep, goToPreviousStep } = useBridge();

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

  const handleUpdateMapping = (fileId: string) => (mappingId: string, update: Partial<FieldMapping>) => {
    updateMapping(fileId, mappingId, update);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Map your data to MirrorWorks</h2>
          <p className="text-sm text-muted-foreground mt-1">
            We've matched your columns to MirrorWorks fields. Review and adjust as needed.
          </p>
        </div>
        <Badge variant="outline" className="text-sm shrink-0">
          {totalMapped} of {totalFields} mapped
        </Badge>
      </div>

      {fileEntries.length === 1 ? (
        <div className="space-y-3">
          {fileEntries[0].mappings.map((m) => (
            <FieldMappingRow
              key={m.id}
              mapping={m}
              targetFields={fileEntries[0].targetFields}
              onUpdate={(update) => handleUpdateMapping(fileEntries[0].file.id)(m.id, update)}
            />
          ))}
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
              {entry.mappings.map((m) => (
                <FieldMappingRow
                  key={m.id}
                  mapping={m}
                  targetFields={entry.targetFields}
                  onUpdate={(update) => handleUpdateMapping(entry.file.id)(m.id, update)}
                />
              ))}
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
          onSkip={() => toast.message('Template saved (preview)', { description: 'Reusable mapping layouts will be available in a future release.' })}
          onPrimary={goToNextStep}
          skipTooltip="Store this column mapping as a template for the next import (prototype preview)."
          primaryTooltip="Continue to review imported rows before running the import."
        />
      </div>
    </div>
  );
}
