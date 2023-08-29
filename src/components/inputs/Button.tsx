import { Loading } from '../feedback';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ariaLabel?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  primary?: boolean;
  className?: string;
  loading?: boolean;
}

const Button = (props: ButtonProps) => {
  return (
    <button
      disabled={props.disabled || props.loading}
      aria-label={props.ariaLabel}
      onClick={props.onClick}
      className={
        props.className ??
        'bg-sky-400 dark:bg-sky-950 hover:bg-sky-700 text-white font-bold my-6 py-4 px-4 flex flex-row'
      }
    >
      {props.leftIcon && <span className="mr-2">{props.leftIcon}</span>}
      {props.children}
      {props.loading && (
        <div className="scale-[0.7] mt-[-2px] ml-1">
          <Loading />
        </div>
      )}
    </button>
  );
};

export default Button;
