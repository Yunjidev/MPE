import { useState, useEffect, useCallback, useRef } from "react";
import { getData, postData, deleteData } from "../../services/data-fetch";
import { toast } from "react-toastify";
import { IoPaperPlaneOutline, IoTrashOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { useAtom } from "jotai";
import { userUnreadAtom } from "../../store/messaging";

const inputCls = "w-full rounded-xl bg-[#f5f7f6] border border-black/5 px-3 py-2 text-sm font-light text-[#132A24] placeholder:text-[#879f98] outline-none focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 transition";
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export default function UserMessagesPage() {
  const [messages, setMessages]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(null);
  const [replyText, setReplyText]   = useState("");
  const [replying, setReplying]     = useState(false);
  const [search, setSearch]         = useState("");
  const [, setUserUnread]           = useAtom(userUnreadAtom);
  const threadRef                   = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setMessages(await getData("user/messages"));
    } catch { toast.error("Impossible de charger les messages."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  /* Scroll en bas à chaque ouverture/nouveau message */
  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [selected?.id, selected?.replies?.length]);

  const handleSelect = (msg) => {
    setSelected(msg);
    setReplyText("");
    /* Si la dernière réponse est de l'entreprise, c'est "lu" maintenant */
    const lastReply = msg.replies?.slice().sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt))[0];
    if (lastReply?.sender_type === "enterprise") {
      setUserUnread((prev) => Math.max(0, prev - 1));
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm("Supprimer cette conversation ?")) return;
    try {
      await deleteData(`enterprise/${selected?.enterprise?.slug || "x"}/messages/${id}`);
      setMessages((p) => p.filter((m) => m.id !== id));
      if (selected?.id === id) setSelected(null);
      toast.success("Conversation supprimée.");
    } catch { toast.error("Erreur lors de la suppression."); }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      setReplying(true);
      const reply = await postData(`user/messages/${selected.id}/reply`, { content: replyText.trim() });
      const updated = { ...selected, replies: [...(selected.replies || []), reply] };
      setSelected(updated);
      setMessages((p) => p.map((m) => m.id === selected.id ? updated : m));
      setReplyText("");
      toast.success("Réponse envoyée.");
    } catch { toast.error("Erreur lors de l'envoi."); }
    finally { setReplying(false); }
  };

  if (loading) return <div className="mt-6 py-20 text-center text-sm text-[#879f98] font-light">Chargement…</div>;

  const filtered = search.trim()
    ? messages.filter((m) =>
        m.enterprise?.name?.toLowerCase().includes(search.toLowerCase()) ||
        m.content.toLowerCase().includes(search.toLowerCase()))
    : messages;

  return (
    <div className="mt-6 space-y-5">
      <header className="rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 lg:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">Mon espace</p>
            <h1 className="mt-1 text-xl font-light text-[#132A24] tracking-tight">Mes messages</h1>
            <p className="mt-1 text-sm text-[#879f98] font-light">{messages.length} conversation{messages.length > 1 ? "s" : ""}</p>
          </div>
          <input
            type="search"
            placeholder="Rechercher une conversation…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:w-60 rounded-xl bg-[#f5f7f6] border border-black/5 px-3 py-2 text-sm font-light text-[#132A24] placeholder:text-[#879f98] outline-none focus:border-[#132A24]/30 transition"
          />
        </div>
      </header>

      {messages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white p-16 text-center">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-sm text-[#879f98] font-light">Vous n'avez pas encore envoyé de message.</p>
          <p className="text-xs text-[#879f98] font-light mt-1">Trouvez un professionnel et contactez-le directement depuis sa fiche.</p>
          <Link to="/searchentreprise" className="inline-block mt-4 rounded-xl bg-[#132A24] px-5 py-2.5 text-sm font-light text-white hover:bg-[#1b3b33] transition">
            Trouver un professionnel
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Liste des conversations */}
          <div className="lg:col-span-2 space-y-2">
            {filtered.length === 0 && (
              <p className="text-sm text-center text-[#879f98] font-light py-8">Aucun résultat pour "{search}"</p>
            )}
            {filtered.map((msg) => {
              const lastReply = msg.replies?.slice().sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt))[0];
              const hasUnread = lastReply?.sender_type === "enterprise";
              return (
                <div key={msg.id}
                  onClick={() => handleSelect(msg)}
                  className={`group rounded-xl border p-4 cursor-pointer transition flex items-start gap-3 ${
                    selected?.id === msg.id ? "border-[#132A24] bg-[#eef5f1]" : hasUnread ? "border-[#132A24]/20 bg-[#f5f7f6]" : "border-black/5 bg-white hover:bg-[#f5f7f6]"
                  }`}
                >
                  {msg.enterprise?.logo ? (
                    <img src={msg.enterprise.logo} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[#132A24]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs text-[#132A24] font-medium">{msg.enterprise?.name?.[0]}</span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm truncate ${hasUnread ? "font-medium text-[#132A24]" : "font-light text-[#879f98]"}`}>
                        {msg.enterprise?.name || "Entreprise"}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {hasUnread && <span className="w-2 h-2 rounded-full bg-[#132A24]" />}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(msg.id, e); }}
                          className="opacity-0 group-hover:opacity-100 transition text-red-400 hover:text-red-600"
                        >
                          <IoTrashOutline className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-[#879f98] font-light truncate mt-0.5">
                      {lastReply ? lastReply.content : msg.content}
                    </p>
                    <p className="text-[10px] text-[#879f98]/60 font-light mt-0.5">{fmtDate(lastReply?.createdAt || msg.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Détail */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="bg-white border border-black/5 rounded-2xl shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-6 space-y-4 sticky top-4">
                {/* En-tête entreprise */}
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-black/5">
                  <div className="flex items-center gap-3">
                    {selected.enterprise?.logo ? (
                      <img src={selected.enterprise.logo} alt="" className="w-10 h-10 rounded-xl object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[#132A24]/10 flex items-center justify-center">
                        <span className="text-sm text-[#132A24] font-medium">{selected.enterprise?.name?.[0]}</span>
                      </div>
                    )}
                    <div>
                      <Link to={`/enterprise/${selected.enterprise?.slug}`} className="text-base font-light text-[#132A24] hover:underline">
                        {selected.enterprise?.name}
                      </Link>
                      <p className="text-xs text-[#879f98] font-light">{fmtDate(selected.createdAt)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(selected.id)}
                    className="text-red-400 hover:text-red-600 transition p-1.5 rounded-lg hover:bg-red-50"
                    title="Supprimer la conversation"
                  >
                    <IoTrashOutline className="w-4 h-4" />
                  </button>
                </div>

                {/* Thread — scroll ancré en bas, limité à 4 messages visibles */}
                <div ref={threadRef} className="space-y-3 max-h-[360px] overflow-y-auto overscroll-contain pr-1">
                  {/* Message initial */}
                  <div className="bg-[#f5f7f6] rounded-xl p-4 mr-4">
                    <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1.5">Votre message</p>
                    <p className="text-sm font-light text-[#132A24] leading-relaxed whitespace-pre-wrap">{selected.content}</p>
                    <p className="text-[10px] text-[#879f98]/60 font-light mt-1">{fmtDate(selected.createdAt)}</p>
                  </div>

                  {/* Réponses */}
                  {selected.replies?.map((reply, i) => (
                    <div key={i} className={`rounded-xl p-4 ${reply.sender_type === "enterprise" ? "bg-[#eef5f1] mr-4" : "bg-[#f5f7f6] ml-4"}`}>
                      <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1.5">
                        {reply.sender_type === "enterprise" ? selected.enterprise?.name : "Vous"}
                      </p>
                      <p className="text-sm font-light text-[#132A24] leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                      <p className="text-[10px] text-[#879f98]/60 font-light mt-1">{fmtDate(reply.createdAt)}</p>
                    </div>
                  ))}
                </div>

                {/* Répondre */}
                <div className="border-t border-black/5 pt-4 space-y-3">
                  <textarea rows={3} placeholder="Votre réponse… (Entrée pour envoyer, Maj+Entrée pour sauter une ligne)" value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                    className={`${inputCls} resize-none`} />
                  <button onClick={handleReply} disabled={replying || !replyText.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#132A24] px-4 py-2.5 text-sm font-light text-white hover:bg-[#1b3b33] transition disabled:opacity-50">
                    <IoPaperPlaneOutline className="w-4 h-4" />
                    {replying ? "Envoi…" : "Répondre"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-dashed border-black/10 rounded-2xl p-12 text-center">
                <p className="text-sm text-[#879f98] font-light">Sélectionnez une conversation</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
