
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import * as collectionController from '../controllers/collection.controller';

const router = Router();

const addToCollectionSchema = z.object({
  pokemonId: z.number(),
  pokemonName: z.string(),
  note: z.string().optional(),
});

const updateNoteSchema = z.object({
  note: z.string(),
});

router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Cast to AuthRequest to access the custom user property added by authentication middleware
    const authReq = req as AuthRequest;
    const result = await collectionController.getCollection(authReq.user!.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const data = addToCollectionSchema.parse(req.body);
    const result = await collectionController.addToCollection(authReq.user!.id, data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const data = updateNoteSchema.parse(req.body);
    const result = await collectionController.updateNote(authReq.user!.id, parseInt(req.params.id), data.note);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    await collectionController.removeFromCollection(authReq.user!.id, parseInt(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
