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
      className="my-6 bg-sky-400 p-4 font-bold text-white hover:bg-sky-700 dark:bg-sky-950"
    >
      {props.leftIcon && <span className="mr-2">{props.leftIcon}</span>}
      {props.children}
    </button>
  );
};

export default Button;
