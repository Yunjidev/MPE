import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import { userAtom } from "../../store/user";
import { AnimatePresence, motion } from "framer-motion";
import { authSignOut } from "../../services/auth-fetch";
import { getData, putData } from "../../services/data-fetch";
import { toast } from "react-toastify";
import logo from "../../../public/assets/img/logo.png";

const NAV_LINKS = [
  { label: "Accueil", to: "/" },
  { label: "Recherche", to: "/searchentreprise" },
  { label: "Tarifs", to: "/pricing" },
  { label: "FAQ", to: "/FAQ" },
  { label: "Contact", to: "/contact" },
];

const DropdownItem = ({ to, icon, children, onClick, danger }) => {
  const base = `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-light tracking-tight transition-colors w-full text-left`;
  const style = danger
    ? `${base} text-red-500 hover:bg-red-50`
    : `${base} text-[#4b615a] hover:bg-[#eef5f1] hover:text-[#132A24]`;

  if (onClick) return (
    <button onClick={onClick} className={style}>
      <span className="w-4 h-4 flex-shrink-0 text-current opacity-70">{icon}</span>
      {children}
    </button>
  );
  return (
    <Link to={to} className={style}>
      <span className="w-4 h-4 flex-shrink-0 text-current opacity-70">{icon}</span>
      {children}
    </Link>
  );
};

const NOTIF_ICONS = {
  message_received: "✉️",
  message_reply:    "💬",
  reservation_new:  "📅",
  reservation_updated: "🔔",
};
const fmtRelative = (d) => {
  if (!d) return "";
  const diff = Math.floor((Date.now() - new Date(d)) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff/60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff/3600)} h`;
  return new Date(d).toLocaleDateString("fr-FR", { day:"2-digit", month:"short" });
};

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotif, setUnreadNotif] = useState(0);
  const dropdownRef = useRef(null);
  const notifRef    = useRef(null);
  const [user] = useAtom(userAtom);
  const resetUser = useResetAtom(userAtom);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    if (!user?.isLogged) return;
    try {
      const res = await getData("user/notifications");
      setNotifications(res.notifications || []);
      setUnreadNotif(res.unread || 0);
    } catch { /* silencieux */ }
  }, [user?.isLogged]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    const onFocus = () => fetchNotifications();
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(interval); window.removeEventListener("focus", onFocus); };
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setIsNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
    setIsNotifOpen(false);
  }, [location.pathname]);

  const handleOpenNotif = async () => {
    setIsNotifOpen((p) => !p);
    setIsDropdownOpen(false);
    if (!isNotifOpen && unreadNotif > 0) {
      try {
        await putData("user/notifications/read-all", {});
        setUnreadNotif(0);
        setNotifications((p) => p.map((n) => ({ ...n, is_read: true })));
      } catch { /* silencieux */ }
    }
  };

  const handleSignOut = async () => {
    try {
      await authSignOut("signout");
    } catch {
      // ignore
    } finally {
      resetUser();
      toast.info("Vous êtes maintenant déconnecté !");
      navigate("/signin");
    }
  };

  const avatarUrl = user?.avatar || null;
  const displayName = user?.firstname && user?.lastname
    ? `${user.firstname} ${user.lastname}`
    : user?.username || "Utilisateur";
  const firstEnterprise = user?.enterprises?.[0];

  return (
    <header className="sticky top-0 z-50 bg-[#f5f7f6]/90 backdrop-blur-md border-b border-black/5 transition-all duration-500">
      <div className="w-full px-4 sm:px-8 lg:px-16 2xl:px-24 h-20 sm:h-24 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 sm:gap-4 group">
          <img
            src={logo}
            alt=""
            className="h-11 sm:h-14 object-contain transition-all duration-500 group-hover:scale-110"
          />
          <span className="hidden lg:block font-light text-xl tracking-tight text-[#132A24]">
            Proxilio
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-base text-[#546b64] font-light">
          {NAV_LINKS.map(({ label, to }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`relative tracking-tight transition-colors
                  after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-[1px] after:bg-[#132a24] after:transition-all after:duration-300
                  ${isActive
                    ? "text-[#132a24] after:w-full"
                    : "hover:text-[#132a24] after:w-0 hover:after:w-full"
                  }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Cloche notifications */}
          {user.isLogged && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleOpenNotif}
                className="relative p-2 rounded-xl border border-black/5 bg-white hover:bg-[#eef5f1] transition-colors"
                aria-label="Notifications"
              >
                <svg className="w-5 h-5 text-[#132A24]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {unreadNotif > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-medium">
                    {unreadNotif > 99 ? "99+" : unreadNotif}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-black/5 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between">
                    <p className="text-sm font-light text-[#132A24]">Notifications</p>
                    <button onClick={() => setIsNotifOpen(false)} className="text-[#879f98] hover:text-[#132A24] text-lg leading-none">×</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto overscroll-contain">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-[#879f98] font-light">Aucune notification</div>
                    ) : (
                      notifications.map((n) => (
                        <Link
                          key={n.id}
                          to={n.link || "#"}
                          onClick={() => setIsNotifOpen(false)}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-[#f5f7f6] transition-colors border-b border-black/5 last:border-0 ${!n.is_read ? "bg-[#f5f7f6]" : ""}`}
                        >
                          <span className="text-lg shrink-0 mt-0.5">{NOTIF_ICONS[n.type] || "🔔"}</span>
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm leading-tight ${!n.is_read ? "font-medium text-[#132A24]" : "font-light text-[#132A24]"}`}>{n.title}</p>
                            {n.content && <p className="text-xs text-[#879f98] font-light mt-0.5 line-clamp-2">{n.content}</p>}
                            <p className="text-[10px] text-[#879f98]/60 font-light mt-1">{fmtRelative(n.createdAt)}</p>
                          </div>
                          {!n.is_read && <span className="shrink-0 w-2 h-2 rounded-full bg-[#132A24] mt-1.5" />}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {user.isLogged ? (
            <div className="relative" ref={dropdownRef}>

              {/* Trigger */}
              <button
                onClick={() => setIsDropdownOpen((p) => !p)}
                className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full border border-black/5 bg-white hover:border-[#132A24]/15 hover:shadow-sm transition-all duration-200"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#eef5f1] flex items-center justify-center flex-shrink-0">
                    <span className="text-[#132A24] text-xs font-light">{displayName[0]?.toUpperCase()}</span>
                  </div>
                )}
                <span className="hidden sm:block text-sm font-light text-[#132A24] tracking-tight max-w-[120px] truncate">
                  {displayName}
                </span>
                <svg
                  className={`w-3.5 h-3.5 text-[#879f98] transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-3 w-64 bg-white border border-black/5 rounded-2xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)] overflow-hidden"
                  >

                    {/* User info */}
                    <div className="p-4 flex items-center gap-3 bg-[#f5f7f6]/60">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-black/5 flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#eef5f1] border border-[#132A24]/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-[#132A24] text-base font-light">{displayName[0]?.toUpperCase()}</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-light text-[#132A24] tracking-tight truncate">{displayName}</p>
                        {user.email && (
                          <p className="text-xs text-[#879f98] font-light truncate">{user.email}</p>
                        )}
                        {(user.isAdmin || user.isEntrepreneur) && (
                          <span className="inline-block mt-1 text-[10px] font-light px-2 py-0.5 rounded-full bg-[#eef5f1] text-[#132A24] border border-[#132A24]/10">
                            {user.isAdmin ? "Administrateur" : "Professionnel"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Nav links */}
                    <div className="p-2 border-t border-black/5">
                      <DropdownItem
                        to="/dashboard/user-db"
                        icon={
                          <svg fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                          </svg>
                        }
                      >
                        Mon Dashboard
                      </DropdownItem>

                      {user.isEntrepreneur && firstEnterprise && (
                        <DropdownItem
                          to={`/dashboard/enterprise/${firstEnterprise.slug || firstEnterprise.id}/dashboard`}
                          icon={
                            <svg fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                            </svg>
                          }
                        >
                          Mon Entreprise
                        </DropdownItem>
                      )}

                      {user.isAdmin && (
                        <DropdownItem
                          to="/dashboard/admin-db"
                          icon={
                            <svg fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          }
                        >
                          Administration
                        </DropdownItem>
                      )}
                    </div>

                    {/* Sign out */}
                    <div className="p-2 border-t border-black/5">
                      <DropdownItem
                        onClick={handleSignOut}
                        danger
                        icon={
                          <svg fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                          </svg>
                        }
                      >
                        Se déconnecter
                      </DropdownItem>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                to="/signin"
                className="hidden sm:block text-sm font-light text-[#132A24]/70 hover:text-[#132A24] transition-colors tracking-tight"
              >
                Connexion
              </Link>
              <Link
                to="/signup"
                className="group bg-[#132A24] text-white px-5 py-2.5 rounded-full text-sm flex items-center gap-2 hover:bg-[#1b3b33] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-light tracking-tight"
              >
                S'inscrire
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1.5 text-[#132A24]"
            onClick={() => setIsMobileMenuOpen((p) => !p)}
          >
            {isMobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[#f5f7f6]/95 backdrop-blur-md border-t border-black/5 overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-3 py-2.5 rounded-xl text-sm font-light tracking-tight transition-colors ${
                    location.pathname === to
                      ? "text-[#132A24] bg-[#eef5f1]"
                      : "text-[#546b64] hover:text-[#132A24] hover:bg-[#eef5f1]"
                  }`}
                >
                  {label}
                </Link>
              ))}

              {user.isLogged ? (
                <div className="mt-2 pt-2 border-t border-black/5 flex flex-col gap-1">
                  <Link to="/dashboard/user-db" className="px-3 py-2.5 rounded-xl text-sm font-light text-[#132A24] hover:bg-[#eef5f1] transition-colors">
                    Mon Dashboard
                  </Link>
                  {user.isEntrepreneur && firstEnterprise && (
                    <Link to={`/dashboard/enterprise/${firstEnterprise.slug || firstEnterprise.id}/dashboard`} className="px-3 py-2.5 rounded-xl text-sm font-light text-[#132A24] hover:bg-[#eef5f1] transition-colors">
                      Mon Entreprise
                    </Link>
                  )}
                  {user.isAdmin && (
                    <Link to="/dashboard/admin-db" className="px-3 py-2.5 rounded-xl text-sm font-light text-[#132A24] hover:bg-[#eef5f1] transition-colors">
                      Administration
                    </Link>
                  )}
                  <button onClick={handleSignOut} className="px-3 py-2.5 rounded-xl text-sm font-light text-red-500 hover:bg-red-50 transition-colors text-left">
                    Se déconnecter
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 mt-2 pt-2 border-t border-black/5">
                  <Link
                    to="/signin"
                    className="flex-1 text-center py-2 text-sm text-[#132A24] border border-[#132A24]/20 rounded-full hover:bg-[#eef5f1] transition-colors font-light"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/signup"
                    className="flex-1 text-center py-2 text-sm bg-[#132A24] text-white rounded-full hover:bg-[#1b3b33] transition-colors font-light"
                  >
                    S'inscrire
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
