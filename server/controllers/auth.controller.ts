
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Seed initial test user: trainer@pokemon.com / password123
const testPasswordHash = bcrypt.hashSync('password123', 10);

// Mock DB persistente en memoria del servidor con usuario inicial
const MOCK_USERS: any[] = [
  {
    id: 1,
    email: 'trainer@pokemon.com',
    password: testPasswordHash,
    name: 'Red Trainer'
  }
]; 

export const register = async (data: any) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = { 
    id: Date.now(), 
    email: data.email, 
    password: hashedPassword, 
    name: data.name || data.email.split('@')[0] 
  };
  MOCK_USERS.push(user);
  
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
  const { password, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

export const login = async (data: any) => {
  const user = MOCK_USERS.find(u => u.email === data.email);
  if (!user) throw { status: 401, message: 'User not found' };
  
  const isValid = await bcrypt.compare(data.password, user.password);
  if (!isValid) throw { status: 401, message: 'Invalid credentials' };
  
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
  const { password, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};
