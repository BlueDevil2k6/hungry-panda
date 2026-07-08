"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AllergenId, Category, MenuItem, Order } from "@/domain/types";
import { computeTotals, type Totals } from "@/domain/pricing";
import { allergenHits, isBlocked } from "@/domain/allergens";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  allergens: AllergenId[];
  phone?: string;
}

export interface PlaceOrderInput {
  customerName: string;
  contactPhone?: string;
  pickupType: "asap" | "scheduled";
  pickupAt?: string | null;
  notes?: string;
}

interface Ctx {
  ready: boolean;
  categories: Category[];
  items: MenuItem[];
  itemsById: Record<string, MenuItem>;
  user: SessionUser | null;
  avoided: AllergenId[];
  cart: Record<string, number>;
  cartCount: number;
  cartLines: { item: MenuItem; quantity: number }[];
  totals: Totals;
  blockedCount: number;
  isBlocked: (item: MenuItem) => boolean;
  hits: (item: MenuItem) => AllergenId[];

  cartOpen: boolean;
  allergenOpen: boolean;
  signinOpen: boolean;
  signinCtx: "customer" | "admin";
  toastMsg: string | null;
  openCart: () => void;
  closeCart: () => void;
  openAllergens: () => void;
  closeAllergens: () => void;
  openSignin: (ctx: "customer" | "admin") => void;
  closeSignin: () => void;
  showToast: (msg: string) => void;

  add: (id: string) => void;
  dec: (id: string) => void;
  removeLine: (id: string) => void;
  clearCart: () => void;
  toggleAllergen: (id: AllergenId) => void;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  reorder: (code: string) => Promise<void>;
  placeOrder: (input: PlaceOrderInput) => Promise<Order | null>;
}

const AppCtx = createContext<Ctx | null>(null);

export function useApp(): Ctx {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within <AppProvider>");
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [avoided, setAvoided] = useState<AllergenId[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [allergenOpen, setAllergenOpen] = useState(false);
  const [signinOpen, setSigninOpen] = useState(false);
  const [signinCtx, setSigninCtx] = useState<"customer" | "admin">("customer");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [menuRes, sessRes] = await Promise.all([
        fetch("/api/menu").then((r) => r.json()),
        fetch("/api/session").then((r) => r.json()),
      ]);
      setCategories(menuRes.categories ?? []);
      setItems(menuRes.items ?? []);
      try {
        const c = JSON.parse(localStorage.getItem("hp_cart") ?? "{}");
        if (c && typeof c === "object") setCart(c);
      } catch {}
      if (sessRes.user) {
        setUser(sessRes.user);
        setAvoided(sessRes.user.allergens ?? []);
      } else {
        try {
          const a = JSON.parse(localStorage.getItem("hp_avoided") ?? "[]");
          if (Array.isArray(a)) setAvoided(a);
        } catch {}
      }
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem("hp_cart", JSON.stringify(cart));
      } catch {}
    }
  }, [cart, ready]);

  useEffect(() => {
    if (ready && !user) {
      try {
        localStorage.setItem("hp_avoided", JSON.stringify(avoided));
      } catch {}
    }
  }, [avoided, user, ready]);

  const itemsById = useMemo(
    () => Object.fromEntries(items.map((i) => [i.id, i])),
    [items],
  );
  const isBlk = useCallback((it: MenuItem) => isBlocked(it, avoided), [avoided]);
  const hits = useCallback((it: MenuItem) => allergenHits(it, avoided), [avoided]);
  const cartLines = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, q]) => ({ item: itemsById[id], quantity: q }))
        .filter((l) => l.item),
    [cart, itemsById],
  );
  const totals = useMemo(() => computeTotals(cartLines), [cartLines]);
  const cartCount = useMemo(
    () => Object.values(cart).reduce((a, b) => a + b, 0),
    [cart],
  );
  const blockedCount = useMemo(() => items.filter(isBlk).length, [items, isBlk]);

  const showToast = useCallback((m: string) => setToastMsg(m), []);
  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 2200);
    return () => clearTimeout(t);
  }, [toastMsg]);

  // Prune anything blocked/unavailable from the cart whenever allergens change.
  useEffect(() => {
    if (!ready) return;
    setCart((c) => {
      let changed = false;
      const n = { ...c };
      for (const id of Object.keys(n)) {
        const it = itemsById[id];
        if (!it || !it.available || isBlocked(it, avoided)) {
          delete n[id];
          changed = true;
        }
      }
      return changed ? n : c;
    });
  }, [avoided, itemsById, ready]);

  const add = useCallback(
    (id: string) => {
      const it = itemsById[id];
      if (!it || !it.available || isBlk(it)) return;
      setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
      showToast(`Added ${it.name}`);
    },
    [itemsById, isBlk, showToast],
  );
  const dec = useCallback((id: string) => {
    setCart((c) => {
      const n = { ...c };
      if (!n[id]) return n;
      n[id] -= 1;
      if (n[id] <= 0) delete n[id];
      return n;
    });
  }, []);
  const removeLine = useCallback((id: string) => {
    setCart((c) => {
      const n = { ...c };
      delete n[id];
      return n;
    });
  }, []);
  const clearCart = useCallback(() => setCart({}), []);

  const toggleAllergen = useCallback(
    (id: AllergenId) => {
      setAvoided((prev) => {
        const next = prev.includes(id)
          ? prev.filter((a) => a !== id)
          : [...prev, id];
        if (user) {
          fetch("/api/me/allergens", {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ allergens: next }),
          }).catch(() => {});
        }
        return next;
      });
    },
    [user],
  );

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const openAllergens = useCallback(() => setAllergenOpen(true), []);
  const closeAllergens = useCallback(() => setAllergenOpen(false), []);
  const openSignin = useCallback((ctx: "customer" | "admin") => {
    setSigninCtx(ctx);
    setSigninOpen(true);
  }, []);
  const closeSignin = useCallback(() => setSigninOpen(false), []);

  const signInGoogle = useCallback(async () => {
    const r = await fetch("/api/auth/google", { method: "POST" });
    if (!r.ok) return;
    const { user: u } = await r.json();
    setUser(u);
    setAvoided(u.allergens ?? []);
    setSigninOpen(false);
    showToast(`Signed in as ${u.name}`);
  }, [showToast]);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    setUser(null);
    setAvoided([]);
    showToast("Signed out");
  }, [showToast]);

  const reorder = useCallback(
    async (code: string) => {
      const r = await fetch(`/api/me/orders/${code}/reorder`, { method: "POST" });
      if (!r.ok) return;
      const { add: toAdd, skipped } = await r.json();
      setCart((c) => {
        const n = { ...c };
        for (const l of toAdd) n[l.itemId] = (n[l.itemId] ?? 0) + l.quantity;
        return n;
      });
      showToast(
        skipped.length
          ? `Added — ${skipped.length} item(s) skipped for allergens`
          : "Order added to cart",
      );
      setCartOpen(true);
    },
    [showToast],
  );

  const placeOrder = useCallback(
    async (input: PlaceOrderInput): Promise<Order | null> => {
      const lines = Object.entries(cart).map(([itemId, quantity]) => ({
        itemId,
        quantity,
      }));
      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...input, lines, avoided }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        showToast(e.error ?? "Could not place order");
        return null;
      }
      const { order } = await r.json();
      setCart({});
      return order as Order;
    },
    [cart, avoided, showToast],
  );

  const value: Ctx = {
    ready,
    categories,
    items,
    itemsById,
    user,
    avoided,
    cart,
    cartCount,
    cartLines,
    totals,
    blockedCount,
    isBlocked: isBlk,
    hits,
    cartOpen,
    allergenOpen,
    signinOpen,
    signinCtx,
    toastMsg,
    openCart,
    closeCart,
    openAllergens,
    closeAllergens,
    openSignin,
    closeSignin,
    showToast,
    add,
    dec,
    removeLine,
    clearCart,
    toggleAllergen,
    signInGoogle,
    signOut,
    reorder,
    placeOrder,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
