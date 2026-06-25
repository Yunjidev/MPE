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
import RecommendationList from "../../components/ShowEnterprise/RecommendationList";
import PremiumReservationModal from "../../components/ShowEnterprise/PremiumReservationModal";

const formatDuration = (minutes) => {
  const total = Number(minutes) || 0;
  if (total >= 60) {
    const h = Math.floor(total / 60);
    const m = total % 60;
    return m > 0 ? `${h}h${m}` : `${h}h`;
  }
  return `${total} min`;
};

const EnterpriseShow = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [enterprise, setEnterprise] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [prefillOfferId, setPrefillOfferId] = useState(null);
  const [shareStatus, setShareStatus] = useState(null);
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [authPrompt, setAuthPrompt] = useState(false);
  const [msgSending, setMsgSending] = useState(false);
  const [msgSent, setMsgSent] = useState(false);
  const [currentUser] = useAtom(userAtom);
  const [msgForm, setMsgForm] = useState({ sender_name: "", sender_email: "", sender_phone: "", content: "" });
  const [claimOpen, setClaimOpen]       = useState(false);
  const [claimStep, setClaimStep]       = useState("init");
  const [claimSending, setClaimSending] = useState(false);
  const [claimCode, setClaimCode]       = useState("");
  const [claimMailHint, setClaimMailHint] = useState("");
  const [activeTab, setActiveTab]       = useState("about");
  const [mapCoords, setMapCoords]       = useState(null);

  const fetchEnterprise = useCallback(async () => {
    try {
      const data = await getData(`enterprise/${slug}`);
      setEnterprise(data);
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

  useEffect(() => {
    if (!enterprise) return;
    const addr = [enterprise.adress, enterprise.city, enterprise.zip_code].filter(Boolean).join(", ");
    if (!addr) return;
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addr)}&format=json&limit=1`, {
      headers: { "Accept-Language": "fr", "User-Agent": "Proxilio/1.0" },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.[0]) setMapCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
      })
      .catch(() => {});
  }, [enterprise]);

  const handleBookingSuccess = useCallback(() => { fetchEnterprise(); }, [fetchEnterprise]);
  const openPopup  = (photo) => { setSelectedPhoto(photo); setIsPopupOpen(true); };
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
        const ta = Object.assign(document.createElement("textarea"), { value: shareUrl, style: "position:fixed;opacity:0" });
        document.body.appendChild(ta); ta.focus(); ta.select();
        try { navigator.clipboard?.writeText(shareUrl); } catch { /* ignore */ }
        document.body.removeChild(ta);
      }
      setShareStatus("success");
    } catch {
      setShareStatus("error");
    } finally {
      setTimeout(() => { setShareStatus(null); setShareMessage(""); }, 3000);
    }
  };

  const handleOpenBooking = (offerId = null) => { setPrefillOfferId(offerId); setIsBookingOpen(true); };

  const handleOpenClaim = () => {
    if (!currentUser?.isLogged) { setAuthPrompt(true); return; }
    setClaimStep("init"); setClaimCode(""); setClaimMailHint(""); setClaimOpen(true);
  };

  const handleInitiateClaim = async () => {
    try {
      setClaimSending(true);
      const r = await postData(`enterprise/${enterprise.slug}/initiate-claim`, {});
      setClaimMailHint(r.mail_hint || ""); setClaimStep("code");
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
      toast.success("Fiche revendiquée avec succès !"); setClaimOpen(false); fetchEnterprise();
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
      toast.error("Nom, email et message sont requis."); return;
    }
    try {
      setMsgSending(true);
      await postData(`enterprise/${enterprise.slug || enterprise.id}/messages`, msgForm);
      setMsgSent(true); toast.success("Message envoyé !");
    } catch { toast.error("Erreur lors de l'envoi. Réessayez."); }
    finally { setMsgSending(false); }
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

  const formattedAddress = [enterprise.adress, enterprise.city, enterprise.zip_code].filter(Boolean).join(", ");
  const coverPhoto   = enterprise.photos?.[0];
  const galleryPhotos = enterprise.photos?.slice(1) || [];

  const socialLinks = [
    { key: "instagram", icon: <FaInstagram />, url: enterprise.instagram, label: "Instagram" },
    { key: "twitter",   icon: <FaXTwitter />,  url: enterprise.twitter,   label: "Twitter / X" },
    { key: "facebook",  icon: <FaFacebookF />,  url: enterprise.facebook,  label: "Facebook" },
    { key: "website",   icon: <FiGlobe />,      url: enterprise.website,   label: "Site web" },
  ].filter((s) => s.url);

  const contactItems = [
    formattedAddress && { icon: <FiMapPin />, label: formattedAddress },
    enterprise.mail  && { icon: <FiMail />,  label: enterprise.mail, href: `mailto:${enterprise.mail}` },
  ].filter(Boolean);

  const pageTitle       = `${enterprise.name}${enterprise.job?.name ? ` — ${enterprise.job.name}` : ""}${enterprise.city ? ` à ${enterprise.city}` : ""} | Proxilio`;
  const pageDescription = enterprise.description
    ? enterprise.description.replace(/[#*_[\]]/g, "").slice(0, 155)
    : `${enterprise.name} est un professionnel vérifié sur Proxilio${enterprise.city ? ` à ${enterprise.city}` : ""}. Consultez la fiche, les avis et réservez en ligne.`;
  const pageUrl   = `https://proxilio.fr/enterprise/${enterprise.slug || enterprise.id}`;
  const pageImage = enterprise.photos?.[0] || enterprise.logo || "https://proxilio.fr/assets/img/logo.png";

  const SCHEMA_TYPE_MAP = {
    "Plombier": "Plumber", "Électricien": "Electrician", "Electricien": "Electrician",
    "Avocat": "Attorney", "Médecin": "Physician", "Dentiste": "Dentist",
    "Vétérinaire": "AnimalShelter", "Pharmacien": "Pharmacy",
    "Architecte": "Architect", "Comptable": "AccountingService",
    "Coiffeur": "HairSalon", "Esthéticienne": "BeautySalon", "Spa": "DaySpa",
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
    "@context": "https://schema.org", "@type": schemaType,
    name: enterprise.name, description: pageDescription, url: pageUrl, image: pageImage,
    ...(enterprise.phone && { telephone: enterprise.phone }),
    ...(enterprise.mail  && { email:     enterprise.mail  }),
    ...(enterprise.website && { sameAs:  [enterprise.website] }),
    address: {
      "@type": "PostalAddress",
      ...(enterprise.adress   && { streetAddress:   enterprise.adress   }),
      ...(enterprise.city     && { addressLocality:  enterprise.city     }),
      ...(enterprise.zip_code && { postalCode:       enterprise.zip_code }),
      addressCountry: "FR",
    },
    ...(totalReviews > 0 && {
      aggregateRating: {
        "@type": "AggregateRating", ratingValue: averageRating.toFixed(1),
        reviewCount: totalReviews, bestRating: "5", worstRating: "1",
      },
    }),
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil",         item: "https://proxilio.fr/" },
        { "@type": "ListItem", position: 2, name: "Professionnels",  item: "https://proxilio.fr/professionnels" },
        ...(jobSlug ? [{ "@type": "ListItem", position: 3, name: enterprise.job.name, item: `https://proxilio.fr/professionnels/${jobSlug}` }] : []),
        { "@type": "ListItem", position: jobSlug ? 4 : 3, name: enterprise.name, item: pageUrl },
      ],
    },
  };

  const totalRecommendations = enterprise?.recommendations?.length || 0;

  const tabs = [
    { id: "about",           label: "À propos"  },
    { id: "services",        label: "Services"  },
    { id: "reviews",         label: "Avis"      },
    { id: "recommendations", label: totalRecommendations > 0 ? `Recommandations (${totalRecommendations})` : "Recommandations" },
    ...(galleryPhotos.length > 0 ? [{ id: "photos", label: "Photos" }] : []),
  ];

  /* ─── Sidebar content (contact + payment + social + share) ─── */
  const SidebarContact = () => (
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
              <button onClick={() => setPhoneRevealed(true)} className="text-[#879f98] hover:text-[#132A24] transition underline underline-offset-2 text-left">
                Afficher le numéro
              </button>
            )}
          </div>
        )}
        {enterprise.siret_number && (
          <div className="flex items-start gap-3 text-sm text-[#879f98]">
            <span className="mt-0.5 text-[#132A24] flex-shrink-0"><FiMapPin /></span>
            <span>SIRET {enterprise.siret_number}</span>
          </div>
        )}
      </div>
      {enterprise.phone && phoneRevealed && (
        <a href={`tel:${enterprise.phone}`} className="mt-5 flex w-full items-center justify-center gap-2 px-4 py-2.5 bg-[#132A24] hover:bg-[#1b3b33] text-white text-sm font-light rounded-xl transition-colors">
          <FiPhone /> Appeler
        </a>
      )}
      <button onClick={handleOpenMsg} className="mt-3 flex w-full items-center justify-center gap-2 px-4 py-2.5 bg-[#eef5f1] hover:bg-[#132A24] hover:text-white text-[#132A24] text-sm font-light rounded-xl transition-colors border border-[#132A24]/10">
        ✉ Envoyer un message
      </button>
      {socialLinks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-black/5">
          <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-2">Réseaux sociaux</p>
          <div className="flex flex-wrap gap-2">
            {socialLinks.map((social) => (
              <a key={social.key} href={social.url} target="_blank" rel="noopener noreferrer" title={social.label}
                className="flex items-center justify-center h-9 w-9 rounded-xl border border-black/5 bg-[#f5f7f6] text-[#879f98] hover:bg-[#132A24] hover:text-white hover:border-transparent transition-all duration-200 text-base">
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const SidebarExtras = () => (
    <>
      {(enterprise.payment_methods?.length > 0 || enterprise.service_types?.length > 0 || enterprise.languages?.length > 0) && (
        <div className="bg-white border border-black/5 rounded-2xl p-5 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] space-y-4">
          <h3 className="text-sm font-light text-[#132A24] tracking-tight">Autres informations</h3>
          {enterprise.payment_methods?.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-2">Moyens de paiement</p>
              <div className="flex flex-wrap gap-2">
                {[{ value: "Carte bancaire", icon: "💳" }, { value: "Chèque", icon: "📝" }, { value: "Espèces", icon: "💶" }, { value: "Virement", icon: "🏦" }]
                  .filter(({ value }) => enterprise.payment_methods.includes(value))
                  .map(({ value, icon }) => (
                    <span key={value} className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f7f6] border border-black/5 px-3 py-1.5 text-xs font-light text-[#132A24]">
                      {icon} {value}
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
                  { value: "Déplacement à domicile", icon: "🏠" }, { value: "Dans mes locaux", icon: "🏢" },
                  { value: "À distance / En ligne", icon: "🌐" },   { value: "Visioconférence", icon: "💻" },
                  { value: "Sur chantier", icon: "🏗️" },            { value: "Livraison à domicile", icon: "📦" },
                ].filter(({ value }) => enterprise.service_types.includes(value)).map(({ value, icon }) => (
                  <span key={value} className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f7f6] border border-black/5 px-3 py-1.5 text-xs font-light text-[#132A24]">
                    {icon} {value}
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
                  { value: "Français", flag: "🇫🇷" }, { value: "Anglais", flag: "🇬🇧" },
                  { value: "Espagnol", flag: "🇪🇸" }, { value: "Allemand", flag: "🇩🇪" },
                  { value: "Italien",  flag: "🇮🇹" }, { value: "Portugais", flag: "🇵🇹" },
                  { value: "Arabe",    flag: "🇸🇦" }, { value: "Polonais",  flag: "🇵🇱" },
                  { value: "Turc",     flag: "🇹🇷" }, { value: "Néerlandais", flag: "🇳🇱" },
                  { value: "Russe",    flag: "🇷🇺" }, { value: "Roumain",   flag: "🇷🇴" },
                ].filter(({ value }) => enterprise.languages.includes(value)).map(({ value, flag }) => (
                  <span key={value} className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f7f6] border border-black/5 px-3 py-1.5 text-xs font-light text-[#132A24]">
                    {flag} {value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {enterprise.is_public_listing && (
        <div className="bg-[#f5f7f6] border border-black/5 rounded-2xl p-4 space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light">Données publiques</p>
          <p className="text-xs text-[#879f98] font-light leading-relaxed">
            Informations issues de sources publiques. Elles peuvent être incomplètes ou obsolètes.
          </p>
          {!enterprise.is_claimed && (
            <button onClick={handleOpenClaim} className="w-full mt-1 text-xs font-light text-amber-700 hover:text-amber-900 underline underline-offset-2 transition text-left">
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
    </>
  );

  const SidebarMap = () => {
    if (!mapCoords) return null;
    const { lat, lon } = mapCoords;
    const delta = 0.008;
    const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
    const src  = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
    const link = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`;
    return (
      <div className="bg-white border border-black/5 rounded-2xl overflow-hidden shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
        <iframe
          src={src}
          width="100%"
          height="200"
          style={{ border: 0, display: "block" }}
          title={`Localisation de ${enterprise.name}`}
          loading="lazy"
        />
        <div className="px-4 py-2.5 border-t border-black/5">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#879f98] hover:text-[#132A24] transition font-light flex items-center gap-1.5"
          >
            <FiMapPin className="text-xs" />
            Voir sur OpenStreetMap
          </a>
        </div>
      </div>
    );
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

      {/* Claim banner */}
      {enterprise.is_public_listing && !enterprise.is_claimed && (
        <div className="px-6 lg:px-10 mt-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <span className="text-amber-500 text-xl shrink-0 mt-0.5">🟡</span>
              <div>
                <p className="text-sm font-medium text-amber-800">Fiche non revendiquée</p>
                <p className="text-xs text-amber-700 font-light mt-0.5 leading-relaxed">
                  Ces informations sont issues de sources publiques et peuvent être incomplètes ou obsolètes.
                </p>
              </div>
            </div>
            <button onClick={handleOpenClaim}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-light px-4 py-2.5 transition active:scale-95">
              👉 Revendiquer cette fiche
            </button>
          </div>
        </div>
      )}

      {/* ── Main layout ── */}
      <div className="pb-24 lg:pb-16 bg-white min-h-screen">

        {/* Cover — pleine largeur */}
        <div className="h-52 sm:h-64 lg:h-80 overflow-hidden bg-[#eef5f1]">
          {coverPhoto ? (
            <img
              src={coverPhoto}
              alt={`${enterprise.name} — photo de couverture`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => openPopup(coverPhoto)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#eef5f1] to-[#d4e6de]" />
          )}
        </div>

        {/* Bandeau vert — breadcrumb */}
        <div className="bg-[#132A24] py-2.5 px-6 lg:px-10">
          <div className="flex items-center gap-1.5 text-xs font-light text-white/60 flex-wrap">
            <Link to="/" className="hover:text-white hover:underline underline-offset-2 transition-colors">Accueil</Link>
            {jobSlug && enterprise.job?.name && (
              <>
                <span className="text-white/30">/</span>
                <Link to={`/professionnels/${jobSlug}`} className="hover:text-white hover:underline underline-offset-2 transition-colors">{enterprise.job.name}</Link>
              </>
            )}
            {enterprise.city && (
              <>
                <span className="text-white/30">/</span>
                <Link
                  to={`/professionnels/ville/${enterprise.city.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
                  className="hover:text-white hover:underline underline-offset-2 transition-colors"
                >
                  {enterprise.city}
                </Link>
              </>
            )}
            <span className="text-white/30">/</span>
            <span className="text-white">{enterprise.name}</span>
          </div>
        </div>

        {/* Contenu centré — bannière et breadcrumb restent en pleine largeur */}
        <div className="max-w-5xl mx-auto w-full">

        {/* Avatar centré — pointer-events-none sur le wrapper pour ne pas bloquer le breadcrumb */}
        <div className="flex justify-center -mt-12 relative z-10 pointer-events-none">
          {enterprise.logo ? (
            <img src={enterprise.logo} alt={`Logo ${enterprise.name}`}
              className="h-24 w-24 lg:h-32 lg:w-32 rounded-full border-4 border-white object-cover shadow-lg pointer-events-auto"
            />
          ) : (
            <div className="h-24 w-24 lg:h-32 lg:w-32 rounded-full border-4 border-white bg-[#f5f7f6] shadow-lg flex items-center justify-center pointer-events-auto">
              <span className="text-[#132A24] text-3xl lg:text-4xl font-light">
                {enterprise.name?.[0]?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Identity */}
        <div className="px-6 lg:px-10 pt-16 lg:pt-20 text-center">
          {enterprise.isPremium && (
            <span className="inline-flex mb-2 px-3 py-1 rounded-full text-xs font-light bg-[#132A24] text-white">
              ★ Premium
            </span>
          )}
          <h1 className="text-2xl lg:text-3xl font-semibold text-[#132A24] tracking-tight leading-tight">
            {enterprise.name}
          </h1>
          {enterprise.job?.name && (
            <Link to={`/professionnels/${jobSlug}`}
              className="block text-sm lg:text-base text-[#879f98] font-light mt-1 hover:text-[#132A24] transition-colors">
              {enterprise.job.name}
            </Link>
          )}

          {averageRating > 0 && (
            <div className="flex items-center justify-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <FaStar key={i} className={`text-sm ${i <= Math.round(averageRating) ? "text-amber-400" : "text-gray-200"}`} />
              ))}
              <span className="text-sm font-semibold text-[#132A24] ml-1">{averageRating.toFixed(1)}</span>
              <span className="text-sm text-[#879f98]">({totalReviews} avis)</span>
            </div>
          )}

          {formattedAddress && (
            <div className="flex items-center justify-center gap-1.5 mt-1.5 text-sm text-[#879f98]">
              <FiMapPin className="text-xs flex-shrink-0" />
              <span>{formattedAddress}</span>
            </div>
          )}

          {/* CTAs */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {enterprise.isPremium && (
              <button onClick={() => handleOpenBooking(null)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#132A24] text-sm font-medium text-white hover:bg-[#1b3b33] transition active:scale-[0.98]">
                <FiCalendar />
                Réserver
              </button>
            )}
            <button onClick={handleOpenMsg}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition active:scale-[0.98] ${
                enterprise.isPremium
                  ? "border border-[#132A24]/20 bg-[#eef5f1] text-[#132A24] hover:bg-[#132A24] hover:text-white"
                  : "bg-[#132A24] text-white hover:bg-[#1b3b33]"
              }`}>
              <FiMail />
              Message
            </button>
            <button onClick={handleShare} title="Partager"
              className="flex items-center gap-2 px-4 py-3 border border-black/5 bg-[#f5f7f6] hover:bg-[#eef5f1] text-[#879f98] hover:text-[#132A24] rounded-xl text-sm font-light transition">
              {shareStatus === "success" ? <FiCheck className="text-[#132A24]" /> : <FiShare2 />}
              {shareStatus === "success" ? "Copié !" : "Partager"}
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="px-4 lg:px-8 mt-8 lg:mt-10">
          <div className="flex border-b border-black/5 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-none whitespace-nowrap px-4 lg:px-8 py-3 text-sm transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "border-[#132A24] text-[#132A24] font-medium"
                    : "border-transparent text-[#879f98] font-light hover:text-[#132A24]"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="px-4 lg:px-8 py-6 lg:py-10">

          {/* ── À propos ── */}
          {activeTab === "about" && (
            <div className="lg:grid lg:grid-cols-[1fr_280px] gap-10">

              {/* Main column */}
              <div className="space-y-6 min-w-0">
                {enterprise.description ? (
                  <div className="prose max-w-none prose-p:text-[#4b615a] prose-p:font-light prose-headings:text-[#132A24] prose-headings:font-light prose-a:text-[#4b8a74] text-[#4b615a] font-light leading-relaxed">
                    <ReactMarkdown>{enterprise.description}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm text-[#879f98] font-light text-center py-8">Aucune description disponible.</p>
                )}

                {/* Contact + extras inline sur mobile uniquement */}
                <div className="lg:hidden space-y-4 pt-2">
                  <SidebarContact />
                  <SidebarMap />
                  <SidebarExtras />
                </div>
              </div>

              {/* Sidebar — desktop uniquement */}
              <aside className="hidden lg:flex flex-col gap-4">
                <SidebarContact />
                <SidebarMap />
                <SidebarExtras />
              </aside>
            </div>
          )}

          {/* ── Services ── */}
          {activeTab === "services" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[#132A24]">Services</h2>
                {enterprise.isPremium && (
                  <button onClick={() => handleOpenBooking(null)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-[#132A24]/15 text-[#132A24] text-sm font-light rounded-xl hover:bg-[#eef5f1] transition-colors">
                    <FiCalendar className="text-sm" />
                    Choisir un créneau
                  </button>
                )}
              </div>

              {/* Mobile : liste compacte */}
              <div className="lg:hidden">
                {enterprise.offers?.length > 0 ? (
                  <div className="divide-y divide-black/5">
                    {enterprise.offers.map((offer) => (
                      <div key={offer.id || offer.name} className="flex items-center justify-between py-4">
                        <div className="flex-1 min-w-0 pr-3">
                          <p className="text-sm font-light text-[#132A24] leading-snug">{offer.name}</p>
                          {offer.duration && (
                            <p className="text-xs text-[#879f98] font-light mt-0.5">{formatDuration(offer.duration)}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2.5 flex-shrink-0">
                          <span className="text-sm font-semibold text-[#132A24]">
                            {offer.price ? `${offer.price} €` : "Sur devis"}
                          </span>
                          {enterprise.isPremium && (
                            <button onClick={() => handleOpenBooking(offer.id)}
                              className="px-3 py-1.5 rounded-lg bg-[#eef5f1] text-xs font-light text-[#132A24] border border-[#132A24]/10 active:scale-95 transition">
                              Réserver
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-black/5 bg-[#f5f7f6] p-10 text-center text-[#879f98] text-sm font-light">
                    Aucune prestation disponible pour le moment.
                  </div>
                )}
              </div>

              {/* Desktop : cartes */}
              <div className="hidden lg:block">
                <OfferList
                  offers={enterprise.offers}
                  onBook={enterprise.isPremium ? (offer) => handleOpenBooking(offer.id) : undefined}
                />
              </div>
            </div>
          )}

          {/* ── Avis ── */}
          {activeTab === "reviews" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-lg font-semibold text-[#132A24]">Avis clients</h2>
                {totalReviews > 0 && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-[#eef5f1] border border-[#132A24]/10 rounded-full text-sm text-[#132A24] font-light">
                    <FaStar className="text-amber-400 text-xs" />
                    {totalReviews} avis vérifiés
                  </span>
                )}
              </div>
              <CommentList offers={enterprise.offers} />
            </div>
          )}

          {/* ── Recommandations ── */}
          {activeTab === "recommendations" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-lg font-semibold text-[#132A24]">Recommandations</h2>
                {totalRecommendations > 0 && (
                  <span className="px-3 py-1 bg-[#eef5f1] border border-[#132A24]/10 rounded-full text-sm text-[#132A24] font-light">
                    {totalRecommendations} recommandation{totalRecommendations > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <RecommendationList
                recommendations={enterprise.recommendations || []}
                enterpriseSlug={enterprise.slug || enterprise.id}
                currentUser={currentUser}
                onUpdate={fetchEnterprise}
              />
            </div>
          )}

          {/* ── Photos ── */}
          {activeTab === "photos" && (
            <div>
              <h2 className="text-lg font-semibold text-[#132A24] mb-5">Photos</h2>
              {galleryPhotos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {galleryPhotos.map((photo, i) => (
                    <div key={i} className="aspect-square overflow-hidden rounded-xl cursor-pointer border border-black/5 group"
                      onClick={() => openPopup(photo)}>
                      <img src={photo} alt={`${enterprise.name} — photo ${i + 2}`} loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#879f98] font-light text-center py-12">Aucune photo disponible.</p>
              )}
            </div>
          )}

        </div>

        </div>{/* fin max-w-5xl */}
      </div>

      {/* ── Modals ── */}

      {isPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={closePopup}>
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <img src={selectedPhoto} alt="Galerie" className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl" />
            <button onClick={closePopup}
              className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white border border-black/5 text-[#132A24] shadow-lg hover:bg-[#f5f7f6] transition text-xl font-light">
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

      {authPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5 text-center">
            <div className="text-4xl">✉️</div>
            <h2 className="text-base font-light text-[#132A24]">Contactez {enterprise.name}</h2>
            <p className="text-sm text-[#879f98] font-light leading-relaxed">
              Connectez-vous ou créez un compte pour envoyer un message et suivre la conversation.
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
                </div>
                <p className="text-xs text-[#879f98] font-light leading-relaxed">
                  En revendiquant, vous confirmez être le représentant légal de <strong className="text-[#132A24] font-normal">{enterprise.name}</strong>.
                </p>
                <button onClick={handleInitiateClaim} disabled={claimSending}
                  className="w-full rounded-xl bg-[#132A24] py-3 text-sm font-light text-white hover:bg-[#1b3b33] transition disabled:opacity-60">
                  {claimSending ? "Envoi du code…" : "Envoyer le code de vérification"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyClaim} className="space-y-4">
                <div className="bg-[#eef5f1] border border-[#132A24]/10 rounded-xl px-4 py-3 text-sm text-[#132A24] font-light">
                  ✉ Code envoyé à <strong>{claimMailHint || "l'email professionnel"}</strong>. Vérifiez vos spams.
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1">Code (6 chiffres)</label>
                  <input type="text" inputMode="numeric" maxLength={6} placeholder="000000" value={claimCode}
                    onChange={(e) => setClaimCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center text-2xl tracking-[0.4em] rounded-xl bg-[#f5f7f6] border border-black/5 px-3 py-3 font-light text-[#132A24] outline-none focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 transition"
                    required />
                </div>
                <button type="submit" disabled={claimSending || claimCode.length !== 6}
                  className="w-full rounded-xl bg-[#132A24] py-3 text-sm font-light text-white hover:bg-[#1b3b33] transition disabled:opacity-60">
                  {claimSending ? "Vérification…" : "Valider et revendiquer"}
                </button>
                <div className="flex items-center justify-center gap-1 text-xs text-[#879f98] font-light">
                  Code non reçu ?
                  <button type="button" onClick={handleResendClaim} disabled={claimSending}
                    className="underline underline-offset-2 hover:text-[#132A24] transition">
                    Renvoyer
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

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
                  <h2 className="text-base font-light text-[#132A24]">Message à {enterprise.name}</h2>
                  <button onClick={() => setMsgOpen(false)} className="text-[#879f98] hover:text-[#132A24] text-xl leading-none transition">×</button>
                </div>
                {currentUser?.isLogged ? (
                  <div className="flex items-center gap-2 bg-[#eef5f1] rounded-xl px-3 py-2.5">
                    <span className="text-[#132A24] text-sm">✓</span>
                    <p className="text-xs font-light text-[#132A24]">Connecté en tant que <strong className="font-medium">{currentUser.username}</strong></p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-[#f5f7f6] rounded-xl px-3 py-2.5">
                    <span className="text-[#879f98] text-sm">ℹ</span>
                    <p className="text-xs font-light text-[#879f98]">Sans compte, l'entreprise vous répondra par email.</p>
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="space-y-3">
                  {!currentUser?.isLogged && [
                    { label: "Votre nom *",        key: "sender_name",  type: "text",  placeholder: "Jean Dupont"       },
                    { label: "Votre email *",       key: "sender_email", type: "email", placeholder: "jean@exemple.fr"   },
                    { label: "Téléphone (optionnel)", key: "sender_phone", type: "tel", placeholder: "06 12 34 56 78"    },
                  ].map(({ label, key, type, placeholder }) => (
                    <div key={key}>
                      <label className="block text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1">{label}</label>
                      <input type={type} placeholder={placeholder} required={!label.includes("optionnel")}
                        value={msgForm[key]} onChange={(e) => setMsgForm((p) => ({ ...p, [key]: e.target.value }))}
                        className="w-full rounded-xl bg-[#f5f7f6] border border-black/5 px-3 py-2 text-sm font-light text-[#132A24] placeholder:text-[#879f98] outline-none focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 transition" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-1">Message *</label>
                    <textarea required rows={5} placeholder="Décrivez votre besoin…"
                      value={msgForm.content} onChange={(e) => setMsgForm((p) => ({ ...p, content: e.target.value }))}
                      className="w-full rounded-xl bg-[#f5f7f6] border border-black/5 px-3 py-2 text-sm font-light text-[#132A24] placeholder:text-[#879f98] outline-none focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 transition resize-none" />
                  </div>
                  <button type="submit" disabled={msgSending}
                    className="w-full rounded-xl bg-[#132A24] py-3 text-sm font-light text-white hover:bg-[#1b3b33] transition disabled:opacity-60">
                    {msgSending ? "Envoi…" : "Envoyer le message"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Sticky CTA mobile */}
      {enterprise.isPremium && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-sm border-t border-black/5 px-4 py-3 safe-area-pb">
          <button onClick={() => handleOpenBooking(null)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#132A24] py-3.5 text-sm font-light text-white hover:bg-[#1b3b33] transition-colors">
            <FiCalendar className="text-base" />
            Réserver avec {enterprise.name}
          </button>
        </div>
      )}
    </>
  );
};

export default EnterpriseShow;
