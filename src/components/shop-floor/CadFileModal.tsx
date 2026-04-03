import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import svgPaths from "./imports/svg-2dy7venlc1";

function IconFileCog() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon / FileCog">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon / FileCog">
          <path d={svgPaths.p7bffc80} id="Vector" stroke="var(--stroke-0, var(--neutral-900))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconWrapper() {
  return (
    <div className="bg-card content-stretch flex items-center justify-center p-2 relative rounded-sm shrink-0 size-[48px]" data-name="Icon Wrapper">
      <div aria-hidden="true" className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-sm shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <IconFileCog />
    </div>
  );
}

function FlexVertical() {
  return (
    <div className="content-stretch flex flex-col gap-2 items-center relative shrink-0 text-center w-full" data-name="Flex Vertical">
      <p className="font-medium leading-[28px] relative shrink-0 text-xl text-neutral-950 w-full">
        No CAD Model Found
      </p>
      <p className="font-normal leading-[20px] relative shrink-0 text-sm text-neutral-500 w-full">
        Upload a CAD file to view (STEP, IPT, DWG, ASM, SLDPRT)
      </p>
    </div>
  );
}

function IconCloudUpload() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon / CloudUpload">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_39_1233)" id="Icon / CloudUpload">
          <path d={svgPaths.p124262ec} id="Vector" stroke="var(--stroke-0, var(--neutral-50))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" />
        </g>
        <defs>
          <clipPath id="clip0_39_1233">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="absolute bg-neutral-900 content-stretch flex gap-2 h-[36px] items-center justify-center left-[158px] px-4 py-2 rounded-sm shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] top-[46px]" data-name="Button">
      <IconCloudUpload />
      <div className="flex flex-col font-medium justify-center leading-[0] relative shrink-0 text-sm text-neutral-50 text-nowrap">
        <p className="leading-[20px] whitespace-pre">Upload</p>
      </div>
    </div>
  );
}

function DropZone() {
  return (
    <div className="h-[192px] relative shrink-0 w-[415px]" data-name="Drop zone">
      <Button />
      <div className="absolute border border-[var(--neutral-300)] border-dashed h-[200px] left-0 rounded-xl top-0 w-[415px]" />
      <div className="absolute flex flex-col font-normal h-[265px] justify-center leading-[20px] left-[207.5px] text-sm text-center text-neutral-500 top-[132.5px] translate-x-[-50%] translate-y-[-50%] w-[425px]">
        <p className="mb-0">or</p>
        <p className="mb-0">&nbsp;</p>
        <p>drag and drop a file here</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-neutral-900 content-stretch flex gap-2 h-[36px] items-center justify-center px-4 py-2 relative rounded-sm shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0" data-name="Button">
      <div className="flex flex-col font-medium justify-center leading-[0] relative shrink-0 text-sm text-neutral-50 text-nowrap">
        <p className="leading-[20px] whitespace-pre">Create new</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-card content-stretch flex gap-2 h-[36px] items-center justify-center px-4 py-2 relative rounded-sm shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-sm shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <div className="flex flex-col font-medium justify-center leading-[0] relative shrink-0 text-sm text-neutral-950 text-nowrap">
        <p className="leading-[20px] whitespace-pre">Learn more</p>
      </div>
    </div>
  );
}

function Flex() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-center relative shrink-0 w-full" data-name="Flex">
      <Button1 />
      <Button2 />
    </div>
  );
}

function ProBlocksEmptyContent() {
  return (
    <div className="relative rounded-sm shrink-0 w-full" data-name="Pro Blocks / Empty Content">
      <div aria-hidden="true" className="absolute border border-dashed border-neutral-200 inset-0 pointer-events-none rounded-sm" />
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col gap-6 items-center p-6 relative w-full">
          <IconWrapper />
          <FlexVertical />
          <DropZone />
          <Flex />
        </div>
      </div>
    </div>
  );
}

function Div() {
  return (
    <div className="relative shrink-0 w-full" data-name="Div">
      <div className="flex flex-col items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-center p-6 relative w-full">
          <ProBlocksEmptyContent />
        </div>
      </div>
    </div>
  );
}

interface CadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CadFileModal({ isOpen, onClose }: CadFileModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[600px] w-full p-0 overflow-hidden bg-white/95 dark:bg-card/95 backdrop-blur-xl border-none rounded-xl">
        <DialogTitle className="sr-only">CAD File</DialogTitle>
        <DialogDescription className="sr-only">Upload or view CAD files</DialogDescription>
        <div className="bg-card content-stretch flex flex-col items-start relative size-full" data-name="Bill of materials empty state">
          <Div />
        </div>
      </DialogContent>
    </Dialog>
  );
}
