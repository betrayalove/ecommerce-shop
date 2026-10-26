import type { ImgHTMLAttributes } from 'react';

const fallback = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#1e293b"/><g fill="none" stroke="#bfdbfe" stroke-width="5" stroke-linejoin="round"><path d="m140 118 60-30 60 30v74l-60 30-60-30Zm0 0 60 30 60-30m-60 30v74m-30-119 60 30"/></g></svg>')}`;

export function ProductImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  return <img {...props} onError={event => {
    const image = event.currentTarget;
    if (image.src !== fallback) image.src = fallback;
  }} />;
}
