'use client';

import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/utils';

interface TextProps {
  children: React.ReactNode;
  asChild?: boolean;
  fontWeight?: 400 | 500 | 600 | 700;
  className?: string;
  //asChild?: 'div' | 'span' | 'p';
}

const fwSize = {
  400: 'font-normal', // this should be the default somewhere in settings
  500: 'font-medium',
  600: 'font-semibold',
  700: 'font-bold',
};

const Text = ({ asChild, children, fontWeight, className }: TextProps) => {
  const Comp = asChild ? Slot : 'p';
  return (
    <Comp className={cn(className, fontWeight ? fwSize[fontWeight] : 'font-normal')}>
      {children}
    </Comp>
  );
};

export default Text;
