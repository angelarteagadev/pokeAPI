
import axios from 'axios';
import { PokemonDetail, PokemonSummary } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const STORAGE_KEYS = { USERS: 'pokedex_mock_users', COLLECTION: 'pokedex_mock_collection' };

const getStored = (key: string) => {
  const data = localStorage.getItem(key);
  if (!data && key === STORAGE_KEYS.USERS) {
    const seedUser = [{ id: 1, email: 'trainer@pokemon.com', name: 'Red Trainer', password: btoa('password123') }];
    localStorage.setItem(key, JSON.stringify(seedUser));
    return seedUser;
  }
  return JSON.parse(data || '[]');
};

const setStored = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

export const mockBackend = {
  async register(email: string, pass: string, name?: string) {
    await delay(800);
    const users = getStored(STORAGE_KEYS.USERS);
    if (users.find((u: any) => u.email === email)) throw new Error('User already exists');
    const newUser = { id: Date.now(), email, name: name || email.split('@')[0], password: btoa(pass) };
    users.push(newUser);
    setStored(STORAGE_KEYS.USERS, users);
    return { user: { id: newUser.id, email: newUser.email, name: newUser.name }, token: 'mock-jwt-' + Date.now() };
  },

  async login(email: string, pass: string) {
    await delay(600);
    const users = getStored(STORAGE_KEYS.USERS);
    const user = users.find((u: any) => u.email === email && u.password === btoa(pass));
    if (!user) throw new Error('Invalid credentials');
    return { user: { id: user.id, email: user.email, name: user.name }, token: 'mock-jwt-' + Date.now() };
  },

  async getPokemonList(limit: number, offset: number, search?: string, type?: string) {
    const baseUrl = 'https://pokeapi.co/api/v2';
    let results: any[] = [];
    let count = 0;

    // Lógica prioritaria: Filtro por TIPO
    if (type) {
      const { data } = await axios.get(`${baseUrl}/type/${type}`);
      let typePokemon = data.pokemon.map((p: any) => p.pokemon);
      
      // Si también hay búsqueda, filtramos la lista de tipos
      if (search) {
        typePokemon = typePokemon.filter((p: any) => p.name.includes(search.toLowerCase()));
      }
      
      count = typePokemon.length;
      results = typePokemon.slice(offset, offset + limit);
    } 
    // Lógica: Búsqueda por NOMBRE/ID (sin tipo)
    else if (search) {
      try {
        // Intentamos búsqueda exacta primero
        const { data: p } = await axios.get(`${baseUrl}/pokemon/${search.toLowerCase()}`);
        count = 1;
        results = [p];
      } catch (e) {
        // Si no hay exacta, la PokéAPI no ayuda mucho con búsquedas parciales en /pokemon.
        // Simulamos un comportamiento vacío o podrías traer una lista grande y filtrar.
        return { count: 0, results: [] };
      }
    } 
    // Lógica: Listado normal paginado
    else {
      const { data } = await axios.get(`${baseUrl}/pokemon?limit=${limit}&offset=${offset}`);
      count = data.count;
      results = data.results;
    }

    // Enriquecemos los resultados con imágenes y tipos
    const enrichedResults = await Promise.all(results.map(async (p: any) => {
      // Si ya tenemos los datos completos (desde búsqueda exacta), los usamos
      const d = p.sprites ? p : (await axios.get(p.url)).data;
      return {
        id: d.id,
        name: d.name,
        image: d.sprites.other['official-artwork'].front_default || d.sprites.front_default,
        types: d.types.map((t: any) => t.type.name)
      };
    }));

    return { count, results: enrichedResults };
  },

  async getPokemonDetail(id: string): Promise<PokemonDetail> {
    const { data: d } = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id.toLowerCase()}`);
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
  },

  async getCollection(userId: number) {
    const all = getStored(STORAGE_KEYS.COLLECTION);
    const userItems = all.filter((i: any) => i.userId === userId);
    return Promise.all(userItems.map(async (item: any) => {
      try {
        const details = await this.getPokemonDetail(item.pokemonId.toString());
        return { ...item, details };
      } catch (e) { return item; }
    }));
  },

  async addToCollection(userId: number, pokemonId: number, pokemonName: string, note?: string) {
    const all = getStored(STORAGE_KEYS.COLLECTION);
    if (all.find((i: any) => i.userId === userId && i.pokemonId === pokemonId)) throw new Error('Already in collection');
    const newItem = { id: Date.now(), userId, pokemonId, pokemonName, note, capturedAt: new Date().toISOString() };
    all.push(newItem);
    setStored(STORAGE_KEYS.COLLECTION, all);
    return newItem;
  },

  async updateNote(userId: number, id: number, note: string) {
    const all = getStored(STORAGE_KEYS.COLLECTION);
    const item = all.find((i: any) => i.id === id && i.userId === userId);
    if (!item) throw new Error('Not found');
    item.note = note;
    setStored(STORAGE_KEYS.COLLECTION, all);
    return item;
  },

  async deleteFromCollection(userId: number, id: number) {
    const all = getStored(STORAGE_KEYS.COLLECTION);
    setStored(STORAGE_KEYS.COLLECTION, all.filter((i: any) => !(i.id === id && i.userId === userId)));
  }
};
