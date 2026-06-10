/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import { useAtom } from "jotai";
import { userAtom } from "../../store/user";
import { enterprisesAtom } from "../../store/enterprises";
import { userUnreadAtom, enterpriseUnreadAtom } from "../../store/messaging";
import UserSideBar from "./UserSideBar";
import EnterpriseSideBar from "./EnterpriseSideBar";
import AdminSideBar from "./AdminSideBar";
import HamburgerIcon from "../Utils/Svg/HamburgerIcon";
import { getData } from "../../services/data-fetch";

const linkstyle =
  "flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#eef5f1] transition text-[#132A24] font-light text-sm";
const iconstyle = "w-4 h-4 text-[#879f98]";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user] = useAtom(userAtom);
  const [enterprisesRaw] = useAtom(enterprisesAtom);
  const [userUnread, setUserUnread] = useAtom(userUnreadAtom);
  const [enterpriseUnread, setEnterpriseUnread] = useAtom(enterpriseUnreadAtom);

  /* Fetch unread counts + polling toutes les 30s */
  useEffect(() => {
    if (!user?.isLogged) return;

    const fetch = () => {
      getData("user/messages/unread-count").then((r) => setUserUnread(r?.unread || 0)).catch(() => {});
      if (Array.isArray(enterprisesRaw)) {
        enterprisesRaw.forEach((e) => {
          const slug = e.slug || e.id;
          getData(`enterprise/${slug}/messages/unread-count`).then((r) => {
            setEnterpriseUnread((p) => ({ ...p, [slug]: r?.unread || 0 }));
          }).catch(() => {});
        });
      }
    };

    fetch();
    const interval = setInterval(fetch, 30000);
    const onFocus = () => fetch();
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(interval); window.removeEventListener("focus", onFocus); };
  }, [user?.isLogged, enterprisesRaw]);

  useEffect(() => {
    const onDown = (e) => {
      if (window.innerWidth >= 1024) return;
      const aside = document.getElementById("sidebar");
      if (isOpen && aside && !aside.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [isOpen]);

  const hasAnyEnterprise = useMemo(() => {
    if (Array.isArray(enterprisesRaw)) return enterprisesRaw.length > 0;
    if (Array.isArray(enterprisesRaw?.data)) return enterprisesRaw.data.length > 0;
    if (Array.isArray(enterprisesRaw?.results)) return enterprisesRaw.results.length > 0;
    return false;
  }, [enterprisesRaw]);

  const showEnterpriseSection = (user?.isEntrepreneur === true) || hasAnyEnterprise;

  return (
    <>
      {/* Bouton hamburger mobile */}
      <button
        type="button"
        className="fixed top-24 left-6 z-40 lg:hidden inline-flex items-center p-2 rounded-lg border border-black/5 bg-white text-[#879f98] hover:bg-[#eef5f1] hover:text-[#132A24] active:scale-95 shadow-sm transition"
        onClick={() => setIsOpen((s) => !s)}
        aria-expanded={isOpen}
        aria-controls="sidebar"
      >
        <span className="sr-only">Ouvrir la navigation</span>
        <HamburgerIcon />
      </button>

      {/* Overlay mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`fixed lg:sticky z-40 top-20 sm:top-24 left-0 lg:top-28 lg:mt-8 lg:left-2 w-[280px] lg:w-[260px]
        h-[calc(100dvh-5rem)] sm:h-[calc(100dvh-6rem)] lg:h-[calc(100vh-6rem)] px-2 transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="h-full rounded-2xl border border-black/5 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="p-3 pb-6 space-y-1 overflow-y-auto overscroll-contain h-full" style={{ WebkitOverflowScrolling: "touch" }}>
            <section className="space-y-1">
              <div className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-widest text-[#879f98] font-light">Utilisateur</div>
              <UserSideBar user={user} iconstyle={iconstyle} linkstyle={linkstyle} unreadMessages={userUnread}
                onClick={() => { if (window.innerWidth < 1024) setIsOpen(false); }} />
            </section>

            {showEnterpriseSection && (
              <section className="space-y-1">
                <div className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-widest text-[#879f98] font-light">Entreprise</div>
                <EnterpriseSideBar iconStyle={iconstyle} linkstyle={linkstyle} unreadCounts={enterpriseUnread}
                  onClick={() => { if (window.innerWidth < 1024) setIsOpen(false); }} />
              </section>
            )}

            {user?.isAdmin && (
              <section className="space-y-1">
                <div className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-widest text-[#879f98] font-light">Administration</div>
                <AdminSideBar user={user} iconstyle={iconstyle} linkstyle={linkstyle}
                  onClick={() => { if (window.innerWidth < 1024) setIsOpen(false); }} />
              </section>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
