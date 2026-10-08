export type Product = {
  name: string;
  price: string;
  image: string;
  category: string;
  rating: string;
  reviews: string;
  badge?: string;
};

export type Category = { name: string; image: string; eyebrow?: string };

export const categories: Category[] = [
  { name: "Earrings", image: "/home/categories/category-earrings.jpg" },
  { name: "Necklaces", image: "/home/categories/category-necklaces.jpg" },
  { name: "Rings", image: "/home/categories/category-rings.jpg" },
  { name: "Bracelets", image: "/home/categories/category-bracelets.jpg" },
  { name: "Sets", image: "/home/categories/category-sets.jpg" },
];

export const silverCategories: Category[] = [
  { name: "Rings", image: "/silvercollection/rings/rings.jpg" },
  { name: "Chain / Pendant", image: "/silvercollection/chain-pendant/pendants.jpg" },
  { name: "Earrings", image: "/silvercollection/earrings/earrings.jpg" },
  { name: "Anklets", image: "/silvercollection/anklets/anklets.jpg" },
  { name: "Gifts", image: "/silvercollection/gifts/gifts.jpg" },
];

export const fashionCategories: Category[] = [
  { name: "Rings", image: "/fashioncollection/rings/rings.jpg" },
  { name: "Chain / Pendant", image: "/fashioncollection/chain-pendant/pendants.jpg" },
  { name: "Earrings", image: "/fashioncollection/earrings/earrings.jpg" },
  { name: "Anklets", image: "/fashioncollection/anklets/anklets.jpg" },
  { name: "Gifts", image: "/fashioncollection/gifts/gifts.jpg" },
];

export const products: Product[] = [
  { name: "Emerald Charm Necklace", price: "₹2,499", image: "/home/products/emerald-charm-necklace.jpg", category: "Necklaces", rating: "4.9", reviews: "128", badge: "Bestseller" },
  { name: "Floral Diamond Earrings", price: "₹1,299", image: "/home/products/floral-diamond-earrings.jpg", category: "Earrings", rating: "4.8", reviews: "96" },
  { name: "Classic Bangle Bracelet", price: "₹1,599", image: "/home/products/classic-bangle-bracelet.jpg", category: "Bracelets", rating: "4.9", reviews: "84" },
  { name: "Minimal Gold Ring", price: "₹999", image: "/home/products/minimal-gold-ring.jpg", category: "Rings", rating: "4.7", reviews: "112", badge: "New" },
  { name: "Layered Chain Necklace", price: "₹1,899", image: "/home/products/layered-chain-necklace.jpg", category: "Necklaces", rating: "4.9", reviews: "74" },
  { name: "Emerald Stud Earrings", price: "₹1,099", image: "/home/products/emerald-stud-earrings.jpg", category: "Earrings", rating: "4.8", reviews: "63" },
  { name: "Twist Ring", price: "₹899", image: "/home/products/twist-ring.jpg", category: "Rings", rating: "4.6", reviews: "52" },
  { name: "Pearl Charm Bracelet", price: "₹1,499", image: "/home/products/pearl-charm-bracelet.jpg", category: "Bracelets", rating: "4.8", reviews: "91" },
];

export const collections = [
  { name: "Everyday Elegance", image: "/home/collections/collection-everyday.jpg", caption: "Quiet luxury for every day." },
  { name: "Office Collection", image: "/home/collections/collection-office.jpg", caption: "Polished pieces, effortless presence." },
  { name: "Festive Glamour", image: "/home/collections/collection-festive.jpg", caption: "Make the moment memorable." },
  { name: "Wedding Edit", image: "/home/collections/collection-wedding.jpg", caption: "For your most cherished chapters." },
];

export const navItems = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Silver Collection", to: "/silver-collection" },
  { label: "Fashion Collection", to: "/fashion-collection" },
  { label: "Contact", to: "/contact" },
];
