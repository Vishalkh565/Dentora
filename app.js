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

// Shopify initialization removed: Handled synchronously in index.html for maximum reliability

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
  // Thick, wide architectural U-shape
  const cradleGeo = new THREE.TorusGeometry(2.1, 0.5, 24, 100, Math.PI); 
  const cradle = new THREE.Mesh(cradleGeo, chromeMat);
  cradle.scale.set(1.5, 0.8, 1);
  cradle.rotation.x = Math.PI / 2.1;
  cradle.position.y = -0.3;
  modelGroup.add(cradle);

  // --- 3. DENTAL INSTRUMENTS (Professional Crossing) ---
  const mirrorGroup = new THREE.Group();
  const handleGeo = new THREE.CylinderGeometry(0.08, 0.08, 5.5, 12);
  const handle = new THREE.Mesh(handleGeo, chromeMat);
  mirrorGroup.add(handle);

  const headGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.08, 32);
  const head = new THREE.Mesh(headGeo, chromeMat);
  head.position.y = 2.7;
  head.rotation.x = Math.PI / 3.5;
  mirrorGroup.add(head);
  
  mirrorGroup.position.set(2.4, 1.2, -1);
  mirrorGroup.rotation.z = -Math.PI / 3.5;
  modelGroup.add(mirrorGroup);

  const probeGroup = new THREE.Group();
  const probeHandle = new THREE.Mesh(handleGeo, chromeMat);
  probeGroup.add(probeHandle);
  
  const hookGeo = new THREE.TorusGeometry(0.35, 0.06, 8, 24, Math.PI);
  const hook = new THREE.Mesh(hookGeo, chromeMat);
  hook.position.y = 2.7;
  hook.rotation.z = Math.PI / 1.5;
  probeGroup.add(hook);

  probeGroup.position.set(-2.4, 1.2, -1);
  probeGroup.rotation.z = Math.PI / 3.5;
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
