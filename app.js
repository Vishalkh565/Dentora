// ==================== LOADER ====================
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
  }, 1200);
});

// ==================== CONFIGURATION ====================
// Injected via Vite environment variables
const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || 'dentoraclinic.myshopify.com';
const SHOPIFY_TOKEN = import.meta.env.VITE_SHOPIFY_PUBLIC_ACCESS_TOKEN || 'f41ed97311b7ca020be1dac2dc6a8bf9';

// ==================== SHOPIFY STOREFRONT API ====================
const STOREFRONT_API_URL = `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`;

const PRODUCTS_QUERY = `{
  products(first: 20) {
    edges {
      node {
        id
        title
        handle
        description
        availableForSale
        variants(first: 1) {
          edges {
            node {
              id
              price { amount currencyCode }
              compareAtPrice { amount currencyCode }
            }
          }
        }
        images(first: 1) {
          edges {
            node { url altText }
          }
        }
      }
    }
  }
}`;

// Badge assignment for visual variety
const BADGE_MAP = {
  'prowhite-whitening-kit': 'Bestseller',
  'sonicpro-electric-brush': 'New',
  'water-flosser-oral-irrigator': 'Bestseller',
  'premium-remineralizing-toothpaste': 'New',
};

// Fallback prices for products with incorrect Shopify data
const PRICE_FALLBACK = {
  'water-flosser-oral-irrigator': { price: '4900.00', compareAtPrice: null, minExpected: 1000 },
};

async function loadShopifyProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  try {
    const response = await fetch(STOREFRONT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN,
      },
      body: JSON.stringify({ query: PRODUCTS_QUERY }),
    });

    const json = await response.json();
    const products = json.data?.products?.edges?.map(e => e.node) || [];

    if (products.length === 0) {
      grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);grid-column:1/-1;">No products available at the moment.</p>';
      return;
    }

    // Clear loading state
    grid.innerHTML = '';

    products.forEach((product, index) => {
      const variant = product.variants.edges[0]?.node;
      const image = product.images.edges[0]?.node;
      const fallback = PRICE_FALLBACK[product.handle];
      
      // Use fallback price if Shopify returns incorrect data
      let priceAmount = parseFloat(variant?.price?.amount || 0);
      let compareAmount = parseFloat(variant?.compareAtPrice?.amount || 0);
      
      if (fallback && (priceAmount === 0 || (fallback.minExpected && priceAmount < fallback.minExpected))) {
        priceAmount = parseFloat(fallback.price);
        compareAmount = fallback.compareAtPrice ? parseFloat(fallback.compareAtPrice) : 0;
      }
      
      const badge = BADGE_MAP[product.handle] || '';

      const card = document.createElement('div');
      card.className = 'product-card cinematic reveal';
      card.style.transitionDelay = `${(index % 4) * 0.15}s`;

      const formattedPrice = priceAmount > 0 ? `₹${priceAmount.toLocaleString('en-IN')}` : '';
      const formattedCompare = compareAmount > 0 
        ? `₹${compareAmount.toLocaleString('en-IN')}` 
        : '';

      card.innerHTML = `
        ${badge ? `<div class="product-badge">${badge}</div>` : ''}
        <div class="product-img">
          ${image ? `<img src="${image.url}" alt="${image.altText || product.title}" loading="lazy">` : ''}
        </div>
        <div class="product-info">
          <div class="brand">DENTORA</div>
          <h3>${product.title}</h3>
          <p>${product.description || ''}</p>
          <div class="product-bottom">
            <div class="product-price">
              ${formattedPrice}
              ${formattedCompare ? `<span class="old">${formattedCompare}</span>` : ''}
            </div>
            <button class="btn-cart" data-variant-id="${variant?.id || ''}" onclick="addToCart(this)">Add to Cart</button>
          </div>
        </div>
      `;

      grid.appendChild(card);
    });

    // Re-observe new elements for scroll reveal
    const newRevealElements = grid.querySelectorAll('.reveal');
    newRevealElements.forEach(el => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, idx) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), idx * 100);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
      observer.observe(el);
    });

  } catch (error) {
    console.error('Failed to load products:', error);
    grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);grid-column:1/-1;">Unable to load products. Please try again later.</p>';
  }
}

// ==================== ADD TO CART (Storefront API) ====================
// Simple cart stored in localStorage as fallback
let shopifyCartId = localStorage.getItem('dentora_shopify_cart_id') || null;

async function addToCart(button) {
  const variantId = button.getAttribute('data-variant-id');
  if (!variantId) {
    showToast('Unable to add — product not available.');
    return;
  }

  button.textContent = 'Adding...';
  button.disabled = true;

  try {
    if (!shopifyCartId) {
      // Create a new cart
      const createRes = await fetch(STOREFRONT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN,
        },
        body: JSON.stringify({
          query: `mutation cartCreate($input: CartInput!) {
            cartCreate(input: $input) {
              cart { id checkoutUrl totalQuantity }
              userErrors { field message }
            }
          }`,
          variables: {
            input: {
              lines: [{ merchandiseId: variantId, quantity: 1 }]
            }
          }
        }),
      });
      const createJson = await createRes.json();
      const cart = createJson.data?.cartCreate?.cart;
      if (cart) {
        shopifyCartId = cart.id;
        localStorage.setItem('dentora_shopify_cart_id', shopifyCartId);
        localStorage.setItem('dentora_checkout_url', cart.checkoutUrl);
        updateCartCount(cart.totalQuantity);
        showToast('Added to cart! 🛒');
      }
    } else {
      // Add to existing cart
      const addRes = await fetch(STOREFRONT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN,
        },
        body: JSON.stringify({
          query: `mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
            cartLinesAdd(cartId: $cartId, lines: $lines) {
              cart { id checkoutUrl totalQuantity }
              userErrors { field message }
            }
          }`,
          variables: {
            cartId: shopifyCartId,
            lines: [{ merchandiseId: variantId, quantity: 1 }]
          }
        }),
      });
      const addJson = await addRes.json();
      const cart = addJson.data?.cartLinesAdd?.cart;
      if (cart) {
        localStorage.setItem('dentora_checkout_url', cart.checkoutUrl);
        updateCartCount(cart.totalQuantity);
        showToast('Added to cart! 🛒');
      } else {
        // Cart may have expired, reset and retry
        shopifyCartId = null;
        localStorage.removeItem('dentora_shopify_cart_id');
        addToCart(button);
        return;
      }
    }
  } catch (err) {
    console.error('Add to cart error:', err);
    showToast('Failed to add. Please try again.');
  }

  button.textContent = 'Add to Cart';
  button.disabled = false;
}

function updateCartCount(qty) {
  const cartCountEl = document.getElementById('cart-count');
  if (cartCountEl) {
    cartCountEl.textContent = qty;
    cartCountEl.classList.add('pulse');
    setTimeout(() => cartCountEl.classList.remove('pulse'), 500);
  }
}

// Load products on page ready
loadShopifyProducts();
// Expose addToCart globally for inline onclick handlers
window.addToCart = addToCart;

// ==================== CUSTOM MODAL CART ====================
window.openCart = async function() {
  const modal = document.getElementById('main-cart');
  const cartContent = document.getElementById('cart-content');
  if (modal) modal.showModal();

  if (!shopifyCartId) {
    if (cartContent) cartContent.innerHTML = `<div class="empty-state">🦷 Your cart is empty</div>`;
    return;
  }

  if (cartContent) cartContent.innerHTML = `<div style="text-align:center; padding: 40px 0;"><h3 style="color:var(--accent);">Loading Cart...</h3></div>`;

  try {
    const res = await fetch(STOREFRONT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN,
      },
      body: JSON.stringify({
        query: `query { 
          cart(id: "${shopifyCartId}") { 
            checkoutUrl 
            cost { totalAmount { amount currencyCode } }
            lines(first: 10) { 
              edges { node { 
                quantity 
                merchandise { ... on ProductVariant { title product { title } image { url } price { amount currencyCode } } } 
              } }
            }
          } 
        }`
      }),
    });
    const json = await res.json();
    const cart = json.data?.cart;

    if (!cart || !cart.lines.edges.length) {
      cartContent.innerHTML = `<div class="empty-state">🦷 Your cart is empty</div>`;
      return;
    }

    let html = '';
    cart.lines.edges.forEach(edge => {
       const line = edge.node;
       const p = line.merchandise.product;
       const img = line.merchandise.image?.url;
       html += `
         <div class="cart-line">
           ${img ? `<img src="${img}" alt="${p.title}">` : '<div class="no-img" style="width:70px;height:70px;background:#333;"></div>'}
           <div class="cart-line-info">
             <h4>${p.title}</h4>
             <span class="qty">Qty: ${line.quantity}</span>
           </div>
           <div class="cart-line-price">₹${parseFloat(line.merchandise.price.amount).toLocaleString('en-IN')}</div>
         </div>
       `;
    });
    
    html += `
      <div class="cart-total">
        <span>Total</span>
        <span>₹${parseFloat(cart.cost.totalAmount.amount).toLocaleString('en-IN')}</span>
      </div>
      <a href="${cart.checkoutUrl}" target="_blank" class="cart-checkout-btn">Proceed to Checkout</a>
    `;
    cartContent.innerHTML = html;
  } catch(e) {
    if (cartContent) cartContent.innerHTML = `<div class="empty-state">Unable to load cart.</div>`;
  }
}

// ==================== CUSTOM CURSOR ====================
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
if (cursorDot && cursorRing) {
  document.addEventListener('mousemove', (e) => {
    cursorDot.style.left = e.clientX - 4 + 'px';
    cursorDot.style.top = e.clientY - 4 + 'px';
    cursorRing.style.left = e.clientX - 17.5 + 'px';
    cursorRing.style.top = e.clientY - 17.5 + 'px';
  });
  document.querySelectorAll('a, button, .service-card, .product-card, .doctor-card').forEach(el => {
    el.addEventListener('mouseenter', () => { 
      cursorRing.style.width = '50px'; 
      cursorRing.style.height = '50px'; 
      cursorRing.style.left = (parseFloat(cursorRing.style.left) || 0) - 7.5 + 'px'; 
    });
    el.addEventListener('mouseleave', () => { 
      cursorRing.style.width = '35px'; 
      cursorRing.style.height = '35px'; 
    });
  });
}

// ==================== NAVIGATION ====================
const nav = document.querySelector('nav');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = menuToggle.querySelectorAll('span');
    if (navLinks.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
    } else {
      spans.forEach(s => { s.style.transform = 'none'; s.style.opacity = '1'; });
    }
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.querySelectorAll('span').forEach(s => { s.style.transform = 'none'; s.style.opacity = '1'; });
    });
  });
}

// ==================== SHOPIFY CART SYNC ====================
const cartCountEl = document.getElementById('cart-count');
const mainCart = document.getElementById('main-cart');

if (mainCart && cartCountEl) {
  mainCart.addEventListener('shopify:cart:change', (event) => {
    const totalQty = event.detail.cart?.totalQuantity || 0;
    cartCountEl.textContent = totalQty;
    
    // Pulse animation on update
    cartCountEl.classList.add('pulse');
    setTimeout(() => cartCountEl.classList.remove('pulse'), 500);
  });
}

// ==================== SCROLL REVEAL ====================
const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), index * 100);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
revealElements.forEach(el => revealObserver.observe(el));

// ==================== COUNTER ANIMATION ====================
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  let current = 0;
  const increment = target / 60;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) { 
      current = target; 
      clearInterval(timer); 
    }
    el.textContent = Math.floor(current) + suffix;
  }, 25);
}
const counters = document.querySelectorAll('[data-target]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { 
      animateCounter(entry.target); 
      counterObserver.unobserve(entry.target); 
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => counterObserver.observe(c));

// ==================== TESTIMONIALS ====================
let currentTestimonial = 0;
const testimonials = document.querySelectorAll('.testimonial-card');
const tDots = document.querySelectorAll('.testimonial-nav button');

function showTestimonial(idx) {
  if (testimonials.length === 0) return;
  testimonials.forEach(t => t.classList.remove('active'));
  tDots.forEach(d => d.classList.remove('active'));
  testimonials[idx].classList.add('active');
  if (tDots[idx]) tDots[idx].classList.add('active');
  currentTestimonial = idx;
}

if (tDots.length > 0) {
  tDots.forEach((dot, i) => dot.addEventListener('click', () => showTestimonial(i)));
  setInterval(() => showTestimonial((currentTestimonial + 1) % testimonials.length), 5000);
}

// ==================== TOAST ====================
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ==================== INTERACTIVE BOOKING SYSTEM ====================
const BOOKING_KEY = 'dentora_bookings';
let bookings = JSON.parse(localStorage.getItem(BOOKING_KEY) || '[]');

function initBooking() {
  const slots = document.querySelectorAll('.time-slot');
  if (slots.length === 0) return;

  // Render initial states
  renderSlots();

  slots.forEach(slot => {
    slot.addEventListener('click', () => {
      if (slot.classList.contains('booked')) {
        showToast('This slot is already booked.');
        return;
      }
      slots.forEach(s => s.classList.remove('selected'));
      slot.classList.add('selected');
    });
  });

  const form = document.getElementById('appointment-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const selectedSlot = document.querySelector('.time-slot.selected');
      
      // Strict re-verification
      if (!selectedSlot) {
        showToast('Please select a time slot.');
        return;
      }
      if (selectedSlot.classList.contains('booked')) {
        showToast('This slot is already booked for the selected date.');
        return;
      }

      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      
      if (!data.date) {
        showToast('Please select a date.');
        return;
      }

      // Save booking
      const newBooking = {
        time: selectedSlot.textContent,
        date: data.date,
        name: data.name
      };
      bookings.push(newBooking);
      localStorage.setItem(BOOKING_KEY, JSON.stringify(bookings));

      // Show success
      document.querySelector('.success-overlay').classList.add('show');
      renderSlots();
      form.reset();
    });
  }
}

function renderSlots() {
  const slots = document.querySelectorAll('.time-slot');
  const currentDate = document.getElementById('appointment-date')?.value;
  
  slots.forEach(slot => {
    const isBooked = bookings.some(b => b.time === slot.textContent && b.date === currentDate);
    slot.classList.toggle('booked', isBooked);
    slot.classList.remove('selected');
  });
}

// Re-render when date changes
const dateInput = document.getElementById('date');
if (dateInput) {
  dateInput.addEventListener('change', renderSlots);
}
initBooking();

const successClose = document.getElementById('success-close');
if (successClose) {
  successClose.addEventListener('click', () => {
    document.querySelector('.success-overlay').classList.remove('show');
  });
}

// ==================== SMOOTH SCROLL ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ==================== PARTICLES ====================
function createParticles() {
  const container = document.querySelector('.particles');
  if (!container) return;
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (8 + Math.random() * 15) + 's';
    p.style.animationDelay = Math.random() * 10 + 's';
    p.style.width = (2 + Math.random() * 3) + 'px';
    p.style.height = p.style.width;
    container.appendChild(p);
  }
}
createParticles();

// ==================== SERVICES FAN LAYOUT ====================
function initFan() {
  const cards = document.querySelectorAll('.services-fan .service-card');
  if (cards.length === 0) return;
  const count = cards.length;
  const middle = (count - 1) / 2;
  
  if (window.innerWidth > 768) {
    cards.forEach((card, i) => {
      const offset = i - middle;
      const rotation = offset * 8; 
      const yOffset = Math.abs(offset) * 20;
      const xOffset = offset * 120;
      
      const baseTransform = `translateX(${xOffset}px) translateY(${yOffset}px) rotate(${rotation}deg)`;
      card.style.transform = baseTransform;
      card.style.zIndex = 100 - Math.abs(Math.floor(offset));
      card.dataset.baseTransform = baseTransform;
      card.dataset.zIndex = card.style.zIndex;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width/2;
        const y = e.clientY - rect.top - rect.height/2;
        const rotateX = -(y / rect.height) * 30; 
        const rotateY = (x / rect.width) * 30;
        
        card.style.transform = `translateX(${xOffset}px) translateY(${yOffset - 60}px) rotate(0deg) scale(1.15) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        card.style.zIndex = 200;
        card.style.boxShadow = '0 30px 60px rgba(0,0,0,0.4)';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = card.dataset.baseTransform;
        card.style.zIndex = card.dataset.zIndex;
        card.style.boxShadow = '';
      });
    });
  } else {
    cards.forEach(card => card.style.transform = 'none');
  }
}
window.addEventListener('load', initFan);
window.addEventListener('resize', initFan);

// ==================== 3D TOOTH & HOLDER (Three.js) ====================
function init3D() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const modelGroup = new THREE.Group();
  scene.add(modelGroup);

  // --- MATERIALS ---
  const porcelainMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.1,
    metalness: 0.0,
    clearcoat: 1.0,
    reflectivity: 1.0,
    transmission: 0, // Opaque Porcelain
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 1.0,
    roughness: 0.02
  });

  // --- 1. THE TOOTH (High Fidelity) ---
  const toothGroup = new THREE.Group();
  
  const crownGeo = new THREE.SphereGeometry(1.1, 32, 24);
  const crown = new THREE.Mesh(crownGeo, porcelainMat);
  crown.scale.set(1, 1.15, 0.95);
  toothGroup.add(crown);

  const rootGeo = new THREE.CylinderGeometry(0.4, 0.1, 1.3, 16);
  const root1 = new THREE.Mesh(rootGeo, porcelainMat);
  root1.position.set(0.35, -1.1, 0);
  root1.rotation.z = 0.25;
  toothGroup.add(root1);

  const root2 = new THREE.Mesh(rootGeo, porcelainMat);
  root2.position.set(-0.35, -1.1, 0);
  root2.rotation.z = -0.25;
  toothGroup.add(root2);

  modelGroup.add(toothGroup);

  // --- 2. THE CHROME CRADLE (Image 2 Replica) ---
  const cradleGroup = new THREE.Group();
  
  // Majestic outer arch
  const outerGeo = new THREE.TorusGeometry(3.2, 0.45, 32, 100, Math.PI * 1.25);
  const outer = new THREE.Mesh(outerGeo, chromeMat);
  outer.rotation.x = Math.PI / 1.7;
  outer.rotation.y = 0.2;
  cradleGroup.add(outer);

  // Structural inner arch (the dual bar look)
  const innerGeo = new THREE.TorusGeometry(2.3, 0.3, 32, 100, Math.PI * 1.35);
  const inner = new THREE.Mesh(innerGeo, chromeMat);
  inner.rotation.x = Math.PI / 1.5;
  inner.rotation.y = 0.1;
  inner.position.y = -0.5;
  inner.position.z = 0.5;
  cradleGroup.add(inner);
  
  cradleGroup.position.set(0, 0.8, -1.0);
  modelGroup.add(cradleGroup);

  // --- 3. DENTAL INSTRUMENTS (Crossing in Front) ---
  const handleGeo = new THREE.CylinderGeometry(0.08, 0.1, 8.5, 12);
  
  // Professional Mirror
  const mirrorGroup = new THREE.Group();
  const mirrorHandle = new THREE.Mesh(handleGeo, chromeMat);
  mirrorGroup.add(mirrorHandle);

  const headGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.08, 32);
  const head = new THREE.Mesh(headGeo, chromeMat);
  head.position.y = 4.3;
  head.rotation.x = Math.PI / 3;
  mirrorGroup.add(head);
  
  // Position passing from back-left across the front
  mirrorGroup.position.set(0.5, 0.5, 2.5);
  mirrorGroup.rotation.z = -Math.PI / 3.5;
  mirrorGroup.rotation.x = -Math.PI / 8;
  modelGroup.add(mirrorGroup);

  // Dental Probe (Sickle Scaler)
  const probeGroup = new THREE.Group();
  const probeHandle = new THREE.Mesh(handleGeo, chromeMat);
  probeGroup.add(probeHandle);
  
  const hookGeo = new THREE.TorusGeometry(0.35, 0.06, 8, 24, Math.PI * 1.5);
  const hook = new THREE.Mesh(hookGeo, chromeMat);
  hook.position.y = 4.3;
  hook.position.x = -0.2;
  hook.rotation.z = Math.PI / 1.2;
  probeGroup.add(hook);

  // Position passing from back-right crossing behind mirror
  probeGroup.position.set(-1.0, 0.8, 1.5);
  probeGroup.rotation.z = Math.PI / 4.5;
  probeGroup.rotation.x = 0;
  modelGroup.add(probeGroup);

  // --- LIGHTING ---
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  
  const light1 = new THREE.DirectionalLight(0xffffff, 1.8);
  light1.position.set(5, 15, 10);
  scene.add(light1);

  const light2 = new THREE.PointLight(0x00f2ff, 1.0);
  light2.position.set(-8, -5, 5);
  scene.add(light2);

  // --- ANIMATION ---
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    modelGroup.position.y = Math.sin(time * 0.8) * 0.1;
    
    const scale = 1 + Math.sin(time * 1.5) * 0.01;
    toothGroup.scale.set(scale, scale, scale);

    modelGroup.rotation.y += 0.002;
    modelGroup.rotation.x += (mouseY * 0.12 - modelGroup.rotation.x) * 0.05;
    modelGroup.rotation.y += (mouseX * 0.12 - modelGroup.rotation.y) * 0.05;
    
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  });
}

if (typeof THREE !== 'undefined') {
  init3D();
}
