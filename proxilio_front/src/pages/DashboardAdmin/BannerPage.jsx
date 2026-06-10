import { useState, useEffect } from "react";
import { getData, putData } from "../../services/data-fetch";
import { toast } from "react-toastify";
import { IoSaveOutline, IoEyeOutline } from "react-icons/io5";

export default function BannerPage() {
  const [enabled, setEnabled]   = useState(false);
  const [text, setText]         = useState("");
  const [saving, setSaving]     = useState(false);
  const [loading, setLoading]   = useState(true);
  const [preview, setPreview]   = useState(false);

  useEffect(() => {
    getData("settings/banner")
      .then((d) => { setEnabled(d.enabled); setText(d.text); })
      .catch(() => toast.error("Impossible de charger le bandeau."))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await putData("admin/settings/banner", { enabled, text });
      toast.success("Bandeau mis à jour.");
    } catch { toast.error("Erreur lors de la sauvegarde."); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-6 text-sm text-[#879f98] font-light">Chargement…</div>;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1">Administration</p>
          <h1 className="text-xl font-light text-[#132A24] tracking-tight">Bandeau défilant</h1>
          <p className="text-sm text-[#879f98] font-light mt-1">Gérez le bandeau affiché sous le héro de la page d'accueil.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-[#132A24] px-4 py-2.5 text-sm font-light text-white hover:bg-[#1b3b33] transition disabled:opacity-60 shrink-0"
        >
          <IoSaveOutline />
          {saving ? "Sauvegarde…" : "Enregistrer"}
        </button>
      </div>

      <div className="bg-white border border-black/5 rounded-2xl shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 sm:p-6 space-y-6">

        {/* Toggle actif / inactif */}
        <div className="flex items-center justify-between gap-4 pb-5 border-b border-black/5">
          <div>
            <p className="text-sm font-light text-[#132A24]">Afficher le bandeau</p>
            <p className="text-xs text-[#879f98] font-light mt-0.5">
              {enabled ? "Le bandeau est visible sur la page d'accueil." : "Le bandeau est masqué."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEnabled((p) => !p)}
            className="relative shrink-0"
            aria-label={enabled ? "Désactiver" : "Activer"}
          >
            <div className={`w-12 h-6 rounded-full border transition-colors ${enabled ? "bg-[#132A24] border-[#132A24]" : "bg-[#f5f7f6] border-black/10"}`} />
            <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${enabled ? "left-7 bg-white" : "left-1 bg-[#879f98]"}`} />
          </button>
        </div>

        {/* Texte du bandeau */}
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-widest text-[#879f98] font-light">
            Texte du bandeau
          </label>
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="🎉 Votre message ici…"
            className="w-full rounded-xl bg-[#f5f7f6] border border-black/5 px-3 py-2 text-sm font-light text-[#132A24] placeholder:text-[#879f98] outline-none focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 transition resize-none"
          />
          <p className="text-xs text-[#879f98] font-light">{text.length} caractères</p>
        </div>

        {/* Aperçu */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className="inline-flex items-center gap-1.5 text-xs font-light text-[#879f98] hover:text-[#132A24] transition"
          >
            <IoEyeOutline /> {preview ? "Masquer l'aperçu" : "Voir l'aperçu"}
          </button>

          {preview && (
            <div className="rounded-xl overflow-hidden border border-black/5">
              <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light px-3 py-2 bg-[#f5f7f6] border-b border-black/5">
                Aperçu du bandeau
              </p>
              {enabled ? (
                <div className="bg-[#132A24] overflow-hidden py-3">
                  <div className="flex whitespace-nowrap animate-ticker">
                    {[0, 1].map((g) => (
                      <div key={g} className="flex shrink-0">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <span key={i} className="inline-flex items-center gap-3 px-10 text-sm font-light text-white/90 tracking-wide">
                            {text || "Texte du bandeau…"}
                            <span className="text-white/30 text-lg" aria-hidden="true">·</span>
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-[#f5f7f6] py-4 text-center text-xs text-[#879f98] font-light">
                  Bandeau désactivé — non affiché sur le site.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
