
import * as pokeService from '../services/pokemon.service';

// Mocked database for personal collections
interface CollectionItem {
  id: number;
  userId: number;
  pokemonId: number;
  pokemonName: string;
  note?: string;
  capturedAt: string;
}

const MOCK_COLLECTION: CollectionItem[] = [];
let nextId = 1;

export const getCollection = async (userId: number) => {
  const userItems = MOCK_COLLECTION.filter(item => item.userId === userId);
  
  // Enrich with sprites/types from PokéAPI proxy for the UI
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
  const exists = MOCK_COLLECTION.find(item => item.userId === userId && item.pokemonId === data.pokemonId);
  if (exists) throw { status: 400, message: 'Pokémon already in your collection' };

  const newItem: CollectionItem = {
    id: nextId++,
    userId,
    pokemonId: data.pokemonId,
    pokemonName: data.pokemonName,
    note: data.note,
    capturedAt: new Date().toISOString(),
  };

  MOCK_COLLECTION.push(newItem);
  return newItem;
};

export const updateNote = async (userId: number, id: number, note: string) => {
  const item = MOCK_COLLECTION.find(i => i.id === id && i.userId === userId);
  if (!item) throw { status: 404, message: 'Collection item not found' };
  
  item.note = note;
  return item;
};

export const removeFromCollection = async (userId: number, id: number) => {
  const index = MOCK_COLLECTION.findIndex(i => i.id === id && i.userId === userId);
  if (index === -1) throw { status: 404, message: 'Collection item not found' };
  
  MOCK_COLLECTION.splice(index, 1);
};
