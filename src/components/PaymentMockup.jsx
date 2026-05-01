import { useState } from "react";
import { useNavigate } from "react-router-dom";

function PaymentMockup({ onClose }) {
  const navigate = useNavigate();
  const [showMessage, setShowMessage] = useState(false);

  const contactNumber = "+255748399067";

  const paymentMethods = [
    { name: "M-Pesa", src: "/payment-logos/mpesa.png" },
    { name: "Mix by YAS", src: "/payment-logos/mixx.png" },
    { name: "Airtel Money", src: "/payment-logos/airtel.png" },
    { name: "HaloPesa", src: "/payment-logos/halopesa.png" },
    { name: "Azam Pesa", src: "/payment-logos/azampesa.png" },
    { name: "Visa", src: "/payment-logos/visa.svg" },
  ];

  const handleClick = () => {
    setShowMessage(true);
  };

  const goToLogin = () => {
    onClose();
    navigate("/login");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">

        {/* Header */}
        <h2 className="text-xl font-semibold text-gray-800 text-center mb-5">
          Select Payment Method
        </h2>

        {/* Payment Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {paymentMethods.map((method, i) => (
            <button
              key={i}
              onClick={handleClick}
              className="border border-gray-200 rounded-xl p-3 hover:shadow-md hover:border-blue-400 transition-all bg-white"
            >
              <img
                src={method.src}
                alt={method.name}
                className="w-full h-12 object-contain"
              />
            </button>
          ))}
        </div>

        {/* Control Number Button */}
        <button
          onClick={handleClick}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition mb-5"
        >
          Generate Control Number
        </button>

        {/* Info Message */}
        {showMessage && (
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 mb-5">
            <p className="text-sm text-gray-700 mb-2">
              This service is currently free.
            </p>
            <p className="text-sm text-gray-600 mb-3">
              Please contact management to proceed:
            </p>

            <div className="flex gap-2">
              <a
                href={`https://wa.me/${contactNumber.replace("+", "")}`}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-center text-sm font-medium"
              >
                WhatsApp
              </a>

              <a
                href={`tel:${contactNumber}`}
                className="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-2 rounded-lg text-center text-sm font-medium"
              >
                Call
              </a>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3">
          <button
            onClick={goToLogin}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg text-sm font-medium"
          >
            Close for Now
          </button>

          <button
            onClick={onClose}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentMockup;