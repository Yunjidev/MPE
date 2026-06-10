/* eslint-disable react/prop-types */
import { useId, useState, useMemo } from "react";

export default function DropdownMenu({ category, items = [], defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(!!defaultOpen);
  const baseId = useId();
  const contentId = useMemo(() => `${baseId}-content`, [baseId]);

  const toggle = () => setIsOpen((v) => !v);

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
  };

  return (
    <div className="border border-black/5 rounded-2xl bg-white overflow-hidden transition-shadow duration-300 hover:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)]">
      {/* Header */}
      <button
        type="button"
        onClick={toggle}
        onKeyDown={onKeyDown}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none group"
      >
        <span className="text-base sm:text-lg font-light tracking-tight text-[#132A24]">
          {category}
        </span>
        <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${isOpen ? "bg-[#132A24]" : "bg-[#eef5f1] group-hover:bg-[#dce7e2]"}`}>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-white" : "text-[#132A24]"}`}
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </span>
      </button>

      {/* Content (grid collapse animation) */}
      <div
        id={contentId}
        className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="min-h-0">
          <div className="px-6 pb-6 space-y-4 border-t border-black/5 pt-4">
            {items.map((item, idx) => (
              <article key={idx}>
                {item?.question && (
                  <h3 className="text-sm sm:text-base font-light text-[#132A24] tracking-tight mb-1.5">
                    {item.question}
                  </h3>
                )}
                {item?.answer && (
                  <p className="text-sm text-[#4b615a] font-light leading-relaxed tracking-tight">
                    {item.answer}
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
