import { Text as MantineText } from '@mantine/core';

interface TextProps {
  children: React.ReactNode;
  as?: 'div' | 'span' | 'p';
  fontWeight?: number;
}

const Text = (props: TextProps) => {
  return (
    <>
      <MantineText fw={props.fontWeight} component={props.as}>
        {props.children}
      </MantineText>
    </>
  );
};

export default Text;
