import './loader.scss';

export function Loader() {
  return (
    <div className="loader" role="status" aria-label="Загрузка">
      <div className="loader__spinner" />
    </div>
  );
}
