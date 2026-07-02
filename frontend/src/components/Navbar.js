import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="container navbar-inner">
        <Link
          to="/"
          className="navbar-brand"
          onClick={() => setMenuOpen(false)}
        >
          <span className="navbar-logo">
            <span className="navbar-logo-ring" />
            🔗
          </span>
          <span className="navbar-brand-text">SnapLink</span>
        </Link>

        <button
          className={`navbar-toggle ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`navbar-links ${menuOpen ? "open" : ""}`}>
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`navbar-link ${isActive("/dashboard") ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <span className="navbar-user">
                <span className="navbar-user-avatar">
                  {user.name?.charAt(0)?.toUpperCase() || "?"}
                </span>
                Hi, user?.name?.split(" ")[0] || "User"
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`navbar-link ${isActive("/login") ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="btn btn-primary btn-sm"
                onClick={() => setMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
