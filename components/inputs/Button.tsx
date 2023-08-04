interface ButtonProps {
  ariaLabel?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}

const Button = (props: ButtonProps) => {
  return (
    <button
      disabled={props.disabled}
      aria-label={props.ariaLabel}
      onClick={props.onClick}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      {props.leftIcon && <span className="mr-2">{props.leftIcon}</span>}
      {props.children}
    </button>
  );
};

export default Button;
