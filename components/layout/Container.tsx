interface ContainerProps {
  children: React.ReactNode;
}

const Container = ({ children }: ContainerProps) => {
  return <section className="container mx-auto h-full">{children}</section>;
};
export default Container;
