import { useState } from "react";
import axios from "axios";

// Dados mock de aeroportos nacionais para ambiente restrito
const airports = [
  { iata: "BSB", city: "Brasília", name: "Aeroporto Internacional de Brasília" },
  { iata: "POA", city: "Porto Alegre", name: "Aeroporto Salgado Filho" },
  { iata: "CXJ", city: "Caxias do Sul", name: "Aeroporto Hugo Cantergiani" },
  { iata: "GRU", city: "São Paulo", name: "Aeroporto de Guarulhos" },
  { iata: "CGH", city: "São Paulo", name: "Aeroporto de Congonhas" },
  { iata: "GIG", city: "Rio de Janeiro", name: "Aeroporto do Galeão" },
  { iata: "SDU", city: "Rio de Janeiro", name: "Aeroporto Santos Dumont" },
  { iata: "SSA", city: "Salvador", name: "Aeroporto Deputado Luís Eduardo Magalhães" },
  { iata: "REC", city: "Recife", name: "Aeroporto Internacional do Recife" },
  { iata: "CNF", city: "Belo Horizonte", name: "Aeroporto de Confins" },
  { iata: "PLU", city: "Belo Horizonte", name: "Aeroporto da Pampulha" },
  { iata: "FLN", city: "Florianópolis", name: "Aeroporto Hercílio Luz" },
  { iata: "FOR", city: "Fortaleza", name: "Aeroporto Pinto Martins" },
  { iata: "CWB", city: "Curitiba", name: "Aeroporto Afonso Pena" },
  { iata: "NAT", city: "Natal", name: "Aeroporto Internacional de Natal" },
  { iata: "MCZ", city: "Maceió", name: "Aeroporto Zumbi dos Palmares" },
  { iata: "VIX", city: "Vitória", name: "Aeroporto de Vitória" },
];

function App() {
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [dataIda, setDataIda] = useState("");
  const [dataVolta, setDataVolta] = useState("");
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);

  function buscaIATA(pesquisa) {
    const entrada = pesquisa.trim().toUpperCase();
    if (entrada.length === 3) return entrada;

    const aeroporto = airports.find(
      (a) =>
        a.city?.toUpperCase() === entrada ||
        a.name?.toUpperCase() === entrada
    );

    return aeroporto?.iata || null;
  }

  function buscaNomeCidade(codigo) {
    const aeroporto = airports.find((a) => a.iata === codigo);
    return aeroporto?.city || "Cidade desconhecida";
  }

  const buscarPromocoes = async () => {
    setLoading(true);
    const origemIATA = buscaIATA(origem);
    const destinoIATA = buscaIATA(destino);

    if (!origemIATA || !destinoIATA) {
      alert("Cidade inválida. Use nomes conhecidos ou código IATA.");
      setLoading(false);
      return;
    }

    if (!dataIda) {
      alert("Informe a data de ida.");
      setLoading(false);
      return;
    }

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
            originLocationCode: origemIATA,
            destinationLocationCode: destinoIATA,
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
          placeholder="Origem (código ou cidade)"
          value={origem}
          onChange={(e) => setOrigem(e.target.value)}
          disabled={loading}
        />
        <input
          placeholder="Destino (código ou cidade)"
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
          disabled={loading}
        />
        <input
          type="date"
          value={dataIda}
          onChange={(e) => setDataIda(e.target.value)}
          disabled={loading}
        />
        <input
          type="date"
          value={dataVolta}
          onChange={(e) => setDataVolta(e.target.value)}
          disabled={loading}
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
            const partida = item?.itineraries?.[0]?.segments?.[0]?.departure?.iataCode;
            const chegada = item?.itineraries?.[0]?.segments?.slice(-1)?.[0]?.arrival?.iataCode;

            if (!partida || !chegada) return null;

            return (
              <li key={index}>
                {partida} ({buscaNomeCidade(partida)}) → {chegada} ({buscaNomeCidade(chegada)}) | {" "}
                <a
                  href={`https://www.google.com/search?q=passagem+${partida}+para+${chegada}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google
                </a>{" | "}
                <a
                  href={`https://www.kayak.com.br/flights/${partida}-${chegada}/${dataIda}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Kayak
                </a>{" | "}
                <a
                  href={`https://www.skyscanner.com.br/transport/flights/${partida.toLowerCase()}/${chegada.toLowerCase()}/${dataIda.replace(/-/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Skyscanner
                </a>{" | "}
                <a
                  href={`https://www.decolar.com/passagens-aereas/${partida}/${chegada}/${dataIda}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Decolar
                </a>{" | "}
                <a
                  href={`https://www.maxmilhas.com.br/busca/passagens-aereas/${partida}/${chegada}/${dataIda}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  MaxMilhas
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
