import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function MarkdownEditor({ id, value, onChange, placeholder }) {
  const [tab, setTab] = useState("write");

  const handleChange = (e) => {
    onChange({ target: { id, value: e.target.value } });
  };

  return (
    <div className="flex flex-col gap-0 border border-black/5 rounded-xl overflow-hidden bg-[#f5f7f6]">
      {/* Tabs */}
      <div className="flex border-b border-black/5 bg-white">
        <button
          type="button"
          onClick={() => setTab("write")}
          className={`px-4 py-2 text-xs font-light tracking-tight transition-colors ${
            tab === "write"
              ? "text-[#132A24] border-b-2 border-[#132A24] -mb-px bg-white"
              : "text-[#879f98] hover:text-[#132A24]"
          }`}
        >
          Écrire
        </button>
        <button
          type="button"
          onClick={() => setTab("preview")}
          className={`px-4 py-2 text-xs font-light tracking-tight transition-colors ${
            tab === "preview"
              ? "text-[#132A24] border-b-2 border-[#132A24] -mb-px bg-white"
              : "text-[#879f98] hover:text-[#132A24]"
          }`}
        >
          Aperçu
        </button>
        <div className="ml-auto px-4 py-2 text-[10px] text-[#879f98] font-light self-center">
          Markdown supporté
        </div>
      </div>

      {/* Write */}
      {tab === "write" && (
        <textarea
          id={id}
          value={value || ""}
          onChange={handleChange}
          placeholder={placeholder}
          rows={10}
          className="w-full bg-[#f5f7f6] text-[#132A24] placeholder:text-[#879f98] px-4 py-3 text-sm font-light resize-y focus:outline-none focus:ring-2 focus:ring-[#132A24]/20 min-h-[200px]"
        />
      )}

      {/* Preview */}
      {tab === "preview" && (
        <div className="px-4 py-3 min-h-[200px] text-sm font-light text-[#132A24] leading-relaxed prose prose-sm max-w-none
          prose-headings:font-light prose-headings:text-[#132A24]
          prose-strong:font-medium prose-strong:text-[#132A24]
          prose-a:text-[#132A24] prose-a:underline
          prose-ul:pl-5 prose-ol:pl-5
          prose-li:my-0.5">
          {value ? (
            <ReactMarkdown>{value}</ReactMarkdown>
          ) : (
            <span className="text-[#879f98]">Rien à afficher…</span>
          )}
        </div>
      )}
    </div>
  );
}
