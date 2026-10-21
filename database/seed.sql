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
(1, 'Admin',    'Full system & web administrator access – manages all resources, fleet, users, and configuration', '2024-01-01 09:00:00'),
(2, 'Customer', 'Registered customer – browse vehicles, book rentals, view invoices, and manage profile',         '2024-01-01 09:00:00');

-- ==============================================================
-- 2. USERS
--    Password hash used  : bcrypt hash of 'Password@123' / 'Admin@123'
--    Hash value          : $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- ==============================================================
INSERT INTO users (id, email, password_hash, role_id, is_active, created_at, updated_at, last_login) VALUES
-- Administrator Account
(1,  'admin@vektor.in',          '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 1, '2024-01-01 09:00:00', '2024-01-01 09:00:00', '2026-10-14 08:30:00'),
-- Customer Accounts
(4,  'arjun.sharma@gmail.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 1, '2024-02-10 11:00:00', '2024-02-10 11:00:00', '2026-10-10 14:20:00'),
(5,  'priya.nair@gmail.com',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 1, '2024-02-15 12:00:00', '2024-02-15 12:00:00', '2026-10-09 18:00:00'),
(6,  'rahul.verma@gmail.com',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 1, '2024-03-01 09:30:00', '2024-03-01 09:30:00', '2026-10-12 11:00:00'),
(7,  'kavitha.reddy@gmail.com',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 1, '2024-03-12 14:00:00', '2024-03-12 14:00:00', '2026-10-08 20:00:00'),
(8,  'deepak.menon@gmail.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 1, '2024-04-05 10:00:00', '2024-04-05 10:00:00', '2026-10-11 09:00:00'),
(9,  'sneha.rao@gmail.com',      '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 1, '2024-04-20 16:00:00', '2024-04-20 16:00:00', '2026-10-07 17:30:00'),
(10, 'vikram.iyer@gmail.com',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 1, '2024-05-01 08:00:00', '2024-05-01 08:00:00', '2026-10-13 22:00:00'),
(11, 'ananya.patel@gmail.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 1, '2024-05-15 11:30:00', '2024-05-15 11:30:00', '2026-10-06 15:00:00'),
(12, 'suresh.kumar@gmail.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 1, '2024-06-01 09:00:00', '2024-06-01 09:00:00', '2026-10-14 10:45:00'),
(13, 'meera.krishnan@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 1, '2024-06-10 13:00:00', '2024-06-10 13:00:00', '2026-10-05 12:00:00');

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
-- 5. BRANCHES (24 Major Hubs Across All Indian States & UTs)
-- ==============================================================
INSERT INTO branches
    (id, name, address, city, state, pincode, phone, email, manager_name, latitude, longitude, is_active, created_at)
VALUES
-- Karnataka
( 1, 'City Centre – MG Road', '12, Brigade Road Junction, MG Road', 'Bengaluru', 'Karnataka', '560001', '08041234567', 'mgroad@vektor.in', 'Rajesh Naidu', 12.9716000, 77.5946000, 1, '2024-01-01 09:00:00'),
( 2, 'Kempegowda Intl Airport (KIAL)', 'Terminal 1, Arrival Level, KIAL, Devanahalli', 'Bengaluru', 'Karnataka', '562300', '08042345678', 'airport.blr@vektor.in', 'Sumanth Hegde', 13.1979000, 77.7063000, 1, '2024-01-01 09:00:00'),
( 3, 'Whitefield – ITPL Tech Corridor', 'ITPL Main Road, Hoodi Circle, Whitefield', 'Bengaluru', 'Karnataka', '560066', '08043456789', 'whitefield@vektor.in', 'Padmavathi Krishnan', 12.9824000, 77.7280000, 1, '2024-01-05 10:00:00'),
( 4, 'Electronic City – Phase 1', 'Hosur Road, Electronic City Phase 1, Neeladri Road', 'Bengaluru', 'Karnataka', '560100', '08044567890', 'ecity@vektor.in', 'Ganesh Murthy', 12.8399000, 77.6770000, 1, '2024-01-05 10:00:00'),
( 5, 'Indiranagar – 100 Feet Road', '47, 100 Feet Road, HAL 2nd Stage, Indiranagar', 'Bengaluru', 'Karnataka', '560038', '08045678901', 'indiranagar@vektor.in', 'Lakshmi Bhat', 12.9784000, 77.6408000, 1, '2024-01-10 10:00:00'),
( 6, 'Mysuru – Palace Heritage Hub', 'Bangalore-Nilgiri Road, Nazarbad', 'Mysuru', 'Karnataka', '570010', '08212456789', 'mysuru@vektor.in', 'Praveen Gowda', 12.3051000, 76.6551000, 1, '2024-01-12 10:00:00'),

-- Maharashtra
( 7, 'Mumbai – Bandra Kurla Complex (BKC)', 'G Block, Bandra Kurla Complex, Bandra East', 'Mumbai', 'Maharashtra', '400051', '02226501234', 'bkc.mumbai@vektor.in', 'Aditya Deshmukh', 19.0674000, 72.8687000, 1, '2024-01-15 10:00:00'),
( 8, 'Mumbai – CSMIA Airport Terminal 2', 'Level 2 Arrivals, Chhatrapati Shivaji Maharaj Airport, Sahar', 'Mumbai', 'Maharashtra', '400099', '02266851234', 'airport.bom@vektor.in', 'Rohit Shinde', 19.0896000, 72.8656000, 1, '2024-01-15 10:00:00'),
( 9, 'Pune – Hinjewadi Infotech Park', 'Phase 1, Hinjewadi Rajiv Gandhi Infotech Park', 'Pune', 'Maharashtra', '411057', '02067123456', 'pune@vektor.in', 'Sneha Kulkarni', 18.5913000, 73.7389000, 1, '2024-01-18 10:00:00'),

-- Delhi NCR
(10, 'New Delhi – Connaught Place Central', 'Inner Circle, Block C, Connaught Place', 'New Delhi', 'Delhi', '110001', '01123412345', 'cp.delhi@vektor.in', 'Vikram Malhotra', 28.6315000, 77.2167000, 1, '2024-01-20 10:00:00'),
(11, 'New Delhi – IGI Airport Terminal 3', 'Terminal 3 Arrivals, Indira Gandhi Intl Airport', 'New Delhi', 'Delhi', '110037', '01149631234', 'airport.del@vektor.in', 'Amit Chawla', 28.5562000, 77.1000000, 1, '2024-01-20 10:00:00'),
(12, 'Gurugram – Cyber City DLF Phase 2', 'Building 10, DLF Cyber City, DLF Phase 2', 'Gurugram', 'Haryana', '122002', '01244512345', 'gurugram@vektor.in', 'Pooja Narang', 28.4906000, 77.0911000, 1, '2024-01-22 10:00:00'),
(13, 'Noida – Sector 18 Commercial Hub', 'Atta Market Road, Sector 18', 'Noida', 'Uttar Pradesh', '201301', '01204123456', 'noida@vektor.in', 'Manish Tyagi', 28.5708000, 77.3260000, 1, '2024-01-22 10:00:00'),

-- Goa
(14, 'North Goa – Panaji & Calangute Beach', 'Miramar Circle, Dayanand Bandodkar Marg, Panaji', 'Panaji', 'Goa', '403001', '08322421234', 'goa.north@vektor.in', 'Savio Fernandes', 15.4864000, 73.8124000, 1, '2024-01-25 10:00:00'),
(15, 'South Goa – Dabolim & MOPA Airport Hub', 'Airport Road, Dabolim', 'Vasco da Gama', 'Goa', '403801', '08322541234', 'airport.goa@vektor.in', 'Mario Rodrigues', 15.3808000, 73.8314000, 1, '2024-01-25 10:00:00'),

-- Telangana
(16, 'Hyderabad – Hitec City Cyber Towers', 'Hitec City Main Road, Madhapur', 'Hyderabad', 'Telangana', '500081', '04044561234', 'hiteccity@vektor.in', 'Kavitha Reddy', 17.4474000, 78.3762000, 1, '2024-02-01 10:00:00'),
(17, 'Hyderabad – Rajiv Gandhi Intl Airport', 'Passenger Terminal, Shamshabad', 'Hyderabad', 'Telangana', '500409', '04066971234', 'airport.hyd@vektor.in', 'Sanjay Rao', 17.2403000, 78.4294000, 1, '2024-02-01 10:00:00'),

-- Tamil Nadu
(18, 'Chennai – Anna Nagar Central', '2nd Avenue, Anna Nagar Roundtana', 'Chennai', 'Tamil Nadu', '600040', '04426211234', 'annanagar@vektor.in', 'Karthik Raman', 13.0850000, 80.2101000, 1, '2024-02-05 10:00:00'),
(19, 'Chennai – Meenambakkam Airport', 'GST Road, Meenambakkam', 'Chennai', 'Tamil Nadu', '600027', '04422561234', 'airport.maa@vektor.in', 'Devi Sundaram', 12.9941000, 80.1709000, 1, '2024-02-05 10:00:00'),

-- Kerala
(20, 'Kochi – Ernakulam & Nedumbassery Airport', 'MG Road, Shenoys, Ernakulam', 'Kochi', 'Kerala', '682016', '04842381234', 'kochi@vektor.in', 'Mathew Varghese', 9.9816000, 76.2999000, 1, '2024-02-10 10:00:00'),

-- Rajasthan
(21, 'Jaipur – Pink City & Airport Hub', 'Tonk Road, Near Jawahar Circle, Malviya Nagar', 'Jaipur', 'Rajasthan', '302017', '01412721234', 'jaipur@vektor.in', 'Rathore Singh', 26.8524000, 75.8052000, 1, '2024-02-12 10:00:00'),
(22, 'Udaipur – Lake Pichola City Hub', 'Saheli Marg, New Fatehpura, Sukhadia Circle', 'Udaipur', 'Rajasthan', '313001', '02942421234', 'udaipur@vektor.in', 'Bhavna Sharma', 24.5854000, 73.7125000, 1, '2024-02-12 10:00:00'),

-- Gujarat
(23, 'Ahmedabad – SG Highway & Airport', 'Sarkhej - Gandhinagar Hwy, Bodakdev', 'Ahmedabad', 'Gujarat', '380054', '07940121234', 'ahmedabad@vektor.in', 'Harsh Patel', 23.0373000, 72.5117000, 1, '2024-02-15 10:00:00'),

-- Himachal Pradesh
(24, 'Manali – Mall Road Adventure Hub', 'Mall Road, Siyal, Manali', 'Manali', 'Himachal Pradesh', '175131', '01902251234', 'manali@vektor.in', 'Rohan Thakur', 32.2396000, 77.1887000, 1, '2024-02-18 10:00:00');

-- ==============================================================
-- 6. BRANCH CONNECTIONS  (bidirectional graph, regional & highway)
-- ==============================================================
INSERT INTO branch_connections
    (id, from_branch_id, to_branch_id, distance_km, travel_time_mins, is_active)
VALUES
-- Local Bengaluru Graph (Maintained 100% for BFS tests)
( 1, 1, 2, 40.50, 75, 1),
( 2, 2, 1, 40.50, 75, 1),
( 3, 1, 3, 22.00, 55, 1),
( 4, 3, 1, 22.00, 55, 1),
( 5, 1, 4, 25.00, 60, 1),
( 6, 4, 1, 25.00, 60, 1),
( 7, 1, 5,  5.50, 20, 1),
( 8, 5, 1,  5.50, 20, 1),
( 9, 2, 3, 28.00, 50, 1),
(10, 3, 2, 28.00, 50, 1),
(11, 3, 4, 30.00, 65, 1),
(12, 4, 3, 30.00, 65, 1),
(13, 5, 3, 18.00, 45, 1),
(14, 3, 5, 18.00, 45, 1),
(15, 5, 4, 22.00, 55, 1),
(16, 4, 5, 22.00, 55, 1),

-- Regional & Interstate National Highway Connections
(17, 1, 6, 145.00, 180, 1),
(18, 6, 1, 145.00, 180, 1),
(19, 1, 18, 345.00, 360, 1),
(20, 18, 1, 345.00, 360, 1),
(21, 1, 16, 570.00, 540, 1),
(22, 16, 1, 570.00, 540, 1),
(23, 7, 8, 12.00, 30, 1),
(24, 8, 7, 12.00, 30, 1),
(25, 7, 9, 148.00, 190, 1),
(26, 9, 7, 148.00, 190, 1),
(27, 7, 14, 580.00, 600, 1),
(28, 14, 7, 580.00, 600, 1),
(29, 14, 15, 35.00, 55, 1),
(30, 15, 14, 35.00, 55, 1),
(31, 10, 11, 16.00, 40, 1),
(32, 11, 10, 16.00, 40, 1),
(33, 10, 12, 32.00, 50, 1),
(34, 12, 10, 32.00, 50, 1),
(35, 10, 13, 22.00, 45, 1),
(36, 13, 10, 22.00, 45, 1),
(37, 10, 21, 280.00, 300, 1),
(38, 21, 10, 280.00, 300, 1),
(39, 21, 22, 395.00, 380, 1),
(40, 22, 21, 395.00, 380, 1),
(41, 10, 24, 540.00, 660, 1),
(42, 24, 10, 540.00, 660, 1),
(43, 7, 23, 525.00, 540, 1),
(44, 23, 7, 525.00, 540, 1),
(45, 1, 20, 540.00, 580, 1),
(46, 20, 1, 540.00, 580, 1);

-- ==============================================================
-- 7. VEHICLES (24 Authentic Indian Rental Vehicles Across Fleet)
-- ==============================================================
INSERT INTO vehicles
    (id, vehicle_id, name, model, brand, year, category_id, branch_id,
     color, fuel_type, transmission, seating_capacity,
     daily_rate, weekly_rate, monthly_rate, security_deposit,
     image_url, description, features, status, mileage, engine_cc,
     created_at, updated_at)
VALUES

-- 1. Maruti Swift
(1,  'VKT-SW-001',
     'Maruti Suzuki Swift VXi', 'Swift', 'Maruti Suzuki', 2023,
     1, 1, 'Pearl Arctic White', 'Petrol', 'Manual', 5,
     1200.00, 7200.00, 26000.00, 5000.00,
     'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
     'India\'s most rented hatchback – ultra-reliable, fuel-efficient and easy to park anywhere.',
     '["AC","Bluetooth Audio","Rear Camera","Power Windows","ABS with EBD","Dual Airbags"]',
     'Available', 24.80, 1197, '2024-01-15 10:00:00', '2024-01-15 10:00:00'),

-- 2. Hyundai i20
(2,  'VKT-I20-002',
     'Hyundai i20 Asta Sunroof', 'i20', 'Hyundai', 2023,
     1, 7, 'Fiery Red', 'Petrol', 'Manual', 5,
     1400.00, 8400.00, 30000.00, 6000.00,
     'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
     'Premium hatchback with electric sunroof, Bose sound system, and spacious seating.',
     '["Electric Sunroof","10.25-inch Touchscreen","Bose 7-Speaker","Wireless Charger","6 Airbags"]',
     'Available', 20.35, 1197, '2024-01-15 10:00:00', '2024-01-15 10:00:00'),

-- 3. Honda City
(3,  'VKT-HOC-003',
     'Honda City ZX CVT Sedan', 'City', 'Honda', 2023,
     1, 10, 'Radiant Red Metallic', 'Petrol', 'Automatic', 5,
     1800.00, 10800.00, 38000.00, 8000.00,
     'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80',
     'Executive sedan with smooth CVT automatic, plush leather seats, and ADAS safety.',
     '["Honda Sensing ADAS","Sunroof","Wireless Apple CarPlay","Cruise Control","6 Airbags"]',
     'Available', 18.40, 1498, '2024-01-20 10:00:00', '2024-01-20 10:00:00'),

-- 4. Tata Tigor
(4,  'VKT-TIG-004',
     'Tata Tigor XZ+ Dual Tone', 'Tigor', 'Tata Motors', 2023,
     1, 4, 'Opal White', 'Petrol', 'Manual', 5,
     1100.00, 6600.00, 24000.00, 5000.00,
     'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
     '4-star Global NCAP safety rated compact sedan with generous 419L boot space.',
     '["Harman Audio System","Projector Headlamps","Rear Camera","Push Button Start","Dual Airbags"]',
     'Available', 19.90, 1199, '2024-01-20 10:00:00', '2024-01-20 10:00:00'),

-- 5. Renault Kwid
(5,  'VKT-KWD-005',
     'Renault Kwid Climber', 'Kwid', 'Renault', 2023,
     1, 14, 'Zanskar Blue', 'Petrol', 'Manual', 5,
     950.00, 5700.00, 20000.00, 4000.00,
     'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80',
     'Budget-friendly micro-hatchback with SUV styling, ideal for narrow Goa beach lanes.',
     '["High Ground Clearance","8-inch Touchscreen","Rear Camera","ABS","Airbags"]',
     'Available', 22.30, 999, '2024-02-01 10:00:00', '2024-02-01 10:00:00'),

-- 6. Toyota Innova Crysta
(6,  'VKT-INN-006',
     'Toyota Innova Crysta 2.4 VX', 'Innova Crysta', 'Toyota', 2023,
     2, 2, 'Super White', 'Diesel', 'Manual', 7,
     2800.00, 17500.00, 62000.00, 15000.00,
     'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
     'The undisputed king of Indian highway rentals – legendary comfort and 7 captain seats.',
     '["Captain Seats","Rear AC with Independent Controls","Touchscreen Infotainment","7 Airbags","Hill Assist"]',
     'Available', 14.29, 2393, '2024-01-15 11:00:00', '2024-01-15 11:00:00'),

-- 7. Kia Seltos
(7,  'VKT-SEL-007',
     'Kia Seltos HTX Panoramic', 'Seltos', 'Kia', 2023,
     2, 3, 'Gravity Grey', 'Petrol', 'Automatic', 5,
     2200.00, 13600.00, 48000.00, 12000.00,
     'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',
     'Feature-loaded compact SUV with panoramic sunroof and dual 10.25-inch panoramic displays.',
     '["Dual Panoramic Sunroof","10.25-inch Touchscreen","Smart Pure Air Purifier","6 Airbags","LED Lightbar"]',
     'Rented', 16.50, 1497, '2024-01-20 11:00:00', '2024-01-20 11:00:00'),

-- 8. Hyundai Creta
(8,  'VKT-CRE-008',
     'Hyundai Creta SX(O) Turbo', 'Creta', 'Hyundai', 2024,
     2, 5, 'Abyss Black Pearl', 'Diesel', 'Automatic', 5,
     2400.00, 14800.00, 52000.00, 12000.00,
     'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80',
     'India\'s favourite SUV – ADAS Level 2, ventilated seats, and commanding highway presence.',
     '["ADAS Level 2 Suite","Panoramic Sunroof","Bose 8-Speaker","Ventilated Front Seats","360° Camera"]',
     'Available', 18.40, 1493, '2024-01-25 11:00:00', '2024-01-25 11:00:00'),

-- 9. Mahindra XUV700
(9,  'VKT-XUV-009',
     'Mahindra XUV700 AX7 Luxury', 'XUV700', 'Mahindra', 2023,
     2, 16, 'Midnight Black', 'Diesel', 'Automatic', 7,
     3400.00, 21000.00, 72000.00, 20000.00,
     'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
     'High-tech 7-seater SUV with Sony 3D sound, Skyroof, and mStallion/mHawk power.',
     '["Sony 3D 12-Speaker","Panoramic Skyroof","Wireless Charging","ADAS","Electronic Park Brake"]',
     'Available', 15.20, 2198, '2024-02-01 11:00:00', '2024-02-01 11:00:00'),

-- 10. Toyota Fortuner
(10, 'VKT-FOR-010',
     'Toyota Fortuner 4x4 Legender', 'Fortuner Legender', 'Toyota', 2023,
     2, 8, 'Platinum White Pearl', 'Diesel', 'Automatic', 7,
     4800.00, 29800.00, 99000.00, 30000.00,
     'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
     'The ultimate VIP road-trip SUV – unmatched 4x4 capability and dominating road presence.',
     '["4x4 with Low-Range Transfer","11-Speaker JBL Sound","Kick-Sensor Tailgate","Wireless Charger","7 Airbags"]',
     'Available', 12.00, 2755, '2024-02-01 11:00:00', '2024-02-01 11:00:00'),

-- 11. Royal Enfield Classic 350
(11, 'VKT-MET-011',
     'Royal Enfield Classic 350', 'Classic 350', 'Royal Enfield', 2023,
     3, 14, 'Halcyon Black', 'Petrol', 'Manual', 2,
     750.00, 4500.00, 16000.00, 3000.00,
     'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
     'The timeless Indian thump – quintessential cruiser for Goa coasts and Himachal highways.',
     '["J-Series Smooth Engine","Dual-Channel ABS","USB Mobile Charger","Iconic Teardrop Tank"]',
     'Available', 36.40, 349, '2024-02-10 10:00:00', '2024-02-10 10:00:00'),

-- 12. Honda Activa 6G
(12, 'VKT-ACT-012',
     'Honda Activa 6G DLX', 'Activa 6G', 'Honda', 2024,
     3, 1, 'Pearl Siren Blue', 'Petrol', 'Automatic', 2,
     450.00, 2700.00, 9500.00, 2000.00,
     'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
     'India\'s #1 selling scooter – lightweight, ultra-smooth automatic transmission for easy city commuting.',
     '["eSP Engine","Silent Start with ACG","Telescopic Suspension","External Fuel Fill","Combi Brake System"]',
     'Available', 50.00, 109, '2024-02-10 10:00:00', '2024-02-10 10:00:00'),

-- 13. Bajaj Pulsar NS200
(13, 'VKT-PUL-013',
     'Bajaj Pulsar NS200 BS6', 'Pulsar NS200', 'Bajaj Auto', 2023,
     3, 9, 'Burnt Red & White', 'Petrol', 'Manual', 2,
     600.00, 3600.00, 13000.00, 2500.00,
     'https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?auto=format&fit=crop&w=800&q=80',
     'Streetfighter motorcycle with liquid-cooled 24.5 PS engine and dual-channel ABS.',
     '["Liquid-Cooled Triple Spark","Dual-Channel ABS","Perimeter Frame","Nitrox Monoshock"]',
     'Available', 35.00, 199, '2024-02-15 10:00:00', '2024-02-15 10:00:00'),

-- 14. Force Urbania / Traveller
(14, 'VKT-FTV-014',
     'Force Urbania Luxury Van', 'Urbania 13', 'Force Motors', 2023,
     4, 11, 'Pearl White', 'Diesel', 'Manual', 13,
     5500.00, 34000.00, 120000.00, 30000.00,
     'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?auto=format&fit=crop&w=800&q=80',
     'Modern European-styled luxury passenger van with individual reclining seats and dedicated AC vents.',
     '["Individual Reclining Seats","Individual AC Vents","Dual Airbags","Sealed Panoramic Windows","Spacious Luggage Area"]',
     'Available', 11.50, 2596, '2024-02-15 10:00:00', '2024-02-15 10:00:00'),

-- 15. Maruti Ertiga
(15, 'VKT-ERT-015',
     'Maruti Ertiga ZXi+ AT', 'Ertiga', 'Maruti Suzuki', 2023,
     4, 18, 'Metallic Magma Grey', 'Petrol', 'Automatic', 7,
     1900.00, 11800.00, 42000.00, 9000.00,
     'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
     'The ultimate economical 7-seater MPV with smart hybrid technology and paddle shifters.',
     '["7-Seater Flexibility","Paddle Shifters","SmartPlay Pro Infotainment","Rear AC Blower","Cruise Control"]',
     'Rented', 20.30, 1462, '2024-03-01 10:00:00', '2024-03-01 10:00:00'),

-- 16. BMW 3 Series
(16, 'VKT-BMW-016',
     'BMW 3 Series 330Li M Sport', '3 Series', 'BMW', 2023,
     5, 7, 'Portimao Blue', 'Petrol', 'Automatic', 5,
     8500.00, 52000.00, 180000.00, 50000.00,
     'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
     'Long-wheelbase executive luxury sedan with opulent legroom and Harman Kardon sound.',
     '["BMW Curved Display","Panoramic Glass Roof","Harman Kardon Surround","Parking Assistant","Wireless Apple CarPlay"]',
     'Available', 15.30, 1998, '2024-03-01 10:00:00', '2024-03-01 10:00:00'),

-- 17. Mercedes-Benz C-Class
(17, 'VKT-MBC-017',
     'Mercedes-Benz C-Class 220d', 'C-Class', 'Mercedes-Benz', 2023,
     5, 10, 'Obsidian Black Metallic', 'Diesel', 'Automatic', 5,
     10500.00, 65000.00, 230000.00, 70000.00,
     'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80',
     'The Baby S-Class – unparalleled German engineering, 64-colour ambient lighting and MBUX.',
     '["11.9-inch MBUX Display","Burmester 3D Sound","64-Colour Ambient Lighting","Biometric Fingerprint Scanner","Active Brake Assist"]',
     'Available', 16.40, 1993, '2024-03-01 10:00:00', '2024-03-01 10:00:00'),

-- 18. Tata Nexon EV
(18, 'VKT-NEV-018',
     'Tata Nexon EV Max LR', 'Nexon EV Max', 'Tata Motors', 2024,
     6, 2, 'Intensi-Teal', 'Electric', 'Automatic', 5,
     1800.00, 11000.00, 39000.00, 8000.00,
     'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80',
     'India\'s best-selling electric car with 453 km ARAI range, multi-mode regen and fast charging.',
     '["453 km ARAI Range","Multi-Mode Regenerative Braking","Air Purifier with AQI","Ventilated Front Seats","Wireless Charger"]',
     'Reserved', 0.00, 0, '2024-03-10 10:00:00', '2024-03-10 10:00:00'),

-- 19. Mahindra Thar 4x4
(19, 'VKT-THR-019',
     'Mahindra Thar 4x4 LX Hard Top', 'Thar 4x4', 'Mahindra', 2023,
     2, 14, 'Napoli Black', 'Diesel', 'Manual', 4,
     3200.00, 19500.00, 68000.00, 18000.00,
     'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?auto=format&fit=crop&w=800&q=80',
     'The ultimate Indian holiday icon – authentic 4x4 trail rating, convertible/hard-top for Goa beaches and Manali mountains.',
     '["Mechanical Locking Differential","Shift-on-the-fly 4x4","Washable Interiors with Drain Plugs","Roll Cage","Touchscreen Infotainment"]',
     'Available', 15.20, 2184, '2024-03-15 10:00:00', '2024-03-15 10:00:00'),

-- 20. Mahindra Scorpio-N
(20, 'VKT-SCP-020',
     'Mahindra Scorpio-N Z8 L 4WD', 'Scorpio-N', 'Mahindra', 2023,
     2, 21, 'Dazzling Silver', 'Diesel', 'Automatic', 7,
     3000.00, 18500.00, 65000.00, 15000.00,
     'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
     'Big Daddy of SUVs – commanding height, 4XPLOR terrain modes, and effortless highway cruising across Rajasthan.',
     '["4XPLOR Intelligent Terrain Response","Sony 12-Speaker Sound","Sunroof","Wireless Android Auto/CarPlay","Dual-Zone Climate Control"]',
     'Available', 14.50, 2198, '2024-03-15 10:00:00', '2024-03-15 10:00:00'),

-- 21. Maruti Suzuki Dzire
(21, 'VKT-DZR-021',
     'Maruti Suzuki Dzire VXi', 'Dzire', 'Maruti Suzuki', 2023,
     1, 10, 'Sherwood Brown', 'Petrol', 'Manual', 5,
     1350.00, 8100.00, 28000.00, 5000.00,
     'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
     'India\'s most loved compact sedan – unbeatable fuel efficiency of 24+ km/l and smooth ride comfort.',
     '["Smart Hybrid Technology","Rear AC Vents","Push Button Start","Electrically Foldable ORVMs","Dual Airbags"]',
     'Available', 24.12, 1197, '2024-03-20 10:00:00', '2024-03-20 10:00:00'),

-- 22. Tata Punch
(22, 'VKT-PUN-022',
     'Tata Punch Creative AMT', 'Punch', 'Tata Motors', 2023,
     2, 23, 'Atomic Orange', 'Petrol', 'Automatic', 5,
     1250.00, 7500.00, 26000.00, 5000.00,
     'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',
     '5-Star Global NCAP safety rated micro-SUV with 187 mm ground clearance and automatic convenience.',
     '["5-Star Safety Rating","Traction Pro Mode","Cooled Glovebox","Cruise Control","Auto Headlamps"]',
     'Available', 18.80, 1199, '2024-03-20 10:00:00', '2024-03-20 10:00:00'),

-- 23. Royal Enfield Hunter 350
(23, 'VKT-HUN-023',
     'Royal Enfield Hunter 350 Dapper', 'Hunter 350', 'Royal Enfield', 2023,
     3, 20, 'Dapper Ash', 'Petrol', 'Manual', 2,
     700.00, 4200.00, 15000.00, 3000.00,
     'https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?auto=format&fit=crop&w=800&q=80',
     'Agile roadster motorcycle tuned for zippy Kerala backwaters and coastal city exploring.',
     '["J-Series 350cc Engine","Dual-Channel ABS","Cast Alloy Wheels with Tubeless Tyres","Digi-Analog Instrument Cluster"]',
     'Available', 36.20, 349, '2024-03-25 10:00:00', '2024-03-25 10:00:00'),

-- 24. Toyota Urban Cruiser Hyryder
(24, 'VKT-HYR-024',
     'Toyota Urban Cruiser Hyryder Hybrid', 'Hyryder Hybrid', 'Toyota', 2023,
     2, 24, 'Cafe White Dual Tone', 'Hybrid', 'Automatic', 5,
     2100.00, 12600.00, 45000.00, 10000.00,
     'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80',
     'Strong hybrid SUV with silent EV mode driving and astonishing 27.97 km/l mileage for Himachal hills.',
     '["Strong Self-Charging Hybrid","EV Drive Mode","Panoramic Sunroof","Heads-Up Display (HUD)","Wireless Charging"]',
     'Available', 27.97, 1490, '2024-03-25 10:00:00', '2024-03-25 10:00:00');

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
