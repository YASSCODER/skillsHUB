import axios from "axios";

export const fetchRandomActivity = async (): Promise<string> => {
  try {
    const response = await axios.get("https://www.boredapi.com/api/activity");
    return response.data.activity;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'activité :", (error as any).message);
    return "Take a break and smile 😊";
  }
};
