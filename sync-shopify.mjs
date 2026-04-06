import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const domain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

const products = [
  {
    title: "ProWhite Whitening Kit",
    body_html: "Professional-grade LED whitening system for a brighter smile in just 14 days.",
    vendor: "DENTORA",
    product_type: "Whitening",
    variants: [{ price: "2499.00", compare_at_price: "4999.00" }],
    image_file: "final_whitening.jpg",
    handle: "prowhite-whitening-kit"
  },
  {
    title: "SonicPro Electric Brush",
    body_html: "40,000 vibrations/min, smart pressure sensor, 4 brush modes, USB-C charging.",
    vendor: "DENTORA",
    product_type: "Oral Hygiene",
    variants: [{ price: "6999.00", compare_at_price: "9999.00" }],
    image_file: "final_brush.png",
    handle: "sonicpro-electric-brush"
  },
  {
    title: "FreshGuard Treatment",
    body_html: "Advanced formula with premium ingredients for all-day protection and mint freshness.",
    vendor: "DENTORA",
    product_type: "Mouthwash",
    variants: [{ price: "699.00", compare_at_price: "999.00" }],
    image_file: "final_mouthwash.jpg",
    handle: "freshguard-treatment"
  },
  {
    title: "Water Flosser (Oral Irrigator)",
    body_html: "A cordless device using a pulsating stream of water to clean deeply between teeth and below the gumline.",
    vendor: "DENTORA",
    product_type: "Oral Irrigator",
    variants: [{ price: "4900.00" }],
    image_file: "item1.jpg",
    handle: "water-flosser-irrigator"
  },
  {
    title: "Premium Remineralizing Toothpaste",
    body_html: "Formulated with nano-hydroxyapatite to actively rebuild enamel, protect against cavities, and soothe sensitivity.",
    vendor: "DENTORA",
    product_type: "Toothpaste",
    variants: [{ price: "650.00" }],
    image_file: "item2.jpg",
    handle: "premium-remineralizing-toothpaste"
  },
  {
    title: "Ergonomic Tongue Scraper",
    body_html: "A stainless steel tool used daily to gently sweep away bacteria, dead cells, and debris.",
    vendor: "DENTORA",
    product_type: "Tongue Care",
    variants: [{ price: "350.00" }],
    image_file: "item3.jpg",
    handle: "ergonomic-tongue-scraper"
  },
  {
    title: "Expanding Woven Dental Floss",
    body_html: "High-performance string floss coated with natural waxes that expands to grip and sweep away hidden plaque.",
    vendor: "DENTORA",
    product_type: "Floss",
    variants: [{ price: "250.00" }],
    image_file: "item4.jpg",
    handle: "expanding-woven-dental-floss"
  }
];

async function syncProducts() {
  for (const p of products) {
    console.log(`Syncing: ${p.title}...`);
    
    let imageData = null;
    try {
      const filePath = path.join(__dirname, p.image_file);
      if (fs.existsSync(filePath)) {
        imageData = fs.readFileSync(filePath).toString('base64');
      }
    } catch (err) {
      console.warn(`Could not read image ${p.image_file}`);
    }

    const payload = {
      product: {
        title: p.title,
        body_html: p.body_html,
        vendor: p.vendor,
        product_type: p.product_type,
        handle: p.handle,
        status: "active",
        variants: p.variants.map(v => ({
          ...v,
          inventory_management: null,
          requires_shipping: true
        }))
      }
    };

    if (imageData) {
      payload.product.images = [{ attachment: imageData, filename: p.image_file }];
    }

    try {
      const response = await fetch(`https://${domain}/admin/api/2024-01/products.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`Successfully created ${p.title} (ID: ${data.product.id})`);
      } else {
        console.error(`Failed to create ${p.title}:`, JSON.stringify(data.errors));
      }
    } catch (err) {
      console.error(`Error syncing ${p.title}:`, err.message);
    }
    
    await new Promise(r => setTimeout(r, 500));
  }
}

syncProducts();
