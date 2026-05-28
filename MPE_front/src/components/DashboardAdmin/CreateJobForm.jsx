import { useState, useEffect } from "react";
import { FaBriefcase } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { postData, putData, deleteData, getData } from "../../services/data-fetch";
import { toast } from "react-toastify";
import Input from "../../components/Utils/Inputs/Input";

const CreateJobForm = () => {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState({ photo: null });
  // eslint-disable-next-line no-unused-vars
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await getData("jobs");
        setJobs(response);
      } catch (error) {
        console.error("Erreur lors de la récupération des métiers:", error);
      }
    };

    fetchJobs();
  }, []);

  const handlePhotoChange = (file) => {
    setFormData((prevData) => ({
      ...prevData,
      photo: file,
    }));
  };

  const handleDeletePhoto = () => {
    setFormData((prevData) => ({
      ...prevData,
      photo: null,
    }));
  };

  const onSubmitJob = async (data) => {
    try {
      const fd = new FormData();
      fd.append("name", data.jobTitle);
      if (formData.photo) {
        fd.append("picture", formData.photo);
      }

      const jobResponse = await postData("admin/job", fd);

      if (jobResponse) {
        toast.success("Métier créé avec succès !");
        reset();
        setJobs([...jobs, jobResponse]);
      } else {
        toast.error("Erreur lors de la création du métier.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la création du métier.");
    }
  };

  const onUpdateJob = async (data) => {
    try {
      const updatedFormData = new FormData();
      updatedFormData.append("name", data.jobTitle);
      if (formData.photo) {
        updatedFormData.append("picture", formData.photo);
      } else if (selectedJob.picture) {
        updatedFormData.append("picture", selectedJob.picture);
      }

      const jobResponse = await putData(`admin/job/${selectedJob.id}`, updatedFormData);

      if (jobResponse) {
        toast.success("Métier modifié avec succès !");
        reset();
        setJobs(jobs.map(job => job.id === selectedJob.id ? jobResponse : job));
        setSelectedJob(null);
      } else {
        toast.error("Erreur lors de la modification du métier.");
      }
    } catch (error) {
      console.error("Erreur lors de la modification du métier:", error);
      toast.error("Erreur lors de la modification du métier.");
    }
  };

  const onDeleteJob = async () => {
    try {
      const jobResponse = await deleteData(`admin/job/${selectedJob.id}`);

      if (jobResponse && jobResponse.message === "job supprimée") {
        toast.success("Métier supprimé avec succès !");
        reset();
        setJobs(jobs.filter(job => job.id !== selectedJob.id));
        setSelectedJob(null);
      } else {
        toast.error("Erreur lors de la suppression du métier.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression du métier.");
    }
  };

  const handleJobSelect = async (event) => {
    const selectedJobTitle = event.target.value;
    const job = jobs.find(j => j.name === selectedJobTitle);
    if (job) {
      setSelectedJob(job);
      setValue("jobTitle", job.name);
      setFormData((prevData) => ({
        ...prevData,
        photo: job.picture || null,
      }));
    } else {
      setSelectedJob(null);
      reset();
    }
  };

  const inputCls = "w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#f5f7f6] border border-black/5 text-[#132A24] placeholder:text-[#879f98] font-light focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 outline-none transition text-sm";

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-0.5">Administration</p>
        <h2 className="text-base font-light text-[#132A24]">Gestion des Métiers</h2>
      </div>
      <hr className="border-black/5" />

      <div>
        <label htmlFor="jobSelect" className="block text-[10px] font-light uppercase tracking-widest text-[#879f98] mb-1">
          Sélectionner un métier existant
        </label>
        <select
          id="jobSelect"
          onChange={handleJobSelect}
          className={inputCls + " pl-3"}
        >
          <option value="">Sélectionner un métier</option>
          {jobs.map(job => (
            <option key={job.id} value={job.name}>{job.name}</option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit(selectedJob ? onUpdateJob : onSubmitJob)} className="space-y-4">
        <div>
          <label htmlFor="jobTitle" className="block text-[10px] font-light uppercase tracking-widest text-[#879f98] mb-1">
            Titre du métier
          </label>
          <div className="relative flex items-center">
            <FaBriefcase className="absolute left-3 text-[#879f98] w-3.5 h-3.5" />
            <input
              id="jobTitle"
              type="text"
              {...register("jobTitle", { required: true })}
              placeholder="ex. Coiffeur, Plombier…"
              className={inputCls}
            />
          </div>
        </div>

        <Input.SingleUpload
          placeholder="Sélectionnez une image"
          onFileUpload={handlePhotoChange}
          onFileDelete={handleDeletePhoto}
          url={formData.photo}
          isEditMode={isEditMode}
        />

        {formData.photo && (
          <div className="mt-2">
            <img src={formData.photo} alt="Job" className="w-full h-auto rounded-xl border border-black/5" />
          </div>
        )}

        <button
          type="submit"
          className="w-full h-11 rounded-xl bg-[#132A24] text-white font-light hover:bg-[#1b3b33] active:scale-[0.98] transition text-sm"
        >
          {selectedJob ? "Modifier le métier" : "Créer le métier"}
        </button>
      </form>

      {selectedJob && (
        <button
          onClick={onDeleteJob}
          className="w-full h-11 rounded-xl border border-red-200 bg-red-50 text-red-500 font-light hover:bg-red-500 hover:text-white active:scale-[0.98] transition text-sm"
        >
          Supprimer le métier
        </button>
      )}
    </div>
  );
};

export default CreateJobForm;
