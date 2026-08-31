// Aquí deberás pegar la URL que te genera Google Apps Script al publicar
// De momento lo dejamos vacío o con un placeholder hasta tener la URL real.
export const API_URL = "https://script.google.com/macros/s/AKfycbzrcN1PZYfWv911nGOy7FY8pDatEdfxEDyRhB72IxkyJfJkM8ameBIB3A7n6tYcypUbHA/exec";

export interface ApiPayload {
  action: "GET_ALL" | "CREATE" | "UPDATE" | "DELETE";
  sheet: string;
  id?: string;
  data?: any;
}

export const fetchFromSheet = async (payload: ApiPayload) => {
  if (!API_URL) {
    console.warn("Falta la API_URL de Google Apps Script");
    // Mock de desarrollo para poder probar la UI sin backend
    if (payload.action === "GET_ALL" && payload.sheet === "ARTICULOS") {
      return [{ ID: "1", Nombre: "Balde con elote", Categoria: "Complementos", Unidad: "Balde", PrecioSugerido: 200, Estatus: "Activo" }];
    }
    return [];
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  } catch (error) {
    console.error("Error fetching from API:", error);
    throw error;
  }
};
