import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle, FaHome } from "react-icons/fa";

const BLUE = "#1a3a6b";
const ORANGE = "#f5a623";

export default function Delivery() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        
        {/* Icon */}
        <div
          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-4"
          style={{ background: `${ORANGE}20`, color: ORANGE }}
        >
          <FaExclamationTriangle />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-3" style={{ color: BLUE }}>
          Service Temporarily Unavailable
        </h2>

        {/* Message */}
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          Delivery and transportation services are currently not available.
          <br /><br />
          We are working to make these services available soon. 
          Thank you for your patience and understanding.
        </p>

        {/* Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center gap-2 mx-auto px-6 py-3 rounded-full text-white font-semibold shadow-md hover:scale-105 transition"
          style={{ background: ORANGE }}
        >
          <FaHome />
          Back to Home
        </button>

      </div>

    </div>
  );
}