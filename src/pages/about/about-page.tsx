import './about-page.scss';

export function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-page__container">
        <h1 className="about-page__title">О нас</h1>
        <p className="about-page__text">
          Это учебный pet-проект интернет-магазина на React, Redux Toolkit, SASS и Node.js.
          Демонстрирует каталог товаров, корзину, фильтры и авторизацию по JWT.
        </p>
      </div>
    </div>
  );
}
