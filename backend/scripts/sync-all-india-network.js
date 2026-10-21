const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const pool = require('../src/config/database');

const CITY_GEO = {
  'Agra': { lat: 27.1767, lng: 78.0081, state: 'Uttar Pradesh', pincode: '282001', manager: 'Anand Verma' },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714, state: 'Gujarat', pincode: '380001', manager: 'Bhavin Patel' },
  'Amritsar': { lat: 31.6340, lng: 74.8723, state: 'Punjab', pincode: '143001', manager: 'Harpreet Singh' },
  'Ayodhya': { lat: 26.7922, lng: 82.1998, state: 'Uttar Pradesh', pincode: '224123', manager: 'Raghvendra Pandey' },
  'Belagavi': { lat: 15.8497, lng: 74.4977, state: 'Karnataka', pincode: '590001', manager: 'Vinayak Kulkarni' },
  'Bengaluru': { lat: 12.9716, lng: 77.5946, state: 'Karnataka', pincode: '560001', manager: 'Rajesh Gowda' },
  'Bengaluru Airport': { lat: 13.1986, lng: 77.7066, state: 'Karnataka', pincode: '560300', manager: 'Suresh Kumar' },
  'Bhavnagar': { lat: 21.7645, lng: 72.1519, state: 'Gujarat', pincode: '364001', manager: 'Ketan Trivedi' },
  'Bhopal': { lat: 23.2599, lng: 77.4126, state: 'Madhya Pradesh', pincode: '462001', manager: 'Vivek Sharma' },
  'Bhubaneswar': { lat: 20.2961, lng: 85.8245, state: 'Odisha', pincode: '751001', manager: 'Debashish Mohapatra' },
  'Calicut': { lat: 11.2588, lng: 75.7804, state: 'Kerala', pincode: '673001', manager: 'Faisal Rahman' },
  'Chandigarh': { lat: 30.7333, lng: 76.7794, state: 'Chandigarh', pincode: '160017', manager: 'Gurpreet Gill' },
  'Chennai': { lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu', pincode: '600001', manager: 'Karthik Raman' },
  'Chikmagalur': { lat: 13.3153, lng: 75.7754, state: 'Karnataka', pincode: '577101', manager: 'Deepak Hegde' },
  'Cochin': { lat: 9.9312, lng: 76.2673, state: 'Kerala', pincode: '682001', manager: 'Antony Joseph' },
  'Coimbatore': { lat: 11.0168, lng: 76.9558, state: 'Tamil Nadu', pincode: '641001', manager: 'Venkatesh S' },
  'Coorg': { lat: 12.3375, lng: 75.8069, state: 'Karnataka', pincode: '571201', manager: 'Bopanna C' },
  'Dehradun': { lat: 30.3165, lng: 78.0322, state: 'Uttarakhand', pincode: '248001', manager: 'Rohit Rawat' },
  'Delhi': { lat: 28.6139, lng: 77.2090, state: 'Delhi NCR', pincode: '110001', manager: 'Manish Malhotra' },
  'Delhi NCR': { lat: 28.6139, lng: 77.2090, state: 'Delhi NCR', pincode: '110001', manager: 'Pooja Aggarwal' },
  'Faridabad': { lat: 28.4089, lng: 77.3178, state: 'Haryana', pincode: '121001', manager: 'Sunil Tanwar' },
  'Gandhinagar': { lat: 23.2156, lng: 72.6369, state: 'Gujarat', pincode: '382010', manager: 'Jignesh Dave' },
  'Goa': { lat: 15.2993, lng: 74.1240, state: 'Goa', pincode: '403001', manager: 'Ryan Fernandes' },
  'Guntur': { lat: 16.3067, lng: 80.4365, state: 'Andhra Pradesh', pincode: '522002', manager: 'Srinivasa Rao' },
  'Gurugram': { lat: 28.4595, lng: 77.0266, state: 'Haryana', pincode: '122001', manager: 'Amit Chaudhary' },
  'Guwahati': { lat: 26.1445, lng: 91.7362, state: 'Assam', pincode: '781001', manager: 'Pranab Das' },
  'Hampi': { lat: 15.3350, lng: 76.4600, state: 'Karnataka', pincode: '583239', manager: 'Basavaraj B' },
  'Hubli-Dharwad': { lat: 15.3647, lng: 75.1240, state: 'Karnataka', pincode: '580020', manager: 'Chetan Patil' },
  'Hyderabad': { lat: 17.3850, lng: 78.4867, state: 'Telangana', pincode: '500001', manager: 'Vikram Reddy' },
  'Indore': { lat: 22.7196, lng: 75.8577, state: 'Madhya Pradesh', pincode: '452001', manager: 'Gaurav Agrawal' },
  'Jaipur': { lat: 26.9124, lng: 75.7873, state: 'Rajasthan', pincode: '302001', manager: 'Digvijay Rathore' },
  'Jaisalmer': { lat: 26.9157, lng: 70.9083, state: 'Rajasthan', pincode: '345001', manager: 'Mahipal Singh' },
  'Jodhpur': { lat: 26.2389, lng: 73.0243, state: 'Rajasthan', pincode: '342001', manager: 'Surya Pratap' },
  'Kannur': { lat: 11.8745, lng: 75.3704, state: 'Kerala', pincode: '670001', manager: 'Muhammed Shafi' },
  'Kochi': { lat: 9.9312, lng: 76.2673, state: 'Kerala', pincode: '682001', manager: 'George Mathew' },
  'Kolkata': { lat: 22.5726, lng: 88.3639, state: 'West Bengal', pincode: '700001', manager: 'Subrata Banerjee' },
  'Kozhikode': { lat: 11.2588, lng: 75.7804, state: 'Kerala', pincode: '673001', manager: 'Abdul Niyas' },
  'Kozhikode (Calicut)': { lat: 11.2588, lng: 75.7804, state: 'Kerala', pincode: '673001', manager: 'Abdul Niyas' },
  'Leh Ladakh': { lat: 34.1526, lng: 77.5771, state: 'Ladakh', pincode: '194101', manager: 'Stanzin Dorje' },
  'Lucknow': { lat: 26.8467, lng: 80.9462, state: 'Uttar Pradesh', pincode: '226001', manager: 'Abhinav Shukla' },
  'Manali': { lat: 32.2432, lng: 77.1892, state: 'Himachal Pradesh', pincode: '175131', manager: 'Tenzin Sharma' },
  'Mangalore': { lat: 12.9141, lng: 74.8560, state: 'Karnataka', pincode: '575001', manager: 'Prashanth Shenoy' },
  'Mumbai': { lat: 19.0760, lng: 72.8777, state: 'Maharashtra', pincode: '400001', manager: 'Sachin Sawant' },
  'Mysuru': { lat: 12.2958, lng: 76.6394, state: 'Karnataka', pincode: '570001', manager: 'Chandrashekar M' },
  'Nagpur': { lat: 21.1458, lng: 79.0882, state: 'Maharashtra', pincode: '440001', manager: 'Nikhil Deshmukh' },
  'Nashik': { lat: 19.9975, lng: 73.7898, state: 'Maharashtra', pincode: '422001', manager: 'Pravin Joshi' },
  'Noida': { lat: 28.5355, lng: 77.3910, state: 'Uttar Pradesh', pincode: '201301', manager: 'Ritu Saxena' },
  'Palakkad': { lat: 10.7867, lng: 76.6548, state: 'Kerala', pincode: '678001', manager: 'Haridasan K' },
  'Puducherry': { lat: 11.9416, lng: 79.8083, state: 'Puducherry', pincode: '605001', manager: 'Murugan Pillai' },
  'Pune': { lat: 18.5204, lng: 73.8567, state: 'Maharashtra', pincode: '411001', manager: 'Amol Shinde' },
  'Puri': { lat: 19.8135, lng: 85.8312, state: 'Odisha', pincode: '752001', manager: 'Ranjan Jena' },
  'Raipur': { lat: 21.2514, lng: 81.6296, state: 'Chhattisgarh', pincode: '492001', manager: 'Alok Tiwari' },
  'Rajkot': { lat: 22.3039, lng: 70.8022, state: 'Gujarat', pincode: '360001', manager: 'Bhavesh Jadeja' },
  'Ranchi': { lat: 23.3441, lng: 85.3096, state: 'Jharkhand', pincode: '834001', manager: 'Pankaj Kumar' },
  'Siliguri': { lat: 26.7271, lng: 88.3953, state: 'West Bengal', pincode: '734001', manager: 'Debanjan Roy' },
  'Srinagar': { lat: 34.0837, lng: 74.7973, state: 'Jammu and Kashmir', pincode: '190001', manager: 'Tariq Mir' },
  'Surat': { lat: 21.1702, lng: 72.8311, state: 'Gujarat', pincode: '395001', manager: 'Hiren Shah' },
  'Thiruvananthapuram': { lat: 8.5241, lng: 76.9366, state: 'Kerala', pincode: '695001', manager: 'Ajith Nair' },
  'Thrissur': { lat: 10.5276, lng: 76.2144, state: 'Kerala', pincode: '680001', manager: 'Biju Varghese' },
  'Tirupati': { lat: 13.6288, lng: 79.4192, state: 'Andhra Pradesh', pincode: '517501', manager: 'Venkateshwarlu N' },
  'Udaipur': { lat: 24.5854, lng: 73.7125, state: 'Rajasthan', pincode: '313001', manager: 'Mahendra Sisodia' },
  'Udupi-Manipal': { lat: 13.3409, lng: 74.7421, state: 'Karnataka', pincode: '576104', manager: 'Raghavendra Bhat' },
  'Ujjain': { lat: 23.1765, lng: 75.7885, state: 'Madhya Pradesh', pincode: '456001', manager: 'Mukesh Vyas' },
  'Vadodara': { lat: 22.3072, lng: 73.1812, state: 'Gujarat', pincode: '390001', manager: 'Dharmesh Solanki' },
  'Varanasi': { lat: 25.3176, lng: 82.9739, state: 'Uttar Pradesh', pincode: '221001', manager: 'Santosh Tripathi' },
  'Varkala': { lat: 8.7379, lng: 76.7163, state: 'Kerala', pincode: '695141', manager: 'Sujith Pillai' },
  'Vijayawada': { lat: 16.5062, lng: 80.6480, state: 'Andhra Pradesh', pincode: '520001', manager: 'Kalyan Chakravarthy' },
  'Visakhapatnam': { lat: 17.6868, lng: 83.2185, state: 'Andhra Pradesh', pincode: '530001', manager: 'Satyanarayana Murthy' },
  'Wayanad': { lat: 11.6854, lng: 76.1320, state: 'Kerala', pincode: '673121', manager: 'Jamsheer K' }
};

// Calculate Haversine distance in km
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(15, Math.round(R * c * 1.24));
}

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

// Inter-hub highway transit connections across India
const INTER_HUB_CORRIDORS = [
  // South Corridor
  ['Bengaluru', 'Mysuru', 145, 150],
  ['Bengaluru', 'Mangalore', 350, 420],
  ['Bengaluru', 'Chennai', 345, 360],
  ['Bengaluru', 'Coimbatore', 360, 390],
  ['Bengaluru', 'Hyderabad', 570, 540],
  ['Bengaluru', 'Chikmagalur', 245, 280],
  ['Bengaluru', 'Coorg', 250, 300],
  ['Bengaluru', 'Hampi', 340, 380],
  ['Hubli-Dharwad', 'Belagavi', 75, 90],
  ['Hubli-Dharwad', 'Hampi', 160, 190],
  ['Hubli-Dharwad', 'Goa', 170, 210],
  ['Mangalore', 'Udupi-Manipal', 55, 65],
  ['Mangalore', 'Goa', 365, 420],
  ['Mangalore', 'Kannur', 145, 180],
  ['Chennai', 'Tirupati', 135, 180],
  ['Chennai', 'Puducherry', 150, 180],
  ['Chennai', 'Coimbatore', 500, 480],
  ['Coimbatore', 'Palakkad', 50, 60],
  ['Palakkad', 'Thrissur', 65, 75],
  ['Thrissur', 'Kochi', 80, 90],
  ['Kochi', 'Thiruvananthapuram', 200, 270],
  ['Thiruvananthapuram', 'Varkala', 45, 55],
  ['Kochi', 'Kozhikode', 180, 240],
  ['Kozhikode', 'Wayanad', 85, 120],
  ['Kozhikode', 'Kannur', 90, 120],
  ['Hyderabad', 'Vijayawada', 275, 300],
  ['Vijayawada', 'Guntur', 35, 45],
  ['Vijayawada', 'Visakhapatnam', 350, 360],
  ['Hyderabad', 'Tirupati', 550, 540],

  // West Corridor
  ['Mumbai', 'Pune', 150, 180],
  ['Mumbai', 'Nashik', 165, 210],
  ['Mumbai', 'Surat', 280, 300],
  ['Surat', 'Vadodara', 150, 160],
  ['Vadodara', 'Ahmedabad', 110, 120],
  ['Ahmedabad', 'Gandhinagar', 25, 30],
  ['Ahmedabad', 'Rajkot', 215, 240],
  ['Rajkot', 'Bhavnagar', 175, 200],
  ['Pune', 'Goa', 450, 480],
  ['Pune', 'Nagpur', 710, 660],
  ['Nashik', 'Indore', 415, 420],

  // North Corridor
  ['Delhi NCR', 'Gurugram', 35, 45],
  ['Delhi NCR', 'Noida', 25, 35],
  ['Delhi NCR', 'Faridabad', 30, 40],
  ['Delhi NCR', 'Agra', 210, 180],
  ['Delhi NCR', 'Jaipur', 280, 270],
  ['Delhi NCR', 'Chandigarh', 245, 240],
  ['Delhi NCR', 'Dehradun', 250, 300],
  ['Chandigarh', 'Amritsar', 230, 240],
  ['Chandigarh', 'Manali', 270, 420],
  ['Manali', 'Leh Ladakh', 425, 660],
  ['Amritsar', 'Srinagar', 430, 600],
  ['Jaipur', 'Udaipur', 390, 390],
  ['Jaipur', 'Jodhpur', 330, 330],
  ['Jodhpur', 'Jaisalmer', 285, 290],
  ['Udaipur', 'Ahmedabad', 260, 270],
  ['Agra', 'Lucknow', 335, 270],
  ['Lucknow', 'Ayodhya', 135, 150],
  ['Lucknow', 'Varanasi', 310, 330],

  // Central, East & Arteries
  ['Agra', 'Bhopal', 590, 540],
  ['Bhopal', 'Indore', 195, 210],
  ['Indore', 'Ujjain', 55, 65],
  ['Nagpur', 'Raipur', 285, 330],
  ['Raipur', 'Bhubaneswar', 550, 600],
  ['Bhubaneswar', 'Puri', 65, 75],
  ['Visakhapatnam', 'Bhubaneswar', 440, 450],
  ['Varanasi', 'Ranchi', 370, 420],
  ['Ranchi', 'Kolkata', 400, 450],
  ['Kolkata', 'Bhubaneswar', 440, 480],
  ['Kolkata', 'Siliguri', 570, 660],
  ['Siliguri', 'Guwahati', 440, 540],
  ['Mumbai', 'Hyderabad', 710, 720],
  ['Hyderabad', 'Nagpur', 500, 480],
  ['Delhi NCR', 'Lucknow', 530, 420]
];

async function syncAllIndiaNetwork() {
  console.log('--- STARTING ALL-INDIA VEHICLE RENTAL NETWORK SYNC ---');

  // 1. Clean existing ??? in branch names
  await pool.query("UPDATE branches SET name = REPLACE(name, '???', '-') WHERE name LIKE '%???%'");
  console.log('Cleaned branch names encoding.');

  // 2. Read CSV
  const csvFilePaths = [
    path.join(__dirname, '../../database/data/all_india_vehicle_rental_network_combined.csv'),
    'C:\\Users\\sahid\\Downloads\\all_india_vehicle_rental_network_combined.csv'
  ];
  let csvPath = csvFilePaths.find(p => fs.existsSync(p));
  if (!csvPath) {
    throw new Error('CSV file not found in local database/data or Downloads directory.');
  }
  console.log('Loading CSV from:', csvPath);
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split(/\r?\n/).filter(Boolean);

  const csvDirectory = [];
  for (let i = 1; i < lines.length; i++) {
    const r = parseCSVLine(lines[i]);
    if (r[0] === 'NETWORK_DIRECTORY') {
      csvDirectory.push({
        recId: r[1],
        brand: r[2],
        type: r[3],
        city: r[4],
        state: r[5],
        phone: r[6] || '+91 92500 35555',
        altPhone: r[7],
        email: r[8] || 'care@vektor-india.in',
        manager: r[9],
        address: r[10] || 'Official Rental Hub & Logistics Terminal',
        fleet: r[11],
        website: r[12]
      });
    }
  }
  console.log(`Parsed ${csvDirectory.length} network directory records.`);

  // 3. Load current branches from DB
  const [existingBranches] = await pool.query('SELECT * FROM branches');
  console.log(`Existing DB branches: ${existingBranches.length}`);

  const cityToBranchMap = new Map();
  existingBranches.forEach(b => {
    // Map existing city names
    if (!cityToBranchMap.has(b.city)) {
      cityToBranchMap.set(b.city, b);
    }
    // Also map specific names
    cityToBranchMap.set(b.name, b);
  });

  // Map aliases for existing branches
  if (cityToBranchMap.has('New Delhi')) {
    cityToBranchMap.set('Delhi', cityToBranchMap.get('New Delhi'));
    cityToBranchMap.set('Delhi NCR', cityToBranchMap.get('New Delhi'));
  }
  if (cityToBranchMap.has('Panaji')) {
    cityToBranchMap.set('Goa', cityToBranchMap.get('Panaji'));
  }

  // 4. Ingest new cities/hubs from CSV
  // Group CSV by standardized city
  const citiesFromCSV = [...new Set(csvDirectory.map(r => r.city).filter(Boolean))];
  let newlyAddedCount = 0;

  for (const rawCity of citiesFromCSV) {
    let cleanCity = rawCity;
    if (rawCity === 'Delhi' || rawCity === 'Delhi NCR') cleanCity = 'Delhi NCR';
    if (rawCity === 'Cochin') cleanCity = 'Kochi';
    if (rawCity === 'Calicut' || rawCity === 'Kozhikode (Calicut)') cleanCity = 'Kozhikode';
    if (rawCity === 'Bengaluru Airport') continue; // already part of Bengaluru hubs (ID 2)

    // Check if this city is already covered by a branch
    const existing = cityToBranchMap.get(cleanCity) || cityToBranchMap.get(rawCity);
    if (!existing) {
      const geo = CITY_GEO[cleanCity] || CITY_GEO[rawCity] || {
        lat: 20.5937,
        lng: 78.9629,
        state: 'India',
        pincode: '400001',
        manager: 'Regional Hub Lead'
      };
      const csvRecordsForCity = csvDirectory.filter(r => r.city === rawCity);
      const rep = csvRecordsForCity[0] || {};
      const brand = rep.brand || 'Vektor Network';
      const hubName = `${cleanCity} - ${brand} Express Hub`;

      let address = rep.address && rep.address.length > 5 && !rep.address.includes('Corporate address published in policy')
        ? rep.address
        : `${cleanCity} Central Hub, Highway Transit Corridor, ${geo.state} - ${geo.pincode}`;
      if (address.length > 250) {
        address = address.slice(0, 247) + '...';
      }
      const phone = (rep.phone ? rep.phone.split('/')[0].trim() : '+91 92500 35555').slice(0, 45);
      const email = `hub.${cleanCity.toLowerCase().replace(/[^a-z0-9]/g, '')}@vektor.in`;
      const managerName = (geo.manager || rep.manager || 'Regional Hub Manager').slice(0, 100);

      const [res] = await pool.query(
        `INSERT INTO branches
          (name, address, city, state, pincode, phone, email, manager_name, latitude, longitude, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
        [
          hubName,
          address,
          cleanCity,
          geo.state,
          geo.pincode,
          phone,
          email,
          managerName,
          geo.lat,
          geo.lng
        ]
      );

      const insertedBranch = {
        id: res.insertId,
        name: hubName,
        city: cleanCity,
        state: geo.state,
        latitude: geo.lat,
        longitude: geo.lng
      };
      cityToBranchMap.set(cleanCity, insertedBranch);
      cityToBranchMap.set(rawCity, insertedBranch);
      newlyAddedCount++;
    }
  }

  console.log(`Added ${newlyAddedCount} new Indian regional hubs into database.`);

  // Refresh branch list from DB
  const [allBranches] = await pool.query('SELECT id, name, city, state, latitude, longitude FROM branches WHERE is_active = 1');
  console.log(`Total active hubs across India: ${allBranches.length}`);

  // Rebuild city-to-ID lookup
  const cityHubIdMap = {};
  allBranches.forEach(b => {
    if (!cityHubIdMap[b.city]) {
      cityHubIdMap[b.city] = b.id;
    }
  });
  // Special mappings
  if (cityHubIdMap['Panaji'] && !cityHubIdMap['Goa']) cityHubIdMap['Goa'] = cityHubIdMap['Panaji'];
  if (cityHubIdMap['New Delhi'] && !cityHubIdMap['Delhi NCR']) cityHubIdMap['Delhi NCR'] = cityHubIdMap['New Delhi'];
  if (cityHubIdMap['New Delhi'] && !cityHubIdMap['Delhi']) cityHubIdMap['Delhi'] = cityHubIdMap['New Delhi'];
  if (cityHubIdMap['Kochi'] && !cityHubIdMap['Cochin']) cityHubIdMap['Cochin'] = cityHubIdMap['Kochi'];

  // 5. Populate All-India Highway Network Graph Edges (branch_connections)
  let edgesAdded = 0;
  for (const corridor of INTER_HUB_CORRIDORS) {
    const [cityA, cityB, dist, mins] = corridor;
    const idA = cityHubIdMap[cityA];
    const idB = cityHubIdMap[cityB];

    if (idA && idB && idA !== idB) {
      // Check if connection already exists
      const [existing] = await pool.query(
        'SELECT id FROM branch_connections WHERE (from_branch_id = ? AND to_branch_id = ?) OR (from_branch_id = ? AND to_branch_id = ?)',
        [idA, idB, idB, idA]
      );

      if (existing.length === 0) {
        // Insert A -> B
        await pool.query(
          'INSERT INTO branch_connections (from_branch_id, to_branch_id, distance_km, travel_time_mins, is_active) VALUES (?, ?, ?, ?, 1)',
          [idA, idB, dist, mins]
        );
        // Insert B -> A
        await pool.query(
          'INSERT INTO branch_connections (from_branch_id, to_branch_id, distance_km, travel_time_mins, is_active) VALUES (?, ?, ?, ?, 1)',
          [idB, idA, dist, mins]
        );
        edgesAdded += 2;
      }
    }
  }

  const [totalConnections] = await pool.query('SELECT COUNT(*) as cnt FROM branch_connections');
  console.log(`Added ${edgesAdded} new inter-hub highway edges.`);
  console.log(`Total graph edges in database: ${totalConnections[0].cnt}`);

  const [statesCount] = await pool.query('SELECT COUNT(DISTINCT state) as cnt FROM branches WHERE is_active = 1');
  console.log(`States/UTs covered across India: ${statesCount[0].cnt}`);

  return {
    success: true,
    totalHubs: allBranches.length,
    newHubsAdded: newlyAddedCount,
    totalEdges: totalConnections[0].cnt,
    statesCovered: statesCount[0].cnt
  };
}

if (require.main === module) {
  syncAllIndiaNetwork()
    .then(res => {
      console.log('SYNC COMPLETED SUCCESSFULLY:', res);
      process.exit(0);
    })
    .catch(err => {
      console.error('SYNC FAILED:', err);
      process.exit(1);
    });
}

module.exports = { syncAllIndiaNetwork };
