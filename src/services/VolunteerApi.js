import api from "./api";

export const registerVolunteer = async (formData) => {
  const response = await api.post(
    "/volunteers/register",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};