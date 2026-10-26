const { productImage } = require('./product-images');
const products = [
  { id: '1', title: 'Смартфон X1', price: 29990, category: 'electronics', description: 'Современный смартфон с отличной камерой.', image: productImage('Phone') },
  { id: '2', title: 'Ноутбук Pro', price: 89990, category: 'electronics', description: 'Мощный ноутбук для работы и игр.', image: productImage('Laptop') },
  { id: '3', title: 'Наушники Wireless', price: 4990, category: 'electronics', description: 'Беспроводные наушники с шумоподавлением.', image: productImage('Headphones') },
  { id: '4', title: 'Футболка Classic', price: 1290, category: 'clothing', description: 'Хлопковая футболка базового кроя.', image: productImage('T-Shirt') },
  { id: '5', title: 'Джинсы Slim', price: 3490, category: 'clothing', description: 'Узкие джинсы из денима.', image: productImage('Jeans') },
  { id: '6', title: 'Книга «React в действии»', price: 890, category: 'books', description: 'Практическое руководство по React.', image: productImage('Book') },
  { id: '7', title: 'Часы Smart Watch', price: 15990, category: 'electronics', description: 'Умные часы с пульсометром.', image: productImage('Watch') },
  { id: '8', title: 'Рюкзак Urban', price: 2990, category: 'accessories', description: 'Вместительный городской рюкзак.', image: productImage('Backpack') },
  { id: '9', title: 'Кроссовки Run', price: 5990, category: 'clothing', description: 'Лёгкие беговые кроссовки.', image: productImage('Shoes') },
  { id: '10', title: 'Клавиатура Mechanical', price: 7490, category: 'electronics', description: 'Механическая клавиатура с подсветкой.', image: productImage('Keyboard') },
];

module.exports = products;
