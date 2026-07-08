"use client";

import { useApp } from "@/components/app-provider";
import { gradFor } from "@/components/store/chrome";
import { ALLERGEN_LABEL } from "@/domain/allergens";
import { formatCents } from "@/domain/pricing";
import type { MenuItem } from "@/domain/types";
import {
  IconAlert,
  IconLeaf,
  IconMinus,
  IconPlus,
  IconShield,
  IconStar,
} from "@/components/icons";

function AddControl({ item }: { item: MenuItem }) {
  const { cart, add, dec } = useApp();
  const qty = cart[item.id] ?? 0;
  if (!item.available) return null;
  if (qty === 0) {
    return (
      <button className="btn btn-primary btn-sm" onClick={() => add(item.id)}>
        <IconPlus /> Add
      </button>
    );
  }
  return (
    <div className="qty-stepper">
      <button onClick={() => dec(item.id)} aria-label="Remove one">
        <IconMinus />
      </button>
      <span>{qty}</span>
      <button onClick={() => add(item.id)} aria-label="Add one">
        <IconPlus />
      </button>
    </div>
  );
}

function ItemCard({ item }: { item: MenuItem }) {
  const { avoided, isBlocked, hits } = useApp();
  const blocked = isBlocked(item);
  const hitList = hits(item);
  return (
    <article
      className="item"
      data-blocked={blocked ? "1" : "0"}
      data-sold={item.available ? "0" : "1"}
    >
      <div
        className="thumb"
        style={{ background: `linear-gradient(140deg,${gradFor(item.categoryId)})` }}
      >
        {item.emoji}
        {item.popular && (
          <span className="pop chip chip-pop">
            <IconStar /> Popular
          </span>
        )}
      </div>
      <div className="body">
        <div className="row1">
          <span className="name">{item.name}</span>
        </div>
        <div className="desc">{item.description}</div>
        <div className="tags">
          {item.vegetarian && (
            <span className="chip chip-veg">
              <IconLeaf /> Plant-based
            </span>
          )}
          {item.spiceLevel > 0 && (
            <span className="chip chip-spice">{"🌶️".repeat(item.spiceLevel)}</span>
          )}
          {item.allergens.length > 0 ? (
            <div className="allglist">
              {item.allergens.map((a) => (
                <span key={a} className="allg" data-hit={avoided.includes(a) ? "1" : "0"}>
                  {ALLERGEN_LABEL[a]}
                </span>
              ))}
            </div>
          ) : (
            <span
              className="allg"
              style={{
                background: "var(--brand-tint)",
                color: "var(--brand-ink)",
                borderColor: "var(--brand-tint2)",
              }}
            >
              ✓ No listed allergens
            </span>
          )}
        </div>
        <div className="block-note">
          <IconAlert />
          <span>
            Contains{" "}
            {hitList.map((a) => ALLERGEN_LABEL[a].toLowerCase()).join(", ")} —
            blocked from your order
          </span>
        </div>
        <div className="foot">
          <span className="price">{formatCents(item.priceCents)}</span>
          <span className="soldout-note">Sold out today</span>
          <span className="add-wrap">
            <AddControl item={item} />
          </span>
        </div>
      </div>
    </article>
  );
}

export default function MenuPage() {
  const { categories, items, avoided, blockedCount, openAllergens } = useApp();
  const hasAllergens = avoided.length > 0;

  return (
    <div className="wrap">
      <div className="menu-layout">
        <aside className="menu-side">
          <div className="side-title">Menu topics</div>
          {categories.map((c) => (
            <a key={c.id} href={`#cat-${c.id}`}>
              <span className="em">{c.emoji}</span>
              {c.name}
            </a>
          ))}
        </aside>

        <div>
          <div className="allergy-banner" data-active={hasAllergens ? "1" : "0"}>
            <div className="ic">{hasAllergens ? <IconAlert /> : <IconShield />}</div>
            <div className="t">
              <strong>
                {hasAllergens ? "Ordering with allergies" : "Allergy-safe ordering"}
              </strong>
              <p>
                {hasAllergens ? (
                  <>
                    Flagging <strong>{blockedCount}</strong> dish
                    {blockedCount !== 1 ? "es" : ""} that contain your{" "}
                    {avoided.map((a) => ALLERGEN_LABEL[a].toLowerCase()).join(" & ")}.
                    These are locked from your cart.
                  </>
                ) : (
                  <>
                    No allergens set. Add yours and we&apos;ll flag &amp; lock any
                    dish that isn&apos;t safe for you.
                  </>
                )}
              </p>
            </div>
            <button className="btn btn-soft btn-sm" onClick={openAllergens}>
              {hasAllergens ? "Edit allergens" : "Set allergens"}
            </button>
          </div>

          {categories.map((c) => {
            const catItems = items.filter((i) => i.categoryId === c.id);
            if (catItems.length === 0) return null;
            return (
              <section className="menu-cat" id={`cat-${c.id}`} key={c.id}>
                <h2>
                  <span className="em">{c.emoji}</span>
                  {c.name}
                </h2>
                <div className="items">
                  {catItems.map((it) => (
                    <ItemCard key={it.id} item={it} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
