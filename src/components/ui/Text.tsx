interface TextProps {
  children: React.ReactNode;
  as?: 'div' | 'span' | 'p';
  className?: string;
}

const Text = (props: TextProps) => {
  const TextComponent = props.as || 'div';
  return (
    <>
      <TextComponent className={props.className}>{props.children}</TextComponent>
    </>
  );
};

export default Text;
