"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppProvider, useApp } from "@/components/app-provider";
import { ALLERGENS } from "@/domain/allergens";
import { formatCents } from "@/domain/pricing";
import {
  IconBowl,
  IconCart,
  IconCheck,
  IconGoogle,
  IconMinus,
  IconPlus,
  IconShield,
  IconX,
} from "@/components/icons";

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Header() {
  const { user, cartCount, avoided, openCart, openAllergens, openSignin } = useApp();
  const dots = avoided.length ? Math.min(avoided.length, 3) : 1;
  return (
    <header className="cust-header">
      <div className="wrap bar">
        <Link className="brand" href="/">
          <span className="mark">
            <IconBowl />
          </span>
          Hungry&nbsp;Panda
        </Link>
        <nav className="nav">
          <Link href="/">Home</Link>
          <Link href="/menu">Menu</Link>
        </nav>
        <div className="header-right">
          <button
            className="allergy-pill"
            data-none={avoided.length ? "0" : "1"}
            onClick={openAllergens}
          >
            <IconShield />
            <span className="dotset">
              {Array.from({ length: dots }).map((_, i) => (
                <i key={i} />
              ))}
            </span>
            <span>
              {avoided.length
                ? `${avoided.length} allergen${avoided.length > 1 ? "s" : ""}`
                : "Set allergies"}
            </span>
          </button>
          <button className="icon-btn" onClick={openCart} aria-label="Open cart">
            <IconCart />
            <span className="cart-count" data-empty={cartCount ? "0" : "1"}>
              {cartCount}
            </span>
          </button>
          {user ? (
            <Link className="avatar" href="/account" title={user.name}>
              {initials(user.name)}
            </Link>
          ) : (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => openSignin("customer")}
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function CartDrawer() {
  const { cartOpen, closeCart, cartLines, totals, add, dec, removeLine } = useApp();
  const router = useRouter();
  return (
    <>
      <div className={`scrim ${cartOpen ? "show" : ""}`} onClick={closeCart} />
      <aside className={`drawer ${cartOpen ? "show" : ""}`} aria-label="Your cart">
        <header>
          <h3>Your order</h3>
          <button className="icon-btn" onClick={closeCart} aria-label="Close">
            <IconX />
          </button>
        </header>
        <div className="body">
          {cartLines.length === 0 ? (
            <div className="cart-empty">
              <div className="em">🥡</div>
              <p style={{ marginTop: 10 }}>
                Your order is empty.
                <br />
                Add something delicious from the menu.
              </p>
              <button
                className="btn btn-primary"
                style={{ marginTop: 8 }}
                onClick={() => {
                  closeCart();
                  router.push("/menu");
                }}
              >
                Browse menu
              </button>
            </div>
          ) : (
            cartLines.map((l) => (
              <div className="cart-line" key={l.item.id}>
                <div
                  className="th"
                  style={{
                    background: `linear-gradient(140deg,${l.item ? gradFor(l.item.categoryId) : ""})`,
                  }}
                >
                  {l.item.emoji}
                </div>
                <div>
                  <div className="nm">{l.item.name}</div>
                  <div className="mm">{formatCents(l.item.priceCents)} each</div>
                  <button className="rm" onClick={() => removeLine(l.item.id)}>
                    Remove
                  </button>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="qty-stepper" style={{ marginBottom: 6 }}>
                    <button onClick={() => dec(l.item.id)} aria-label="Remove one">
                      <IconMinus />
                    </button>
                    <span>{l.quantity}</span>
                    <button onClick={() => add(l.item.id)} aria-label="Add one">
                      <IconPlus />
                    </button>
                  </div>
                  <div className="price">
                    {formatCents(l.item.priceCents * l.quantity)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {cartLines.length > 0 && (
          <div className="foot">
            <div className="totals">
              <div className="r">
                <span className="muted">Subtotal</span>
                <span className="tabnum">{formatCents(totals.subtotalCents)}</span>
              </div>
              <div className="r">
                <span className="muted">Tax (8.5%)</span>
                <span className="tabnum">{formatCents(totals.taxCents)}</span>
              </div>
              <div className="r grand">
                <span>Total</span>
                <span className="tabnum">{formatCents(totals.totalCents)}</span>
              </div>
            </div>
            <button
              className="btn btn-primary btn-block"
              style={{ height: 50 }}
              onClick={() => {
                closeCart();
                router.push("/checkout");
              }}
            >
              Go to checkout · {formatCents(totals.totalCents)}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

function AllergenModal() {
  const { allergenOpen, closeAllergens, avoided, toggleAllergen, user } = useApp();
  return (
    <div
      className={`modal-scrim ${allergenOpen ? "show" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAllergens();
      }}
    >
      <div className="modal wide" role="dialog" aria-modal="true">
        <div className="mhead">
          <h3>What can&apos;t you eat?</h3>
          <button className="icon-btn" onClick={closeAllergens}>
            <IconX />
          </button>
        </div>
        <div className="mbody">
          <p className="muted" style={{ marginTop: 0 }}>
            Select your allergens. Dishes containing them are flagged across the
            menu and blocked from your cart.{" "}
            {user ? "Saved to your profile." : "Stored on this device as a guest."}
          </p>
          <div
            className="allergen-grid"
            style={{ gridTemplateColumns: "repeat(2,1fr)", margin: "16px 0" }}
          >
            {ALLERGENS.map((a) => {
              const on = avoided.includes(a.id);
              return (
                <button
                  key={a.id}
                  className="allergen-toggle"
                  aria-pressed={on}
                  onClick={() => toggleAllergen(a.id)}
                >
                  <span className="box">
                    <IconCheck />
                  </span>
                  <span className="lbl">
                    {a.label}
                    <span className="ex">{a.example}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <button className="btn btn-primary btn-block" onClick={closeAllergens}>
            Save &amp; see safe dishes
          </button>
        </div>
      </div>
    </div>
  );
}

function SignInModal() {
  const { signinOpen, closeSignin, signInGoogle } = useApp();
  return (
    <div
      className={`modal-scrim ${signinOpen ? "show" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeSignin();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <div className="signin-hero">
          <div className="mark">
            <IconBowl />
          </div>
          <h3>Welcome to Hungry Panda</h3>
          <p>Sign in to reorder favourites and keep your allergens saved.</p>
        </div>
        <div className="mbody">
          <button
            className="btn btn-google btn-block"
            style={{ height: 50 }}
            onClick={signInGoogle}
          >
            <IconGoogle /> Continue with Google
          </button>
          <div className="pay-divider">or</div>
          <button className="btn btn-ghost btn-block" onClick={closeSignin}>
            Continue as guest
          </button>
          <p
            className="muted"
            style={{ fontSize: ".76rem", textAlign: "center", margin: "16px 0 4px" }}
          >
            By continuing you agree to our Terms &amp; Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

function Toast() {
  const { toastMsg } = useApp();
  return (
    <div className={`toast ${toastMsg ? "show" : ""}`}>
      {toastMsg && (
        <>
          <IconCheck />
          <span>{toastMsg}</span>
        </>
      )}
    </div>
  );
}

function EscapeToClose() {
  const { closeCart, closeAllergens, closeSignin } = useApp();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeCart();
        closeAllergens();
        closeSignin();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeCart, closeAllergens, closeSignin]);
  return null;
}

// gradient lookup mirrors the seed categories (kept local to avoid a server import)
const GRADS: Record<string, string> = {
  dumplings: "#F4D8A6,#E3AC57",
  bao: "#F3CBB6,#D68B66",
  noodles: "#F0BCAC,#C4664F",
  rice: "#CDE3C2,#7BA766",
  sides: "#BEE0D3,#6BB598",
  sweets: "#F0CDDC,#C687AE",
  drinks: "#CFE0EE,#87B2D4",
};
export function gradFor(categoryId: string): string {
  return GRADS[categoryId] ?? "#E7DCC7,#CFC3AC";
}

export function StoreChrome({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <EscapeToClose />
      <Header />
      <main>{children}</main>
      <CartDrawer />
      <AllergenModal />
      <SignInModal />
      <Toast />
    </AppProvider>
  );
}
