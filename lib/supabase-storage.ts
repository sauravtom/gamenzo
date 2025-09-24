import { supabase, supabaseAdmin, type Game, type GameInsert, type GameUpdate } from './supabase'

export interface GameStorageInterface {
  findMany(options?: { 
    where?: { userId?: string };
    orderBy?: { createdAt?: 'asc' | 'desc' };
  }): Promise<Game[]>;
  
  findUnique(options: { where: { slug?: string; id?: string } }): Promise<Game | null>;
  
  create(options: { 
    data: {
      name: string;
      slug: string;
      description?: string;
      author?: string;
      code: string;
      userId?: string;
    }
  }): Promise<Game>;
  
  update(options: {
    where: { slug: string };
    data: {
      name?: string;
      description?: string;
      author?: string;
      code?: string;
    }
  }): Promise<Game>;
  
  delete(options: { where: { slug?: string; id?: string } }): Promise<Game>;
}

class SupabaseGameStorage implements GameStorageInterface {
  
  // Get all games with optional filtering and ordering
  async findMany(options?: { 
    where?: { userId?: string };
    orderBy?: { createdAt?: 'asc' | 'desc' };
  }): Promise<Game[]> {
    let query = supabase
      .from('games')
      .select('*');
    
    // Apply where filter
    if (options?.where?.userId) {
      query = query.eq('user_id', options.where.userId);
    }
    
    // Apply ordering
    if (options?.orderBy?.createdAt) {
      query = query.order('created_at', { ascending: options.orderBy.createdAt === 'asc' });
    } else {
      // Default ordering by created_at desc
      query = query.order('created_at', { ascending: false });
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching games:', error);
      throw new Error(`Failed to fetch games: ${error.message}`);
    }
    
    return data || [];
  }

  // Find a single game by slug or id
  async findUnique(options: { where: { slug?: string; id?: string } }): Promise<Game | null> {
    let query = supabase.from('games').select('*');
    
    if (options.where.slug) {
      query = query.eq('slug', options.where.slug);
    } else if (options.where.id) {
      query = query.eq('id', options.where.id);
    } else {
      throw new Error('Must provide either slug or id');
    }
    
    const { data, error } = await query.single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching game:', error);
      throw new Error(`Failed to fetch game: ${error.message}`);
    }
    
    return data;
  }

  // Create a new game
  async create(options: { 
    data: {
      name: string;
      slug: string;
      description?: string;
      author?: string;
      code: string;
      userId?: string;
    }
  }): Promise<Game> {
    const gameData: GameInsert = {
      name: options.data.name,
      slug: options.data.slug,
      description: options.data.description || null,
      author: options.data.author || null,
      code: options.data.code,
      user_id: options.data.userId || null,
    };
    
    const { data, error } = await supabase
      .from('games')
      .insert(gameData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating game:', error);
      if (error.code === '23505') {
        throw new Error('A game with this slug already exists');
      }
      throw new Error(`Failed to create game: ${error.message}`);
    }
    
    return data;
  }

  // Update an existing game
  async update(options: {
    where: { slug: string };
    data: {
      name?: string;
      description?: string;
      author?: string;
      code?: string;
    }
  }): Promise<Game> {
    const updateData: GameUpdate = {};
    
    if (options.data.name !== undefined) updateData.name = options.data.name;
    if (options.data.description !== undefined) updateData.description = options.data.description;
    if (options.data.author !== undefined) updateData.author = options.data.author;
    if (options.data.code !== undefined) updateData.code = options.data.code;
    
    const { data, error } = await supabase
      .from('games')
      .update(updateData)
      .eq('slug', options.where.slug)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating game:', error);
      if (error.code === 'PGRST116') {
        throw new Error('Game not found');
      }
      throw new Error(`Failed to update game: ${error.message}`);
    }
    
    return data;
  }

  // Delete a game
  async delete(options: { where: { slug?: string; id?: string } }): Promise<Game> {
    let query = supabase.from('games').delete().select();
    
    if (options.where.slug) {
      query = query.eq('slug', options.where.slug);
    } else if (options.where.id) {
      query = query.eq('id', options.where.id);
    } else {
      throw new Error('Must provide either slug or id');
    }
    
    const { data, error } = await query.single();
    
    if (error) {
      console.error('Error deleting game:', error);
      if (error.code === 'PGRST116') {
        throw new Error('Game not found');
      }
      throw new Error(`Failed to delete game: ${error.message}`);
    }
    
    return data;
  }
}

// Create a singleton instance
const supabaseGameStorage = new SupabaseGameStorage();

// Export an object that mimics the Prisma client structure
export default {
  game: supabaseGameStorage
};

// Helper functions for server-side operations with admin privileges
export const adminGameStorage = {
  async createGame(gameData: GameInsert): Promise<Game> {
    const { data, error } = await supabaseAdmin
      .from('games')
      .insert(gameData)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create game: ${error.message}`);
    }
    
    return data;
  },
  
  async getAllGames(): Promise<Game[]> {
    const { data, error } = await supabaseAdmin
      .from('games')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Failed to fetch games: ${error.message}`);
    }
    
    return data || [];
  }
};
