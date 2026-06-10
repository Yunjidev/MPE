import { atom } from "jotai";

export const userUnreadAtom        = atom(0);
export const enterpriseUnreadAtom  = atom({}); // { slug: count }
export const navbarNotifsAtom      = atom({ notifications: [], unread: 0 });
