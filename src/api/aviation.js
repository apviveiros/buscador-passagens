const API_KEY = "ada548c6d93e418fa8ea375712f6f98a";

export async function buscarVoos(origem, destino) {
  const url = `http://api.aviationstack.com/v1/flights?access_key=${API_KEY}&dep_iata=${origem}&arr_iata=${destino}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Erro ao buscar dados");

  const dados = await res.json();
  return dados.data;
}
