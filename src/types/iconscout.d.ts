declare module '@iconscout/react-unicons/icons/*' {
  import { FC, SVGProps } from 'react';
  const Icon: FC<SVGProps<SVGSVGElement> & { size?: number | string; color?: string }>;
  export default Icon;
}
