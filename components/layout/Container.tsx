import { Container as MantineContainer } from '@mantine/core';

interface ContainerProps {
  children: React.ReactNode;
}

const Container = (props: ContainerProps) => {
  return (
    <>
      <MantineContainer>{props.children}</MantineContainer>
    </>
  );
};
export default Container;
