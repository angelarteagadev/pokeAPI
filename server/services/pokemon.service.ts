
import axios from 'axios';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const getList = async (limit: number, offset: number, search?: string, type?: string) => {
  let results: any[] = [];
  let count = 0;

  if (type) {
    const { data } = await axios.get(`${BASE_URL}/type/${type}`);
    let typePokemon = data.pokemon.map((p: any) => p.pokemon);
    if (search) {
      typePokemon = typePokemon.filter((p: any) => p.name.includes(search.toLowerCase()));
    }
    count = typePokemon.length;
    results = typePokemon.slice(offset, offset + limit);
  } else if (search) {
     try {
       const resp = await axios.get(`${BASE_URL}/pokemon/${search.toLowerCase()}`);
       count = 1;
       results = [resp.data];
     } catch (e) {
       return { count: 0, results: [] };
     }
  } else {
    const { data } = await axios.get(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
    count = data.count;
    results = data.results;
  }

  const details = await Promise.all(
    results.map(async (p: any) => {
      const d = p.sprites ? p : (await axios.get(p.url)).data;
      return {
        id: d.id,
        name: d.name,
        image: d.sprites.other['official-artwork'].front_default || d.sprites.front_default,
        types: d.types.map((t: any) => t.type.name)
      };
    })
  );

  return { count, results: details };
};

export const getDetail = async (idOrName: string) => {
  const { data: d } = await axios.get(`${BASE_URL}/pokemon/${idOrName.toLowerCase()}`);
  return {
    id: d.id,
    name: d.name,
    image: d.sprites.other['official-artwork'].front_default || d.sprites.front_default,
    types: d.types.map((t: any) => t.type.name),
    height: d.height,
    weight: d.weight,
    abilities: d.abilities.map((a: any) => a.ability.name),
    stats: {
      hp: d.stats[0].base_stat,
      attack: d.stats[1].base_stat,
      defense: d.stats[2].base_stat,
      specialAttack: d.stats[3].base_stat,
      specialDefense: d.stats[4].base_stat,
      speed: d.stats[5].base_stat,
    }
  };
};
