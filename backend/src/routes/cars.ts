import { Router, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';

export const carsRouter = Router();

carsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const category = req.query.category ? String(req.query.category) : undefined;
    const transmission = req.query.transmission ? String(req.query.transmission) : undefined;
    const fuelType = req.query.fuelType ? String(req.query.fuelType) : undefined;
    const minPrice = req.query.minPrice ? String(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? String(req.query.maxPrice) : undefined;
    const seats = req.query.seats ? String(req.query.seats) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;
    const sortBy = String(req.query.sortBy || 'pricePerDay');
    const sortOrder = String(req.query.sortOrder || 'asc');
    const page = parseInt(String(req.query.page || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '12'))));
    const startDate = req.query.startDate ? String(req.query.startDate) : undefined;
    const endDate = req.query.endDate ? String(req.query.endDate) : undefined;
    const available = req.query.available ? String(req.query.available) : undefined;

    const where: Prisma.CarWhereInput = {};
    if (category) { where.category = { in: category.split(',') as any[] }; }
    if (transmission) where.transmission = transmission as any;
    if (fuelType) { where.fuelType = { in: fuelType.split(',') as any[] }; }
    if (minPrice || maxPrice) {
      where.pricePerDay = {};
      if (minPrice) where.pricePerDay.gte = parseFloat(minPrice);
      if (maxPrice) where.pricePerDay.lte = parseFloat(maxPrice);
    }
    if (seats) where.seats = { gte: parseInt(seats) };
    if (search) {
      where.OR = [
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (available !== undefined) where.available = available === 'true';
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      where.bookings = { none: { AND: [{ startDate: { lt: end } }, { endDate: { gt: start } }, { status: { in: ['CONFIRMED', 'ACTIVE', 'PENDING'] } }] } };
    }

    const skip = (Math.max(1, page) - 1) * limit;
    const allowedSortFields = ['pricePerDay', 'brand', 'year', 'seats', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'pricePerDay';
    const order = sortOrder === 'desc' ? 'desc' : 'asc';

    const [cars, total] = await Promise.all([
      prisma.car.findMany({ where, orderBy: { [sortField]: order }, skip, take: limit }),
      prisma.car.count({ where }),
    ]);
    res.json({ cars, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('List cars error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

carsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const car = await prisma.car.findUnique({ where: { id: String(req.params.id) } });
    if (!car) { res.status(404).json({ error: 'Car not found' }); return; }
    res.json(car);
  } catch (error) {
    console.error('Get car error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

carsRouter.get('/:id/availability', async (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate ? String(req.query.startDate) : undefined;
    const endDate = req.query.endDate ? String(req.query.endDate) : undefined;
    if (!startDate || !endDate) { res.status(400).json({ error: 'startDate and endDate are required' }); return; }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const car = await prisma.car.findUnique({ where: { id: String(req.params.id) } });
    if (!car) { res.status(404).json({ error: 'Car not found' }); return; }
    const conflictingBookings = await prisma.booking.findMany({
      where: { carId: String(req.params.id), status: { in: ['CONFIRMED', 'ACTIVE', 'PENDING'] }, AND: [{ startDate: { lt: end } }, { endDate: { gt: start } }] },
      select: { startDate: true, endDate: true, status: true },
    });
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = days * car.pricePerDay;
    res.json({ available: car.available && conflictingBookings.length === 0, pricePerDay: car.pricePerDay, days, totalPrice, conflictingDates: conflictingBookings });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
