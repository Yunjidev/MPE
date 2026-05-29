import { useState, useEffect, useCallback } from "react";
import { getData, postData, putData, deleteData } from "../../services/data-fetch";
import { toast } from "react-toastify";
import { IoAddOutline, IoTrashOutline, IoSaveOutline, IoMailOutline, IoEyeOutline, IoCodeOutline } from "react-icons/io5";

const inputCls = "w-full rounded-xl bg-[#f5f7f6] border border-black/5 px-3 py-2 text-sm font-light text-[#132A24] placeholder:text-[#879f98] outline-none focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 transition";

/* ── Markdown renderer (minimal) ── */
function renderMd(md) {
  if (!md) return "";
  return md
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #e0e0de;margin:14px 0"/>')
    .replace(/^### (.+)$/gm, '<div style="font-size:13px;font-weight:600;color:#132A24;margin:14px 0 6px">$1</div>')
    .replace(/^## (.+)$/gm, '<div style="font-size:15px;font-weight:500;color:#132A24;margin:0 0 12px">$1</div>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:600;color:#132A24">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<div style="padding:2px 0 2px 16px;position:relative"><span style="position:absolute;left:4px">•</span>$1</div>')
    .replace(/\n\n/g, '<div style="margin:8px 0"></div>')
    .replace(/\n/g, "<br/>");
}

/* ── Aide markdown ── */
const MD_HELP = [
  ["## Titre", "Grand titre"],
  ["### Sous-titre", "Sous-titre"],
  ["**gras**", "Texte en gras"],
  ["*italique*", "Texte en italique"],
  ["- item", "Point de liste"],
  ["---", "Séparateur horizontal"],
];

export default function MarketingPage() {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [preview, setPreview] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchTemplates = useCallback(async () => {
    try {
      const data = await getData("admin/marketing/templates");
      setTemplates(data);
      if (data.length && !selected) applyTemplate(data[0]);
    } catch { toast.error("Impossible de charger les templates."); }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const applyTemplate = (tpl) => {
    setSelected(tpl.id);
    setName(tpl.name);
    setSubject(tpl.subject);
    setBody(tpl.body);
    setIsDirty(false);
    setIsNew(false);
  };

  const handleNew = () => {
    setSelected(null);
    setName("Nouveau template");
    setSubject("");
    setBody("## Bonjour,\n\n");
    setIsDirty(true);
    setIsNew(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !subject.trim() || !body.trim()) {
      toast.error("Nom, sujet et corps sont requis.");
      return;
    }
    try {
      setSaving(true);
      if (isNew) {
        const tpl = await postData("admin/marketing/templates", { name, subject, body });
        setTemplates((p) => [...p, tpl]);
        setSelected(tpl.id);
        setIsNew(false);
        toast.success("Template créé.");
      } else {
        const tpl = await putData(`admin/marketing/templates/${selected}`, { name, subject, body });
        setTemplates((p) => p.map((t) => t.id === selected ? tpl : t));
        toast.success("Template enregistré.");
      }
      setIsDirty(false);
    } catch { toast.error("Erreur lors de la sauvegarde."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce template ?")) return;
    try {
      await deleteData(`admin/marketing/templates/${id}`);
      const remaining = templates.filter((t) => t.id !== id);
      setTemplates(remaining);
      if (selected === id) {
        if (remaining.length) applyTemplate(remaining[0]);
        else { setSelected(null); setName(""); setSubject(""); setBody(""); setIsNew(false); }
      }
      toast.success("Template supprimé.");
    } catch { toast.error("Erreur lors de la suppression."); }
  };

  const parseEmails = (raw) =>
    raw.split(/[\n,;]+/).map((e) => e.trim()).filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

  const handleSend = async () => {
    const emails = parseEmails(emailInput);
    if (!emails.length) { toast.error("Ajoutez au moins une adresse e-mail valide."); return; }
    if (!subject.trim() || !body.trim()) { toast.error("Sujet et corps requis."); return; }
    if (!window.confirm(`Envoyer cet email à ${emails.length} destinataire(s) ?`)) return;
    try {
      setSending(true);
      const res = await postData("admin/marketing/send", { subject, body, emails });
      toast.success(`${res.sent} email(s) envoyé(s).${res.failed ? ` ${res.failed} échec(s).` : ""}`);
    } catch (err) {
      try { toast.error(JSON.parse(err.message).error || "Erreur."); } catch { toast.error("Erreur lors de l'envoi."); }
    } finally { setSending(false); }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1">Administration</p>
          <h1 className="text-xl font-light text-[#132A24] tracking-tight">Marketing — Envoi d'emails</h1>
        </div>
        <button onClick={handleNew}
          className="inline-flex items-center gap-2 rounded-xl bg-[#132A24] px-4 py-2.5 text-sm font-light text-white hover:bg-[#1b3b33] transition shrink-0">
          <IoAddOutline /> Nouvelle template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Liste des templates */}
        <div className="lg:col-span-1 space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">Templates</p>
          {isNew && (
            <div className="rounded-xl border border-[#132A24] bg-[#132A24] p-3">
              <p className="text-sm font-light text-white truncate">✦ {name || "Nouveau template"}</p>
              <p className="text-xs text-[#879f98] mt-0.5">Non sauvegardé</p>
            </div>
          )}
          {templates.map((tpl) => (
            <div key={tpl.id}
              className={`group rounded-xl border p-3 transition cursor-pointer flex items-start justify-between gap-2 ${
                selected === tpl.id && !isNew
                  ? "bg-[#132A24] border-[#132A24]"
                  : "bg-white border-black/5 hover:bg-[#f5f7f6]"
              }`}
              onClick={() => applyTemplate(tpl)}
            >
              <div className="min-w-0">
                <p className={`text-sm font-light truncate ${selected === tpl.id && !isNew ? "text-white" : "text-[#132A24]"}`}>{tpl.name}</p>
                <p className={`text-xs mt-0.5 truncate ${selected === tpl.id && !isNew ? "text-[#879f98]" : "text-[#879f98]"}`}>{tpl.subject}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(tpl.id); }}
                className={`shrink-0 opacity-0 group-hover:opacity-100 transition ${selected === tpl.id && !isNew ? "text-red-300 hover:text-red-200" : "text-red-400 hover:text-red-600"}`}>
                <IoTrashOutline className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Éditeur */}
        <div className="lg:col-span-3 space-y-4">
          {/* Nom + actions */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <input className={`${inputCls} max-w-xs`} value={name}
              onChange={(e) => { setName(e.target.value); setIsDirty(true); }}
              placeholder="Nom du template" />
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setShowHelp((p) => !p)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 px-3 py-2 text-xs font-light text-[#879f98] hover:text-[#132A24] hover:bg-[#f5f7f6] transition">
                <IoCodeOutline /> Markdown
              </button>
              <button onClick={() => setPreview((p) => !p)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 px-3 py-2 text-xs font-light text-[#879f98] hover:text-[#132A24] hover:bg-[#f5f7f6] transition">
                <IoEyeOutline /> {preview ? "Éditer" : "Aperçu"}
              </button>
              {isDirty && (
                <button onClick={handleSave} disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#132A24] px-3 py-2 text-xs font-light text-white hover:bg-[#1b3b33] transition disabled:opacity-60">
                  <IoSaveOutline /> {saving ? "Sauvegarde…" : "Enregistrer"}
                </button>
              )}
            </div>
          </div>

          {/* Aide markdown */}
          {showHelp && (
            <div className="bg-[#f5f7f6] border border-black/5 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-3">Syntaxe Markdown</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {MD_HELP.map(([syntax, desc]) => (
                  <div key={syntax} className="bg-white rounded-lg px-3 py-2 border border-black/5">
                    <code className="text-xs text-[#4b8a74] font-mono">{syntax}</code>
                    <p className="text-[11px] text-[#879f98] font-light mt-0.5">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sujet */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1">Objet de l'email</label>
            <input className={inputCls} value={subject}
              onChange={(e) => { setSubject(e.target.value); setIsDirty(true); }}
              placeholder="Objet…" />
          </div>

          {/* Corps — éditeur ou aperçu */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1">
              {preview ? "Aperçu rendu" : "Corps du message (Markdown)"}
            </label>
            {preview ? (
              <div className="bg-white border border-black/5 rounded-xl p-5 min-h-[300px] text-sm font-light text-[#132A24] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMd(body) }} />
            ) : (
              <textarea className={`${inputCls} min-h-[300px] font-mono text-xs leading-relaxed`}
                value={body}
                onChange={(e) => { setBody(e.target.value); setIsDirty(true); }}
                placeholder="Rédigez votre message en Markdown…" />
            )}
          </div>

          {/* Email preview rendu dans un cadre mail */}
          {preview && (
            <div className="border border-black/5 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-[#132A24] px-6 py-4 text-center">
                <p className="text-[10px] uppercase tracking-widest text-[#879f98]">Proxilio</p>
              </div>
              <div className="bg-white px-8 py-6 text-sm font-light text-[#132A24] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMd(body) }} />
              <div className="bg-[#f5f7f6] px-6 py-3 text-center border-t border-[#eaede9]">
                <p className="text-[11px] text-[#aaa]">Proxilio — proxilio.fr</p>
              </div>
            </div>
          )}

          {/* Destinataires */}
          <div className="bg-white border border-black/5 rounded-2xl p-5 space-y-4">
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">Destinataires & Envoi</p>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1">
                Emails <span className="normal-case tracking-normal text-[#879f98]">(un par ligne, ou séparés par virgule/point-virgule)</span>
              </label>
              <textarea className={`${inputCls} min-h-[100px] font-mono text-xs`}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder={"email1@exemple.fr\nemail2@exemple.fr"} />
              {emailInput.trim() && (
                <p className="text-xs text-[#879f98] font-light mt-1">
                  {parseEmails(emailInput).length} adresse(s) valide(s) détectée(s)
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <button onClick={handleSend} disabled={sending || !parseEmails(emailInput).length}
                className="inline-flex items-center gap-2 rounded-xl bg-[#132A24] px-6 py-3 text-sm font-light text-white hover:bg-[#1b3b33] transition disabled:opacity-50">
                <IoMailOutline />
                {sending ? "Envoi en cours…" : `Envoyer à ${parseEmails(emailInput).length || 0} destinataire(s)`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
