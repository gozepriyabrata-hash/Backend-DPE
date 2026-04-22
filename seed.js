/**
 * PRISM Marketplace — Product Seed Script
 * Run: node src/seed.js
 * 
 * Loads all 10 product JSON files, assigns curated product images,
 * and seeds the MongoDB 'products' collection.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const Product = require('./src/models/Product');

const DATA_DIR = path.join(__dirname, '../../Data');

// ─── Curated Image Map ──────────────────────────────────────────────────────
// Maps product title -> [image URLs, thumbnail]
// Using Unsplash, official brand CDNs, and high-quality stock images
const IMAGE_MAP = {
  // ── SMARTPHONES ──
  'iPhone 13': {
    thumbnail: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800&q=80',
      'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&q=80',
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&q=80',
    ],
    description: 'Apple iPhone 13 with Super Retina XDR display, A15 Bionic chip, 12MP dual cameras, and all-day battery life. Available in stunning finishes.',
  },
  'iPhone 15': {
    thumbnail: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
      'https://images.unsplash.com/photo-1697027426584-fad3f490d7fe?w=800&q=80',
      'https://images.unsplash.com/photo-1592286927505-1def25115558?w=800&q=80',
    ],
    description: 'Apple iPhone 15 featuring a titanium design, 48MP main camera with 2x Telephoto, Dynamic Island, and the powerful A16 Bionic chip.',
  },
  'Samsung Galaxy S23': {
    thumbnail: 'https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=800&q=80',
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80',
      'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&q=80',
    ],
    description: 'Samsung Galaxy S23 with Snapdragon 8 Gen 2, 200MP ProVisual Engine, and a sleek compact design built for performance.',
  },
  'OnePlus 11': {
    thumbnail: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
      'https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&q=80',
    ],
    description: 'OnePlus 11 with Snapdragon 8 Gen 2, Hasselblad camera system, 100W SUPERVOOC fast charging, and a fluid 120Hz AMOLED display.',
  },
  'Google Pixel 7': {
    thumbnail: 'https://images.unsplash.com/photo-1667372283587-da5d7ceae8d4?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1667372283587-da5d7ceae8d4?w=800&q=80',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80',
    ],
    description: 'Google Pixel 7 powered by Google Tensor G2, with the best computational photography on any smartphone and 5 years of security updates.',
  },
  'Redmi Note 12 Pro': {
    thumbnail: 'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=800&q=80',
      'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80',
    ],
    description: 'Redmi Note 12 Pro features a 200MP camera, 67W HyperCharge, and Snapdragon chipset — all in a sleek premium design at an unbeatable price.',
  },

  // ── LAPTOPS ──
  'Apple MacBook Air M2': {
    thumbnail: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
    ],
    description: 'MacBook Air with M2 chip — an impossibly thin design with up to 18 hours battery, a Liquid Retina display, and silent fanless performance.',
  },
  'Dell XPS 13': {
    thumbnail: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
      'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800&q=80',
    ],
    description: 'Dell XPS 13 with 13th Gen Intel Core processors, an InfinityEdge display, and a compact chassis that redefines portable performance.',
  },
  'HP Pavilion 15': {
    thumbnail: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    ],
    description: 'HP Pavilion 15 is a versatile everyday laptop with AMD Ryzen processors, micro-edge display, and fast-charging battery for all-day productivity.',
  },
  'Lenovo IdeaPad Slim 3': {
    thumbnail: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80',
      'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
    ],
    description: 'Lenovo IdeaPad Slim 3 delivers everyday performance with AMD Ryzen, long battery life, and a lightweight chassis perfect for students.',
  },
  'Asus ROG Zephyrus G14': {
    thumbnail: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80',
      'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
    ],
    description: 'ASUS ROG Zephyrus G14 — the iconic gaming laptop with AMD Ryzen 9, NVIDIA RTX 4090, AniMe Matrix display, and a 14-inch QHD+ panel.',
  },
  'HP Victus Gaming Laptop': {
    thumbnail: 'https://images.unsplash.com/photo-1593642634367-d91a135587b5?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1593642634367-d91a135587b5?w=800&q=80',
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80',
    ],
    description: 'HP Victus Gaming Laptop with Intel Core i5/i7, NVIDIA RTX graphics, and a 144Hz FHD display — serious gaming at an accessible price.',
  },

  // ── TABLETS ──
  'Apple iPad 10th Gen': {
    thumbnail: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80',
      'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80',
    ],
    description: 'The all-new iPad 10th Generation with a USB-C connector, 10.9-inch Liquid Retina display, A14 Bionic, and an entirely redesigned look.',
  },
  'Samsung Galaxy Tab S9': {
    thumbnail: 'https://images.unsplash.com/photo-1589739900266-43b2843f4c12?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1589739900266-43b2843f4c12?w=800&q=80',
      'https://images.unsplash.com/photo-1628815113969-0487917e8b76?w=800&q=80',
    ],
    description: 'Samsung Galaxy Tab S9 with Dynamic AMOLED 2X display, Snapdragon 8 Gen 2, IP68 water resistance, and the included S Pen.',
  },
  'Lenovo Tab P12': {
    thumbnail: 'https://images.unsplash.com/photo-1520503518887-04430f0a55ae?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1520503518887-04430f0a55ae?w=800&q=80',
    ],
    description: 'Lenovo Tab P12 features a stunning 12.7-inch IPS display, Dolby Atmos quad speakers, MediaTek Dimensity, and a large 10,200mAh battery.',
  },
  'Xiaomi Pad 6': {
    thumbnail: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80',
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80',
    ],
    description: 'Xiaomi Pad 6 with Snapdragon 870, a 144Hz 11-inch display, 67W fast charging, and the Xiaomi Keyboard accessory for ultimate productivity.',
  },
  'Realme Pad X': {
    thumbnail: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1520503518887-04430f0a55ae?w=800&q=80',
    ],
    description: 'Realme Pad X with a 10.95-inch 2K display, Snapdragon 695 5G, quad speakers with Dolby Atmos, and 33W SUPERVOOC flash charge.',
  },
  'Apple iPad Air': {
    thumbnail: 'https://images.unsplash.com/photo-1587033411391-5d9e51cce126?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1587033411391-5d9e51cce126?w=800&q=80',
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80',
    ],
    description: 'iPad Air with the powerful M1 chip, 10.9-inch Liquid Retina display, USB-C, Center Stage camera, and 5G connectivity.',
  },

  // ── SMARTWATCHES ──
  'Apple Watch Series 9': {
    thumbnail: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    ],
    description: 'Apple Watch Series 9 with S9 chip, Double Tap gesture, Always-On Retina display, carbon neutral options, and advanced health sensors.',
  },
  'Samsung Galaxy Watch 6': {
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      'https://images.unsplash.com/photo-1508057198894-247b23fe5ffe?w=800&q=80',
    ],
    description: 'Samsung Galaxy Watch 6 with Advanced BioActive Sensor, sapphire crystal glass, 10ATM water resistance, and Google Wear OS.',
  },
  'Amazfit GTR 4': {
    thumbnail: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ffe?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1508057198894-247b23fe5ffe?w=800&q=80',
      'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&q=80',
    ],
    description: 'Amazfit GTR 4 with Dual-band GPS, 150+ sports modes, AMOLED display, 14-day battery life, and Zepp OS health intelligence.',
  },
  'Noise ColorFit Pro 4': {
    thumbnail: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800&q=80',
    ],
    description: 'Noise ColorFit Pro 4 with a 1.72-inch Always-On AMOLED display, Bluetooth calling, AI voice assistant, and 7-day battery life.',
  },
  'Fire-Boltt Ninja Call Pro': {
    thumbnail: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80',
    ],
    description: 'Fire-Boltt Ninja Call Pro with Bluetooth calling, 1.83-inch HD display, 100+ sports modes, IP67 water resistance, and 7-day battery.',
  },
  'Garmin Venu Sq': {
    thumbnail: 'https://images.unsplash.com/photo-1614870578491-1a21b3547380?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1614870578491-1a21b3547380?w=800&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    ],
    description: 'Garmin Venu Sq 2 with AMOLED display, advanced health monitoring, animated workouts, up to 11-day battery, and music storage.',
  },

  // ── TELEVISIONS ──
  'Samsung 55-inch QLED 4K Smart TV': {
    thumbnail: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&q=80',
      'https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=800&q=80',
    ],
    description: 'Samsung 55" QLED 4K Smart TV with Quantum HDR, Object Tracking Sound, Motion Xcelerator 120Hz, and Alexa/Google Assistant built-in.',
  },
  'LG 50-inch UHD 4K Smart TV': {
    thumbnail: 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&q=80',
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&q=80',
    ],
    description: 'LG 50" UHD 4K Smart TV with α5 AI Processor 4K, AI Picture Pro, Dolby Vision & Atmos, and ThinQ AI for smart home integration.',
  },
  'Sony Bravia 55-inch OLED TV': {
    thumbnail: 'https://images.unsplash.com/photo-1548921441-89c8bd86ffb7?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1548921441-89c8bd86ffb7?w=800&q=80',
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&q=80',
    ],
    description: 'Sony Bravia 55" OLED with Cognitive Processor XR, XR OLED Contrast Pro, Acoustic Surface Audio+, and built-in Google TV.',
  },
  'Mi 43-inch 4K Smart TV': {
    thumbnail: 'https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=800&q=80',
    ],
    description: 'Xiaomi Mi 4K Smart TV with Vivid Picture Engine, Dolby Vision+Atmos, PatchWall AI recommendations, and Android TV 11.',
  },
  'TCL 50-inch 4K Smart TV': {
    thumbnail: 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&q=80',
    ],
    description: 'TCL 50" 4K QLED Smart TV with QLED Quantum Dot, Dolby Vision & Atmos, Game Master, and Google TV for endless content.',
  },
  'OnePlus 55-inch Y Series 4K TV': {
    thumbnail: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&q=80',
    ],
    description: 'OnePlus 55" Y Series with 93% DCI-P3 wide color gamut, Gamma Engine, Oxygen Play 2.0 content discovery, and 30W built-in speakers.',
  },

  // ── HEADPHONES ──
  'Sony WH-1000XM5': {
    thumbnail: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
    ],
    description: 'Sony WH-1000XM5 — industry-leading noise cancellation with 8 microphones, 30-hour battery, Speak-to-Chat, and exceptional Hi-Res audio.',
  },
  'Apple AirPods Max': {
    thumbnail: 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=800&q=80',
      'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80',
    ],
    description: 'Apple AirPods Max with Active Noise Cancellation, Transparency mode, Spatial Audio with dynamic head tracking, and a knitted mesh canopy.',
  },
  'JBL Tune 760NC': {
    thumbnail: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    ],
    description: 'JBL Tune 760NC with Active Noise Cancellation, 35-hour battery life, JBL Pure Bass sound, foldable design, and hands-free Siri/Google.',
  },
  'Boat Rockerz 550': {
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    ],
    description: 'boAt Rockerz 550 with 40mm drivers, 20-hour battery, plush ear cushions, ASAP Charge technology, and superior Beast Mode sound.',
  },
  'Sennheiser Momentum 4': {
    thumbnail: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
      'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80',
    ],
    description: 'Sennheiser Momentum 4 Wireless with 60-hour battery, Adaptive Noise Cancellation, Transparency mode, and aptX Adaptive Hi-Fi audio.',
  },
  'OnePlus Buds Pro 2': {
    thumbnail: 'https://images.unsplash.com/photo-1606741965326-cb990ae01bb2?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1606741965326-cb990ae01bb2?w=800&q=80',
    ],
    description: 'OnePlus Buds Pro 2 with 48dB Adaptive ANC, spatial audio, 39-hour total battery, MelodyBoost dual drivers, and LHDC 4.0 Hi-Res audio.',
  },

  // ── MEN CLOTHING ──
  "Levi's Slim Fit Jeans": {
    thumbnail: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80',
      'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800&q=80',
    ],
    description: "Levi's 511 Slim Fit Jeans crafted from performance stretch denim for all-day comfort. A modern slim silhouette with iconic 5-pocket styling.",
  },
  'Nike Sports T-Shirt': {
    thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80',
    ],
    description: 'Nike Dri-FIT Sports T-Shirt engineered to help keep you dry and comfortable. Sweat-wicking fabric moves moisture away from your body.',
  },
  'Adidas Hoodie': {
    thumbnail: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    ],
    description: 'Adidas Essential Fleece Hoodie made from soft brushed fleece with a kangaroo pocket, ribbed cuffs, and the iconic trefoil logo.',
  },
  'Allen Solly Formal Shirt': {
    thumbnail: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
      'https://images.unsplash.com/photo-1588336271851-c68e29e7f8fc?w=800&q=80',
    ],
    description: "Allen Solly Men's Formal Shirt with a slim fit design, premium cotton fabric, and stylish pinstripe patterns for a sharp office look.",
  },
  'Zara Casual Blazer': {
    thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
    ],
    description: 'Zara Tailored Slim-Fit Blazer in technical fabric with a structured silhouette, notched lapels, and dual flap pockets. Smart-casual perfection.',
  },
  'Puma Track Pants': {
    thumbnail: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80',
    ],
    description: 'Puma Active Track Pants with dryCELL moisture-wicking fabric, elastic waistband with drawcord, zippered pockets, and tapered leg design.',
  },

  // ── FOOTWEAR ──
  'Nike Air Max Running Shoes': {
    thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&q=80',
      'https://images.unsplash.com/photo-1514898263489-27f05fe11e55?w=800&q=80',
    ],
    description: 'Nike Air Max with visible Air unit cushioning, breathable mesh upper, rubber waffle outsole for traction, and a heritage runner silhouette.',
  },
  'Adidas Ultraboost': {
    thumbnail: 'https://images.unsplash.com/photo-1608231387042-66d1773d3028?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1608231387042-66d1773d3028?w=800&q=80',
      'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&q=80',
    ],
    description: "Adidas Ultraboost with BOOST midsole energy return, Primeknit+ upper that stretches with your foot, and a Continental™ Rubber outsole.",
  },
  'Puma Running Shoes': {
    thumbnail: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=800&q=80',
    ],
    description: 'Puma NITRO Running Shoes with NITROFOAM™ midsole, formstrip detailing, rubber outsole for grip, and a breathable engineered mesh upper.',
  },
  'Reebok Training Shoes': {
    thumbnail: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80',
    ],
    description: 'Reebok Nano X Training Shoes with a stable base, MemoryTech Massage Pod sockliner, and a breathable upper for HIIT workouts.',
  },
  'Bata Formal Shoes': {
    thumbnail: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800&q=80',
    ],
    description: "Bata Men's Formal Derby Shoes in genuine leather with a cushioned insole, durable rubber outsole, and a classic derby silhouette for the office.",
  },
  'Woodland Outdoor Boots': {
    thumbnail: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    ],
    description: 'Woodland Outdoor Boots with waterproof full-grain leather, rubber outsole for all-terrain grip, padded collar, and a supportive EVA midsole.',
  },

  // ── FURNITURE ──
  'Urban Ladder Wooden Sofa Set': {
    thumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80',
    ],
    description: 'Urban Ladder 3+2 Wooden Sofa Set in solid sheesham wood, fabric upholstery, with a premium finish and sturdy legs for long-lasting comfort.',
  },
  'Godrej Office Chair': {
    thumbnail: 'https://images.unsplash.com/photo-1589042892703-872b95f72fe4?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1589042892703-872b95f72fe4?w=800&q=80',
      'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=800&q=80',
    ],
    description: 'Godrej Ergonomic Office Chair with lumbar support, adjustable height & armrests, mesh back for breathability, and 360° swivel base.',
  },
  'IKEA Study Table': {
    thumbnail: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    ],
    description: 'IKEA MICKE Study Table with a clean white finish, built-in cable management, drawer and open storage, and a compact footprint for any room.',
  },
  'Nilkamal Plastic Chair Set': {
    thumbnail: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=800&q=80',
    ],
    description: 'Nilkamal 4-piece Plastic Chair Set with weatherproof construction, stackable design for easy storage, and wide, comfortable seating.',
  },
  'Durian Queen Size Bed': {
    thumbnail: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&q=80',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80',
    ],
    description: 'Durian Queen Size Bed Frame in premium engineered wood with a hydraulic storage mechanism, headboard, and a sturdy 6-leg support system.',
  },
  'HomeTown Wooden Dining Table Set': {
    thumbnail: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    ],
    description: 'HomeTown Wooden 6-Seater Dining Table Set with a solid mango wood top, cushioned chairs with leatherette seats, and a natural walnut finish.',
  },

  // ── GROCERIES ──
  'Aashirvaad Atta 5kg': {
    thumbnail: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
    ],
    description: 'Aashirvaad Superior MP Atta made from the inner layers of 100% whole wheat grains, delivering soft rotis with natural goodness and fiber.',
  },
  'Fortune Sunflower Oil 1L': {
    thumbnail: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80',
    ],
    description: 'Fortune Sunflower Oil refined through a multi-stage purification process, rich in Vitamin E and low in saturated fat for a heart-healthy lifestyle.',
  },
  'Tata Salt 1kg': {
    thumbnail: 'https://images.unsplash.com/photo-1557736952-3fef88c57e96?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1557736952-3fef88c57e96?w=800&q=80',
    ],
    description: "Tata Salt Iodized — India's most trusted salt brand, vacuum evaporated for purity and fortified with iodine for your family's health.",
  },
  'Maggi Noodles Pack': {
    thumbnail: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
      'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&q=80',
    ],
    description: 'Maggi 2-Minute Noodles — the iconic Masala flavor that generations of Indians have grown up with. Ready in just 2 minutes, anytime hunger strikes.',
  },
  'Amul Butter 500g': {
    thumbnail: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800&q=80',
    ],
    description: 'Amul Pasteurised Butter 500g, made from fresh cream with a rich, creamy taste. Perfect for cooking, baking, and spreading on hot toast.',
  },
  "Kellogg's Cornflakes": {
    thumbnail: 'https://images.unsplash.com/photo-1611068661756-d4a4ca29e5f4?w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1611068661756-d4a4ca29e5f4?w=800&q=80',
    ],
    description: "Kellogg's Cornflakes — a wholesome breakfast cereal made from milled corn, fortified with essential vitamins & minerals. Start your day right.",
  },
};

// ─── Load Data Files ────────────────────────────────────────────────────────
const DATA_FILES = [
  'smartphone.json',
  'laptops.json',
  'tablets.json',
  'smartwatches.json',
  'television.json',
  'men-clothing.json',
  'footwear.json',
  'furniture.json',
  'groceries.json',
  'headphones.json',
];

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✓ Connected to MongoDB');

  // Clear existing products
  await Product.deleteMany({});
  console.log('✓ Cleared existing products');

  let totalInserted = 0;

  for (const file of DATA_FILES) {
    const filePath = path.join(DATA_DIR, file);
    let raw;
    try {
      raw = require(filePath);
    } catch (e) {
      console.warn(`⚠ Could not load ${file}: ${e.message}`);
      continue;
    }

    const enriched = raw.map(item => {
      const meta = IMAGE_MAP[item.title] || {};
      return {
        productId: item.id,
        title: item.title,
        description: meta.description || `${item.title} — premium quality product available on PRISM marketplace.`,
        category: item.category,
        platform: item.platform || 'PRISM',
        price: item.price,
        rating: item.rating,
        reviewCount: item.reviewCount || 0,
        stock: item.stock,
        purchaseCount: item.purchaseCount || 0,
        views: item.views || 0,
        salesLast7Days: item.salesLast7Days || 0,
        brandScore: item.brandScore || 0.85,
        images: meta.images || [DEFAULT_IMAGE],
        thumbnail: meta.thumbnail || DEFAULT_IMAGE,
        lastPurchasedAt: item.lastPurchasedAt ? new Date(item.lastPurchasedAt) : new Date(),
      };
    });

    await Product.insertMany(enriched);
    console.log(`✓ Seeded ${enriched.length} products from ${file}`);
    totalInserted += enriched.length;
  }

  console.log(`\n🎉 Done! Total products seeded: ${totalInserted}`);
  await mongoose.connection.close();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
