// src/components/QuickLinks.jsx

const QUICK_LINKS = [
  {
    key: "new_arrival",
    label: "New Arrival",
    bg: "bg-blue-100",
  },
  {
    key: "popular",
    label: "Popular",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#639922" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" stroke="#639922" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="#639922" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#639922" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    bg: "bg-green-100",
  },
  {
    key: "nearby",
    label: "Nearby",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#BA7517" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="10" r="3" stroke="#BA7517" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    bg: "bg-amber-100",
  },
  {
    key: "deals",
    label: "Deals & Offers",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          stroke="#D4537E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12h6M12 9v6" stroke="#D4537E" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    bg: "bg-pink-100",
  },
];

export default function QuickLinks({ activeKey, onSelect, nearbyLoading = false }) {
  return (
    <div className="grid grid-cols-4 gap-2 mb-5">
      {QUICK_LINKS.map((item) => {
        const isActive = activeKey === item.key;
        const isNearby = item.key === "nearby";
        const isNewArrival = item.key === "new_arrival";

        // New Arrival icon built here so it can react to isActive
        const icon = isNewArrival ? (
          <span className="relative inline-flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill={isActive ? "#ffffff" : "#378ADD"}
                stroke={isActive ? "#ffffff" : "#378ADD"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {/* Pulsing dot — red + pulse when inactive, solid green when active */}
            <span
              className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2
                ${isActive ? "border-blue-500 bg-green-400" : "border-white bg-red-400 animate-pulse"}`}
            />
          </span>
        ) : item.icon;

        return (
          <button
            key={item.key}
            onClick={() => onSelect(isActive ? null : item.key)}
            className={`flex flex-col items-center gap-1.5 rounded-xl py-3 border transition-all duration-200
              ${isActive
                ? "bg-blue-500 border-blue-500 shadow-md scale-95"
                : "bg-white/50 backdrop-blur border-white/60 hover:bg-blue-50"
              }`}
          >
            {/* Icon circle */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all
              ${isActive ? "bg-white/20" : item.bg}`}>
              {isNearby && nearbyLoading ? (
                <svg className="animate-spin w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                // New Arrival handles its own colors, others get white invert when active
                <span className={!isNewArrival && isActive ? "brightness-0 invert" : ""}>
                  {icon}
                </span>
              )}
            </div>

            {/* Label */}
            <span className={`text-[11px] font-medium leading-tight text-center px-0.5
              ${isActive ? "text-white" : "text-gray-700"}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
