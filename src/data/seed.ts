import type {
  Category,
  MenuItem,
  OrderStatus,
  PastOrderSeed,
  UserProfile,
} from "@/domain/types";

export const CATEGORIES: Category[] = [
  { id: "dumplings", name: "Dumplings & Dim Sum", blurb: "Hand-folded, steamed to order", emoji: "🥟", gradient: ["#F4D8A6", "#E3AC57"], sortOrder: 1 },
  { id: "bao", name: "Bao Buns", blurb: "Pillowy steamed buns", emoji: "🫓", gradient: ["#F3CBB6", "#D68B66"], sortOrder: 2 },
  { id: "noodles", name: "Noodles", blurb: "Wok-tossed & in broth", emoji: "🍜", gradient: ["#F0BCAC", "#C4664F"], sortOrder: 3 },
  { id: "rice", name: "Rice Bowls", blurb: "Comfort in a bowl", emoji: "🍚", gradient: ["#CDE3C2", "#7BA766"], sortOrder: 4 },
  { id: "sides", name: "Small Plates", blurb: "Snacks & sides", emoji: "🥢", gradient: ["#BEE0D3", "#6BB598"], sortOrder: 5 },
  { id: "sweets", name: "Sweets", blurb: "A little something", emoji: "🍡", gradient: ["#F0CDDC", "#C687AE"], sortOrder: 6 },
  { id: "drinks", name: "Drinks", blurb: "Teas & refreshers", emoji: "🧋", gradient: ["#CFE0EE", "#87B2D4"], sortOrder: 7 },
];

export const MENU_ITEMS: MenuItem[] = [
  { id: "m1", categoryId: "dumplings", name: "Pork & Chive Dumplings", priceCents: 850, emoji: "🥟", popular: true, spiceLevel: 0, vegetarian: false, available: true, allergens: ["gluten", "soy", "sesame"], sortOrder: 1, description: "Six hand-folded parcels of juicy pork and garlic chives, black-vinegar dip." },
  { id: "m2", categoryId: "dumplings", name: "Prawn Har Gow", priceCents: 900, emoji: "🥟", popular: false, spiceLevel: 0, vegetarian: false, available: true, allergens: ["shellfish", "gluten"], sortOrder: 2, description: "Four crystal-skin dumplings packed with sweet prawn and bamboo shoot." },
  { id: "m3", categoryId: "dumplings", name: "Chicken & Shiitake Gyoza", priceCents: 800, emoji: "🥟", popular: false, spiceLevel: 0, vegetarian: false, available: true, allergens: ["gluten", "soy"], sortOrder: 3, description: "Pan-seared with crisp bottoms, ginger chicken and mushroom filling." },
  { id: "m4", categoryId: "dumplings", name: "Edamame & Truffle Dumplings", priceCents: 850, emoji: "🥟", popular: false, spiceLevel: 0, vegetarian: true, available: true, allergens: ["gluten", "soy"], sortOrder: 4, description: "Silky edamame purée with a whisper of truffle. Plant-based." },
  { id: "m5", categoryId: "bao", name: "Braised Pork Belly Bao", priceCents: 650, emoji: "🫓", popular: true, spiceLevel: 0, vegetarian: false, available: true, allergens: ["gluten", "soy", "sesame", "peanut"], sortOrder: 1, description: "Slow-braised belly, pickled mustard greens and crushed peanut." },
  { id: "m6", categoryId: "bao", name: "Crispy Tofu Bao", priceCents: 600, emoji: "🫓", popular: false, spiceLevel: 0, vegetarian: true, available: true, allergens: ["gluten", "soy"], sortOrder: 2, description: "Golden tofu, hoisin, cucumber and spring onion. Plant-based." },
  { id: "m7", categoryId: "bao", name: "Korean Fried Chicken Bao", priceCents: 650, emoji: "🫓", popular: false, spiceLevel: 1, vegetarian: false, available: true, allergens: ["gluten", "soy", "egg"], sortOrder: 3, description: "Double-fried chicken in gochujang glaze, kewpie slaw." },
  { id: "m8", categoryId: "noodles", name: "Dan Dan Noodles", priceCents: 1350, emoji: "🍜", popular: true, spiceLevel: 2, vegetarian: false, available: true, allergens: ["peanut", "gluten", "soy", "sesame"], sortOrder: 1, description: "Sichuan chili oil, minced pork, peanut and preserved veg." },
  { id: "m9", categoryId: "noodles", name: "Singapore Vermicelli", priceCents: 1300, emoji: "🍜", popular: false, spiceLevel: 1, vegetarian: false, available: true, allergens: ["shellfish", "egg", "soy"], sortOrder: 2, description: "Curried rice noodles with prawn, egg and char siu." },
  { id: "m10", categoryId: "noodles", name: "Garlic Soy Udon", priceCents: 1200, emoji: "🍜", popular: false, spiceLevel: 0, vegetarian: true, available: true, allergens: ["gluten", "soy"], sortOrder: 3, description: "Thick udon tossed in garlic-soy butter with charred greens." },
  { id: "m11", categoryId: "noodles", name: "Beef Ho Fun", priceCents: 1450, emoji: "🍜", popular: false, spiceLevel: 0, vegetarian: false, available: true, allergens: ["gluten", "soy"], sortOrder: 4, description: "Wok-charred flat rice noodles, tender beef and bean sprout." },
  { id: "m12", categoryId: "rice", name: "Char Siu Pork Rice", priceCents: 1350, emoji: "🍚", popular: true, spiceLevel: 0, vegetarian: false, available: true, allergens: ["soy", "sesame"], sortOrder: 1, description: "Honey-glazed BBQ pork over jasmine rice with pak choi." },
  { id: "m13", categoryId: "rice", name: "Teriyaki Salmon Bowl", priceCents: 1500, emoji: "🍚", popular: false, spiceLevel: 0, vegetarian: false, available: true, allergens: ["fish", "soy", "sesame"], sortOrder: 2, description: "Grilled salmon, teriyaki glaze, edamame and pickled ginger." },
  { id: "m14", categoryId: "rice", name: "Mapo Tofu Rice", priceCents: 1250, emoji: "🍚", popular: false, spiceLevel: 2, vegetarian: true, available: true, allergens: ["soy", "sesame"], sortOrder: 3, description: "Silken tofu in numbing chili-bean sauce. Plant-based." },
  { id: "m15", categoryId: "rice", name: "Katsu Chicken Curry", priceCents: 1400, emoji: "🍚", popular: false, spiceLevel: 1, vegetarian: false, available: true, allergens: ["gluten", "egg", "dairy"], sortOrder: 4, description: "Panko chicken cutlet, Japanese curry sauce, steamed rice." },
  { id: "m16", categoryId: "sides", name: "Steamed Edamame", priceCents: 500, emoji: "🫛", popular: false, spiceLevel: 0, vegetarian: true, available: true, allergens: ["soy"], sortOrder: 1, description: "Sea-salt and togarashi. Plant-based." },
  { id: "m17", categoryId: "sides", name: "Vegetable Spring Rolls", priceCents: 650, emoji: "🥢", popular: false, spiceLevel: 0, vegetarian: true, available: true, allergens: ["gluten", "soy"], sortOrder: 2, description: "Crisp rolls with sweet chili dip. Plant-based." },
  { id: "m18", categoryId: "sides", name: "Prawn Crackers", priceCents: 450, emoji: "🍤", popular: false, spiceLevel: 0, vegetarian: false, available: false, allergens: ["shellfish"], sortOrder: 3, description: "Light, puffed and moreish. Served with hoisin." },
  { id: "m19", categoryId: "sides", name: "House Kimchi", priceCents: 450, emoji: "🥬", popular: false, spiceLevel: 1, vegetarian: false, available: true, allergens: ["fish"], sortOrder: 4, description: "Fermented napa cabbage with gochugaru and fish sauce." },
  { id: "m20", categoryId: "sweets", name: "Mango Sticky Rice", priceCents: 700, emoji: "🥭", popular: false, spiceLevel: 0, vegetarian: true, available: true, allergens: [], sortOrder: 1, description: "Coconut sticky rice, fresh mango, toasted coconut. Allergen-free." },
  { id: "m21", categoryId: "sweets", name: "Matcha Basque Cheesecake", priceCents: 750, emoji: "🍰", popular: false, spiceLevel: 0, vegetarian: true, available: true, allergens: ["dairy", "egg", "gluten"], sortOrder: 2, description: "Burnt-top cheesecake with ceremonial matcha." },
  { id: "m22", categoryId: "sweets", name: "Sesame Balls", priceCents: 600, emoji: "🍡", popular: false, spiceLevel: 0, vegetarian: true, available: true, allergens: ["gluten", "sesame"], sortOrder: 3, description: "Chewy glutinous rice with sweet red-bean, sesame crust." },
  { id: "m23", categoryId: "drinks", name: "Jasmine Iced Tea", priceCents: 400, emoji: "🧊", popular: false, spiceLevel: 0, vegetarian: true, available: true, allergens: [], sortOrder: 1, description: "Lightly sweet, cold-brewed jasmine green tea." },
  { id: "m24", categoryId: "drinks", name: "Yuzu Lemonade", priceCents: 450, emoji: "🍋", popular: false, spiceLevel: 0, vegetarian: true, available: true, allergens: [], sortOrder: 2, description: "Sparkling lemonade with Japanese yuzu citrus." },
  { id: "m25", categoryId: "drinks", name: "Thai Milk Tea", priceCents: 500, emoji: "🧋", popular: false, spiceLevel: 0, vegetarian: true, available: true, allergens: ["dairy"], sortOrder: 3, description: "Spiced black tea, condensed milk, over ice." },
  { id: "m26", categoryId: "drinks", name: "Brown Sugar Boba", priceCents: 550, emoji: "🧋", popular: true, spiceLevel: 0, vegetarian: true, available: true, allergens: ["dairy"], sortOrder: 4, description: "Chewy tapioca pearls, brown-sugar syrup, fresh milk." },
];

/** Demo customer returned by the "Continue with Google" flow in local/demo mode. */
export const DEMO_CUSTOMER: UserProfile = {
  id: "user-priya",
  email: "priya.anand@gmail.com",
  name: "Priya Anand",
  phone: "+1 555 018 2245",
  role: "customer",
  allergens: ["peanut", "shellfish"],
  marketingOptIn: true,
};

/** Demo owner/admin returned by the staff "Continue with Google" flow in demo mode. */
export const DEMO_ADMIN: UserProfile = {
  id: "user-marco",
  email: "marco@hungrypanda.example",
  name: "Marco B.",
  role: "admin",
  allergens: [],
  marketingOptIn: false,
};

export const PAST_ORDERS: PastOrderSeed[] = [
  { code: "HP-1990", date: "Jun 28, 2026", items: [{ itemId: "m12", quantity: 1 }, { itemId: "m10", quantity: 1 }, { itemId: "m23", quantity: 2 }] },
  { code: "HP-1975", date: "Jun 14, 2026", items: [{ itemId: "m3", quantity: 2 }, { itemId: "m20", quantity: 1 }] },
  { code: "HP-1952", date: "May 30, 2026", items: [{ itemId: "m15", quantity: 1 }, { itemId: "m16", quantity: 1 }, { itemId: "m24", quantity: 1 }] },
];

export interface QueueSeed {
  code: string;
  customerName: string;
  items: { itemId: string; quantity: number }[];
  pickupAt: string;
  status: OrderStatus;
}

export const ORDER_QUEUE: QueueSeed[] = [
  { code: "HP-2050", customerName: "Aisha K.", items: [{ itemId: "m8", quantity: 1 }, { itemId: "m5", quantity: 2 }], pickupAt: "12:52", status: "new" },
  { code: "HP-2049", customerName: "Tom W.", items: [{ itemId: "m11", quantity: 1 }, { itemId: "m17", quantity: 1 }, { itemId: "m26", quantity: 1 }], pickupAt: "12:48", status: "new" },
  { code: "HP-2048", customerName: "Priya A.", items: [{ itemId: "m1", quantity: 2 }, { itemId: "m12", quantity: 1 }, { itemId: "m23", quantity: 1 }], pickupAt: "12:41", status: "preparing" },
  { code: "HP-2047", customerName: "Grace L.", items: [{ itemId: "m15", quantity: 1 }, { itemId: "m21", quantity: 1 }], pickupAt: "12:35", status: "ready" },
  { code: "HP-2046", customerName: "Dan R.", items: [{ itemId: "m10", quantity: 1 }, { itemId: "m16", quantity: 2 }], pickupAt: "12:22", status: "pickedup" },
];

export const TOP_SELLERS = [
  { itemId: "m8", count: 38 },
  { itemId: "m1", count: 31 },
  { itemId: "m12", count: 27 },
  { itemId: "m5", count: 22 },
  { itemId: "m26", count: 18 },
];
