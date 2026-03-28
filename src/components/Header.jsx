import tzFlag from "../assets/tz.png";
import gbFlag from "../assets/gb.png";
import logo from "../assets/upmarket_logo.png";
export default function Header({
  lang,
  toggleLanguage,
  toggleMenu,
  menuRef,
  t, // Pass translations to header
  variant = "default" // Add variant prop with default value
}) {
  return (
    <>
      {/* 🔝 FLOATING HEADER */}
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center">

        <div className="w-[98%] md:w-[99.9%] lg:w-[99.9%] 
                        max-w-screen-2xl mx-auto 
                        px-4 py-2 
                        flex items-center justify-between gap-4
                        rounded-xl 
                        bg-white/20 backdrop-blur-md 
                        border border-white/20 
                        text-yellow-700
                        shadow-lg">

          {/* LEFT: LOGO + TITLE */}
          <div className="flex items-center gap-2 whitespace-nowrap">

            <div className="w-10 h-10 rounded-full overflow-hidden 
                            bg-white flex items-center justify-center shadow">
              <img src={logo} alt="logo" className="w-7 h-7 object-contain" />
            </div>

            <h1 className="font-bold text-2xl md:text-3xl tracking-wide font-[Poppins] 
                           bg-gradient-to-r from-blue-800 via-blue-400 to-blue-600 
                           bg-clip-text text-transparent 
                           transition-all duration-300 
                           hover:scale-110 hover:brightness-125">
              UDOM Market
            </h1>

          </div>

          {/* CENTER: SEARCH or TITLE */}
          {variant === "registration" ? (
            <div className="flex-1 flex justify-center">
              <h2 className="lg:text-xl md:text-2xl sm:text-[10px] font-semibold text-yellow-500 
                           bg-gradient-to-r from-yellow-600 to-yellow-800 
                           bg-clip-text text-transparent 
                           tracking-wide">
                {t.trader_registration}
              </h2>
            </div>
          ) : (
            <div className="flex-1 max-w-md relative">
              <input
                type="text"
                placeholder={t.search}
                className="w-full py-2 pl-4 pr-10 rounded-full 
                         bg-white/20 backdrop-blur-md 
                         border border-white/30 
                         text-yellow-700 placeholder:text-yellow-700 
                         outline-none 
                         focus:ring-2 focus:ring-white/50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                🔍
              </span>
            </div>
          )}

          {/* RIGHT: MENU + LANGUAGE */}
          <div className="flex items-center gap-3" ref={menuRef}>

            {/* MENU */}
            <button
              onClick={toggleMenu}
              className="text-xl px-2 py-1 rounded-full bg-yellow-500 text-white 
                         hover:scale-110 transition"
            >
              ☰
            </button>

            {/* LANGUAGE */}
            <button
              onClick={toggleLanguage}
              className="p-1 rounded-full bg-white/20 
                         hover:scale-110 transition"
            >
              <img
                src={lang === "sw" ? tzFlag : gbFlag}
                alt="language"
                className="w-7 h-7 rounded-full object-cover border border-white"
              />
            </button>

          </div>

        </div>
      </div>
    </>
  );
}