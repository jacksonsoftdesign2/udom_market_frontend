import { useState, useEffect } from "react";
import slide1Img from "../assets/Slide1.jpeg";
import slide2Img from "../assets/Slide2.jpeg";
import slide3Img from "../assets/Slide3.jpeg";
import slide4Img from "../assets/Slide4.jpeg";

const SLIDES = [
  { img: slide1Img, cta: "Register Now", ctaColor: "#dc2626", position: "bottom-left" },
  { img: slide2Img, cta: "Contact Us",   ctaColor: "#16a34a", position: "bottom-right" },
  { img: slide3Img, cta: "Shop Now",     ctaColor: "#1a3a8f", position: "bottom-left" },
  { img: slide4Img, cta: "Contact",      ctaColor: "#1a3a8f", position: "bottom-right" },
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
  const isLeft = s.position === "bottom-left";

  return (
    <div
      className="relative mb-5 select-none rounded-2xl overflow-hidden shadow-xl"
      style={{ width: "100%", paddingTop: "31.25%", position: "relative" }}
    >
      {/* Image */}
      <img
        src={s.img}
        alt={s.cta}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          opacity: fading ? 0 : 1,
          transition: "opacity 0.3s ease",
          display: "block",
        }}
      />

      {/* CTA button */}
      <button
        onClick={() => onCtaClick(slide)}
        style={{
          position: "absolute",
          bottom: "8%",
          ...(isLeft ? { left: "3%" } : { right: "3%" }),
          background: s.ctaColor,
          color: "#fff",
          fontSize: "clamp(9px, 1.6vw, 13px)",
          fontWeight: 700,
          padding: "clamp(4px, 0.8vw, 8px) clamp(10px, 2vw, 18px)",
          borderRadius: 4,
          border: "1.5px solid rgba(255,255,255,0.35)",
          cursor: "pointer",
          letterSpacing: ".4px",
          zIndex: 20,
          opacity: fading ? 0 : 1,
          transition: "opacity 0.3s ease",
        }}
      >
        {s.cta} →
      </button>

      {/* Dots */}
      <div
        style={{
          position: "absolute",
          bottom: "6%",
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