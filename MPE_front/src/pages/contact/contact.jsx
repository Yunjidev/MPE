import { useState } from "react";
import { Link } from "react-router-dom";
import { BsInstagram, BsFacebook, BsTwitterX, BsLinkedin } from "react-icons/bs";

const CONTACT_ITEMS = [
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    label: "Email",
    value: "contact@proxilio.fr",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: "Disponibilité",
    value: "Lun – Ven, 9h – 18h (hors jours fériés)",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    label: "Réponse garantie",
    value: "Sous 24h ouvrées",
  },
];

export default function Contact() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("https://formspree.io/f/xvgplvar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, subject, message }),
    });
    setLoading(false);
    if (res.ok) setSubmitted(true);
    else alert("Une erreur est survenue, veuillez réessayer.");
  };

  return (
    <div className="px-4 sm:px-8 lg:px-16 2xl:px-24 py-16 sm:py-24 w-full">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

        {/* ── Left ── */}
        <div className="flex flex-col gap-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#879f98] font-light mb-5 flex items-center gap-2">
              <span className="w-6 h-px bg-[#879f98]" /> CONTACT
            </p>
            <h1 className="font-light text-[40px] sm:text-[52px] leading-tight tracking-tight text-[#132A24] mb-6">
              Une question ?<br />
              <span className="text-[#274F44]">On vous répond.</span>
            </h1>
            <p className="text-base sm:text-xl text-[#4b615a] font-light leading-relaxed tracking-tight max-w-md">
              Notre équipe est disponible pour répondre à toutes vos questions.
              Consultez aussi notre{" "}
              <Link to="/FAQ" className="text-[#132A24] underline decoration-1 underline-offset-4 decoration-[#132A24]/30 hover:decoration-[#132A24] transition-colors">
                FAQ
              </Link>{" "}
              pour une réponse immédiate.
            </p>
          </div>

          {/* Contact info */}
          <div className="flex flex-col gap-4">
            {CONTACT_ITEMS.map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-[#eef5f1] border border-[#132A24]/10 flex items-center justify-center text-[#132A24] shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-0.5">{item.label}</p>
                  <p className="text-sm text-[#132A24] font-light tracking-tight">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Social */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-4">Nous suivre</p>
            <div className="flex items-center gap-4">
              {[
                { href: "https://www.instagram.com", icon: <BsInstagram size={17} />, label: "Instagram" },
                { href: "https://www.facebook.com", icon: <BsFacebook size={17} />, label: "Facebook" },
                { href: "https://twitter.com", icon: <BsTwitterX size={17} />, label: "X" },
                { href: "https://www.linkedin.com", icon: <BsLinkedin size={17} />, label: "LinkedIn" },
              ].map(({ href, icon, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-[#eef5f1] border border-[#132A24]/10 flex items-center justify-center text-[#132A24] hover:bg-[#132A24] hover:text-white hover:border-transparent transition-all duration-200"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right — Form ── */}
        <div className="bg-white border border-black/5 rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)]">
          {submitted ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-[#eef5f1] flex items-center justify-center">
                <svg className="w-7 h-7 text-[#132A24]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h2 className="text-xl font-light text-[#132A24] tracking-tight">Message envoyé !</h2>
              <p className="text-sm text-[#4b615a] font-light tracking-tight">
                Merci pour votre message. Nous vous répondrons sous 24h ouvrées.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-2">
                  Votre email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.fr"
                  required
                  className="w-full bg-[#f5f7f6] border border-black/5 text-[#132A24] placeholder:text-[#879f98] rounded-2xl px-4 py-3 text-sm font-light tracking-tight focus:outline-none focus:ring-1 focus:ring-[#132A24]/20"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-2">
                  Objet
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Objet de votre message"
                  required
                  className="w-full bg-[#f5f7f6] border border-black/5 text-[#132A24] placeholder:text-[#879f98] rounded-2xl px-4 py-3 text-sm font-light tracking-tight focus:outline-none focus:ring-1 focus:ring-[#132A24]/20"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Décrivez votre demande…"
                  required
                  rows={5}
                  className="w-full bg-[#f5f7f6] border border-black/5 text-[#132A24] placeholder:text-[#879f98] rounded-2xl px-4 py-3 text-sm font-light tracking-tight focus:outline-none focus:ring-1 focus:ring-[#132A24]/20 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="group w-full py-4 rounded-full bg-[#132A24] hover:bg-[#1b3b33] text-white font-light text-sm tracking-tight transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Envoi en cours…
                  </>
                ) : (
                  <>
                    Envoyer le message
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
