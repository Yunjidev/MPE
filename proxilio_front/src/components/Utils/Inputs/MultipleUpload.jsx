import { useState, useEffect, useCallback, useMemo } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import PropTypes from "prop-types";

export default function MultipleUpload({
  onFileUpload,
  onFileDelete,
  placeholder,
  url = [],
  isEditMode,
  maxPhotos = 3,
}) {
  const [photoUrls, setPhotoUrls] = useState([]);
  const [error, setError] = useState(null);
  const memoizedUrl = useMemo(() => {
    return url.map((item) => {
      if (typeof item === "string") {
        return item;
      } else if (item instanceof File) {
        return URL.createObjectURL(item);
      }
      return "";
    });
  }, [url]);

  useEffect(() => {
    if (
      isEditMode &&
      JSON.stringify(memoizedUrl) !== JSON.stringify(photoUrls)
    ) {
      setPhotoUrls([...memoizedUrl]);
    }
  }, [memoizedUrl, photoUrls, isEditMode]);

  const handlePhotosChange = useCallback(
    (e) => {
      const files = Array.from(e.target.files);
      if (photoUrls.length + files.length > 3) {
        setError("Vous ne pouvez ajouter que 3 photos");
        return;
      }
      const newUrls = files.map((file) => URL.createObjectURL(file));
      setPhotoUrls((prevPhotoUrls) => [...prevPhotoUrls, ...newUrls]);
      files.forEach((file) => {
        if (onFileUpload) {
          onFileUpload(file);
        }
      });
    },
    [photoUrls, onFileUpload],
  );

  const handleDeletePhoto = (index) => {
    event.preventDefault();
    setPhotoUrls((prevPhotoUrls) => {
      const newUrls = prevPhotoUrls.filter((_, i) => i !== index);
      if (onFileDelete) {
        onFileDelete(index);
      }
      return newUrls;
    });
  };

  const isDisabled = photoUrls.length >= maxPhotos;

  return (
    <div className="col-span-3 w-full">
      <label
        htmlFor="photos-upload"
        className={`flex flex-row items-center justify-center gap-4 w-full rounded-xl p-10 transition
          ${isDisabled
            ? "border border-black/10 bg-[#f5f7f6] cursor-not-allowed"
            : "border border-dashed border-black/10 bg-[#f5f7f6] cursor-pointer hover:bg-[#eef5f1] hover:border-[#132A24]/20"
          }`}
      >
        <FaCloudUploadAlt
          className={`w-8 h-8 shrink-0 ${isDisabled ? "text-red-400" : "text-[#879f98]"}`}
        />
        <p className={`text-sm font-light ${isDisabled ? "text-red-400" : "text-[#879f98]"}`}>
          {isDisabled
            ? `Vous avez déjà ajouté ${maxPhotos} photos`
            : placeholder}
        </p>
      </label>
      <input
        id="photos-upload"
        type="file"
        name="photos"
        multiple
        onChange={handlePhotosChange}
        className="hidden"
        disabled={isDisabled}
      />
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mt-4 w-full">
        {photoUrls.map((url, index) => (
          <div key={index} className="relative">
            <img
              key={index}
              src={url}
              alt={`Photo ${index + 1}`}
              className="h-40 w-40 col-span-1 object-cover rounded-lg justify-self-center"
            />
            <button
              className="absolute top-0 right-0 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => handleDeletePhoto(index)}
            >
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

MultipleUpload.propTypes = {
  onFileUpload: PropTypes.func,
  onFileDelete: PropTypes.func,
  placeholder: PropTypes.string,
  url: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(File)]),
  ),
  isEditMode: PropTypes.bool,
  maxPhotos: PropTypes.number,
};
