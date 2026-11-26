import { useCallback, useEffect, useRef, useState } from "react";
import {
  SlidersHorizontal,
  Save,
  RefreshCw,
  Settings as SettingsIcon,
  Package,
} from "lucide-react";

import api from "../services/api";

export default function Settings() {
  const [threshold, setThreshold] = useState("5");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);
  const animationTimerRef = useRef(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.get("/api/settings/");
      setThreshold(String(response.data.default_low_stock_threshold ?? 5));
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to load organization settings."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    return () => {
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    };
  }, [loadSettings]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setShowSaveAnimation(false);

    const value = Number(threshold);
    if (!Number.isInteger(value) || value < 0) {
      setError("Enter a valid whole number that is zero or greater.");
      return;
    }

    setSaving(true);

    try {
      const response = await api.put("/api/settings/", {
        default_low_stock_threshold: value,
      });

      setThreshold(String(response.data.default_low_stock_threshold ?? value));
      setSuccess("Your inventory settings have been saved.");
      setShowSaveAnimation(true);

      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
      animationTimerRef.current = setTimeout(() => {
        setShowSaveAnimation(false);
        animationTimerRef.current = null;
      }, 3200);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to save your settings."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container settings-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">PREFERENCES</span>
          <h1 className="page-title-with-icon settings-page-title">
            <span className="page-title-icon settings-title-icon">
              <SettingsIcon size={23} />
            </span>
            Settings
          </h1>
          <p>Configure inventory defaults for your organization.</p>
        </div>
      </div>

      <section className="settings-panel">
        <div className="settings-section-heading">
          <div className="settings-icon">
            <SlidersHorizontal size={21} />
          </div>
          <div>
            <h2 className="inventory-settings-title">Inventory settings</h2>
            <p>Set the default threshold used to identify low-stock items.</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-panel">Loading settings...</div>
        ) : (
          <form onSubmit={handleSubmit} className="settings-form">
            <div className="settings-field settings-field-card">
              <label htmlFor="default-threshold">
                Default low-stock threshold
              </label>
              <p>
                Products with no individual threshold will use this value.
                Products with their own threshold will keep that value.
              </p>
              <input
                id="default-threshold"
                type="number"
                min="0"
                step="1"
                value={threshold}
                onChange={(event) => setThreshold(event.target.value)}
                required
              />
            </div>

            {error && <div className="form-error">{error}</div>}
            {success && <div className="form-success">{success}</div>}

            <div className="settings-actions">
              <button
                type="button"
                className={`secondary-button refresh-button settings-reset-button ${loading ? "is-refreshing" : ""}`}
                onClick={loadSettings}
                disabled={saving || loading}
              >
                <RefreshCw size={16} />
                Reset
              </button>
              <button
                type="submit"
                className="primary-button settings-save-button"
                disabled={saving || loading}
              >
                <Save size={17} />
                {saving ? "Saving..." : "Save settings"}
                <span className="save-button-glow" aria-hidden="true" />
              </button>
            </div>
          </form>
        )}
      </section>

      {showSaveAnimation && (
        <div className="settings-delivery-toast" role="status" aria-live="polite">
          <div className="delivery-scene">
            <div className="delivery-paper">
              <span />
              <span />
              <span />
            </div>
            <div className="delivery-box">
              <span className="delivery-box-back" />
              <span className="delivery-box-body" />
              <span className="delivery-box-flap delivery-box-flap-left" />
              <span className="delivery-box-flap delivery-box-flap-right" />
              <span className="delivery-box-tape" />
              <Package className="delivery-box-icon" size={20} />
            </div>
            <span className="delivery-spark delivery-spark-one">✦</span>
            <span className="delivery-spark delivery-spark-two">✧</span>
            <span className="delivery-spark delivery-spark-three">✦</span>
          </div>
          <div className="delivery-message">
            <strong>Settings packed successfully!</strong>
            <span>Your changes are saved and secured.</span>
          </div>
        </div>
      )}
    </div>
  );
}
