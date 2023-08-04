interface ContainerProps {
  children: React.ReactNode;
}

const Container = (props: ContainerProps) => {
  return (
    <>
      <div className="container mx-auto">{props.children}</div>
    </>
  );
};
export default Container;
