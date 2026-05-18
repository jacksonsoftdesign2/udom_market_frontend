import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/upmarket_logo.png";
import slide1Img from "../../assets/Slide1.png";
import slide2Img from "../../assets/Slide2.png";
import slide3Img from "../../assets/Slide3.png";
import slide4Img from "../../assets/Slide4.png";

// Google Font loader — Dancing Script for italic script parts
function useDancingScript() {
  useEffect(() => {
    const href = "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Montserrat:wght@900&display=swap";
    if (!document.querySelector(`link[href="${href}"]`)) {
      const l = document.createElement("link");
      l.rel = "stylesheet"; l.href = href;
      document.head.appendChild(l);
    }
  }, []);
}

// ── Slide 1 — Green paper fold ──────────────────────────────────────
function Slide1({ onCta }) {
  useDancingScript();
  return (
    <div className="relative w-full h-full" style={{ background: "#1a7a3c", fontFamily: "Arial, sans-serif" }}>

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 680 160" preserveAspectRatio="none">
        <polygon points="148,0 680,0 680,160 108,160" fill="#f2f1ec"/>
        <polygon points="148,0 680,0 680,160 114,160" fill="#e5e5e0" opacity="0.4"/>
        <line x1="200" y1="0" x2="164" y2="160" stroke="#ccc" strokeWidth="1" opacity="0.5"/>
        <line x1="290" y1="0" x2="254" y2="160" stroke="#ccc" strokeWidth="0.8" opacity="0.3"/>
        <line x1="380" y1="0" x2="344" y2="160" stroke="#ccc" strokeWidth="0.7" opacity="0.2"/>
        <polygon points="530,0 680,0 680,160 568,160" fill="#1a7a3c" opacity="0.95"/>
        {[560,576,592,608,624].map(x => [30,46,62,78].map(y =>
          x <= 560 + (4 - [30,46,62,78].indexOf(y)) * 16
            ? <circle key={`${x}${y}`} cx={x} cy={y} r="3" fill="#fff" opacity="0.35"/>
            : null
        ))}
        <rect x="0" y="134" width="680" height="26" fill="#0e5c26"/>
      </svg>

      {/* LEFT: Logo */}
      <div className="absolute z-10" style={{
        left: 0, top: 0, width: 140, bottom: 26,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        <img
          src={logo}
          alt="UDOM Market"
          style={{ width: 56, height: 56, objectFit: "contain" }}
        />
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#fff", fontSize: 11, fontWeight: 900, letterSpacing: "1.5px", fontFamily: "'Montserrat', sans-serif" }}>UDOM</div>
          <div style={{ color: "#4ade80", fontSize: 8, fontWeight: 700, letterSpacing: "2px", fontFamily: "'Montserrat', sans-serif" }}>MARKET</div>
        </div>
      </div>

      {/* CENTER: Headline */}
      <div className="absolute z-10" style={{ left: 158, top: 10 }}>
        <div style={{ fontSize: 13, fontStyle: "italic", color: "#333", fontFamily: "'Dancing Script', cursive", lineHeight: 1.3 }}>We are</div>
        <div style={{ fontSize: 22, fontStyle: "italic", color: "#cc1a1a", fontFamily: "'Dancing Script', cursive", lineHeight: 1.1 }}>Creative Digital</div>
        <div style={{ fontSize: 44, fontWeight: 900, color: "#111", fontFamily: "'Montserrat', Arial, sans-serif", lineHeight: 0.9, letterSpacing: "-2px", marginTop: 2 }}>Campus</div>
        <div style={{ fontSize: 30, fontWeight: 900, color: "#1a7a3c", fontFamily: "'Montserrat', Arial, sans-serif", lineHeight: 1, letterSpacing: "-1px" }}>Marketplace</div>
      </div>

      {/* RIGHT: Slide1 image */}
      <div className="absolute z-10" style={{
        right: 0, top: 0, bottom: 26, width: 140,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        overflow: "hidden",
      }}>
        <img
          src={slide1Img}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
        />
      </div>

      {/* BOTTOM BAR */}
      <div className="absolute z-10" style={{
        bottom: 0, left: 0, right: 0, height: 26,
        display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 14px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <button
            onClick={onCta}
            style={{ background: "#fff", color: "#0e5c26", fontSize: 7.5, fontWeight: 900, padding: "3.5px 12px", borderRadius: 3, border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: ".7px" }}
          >
            Register Now
          </button>
          <div style={{ width: 16, height: 16, background: "#26a84e", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="white"><polygon points="2,1 7,4 2,7"/></svg>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.07 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
          </svg>
          <span style={{ color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: ".4px" }}>+255 748 399 067</span>
        </div>
      </div>

    </div>
  );
}

// ── Slide 2 — Red geometric diagonal ───────────────────────────────
function Slide2({ onCta }) {
  return (
    <div className="relative w-full h-full" style={{ background: "#fff", fontFamily: "Arial, sans-serif", border: "1px solid #eee" }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 680 160" preserveAspectRatio="none">
        {/* left red diagonal */}
        <polygon points="0,0 232,0 180,160 0,160" fill="#cc1a1a" />
        {/* right red diagonal */}
        <polygon points="680,0 518,0 555,160 680,160" fill="#cc1a1a" opacity="0.88" />
        {/* circle frame */}
        <circle cx="498" cy="74" r="58" fill="none" stroke="#cc1a1a" strokeWidth="2.5" />
        <circle cx="498" cy="74" r="52" fill="#f5f5f5" />
        {/* small decorative shapes */}
        <rect x="318" y="14" width="24" height="9" rx="4.5" fill="#cc1a1a" opacity="0.13" />
        <polygon points="308,112 323,130 293,130" fill="none" stroke="#cc1a1a" strokeWidth="1.5" opacity="0.18" />
        <rect x="348" y="100" width="10" height="10" rx="1" fill="none" stroke="#cc1a1a" strokeWidth="1" opacity="0.15" />
        {/* dot grids */}
        {[16, 28, 40].map(x => [112, 124].map(y => <circle key={`l${x}${y}`} cx={x} cy={y} r="1.8" fill="#fff" opacity="0.3" />))}
        {[602, 616, 630, 644].map(x => [16, 28].map(y => <circle key={`r${x}${y}`} cx={x} cy={y} r="1.8" fill="#444" opacity="0.1" />))}
        {/* bottom line */}
        <line x1="0" y1="159.5" x2="680" y2="159.5" stroke="#e5e5e5" strokeWidth="1" />
      </svg>

      {/* Brand top-left on red */}
      <div className="absolute z-10" style={{ left: 12, top: 9, display: "flex", alignItems: "center", gap: 5 }}>
        <div style={{ width: 20, height: 20, background: "#fff", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="11" height="11" viewBox="0 0 12 12"><polygon points="6,1 11,6 6,11 1,6" fill="#cc1a1a" /></svg>
        </div>
        <div>
          <div style={{ color: "#fff", fontSize: 8.5, fontWeight: 800, lineHeight: 1, letterSpacing: ".3px" }}>UDOM MARKET</div>
          <div style={{ color: "#ffbbbb", fontSize: 6.5, lineHeight: 1 }}>your campus marketplace</div>
        </div>
      </div>

      {/* Main text */}
      <div className="absolute z-10" style={{ left: 12, top: 34, maxWidth: 295 }}>
        <div style={{ fontSize: 16, fontWeight: 400, color: "#222", lineHeight: 1.2 }}>We Are</div>
        <div style={{ fontSize: 33, fontWeight: 900, color: "#cc1a1a", lineHeight: 1, letterSpacing: "-1px" }}>Campus</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: "#111", lineHeight: 1, letterSpacing: "-.5px" }}>Marketplace</div>
        <div style={{ fontSize: 7.5, color: "#666", marginTop: 5, lineHeight: 1.65, maxWidth: 210 }}>
          Buy directly with verified traders — fast, safe, and local. Fresh products listed daily — food, clothes, services &amp; more.
        </div>
        <button
          onClick={onCta}
          style={{ marginTop: 7, background: "#cc1a1a", color: "#fff", fontSize: 7.5, fontWeight: 700, padding: "4px 13px", borderRadius: 3, letterSpacing: ".3px", border: "none", cursor: "pointer" }}
        >
          Contact Us
        </button>
      </div>

      {/* Circle photo placeholder */}
      <div className="absolute z-10" style={{ left: 446, top: 22, width: 104, height: 104, borderRadius: "50%", background: "#ebebeb", overflow: "hidden", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        <svg width="68" height="82" viewBox="0 0 68 82">
          <ellipse cx="34" cy="20" rx="16" ry="16" fill="#d0d0d0" />
          <path d="M6,82 Q6,48 34,42 Q62,48 62,82Z" fill="#d0d0d0" />
        </svg>
      </div>

      {/* Bottom bar */}
      <div className="absolute z-10" style={{ bottom: 0, left: 0, right: 0, height: 22, background: "#f8f8f8", borderTop: "1px solid #ececec", display: "flex", alignItems: "center", gap: 12, padding: "0 13px" }}>
        <span style={{ fontSize: 7.5, color: "#444" }}>📞 +255 748 399 067</span>
        <span style={{ fontSize: 7.5, color: "#444" }}>✉ jacksonduwanghe@gmail.com</span>
        <span style={{ fontSize: 7.5, color: "#444" }}>🌐 www.udommarket.co.tz</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 3 }}>
          {[["f","#3b5998"],["ig","#e1306c"],["tw","#1da1f2"]].map(([label,bg]) => (
            <div key={label} style={{ width: 15, height: 15, background: bg, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: label === "f" ? 8 : 6.5, fontWeight: 700 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Slide 3 — Blue wave left, text right ───────────────────────────
function Slide3({ onCta }) {
  return (
    <div className="relative w-full h-full" style={{ background: "#fff", fontFamily: "Arial, sans-serif", border: "1px solid #eee" }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 680 160" preserveAspectRatio="none">
        <path d="M0,0 L375,0 Q312,80 375,160 L0,160 Z" fill="#1a3a8f" />
        <path d="M0,0 L332,0 Q272,80 332,160 L0,160 Z" fill="#1e47b0" />
        <path d="M0,0 L282,0 Q228,80 282,160 L0,160 Z" fill="#2255cc" opacity="0.35" />
        {[432,452,472,492].map(x => [22,40].map(y => <circle key={`d${x}${y}`} cx={x} cy={y} r="2" fill="#1a3a8f" opacity="0.1" />))}
      </svg>

      {/* Logo */}
      <div className="absolute z-10" style={{ left: 14, top: 8, display: "flex", alignItems: "center", gap: 5 }}>
        <svg width="13" height="13" viewBox="0 0 13 13"><polygon points="2,11 6.5,2 11,11" fill="#22c55e" /></svg>
        <span style={{ color: "#fff", fontSize: 9.5, fontWeight: 700, letterSpacing: ".2px" }}>UDOM MARKET</span>
      </div>

      {/* SHOP NOW pill */}
      <div className="absolute z-10" style={{ left: 22, top: 40 }}>
        <button
          onClick={onCta}
          style={{ background: "#1a3a8f", border: "2px solid #5a8aff", color: "#fff", fontSize: 7.5, fontWeight: 800, padding: "5px 12px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 5, letterSpacing: ".5px", cursor: "pointer" }}
        >
          SHOP NOW
          <div style={{ width: 13, height: 13, background: "#22c55e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="6" height="6" viewBox="0 0 6 6" fill="white"><polygon points="1,1 5.5,3 1,5" /></svg>
          </div>
        </button>
      </div>

      {/* Phone + website */}
      <div className="absolute z-10" style={{ left: 22, top: 68 }}>
        <div style={{ color: "#fff", fontSize: 11.5, fontWeight: 800, letterSpacing: ".2px" }}>+255 748 399 067</div>
        <div style={{ color: "#93c5fd", fontSize: 7, marginTop: 1 }}>www.udommarket.co.tz</div>
      </div>

      {/* Bottom paragraph */}
      <div className="absolute z-10" style={{ left: 14, bottom: 8, maxWidth: 238 }}>
        <div style={{ color: "#9ab8f0", fontSize: 6.8, lineHeight: 1.65 }}>
          Buy directly with verified campus traders. Fresh products listed daily — food, clothes, services &amp; more from trusted UDOM sellers available 24hrs.
        </div>
      </div>

      {/* Right: headline */}
      <div className="absolute z-10" style={{ right: 14, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "right", maxWidth: 305 }}>
        <div style={{ fontSize: 10.5, fontWeight: 400, color: "#666", lineHeight: 1.3 }}>We're Creative</div>
        <div style={{ fontSize: 35, fontWeight: 900, color: "#1a3a8f", lineHeight: 1, letterSpacing: "-1.5px" }}>Campus</div>
        <div style={{ fontSize: 30, fontWeight: 900, color: "#22c55e", lineHeight: 1, letterSpacing: "-1px" }}>Marketplace</div>
        <div style={{ fontSize: 21, fontWeight: 700, color: "#555", lineHeight: 1, letterSpacing: "-.3px" }}>platform</div>
      </div>
    </div>
  );
}

// ── Slide 4 — Dark blue, 3D green spheres, services list ───────────
function Slide4({ onCta }) {
  return (
    <div className="relative w-full h-full" style={{ background: "#0a1f6e", fontFamily: "Arial, sans-serif" }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 680 160" preserveAspectRatio="none">
        <defs>
          <radialGradient id="sg1" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#16a34a" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#052e10" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="sg2" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#15803d" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#042010" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="sg3" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#166534" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#052e10" stopOpacity="1" />
          </radialGradient>
        </defs>
        {/* subtle glow */}
        <ellipse cx="180" cy="80" rx="200" ry="105" fill="#1a3aaa" opacity="0.32" />
        {/* green bottom border */}
        <rect x="0" y="153" width="680" height="7" fill="#22c55e" />
        {/* sphere bottom-left large */}
        <circle cx="52" cy="124" r="24" fill="#1a6e1a" />
        <circle cx="52" cy="124" r="24" fill="url(#sg1)" opacity="0.92" />
        <circle cx="43" cy="115" r="7.5" fill="#5eff5e" opacity="0.32" />
        {/* sphere bottom-left small */}
        <circle cx="90" cy="138" r="14" fill="#156b15" />
        <circle cx="90" cy="138" r="14" fill="url(#sg2)" opacity="0.88" />
        <circle cx="85" cy="132" r="4.5" fill="#5eff5e" opacity="0.28" />
        {/* sphere top-right */}
        <circle cx="626" cy="52" r="28" fill="#1a6e1a" />
        <circle cx="626" cy="52" r="28" fill="url(#sg3)" opacity="0.92" />
        <circle cx="616" cy="41" r="10" fill="#5eff5e" opacity="0.32" />
      </svg>

      {/* Logo top-left */}
      <div className="absolute z-10" style={{ left: 14, top: 8, display: "flex", alignItems: "center", gap: 5 }}>
        <svg width="13" height="13" viewBox="0 0 13 13"><polygon points="2,11 6.5,2 11,11" fill="#22c55e" /></svg>
        <span style={{ color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: ".2px" }}>UDOM MARKET</span>
      </div>

      {/* Social icons top-right */}
      <div className="absolute z-10" style={{ right: 12, top: 8, display: "flex", alignItems: "center", gap: 4 }}>
        {[["f"],["ig"],["tw"]].map(([label]) => (
          <div key={label} style={{ width: 20, height: 20, background: "#22c55e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: label === "f" ? 9 : 7, fontWeight: 700 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Left: headline */}
      <div className="absolute z-10" style={{ left: 14, top: 28, maxWidth: 290 }}>
        <div style={{ fontSize: 10, fontWeight: 400, color: "#cce0ff", lineHeight: 1.3 }}>We're Creative</div>
        <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-1px" }}>Campus</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#22c55e", lineHeight: 1, letterSpacing: "-1px" }}>Marketplace</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1, letterSpacing: "-.3px", opacity: .85 }}>platform</div>
      </div>

      {/* Right: OUR SERVICES + list + CTA */}
      <div className="absolute z-10" style={{ right: 52, top: 22, maxWidth: 222 }}>
        <div style={{ color: "#22c55e", fontSize: 11, fontWeight: 800, letterSpacing: ".8px", marginBottom: 6 }}>OUR SERVICES</div>
        <div style={{ fontSize: 8, lineHeight: 2 }}>
          {["Digital Marketing","Business Analysis","Strategy and Planning","Market Research"].map(s => (
            <div key={s}><span style={{ color: "#22c55e", marginRight: 5 }}>●</span><span style={{ color: "#e0f0ff" }}>{s}</span></div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
          <button
            onClick={onCta}
            style={{ background: "#22c55e", color: "#fff", fontSize: 7, fontWeight: 800, padding: "4px 10px", borderRadius: 20, letterSpacing: ".4px", display: "inline-flex", alignItems: "center", gap: 4, border: "none", cursor: "pointer" }}
          >
            VIEW DETAILS
            <svg width="6" height="6" viewBox="0 0 6 6" fill="white"><polygon points="1,1 5.5,3 1,5" /></svg>
          </button>
          <div>
            <div style={{ color: "#fff", fontSize: 8.5, fontWeight: 700, letterSpacing: ".2px" }}>+255 748 399 067</div>
            <div style={{ color: "#93c5fd", fontSize: 6.5 }}>www.udommarket.co.tz</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Slide config ────────────────────────────────────────────────────
const SLIDES = [
  { id: 0, component: Slide1 },
  { id: 1, component: Slide2 },
  { id: 2, component: Slide3 },
  { id: 3, component: Slide4 },
];

// ── AdBanner (main export) ──────────────────────────────────────────
function AdBanner({ onCtaClick }) {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 4500);
    return () => clearInterval(id);
  }, []);

  const CurrentSlide = SLIDES[slide].component;

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-xl mb-5 select-none"
      style={{ height: 160 }}>

      {/* Slide */}
      <div className="w-full h-full">
        <CurrentSlide onCta={() => onCtaClick(slide)} />
      </div>

      {/* Dot indicators */}
      <div className="absolute z-20 flex gap-1.5"
        style={{ bottom: 10, left: "50%", transform: "translateX(-50%)" }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            style={{
              height: 6,
              width: i === slide ? 20 : 6,
              borderRadius: 3,
              background: i === slide ? "#fff" : "rgba(255,255,255,0.4)",
              border: "none",
              cursor: "pointer",
              transition: "all .3s",
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default AdBanner;
