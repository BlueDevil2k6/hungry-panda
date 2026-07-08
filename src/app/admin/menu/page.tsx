"use client";

import { useCallback, useEffect, useState } from "react";
import type { AllergenId, Category, MenuItem } from "@/domain/types";
import { ALLERGENS, ALLERGEN_LABEL } from "@/domain/allergens";
import { formatCents } from "@/domain/pricing";
import { gradFor } from "@/components/store/chrome";
import { IconEdit, IconX } from "@/components/icons";

interface EditForm {
  id?: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  allergens: AllergenId[];
  available: boolean;
}

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [editing, setEditing] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    const r = await fetch("/api/admin/items");
    if (r.ok) setItems((await r.json()).items);
  }, []);

  useEffect(() => {
    (async () => {
      const menu = await fetch("/api/menu").then((r) => r.json());
      setCats(menu.categories ?? []);
      await refresh();
    })();
  }, [refresh]);

  function openNew() {
    setEditing({
      name: "",
      description: "",
      categoryId: cats[0]?.id ?? "dumplings",
      price: 0,
      allergens: [],
      available: true,
    });
  }
  function openEdit(item: MenuItem) {
    setEditing({
      id: item.id,
      name: item.name,
      description: item.description,
      categoryId: item.categoryId,
      price: item.priceCents / 100,
      allergens: [...item.allergens],
      available: item.available,
    });
  }

  async function toggleAvail(item: MenuItem) {
    await fetch(`/api/admin/items/${item.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ available: !item.available }),
    });
    refresh();
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    const body = {
      name: editing.name,
      description: editing.description,
      categoryId: editing.categoryId,
      price: editing.price,
      allergens: editing.allergens,
      available: editing.available,
    };
    const res = editing.id
      ? await fetch(`/api/admin/items/${editing.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        })
      : await fetch("/api/admin/items", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });
    setSaving(false);
    if (res.ok) {
      setEditing(null);
      refresh();
    }
  }

  function toggleAllergen(id: AllergenId) {
    setEditing((e) =>
      e
        ? {
            ...e,
            allergens: e.allergens.includes(id)
              ? e.allergens.filter((a) => a !== id)
              : [...e.allergens, id],
          }
        : e,
    );
  }

  const catName = (id: string) => cats.find((c) => c.id === id)?.name ?? id;

  return (
    <>
      <div className="card">
        <div className="panel-head">
          <div>
            <h3>Menu items</h3>
            <div className="muted" style={{ fontSize: ".84rem", marginTop: 2 }}>
              Edit names, prices, descriptions, allergens &amp; availability.
              Changes go live on the storefront instantly.
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={openNew}>
            + New item
          </button>
        </div>
        <div className="tbl-scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Allergens</th>
                <th>Price</th>
                <th>Available</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="mi">
                      <div
                        className="th"
                        style={{ background: `linear-gradient(140deg,${gradFor(m.categoryId)})` }}
                      >
                        {m.emoji}
                      </div>
                      <div>
                        <div className="nm">{m.name}</div>
                        <div className="ct">{m.description.slice(0, 42)}…</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="muted">{catName(m.categoryId)}</span>
                  </td>
                  <td>
                    <div className="allglist" style={{ maxWidth: 220 }}>
                      {m.allergens.length ? (
                        m.allergens.map((a) => (
                          <span className="allg" key={a}>
                            {ALLERGEN_LABEL[a]}
                          </span>
                        ))
                      ) : (
                        <span className="muted" style={{ fontSize: ".82rem" }}>
                          None
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="price tabnum">{formatCents(m.priceCents)}</td>
                  <td>
                    <button
                      className="switch"
                      aria-pressed={m.available}
                      aria-label="Toggle availability"
                      onClick={() => toggleAvail(m)}
                    />
                  </td>
                  <td>
                    <button className="lnk" onClick={() => openEdit(m)}>
                      <IconEdit /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div
          className="modal-scrim show"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditing(null);
          }}
        >
          <div className="modal wide" role="dialog" aria-modal="true">
            <div className="mhead">
              <h3>{editing.id ? "Edit item" : "New menu item"}</h3>
              <button className="icon-btn" onClick={() => setEditing(null)}>
                <IconX />
              </button>
            </div>
            <div className="mbody">
              <div className="field">
                <label>Dish name</label>
                <input
                  className="input"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Description</label>
                <textarea
                  className="input"
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                />
              </div>
              <div className="grid2">
                <div className="field">
                  <label>Category</label>
                  <select
                    className="input"
                    value={editing.categoryId}
                    onChange={(e) =>
                      setEditing({ ...editing, categoryId: e.target.value })
                    }
                  >
                    {cats.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Price ($)</label>
                  <input
                    className="input"
                    type="number"
                    step="0.5"
                    value={editing.price}
                    onChange={(e) =>
                      setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div className="field">
                <label>Contains allergens</label>
                <div className="allglist" style={{ gap: 7 }}>
                  {ALLERGENS.map((a) => {
                    const on = editing.allergens.includes(a.id);
                    return (
                      <button
                        type="button"
                        key={a.id}
                        className="allg"
                        data-hit={on ? "1" : "0"}
                        style={{ cursor: "pointer", fontSize: ".74rem", padding: "5px 11px" }}
                        onClick={() => toggleAllergen(a.id)}
                      >
                        {a.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <label
                className="allergen-toggle"
                style={{ margin: "6px 0 18px" }}
                onClick={() => setEditing({ ...editing, available: !editing.available })}
              >
                <span className="switch" aria-pressed={editing.available} />
                <span className="lbl">
                  Available for ordering
                  <span className="ex">
                    Turn off to 86 the item (hidden as “sold out”)
                  </span>
                </span>
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="btn btn-ghost"
                  style={{ flex: 1 }}
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={save}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
