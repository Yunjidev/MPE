import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  FiShare2, FiCheck, FiMapPin, FiPhone, FiMail, FiGlobe, FiCalendar,
} from "react-icons/fi";
import { FaStar, FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import ReactMarkdown from "react-markdown";
import { getData, postData } from "../../services/data-fetch";
import { toast } from "react-toastify";
import { useAtom } from "jotai";
import { userAtom } from "../../store/user";
import OfferList from "../../components/ShowEnterprise/OfferList";
import CommentList from "../../components/ShowEnterprise/CommentList";
import PremiumReservationModal from "../../components/ShowEnterprise/PremiumReservationModal";

const EnterpriseShow = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [enterprise, setEnterprise] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [prefillOfferId, setPrefillOfferId] = useState(null);
  const [shareStatus, setShareStatus] = useState(null);
  const [shareMessage, setShareMessage] = useState("");
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [authPrompt, setAuthPrompt] = useState(false);
  const [msgSending, setMsgSending] = useState(false);
  const [msgSent, setMsgSent] = useState(false);
  const [currentUser] = useAtom(userAtom);
  const [msgForm, setMsgForm] = useState({ sender_name: "", sender_email: "", sender_phone: "", content: "" });

  const fetchEnterprise = useCallback(async () => {
    try {
      const data = await getData(`enterprise/${slug}`);
      setEnterprise(data);
    } catch (error) {
      console.error("Error fetching enterprise:", error);
    }
  }, [slug]);

  useEffect(() => { fetchEnterprise(); }, [fetchEnterprise]);

  useEffect(() => {
    if (enterprise?.slug && /^\d+$/.test(slug)) {
      navigate(`/enterprise/${enterprise.slug}`, { replace: true });
    }
  }, [enterprise, slug, navigate]);

  const handleBookingSuccess = useCallback(() => { fetchEnterprise(); }, [fetchEnterprise]);

  const openPopup = (photo) => { setSelectedPhoto(photo); setIsPopupOpen(true); };
  const closePopup = () => { setIsPopupOpen(false); setSelectedPhoto(null); };

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined"
      ? window.location.href
      : `${import.meta.env.VITE_BASE_URL || ""}/enterprise/${slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: enterprise?.name || "Entreprise", url: shareUrl });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const el = document.createElement("textarea");
        el.value = shareUrl;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setShareStatus("success");
      setShareMessage("Lien copié !");
    } catch {
      setShareStatus("error");
      setShareMessage("Impossible de partager le lien");
    } finally {
      setTimeout(() => { setShareStatus(null); setShareMessage(""); }, 3000);
    }
  };

  const handleOpenBooking = (offerId = null) => { setPrefillOfferId(offerId); setIsBookingOpen(true); };

  const handleOpenMsg = () => {
    if (!currentUser?.isLogged) { setAuthPrompt(true); return; }
    setMsgSent(false);
    setMsgForm({ sender_name: currentUser.username || "", sender_email: currentUser.email || "", sender_phone: "", content: "" });
    setMsgOpen(true);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgForm.sender_name.trim() || !msgForm.sender_email.trim() || !msgForm.content.trim()) {
      toast.error("Nom, email et message sont requis.");
      return;
    }
    try {
      setMsgSending(true);
      await postData(`enterprise/${enterprise.slug || enterprise.id}/messages`, msgForm);
      setMsgSent(true);
      toast.success("Message envoyé !");
    } catch {
      toast.error("Erreur lors de l'envoi. Réessayez.");
    } finally {
      setMsgSending(false);
    }
  };

  const averageRating = useMemo(() => {
    const value = Number(enterprise?.averageRating);
    return Number.isFinite(value) ? value : 0;
  }, [enterprise?.averageRating]);

  const totalReviews = useMemo(() => {
    if (!enterprise?.offers) return 0;
    return enterprise.offers.reduce((acc, offer) => acc + (offer?.ratings?.length || 0), 0);
  }, [enterprise?.offers]);

  if (!enterprise) {
    return (
      <div className="flex h-64 items-center justify-center text-[#879f98] text-sm font-light">
        Chargement de l&apos;entreprise…
      </div>
    );
  }

  const formattedAddress = [enterprise.adress, enterprise.city, enterprise.zip_code]
    .filter(Boolean).join(", ");

  const coverPhoto = enterprise.photos?.[0];
  const galleryPhotos = enterprise.photos?.slice(1) || [];

  const socialLinks = [
    { key: "instagram", icon: <FaInstagram />, url: enterprise.instagram, label: "Instagram" },
    { key: "twitter",   icon: <FaXTwitter />,  url: enterprise.twitter,   label: "Twitter / X" },
    { key: "facebook",  icon: <FaFacebookF />,  url: enterprise.facebook,  label: "Facebook" },
    { key: "website",   icon: <FiGlobe />,      url: enterprise.website,   label: "Site web" },
  ].filter((s) => s.url);

  const contactItems = [
    formattedAddress && { icon: <FiMapPin />, label: formattedAddress },
    enterprise.mail  && { icon: <FiMail />,  label: enterprise.mail,  href: `mailto:${enterprise.mail}` },
  ].filter(Boolean);

  const pageTitle = `${enterprise.name}${enterprise.job?.name ? ` — ${enterprise.job.name}` : ""}${enterprise.city ? ` à ${enterprise.city}` : ""} | Proxilio`;
  const pageDescription = enterprise.description
    ? enterprise.description.replace(/[#*_[\]]/g, "").slice(0, 155)
    : `${enterprise.name} est un professionnel vérifié sur Proxilio${enterprise.city ? ` à ${enterprise.city}` : ""}. Consultez la fiche, les avis et réservez en ligne.`;
  const pageUrl = `https://www.proxilio.fr/enterprise/${enterprise.slug || enterprise.id}`;
  const pageImage = enterprise.photos?.[0] || enterprise.logo || "https://www.proxilio.fr/assets/img/logo.png";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: enterprise.name,
    description: pageDescription,
    url: pageUrl,
    image: pageImage,
    ...(enterprise.phone && { telephone: enterprise.phone }),
    ...(enterprise.mail && { email: enterprise.mail }),
    ...(enterprise.website && { sameAs: [enterprise.website] }),
    address: {
      "@type": "PostalAddress",
      ...(enterprise.adress && { streetAddress: enterprise.adress }),
      ...(enterprise.city && { addressLocality: enterprise.city }),
      ...(enterprise.zip_code && { postalCode: enterprise.zip_code }),
      addressCountry: "FR",
    },
    ...(enterprise.job?.name && { "@type": "LocalBusiness", additionalType: enterprise.job.name }),
    ...(totalReviews > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: averageRating.toFixed(1),
        reviewCount: totalReviews,
        bestRating: "5",
        worstRating: "1",
      },
    }),
  };

  return (
    <>
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:type" content="business.business" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
    <div className="py-6 space-y-10">

      {/* ── Banner ── */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="relative h-52 sm:h-72 overflow-hidden rounded-2xl bg-[#eef5f1]">
          {coverPhoto && (
            <img
              src={coverPhoto}
              alt="Couverture"
              className="absolute inset-0 w-full h-full object-cover cursor-pointer"
              onClick={() => openPopup(coverPhoto)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-2xl" />
        </div>
      </div>

      {/* ── Identity row ── */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">

          {/* Logo */}
          {enterprise.logo ? (
            <img
              src={enterprise.logo}
              alt={`${enterprise.name} logo`}
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border border-black/5 object-cover shadow-[0_4px_16px_-8px_rgba(0,0,0,0.1)] flex-shrink-0"
            />
          ) : (
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border border-black/5 bg-[#f5f7f6] shadow-[0_4px_16px_-8px_rgba(0,0,0,0.08)] flex items-center justify-center flex-shrink-0">
              <span className="text-[#132A24] text-3xl font-light">
                {enterprise.name?.[0]?.toUpperCase()}
              </span>
            </div>
          )}

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {enterprise.job?.name && (
                <span className="px-3 py-1 rounded-full text-xs font-light bg-[#eef5f1] text-[#132A24] border border-[#132A24]/10">
                  {enterprise.job.name}
                </span>
              )}
              {enterprise.isPremium && (
                <span className="px-3 py-1 rounded-full text-xs font-light bg-[#132A24] text-white">
                  ★ Premium
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-light text-[#132A24] tracking-tight leading-tight">
              {enterprise.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-1.5 text-sm text-[#879f98]">
              {averageRating > 0 && (
                <span className="flex items-center gap-1">
                  <FaStar className="text-amber-400 text-xs" />
                  <span className="font-light text-[#132A24]">{averageRating.toFixed(1)}</span>
                  <span>({totalReviews} avis)</span>
                </span>
              )}
              {formattedAddress && (
                <span className="flex items-center gap-1.5">
                  <FiMapPin className="text-[#879f98] flex-shrink-0" />
                  {formattedAddress}
                </span>
              )}
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleOpenMsg}
              className="flex items-center gap-2 px-4 py-2.5 border border-[#132A24]/20 bg-[#eef5f1] hover:bg-[#132A24] hover:text-white text-[#132A24] text-sm font-light rounded-xl transition-colors"
            >
              <FiMail />
              Envoyer un message
            </button>
            {enterprise.isPremium ? (
              <button
                onClick={() => handleOpenBooking(null)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#132A24] hover:bg-[#1b3b33] text-white text-sm font-light rounded-xl transition-colors"
              >
                <FiCalendar />
                Réserver
              </button>
            ) : enterprise.mail ? (
              <a
                href={`mailto:${enterprise.mail}`}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#132A24] hover:bg-[#1b3b33] text-white text-sm font-light rounded-xl transition-colors"
              >
                <FiMail />
                Contacter
              </a>
            ) : null}
            {enterprise.phone && (
              <a
                href={`tel:${enterprise.phone}`}
                className="flex items-center gap-2 px-4 py-2.5 border border-black/5 bg-[#f5f7f6] hover:bg-[#eef5f1] text-[#132A24] text-sm font-light rounded-xl transition-colors"
              >
                <FiPhone />
                {enterprise.phone}
              </a>
            )}
            <button
              onClick={handleShare}
              title="Partager"
              className="flex items-center gap-2 px-4 py-2.5 border border-black/5 bg-[#f5f7f6] hover:bg-[#eef5f1] text-[#879f98] hover:text-[#132A24] text-sm font-light rounded-xl transition-colors"
            >
              {shareStatus === "success" ? <FiCheck className="text-[#132A24]" /> : <FiShare2 />}
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-black/5" />

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left — main column */}
          <div className="lg:col-span-2 space-y-14">

            {/* Description */}
            {enterprise.description && (
              <section>
                <SectionLabel>À propos</SectionLabel>
                <div className="prose max-w-none prose-p:text-[#4b615a] prose-p:font-light prose-headings:text-[#132A24] prose-headings:font-light prose-a:text-[#4b8a74] text-[#4b615a] font-light leading-relaxed">
                  <ReactMarkdown>{enterprise.description}</ReactMarkdown>
                </div>
              </section>
            )}

            {/* Gallery */}
            {galleryPhotos.length > 0 && (
              <section>
                <SectionLabel>Galerie</SectionLabel>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {galleryPhotos.map((photo, i) => (
                    <div
                      key={i}
                      className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group border border-black/5"
                      onClick={() => openPopup(photo)}
                    >
                      <img
                        src={photo}
                        alt={`${enterprise.name} photo ${i + 2}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Services */}
            <section id="services">
              <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
                <div>
                  <SectionLabel>Prestations</SectionLabel>
                  <h2 className="text-xl font-light text-[#132A24] tracking-tight">Offres &amp; services</h2>
                </div>
                {enterprise.isPremium && (
                  <button
                    onClick={() => handleOpenBooking(null)}
                    className="flex items-center gap-2 px-4 py-2 border border-[#132A24]/15 text-[#132A24] text-sm font-light rounded-xl hover:bg-[#eef5f1] transition-colors"
                  >
                    <FiCalendar className="text-sm" />
                    Choisir un créneau
                  </button>
                )}
              </div>
              <OfferList
                offers={enterprise.offers}
                onBook={enterprise.isPremium ? (offer) => handleOpenBooking(offer.id) : undefined}
              />
            </section>

            {/* Reviews */}
            <section id="reviews">
              <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
                <div>
                  <SectionLabel>Avis clients</SectionLabel>
                  <h2 className="text-xl font-light text-[#132A24] tracking-tight">Ils nous recommandent</h2>
                </div>
                {totalReviews > 0 && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-[#eef5f1] border border-[#132A24]/10 rounded-full text-sm text-[#132A24] font-light">
                    <FaStar className="text-amber-400 text-xs" />
                    {totalReviews} avis vérifiés
                  </span>
                )}
              </div>
              <CommentList offers={enterprise.offers} />
            </section>
          </div>

          {/* Right — sidebar */}
          <div className="space-y-5">

            {/* Contact */}
            <div className="bg-white border border-black/5 rounded-2xl p-5 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
              <h3 className="text-sm font-light text-[#132A24] tracking-tight mb-4">Informations de contact</h3>
              <div className="space-y-3">
                {contactItems.map((item, i) =>
                  item.href ? (
                    <a key={i} href={item.href} className="flex items-start gap-3 text-sm text-[#879f98] hover:text-[#132A24] transition-colors group">
                      <span className="mt-0.5 text-[#132A24] flex-shrink-0">{item.icon}</span>
                      <span className="group-hover:underline break-all">{item.label}</span>
                    </a>
                  ) : (
                    <div key={i} className="flex items-start gap-3 text-sm text-[#879f98]">
                      <span className="mt-0.5 text-[#132A24] flex-shrink-0">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  )
                )}
                {enterprise.phone && (
                  <div className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 text-[#132A24] flex-shrink-0"><FiPhone /></span>
                    {phoneRevealed ? (
                      <a href={`tel:${enterprise.phone}`} className="text-[#132A24] hover:underline break-all">{enterprise.phone}</a>
                    ) : (
                      <button onClick={() => setPhoneRevealed(true)} className="text-[#879f98] hover:text-[#132A24] transition-colors underline underline-offset-2 text-left">
                        Afficher le numéro de téléphone
                      </button>
                    )}
                  </div>
                )}
              </div>
              {enterprise.phone && phoneRevealed && (
                <a href={`tel:${enterprise.phone}`} className="mt-5 flex w-full items-center justify-center gap-2 px-4 py-2.5 bg-[#132A24] hover:bg-[#1b3b33] text-white text-sm font-light rounded-xl transition-colors">
                  <FiPhone /> Appeler maintenant
                </a>
              )}
              {enterprise.mail && (
                <a href={`mailto:${enterprise.mail}`} className="mt-3 flex w-full items-center justify-center gap-2 px-4 py-2.5 border border-black/10 hover:bg-[#f5f7f6] text-[#132A24] text-sm font-light rounded-xl transition-colors">
                  <FiMail /> Envoyer un email
                </a>
              )}
              <button
                onClick={handleOpenMsg}
                className="mt-3 flex w-full items-center justify-center gap-2 px-4 py-2.5 bg-[#eef5f1] hover:bg-[#132A24] hover:text-white text-[#132A24] text-sm font-light rounded-xl transition-colors border border-[#132A24]/10"
              >
                ✉ Envoyer un message
              </button>
            </div>

            {/* Autres informations */}
            {(enterprise.payment_methods?.length > 0 || enterprise.service_types?.length > 0 || enterprise.languages?.length > 0) && (
              <div className="bg-white border border-black/5 rounded-2xl p-5 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] space-y-4">
                <h3 className="text-sm font-light text-[#132A24] tracking-tight">Autres informations</h3>

                {enterprise.payment_methods?.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-2">Moyens de paiement</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: "Carte bancaire", icon: "💳" },
                        { value: "Chèque",         icon: "📝" },
                        { value: "Espèces",        icon: "💶" },
                        { value: "Virement",       icon: "🏦" },
                      ].filter(({ value }) => enterprise.payment_methods.includes(value)).map(({ value, icon }) => (
                        <span key={value} className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f7f6] border border-black/5 px-3 py-1.5 text-xs font-light text-[#132A24]">
                          <span>{icon}</span>{value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {enterprise.service_types?.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-2">Types de prestations</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: "Déplacement à domicile",    icon: "🏠" },
                        { value: "Dans mes locaux",           icon: "🏢" },
                        { value: "À distance / En ligne",     icon: "🌐" },
                        { value: "Visioconférence",           icon: "💻" },
                        { value: "Sur chantier",              icon: "🏗️" },
                        { value: "Livraison à domicile",      icon: "📦" },
                      ].filter(({ value }) => enterprise.service_types.includes(value)).map(({ value, icon }) => (
                        <span key={value} className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f7f6] border border-black/5 px-3 py-1.5 text-xs font-light text-[#132A24]">
                          <span>{icon}</span>{value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {enterprise.languages?.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-2">Langues parlées</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: "Français",    flag: "🇫🇷" },
                        { value: "Anglais",     flag: "🇬🇧" },
                        { value: "Espagnol",    flag: "🇪🇸" },
                        { value: "Allemand",    flag: "🇩🇪" },
                        { value: "Italien",     flag: "🇮🇹" },
                        { value: "Portugais",   flag: "🇵🇹" },
                        { value: "Arabe",       flag: "🇸🇦" },
                        { value: "Polonais",    flag: "🇵🇱" },
                        { value: "Turc",        flag: "🇹🇷" },
                        { value: "Néerlandais", flag: "🇳🇱" },
                        { value: "Russe",       flag: "🇷🇺" },
                        { value: "Roumain",     flag: "🇷🇴" },
                      ].filter(({ value }) => enterprise.languages.includes(value)).map(({ value, flag }) => (
                        <span key={value} className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f7f6] border border-black/5 px-3 py-1.5 text-xs font-light text-[#132A24]">
                          <span>{flag}</span>{value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="bg-white border border-black/5 rounded-2xl p-5 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
                <h3 className="text-sm font-light text-[#132A24] tracking-tight mb-3">Suivre sur les réseaux</h3>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((social) => (
                    <a
                      key={social.key}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={social.label}
                      className="flex items-center justify-center h-10 w-10 rounded-xl border border-black/5 bg-[#f5f7f6] text-[#879f98] hover:bg-[#132A24] hover:text-white hover:border-transparent transition-all duration-200 text-lg"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="bg-white border border-black/5 rounded-2xl p-5 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
              <h3 className="text-sm font-light text-[#132A24] tracking-tight mb-1">Partager cette page</h3>
              <p className="text-xs text-[#879f98] font-light mb-3">Copiez le lien de la landing page</p>
              <button
                onClick={handleShare}
                className="flex w-full items-center justify-center gap-2 px-4 py-2.5 border border-black/5 bg-[#f5f7f6] hover:bg-[#eef5f1] text-[#879f98] hover:text-[#132A24] text-sm font-light rounded-xl transition-colors"
              >
                {shareStatus === "success" ? <FiCheck className="text-[#132A24]" /> : <FiShare2 />}
                {shareStatus === "success" ? "Lien copié !" : "Copier le lien"}
              </button>
              {shareMessage && (
                <p className={`mt-2 text-xs text-center font-light ${shareStatus === "error" ? "text-red-500" : "text-[#132A24]"}`}>
                  {shareMessage}
                </p>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Photo modal */}
      {isPopupOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={closePopup}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedPhoto}
              alt="Galerie"
              className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            />
            <button
              className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white border border-black/5 text-[#132A24] shadow-lg hover:bg-[#f5f7f6] transition text-xl font-light"
              onClick={closePopup}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      <PremiumReservationModal
        enterpriseId={enterprise.id}
        isOpen={isBookingOpen}
        onClose={() => { setIsBookingOpen(false); setPrefillOfferId(null); }}
        onBooked={handleBookingSuccess}
        offers={enterprise.offers}
        initialOfferId={prefillOfferId}
        multiBooking={!!enterprise.multi_booking}
      />

      {/* Modal auth requis */}
      {authPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5 text-center">
            <div className="text-4xl">✉️</div>
            <h2 className="text-base font-light text-[#132A24]">Contactez {enterprise.name}</h2>
            <p className="text-sm text-[#879f98] font-light leading-relaxed">
              Pour envoyer un message et suivre la conversation directement sur Proxilio, connectez-vous ou créez un compte gratuit.
            </p>
            <div className="flex flex-col gap-2.5 pt-1">
              <a href={`/signin?redirect=${encodeURIComponent(window.location.pathname)}`}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#132A24] px-5 py-3 text-sm font-light text-white hover:bg-[#1b3b33] transition">
                Se connecter
              </a>
              <a href={`/signup?redirect=${encodeURIComponent(window.location.pathname)}`}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#132A24]/20 bg-[#eef5f1] px-5 py-3 text-sm font-light text-[#132A24] hover:bg-[#132A24] hover:text-white transition">
                Créer un compte gratuit
              </a>
            </div>
            <button onClick={() => setAuthPrompt(false)} className="text-xs text-[#879f98] hover:text-[#132A24] transition underline underline-offset-2">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Modal message */}
      {msgOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            {msgSent ? (
              <div className="text-center py-6 space-y-3">
                <div className="text-4xl">✅</div>
                <p className="text-base font-light text-[#132A24]">Message envoyé !</p>
                <p className="text-sm text-[#879f98] font-light">{enterprise.name} recevra votre message très prochainement.</p>
                <button onClick={() => setMsgOpen(false)} className="mt-2 rounded-xl bg-[#132A24] px-6 py-2.5 text-sm font-light text-white hover:bg-[#1b3b33] transition">
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-light text-[#132A24]">Envoyer un message à {enterprise.name}</h2>
                  <button onClick={() => setMsgOpen(false)} className="text-[#879f98] hover:text-[#132A24] text-xl leading-none transition">×</button>
                </div>

                {currentUser?.isLogged ? (
                  <div className="flex items-center gap-2 bg-[#eef5f1] rounded-xl px-3 py-2.5">
                    <span className="text-[#132A24] text-sm">✓</span>
                    <p className="text-xs font-light text-[#132A24]">Connecté en tant que <strong className="font-medium">{currentUser.username}</strong> — la réponse apparaîtra dans votre messagerie Proxilio.</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-[#f5f7f6] rounded-xl px-3 py-2.5">
                    <span className="text-[#879f98] text-sm">ℹ</span>
                    <p className="text-xs font-light text-[#879f98]">Sans compte, l'entreprise vous répondra par email.</p>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="space-y-3">
                  {!currentUser?.isLogged && [
                    { label: "Votre nom *", key: "sender_name", type: "text", placeholder: "Jean Dupont" },
                    { label: "Votre email *", key: "sender_email", type: "email", placeholder: "jean@exemple.fr" },
                    { label: "Téléphone (optionnel)", key: "sender_phone", type: "tel", placeholder: "06 12 34 56 78" },
                  ].map(({ label, key, type, placeholder }) => (
                    <div key={key}>
                      <label className="block text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1">{label}</label>
                      <input type={type} placeholder={placeholder} required={!label.includes("optionnel")}
                        value={msgForm[key]}
                        onChange={(e) => setMsgForm((p) => ({ ...p, [key]: e.target.value }))}
                        className="w-full rounded-xl bg-[#f5f7f6] border border-black/5 px-3 py-2 text-sm font-light text-[#132A24] placeholder:text-[#879f98] outline-none focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 transition" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1">Message *</label>
                    <textarea required rows={5} placeholder="Décrivez votre besoin…"
                      value={msgForm.content}
                      onChange={(e) => setMsgForm((p) => ({ ...p, content: e.target.value }))}
                      className="w-full rounded-xl bg-[#f5f7f6] border border-black/5 px-3 py-2 text-sm font-light text-[#132A24] placeholder:text-[#879f98] outline-none focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 transition resize-none" />
                  </div>
                  <button type="submit" disabled={msgSending} className="w-full rounded-xl bg-[#132A24] py-3 text-sm font-light text-white hover:bg-[#1b3b33] transition disabled:opacity-60">
                    {msgSending ? "Envoi…" : "Envoyer le message"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
};

const SectionLabel = ({ children }) => (
  <p className="text-xs font-light uppercase tracking-widest text-[#879f98] mb-1">{children}</p>
);

export default EnterpriseShow;
