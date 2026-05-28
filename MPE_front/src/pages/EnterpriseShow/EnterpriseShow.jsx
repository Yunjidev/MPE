import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  FiShare2, FiCheck, FiMapPin, FiPhone, FiMail, FiGlobe, FiCalendar,
} from "react-icons/fi";
import { FaStar, FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import ReactMarkdown from "react-markdown";
import { getData } from "../../services/data-fetch";
import OfferList from "../../components/ShowEnterprise/OfferList";
import CommentList from "../../components/ShowEnterprise/CommentList";
import PremiumReservationModal from "../../components/ShowEnterprise/PremiumReservationModal";

const EnterpriseShow = () => {
  const { id } = useParams();
  const [enterprise, setEnterprise] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [prefillOfferId, setPrefillOfferId] = useState(null);
  const [shareStatus, setShareStatus] = useState(null);
  const [shareMessage, setShareMessage] = useState("");

  const fetchEnterprise = useCallback(async () => {
    try {
      const data = await getData(`enterprise/${id}`);
      setEnterprise(data);
    } catch (error) {
      console.error("Error fetching enterprise:", error);
    }
  }, [id]);

  useEffect(() => { fetchEnterprise(); }, [fetchEnterprise]);

  const handleBookingSuccess = useCallback(() => { fetchEnterprise(); }, [fetchEnterprise]);

  const openPopup = (photo) => { setSelectedPhoto(photo); setIsPopupOpen(true); };
  const closePopup = () => { setIsPopupOpen(false); setSelectedPhoto(null); };

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined"
      ? window.location.href
      : `${import.meta.env.VITE_BASE_URL || ""}/enterprise/${id}`;
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
    enterprise.phone && { icon: <FiPhone />, label: enterprise.phone, href: `tel:${enterprise.phone}` },
    enterprise.mail  && { icon: <FiMail />,  label: enterprise.mail,  href: `mailto:${enterprise.mail}` },
  ].filter(Boolean);

  return (
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
                    <a
                      key={i}
                      href={item.href}
                      className="flex items-start gap-3 text-sm text-[#879f98] hover:text-[#132A24] transition-colors group"
                    >
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
              </div>
              {enterprise.phone && (
                <a
                  href={`tel:${enterprise.phone}`}
                  className="mt-5 flex w-full items-center justify-center gap-2 px-4 py-2.5 bg-[#132A24] hover:bg-[#1b3b33] text-white text-sm font-light rounded-xl transition-colors"
                >
                  <FiPhone />
                  Appeler maintenant
                </a>
              )}
              {!enterprise.phone && enterprise.mail && (
                <a
                  href={`mailto:${enterprise.mail}`}
                  className="mt-5 flex w-full items-center justify-center gap-2 px-4 py-2.5 bg-[#132A24] hover:bg-[#1b3b33] text-white text-sm font-light rounded-xl transition-colors"
                >
                  <FiMail />
                  Envoyer un email
                </a>
              )}
            </div>

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
        enterpriseId={id}
        isOpen={isBookingOpen}
        onClose={() => { setIsBookingOpen(false); setPrefillOfferId(null); }}
        onBooked={handleBookingSuccess}
        offers={enterprise.offers}
        initialOfferId={prefillOfferId}
      />
    </div>
  );
};

const SectionLabel = ({ children }) => (
  <p className="text-xs font-light uppercase tracking-widest text-[#879f98] mb-1">{children}</p>
);

export default EnterpriseShow;
