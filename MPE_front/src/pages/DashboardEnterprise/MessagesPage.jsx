import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getData, deleteData, putData } from "../../services/data-fetch";
import { toast } from "react-toastify";
import { IoTrashOutline, IoMailOpenOutline, IoLockClosedOutline, IoStarOutline } from "react-icons/io5";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export default function MessagesPage() {
  const { slug } = useParams();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getData(`enterprise/${slug}/messages`);
      setData(res);
    } catch {
      toast.error("Impossible de charger les messages.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const handleRead = async (msg) => {
    setSelected(msg);
    if (!msg.is_read) {
      try {
        await putData(`enterprise/${slug}/messages/${msg.id}/read`, {});
        setData((p) => ({
          ...p,
          messages: p.messages.map((m) => m.id === msg.id ? { ...m, is_read: true } : m),
          unread: Math.max(0, p.unread - 1),
        }));
      } catch { /* silencieux */ }
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Supprimer ce message ?")) return;
    try {
      await deleteData(`enterprise/${slug}/messages/${id}`);
      setData((p) => ({ ...p, messages: p.messages.filter((m) => m.id !== id), total: p.total - 1 }));
      if (selected?.id === id) setSelected(null);
      toast.success("Message supprimé.");
    } catch { toast.error("Erreur."); }
  };

  if (loading) return (
    <div className="mt-6 py-20 text-center text-sm text-[#879f98] font-light">Chargement…</div>
  );

  const messages = data?.messages || [];
  const isLimited = data?.limited;
  const hiddenCount = isLimited ? (data.total - data.freeLimit) : 0;

  return (
    <div className="mt-6 space-y-5">
      {/* Header */}
      <header className="rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 lg:p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">Entreprise</p>
            <h1 className="mt-1 text-xl font-light text-[#132A24] tracking-tight flex items-center gap-2">
              Messagerie
              {data?.unread > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-[#132A24] text-white text-[10px] font-medium">
                  {data.unread}
                </span>
              )}
            </h1>
            <p className="mt-1 text-sm text-[#879f98] font-light">
              {data?.total ?? 0} message{(data?.total ?? 0) > 1 ? "s" : ""} reçu{(data?.total ?? 0) > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </header>

      {messages.length === 0 && !isLimited ? (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white p-16 text-center shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-sm text-[#879f98] font-light">Aucun message pour le moment.</p>
          <p className="text-xs text-[#879f98] font-light mt-1">Les visiteurs de votre fiche peuvent vous envoyer des messages directement.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Liste */}
          <div className="lg:col-span-2 space-y-2">
            {messages.map((msg) => (
              <div key={msg.id}
                onClick={() => handleRead(msg)}
                className={`group rounded-xl border p-4 cursor-pointer transition flex items-start gap-3 ${
                  selected?.id === msg.id ? "border-[#132A24] bg-[#eef5f1]" : msg.is_read ? "border-black/5 bg-white hover:bg-[#f5f7f6]" : "border-[#132A24]/20 bg-[#f5f7f6]"
                }`}
              >
                <div className={`mt-0.5 shrink-0 w-2 h-2 rounded-full ${msg.is_read ? "bg-transparent" : "bg-[#132A24]"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm truncate ${msg.is_read ? "font-light text-[#879f98]" : "font-medium text-[#132A24]"}`}>{msg.sender_name}</p>
                    <button onClick={(e) => handleDelete(msg.id, e)} className="opacity-0 group-hover:opacity-100 transition text-red-400 hover:text-red-600 shrink-0">
                      <IoTrashOutline className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-[#879f98] font-light truncate mt-0.5">{msg.content}</p>
                  <p className="text-[10px] text-[#879f98]/70 font-light mt-1">{fmtDate(msg.createdAt)}</p>
                </div>
              </div>
            ))}

            {/* Bloc verrouillé Premium */}
            {isLimited && (
              <div className="rounded-xl border border-dashed border-[#132A24]/20 bg-[#f5f7f6] p-5 text-center space-y-2">
                <IoLockClosedOutline className="w-6 h-6 text-[#879f98] mx-auto" />
                <p className="text-sm font-light text-[#132A24]">
                  {hiddenCount} message{hiddenCount > 1 ? "s" : ""} masqué{hiddenCount > 1 ? "s" : ""}
                </p>
                <p className="text-xs text-[#879f98] font-light">Passez Premium pour accéder à l'historique complet et recevoir des notifications par email.</p>
                <a href="/pricing" className="inline-flex items-center gap-1.5 rounded-xl bg-[#132A24] px-4 py-2 text-xs font-light text-white hover:bg-[#1b3b33] transition mt-1">
                  <IoStarOutline className="w-3.5 h-3.5" /> Passer Premium
                </a>
              </div>
            )}
          </div>

          {/* Détail */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="bg-white border border-black/5 rounded-2xl shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-6 space-y-4 sticky top-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-light text-[#132A24]">{selected.sender_name}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <a href={`mailto:${selected.sender_email}`} className="text-xs text-[#879f98] hover:text-[#132A24] transition underline underline-offset-2">
                        {selected.sender_email}
                      </a>
                      {selected.sender_phone && (
                        <a href={`tel:${selected.sender_phone}`} className="text-xs text-[#879f98] hover:text-[#132A24] transition">
                          {selected.sender_phone}
                        </a>
                      )}
                    </div>
                    <p className="text-[10px] text-[#879f98]/70 font-light mt-1">{fmtDate(selected.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <IoMailOpenOutline className="w-4 h-4 text-[#879f98]" />
                    <button onClick={(e) => handleDelete(selected.id, e)} className="text-red-400 hover:text-red-600 transition">
                      <IoTrashOutline className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="border-t border-black/5 pt-4">
                  <p className="text-sm font-light text-[#132A24] leading-relaxed whitespace-pre-wrap">{selected.content}</p>
                </div>
                <div className="border-t border-black/5 pt-4 flex gap-3">
                  <a href={`mailto:${selected.sender_email}?subject=Re: votre message`}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#132A24] px-4 py-2.5 text-sm font-light text-white hover:bg-[#1b3b33] transition">
                    ↩ Répondre par email
                  </a>
                  {selected.sender_phone && (
                    <a href={`tel:${selected.sender_phone}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-4 py-2.5 text-sm font-light text-[#132A24] hover:bg-[#f5f7f6] transition">
                      📞 Appeler
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-dashed border-black/10 rounded-2xl p-12 text-center">
                <p className="text-sm text-[#879f98] font-light">Sélectionnez un message pour le lire</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
