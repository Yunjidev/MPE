import { useState, useEffect } from "react";
import { getData, postData } from "../../services/data-fetch";
import { toast } from "react-toastify";

const inputCls = "w-full rounded-xl bg-[#f5f7f6] border border-black/5 px-3 py-2 text-sm font-light text-[#132A24] placeholder:text-[#879f98] outline-none focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 transition";

export default function MarketingPage() {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getData("admin/marketing/templates")
      .then((data) => { setTemplates(data); if (data.length) applyTemplate(data[0]); })
      .catch(() => toast.error("Impossible de charger les templates."));
  }, []);

  const applyTemplate = (tpl) => {
    setSelected(tpl.id);
    setSubject(tpl.subject);
    setBody(tpl.body);
  };

  const parseEmails = (raw) =>
    raw.split(/[\n,;]+/).map((e) => e.trim()).filter((e) => e.includes("@"));

  const handleSend = async () => {
    const emails = parseEmails(emailInput);
    if (!emails.length) { toast.error("Ajoutez au moins une adresse e-mail valide."); return; }
    if (!subject.trim() || !body.trim()) { toast.error("Sujet et corps sont requis."); return; }
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
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-2">Administration</p>
        <h1 className="text-xl font-light text-[#132A24] tracking-tight">Marketing — Envoi d'emails</h1>
        <p className="text-sm text-[#879f98] font-light mt-1">
          Sélectionnez un template, éditez-le si besoin, entrez vos destinataires et envoyez.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Templates */}
        <div className="lg:col-span-1 space-y-3">
          <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">Templates</p>
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => applyTemplate(tpl)}
              className={`w-full text-left rounded-xl border p-4 transition ${
                selected === tpl.id
                  ? "bg-[#132A24] border-[#132A24] text-white shadow-md"
                  : "bg-white border-black/5 text-[#132A24] hover:bg-[#f5f7f6]"
              }`}
            >
              <p className={`text-sm font-light ${selected === tpl.id ? "text-white" : "text-[#132A24]"}`}>{tpl.name}</p>
              <p className={`text-xs mt-1 font-light line-clamp-2 ${selected === tpl.id ? "text-[#879f98]" : "text-[#879f98]"}`}>{tpl.subject}</p>
            </button>
          ))}
        </div>

        {/* Editor + recipients */}
        <div className="lg:col-span-2 space-y-4">
          {/* Subject */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1">Objet de l'email</label>
            <input className={inputCls} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Objet…" />
          </div>

          {/* Body */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1">Corps du message</label>
            <textarea
              className={`${inputCls} min-h-[280px] font-mono text-xs leading-relaxed`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          {/* Preview */}
          <div className="bg-[#f5f7f6] rounded-xl p-4 border border-black/5">
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-2">Aperçu</p>
            <p className="text-xs font-medium text-[#132A24] mb-2">{subject}</p>
            <div className="text-xs text-[#555] font-light whitespace-pre-wrap leading-relaxed">{body}</div>
          </div>

          {/* Recipients */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1">
              Destinataires <span className="normal-case tracking-normal">(un par ligne, ou séparés par virgule/point-virgule)</span>
            </label>
            <textarea
              className={`${inputCls} min-h-[100px] font-mono text-xs`}
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder={"email1@exemple.fr\nemail2@exemple.fr\nemail3@exemple.fr"}
            />
            {emailInput.trim() && (
              <p className="text-xs text-[#879f98] font-light mt-1">
                {parseEmails(emailInput).length} adresse(s) valide(s) détectée(s)
              </p>
            )}
          </div>

          {/* Send */}
          <div className="flex justify-end">
            <button
              onClick={handleSend}
              disabled={sending}
              className="inline-flex items-center gap-2 rounded-xl bg-[#132A24] px-6 py-3 text-sm font-light text-white hover:bg-[#1b3b33] transition disabled:opacity-60"
            >
              {sending ? "Envoi en cours…" : `Envoyer à ${parseEmails(emailInput).length || 0} destinataire(s)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
