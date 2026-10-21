const fs = require('fs');
const path = require('path');

// Indian city coordinates, state standardizations, and pincodes
const CITY_GEO = {
  'Agra': { lat: 27.1767, lng: 78.0081, state: 'Uttar Pradesh', pincode: '282001' },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714, state: 'Gujarat', pincode: '380001' },
  'Amritsar': { lat: 31.6340, lng: 74.8723, state: 'Punjab', pincode: '143001' },
  'Ayodhya': { lat: 26.7922, lng: 82.1998, state: 'Uttar Pradesh', pincode: '224123' },
  'Belagavi': { lat: 15.8497, lng: 74.4977, state: 'Karnataka', pincode: '590001' },
  'Bengaluru': { lat: 12.9716, lng: 77.5946, state: 'Karnataka', pincode: '560001' },
  'Bengaluru Airport': { lat: 13.1986, lng: 77.7066, state: 'Karnataka', pincode: '560300' },
  'Bhavnagar': { lat: 21.7645, lng: 72.1519, state: 'Gujarat', pincode: '364001' },
  'Bhopal': { lat: 23.2599, lng: 77.4126, state: 'Madhya Pradesh', pincode: '462001' },
  'Bhubaneswar': { lat: 20.2961, lng: 85.8245, state: 'Odisha', pincode: '751001' },
  'Calicut': { lat: 11.2588, lng: 75.7804, state: 'Kerala', pincode: '673001' },
  'Chandigarh': { lat: 30.7333, lng: 76.7794, state: 'Chandigarh', pincode: '160017' },
  'Chennai': { lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu', pincode: '600001' },
  'Chikmagalur': { lat: 13.3153, lng: 75.7754, state: 'Karnataka', pincode: '577101' },
  'Cochin': { lat: 9.9312, lng: 76.2673, state: 'Kerala', pincode: '682001' },
  'Coimbatore': { lat: 11.0168, lng: 76.9558, state: 'Tamil Nadu', pincode: '641001' },
  'Coorg': { lat: 12.3375, lng: 75.8069, state: 'Karnataka', pincode: '571201' },
  'Dehradun': { lat: 30.3165, lng: 78.0322, state: 'Uttarakhand', pincode: '248001' },
  'Delhi': { lat: 28.6139, lng: 77.2090, state: 'Delhi NCR', pincode: '110001' },
  'Delhi NCR': { lat: 28.6139, lng: 77.2090, state: 'Delhi NCR', pincode: '110001' },
  'Faridabad': { lat: 28.4089, lng: 77.3178, state: 'Haryana', pincode: '121001' },
  'Gandhinagar': { lat: 23.2156, lng: 72.6369, state: 'Gujarat', pincode: '382010' },
  'Goa': { lat: 15.2993, lng: 74.1240, state: 'Goa', pincode: '403001' },
  'Guntur': { lat: 16.3067, lng: 80.4365, state: 'Andhra Pradesh', pincode: '522002' },
  'Gurugram': { lat: 28.4595, lng: 77.0266, state: 'Haryana', pincode: '122001' },
  'Guwahati': { lat: 26.1445, lng: 91.7362, state: 'Assam', pincode: '781001' },
  'Hampi': { lat: 15.3350, lng: 76.4600, state: 'Karnataka', pincode: '583239' },
  'Hubli-Dharwad': { lat: 15.3647, lng: 75.1240, state: 'Karnataka', pincode: '580020' },
  'Hyderabad': { lat: 17.3850, lng: 78.4867, state: 'Telangana', pincode: '500001' },
  'Indore': { lat: 22.7196, lng: 75.8577, state: 'Madhya Pradesh', pincode: '452001' },
  'Jaipur': { lat: 26.9124, lng: 75.7873, state: 'Rajasthan', pincode: '302001' },
  'Jaisalmer': { lat: 26.9157, lng: 70.9083, state: 'Rajasthan', pincode: '345001' },
  'Jodhpur': { lat: 26.2389, lng: 73.0243, state: 'Rajasthan', pincode: '342001' },
  'Kannur': { lat: 11.8745, lng: 75.3704, state: 'Kerala', pincode: '670001' },
  'Kochi': { lat: 9.9312, lng: 76.2673, state: 'Kerala', pincode: '682001' },
  'Kolkata': { lat: 22.5726, lng: 88.3639, state: 'West Bengal', pincode: '700001' },
  'Kozhikode': { lat: 11.2588, lng: 75.7804, state: 'Kerala', pincode: '673001' },
  'Kozhikode (Calicut)': { lat: 11.2588, lng: 75.7804, state: 'Kerala', pincode: '673001' },
  'Leh Ladakh': { lat: 34.1526, lng: 77.5771, state: 'Ladakh', pincode: '194101' },
  'Lucknow': { lat: 26.8467, lng: 80.9462, state: 'Uttar Pradesh', pincode: '226001' },
  'Manali': { lat: 32.2432, lng: 77.1892, state: 'Himachal Pradesh', pincode: '175131' },
  'Mangalore': { lat: 12.9141, lng: 74.8560, state: 'Karnataka', pincode: '575001' },
  'Mumbai': { lat: 19.0760, lng: 72.8777, state: 'Maharashtra', pincode: '400001' },
  'Mysuru': { lat: 12.2958, lng: 76.6394, state: 'Karnataka', pincode: '570001' },
  'Nagpur': { lat: 21.1458, lng: 79.0882, state: 'Maharashtra', pincode: '440001' },
  'Nashik': { lat: 19.9975, lng: 73.7898, state: 'Maharashtra', pincode: '422001' },
  'Noida': { lat: 28.5355, lng: 77.3910, state: 'Uttar Pradesh', pincode: '201301' },
  'Palakkad': { lat: 10.7867, lng: 76.6548, state: 'Kerala', pincode: '678001' },
  'Puducherry': { lat: 11.9416, lng: 79.8083, state: 'Puducherry', pincode: '605001' },
  'Pune': { lat: 18.5204, lng: 73.8567, state: 'Maharashtra', pincode: '411001' },
  'Puri': { lat: 19.8135, lng: 85.8312, state: 'Odisha', pincode: '752001' },
  'Raipur': { lat: 21.2514, lng: 81.6296, state: 'Chhattisgarh', pincode: '492001' },
  'Rajkot': { lat: 22.3039, lng: 70.8022, state: 'Gujarat', pincode: '360001' },
  'Ranchi': { lat: 23.3441, lng: 85.3096, state: 'Jharkhand', pincode: '834001' },
  'Siliguri': { lat: 26.7271, lng: 88.3953, state: 'West Bengal', pincode: '734001' },
  'Srinagar': { lat: 34.0837, lng: 74.7973, state: 'Jammu and Kashmir', pincode: '190001' },
  'Surat': { lat: 21.1702, lng: 72.8311, state: 'Gujarat', pincode: '395001' },
  'Thiruvananthapuram': { lat: 8.5241, lng: 76.9366, state: 'Kerala', pincode: '695001' },
  'Thrissur': { lat: 10.5276, lng: 76.2144, state: 'Kerala', pincode: '680001' },
  'Tirupati': { lat: 13.6288, lng: 79.4192, state: 'Andhra Pradesh', pincode: '517501' },
  'Udaipur': { lat: 24.5854, lng: 73.7125, state: 'Rajasthan', pincode: '313001' },
  'Udupi-Manipal': { lat: 13.3409, lng: 74.7421, state: 'Karnataka', pincode: '576104' },
  'Ujjain': { lat: 23.1765, lng: 75.7885, state: 'Madhya Pradesh', pincode: '456001' },
  'Vadodara': { lat: 22.3072, lng: 73.1812, state: 'Gujarat', pincode: '390001' },
  'Varanasi': { lat: 25.3176, lng: 82.9739, state: 'Uttar Pradesh', pincode: '221001' },
  'Varkala': { lat: 8.7379, lng: 76.7163, state: 'Kerala', pincode: '695141' },
  'Vijayawada': { lat: 16.5062, lng: 80.6480, state: 'Andhra Pradesh', pincode: '520001' },
  'Visakhapatnam': { lat: 17.6868, lng: 83.2185, state: 'Andhra Pradesh', pincode: '530001' },
  'Wayanad': { lat: 11.6854, lng: 76.1320, state: 'Kerala', pincode: '673121' }
};

// Calculate Haversine distance in km
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Multiply by road curvature factor ~1.22
  return Math.round(R * c * 1.22);
}

console.log('City Geo Table ready with', Object.keys(CITY_GEO).length, 'cities.');
const d = haversineDistance(CITY_GEO['Bengaluru'].lat, CITY_GEO['Bengaluru'].lng, CITY_GEO['Chennai'].lat, CITY_GEO['Chennai'].lng);
console.log('Test distance Bengaluru -> Chennai:', d, 'km (actual road ~345 km)');
