/**
 * Vektor Rentals - Database Seeder Script
 * Executes schema.sql and seed.sql with full Pan-India fleet & branches.
 */

const fs = require('fs');
const path = require('path');
const mysql = require(path.join(__dirname, '../backend/node_modules/mysql2/promise'));
const dotenv = require(path.join(__dirname, '../backend/node_modules/dotenv'));
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function seed() {
  console.log('\n--- Seeding Vektor Rentals Database ---');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    multipleStatements: true,
  });

  try {
    let schemaSql = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf-8');
    let seedSql = fs.readFileSync(path.join(__dirname, '../database/seed.sql'), 'utf-8');

    // Strip DELIMITER statements and trigger bodies from bulk execution
    schemaSql = schemaSql.replace(/DELIMITER\s+\$\$/g, '').replace(/DELIMITER\s+;/g, '');
    schemaSql = schemaSql.replace(/CREATE TRIGGER[\s\S]*?END\$\$/g, '');

    seedSql = seedSql.replace(/DELIMITER\s+\$\$/g, '').replace(/DELIMITER\s+;/g, '');
    seedSql = seedSql.replace(/CREATE TRIGGER[\s\S]*?END\$\$/g, '');

    console.log('1. Recreating database and tables from schema.sql...');
    await connection.query(schemaSql);
    console.log('   ✓ Schema created.');

    console.log('2. Inserting seed data (24 Indian Vehicles, 24 Pan-India Hubs)...');
    await connection.query(seedSql);
    console.log('   ✓ Seed data inserted.');

    console.log('3. Installing real-time booking overlap triggers...');
    await connection.query('USE vektor_rentals');
    await connection.query('DROP TRIGGER IF EXISTS before_booking_insert');
    await connection.query('DROP TRIGGER IF EXISTS before_booking_update');

    await connection.query(`
      CREATE TRIGGER before_booking_insert
      BEFORE INSERT ON bookings
      FOR EACH ROW
      BEGIN
          DECLARE conflict_count INT DEFAULT 0;
          SELECT COUNT(*) INTO conflict_count
          FROM bookings
          WHERE vehicle_id = NEW.vehicle_id
            AND status NOT IN ('Cancelled')
            AND (NEW.pickup_datetime < return_datetime AND NEW.return_datetime > pickup_datetime);
          IF conflict_count > 0 THEN
              SIGNAL SQLSTATE '45000'
                  SET MESSAGE_TEXT = 'Booking conflict: vehicle already booked for the requested time range.';
          END IF;
      END
    `);

    await connection.query(`
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
                AND (NEW.pickup_datetime < return_datetime AND NEW.return_datetime > pickup_datetime);
              IF conflict_count > 0 THEN
                  SIGNAL SQLSTATE '45000'
                      SET MESSAGE_TEXT = 'Booking update conflict: vehicle already booked for the requested time range.';
              END IF;
          END IF;
      END
    `);
    console.log('   ✓ Triggers active.');

    const [vCount] = await connection.query('SELECT COUNT(*) as count FROM vehicles');
    const [bCount] = await connection.query('SELECT COUNT(*) as count FROM branches');
    const [cCount] = await connection.query('SELECT COUNT(*) as count FROM customers');
    const [bkCount] = await connection.query('SELECT COUNT(*) as count FROM bookings');

    console.log(`\n======================================================`);
    console.log(`🎉 DATABASE SEED SUCCESSFUL!`);
    console.log(`   ✓ Vehicles:  ${vCount[0].count} authentic Indian rental vehicles`);
    console.log(`   ✓ Hubs:      ${bCount[0].count} branches across all major Indian states`);
    console.log(`   ✓ Customers: ${cCount[0].count} customers`);
    console.log(`   ✓ Bookings:  ${bkCount[0].count} bookings`);
    console.log(`======================================================\n`);
  } catch (err) {
    console.error('❌ Database seeding error:', err);
  } finally {
    await connection.end();
  }
}

seed();
