
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import pokemonRoutes from './routes/pokemon.routes';
import collectionRoutes from './routes/collection.routes';
import aiRoutes from './routes/ai.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pokemon', pokemonRoutes);
app.use('/api/collection', collectionRoutes);
app.use('/api/ai', aiRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || 'Something went wrong on the server';
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`[server]: PokéDex Backend running at http://localhost:${PORT}`);
});
