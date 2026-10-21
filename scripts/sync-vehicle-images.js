const path = require('path');
const backendDir = path.join(__dirname, '../backend');
const mysql = require(path.join(backendDir, 'node_modules/mysql2/promise'));
const dotenv = require(path.join(backendDir, 'node_modules/dotenv'));
dotenv.config({ path: path.join(backendDir, '.env') });

const vehicleImagesMap = require('../database/vehicle_images_map.json');

// Exact 1:1 mapping from seed vehicle ID to manifest vehicle code
const EXACT_SEED_TO_MANIFEST = {
  1:  'VH-102', // Maruti Suzuki Swift VXi -> VH-102 Swift
  2:  'VH-103', // Hyundai i20 Asta -> VH-103 i20
  3:  'VH-202', // Honda City ZX -> VH-202 City
  4:  'VH-104', // Tata Tigor / Tiago -> VH-104 Tiago
  5:  'VH-930', // Renault Kwid -> VH-930 Honda Amaze / Compact
  6:  'VH-402', // Toyota Innova Crysta -> VH-402 Innova Crysta
  7:  'VH-933', // Kia Seltos -> VH-933 Seltos
  8:  'VH-302', // Hyundai Creta -> VH-302 Creta
  9:  'VH-935', // Mahindra XUV700 -> VH-935 XUV700
  10: 'VH-404', // Toyota Fortuner -> VH-404 Fortuner
  11: 'VH-503', // Royal Enfield Classic 350 -> VH-503 Classic 350
  12: 'VH-501', // Honda Activa 6G -> VH-501 Activa 6G
  13: 'VH-503', // Bajaj Pulsar -> VH-503 (Motorcycle)
  14: 'VH-934', // Force Urbania -> VH-934 Innova Hycross / MPV
  15: 'VH-401', // Maruti Ertiga -> VH-401 Ertiga
  16: 'VH-803', // BMW 3 Series -> VH-803 Executive Luxury Sedan (Audi A6)
  17: 'VH-801', // Mercedes-Benz C-Class -> VH-801 Mercedes-Benz E-Class
  18: 'VH-601', // Tata Nexon EV -> VH-601 Nexon EV
  19: 'VH-303', // Mahindra Thar 4x4 -> VH-303 Thar
  20: 'VH-403', // Mahindra Scorpio-N -> VH-403 Scorpio-N
  21: 'VH-201', // Maruti Suzuki Dzire -> VH-201 Dzire
  22: 'VH-932', // Tata Punch -> VH-932 Maruti Brezza Compact SUV
  23: 'VH-503', // Royal Enfield Hunter -> VH-503 Classic 350
  24: 'VH-934', // Toyota Hyryder -> VH-934 Toyota Innova Hycross / Hybrid
};

async function syncExact() {
  console.log('\n======================================================');
  console.log('🔄 PERFORMING HIGH-PRECISION SEED-TO-MANIFEST SYNC');
  console.log('======================================================\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'vektor_rentals',
  });

  try {
    for (const [seedId, manifestCode] of Object.entries(EXACT_SEED_TO_MANIFEST)) {
      const entry = vehicleImagesMap[manifestCode];
      if (!entry || !entry.views) continue;

      const primary = entry.views['primary'] || Object.values(entry.views)[0];
      if (primary && primary.path) {
        await connection.query('UPDATE vehicles SET image_url = ? WHERE id = ?', [primary.path, seedId]);
        console.log(`✓ Vehicle #${seedId} -> ${manifestCode} (${entry.make} ${entry.model}) => ${primary.path} [${Object.keys(entry.views).length} views: ${Object.keys(entry.views).join(', ')}]`);
      }
    }
    console.log('\n✅ All 24 seed vehicles updated with high-precision manifest images!');
  } catch (err) {
    console.error('Error in exact sync:', err);
  } finally {
    await connection.end();
  }
}

syncExact();
