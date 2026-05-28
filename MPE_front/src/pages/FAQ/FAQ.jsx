import { Helmet } from "react-helmet-async";
import FAQ from '../../components/FAQ/FAQ';

const FAQPage = () => {
  return (
    <>
      <Helmet>
        <title>FAQ — Questions fréquentes | Proxilio</title>
        <meta name="description" content="Trouvez les réponses à vos questions sur Proxilio : comment trouver un professionnel, réserver en ligne, déposer un avis, ou référencer votre entreprise." />
        <link rel="canonical" href="https://www.proxilio.fr/FAQ" />
      </Helmet>
      <FAQ />
    </>
  );
};

export default FAQPage;
