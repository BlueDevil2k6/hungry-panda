// Core domain types shared by the server, data layer and UI.

export type AllergenId =
  | "gluten"
  | "peanut"
  | "treenut"
  | "soy"
  | "sesame"
  | "shellfish"
  | "fish"
  | "egg"
  | "dairy";

export interface Allergen {
  id: AllergenId;
  label: string;
  example: string;
}

export interface Category {
  id: string;
  name: string;
  blurb: string;
  emoji: string;
  /** [from, to] used for the duotone image tile */
  gradient: [string, string];
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  priceCents: number;
  emoji: string;
  /** 0 (none) – 3 (fiery) */
  spiceLevel: number;
  vegetarian: boolean;
  popular: boolean;
  available: boolean;
  allergens: AllergenId[];
  sortOrder: number;
}

export type Role = "guest" | "customer" | "staff" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  allergens: AllergenId[];
  marketingOptIn: boolean;
}

export interface CartLineInput {
  itemId: string;
  quantity: number;
}

export type OrderStatus = "new" | "preparing" | "ready" | "pickedup";
export type PickupType = "asap" | "scheduled";
export type PaymentStatus = "pending" | "paid" | "failed";

export interface OrderItem {
  itemId: string;
  /** name/price/allergens are frozen at purchase time */
  nameSnapshot: string;
  unitPriceCents: number;
  quantity: number;
  allergensSnapshot: AllergenId[];
}

export interface Order {
  id: string;
  code: string; // e.g. HP-2048
  userId: string | null; // null = guest checkout
  customerName: string;
  contactPhone?: string;
  status: OrderStatus;
  pickupType: PickupType;
  pickupAt: string | null;
  items: OrderItem[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  notes?: string;
  paymentStatus: PaymentStatus;
  paymentRef?: string;
  createdAt: string;
}

export interface PastOrderSeed {
  code: string;
  date: string;
  items: { itemId: string; quantity: number }[];
}
