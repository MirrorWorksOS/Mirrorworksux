import svgPaths from "./svg-2dy7venlc1";

function IconFileCog() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon / FileCog">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon / FileCog">
          <path d={svgPaths.p7bffc80} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconWrapper() {
  return (
    <div className="bg-white content-stretch flex items-center justify-center p-[8px] relative rounded-[8px] shrink-0 size-[48px]" data-name="Icon Wrapper">
      <div aria-hidden="true" className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <IconFileCog />
    </div>
  );
}

function FlexVertical() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 text-center w-full" data-name="Flex Vertical">
      <p className="font-['Roboto:SemiBold',sans-serif] font-semibold leading-[28px] relative shrink-0 text-[20px] text-neutral-950 w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        No bill of materials added
      </p>
      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[14px] text-neutral-500 w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        Upload a bill of materials to get started
      </p>
    </div>
  );
}

function IconCloudUpload() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon / CloudUpload">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_39_1233)" id="Icon / CloudUpload">
          <path d={svgPaths.p124262ec} id="Vector" stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" />
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
    <div className="absolute bg-neutral-900 content-stretch flex gap-[8px] h-[36px] items-center justify-center left-[158px] px-[16px] py-[8px] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] top-[46px]" data-name="Button">
      <IconCloudUpload />
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-neutral-50 text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px] whitespace-pre">Upload</p>
      </div>
    </div>
  );
}

function DropZone() {
  return (
    <div className="h-[192px] relative shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] shrink-0 w-[415px]" data-name="Drop zone">
      <Button />
      <div className="absolute border border-black border-dashed h-[200px] left-0 rounded-[25px] top-0 w-[415px]" />
      <div className="absolute flex flex-col font-['Roboto:Regular',sans-serif] font-normal h-[265px] justify-center leading-[20px] left-[207.5px] text-[14px] text-center text-neutral-500 top-[132.5px] translate-x-[-50%] translate-y-[-50%] w-[425px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="mb-0">or</p>
        <p className="mb-0">&nbsp;</p>
        <p>drag and drop a file here</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-neutral-900 content-stretch flex gap-[8px] h-[36px] items-center justify-center px-[16px] py-[8px] relative rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0" data-name="Button">
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-neutral-50 text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px] whitespace-pre">Create new</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-white content-stretch flex gap-[8px] h-[36px] items-center justify-center px-[16px] py-[8px] relative rounded-[8px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-neutral-950 text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[20px] whitespace-pre">Learn more</p>
      </div>
    </div>
  );
}

function Flex() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0 w-full" data-name="Flex">
      <Button1 />
      <Button2 />
    </div>
  );
}

function ProBlocksEmptyContent() {
  return (
    <div className="relative rounded-[10px] shrink-0 w-full" data-name="Pro Blocks / Empty Content">
      <div aria-hidden="true" className="absolute border border-dashed border-neutral-200 inset-0 pointer-events-none rounded-[10px]" />
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col gap-[24px] items-center p-[24px] relative w-full">
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
        <div className="content-stretch flex flex-col items-center p-[24px] relative w-full">
          <ProBlocksEmptyContent />
        </div>
      </div>
    </div>
  );
}

export default function BillOfMaterialsEmptyState() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start relative rounded-[20px] size-full" data-name="Bill of materials empty state">
      <Div />
    </div>
  );
}