import { useState, useEffect } from "react";
import slide1Img from "../assets/Slide1.jpeg";
import slide2Img from "../assets/Slide2.jpeg";
import slide3Img from "../assets/Slide3.jpeg";
import slide4Img from "../assets/Slide4.jpeg";

const SLIDES = [
  { img: slide1Img, cta: "Jisajili Sasa", ctaColor: "#1a1f6e" },
  { img: slide2Img, cta: "Wasiliana Nasi", ctaColor: "#1a1f6e" },
  { img: slide3Img, cta: "Nunua Sasa", ctaColor: "#1a1f6e" },
  { img: slide4Img, cta: "Wasiliana", ctaColor: "#1a1f6e" },
];

function AdBanner({ onCtaClick }) {
  const [slide, setSlide] = useState(0);
  const [fading, setFading] = useState(false);

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
      style={{ width: "100%", paddingTop: "33.33%" }} // 3:1 ratio
    >
      {/* Image — full, no crop, no stretch */}
      <img
        src={s.img}
        alt="banner"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "fill", // fill = exact fit, no crop, no stretch since ratio matches
          opacity: fading ? 0 : 1,
          transition: "opacity 0.3s ease",
          display: "block",
        }}
      />

      {/* CTA button — bottom right, always visible */}
      <button
        onClick={() => onCtaClick(slide)}
        style={{
          position: "absolute",
          bottom: "12%",
          right: "3%",
          background: s.ctaColor,
          color: "#fff",
          fontSize: "clamp(10px, 1.8vw, 14px)",
          fontWeight: 800,
          padding: "clamp(5px, 1vw, 10px) clamp(12px, 2.5vw, 22px)",
          borderRadius: 5,
          border: "2px solid rgba(255,255,255,0.5)",
          cursor: "pointer",
          letterSpacing: ".5px",
          zIndex: 20,
          opacity: fading ? 0 : 1,
          transition: "opacity 0.3s ease",
          boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
          textTransform: "uppercase",
        }}
      >
        {s.cta} →
      </button>

      {/* Dots — bottom center */}
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 5,
          zIndex: 20,
        }}
      >
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

export default AdBanner;