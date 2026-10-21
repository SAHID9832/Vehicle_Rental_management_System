const fs = require('fs');
const path = require('path');

const csvPath = 'C:\\Users\\sahid\\Downloads\\all_india_vehicle_rental_network_combined.csv';
if (!fs.existsSync(csvPath)) {
  console.error('File not found at:', csvPath);
  process.exit(1);
}

const content = fs.readFileSync(csvPath, 'utf-8');
const lines = content.split(/\r?\n/).filter(Boolean);
console.log('Total rows:', lines.length);

function parseCSVLine(text) {
  let p = '', inQuotes = false, row = [];
  for (let i = 0; i < text.length; i++) {
    let c = text[i];
    if (c === '"') {
      if (inQuotes && text[i+1] === '"') { p += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (c === ',' && !inQuotes) {
      row.push(p.trim()); p = '';
    } else {
      p += c;
    }
  }
  row.push(p.trim());
  return row;
}

const header = parseCSVLine(lines[0]);
console.log('Headers:', header);

const records = [];
for (let i = 1; i < lines.length; i++) {
  const row = parseCSVLine(lines[i]);
  if (row[0] === 'NETWORK_DIRECTORY') {
    records.push({
      id: row[1],
      name: row[2],
      type: row[3],
      city: row[4],
      state: row[5],
      phone: row[6],
      alt_phone: row[7],
      email: row[8],
      manager: row[9],
      address: row[10],
      vehicles: row[11],
      website: row[12]
    });
  }
}

console.log('NETWORK_DIRECTORY count:', records.length);
const states = [...new Set(records.map(r => r.state).filter(Boolean))].sort();
console.log(`Unique states (${states.length}):`, states);
const cities = [...new Set(records.map(r => r.city).filter(Boolean))].sort();
console.log(`Unique cities (${cities.length}):`, cities);

const byCity = {};
records.forEach(r => {
  if (!byCity[r.city]) byCity[r.city] = [];
  byCity[r.city].push(r);
});

console.log('Total distinct cities:', Object.keys(byCity).length);
Object.keys(byCity).sort().forEach(c => {
  console.log(`- ${c} (${byCity[c][0].state}): ${byCity[c].length} branch entries. Brands: ${[...new Set(byCity[c].map(x => x.brand))].join(', ')}`);
});

