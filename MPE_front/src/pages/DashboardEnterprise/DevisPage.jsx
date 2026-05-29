import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { getData, postData, putData, deleteData } from "../../services/data-fetch";
import { toast } from "react-toastify";
import { IoAddOutline, IoCloseOutline, IoTrashOutline, IoPrintOutline, IoMailOutline, IoChevronBackOutline } from "react-icons/io5";

/* ─── helpers ──────────────────────────────────────────── */
const inputCls = "w-full rounded-xl bg-[#f5f7f6] border border-black/5 px-3 py-2 text-sm font-light text-[#132A24] placeholder:text-[#879f98] outline-none focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 transition";
const labelCls = "block text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1";

const STATUS_CONFIG = {
  draft:    { label: "Brouillon",  cls: "bg-[#f5f7f6] text-[#879f98] border border-black/5" },
  sent:     { label: "Envoyé",     cls: "bg-blue-50 text-blue-600 border border-blue-200" },
  accepted: { label: "Accepté",    cls: "bg-[#eef5f1] text-[#132A24] border border-[#132A24]/15" },
  rejected: { label: "Refusé",     cls: "bg-red-50 text-red-500 border border-red-200" },
  expired:  { label: "Expiré",     cls: "bg-amber-50 text-amber-600 border border-amber-200" },
};

const today = () => new Date().toISOString().split("T")[0];
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" }) : "—";
const fmtAmt = (v) => v != null ? `${parseFloat(v).toFixed(2).replace(".", ",")} €` : "—";

function computeTotals(items, laborPrice, laborPriceType, travel, tvaRate) {
  const itemsHT = items.reduce((s, it) => s + (parseFloat(it.quantity)||0) * (parseFloat(it.unit_price)||0), 0);
  const laborHT = laborPriceType ? (parseFloat(laborPrice)||0) : 0;
  const travelHT = parseFloat(travel)||0;
  const ht  = +(itemsHT + laborHT + travelHT).toFixed(2);
  const tva = +(ht * (parseFloat(tvaRate)||0) / 100).toFixed(2);
  return { ht, tva, ttc: +(ht + tva).toFixed(2) };
}

const EMPTY_ITEM = { description: "", quantity: 1, unit_price: "" };

const Section = ({ title, children }) => (
  <div className="border border-black/5 rounded-xl p-5 space-y-4">
    <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">{title}</p>
    {children}
  </div>
);
const Row = ({ children }) => <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
const Field = ({ label, children }) => <div><label className={labelCls}>{label}</label>{children}</div>;

/* ─── QuoteForm ─────────────────────────────────────────── */
function QuoteForm({ enterprise, initial, onSaved, onCancel }) {
  const slug = enterprise?.slug || enterprise?.id;
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    quote_date: today(),
    validity_days: 30,
    ent_name: enterprise?.name || "",
    ent_address: enterprise?.adress || "",
    ent_city: enterprise?.city || "",
    ent_zip: enterprise?.zip_code || "",
    ent_phone: enterprise?.phone || "",
    ent_email: enterprise?.mail || "",
    ent_siret: enterprise?.siret_number || "",
    ent_tva_number:  enterprise?.tva_number   || "",
    ent_legal_form:  enterprise?.legal_form   || "",
    ent_legal_status:enterprise?.legal_status || "",
    ent_rcs:         enterprise?.rcs_number   || "",
    ent_rm:          enterprise?.rm_number    || "",
    client_name: "", client_company: "", client_address: "", client_city: "", client_zip: "", client_phone: "", client_email: "",
    work_start_date: "", work_duration: "",
    labor_description: "", labor_price_type: "", labor_price: "",
    travel_expenses: "",
    notes: "",
    payment_conditions: "Paiement à 30 jours à réception de facture.",
    delivery_conditions: "",
    sav_conditions: "",
    is_free: true,
    tva_rate: 20,
    ...initial,
  });

  const [items, setItems] = useState(initial?.items?.length ? initial.items : [{ ...EMPTY_ITEM }]);

  useEffect(() => {
    if (initial) {
      setForm((prev) => ({ ...prev, ...initial }));
      if (initial.items?.length) setItems(initial.items);
    }
  }, [initial]);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));
  const setItem = (idx, key, val) => setItems((prev) => prev.map((it, i) => i === idx ? { ...it, [key]: val } : it));
  const addItem = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const { ht, tva, ttc } = computeTotals(items, form.labor_price, form.labor_price_type, form.travel_expenses, form.tva_rate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.client_name.trim()) { toast.error("Le nom du client est obligatoire."); return; }
    try {
      setSaving(true);
      const payload = { ...form, items, total_ht: ht, total_tva: tva, total_ttc: ttc };
      if (initial?.id) {
        await putData(`enterprise/${slug}/quotes/${initial.id}`, payload);
        toast.success("Devis mis à jour.");
      } else {
        await postData(`enterprise/${slug}/quotes`, payload);
        toast.success("Devis créé.");
      }
      onSaved();
    } catch (err) {
      try { toast.error(JSON.parse(err.message).error || "Erreur."); } catch { toast.error("Erreur lors de la sauvegarde."); }
    } finally { setSaving(false); }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between">
        <button type="button" onClick={onCancel} className="inline-flex items-center gap-1.5 text-sm font-light text-[#879f98] hover:text-[#132A24] transition">
          <IoChevronBackOutline /> Annuler
        </button>
        <h2 className="text-base font-light text-[#132A24]">{initial?.id ? "Modifier le devis" : "Nouveau devis"}</h2>
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#132A24] px-4 py-2 text-sm font-light text-white hover:bg-[#1b3b33] transition disabled:opacity-60">
          {saving ? "Sauvegarde…" : "Enregistrer"}
        </button>
      </div>

      {/* Meta */}
      <Section title="Informations du devis">
        <Row>
          <Field label="Date du devis">
            <input type="date" value={form.quote_date} onChange={(e) => set("quote_date", e.target.value)} className={`mt-1 ${inputCls}`} required />
          </Field>
          <Field label="Validité (jours)">
            <input type="number" value={form.validity_days} onChange={(e) => set("validity_days", e.target.value)} className={`mt-1 ${inputCls}`} min={1} />
          </Field>
        </Row>
        <Row>
          <Field label="Devis">
            <select value={form.is_free ? "true" : "false"} onChange={(e) => set("is_free", e.target.value === "true")} className={`mt-1 ${inputCls}`}>
              <option value="true">Gratuit</option>
              <option value="false">Payant</option>
            </select>
          </Field>
          <Field label="Taux TVA (%)">
            <input type="number" value={form.tva_rate} onChange={(e) => set("tva_rate", e.target.value)} className={`mt-1 ${inputCls}`} min={0} step={0.1} />
          </Field>
        </Row>
      </Section>

      {/* Enterprise */}
      <Section title="Informations prestataire">
        <Row>
          <Field label="Raison sociale *"><input className={`mt-1 ${inputCls}`} value={form.ent_name} onChange={(e) => set("ent_name", e.target.value)} /></Field>
          <Field label="Forme juridique"><input className={`mt-1 ${inputCls}`} placeholder="SARL, SAS, Auto-entrepreneur…" value={form.ent_legal_form} onChange={(e) => set("ent_legal_form", e.target.value)} /></Field>
        </Row>
        <Row>
          <Field label="Statut juridique"><input className={`mt-1 ${inputCls}`} value={form.ent_legal_status} onChange={(e) => set("ent_legal_status", e.target.value)} /></Field>
          <Field label="SIRET"><input className={`mt-1 ${inputCls}`} value={form.ent_siret} onChange={(e) => set("ent_siret", e.target.value)} /></Field>
        </Row>
        <Row>
          <Field label="N° TVA intracommunautaire"><input className={`mt-1 ${inputCls}`} value={form.ent_tva_number} onChange={(e) => set("ent_tva_number", e.target.value)} /></Field>
          <Field label="N° RCS (commerçants)"><input className={`mt-1 ${inputCls}`} value={form.ent_rcs} onChange={(e) => set("ent_rcs", e.target.value)} /></Field>
        </Row>
        <Row>
          <Field label="N° RM (artisans)"><input className={`mt-1 ${inputCls}`} value={form.ent_rm} onChange={(e) => set("ent_rm", e.target.value)} /></Field>
          <Field label="Adresse"><input className={`mt-1 ${inputCls}`} value={form.ent_address} onChange={(e) => set("ent_address", e.target.value)} /></Field>
        </Row>
        <Row>
          <Field label="Code postal"><input className={`mt-1 ${inputCls}`} value={form.ent_zip} onChange={(e) => set("ent_zip", e.target.value)} /></Field>
          <Field label="Ville"><input className={`mt-1 ${inputCls}`} value={form.ent_city} onChange={(e) => set("ent_city", e.target.value)} /></Field>
        </Row>
        <Row>
          <Field label="Téléphone"><input className={`mt-1 ${inputCls}`} value={form.ent_phone} onChange={(e) => set("ent_phone", e.target.value)} /></Field>
          <Field label="Email"><input type="email" className={`mt-1 ${inputCls}`} value={form.ent_email} onChange={(e) => set("ent_email", e.target.value)} /></Field>
        </Row>
      </Section>

      {/* Client */}
      <Section title="Informations client">
        <Row>
          <Field label="Nom / Prénom *"><input className={`mt-1 ${inputCls}`} value={form.client_name} onChange={(e) => set("client_name", e.target.value)} required /></Field>
          <Field label="Société"><input className={`mt-1 ${inputCls}`} value={form.client_company} onChange={(e) => set("client_company", e.target.value)} /></Field>
        </Row>
        <Row>
          <Field label="Adresse"><input className={`mt-1 ${inputCls}`} value={form.client_address} onChange={(e) => set("client_address", e.target.value)} /></Field>
          <Field label="Code postal"><input className={`mt-1 ${inputCls}`} value={form.client_zip} onChange={(e) => set("client_zip", e.target.value)} /></Field>
        </Row>
        <Row>
          <Field label="Ville"><input className={`mt-1 ${inputCls}`} value={form.client_city} onChange={(e) => set("client_city", e.target.value)} /></Field>
          <Field label="Téléphone"><input className={`mt-1 ${inputCls}`} value={form.client_phone} onChange={(e) => set("client_phone", e.target.value)} /></Field>
        </Row>
        <Field label="Email"><input type="email" className={`mt-1 ${inputCls}`} value={form.client_email} onChange={(e) => set("client_email", e.target.value)} /></Field>
      </Section>

      {/* Prestations */}
      <Section title="Détail des prestations">
        <Row>
          <Field label="Date de début des travaux">
            <input type="date" className={`mt-1 ${inputCls}`} value={form.work_start_date} onChange={(e) => set("work_start_date", e.target.value)} />
          </Field>
          <Field label="Durée estimée">
            <input className={`mt-1 ${inputCls}`} placeholder="ex : 3 jours" value={form.work_duration} onChange={(e) => set("work_duration", e.target.value)} />
          </Field>
        </Row>

        {/* Line items */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-[#879f98] font-light border-b border-black/5">
                <th className="pb-2 text-left">Description</th>
                <th className="pb-2 text-center w-20">Qté</th>
                <th className="pb-2 text-right w-28">Prix unit. HT (€)</th>
                <th className="pb-2 text-right w-24">Total HT</th>
                <th className="pb-2 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => {
                const lineTotal = (parseFloat(it.quantity)||0) * (parseFloat(it.unit_price)||0);
                return (
                  <tr key={idx} className="border-b border-black/5">
                    <td className="py-2 pr-2">
                      <input className={inputCls} value={it.description} onChange={(e) => setItem(idx, "description", e.target.value)} placeholder="Description de la prestation" />
                    </td>
                    <td className="py-2 px-1">
                      <input type="number" className={`${inputCls} text-center`} value={it.quantity} onChange={(e) => setItem(idx, "quantity", e.target.value)} min={0} step={0.01} />
                    </td>
                    <td className="py-2 px-1">
                      <input type="number" className={`${inputCls} text-right`} value={it.unit_price} onChange={(e) => setItem(idx, "unit_price", e.target.value)} min={0} step={0.01} placeholder="0,00" />
                    </td>
                    <td className="py-2 pl-1 text-right font-light text-[#132A24] whitespace-nowrap">
                      {lineTotal.toFixed(2).replace(".", ",")} €
                    </td>
                    <td className="py-2 pl-1">
                      <button type="button" onClick={() => removeItem(idx)} className="text-[#879f98] hover:text-red-500 transition">
                        <IoTrashOutline />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button type="button" onClick={addItem} className="inline-flex items-center gap-1.5 text-sm font-light text-[#132A24] hover:text-[#4b8a74] transition">
          <IoAddOutline /> Ajouter une ligne
        </button>

        <Row>
          <Field label="Main d'œuvre — description">
            <textarea className={`mt-1 ${inputCls} min-h-[60px]`} value={form.labor_description} onChange={(e) => set("labor_description", e.target.value)} />
          </Field>
          <div className="space-y-3">
            <Field label="Type de tarification">
              <select className={`mt-1 ${inputCls}`} value={form.labor_price_type} onChange={(e) => set("labor_price_type", e.target.value)}>
                <option value="">Aucun</option>
                <option value="hourly">Taux horaire</option>
                <option value="fixed">Forfait</option>
              </select>
            </Field>
            {form.labor_price_type && (
              <Field label={form.labor_price_type === "hourly" ? "Taux horaire HT (€)" : "Forfait HT (€)"}>
                <input type="number" className={`mt-1 ${inputCls}`} value={form.labor_price} onChange={(e) => set("labor_price", e.target.value)} min={0} step={0.01} />
              </Field>
            )}
          </div>
        </Row>

        <Field label="Frais de déplacement HT (€)">
          <input type="number" className={`mt-1 ${inputCls} max-w-xs`} value={form.travel_expenses} onChange={(e) => set("travel_expenses", e.target.value)} min={0} step={0.01} />
        </Field>

        {/* Totaux */}
        <div className="ml-auto max-w-xs space-y-1.5 border-t border-black/5 pt-4">
          {[
            { label: "Total HT", value: `${ht.toFixed(2).replace(".", ",")} €` },
            { label: `TVA ${form.tva_rate} %`, value: `${tva.toFixed(2).replace(".", ",")} €` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm font-light text-[#879f98]">
              <span>{label}</span><span>{value}</span>
            </div>
          ))}
          <div className="flex justify-between text-base font-light text-[#132A24] border-t border-[#132A24]/20 pt-2 mt-2">
            <span>Total TTC</span><span className="font-medium">{ttc.toFixed(2).replace(".", ",")} €</span>
          </div>
        </div>
      </Section>

      {/* Conditions */}
      <Section title="Conditions et modalités">
        <Field label="Conditions de paiement">
          <textarea className={`mt-1 ${inputCls} min-h-[60px]`} value={form.payment_conditions} onChange={(e) => set("payment_conditions", e.target.value)} />
        </Field>
        <Field label="Conditions de livraison / d'exécution">
          <textarea className={`mt-1 ${inputCls} min-h-[60px]`} value={form.delivery_conditions} onChange={(e) => set("delivery_conditions", e.target.value)} />
        </Field>
        <Field label="Conditions SAV (si applicable)">
          <textarea className={`mt-1 ${inputCls} min-h-[60px]`} value={form.sav_conditions} onChange={(e) => set("sav_conditions", e.target.value)} />
        </Field>
        <Field label="Notes complémentaires">
          <textarea className={`mt-1 ${inputCls} min-h-[80px]`} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>
      </Section>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-xl border border-black/10 px-5 py-2.5 text-sm font-light text-[#879f98] hover:bg-[#f5f7f6] transition">Annuler</button>
        <button type="submit" disabled={saving} className="rounded-xl bg-[#132A24] px-5 py-2.5 text-sm font-light text-white hover:bg-[#1b3b33] transition disabled:opacity-60">
          {saving ? "Sauvegarde…" : "Enregistrer le devis"}
        </button>
      </div>
    </form>
  );
}

/* ─── QuoteDetail ───────────────────────────────────────── */
function QuoteDetail({ quote, slug, onBack, onStatusChange, onDelete }) {
  const [sendEmail, setSendEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const printRef = useRef(null);

  const handleSend = async () => {
    const email = sendEmail.trim() || quote.client_email;
    if (!email) { toast.error("Renseignez l'adresse e-mail du client."); return; }
    try {
      setSending(true);
      await postData(`enterprise/${slug}/quotes/${quote.id}/send`, { email });
      toast.success("Devis envoyé par e-mail.");
      onStatusChange(quote.id, "sent");
    } catch (err) {
      try { toast.error(JSON.parse(err.message).error || "Erreur."); } catch { toast.error("Erreur lors de l'envoi."); }
    } finally { setSending(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer ce devis ?")) return;
    try {
      setDeleting(true);
      await deleteData(`enterprise/${slug}/quotes/${quote.id}`);
      toast.success("Devis supprimé.");
      onDelete(quote.id);
    } catch { toast.error("Erreur lors de la suppression."); } finally { setDeleting(false); }
  };

  const handlePrint = () => window.print();

  const { label: statusLabel, cls: statusCls } = STATUS_CONFIG[quote.status] || STATUS_CONFIG.draft;
  const validityDate = new Date(quote.quote_date);
  validityDate.setDate(validityDate.getDate() + (quote.validity_days || 30));

  const itemsRows = (quote.items || []).map((it, idx) => {
    const lineTotal = (parseFloat(it.quantity)||0) * (parseFloat(it.unit_price)||0);
    return (
      <tr key={idx} className="border-b border-black/5 text-sm font-light">
        <td className="py-2.5 pr-3 text-[#132A24]">{it.description}</td>
        <td className="py-2.5 px-2 text-center text-[#879f98]">{it.quantity}</td>
        <td className="py-2.5 px-2 text-right text-[#879f98]">{fmtAmt(it.unit_price)}</td>
        <td className="py-2.5 pl-2 text-right text-[#132A24]">{fmtAmt(lineTotal)}</td>
      </tr>
    );
  });

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-light text-[#879f98] hover:text-[#132A24] transition">
          <IoChevronBackOutline /> Retour
        </button>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-light border ${statusCls}`}>{statusLabel}</span>
        <div className="ml-auto flex flex-wrap gap-2">
          <button onClick={handlePrint} className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 px-3 py-2 text-xs font-light text-[#132A24] hover:bg-[#eef5f1] transition">
            <IoPrintOutline /> Imprimer / PDF
          </button>
          <button onClick={handleDelete} disabled={deleting} className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-xs font-light text-red-500 hover:bg-red-50 transition disabled:opacity-60">
            <IoTrashOutline /> Supprimer
          </button>
        </div>
      </div>

      {/* Preview printable */}
      <div ref={printRef} className="bg-white border border-black/5 rounded-2xl shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] overflow-hidden print:shadow-none print:border-0 print:rounded-none">
        {/* Header */}
        <div className="bg-[#132A24] text-white px-8 py-6 print:px-10 print:py-8">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1">Devis</p>
              <p className="text-2xl font-light tracking-tight">{quote.quote_number}</p>
            </div>
            <div className="text-right text-xs text-[#879f98] font-light space-y-1">
              <p>Date : {fmtDate(quote.quote_date)}</p>
              <p>Valable jusqu'au : {fmtDate(validityDate)}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-light ${quote.is_free ? "bg-[#eef5f1] text-[#132A24]" : "bg-orange-100 text-orange-700"}`}>
                {quote.is_free ? "Devis gratuit" : "Devis payant"}
              </span>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6 print:px-10">
          {/* Parties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                label: "Prestataire",
                lines: [
                  quote.ent_name,
                  [quote.ent_legal_form, quote.ent_legal_status].filter(Boolean).join(" — "),
                  quote.ent_address,
                  [quote.ent_zip, quote.ent_city].filter(Boolean).join(" "),
                  quote.ent_siret ? `SIRET : ${quote.ent_siret}` : null,
                  quote.ent_tva_number ? `TVA : ${quote.ent_tva_number}` : null,
                  quote.ent_rcs ? `RCS : ${quote.ent_rcs}` : null,
                  quote.ent_rm ? `RM : ${quote.ent_rm}` : null,
                  [quote.ent_phone, quote.ent_email].filter(Boolean).join(" · "),
                ].filter(Boolean),
              },
              {
                label: "Client",
                lines: [
                  [quote.client_name, quote.client_company].filter(Boolean).join(" — "),
                  quote.client_address,
                  [quote.client_zip, quote.client_city].filter(Boolean).join(" "),
                  quote.client_phone ? `Tél : ${quote.client_phone}` : null,
                  quote.client_email,
                ].filter(Boolean),
              },
            ].map(({ label, lines }) => (
              <div key={label} className="bg-[#f5f7f6] rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-2">{label}</p>
                {lines.map((l, i) => (
                  <p key={i} className={`text-sm font-light text-[#132A24] leading-relaxed ${i === 0 ? "font-medium" : ""}`}>{l}</p>
                ))}
              </div>
            ))}
          </div>

          {/* Work details */}
          {(quote.work_start_date || quote.work_duration) && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light border-b border-black/5 pb-2 mb-3">Détails de la prestation</p>
              <p className="text-sm font-light text-[#132A24]">
                {quote.work_start_date && `Début : ${fmtDate(quote.work_start_date)}`}
                {quote.work_duration && ` — Durée estimée : ${quote.work_duration}`}
              </p>
            </div>
          )}

          {/* Items */}
          {(quote.items?.length > 0 || quote.labor_description) && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light border-b border-black/5 pb-2 mb-3">Détail des prestations</p>
              {quote.items?.length > 0 && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">
                      <th className="pb-2 text-left">Description</th>
                      <th className="pb-2 text-center w-16">Qté</th>
                      <th className="pb-2 text-right w-28">Prix HT</th>
                      <th className="pb-2 text-right w-24">Total HT</th>
                    </tr>
                  </thead>
                  <tbody>{itemsRows}</tbody>
                </table>
              )}
              {quote.labor_description && (
                <div className="mt-3 bg-[#f5f7f6] rounded-lg p-3 text-sm font-light text-[#132A24]">
                  <span className="font-medium">Main d'œuvre : </span>{quote.labor_description}
                  {quote.labor_price_type && ` — ${quote.labor_price_type === "hourly" ? "Taux horaire" : "Forfait"} : ${fmtAmt(quote.labor_price)}`}
                </div>
              )}
              {parseFloat(quote.travel_expenses) > 0 && (
                <p className="mt-2 text-sm font-light text-[#879f98]">Frais de déplacement : {fmtAmt(quote.travel_expenses)}</p>
              )}
            </div>
          )}

          {/* Totaux */}
          <div className="ml-auto max-w-xs space-y-1.5 border-t border-black/5 pt-4">
            {[
              { label: "Total HT", value: fmtAmt(quote.total_ht) },
              { label: `TVA ${quote.tva_rate} %`, value: fmtAmt(quote.total_tva) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm font-light text-[#879f98]">
                <span>{label}</span><span>{value}</span>
              </div>
            ))}
            <div className="flex justify-between text-base font-medium text-[#132A24] border-t-2 border-[#132A24] pt-2 mt-1">
              <span>Total TTC</span><span>{fmtAmt(quote.total_ttc)}</span>
            </div>
          </div>

          {/* Conditions */}
          {(quote.payment_conditions || quote.delivery_conditions || quote.sav_conditions) && (
            <div className="bg-[#f5f7f6] rounded-xl p-4 space-y-2 text-sm font-light text-[#555]">
              {quote.payment_conditions && <p><strong className="text-[#132A24] font-medium">Paiement : </strong>{quote.payment_conditions}</p>}
              {quote.delivery_conditions && <p><strong className="text-[#132A24] font-medium">Livraison : </strong>{quote.delivery_conditions}</p>}
              {quote.sav_conditions && <p><strong className="text-[#132A24] font-medium">SAV : </strong>{quote.sav_conditions}</p>}
            </div>
          )}

          {quote.notes && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-2">Notes</p>
              <p className="text-sm font-light text-[#555] leading-relaxed">{quote.notes}</p>
            </div>
          )}

          {/* Bon pour accord */}
          <div className="border-2 border-dashed border-[#ccc] rounded-xl p-5 text-center print:mt-8">
            <p className="text-sm font-medium text-[#132A24]">Bon pour accord</p>
            <p className="text-xs font-light text-[#879f98] mt-1">Lu et approuvé — Signature précédée de la mention « Bon pour accord »</p>
            <div className="flex justify-center gap-8 mt-4">
              <div className="text-center">
                <p className="text-xs text-[#879f98] font-light mb-8">Date :</p>
                <div className="border-b border-[#999] w-40" />
              </div>
              <div className="text-center">
                <p className="text-xs text-[#879f98] font-light mb-8">Signature :</p>
                <div className="border-b border-[#999] w-40" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Send email */}
      {quote.status !== "accepted" && (
        <div className="bg-white border border-black/5 rounded-2xl shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5">
          <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-3">Envoyer par e-mail</p>
          <div className="flex gap-3">
            <input
              type="email"
              value={sendEmail}
              onChange={(e) => setSendEmail(e.target.value)}
              placeholder={quote.client_email || "Email du client"}
              className={`flex-1 ${inputCls}`}
            />
            <button onClick={handleSend} disabled={sending} className="inline-flex items-center gap-2 rounded-xl bg-[#132A24] px-4 py-2 text-sm font-light text-white hover:bg-[#1b3b33] transition disabled:opacity-60 shrink-0">
              <IoMailOutline /> {sending ? "Envoi…" : "Envoyer"}
            </button>
          </div>
          <p className="text-xs text-[#879f98] font-light mt-2">Le devis sera envoyé par e-mail au client. Le statut passera à « Envoyé ».</p>
        </div>
      )}
    </div>
  );
}

/* ─── DevisPage ─────────────────────────────────────────── */
export default function DevisPage() {
  const { slug } = useParams();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enterprise, setEnterprise] = useState(null);
  const [view, setView] = useState("list"); // "list" | "form" | "detail"
  const [editQuote, setEditQuote] = useState(null);
  const [detailQuote, setDetailQuote] = useState(null);

  const fetchEnterprise = useCallback(async () => {
    try { setEnterprise(await getData(`enterprise/${slug}`)); } catch { /* noop */ }
  }, [slug]);

  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true);
      setQuotes(await getData(`enterprise/${slug}/quotes`));
    } catch {
      toast.error("Impossible de charger les devis.");
    } finally { setLoading(false); }
  }, [slug]);

  useEffect(() => { fetchEnterprise(); fetchQuotes(); }, [fetchEnterprise, fetchQuotes]);

  const openNew  = () => { setEditQuote(null); setView("form"); };
  const openEdit = (q) => { setEditQuote(q); setView("form"); };
  const openDetail = async (q) => {
    try {
      const full = await getData(`enterprise/${slug}/quotes/${q.id}`);
      setDetailQuote(full);
      setView("detail");
    } catch { toast.error("Impossible de charger le devis."); }
  };

  const onSaved = () => { setView("list"); fetchQuotes(); };
  const onBack  = () => { setView("list"); setDetailQuote(null); };

  const onStatusChange = (id, status) => {
    setQuotes((prev) => prev.map((q) => q.id === id ? { ...q, status } : q));
    setDetailQuote((prev) => prev ? { ...prev, status } : prev);
  };
  const onDelete = (id) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    setView("list");
  };

  if (!enterprise?.isPremium) {
    return (
      <div className="mt-6 bg-white border border-black/5 rounded-2xl p-10 text-center shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
        <p className="text-sm text-[#879f98] font-light">La création de devis est réservée aux entreprises Premium.</p>
      </div>
    );
  }

  if (view === "form") {
    return (
      <div className="mt-6">
        <QuoteForm enterprise={enterprise} initial={editQuote} onSaved={onSaved} onCancel={() => setView("list")} />
      </div>
    );
  }

  if (view === "detail" && detailQuote) {
    return (
      <div className="mt-6">
        <QuoteDetail quote={detailQuote} slug={slug} onBack={onBack} onStatusChange={onStatusChange} onDelete={onDelete} />
      </div>
    );
  }

  /* List view */
  return (
    <div className="mt-6 space-y-5">
      <header className="rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 lg:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">Entreprise</p>
            <h1 className="mt-1 text-xl font-light text-[#132A24] tracking-tight">Mes devis</h1>
            <p className="mt-1 text-sm text-[#879f98] font-light">Créez et gérez vos devis professionnels.</p>
          </div>
          <button onClick={openNew} className="inline-flex items-center gap-2 rounded-xl bg-[#132A24] px-4 py-2.5 text-sm font-light text-white hover:bg-[#1b3b33] transition shrink-0">
            <IoAddOutline className="text-base" /> Nouveau devis
          </button>
        </div>
      </header>

      <div className="rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 lg:p-6">
        {loading ? (
          <div className="py-12 text-center text-sm text-[#879f98] font-light">Chargement…</div>
        ) : quotes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-black/10 bg-[#f5f7f6] py-16 text-center">
            <p className="text-sm text-[#879f98] font-light mb-4">Aucun devis pour le moment.</p>
            <button onClick={openNew} className="inline-flex items-center gap-2 rounded-xl bg-[#132A24] px-4 py-2.5 text-sm font-light text-white hover:bg-[#1b3b33] transition">
              <IoAddOutline /> Créer mon premier devis
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {quotes.map((q) => {
              const { label, cls } = STATUS_CONFIG[q.status] || STATUS_CONFIG.draft;
              return (
                <div key={q.id} className="rounded-xl border border-black/5 bg-[#f5f7f6] p-4 hover:bg-[#eef5f1] transition cursor-pointer flex flex-wrap items-center gap-4 justify-between"
                  onClick={() => openDetail(q)}>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">{q.quote_number}</p>
                    <p className="text-sm font-light text-[#132A24] mt-0.5">{q.client_name}{q.client_company ? ` — ${q.client_company}` : ""}</p>
                    <p className="text-xs text-[#879f98] font-light mt-0.5">{fmtDate(q.quote_date)}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-light text-[#132A24]">{fmtAmt(q.total_ttc)}</span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-light border ${cls}`}>{label}</span>
                    <button onClick={(e) => { e.stopPropagation(); openEdit(q); }}
                      className="text-[#879f98] hover:text-[#132A24] transition text-xs font-light border border-black/10 rounded-lg px-2.5 py-1">
                      Modifier
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
