import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  const [claimOpen, setClaimOpen]         = useState(false);
  const [claimStep, setClaimStep]         = useState("init"); // "init" | "code"
  const [claimSending, setClaimSending]   = useState(false);
  const [claimCode, setClaimCode]         = useState("");
  const [claimMailHint, setClaimMailHint] = useState("");

  const fetchEnterprise = useCallback(async () => {
    try {
      const data = await getData(`enterprise/${slug}`);
      setEnterprise(data);
      // Signal prerender que le contenu est prêt (headless Chrome peut prendre le snapshot)
      if (typeof window !== "undefined") window.prerenderReady = true;
    } catch (error) {
      console.error("Error fetching enterprise:", error);
      if (typeof window !== "undefined") window.prerenderReady = true;
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
        const ta = Object.assign(document.createElement("textarea"), {
          value: shareUrl, style: "position:fixed;opacity:0",
        });
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        try { navigator.clipboard?.writeText(shareUrl); } catch { /* ignore */ }
        document.body.removeChild(ta);
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

  const handleOpenClaim = () => {
    if (!currentUser?.isLogged) { setAuthPrompt(true); return; }
    setClaimStep("init");
    setClaimCode("");
    setClaimMailHint("");
    setClaimOpen(true);
  };

  const handleInitiateClaim = async () => {
    try {
      setClaimSending(true);
      const r = await postData(`enterprise/${enterprise.slug}/initiate-claim`, {});
      setClaimMailHint(r.mail_hint || "");
      setClaimStep("code");
      toast.info(`Code envoyé à ${r.mail_hint}`);
    } catch (err) {
      try { toast.error(JSON.parse(err.message).error || "Erreur."); }
      catch { toast.error("Impossible d'envoyer le code."); }
    } finally { setClaimSending(false); }
  };

  const handleVerifyClaim = async (e) => {
    e.preventDefault();
    if (!claimCode.trim()) return;
    try {
      setClaimSending(true);
      await postData(`enterprise/${enterprise.slug}/verify-claim`, { code: claimCode.trim() });
      toast.success("Fiche revendiquée avec succès !");
      setClaimOpen(false);
      fetchEnterprise(); // refresh pour enlever le badge
    } catch (err) {
      try { toast.error(JSON.parse(err.message).error || "Erreur."); }
      catch { toast.error("Code incorrect ou expiré."); }
    } finally { setClaimSending(false); }
  };

  const handleResendClaim = async () => {
    try {
      setClaimSending(true);
      const r = await postData(`enterprise/${enterprise.slug}/resend-claim`, {});
      toast.info(`Nouveau code envoyé à ${r.mail_hint}`);
    } catch (err) {
      try { toast.error(JSON.parse(err.message).error || "Erreur."); }
      catch { toast.error("Impossible de renvoyer le code."); }
    } finally { setClaimSending(false); }
  };

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
  const pageUrl = `https://proxilio.fr/enterprise/${enterprise.slug || enterprise.id}`;
  const pageImage = enterprise.photos?.[0] || enterprise.logo || "https://proxilio.fr/assets/img/logo.png";

  // Mapping métier → type Schema.org officiel
  const SCHEMA_TYPE_MAP = {
    "Plombier": "Plumber", "Électricien": "Electrician", "Electricien": "Electrician",
    "Avocat": "Attorney", "Médecin": "Physician", "Dentiste": "Dentist",
    "Vétérinaire": "AnimalShelter", "Pharmacien": "Pharmacy",
    "Architecte": "Architect", "Comptable": "AccountingService",
    "Coiffeur": "HairSalon", "Esth��ticienne": "BeautySalon", "Spa": "DaySpa",
    "Restaurant": "Restaurant", "Boulangerie": "Bakery", "Épicerie": "GroceryStore",
    "Serrurier": "LocksmithService", "Maçon": "GeneralContractor",
    "Peintre": "PainterService", "Menuisier": "GeneralContractor",
    "Jardinier": "LandscapeService", "Déménageur": "MovingCompany",
    "Taxi": "TaxiService", "Auto-école": "DrivingSchool",
  };
  const schemaType = SCHEMA_TYPE_MAP[enterprise.job?.name] || "LocalBusiness";

  const jobSlug = enterprise.job?.name
    ? enterprise.job.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": schemaType,
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
    ...(totalReviews > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: averageRating.toFixed(1),
        reviewCount: totalReviews,
        bestRating: "5",
        worstRating: "1",
      },
    }),
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: "https://proxilio.fr/" },
        { "@type": "ListItem", position: 2, name: "Professionnels", item: "https://proxilio.fr/professionnels" },
        ...(jobSlug ? [{ "@type": "ListItem", position: 3, name: enterprise.job.name, item: `https://proxilio.fr/professionnels/${jobSlug}` }] : []),
        { "@type": "ListItem", position: jobSlug ? 4 : 3, name: enterprise.name, item: pageUrl },
      ],
    },
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
    <div className="py-6 space-y-10 lg:pb-0 pb-20">

      {/* ── Bandeau fiche non revendiquée ── */}
      {enterprise.is_public_listing && !enterprise.is_claimed && (
        <div className="max-w-7xl mx-auto px-6 mt-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <span className="text-amber-500 text-xl shrink-0 mt-0.5">🟡</span>
              <div>
                <p className="text-sm font-medium text-amber-800">Fiche non revendiquée</p>
                <p className="text-xs text-amber-700 font-light mt-0.5 leading-relaxed">
                  Ces informations sont issues de sources publiques (sites web, annuaires professionnels, registres publics).
                  Elles sont fournies à titre indicatif et peuvent être incomplètes ou obsolètes.
                </p>
              </div>
            </div>
            <button
              onClick={handleOpenClaim}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-light px-4 py-2.5 transition active:scale-95"
            >
              👉 Revendiquer cette fiche
            </button>
          </div>
        </div>
      )}

      {/* ── Banner ── */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="relative h-52 sm:h-72 overflow-hidden rounded-2xl bg-[#eef5f1]">
          {coverPhoto && (
            <img
              src={coverPhoto}
              alt={`${enterprise.name} — photo de couverture`}
              width={1200}
              height={400}
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
              alt={`Logo ${enterprise.name}`}
              width={96}
              height={96}
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
                <Link
                  to={`/professionnels/${jobSlug}`}
                  className="px-3 py-1 rounded-full text-xs font-light bg-[#eef5f1] text-[#132A24] border border-[#132A24]/10 hover:bg-[#132A24] hover:text-white transition-colors"
                >
                  {enterprise.job.name}
                </Link>
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
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenMsg}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#132A24] hover:bg-[#1b3b33] text-white text-sm font-light rounded-xl transition-colors"
            >
              <FiMail />
              Envoyer un message
            </button>
            {enterprise.isPremium && (
              <button
                onClick={() => handleOpenBooking(null)}
                className="flex items-center gap-2 px-5 py-2.5 border border-[#132A24]/20 bg-[#eef5f1] hover:bg-[#132A24] hover:text-white text-[#132A24] text-sm font-light rounded-xl transition-colors"
              >
                <FiCalendar />
                Réserver
              </button>
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
                        alt={`${enterprise.name} — photo ${i + 2}`}
                        width={400}
                        height={400}
                        loading="lazy"
                        decoding="async"
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

          {/* Right — sidebar (order-first sur mobile, position naturelle sur desktop) */}
          <div className="space-y-5 order-first lg:order-none">

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

          {/* Bloc RGPD / signalement — fiches publiques uniquement */}
          {enterprise.is_public_listing && (
            <div className="bg-[#f5f7f6] border border-black/5 rounded-2xl p-4 space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">Données publiques</p>
              <p className="text-xs text-[#879f98] font-light leading-relaxed">
                Informations issues de sources publiques en ligne. Elles peuvent être incomplètes ou obsolètes.
              </p>
              {!enterprise.is_claimed && (
                <button onClick={handleOpenClaim}
                  className="w-full mt-1 text-xs font-light text-amber-700 hover:text-amber-900 underline underline-offset-2 transition text-left">
                  Propriétaire ? Revendiquez gratuitement →
                </button>
              )}
              <a
                href={`mailto:contact@proxilio.fr?subject=Signalement fiche ${encodeURIComponent(enterprise.name)}&body=Fiche : ${window.location.href}%0A%0ADescription du problème :`}
                className="block text-xs font-light text-[#879f98] hover:text-[#132A24] underline underline-offset-2 transition"
              >
                Signaler une erreur
              </a>
            </div>
          )}

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

      {/* Modal revendication */}
      {claimOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-light text-[#132A24]">Revendiquer {enterprise.name}</h2>
              <button onClick={() => setClaimOpen(false)} className="text-[#879f98] hover:text-[#132A24] text-xl transition">×</button>
            </div>

            {claimStep === "init" ? (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 font-light leading-relaxed">
                  Un code de vérification sera envoyé à l&apos;adresse email professionnelle de cette entreprise.
                  Seul le propriétaire ayant accès à cette boîte peut valider la revendication.
                </div>
                <p className="text-xs text-[#879f98] font-light leading-relaxed">
                  En revendiquant cette fiche, vous confirmez être le représentant légal ou autorisé de <strong className="text-[#132A24] font-normal">{enterprise.name}</strong>.
                </p>
                <button
                  onClick={handleInitiateClaim}
                  disabled={claimSending}
                  className="w-full rounded-xl bg-[#132A24] py-3 text-sm font-light text-white hover:bg-[#1b3b33] transition disabled:opacity-60"
                >
                  {claimSending ? "Envoi du code…" : "Envoyer le code de vérification"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyClaim} className="space-y-4">
                <div className="bg-[#eef5f1] border border-[#132A24]/10 rounded-xl px-4 py-3 text-sm text-[#132A24] font-light">
                  ✉ Code envoyé à <strong>{claimMailHint || "l'email professionnel de l'entreprise"}</strong>. Vérifiez votre boîte (et les spams).
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1">Code de vérification (6 chiffres)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={claimCode}
                    onChange={(e) => setClaimCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center text-2xl tracking-[0.4em] rounded-xl bg-[#f5f7f6] border border-black/5 px-3 py-3 font-light text-[#132A24] outline-none focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 transition"
                    required
                  />
                </div>
                <button type="submit" disabled={claimSending || claimCode.length !== 6}
                  className="w-full rounded-xl bg-[#132A24] py-3 text-sm font-light text-white hover:bg-[#1b3b33] transition disabled:opacity-60">
                  {claimSending ? "Vérification…" : "Valider et revendiquer la fiche"}
                </button>
                <div className="flex items-center justify-center gap-1 text-xs text-[#879f98] font-light">
                  Code non reçu ?
                  <button type="button" onClick={handleResendClaim} disabled={claimSending}
                    className="underline underline-offset-2 hover:text-[#132A24] transition">
                    Renvoyer un code
                  </button>
                </div>
              </form>
            )}
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

    {/* Sticky CTA mobile — visible uniquement sur petits écrans */}
    {enterprise.isPremium && (
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-sm border-t border-black/5 px-4 py-3 safe-area-pb">
        <button
          onClick={() => handleOpenBooking(null)}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#132A24] py-3.5 text-sm font-light text-white hover:bg-[#1b3b33] transition-colors"
        >
          <FiCalendar className="text-base" />
          Réserver avec {enterprise.name}
        </button>
      </div>
    )}
    </>
  );
};

const SectionLabel = ({ children }) => (
  <p className="text-xs font-light uppercase tracking-widest text-[#879f98] mb-1">{children}</p>
);

export default EnterpriseShow;
