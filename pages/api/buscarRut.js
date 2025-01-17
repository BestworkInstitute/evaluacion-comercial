import { google } from "googleapis";

// Función para transformar el RUT al formato requerido
function transformarRut(rut) {
  const rutLimpio = rut.replace(/\./g, "").replace(/-/g, ""); // Eliminar puntos y guiones
  return `'${rutLimpio.padStart(10, "0")}`; // Agregar apóstrofo y completar con ceros adelante
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Solo se permite el método GET" });
  }

  const { rut } = req.query;

  if (!rut) {
    return res.status(400).json({ error: "El parámetro 'rut' es obligatorio" });
  }

  // Transformar el RUT antes de buscarlo
  const rutTransformado = transformarRut(rut);

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "SOLICITUDES DIRECTAS EJECUTIVAS!A:U", // Cambia este rango según tu hoja
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "No se encontraron datos en la hoja" });
    }

    // Buscar la fila por el RUT transformado
    const data = rows.slice(1).find((row) => {
      const rutEnHoja = (row[5] || "").trim(); // Leer el valor de la columna F (índice 5)
      return rutEnHoja.endsWith(rutTransformado.slice(-8)); // Coincidencia por los últimos 8 caracteres
    });

    if (!data) {
      return res.status(404).json({ error: `No se encontraron datos para el RUT: ${rut}` });
    }

    // Extraer solo las columnas P:T (índices 15 a 19)
    const result = {
      approvalStatus: data[10] || "Sin estado", // Columna K (índice 10)
      "Cantidad de documentos menos de 24 meses": data[15] || "0", // Columna P (índice 15)
      "Monto menos de 24 meses": data[16] || "$0", // Columna Q (índice 16)
      "Cantidad de documentos más de 24 meses": data[17] || "0", // Columna R (índice 17)
      "Monto más de 24 meses": data[18] || "$0", // Columna S (índice 18)
      "Total Acreedores": data[19] || "0", // Columna T (índice 19)
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error en la API de Google Sheets:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
