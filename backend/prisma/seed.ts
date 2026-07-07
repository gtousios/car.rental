import { PrismaClient, Role, CarCategory, Transmission, FuelType, BookingStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.booking.deleteMany();
  await prisma.car.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@apirental.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1-555-0100',
      role: Role.ADMIN,
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1-555-0101',
      role: Role.USER,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      password: userPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1-555-0102',
      role: Role.USER,
    },
  });

  console.log('✅ Users created');

  // Create locations
  const locations = await Promise.all([
    prisma.location.create({
      data: {
        name: 'Downtown Office',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        country: 'United States',
        zipCode: '10001',
        latitude: 40.7128,
        longitude: -74.0060,
      },
    }),
    prisma.location.create({
      data: {
        name: 'Airport Terminal',
        address: '1 Airport Blvd',
        city: 'New York',
        state: 'NY',
        country: 'United States',
        zipCode: '11430',
        latitude: 40.6413,
        longitude: -73.7781,
      },
    }),
    prisma.location.create({
      data: {
        name: 'Midtown Hub',
        address: '456 5th Avenue',
        city: 'New York',
        state: 'NY',
        country: 'United States',
        zipCode: '10018',
        latitude: 40.7549,
        longitude: -73.9840,
      },
    }),
    prisma.location.create({
      data: {
        name: 'Brooklyn Center',
        address: '789 Atlantic Ave',
        city: 'Brooklyn',
        state: 'NY',
        country: 'United States',
        zipCode: '11217',
        latitude: 40.6782,
        longitude: -73.9442,
      },
    }),
    prisma.location.create({
      data: {
        name: 'Los Angeles LAX',
        address: '1 World Way',
        city: 'Los Angeles',
        state: 'CA',
        country: 'United States',
        zipCode: '90045',
        latitude: 33.9425,
        longitude: -118.4081,
      },
    }),
    prisma.location.create({
      data: {
        name: 'Miami Beach Office',
        address: '100 Ocean Drive',
        city: 'Miami Beach',
        state: 'FL',
        country: 'United States',
        zipCode: '33139',
        latitude: 25.7617,
        longitude: -80.1918,
      },
    }),
  ]);

  console.log('✅ Locations created');

  // Create cars
  const cars = await Promise.all([
    prisma.car.create({
      data: {
        brand: 'Toyota',
        model: 'Corolla',
        year: 2024,
        category: CarCategory.COMPACT,
        transmission: Transmission.AUTOMATIC,
        fuelType: FuelType.GASOLINE,
        seats: 5,
        doors: 4,
        luggage: 2,
        pricePerDay: 45,
        imageUrl: 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=800',
        description: 'Reliable and fuel-efficient compact sedan, perfect for city driving and daily commutes.',
        features: ['Bluetooth', 'Backup Camera', 'Apple CarPlay', 'Cruise Control', 'USB Ports'],
        mileage: 'Unlimited',
        color: 'Silver',
        licensePlate: 'APR-1001',
      },
    }),
    prisma.car.create({
      data: {
        brand: 'Honda',
        model: 'Civic',
        year: 2024,
        category: CarCategory.COMPACT,
        transmission: Transmission.AUTOMATIC,
        fuelType: FuelType.GASOLINE,
        seats: 5,
        doors: 4,
        luggage: 2,
        pricePerDay: 48,
        imageUrl: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800',
        description: 'Sporty and efficient compact car with advanced safety features.',
        features: ['Honda Sensing', 'Touchscreen', 'Android Auto', 'Lane Departure Warning', 'USB-C'],
        mileage: 'Unlimited',
        color: 'Blue',
        licensePlate: 'APR-1002',
      },
    }),
    prisma.car.create({
      data: {
        brand: 'Toyota',
        model: 'Camry',
        year: 2024,
        category: CarCategory.MIDSIZE,
        transmission: Transmission.AUTOMATIC,
        fuelType: FuelType.HYBRID,
        seats: 5,
        doors: 4,
        luggage: 3,
        pricePerDay: 62,
        imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800',
        description: 'Spacious midsize hybrid sedan with excellent fuel economy and comfort.',
        features: ['Hybrid Engine', 'Leather Seats', 'Sunroof', 'Navigation', 'Wireless Charging'],
        mileage: 'Unlimited',
        color: 'White',
        licensePlate: 'APR-1003',
      },
    }),
    prisma.car.create({
      data: {
        brand: 'Ford',
        model: 'Mustang',
        year: 2024,
        category: CarCategory.SPORTS,
        transmission: Transmission.AUTOMATIC,
        fuelType: FuelType.GASOLINE,
        seats: 4,
        doors: 2,
        luggage: 1,
        pricePerDay: 95,
        imageUrl: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=800',
        description: 'Iconic American muscle car with thrilling performance and head-turning style.',
        features: ['V8 Engine', 'Sport Mode', 'Premium Sound', 'Track Apps', 'Performance Brakes'],
        mileage: '200 miles/day',
        color: 'Red',
        licensePlate: 'APR-1004',
      },
    }),
    prisma.car.create({
      data: {
        brand: 'BMW',
        model: 'X5',
        year: 2024,
        category: CarCategory.SUV,
        transmission: Transmission.AUTOMATIC,
        fuelType: FuelType.GASOLINE,
        seats: 5,
        doors: 4,
        luggage: 4,
        pricePerDay: 120,
        imageUrl: 'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=800',
        description: 'Premium luxury SUV combining performance, comfort, and versatility.',
        features: ['xDrive AWD', 'Panoramic Roof', 'Heated Seats', 'Harman Kardon', 'Adaptive Cruise'],
        mileage: 'Unlimited',
        color: 'Black',
        licensePlate: 'APR-1005',
      },
    }),
    prisma.car.create({
      data: {
        brand: 'Tesla',
        model: 'Model 3',
        year: 2024,
        category: CarCategory.MIDSIZE,
        transmission: Transmission.AUTOMATIC,
        fuelType: FuelType.ELECTRIC,
        seats: 5,
        doors: 4,
        luggage: 2,
        pricePerDay: 85,
        imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
        description: 'All-electric sedan with cutting-edge technology and zero emissions.',
        features: ['Autopilot', 'Full Self-Driving', '15" Touchscreen', 'Over-the-Air Updates', 'Supercharging'],
        mileage: 'Unlimited',
        color: 'Pearl White',
        licensePlate: 'APR-1006',
      },
    }),
    prisma.car.create({
      data: {
        brand: 'Mercedes-Benz',
        model: 'E-Class',
        year: 2024,
        category: CarCategory.LUXURY,
        transmission: Transmission.AUTOMATIC,
        fuelType: FuelType.GASOLINE,
        seats: 5,
        doors: 4,
        luggage: 3,
        pricePerDay: 150,
        imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
        description: 'The epitome of luxury sedans with world-class comfort and advanced technology.',
        features: ['MBUX Infotainment', 'Burmester Sound', 'Air Suspension', 'Ambient Lighting', '64-Color LED'],
        mileage: 'Unlimited',
        color: 'Obsidian Black',
        licensePlate: 'APR-1007',
      },
    }),
    prisma.car.create({
      data: {
        brand: 'Jeep',
        model: 'Wrangler',
        year: 2024,
        category: CarCategory.SUV,
        transmission: Transmission.AUTOMATIC,
        fuelType: FuelType.GASOLINE,
        seats: 5,
        doors: 4,
        luggage: 3,
        pricePerDay: 89,
        imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800',
        description: 'Legendary off-road capability with removable top and doors for open-air adventure.',
        features: ['4x4', 'Removable Top', 'Trail Rated', 'Skid Plates', 'Tow Hooks'],
        mileage: '250 miles/day',
        color: 'Green',
        licensePlate: 'APR-1008',
      },
    }),
    prisma.car.create({
      data: {
        brand: 'Chevrolet',
        model: 'Suburban',
        year: 2024,
        category: CarCategory.VAN,
        transmission: Transmission.AUTOMATIC,
        fuelType: FuelType.GASOLINE,
        seats: 8,
        doors: 4,
        luggage: 5,
        pricePerDay: 110,
        imageUrl: 'https://images.unsplash.com/photo-1606611013016-969c19ba27eb?w=800',
        description: 'Full-size SUV with seating for up to 8 passengers and generous cargo space.',
        features: ['3rd Row Seating', 'Power Liftgate', 'Rear Entertainment', 'Towing Package', 'WiFi Hotspot'],
        mileage: 'Unlimited',
        color: 'Dark Gray',
        licensePlate: 'APR-1009',
      },
    }),
    prisma.car.create({
      data: {
        brand: 'Kia',
        model: 'Rio',
        year: 2024,
        category: CarCategory.ECONOMY,
        transmission: Transmission.MANUAL,
        fuelType: FuelType.GASOLINE,
        seats: 5,
        doors: 4,
        luggage: 2,
        pricePerDay: 32,
        imageUrl: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800',
        description: 'Budget-friendly economy car with great fuel efficiency and modern features.',
        features: ['Bluetooth', 'Backup Camera', 'USB Port', 'Air Conditioning', 'Power Windows'],
        mileage: 'Unlimited',
        color: 'Red',
        licensePlate: 'APR-1010',
      },
    }),
    prisma.car.create({
      data: {
        brand: 'Hyundai',
        model: 'Elantra',
        year: 2024,
        category: CarCategory.COMPACT,
        transmission: Transmission.AUTOMATIC,
        fuelType: FuelType.GASOLINE,
        seats: 5,
        doors: 4,
        luggage: 2,
        pricePerDay: 44,
        imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800',
        description: 'Stylish compact sedan with bold design and advanced safety features.',
        features: ['SmartSense Safety', 'Wireless CarPlay', 'Digital Key', 'Blind Spot Monitor', 'LED Headlights'],
        mileage: 'Unlimited',
        color: 'White',
        licensePlate: 'APR-1011',
      },
    }),
    prisma.car.create({
      data: {
        brand: 'Audi',
        model: 'A4',
        year: 2024,
        category: CarCategory.LUXURY,
        transmission: Transmission.AUTOMATIC,
        fuelType: FuelType.GASOLINE,
        seats: 5,
        doors: 4,
        luggage: 3,
        pricePerDay: 130,
        imageUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
        description: 'Refined luxury sedan with quattro all-wheel drive and cutting-edge tech.',
        features: ['Quattro AWD', 'Virtual Cockpit', 'MMI Navigation', 'Bang & Olufsen', 'Matrix LED'],
        mileage: 'Unlimited',
        color: 'Navarra Blue',
        licensePlate: 'APR-1012',
      },
    }),
  ]);

  console.log('✅ Cars created');

  // Create bookings
  const now = new Date();
  const bookingsData = [
    {
      userId: user1.id,
      carId: cars[0].id,
      pickupLocationId: locations[0].id,
      returnLocationId: locations[0].id,
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2),
      endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5),
      totalPrice: 135,
      status: BookingStatus.CONFIRMED,
    },
    {
      userId: user1.id,
      carId: cars[3].id,
      pickupLocationId: locations[1].id,
      returnLocationId: locations[2].id,
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, 10),
      endDate: new Date(now.getFullYear(), now.getMonth() - 1, 13),
      totalPrice: 285,
      status: BookingStatus.COMPLETED,
    },
    {
      userId: user2.id,
      carId: cars[4].id,
      pickupLocationId: locations[0].id,
      returnLocationId: locations[0].id,
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
      endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14),
      totalPrice: 840,
      status: BookingStatus.PENDING,
    },
    {
      userId: user2.id,
      carId: cars[5].id,
      pickupLocationId: locations[2].id,
      returnLocationId: locations[2].id,
      startDate: new Date(now.getFullYear(), now.getMonth() - 2, 5),
      endDate: new Date(now.getFullYear(), now.getMonth() - 2, 8),
      totalPrice: 255,
      status: BookingStatus.COMPLETED,
    },
    {
      userId: user1.id,
      carId: cars[6].id,
      pickupLocationId: locations[4].id,
      returnLocationId: locations[4].id,
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3),
      endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
      totalPrice: 600,
      status: BookingStatus.ACTIVE,
    },
    {
      userId: user2.id,
      carId: cars[1].id,
      pickupLocationId: locations[5].id,
      returnLocationId: locations[5].id,
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
      endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
      totalPrice: 96,
      status: BookingStatus.CANCELLED,
    },
  ];

  for (const booking of bookingsData) {
    await prisma.booking.create({ data: booking });
  }

  console.log('✅ Bookings created');
  console.log('');
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('Demo credentials:');
  console.log('  Admin: admin@apirental.com / admin123');
  console.log('  User:  john@example.com / user123');
  console.log('  User:  jane@example.com / user123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
