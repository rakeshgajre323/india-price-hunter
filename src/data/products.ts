import { platforms } from "./platforms";
import { placeholderImage, type ProductImage } from "@/lib/product-image";

export type PriceEntry = {
  platformId: string;
  price: number;
  mrp: number;
  packSize: string; // e.g. "1 L", "500 g"
  unit: "kg" | "g" | "L" | "ml" | "pc";
  unitQty: number; // in base (g, ml, pc)
  inStock: boolean;
  etaMin: number;
  lastUpdatedMin: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categorySlug: string;
  image: string; // emoji fallback (used if <img> errors)
  imageRef: ProductImage; // abstraction layer — swap source later
  description: string;
  prices: PriceEntry[];
  history: { date: string; prices: Record<string, number> }[];
};

// Deterministic pseudo-random so SSR matches client
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

type Seed = {
  id: string;
  name: string;
  brand: string;
  categorySlug: string;
  image: string;
  imageRef?: ProductImage; // override the default placeholder when we have a real URL
  description: string;
  packSize: string;
  unit: PriceEntry["unit"];
  unitQty: number;
  basePrice: number;
  mrp: number;
  variance: number; // ± rupees across platforms
};

const seeds: Seed[] = [
  // Fruits & Vegetables
  { id: "banana-robusta-1kg", name: "Banana Robusta", brand: "Fresho", categorySlug: "fruits-vegetables", image: "🍌", description: "Fresh robusta bananas, hand-picked.", packSize: "1 kg", unit: "kg", unitQty: 1000, basePrice: 56, mrp: 75, variance: 12 },
  { id: "tomato-hybrid-1kg", name: "Tomato Hybrid", brand: "Fresho", categorySlug: "fruits-vegetables", image: "🍅", description: "Plump, ripe hybrid tomatoes.", packSize: "1 kg", unit: "kg", unitQty: 1000, basePrice: 38, mrp: 60, variance: 10 },
  { id: "onion-1kg", name: "Onion", brand: "Fresho", categorySlug: "fruits-vegetables", image: "🧅", description: "Medium-sized fresh onions.", packSize: "1 kg", unit: "kg", unitQty: 1000, basePrice: 42, mrp: 55, variance: 9 },
  { id: "potato-1kg", name: "Potato", brand: "Fresho", categorySlug: "fruits-vegetables", image: "🥔", description: "All-purpose fresh potatoes.", packSize: "1 kg", unit: "kg", unitQty: 1000, basePrice: 32, mrp: 45, variance: 7 },
  { id: "apple-shimla-1kg", name: "Apple Shimla", brand: "Fresho", categorySlug: "fruits-vegetables", image: "🍎", description: "Crisp Shimla apples.", packSize: "1 kg", unit: "kg", unitQty: 1000, basePrice: 189, mrp: 240, variance: 20 },
  { id: "lemon-500g", name: "Lemon", brand: "Fresho", categorySlug: "fruits-vegetables", image: "🍋", description: "Tangy lemons for everyday use.", packSize: "500 g", unit: "g", unitQty: 500, basePrice: 39, mrp: 55, variance: 8 },

  // Staples
  { id: "tata-salt-1kg", name: "Iodized Salt", brand: "Tata", categorySlug: "staples", image: "🧂", description: "Tata Salt, India's #1 iodized salt.", packSize: "1 kg", unit: "kg", unitQty: 1000, basePrice: 28, mrp: 32, variance: 3 },
  { id: "aashirvaad-atta-5kg", name: "Whole Wheat Atta", brand: "Aashirvaad", categorySlug: "staples", image: "🌾", description: "100% chakki-fresh wheat atta.", packSize: "5 kg", unit: "kg", unitQty: 5000, basePrice: 285, mrp: 320, variance: 15 },
  { id: "fortune-sunflower-1l", name: "Sunflower Oil", brand: "Fortune", categorySlug: "staples", image: "🛢️", description: "Refined sunflower oil, pouch.", packSize: "1 L", unit: "L", unitQty: 1000, basePrice: 142, mrp: 165, variance: 10 },
  { id: "india-gate-basmati-5kg", name: "Basmati Rice Classic", brand: "India Gate", categorySlug: "staples", image: "🍚", description: "Long-grain aged basmati rice.", packSize: "5 kg", unit: "kg", unitQty: 5000, basePrice: 695, mrp: 850, variance: 35 },
  { id: "toor-dal-1kg", name: "Toor Dal", brand: "Tata Sampann", categorySlug: "staples", image: "🫘", description: "Unpolished premium toor dal.", packSize: "1 kg", unit: "kg", unitQty: 1000, basePrice: 162, mrp: 195, variance: 12 },
  { id: "sugar-1kg", name: "Refined Sugar", brand: "Madhur", categorySlug: "staples", image: "🥄", description: "Pure refined sulphur-free sugar.", packSize: "1 kg", unit: "kg", unitQty: 1000, basePrice: 45, mrp: 52, variance: 5 },

  // Snacks & Beverages
  { id: "maggi-70g-12pk", name: "2-Minute Masala Noodles", brand: "Maggi", categorySlug: "snacks", image: "🍜", description: "Masala instant noodles, pack of 12.", packSize: "12 x 70 g", unit: "pc", unitQty: 12, basePrice: 168, mrp: 180, variance: 8 },
  { id: "lays-magic-masala-52g", name: "Lays Magic Masala", brand: "Lays", categorySlug: "snacks", image: "🥔", description: "Crunchy potato chips, classic flavour.", packSize: "52 g", unit: "g", unitQty: 52, basePrice: 18, mrp: 20, variance: 3 },
  { id: "parle-g-800g", name: "Parle-G Biscuits", brand: "Parle", categorySlug: "snacks", image: "🍪", description: "Glucose biscuits, family pack.", packSize: "800 g", unit: "g", unitQty: 800, basePrice: 78, mrp: 90, variance: 7 },
  { id: "coca-cola-750ml", name: "Coca-Cola PET", brand: "Coca-Cola", categorySlug: "snacks", image: "🥤", description: "Classic Coke, 750 ml bottle.", packSize: "750 ml", unit: "ml", unitQty: 750, basePrice: 40, mrp: 45, variance: 5 },
  { id: "kurkure-90g", name: "Kurkure Masala Munch", brand: "Kurkure", categorySlug: "snacks", image: "🌶️", description: "Crunchy spicy snack.", packSize: "90 g", unit: "g", unitQty: 90, basePrice: 19, mrp: 20, variance: 2 },
  { id: "redbull-250ml", name: "Red Bull Energy Drink", brand: "Red Bull", categorySlug: "snacks", image: "🐂", description: "Classic energy drink, 250 ml.", packSize: "250 ml", unit: "ml", unitQty: 250, basePrice: 119, mrp: 125, variance: 6 },

  // Dairy
  { id: "amul-gold-1l", name: "Amul Gold Milk", brand: "Amul", categorySlug: "dairy", image: "🥛", description: "Full-cream gold milk pouch.", packSize: "1 L", unit: "L", unitQty: 1000, basePrice: 68, mrp: 72, variance: 3 },
  { id: "amul-butter-500g", name: "Amul Butter", brand: "Amul", categorySlug: "dairy", image: "🧈", description: "Pasteurised salted butter.", packSize: "500 g", unit: "g", unitQty: 500, basePrice: 282, mrp: 295, variance: 10 },
  { id: "amul-paneer-200g", name: "Amul Malai Paneer", brand: "Amul", categorySlug: "dairy", image: "🧀", description: "Fresh malai paneer block.", packSize: "200 g", unit: "g", unitQty: 200, basePrice: 95, mrp: 105, variance: 8 },
  { id: "eggs-brown-6", name: "Brown Eggs", brand: "Eggoz", categorySlug: "dairy", image: "🥚", description: "Farm-fresh brown eggs, pack of 6.", packSize: "6 pc", unit: "pc", unitQty: 6, basePrice: 79, mrp: 95, variance: 8 },
  { id: "nestle-curd-400g", name: "Nestle a+ Dahi", brand: "Nestle", categorySlug: "dairy", image: "🥣", description: "Pro-biotic creamy curd.", packSize: "400 g", unit: "g", unitQty: 400, basePrice: 55, mrp: 65, variance: 6 },
  { id: "mother-dairy-paneer-200g", name: "Mother Dairy Paneer", brand: "Mother Dairy", categorySlug: "dairy", image: "🧀", description: "Fresh paneer, vacuum sealed.", packSize: "200 g", unit: "g", unitQty: 200, basePrice: 92, mrp: 100, variance: 7 },

  // Personal Care
  { id: "colgate-strong-teeth-200g", name: "Colgate Strong Teeth", brand: "Colgate", categorySlug: "personal-care", image: "🪥", description: "Anti-cavity toothpaste.", packSize: "200 g", unit: "g", unitQty: 200, basePrice: 122, mrp: 145, variance: 10 },
  { id: "dove-shampoo-340ml", name: "Dove Intense Repair Shampoo", brand: "Dove", categorySlug: "personal-care", image: "🧴", description: "Daily damage repair shampoo.", packSize: "340 ml", unit: "ml", unitQty: 340, basePrice: 359, mrp: 425, variance: 22 },
  { id: "dettol-handwash-200ml", name: "Dettol Original Handwash", brand: "Dettol", categorySlug: "personal-care", image: "🧼", description: "Germ-kill liquid handwash.", packSize: "200 ml", unit: "ml", unitQty: 200, basePrice: 79, mrp: 95, variance: 8 },
  { id: "lifebuoy-soap-125g-4pk", name: "Lifebuoy Total Soap (4-pk)", brand: "Lifebuoy", categorySlug: "personal-care", image: "🧼", description: "Germ-protection soap, pack of 4.", packSize: "4 x 125 g", unit: "pc", unitQty: 4, basePrice: 145, mrp: 180, variance: 11 },
  { id: "gillette-mach3-cart-4", name: "Gillette Mach3 Cartridges", brand: "Gillette", categorySlug: "personal-care", image: "🪒", description: "Triple-blade cartridges, 4 ct.", packSize: "4 pc", unit: "pc", unitQty: 4, basePrice: 599, mrp: 699, variance: 30 },
  { id: "vaseline-200ml", name: "Vaseline Body Lotion", brand: "Vaseline", categorySlug: "personal-care", image: "🧴", description: "Deep restore body lotion.", packSize: "200 ml", unit: "ml", unitQty: 200, basePrice: 199, mrp: 240, variance: 14 },

  // Household
  { id: "surf-excel-easy-wash-2kg", name: "Surf Excel Easy Wash", brand: "Surf Excel", categorySlug: "household", image: "🧺", description: "Detergent powder, 2 kg pack.", packSize: "2 kg", unit: "kg", unitQty: 2000, basePrice: 268, mrp: 320, variance: 18 },
  { id: "vim-bar-3x300g", name: "Vim Dishwash Bar (3-pk)", brand: "Vim", categorySlug: "household", image: "🍽️", description: "Anti-grease dishwash bars.", packSize: "3 x 300 g", unit: "pc", unitQty: 3, basePrice: 79, mrp: 95, variance: 8 },
  { id: "harpic-toilet-cleaner-1l", name: "Harpic Power Plus", brand: "Harpic", categorySlug: "household", image: "🚽", description: "10x stronger toilet cleaner.", packSize: "1 L", unit: "L", unitQty: 1000, basePrice: 159, mrp: 195, variance: 12 },
  { id: "lizol-floor-975ml", name: "Lizol Floor Cleaner Citrus", brand: "Lizol", categorySlug: "household", image: "🪣", description: "Disinfectant surface cleaner.", packSize: "975 ml", unit: "ml", unitQty: 975, basePrice: 195, mrp: 245, variance: 14 },
  { id: "origami-tissue-100", name: "Origami Facial Tissues", brand: "Origami", categorySlug: "household", image: "🧻", description: "2-ply soft tissues, 100 pulls.", packSize: "100 pc", unit: "pc", unitQty: 100, basePrice: 79, mrp: 99, variance: 7 },
  { id: "good-knight-refill", name: "Good Knight Active+ Refill", brand: "Good Knight", categorySlug: "household", image: "🦟", description: "Mosquito repellent liquid refill.", packSize: "45 ml", unit: "ml", unitQty: 45, basePrice: 89, mrp: 105, variance: 7 },
];

function makeProduct(seed: Seed, idx: number): Product {
  const rand = seeded(idx + 1);
  const prices: PriceEntry[] = platforms.map((pl, pi) => {
    const delta = (rand() - 0.5) * 2 * seed.variance;
    const price = Math.max(Math.round(seed.basePrice + delta), Math.round(seed.basePrice * 0.85));
    const inStock = rand() > 0.12;
    const etaMin = pl.id === "amazon-fresh" ? 90 + Math.round(rand() * 60) : pl.avgEtaMin + Math.round((rand() - 0.5) * 6);
    return {
      platformId: pl.id,
      price,
      mrp: seed.mrp,
      packSize: seed.packSize,
      unit: seed.unit,
      unitQty: seed.unitQty,
      inStock,
      etaMin,
      lastUpdatedMin: Math.round(rand() * 28) + 1,
    };
  });

  // 30-day price history
  const history: Product["history"] = [];
  for (let d = 29; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dayPrices: Record<string, number> = {};
    prices.forEach((p) => {
      const wave = Math.sin(d / 4 + idx) * seed.variance * 0.35;
      const jitter = (rand() - 0.5) * seed.variance * 0.4;
      dayPrices[p.platformId] = Math.max(Math.round(p.price + wave + jitter), Math.round(seed.basePrice * 0.85));
    });
    history.push({ date: date.toISOString().slice(0, 10), prices: dayPrices });
  }

  return {
    id: seed.id,
    slug: seed.id,
    name: seed.name,
    brand: seed.brand,
    categorySlug: seed.categorySlug,
    image: seed.image,
    imageRef: seed.imageRef ?? placeholderImage(`${seed.brand} ${seed.name}`),
    description: seed.description,
    prices,
    history,
  };
}

export const products: Product[] = seeds.map(makeProduct);

export const getProduct = (id: string) => products.find((p) => p.id === id);
export const productsByCategory = (slug: string) => products.filter((p) => p.categorySlug === slug);