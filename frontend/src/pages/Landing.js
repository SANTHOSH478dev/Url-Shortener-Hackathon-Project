import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Landing.css";

const features = [
  {
    icon: "⚡",
    title: "Instant Shortening",
    desc: "Turn long, messy URLs into short, shareable links in a click.",
  },
  {
    icon: "📊",
    title: "Detailed Analytics",
    desc: "Track total clicks, recent visits, devices, and trends over time.",
  },
  {
    icon: "🎯",
    title: "Custom Aliases",
    desc: "Create branded, memorable short links for your campaigns.",
  },
  {
    icon: "📱",
    title: "QR Codes",
    desc: "Generate scannable QR codes for every short link instantly.",
  },
  {
    icon: "⏳",
    title: "Link Expiry",
    desc: "Set expiry dates so old links automatically stop working.",
  },
  {
    icon: "🔒",
    title: "Secure & Private",
    desc: "Your links are protected — only you can manage them.",
  },
];

const steps = [
  {
    n: "01",
    title: "Paste your link",
    desc: "Drop in any long URL — campaign links, docs, anything.",
  },
  {
    n: "02",
    title: "Get a short link",
    desc: "SnapLink generates a clean, shareable link in an instant.",
  },
  {
    n: "03",
    title: "Watch it perform",
    desc: "See clicks, devices, and trends roll in on your dashboard.",
  },
];

const DEMO_LONG_URL =
  "https://www.example.com/products/summer-sale/2026?ref=newsletter&utm_campaign=launch";
const DEMO_SHORT_URL = "snap.link/sUmm3r";

/** Signature hero element: a mock browser bar that types a long URL,
 *  "shortens" it, and reveals the resulting short link on a loop. */
const LinkDemo = () => {
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState("typing"); // typing -> shortening -> done -> reset

  useEffect(() => {
    let timeout;
    if (phase === "typing") {
      if (typed.length < DEMO_LONG_URL.length) {
        timeout = setTimeout(
          () => setTyped(DEMO_LONG_URL.slice(0, typed.length + 1)),
          28,
        );
      } else {
        timeout = setTimeout(() => setPhase("shortening"), 600);
      }
    } else if (phase === "shortening") {
      timeout = setTimeout(() => setPhase("done"), 900);
    } else if (phase === "done") {
      timeout = setTimeout(() => setPhase("reset"), 2600);
    } else if (phase === "reset") {
      setTyped("");
      timeout = setTimeout(() => setPhase("typing"), 400);
    }
    return () => clearTimeout(timeout);
  }, [phase, typed]);

  return (
    <div className="link-demo">
      <div className="link-demo-glow" />
      <div className="link-demo-window">
        <div className="link-demo-titlebar">
          <span className="link-demo-dot" style={{ background: "#ef4444" }} />
          <span className="link-demo-dot" style={{ background: "#fbbf24" }} />
          <span className="link-demo-dot" style={{ background: "#10b981" }} />
        </div>
        <div className="link-demo-body">
          <div className="link-demo-row">
            <span className="link-demo-label">Original URL</span>
            <div className="link-demo-field text-mono">
              <span>{typed}</span>
              <span className="link-demo-caret" />
            </div>
          </div>

          <div
            className={`link-demo-arrow ${phase === "shortening" ? "spinning" : ""}`}
          >
            {phase === "shortening" ? "⏳" : "🔗"}
          </div>

          <div className="link-demo-row">
            <span className="link-demo-label">Short link</span>
            <div
              className={`link-demo-field link-demo-result text-mono ${phase === "done" ? "revealed" : ""}`}
            >
              {phase === "done" ? DEMO_SHORT_URL : "—"}
              {phase === "done" && (
                <span className="link-demo-badge">Copied ✓</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-bg-shapes" aria-hidden="true">
          <span className="shape shape-1">🔗</span>
          <span className="shape shape-2">⛓️</span>
          <span className="shape shape-3">🔗</span>
          <span className="shape shape-4">✨</span>
          <span className="shape shape-5">📎</span>
        </div>

        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="hero-eyebrow animate-in">
              URL Shortener &amp; Link Analytics
            </span>
            <h1 className="animate-in" style={{ animationDelay: "0.05s" }}>
              Shorten links. <br />
              <span className="hero-highlight">Track everything.</span>
            </h1>
            <p
              className="hero-subtitle animate-in"
              style={{ animationDelay: "0.1s" }}
            >
              SnapLink helps you create short, trackable links with powerful
              built-in analytics — clicks, devices, trends, and more.
            </p>
            <div
              className="hero-actions animate-in"
              style={{ animationDelay: "0.15s" }}
            >
              {user ? (
                <Link to="/dashboard" className="btn btn-primary">
                  Go to Dashboard →
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="btn btn-primary">
                    Get Started Free
                  </Link>
                  <Link to="/login" className="btn btn-secondary">
                    Log In
                  </Link>
                </>
              )}
            </div>
          </div>

          <div
            className="hero-demo animate-in"
            style={{ animationDelay: "0.2s" }}
          >
            <LinkDemo />
          </div>
        </div>
      </section>

      <section className="steps container">
        <h2 className="section-title">Three steps to a smarter link</h2>
        <div className="steps-grid">
          {steps.map((s, i) => (
            <div
              className="step-card"
              key={s.n}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <span className="step-number">{s.n}</span>
              <h3>{s.title}</h3>
              <p className="text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="features container">
        <h2 className="section-title">
          Everything you need to manage your links
        </h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="feature-card card card-padded"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p className="text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {!user && (
        <section className="cta container">
          <div className="cta-card">
            <h2>Ready to snap your links into shape?</h2>
            <p>
              Create a free account and start tracking your first link in under
              a minute.
            </p>
            <Link to="/signup" className="btn btn-primary">
              Create your account
            </Link>
          </div>
        </section>
      )}

      <footer className="landing-footer">
        <div className="container">
          <p>🔗 SnapLink — Built for the Katomaran Hackathon</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
