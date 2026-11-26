import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Package,
  RefreshCw,
  Cable,
  Mouse,
  Keyboard,
  Laptop,
  Smartphone,
  Headphones,
  Camera,
  Watch,
  Shirt,
  Coffee,
  Monitor,
  Gamepad2,
  HardDrive,
  Printer,
  Tablet,
  BatteryCharging,
  Boxes,
} from "lucide-react";

import api from "../services/api";

const emptyForm = {
  name: "",
  sku: "",
  description: "",
  quantity_on_hand: "0",
  cost_price: "0",
  selling_price: "0",
  low_stock_threshold: "",
};

const PRODUCT_ICON_RULES = [
  { pattern: /cable|charger|wire/i, Icon: Cable, kind: "cable" },
  { pattern: /mouse/i, Icon: Mouse, kind: "mouse" },
  { pattern: /keyboard/i, Icon: Keyboard, kind: "keyboard" },
  { pattern: /laptop|notebook/i, Icon: Laptop, kind: "laptop" },
  { pattern: /phone|mobile/i, Icon: Smartphone, kind: "phone" },
  { pattern: /headphone|headset|earbud/i, Icon: Headphones, kind: "audio" },
  { pattern: /camera|webcam/i, Icon: Camera, kind: "camera" },
  { pattern: /watch/i, Icon: Watch, kind: "watch" },
  { pattern: /shirt|tshirt|clothing|apparel/i, Icon: Shirt, kind: "clothing" },
  { pattern: /coffee|mug|cup/i, Icon: Coffee, kind: "drinkware" },
  { pattern: /monitor|display|screen/i, Icon: Monitor, kind: "monitor" },
  { pattern: /game|controller|console/i, Icon: Gamepad2, kind: "gaming" },
  { pattern: /drive|storage|ssd|hard.?disk/i, Icon: HardDrive, kind: "storage" },
  { pattern: /printer/i, Icon: Printer, kind: "printer" },
  { pattern: /tablet|ipad/i, Icon: Tablet, kind: "tablet" },
  { pattern: /battery|power.?bank/i, Icon: BatteryCharging, kind: "battery" },
];

const FALLBACK_PRODUCT_ICONS = [
  { Icon: Package, kind: "package" },
  { Icon: Boxes, kind: "boxes" },
  { Icon: Monitor, kind: "monitor" },
  { Icon: Smartphone, kind: "phone" },
  { Icon: HardDrive, kind: "storage" },
  { Icon: Headphones, kind: "audio" },
];

const ICON_TONES = ["violet", "blue", "teal", "orange", "rose", "green"];

function getProductIcon(product) {
  const searchableText = [product.name, product.sku, product.description]
    .filter(Boolean)
    .join(" ");

  const matchedRule = PRODUCT_ICON_RULES.find((rule) =>
    rule.pattern.test(searchableText)
  );

  const identity = `${product.id || ""}-${product.sku || ""}-${product.name || ""}`;
  const hash = Array.from(identity).reduce(
    (total, character) => total + character.charCodeAt(0),
    0
  );

  const iconDetails =
    matchedRule || FALLBACK_PRODUCT_ICONS[hash % FALLBACK_PRODUCT_ICONS.length];

  return { ...iconDetails, tone: ICON_TONES[hash % ICON_TONES.length] };
}

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function getErrorMessage(error) {
  const detail = error.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((item) => item.msg).join(", ");
  return "Something went wrong. Please try again.";
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [addAuraActive, setAddAuraActive] = useState(false);
  const auraTimerRef = useRef(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/products/");
      const result = response.data;
      setProducts(Array.isArray(result) ? result : result.items || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    return () => {
      if (auraTimerRef.current) clearTimeout(auraTimerRef.current);
    };
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    if (!searchValue) return products;

    return products.filter((product) =>
      product.name?.toLowerCase().includes(searchValue) ||
      product.sku?.toLowerCase().includes(searchValue) ||
      product.description?.toLowerCase().includes(searchValue)
    );
  }, [products, search]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const openAddModal = () => {
    if (auraTimerRef.current) clearTimeout(auraTimerRef.current);
    setAddAuraActive(true);

    auraTimerRef.current = setTimeout(() => {
      setAddAuraActive(false);
      setEditingId(null);
      setForm(emptyForm);
      setError("");
      setModalOpen(true);
      auraTimerRef.current = null;
    }, 480);
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      sku: product.sku || "",
      description: product.description || "",
      quantity_on_hand: String(product.quantity_on_hand ?? 0),
      cost_price: String(product.cost_price ?? 0),
      selling_price: String(product.selling_price ?? 0),
      low_stock_threshold:
        product.low_stock_threshold === null ||
        product.low_stock_threshold === undefined
          ? ""
          : String(product.low_stock_threshold),
    });
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      description: form.description.trim() || null,
      quantity_on_hand: Number(form.quantity_on_hand),
      cost_price: Number(form.cost_price),
      selling_price: Number(form.selling_price),
      low_stock_threshold:
        form.low_stock_threshold.trim() === ""
          ? null
          : Number(form.low_stock_threshold),
    };

    try {
      if (editingId) {
        await api.put(`/api/products/${editingId}`, payload);
      } else {
        await api.post("/api/products/", payload);
      }
      setModalOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadProducts();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setError("");
    try {
      await api.delete(`/api/products/${product.id}`);
      await loadProducts();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <span className="eyebrow">INVENTORY</span>
          <h1 className="page-title-with-icon products-page-title">
            <span className="page-title-icon products-title-icon">
              <Package size={23} />
            </span>
            Products
          </h1>
          <p>Manage your product catalogue and stock quantities.</p>
        </div>

        <button
          type="button"
          className={`primary-button add-product-button ${addAuraActive ? "add-product-aura-active" : ""}`}
          onClick={openAddModal}
          disabled={addAuraActive}
        >
          <Plus size={18} />
          <span>Add product</span>
          <span className="stock-box-aura" aria-hidden="true">
            <Package className="aura-box aura-box-one" size={19} />
            <Package className="aura-box aura-box-two" size={16} />
            <Package className="aura-box aura-box-three" size={17} />
          </span>
        </button>
      </div>

      {error && !modalOpen && <div className="page-error">{error}</div>}

      <section className="content-panel products-panel">
        <div className="product-toolbar">
          <div className="search-field search-field-animated">
            <Search size={18} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by product name or SKU..."
              aria-label="Search products"
            />
          </div>

          <button
            type="button"
            className={`secondary-button refresh-button ${loading ? "is-refreshing" : ""}`}
            onClick={loadProducts}
            disabled={loading}
            aria-busy={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="loading-panel">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Package size={25} /></div>
            <h3>{search ? "No matching products" : "No products yet"}</h3>
            <p>
              {search
                ? "Try another product name or SKU."
                : "Add your first product to start managing your inventory."}
            </p>
            {!search && (
              <button type="button" className="primary-button" onClick={openAddModal}>
                <Plus size={17} /> Add your first product
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Quantity</th>
                  <th>Cost price</th>
                  <th>Selling price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const iconDetails = getProductIcon(product);
                  const ProductIcon = iconDetails.Icon;

                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="product-name-cell">
                          <div
                            className={`product-mini-icon product-icon-${iconDetails.kind} product-icon-tone-${iconDetails.tone}`}
                            title={`${iconDetails.kind} product`}
                          >
                            <ProductIcon size={18} strokeWidth={1.9} />
                          </div>
                          <div>
                            <span className="table-primary">{product.name}</span>
                            {product.description && <small>{product.description}</small>}
                          </div>
                        </div>
                      </td>
                      <td>{product.sku}</td>
                      <td>{Number(product.quantity_on_hand || 0).toLocaleString("en-IN")}</td>
                      <td>{formatCurrency(product.cost_price)}</td>
                      <td>{formatCurrency(product.selling_price)}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="icon-button edit-product-button"
                            onClick={() => openEditModal(product)}
                            aria-label={`Edit ${product.name}`}
                            title="Edit product"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-button delete-product-button"
                            onClick={() => handleDelete(product)}
                            aria-label={`Delete ${product.name}`}
                            title="Delete product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="table-footer">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        )}
      </section>

      {modalOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
          >
            <div className="modal-heading">
              <div>
                <span className="eyebrow">
                  {editingId ? "UPDATE INVENTORY" : "NEW INVENTORY ITEM"}
                </span>
                <h2 id="product-modal-title">
                  {editingId ? "Edit product" : "Add product"}
                </h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-field-full">
                <label htmlFor="product-name">Product name</label>
                <input
                  id="product-name"
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  placeholder="e.g. Wireless Mouse"
                  maxLength={255}
                  required
                />
              </div>

              <div className="form-field-full">
                <label htmlFor="product-sku">SKU</label>
                <input
                  id="product-sku"
                  name="sku"
                  value={form.sku}
                  onChange={updateField}
                  placeholder="e.g. WM-001"
                  maxLength={100}
                  required
                />
              </div>

              <div className="form-field-full">
                <label htmlFor="product-description">
                  Description <span className="optional-label">Optional</span>
                </label>
                <textarea
                  id="product-description"
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  placeholder="Add a short product description"
                  rows={3}
                />
              </div>

              <div className="form-two-columns">
                <div>
                  <label htmlFor="product-quantity">Quantity</label>
                  <input
                    id="product-quantity"
                    name="quantity_on_hand"
                    type="number"
                    min="0"
                    step="1"
                    value={form.quantity_on_hand}
                    onChange={updateField}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="product-threshold">Low-stock threshold</label>
                  <input
                    id="product-threshold"
                    name="low_stock_threshold"
                    type="number"
                    min="0"
                    step="1"
                    value={form.low_stock_threshold}
                    onChange={updateField}
                    placeholder="Use organization default"
                  />
                </div>
              </div>

              <div className="form-two-columns">
                <div>
                  <label htmlFor="product-cost">Cost price (₹)</label>
                  <input
                    id="product-cost"
                    name="cost_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.cost_price}
                    onChange={updateField}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="product-selling">Selling price (₹)</label>
                  <input
                    id="product-selling"
                    name="selling_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.selling_price}
                    onChange={updateField}
                    required
                  />
                </div>
              </div>

              {error && <div className="form-error">{error}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Save changes" : "Create product"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
