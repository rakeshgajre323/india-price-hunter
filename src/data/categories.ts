import { Apple, Wheat, Cookie, Milk, Sparkles, Home } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Category = {
  slug: string;
  name: string;
  icon: LucideIcon;
  description: string;
};

export const categories: Category[] = [
  { slug: "fruits-vegetables", name: "Fruits & Vegetables", icon: Apple, description: "Fresh produce delivered fast" },
  { slug: "staples", name: "Staples & Atta", icon: Wheat, description: "Rice, atta, dals, oils, salt" },
  { slug: "snacks", name: "Snacks & Beverages", icon: Cookie, description: "Chips, biscuits, drinks" },
  { slug: "dairy", name: "Dairy & Breakfast", icon: Milk, description: "Milk, paneer, butter, eggs" },
  { slug: "personal-care", name: "Personal Care", icon: Sparkles, description: "Toothpaste, shampoo, soap" },
  { slug: "household", name: "Household", icon: Home, description: "Cleaning, detergents, tissues" },
];

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);