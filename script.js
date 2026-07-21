const cart = [];
const cartPanel = document.querySelector('.cart-panel');
const overlay = document.querySelector('.overlay');
const cartItems = document.querySelector('.cart-items');
const menuSearch = document.querySelector('#menu-search');
const searchStatus = document.querySelector('.search-status');
let activeFilter = 'all';

function updateCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.querySelector('.cart-count').textContent = count;
  document.querySelector('.cart-total').textContent = `Rs. ${total}`;
  cartItems.innerHTML = cart.length ? cart.map((item, index) => `<div class="cart-item"><div><h3>${item.name}</h3><p>Rs. ${item.price * item.quantity}</p><button class="remove-item" data-index="${index}">Remove</button></div><div class="quantity"><button data-index="${index}" data-change="-1">-</button><span>${item.quantity}</span><button data-index="${index}" data-change="1">+</button></div></div>`).join('') : '<p class="empty-cart">Your cart is empty.</p>';
}

function toggleCart(open) { cartPanel.classList.toggle('open', open); overlay.classList.toggle('show', open); }
document.querySelector('.cart-toggle').addEventListener('click', () => toggleCart(true));
document.querySelector('.close-cart').addEventListener('click', () => toggleCart(false));
overlay.addEventListener('click', () => toggleCart(false));
document.querySelectorAll('.add-to-cart').forEach(button => button.addEventListener('click', () => {
  const item = cart.find(entry => entry.name === button.dataset.name);
  if (item) item.quantity += 1; else cart.push({ name: button.dataset.name, price: Number(button.dataset.price), quantity: 1 });
  updateCart(); toggleCart(true);
}));
cartItems.addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button) return;
  const index = Number(button.dataset.index);
  if (button.classList.contains('remove-item')) cart.splice(index, 1);
  if (button.dataset.change) { cart[index].quantity += Number(button.dataset.change); if (cart[index].quantity < 1) cart.splice(index, 1); }
  updateCart();
});
function applyMenuFilters() {
  const query = menuSearch.value.trim().toLowerCase();
  let visibleCount = 0;

  document.querySelectorAll('.dish-card').forEach(card => {
    const name = card.querySelector('h3').textContent.toLowerCase();
    const description = card.querySelector('p').textContent.toLowerCase();
    const matchesCategory = activeFilter === 'all' || card.dataset.category === activeFilter;
    const matchesSearch = !query || name.includes(query) || description.includes(query) || card.dataset.category.includes(query);
    const shouldShow = matchesCategory && matchesSearch;
    card.classList.toggle('hide', !shouldShow);
    if (shouldShow) visibleCount += 1;
  });

  searchStatus.textContent = query ? `${visibleCount} result${visibleCount === 1 ? '' : 's'} found for "${menuSearch.value.trim()}"` : '';
}

menuSearch.addEventListener('input', applyMenuFilters);
document.querySelector('.nav-search').addEventListener('submit', event => {
  event.preventDefault();
  document.querySelector('#menu').scrollIntoView({ behavior: 'smooth' });
});

document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(filter => filter.classList.remove('active'));
  button.classList.add('active');
  activeFilter = button.dataset.filter;
  applyMenuFilters();
}));
const menuToggle = document.querySelector('.menu-toggle');
menuToggle.addEventListener('click', () => { const open = document.querySelector('.nav-links').classList.toggle('open'); menuToggle.setAttribute('aria-expanded', open); });
document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => {
  document.querySelectorAll('.nav-links a').forEach(navLink => navLink.classList.remove('active'));
  link.classList.add('active');
  document.querySelector('.nav-links').classList.remove('open');
}));
const modal = document.querySelector('.login-modal');
document.querySelector('.login-btn').addEventListener('click', () => modal.classList.add('show'));
document.querySelector('.close-modal').addEventListener('click', () => modal.classList.remove('show'));
document.querySelector('.login-form').addEventListener('submit', event => { event.preventDefault(); event.currentTarget.querySelector('.form-message').textContent = 'Login submitted successfully.'; });
document.querySelector('.contact-form').addEventListener('submit', event => { event.preventDefault(); event.currentTarget.reset(); event.currentTarget.querySelector('.form-message').textContent = 'Thanks. Your message has been sent.'; });
document.querySelector('.checkout-btn').addEventListener('click', () => { if (!cart.length) return; alert('Your order has been placed. Thank you for choosing TastyBite!'); cart.splice(0); updateCart(); toggleCart(false); });
document.querySelector('.year').textContent = new Date().getFullYear();
