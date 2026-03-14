import type { HTMLAttributes } from 'react';
import './card.scss';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({
  padding = 'md',
  className = '',
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={`card card--padding-${padding} ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}
