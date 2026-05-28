import { Helmet } from "react-helmet-async";
import PricingPage from '../../components/pricing_page/pricing_page';

const PricingPages = () => {
  return (
    <>
      <Helmet>
        <title>Tarifs Premium — Proxilio</title>
        <meta name="description" content="Passez votre entreprise en Premium sur Proxilio. Gagnez en visibilité, activez les réservations en ligne et accédez aux statistiques avancées. Offres mensuelle et annuelle." />
        <link rel="canonical" href="https://www.proxilio.fr/pricing" />
      </Helmet>
      <PricingPage />
    </>
  );
};

export default PricingPages;
