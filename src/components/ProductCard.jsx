export default function ProductCard({ item, onClick, t }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-2xl overflow-hidden 
                 bg-white/30 backdrop-blur-lg 
                 border border-white/40 shadow-lg
                 hover:scale-[1.03] hover:shadow-2xl 
                 transition duration-300 sm:w-full sm:h-auto"
    >
      {/* IMAGE SECTION */}
      <div className="relative">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-contain"
        />

        {/* CATEGORY BADGE */}
        <span className="absolute top-2 left-2 text-xs px-2 py-1 
                         bg-blue-500 text-white rounded-full shadow">
          {item.category || "General"}
        </span>

        {/* STATUS BADGE */}
        <span className="absolute top-2 right-2 text-xs px-2 py-1 
                         bg-yellow-400 text-black rounded-full shadow">
          {t.available}
        </span>
      </div>

      {/* DETAILS */}
      <div className="p-3 bg-gradient-to-r from-white/55 via-white/30 to-white/5 text-black text-center flex flex-col gap-1">
        
        {/* NAME */}
        <h3 className="font-semibold text-sm truncate">{t.name}:<span className="text-blue-700"> {item.name}</span></h3>

        {/* PRICE */}
        <p className="text-sm font-semibold ">{t.price}<span className="text-yellow-600 font-semibold">Tsh {item.price || "Not specified"}</span></p>

        {/* EXTRA INFO */}
        <p className="text-x opacity-80">
          {t.location}: {item.location || "UDOM"}
        </p>
        <p className="text-xs opacity-80">
          {t.distance}: {item.distance || "Not specified"}
        </p>


      </div>
    </div>
  );
}