import apiClient from "./apiClient";


export const searchLinkers = async (word: string) => {
  const res = await apiClient.get("/search/linker", {
    params: { word },
  });
  return res.data;
};
