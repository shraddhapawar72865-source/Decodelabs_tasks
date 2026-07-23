const cart = [];
const cartPanel = document.querySelector('.cart-panel');
const overlay = document.querySelector('.overlay');
const cartItems = document.querySelector('.cart-items');
const menuSearch = document.querySelector('#menu-search');
const searchStatus = document.querySelector('.search-status');
const dishContainer = document.querySelector('.dish-container');
let activeFilter = 'all';
let menu = [];

const currency = (value) => `Rs. ${value}`;

function updateCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.querySelector('.cart-count').textContent = count;
  document.querySelector('.cart-total').textContent = currency(total);
  cartItems.innerHTML = cart.length ? cart.map((item, index) => `<div class="cart-item"><div><h3>${item.name}</h3><p>${currency(item.price * item.quantity)}</p><button class="remove-item" data-index="${index}">Remove</button></div><div class="quantity"><button aria-label="Remove one ${item.name}" data-index="${index}" data-change="-1">-</button><span>${item.quantity}</span><button aria-label="Add one ${item.name}" data-index="${index}" data-change="1">+</button></div></div>`).join('') : '<p class="empty-cart">Your cart is empty.</p>';
}

function renderMenu(items) {
  dishContainer.innerHTML = items.map((item) => `<article class="dish-card" data-category="${item.category}">${item.badge ? `<div class="badge">${item.badge}</div>` : ''}<img src="${item.image}" alt="${item.name}"><div class="dish-content"><div class="dish-meta"><span><i class="fa-solid fa-star"></i> ${item.rating}</span><span>${item.prepTime}</span></div><h3>${item.name}</h3><p>${item.description}</p><div class="dish-footer"><span>${currency(item.price)}</span><button class="add-to-cart" data-id="${item.id}">Add <i class="fa-solid fa-plus"></i></button></div></div></article>`).join('');
}

async function loadMenu() {
  try {
    const response = await fetch('/api/menu');
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error?.message);
    menu = payload.data;
    renderMenu(menu);
  } catch (error) {
    dishContainer.innerHTML = '<p class="search-status">We could not load the menu. Please refresh and try again.</p>';
  }
}

function applyMenuFilters() {
  const query = menuSearch.value.trim().toLowerCase();
  const filtered = menu.filter((item) => (activeFilter === 'all' || item.category === activeFilter) && (!query || `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(query)));
  renderMenu(filtered);
  searchStatus.textContent = query ? `${filtered.length} result${filtered.length === 1 ? '' : 's'} found for "${menuSearch.value.trim()}"` : '';
}

function toggleCart(open) { cartPanel.classList.toggle('open', open); overlay.classList.toggle('show', open); }
document.querySelector('.cart-toggle').addEventListener('click', () => toggleCart(true));
document.querySelector('.close-cart').addEventListener('click', () => toggleCart(false));
overlay.addEventListener('click', () => toggleCart(false));
dishContainer.addEventListener('click', (event) => {
  const button = event.target.closest('.add-to-cart');
  if (!button) return;
  const product = menu.find((item) => item.id === button.dataset.id);
  const item = cart.find((entry) => entry.id === product.id);
  if (item) item.quantity += 1; else cart.push({ ...product, quantity: 1 });
  updateCart(); toggleCart(true);
});
cartItems.addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button) return;
  const index = Number(button.dataset.index);
  if (button.classList.contains('remove-item')) cart.splice(index, 1);
  if (button.dataset.change) { cart[index].quantity += Number(button.dataset.change); if (cart[index].quantity < 1) cart.splice(index, 1); }
  updateCart();
});
menuSearch.addEventListener('input', applyMenuFilters);
document.querySelector('.nav-search').addEventListener('submit', event => { event.preventDefault(); document.querySelector('#menu').scrollIntoView({ behavior: 'smooth' }); });
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('.filter').forEach(filter => filter.classList.remove('active')); button.classList.add('active'); activeFilter = button.dataset.filter; applyMenuFilters(); }));
const menuToggle = document.querySelector('.menu-toggle');
menuToggle.addEventListener('click', () => { const open = document.querySelector('.nav-links').classList.toggle('open'); menuToggle.setAttribute('aria-expanded', open); });
document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => { document.querySelectorAll('.nav-links a').forEach(navLink => navLink.classList.remove('active')); link.classList.add('active'); document.querySelector('.nav-links').classList.remove('open'); }));
const modal = document.querySelector('.login-modal');
document.querySelector('.login-btn').addEventListener('click', () => modal.classList.add('show'));
document.querySelector('.close-modal').addEventListener('click', () => modal.classList.remove('show'));
document.querySelector('.login-form').addEventListener('submit', event => { event.preventDefault(); event.currentTarget.querySelector('.form-message').textContent = 'Demo sign-in received. Your order is ready to place.'; });
document.querySelector('.contact-form').addEventListener('submit', async event => {
  event.preventDefault(); const form = event.currentTarget; const message = form.querySelector('.form-message');
  try { const response = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.elements[0].value, email: form.elements[1].value, message: form.elements[2].value }) }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error?.details?.[0] || payload.error?.message); form.reset(); message.textContent = payload.message; } catch (error) { message.textContent = error.message || 'Unable to send your message.'; }
});
document.querySelector('.checkout-btn').addEventListener('click', async () => {
  if (!cart.length) return; const customerName = window.prompt('Name for this order?'); const customerEmail = window.prompt('Email for order updates?'); if (customerName === null || customerEmail === null) return;
  try { const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerName, customerEmail, items: cart.map(({ id, quantity }) => ({ id, quantity })) }) }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error?.details?.[0] || payload.error?.message); alert(`Order ${payload.data.id} confirmed. Total: ${currency(payload.data.total)}`); cart.splice(0); updateCart(); toggleCart(false); } catch (error) { alert(error.message || 'Unable to place order.'); }
});
document.querySelector('.year').textContent = new Date().getFullYear();
loadMenu();
