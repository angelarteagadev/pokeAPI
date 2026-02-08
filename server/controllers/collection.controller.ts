
import * as pokeService from '../services/pokemon.service';

interface CollectionItem {
  id: number;
  userId: number;
  pokemonId: number;
  pokemonName: string;
  note?: string;
  team?: string;
  capturedAt: string;
}

const MOCK_COLLECTION: CollectionItem[] = [];
let nextId = 1;

export const getCollection = async (userId: number) => {
  const userItems = MOCK_COLLECTION.filter(item => item.userId === userId);
  
  const enriched = await Promise.all(userItems.map(async (item) => {
    try {
      const details = await pokeService.getDetail(item.pokemonId.toString());
      return { ...item, details };
    } catch (e) {
      return item;
    }
  }));
  
  return enriched;
};

export const addToCollection = async (userId: number, data: any) => {
  const targetTeam = data.team || 'Personal';
  const teamItems = MOCK_COLLECTION.filter(item => item.userId === userId && item.team === targetTeam);
  
  // REGLAMENTO: Límite de 6 Pokémon POR EQUIPO
  if (teamItems.length >= 6) {
    throw { status: 400, message: `El equipo ${targetTeam} ya está lleno (máximo 6 Pokémon).` };
  }

  const existsInCollection = MOCK_COLLECTION.find(item => item.userId === userId && item.pokemonId === data.pokemonId);
  if (existsInCollection) throw { status: 400, message: 'Este Pokémon ya forma parte de uno de tus equipos.' };

  const newItem: CollectionItem = {
    id: nextId++,
    userId,
    pokemonId: data.pokemonId,
    pokemonName: data.pokemonName,
    note: data.note,
    team: targetTeam,
    capturedAt: new Date().toISOString(),
  };

  MOCK_COLLECTION.push(newItem);
  return newItem;
};

export const updateNote = async (userId: number, id: number, data: any) => {
  const item = MOCK_COLLECTION.find(i => i.id === id && i.userId === userId);
  if (!item) throw { status: 404, message: 'Registro no encontrado.' };
  
  // Si se intenta cambiar de equipo, validar el límite en el equipo destino
  if (data.team && data.team !== item.team) {
    const targetTeamItems = MOCK_COLLECTION.filter(i => i.userId === userId && i.team === data.team);
    if (targetTeamItems.length >= 6) {
      throw { status: 400, message: `El equipo ${data.team} ya está lleno.` };
    }
  }

  if (data.note !== undefined) item.note = data.note;
  if (data.team !== undefined) item.team = data.team;
  
  return item;
};

export const removeFromCollection = async (userId: number, id: number) => {
  const index = MOCK_COLLECTION.findIndex(i => i.id === id && i.userId === userId);
  if (index === -1) throw { status: 404, message: 'Registro no encontrado.' };
  
  MOCK_COLLECTION.splice(index, 1);
};
