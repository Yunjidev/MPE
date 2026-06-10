import { Helmet } from "react-helmet-async";
import PricingPage from '../../components/pricing_page/pricing_page';

const PricingPages = () => {
  return (
    <>
      <Helmet>
        <title>Tarifs Premium — Proxilio</title>
        <meta name="description" content="Passez votre entreprise en Premium sur Proxilio. Gagnez en visibilité, activez les réservations en ligne et accédez aux statistiques avancées. Offres mensuelle et annuelle." />
        <link rel="canonical" href="https://proxilio.fr/pricing" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://proxilio.fr/pricing" />
        <meta property="og:title" content="Tarifs Premium — Proxilio" />
        <meta property="og:description" content="Passez votre entreprise en Premium sur Proxilio. Gagnez en visibilité et activez les réservations en ligne." />
        <meta property="og:image" content="https://proxilio.fr/assets/img/og-default.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@Proxilioapp" />
      </Helmet>
      <PricingPage />
    </>
  );
};

export default PricingPages;
