import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

export const bookingsRouter = Router();

const createBookingSchema = z.object({
  carId: z.string().uuid(),
  pickupLocationId: z.string().uuid(),
  returnLocationId: z.string().uuid(),
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().transform((s) => new Date(s)),
  notes: z.string().optional(),
});

bookingsRouter.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const status = req.query?.status ? String(req.query.status) : undefined;
    const page = parseInt(String(req.query?.page || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query?.limit || '10'))));
    const skip = (Math.max(1, page) - 1) * limit;
    const where: any = { userId: req.user!.userId };
    if (status) where.status = status;
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({ where, include: { car: true, pickupLocation: true, returnLocation: true }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.booking.count({ where }),
    ]);
    res.json({ bookings, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('List bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

bookingsRouter.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: { id: String(req.params?.id), userId: req.user!.userId },
      include: { car: true, pickupLocation: true, returnLocation: true, user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } } },
    });
    if (!booking) { res.status(404).json({ error: 'Booking not found' }); return; }
    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

bookingsRouter.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = createBookingSchema.parse(req.body);
    const car = await prisma.car.findUnique({ where: { id: data.carId } });
    if (!car) { res.status(404).json({ error: 'Car not found' }); return; }
    if (!car.available) { res.status(400).json({ error: 'Car is not available' }); return; }
    const [pickupLoc, returnLoc] = await Promise.all([
      prisma.location.findUnique({ where: { id: data.pickupLocationId } }),
      prisma.location.findUnique({ where: { id: data.returnLocationId } }),
    ]);
    if (!pickupLoc || !returnLoc) { res.status(404).json({ error: 'Location not found' }); return; }
    const conflicting = await prisma.booking.findFirst({
      where: { carId: data.carId, status: { in: ['CONFIRMED', 'ACTIVE', 'PENDING'] }, AND: [{ startDate: { lt: data.endDate } }, { endDate: { gt: data.startDate } }] },
    });
    if (conflicting) { res.status(409).json({ error: 'Car is already booked for the selected dates' }); return; }
    const days = Math.ceil((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) { res.status(400).json({ error: 'End date must be after start date' }); return; }
    const totalPrice = days * car.pricePerDay;
    const booking = await prisma.booking.create({
      data: { userId: req.user!.userId, carId: data.carId, pickupLocationId: data.pickupLocationId, returnLocationId: data.returnLocationId, startDate: data.startDate, endDate: data.endDate, totalPrice, notes: data.notes, status: 'CONFIRMED' },
      include: { car: true, pickupLocation: true, returnLocation: true },
    });
    res.status(201).json(booking);
  } catch (error) {
    if (error instanceof z.ZodError) { res.status(400).json({ error: 'Validation failed', details: error.errors }); return; }
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

bookingsRouter.patch('/:id/cancel', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params?.id);
    const booking = await prisma.booking.findFirst({ where: { id, userId: req.user!.userId } });
    if (!booking) { res.status(404).json({ error: 'Booking not found' }); return; }
    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
      res.status(400).json({ error: `Cannot cancel a ${booking.status.toLowerCase()} booking` }); return;
    }
    const updated = await prisma.booking.update({ where: { id }, data: { status: 'CANCELLED' }, include: { car: true, pickupLocation: true, returnLocation: true } });
    res.json(updated);
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
