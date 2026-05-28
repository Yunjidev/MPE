/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export function useStickyScroll(cardsRef, leftRef, rightRef) {
  useEffect(() => {
    const handle = () => {
      if (!cardsRef.current || !leftRef.current || !rightRef.current) return;
      if (window.innerWidth < 1024) {
        leftRef.current.style.transform = "";
        rightRef.current.style.transform = "";
        return;
      }
      const rect = cardsRef.current.getBoundingClientRect();
      const start = window.innerHeight * 0.9;
      const end   = window.innerHeight * 0.25;
      let p = (start - rect.top) / (start - end);
      p = Math.max(0, Math.min(1, p));
      const ease = 1 - Math.pow(1 - p, 3);
      const dist = 280 * (1 - ease);
      leftRef.current.style.transform  = `translateX(${dist}px)`;
      rightRef.current.style.transform = `translateX(${-dist}px)`;
    };
    window.addEventListener("scroll", handle, { passive: true });
    window.addEventListener("resize", handle, { passive: true });
    handle();
    return () => { window.removeEventListener("scroll", handle); window.removeEventListener("resize", handle); };
  }, [cardsRef, leftRef, rightRef]);
}

const HOW_CARDS = [
  {
    num: "01 / 03",
    title: "Recherche intelligente",
    desc: "Trouvez un professionnel par métier, ville ou autour de chez vous grâce à notre filtre géographique précis.",
    visual: (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute w-44 h-44 rounded-full border border-[#132A24]/20 animate-[float_5s_ease-in-out_infinite]" />
        <div className="absolute w-28 h-28 rounded-full border border-[#132A24]/30 animate-[float_4s_ease-in-out_infinite_0.5s]" />
        <div className="w-14 h-14 rounded-2xl bg-white/80 border border-black/5 shadow-sm flex items-center justify-center">
          <svg className="w-7 h-7 text-[#132A24]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
          </svg>
        </div>
        {[[-52,-40],[48,-32],[-36,44],[54,36]].map(([x,y],i) => (
          <div key={i}
            className="absolute w-8 h-8 rounded-xl bg-white border border-black/5 shadow-sm flex items-center justify-center animate-[float_6s_ease-in-out_infinite]"
            style={{ left:`calc(50% + ${x}px)`, top:`calc(50% + ${y}px)`, animationDelay:`${i*0.7}s` }}>
            <svg className="w-3.5 h-3.5 text-[#132A24]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
            </svg>
          </div>
        ))}
      </div>
    ),
  },
  {
    num: "02 / 03",
    title: "Profils détaillés",
    desc: "Consultez les avis clients, les services proposés, les tarifs et les disponibilités avant de contacter.",
    visual: (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center opacity-15">
          <div className="w-44 h-44 border border-[#132A24]/60 rounded-full border-dashed animate-[spin_20s_linear_infinite]" />
          <div className="absolute w-28 h-28 border border-[#132A24]/40 rounded-full" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-1">
          {[5,4,5,3,5].map((s,i) => (
            <div key={i} className="flex gap-1">
              {Array.from({length:5}).map((_,j) => (
                <svg key={j} className={`w-5 h-5 ${j < s ? "text-[#132A24]" : "text-[#e7e5e4]"}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    num: "03 / 03",
    title: "Réservation directe",
    desc: "Réservez un créneau directement en ligne avec les entreprises Premium. Zéro appel, zéro attente.",
    visual: (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-56 bg-white rounded-2xl border border-black/5 p-3 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.10)] animate-[float_5s_ease-in-out_infinite]">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-[#879f98] text-xs font-medium">Juin 2026</span>
            <div className="flex gap-1">
              {["L","M","M","J","V"].map((d,i) => (
                <span key={i} className="text-[#879f98] text-[10px] w-7 text-center">{d}</span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {[null,null,1,2,3,4,5,6,7,8,9,10,11,12,13].map((d,i) => (
              <div key={i} className={`h-7 rounded-lg flex items-center justify-center text-xs font-medium
                ${d === 10 ? "bg-[#132A24] text-white" : d ? "text-[#132A24] hover:bg-[#E3EAE6]" : ""}`}>
                {d}
              </div>
            ))}
          </div>
          <div className="mt-3 px-1 py-2 rounded-xl bg-[#E3EAE6] border border-[#132A24]/20 text-xs text-[#132A24] text-center font-medium">
            10h00 — 11h30 réservé
          </div>
        </div>
      </div>
    ),
  },
];

export default function HowItWorksSection() {
  const cardsRef  = useRef(null);
  const leftRef   = useRef(null);
  const rightRef  = useRef(null);
  const cardEls   = useRef([]);
  useStickyScroll(cardsRef, leftRef, rightRef);

  useEffect(() => {
    const check = () => {
      cardEls.current.forEach((el) => {
        if (!el || el.classList.contains("in-view")) return;
        if (el.getBoundingClientRect().top < window.innerHeight * 0.88) {
          el.classList.add("in-view");
        }
      });
    };
    window.addEventListener("scroll", check, { passive: true });
    check();
    return () => window.removeEventListener("scroll", check);
  }, []);

  return (
    <section className="px-4 sm:px-8 lg:px-16 py-16 sm:py-40 w-full">
      <div className="relative w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row items-start justify-center gap-6 xl:gap-10 mb-16">

        {/* Mobile header */}
        <div className="lg:hidden w-full text-center rv-blur mb-12">
          <p className="text-sm uppercase tracking-widest text-[#879f98] mb-6 flex items-center justify-center gap-2 font-light">
            <span className="w-6 h-px bg-[#879f98]" /> COMMENT ÇA MARCHE <span className="w-6 h-px bg-[#879f98]" />
          </p>
          <h2 className="font-light text-[40px] leading-tight text-[#132A24] tracking-tight mb-4">
            Simple comme<br /><span className="text-[#274F44]">bonjour.</span>
          </h2>
        </div>

        {/* Left sticky */}
        <div className="hidden lg:flex flex-1 sticky top-[30vh] flex-col items-end text-right z-0 pr-4 xl:pr-8 h-fit overflow-visible">
          <div ref={leftRef} className="flex flex-col items-end w-full sticky-text">
            <p className="text-sm uppercase tracking-widest text-[#879f98] mb-6 flex items-center justify-end gap-2 font-light w-full">
              COMMENT ÇA MARCHE <span className="w-6 h-px bg-[#879f98]" />
            </p>
            <h2 className="font-light text-4xl xl:text-[2.75rem] leading-[1.2] text-[#132A24] tracking-tight whitespace-nowrap">
              Simple comme<br />
              <span className="text-[#274F44]">bonjour.</span>
            </h2>
          </div>
        </div>

        {/* Center scrolling cards */}
        <div
          ref={cardsRef}
          className="w-full lg:w-[450px] xl:w-[500px] flex-shrink-0 flex flex-col gap-10 mx-auto lg:mt-[40vh]"
        >
          {HOW_CARDS.map((card, idx) => (
            <div key={idx}
              ref={(el) => { cardEls.current[idx] = el; }}
              className={`rv-up w-full`}
              style={{ transitionDelay: `${idx * 120}ms` }}>
            <div
              className="group flex flex-col bg-white rounded-[2rem] border border-black/5 overflow-hidden shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-500 cursor-pointer w-full">
              <div className="w-full bg-[#E3EAE6] p-8 relative h-72 flex items-center justify-center border-b border-black/5 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(19,42,36,0.04)_0%,transparent_70%)]" />
                <div className="transition-transform duration-[1.5s] ease-out group-hover:scale-105 w-full h-full relative">
                  {card.visual}
                </div>
              </div>
              <div className="p-8 flex flex-col justify-between bg-white relative z-10 transition-colors duration-500 group-hover:bg-[#fffaf7]">
                <p className="text-xs tracking-widest uppercase text-[#879f98] mb-4 font-light">{card.num}</p>
                <h3 className="font-light text-2xl sm:text-3xl xl:text-4xl text-[#132A24] tracking-tight mb-3 transition-colors duration-300 group-hover:text-[#274F44]">
                  {card.title}
                </h3>
                <p className="text-sm sm:text-lg text-[#4b615a] leading-relaxed font-light tracking-tight">
                  {card.desc}
                </p>
              </div>
            </div>
            </div>
          ))}
        </div>

        {/* Right sticky */}
        <div className="hidden lg:flex flex-1 sticky top-[30vh] flex-col items-start text-left pl-4 xl:pl-8 h-fit">
          <div ref={rightRef} className="flex flex-col items-start w-full lg:mt-8 sticky-text">
            <p className="text-xl xl:text-2xl text-[#4b615a] font-light leading-relaxed tracking-tight whitespace-nowrap">
              Trouvez, comparez,<br />
              réservez.<br />
              <span className="text-[#274F44]">En quelques clics.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Explore CTA */}
      <div className="w-full flex justify-center py-16 rv-up rv-d3">
        <Link
          to="/searchentreprise"
          className="bg-[#1b2e28] text-white px-10 py-5 rounded-full text-base sm:text-2xl hover:bg-[#132A24] transition-colors duration-300 font-light shadow-md tracking-tight w-full sm:w-auto flex justify-center items-center gap-3 group"
        >
          Explorer les entreprises
          <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
