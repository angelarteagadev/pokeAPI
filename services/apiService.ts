
import axios from 'axios';
import { mockBackend } from './mockBackend';

const API_URL = 'http://localhost:3001/api';

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

  async getPokemonList(limit: number, offset: number, search?: string, type?: string, gen?: string) {
    await checkServer();
    if (isServerDown) return mockBackend.getPokemonList(limit, offset, search, type, gen);
    try {
      const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
      if (search) params.append('search', search);
      if (type) params.append('type', type);
      if (gen) params.append('gen', gen);
      const { data } = await axios.get(`${API_URL}/pokemon?${params.toString()}`);
      return data;
    } catch (e) {
      return mockBackend.getPokemonList(limit, offset, search, type, gen);
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

  async getCollection() {
    const user = getUser();
    if (isServerDown) return mockBackend.getCollection(user?.id);
    const { data } = await axios.get(`${API_URL}/collection`, { headers: getAuthHeader() });
    return data;
  },

  async addToCollection(pokemonId: number, pokemonName: string, note?: string, team?: string) {
    const user = getUser();
    if (isServerDown) return mockBackend.addToCollection(user?.id, pokemonId, pokemonName, note, team);
    const { data } = await axios.post(`${API_URL}/collection`, { pokemonId, pokemonName, note, team }, { headers: getAuthHeader() });
    return data;
  },

  async updateCollectionNote(id: number, note?: string, team?: string) {
    const user = getUser();
    if (isServerDown) return mockBackend.updateNote(user?.id, id, note || '', team);
    const { data } = await axios.put(`${API_URL}/collection/${id}`, { note, team }, { headers: getAuthHeader() });
    return data;
  },

  async deleteFromCollection(id: number) {
    const user = getUser();
    if (isServerDown) return mockBackend.deleteFromCollection(user?.id, id);
    const { data } = await axios.delete(`${API_URL}/collection/${id}`, { headers: getAuthHeader() });
    return data;
  },

  async getAiInsight(name: string, types: string[], stats: any) {
    if (isServerDown) return `Strategic analysis for ${name}: Given its ${types.join('/')} typing and current base stats, it functions primarily as a powerful asset for any trainer. Focus on maximizing its natural strengths during battle.`;
    const { data } = await axios.post(`${API_URL}/ai/describe`, { name, types, stats }, { headers: getAuthHeader() });
    return data.insight;
  }
};
