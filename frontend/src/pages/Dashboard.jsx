import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Boxes,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  LayoutDashboard,
} from "lucide-react";

import api from "../services/api";

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/dashboard/");
      setData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const lowStockItems = Array.isArray(data?.low_stock_items)
    ? data.low_stock_items
    : [];
  const totalProducts = data?.total_products ?? 0;
  const totalQuantity = data?.total_quantity ?? data?.total_stock_quantity ?? 0;
  const lowStockCount = data?.low_stock_count ?? lowStockItems.length;

  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <span className="eyebrow">OVERVIEW</span>
          <h1 className="page-title-with-icon dashboard-page-title">
            <span className="page-title-icon dashboard-title-icon">
              <LayoutDashboard size={23} />
            </span>
            Dashboard
          </h1>
          <p>Here's what's happening with your inventory.</p>
        </div>

        <button
          type="button"
          className={`secondary-button refresh-button ${loading ? "is-refreshing" : ""}`}
          onClick={loadDashboard}
          disabled={loading}
          aria-busy={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && <div className="page-error">{error}</div>}

      {loading ? (
        <div className="loading-panel">Loading your dashboard...</div>
      ) : (
        <>
          <section className="stats-grid">
            <article className="stat-card stat-card-products">
              <div className="stat-card-top">
                <div className="stat-icon stat-icon-purple">
                  <Package size={21} />
                </div>
                <span className="stat-label stat-label-products">PRODUCTS</span>
              </div>
              <strong className="stat-value">{formatNumber(totalProducts)}</strong>
              <span className="stat-caption">Total products registered</span>
            </article>

            <article className="stat-card stat-card-units">
              <div className="stat-card-top">
                <div className="stat-icon stat-icon-blue">
                  <Boxes size={21} />
                </div>
                <span className="stat-label stat-label-units">UNITS IN STOCK</span>
              </div>
              <strong className="stat-value">{formatNumber(totalQuantity)}</strong>
              <span className="stat-caption">Total quantity across products</span>
            </article>

            <article className="stat-card stat-card-low-stock">
              <div className="stat-card-top">
                <div className="stat-icon stat-icon-red">
                  <AlertTriangle size={21} />
                </div>
                <span className="stat-label stat-label-low-stock">LOW STOCK</span>
              </div>
              <strong className="stat-value">{formatNumber(lowStockCount)}</strong>
              <span className="stat-caption">Products needing attention</span>
            </article>
          </section>

          <section className="content-panel low-stock-panel">
            <div className="panel-heading">
              <div>
                <h2 className="low-stock-heading">Low stock alerts</h2>
                <p>Products that have reached their stock threshold.</p>
              </div>
              <Link to="/products" className="text-link">
                View products <ArrowUpRight size={16} />
              </Link>
            </div>

            {lowStockItems.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Boxes size={25} />
                </div>
                <h3>Everything looks good</h3>
                <p>There are no low-stock products to show right now.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Available quantity</th>
                      <th>Low-stock threshold</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.map((item) => (
                      <tr key={item.id || item.sku}>
                        <td className="low-stock-product-name">{item.name}</td>
                        <td>{item.sku}</td>
                        <td>{formatNumber(item.quantity_on_hand)}</td>
                        <td>{formatNumber(item.low_stock_threshold)}</td>
                        <td>
                          <span className="status-pill status-low">Low stock</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
