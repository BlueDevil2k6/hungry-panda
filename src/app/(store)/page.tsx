"use client";

import Link from "next/link";
import { useApp } from "@/components/app-provider";
import { gradFor } from "@/components/store/chrome";
import { IconAlert, IconShield, IconStar } from "@/components/icons";

export default function HomePage() {
  const { categories, avoided, openAllergens } = useApp();
  const hasAllergens = avoided.length > 0;

  return (
    <div className="wrap">
      <section className="hero">
        <div className="inner">
          <div>
            <span className="kicker">Pan-Asian kitchen · Pickup in 20 min</span>
            <h1>
              Dumplings, bao &amp; noodles — <em>ordered your way.</em>
            </h1>
            <p>
              Hand-folded and wok-tossed to order. Tell us what you&apos;re
              allergic to once, and we&apos;ll only ever show you what&apos;s safe
              to eat.
            </p>
            <div className="cta">
              <Link className="btn btn-primary" href="/menu">
                Start an order
              </Link>
              <button className="btn btn-ghost" onClick={openAllergens}>
                Set my allergies
              </button>
            </div>
            <div className="hero-badges">
              <span>
                <IconStar /> 4.9 · 2,300+ reviews
              </span>
              <span>🌱 30+ plant-based dishes</span>
              <span>⚡ Pickup in ~20 minutes</span>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="big">🐼</div>
            <div className="float" style={{ top: "12%", left: "12%" }}>
              🥟
            </div>
            <div className="float" style={{ top: "20%", right: "14%" }}>
              🍜
            </div>
            <div className="float" style={{ bottom: "16%", left: "16%" }}>
              🧋
            </div>
            <div className="float" style={{ bottom: "12%", right: "12%" }}>
              🥢
            </div>
          </div>
        </div>
      </section>

      <section className="pad">
        <div className="sec-head">
          <div>
            <span className="eyebrow">The menu</span>
            <h2>Explore by craving</h2>
          </div>
          <Link className="btn btn-ghost btn-sm" href="/menu">
            See full menu →
          </Link>
        </div>
        <div className="cat-grid">
          {categories.map((c) => (
            <Link
              key={c.id}
              className="cat-card"
              href={`/menu#cat-${c.id}`}
            >
              <div
                className="thumb"
                style={{ background: `linear-gradient(140deg,${gradFor(c.id)})` }}
              >
                {c.emoji}
              </div>
              <div className="meta">
                <h3>{c.name}</h3>
                <p>{c.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="pad" style={{ paddingTop: 8 }}>
        <div
          className="allergy-banner"
          data-active={hasAllergens ? "1" : "0"}
          style={{ padding: "22px 26px" }}
        >
          <div className="ic">{hasAllergens ? <IconAlert /> : <IconShield />}</div>
          <div className="t">
            <strong style={{ fontSize: "1.1rem" }}>Allergy-safe by design</strong>
            <p style={{ fontSize: ".95rem", maxWidth: "70ch" }}>
              Save your allergens to your profile (or as a guest) and every dish
              that contains them is clearly flagged and can&apos;t be added to
              your cart — so a wrong order never leaves the kitchen.
            </p>
          </div>
          <button className="btn btn-soft btn-sm" onClick={openAllergens}>
            Manage allergens
          </button>
        </div>
      </section>

      <section className="pad" style={{ paddingTop: 8 }}>
        <div className="sec-head">
          <div>
            <span className="eyebrow">How it works</span>
            <h2>From craving to counter</h2>
          </div>
        </div>
        <div className="steps">
          <div className="step card">
            <div className="n">1</div>
            <h3>Build your order</h3>
            <p>
              Browse topics, add dishes, adjust quantities. Items with your
              allergens stay locked.
            </p>
          </div>
          <div className="step card">
            <div className="n">2</div>
            <h3>Sign in or guest</h3>
            <p>
              Sign in with Google to reorder favourites in one tap, or check out
              as a guest.
            </p>
          </div>
          <div className="step card">
            <div className="n">3</div>
            <h3>Pay &amp; pick up</h3>
            <p>
              Pay securely with card or Apple&nbsp;Pay. We&apos;ll text you the
              moment it&apos;s ready.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
