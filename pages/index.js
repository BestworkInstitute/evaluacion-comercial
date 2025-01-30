import { useState } from "react";

const ejecutivas = [
  { nombre: "Carol Alarcón", telefono: "56976553420" },
  { nombre: "Marisel Manriquez", telefono: "56983714560" },
  { nombre: "Fernanda Gonzalez", telefono: "56959076188" },
  { nombre: "Shalysmar Velasquez", telefono: "56993455682" },
  { nombre: "Javiera Roco", telefono: "56920425521" },
  { nombre: "Jocelyn Solís", telefono: "56999623032" },
  { nombre: "Mónica Huerta", telefono: "56936357030" },
  { nombre: "Camila Carrizo", telefono: "56986423245" },
  { nombre: "Mayi Saldias", telefono: "56992124950" },
  { nombre: "Paola Valdivia", telefono: "56992410906" },
  { nombre: "Alejandra Esparza", telefono: "56992515305" },
];

export default function Home() {
  const [rut, setRut] = useState("");
  const [selectedEjecutiva, setSelectedEjecutiva] = useState(ejecutivas[0]);
  const [apiExternaResult, setApiExternaResult] = useState(null);
  const [googleSheetsResult, setGoogleSheetsResult] = useState(null);
  const [error, setError] = useState(null);

  const buscarDatos = async () => {
    setError(null);
    setApiExternaResult(null);
    setGoogleSheetsResult(null);

    if (!rut) {
      setError("Por favor, ingresa un RUT");
      return;
    }

    try {
      // Llamar a la API externa
      const responseApiExterna = await fetch("/api/consultaApiExterna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: selectedEjecutiva.telefono,
          rut: rut,
        }),
      });

      const dataApiExterna = await responseApiExterna.json();

      if (!responseApiExterna.ok) {
        setError(dataApiExterna.error || "Error en la API externa");
        return;
      }

      // Formatear el resultado de la API externa
      const resultadoEvaluacion =
        dataApiExterna.resultadoEvaluacion?.includes("Aprobado") ? "Aprobado" : "Rechazado";

      setApiExternaResult(resultadoEvaluacion);

      // Esperar 1 segundo antes de buscar en Google Sheets
      setTimeout(async () => {
        try {
          const responseSheets = await fetch(`/api/buscarRut?rut=${encodeURIComponent(rut)}`);
          const dataSheets = await responseSheets.json();

          if (!responseSheets.ok) {
            setError(dataSheets.error || "Error en la API de Google Sheets");
            return;
          }

          // Mostrar los datos de Google Sheets
          setGoogleSheetsResult(dataSheets);
        } catch (err) {
          setError("Error al conectar con el servidor para Google Sheets");
        }
      }, 1000); // Esperar 1 segundo
    } catch (err) {
      setError("Error al conectar con el servidor para la API externa");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <img
          src="https://bestwork.cl/wp-content/uploads/2023/05/Logo.png"
          alt="Best Work Logo"
          style={{ width: "150px" }}
        />
      </div>

      {/* Título principal */}
      <h1 style={{ textAlign: "center", color: "#F8981D" }}>Evaluación Comercial</h1>

      {/* Selección de ejecutiva */}
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="ejecutiva" style={{ fontWeight: "bold", color: "#01579B" }}>Selecciona Ejecutiva:</label>
        <select
          id="ejecutiva"
          value={selectedEjecutiva.nombre}
          onChange={(e) =>
            setSelectedEjecutiva(
              ejecutivas.find((ej) => ej.nombre === e.target.value)
            )
          }
          style={{ padding: "10px", width: "100%", marginTop: "5px", border: "1px solid #01579B", borderRadius: "5px" }}
        >
          {ejecutivas.map((ejecutiva) => (
            <option key={ejecutiva.telefono} value={ejecutiva.nombre}>
              {ejecutiva.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Campo para ingresar el RUT */}
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="rut" style={{ fontWeight: "bold", color: "#01579B" }}>Ingresa el RUT:</label>
        <input
          type="text"
          id="rut"
          value={rut}
          onChange={(e) => setRut(e.target.value)}
          placeholder="Ej: 18.609.389-5"
          style={{ padding: "10px", width: "100%", marginTop: "5px", border: "1px solid #01579B", borderRadius: "5px" }}
        />
      </div>

      {/* Botón de búsqueda */}
      <button
        onClick={buscarDatos}
        style={{
          padding: "10px 20px",
          background: "#F8981D",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          width: "100%",
        }}
      >
        Buscar datos
      </button>

      {/* Errores */}
      {error && <p style={{ color: "red", marginTop: "20px" }}>{error}</p>}

      {/* Resultado de la API externa */}
      {apiExternaResult && (
        <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#F1F8E9", borderRadius: "5px" }}>
          <h2 style={{ color: "#01579B" }}>Resultado preliminar</h2>
          <p><strong>Estado:</strong> {apiExternaResult}</p>
        </div>
      )}

      {/* Resultado de Google Sheets */}
      {googleSheetsResult && (
        <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#E3F2FD", borderRadius: "5px" }}>
          <h2 style={{ color: "#01579B" }}>Información detallada del resultado:</h2>
          <p><strong>Approval Status:</strong> {googleSheetsResult.approvalStatus}</p>
          <p><strong>Cantidad de documentos menos de 24 meses:</strong> {googleSheetsResult["Cantidad de documentos menos de 24 meses"]}</p>
          <p><strong>Monto menos de 24 meses:</strong> {googleSheetsResult["Monto menos de 24 meses"]}</p>
          <p><strong>Cantidad de documentos más de 24 meses:</strong> {googleSheetsResult["Cantidad de documentos más de 24 meses"]}</p>
          <p><strong>Monto más de 24 meses:</strong> {googleSheetsResult["Monto más de 24 meses"]}</p>
          <p><strong>Total Acreedores:</strong> {googleSheetsResult["Total Acreedores"]}</p>

          {/* Botón SOLICITAR REVISIÓN */}
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <button
              onClick={async () => {
                try {
                  const response = await fetch("https://flows.messagebird.com/flows/b3dc3cac-a552-4082-ba93-28fc49efcb98/invoke", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      RUT: rut,
                      EJECUTIVA: selectedEjecutiva.nombre,
                      CELULAR: selectedEjecutiva.telefono,
                      ESTADO: googleSheetsResult.approvalStatus,
                      AA: googleSheetsResult["Cantidad de documentos menos de 24 meses"],
                      BB: googleSheetsResult["Monto menos de 24 meses"],
                      CC: googleSheetsResult["Cantidad de documentos más de 24 meses"],
                      DD: googleSheetsResult["Monto más de 24 meses"],
                      EE: googleSheetsResult["Total Acreedores"],
                    }),
                  });

                  if (response.ok) {
                    alert("¡Solicitud de revisión enviada con éxito!");
                  } else {
                    alert("Error al enviar la solicitud. Por favor, inténtalo nuevamente.");
                  }
                } catch (error) {
                  alert("Hubo un problema al enviar la solicitud. Verifica tu conexión.");
                  console.error("Error en solicitud:", error);
                }
              }}
              style={{
                padding: "10px 20px",
                backgroundColor: "#D32F2F",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              SOLICITAR REVISIÓN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
