import { useState } from "react";
import axios from "axios";

function App() {
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [dataIda, setDataIda] = useState("");
  const [dataVolta, setDataVolta] = useState("");
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mapa simples de códigos IATA para nome da cidade
  const mapaCidades = {
    BSB: "Brasília",
    POA: "Porto Alegre",
    CXJ: "Caxias do Sul",
    GRU: "São Paulo - Guarulhos",
    GIG: "Rio de Janeiro - Galeão",
    // Adicione outros conforme desejar
  };

  const buscarPromocoes = async () => {
    setLoading(true);
    try {
      const tokenResponse = await axios.post(
        "https://test.api.amadeus.com/v1/security/oauth2/token",
        new URLSearchParams({
          grant_type: "client_credentials",
          client_id: "h8VQRrRtikt7JrG5KogcUNvzgkK2Jz5Q",
          client_secret: "hopNQlLKhDPVsXNz",
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const token = tokenResponse.data.access_token;

      const response = await axios.get(
        "https://test.api.amadeus.com/v2/shopping/flight-offers",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            originLocationCode: origem.toUpperCase(),
            destinationLocationCode: destino.toUpperCase(),
            departureDate: dataIda,
            returnDate: dataVolta,
            adults: 1,
            max: 5,
          },
        }
      );

      console.log(response.data);
      setResultados(response.data.data);
    } catch (error) {
      console.error("Erro na busca:", error);
      alert("Ocorreu um erro. Verifique os dados e tente novamente.");
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <h1>Buscador Automático de Passagens</h1>
      <p>Dados reais via Amadeus API (ambiente de testes)</p>

      <div>
        <input
          placeholder="Origem (ex: BSB)"
          value={origem}
          onChange={(e) => setOrigem(e.target.value)}
        />
        <input
          placeholder="Destino (ex: POA)"
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
        />
        <input
          type="date"
          value={dataIda}
          onChange={(e) => setDataIda(e.target.value)}
        />
        <input
          type="date"
          value={dataVolta}
          onChange={(e) => setDataVolta(e.target.value)}
        />
        <button onClick={buscarPromocoes} disabled={loading}>
          {loading ? "Buscando..." : "Buscar Promoções"}
        </button>
      </div>

      <h2>Resultados</h2>
      {resultados.length === 0 ? (
        <p>Nenhuma promoção encontrada ainda. Faça uma busca!</p>
      ) : (
        <ul>
          {resultados.map((item, index) => {
            const partida = item.itineraries[0].segments[0].departure.iataCode;
            const chegada =
              item.itineraries[0].segments.slice(-1)[0].arrival.iataCode;

            return (
              <li key={index}>
                {partida} ({mapaCidades[partida] || "Cidade desconhecida"}) →{" "}
                {chegada} ({mapaCidades[chegada] || "Cidade desconhecida"}) |{" "}
                <a
                  href={`https://www.google.com/search?q=passagem+${partida}+para+${chegada}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.price.total} {item.price.currency}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default App;