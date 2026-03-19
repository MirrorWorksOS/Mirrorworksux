import svgPaths from "./svg-6s8myyonn6";

function Icon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d={svgPaths.pb007f00} id="Vector" stroke="var(--stroke-0, #0F172B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p1b58ab00} id="Vector_2" stroke="var(--stroke-0, #0F172B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M10 9H8" id="Vector_3" stroke="var(--stroke-0, #0F172B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M16 13H8" id="Vector_4" stroke="var(--stroke-0, #0F172B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M16 17H8" id="Vector_5" stroke="var(--stroke-0, #0F172B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Container() {
  return (
    <div className="bg-white relative rounded-[14px] shrink-0 size-[48px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-slate-200 border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-px relative size-[48px]">
        <Icon />
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="h-[32px] relative shrink-0 w-[171.008px]" data-name="Heading 2">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid h-[32px] relative w-[171.008px]">
        <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[32px] left-0 not-italic text-[#0f172b] text-[24px] text-nowrap top-0 tracking-[0.0703px] whitespace-pre">Bill of materials</p>
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[24px] relative shrink-0 w-[280.938px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid h-[24px] relative w-[280.938px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#62748e] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">Upload a bill of materials to get started</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[216px] items-center justify-center pb-[16px] pt-0 px-0 relative shrink-0 w-full" data-name="Container">
      <Container />
      <Heading />
      <Paragraph />
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute left-[13px] size-[16px] top-[12px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.pff0fc00} id="Vector" stroke="var(--stroke-0, #314158)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p1d76d410} id="Vector_2" stroke="var(--stroke-0, #314158)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p2f091200} id="Vector_3" stroke="var(--stroke-0, #314158)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p39897300} id="Vector_4" stroke="var(--stroke-0, #314158)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute left-[118.98px] size-[16px] top-[12px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon" opacity="0.5">
          <path d="M4 6L8 10L12 6" id="Vector" stroke="var(--stroke-0, #314158)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="basis-0 bg-white grow h-[40px] min-h-px min-w-px relative rounded-[8px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-slate-200 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid h-[40px] relative w-full">
        <Icon1 />
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[74px] not-italic text-[#314158] text-[14px] text-center text-nowrap top-[10.5px] tracking-[-0.1504px] translate-x-[-50%] whitespace-pre">Columns</p>
        <Icon2 />
      </div>
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M3.33333 8H12.6667" id="Vector" stroke="var(--stroke-0, #314158)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 3.33333V12.6667" id="Vector_2" stroke="var(--stroke-0, #314158)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-white relative rounded-[8px] shrink-0 size-[40px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-slate-200 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-px relative size-[40px]">
        <Icon3 />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[40px] items-center left-[952.02px] top-px w-[199.977px]" data-name="Container">
      <Button />
      <Button1 />
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute h-[32px] left-[4px] rounded-[1.67772e+07px] top-[4px] w-[56.492px]" data-name="Button">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[28.5px] not-italic text-[#62748e] text-[14px] text-center text-nowrap top-[6.5px] tracking-[-0.1504px] translate-x-[-50%] whitespace-pre">Flat</p>
    </div>
  );
}

function Container3() {
  return <div className="absolute bg-[#ffcf4b] border border-[rgba(15,23,43,0.1)] border-solid h-[32px] left-0 rounded-[1.67772e+07px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] top-0 w-[101.563px]" data-name="Container" />;
}

function Button3() {
  return (
    <div className="absolute h-[32px] left-[60.49px] rounded-[1.67772e+07px] top-[4px] w-[101.563px]" data-name="Button">
      <Container3 />
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[51.5px] not-italic text-[#0f172b] text-[14px] text-center text-nowrap top-[6.5px] tracking-[-0.1504px] translate-x-[-50%] whitespace-pre">Multi-level</p>
    </div>
  );
}

function SegmentedControl() {
  return (
    <div className="absolute bg-white border border-slate-200 border-solid h-[42px] left-0 rounded-[1.67772e+07px] top-0 w-[168.055px]" data-name="SegmentedControl">
      <Button2 />
      <Button3 />
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[42px] relative shrink-0 w-full" data-name="Container">
      <Container2 />
      <SegmentedControl />
    </div>
  );
}

function Container5() {
  return <div className="absolute h-0 left-0 top-[21.5px] w-[40px]" data-name="Container" />;
}

function PrimitiveButton() {
  return <div className="absolute bg-[#f3f3f5] border border-[#cad5e2] border-solid left-[52px] rounded-[4px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] size-[16px] top-[13.5px]" data-name="Primitive.button" />;
}

function Container6() {
  return (
    <div className="absolute h-[19.5px] left-[80px] top-[11.75px] w-[200px]" data-name="Container">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[19.5px] left-[12px] not-italic text-[#0f172b] text-[13px] text-nowrap top-px tracking-[-0.0762px] whitespace-pre">Product</p>
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute h-[19.5px] left-[280px] top-[11.75px] w-[120px]" data-name="Container">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[19.5px] left-[12px] not-italic text-[#0f172b] text-[13px] text-nowrap top-px tracking-[-0.0762px] whitespace-pre">SKU</p>
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute h-[19.5px] left-[400px] top-[11.75px] w-[100px]" data-name="Container">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[19.5px] left-[49.81px] not-italic text-[#0f172b] text-[13px] text-center text-nowrap top-px tracking-[-0.0762px] translate-x-[-50%] whitespace-pre">Quantity</p>
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute h-[19.5px] left-[500px] top-[11.75px] w-[80px]" data-name="Container">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[19.5px] left-[12px] not-italic text-[#0f172b] text-[13px] text-nowrap top-px tracking-[-0.0762px] whitespace-pre">Units</p>
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute h-[19.5px] left-[580px] top-[11.75px] w-[100px]" data-name="Container">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[19.5px] left-[88.03px] not-italic text-[#0f172b] text-[13px] text-nowrap text-right top-px tracking-[-0.0762px] translate-x-[-100%] whitespace-pre">Unit Cost</p>
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute h-[19.5px] left-[680px] top-[11.75px] w-[100px]" data-name="Container">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[19.5px] left-[88.09px] not-italic text-[#0f172b] text-[13px] text-nowrap text-right top-px tracking-[-0.0762px] translate-x-[-100%] whitespace-pre">Total Cost</p>
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute h-[19.5px] left-[780px] top-[11.75px] w-[100px]" data-name="Container">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[19.5px] left-[12px] not-italic text-[#0f172b] text-[13px] text-nowrap top-px tracking-[-0.0762px] whitespace-pre">Route</p>
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute h-[19.5px] left-[880px] top-[11.75px] w-[120px]" data-name="Container">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[19.5px] left-[12px] not-italic text-[#0f172b] text-[13px] text-nowrap top-px tracking-[-0.0762px] whitespace-pre">Work Centre</p>
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute h-[19.5px] left-[1000px] top-[11.75px] w-[140px]" data-name="Container">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[19.5px] left-[12px] not-italic text-[#0f172b] text-[13px] text-nowrap top-px tracking-[-0.0762px] whitespace-pre">Subassembly</p>
    </div>
  );
}

function Container15() {
  return <div className="absolute h-0 left-[1140px] top-[21.5px] w-[50px]" data-name="Container" />;
}

function Container16() {
  return (
    <div className="bg-slate-50 h-[44px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-slate-200 border-solid inset-0 pointer-events-none" />
      <Container5 />
      <PrimitiveButton />
      <Container6 />
      <Container7 />
      <Container8 />
      <Container9 />
      <Container10 />
      <Container11 />
      <Container12 />
      <Container13 />
      <Container14 />
      <Container15 />
    </div>
  );
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p1c949200} id="Vector" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.pd12ce00} id="Vector_2" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p226ad00} id="Vector_3" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p1e9aa900} id="Vector_4" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p12fdd280} id="Vector_5" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p3be7b040} id="Vector_6" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-start justify-center left-0 top-[19.5px] w-[40px]" data-name="Container">
      <Icon4 />
    </div>
  );
}

function PrimitiveButton1() {
  return <div className="absolute bg-[#f3f3f5] border border-[#cad5e2] border-solid left-[52px] rounded-[4px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] size-[16px] top-[19.5px]" data-name="Primitive.button" />;
}

function Container18() {
  return <div className="absolute left-[12px] size-0 top-[12px]" data-name="Container" />;
}

function Icon5() {
  return (
    <div className="h-[12px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 4">
            <path d="M0.5 0.5L3.5 3.5L6.5 0.5" id="Vector" stroke="var(--stroke-0, #62748E)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[8px] pb-0 pt-[4px] px-[4px] rounded-[4px] size-[20px] top-[2px]" data-name="Button">
      <Icon5 />
    </div>
  );
}

function Text() {
  return (
    <div className="absolute h-[20px] left-[32px] overflow-clip top-[2px] w-[124px]" data-name="Text">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#0f172b] text-[14px] top-[0.5px] tracking-[-0.1504px] w-[138px]">Bracket 1200 x 2400</p>
    </div>
  );
}

function Icon6() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M3.33333 8H12.6667" id="Vector" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 3.33333V12.6667" id="Vector_2" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button5() {
  return (
    <div className="absolute content-stretch flex items-center justify-center left-[164px] opacity-0 rounded-[8px] size-[24px] top-0" data-name="Button">
      <Icon6 />
    </div>
  );
}

function Container19() {
  return (
    <div className="absolute h-[24px] left-[80px] top-[15.5px] w-[200px]" data-name="Container">
      <Container18 />
      <Button4 />
      <Text />
      <Button5 />
    </div>
  );
}

function Container20() {
  return (
    <div className="absolute h-[20px] left-[280px] overflow-clip top-[17.5px] w-[120px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[12px] not-italic text-[#45556c] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">SS12002400</p>
    </div>
  );
}

function Container21() {
  return (
    <div className="absolute h-[20px] left-[400px] top-[17.5px] w-[100px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[50.28px] not-italic text-[#0f172b] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%] whitespace-pre">60</p>
    </div>
  );
}

function Container22() {
  return (
    <div className="absolute h-[20px] left-[500px] top-[17.5px] w-[80px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[12px] not-italic text-[#45556c] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Units</p>
    </div>
  );
}

function Container23() {
  return (
    <div className="absolute h-[20px] left-[580px] top-[17.5px] w-[100px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[88.56px] not-italic text-[#0f172b] text-[14px] text-right top-[0.5px] tracking-[-0.1504px] translate-x-[-100%] w-[47px]">$45.07</p>
    </div>
  );
}

function Container24() {
  return (
    <div className="absolute h-[20px] left-[680px] top-[17.5px] w-[100px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[88.85px] not-italic text-[#0f172b] text-[14px] text-right top-[0.5px] tracking-[-0.1504px] translate-x-[-100%] w-[65px]">$2704.20</p>
    </div>
  );
}

function Badge() {
  return (
    <div className="absolute bg-white border border-slate-200 border-solid h-[22px] left-[792px] overflow-clip rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] top-[16.5px] w-[50.672px]" data-name="Badge">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[10px] not-italic text-[#0f172b] text-[12px] text-nowrap top-[3px] whitespace-pre">Make</p>
    </div>
  );
}

function Badge1() {
  return (
    <div className="absolute bg-slate-100 border border-slate-200 border-solid h-[22px] left-[892px] overflow-clip rounded-[8px] top-[16.5px] w-[85.203px]" data-name="Badge">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[8px] not-italic text-[#45556c] text-[12px] text-nowrap top-[3px] whitespace-pre">Turret Punch</p>
    </div>
  );
}

function Icon7() {
  return (
    <div className="absolute left-[10px] size-[16px] top-[5px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_39_536)" id="Icon">
          <path d={svgPaths.p18ae4a80} id="Vector" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p3dd52f00} id="Vector_2" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p2d792300} id="Vector_3" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_39_536">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button6() {
  return (
    <div className="absolute bg-white border border-slate-200 border-solid h-[28px] left-[1012px] rounded-[8px] top-[13.5px] w-[116px]" data-name="Button">
      <Icon7 />
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[66.5px] not-italic text-[#314158] text-[12px] text-center text-nowrap top-[6px] translate-x-[-50%] whitespace-pre">Assembly</p>
    </div>
  );
}

function Icon8() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M6.66667 7.33333V11.3333" id="Vector" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M9.33333 7.33333V11.3333" id="Vector_2" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p37e28100} id="Vector_3" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M2 4H14" id="Vector_4" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p2ffbeb80} id="Vector_5" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button7() {
  return (
    <div className="absolute content-stretch flex items-center justify-center left-[1149px] rounded-[8px] size-[32px] top-[11.5px]" data-name="Button">
      <Icon8 />
    </div>
  );
}

function Container25() {
  return (
    <div className="h-[56px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-slate-100 border-solid inset-0 pointer-events-none" />
      <Container17 />
      <PrimitiveButton1 />
      <Container19 />
      <Container20 />
      <Container21 />
      <Container22 />
      <Container23 />
      <Container24 />
      <Badge />
      <Badge1 />
      <Button6 />
      <Button7 />
    </div>
  );
}

function Icon9() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p1c949200} id="Vector" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.pd12ce00} id="Vector_2" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p226ad00} id="Vector_3" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p1e9aa900} id="Vector_4" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p12fdd280} id="Vector_5" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p3be7b040} id="Vector_6" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container26() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-start justify-center left-0 top-[19.5px] w-[40px]" data-name="Container">
      <Icon9 />
    </div>
  );
}

function PrimitiveButton2() {
  return <div className="absolute bg-[#f3f3f5] border border-[#cad5e2] border-solid left-[52px] rounded-[4px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] size-[16px] top-[19.5px]" data-name="Primitive.button" />;
}

function Container27() {
  return <div className="absolute h-0 left-[12px] top-[12px] w-[24px]" data-name="Container" />;
}

function Icon10() {
  return (
    <div className="absolute left-[36px] size-[12px] top-[6px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d="M7.5 5L10 7.5L7.5 10" id="Vector" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.pf1de000} id="Vector_2" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Text1() {
  return <div className="absolute h-0 left-[56px] top-[12px] w-[11.961px]" data-name="Text" />;
}

function Text2() {
  return (
    <div className="absolute h-[20px] left-[71.96px] overflow-clip top-[2px] w-[84.039px]" data-name="Text">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#0f172b] text-[14px] top-[0.5px] tracking-[-0.1504px] w-[113px]">Steel Sheet 2mm</p>
    </div>
  );
}

function Icon11() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M3.33333 8H12.6667" id="Vector" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 3.33333V12.6667" id="Vector_2" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button8() {
  return (
    <div className="absolute content-stretch flex items-center justify-center left-[164px] opacity-0 rounded-[8px] size-[24px] top-0" data-name="Button">
      <Icon11 />
    </div>
  );
}

function Container28() {
  return (
    <div className="absolute h-[24px] left-[80px] top-[15.5px] w-[200px]" data-name="Container">
      <Container27 />
      <Icon10 />
      <Text1 />
      <Text2 />
      <Button8 />
    </div>
  );
}

function Container29() {
  return (
    <div className="absolute h-[20px] left-[280px] overflow-clip top-[17.5px] w-[120px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[12px] not-italic text-[#45556c] text-[14px] top-[0.5px] tracking-[-0.1504px] w-[99px]">MTL-SHEET-01</p>
    </div>
  );
}

function Container30() {
  return (
    <div className="absolute h-[20px] left-[400px] top-[17.5px] w-[100px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[50.33px] not-italic text-[#0f172b] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%] whitespace-pre">1</p>
    </div>
  );
}

function Container31() {
  return (
    <div className="absolute h-[20px] left-[500px] top-[17.5px] w-[80px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[12px] not-italic text-[#45556c] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Sheet</p>
    </div>
  );
}

function Container32() {
  return (
    <div className="absolute h-[20px] left-[580px] top-[17.5px] w-[100px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[88.25px] not-italic text-[#0f172b] text-[14px] text-right top-[0.5px] tracking-[-0.1504px] translate-x-[-100%] w-[48px]">$40.00</p>
    </div>
  );
}

function Container33() {
  return (
    <div className="absolute h-[20px] left-[680px] top-[17.5px] w-[100px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[88.25px] not-italic text-[#0f172b] text-[14px] text-right top-[0.5px] tracking-[-0.1504px] translate-x-[-100%] w-[48px]">$40.00</p>
    </div>
  );
}

function Badge2() {
  return (
    <div className="absolute bg-white border border-slate-200 border-solid h-[22px] left-[792px] overflow-clip rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] top-[16.5px] w-[42.32px]" data-name="Badge">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[10px] not-italic text-[#62748e] text-[12px] text-nowrap top-[3px] whitespace-pre">Buy</p>
    </div>
  );
}

function Badge3() {
  return (
    <div className="absolute bg-slate-100 border border-slate-200 border-solid h-[22px] left-[892px] overflow-clip rounded-[8px] top-[16.5px] w-[48.32px]" data-name="Badge">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[8px] not-italic text-[#45556c] text-[12px] text-nowrap top-[3px] whitespace-pre">Stock</p>
    </div>
  );
}

function Container34() {
  return <div className="absolute h-0 left-[1000px] top-[27.5px] w-[140px]" data-name="Container" />;
}

function Icon12() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M6.66667 7.33333V11.3333" id="Vector" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M9.33333 7.33333V11.3333" id="Vector_2" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p37e28100} id="Vector_3" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M2 4H14" id="Vector_4" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p2ffbeb80} id="Vector_5" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button9() {
  return (
    <div className="absolute content-stretch flex items-center justify-center left-[1149px] rounded-[8px] size-[32px] top-[11.5px]" data-name="Button">
      <Icon12 />
    </div>
  );
}

function Container35() {
  return (
    <div className="h-[56px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-slate-100 border-solid inset-0 pointer-events-none" />
      <Container26 />
      <PrimitiveButton2 />
      <Container28 />
      <Container29 />
      <Container30 />
      <Container31 />
      <Container32 />
      <Container33 />
      <Badge2 />
      <Badge3 />
      <Container34 />
      <Button9 />
    </div>
  );
}

function Icon13() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p1c949200} id="Vector" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.pd12ce00} id="Vector_2" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p226ad00} id="Vector_3" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p1e9aa900} id="Vector_4" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p12fdd280} id="Vector_5" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p3be7b040} id="Vector_6" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container36() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-start justify-center left-0 top-[19.5px] w-[40px]" data-name="Container">
      <Icon13 />
    </div>
  );
}

function PrimitiveButton3() {
  return <div className="absolute bg-[#f3f3f5] border border-[#cad5e2] border-solid left-[52px] rounded-[4px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] size-[16px] top-[19.5px]" data-name="Primitive.button" />;
}

function Container37() {
  return <div className="absolute left-[12px] size-0 top-[12px]" data-name="Container" />;
}

function Text3() {
  return <div className="absolute h-0 left-[12px] top-[12px] w-[16px]" data-name="Text" />;
}

function Text4() {
  return (
    <div className="absolute h-[20px] left-[32px] overflow-clip top-[2px] w-[101.125px]" data-name="Text">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#0f172b] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Angle Brace 56</p>
    </div>
  );
}

function Icon14() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M3.33333 8H12.6667" id="Vector" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 3.33333V12.6667" id="Vector_2" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button10() {
  return (
    <div className="absolute content-stretch flex items-center justify-center left-[141.13px] opacity-0 rounded-[8px] size-[24px] top-0" data-name="Button">
      <Icon14 />
    </div>
  );
}

function Container38() {
  return (
    <div className="absolute h-[24px] left-[80px] top-[15.5px] w-[200px]" data-name="Container">
      <Container37 />
      <Text3 />
      <Text4 />
      <Button10 />
    </div>
  );
}

function Container39() {
  return (
    <div className="absolute h-[20px] left-[280px] overflow-clip top-[17.5px] w-[120px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[12px] not-italic text-[#45556c] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">AB12002400</p>
    </div>
  );
}

function Container40() {
  return (
    <div className="absolute h-[20px] left-[400px] top-[17.5px] w-[100px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[49.52px] not-italic text-[#0f172b] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%] whitespace-pre">20</p>
    </div>
  );
}

function Container41() {
  return (
    <div className="absolute h-[20px] left-[500px] top-[17.5px] w-[80px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[12px] not-italic text-[#45556c] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Units</p>
    </div>
  );
}

function Container42() {
  return (
    <div className="absolute h-[20px] left-[580px] top-[17.5px] w-[100px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[88.84px] not-italic text-[#0f172b] text-[14px] text-right top-[0.5px] tracking-[-0.1504px] translate-x-[-100%] w-[48px]">$22.56</p>
    </div>
  );
}

function Container43() {
  return (
    <div className="absolute h-[20px] left-[680px] top-[17.5px] w-[100px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[88.77px] not-italic text-[#0f172b] text-[14px] text-right top-[0.5px] tracking-[-0.1504px] translate-x-[-100%] w-[55px]">$451.20</p>
    </div>
  );
}

function Badge4() {
  return (
    <div className="absolute bg-white border border-slate-200 border-solid h-[22px] left-[792px] overflow-clip rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] top-[16.5px] w-[50.672px]" data-name="Badge">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[10px] not-italic text-[#0f172b] text-[12px] text-nowrap top-[3px] whitespace-pre">Make</p>
    </div>
  );
}

function Badge5() {
  return (
    <div className="absolute bg-slate-100 border border-slate-200 border-solid h-[22px] left-[892px] overflow-clip rounded-[8px] top-[16.5px] w-[57.094px]" data-name="Badge">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[8px] not-italic text-[#45556c] text-[12px] text-nowrap top-[3px] whitespace-pre">Table C</p>
    </div>
  );
}

function Icon15() {
  return (
    <div className="absolute left-[10px] size-[16px] top-[5px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M8 2V10" id="Vector" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p26e09a00} id="Vector_2" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p23ad1400} id="Vector_3" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button11() {
  return (
    <div className="absolute bg-white border border-slate-200 border-solid h-[28px] left-[1012px] rounded-[8px] top-[13.5px] w-[116px]" data-name="Button">
      <Icon15 />
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[59.5px] not-italic text-[#314158] text-[12px] text-center text-nowrap top-[6px] translate-x-[-50%] whitespace-pre">Upload</p>
    </div>
  );
}

function Icon16() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M6.66667 7.33333V11.3333" id="Vector" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M9.33333 7.33333V11.3333" id="Vector_2" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p37e28100} id="Vector_3" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M2 4H14" id="Vector_4" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p2ffbeb80} id="Vector_5" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button12() {
  return (
    <div className="absolute content-stretch flex items-center justify-center left-[1149px] rounded-[8px] size-[32px] top-[11.5px]" data-name="Button">
      <Icon16 />
    </div>
  );
}

function Container44() {
  return (
    <div className="h-[56px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-slate-100 border-solid inset-0 pointer-events-none" />
      <Container36 />
      <PrimitiveButton3 />
      <Container38 />
      <Container39 />
      <Container40 />
      <Container41 />
      <Container42 />
      <Container43 />
      <Badge4 />
      <Badge5 />
      <Button11 />
      <Button12 />
    </div>
  );
}

function Icon17() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p1c949200} id="Vector" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.pd12ce00} id="Vector_2" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p226ad00} id="Vector_3" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p1e9aa900} id="Vector_4" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p12fdd280} id="Vector_5" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p3be7b040} id="Vector_6" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container45() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-start justify-center left-0 top-[19.5px] w-[40px]" data-name="Container">
      <Icon17 />
    </div>
  );
}

function PrimitiveButton4() {
  return <div className="absolute bg-[#f3f3f5] border border-[#cad5e2] border-solid left-[52px] rounded-[4px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] size-[16px] top-[19.5px]" data-name="Primitive.button" />;
}

function Container46() {
  return <div className="absolute left-[12px] size-0 top-[12px]" data-name="Container" />;
}

function Text5() {
  return <div className="absolute h-0 left-[12px] top-[12px] w-[16px]" data-name="Text" />;
}

function Text6() {
  return (
    <div className="absolute h-[20px] left-[32px] overflow-clip top-[2px] w-[86.758px]" data-name="Text">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#0f172b] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Sliding Brace</p>
    </div>
  );
}

function Icon18() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M3.33333 8H12.6667" id="Vector" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 3.33333V12.6667" id="Vector_2" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button13() {
  return (
    <div className="absolute content-stretch flex items-center justify-center left-[126.76px] opacity-0 rounded-[8px] size-[24px] top-0" data-name="Button">
      <Icon18 />
    </div>
  );
}

function Container47() {
  return (
    <div className="absolute h-[24px] left-[80px] top-[15.5px] w-[200px]" data-name="Container">
      <Container46 />
      <Text5 />
      <Text6 />
      <Button13 />
    </div>
  );
}

function Container48() {
  return (
    <div className="absolute h-[20px] left-[280px] overflow-clip top-[17.5px] w-[120px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[12px] not-italic text-[#45556c] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">SB12002400</p>
    </div>
  );
}

function Container49() {
  return (
    <div className="absolute h-[20px] left-[400px] top-[17.5px] w-[100px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[50.31px] not-italic text-[#0f172b] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%] whitespace-pre">45</p>
    </div>
  );
}

function Container50() {
  return (
    <div className="absolute h-[20px] left-[500px] top-[17.5px] w-[80px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[12px] not-italic text-[#45556c] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Units</p>
    </div>
  );
}

function Container51() {
  return (
    <div className="absolute h-[20px] left-[580px] top-[17.5px] w-[100px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[88.61px] not-italic text-[#0f172b] text-[14px] text-right top-[0.5px] tracking-[-0.1504px] translate-x-[-100%] w-[45px]">$13.67</p>
    </div>
  );
}

function Container52() {
  return (
    <div className="absolute h-[20px] left-[680px] top-[17.5px] w-[100px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[88.34px] not-italic text-[#0f172b] text-[14px] text-right top-[0.5px] tracking-[-0.1504px] translate-x-[-100%] w-[52px]">$615.15</p>
    </div>
  );
}

function Badge6() {
  return (
    <div className="absolute bg-white border border-slate-200 border-solid h-[22px] left-[792px] overflow-clip rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] top-[16.5px] w-[50.672px]" data-name="Badge">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[10px] not-italic text-[#0f172b] text-[12px] text-nowrap top-[3px] whitespace-pre">Make</p>
    </div>
  );
}

function Badge7() {
  return (
    <div className="absolute bg-slate-100 border border-slate-200 border-solid h-[22px] left-[892px] overflow-clip rounded-[8px] top-[16.5px] w-[79.953px]" data-name="Badge">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[8px] not-italic text-[#45556c] text-[12px] text-nowrap top-[3px] whitespace-pre">Press Brake</p>
    </div>
  );
}

function Icon19() {
  return (
    <div className="absolute left-[10px] size-[16px] top-[5px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M8 2V10" id="Vector" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p26e09a00} id="Vector_2" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p23ad1400} id="Vector_3" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button14() {
  return (
    <div className="absolute bg-white border border-slate-200 border-solid h-[28px] left-[1012px] rounded-[8px] top-[13.5px] w-[116px]" data-name="Button">
      <Icon19 />
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[59.5px] not-italic text-[#314158] text-[12px] text-center text-nowrap top-[6px] translate-x-[-50%] whitespace-pre">Upload</p>
    </div>
  );
}

function Icon20() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M6.66667 7.33333V11.3333" id="Vector" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M9.33333 7.33333V11.3333" id="Vector_2" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p37e28100} id="Vector_3" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M2 4H14" id="Vector_4" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p2ffbeb80} id="Vector_5" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button15() {
  return (
    <div className="absolute content-stretch flex items-center justify-center left-[1149px] rounded-[8px] size-[32px] top-[11.5px]" data-name="Button">
      <Icon20 />
    </div>
  );
}

function Container53() {
  return (
    <div className="h-[56px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-slate-100 border-solid inset-0 pointer-events-none" />
      <Container45 />
      <PrimitiveButton4 />
      <Container47 />
      <Container48 />
      <Container49 />
      <Container50 />
      <Container51 />
      <Container52 />
      <Badge6 />
      <Badge7 />
      <Button14 />
      <Button15 />
    </div>
  );
}

function Icon21() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p1c949200} id="Vector" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.pd12ce00} id="Vector_2" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p226ad00} id="Vector_3" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p1e9aa900} id="Vector_4" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p12fdd280} id="Vector_5" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p3be7b040} id="Vector_6" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container54() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-start justify-center left-0 top-[19.5px] w-[40px]" data-name="Container">
      <Icon21 />
    </div>
  );
}

function PrimitiveButton5() {
  return <div className="absolute bg-[#f3f3f5] border border-[#cad5e2] border-solid left-[52px] rounded-[4px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] size-[16px] top-[19.5px]" data-name="Primitive.button" />;
}

function Container55() {
  return <div className="absolute left-[12px] size-0 top-[12px]" data-name="Container" />;
}

function Text7() {
  return <div className="absolute h-0 left-[12px] top-[12px] w-[16px]" data-name="Text" />;
}

function Text8() {
  return (
    <div className="absolute h-[20px] left-[32px] overflow-clip top-[2px] w-[113.211px]" data-name="Text">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#0f172b] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Angle 50 x 50 EA</p>
    </div>
  );
}

function Icon22() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M3.33333 8H12.6667" id="Vector" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 3.33333V12.6667" id="Vector_2" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button16() {
  return (
    <div className="absolute content-stretch flex items-center justify-center left-[153.21px] opacity-0 rounded-[8px] size-[24px] top-0" data-name="Button">
      <Icon22 />
    </div>
  );
}

function Container56() {
  return (
    <div className="absolute h-[24px] left-[80px] top-[15.5px] w-[200px]" data-name="Container">
      <Container55 />
      <Text7 />
      <Text8 />
      <Button16 />
    </div>
  );
}

function Container57() {
  return (
    <div className="absolute h-[20px] left-[280px] overflow-clip top-[17.5px] w-[120px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[12px] not-italic text-[#45556c] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">EA50502</p>
    </div>
  );
}

function Container58() {
  return (
    <div className="absolute h-[20px] left-[400px] top-[17.5px] w-[100px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[50.28px] not-italic text-[#0f172b] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%] whitespace-pre">60</p>
    </div>
  );
}

function Container59() {
  return (
    <div className="absolute h-[20px] left-[500px] top-[17.5px] w-[80px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[12px] not-italic text-[#45556c] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Units</p>
    </div>
  );
}

function Container60() {
  return (
    <div className="absolute h-[20px] left-[580px] top-[17.5px] w-[100px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[88.21px] not-italic text-[#0f172b] text-[14px] text-right top-[0.5px] tracking-[-0.1504px] translate-x-[-100%] w-[44px]">$12.74</p>
    </div>
  );
}

function Container61() {
  return (
    <div className="absolute h-[20px] left-[680px] top-[17.5px] w-[100px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[88.81px] not-italic text-[#0f172b] text-[14px] text-right top-[0.5px] tracking-[-0.1504px] translate-x-[-100%] w-[57px]">$764.40</p>
    </div>
  );
}

function Badge8() {
  return (
    <div className="absolute bg-white border border-slate-200 border-solid h-[22px] left-[792px] overflow-clip rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] top-[16.5px] w-[42.32px]" data-name="Badge">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[10px] not-italic text-[#62748e] text-[12px] text-nowrap top-[3px] whitespace-pre">Buy</p>
    </div>
  );
}

function Badge9() {
  return (
    <div className="absolute bg-slate-100 border border-slate-200 border-solid h-[22px] left-[892px] overflow-clip rounded-[8px] top-[16.5px] w-[56.625px]" data-name="Badge">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[8px] not-italic text-[#45556c] text-[12px] text-nowrap top-[3px] whitespace-pre">Table A</p>
    </div>
  );
}

function Icon23() {
  return (
    <div className="absolute left-[10px] size-[16px] top-[5px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M8 2V10" id="Vector" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p26e09a00} id="Vector_2" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p23ad1400} id="Vector_3" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button17() {
  return (
    <div className="absolute bg-white border border-slate-200 border-solid h-[28px] left-[1012px] rounded-[8px] top-[13.5px] w-[116px]" data-name="Button">
      <Icon23 />
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[59.5px] not-italic text-[#314158] text-[12px] text-center text-nowrap top-[6px] translate-x-[-50%] whitespace-pre">Upload</p>
    </div>
  );
}

function Icon24() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M6.66667 7.33333V11.3333" id="Vector" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M9.33333 7.33333V11.3333" id="Vector_2" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p37e28100} id="Vector_3" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M2 4H14" id="Vector_4" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p2ffbeb80} id="Vector_5" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button18() {
  return (
    <div className="absolute content-stretch flex items-center justify-center left-[1149px] rounded-[8px] size-[32px] top-[11.5px]" data-name="Button">
      <Icon24 />
    </div>
  );
}

function Container62() {
  return (
    <div className="h-[56px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-slate-100 border-solid inset-0 pointer-events-none" />
      <Container54 />
      <PrimitiveButton5 />
      <Container56 />
      <Container57 />
      <Container58 />
      <Container59 />
      <Container60 />
      <Container61 />
      <Badge8 />
      <Badge9 />
      <Button17 />
      <Button18 />
    </div>
  );
}

function Icon25() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p1c949200} id="Vector" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.pd12ce00} id="Vector_2" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p226ad00} id="Vector_3" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p1e9aa900} id="Vector_4" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p12fdd280} id="Vector_5" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p3be7b040} id="Vector_6" stroke="var(--stroke-0, #CAD5E2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container63() {
  return (
    <div className="absolute content-stretch flex h-[16px] items-start justify-center left-0 top-[20px] w-[40px]" data-name="Container">
      <Icon25 />
    </div>
  );
}

function PrimitiveButton6() {
  return <div className="absolute bg-[#f3f3f5] border border-[#cad5e2] border-solid left-[52px] rounded-[4px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] size-[16px] top-[20px]" data-name="Primitive.button" />;
}

function Container64() {
  return <div className="absolute left-[12px] size-0 top-[12px]" data-name="Container" />;
}

function Text9() {
  return <div className="absolute h-0 left-[12px] top-[12px] w-[16px]" data-name="Text" />;
}

function Text10() {
  return (
    <div className="absolute h-[20px] left-[32px] overflow-clip top-[2px] w-[74.352px]" data-name="Text">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#0f172b] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Toggle Bolt</p>
    </div>
  );
}

function Icon26() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M3.33333 8H12.6667" id="Vector" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 3.33333V12.6667" id="Vector_2" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button19() {
  return (
    <div className="absolute content-stretch flex items-center justify-center left-[114.35px] opacity-0 rounded-[8px] size-[24px] top-0" data-name="Button">
      <Icon26 />
    </div>
  );
}

function Container65() {
  return (
    <div className="absolute h-[24px] left-[80px] top-[16px] w-[200px]" data-name="Container">
      <Container64 />
      <Text9 />
      <Text10 />
      <Button19 />
    </div>
  );
}

function Container66() {
  return (
    <div className="absolute h-[20px] left-[280px] overflow-clip top-[18px] w-[120px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[12px] not-italic text-[#45556c] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">FIXTB01</p>
    </div>
  );
}

function Container67() {
  return (
    <div className="absolute h-[20px] left-[400px] top-[18px] w-[100px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[50.31px] not-italic text-[#0f172b] text-[14px] text-center text-nowrap top-[0.5px] tracking-[-0.1504px] translate-x-[-50%] whitespace-pre">45</p>
    </div>
  );
}

function Container68() {
  return (
    <div className="absolute h-[20px] left-[500px] top-[18px] w-[80px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[12px] not-italic text-[#45556c] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Units</p>
    </div>
  );
}

function Container69() {
  return (
    <div className="absolute h-[20px] left-[580px] top-[18px] w-[100px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[88.02px] not-italic text-[#0f172b] text-[14px] text-right top-[0.5px] tracking-[-0.1504px] translate-x-[-100%] w-[39px]">$8.06</p>
    </div>
  );
}

function Container70() {
  return (
    <div className="absolute h-[20px] left-[680px] top-[18px] w-[100px]" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[88.56px] not-italic text-[#0f172b] text-[14px] text-right top-[0.5px] tracking-[-0.1504px] translate-x-[-100%] w-[56px]">$362.70</p>
    </div>
  );
}

function Badge10() {
  return (
    <div className="absolute bg-white border border-slate-200 border-solid h-[22px] left-[792px] overflow-clip rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] top-[17px] w-[42.32px]" data-name="Badge">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[10px] not-italic text-[#62748e] text-[12px] text-nowrap top-[3px] whitespace-pre">Buy</p>
    </div>
  );
}

function Badge11() {
  return (
    <div className="absolute bg-slate-100 border border-slate-200 border-solid h-[22px] left-[892px] overflow-clip rounded-[8px] top-[17px] w-[57.094px]" data-name="Badge">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[8px] not-italic text-[#45556c] text-[12px] text-nowrap top-[3px] whitespace-pre">Table C</p>
    </div>
  );
}

function Icon27() {
  return (
    <div className="absolute left-[10px] size-[16px] top-[5px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M8 2V10" id="Vector" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p26e09a00} id="Vector_2" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p23ad1400} id="Vector_3" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button20() {
  return (
    <div className="absolute bg-white border border-slate-200 border-solid h-[28px] left-[1012px] rounded-[8px] top-[14px] w-[116px]" data-name="Button">
      <Icon27 />
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[59.5px] not-italic text-[#314158] text-[12px] text-center text-nowrap top-[6px] translate-x-[-50%] whitespace-pre">Upload</p>
    </div>
  );
}

function Icon28() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M6.66667 7.33333V11.3333" id="Vector" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M9.33333 7.33333V11.3333" id="Vector_2" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p37e28100} id="Vector_3" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M2 4H14" id="Vector_4" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p2ffbeb80} id="Vector_5" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button21() {
  return (
    <div className="absolute content-stretch flex items-center justify-center left-[1149px] rounded-[8px] size-[32px] top-[12px]" data-name="Button">
      <Icon28 />
    </div>
  );
}

function Container71() {
  return (
    <div className="h-[56px] relative shrink-0 w-full" data-name="Container">
      <Container63 />
      <PrimitiveButton6 />
      <Container65 />
      <Container66 />
      <Container67 />
      <Container68 />
      <Container69 />
      <Container70 />
      <Badge10 />
      <Badge11 />
      <Button20 />
      <Button21 />
    </div>
  );
}

function Container72() {
  return (
    <div className="content-stretch flex flex-col h-[336px] items-start relative shrink-0 w-full" data-name="Container">
      <Container25 />
      <Container35 />
      <Container44 />
      <Container53 />
      <Container62 />
      <Container71 />
    </div>
  );
}

function BomTable() {
  return (
    <div className="bg-white h-[382px] relative rounded-[10px] shrink-0 w-full" data-name="BOMTable">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col h-[382px] items-start p-px relative w-full">
          <Container16 />
          <Container72 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-slate-200 border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Text11() {
  return (
    <div className="h-[20px] relative shrink-0 w-[70.5px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid h-[20px] relative w-[70.5px]">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#0f172b] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Page 1 of 1</p>
      </div>
    </div>
  );
}

function Icon29() {
  return (
    <div className="relative size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M4 6L8 10L12 6" id="Vector" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button22() {
  return (
    <div className="bg-white opacity-50 relative rounded-[8px] shrink-0 size-[36px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-slate-200 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-px relative size-[36px]">
        <div className="flex items-center justify-center relative shrink-0 size-[16px]" style={{ "--transform-inner-width": "16", "--transform-inner-height": "16" } as React.CSSProperties}>
          <div className="flex-none rotate-[90deg]">
            <Icon29 />
          </div>
        </div>
      </div>
    </div>
  );
}

function Icon30() {
  return (
    <div className="relative size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M4 6L8 10L12 6" id="Vector" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button23() {
  return (
    <div className="basis-0 bg-white grow h-[36px] min-h-px min-w-px relative rounded-[8px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-slate-200 border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex h-[36px] items-center justify-center p-px relative w-full">
        <div className="flex items-center justify-center relative shrink-0 size-[16px]" style={{ "--transform-inner-width": "16", "--transform-inner-height": "16" } as React.CSSProperties}>
          <div className="flex-none rotate-[270deg]">
            <Icon30 />
          </div>
        </div>
      </div>
    </div>
  );
}

function Container73() {
  return (
    <div className="h-[36px] relative shrink-0 w-[80px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] h-[36px] items-start relative w-[80px]">
        <Button22 />
        <Button23 />
      </div>
    </div>
  );
}

function Container74() {
  return (
    <div className="content-stretch flex h-[52px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Text11 />
      <Container73 />
    </div>
  );
}

function Container75() {
  return (
    <div className="h-[761px] relative shrink-0 w-[1152px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[24px] h-[761px] items-start relative w-[1152px]">
        <Container1 />
        <Container4 />
        <BomTable />
        <Container74 />
      </div>
    </div>
  );
}

function MainContent() {
  return (
    <div className="basis-0 bg-slate-50 grow min-h-px min-w-px relative shrink-0 w-[1295px]" data-name="Main Content">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex h-full items-start justify-center overflow-clip pb-0 pt-[32px] px-0 relative rounded-[inherit] w-[1295px]">
        <Container75 />
      </div>
    </div>
  );
}

export default function Container76() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full" data-name="Container">
      <MainContent />
    </div>
  );
}