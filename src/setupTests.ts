import '@testing-library/jest-dom';

// RTK Query требует fetch в окружении (Jest/Node его нет по умолчанию)
if (typeof globalThis.fetch === 'undefined') {
  globalThis.fetch = () => Promise.reject(new Error('fetch mock'));
}
