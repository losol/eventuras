interface TextProps {
  children: React.ReactNode;
  as?: 'div' | 'span' | 'p';
  classname?: string;
}

const Text = (props: TextProps) => {
  const TextComponent = props.as || 'div';
  return (
    <>
      <TextComponent className={props.classname}>{props.children}</TextComponent>
    </>
  );
};

export default Text;
