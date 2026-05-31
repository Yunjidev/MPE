import { Helmet } from "react-helmet-async";
import FAQ from '../../components/FAQ/FAQ';

const FAQPage = () => {
  return (
    <>
      <Helmet>
        <title>FAQ — Questions fréquentes | Proxilio</title>
        <meta name="description" content="Trouvez les réponses à vos questions sur Proxilio : comment trouver un professionnel, réserver en ligne, déposer un avis, ou référencer votre entreprise." />
        <link rel="canonical" href="https://proxilio.fr/FAQ" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://proxilio.fr/FAQ" />
        <meta property="og:title" content="FAQ — Questions fréquentes | Proxilio" />
        <meta property="og:description" content="Trouvez les réponses à vos questions sur Proxilio." />
        <meta property="og:image" content="https://proxilio.fr/assets/img/og-default.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@Proxilioapp" />
      </Helmet>
      <FAQ />
    </>
  );
};

export default FAQPage;
