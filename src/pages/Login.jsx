
import { useState, useRef, useEffect } from "react";
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
	const menuRef = useRef(null);
	const [menuOpen, setMenuOpen] = useState(false);

	const toggleMenu = () => setMenuOpen((prev) => !prev);

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

	const handleLanguage = () => setLang((prev) => (prev === "sw" ? "en" : "sw"));

	return (
		<>
			<style>{`
				@keyframes slideUp {
					0% { transform: translateY(100%); opacity: 0; }
					50% { transform: translateY(0); opacity: 1; }
					100% { transform: translateY(0); opacity: 1; }
				}
			`}</style>
			<Header lang={lang} toggleLanguage={handleLanguage} toggleMenu={toggleMenu} menuRef={menuRef} t={t} />
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
						<h2 className="text-2xl font-bold text-gray-800 mb-1">{t.login}</h2>
						<button onClick={handleLanguage} className="text-xs text-blue-600 underline mb-2">{lang === "sw" ? "English" : "Kiswahili"}</button>
					</div>
					<form className="space-y-5">
						<div>
							<label className="block text-gray-700 font-medium mb-1">Email / {t.phone}</label>
							<input type="text" className="input" placeholder={t.email + " / " + t.phone} />
						</div>
						<div>
							<label className="block text-gray-700 font-medium mb-1">{t.password}</label>
							<div className="relative">
								<input type={showPassword ? "text" : "password"} className="input pr-10" placeholder={t.password} />
								<button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{showPassword ? "🙈" : "👁️"}</button>
							</div>
						</div>
						<button type="submit" className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all">{t.login}</button>
						<div className="flex justify-between text-sm mt-2">
							<button type="button" className="text-blue-600 underline" onClick={() => {}}>{t["forgot_password"] || "Forgot password?"}</button>
							<button type="button" className="text-blue-600 underline" onClick={() => navigate("/register-trader")}>{t["register"]}</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		</>
	);
}

export default Login;
