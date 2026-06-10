import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage.getItem("cookieConsent");
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookieConsent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl">
      <div className="bg-white border border-black/5 rounded-2xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">

        {/* Icon + text */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="shrink-0 w-9 h-9 rounded-xl bg-[#eef5f1] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M17.9803 8.5468C17.5123 8.69458 17.0197 8.7931 16.5271 8.7931C14.2118 8.76847 12.3399 6.89655 12.3153 4.58128C12.3153 4.13793 12.3892 3.69458 12.537 3.27586C11.9951 2.68473 11.6995 1.92118 11.6995 1.13301C11.6995 0.812808 11.7488 0.492611 11.8473 0.172414C11.2315 0.0738918 10.6158 0 10 0C4.48276 0 0 4.48276 0 10C0 15.5172 4.48276 20 10 20C15.5172 20 20 15.5172 20 10C20 9.77833 20 9.55665 19.9754 9.33498C19.2611 9.26108 18.5468 8.99015 17.9803 8.5468ZM4.58128 7.31527C6.30542 7.31527 6.30542 10.0246 4.58128 10.0246C2.85714 10.0246 2.61084 7.31527 4.58128 7.31527ZM6.05912 15.7635C4.08867 15.7635 4.08867 12.8079 6.05912 12.8079C8.02956 12.8079 8.02956 15.7635 6.05912 15.7635ZM9.01478 1.33005C10.7389 1.33005 10.7389 4.28571 9.01478 4.28571C7.29064 4.28571 7.04434 1.33005 9.01478 1.33005ZM10.2463 8.84237C11.7241 8.84237 11.7241 10.8128 10.2463 10.8128C8.76848 10.8128 9.01478 8.84237 10.2463 8.84237ZM11.9704 16.9458C10.4926 16.9458 10.4926 14.9754 11.9704 14.9754C13.4483 14.9754 13.202 16.9458 11.9704 16.9458ZM16.6503 13.1034C15.4187 13.1034 15.4187 11.133 16.6503 11.133C17.8818 11.133 17.8818 13.1034 16.6503 13.1034Z"
                fill="#132A24"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-light text-[#132A24] tracking-tight leading-relaxed">
              Proxilio utilise des cookies pour vous garantir la meilleure expérience sur notre site.{" "}
              <Link to="/cookie-policies" className="text-[#132A24] underline underline-offset-2 hover:opacity-70 transition-opacity">
                Politique de cookies
              </Link>
            </p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleAcceptAll}
          className="shrink-0 bg-[#132A24] text-white text-sm font-light tracking-tight px-5 py-2.5 rounded-full hover:bg-[#1b3b33] hover:shadow-md transition-all duration-200 whitespace-nowrap"
        >
          Accepter
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
