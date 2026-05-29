import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getData, postData, putData, deleteData } from "../../services/data-fetch";
import { toast } from "react-toastify";
import {
  IoAddOutline, IoTrashOutline, IoMailOutline,
  IoChevronBackOutline, IoDownloadOutline, IoCheckmarkCircleOutline,
} from "react-icons/io5";

/* ── helpers ─────────────────────────────────────────────── */
const inputCls = "w-full rounded-xl bg-[#f5f7f6] border border-black/5 px-3 py-2 text-sm font-light text-[#132A24] placeholder:text-[#879f98] outline-none focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 transition";
const labelCls = "block text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1";
const today = () => new Date().toISOString().split("T")[0];
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "—";
const fmtAmt  = (v) => v != null ? `${parseFloat(v).toFixed(2).replace(".", ",")} €` : "—";

const STATUS_CONFIG = {
  draft:     { label: "Brouillon",  cls: "bg-[#f5f7f6] text-[#879f98] border border-black/5" },
  sent:      { label: "Envoyée",    cls: "bg-blue-50 text-blue-600 border border-blue-200" },
  paid:      { label: "Payée",      cls: "bg-[#eef5f1] text-[#132A24] border border-[#132A24]/15" },
  overdue:   { label: "En retard",  cls: "bg-red-50 text-red-500 border border-red-200" },
  cancelled: { label: "Annulée",    cls: "bg-amber-50 text-amber-600 border border-amber-200" },
};

const EMPTY_ITEM = { description: "", quantity: 1, unit_price: "" };

function computeTotals(items, laborPrice, laborPriceType, travel, tvaRate) {
  const itemsHT = items.reduce((s, it) => s + (parseFloat(it.quantity)||0)*(parseFloat(it.unit_price)||0), 0);
  const laborHT = laborPriceType ? (parseFloat(laborPrice)||0) : 0;
  const ht = +(itemsHT + laborHT + (parseFloat(travel)||0)).toFixed(2);
  const tva = +(ht * (parseFloat(tvaRate)||0) / 100).toFixed(2);
  return { ht, tva, ttc: +(ht + tva).toFixed(2) };
}

/* ── PDF export (same style as quotes) ─────────────────── */
function generateInvoicePDF(inv, enterpriseLogo) {
  const d = (v) => v || "";
  const amt = (v) => v != null && v !== "" ? `${parseFloat(v).toFixed(2).replace(".", ",")} €` : "—";
  const dt  = (v) => v ? new Date(v).toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" }) : "";

  const itemsRows = (inv.items || []).map((it) => {
    const total = (parseFloat(it.quantity)||0)*(parseFloat(it.unit_price)||0);
    return `<tr>
      <td style="padding:9px 12px;border-bottom:1px solid #f0f0ee;">${d(it.description)}</td>
      <td style="padding:9px 12px;border-bottom:1px solid #f0f0ee;text-align:center;">${it.quantity}</td>
      <td style="padding:9px 12px;border-bottom:1px solid #f0f0ee;text-align:right;">${amt(it.unit_price)}</td>
      <td style="padding:9px 12px;border-bottom:1px solid #f0f0ee;text-align:right;font-weight:500;">${amt(total)}</td>
    </tr>`;
  }).join("");

  const logoHtml = enterpriseLogo ? `<img src="${enterpriseLogo}" alt="Logo" style="max-height:56px;max-width:140px;object-fit:contain;border-radius:8px;"/>` : "";

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><title>Facture ${d(inv.invoice_number)}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;background:#fff;font-size:13px;line-height:1.5}.page{max-width:800px;margin:0 auto}.header{background:#132A24;color:#fff;padding:32px 40px;display:flex;justify-content:space-between;align-items:flex-start;gap:24px}.header-left{display:flex;flex-direction:column;gap:12px}.header-right{text-align:right;flex-shrink:0}.label{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#879f98;margin-bottom:4px}.inv-num{font-size:22px;font-weight:300;letter-spacing:-.02em}.dates{font-size:11px;color:#879f98;line-height:2}.body{padding:32px 40px}.parties{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px}.party{background:#f9f9f7;border-radius:8px;padding:16px}.party-label{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#879f98;margin-bottom:8px}.party-name{font-size:14px;font-weight:500;color:#132A24;margin-bottom:4px}.party-info{font-size:11px;color:#666;line-height:1.7}.section-title{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#879f98;border-bottom:1px solid #eee;padding-bottom:7px;margin:24px 0 14px}table{width:100%;border-collapse:collapse}th{background:#f5f5f3;padding:8px 12px;text-align:left;font-size:10px;letter-spacing:.05em;text-transform:uppercase;color:#879f98;font-weight:500}th:last-child,td:last-child{text-align:right}th:nth-child(2),td:nth-child(2){text-align:center}.totals{margin-top:20px;margin-left:auto;width:240px}.totals-row{display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#555}.totals-ttc{border-top:2px solid #132A24;padding-top:10px;margin-top:6px;font-size:15px;font-weight:600;color:#132A24}.conditions{background:#f9f9f7;border-radius:8px;padding:14px;margin-top:20px;font-size:12px;color:#555;line-height:1.7}.paid-stamp{border:3px solid #132A24;border-radius:8px;padding:14px 24px;margin-top:28px;text-align:center;opacity:0.85}.footer{text-align:center;padding:16px 40px;font-size:10px;color:#aaa;border-top:1px solid #eee;margin-top:24px}
@media print{*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}@page{size:A4;margin:0}body{margin:0}.page{max-width:100%}}</style></head>
<body><div class="page">
  <div class="header">
    <div class="header-left">${logoHtml}<div><div class="label">Facture</div><div class="inv-num">${d(inv.invoice_number)}</div></div></div>
    <div class="header-right"><div class="dates">Date : ${dt(inv.invoice_date)}<br/>${inv.due_date ? `Échéance : ${dt(inv.due_date)}` : ""}</div></div>
  </div>
  <div class="body">
    <div class="parties">
      <div class="party"><div class="party-label">Prestataire</div><div class="party-name">${d(inv.ent_name)}</div>
        <div class="party-info">${[inv.ent_legal_form, inv.ent_legal_status].filter(Boolean).join(" — ")}${[inv.ent_legal_form, inv.ent_legal_status].filter(Boolean).length ? "<br/>" : ""}
        ${d(inv.ent_address)}${inv.ent_address ? "<br/>" : ""}${[inv.ent_zip, inv.ent_city].filter(Boolean).join(" ")}${[inv.ent_zip, inv.ent_city].filter(Boolean).length ? "<br/>" : ""}
        ${inv.ent_siret ? `SIRET : ${inv.ent_siret}<br/>` : ""}${inv.ent_tva_number ? `TVA : ${inv.ent_tva_number}<br/>` : ""}
        ${[inv.ent_phone, inv.ent_email].filter(Boolean).join(" · ")}</div></div>
      <div class="party"><div class="party-label">Client</div><div class="party-name">${[inv.client_name, inv.client_company].filter(Boolean).join(" — ")}</div>
        <div class="party-info">${d(inv.client_address)}${inv.client_address ? "<br/>" : ""}${[inv.client_zip, inv.client_city].filter(Boolean).join(" ")}${[inv.client_zip, inv.client_city].filter(Boolean).length ? "<br/>" : ""}
        ${inv.client_phone ? `Tél : ${inv.client_phone}<br/>` : ""}${d(inv.client_email)}</div></div>
    </div>
    ${inv.items?.length > 0 ? `<div class="section-title">Détail des prestations</div>
    <table><thead><tr><th>Description</th><th>Qté</th><th>Prix HT</th><th>Total HT</th></tr></thead><tbody>${itemsRows}</tbody></table>` : ""}
    ${inv.labor_description ? `<div style="margin-top:10px;background:#f9f9f7;border-radius:6px;padding:10px 14px;font-size:12px;"><strong>Main d'œuvre : </strong>${d(inv.labor_description)}${inv.labor_price_type ? ` — ${inv.labor_price_type === "hourly" ? "Taux horaire" : "Forfait"} : ${amt(inv.labor_price)}` : ""}</div>` : ""}
    ${parseFloat(inv.travel_expenses) > 0 ? `<p style="margin-top:8px;font-size:12px;color:#555;">Frais de déplacement : ${amt(inv.travel_expenses)}</p>` : ""}
    <div class="totals">
      <div class="totals-row"><span>Total HT</span><span>${amt(inv.total_ht)}</span></div>
      <div class="totals-row"><span>TVA ${inv.tva_rate} %</span><span>${amt(inv.total_tva)}</span></div>
      <div class="totals-row totals-ttc"><span>Total TTC</span><span>${amt(inv.total_ttc)}</span></div>
    </div>
    ${inv.payment_conditions ? `<div class="conditions"><strong style="color:#132A24;">Paiement : </strong>${inv.payment_conditions}${inv.payment_method ? `<br/><strong style="color:#132A24;">Moyen : </strong>${inv.payment_method}` : ""}</div>` : ""}
    ${inv.notes ? `<div class="section-title">Notes</div><p style="font-size:12px;color:#555;line-height:1.7;">${inv.notes}</p>` : ""}
    ${inv.status === "paid" ? `<div class="paid-stamp"><p style="font-size:16px;font-weight:600;color:#132A24;letter-spacing:2px;">PAYÉE</p>${inv.paid_at ? `<p style="font-size:11px;color:#879f98;margin-top:4px;">Le ${dt(inv.paid_at)}</p>` : ""}</div>` : ""}
  </div>
  <div class="footer">Facture émise via <strong>Proxilio</strong> — proxilio.fr</div>
</div>
<script>window.onload=()=>{window.print()}</script>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) { alert("Veuillez autoriser les popups pour exporter le PDF."); return; }
  win.document.write(html);
  win.document.close();
}

/* ── Shared subcomponents ────────────────────────────────── */
const Section = ({ title, children }) => (
  <div className="border border-black/5 rounded-xl p-5 space-y-4">
    <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">{title}</p>
    {children}
  </div>
);
const Row   = ({ children }) => <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
const Field = ({ label, children }) => <div><label className={labelCls}>{label}</label>{children}</div>;

/* ── InvoiceForm ─────────────────────────────────────────── */
function InvoiceForm({ enterprise, initial, onSaved, onCancel }) {
  const slug = enterprise?.slug || enterprise?.id;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    invoice_date: today(),
    due_date: "",
    tva_rate: 20,
    ent_name: enterprise?.name || "", ent_address: enterprise?.adress || "",
    ent_city: enterprise?.city || "", ent_zip: enterprise?.zip_code || "",
    ent_phone: enterprise?.phone || "", ent_email: enterprise?.mail || "",
    ent_siret: enterprise?.siret_number || "",
    ent_tva_number: "", ent_legal_form: "", ent_legal_status: "", ent_rcs: "", ent_rm: "",
    client_name: "", client_company: "", client_address: "", client_city: "", client_zip: "", client_phone: "", client_email: "",
    labor_description: "", labor_price_type: "", labor_price: "",
    travel_expenses: "", payment_conditions: "Paiement à 30 jours.", payment_method: "",
    notes: "",
    ...initial,
  });
  const [items, setItems] = useState(initial?.items?.length ? initial.items : [{ ...EMPTY_ITEM }]);

  useEffect(() => {
    if (initial) { setForm((p) => ({ ...p, ...initial })); if (initial.items?.length) setItems(initial.items); }
  }, [initial]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setItem = (idx, k, v) => setItems((p) => p.map((it, i) => i === idx ? { ...it, [k]: v } : it));
  const { ht, tva, ttc } = computeTotals(items, form.labor_price, form.labor_price_type, form.travel_expenses, form.tva_rate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.client_name.trim()) { toast.error("Nom du client obligatoire."); return; }
    try {
      setSaving(true);
      const payload = { ...form, items, total_ht: ht, total_tva: tva, total_ttc: ttc };
      if (initial?.id) {
        await putData(`enterprise/${slug}/invoices/${initial.id}`, payload);
        toast.success("Facture mise à jour.");
      } else {
        await postData(`enterprise/${slug}/invoices`, payload);
        toast.success("Facture créée.");
      }
      onSaved();
    } catch (err) {
      try { toast.error(JSON.parse(err.message).error || "Erreur."); } catch { toast.error("Erreur."); }
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between">
        <button type="button" onClick={onCancel} className="inline-flex items-center gap-1.5 text-sm font-light text-[#879f98] hover:text-[#132A24] transition">
          <IoChevronBackOutline /> Annuler
        </button>
        <h2 className="text-base font-light text-[#132A24]">{initial?.id ? "Modifier la facture" : "Nouvelle facture"}</h2>
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#132A24] px-4 py-2 text-sm font-light text-white hover:bg-[#1b3b33] transition disabled:opacity-60">
          {saving ? "Sauvegarde…" : "Enregistrer"}
        </button>
      </div>

      <Section title="Informations de la facture">
        <Row>
          <Field label="Date de facturation"><input type="date" value={form.invoice_date} onChange={(e) => set("invoice_date", e.target.value)} className={`mt-1 ${inputCls}`} required /></Field>
          <Field label="Date d'échéance"><input type="date" value={form.due_date} onChange={(e) => set("due_date", e.target.value)} className={`mt-1 ${inputCls}`} /></Field>
        </Row>
        <Row>
          <Field label="Taux TVA (%)"><input type="number" value={form.tva_rate} onChange={(e) => set("tva_rate", e.target.value)} className={`mt-1 ${inputCls}`} min={0} step={0.1} /></Field>
        </Row>
      </Section>

      <Section title="Informations prestataire">
        <Row><Field label="Raison sociale *"><input className={`mt-1 ${inputCls}`} value={form.ent_name} onChange={(e) => set("ent_name", e.target.value)} /></Field>
          <Field label="Forme juridique"><input className={`mt-1 ${inputCls}`} value={form.ent_legal_form} onChange={(e) => set("ent_legal_form", e.target.value)} /></Field></Row>
        <Row><Field label="SIRET"><input className={`mt-1 ${inputCls}`} value={form.ent_siret} onChange={(e) => set("ent_siret", e.target.value)} /></Field>
          <Field label="N° TVA"><input className={`mt-1 ${inputCls}`} value={form.ent_tva_number} onChange={(e) => set("ent_tva_number", e.target.value)} /></Field></Row>
        <Row><Field label="Adresse"><input className={`mt-1 ${inputCls}`} value={form.ent_address} onChange={(e) => set("ent_address", e.target.value)} /></Field>
          <Field label="Code postal"><input className={`mt-1 ${inputCls}`} value={form.ent_zip} onChange={(e) => set("ent_zip", e.target.value)} /></Field></Row>
        <Row><Field label="Ville"><input className={`mt-1 ${inputCls}`} value={form.ent_city} onChange={(e) => set("ent_city", e.target.value)} /></Field>
          <Field label="Téléphone"><input className={`mt-1 ${inputCls}`} value={form.ent_phone} onChange={(e) => set("ent_phone", e.target.value)} /></Field></Row>
        <Field label="Email"><input type="email" className={`mt-1 ${inputCls}`} value={form.ent_email} onChange={(e) => set("ent_email", e.target.value)} /></Field>
      </Section>

      <Section title="Informations client">
        <Row><Field label="Nom / Prénom *"><input className={`mt-1 ${inputCls}`} value={form.client_name} onChange={(e) => set("client_name", e.target.value)} required /></Field>
          <Field label="Société"><input className={`mt-1 ${inputCls}`} value={form.client_company} onChange={(e) => set("client_company", e.target.value)} /></Field></Row>
        <Row><Field label="Adresse"><input className={`mt-1 ${inputCls}`} value={form.client_address} onChange={(e) => set("client_address", e.target.value)} /></Field>
          <Field label="Code postal"><input className={`mt-1 ${inputCls}`} value={form.client_zip} onChange={(e) => set("client_zip", e.target.value)} /></Field></Row>
        <Row><Field label="Ville"><input className={`mt-1 ${inputCls}`} value={form.client_city} onChange={(e) => set("client_city", e.target.value)} /></Field>
          <Field label="Téléphone"><input className={`mt-1 ${inputCls}`} value={form.client_phone} onChange={(e) => set("client_phone", e.target.value)} /></Field></Row>
        <Field label="Email"><input type="email" className={`mt-1 ${inputCls}`} value={form.client_email} onChange={(e) => set("client_email", e.target.value)} /></Field>
      </Section>

      <Section title="Prestations">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-[10px] uppercase tracking-widest text-[#879f98] font-light border-b border-black/5">
              <th className="pb-2 text-left">Description</th>
              <th className="pb-2 text-center w-20">Qté</th>
              <th className="pb-2 text-right w-28">Prix HT (€)</th>
              <th className="pb-2 text-right w-24">Total HT</th>
              <th className="pb-2 w-8"></th>
            </tr></thead>
            <tbody>{items.map((it, idx) => {
              const lineTotal = (parseFloat(it.quantity)||0)*(parseFloat(it.unit_price)||0);
              return (<tr key={idx} className="border-b border-black/5">
                <td className="py-2 pr-2"><input className={inputCls} value={it.description} onChange={(e) => setItem(idx, "description", e.target.value)} placeholder="Description" /></td>
                <td className="py-2 px-1"><input type="number" className={`${inputCls} text-center`} value={it.quantity} onChange={(e) => setItem(idx, "quantity", e.target.value)} min={0} step={0.01} /></td>
                <td className="py-2 px-1"><input type="number" className={`${inputCls} text-right`} value={it.unit_price} onChange={(e) => setItem(idx, "unit_price", e.target.value)} min={0} step={0.01} placeholder="0,00" /></td>
                <td className="py-2 pl-1 text-right font-light text-[#132A24] whitespace-nowrap">{lineTotal.toFixed(2).replace(".", ",")} €</td>
                <td className="py-2 pl-1"><button type="button" onClick={() => setItems((p) => p.filter((_, i) => i !== idx))} className="text-[#879f98] hover:text-red-500 transition"><IoTrashOutline /></button></td>
              </tr>);
            })}</tbody>
          </table>
        </div>
        <button type="button" onClick={() => setItems((p) => [...p, { ...EMPTY_ITEM }])} className="inline-flex items-center gap-1.5 text-sm font-light text-[#132A24] hover:text-[#4b8a74] transition">
          <IoAddOutline /> Ajouter une ligne
        </button>
        <Row>
          <Field label="Main d'œuvre — description"><textarea className={`mt-1 ${inputCls} min-h-[60px]`} value={form.labor_description} onChange={(e) => set("labor_description", e.target.value)} /></Field>
          <div className="space-y-3">
            <Field label="Type de tarification">
              <select className={`mt-1 ${inputCls}`} value={form.labor_price_type} onChange={(e) => set("labor_price_type", e.target.value)}>
                <option value="">Aucun</option>
                <option value="hourly">Taux horaire</option>
                <option value="fixed">Forfait</option>
              </select>
            </Field>
            {form.labor_price_type && <Field label={form.labor_price_type === "hourly" ? "Taux HT (€)" : "Forfait HT (€)"}><input type="number" className={`mt-1 ${inputCls}`} value={form.labor_price} onChange={(e) => set("labor_price", e.target.value)} min={0} step={0.01} /></Field>}
          </div>
        </Row>
        <Field label="Frais de déplacement HT (€)"><input type="number" className={`mt-1 ${inputCls} max-w-xs`} value={form.travel_expenses} onChange={(e) => set("travel_expenses", e.target.value)} min={0} step={0.01} /></Field>
        <div className="ml-auto max-w-xs space-y-1.5 border-t border-black/5 pt-4">
          {[["Total HT", `${ht.toFixed(2).replace(".", ",")} €`], [`TVA ${form.tva_rate} %`, `${tva.toFixed(2).replace(".", ",")} €`]].map(([l, v]) => (
            <div key={l} className="flex justify-between text-sm font-light text-[#879f98]"><span>{l}</span><span>{v}</span></div>
          ))}
          <div className="flex justify-between text-base font-light text-[#132A24] border-t border-[#132A24]/20 pt-2 mt-2"><span>Total TTC</span><span className="font-medium">{ttc.toFixed(2).replace(".", ",")} €</span></div>
        </div>
      </Section>

      <Section title="Conditions et paiement">
        <Row>
          <Field label="Conditions de paiement"><textarea className={`mt-1 ${inputCls} min-h-[60px]`} value={form.payment_conditions} onChange={(e) => set("payment_conditions", e.target.value)} /></Field>
          <Field label="Moyen de paiement"><input className={`mt-1 ${inputCls}`} value={form.payment_method} placeholder="Virement, chèque, espèces…" onChange={(e) => set("payment_method", e.target.value)} /></Field>
        </Row>
        <Field label="Notes"><textarea className={`mt-1 ${inputCls} min-h-[60px]`} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
      </Section>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-xl border border-black/10 px-5 py-2.5 text-sm font-light text-[#879f98] hover:bg-[#f5f7f6] transition">Annuler</button>
        <button type="submit" disabled={saving} className="rounded-xl bg-[#132A24] px-5 py-2.5 text-sm font-light text-white hover:bg-[#1b3b33] transition disabled:opacity-60">
          {saving ? "Sauvegarde…" : "Enregistrer la facture"}
        </button>
      </div>
    </form>
  );
}

/* ── InvoiceDetail ───────────────────────────────────────── */
function InvoiceDetail({ invoice, slug, enterpriseLogo, onBack, onDelete, onStatusChange }) {
  const [sendEmail, setSendEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);

  const handleSend = async () => {
    const email = sendEmail.trim() || invoice.client_email;
    if (!email) { toast.error("Renseignez l'e-mail du client."); return; }
    try {
      setSending(true);
      await postData(`enterprise/${slug}/invoices/${invoice.id}/send`, { email });
      toast.success("Facture envoyée.");
      onStatusChange(invoice.id, "sent");
    } catch (err) {
      try { toast.error(JSON.parse(err.message).error || "Erreur."); } catch { toast.error("Erreur d'envoi."); }
    } finally { setSending(false); }
  };

  const handleMarkPaid = async () => {
    try {
      setMarkingPaid(true);
      await putData(`enterprise/${slug}/invoices/${invoice.id}`, {
        status: "paid", paid_at: new Date().toISOString().split("T")[0],
      });
      toast.success("Facture marquée comme payée.");
      onStatusChange(invoice.id, "paid");
    } catch { toast.error("Erreur."); } finally { setMarkingPaid(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer cette facture ?")) return;
    try {
      await deleteData(`enterprise/${slug}/invoices/${invoice.id}`);
      toast.success("Facture supprimée.");
      onDelete(invoice.id);
    } catch { toast.error("Erreur."); }
  };

  const { label: statusLabel, cls: statusCls } = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.draft;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-light text-[#879f98] hover:text-[#132A24] transition">
          <IoChevronBackOutline /> Retour
        </button>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-light border ${statusCls}`}>{statusLabel}</span>
        <div className="ml-auto flex flex-wrap gap-2">
          <button onClick={() => generateInvoicePDF(invoice, enterpriseLogo)} className="inline-flex items-center gap-1.5 rounded-xl border border-[#132A24]/20 bg-[#eef5f1] px-3 py-2 text-xs font-light text-[#132A24] hover:bg-[#132A24] hover:text-white transition">
            <IoDownloadOutline /> Exporter PDF
          </button>
          {invoice.status !== "paid" && (
            <button onClick={handleMarkPaid} disabled={markingPaid} className="inline-flex items-center gap-1.5 rounded-xl border border-[#132A24]/20 bg-[#eef5f1] px-3 py-2 text-xs font-light text-[#132A24] hover:bg-[#132A24] hover:text-white transition disabled:opacity-60">
              <IoCheckmarkCircleOutline /> Marquer payée
            </button>
          )}
          <button onClick={handleDelete} className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-xs font-light text-red-500 hover:bg-red-50 transition">
            <IoTrashOutline /> Supprimer
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white border border-black/5 rounded-2xl shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="bg-[#132A24] text-white px-8 py-6">
          <div className="flex justify-between items-start gap-6">
            <div className="flex items-center gap-4">
              {enterpriseLogo && <img src={enterpriseLogo} alt="Logo" className="h-12 w-auto object-contain rounded-lg bg-white/10 p-1 shrink-0" />}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1">Facture</p>
                <p className="text-2xl font-light tracking-tight">{invoice.invoice_number}</p>
              </div>
            </div>
            <div className="text-right text-xs text-[#879f98] font-light space-y-1">
              <p>Date : {fmtDate(invoice.invoice_date)}</p>
              {invoice.due_date && <p>Échéance : {fmtDate(invoice.due_date)}</p>}
              {invoice.status === "paid" && invoice.paid_at && <p className="text-[#4b8a74]">Payée le {fmtDate(invoice.paid_at)}</p>}
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Prestataire", lines: [invoice.ent_name, invoice.ent_address, [invoice.ent_zip, invoice.ent_city].filter(Boolean).join(" "), invoice.ent_siret ? `SIRET : ${invoice.ent_siret}` : null, [invoice.ent_phone, invoice.ent_email].filter(Boolean).join(" · ")] },
              { label: "Client", lines: [[invoice.client_name, invoice.client_company].filter(Boolean).join(" — "), invoice.client_address, [invoice.client_zip, invoice.client_city].filter(Boolean).join(" "), invoice.client_phone ? `Tél : ${invoice.client_phone}` : null, invoice.client_email] },
            ].map(({ label, lines }) => (
              <div key={label} className="bg-[#f5f7f6] rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-2">{label}</p>
                {lines.filter(Boolean).map((l, i) => <p key={i} className={`text-sm font-light text-[#132A24] leading-relaxed ${i === 0 ? "font-medium" : ""}`}>{l}</p>)}
              </div>
            ))}
          </div>

          {invoice.items?.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light border-b border-black/5 pb-2 mb-3">Détail des prestations</p>
              <table className="w-full text-sm">
                <thead><tr className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">
                  <th className="pb-2 text-left">Description</th>
                  <th className="pb-2 text-center w-16">Qté</th>
                  <th className="pb-2 text-right w-28">Prix HT</th>
                  <th className="pb-2 text-right w-24">Total HT</th>
                </tr></thead>
                <tbody>{invoice.items.map((it, idx) => {
                  const t = (parseFloat(it.quantity)||0)*(parseFloat(it.unit_price)||0);
                  return <tr key={idx} className="border-b border-black/5 text-sm font-light">
                    <td className="py-2.5 pr-3 text-[#132A24]">{it.description}</td>
                    <td className="py-2.5 px-2 text-center text-[#879f98]">{it.quantity}</td>
                    <td className="py-2.5 px-2 text-right text-[#879f98]">{fmtAmt(it.unit_price)}</td>
                    <td className="py-2.5 pl-2 text-right text-[#132A24]">{fmtAmt(t)}</td>
                  </tr>;
                })}</tbody>
              </table>
            </div>
          )}

          <div className="ml-auto max-w-xs space-y-1.5 border-t border-black/5 pt-4">
            {[["Total HT", fmtAmt(invoice.total_ht)], [`TVA ${invoice.tva_rate} %`, fmtAmt(invoice.total_tva)]].map(([l, v]) => (
              <div key={l} className="flex justify-between text-sm font-light text-[#879f98]"><span>{l}</span><span>{v}</span></div>
            ))}
            <div className="flex justify-between text-base font-medium text-[#132A24] border-t-2 border-[#132A24] pt-2 mt-1"><span>Total TTC</span><span>{fmtAmt(invoice.total_ttc)}</span></div>
          </div>

          {(invoice.payment_conditions || invoice.payment_method) && (
            <div className="bg-[#f5f7f6] rounded-xl p-4 text-sm font-light text-[#555]">
              {invoice.payment_conditions && <p><strong className="text-[#132A24] font-medium">Paiement : </strong>{invoice.payment_conditions}</p>}
              {invoice.payment_method && <p><strong className="text-[#132A24] font-medium">Moyen : </strong>{invoice.payment_method}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Send email */}
      {invoice.status !== "paid" && (
        <div className="bg-white border border-black/5 rounded-2xl shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5">
          <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-3">Envoyer par e-mail</p>
          <div className="flex gap-3">
            <input type="email" value={sendEmail} onChange={(e) => setSendEmail(e.target.value)} placeholder={invoice.client_email || "Email du client"} className={`flex-1 ${inputCls}`} />
            <button onClick={handleSend} disabled={sending} className="inline-flex items-center gap-2 rounded-xl bg-[#132A24] px-4 py-2 text-sm font-light text-white hover:bg-[#1b3b33] transition disabled:opacity-60 shrink-0">
              <IoMailOutline /> {sending ? "Envoi…" : "Envoyer"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── FacturesPage ────────────────────────────────────────── */
export default function FacturesPage() {
  const { slug } = useParams();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [enterprise, setEnterprise] = useState(null);
  const [view, setView]   = useState("list");
  const [editInv, setEditInv]   = useState(null);
  const [detailInv, setDetailInv] = useState(null);

  const fetchEnterprise = useCallback(async () => {
    try { setEnterprise(await getData(`enterprise/${slug}`)); } catch { /**/ }
  }, [slug]);

  const fetchInvoices = useCallback(async () => {
    try { setLoading(true); setInvoices(await getData(`enterprise/${slug}/invoices`)); }
    catch { toast.error("Impossible de charger les factures."); }
    finally { setLoading(false); }
  }, [slug]);

  useEffect(() => { fetchEnterprise(); fetchInvoices(); }, [fetchEnterprise, fetchInvoices]);

  const openDetail = async (inv) => {
    try { setDetailInv(await getData(`enterprise/${slug}/invoices/${inv.id}`)); setView("detail"); }
    catch { toast.error("Impossible de charger la facture."); }
  };

  const onSaved = () => { setView("list"); fetchInvoices(); };
  const onBack  = () => { setView("list"); setDetailInv(null); };
  const onDelete = (id) => { setInvoices((p) => p.filter((i) => i.id !== id)); setView("list"); };
  const onStatusChange = (id, status) => {
    setInvoices((p) => p.map((i) => i.id === id ? { ...i, status } : i));
    setDetailInv((p) => p ? { ...p, status } : p);
  };

  if (!enterprise?.isPremium) {
    return <div className="mt-6 bg-white border border-black/5 rounded-2xl p-10 text-center shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]"><p className="text-sm text-[#879f98] font-light">La facturation est réservée aux entreprises Premium.</p></div>;
  }

  if (view === "form") return <div className="mt-6"><InvoiceForm enterprise={enterprise} initial={editInv} onSaved={onSaved} onCancel={() => setView("list")} /></div>;
  if (view === "detail" && detailInv) return <div className="mt-6"><InvoiceDetail invoice={detailInv} slug={slug} enterpriseLogo={enterprise?.logo} onBack={onBack} onDelete={onDelete} onStatusChange={onStatusChange} /></div>;

  return (
    <div className="mt-6 space-y-5">
      <header className="rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 lg:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">Entreprise</p>
            <h1 className="mt-1 text-xl font-light text-[#132A24] tracking-tight">Mes factures</h1>
            <p className="mt-1 text-sm text-[#879f98] font-light">Créez et gérez vos factures professionnelles.</p>
          </div>
          <button onClick={() => { setEditInv(null); setView("form"); }} className="inline-flex items-center gap-2 rounded-xl bg-[#132A24] px-4 py-2.5 text-sm font-light text-white hover:bg-[#1b3b33] transition shrink-0">
            <IoAddOutline /> Nouvelle facture
          </button>
        </div>
      </header>

      <div className="rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 lg:p-6">
        {loading ? <div className="py-12 text-center text-sm text-[#879f98] font-light">Chargement…</div>
        : invoices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-black/10 bg-[#f5f7f6] py-16 text-center">
            <p className="text-sm text-[#879f98] font-light mb-4">Aucune facture pour le moment.</p>
            <button onClick={() => { setEditInv(null); setView("form"); }} className="inline-flex items-center gap-2 rounded-xl bg-[#132A24] px-4 py-2.5 text-sm font-light text-white hover:bg-[#1b3b33] transition">
              <IoAddOutline /> Créer ma première facture
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => {
              const { label, cls } = STATUS_CONFIG[inv.status] || STATUS_CONFIG.draft;
              return (
                <div key={inv.id} className="rounded-xl border border-black/5 bg-[#f5f7f6] p-4 hover:bg-[#eef5f1] transition cursor-pointer flex flex-wrap items-center gap-4 justify-between" onClick={() => openDetail(inv)}>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">{inv.invoice_number}</p>
                    <p className="text-sm font-light text-[#132A24] mt-0.5">{inv.client_name}{inv.client_company ? ` — ${inv.client_company}` : ""}</p>
                    <p className="text-xs text-[#879f98] font-light mt-0.5">{fmtDate(inv.invoice_date)}{inv.due_date ? ` · Échéance : ${fmtDate(inv.due_date)}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-light text-[#132A24]">{fmtAmt(inv.total_ttc)}</span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-light border ${cls}`}>{label}</span>
                    <button onClick={(e) => { e.stopPropagation(); setEditInv(inv); setView("form"); }} className="text-[#879f98] hover:text-[#132A24] transition text-xs font-light border border-black/10 rounded-lg px-2.5 py-1">
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
