import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';

export const locationsRouter = Router();

locationsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const locations = await prisma.location.findMany({ orderBy: { name: 'asc' } });
    res.json(locations);
  } catch (error) {
    console.error('List locations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

locationsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const location = await prisma.location.findUnique({ where: { id: String(req.params.id) } });
    if (!location) { res.status(404).json({ error: 'Location not found' }); return; }
    res.json(location);
  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
