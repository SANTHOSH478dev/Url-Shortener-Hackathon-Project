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

  // Safe user values
  const userName = user?.name || "User";
  const firstName = userName.split(" ")[0];
  const avatar = userName.charAt(0).toUpperCase();

  return (
    <header className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="container navbar-inner">
        <Link
          to="/"
          className="navbar-brand"
          onClick={() => setMenuOpen(false)}
        >
          <span className="navbar-logo">🔗</span>
          <span className="navbar-brand-text">SnapLink</span>
        </Link>

        <button
          className={`navbar-toggle ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
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
                className={`navbar-link ${
                  isActive("/dashboard") ? "active" : ""
                }`}
              >
                Dashboard
              </Link>

              <div className="navbar-user">
                <div className="navbar-user-avatar">{avatar}</div>
                <span>Hi, {firstName}</span>
              </div>

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
                className={`navbar-link ${
                  isActive("/login") ? "active" : ""
                }`}
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="btn btn-primary btn-sm"
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
