import { useState, useEffect, useRef } from "react";
import slide1Img from "../assets/Slide1.jpeg";
import slide2Img from "../assets/Slide2.jpeg";
import slide3Img from "../assets/Slide3.jpeg";
import slide4Img from "../assets/Slide4.jpeg";

const SLIDES = [
  {
    img: slide1Img, cta: "Jisajili Sasa",
    color: "#F5C518", shadow: "#9a7c00", textColor: "#1a1f6e", ringColor: "#F5C518",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a1f6e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>,
  },
  {
    img: slide2Img, cta: "Wasiliana Nasi",
    color: "#16a34a", shadow: "#0a5c22", textColor: "#fff", ringColor: "#16a34a",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.07 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>,
  },
  {
    img: slide3Img, cta: "Nunua Sasa",
    color: "#0ea5e9", shadow: "#0369a1", textColor: "#fff", ringColor: "#0ea5e9",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57l1.65-8.43H6"/></svg>,
  },
  {
    img: slide4Img, cta: "Tupigie/ Ujumbe",
    color: "#dc2626", shadow: "#991b1b", textColor: "#fff", ringColor: "#dc2626",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  },
];

export default function AdBanner({ onCtaClick }) {
  const [slide, setSlide]         = useState(0);
  const [animClass, setAnimClass] = useState("");
  const [btnVisible, setBtnVisible] = useState(true);
  const transitioning = useRef(false);
  const touchStartX   = useRef(0);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const id = setInterval(() => go((slide + 1) % SLIDES.length, true), 10000);
    return () => clearInterval(id);
  }, [slide]);

  const go = (next, forward = true) => {
    if (next === slide || transitioning.current) return;
    transitioning.current = true;
    setBtnVisible(false);
    const outClass = forward ? "cube-out-left" : "cube-out-right";
    const inClass  = forward ? "cube-in-left"  : "cube-in-right";
    setAnimClass(outClass);
    setTimeout(() => {
      setSlide(next);
      setAnimClass(inClass);
      setTimeout(() => {
        setAnimClass("");
        setBtnVisible(true);
        transitioning.current = false;
      }, 600);
    }, 450);
  };

  const s = SLIDES[slide];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&display=swap');
        @keyframes cubeOutLeft  { from{transform:perspective(1000px) rotateY(0deg);opacity:1} to{transform:perspective(1000px) rotateY(-90deg);opacity:0} }
        @keyframes cubeInLeft   { from{transform:perspective(1000px) rotateY(90deg);opacity:0} to{transform:perspective(1000px) rotateY(0deg);opacity:1} }
        @keyframes cubeOutRight { from{transform:perspective(1000px) rotateY(0deg);opacity:1} to{transform:perspective(1000px) rotateY(90deg);opacity:0} }
        @keyframes cubeInRight  { from{transform:perspective(1000px) rotateY(-90deg);opacity:0} to{transform:perspective(1000px) rotateY(0deg);opacity:1} }
        @keyframes btnFadeIn    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer-sweep { 0%{left:-100%} 100%{left:200%} }
        @keyframes pulse-ring   { 0%{transform:scale(0.92);opacity:0.7} 100%{transform:scale(1.45);opacity:0} }
        .cube-out-left  { animation: cubeOutLeft  0.55s cubic-bezier(.4,0,.2,1) forwards; }
        .cube-in-left   { animation: cubeInLeft   0.55s cubic-bezier(.34,1.3,.64,1) forwards; }
        .cube-out-right { animation: cubeOutRight 0.55s cubic-bezier(.4,0,.2,1) forwards; }
        .cube-in-right  { animation: cubeInRight  0.55s cubic-bezier(.34,1.3,.64,1) forwards; }
        .btn-fade-in    { animation: btnFadeIn 0.4s ease-out forwards; }
        .shimmer-btn    { position:relative; overflow:hidden; }
        .shimmer-btn::after { content:''; position:absolute; top:0; left:-100%; width:40%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent); animation: shimmer-sweep 2s ease-in-out infinite; pointer-events:none; }
        .pulse-ring     { position:absolute; inset:-5px; border-radius:8px; border:2px solid var(--ring); animation: pulse-ring 1.8s ease-out infinite; pointer-events:none; }
      `}</style>

      <div
  className="relative mb-5 select-none overflow-hidden"
  style={{ width: "100%", paddingTop: "31.25%", position: "relative" }}
       onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          const diff = touchStartX.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 40) go(diff > 0 ? (slide+1)%SLIDES.length : (slide>0?slide-1:SLIDES.length-1), diff > 0);
        }}
      >
        {/* Slide image */}
    <div className={animClass} style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
      <img
        src={s.img}
        alt="banner"
        style={{ width:"100%", height:"100%", objectFit:"fill", display:"block" }}
      />
    </div>

        {/* 3D CTA Button — Option B: shimmer + pulse ring */}
        <div
          className={btnVisible ? "btn-fade-in" : ""}
          style={{
            position:"absolute", bottom:"10%", right:"3%", zIndex:20,
            opacity: btnVisible ? 1 : 0,
            display:"inline-flex", alignItems:"center",
          }}
        >
          {/* Pulse ring */}
          <div className="pulse-ring" style={{ "--ring": s.ringColor }} />

          <button
            onClick={() => onCtaClick(slide)}
            className="shimmer-btn"
            style={{
              display:"inline-flex", alignItems:"center",
              background: s.color,
              border:"none", borderRadius:6, padding:0, overflow:"hidden",
              cursor:"pointer",
              boxShadow:`0 5px 0 ${s.shadow}, 0 0 12px ${s.ringColor}88`,
              fontFamily:"'Montserrat', sans-serif",
            }}
          >
            <div style={{
              width:"clamp(28px,3vw,34px)", height:"clamp(28px,3vw,34px)",
              background:"rgba(0,0,0,0.2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
            }}>
              {s.icon}
            </div>
            <span style={{
              padding:"0 clamp(8px,1.5vw,12px)",
              fontSize:"clamp(9px,1.3vw,11px)",
              fontWeight:800, letterSpacing:".6px",
              textTransform:"uppercase", color:s.textColor,
              whiteSpace:"nowrap",
            }}>
              {s.cta}
            </span>
          </button>
        </div>

        {/* Dots */}
        <div style={{ position:"absolute", bottom:"5%", left:"50%", transform:"translateX(-50%)", display:"flex", gap:5, zIndex:20 }}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i, i > slide)}
              style={{
                height:5, width: i===slide ? 18 : 5, borderRadius:3,
                background: i===slide ? "#fff" : "rgba(255,255,255,0.5)",
                border:"none", cursor:"pointer", transition:"all .3s", padding:0,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}