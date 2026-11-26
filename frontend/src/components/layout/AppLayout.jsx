import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldAlert,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import StockFlowLogo from "../brand/StockFlowLogo";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.email ||
    "Workspace user";

  const closeMenu = () => setMobileMenuOpen(false);

  const confirmLogout = () => {
    setLogoutDialogOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    if (!logoutDialogOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setLogoutDialogOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [logoutDialogOpen]);

  return (
    <div className="app-shell">
      {mobileMenuOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={closeMenu}
        />
      )}

      <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <StockFlowLogo className="sidebar-brand-mark" />
          <span className="sidebar-brand-name">StockFlow</span>

          <button
            className="mobile-close"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <NavLink
            to="/dashboard"
            onClick={closeMenu}
            className={({ isActive }) =>
              `nav-link nav-link-dashboard ${isActive ? "nav-link-active" : ""}`
            }
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/products"
            onClick={closeMenu}
            className={({ isActive }) =>
              `nav-link nav-link-products ${isActive ? "nav-link-active" : ""}`
            }
          >
            <Package size={19} />
            <span>Products</span>
          </NavLink>

          <NavLink
            to="/settings"
            onClick={closeMenu}
            className={({ isActive }) =>
              `nav-link nav-link-settings ${isActive ? "nav-link-active" : ""}`
            }
          >
            <Settings size={19} />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="user-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <strong>{displayName}</strong>
              <span>Administrator</span>
            </div>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={() => setLogoutDialogOpen(true)}
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>

          <div className="topbar-title topbar-intro-text">
            Inventory workspace
          </div>

          <div className="topbar-account topbar-intro-text">
            <StockFlowLogo className="topbar-brand-mark" />
            <div className="topbar-status-dot" />
            <span>Workspace active</span>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {logoutDialogOpen && (
        <div
          className="logout-confirm-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setLogoutDialogOpen(false);
            }
          }}
        >
          <section
            className="logout-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
            aria-describedby="logout-dialog-description"
          >
            <div className="logout-dialog-icon">
              <ShieldAlert size={25} />
            </div>
            <h2 id="logout-dialog-title">Leaving StockFlow?</h2>
            <p id="logout-dialog-description">
              Are you sure you want to sign out of your inventory workspace?
            </p>
            <div className="logout-confirm-actions">
              <button
                type="button"
                className="logout-no-button"
                onClick={() => setLogoutDialogOpen(false)}
                autoFocus
              >
                <X size={16} />
                No, stay
              </button>
              <button
                type="button"
                className="logout-yes-button"
                onClick={confirmLogout}
              >
                <LogOut size={16} />
                Yes, sign out
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
