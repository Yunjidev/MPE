/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo } from 'react';
import { getData, deleteData, postData, putData } from '../../services/data-fetch';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { AiOutlineEuro } from "react-icons/ai";
import { IoTimeOutline, IoInformationCircleOutline } from 'react-icons/io5';
import Modal from '../DashboardAdmin/Modal';
import OfferForm from './OfferForm';
import { useParams } from 'react-router-dom';

const selectCls = "rounded-xl border border-black/5 bg-[#f5f7f6] px-3 py-2 text-sm text-[#132A24] font-light focus:border-[#132A24]/30 focus:outline-none";

const SearchBar = ({ filterText, onFilterTextChange }) => (
  <input
    type="text"
    placeholder="Rechercher une offre…"
    value={filterText}
    onChange={(e) => onFilterTextChange(e.target.value)}
    className="rounded-xl border border-black/5 bg-[#f5f7f6] px-4 py-2 text-sm text-[#132A24] placeholder:text-[#879f98] font-light focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 outline-none transition w-48"
  />
);

const DurationFilter = ({ selectedDuration, onDurationChange }) => (
  <select value={selectedDuration} onChange={(e) => onDurationChange(e.target.value)} className={selectCls}>
    <option value="">Toutes les durées</option>
    <option value="60">1h</option>
    <option value="120">2h</option>
    <option value="180">3h</option>
  </select>
);

const EstimateFilter = ({ isEstimated, onEstimateChange }) => (
  <select value={isEstimated} onChange={(e) => onEstimateChange(e.target.value === 'true')} className={selectCls}>
    <option value="">Toutes les estimations</option>
    <option value="true">Estimé</option>
    <option value="false">Non estimé</option>
  </select>
);

const DurationSort = ({ sortOrder, onSortOrderChange }) => (
  <select value={sortOrder} onChange={(e) => onSortOrderChange(e.target.value)} className={selectCls}>
    <option value="">Pas de tri</option>
    <option value="asc">Durée croissante</option>
    <option value="desc">Durée décroissante</option>
  </select>
);

const OffersList = () => {
  const { id } = useParams();
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [filterText, setFilterText] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [isEstimated, setIsEstimated] = useState('');
  const [sortOrder, setSortOrder] = useState('');

  const fetchOffers = async () => {
    try {
      const response = await getData(`enterprise/${id}`);
      setOffers(response.offers || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  useEffect(() => {
    if (id) fetchOffers();
  }, [id]);

  useEffect(() => {
    let filtered = offers
      .filter(offer => offer.name.toLowerCase().includes(filterText.toLowerCase()))
      .filter(offer => selectedDuration === '' || offer.duration === parseInt(selectedDuration))
      .filter(offer => isEstimated === '' || offer.estimate === isEstimated);

    if (sortOrder === 'asc') {
      filtered = filtered.sort((a, b) => a.duration - b.duration);
    } else if (sortOrder === 'desc') {
      filtered = filtered.sort((a, b) => b.duration - a.duration);
    }

    setFilteredOffers(filtered);
  }, [offers, filterText, selectedDuration, isEstimated, sortOrder]);

  const paginatedOffers = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredOffers.slice(start, start + pageSize);
  }, [filteredOffers, pageIndex, pageSize]);

  const handleDelete = async (offerId) => {
    try {
      await deleteData(`enterprise/${id}/offer/${offerId}`);
      fetchOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
    }
  };

  const handleEdit = (offer) => {
    setSelectedOffer(offer);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedOffer(null);
    setIsModalOpen(true);
  };

  const handleSave = async (formDataToSend) => {
    try {
      if (selectedOffer) {
        await putData(`enterprise/${id}/offer/${selectedOffer.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await postData(`enterprise/${id}/offer`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      fetchOffers();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving offer:', error);
    }
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setPageIndex(0);
  };

  const totalPages = Math.ceil(filteredOffers.length / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SearchBar filterText={filterText} onFilterTextChange={setFilterText} />
        <div className="flex flex-wrap items-center gap-2">
          <DurationFilter selectedDuration={selectedDuration} onDurationChange={setSelectedDuration} />
          <EstimateFilter isEstimated={isEstimated} onEstimateChange={setIsEstimated} />
          <DurationSort sortOrder={sortOrder} onSortOrderChange={setSortOrder} />
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#132A24] text-white font-light text-sm hover:bg-[#1b3b33] active:scale-[0.98] transition"
        >
          <FaPlus className="w-3.5 h-3.5" />
          Ajouter une offre
        </button>
      </div>

      <ul className="space-y-3">
        {paginatedOffers.map(offer => {
          const hours = Math.floor(offer.duration / 60);
          const minutes = offer.duration % 60;
          const formattedDuration = hours > 0
            ? (minutes > 0 ? `${hours}H${minutes}` : `${hours}H`)
            : `${minutes}min`;

          return (
            <li key={offer.id} className="rounded-xl border border-black/5 bg-[#f5f7f6] p-4 flex flex-col md:flex-row justify-between items-center hover:bg-[#eef5f1] transition">
              <div className="flex items-center gap-4 flex-1">
                {offer.image && (
                  <img
                    src={offer.image}
                    alt={offer.name}
                    className="w-16 h-16 object-cover rounded-xl border border-black/5 flex-shrink-0"
                  />
                )}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                  <h3 className="text-sm font-light text-[#132A24]">{offer.name}</h3>
                  <p className="text-xs text-[#879f98] font-light">{offer.description}</p>
                  <span className="inline-flex items-center gap-1 text-xs text-[#879f98] font-light">
                    <AiOutlineEuro className="w-3.5 h-3.5" />
                    {offer.price} €
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-[#879f98] font-light">
                    <IoTimeOutline className="w-3.5 h-3.5" />
                    {formattedDuration}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-[#879f98] font-light">
                    <IoInformationCircleOutline className="w-3.5 h-3.5" />
                    {offer.estimate ? 'Estimé' : 'Non estimé'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3 md:mt-0">
                <button
                  onClick={() => handleEdit(offer)}
                  className="w-8 h-8 rounded-lg border border-black/5 bg-white flex items-center justify-center text-[#879f98] hover:text-[#132A24] hover:bg-[#eef5f1] transition"
                  title="Modifier l'offre"
                >
                  <FaEdit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(offer.id)}
                  className="w-8 h-8 rounded-lg border border-red-200 bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition"
                  title="Supprimer l'offre"
                >
                  <FaTrash className="w-3.5 h-3.5" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {paginatedOffers.length === 0 && (
        <div className="rounded-xl border border-dashed border-black/10 bg-[#f5f7f6] py-10 text-center text-sm text-[#879f98] font-light">
          Aucune offre trouvée.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5">
          {[...Array(totalPages).keys()].map((page) => (
            <button
              key={page}
              onClick={() => setPageIndex(page)}
              className={`w-8 h-8 rounded-lg text-sm font-light transition border ${
                pageIndex === page
                  ? 'bg-[#132A24] text-white border-[#132A24]'
                  : 'bg-[#f5f7f6] text-[#4b615a] border-black/5 hover:bg-[#eef5f1]'
              }`}
            >
              {page + 1}
            </button>
          ))}
        </div>
        <select
          value={pageSize}
          onChange={handlePageSizeChange}
          className="rounded-xl border border-black/5 bg-[#f5f7f6] px-3 py-2 text-sm text-[#132A24] font-light focus:outline-none"
        >
          <option value={5}>5 par page</option>
          <option value={10}>10 par page</option>
          <option value={15}>15 par page</option>
        </select>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <OfferForm onSave={handleSave} offer={selectedOffer} />
      </Modal>
    </div>
  );
};

export default OffersList;
