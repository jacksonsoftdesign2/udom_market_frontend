import { useNavigate } from "react-router-dom";
import logo from "../assets/upmarket_logo.png";
import jacksonPhoto from "../assets/jackson.jpg";
import jsdLogo from "../assets/jacksonsoftdesigns_logo.png";
import udomCampus from "../assets/udom_campus.jpg";
import Header from "../components/Header";
import Footer from "../components/Footer";

// ── Brand Colors (matching brochure) ──────────────────────────────
const BLUE = "#1a3a6b";
const ORANGE = "#f5a623";
const LIGHT_BLUE = "#2a5298";

// ── Section: Divider strip (orange accent like brochure) ──────────
function OrangeStrip({ text }) {
  return (
    <div
      className="w-full py-2 px-6 flex items-center"
      style={{ background: ORANGE }}
    >
      <span className="text-white font-bold text-sm uppercase tracking-widest">{text}</span>
    </div>
  );
}

// ── Section 1: Hero ───────────────────────────────────────────────
function HeroSection() {
  const navigate = useNavigate();
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${BLUE} 60%, ${LIGHT_BLUE} 100%)` }}
    >
      {/* Background campus image overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url(${udomCampus})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Decorative orange shapes */}
      <div
        className="absolute top-0 right-0 w-64 h-64 opacity-20 rounded-bl-full"
        style={{ background: ORANGE }}
      />
      <div
        className="absolute bottom-0 left-0 w-48 h-48 opacity-10 rounded-tr-full"
        style={{ background: ORANGE }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 py-20">
        {/* Logo */}
        <div className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-white/10 border-4 border-white/30 flex items-center justify-center mb-6 shadow-2xl backdrop-blur">
          <img src={logo} alt="UDOM Market" className="w-24 h-24 md:w-36 md:h-36 object-contain" />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-3 leading-tight">
          <span style={{ color: ORANGE }}>UDOM</span> MARKET
        </h1>

        {/* Tagline */}
        <p className="text-white/80 text-lg md:text-2xl font-light mb-2 max-w-2xl">
          The Campus Marketplace
        </p>
        <p className="font-bold text-xl md:text-3xl mb-8" style={{ color: ORANGE }}>
         Trade Without Limits
        </p>

        {/* Subtitle */}
        <p className="text-white/70 text-sm md:text-base max-w-xl mb-10 leading-relaxed">
          Simplifying buying and selling within the university environment —
          connecting students, traders, and the campus community through one powerful platform.
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          {[
            { label: "Verified Sellers", value: "Trusted" },
            { label: "Any Time", value: "Access" },
            { label: "Save Time", value: "Shop easy" },
            { label: "Quick Orders", value: "Fast delivery" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-extrabold" style={{ color: ORANGE }}>{value}</p>
              <p className="text-white/60 text-xs uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate("/")}
          className="px-8 py-3 rounded-full font-bold text-white text-sm uppercase tracking-widest shadow-lg transition-all hover:scale-105"
          style={{ background: ORANGE }}
        >
          Explore the Marketplace →
        </button>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
        <span className="text-white/40 text-xs uppercase tracking-widest">Scroll</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" opacity="0.4">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </div>
    </section>
  );
}

// ── Section 2: About UDOM Market ─────────────────────────────────
function AboutSection() {
  return (
    <section style={{ background: "#f8f9fb" }}>
      <OrangeStrip text="About UDOM Market" />
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div>
          <h2 className="text-3xl font-extrabold mb-4" style={{ color: BLUE }}>
            What is UDOM Market?
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            UDOM Market is a digital marketplace platform designed to simplify buying and
            selling of goods within the university environment. It connects students (buyers)
            and traders through a structured, efficient, and secure platform that reduces the
            need for physical travel, lowers costs, and improves accessibility to products.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            By moving away from unorganized methods such as WhatsApp groups, UDOM Market
            introduces a more reliable and scalable approach to campus commerce — with trader
            verification, structured product listings, order management, and delivery options.
          </p>

          {/* Users */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: "🎓", label: "Students", sub: "Browse & buy" },
              { icon: "🏪", label: "Traders", sub: "Sell & grow" },
              { icon: "⚙️", label: "Platform", sub: "Monitor & control" },
            ].map(({ icon, label, sub }) => (
              <div
                key={label}
                className="rounded-xl p-3 text-center border"
                style={{ borderColor: `${BLUE}22`, background: `${BLUE}08` }}
              >
                <div className="text-2xl mb-1">{icon}</div>
                <p className="font-bold text-sm" style={{ color: BLUE }}>{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 text-white shadow-xl"
          style={{ background: `linear-gradient(135deg, ${BLUE}, ${LIGHT_BLUE})` }}
        >
          <h3 className="text-xl font-bold mb-4" style={{ color: ORANGE }}>
            Platform At a Glance
          </h3>
          {[
            "Centralized campus digital marketplace",
            "Trader verification & approval system",
            "Structured product listings with 90-day lifecycle",
            "Order placement & delivery system",
            "Distance-based delivery cost calculation",
            "Multi-channel notification system (SMS, Email, In-app)",
            "Designed for a smooth and hassle-free experience",
            "Scalable to other universities across Tanzania",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 mb-2">
              <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: ORANGE, color: BLUE }}>✓</span>
              <span className="text-white/85 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section 3: Why UDOM Market ────────────────────────────────────
function WhySection() {
  const studentChallenges = [
    "Spending time & money traveling to town for goods",
    "High transportation costs due to increased fares",
    "Limited time due to academic schedules",
    "Exposure to risks — accidents, theft, insecurity",
    "Unstructured WhatsApp groups miss important info",
    "Difficulty finding trusted sellers quickly",
  ];

  const traderChallenges = [
    "No reliable centralized market within university",
    "Spending too much time searching for customers",
    "Limited ability to reach large audiences at once",
    "WhatsApp groups restrict business advertisements",
    "No professional platform to display products",
    "Difficulty building trust without a formal system",
  ];

  return (
    <section style={{ background: BLUE }}>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <span
            className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3"
            style={{ background: ORANGE, color: BLUE }}
          >
            The Problem
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Why UDOM Market Was Created
          </h2>
          <p className="text-white/60 mt-2 max-w-xl mx-auto text-sm">
            Real challenges faced by students and traders within campus — solved by one platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Students */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: ORANGE }}>🎓</div>
              <h3 className="text-white font-bold text-lg">Challenges for Students</h3>
            </div>
            {studentChallenges.map((c, i) => (
              <div key={i} className="flex items-start gap-2 mb-2">
                <span className="text-red-400 mt-0.5 flex-shrink-0">✕</span>
                <span className="text-white/75 text-sm">{c}</span>
              </div>
            ))}
          </div>

          {/* Traders */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: ORANGE }}>🏪</div>
              <h3 className="text-white font-bold text-lg">Challenges for Traders</h3>
            </div>
            {traderChallenges.map((c, i) => (
              <div key={i} className="flex items-start gap-2 mb-2">
                <span className="text-red-400 mt-0.5 flex-shrink-0">✕</span>
                <span className="text-white/75 text-sm">{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Solution banner */}
        <div
          className="mt-8 rounded-2xl p-6 text-center"
          style={{ background: ORANGE }}
        >
          <h3 className="text-2xl font-extrabold mb-2" style={{ color: BLUE }}>
            UDOM Market Is The Solution
          </h3>
          <p className="text-blue-900/80 text-sm max-w-2xl mx-auto">
            A centralized digital marketplace that connects students and traders in a
            structured, efficient, and secure way — improving accessibility, reducing costs,
            enhancing trust, and creating a reliable trading environment within the campus.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Section 4: Platform Features ──────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: "✅",
      title: "Trader Verification",
      desc: "Only approved, verified traders can sell on the platform. Admin reviews each registration to ensure authenticity and trust.",
      color: "#22c55e",
    },
    {
      icon: "📦",
      title: "Product Management",
      desc: "Traders list products with images, price, and description. Each listing is valid for 90 days with automatic reminders.",
      color: "#3b82f6",
    },
    {
      icon: "🛒",
      title: "Order System",
      desc: "Buyers place orders directly through the system. Traders receive instant notifications. 30% upfront payment reduces fake orders.",
      color: ORANGE,
    },
    {
      icon: "🚚",
      title: "Delivery System",
      desc: "Optional delivery with distance-based cost calculation. Buyer pays 30% upfront to confirm commitment and protect traders.",
      color: "#8b5cf6",
    },
    {
      icon: "🔔",
      title: "Notification System",
      desc: "Real-time alerts via in-app, email, and SMS. Traders notified for new orders, 90-day reminders, and account updates.",
      color: "#ef4444",
    },
    {
      icon: "⚙️",
      title: "Platform Management",
      desc: "Full governance on approving traders, monitoring products, handling complaints, and enforcing platform rules.",
      color: "#0891b2",
    },
  ];

  return (
    <section style={{ background: "#f8f9fb" }}>
      <OrangeStrip text="Platform Features" />
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3" style={{ color: BLUE }}>
            What the Platform Offers
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm">
            Six core systems working together to transform campus commerce.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon, title, desc, color }) => (
            <div
              key={title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                style={{ background: `${color}18` }}
              >
                {icon}
              </div>
              <h3 className="font-bold text-base mb-2" style={{ color: BLUE }}>{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Focus customers */}
        <div
          className="mt-12 rounded-2xl p-6"
          style={{ background: `${BLUE}08`, border: `1px solid ${BLUE}20` }}
        >
          <h3 className="font-bold text-lg mb-4 text-center" style={{ color: BLUE }}>
            Our Target Users
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🚀", label: "Entrepreneur Students" },
              { icon: "📍", label: "Traders Near College" },
              { icon: "🌍", label: "Cross Region Traders" },
              { icon: "🛠️", label: "Service Providers" },
            ].map(({ icon, label }) => (
              <div key={label} className="text-center p-3 bg-white rounded-xl shadow-sm">
                <div className="text-2xl mb-1">{icon}</div>
                <p className="text-xs font-semibold" style={{ color: BLUE }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Section 5: The Developer ──────────────────────────────────────
function DeveloperSection() {
  return (
    <section style={{ background: BLUE }}>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <span
            className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3"
            style={{ background: ORANGE, color: BLUE }}
          >
            The Team
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Developed & Maintained By
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Developer Card */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/10 text-center">
            <div className="relative inline-block mb-4">
              <img
                src={jacksonPhoto}
                alt="Jackson Daniel Duwangh'e"
                className="w-32 h-32 rounded-full object-cover border-4 mx-auto shadow-xl"
                style={{ borderColor: ORANGE }}
                onError={e => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div
                className="w-32 h-32 rounded-full hidden items-center justify-center text-4xl font-bold mx-auto border-4"
                style={{ borderColor: ORANGE, background: `${ORANGE}30`, color: ORANGE }}
              >
                JD
              </div>
            </div>
            <h3 className="text-white font-extrabold text-xl mb-1">Jackson Daniel Duwangh'e</h3>
            <p className="font-semibold text-sm mb-4" style={{ color: ORANGE }}>Founder & Lead Developer</p>

            <div className="space-y-2 text-left">
              {[
                { label: "Institution", value: "University of Dodoma (UDOM)" },
                { label: "Program", value: "BSc Software Engineering" },
                { label: "Year", value: "2nd Year (2024 – 2028)" },
                { label: "Skills", value: "Software, Graphics, Branding and Animations" },
                { label: "Started", value: "November 2024" },
                { label: "Contacts", value: "+255 748 399 067" },
                { label: "Email", value: "jacksonduwanghe@gmail.com" }
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-2 text-sm">
                  <span className="text-white/50 flex-shrink-0 w-24">{label}:</span>
                  <span className="text-white/90 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Company Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={jsdLogo}
                  alt="JacksonSoftDesigns"
                  className="w-20 h-20 object-contain"
                  onError={e => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div
                  className="w-16 h-16 rounded-xl hidden items-center justify-center font-extrabold text-xs text-center leading-tight"
                  style={{ background: BLUE, color: "white" }}
                >
                  JSD
                </div>
                <div>
                  <h3 className="font-extrabold text-lg" style={{ color: BLUE }}>JacksonSoftDesigns</h3>
                  <p className="text-gray-500 text-xs">Software development & Graphics designs Company</p>
                </div>
              </div>

              <div
                className="rounded-xl p-3 mb-4 text-center"
                style={{ background: `${BLUE}08`, border: `1px solid ${BLUE}20` }}
              >
                <p className="text-sm font-bold italic" style={{ color: BLUE }}>
                  "We implement your vision and make it real"
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { label: "Role", value: "Platform Development & Maintenance" },
                  { label: "Location", value: "Dodoma, Tanzania" },
                  { label: "Contacts", value: "+255 759 599 067" },
                  { label: "Email", value: "jacksonduwanghe@gmail.com" },
                  { label: "Instagram", value: "@jacksonsoftdesigns" },
                  
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-2 text-sm">
                    <span className="text-gray-400 flex-shrink-0 w-24">{label}:</span>
                    <span className="font-semibold" style={{ color: BLUE }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div
              className="rounded-2xl p-6 text-white"
              style={{ background: ORANGE }}
            >
              <h4 className="font-bold mb-3" style={{ color: BLUE }}>Get In Touch</h4>
              <div className="space-y-2">
                {[
                  { icon: "📞", value: "+255 748 399 067" },
                  { icon: "📞", value: "+255 759 599 067" },
                  { icon: "📸", value: "@jacksonsoftdesign" },
                  { icon: "📍", value: "CIVE — UDOM, Dodoma, Tanzania" },
                ].map(({ icon, value }) => (
                  <div key={value} className="flex items-center gap-2 text-sm font-medium" style={{ color: BLUE }}>
                    <span>{icon}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Section 6: Vision & CTA ───────────────────────────────────────
function VisionSection() {
  const navigate = useNavigate();
  return (
    <section style={{ background: "#f8f9fb" }}>
      <OrangeStrip text="Vision & Future" />
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-extrabold mb-4" style={{ color: BLUE }}>
              Our Vision
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              UDOM Market started at the University of Dodoma in November 2024 with a
              simple but powerful goal — to digitize campus commerce and make it safer,
              faster, and more reliable for everyone.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              The platform is designed to be scalable and sustainable, with the potential
              to expand to other universities and colleges across Tanzania, creating a
              connected network of campus marketplaces nationwide.
            </p>

            <div className="space-y-3">
              {[
                "Starting at UDOM — expanding to all Tanzanian universities",
                "Supporting student entrepreneurship & digital innovation",
                "Creating employment opportunities within campus communities",
                "Driving digital transformation in university commerce",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
                    style={{ background: ORANGE, color: "white" }}
                  >
                    ✓
                  </span>
                  <span className="text-gray-600 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="font-bold text-lg mb-6" style={{ color: BLUE }}>Platform Timeline</h3>
            <div className="relative">
              <div
                className="absolute left-4 top-0 bottom-0 w-0.5"
                style={{ background: `${BLUE}30` }}
              />
              {[
                { year: "Nov 2024", event: "Project started — UDOM Market concept developed", active: true },
                { year: "Apr 2026", event: "Prototype submitted — DRPC Innovation Challenge 2026", active: true },
                { year: "2026", event: "Platform launch & trader onboarding begins", active: true },
                { year: "2027", event: "Expansion to additional colleges planned", active: false },
                { year: "2028", event: "Graduation & full institutional handover", active: false },
              ].map(({ year, event, active }, i) => (
                <div key={i} className="relative flex gap-4 mb-6 pl-10">
                  <div
                    className="absolute left-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 z-10"
                    style={{
                      background: active ? ORANGE : "#e5e7eb",
                      color: active ? BLUE : "#9ca3af",
                    }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: active ? BLUE : "#9ca3af" }}>{year}</p>
                    <p className="text-gray-500 text-xs leading-relaxed">{event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div
          className="mt-12 rounded-2xl p-10 text-center text-white shadow-xl"
          style={{ background: `linear-gradient(135deg, ${BLUE}, ${LIGHT_BLUE})` }}
        >
          <img src={logo} alt="UDOM Market" className="w-16 h-16 object-contain mx-auto mb-4" />
          <h3 className="text-2xl font-extrabold mb-2">Ready to Explore UDOM Market?</h3>
          <p className="text-white/70 text-sm mb-6 max-w-md mx-auto">
            Browse products, connect with verified traders, and experience the future of campus commerce.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all hover:scale-105 shadow-lg"
              style={{ background: ORANGE, color: BLUE }}
            >
              Browse Products
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest border-2 border-white/30 text-white transition-all hover:bg-white/10"
            >
              Register as Trader
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Main About Page ───────────────────────────────────────────────
export default function About() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-14">
        <HeroSection />
        <AboutSection />
        <WhySection />
        <FeaturesSection />
        <DeveloperSection />
        <VisionSection />
      </main>
      <Footer />
    </div>
  );
}