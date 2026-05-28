import { getData, postData, putData, deleteData } from "../../../services/data-fetch";
import { toast } from "react-toastify";

export const getSubscription = async () => {
  try {
    const data = await getData("admin/subscriptions");
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des souscriptions:", error);
  }
};

export const addSubscription = async (enterpriseId, status, subscriptionType) => {
  try {
    await postData("admin/subscription", {
      Enterprise_id: enterpriseId,
      status,
      subscription_type: subscriptionType,
    });
    toast.success("La souscription a été ajoutée avec succès");
  } catch (error) {
    console.error("Erreur lors de l'ajout de la souscription:", error);
    toast.error("Une erreur est survenue lors de l'ajout de la souscription");
  }
};

export const deleteSubscription = async (id) => {
  try {
    await deleteData(`admin/subscription/${id}`);
    toast.success("La souscription a été supprimée avec succès");
  } catch (error) {
    console.error(`Erreur lors de la suppression de la souscription ${id}:`, error);
    toast.error("Une erreur est survenue lors de la suppression de la souscription");
  }
};

export const updateSubscription = async (id, data) => {
  try {
    await putData(`admin/subscription/${id}`, data);
    toast.success("La souscription a été modifiée avec succès");
  } catch (error) {
    console.error(`Erreur lors de la modification de la souscription ${id}:`, error);
    toast.error("Une erreur est survenue lors de la modification de la souscription");
  }
};
