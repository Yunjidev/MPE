/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-key */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { getData, deleteData } from "../../services/data-fetch";
import { FaEdit, FaTrash, FaSearch, FaUserCircle, FaShieldAlt, FaBriefcase } from "react-icons/fa";
import Modal from "./Modal";
import EditUserForm from "./EditUserForm";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getData("admin/users");
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    const filtered = users.filter((u) => {
      const username = (u.username || "").toLowerCase();
      const firstname = (u.firstname || "").toLowerCase();
      const lastname = (u.lastname || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      return (
        username.includes(q) ||
        firstname.includes(q) ||
        lastname.includes(q) ||
        email.includes(q)
      );
    });
    setFilteredUsers(filtered);
    setPageIndex(0);
  }, [searchQuery, users]);

  const confirmDeleteUser = (user) => {
    setUserToDelete(user);
    setIsDeleteConfirmOpen(true);
  };

  const deleteUser = async () => {
    try {
      await deleteData(`admin/users/${userToDelete.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setIsDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const editUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSave = (updatedUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
    );
    setIsModalOpen(false);
  };

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const slice = filteredUsers.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  return (
    <div className="rounded-2xl">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-light text-[#132A24]">Utilisateurs</h2>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#879f98] w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Rechercher par nom, email…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 rounded-xl bg-[#f5f7f6] pl-9 pr-3 text-sm text-[#132A24] placeholder:text-[#879f98] font-light border border-black/5 focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 outline-none transition"
            />
          </div>

          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPageIndex(0); }}
            className="h-10 rounded-xl bg-[#f5f7f6] text-[#132A24] text-sm font-light border border-black/5 outline-none px-3"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>{n}/page</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards list : hauteur fixe (~10 cartes) + scroll interne */}
      <div
        className="space-y-3 overflow-y-auto pr-2 max-h-[640px]"
        /* Si parent en flex, ajoute éventuellement min-h-0 sur ses ascendants pour que le scroll prenne bien. */
      >
        {slice.map((u) => (
          <div
            key={u.id}
            className="rounded-xl border border-black/5 bg-[#f5f7f6] p-4 hover:bg-[#eef5f1] transition"
          >
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Identity */}
              <div className="sm:col-span-5 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#eef5f1] grid place-items-center text-[#879f98] overflow-hidden">
                  {u.avatar ? (
                    <img src={u.avatar} alt={u.username} className="h-full w-full object-cover" />
                  ) : (
                    <FaUserCircle className="text-2xl" />
                  )}
                </div>
                <div>
                  <div className="text-[#132A24] text-sm font-light leading-tight">
                    {u.username || "—"}
                  </div>
                  <div className="text-[#879f98] text-xs font-light">{u.email || "—"}</div>
                </div>
              </div>

              {/* Name */}
              <div className="sm:col-span-3">
                <div className="text-[#132A24] text-sm font-light">{u.firstname || "—"} {u.lastname || ""}</div>
                <div className="text-[#879f98] text-xs font-light">Nom complet</div>
              </div>

              {/* Roles */}
              <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-light border
                  ${u.isAdmin ? "bg-[#eef5f1] text-[#132A24] border-[#132A24]/15" : "bg-black/5 text-[#879f98] border-black/5"}`}>
                  <FaShieldAlt className="w-3 h-3" /> {u.isAdmin ? "Admin" : "Utilisateur"}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-light border
                  ${u.isEntrepreneur ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-black/5 text-[#879f98] border-black/5"}`}>
                  <FaBriefcase className="w-3 h-3" /> {u.isEntrepreneur ? "Entrepreneur" : "Client"}
                </span>
              </div>

              {/* Actions */}
              <div className="sm:col-span-2 flex justify-start sm:justify-end gap-2">
                <button
                  onClick={() => editUser(u)}
                  className="h-8 w-8 grid place-items-center rounded-lg text-[#879f98] hover:text-[#132A24] hover:bg-[#eef5f1] border border-black/5 transition"
                  title="Modifier l'utilisateur"
                >
                  <FaEdit size={14} />
                </button>
                <button
                  onClick={() => confirmDeleteUser(u)}
                  className="h-8 w-8 grid place-items-center rounded-lg text-red-400 hover:text-white hover:bg-red-500 border border-red-200 transition"
                  title="Supprimer l'utilisateur"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {slice.length === 0 && (
          <div className="text-center py-10 text-[#879f98] text-sm font-light">
            Aucun utilisateur trouvé.
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-[#879f98] font-light">
          {filteredUsers.length} utilisateur(s) — page {pageIndex + 1} / {pageCount}
        </span>

        <div className="flex items-center gap-2">
          {[
            { label: "Début", action: () => setPageIndex(0), disabled: pageIndex === 0 },
            { label: "«", action: () => setPageIndex((p) => Math.max(0, p - 1)), disabled: pageIndex === 0 },
            { label: "»", action: () => setPageIndex((p) => Math.min(pageCount - 1, p + 1)), disabled: pageIndex >= pageCount - 1 },
            { label: "Fin", action: () => setPageIndex(pageCount - 1), disabled: pageIndex >= pageCount - 1 },
          ].map(({ label, action, disabled }) => (
            <button
              key={label}
              onClick={action}
              disabled={disabled}
              className="h-8 px-3 rounded-lg text-xs font-light bg-[#f5f7f6] text-[#132A24] border border-black/5 disabled:opacity-40 hover:bg-[#eef5f1] transition"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Modal suppression */}
      {isDeleteConfirmOpen && (
        <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)}>
          <div className="bg-white rounded-2xl border border-black/5 p-6">
            <h3 className="text-base font-light text-[#132A24] text-center">Confirmer la suppression</h3>
            <p className="mt-2 text-center text-[#4b615a] text-sm font-light">
              Supprimer <span className="text-[#132A24]">{userToDelete?.username}</span> ? Cette action est irréversible.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <button
                onClick={deleteUser}
                className="h-9 px-4 rounded-xl text-sm font-light bg-red-50 text-red-500 border border-red-200 hover:bg-red-500 hover:text-white transition"
              >
                Supprimer
              </button>
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="h-9 px-4 rounded-xl text-sm font-light bg-[#f5f7f6] text-[#4b615a] border border-black/5 hover:bg-[#eef5f1] transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal édition */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedUser && (
          <EditUserForm
            user={selectedUser}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
          />
        )}
      </Modal>
    </div>
  );
};

export default UsersList;
