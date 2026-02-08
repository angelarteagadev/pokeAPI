
import { Router, Request, Response, NextFunction } from 'express';
import { GoogleGenAI } from "@google/genai";
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

// Type the route handler parameters using the standard Express Request 
// to ensure the 'body' property is recognized correctly.
router.post('/describe', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, types, stats } = req.body;
    
    // Always use process.env.API_KEY directly as per @google/genai guidelines.
    // Initializing right before the call ensures the latest configuration.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Act as a professional Pokémon competitive trainer. Analyze the Pokémon "${name}" which has the types [${types.join(', ')}] and the following stats: ${JSON.stringify(stats)}. Provide a concise 2-paragraph strategic insight covering its best role in a team and potential counters. Be technical but clear.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    // Directly access .text property from GenerateContentResponse
    res.json({ insight: response.text });
  } catch (err) {
    next(err);
  }
});

export default router;
