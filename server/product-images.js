// Self-contained demo illustrations keep the catalog independent of image hosts.
const outlines = {
  Phone: '<rect x="167" y="74" width="66" height="144" rx="12"/><path d="M187 86h26m-18 119h10"/>',
  Laptop: '<rect x="118" y="83" width="164" height="108" rx="8"/><path d="M101 211h198l-17-20H118zM172 199h56"/>',
  Headphones: '<path d="M140 161v-21a60 60 0 0 1 120 0v21"/><rect x="130" y="144" width="30" height="65" rx="12"/><rect x="240" y="144" width="30" height="65" rx="12"/>',
  'T-Shirt': '<path d="m167 89-54 33 22 41 28-14v70h74v-70l28 14 22-41-54-33q-33 32-66 0Z"/>',
  Jeans: '<path d="M158 78h84l14 145h-43l-13-93-13 93h-43Z"/><path d="M158 99h84m-42-21v52"/>',
  Book: '<path d="M121 88h53q26 0 26 18 0-18 26-18h53v125h-53q-26 0-26 10 0-10-26-10h-53Zm79 18v117m-59-103h36m-36 22h36m46-22h36m-36 22h36"/>',
  Watch: '<path d="m178 109 5-40h34l5 40m-44 82 5 40h34l5-40"/><rect x="159" y="109" width="82" height="82" rx="19"/><path d="M200 127v25l18 10m23-23h7"/>',
  Backpack: '<path d="M171 102v-10a29 29 0 0 1 58 0v10"/><rect x="144" y="103" width="112" height="124" rx="25"/><rect x="164" y="164" width="72" height="44" rx="8"/><path d="M173 129h54m-27 35v12"/>',
  Shoes: '<path d="m125 130 24-35 40 28 27 40 58 16q18 5 18 26H111v-34Zm-13 75v13h180v-13m-114-65 19-15m-5 32 19-15"/>',
  Keyboard: '<rect x="97" y="108" width="206" height="100" rx="12"/><path d="M115 129h12m14 0h12m14 0h12m14 0h12m14 0h12m14 0h12m14 0h12M115 150h12m14 0h12m14 0h12m14 0h12m14 0h12m14 0h12m14 0h12M115 177h12m14 0h118m14 0h12"/>',
};
function productImage(name) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><defs><radialGradient id="g"><stop stop-color="#1e3a8a"/><stop offset="1" stop-color="#0f172a"/></radialGradient></defs><rect width="400" height="300" fill="url(#g)"/><circle cx="200" cy="150" r="105" fill="none" stroke="#334155"/><g fill="none" stroke="#bfdbfe" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${outlines[name]}</g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
module.exports = { productImage };
