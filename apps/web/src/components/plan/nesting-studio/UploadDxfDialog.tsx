/**
 * UploadDxfDialog — DXF-aware "add part" flow for the Nesting Studio.
 *
 * The user picks a .dxf file, then confirms the bbox + qty. We persist a
 * DxfAsset (so the asset id rides along with placements all the way to
 * CAM) and emit a part row that nests as a rectangle for now. When real
 * polygon nesting lands (Phase B+), the same DxfAsset is what the worker
 * reads to extract the polygon — no schema change needed.
 */

import { useRef, useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { planService } from '@/services/planService';
import type { DxfAsset } from '@/types/entities';
import { parseDxf } from '@/lib/nesting/parseDxf';

export interface UploadDxfDialogProps {
  /** Called once a DxfAsset is created and the user clicks Add. */
  onAdd: (args: {
    asset: DxfAsset;
    partNumber: string;
    description: string;
    qty: number;
    allowRotation: boolean;
  }) => void;
}

function stripExt(name: string): string {
  return name.replace(/\.[^.]+$/, '');
}

export function UploadDxfDialog({ onAdd }: UploadDxfDialogProps) {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stage 1: file picked, awaiting confirm.
  const [fileName, setFileName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [description, setDescription] = useState('');
  const [widthMm, setWidthMm] = useState<number>(200);
  const [heightMm, setHeightMm] = useState<number>(150);
  const [qty, setQty] = useState<number>(1);
  const [allowRotation, setAllowRotation] = useState(true);
  const [busy, setBusy] = useState(false);
  const [parsed, setParsed] = useState<{
    perimeterMm: number;
    holeCount: number;
    autoFilled: boolean;
  } | null>(null);

  function reset() {
    setFileName('');
    setPartNumber('');
    setDescription('');
    setWidthMm(200);
    setHeightMm(150);
    setQty(1);
    setAllowRotation(true);
    setBusy(false);
    setParsed(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handlePickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    const stem = stripExt(f.name);
    setPartNumber(stem.toUpperCase().slice(0, 32));
    setDescription(stem);
    setParsed(null);

    // Read and parse the DXF. Tolerant — if parsing fails or yields a
    // zero-bbox the user can still type the dims manually.
    try {
      const text = await f.text();
      const result = parseDxf(text);
      if (result.bboxMm.widthMm > 0 && result.bboxMm.heightMm > 0) {
        setWidthMm(Math.round(result.bboxMm.widthMm));
        setHeightMm(Math.round(result.bboxMm.heightMm));
        setParsed({
          perimeterMm: result.totalCutLengthMm,
          holeCount: result.holeCount,
          autoFilled: true,
        });
      } else {
        setParsed({ perimeterMm: 0, holeCount: 0, autoFilled: false });
      }
    } catch {
      // Parser threw — keep manual defaults, surface the failure subtly.
      setParsed({ perimeterMm: 0, holeCount: 0, autoFilled: false });
    }
  }

  async function handleConfirm() {
    if (!fileName) {
      fileInputRef.current?.click();
      return;
    }
    if (widthMm <= 0 || heightMm <= 0 || qty <= 0) {
      toast.error('Width, height, and qty must be greater than 0.');
      return;
    }
    setBusy(true);
    try {
      const asset = await planService.createDxfAsset({
        fileName,
        bboxMm: { widthMm, heightMm },
        perimeterMm: parsed?.perimeterMm,
        holeCount: parsed?.holeCount,
      });
      onAdd({
        asset,
        partNumber: partNumber || stripExt(fileName).toUpperCase(),
        description,
        qty,
        allowRotation,
      });
      toast.success(`Added ${asset.fileName} to nest`);
      setOpen(false);
      // Reset after the dialog finishes closing so the next open is clean.
      setTimeout(reset, 200);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Upload className="h-4 w-4" /> Upload DXF
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload DXF</DialogTitle>
          <DialogDescription>
            The DXF rides through to the operator&apos;s CAM. For nesting we
            use the bbox you confirm below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".dxf,.dwg"
              onChange={handlePickFile}
              className="hidden"
              aria-label="DXF file"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="h-4 w-4" />
              {fileName || 'Choose .dxf file'}
            </Button>
          </div>

          {fileName && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="upd-part">Part #</Label>
                  <Input
                    id="upd-part"
                    value={partNumber}
                    onChange={(e) => setPartNumber(e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="upd-desc">Description</Label>
                  <Input
                    id="upd-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="upd-w">Width (mm)</Label>
                  <Input
                    id="upd-w"
                    type="number"
                    min={1}
                    value={widthMm}
                    onChange={(e) => setWidthMm(Number(e.target.value))}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="upd-h">Height (mm)</Label>
                  <Input
                    id="upd-h"
                    type="number"
                    min={1}
                    value={heightMm}
                    onChange={(e) => setHeightMm(Number(e.target.value))}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="upd-qty">Qty</Label>
                  <Input
                    id="upd-qty"
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="upd-rot"
                  checked={allowRotation}
                  onCheckedChange={setAllowRotation}
                />
                <Label htmlFor="upd-rot" className="text-sm">
                  Allow rotation (0° / 90°)
                </Label>
              </div>
              <p className="rounded-md bg-[var(--neutral-50)] p-2 text-xs text-muted-foreground">
                {parsed?.autoFilled ? (
                  <>
                    Parsed bbox <span className="font-mono">{widthMm}×{heightMm} mm</span>
                    {parsed.perimeterMm > 0 ? <> · cut length <span className="font-mono">{Math.round(parsed.perimeterMm)} mm</span></> : null}
                    {parsed.holeCount > 0 ? <> · {parsed.holeCount} hole{parsed.holeCount === 1 ? '' : 's'}</> : null}
                  </>
                ) : parsed ? (
                  <>Couldn&apos;t parse DXF entities — confirm or override the dims manually.</>
                ) : (
                  <>The DXF asset is saved with its bbox and rides through to CAM.</>
                )}
              </p>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={busy || !fileName}>
            Add to nest
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
