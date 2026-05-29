import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { getData, deleteData, putData, postData } from "../../services/data-fetch";
import { toast } from "react-toastify";
import { IoTrashOutline, IoMailOpenOutline, IoLockClosedOutline, IoStarOutline, IoPaperPlaneOutline } from "react-icons/io5";
import { useAtom } from "jotai";
import { enterpriseUnreadAtom } from "../../store/messaging";

const inputCls = "w-full rounded-xl bg-[#f5f7f6] border border-black/5 px-3 py-2 text-sm font-light text-[#132A24] placeholder:text-[#879f98] outline-none focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 transition";
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export default function MessagesPage() {
  const { slug } = useParams();
  const [data, setData]                 = useState(null);
  const [loading, setLoading]           = useState(true);
  const [selected, setSelected]         = useState(null);
  const [replyText, setReplyText]       = useState("");
  const [replying, setReplying]         = useState(false);
  const [search, setSearch]             = useState("");
  const [, setEnterpriseUnread]         = useAtom(enterpriseUnreadAtom);
  const threadRef                       = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getData(`enterprise/${slug}/messages`);
      setData(result);
      setEnterpriseUnread((p) => ({ ...p, [slug]: result?.unread || 0 }));
    } catch { toast.error("Impossible de charger les messages."); }
    finally { setLoading(false); }
  }, [slug, setEnterpriseUnread]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  /* Scroll en bas du thread à chaque changement de conversation */
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [selected?.id, selected?.replies?.length]);

  const handleSelect = async (msg) => {
    setSelected(msg);
    setReplyText("");
    if (!msg.is_read) {
      try {
        await putData(`enterprise/${slug}/messages/${msg.id}/read`, {});
        setData((p) => {
          const newUnread = Math.max(0, p.unread - 1);
          /* Mise à jour atom sidebar en temps réel */
          setEnterpriseUnread((prev) => ({ ...prev, [slug]: newUnread }));
          return {
            ...p,
            messages: p.messages.map((m) => m.id === msg.id ? { ...m, is_read: true } : m),
            unread: newUnread,
          };
        });
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

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      setReplying(true);
      const reply = await postData(`enterprise/${slug}/messages/${selected.id}/reply`, { content: replyText.trim() });
      const updatedMsg = { ...selected, replies: [...(selected.replies || []), reply] };
      setSelected(updatedMsg);
      setData((p) => ({
        ...p,
        messages: p.messages.map((m) => m.id === selected.id ? updatedMsg : m),
      }));
      setReplyText("");
      if (selected.User_id) {
        toast.success("Réponse envoyée — l'utilisateur sera notifié par email.");
      } else {
        toast.success("Réponse envoyée par email à l'expéditeur.");
      }
    } catch { toast.error("Erreur lors de l'envoi."); }
    finally { setReplying(false); }
  };

  if (loading) return <div className="mt-6 py-20 text-center text-sm text-[#879f98] font-light">Chargement…</div>;

  const allMessages = data?.messages || [];
  const messages = search.trim()
    ? allMessages.filter((m) =>
        m.sender_name.toLowerCase().includes(search.toLowerCase()) ||
        m.sender_email.toLowerCase().includes(search.toLowerCase()) ||
        m.content.toLowerCase().includes(search.toLowerCase()))
    : allMessages;
  const isLimited = data?.limited;
  const hiddenCount = isLimited ? (data.total - data.freeLimit) : 0;

  return (
    <div className="mt-6 space-y-5">
      <header className="rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 lg:p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">Entreprise</p>
            <h1 className="mt-1 text-xl font-light text-[#132A24] tracking-tight flex items-center gap-2">
              Messagerie
              {data?.unread > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-[#132A24] text-white text-[10px] font-medium">{data.unread}</span>
              )}
            </h1>
            <p className="mt-1 text-sm text-[#879f98] font-light">{data?.total ?? 0} message{(data?.total ?? 0) > 1 ? "s" : ""} reçu{(data?.total ?? 0) > 1 ? "s" : ""}</p>
          </div>
          <input
            type="search"
            placeholder="Rechercher un message…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-3 sm:mt-0 sm:w-60 rounded-xl bg-[#f5f7f6] border border-black/5 px-3 py-2 text-sm font-light text-[#132A24] placeholder:text-[#879f98] outline-none focus:border-[#132A24]/30 transition"
          />
        </div>
      </header>

      {messages.length === 0 && !isLimited ? (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white p-16 text-center">
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
                onClick={() => handleSelect(msg)}
                className={`group rounded-xl border p-4 cursor-pointer transition flex items-start gap-3 ${
                  selected?.id === msg.id ? "border-[#132A24] bg-[#eef5f1]" : msg.is_read ? "border-black/5 bg-white hover:bg-[#f5f7f6]" : "border-[#132A24]/20 bg-[#f5f7f6]"
                }`}
              >
                <div className={`mt-1.5 shrink-0 w-2 h-2 rounded-full ${msg.is_read ? "bg-transparent" : "bg-[#132A24]"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p className={`text-sm truncate ${msg.is_read ? "font-light text-[#879f98]" : "font-medium text-[#132A24]"}`}>{msg.sender_name}</p>
                      {msg.User_id ? (
                        <span className="shrink-0 text-[9px] bg-[#eef5f1] text-[#132A24] border border-[#132A24]/10 px-1.5 py-0.5 rounded-full font-light">Proxilio</span>
                      ) : (
                        <span className="shrink-0 text-[9px] bg-[#f5f7f6] text-[#879f98] border border-black/5 px-1.5 py-0.5 rounded-full font-light">Visiteur</span>
                      )}
                    </div>
                    <button onClick={(e) => handleDelete(msg.id, e)} className="opacity-0 group-hover:opacity-100 transition text-red-400 hover:text-red-600 shrink-0">
                      <IoTrashOutline className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-[#879f98] font-light truncate mt-0.5">{msg.content}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] text-[#879f98]/70 font-light">{fmtDate(msg.createdAt)}</p>
                    {msg.replies?.length > 0 && <span className="text-[10px] text-[#4b8a74] font-light">{msg.replies.length} réponse{msg.replies.length > 1 ? "s" : ""}</span>}
                  </div>
                </div>
              </div>
            ))}

            {isLimited && (
              <div className="rounded-xl border border-dashed border-[#132A24]/20 bg-[#f5f7f6] p-5 text-center space-y-2">
                <IoLockClosedOutline className="w-6 h-6 text-[#879f98] mx-auto" />
                <p className="text-sm font-light text-[#132A24]">{hiddenCount} message{hiddenCount > 1 ? "s" : ""} masqué{hiddenCount > 1 ? "s" : ""}</p>
                <p className="text-xs text-[#879f98] font-light">Passez Premium pour l'historique complet et les notifications email.</p>
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
                {/* En-tête */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-black/5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-base font-light text-[#132A24]">{selected.sender_name}</p>
                      {selected.User_id ? (
                        <span className="text-[10px] bg-[#eef5f1] text-[#132A24] border border-[#132A24]/10 px-2 py-0.5 rounded-full font-light">Utilisateur Proxilio</span>
                      ) : (
                        <span className="text-[10px] bg-[#f5f7f6] text-[#879f98] border border-black/5 px-2 py-0.5 rounded-full font-light">Visiteur sans compte</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      {!selected.User_id && (
                        <a href={`mailto:${selected.sender_email}`} className="text-xs text-[#879f98] hover:text-[#132A24] transition underline underline-offset-2">{selected.sender_email}</a>
                      )}
                      {selected.sender_phone && (
                        <a href={`tel:${selected.sender_phone}`} className="text-xs text-[#879f98] hover:text-[#132A24] transition">{selected.sender_phone}</a>
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

                {/* Message initial */}
                <div className="bg-[#f5f7f6] rounded-xl p-4">
                  <p className="text-sm font-light text-[#132A24] leading-relaxed whitespace-pre-wrap">{selected.content}</p>
                </div>

                {/* Fil de réponses — scroll après 4, toujours ancré en bas */}
                {selected.replies?.length > 0 && (
                  <div ref={threadRef} className="space-y-3 max-h-[360px] overflow-y-auto overscroll-contain pr-1">
                    {selected.replies.map((reply, i) => (
                      <div key={i} className={`rounded-xl p-4 ${reply.sender_type === "enterprise" ? "bg-[#eef5f1] ml-4" : "bg-[#f5f7f6] mr-4"}`}>
                        <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1.5">
                          {reply.sender_type === "enterprise" ? "Votre réponse" : selected.sender_name}
                        </p>
                        <p className="text-sm font-light text-[#132A24] leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                        <p className="text-[10px] text-[#879f98]/60 font-light mt-1">{fmtDate(reply.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Zone de réponse */}
                <div className="border-t border-black/5 pt-4 space-y-3">
                  {selected.User_id ? (
                    <p className="text-xs text-[#4b8a74] font-light flex items-center gap-1.5">
                      <span>✓</span> Utilisateur Proxilio — la réponse sera visible dans sa messagerie + notification email
                    </p>
                  ) : (
                    <p className="text-xs text-[#879f98] font-light flex items-center gap-1.5">
                      <span>✉</span> Visiteur sans compte — la réponse sera envoyée par email à <strong className="font-medium text-[#132A24]">{selected.sender_email}</strong>
                    </p>
                  )}
                  <textarea
                    rows={3}
                    placeholder="Votre réponse… (Entrée pour envoyer, Maj+Entrée pour sauter une ligne)"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                    className={`${inputCls} resize-none`}
                  />
                  <button onClick={handleReply} disabled={replying || !replyText.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#132A24] px-4 py-2.5 text-sm font-light text-white hover:bg-[#1b3b33] transition disabled:opacity-50">
                    <IoPaperPlaneOutline className="w-4 h-4" />
                    {replying ? "Envoi…" : selected.User_id ? "Répondre sur Proxilio" : "Répondre par email"}
                  </button>
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
