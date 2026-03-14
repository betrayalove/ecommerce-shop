import type { ButtonHTMLAttributes } from 'react';
import './button.scss';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`button button--${variant} button--${size} ${fullWidth ? 'button--full' : ''} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
