import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authenticate, requireAdmin } from '../middleware/auth';

export const adminRouter = Router();

adminRouter.use(authenticate);
adminRouter.use(requireAdmin);

adminRouter.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [totalCars, totalUsers, totalBookings, activeBookings, bookings] = await Promise.all([
      prisma.car.count(),
      prisma.user.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: { in: ['CONFIRMED', 'ACTIVE'] } } }),
      prisma.booking.findMany({ select: { totalPrice: true, status: true } }),
    ]);
    const totalRevenue = bookings.filter((b) => b.status !== 'CANCELLED').reduce((sum, b) => sum + b.totalPrice, 0);
    const bookingsByStatus = {
      pending: bookings.filter((b) => b.status === 'PENDING').length,
      confirmed: bookings.filter((b) => b.status === 'CONFIRMED').length,
      active: bookings.filter((b) => b.status === 'ACTIVE').length,
      completed: bookings.filter((b) => b.status === 'COMPLETED').length,
      cancelled: bookings.filter((b) => b.status === 'CANCELLED').length,
    };
    res.json({ totalCars, totalUsers, totalBookings, activeBookings, totalRevenue, bookingsByStatus });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.get('/cars', async (req: Request, res: Response) => {
  try {
    const page = parseInt(String(req.query.page || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '20'))));
    const search = req.query.search ? String(req.query.search) : undefined;
    const skip = (Math.max(1, page) - 1) * limit;
    const where: any = {};
    if (search) {
      where.OR = [
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [cars, total] = await Promise.all([
      prisma.car.findMany({ where, include: { _count: { select: { bookings: true } } }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.car.count({ where }),
    ]);
    res.json({ cars, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Admin list cars error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const carSchema = z.object({
  brand: z.string().min(1), model: z.string().min(1),
  year: z.number().int().min(2000).max(2030),
  category: z.enum(['ECONOMY', 'COMPACT', 'MIDSIZE', 'FULLSIZE', 'SUV', 'LUXURY', 'VAN', 'SPORTS']),
  transmission: z.enum(['AUTOMATIC', 'MANUAL']),
  fuelType: z.enum(['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID']),
  seats: z.number().int().min(1).max(15),
  doors: z.number().int().min(2).max(6).optional(),
  luggage: z.number().int().min(0).max(10).optional(),
  pricePerDay: z.number().positive(),
  imageUrl: z.string().url(),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  mileage: z.string().optional(), color: z.string().optional(),
  licensePlate: z.string().optional(), available: z.boolean().optional(),
});

adminRouter.post('/cars', async (req: Request, res: Response) => {
  try {
    const data = carSchema.parse(req.body);
    const car = await prisma.car.create({ data });
    res.status(201).json(car);
  } catch (error) {
    if (error instanceof z.ZodError) { res.status(400).json({ error: 'Validation failed', details: error.errors }); return; }
    console.error('Admin create car error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.patch('/cars/:id', async (req: Request, res: Response) => {
  try {
    const data = carSchema.partial().parse(req.body);
    const car = await prisma.car.update({ where: { id: String(req.params.id) }, data });
    res.json(car);
  } catch (error) {
    if (error instanceof z.ZodError) { res.status(400).json({ error: 'Validation failed', details: error.errors }); return; }
    console.error('Admin update car error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.delete('/cars/:id', async (req: Request, res: Response) => {
  try {
    const activeBookings = await prisma.booking.count({
      where: { carId: String(req.params.id), status: { in: ['CONFIRMED', 'ACTIVE', 'PENDING'] } },
    });
    if (activeBookings > 0) { res.status(400).json({ error: 'Cannot delete car with active bookings' }); return; }
    await prisma.booking.deleteMany({ where: { carId: String(req.params.id) } });
    await prisma.car.delete({ where: { id: String(req.params.id) } });
    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Admin delete car error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.get('/bookings', async (req: Request, res: Response) => {
  try {
    const page = parseInt(String(req.query.page || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '20'))));
    const status = req.query.status ? String(req.query.status) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;
    const skip = (Math.max(1, page) - 1) * limit;
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { car: { brand: { contains: search, mode: 'insensitive' } } },
        { car: { model: { contains: search, mode: 'insensitive' } } },
      ];
    }
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where, include: { car: true, user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } }, pickupLocation: true, returnLocation: true },
        orderBy: { createdAt: 'desc' }, skip, take: limit,
      }),
      prisma.booking.count({ where }),
    ]);
    res.json({ bookings, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Admin list bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.patch('/bookings/:id', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' }); return;
    }
    const booking = await prisma.booking.update({
      where: { id: String(req.params.id) }, data: { status },
      include: { car: true, user: { select: { id: true, email: true, firstName: true, lastName: true } }, pickupLocation: true, returnLocation: true },
    });
    res.json(booking);
  } catch (error) {
    console.error('Admin update booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.get('/users', async (req: Request, res: Response) => {
  try {
    const page = parseInt(String(req.query.page || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '20'))));
    const search = req.query.search ? String(req.query.search) : undefined;
    const skip = (Math.max(1, page) - 1) * limit;
    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, createdAt: true, _count: { select: { bookings: true } } },
        orderBy: { createdAt: 'desc' }, skip, take: limit,
      }),
      prisma.user.count({ where }),
    ]);
    res.json({ users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Admin list users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.get('/locations', async (_req: Request, res: Response) => {
  try {
    const locations = await prisma.location.findMany({
      include: { _count: { select: { pickupBookings: true, returnBookings: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(locations);
  } catch (error) {
    console.error('Admin list locations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const locationSchema = z.object({
  name: z.string().min(1), address: z.string().min(1), city: z.string().min(1),
  state: z.string().optional(), country: z.string().optional(),
  zipCode: z.string().optional(), latitude: z.number().optional(), longitude: z.number().optional(),
});

adminRouter.post('/locations', async (req: Request, res: Response) => {
  try {
    const data = locationSchema.parse(req.body);
    const location = await prisma.location.create({ data });
    res.status(201).json(location);
  } catch (error) {
    if (error instanceof z.ZodError) { res.status(400).json({ error: 'Validation failed', details: error.errors }); return; }
    console.error('Admin create location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.patch('/locations/:id', async (req: Request, res: Response) => {
  try {
    const data = locationSchema.partial().parse(req.body);
    const location = await prisma.location.update({ where: { id: String(req.params.id) }, data });
    res.json(location);
  } catch (error) {
    if (error instanceof z.ZodError) { res.status(400).json({ error: 'Validation failed', details: error.errors }); return; }
    console.error('Admin update location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.delete('/locations/:id', async (req: Request, res: Response) => {
  try {
    const activeBookings = await prisma.booking.count({
      where: { OR: [{ pickupLocationId: String(req.params.id) }, { returnLocationId: String(req.params.id) }], status: { in: ['CONFIRMED', 'ACTIVE', 'PENDING'] } },
    });
    if (activeBookings > 0) { res.status(400).json({ error: 'Cannot delete location with active bookings' }); return; }
    await prisma.location.delete({ where: { id: String(req.params.id) } });
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Admin delete location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
