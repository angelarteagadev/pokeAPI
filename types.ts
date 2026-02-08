
export interface User {
  id: number;
  email: string;
  name?: string;
}

export interface PokemonSummary {
  id: number;
  name: string;
  image: string;
  types: string[];
}

export interface PokemonDetail extends PokemonSummary {
  height: number;
  weight: number;
  abilities: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
}

export interface CollectionItem {
  id: number;
  pokemonId: number;
  pokemonName: string;
  note?: string;
  team?: string;
  capturedAt: string;
  details?: PokemonDetail;
}

export interface AuthResponse {
  token: string;
  user: User;
}
