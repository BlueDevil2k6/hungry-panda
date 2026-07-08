"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app-provider";
import { ALLERGEN_LABEL } from "@/domain/allergens";
import { formatCents } from "@/domain/pricing";
import { IconGoogle } from "@/components/icons";

export default function CheckoutPage() {
  const { user, cartLines, totals, openSignin, signOut, placeOrder } = useApp();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [pickup, setPickup] = useState<"asap" | "scheduled">("asap");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (user) {
      setName((n) => n || user.name);
      setPhone((p) => p || user.phone || "");
    }
  }, [user]);

  const empty = cartLines.length === 0;

  async function submit() {
    if (empty || placing) return;
    setPlacing(true);
    const order = await placeOrder({
      customerName: name.trim() || user?.name || "Guest",
      contactPhone: phone.trim() || undefined,
      pickupType: pickup,
      pickupAt: pickup === "scheduled" ? "Scheduled" : null,
      notes: notes.trim() || undefined,
    });
    setPlacing(false);
    if (order) router.push(`/order/${order.code}`);
  }

  return (
    <div className="wrap">
      <div style={{ paddingTop: 26 }}>
        <Link className="btn btn-ghost btn-sm" href="/menu">
          ← Back to menu
        </Link>
      </div>
      <div className="checkout-layout">
        <div className="co-main">
          <div className="panel card">
            {user ? (
              <>
                <h2>Checking out as</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                  <span className="avatar" style={{ width: 44, height: 44 }}>
                    {user.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700 }}>{user.name}</div>
                    <div className="muted" style={{ fontSize: ".86rem" }}>
                      {user.email}
                      {user.allergens.length > 0 && (
                        <>
                          {" · "}
                          <span style={{ color: "var(--brand-deep)", fontWeight: 600 }}>
                            {user.allergens.map((a) => ALLERGEN_LABEL[a]).join(", ")} allergens on
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ marginLeft: "auto" }}
                    onClick={signOut}
                  >
                    Not you?
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>How would you like to check out?</h2>
                <p className="sub">
                  Sign in to save this order and reorder later, or continue as a
                  guest.
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button
                    className="btn btn-google"
                    style={{ flex: 1, minWidth: 200, height: 50 }}
                    onClick={() => openSignin("customer")}
                  >
                    <IconGoogle /> Sign in with Google
                  </button>
                  <span
                    className="btn btn-ghost"
                    style={{ flex: 1, minWidth: 160, height: 50 }}
                  >
                    Continuing as guest
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="panel card">
            <h2>Pickup details</h2>
            <p className="sub">Hungry Panda · 88 Lantern Street — collect in store</p>
            <div className="field">
              <label>When would you like it?</label>
              <div className="seg" role="group">
                <button
                  aria-pressed={pickup === "asap"}
                  onClick={() => setPickup("asap")}
                >
                  ASAP · ~20 min
                </button>
                <button
                  aria-pressed={pickup === "scheduled"}
                  onClick={() => setPickup("scheduled")}
                >
                  Schedule a time
                </button>
              </div>
            </div>
            <div className="grid2">
              <div className="field">
                <label htmlFor="co-name">Name for the order</label>
                <input
                  id="co-name"
                  className="input"
                  placeholder="e.g. Priya A."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="co-phone">Mobile (for ready text)</label>
                <input
                  id="co-phone"
                  className="input"
                  placeholder="+1 555 018 2245"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="co-notes">Kitchen notes (optional)</label>
              <textarea
                id="co-notes"
                className="input"
                placeholder="Extra chili on the side, no coriander…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="panel card">
            <h2>Payment</h2>
            <p className="sub">Encrypted &amp; processed by Stripe. We never store your card.</p>
            <div className="pay-methods">
              <button className="pay-btn apple">Apple&nbsp;Pay</button>
              <button className="pay-btn">Google&nbsp;Pay</button>
            </div>
            <div className="pay-divider">or pay with card</div>
            <div className="field">
              <label>Card number</label>
              <div className="card-input">
                <input
                  className="input"
                  placeholder="1234 1234 1234 1234"
                  style={{ paddingRight: 96 }}
                />
                <div className="brands">
                  <span>💳</span>
                </div>
              </div>
            </div>
            <div className="grid2">
              <div className="field">
                <label>Expiry</label>
                <input className="input" placeholder="MM / YY" />
              </div>
              <div className="field">
                <label>CVC</label>
                <input className="input" placeholder="•••" />
              </div>
            </div>
            <div className="stripe-badge">
              🔒 Secured by{" "}
              <strong style={{ color: "var(--ink-soft)", marginLeft: 2 }}>Stripe</strong>
            </div>
          </div>
        </div>

        <aside>
          <div
            className="panel card"
            style={{ position: "sticky", top: "calc(var(--header-h) + 16px)" }}
          >
            <h2>Your order</h2>
            {empty ? (
              <p className="muted">
                Your cart is empty.{" "}
                <Link className="lnk" href="/menu">
                  Add dishes →
                </Link>
              </p>
            ) : (
              <>
                {cartLines.map((l) => (
                  <div className="summary-item" key={l.item.id}>
                    <span>
                      <span className="q tabnum">{l.quantity}×</span> {l.item.name}
                    </span>
                    <span className="price">
                      {formatCents(l.item.priceCents * l.quantity)}
                    </span>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid var(--line)", margin: "12px 0" }} />
                <div className="summary-item">
                  <span className="muted">Subtotal</span>
                  <span className="tabnum">{formatCents(totals.subtotalCents)}</span>
                </div>
                <div className="summary-item">
                  <span className="muted">Tax (8.5%)</span>
                  <span className="tabnum">{formatCents(totals.taxCents)}</span>
                </div>
                <div
                  className="summary-item"
                  style={{ fontSize: "1.15rem", fontWeight: 700, fontFamily: "var(--font-display)" }}
                >
                  <span>Total</span>
                  <span className="tabnum">{formatCents(totals.totalCents)}</span>
                </div>
                <button
                  className="btn btn-primary btn-block"
                  style={{ height: 52, marginTop: 14 }}
                  disabled={placing}
                  onClick={submit}
                >
                  {placing
                    ? "Placing order…"
                    : `Pay ${formatCents(totals.totalCents)} & place order`}
                </button>
                <p className="muted" style={{ fontSize: ".76rem", textAlign: "center", margin: "12px 0 0" }}>
                  🥡 Pickup at Hungry Panda · 88 Lantern Street
                </p>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
