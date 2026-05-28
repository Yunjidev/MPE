import { useState, useEffect } from "react";
import { FaBriefcase } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { postData, putData, deleteData, getData } from "../../services/data-fetch";
import { toast } from "react-toastify";

const CreateJobForm = () => {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await getData("jobs");
        setJobs(response || []);
      } catch (error) {
        console.error("Erreur lors de la récupération des métiers:", error);
      }
    };
    fetchJobs();
  }, []);

  const onSubmitJob = async (data) => {
    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("name", data.jobTitle?.trim() || "");

      const jobResponse = await postData("admin/job", fd);

      if (jobResponse) {
        toast.success("Métier créé avec succès !");
        reset();
        setJobs((prev) => [...prev, jobResponse]);
        setSelectedJob(null);
      } else {
        toast.error("Erreur lors de la création du métier.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la création du métier.");
    } finally {
      setLoading(false);
    }
  };

  const onUpdateJob = async (data) => {
    if (!selectedJob) return;

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("name", data.jobTitle?.trim() || "");

      const jobResponse = await putData(`admin/job/${selectedJob.id}`, fd);

      if (jobResponse) {
        toast.success("Métier modifié avec succès !");
        reset();
        setJobs((prev) => prev.map((job) => (job.id === selectedJob.id ? jobResponse : job)));
        setSelectedJob(null);
      } else {
        toast.error("Erreur lors de la modification du métier.");
      }
    } catch (error) {
      console.error("Erreur lors de la modification du métier:", error);
      toast.error("Erreur lors de la modification du métier.");
    } finally {
      setLoading(false);
    }
  };

  const onDeleteJob = async () => {
    if (!selectedJob) return;
    if (!confirm(`Supprimer le métier “${selectedJob.name}” ?`)) return;

    try {
      setLoading(true);
      const res = await deleteData(`admin/job/${selectedJob.id}`);

      if (res && (res.message?.includes("supprim") || res.success)) {
        toast.success("Métier supprimé avec succès !");
        reset();
        setJobs((prev) => prev.filter((job) => job.id !== selectedJob.id));
        setSelectedJob(null);
      } else {
        toast.error("Erreur lors de la suppression du métier.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression du métier.");
    } finally {
      setLoading(false);
    }
  };

  const handleJobSelect = (event) => {
    const name = event.target.value;
    const found = jobs.find((j) => j.name === name);
    if (found) {
      setSelectedJob(found);
      setValue("jobTitle", found.name);
    } else {
      setSelectedJob(null);
      reset();
    }
  };

  const primaryBtn =
    "inline-flex items-center justify-center h-11 px-6 rounded-xl bg-[#132A24] text-white font-light hover:bg-[#1b3b33] active:scale-[0.98] transition-all";
  const dangerBtn =
    "inline-flex items-center justify-center h-11 px-6 rounded-xl border border-red-200 bg-red-50 text-red-500 font-light hover:bg-red-500 hover:text-white active:scale-[0.98] transition-all";
  const inputCls =
    "w-full h-11 rounded-xl bg-[#f5f7f6] text-[#132A24] placeholder:text-[#879f98] border border-black/5 outline-none ring-0 font-light focus:border-[#132A24]/30 focus:ring-2 focus:ring-[#132A24]/10 transition";
  const labelCls = "text-sm text-[#4b615a] font-light";

  return (
    <div className="bg-white border border-black/5 rounded-2xl shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] p-5 lg:p-6 mt-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-[#eef5f1]">
            <FaBriefcase className="text-[#4b8a74]" />
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#879f98] font-light mb-0.5">Administration</p>
            <h2 className="text-xl font-light text-[#132A24] tracking-tight">Gestion des métiers</h2>
          </div>
        </div>
      </div>

      {/* Select métier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6">
          <label htmlFor="jobSelect" className={labelCls}>
            Sélectionner un métier
          </label>
          <select
            id="jobSelect"
            onChange={handleJobSelect}
            className={`${inputCls} mt-4 pr-10`}
            defaultValue=""
          >
            <option value="" disabled>
              Choisir dans la liste…
            </option>
            {jobs.map((job) => (
              <option key={job.id} value={job.name}>
                {job.name}
              </option>
            ))}
          </select>
        </div>

        {/* État sélectionné */}
        <div className="lg:col-span-6 flex items-end">
          {selectedJob ? (
            <div className="w-full h-11 rounded-xl border border-[#132A24]/20 bg-[#eef5f1] text-[#132A24] grid place-items-center text-sm font-light">
              Métier sélectionné : <strong className="ml-1 font-light">{selectedJob.name}</strong>
            </div>
          ) : (
            <div className="w-full h-11 rounded-xl border border-black/5 bg-[#f5f7f6] text-[#879f98] grid place-items-center text-sm font-light">
              Aucun métier sélectionné
            </div>
          )}
        </div>
      </div>

      <hr className="my-6 border-black/5" />

      {/* Form */}
      <form
        onSubmit={handleSubmit(selectedJob ? onUpdateJob : onSubmitJob)}
        className="grid grid-cols-1 lg:grid-cols-12 gap-5"
      >
        {/* Titre du métier */}
        <div className="lg:col-span-12 lg:col-start-1">
          <label htmlFor="jobTitle" className={labelCls}>
            Titre du métier
          </label>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#879f98]">
              <FaBriefcase />
            </span>
            <input
              id="jobTitle"
              type="text"
              {...register("jobTitle", { required: true })}
              placeholder="Ex : Coiffeur, Mécanicien, Plombier…"
              className={`${inputCls} pl-10`}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="lg:col-span-12 flex flex-wrap gap-3 justify-center pt-2">
          <button
            className={`${primaryBtn} min-w-[220px]`}
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Veuillez patienter…"
              : selectedJob
              ? "Modifier le métier"
              : "Créer le métier"}
          </button>

          {selectedJob && (
            <button
              type="button"
              onClick={onDeleteJob}
              className={`${dangerBtn} min-w-[220px]`}
              disabled={loading}
            >
              Supprimer le métier
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateJobForm;
