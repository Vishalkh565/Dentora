// ==================== LOADER ====================
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
  }, 1200);
});

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

// ==================== 3D TOOTH (Three.js) ====================
function init3D() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const geometry = new THREE.IcosahedronGeometry(1.6, 16);
  const positionAttribute = geometry.attributes.position;
  const vertex = new THREE.Vector3();
  const vData = [];
  for (let i = 0; i < positionAttribute.count; i++) {
    vertex.fromBufferAttribute(positionAttribute, i);
    vData.push(vertex.clone());
  }

  const material = new THREE.MeshPhysicalMaterial({
    color: 0x8B6F4E,
    metalness: 0.6,
    roughness: 0.1,
    transparent: true,
    opacity: 0.9,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    emissive: 0x3D2E1E,
    emissiveIntensity: 0.2,
    reflectivity: 1,
    transmission: 0.2
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  
  const wireGeo = new THREE.IcosahedronGeometry(2.0, 1);
  const wireMat = new THREE.MeshBasicMaterial({ color: 0xC4A87C, wireframe: true, transparent: true, opacity: 0.15 });
  const wireMesh = new THREE.Mesh(wireGeo, wireMat);
  scene.add(wireMesh);

  const sphereGroup = new THREE.Group();
  for (let i = 0; i < 60; i++) {
    const sg = new THREE.SphereGeometry(0.03, 8, 8);
    const sm = new THREE.MeshBasicMaterial({ color: 0xC4A87C, transparent: true, opacity: 0.3 });
    const sphere = new THREE.Mesh(sg, sm);
    sphere.position.set((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4);
    sphere.userData = { speed: 0.002 + Math.random() * 0.005, offset: Math.random() * Math.PI * 2 };
    sphereGroup.add(sphere);
  }
  scene.add(sphereGroup);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xC4A87C, 2, 20);
  pointLight.position.set(3, 3, 5);
  scene.add(pointLight);
  const pointLight2 = new THREE.PointLight(0xA68B6B, 1.5, 20);
  pointLight2.position.set(-3, -2, 3);
  scene.add(pointLight2);

  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    const k = 1.2;
    for (let i = 0; i < positionAttribute.count; i++) {
        const v = vData[i];
        vertex.copy(v);
        const noise = Math.sin(v.x * k + time) * Math.cos(v.y * k + time) * Math.sin(v.z * k + time);
        vertex.add(v.clone().normalize().multiplyScalar(noise * 0.4));
        positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    positionAttribute.needsUpdate = true;
    geometry.computeVertexNormals();

    mesh.rotation.y += 0.002;
    mesh.rotation.x += (mouseY * 0.3 - mesh.rotation.x) * 0.02;
    mesh.rotation.y += (mouseX * 0.3 - mesh.rotation.y) * 0.02;
    
    wireMesh.rotation.y -= 0.001;
    wireMesh.rotation.x += 0.001;
    wireMesh.position.y = Math.sin(time * 0.5) * 0.15;
    mesh.position.y = wireMesh.position.y;

    sphereGroup.children.forEach(s => {
      s.position.y += Math.sin(time + s.userData.offset) * s.userData.speed;
      s.position.x += Math.cos(time * 0.5 + s.userData.offset) * s.userData.speed * 0.5;
    });

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
