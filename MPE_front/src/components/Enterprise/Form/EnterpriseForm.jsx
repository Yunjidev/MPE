import { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { FaCloudUploadAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { getData } from "../../../services/data-fetch";
import Input from "../../Utils/Inputs/Input";
import SocialMedia from "./Social";
import Basic from "./Basic";
import ContactEnterprise from "./ContactEnterprise";
import MarkdownEditor from "./MarkdownEditor";

export default function EnterpriseForm({
  title,
  onSubmit,
  initialData = {},
  isEditMode = false,
}) {
  const [jobOptions, setJobOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);

  const [formData, setFormData] = useState({
    photos: [],
    removePhotos: [],
    adress: "",
    city: "",
    zip_code: "",
    region: "",
    Country_id: "",
    name: "",
    phone: "",
    mail: "",
    siret_number: "",
    description: "",
    twitter: "",
    instagram: "",
    facebook: "",
    website: "",
    Job_id: "",
    logo: null,
    multi_booking: false,
  });

  // Banner géré séparément (prépendé en premier dans photos au submit)
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerUrl, setBannerUrl] = useState("");
  const [removeBanner, setRemoveBanner] = useState(false);

  const memoizedJobOptions = useMemo(() => jobOptions, [jobOptions]);
  const memoizedRegionOptions = useMemo(() => regionOptions, [regionOptions]);

  const memoizedInitialData = useMemo(
    () => ({
      ...initialData,
      photos: Array.isArray(initialData?.photos) ? initialData.photos : [],
    }),
    [initialData]
  );

  const fetchList = useCallback(async () => {
    try {
      const lists = await getData("/search");
      setJobOptions(lists.jobs);
      setRegionOptions(lists.countries || []);
    } catch (error) {
      console.error("Failed to fetch lists:", error);
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  useEffect(() => {
    if (isEditMode && memoizedInitialData) {
      const allPhotos = memoizedInitialData.photos;
      // En edit mode : première photo = bannière, reste = galerie
      const existingBanner = allPhotos[0] || "";
      const galleryPhotos = allPhotos.slice(1);

      setBannerUrl(existingBanner);
      setFormData((prev) => ({
        ...prev,
        name: memoizedInitialData?.name || "",
        phone: memoizedInitialData?.phone || "",
        mail: memoizedInitialData?.mail || "",
        adress: memoizedInitialData?.adress || "",
        city: memoizedInitialData?.city || "",
        zip_code: memoizedInitialData?.zip_code || "",
        region: memoizedInitialData?.region || "",
        siret_number: memoizedInitialData?.siret_number || "",
        description: memoizedInitialData?.description || "",
        twitter: memoizedInitialData?.twitter || "",
        instagram: memoizedInitialData?.instagram || "",
        facebook: memoizedInitialData?.facebook || "",
        website: memoizedInitialData?.website || "",
        Job_id: memoizedInitialData?.job?.id || "",
        Country_id: memoizedInitialData?.country?.id || "",
        removePhotos: [],
        logo: memoizedInitialData?.logo || "",
        photos: galleryPhotos,
        multi_booking: memoizedInitialData?.multi_booking ?? false,
      }));
    }
  }, [memoizedInitialData, isEditMode]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleLogoChange = (file) => {
    if (file) setFormData((prev) => ({ ...prev, logo: file }));
  };

  const handleLogoDelete = () => {
    setFormData((prev) => ({ ...prev, logo: null, removeLogo: true }));
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerUrl(URL.createObjectURL(file));
    setRemoveBanner(false);
  };

  const handleBannerDelete = () => {
    setBannerFile(null);
    setBannerUrl("");
    setRemoveBanner(true);
  };

  const handlePhotosChange = (file) => {
    if (file) setFormData((prev) => ({ ...prev, photos: [...prev.photos, file] }));
  };

  const handleDeletePhoto = (index) => {
    setFormData((prev) => {
      const newPhotos = [...prev.photos];
      newPhotos.splice(index, 1);
      const photosToRemove = [...prev.removePhotos];
      if (initialData?.photos && index < initialData.photos.length) {
        photosToRemove.push(index);
      }
      return { ...prev, photos: newPhotos, removePhotos: photosToRemove };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.siret_number && formData.siret_number.length !== 14) {
      toast.error("Le numéro SIRET doit contenir exactement 14 chiffres");
      return;
    }
    if (formData.zip_code && formData.zip_code.length !== 5) {
      toast.error("Le code postal doit contenir exactement 5 chiffres");
      return;
    }

    const formDataToSubmit = new FormData();

    Object.keys(formData).forEach((key) => {
      const val = formData[key];
      if (key === "photos") return; // géré plus bas
      if (key === "multi_booking") {
        formDataToSubmit.append(key, val ? "true" : "false");
        return;
      }
      if (val !== initialData[key] && val !== "" && val != null) {
        if (key === "logo") {
          formDataToSubmit.append("logo", val);
        } else {
          formDataToSubmit.append(key, val);
        }
      }
    });

    // Bannière en premier, puis galerie
    if (bannerFile) {
      formDataToSubmit.append("photos", bannerFile);
    }
    formData.photos.forEach((p) => formDataToSubmit.append("photos", p));

    if (removeBanner) {
      formDataToSubmit.append("removeBanner", "true");
    }

    onSubmit(formDataToSubmit);
  };

  return (
    <div className="mt-6">
      <div className="w-full">
        <div className="bg-white border border-black/5 rounded-2xl shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-6 lg:p-8">
          <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-0.5 text-center">Entreprise</p>
          <h2 className="text-xl font-light text-[#132A24] tracking-tight text-center mb-6">{title}</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* ── Section médias ── */}
            <div className="border border-black/5 rounded-xl p-5 space-y-6">
              <p className="text-[10px] font-light uppercase tracking-widest text-[#879f98]">
                Photos &amp; médias
              </p>

              {/* Photo de profil + Bannière côte à côte */}
              <div className="grid grid-cols-1 sm:grid-cols-[160px,1fr] gap-6 items-start">

                {/* Photo de profil */}
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm font-light text-[#132A24]">Photo de profil</p>
                  <p className="text-xs text-[#879f98] text-center font-light">Logo de votre entreprise</p>
                  <Input.SingleUpload
                    placeholder="Sélectionnez un logo"
                    onFileUpload={handleLogoChange}
                    onFileDelete={handleLogoDelete}
                    url={formData.logo}
                    isEditMode={isEditMode}
                  />
                </div>

                {/* Bannière */}
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-light text-[#132A24]">Bannière</p>
                  <p className="text-xs text-[#879f98] font-light">
                    Image de couverture affichée en haut de votre page
                  </p>
                  <label
                    htmlFor="banner-upload"
                    className="relative flex h-36 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-black/10 bg-[#f5f7f6] transition hover:bg-[#eef5f1] hover:border-[#132A24]/20"
                  >
                    {bannerUrl ? (
                      <img
                        src={bannerUrl}
                        alt="Bannière"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-[#879f98]">
                        <FaCloudUploadAlt className="text-3xl" />
                        <span className="text-sm font-light">Sélectionnez une bannière</span>
                      </div>
                    )}
                  </label>
                  <input
                    id="banner-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="hidden"
                  />
                  {bannerUrl && (
                    <button
                      type="button"
                      onClick={handleBannerDelete}
                      className="self-start text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Supprimer la bannière
                    </button>
                  )}
                </div>
              </div>

              {/* Galerie */}
              <div className="flex flex-col gap-2">
                <p className="text-sm font-light text-[#132A24]">Galerie</p>
                <p className="text-xs text-[#879f98] font-light">
                  Photos supplémentaires de votre entreprise (3 max)
                </p>
                <Input.MultipleUpload
                  placeholder="Sélectionnez des photos de galerie"
                  onFileUpload={handlePhotosChange}
                  onFileDelete={handleDeletePhoto}
                  url={formData.photos}
                  isEditMode={isEditMode}
                  maxPhotos={3}
                />
              </div>
            </div>

            {/* ── Section infos ── */}
            <div className="border border-black/5 rounded-xl p-5 space-y-5">
              <p className="text-[10px] font-light uppercase tracking-widest text-[#879f98]">
                Informations
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Basic
                  formData={formData}
                  jobOptions={memoizedJobOptions}
                  onChange={handleInputChange}
                />
                <ContactEnterprise
                  formData={formData}
                  countryOptions={memoizedRegionOptions}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* ── Section réseaux sociaux ── */}
            <div className="border border-black/5 rounded-xl p-5 space-y-5">
              <p className="text-[10px] font-light uppercase tracking-widest text-[#879f98]">
                Réseaux sociaux
              </p>
              <SocialMedia formData={formData} onChange={handleInputChange} />
            </div>

            {/* ── Description ── */}
            <div className="border border-black/5 rounded-xl p-5 space-y-3">
              <p className="text-[10px] font-light uppercase tracking-widest text-[#879f98]">
                Description
              </p>
              <MarkdownEditor
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Décrivez votre entreprise, vos services, votre histoire…&#10;&#10;Vous pouvez utiliser **gras**, *italique*, - listes, ## titres…"
                required
              />
            </div>

            {/* ── Options planning ── */}
            {isEditMode && (
              <div className="border border-black/5 rounded-xl p-5 space-y-3">
                <p className="text-[10px] font-light uppercase tracking-widest text-[#879f98]">
                  Options de réservation
                </p>
                <label className="flex items-start gap-4 cursor-pointer group">
                  <div className="relative mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.multi_booking}
                      onChange={(e) => setFormData((prev) => ({ ...prev, multi_booking: e.target.checked }))}
                    />
                    <div className="w-10 h-6 rounded-full bg-[#f5f7f6] border border-black/10 peer-checked:bg-[#132A24] transition-colors" />
                    <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-[#879f98] peer-checked:bg-white peer-checked:translate-x-4 transition-all" />
                  </div>
                  <div>
                    <p className="text-sm font-light text-[#132A24]">Multi-réservation par créneau</p>
                    <p className="text-xs text-[#879f98] font-light mt-0.5">
                      Activez si vous avez plusieurs prestataires disponibles simultanément (ex : salon avec plusieurs coiffeurs). Plusieurs clients pourront réserver le même créneau.
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* ── Submit ── */}
            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#132A24] text-white font-light hover:bg-[#1b3b33] active:scale-[0.98] transition-all"
            >
              Soumettre
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

EnterpriseForm.propTypes = {
  title: PropTypes.string.isRequired,
  onSubmit: PropTypes.func,
  initialData: PropTypes.object,
  isEditMode: PropTypes.bool,
};
