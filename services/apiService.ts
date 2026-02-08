
import axios from 'axios';
import { mockBackend } from './mockBackend';

const API_URL = 'http://localhost:3001/api';

// Función para verificar si el servidor real está disponible
let isServerDown = false;
const checkServer = async () => {
  try {
    await axios.get(`${API_URL}/pokemon?limit=1`, { timeout: 1000 });
    isServerDown = false;
  } catch (e) {
    isServerDown = true;
  }
};

const getAuthHeader = () => {
  const token = localStorage.getItem('pokedex_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getUser = () => {
  const user = localStorage.getItem('pokedex_user');
  return user ? JSON.parse(user) : null;
};

export const apiService = {
  // Auth
  async login(email: string, password: string) {
    await checkServer();
    if (isServerDown) return mockBackend.login(email, password);
    const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
    return data;
  },

  async register(email: string, password: string, name?: string) {
    await checkServer();
    if (isServerDown) return mockBackend.register(email, password, name);
    const { data } = await axios.post(`${API_URL}/auth/register`, { email, password, name });
    return data;
  },

  // Pokemon Proxy
  async getPokemonList(limit: number, offset: number, search?: string, type?: string) {
    await checkServer();
    if (isServerDown) return mockBackend.getPokemonList(limit, offset, search, type);
    try {
      const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
      if (search) params.append('search', search);
      if (type) params.append('type', type);
      const { data } = await axios.get(`${API_URL}/pokemon?${params.toString()}`);
      return data;
    } catch (e) {
      return mockBackend.getPokemonList(limit, offset, search, type);
    }
  },

  async getPokemonDetail(nameOrId: string) {
    if (isServerDown) return mockBackend.getPokemonDetail(nameOrId);
    try {
      const { data } = await axios.get(`${API_URL}/pokemon/${nameOrId}`);
      return data;
    } catch (e) {
      return mockBackend.getPokemonDetail(nameOrId);
    }
  },

  // ... (resto de métodos igual)
  async getCollection() {
    const user = getUser();
    if (isServerDown) return mockBackend.getCollection(user?.id);
    const { data } = await axios.get(`${API_URL}/collection`, { headers: getAuthHeader() });
    return data;
  },

  async addToCollection(pokemonId: number, pokemonName: string, note?: string) {
    const user = getUser();
    if (isServerDown) return mockBackend.addToCollection(user?.id, pokemonId, pokemonName, note);
    const { data } = await axios.post(`${API_URL}/collection`, { pokemonId, pokemonName, note }, { headers: getAuthHeader() });
    return data;
  },

  async updateCollectionNote(id: number, note: string) {
    const user = getUser();
    if (isServerDown) return mockBackend.updateNote(user?.id, id, note);
    const { data } = await axios.put(`${API_URL}/collection/${id}`, { note }, { headers: getAuthHeader() });
    return data;
  },

  async deleteFromCollection(id: number) {
    const user = getUser();
    if (isServerDown) return mockBackend.deleteFromCollection(user?.id, id);
    const { data } = await axios.delete(`${API_URL}/collection/${id}`, { headers: getAuthHeader() });
    return data;
  },

  async getAiInsight(name: string, types: string[], stats: any) {
    if (isServerDown) {
        return `As a ${types.join('/')} type, ${name} is particularly strong in combat. Its base stats suggest a tactical focus on ${Object.keys(stats).sort((a,b) => stats[b]-stats[a])[0]}. (Simulation mode active)`;
    }
    const { data } = await axios.post(`${API_URL}/ai/describe`, { name, types, stats }, { headers: getAuthHeader() });
    return data.insight;
  }
};
