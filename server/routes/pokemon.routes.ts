
import { Router } from 'express';
import * as pokeService from '../services/pokemon.service';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const search = req.query.search as string;
    const type = req.query.type as string;
    const gen = req.query.gen as string;
    const result = await pokeService.getList(limit, offset, search, type, gen);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/:nameOrId', async (req, res, next) => {
  try {
    const result = await pokeService.getDetail(req.params.nameOrId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
