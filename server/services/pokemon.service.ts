
import axios from 'axios';

const BASE_URL = 'https://pokeapi.co/api/v2';

const GENERATIONS: Record<string, { start: number, end: number }> = {
  '1': { start: 1, end: 151 },
  '2': { start: 152, end: 251 },
  '3': { start: 252, end: 386 },
  '4': { start: 387, end: 493 },
  '5': { start: 494, end: 649 },
  '6': { start: 650, end: 721 },
  '7': { start: 722, end: 809 },
  '8': { start: 810, end: 905 },
  '9': { start: 906, end: 1025 },
};

export const getList = async (limit: number, offset: number, search?: string, type?: string, gen?: string) => {
  let results: any[] = [];
  let count = 0;

  // Prioritize Generation Filter if present
  if (gen && GENERATIONS[gen]) {
    const { start, end } = GENERATIONS[gen];
    // This is a bit heavy because PokeAPI doesn't allow range filtering in /pokemon easily
    // We fetch a list of all pokemon in that range
    const { data } = await axios.get(`${BASE_URL}/pokemon?limit=${end - start + 1}&offset=${start - 1}`);
    let genPokemon = data.results;

    if (type) {
        // If type is also selected, we need to intersect
        const typeData = (await axios.get(`${BASE_URL}/type/${type}`)).data;
        const typePokemonNames = typeData.pokemon.map((p: any) => p.pokemon.name);
        genPokemon = genPokemon.filter((p: any) => typePokemonNames.includes(p.name));
    }

    if (search) {
      genPokemon = genPokemon.filter((p: any) => p.name.includes(search.toLowerCase()));
    }

    count = genPokemon.length;
    results = genPokemon.slice(offset, offset + limit);
  } 
  else if (type) {
    const { data } = await axios.get(`${BASE_URL}/type/${type}`);
    let typePokemon = data.pokemon.map((p: any) => p.pokemon);
    if (search) {
      typePokemon = typePokemon.filter((p: any) => p.name.includes(search.toLowerCase()));
    }
    count = typePokemon.length;
    results = typePokemon.slice(offset, offset + limit);
  } 
  else if (search) {
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
