import { Button as MantineButton } from '@mantine/core';

interface ButtonProps {
  ariaLabel?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  onClick: () => void;
}

const Button = (props: ButtonProps) => {
  return (
    <MantineButton
      onClick={props.onClick}
      leftIcon={props.leftIcon}
      disabled={props.disabled}
      aria-label={props.ariaLabel}
    >
      {props.children}
    </MantineButton>
  );
};

export default Button;
