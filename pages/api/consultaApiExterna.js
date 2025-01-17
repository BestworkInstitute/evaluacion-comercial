export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Solo se permite el método POST" });
    }
  
    const { phone, rut } = req.body;
  
    if (!phone || !rut) {
      return res
        .status(400)
        .json({ error: "Los parámetros 'phone' y 'rut' son obligatorios" });
    }
  
    try {
      // Construir el link de la API externa
      const apiUrl = `https://pbezama.pythonanywhere.com/?API_KEY=miClaveEsSecretab6d8c5c4&IDcodigoACorrer=19&PHONE=${phone}&RUT=${rut}`;
  
      // Realizar la solicitud a la API externa
      const response = await fetch(apiUrl);
      const data = await response.json();
  
      // Devolver la respuesta al frontend
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error en la API externa:", error);
      return res.status(500).json({ error: "Error al conectar con la API externa" });
    }
  }
  