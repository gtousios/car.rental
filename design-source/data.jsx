/* ============================================================
   APIRENTAL — Mock Data
   ============================================================ */

const LOCATIONS = [
  "Athens Downtown Flagship",
  "Athens International Airport",
  "Athens Marina Bay",
  "Athens Old Town Garage",
  "Thessaloniki Downtown Flagship",
  "Thessaloniki International Airport",
  "Thessaloniki Waterfront Marina",
  "Thessaloniki Old Town Garage",
];

// Rich location metadata for the Locations page. `name` matches a LOCATIONS entry
// (and each car's `location`); `city` groups them; x/y are positions (%) on that
// city's stylized map.
const LOCATION_INFO = [
  { id: "ath-dt",     name: "Athens Downtown Flagship",          city: "Athens",       phone: "+30 210 555 0100", x: 52, y: 45 },
  { id: "ath-old",    name: "Athens Old Town Garage",            city: "Athens",       phone: "+30 210 555 0166", x: 44, y: 57 },
  { id: "ath-marina", name: "Athens Marina Bay",                 city: "Athens",       phone: "+30 210 555 0180", x: 28, y: 78 },
  { id: "ath-air",    name: "Athens International Airport",       city: "Athens",       phone: "+30 210 555 0140", x: 84, y: 38 },
  { id: "thes-dt",    name: "Thessaloniki Downtown Flagship",    city: "Thessaloniki", phone: "+30 2310 555 0100", x: 48, y: 42 },
  { id: "thes-old",   name: "Thessaloniki Old Town Garage",      city: "Thessaloniki", phone: "+30 2310 555 0166", x: 62, y: 30 },
  { id: "thes-marina",name: "Thessaloniki Waterfront Marina",    city: "Thessaloniki", phone: "+30 2310 555 0180", x: 40, y: 72 },
  { id: "thes-air",   name: "Thessaloniki International Airport", city: "Thessaloniki", phone: "+30 2310 555 0140", x: 80, y: 64 },
];

const CITIES = ["Athens", "Thessaloniki"];

const CATEGORIES = ["Luxury & Exotic", "SUV & Off-road", "Electric", "Everyday"];

// each car: availability is a list of booked date-ranges (ISO yyyy-mm-dd)
const CARS = [
  {
    id: "c1", plate: "ΙΒΤ 4210", name: "Porsche 911 Carrera", brand: "Porsche", category: "Luxury & Exotic", photo: "images/porsche-911.png",
    year: 2025, price: 416, seats: 2, transmission: "Automatic", fuel: "Petrol",
    power: "385 hp", topSpeed: "293 km/h", zeroTo: "4.0s", drivetrain: "RWD",
    color: "Carrara White", rating: 4.9, trips: 128, location: "Athens Downtown Flagship",
    tag: "Most booked", status: "Available",
    blurb: "An icon reimagined. Surgical handling, timeless silhouette.",
    features: ["Sport Chrono", "Bose Surround", "Adaptive Cruise", "360° Camera", "Heated Seats", "Apple CarPlay"],
    booked: [["2026-06-12","2026-06-15"]],
  },
  {
    id: "c2", plate: "ΥΗΝ 8905", name: "Lamborghini Huracán", brand: "Lamborghini", category: "Luxury & Exotic", photo: "images/lamborghini-huracan.png",
    year: 2024, price: 721, seats: 2, transmission: "Automatic", fuel: "Petrol",
    power: "631 hp", topSpeed: "325 km/h", zeroTo: "2.9s", drivetrain: "AWD",
    color: "Verde Mantis", rating: 5.0, trips: 64, location: "Athens Marina Bay",
    tag: "Flagship", status: "Available",
    blurb: "Naturally aspirated drama. The loudest way to arrive.",
    features: ["Launch Control", "Carbon Ceramic Brakes", "Lifting System", "Sport Exhaust", "Telemetry"],
    booked: [["2026-06-09","2026-06-11"]],
  },
  {
    id: "c3", plate: "ΖΟΚ 3372", name: "Mercedes-Benz S-Class", brand: "Mercedes-Benz", category: "Luxury & Exotic", photo: "images/mercedes-s-class.png",
    year: 2025, price: 292, seats: 5, transmission: "Automatic", fuel: "Hybrid",
    power: "496 hp", topSpeed: "250 km/h", zeroTo: "4.9s", drivetrain: "AWD",
    color: "Obsidian Black", rating: 4.8, trips: 96, location: "Athens Downtown Flagship",
    tag: null, status: "Available",
    blurb: "The benchmark of chauffeur-grade comfort.",
    features: ["Executive Rear Seats", "Burmester 4D", "Massage Seats", "Night Vision", "Air Suspension"],
    booked: [],
  },
  {
    id: "c4", plate: "ΝΒΕ 1188", name: "Range Rover Autobiography", brand: "Land Rover", category: "SUV & Off-road", photo: "images/range-rover.png",
    year: 2025, price: 300, seats: 5, transmission: "Automatic", fuel: "Hybrid",
    power: "523 hp", topSpeed: "242 km/h", zeroTo: "4.6s", drivetrain: "AWD",
    color: "Santorini Black", rating: 4.9, trips: 112, location: "Thessaloniki International Airport",
    tag: "Family favourite", status: "Available",
    blurb: "Commanding presence, terrain-conquering composure.",
    features: ["Terrain Response 2", "Meridian Signature", "Heated/Cooled Seats", "Tow Assist", "Air Suspension"],
    booked: [["2026-06-20","2026-06-24"]],
  },
  {
    id: "c5", plate: "ΝΚΗ 6640", name: "Jeep Wrangler Rubicon", brand: "Jeep", category: "SUV & Off-road", photo: "images/jeep-wrangler.png",
    year: 2024, price: 130, seats: 5, transmission: "Automatic", fuel: "Petrol",
    power: "285 hp", topSpeed: "180 km/h", zeroTo: "6.9s", drivetrain: "4x4",
    color: "Firecracker Red", rating: 4.7, trips: 143, location: "Thessaloniki Old Town Garage",
    tag: null, status: "Maintenance",
    blurb: "Trail-rated freedom. Roof comes off, rules go out.",
    features: ["Removable Roof", "Rock-Trac 4WD", "Locking Differentials", "Skid Plates", "Off-road Cam"],
    booked: [],
  },
  {
    id: "c6", plate: "ΙΕΜ 2073", name: "Tesla Model S Plaid", brand: "Tesla", category: "Electric", photo: "images/tesla-model-s.png",
    year: 2025, price: 180, seats: 5, transmission: "Automatic", fuel: "Electric",
    power: "1,020 hp", topSpeed: "322 km/h", zeroTo: "2.1s", drivetrain: "AWD",
    color: "Midnight Silver", rating: 4.9, trips: 207, location: "Athens Downtown Flagship",
    tag: "Quickest", status: "Available",
    blurb: "Hypercar acceleration in silence. 600 km of range.",
    features: ["Autopilot", "600 km Range", "Glass Roof", "Premium Audio", "Supercharging", "Sentry Mode"],
    booked: [["2026-06-08","2026-06-10"]],
  },
  {
    id: "c7", plate: "ΥΤΑ 9451", name: "Porsche Taycan Turbo", brand: "Porsche", category: "Electric", photo: "images/porsche-taycan.png",
    year: 2025, price: 369, seats: 4, transmission: "Automatic", fuel: "Electric",
    power: "871 hp", topSpeed: "260 km/h", zeroTo: "2.6s", drivetrain: "AWD",
    color: "Frozen Blue", rating: 4.9, trips: 78, location: "Athens Marina Bay",
    tag: "New", status: "Available",
    blurb: "Electric performance with unmistakable Porsche soul.",
    features: ["800V Charging", "Adaptive Air", "Sport Sound", "Matrix LED", "Heat Pump"],
    booked: [],
  },
  {
    id: "c8", plate: "ΝΟΒ 5529", name: "BMW i4 eDrive40", brand: "BMW", category: "Electric", photo: "images/bmw-i4.png",
    year: 2024, price: 170, seats: 5, transmission: "Automatic", fuel: "Electric",
    power: "335 hp", topSpeed: "190 km/h", zeroTo: "5.7s", drivetrain: "RWD",
    color: "Brooklyn Grey", rating: 4.7, trips: 134, location: "Thessaloniki International Airport",
    tag: null, status: "Available",
    blurb: "The gran coupé, electrified and effortlessly refined.",
    features: ["590 km Range", "Curved Display", "Harman Kardon", "Driving Assistant", "Wireless Charge"],
    booked: [],
  },
  {
    id: "c9", plate: "ΝΗΡ 7314", name: "Audi Q5 quattro", brand: "Audi", category: "Everyday", photo: "images/audi-q5.png",
    year: 2025, price: 144, seats: 5, transmission: "Automatic", fuel: "Petrol",
    power: "261 hp", topSpeed: "240 km/h", zeroTo: "6.1s", drivetrain: "AWD",
    color: "Glacier White", rating: 4.6, trips: 188, location: "Thessaloniki Old Town Garage",
    tag: "Best value", status: "Available",
    blurb: "Quietly capable. The dependable all-rounder.",
    features: ["Virtual Cockpit", "Quattro AWD", "Panoramic Roof", "Lane Assist", "Apple CarPlay"],
    booked: [],
  },
  {
    id: "c10", plate: "ΙΚΖ 8846", name: "Volkswagen Golf GTI", brand: "Volkswagen", category: "Everyday", photo: "images/vw-golf-gti.png",
    year: 2024, price: 80, seats: 5, transmission: "Manual", fuel: "Petrol",
    power: "241 hp", topSpeed: "250 km/h", zeroTo: "5.9s", drivetrain: "FWD",
    color: "Kings Red", rating: 4.8, trips: 221, location: "Athens Downtown Flagship",
    tag: null, status: "Available",
    blurb: "The original hot hatch. Pure, playful, practical.",
    features: ["Manual 6-speed", "Sport Suspension", "Digital Cockpit", "Adaptive Cruise", "CarPlay"],
    booked: [],
  },
  {
    id: "c11", plate: "ΙΜΝ 1902", name: "Toyota Corolla Hybrid", brand: "Toyota", category: "Everyday", photo: "images/toyota-corolla.png",
    year: 2025, price: 86, seats: 5, transmission: "Automatic", fuel: "Hybrid",
    power: "138 hp", topSpeed: "180 km/h", zeroTo: "9.0s", drivetrain: "FWD",
    color: "Celestite Grey", rating: 4.5, trips: 312, location: "Athens International Airport",
    tag: "Economy", status: "Available",
    blurb: "Frugal, fuss-free, and famously reliable.",
    features: ["4.5L/100km", "Safety Sense", "Wireless CarPlay", "Heated Seats", "Lane Assist"],
    booked: [],
  },
  {
    id: "c12", plate: "ΥΒΟ 3067", name: "Bentley Continental GT", brand: "Bentley", category: "Luxury & Exotic", photo: "images/bentley-continental.png",
    year: 2025, price: 684, seats: 4, transmission: "Automatic", fuel: "Petrol",
    power: "650 hp", topSpeed: "335 km/h", zeroTo: "3.6s", drivetrain: "AWD",
    color: "Glacier Pearl", rating: 5.0, trips: 41, location: "Athens Marina Bay",
    tag: "Grand tourer", status: "Available",
    blurb: "Hand-stitched opulence wrapped around a W12.",
    features: ["Rotating Display", "Naim Audio", "Diamond Quilting", "Massage Seats", "Night Vision"],
    booked: [],
  },
  {
    id: "c13", plate: "ΙΤΕ 4728", name: "BMW X5 M Competition", brand: "BMW", category: "SUV & Off-road", photo: "images/bmw-x5m.png",
    year: 2025, price: 312, seats: 5, transmission: "Automatic", fuel: "Petrol",
    power: "617 hp", topSpeed: "290 km/h", zeroTo: "3.8s", drivetrain: "AWD",
    color: "Isle of Man Green", rating: 4.8, trips: 57, location: "Athens International Airport",
    tag: "New", status: "Available",
    blurb: "A 617 hp twin-turbo V8 hiding inside a five-seat SUV.",
    features: ["M xDrive AWD", "Carbon Trim", "Harman Kardon", "M Sport Seats", "360° Camera", "Adaptive Suspension"],
    booked: [],
  },
  {
    id: "c14", plate: "ΝΥΚ 6215", name: "Porsche Cayenne GTS Coupé", brand: "Porsche", category: "SUV & Off-road", photo: "images/porsche-cayenne.png",
    year: 2025, price: 354, seats: 5, transmission: "Automatic", fuel: "Petrol",
    power: "493 hp", topSpeed: "275 km/h", zeroTo: "4.4s", drivetrain: "AWD",
    color: "Dolomite Silver", rating: 4.9, trips: 49, location: "Thessaloniki Waterfront Marina",
    tag: null, status: "Available",
    blurb: "Sports-car reflexes wrapped in a coupé-roofed SUV.",
    features: ["Sport Chrono", "PASM Air Suspension", "Bose Surround", "Sport Exhaust", "Panoramic Roof", "Ceramic Brakes"],
    booked: [],
  },
  {
    id: "c15", plate: "ΝΖΗ 9380", name: "Mercedes-Benz GLC", brand: "Mercedes-Benz", category: "SUV & Off-road", photo: "images/mercedes-glc.png",
    year: 2025, price: 198, seats: 5, transmission: "Automatic", fuel: "Hybrid",
    power: "258 hp", topSpeed: "240 km/h", zeroTo: "6.2s", drivetrain: "AWD",
    color: "Polar White", rating: 4.7, trips: 83, location: "Thessaloniki Downtown Flagship",
    tag: "Family favourite", status: "Available",
    blurb: "The everyday luxury SUV — composed, quiet, and refined.",
    features: ["MBUX Display", "Burmester Audio", "4MATIC AWD", "Heated Seats", "Wireless CarPlay", "Driving Assistance"],
    booked: [],
  },
  {
    id: "c16", plate: "ΝΕΤ 5043", name: "BMW X2 M35i", brand: "BMW", category: "Everyday", photo: "images/bmw-x2.png",
    year: 2025, price: 164, seats: 5, transmission: "Automatic", fuel: "Petrol",
    power: "317 hp", topSpeed: "250 km/h", zeroTo: "5.2s", drivetrain: "AWD",
    color: "Frozen Portimao Blue", rating: 4.6, trips: 71, location: "Thessaloniki Old Town Garage",
    tag: null, status: "Available",
    blurb: "A sport-coupé SUV with hot-hatch punch and M attitude.",
    features: ["M Sport xDrive", "Curved Display", "Harman Kardon", "Sport Seats", "Adaptive LED", "CarPlay"],
    booked: [],
  },
  {
    id: "c17", plate: "ΝΙΟ 2691", name: "BYD Atto 3", brand: "BYD", category: "Electric", photo: "images/byd-atto3.png",
    year: 2025, price: 98, seats: 5, transmission: "Automatic", fuel: "Electric",
    power: "201 hp", topSpeed: "160 km/h", zeroTo: "7.3s", drivetrain: "FWD",
    color: "Surf Blue", rating: 4.5, trips: 119, location: "Thessaloniki International Airport",
    tag: "Economy", status: "Available",
    blurb: "An affordable electric crossover with 420 km of range.",
    features: ["Blade Battery", "420 km Range", "Rotating Screen", "Vehicle-to-Load", "Heat Pump", "Wireless CarPlay"],
    booked: [],
  },
  {
    id: "c18", plate: "ΙΟΑ 5318", name: "Tesla Model X", brand: "Tesla", category: "Electric", photo: "images/tesla-model-x.png",
    year: 2025, price: 288, seats: 6, transmission: "Automatic", fuel: "Electric",
    power: "670 hp", topSpeed: "250 km/h", zeroTo: "3.9s", drivetrain: "AWD",
    color: "Midnight Grey", rating: 4.8, trips: 64, location: "Athens Downtown Flagship",
    tag: null, status: "Available",
    blurb: "Falcon-wing doors, six seats, and 540 km of electric range.",
    features: ["Falcon Wing Doors", "540 km Range", "Autopilot", "Premium Audio", "Supercharging", "Glass Roof"],
    booked: [],
  },
];

const ADDONS = [
  { id: "ins",  name: "Premium Insurance",   desc: "Zero excess, full coverage", price: 39, unit: "day" },
  { id: "gps",  name: "GPS Navigation",      desc: "Pre-loaded offline maps",    price: 9,  unit: "day" },
  { id: "seat", name: "Child Seat",          desc: "ISOFIX, 9 months – 4 yrs",   price: 7,  unit: "day" },
  { id: "drv",  name: "Additional Driver",   desc: "Add a second named driver",  price: 12, unit: "day" },
  { id: "del",  name: "Doorstep Delivery",   desc: "We bring it to your door",   price: 60, unit: "trip" },
  { id: "fuel", name: "Prepaid Fuel / Charge",desc: "Return on any level",       price: 45, unit: "trip" },
];

const CUSTOMERS = [];

const BOOKINGS = [];

const REVENUE_SERIES = [
  { m: "Jan", v: 42 }, { m: "Feb", v: 51 }, { m: "Mar", v: 48 },
  { m: "Apr", v: 63 }, { m: "May", v: 72 }, { m: "Jun", v: 86 },
];

// Loyalty programme. Points: 10 per €1 spent; 100 points = €1 at checkout.
// Tiers by lifetime spend (€). Perks: automatic % discount + free add-ons, and
// free keyless entry for the higher tiers (lower tiers pay a small fee).
const LOYALTY = {
  perEuro: 10,
  redeemRate: 100,   // points per €1
  minRedeem: 500,    // minimum points to redeem at once
  tiers: [
    { id: "Bronze",   min: 0,    discount: 0,  freeAddons: [],              keylessFree: false },
    { id: "Silver",   min: 1500, discount: 3,  freeAddons: [],              keylessFree: false },
    { id: "Gold",     min: 4000, discount: 6,  freeAddons: ["gps"],         keylessFree: true },
    { id: "Platinum", min: 9000, discount: 10, freeAddons: ["gps", "drv"],  keylessFree: true },
  ],
};

// Keyless entry — optional digital unlock. Free for higher loyalty tiers
// (see LOYALTY.keylessFree), otherwise a flat per-rental fee.
const KEYLESS_FEE = 9;

// Seeded customer reviews so cars aren't empty. Each is tied to a car;
// `verified` marks a real completed rental. Customers add more from My Trips.
const REVIEWS = [
  { id: "r1",  carId: "c1",  author: "Marcus Bennett",  rating: 5, body: "The 911 is everything you hope for — razor-sharp steering and that flat-six soundtrack. Pickup at Downtown was seamless.", date: "2026-05-28", verified: true, hidden: false },
  { id: "r2",  carId: "c1",  author: "Sophia Laurent",  rating: 5, body: "Immaculate car, spotless inside and out. Booking and return took five minutes each. Will rent again.", date: "2026-05-12", verified: true, hidden: false },
  { id: "r3",  carId: "c1",  author: "Diego Fernández",  rating: 4, body: "Brilliant to drive. Only wish the tank had been full at pickup, but the team sorted it quickly.", date: "2026-04-30", verified: true, hidden: false },
  { id: "r4",  carId: "c2",  author: "Liam O'Connor",   rating: 5, body: "Huracán is pure theatre. Heads turned everywhere. The launch control never got old. Worth every euro.", date: "2026-05-20", verified: true, hidden: false },
  { id: "r5",  carId: "c2",  author: "Aisha Rahman",    rating: 5, body: "A bucket-list weekend. Concierge delivered it to the marina exactly on time. Flawless.", date: "2026-04-18", verified: true, hidden: false },
  { id: "r6",  carId: "c6",  author: "Hannah Schmidt",  rating: 5, body: "The Plaid's acceleration is genuinely unreal. Super clean, fully charged, and the supercharging map made the trip easy.", date: "2026-06-01", verified: true, hidden: false },
  { id: "r7",  carId: "c6",  author: "Marcus Bennett",  rating: 4, body: "Insanely quick and comfortable. Range was great. Took a moment to learn the yoke but loved it by day two.", date: "2026-05-05", verified: true, hidden: false },
  { id: "r8",  carId: "c10", author: "Elena Petrova",   rating: 5, body: "The GTI is the perfect city companion — fun, frugal, and easy to park. Fantastic value for the price.", date: "2026-05-22", verified: true, hidden: false },
  { id: "r9",  carId: "c10", author: "Tom Whitfield",   rating: 4, body: "Solid hot hatch, manual box is a joy. Pickup at Downtown was quick and friendly.", date: "2026-04-27", verified: true, hidden: false },
  { id: "r10", carId: "c4",  author: "Priya Nair",      rating: 5, body: "Range Rover made our family road trip effortless — quiet, spacious, and supremely comfortable on long drives.", date: "2026-05-15", verified: true, hidden: false },
  { id: "r11", carId: "c4",  author: "James Park",       rating: 5, body: "Commanding and refined. Airport pickup was smooth and the car was pristine.", date: "2026-04-09", verified: true, hidden: false },
  { id: "r12", carId: "c12", author: "Sophia Laurent",  rating: 5, body: "The Bentley is in a class of its own. Hand-stitched everything. Felt like royalty for the weekend.", date: "2026-05-30", verified: true, hidden: false },
  { id: "r13", carId: "c7",  author: "Noah Kelly",      rating: 5, body: "Taycan Turbo is the best EV I've driven — Porsche feel with silent thrust. Charged in no time on the 800V network.", date: "2026-05-18", verified: true, hidden: false },
  { id: "r14", carId: "c9",  author: "Mara Lindqvist",  rating: 4, body: "Dependable and quiet. Nothing flashy, just a great all-rounder for the week. CarPlay worked perfectly.", date: "2026-05-02", verified: true, hidden: false },
  { id: "r15", carId: "c3",  author: "Henry Adler",     rating: 5, body: "Rode in the back most of the trip — the executive seats and Burmester audio are sublime. Chauffeur-grade comfort.", date: "2026-04-22", verified: true, hidden: false },
  { id: "r16", carId: "c13", author: "Carlos Mendes",   rating: 5, body: "X5 M hides supercar pace in an everyday SUV. Effortless on the motorway, savage when you want it.", date: "2026-06-03", verified: true, hidden: false },
];

// Promo / discount codes. type: "percent" (value = %) or "fixed" (value = €).
// limit 0 = unlimited redemptions. Applied off the grand total.
const PROMOS = [
  { code: "WELCOME15", type: "percent", value: 15, active: true, expires: "2026-12-31", limit: 200, used: 38 },
  { code: "SUMMER50",  type: "fixed",   value: 50, active: true, expires: "2026-09-30", limit: 100, used: 41 },
  { code: "VIP100",    type: "fixed",   value: 100, active: true, expires: "2026-12-31", limit: 50,  used: 12 },
  { code: "WEEKEND10", type: "percent", value: 10, active: true, expires: "",           limit: 0,   used: 87 },
  { code: "SPRING20",  type: "percent", value: 20, active: false, expires: "2026-05-31", limit: 150, used: 150 },
];

Object.assign(window, {
  LOCATIONS, LOCATION_INFO, CITIES, CATEGORIES, CARS, ADDONS, CUSTOMERS, BOOKINGS, REVENUE_SERIES, REVIEWS, PROMOS, LOYALTY, KEYLESS_FEE,
});
