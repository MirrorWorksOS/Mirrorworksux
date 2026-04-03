/**
 * Single row in the field mapping table.
 */
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ConfidenceDot } from '@/components/shared/ConfidenceDot';
import { cn } from '@/components/ui/utils';
import type { FieldMapping, TargetFieldOption } from '@/types/bridge';

interface FieldMappingRowProps {
  mapping: FieldMapping;
  targetFields: TargetFieldOption[];
  onUpdate: (update: Partial<FieldMapping>) => void;
}

export function FieldMappingRow({ mapping, targetFields, onUpdate }: FieldMappingRowProps) {
  const isMapped = mapping.targetColumn !== null;
  const isSkipped = mapping.mappingStatus === 'skipped';

  const required = targetFields.filter((f) => f.required);
  const optional = targetFields.filter((f) => !f.required);

  return (
    <div
      className={cn(
        'flex items-start gap-4 rounded-lg border p-4 transition-colors',
        !isMapped && !isSkipped && 'bg-[var(--mw-error-light)] border-[var(--mw-error)]/20',
        isMapped && 'bg-background',
        isSkipped && 'bg-muted/50 opacity-60'
      )}
    >
      {/* Source column */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{mapping.sourceColumn}</p>
        <div className="flex gap-2 mt-1 flex-wrap">
          {mapping.sampleValues.slice(0, 3).map((v, i) => (
            <span key={i} className="text-xs text-muted-foreground truncate max-w-[120px]">{v}</span>
          ))}
        </div>
      </div>

      {/* Confidence */}
      <div className="flex items-center shrink-0 pt-1">
        <ConfidenceDot confidence={mapping.aiConfidence} />
      </div>

      {/* Target field select */}
      <div className="w-64 shrink-0">
        {isSkipped ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground italic">Skipped</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-12"
              onClick={() => onUpdate({ mappingStatus: 'suggested', targetColumn: null })}
            >
              Undo
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Select
              value={mapping.targetColumn || ''}
              onValueChange={(val) =>
                onUpdate({
                  targetColumn: val || null,
                  mappingStatus: val ? 'confirmed' : 'suggested',
                  userConfirmed: !!val,
                })
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Map to field..." />
              </SelectTrigger>
              <SelectContent>
                {required.length > 0 && (
                  <SelectGroup>
                    <SelectLabel>Required</SelectLabel>
                    {required.map((f) => (
                      <SelectItem key={f.column} value={f.column}>
                        {f.label} — {f.description}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
                {optional.length > 0 && (
                  <SelectGroup>
                    <SelectLabel>Optional</SelectLabel>
                    {optional.map((f) => (
                      <SelectItem key={f.column} value={f.column}>
                        {f.label} — {f.description}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>

            {!isMapped && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-12 text-muted-foreground"
                onClick={() => onUpdate({ mappingStatus: 'skipped' })}
              >
                Skip this column
              </Button>
            )}
          </div>
        )}
      </div>

      {/* AI reasoning tooltip */}
      {mapping.aiReasoning && isMapped && (
        <p className="text-xs text-muted-foreground max-w-[200px] pt-1 hidden lg:block">
          {mapping.aiReasoning}
        </p>
      )}
    </div>
  );
}
