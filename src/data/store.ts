import type {
  Category,
  MenuItem,
  Order,
  OrderStatus,
  UserProfile,
} from "@/domain/types";
import { computeTotals } from "@/domain/pricing";
import { buildOrderItems, nextStatus } from "@/domain/orders";
import {
  CATEGORIES,
  MENU_ITEMS,
  ORDER_QUEUE,
  PAST_ORDERS,
  DEMO_CUSTOMER,
  DEMO_ADMIN,
  TOP_SELLERS,
  type QueueSeed,
} from "./seed";

export type NewMenuItem = Omit<MenuItem, "id" | "sortOrder"> & {
  sortOrder?: number;
};

export interface Store {
  listCategories(): Promise<Category[]>;
  listMenuItems(): Promise<MenuItem[]>;
  getMenuItem(id: string): Promise<MenuItem | null>;
  createMenuItem(input: NewMenuItem): Promise<MenuItem>;
  updateMenuItem(id: string, patch: Partial<MenuItem>): Promise<MenuItem | null>;
  deleteMenuItem(id: string): Promise<boolean>;

  getUser(id: string): Promise<UserProfile | null>;
  updateUserAllergens(
    id: string,
    allergens: UserProfile["allergens"],
  ): Promise<UserProfile | null>;

  createOrder(input: {
    userId: string | null;
    customerName: string;
    contactPhone?: string;
    pickupType: Order["pickupType"];
    pickupAt: string | null;
    notes?: string;
    lines: { item: MenuItem; quantity: number }[];
    paymentStatus: Order["paymentStatus"];
    paymentRef?: string;
  }): Promise<Order>;
  getOrderByCode(code: string): Promise<Order | null>;
  setOrderPayment(
    id: string,
    status: Order["paymentStatus"],
    ref?: string,
  ): Promise<Order | null>;
  listOrdersByUser(userId: string): Promise<Order[]>;
  listQueue(): Promise<Order[]>;
  advanceOrderStatus(id: string): Promise<Order | null>;

  topSellers(): Promise<{ item: MenuItem; count: number }[]>;
}

// ---------------------------------------------------------------------------
// In-memory store: the zero-config default. State lives on globalThis so it
// survives Next.js hot-reloads in dev. Swap for SupabaseStore in production
// (see supabase-store.ts) by setting SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
// ---------------------------------------------------------------------------

interface MemoryState {
  categories: Category[];
  items: MenuItem[];
  users: Map<string, UserProfile>;
  orders: Order[];
  seq: number;
}

function codeSeq(code: string): number {
  const n = parseInt(code.replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

function seedOrder(
  seed: QueueSeed | { code: string; items: QueueSeed["items"] },
  items: MenuItem[],
  opts: { userId: string | null; customerName: string; status: OrderStatus; pickupAt: string | null },
): Order {
  const byId = new Map(items.map((i) => [i.id, i]));
  const lines = seed.items
    .map((l) => ({ item: byId.get(l.itemId)!, quantity: l.quantity }))
    .filter((l) => l.item);
  const totals = computeTotals(lines);
  return {
    id: `order-${seed.code}`,
    code: seed.code,
    userId: opts.userId,
    customerName: opts.customerName,
    status: opts.status,
    pickupType: "asap",
    pickupAt: opts.pickupAt,
    items: buildOrderItems(lines),
    ...totals,
    paymentStatus: "paid",
    createdAt: new Date().toISOString(),
  };
}

function freshState(): MemoryState {
  const items = MENU_ITEMS.map((i) => ({ ...i, allergens: [...i.allergens] }));
  const users = new Map<string, UserProfile>();
  users.set(DEMO_CUSTOMER.id, { ...DEMO_CUSTOMER, allergens: [...DEMO_CUSTOMER.allergens] });
  users.set(DEMO_ADMIN.id, { ...DEMO_ADMIN, allergens: [] });

  const history = PAST_ORDERS.map((o) =>
    seedOrder(o, items, {
      userId: DEMO_CUSTOMER.id,
      customerName: DEMO_CUSTOMER.name,
      status: "pickedup",
      pickupAt: o.date,
    }),
  );
  const queue = ORDER_QUEUE.map((o) =>
    seedOrder(o, items, {
      userId: null,
      customerName: o.customerName,
      status: o.status,
      pickupAt: o.pickupAt,
    }),
  );
  const orders = [...queue, ...history];
  const seq = Math.max(...orders.map((o) => codeSeq(o.code)));
  return {
    categories: CATEGORIES.map((c) => ({ ...c })),
    items,
    users,
    orders,
    seq,
  };
}

const globalRef = globalThis as unknown as { __hpStore?: MemoryState };
function mem(): MemoryState {
  if (!globalRef.__hpStore) globalRef.__hpStore = freshState();
  return globalRef.__hpStore;
}

class InMemoryStore implements Store {
  async listCategories() {
    return [...mem().categories].sort((a, b) => a.sortOrder - b.sortOrder);
  }
  async listMenuItems() {
    return [...mem().items].sort(
      (a, b) => a.categoryId.localeCompare(b.categoryId) || a.sortOrder - b.sortOrder,
    );
  }
  async getMenuItem(id: string) {
    return mem().items.find((i) => i.id === id) ?? null;
  }
  async createMenuItem(input: NewMenuItem) {
    const s = mem();
    const sameCat = s.items.filter((i) => i.categoryId === input.categoryId);
    const item: MenuItem = {
      ...input,
      allergens: [...input.allergens],
      id: `m${Date.now().toString(36)}`,
      sortOrder: input.sortOrder ?? sameCat.length + 1,
    };
    s.items.push(item);
    return item;
  }
  async updateMenuItem(id: string, patch: Partial<MenuItem>) {
    const item = mem().items.find((i) => i.id === id);
    if (!item) return null;
    Object.assign(item, patch);
    if (patch.allergens) item.allergens = [...patch.allergens];
    return item;
  }
  async deleteMenuItem(id: string) {
    const s = mem();
    const before = s.items.length;
    s.items = s.items.filter((i) => i.id !== id);
    return s.items.length < before;
  }

  async getUser(id: string) {
    return mem().users.get(id) ?? null;
  }
  async updateUserAllergens(id: string, allergens: UserProfile["allergens"]) {
    const user = mem().users.get(id);
    if (!user) return null;
    user.allergens = [...allergens];
    return user;
  }

  async createOrder(input: Parameters<Store["createOrder"]>[0]) {
    const s = mem();
    s.seq += 1;
    const totals = computeTotals(input.lines);
    const order: Order = {
      id: `order-${s.seq}`,
      code: `HP-${s.seq}`,
      userId: input.userId,
      customerName: input.customerName,
      contactPhone: input.contactPhone,
      status: "new",
      pickupType: input.pickupType,
      pickupAt: input.pickupAt,
      notes: input.notes,
      items: buildOrderItems(input.lines),
      ...totals,
      paymentStatus: input.paymentStatus,
      paymentRef: input.paymentRef,
      createdAt: new Date().toISOString(),
    };
    s.orders.unshift(order);
    return order;
  }
  async getOrderByCode(code: string) {
    return mem().orders.find((o) => o.code === code) ?? null;
  }
  async setOrderPayment(id: string, status: Order["paymentStatus"], ref?: string) {
    const order = mem().orders.find((o) => o.id === id);
    if (!order) return null;
    order.paymentStatus = status;
    if (ref) order.paymentRef = ref;
    return order;
  }
  async listOrdersByUser(userId: string) {
    return mem()
      .orders.filter((o) => o.userId === userId)
      .sort((a, b) => codeSeq(b.code) - codeSeq(a.code));
  }
  async listQueue() {
    return [...mem().orders].sort((a, b) => codeSeq(b.code) - codeSeq(a.code));
  }
  async advanceOrderStatus(id: string) {
    const order = mem().orders.find((o) => o.id === id);
    if (!order) return null;
    order.status = nextStatus(order.status);
    return order;
  }

  async topSellers() {
    const byId = new Map(mem().items.map((i) => [i.id, i]));
    return TOP_SELLERS.map((t) => ({ item: byId.get(t.itemId)!, count: t.count })).filter(
      (t) => t.item,
    );
  }
}

let instance: Store | null = null;

/** Returns the process-wide store. Wire SupabaseStore here when creds exist. */
export function getStore(): Store {
  if (!instance) instance = new InMemoryStore();
  return instance;
}
