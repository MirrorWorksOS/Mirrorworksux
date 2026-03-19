import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

interface DefectReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  partNumber?: number;
}

export function DefectReportModal({ isOpen, onClose, partNumber = 78 }: DefectReportModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white">
        <DialogDescription className="sr-only">
          Form to report a defect for the current part.
        </DialogDescription>
        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-[20px] font-bold text-[#1A2732]">
              Report Defect - Part {partNumber}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-medium text-gray-900">Select defect type:</Label>
              <RadioGroup defaultValue="dimensional" className="flex flex-col gap-3">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="dimensional" id="r1" className="w-5 h-5 border-2" />
                  <Label htmlFor="r1" className="text-base font-normal cursor-pointer">Dimensional error</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="surface" id="r2" className="w-5 h-5 border-2" />
                  <Label htmlFor="r2" className="text-base font-normal cursor-pointer">Surface finish issue</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="material" id="r3" className="w-5 h-5 border-2" />
                  <Label htmlFor="r3" className="text-base font-normal cursor-pointer">Material defect</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="tool" id="r4" className="w-5 h-5 border-2" />
                  <Label htmlFor="r4" className="text-base font-normal cursor-pointer">Tool wear</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="other" id="r5" className="w-5 h-5 border-2" />
                  <Label htmlFor="r5" className="text-base font-normal cursor-pointer">Other</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base font-medium text-gray-900">Additional notes (optional)</Label>
              <Textarea 
                id="notes" 
                placeholder="Describe the issue..." 
                className="h-[120px] resize-none text-base border-gray-300"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1 h-[44px] text-base font-bold text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={onClose}
                className="flex-1 h-[44px] text-base font-bold bg-[#DC2626] hover:bg-[#B91C1C] text-white border-0"
              >
                Submit Defect Report
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
