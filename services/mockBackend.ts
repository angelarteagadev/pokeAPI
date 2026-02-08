
import axios from 'axios';
import { PokemonDetail, PokemonSummary } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const STORAGE_KEYS = { USERS: 'pokedex_mock_users', COLLECTION: 'pokedex_mock_collection' };

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
    if (users.find((u: any) => u.email === email)) throw new Error('Usuario ya existe.');
    const newUser = { id: Date.now(), email, name: name || email.split('@')[0], password: btoa(pass) };
    users.push(newUser);
    setStored(STORAGE_KEYS.USERS, users);
    return { user: { id: newUser.id, email: newUser.email, name: newUser.name }, token: 'mock-jwt-' + Date.now() };
  },

  async login(email: string, pass: string) {
    await delay(600);
    const users = getStored(STORAGE_KEYS.USERS);
    const user = users.find((u: any) => u.email === email && u.password === btoa(pass));
    if (!user) throw new Error('Credenciales inválidas.');
    return { user: { id: user.id, email: user.email, name: user.name }, token: 'mock-jwt-' + Date.now() };
  },

  async getPokemonList(limit: number, offset: number, search?: string, type?: string, gen?: string) {
    const baseUrl = 'https://pokeapi.co/api/v2';
    let results: any[] = [];
    let count = 0;

    if (gen && GENERATIONS[gen]) {
      const { start, end } = GENERATIONS[gen];
      const totalInRange = end - start + 1;
      const { data } = await axios.get(`${baseUrl}/pokemon?limit=${totalInRange}&offset=${start - 1}`);
      let genPokemon = data.results;
      if (type) {
        const typeData = (await axios.get(`${baseUrl}/type/${type}`)).data;
        const typeNames = new Set(typeData.pokemon.map((p: any) => p.pokemon.name));
        genPokemon = genPokemon.filter((p: any) => typeNames.has(p.name));
      }
      if (search) genPokemon = genPokemon.filter((p: any) => p.name.includes(search.toLowerCase()));
      count = genPokemon.length;
      results = genPokemon.slice(offset, offset + limit);
    } 
    else if (type) {
      const { data } = await axios.get(`${baseUrl}/type/${type}`);
      let typePokemon = data.pokemon.map((p: any) => p.pokemon);
      if (search) typePokemon = typePokemon.filter((p: any) => p.name.includes(search.toLowerCase()));
      count = typePokemon.length;
      results = typePokemon.slice(offset, offset + limit);
    } 
    else if (search) {
      try {
        const { data: p } = await axios.get(`${baseUrl}/pokemon/${search.toLowerCase()}`);
        count = 1;
        results = [p];
      } catch (e) { return { count: 0, results: [] }; }
    } 
    else {
      const { data } = await axios.get(`${baseUrl}/pokemon?limit=${limit}&offset=${offset}`);
      count = data.count;
      results = data.results;
    }

    const enrichedResults = await Promise.all(results.map(async (p: any) => {
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

  async addToCollection(userId: number, pokemonId: number, pokemonName: string, note?: string, team?: string) {
    const targetTeam = team || 'Personal';
    const all = getStored(STORAGE_KEYS.COLLECTION);
    const teamItems = all.filter((i: any) => i.userId === userId && i.team === targetTeam);
    
    // REGLAMENTO: Máximo 6 POR EQUIPO
    if (teamItems.length >= 6) throw new Error(`El equipo ${targetTeam} ya está lleno.`);
    
    if (all.find((i: any) => i.userId === userId && i.pokemonId === pokemonId)) throw new Error('Pokémon ya capturado en tu colección global.');
    
    const newItem = { id: Date.now(), userId, pokemonId, pokemonName, note, team: targetTeam, capturedAt: new Date().toISOString() };
    all.push(newItem);
    setStored(STORAGE_KEYS.COLLECTION, all);
    return newItem;
  },

  async updateNote(userId: number, id: number, note: string, team?: string) {
    const all = getStored(STORAGE_KEYS.COLLECTION);
    const item = all.find((i: any) => i.id === id && i.userId === userId);
    if (!item) throw new Error('Registro no encontrado.');
    
    if (team && team !== item.team) {
      const teamCount = all.filter((i: any) => i.userId === userId && i.team === team).length;
      if (teamCount >= 6) throw new Error(`El equipo ${team} ya tiene el máximo de 6 Pokémon.`);
    }

    if (note !== undefined) item.note = note;
    if (team !== undefined) item.team = team;
    setStored(STORAGE_KEYS.COLLECTION, all);
    return item;
  },

  async deleteFromCollection(userId: number, id: number) {
    const all = getStored(STORAGE_KEYS.COLLECTION);
    setStored(STORAGE_KEYS.COLLECTION, all.filter((i: any) => !(i.id === id && i.userId === userId)));
  }
};
