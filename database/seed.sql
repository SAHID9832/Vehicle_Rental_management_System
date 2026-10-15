-- ============================================================
--  Vektor Rentals – Vehicle Rental Management System
--  FILE   : seed.sql
--  PURPOSE: Realistic seed / demo data (Bengaluru, INR pricing)
--  NOTE   : Run schema.sql FIRST before executing this file.
-- ============================================================

USE vektor_rentals;

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';
-- Disable triggers during seeding to avoid overlap conflicts in demo data
SET @SEED_MODE = 1;

-- ==============================================================
-- 1. ROLES
-- ==============================================================
INSERT INTO roles (id, name, description, created_at) VALUES
(1, 'Admin',    'Full system access – manage all resources, users, and configuration',      '2024-01-01 09:00:00'),
(2, 'Manager',  'Branch-level management – vehicles, bookings, staff oversight',            '2024-01-01 09:00:00'),
(3, 'Agent',    'Front-desk agent – create bookings, process rentals and payments',         '2024-01-01 09:00:00'),
(4, 'Customer', 'Registered customer – book vehicles and manage own rentals',               '2024-01-01 09:00:00');

-- ==============================================================
-- 2. USERS
--    Password hash used  : bcrypt hash of 'Password@123'
--    Hash value          : $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
--    Admin special hash  : bcrypt hash of 'Admin@123' (same placeholder for demo)
-- ==============================================================
INSERT INTO users (id, email, password_hash, role_id, is_active, created_at, updated_at, last_login) VALUES
-- Staff accounts
(1,  'admin@vektor.in',          '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 1, '2024-01-01 09:00:00', '2024-01-01 09:00:00', '2026-10-14 08:30:00'),
(2,  'manager.mgroad@vektor.in', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 1, '2024-01-05 10:00:00', '2024-01-05 10:00:00', '2026-10-13 09:15:00'),
(3,  'agent.airport@vektor.in',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, 1, '2024-01-10 10:00:00', '2024-01-10 10:00:00', '2026-10-14 07:45:00'),
-- Customer accounts
(4,  'arjun.sharma@gmail.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, 1, '2024-02-10 11:00:00', '2024-02-10 11:00:00', '2026-10-10 14:20:00'),
(5,  'priya.nair@gmail.com',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, 1, '2024-02-15 12:00:00', '2024-02-15 12:00:00', '2026-10-09 18:00:00'),
(6,  'rahul.verma@gmail.com',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, 1, '2024-03-01 09:30:00', '2024-03-01 09:30:00', '2026-10-12 11:00:00'),
(7,  'kavitha.reddy@gmail.com',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, 1, '2024-03-12 14:00:00', '2024-03-12 14:00:00', '2026-10-08 20:00:00'),
(8,  'deepak.menon@gmail.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, 1, '2024-04-05 10:00:00', '2024-04-05 10:00:00', '2026-10-11 09:00:00'),
(9,  'sneha.rao@gmail.com',      '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, 1, '2024-04-20 16:00:00', '2024-04-20 16:00:00', '2026-10-07 17:30:00'),
(10, 'vikram.iyer@gmail.com',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, 1, '2024-05-01 08:00:00', '2024-05-01 08:00:00', '2026-10-13 22:00:00'),
(11, 'ananya.patel@gmail.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, 1, '2024-05-15 11:30:00', '2024-05-15 11:30:00', '2026-10-06 15:00:00'),
(12, 'suresh.kumar@gmail.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, 1, '2024-06-01 09:00:00', '2024-06-01 09:00:00', '2026-10-14 10:45:00'),
(13, 'meera.krishnan@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, 1, '2024-06-10 13:00:00', '2024-06-10 13:00:00', '2026-10-05 12:00:00');

-- ==============================================================
-- 3. CUSTOMERS  (10 customers, user_ids 4–13)
-- ==============================================================
INSERT INTO customers
    (id, user_id, first_name, last_name, phone, address, city, state, pincode, driving_license, date_of_birth, created_at, updated_at)
VALUES
(1,  4,  'Arjun',   'Sharma',   '9876543210', '14, 3rd Cross, Jayanagar 4th Block',             'Bengaluru', 'Karnataka', '560041', 'KA-01 2018 1234567', '1992-04-15', '2024-02-10 11:00:00', '2024-02-10 11:00:00'),
(2,  5,  'Priya',   'Nair',     '9845123456', '22, Koramangala 5th Block, 80 Feet Road',        'Bengaluru', 'Karnataka', '560095', 'KA-05 2019 7654321', '1995-08-22', '2024-02-15 12:00:00', '2024-02-15 12:00:00'),
(3,  6,  'Rahul',   'Verma',    '8765432109', '7, Indiranagar 100 Feet Road, HAL 2nd Stage',    'Bengaluru', 'Karnataka', '560038', 'KA-03 2017 2345678', '1990-11-30', '2024-03-01 09:30:00', '2024-03-01 09:30:00'),
(4,  7,  'Kavitha', 'Reddy',    '7654321098', '45, Whitefield Main Road, ITPL Back Gate',       'Bengaluru', 'Karnataka', '560066', 'KA-51 2020 3456789', '1997-02-14', '2024-03-12 14:00:00', '2024-03-12 14:00:00'),
(5,  8,  'Deepak',  'Menon',    '9123456780', '8, Electronic City Phase 1, Neeladri Road',      'Bengaluru', 'Karnataka', '560100', 'KA-41 2016 4567890', '1988-07-05', '2024-04-05 10:00:00', '2024-04-05 10:00:00'),
(6,  9,  'Sneha',   'Rao',      '8234567891', '33, HSR Layout Sector 1, BDA Complex',           'Bengaluru', 'Karnataka', '560102', 'KA-04 2021 5678901', '1998-03-25', '2024-04-20 16:00:00', '2024-04-20 16:00:00'),
(7,  10, 'Vikram',  'Iyer',     '9345678902', '12, MG Road, Trinity Circle',                    'Bengaluru', 'Karnataka', '560001', 'KA-01 2015 6789012', '1985-12-10', '2024-05-01 08:00:00', '2024-05-01 08:00:00'),
(8,  11, 'Ananya',  'Patel',    '7456789013', '56, Malleshwaram 15th Cross',                    'Bengaluru', 'Karnataka', '560003', 'KA-02 2022 7890123', '2000-06-18', '2024-05-15 11:30:00', '2024-05-15 11:30:00'),
(9,  12, 'Suresh',  'Kumar',    '9567890124', '9, Rajajinagar 1st Block, BEL Road',             'Bengaluru', 'Karnataka', '560010', 'KA-08 2018 8901234', '1983-09-07', '2024-06-01 09:00:00', '2024-06-01 09:00:00'),
(10, 13, 'Meera',   'Krishnan', '8678901235', '27, Banashankari 2nd Stage, 80 Feet Road',       'Bengaluru', 'Karnataka', '560070', 'KA-05 2019 9012345', '1993-01-29', '2024-06-10 13:00:00', '2024-06-10 13:00:00');

-- ==============================================================
-- 4. VEHICLE CATEGORIES
-- ==============================================================
INSERT INTO vehicle_categories (id, name, description, icon_name, is_active) VALUES
(1, 'Car',        'Standard hatchbacks and sedans for everyday city commuting',       'car',          1),
(2, 'SUV',        'Sports utility vehicles for family travel and highway drives',     'suv',          1),
(3, 'Motorcycle', 'Two-wheelers for quick, economical inner-city rides',              'motorcycle',   1),
(4, 'Van',        'Multi-seater vans ideal for group travel and cargo transport',     'van',          1),
(5, 'Luxury',     'Premium executive cars for business travel and special occasions', 'luxury_car',   1),
(6, 'Electric',   'Eco-friendly electric vehicles with zero tailpipe emissions',      'electric_car', 1);

-- ==============================================================
-- 5. BRANCHES  (5 Bengaluru locations)
-- ==============================================================
INSERT INTO branches
    (id, name, address, city, state, pincode, phone, email, manager_name, latitude, longitude, is_active, created_at)
VALUES
(1, 'City Centre – MG Road',
    '12, Brigade Road Junction, MG Road',
    'Bengaluru', 'Karnataka', '560001',
    '08041234567', 'mgroad@vektor.in',
    'Rajesh Naidu',
    12.9716000, 77.5946000, 1, '2024-01-01 09:00:00'),

(2, 'Kempegowda International Airport (KIAL)',
    'Terminal 1, Arrival Level, KIAL, Devanahalli',
    'Bengaluru', 'Karnataka', '562300',
    '08042345678', 'airport@vektor.in',
    'Sumanth Hegde',
    13.1979000, 77.7063000, 1, '2024-01-01 09:00:00'),

(3, 'Whitefield – ITPL',
    'ITPL Main Road, Hoodi Circle, Whitefield',
    'Bengaluru', 'Karnataka', '560066',
    '08043456789', 'whitefield@vektor.in',
    'Padmavathi Krishnan',
    12.9824000, 77.7280000, 1, '2024-01-05 10:00:00'),

(4, 'Electronic City – Phase 1',
    'Hosur Road, Electronic City Phase 1, Neeladri Road',
    'Bengaluru', 'Karnataka', '560100',
    '08044567890', 'ecity@vektor.in',
    'Ganesh Murthy',
    12.8399000, 77.6770000, 1, '2024-01-05 10:00:00'),

(5, 'Indiranagar – 100 Feet Road',
    '47, 100 Feet Road, HAL 2nd Stage, Indiranagar',
    'Bengaluru', 'Karnataka', '560038',
    '08045678901', 'indiranagar@vektor.in',
    'Lakshmi Bhat',
    12.9784000, 77.6408000, 1, '2024-01-10 10:00:00');

-- ==============================================================
-- 6. BRANCH CONNECTIONS  (bidirectional graph, 8 pairs = 16 rows)
--    Distances estimated from real Bengaluru road distances.
-- ==============================================================
INSERT INTO branch_connections
    (id, from_branch_id, to_branch_id, distance_km, travel_time_mins, is_active)
VALUES
-- MG Road ↔ Airport
( 1, 1, 2, 40.50, 75, 1),
( 2, 2, 1, 40.50, 75, 1),
-- MG Road ↔ Whitefield
( 3, 1, 3, 22.00, 55, 1),
( 4, 3, 1, 22.00, 55, 1),
-- MG Road ↔ Electronic City
( 5, 1, 4, 25.00, 60, 1),
( 6, 4, 1, 25.00, 60, 1),
-- MG Road ↔ Indiranagar
( 7, 1, 5,  5.50, 20, 1),
( 8, 5, 1,  5.50, 20, 1),
-- Airport ↔ Whitefield
( 9, 2, 3, 28.00, 50, 1),
(10, 3, 2, 28.00, 50, 1),
-- Whitefield ↔ Electronic City
(11, 3, 4, 30.00, 65, 1),
(12, 4, 3, 30.00, 65, 1),
-- Indiranagar ↔ Whitefield
(13, 5, 3, 18.00, 45, 1),
(14, 3, 5, 18.00, 45, 1),
-- Indiranagar ↔ Electronic City
(15, 5, 4, 22.00, 55, 1),
(16, 4, 5, 22.00, 55, 1);

-- ==============================================================
-- 7. VEHICLES  (18 vehicles with INR rates)
-- ==============================================================
INSERT INTO vehicles
    (id, vehicle_id, name, model, brand, year, category_id, branch_id,
     color, fuel_type, transmission, seating_capacity,
     daily_rate, weekly_rate, monthly_rate, security_deposit,
     image_url, description, features, status, mileage, engine_cc,
     created_at, updated_at)
VALUES

-- ── Economy Cars (category_id=1) ──────────────────────────────
(1,  'VKT-SW-001',
     'Maruti Swift LXi',          'Swift',        'Maruti Suzuki',  2022,
     1, 1, 'Pearl White',     'Petrol', 'Manual',    5,
      900.00,  5600.00,  20000.00,  5000.00,
     'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
     'Fuel-efficient hatchback perfect for Bengaluru city drives.',
     '["AC","Bluetooth","Rear Camera","Power Windows","ABS","Airbags x2"]',
     'Available', 23.20, 1197,
     '2024-01-15 10:00:00', '2024-01-15 10:00:00'),

(2,  'VKT-I20-002',
     'Hyundai i20 Asta',          'i20',          'Hyundai',        2023,
     1, 1, 'Typhoon Silver',  'Petrol', 'Manual',    5,
     1100.00,  6800.00,  24000.00,  6000.00,
     'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
     'Feature-rich premium hatchback with sunroof and touchscreen.',
     '["Sunroof","8-inch Touchscreen","Wireless Charging","Rear Camera","Lane Departure Warning","6 Airbags"]',
     'Available', 20.35, 1197,
     '2024-01-15 10:00:00', '2024-01-15 10:00:00'),

(3,  'VKT-HOC-003',
     'Honda City ZX CVT',         'City',         'Honda',          2023,
     1, 5, 'Lunar Silver',    'Petrol', 'Automatic', 5,
     1400.00,  8700.00,  30000.00,  8000.00,
     'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80',
     'Elegant mid-size sedan with CVT gearbox and premium interiors.',
     '["Honda Sensing","Sunroof","Wireless Apple CarPlay","Heated Seats","6 Airbags","Lane Keep Assist"]',
     'Available', 18.40, 1498,
     '2024-01-20 10:00:00', '2024-01-20 10:00:00'),

(4,  'VKT-TIG-004',
     'Tata Tigor XZ+',            'Tigor',        'Tata Motors',    2022,
     1, 4, 'Magnetic Red',    'Petrol', 'Manual',    5,
      850.00,  5300.00,  18500.00,  5000.00,
     'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
     'Compact sedan with large boot, ideal for airport runs.',
     '["AC","Harman Audio","Rear Camera","ABS","Airbags x2","Power Windows"]',
     'Available', 19.90, 1199,
     '2024-01-20 10:00:00', '2024-01-20 10:00:00'),

(5,  'VKT-KWD-005',
     'Renault Kwid RXL',          'Kwid',         'Renault',        2021,
     1, 4, 'Fiery Red',       'Petrol', 'Manual',    5,
      800.00,  5000.00,  17000.00,  4000.00,
     'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80',
     'Budget-friendly hatchback ideal for short trips around Electronic City.',
     '["AC","Digital Instrument Cluster","Power Windows","ABS","Airbags x2"]',
     'Available', 22.30, 999,
     '2024-02-01 10:00:00', '2024-02-01 10:00:00'),

-- ── SUVs (category_id=2) ──────────────────────────────────────
(6,  'VKT-INN-006',
     'Toyota Innova Crysta GX',   'Innova Crysta','Toyota',         2022,
     2, 2, 'Platinum White Pearl', 'Diesel', 'Manual', 7,
     2500.00, 15500.00,  55000.00, 15000.00,
     'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
     'The king of MPVs – spacious 7-seater perfect for airport transfers.',
     '["Captain Seats","AC","Touchscreen","Rear Camera","ESP","Airbags x6","Ambient Lighting"]',
     'Available', 14.29, 2393,
     '2024-01-15 11:00:00', '2024-01-15 11:00:00'),

(7,  'VKT-SEL-007',
     'Kia Seltos HTX AWD',        'Seltos',       'Kia',            2023,
     2, 3, 'Glacier White Pearl', 'Petrol', 'Automatic', 5,
     2200.00, 13600.00,  48000.00, 12000.00,
     'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',
     'Feature-loaded compact SUV with panoramic sunroof and ADAS.',
     '["Panoramic Sunroof","ADAS","Bose 8-Speaker","360° Camera","Wireless CarPlay","Ventilated Seats","Ambient Lighting"]',
     'Rented', 16.50, 1497,
     '2024-01-20 11:00:00', '2024-01-20 11:00:00'),

(8,  'VKT-CRE-008',
     'Hyundai Creta SX(O)',        'Creta',        'Hyundai',        2023,
     2, 5, 'Abyss Black Pearl',   'Diesel', 'Automatic', 5,
     2000.00, 12400.00,  44000.00, 10000.00,
     'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80',
     'Bengaluru favourite – stylish compact SUV with diesel efficiency.',
     '["Panoramic Sunroof","ADAS Level 2","Bose Sound","360° Camera","Ventilated Front Seats","Connected Car Tech"]',
     'Available', 18.40, 1493,
     '2024-01-25 11:00:00', '2024-01-25 11:00:00'),

(9,  'VKT-XUV-009',
     'Mahindra XUV700 AX7 L',     'XUV700',       'Mahindra',       2022,
     2, 1, 'Dazzling Silver',     'Diesel', 'Automatic', 7,
     3500.00, 21700.00,  75000.00, 20000.00,
     'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
     'Flagship 7-seater SUV with ADAS, panoramic roof and AdrenoX system.',
     '["AdrenoX Infotainment","ADAS Level 2","Panoramic Sunroof","Sony 3D Sound","360° Camera","Wireless Charging","7-Seater"]',
     'Available', 15.20, 2198,
     '2024-02-01 11:00:00', '2024-02-01 11:00:00'),

(10, 'VKT-FOR-010',
     'Toyota Fortuner Legender 4x4','Fortuner',   'Toyota',         2022,
     2, 2, 'Supersonic Red',      'Diesel', 'Automatic', 7,
     4000.00, 24800.00,  88000.00, 25000.00,
     'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
     'Premium 4x4 SUV – ideal for weekend getaways to Coorg and Ooty.',
     '["4WD","JBL 11-Speaker","Panoramic Sunroof","Wireless CarPlay","Lane Departure","Front & Rear ParkSense","Ambient Lighting"]',
     'Available', 12.00, 2755,
     '2024-02-01 11:00:00', '2024-02-01 11:00:00'),

-- ── Motorcycles (category_id=3) ───────────────────────────────
(11, 'VKT-MET-011',
     'Royal Enfield Meteor 350',  'Meteor 350',   'Royal Enfield',  2023,
     3, 1, 'Fireball Orange',     'Petrol', 'Manual', 2,
      650.00,  4000.00,  14000.00,  3000.00,
     'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
     'The smooth cruiser – great for Bengaluru weekends and highway rides.',
     '["Tripper Navigation","USB Charging","Halogen Headlight","Dual Channel ABS","Bluetooth Connectivity"]',
     'Available', 36.40, 349,
     '2024-02-10 10:00:00', '2024-02-10 10:00:00'),

(12, 'VKT-ACT-012',
     'Honda Activa 6G DLX',       'Activa 6G',    'Honda',          2023,
     3, 3, 'Pearl Precious White','Petrol', 'Manual', 2,
      400.00,  2500.00,   9000.00,  2000.00,
     'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
     'India\'s best-selling scooter – nimble and fuel-efficient for city rides.',
     '["ACG Silent Start","Combi Brake System","LED Headlight","USB Mobile Charger","Dual Function Switch"]',
     'Available', 60.00, 109,
     '2024-02-10 10:00:00', '2024-02-10 10:00:00'),

(13, 'VKT-PUL-013',
     'Bajaj Pulsar NS200',        'Pulsar NS200',  'Bajaj Auto',     2022,
     3, 4, 'Volcanic Black',      'Petrol', 'Manual', 2,
      500.00,  3100.00,  11000.00,  2500.00,
     'https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?auto=format&fit=crop&w=800&q=80',
     'Sporty naked street fighter – perfect for quick Bengaluru commutes.',
     '["Slipper Clutch","Dual Channel ABS","LED DRL","Adjustable Suspension","Semi-Digital Cluster"]',
     'Available', 35.00, 199,
     '2024-02-15 10:00:00', '2024-02-15 10:00:00'),

-- ── Van (category_id=4) ───────────────────────────────────────
(14, 'VKT-FTV-014',
     'Force Traveller 26 Seater', 'Traveller 26', 'Force Motors',   2022,
     4, 2, 'Pearl White',         'Diesel', 'Manual', 26,
     5500.00, 34100.00, 120000.00, 30000.00,
     'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?auto=format&fit=crop&w=800&q=80',
     'Large capacity van ideal for corporate outings, pilgrimages, and tours.',
     '["Push-Back Seats","AC","Large Luggage Space","Rear-Wheel Drive","Music System","Call Bell"]',
     'Available', 11.00, 2596,
     '2024-02-15 10:00:00', '2024-02-15 10:00:00'),

(15, 'VKT-ERT-015',
     'Maruti Ertiga ZXi+',        'Ertiga',        'Maruti Suzuki',  2023,
     4, 5, 'Nexa Blue',           'Petrol', 'Automatic', 7,
     1800.00, 11200.00,  39000.00,  9000.00,
     'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
     'Compact MPV – great for families and small groups across Bengaluru.',
     '["SmartPlay Pro Touchscreen","360° Camera","Wireless CarPlay","6 Airbags","Rear AC Vents","Padded Armrests"]',
     'Rented', 19.34, 1462,
     '2024-03-01 10:00:00', '2024-03-01 10:00:00'),

-- ── Luxury (category_id=5) ────────────────────────────────────
(16, 'VKT-BMW-016',
     'BMW 3 Series 320d M Sport', '3 Series',     'BMW',            2023,
     5, 1, 'Carbon Black Metallic','Diesel', 'Automatic', 5,
     8000.00, 49600.00, 175000.00, 50000.00,
     'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
     'The ultimate business sedan – unmatched driving dynamics and luxury.',
     '["Live Cockpit Pro","Harman Kardon Sound","Wireless CarPlay","Parking Assistant Plus","Gesture Control","Ambient Lighting x6"]',
     'Available', 18.90, 1995,
     '2024-03-01 10:00:00', '2024-03-01 10:00:00'),

(17, 'VKT-MBC-017',
     'Mercedes-Benz C-Class 220d','C-Class',      'Mercedes-Benz',  2023,
     5, 1, 'Polar White',         'Diesel', 'Automatic', 5,
    10000.00, 62000.00, 220000.00, 70000.00,
     'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80',
     'The epitome of German luxury – perfect for high-profile corporate events.',
     '["MBUX Infotainment","Burmester Sound","64-colour Ambient Lighting","Active Distance Assist","Augmented Reality Nav","Massage Seats"]',
     'Available', 16.40, 1993,
     '2024-03-01 10:00:00', '2024-03-01 10:00:00'),

-- ── Electric (category_id=6) ──────────────────────────────────
(18, 'VKT-NEV-018',
     'Tata Nexon EV Max LR',      'Nexon EV Max', 'Tata Motors',    2023,
     6, 3, 'Intensi-Teal',        'Electric', 'Automatic', 5,
     1500.00,  9300.00,  33000.00,  8000.00,
     'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80',
     'India\'s most popular EV – 437 km range, ideal for eco-conscious travellers.',
     '["437 km Range","Zconnect App","Wireless Charging","JBL Sound","ADAS","Ventilated Seats","V2V Charging","10.25-inch Screen"]',
     'Reserved', 7.80, 0,   -- 0 engine_cc for EV
     '2024-03-10 10:00:00', '2024-03-10 10:00:00');

-- ==============================================================
-- 8. BOOKINGS  (12 bookings, triggers disabled for seed)
-- ==============================================================
-- Temporarily drop triggers to allow seed data without conflicts
DROP TRIGGER IF EXISTS before_booking_insert;
DROP TRIGGER IF EXISTS before_booking_update;

INSERT INTO bookings
    (id, booking_reference, customer_id, vehicle_id, pickup_branch_id, return_branch_id,
     pickup_datetime, return_datetime, actual_return_datetime,
     status, total_days, subtotal, discount, additional_charges, total_amount,
     notes, created_at, updated_at)
VALUES
-- Completed bookings (historical)
(1,  'VKT-BK-240201', 1,  1, 1, 1,
     '2024-10-01 09:00:00', '2024-10-04 09:00:00', '2024-10-04 10:30:00',
     'Completed', 3,  2700.00, 0.00,    0.00,  2700.00,
     'Customer requested child seat', '2024-09-28 14:00:00', '2024-10-04 11:00:00'),

(2,  'VKT-BK-240202', 2,  6, 2, 1,
     '2024-10-05 12:00:00', '2024-10-08 12:00:00', '2024-10-08 13:00:00',
     'Completed', 3, 7500.00, 500.00,   0.00,  7000.00,
     'Loyalty discount applied', '2024-10-03 10:00:00', '2024-10-08 13:30:00'),

(3,  'VKT-BK-240203', 3, 16, 1, 5,
     '2024-10-10 08:00:00', '2024-10-12 08:00:00', '2024-10-12 09:00:00',
     'Completed', 2, 16000.00, 0.00,    0.00, 16000.00,
     'Corporate client – BMW 3 Series for client meeting', '2024-10-08 11:00:00', '2024-10-12 09:30:00'),

(4,  'VKT-BK-240204', 5, 11, 1, 1,
     '2024-10-15 07:00:00', '2024-10-17 07:00:00', '2024-10-17 07:30:00',
     'Completed', 2,  1300.00, 0.00,    0.00,  1300.00,
     'Weekend getaway ride', '2024-10-13 16:00:00', '2024-10-17 08:00:00'),

(5,  'VKT-BK-240205', 7, 17, 1, 1,
     '2024-10-18 10:00:00', '2024-10-20 10:00:00', '2024-10-20 10:00:00',
     'Completed', 2, 20000.00, 2000.00, 0.00, 18000.00,
     'Premier customer 10% discount', '2024-10-16 12:00:00', '2024-10-20 11:00:00'),

-- Cancelled bookings
(6,  'VKT-BK-240206', 4, 18, 3, 3,
     '2024-10-22 11:00:00', '2024-10-24 11:00:00', NULL,
     'Cancelled', 2,  3000.00, 0.00,    0.00,  3000.00,
     'Customer cancelled due to travel plan change', '2024-10-20 09:00:00', '2024-10-21 14:00:00'),

-- Currently Active rentals
(7,  'VKT-BK-241001', 1,  8, 5, 1,
     '2026-10-12 09:00:00', '2026-10-16 09:00:00', NULL,
     'Active', 4,  8000.00, 800.00,   0.00,  7200.00,
     'Customer requested GPS device', '2026-10-10 15:00:00', '2026-10-12 09:30:00'),

(8,  'VKT-BK-241002', 3,  7, 3, 3,
     '2026-10-13 10:00:00', '2026-10-17 10:00:00', NULL,
     'Active', 4,  8800.00, 0.00,    0.00,  8800.00,
     'Whitefield branch pickup and return', '2026-10-11 16:00:00', '2026-10-13 10:15:00'),

(9,  'VKT-BK-241003', 6, 15, 5, 2,
     '2026-10-14 08:00:00', '2026-10-18 08:00:00', NULL,
     'Active', 4,  7200.00, 0.00,  500.00,  7700.00,
     'One-way rental – Indiranagar to Airport, extra drop charge applied',
     '2026-10-12 11:00:00', '2026-10-14 08:30:00'),

-- Confirmed (upcoming) bookings
(10, 'VKT-BK-241004', 8,  3, 1, 1,
     '2026-10-20 09:00:00', '2026-10-22 09:00:00', NULL,
     'Confirmed', 2,  2800.00, 0.00,    0.00,  2800.00,
     'Honda City for business meeting', '2026-10-15 10:00:00', '2026-10-15 10:00:00'),

(11, 'VKT-BK-241005', 9, 10, 2, 4,
     '2026-10-25 06:00:00', '2026-11-01 18:00:00', NULL,
     'Confirmed', 7, 28000.00, 2800.00, 0.00, 25200.00,
     'Airport pickup – Fortuner for week-long family trip', '2026-10-14 09:00:00', '2026-10-14 09:00:00'),

-- Pending booking
(12, 'VKT-BK-241006', 10, 2, 1, 3,
     '2026-10-28 11:00:00', '2026-10-30 11:00:00', NULL,
     'Pending', 2,  2200.00, 0.00,    0.00,  2200.00,
     'Pending confirmation – awaiting document verification',
     '2026-10-15 12:00:00', '2026-10-15 12:00:00');

-- Re-create triggers after seed data insert
DELIMITER $$

CREATE TRIGGER before_booking_insert
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    DECLARE conflict_count INT DEFAULT 0;

    SELECT COUNT(*) INTO conflict_count
    FROM bookings
    WHERE vehicle_id = NEW.vehicle_id
      AND status NOT IN ('Cancelled')
      AND (
          (NEW.pickup_datetime  < return_datetime  AND NEW.return_datetime  > pickup_datetime)
      );

    IF conflict_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Booking conflict: vehicle already booked for the requested time range.';
    END IF;
END$$

CREATE TRIGGER before_booking_update
BEFORE UPDATE ON bookings
FOR EACH ROW
BEGIN
    DECLARE conflict_count INT DEFAULT 0;

    IF (NEW.pickup_datetime != OLD.pickup_datetime
        OR NEW.return_datetime != OLD.return_datetime
        OR NEW.vehicle_id != OLD.vehicle_id)
       AND NEW.status NOT IN ('Cancelled') THEN

        SELECT COUNT(*) INTO conflict_count
        FROM bookings
        WHERE vehicle_id = NEW.vehicle_id
          AND id != NEW.id
          AND status NOT IN ('Cancelled')
          AND (
              (NEW.pickup_datetime < return_datetime AND NEW.return_datetime > pickup_datetime)
          );

        IF conflict_count > 0 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Booking update conflict: vehicle already booked for the requested time range.';
        END IF;
    END IF;
END$$

DELIMITER ;

-- ==============================================================
-- 9. RENTALS  (5 records – active and completed)
-- ==============================================================
INSERT INTO rentals
    (id, booking_id, vehicle_id, customer_id,
     pickup_datetime, expected_return_datetime, actual_return_datetime,
     status, odometer_start, odometer_end,
     condition_on_pickup, condition_on_return,
     created_at, updated_at)
VALUES
-- Completed rentals
(1, 1, 1, 1,
 '2024-10-01 09:00:00', '2024-10-04 09:00:00', '2024-10-04 10:30:00',
 'Completed', 18500, 18812,
 'Good condition – minor scratch on rear bumper noted and photographed.',
 'Returned in same condition – scratch unchanged. Fuel full.',
 '2024-10-01 09:05:00', '2024-10-04 11:00:00'),

(2, 2, 6, 2,
 '2024-10-05 12:00:00', '2024-10-08 12:00:00', '2024-10-08 13:00:00',
 'Completed', 32100, 32541,
 'Excellent condition – full fuel, clean interior.',
 'Returned clean. Slight dust on exterior – airport parking. Fuel full.',
 '2024-10-05 12:05:00', '2024-10-08 13:30:00'),

(3, 4, 11, 5,
 '2024-10-15 07:00:00', '2024-10-17 07:00:00', '2024-10-17 07:30:00',
 'Completed', 8900, 9187,
 'Good condition – tyre pressure checked and topped.',
 'Returned on time. Clean. Fuel full.',
 '2024-10-15 07:05:00', '2024-10-17 08:00:00'),

-- Active rentals
(4, 7, 8, 1,
 '2026-10-12 09:00:00', '2026-10-16 09:00:00', NULL,
 'Active', 21400, NULL,
 'Excellent condition – all four tyres new. Fuel full. Interior spotless.',
 NULL,
 '2026-10-12 09:05:00', '2026-10-12 09:05:00'),

(5, 8, 7, 3,
 '2026-10-13 10:00:00', '2026-10-17 10:00:00', NULL,
 'Active', 9850, NULL,
 'Good condition – one minor door ding on driver side noted.',
 NULL,
 '2026-10-13 10:10:00', '2026-10-13 10:10:00');

-- ==============================================================
-- 10. RENTAL HISTORY  (3 completed entries for reporting)
-- ==============================================================
INSERT INTO rental_history
    (id, booking_id, vehicle_id, customer_id,
     pickup_datetime, return_datetime, total_days, total_amount,
     status, notes, created_at)
VALUES
(1, 1,  1, 1,
 '2024-10-01 09:00:00', '2024-10-04 10:30:00', 3,  2700.00,
 'Completed', 'Smooth rental – no incidents. Customer satisfaction score: 5/5.',
 '2024-10-04 11:05:00'),

(2, 2,  6, 2,
 '2024-10-05 12:00:00', '2024-10-08 13:00:00', 3,  7000.00,
 'Completed', 'Loyalty discount applied. Customer happy with Innova space.',
 '2024-10-08 13:35:00'),

(3, 4, 11, 5,
 '2024-10-15 07:00:00', '2024-10-17 07:30:00', 2,  1300.00,
 'Completed', 'Weekend cruiser rental. Royal Enfield Meteor 350 – zero incidents.',
 '2024-10-17 08:05:00');

-- ==============================================================
-- 11. WAITING QUEUE  (4 entries)
-- ==============================================================
INSERT INTO waiting_queue
    (id, customer_id, vehicle_category_id, branch_id,
     requested_from, requested_to, priority, status,
     enqueued_at, fulfilled_at)
VALUES
(1, 4, 2, 3,
 '2026-10-16 10:00:00', '2026-10-19 10:00:00',
 2, 'Waiting',
 '2026-10-14 14:30:00', NULL),

(2, 6, 6, 3,
 '2026-10-18 09:00:00', '2026-10-21 09:00:00',
 3, 'Notified',
 '2026-10-13 11:00:00', NULL),

(3, 8, 1, 1,
 '2026-10-20 08:00:00', '2026-10-23 08:00:00',
 5, 'Waiting',
 '2026-10-15 09:00:00', NULL),

(4, 2, 2, 2,
 '2026-10-25 06:00:00', '2026-11-02 18:00:00',
 1, 'Waiting',
 '2026-10-15 10:30:00', NULL);

-- ==============================================================
-- 12. MAINTENANCE RECORDS  (3 records)
-- ==============================================================
INSERT INTO maintenance_records
    (id, vehicle_id, maintenance_type, description, cost,
     scheduled_date, completed_date, performed_by, branch_id,
     status, created_at)
VALUES
(1, 5, 'Periodic Service',
 'Renault Kwid – 10,000 km service: engine oil, oil filter, air filter, spark plugs, brake fluid check, wheel alignment and balancing.',
 4500.00,
 '2026-10-10', '2026-10-10',
 'Sri Balaji Auto Works, Electronic City', 4,
 'Completed', '2026-10-08 10:00:00'),

(2, 7, 'Tyre Replacement',
 'Kia Seltos – front two tyres replaced (MRF ZLX 215/60 R17). Alignment adjusted after replacement.',
 12000.00,
 '2026-10-18', NULL,
 'Seltos Authorised Service Centre, Whitefield', 3,
 'Scheduled', '2026-10-14 14:00:00'),

(3, 14, 'AC Repair',
 'Force Traveller – AC compressor belt worn, refrigerant recharge and blower motor bearing replacement.',
 8500.00,
 '2026-10-15', NULL,
 'Cool Air Auto Services, KIAL Branch', 2,
 'InProgress', '2026-10-13 09:00:00');

-- ==============================================================
-- 13. INVOICES  (5 invoices)
-- ==============================================================
INSERT INTO invoices
    (id, invoice_number, booking_id, customer_id,
     subtotal, discount, additional_charges, tax_amount, total_amount,
     payment_status, issued_at, due_date, paid_at)
VALUES
(1, 'VKT-INV-240001', 1, 1,
  2700.00,    0.00,   0.00, 486.00,  3186.00,
  'Paid',
  '2024-10-04 11:00:00', '2024-10-04 18:00:00', '2024-10-04 11:30:00'),

(2, 'VKT-INV-240002', 2, 2,
  7500.00,  500.00,   0.00, 1260.00, 8260.00,
  'Paid',
  '2024-10-08 13:30:00', '2024-10-08 20:00:00', '2024-10-08 14:00:00'),

(3, 'VKT-INV-240003', 3, 3,
 16000.00,    0.00,   0.00, 2880.00, 18880.00,
  'Paid',
  '2024-10-12 09:30:00', '2024-10-12 18:00:00', '2024-10-12 10:00:00'),

(4, 'VKT-INV-241001', 7, 1,
  8000.00,  800.00,   0.00, 1296.00,  8496.00,
  'Pending',
  '2026-10-12 09:30:00', '2026-10-16 18:00:00', NULL),

(5, 'VKT-INV-241002', 9, 6,
  7200.00,    0.00, 500.00, 1386.00,  9086.00,
  'Partially Paid',
  '2026-10-14 08:30:00', '2026-10-18 18:00:00', NULL);

-- ==============================================================
-- 14. PAYMENTS  (6 payment transactions)
-- ==============================================================
INSERT INTO payments
    (id, invoice_id, amount, payment_method, transaction_id, status, paid_at, notes)
VALUES
-- Full payment for invoice 1 (Arjun – Maruti Swift)
(1, 1, 3186.00, 'UPI',
 'UPI-2024100411301234', 'Success',
 '2024-10-04 11:30:00',
 'Google Pay – UPI ID: arjun.sharma@oksbi'),

-- Full payment for invoice 2 (Priya – Innova, loyalty discount)
(2, 2, 8260.00, 'Card',
 'CARD-2024100814002345', 'Success',
 '2024-10-08 14:00:00',
 'HDFC Credit Card – last 4 digits 7823'),

-- Full payment for invoice 3 (Rahul – BMW 3 Series)
(3, 3, 18880.00, 'NetBanking',
 'NB-2024101210003456', 'Success',
 '2024-10-12 10:00:00',
 'ICICI Net Banking – ref 2024101210003456'),

-- Failed payment attempt for invoice 4
(4, 4, 8496.00, 'Card',
 'CARD-2026101209004567', 'Failed',
 NULL,
 'Card declined – insufficient funds. Customer to retry.'),

-- Partial payment for invoice 5 (Sneha – Ertiga, one-way)
(5, 5, 5000.00, 'UPI',
 'UPI-2026101408305678', 'Success',
 '2026-10-14 08:30:00',
 'PhonePe – partial advance payment'),

-- Second payment (pending) for invoice 5
(6, 5, 4086.00, 'Simulated',
 NULL, 'Pending',
 NULL,
 'Remaining balance to be collected at vehicle return');

-- ==============================================================
-- 15. NOTIFICATIONS  (12 notifications)
-- ==============================================================
INSERT INTO notifications
    (id, user_id, title, message, type, is_read, created_at)
VALUES
-- Booking confirmations
(1,  4,  'Booking Confirmed – VKT-BK-241001',
     'Your booking for Hyundai Creta (VKT-CRE-008) is confirmed. Pickup on 12-Oct-2026 at 09:00 AM from Indiranagar – 100 Feet Road.',
     'Booking', 1, '2026-10-10 15:05:00'),

(2,  6,  'Booking Confirmed – VKT-BK-241002',
     'Your booking for Kia Seltos (VKT-SEL-007) is confirmed. Pickup on 13-Oct-2026 at 10:00 AM from Whitefield – ITPL.',
     'Booking', 1, '2026-10-11 16:05:00'),

(3,  9,  'Booking Confirmed – VKT-BK-241003',
     'Your booking for Maruti Ertiga (VKT-ERT-015) is confirmed. Pickup on 14-Oct-2026 at 08:00 AM from Indiranagar.',
     'Booking', 1, '2026-10-12 11:05:00'),

-- Rental start notifications
(4,  4,  'Rental Started – VKT-BK-241001',
     'Your rental has started. Odometer reading at pickup: 21,400 km. Expected return: 16-Oct-2026 09:00 AM. Drive safe!',
     'Rental', 1, '2026-10-12 09:10:00'),

(5,  6,  'Rental Started – VKT-BK-241002',
     'Your rental has started. Odometer reading at pickup: 9,850 km. Expected return: 17-Oct-2026 10:00 AM. Drive safe!',
     'Rental', 0, '2026-10-13 10:15:00'),

-- Payment notifications
(6,  4,  'Invoice Generated – VKT-INV-241001',
     'Invoice #VKT-INV-241001 for ₹8,496 has been generated for your booking VKT-BK-241001. Due on 16-Oct-2026.',
     'Payment', 0, '2026-10-12 09:30:00'),

(7,  9,  'Advance Payment Received – VKT-INV-241002',
     'We have received your advance payment of ₹5,000 via PhonePe. Remaining balance: ₹4,086 payable at return.',
     'Payment', 1, '2026-10-14 08:35:00'),

-- Maintenance notifications (sent to admin/manager)
(8,  1,  'Maintenance Scheduled – VKT-SEL-007',
     'Tyre replacement scheduled for Kia Seltos (VKT-SEL-007) on 18-Oct-2026 at Whitefield branch. Estimated cost: ₹12,000.',
     'Maintenance', 0, '2026-10-14 14:05:00'),

(9,  2,  'Maintenance InProgress – VKT-FTV-014',
     'Force Traveller (VKT-FTV-014) AC repair is in progress at KIAL branch. Vehicle unavailable until completion.',
     'Maintenance', 0, '2026-10-13 09:05:00'),

-- Waiting queue notifications
(10, 7,  'Vehicle Availability Alert',
     'A Kia Seltos (Electric category) matching your waiting queue request may become available at Whitefield branch from 16-Oct-2026. Check now!',
     'System', 0, '2026-10-14 11:00:00'),

-- System notifications
(11, 1,  'New Customer Registration',
     'New customer Meera Krishnan (meera.krishnan@gmail.com) registered and is awaiting document verification.',
     'System', 1, '2024-06-10 13:05:00'),

(12, 2,  'Upcoming Return – VKT-BK-241001',
     'Reminder: Hyundai Creta rented by Arjun Sharma is due for return on 16-Oct-2026 at 09:00 AM at MG Road branch.',
     'Rental', 0, '2026-10-15 08:00:00');

-- ==============================================================
-- RE-ENABLE FK CHECKS
-- ==============================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================
-- SUMMARY VERIFICATION QUERIES (run after seeding)
-- ==============================================================
/*
SELECT 'roles'              AS tbl, COUNT(*) AS rows FROM roles
UNION ALL SELECT 'users',               COUNT(*) FROM users
UNION ALL SELECT 'customers',           COUNT(*) FROM customers
UNION ALL SELECT 'vehicle_categories',  COUNT(*) FROM vehicle_categories
UNION ALL SELECT 'branches',            COUNT(*) FROM branches
UNION ALL SELECT 'branch_connections',  COUNT(*) FROM branch_connections
UNION ALL SELECT 'vehicles',            COUNT(*) FROM vehicles
UNION ALL SELECT 'bookings',            COUNT(*) FROM bookings
UNION ALL SELECT 'rentals',             COUNT(*) FROM rentals
UNION ALL SELECT 'rental_history',      COUNT(*) FROM rental_history
UNION ALL SELECT 'waiting_queue',       COUNT(*) FROM waiting_queue
UNION ALL SELECT 'maintenance_records', COUNT(*) FROM maintenance_records
UNION ALL SELECT 'invoices',            COUNT(*) FROM invoices
UNION ALL SELECT 'payments',            COUNT(*) FROM payments
UNION ALL SELECT 'notifications',       COUNT(*) FROM notifications;
*/

-- ============================================================
-- END OF SEED DATA
-- ============================================================
