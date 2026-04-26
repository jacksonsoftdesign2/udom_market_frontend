import{ API } from "../api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import translations from "../translations";
import logo from "../assets/upmarket_logo.png";
import Header from "../components/Header";
import adv from '../assets/advertisements/adv.jpeg';
import adv1 from '../assets/advertisements/adv1.jpeg';
import adv2 from '../assets/advertisements/adv2.jpeg';
import adv3 from '../assets/advertisements/adv3.jpeg';
import adv4 from '../assets/advertisements/adv4.jpeg';
import adv5 from '../assets/advertisements/adv5.jpeg';
import adv6 from '../assets/advertisements/adv6.jpeg';
import adv7 from '../assets/advertisements/adv7.jpeg';
import adv8 from '../assets/advertisements/adv8.jpeg';
import adv9 from '../assets/advertisements/adv9.jpeg';

function Login() {
	const [lang, setLang] = useState("sw");
	const t = translations[lang] || translations["sw"];
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();

	// ✅ NEW: Form state
	const [userCode, setUserCode] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [stage, setStage] = useState("idle"); // idle | searching | success | redirecting
    const [successData, setSuccessData] = useState(null);

	const images = [
		{ src: adv, subtitle: "Welcome to UDOM Market" },
		{ src: adv1, subtitle: "Best deals on campus" },
		{ src: adv2, subtitle: "Shop local products" },
		{ src: adv3, subtitle: "Secure payments" },
		{ src: adv4, subtitle: "Fast delivery" },
		{ src: adv5, subtitle: "Quality guaranteed" },
		{ src: adv6, subtitle: "Student discounts" },
		{ src: adv7, subtitle: "Wide variety" },
		{ src: adv8, subtitle: "Easy returns" },
		{ src: adv9, subtitle: "Join the community" },
	];

	const [currentIndex, setCurrentIndex] = useState(0);
	const [nextIndex, setNextIndex] = useState(0);
	const [isTransitioning, setIsTransitioning] = useState(false);


	useEffect(() => {
		const interval = setInterval(() => {
			const newIndex = (currentIndex + 1) % images.length;
			setNextIndex(newIndex);
			setIsTransitioning(true);
		}, 3000);
		return () => clearInterval(interval);
	}, [currentIndex]);

	const handleTransitionEnd = () => {
		setCurrentIndex(nextIndex);
		setIsTransitioning(false);
	};

// ✅ NEW: Login handler
	const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setStage("searching"); // Stage 1 — logo spinning, searching...
    setUserCode("");
	setPassword("");
    try {
        const response = await fetch(`${API}/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_code: userCode, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            setStage("idle"); // back to form
            setError(data.message || "Login failed");
            return;
        }

        // Save to localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setSuccessData(data.user);
        setStage("success"); // Stage 2 — success card

        // Stage 3 — redirecting
        setTimeout(() => {
            setStage("redirecting");
        }, 2000);

        // Navigate
        setTimeout(() => {
            if (data.user.role === "admin")       navigate("/admin/dashboard");
            else if (data.user.role === "trader") navigate("/trader/dashboard");
            else                                  navigate("/dashboard");
        }, 3500);

    } catch (err) {
        setStage("idle");
        setError("Network error. Please try again.");
    }
};

	return (
		<>
			<style>{`
				@keyframes slideUp {
					0% { transform: translateY(100%); opacity: 0; }
					50% { transform: translateY(0); opacity: 1; }
					100% { transform: translateY(0); opacity: 1; }
				}
			`}</style>
			<Header />
      {/* ======================== */}
{/* STAGE 1 — SEARCHING      */}
{/* ======================== */}
{stage === "searching" && (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md">
        <style>{`
            @keyframes spin-continuous {
                0%   { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes pulse-ring {
                0%   { transform: scale(0.9); opacity: 0.4; }
                50%  { transform: scale(1.2); opacity: 0.8; }
                100% { transform: scale(0.9); opacity: 0.4; }
            }
            @keyframes dot-bounce {
                0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
                40%           { transform: translateY(-8px); opacity: 1; }
            }
            .spin-logo   { animation: spin-continuous 1s linear infinite; }
            .pulse-ring  { animation: pulse-ring 1.5s ease-in-out infinite; }
            .dot1 { animation: dot-bounce 1.2s ease-in-out infinite 0s; }
            .dot2 { animation: dot-bounce 1.2s ease-in-out infinite 0.2s; }
            .dot3 { animation: dot-bounce 1.2s ease-in-out infinite 0.4s; }
        `}</style>

        {/* Pulsing ring + spinning logo */}
        <div className="relative flex items-center justify-center mb-8">
            <div className="absolute w-40 h-40 rounded-full bg-yellow-300/30 pulse-ring"></div>
            <div className="absolute w-32 h-32 rounded-full bg-yellow-400/20 pulse-ring" style={{ animationDelay: '0.3s' }}></div>
            <img
                src={logo}
                alt="UDOM Market"
                className="w-24 h-24 object-contain spin-logo z-10"
            />
        </div>

        {/* Searching text */}
        <p className="text-gray-700 font-semibold text-lg mb-3">Verifying your account</p>

        {/* Bouncing dots */}
        <div className="flex gap-2">
            <div className="dot1 w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="dot2 w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="dot3 w-3 h-3 rounded-full bg-yellow-500"></div>
        </div>

        <p className="text-gray-400 text-sm mt-4">This depends on your network speed...</p>
    </div>
)}

{/* ======================== */}
{/* STAGE 2 — SUCCESS CARD   */}
{/* ======================== */}
{stage === "success" && successData && (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md">
        <style>{`
            @keyframes pop-in {
                0%   { transform: scale(0.5); opacity: 0; }
                70%  { transform: scale(1.1); opacity: 1; }
                100% { transform: scale(1);   opacity: 1; }
            }
            @keyframes fadeInUp {
                0%   { opacity: 0; transform: translateY(20px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            .pop-in     { animation: pop-in 0.5s ease-out forwards; }
            .fade-in-1  { animation: fadeInUp 0.5s ease-out 0.4s forwards; opacity: 0; }
            .fade-in-2  { animation: fadeInUp 0.5s ease-out 0.8s forwards; opacity: 0; }
        `}</style>

        {/* Success card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-green-100 px-12 py-10 flex flex-col items-center text-center max-w-sm w-full mx-4">

            {/* Big checkmark */}
            <div className="pop-in text-7xl mb-4">✅</div>

            {/* Welcome message */}
            <div className="fade-in-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                    Login Successful!
                </h2>
                <p className="text-gray-500 text-base">
                    Welcome back,
                </p>
                <p className="text-yellow-600 font-bold text-xl mt-1">
                    {successData.first_name} {successData.last_name}
                </p>
                <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full uppercase tracking-wide">
                    {successData.role}
                </span>
            </div>

            {/* User code */}
            <div className="fade-in-2 mt-4 text-gray-400 text-sm">
                Logged in as <span className="font-mono font-semibold text-gray-600">{successData.user_code}</span>
            </div>

        </div>
    </div>
)}

{/* ======================== */}
{/* STAGE 3 — REDIRECTING    */}
{/* ======================== */}
{stage === "redirecting" && successData && (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md">
        <style>{`
            @keyframes spin-continuous {
                0%   { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes pulse-ring {
                0%   { transform: scale(0.9); opacity: 0.4; }
                50%  { transform: scale(1.2); opacity: 0.8; }
                100% { transform: scale(0.9); opacity: 0.4; }
            }
            @keyframes fadeInUp {
                0%   { opacity: 0; transform: translateY(10px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            .spin-logo  { animation: spin-continuous 1s linear infinite; }
            .pulse-ring { animation: pulse-ring 1.5s ease-in-out infinite; }
            .fade-in    { animation: fadeInUp 0.5s ease-out forwards; }
        `}</style>

        {/* Spinning logo again */}
        <div className="relative flex items-center justify-center mb-8">
            <div className="absolute w-40 h-40 rounded-full bg-green-300/30 pulse-ring"></div>
            <div className="absolute w-32 h-32 rounded-full bg-green-400/20 pulse-ring" style={{ animationDelay: '0.3s' }}></div>
            <img
                src={logo}
                alt="UDOM Market"
                className="w-24 h-24 object-contain spin-logo z-10"
            />
        </div>

        {/* Redirecting text */}
        <div className="fade-in text-center">
            <p className="text-gray-700 font-semibold text-lg mb-1">
                Taking you to your dashboard
            </p>
            <p className="text-yellow-600 font-bold text-base">
                {successData.role === "admin" ? "⚙️ Admin Dashboard" : "🏪 Trader Dashboard"}
            </p>
        </div>

        {/* Progress bar */}
        <div className="mt-6 w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
                className="h-full bg-gradient-to-r from-yellow-400 to-green-500 rounded-full"
                style={{ animation: 'progressBar 1.5s linear forwards' }}
            ></div>
            <style>{`
                @keyframes progressBar {
                    0%   { width: 0%; }
                    100% { width: 100%; }
                }
            `}</style>
        </div>
    </div>
)}

			<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col items-center justify-center p-4 pt-24">
			<div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl h-full flex-1">
				{/* Branding Card - Hidden on Small Screens */}
				<div className="hidden md:flex w-full md:w-1/2 backdrop-blur-lg rounded-2xl shadow-2xl border-4 border-white/20 overflow-hidden items-center justify-center min-h-[300px] md:min-h-[500px] relative">
					{/* LOGO POSITIONED AT TOP */}
					<img src={logo} alt="UDOM Market Logo" className="absolute top-4 left-1/2 transform -translate-x-1/2 w-24 h-24 object-contain z-20" />
					{/* BACKGROUND IMAGES SLIDESHOW */}
					<div className="absolute inset-0">
						<div
							className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
							style={{ backgroundImage: `url(${images[currentIndex].src})` }}
						></div>
						<div
							className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${isTransitioning ? 'opacity-100' : 'opacity-0'}`}
							style={{ backgroundImage: `url(${images[nextIndex].src})` }}
							onTransitionEnd={isTransitioning ? handleTransitionEnd : undefined}
						></div>
						{/* GRADIENT OVERLAY FOR DECREASING OPACITY FROM LEFT TO RIGHT */}
						<div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/60"></div>
					</div>
					{/* CONTENT OVERLAY */}
					<div className="relative z-10 p-8 w-full text-center flex flex-col items-center justify-end rounded-2xl">
						<h1 className="text-3xl font-bold text-yellow-400 mb-2" style={{animation: 'slideUp 2s ease-out infinite', textShadow: '3px 3px 6px rgba(0,0,0,0.8)'}}>UDOM Market</h1>
						<p className="text-yellow-400 text-lg font-semibold mb-4" style={{animation: 'slideUp 2s ease-out 0.5s infinite', textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>{t.title}</p>
						<p className="text-yellow-400" style={{animation: 'slideUp 2s ease-out 1s infinite', textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>{t.subtitle}</p>
					</div>
				</div>

				{/* Login Card */}
				<div className="w-full md:w-1/2 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border-4 border-white/20 p-8 flex flex-col justify-center min-h-[300px] md:min-h-[500px]">
					<div className="flex flex-col items-center mb-6">
						<img src={logo} alt="UDOM Market Logo" className="w-16 h-16 mb-2 object-contain" />
						<h2 className="text-2xl font-bold text-gray-800 mb-1">Login</h2>
						
					</div>
					<form className="space-y-5" onSubmit={handleLogin}>

						{/*login data inputs*/}
						<div>
							<label className="block text-gray-700 font-medium mb-1">Registration Number</label>
							<input type="text" className="input" placeholder="TR  --/---" value={userCode}
							onChange={(e) => setUserCode(e.target.value)} required
							/>
						</div>
						<div>
							<label className="block text-gray-700 font-medium mb-1">Password</label>
							<div className="relative">
    <input
        type={showPassword ? "text" : "password"}
        className="input pr-10"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
    />
    <button
        type="button"
        onClick={() => setShowPassword((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
    >
        {showPassword ? "🙈" : "👁️"}
    </button>
</div>
</div>


{/* Error message from backend */}
{error && (
<div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg">
⚠️ {error}
</div>
)}

{/* Submit */}
<button
type="submit"
disabled={loading}
className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white py-3 rounded-lg font-semibold hover:from-green-500 hover:to-green-700 transition-all disabled:opacity-60"
>
{loading ? "Logging in..." : "login"}
</button>

<div className="flex justify-between text-sm mt-2">
<button type="button" className="text-blue-600 underline" onClick={() => {}}>{t["forgot_password"] || "Forgot password?"}</button>
<button type="button" className="text-blue-600 underline" onClick={() => navigate("/register-trader")}>{["Register"] || "Register"}</button>
</div>
</form>
</div>
</div>
</div>
</>
);
}

export default Login;
