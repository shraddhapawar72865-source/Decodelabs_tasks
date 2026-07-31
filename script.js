const cart = [];
const cartPanel = document.querySelector('.cart-panel');
const overlay = document.querySelector('.overlay');
const cartItems = document.querySelector('.cart-items');
const menuSearch = document.querySelector('#menu-search');
const searchStatus = document.querySelector('.search-status');
const dishContainer = document.querySelector('.dish-container');
const checkoutButton = document.querySelector('.checkout-btn');
let activeFilter = 'all';
let menu = [];
let menuRequest;
let searchTimer;

const currency = (value) => `Rs. ${value}`;
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error?.details?.[0] || payload.error?.message || 'Something went wrong. Please try again.');
  return payload;
}

function setButtonLoading(button, loading, label) {
  if (loading) {
    button.dataset.label = button.textContent;
    button.disabled = true;
    button.textContent = label;
  } else {
    button.disabled = false;
    button.textContent = button.dataset.label || button.textContent;
  }
}

function updateCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.querySelector('.cart-count').textContent = count;
  document.querySelector('.cart-total').textContent = currency(total);
  checkoutButton.disabled = !cart.length;
  cartItems.innerHTML = cart.length ? cart.map((item, index) => `<div class="cart-item"><div><h3>${escapeHtml(item.name)}</h3><p>${currency(item.price * item.quantity)}</p><button class="remove-item" data-index="${index}">Remove</button></div><div class="quantity"><button aria-label="Remove one ${escapeHtml(item.name)}" data-index="${index}" data-change="-1">-</button><span>${item.quantity}</span><button aria-label="Add one ${escapeHtml(item.name)}" data-index="${index}" data-change="1">+</button></div></div>`).join('') : '<p class="empty-cart">Your cart is empty.</p>';
}

function renderMenu(items) {
  if (!items.length) {
    dishContainer.innerHTML = '<p class="menu-state">No dishes match your search. Try another filter.</p>';
    return;
  }
  dishContainer.innerHTML = items.map((item) => `<article class="dish-card" data-category="${escapeHtml(item.category)}">${item.badge ? `<div class="badge">${escapeHtml(item.badge)}</div>` : ''}<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}"><div class="dish-content"><div class="dish-meta"><span><i class="fa-solid fa-star"></i> ${item.rating}</span><span>${escapeHtml(item.prepTime)}</span></div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description)}</p><div class="dish-footer"><span>${currency(item.price)}</span><button class="add-to-cart" data-id="${escapeHtml(item.id)}">Add <i class="fa-solid fa-plus"></i></button></div></div></article>`).join('');
}

async function loadMenu() {
  menuRequest?.abort();
  menuRequest = new AbortController();
  const params = new URLSearchParams({ limit: '100' });
  const query = menuSearch.value.trim();
  if (query) params.set('search', query);
  if (activeFilter !== 'all') params.set('category', activeFilter);
  dishContainer.setAttribute('aria-busy', 'true');
  dishContainer.innerHTML = '<p class="menu-state">Loading today\'s menu…</p>';
  searchStatus.textContent = '';
  try {
    const payload = await request(`/api/menu?${params}`, { signal: menuRequest.signal });
    menu = payload.data;
    renderMenu(menu);
    searchStatus.textContent = query ? `${menu.length} result${menu.length === 1 ? '' : 's'} found for “${query}”` : `${menu.length} dishes available today`;
  } catch (error) {
    if (error.name !== 'AbortError') {
      dishContainer.innerHTML = '<p class="menu-state menu-error">We could not load the menu. Please refresh and try again.</p>';
      searchStatus.textContent = error.message;
    }
  } finally {
    dishContainer.removeAttribute('aria-busy');
  }
}

function toggleCart(open) { cartPanel.classList.toggle('open', open); overlay.classList.toggle('show', open); }
document.querySelector('.cart-toggle').addEventListener('click', () => toggleCart(true));
document.querySelector('.close-cart').addEventListener('click', () => toggleCart(false));
overlay.addEventListener('click', () => toggleCart(false));
dishContainer.addEventListener('click', (event) => {
  const button = event.target.closest('.add-to-cart');
  if (!button) return;
  const product = menu.find((item) => item.id === button.dataset.id);
  if (!product) return;
  const item = cart.find((entry) => entry.id === product.id);
  if (item) item.quantity += 1; else cart.push({ ...product, quantity: 1 });
  updateCart(); toggleCart(true);
});
cartItems.addEventListener('click', (event) => {
  const button = event.target.closest('button'); if (!button) return;
  const index = Number(button.dataset.index);
  if (button.classList.contains('remove-item')) cart.splice(index, 1);
  if (button.dataset.change && cart[index]) { cart[index].quantity += Number(button.dataset.change); if (cart[index].quantity < 1) cart.splice(index, 1); }
  updateCart();
});
menuSearch.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(loadMenu, 300); });
document.querySelector('.nav-search').addEventListener('submit', (event) => { event.preventDefault(); document.querySelector('#menu').scrollIntoView({ behavior: 'smooth' }); loadMenu(); });
document.querySelectorAll('.filter').forEach((button) => button.addEventListener('click', () => { document.querySelectorAll('.filter').forEach((filter) => filter.classList.remove('active')); button.classList.add('active'); activeFilter = button.dataset.filter; loadMenu(); }));
const menuToggle = document.querySelector('.menu-toggle');
menuToggle.addEventListener('click', () => { const open = document.querySelector('.nav-links').classList.toggle('open'); menuToggle.setAttribute('aria-expanded', open); });
document.querySelectorAll('.nav-links a').forEach((link) => link.addEventListener('click', () => { document.querySelectorAll('.nav-links a').forEach((navLink) => navLink.classList.remove('active')); link.classList.add('active'); document.querySelector('.nav-links').classList.remove('open'); }));
const modal = document.querySelector('.login-modal');
document.querySelector('.login-btn').addEventListener('click', () => modal.classList.add('show'));
document.querySelector('.close-modal').addEventListener('click', () => modal.classList.remove('show'));
document.querySelector('.login-form').addEventListener('submit', (event) => { event.preventDefault(); event.currentTarget.querySelector('.form-message').textContent = 'Account sign-in will be added in a future security milestone.'; });
document.querySelector('.contact-form').addEventListener('submit', async (event) => {
  event.preventDefault(); const form = event.currentTarget; const message = form.querySelector('.form-message'); const button = form.querySelector('button');
  setButtonLoading(button, true, 'Sending…'); message.textContent = '';
  try { const payload = await request('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.elements[0].value, email: form.elements[1].value, message: form.elements[2].value }) }); form.reset(); message.textContent = payload.message; } catch (error) { message.textContent = error.message; } finally { setButtonLoading(button, false); }
});
checkoutButton.addEventListener('click', async () => {
  if (!cart.length) return;
  const customerName = window.prompt('Name for this order?'); const customerEmail = window.prompt('Email for order updates?');
  if (customerName === null || customerEmail === null) return;
  setButtonLoading(checkoutButton, true, 'Placing order…');
  try { const payload = await request('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerName, customerEmail, items: cart.map(({ id, quantity }) => ({ id, quantity })) }) }); alert(`Order ${payload.data.id} confirmed. Total: ${currency(payload.data.total)}`); cart.splice(0); updateCart(); toggleCart(false); } catch (error) { alert(error.message); } finally { setButtonLoading(checkoutButton, false); updateCart(); }
});
document.querySelector('.year').textContent = new Date().getFullYear();
updateCart();
loadMenu();
