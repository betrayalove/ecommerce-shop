import './error-block.scss';

export interface ErrorBlockProps {
  message: string;
}

export function ErrorBlock({ message }: ErrorBlockProps) {
  return (
    <div className="error-block" role="alert">
      <p className="error-block__message">{message}</p>
    </div>
  );
}
