import { useState, useEffect } from "react";
import slide1Img from "../assets/Slide1.jpeg";
import slide2Img from "../assets/Slide2.jpeg";
import slide3Img from "../assets/Slide3.jpeg";
import slide4Img from "../assets/Slide4.jpeg";

const SLIDES = [
  {
    img: slide1Img,
    cta: "Jisajili Sasa",
    color: "#F5C518",
    shadow: "#9a7c00",
    textColor: "#1a1f6e",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a1f6e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <line x1="19" y1="8" x2="19" y2="14"/>
        <line x1="22" y1="11" x2="16" y2="11"/>
      </svg>
    ),
  },
  {
    img: slide2Img,
    cta: "Wasiliana Nasi",
    color: "#16a34a",
    shadow: "#0a5c22",
    textColor: "#fff",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.07 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
      </svg>
    ),
  },
  {
    img: slide3Img,
    cta: "Nunua Sasa",
    color: "#0ea5e9",
    shadow: "#0369a1",
    textColor: "#fff",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57l1.65-8.43H6"/>
      </svg>
    ),
  },
  {
    img: slide4Img,
    cta: "Wasiliana",
    color: "#dc2626",
    shadow: "#991b1b",
    textColor: "#fff",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
  },
];

export default function AdBanner({ onCtaClick }) {
  const [slide, setSlide] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setSlide(s => (s + 1) % SLIDES.length);
        setFading(false);
      }, 300);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  const goTo = (i) => {
    setFading(true);
    setTimeout(() => { setSlide(i); setFading(false); }, 300);
  };

  const s = SLIDES[slide];

  return (
    <div
      className="relative mb-5 select-none rounded-2xl overflow-hidden shadow-xl"
      style={{ width: "100%", paddingTop: "33.33%", position: "relative" }}
    >
      {/* Image */}
      <img
        src={s.img}
        alt="banner"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "fill",
          opacity: fading ? 0 : 1,
          transition: "opacity 0.3s ease",
          display: "block",
        }}
      />

      {/* 3D CTA Button */}
      <button
        onClick={() => onCtaClick(slide)}
        style={{
          position: "absolute",
          bottom: "10%",
          right: "3%",
          display: "inline-flex",
          alignItems: "center",
          background: s.color,
          border: "none",
          borderRadius: 6,
          padding: 0,
          overflow: "hidden",
          cursor: "pointer",
          boxShadow: `0 5px 0 ${s.shadow}, 0 7px 10px rgba(0,0,0,0.25)`,
          opacity: fading ? 0 : 1,
          transition: "opacity 0.3s ease, transform 0.1s, box-shadow 0.1s",
          fontFamily: "'Montserrat', sans-serif",
          zIndex: 20,
        }}
        onMouseDown={e => {
          e.currentTarget.style.transform = "translateY(4px)";
          e.currentTarget.style.boxShadow = `0 1px 0 ${s.shadow}, 0 2px 4px rgba(0,0,0,0.2)`;
        }}
        onMouseUp={e => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = `0 5px 0 ${s.shadow}, 0 7px 10px rgba(0,0,0,0.25)`;
        }}
      >
        {/* Icon box */}
        <div style={{
          width: "clamp(28px, 3vw, 36px)",
          height: "clamp(28px, 3vw, 36px)",
          background: "rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          {s.icon}
        </div>
        {/* Label */}
        <span style={{
          padding: "0 clamp(8px, 1.5vw, 14px)",
          fontSize: "clamp(9px, 1.3vw, 12px)",
          fontWeight: 800,
          letterSpacing: ".6px",
          textTransform: "uppercase",
          color: s.textColor,
          whiteSpace: "nowrap",
          fontFamily: "'Montserrat', sans-serif",
        }}>
          {s.cta}
        </span>
      </button>

      {/* Dots */}
      <div style={{
        position: "absolute",
        bottom: "5%",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 5,
        zIndex: 20,
      }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              height: 5,
              width: i === slide ? 18 : 5,
              borderRadius: 3,
              background: i === slide ? "#fff" : "rgba(255,255,255,0.5)",
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