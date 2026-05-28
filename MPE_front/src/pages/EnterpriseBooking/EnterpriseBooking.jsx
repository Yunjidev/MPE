import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAtom } from "jotai";
import { userAtom } from "../../store/user";
import { getData } from "../../services/data-fetch";
import PremiumReservationModal from "../../components/ShowEnterprise/PremiumReservationModal";

export default function EnterpriseBooking() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [user] = useAtom(userAtom);
  const [enterprise, setEnterprise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    getData(`enterprise/${slug}`)
      .then((data) => { setEnterprise(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [slug]);

  useEffect(() => {
    if (enterprise?.isPremium && enterprise?.isValidate) {
      setIsBookingOpen(true);
    }
  }, [enterprise]);

  const handleClose = () => {
    setIsBookingOpen(false);
    navigate(`/enterprise/${slug}`);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-[#879f98] text-sm font-light">
        Chargement…
      </div>
    );
  }

  if (!enterprise || !enterprise.isPremium || !enterprise.isValidate) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center gap-4">
        <p className="text-[#132A24] font-light tracking-tight">
          La réservation en ligne n&apos;est pas disponible pour ce professionnel.
        </p>
        <button
          onClick={() => navigate(`/enterprise/${slug}`)}
          className="text-sm text-[#879f98] hover:text-[#132A24] underline underline-offset-4 font-light transition-colors"
        >
          Voir la fiche
        </button>
      </div>
    );
  }

  const pageTitle = `Réserver avec ${enterprise.name} | Proxilio`;
  const pageDescription = `Prenez rendez-vous en ligne avec ${enterprise.name}${enterprise.city ? ` à ${enterprise.city}` : ""}. Choisissez votre créneau et réservez en quelques clics.`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Background card with enterprise info */}
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          {enterprise.logo && (
            <img
              src={enterprise.logo}
              alt={enterprise.name}
              className="w-20 h-20 rounded-full object-cover mx-auto mb-5 ring-1 ring-black/5"
            />
          )}
          <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-2">
            Réservation en ligne
          </p>
          <h1 className="text-2xl font-light text-[#132A24] tracking-tight mb-1">
            {enterprise.name}
          </h1>
          {enterprise.city && (
            <p className="text-sm text-[#879f98] font-light mb-6">{enterprise.city}</p>
          )}

          {user?.isLogged ? (
            <button
              onClick={() => setIsBookingOpen(true)}
              className="px-6 py-3 rounded-xl bg-[#132A24] text-white text-sm font-light tracking-tight hover:bg-[#1e3d33] transition-colors"
            >
              Choisir un créneau
            </button>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-[#879f98] font-light">
                Connectez-vous pour réserver
              </p>
              <button
                onClick={() => navigate(`/signin?redirect=/enterprise/${slug}/booking`)}
                className="px-6 py-3 rounded-xl bg-[#132A24] text-white text-sm font-light tracking-tight hover:bg-[#1e3d33] transition-colors"
              >
                Se connecter
              </button>
              <button
                onClick={() => navigate(`/signup?redirect=/enterprise/${slug}/booking`)}
                className="text-sm text-[#879f98] hover:text-[#132A24] underline underline-offset-4 font-light transition-colors"
              >
                Créer un compte gratuitement
              </button>
            </div>
          )}
        </div>
      </div>

      {isBookingOpen && (
        <PremiumReservationModal
          enterpriseId={enterprise.id}
          isOpen={isBookingOpen}
          onClose={handleClose}
          onBooked={handleClose}
          offers={enterprise.offers || []}
        />
      )}
    </>
  );
}
