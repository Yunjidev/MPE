/* eslint-disable react/no-unescaped-entities */
import { Link } from 'react-router-dom';
import { BsFacebook, BsTwitterX, BsLinkedin } from 'react-icons/bs';
import Logo from '/assets/img/logo.png';

const Footer = () => {
  return (
    <footer className="bg-[#0B1713] text-white w-full relative overflow-hidden">
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      {/* Radial fade at center */}
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_40%,transparent_100%)] bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-60" />
      <div className="px-4 sm:px-8 lg:px-16 2xl:px-24 pt-16 pb-8 relative z-10">

        {/* Top section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-16 pb-12 border-b border-white/10">

          {/* Brand */}
          <div className="lg:col-span-1 flex flex-col items-center gap-5">
            <img src={Logo} className="h-20 object-contain" alt="Logo Proxilio" />
            <p className="text-[#879f98] text-sm leading-relaxed font-light tracking-tight text-center max-w-xs">
              La plateforme qui connecte les particuliers aux meilleurs professionnels locaux.
            </p>
          </div>

          {/* Nav columns */}
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8 lg:pl-8">
            <div className="flex flex-col items-center">
              <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-5">Plateforme</p>
              <div className="flex flex-col items-center gap-3">
                <Link to="/searchentreprise" className="text-white/60 hover:text-white text-sm font-light transition-colors tracking-tight">Rechercher un pro</Link>
                <Link to="/FAQ" className="text-white/60 hover:text-white text-sm font-light transition-colors tracking-tight">FAQ</Link>
                <Link to="/" className="text-white/60 hover:text-white text-sm font-light transition-colors tracking-tight">Accueil</Link>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-5">Entreprise</p>
              <div className="flex flex-col items-center gap-3">
                <Link to="/pricing" className="text-white/60 hover:text-white text-sm font-light transition-colors tracking-tight">Tarifs</Link>
                <Link to="/contact" className="text-white/60 hover:text-white text-sm font-light transition-colors tracking-tight">Contact</Link>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-5">Légal</p>
              <div className="flex flex-col items-center gap-3">
                <Link to="/usage-policies" className="text-white/60 hover:text-white text-sm font-light transition-colors tracking-tight">CGU</Link>
                <Link to="/condifentiality-policies" className="text-white/60 hover:text-white text-sm font-light transition-colors tracking-tight">Confidentialité</Link>
                <Link to="/legal-notices" className="text-white/60 hover:text-white text-sm font-light transition-colors tracking-tight">Mentions légales</Link>
                <Link to="/cookie-policies" className="text-white/60 hover:text-white text-sm font-light transition-colors tracking-tight">Cookies</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col items-center gap-4">
          <span className="text-[#879f98] text-xs font-light tracking-tight">
            © {new Date().getFullYear()} Proxilio. Tous droits réservés.
          </span>
            <div className="flex items-center gap-4 mt-1">
              <a href="https://www.facebook.com/profile.php?id=61590573535992" target="_blank" rel="noopener noreferrer" className="text-[#879f98] hover:text-white transition-colors duration-200" aria-label="Facebook">
                <BsFacebook size={17} />
              </a>
              <a href="https://x.com/Proxilioapp" target="_blank" rel="noopener noreferrer" className="text-[#879f98] hover:text-white transition-colors duration-200" aria-label="X / Twitter">
                <BsTwitterX size={17} />
              </a>
              <a href="https://www.linkedin.com/company/proxilio-pro-et-particulier/" target="_blank" rel="noopener noreferrer" className="text-[#879f98] hover:text-white transition-colors duration-200" aria-label="LinkedIn">
                <BsLinkedin size={17} />
              </a>
            </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
