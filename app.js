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

function initShopify() {
  const container = document.getElementById('shopify-store-container');
  if (container) {
    // Create the store element dynamically
    const storeEl = document.createElement('shopify-store');
    storeEl.id = 'main-store';
    storeEl.setAttribute('store-domain', SHOPIFY_DOMAIN);
    storeEl.setAttribute('public-access-token', SHOPIFY_TOKEN);
    storeEl.setAttribute('country', 'IN');
    storeEl.setAttribute('language', 'en');
    
    // Append to DOM - this triggers connectedCallback with attributes already set
    container.appendChild(storeEl);
    console.log('[SHOPIFY] Dynamic Store Injected:', SHOPIFY_DOMAIN);
  }
}
initShopify();

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

// ==================== APPOINTMENT FORM ====================
const appointmentForm = document.getElementById('appointment-form');
const timeSlots = document.querySelectorAll('.time-slot.free');

if (timeSlots.length > 0) {
  timeSlots.forEach(slot => {
    slot.addEventListener('click', () => {
      timeSlots.forEach(s => s.classList.remove('selected'));
      slot.classList.add('selected');
    });
  });
}

if (appointmentForm) {
  appointmentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(appointmentForm);
    const data = Object.fromEntries(formData);
    const selectedSlot = document.querySelector('.time-slot.selected');

    if (!data.name || !data.email || !data.phone || !data.date || !data.service) {
      showToast('Please fill in all required fields');
      return;
    }

    if (!selectedSlot) {
      showToast('Please select an available time slot.');
      return;
    }

    // Show success overlay
    document.querySelector('.success-overlay').classList.add('show');
    appointmentForm.reset();
    timeSlots.forEach(s => s.classList.remove('selected'));
    
    // Log the trigger for potential backend integration
    console.log(`[BOOKING] Confirmed for ${data.name} on ${data.date} at ${selectedSlot.textContent}`);
  });
}

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

  // --- 1. THE TOOTH (Realistic Molar) ---
  const toothGroup = new THREE.Group();
  
  // Crown
  const crownGeo = new THREE.BoxGeometry(1.6, 1.4, 1.5, 2, 2, 2);
  const enamelMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.1,
    metalness: 0.0,
    clearcoat: 1.0,
    reflectivity: 1.0,
    transmission: 0.05
  });
  const crown = new THREE.Mesh(crownGeo, enamelMat);
  crown.scale.set(1.1, 1, 1.05);
  toothGroup.add(crown);

  // Roots (2 simplified roots)
  const rootGeo = new THREE.CylinderGeometry(0.35, 0.05, 0.8, 8);
  const root1 = new THREE.Mesh(rootGeo, enamelMat);
  root1.position.set(0.4, -0.9, 0);
  root1.rotation.z = 0.3;
  toothGroup.add(root1);
  
  const root2 = new THREE.Mesh(rootGeo, enamelMat);
  root2.position.set(-0.4, -0.9, 0);
  root2.rotation.z = -0.3;
  toothGroup.add(root2);

  toothGroup.position.y = 0.5;
  modelGroup.add(toothGroup);

  // --- 2. THE DENTAL MIRROR (Chrome Instrument) ---
  const mirrorGroup = new THREE.Group();
  
  // Mirror Disc
  const discGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.1, 32);
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 1.0,
    roughness: 0.02
  });
  const disc = new THREE.Mesh(discGeo, chromeMat);
  disc.rotation.x = Math.PI / 4;
  mirrorGroup.add(disc);

  // Handle
  const handleGeo = new THREE.CylinderGeometry(0.12, 0.12, 4, 16);
  const handle = new THREE.Mesh(handleGeo, chromeMat);
  handle.position.set(0, -2, -0.8);
  handle.rotation.x = Math.PI / 8;
  mirrorGroup.add(handle);

  mirrorGroup.position.y = -1.2;
  modelGroup.add(mirrorGroup);

  // --- 3. LIGHTING (Clinical Studio) ---
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
  mainLight.position.set(5, 10, 5);
  scene.add(mainLight);

  const rimLight = new THREE.PointLight(0x00f2ff, 1.0, 20); // Cyan rim highlight
  rimLight.position.set(-5, -3, 2);
  scene.add(rimLight);

  const topLight = new THREE.PointLight(0xffffff, 1.2, 20);
  topLight.position.set(0, 5, 0);
  scene.add(topLight);

  // --- 4. ANIMATION & INTERACTION ---
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    // Gentle float
    modelGroup.position.y = Math.sin(time * 0.8) * 0.1;
    
    // Smooth interaction rotation
    modelGroup.rotation.y += 0.005; // Constant slow spin
    modelGroup.rotation.x += (mouseY * 0.2 - modelGroup.rotation.x) * 0.05;
    modelGroup.rotation.y += (mouseX * 0.2 - modelGroup.rotation.y) * 0.05;
    
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
