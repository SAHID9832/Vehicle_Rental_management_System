/**
 * Utility helpers for Vektor Rentals
 */

/**
 * Generate a unique booking reference like BK16981234565AB1
 * @returns {string}
 */
const generateBookingReference = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK${timestamp}${random}`;
};

/**
 * Generate a unique invoice number like INV16981234565AB1
 * @returns {string}
 */
const generateInvoiceNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV${timestamp}${random}`;
};

/**
 * Calculate the number of rental days between two dates (minimum 1)
 * @param {string|Date} pickupDate - Pickup datetime
 * @param {string|Date} returnDate - Return datetime
 * @returns {number}
 */
const calculateRentalDays = (pickupDate, returnDate) => {
  const pickup = new Date(pickupDate);
  const returnD = new Date(returnDate);
  const diffMs = returnD - pickup;
  const days = Math.ceil(diffMs / 86400000);
  return Math.max(1, days);
};

/**
 * Calculate total rental cost
 * @param {number} days - Number of rental days
 * @param {number} dailyRate - Daily rental rate
 * @param {number} discount - Discount amount (default 0)
 * @param {number} additionalCharges - Additional charges (default 0)
 * @returns {object} - { subtotal, discount, additionalCharges, total }
 */
const calculateRentalCost = (days, dailyRate, discount = 0, additionalCharges = 0) => {
  const subtotal = parseFloat((days * dailyRate).toFixed(2));
  const discountAmount = parseFloat(parseFloat(discount).toFixed(2));
  const extras = parseFloat(parseFloat(additionalCharges).toFixed(2));
  const total = parseFloat((subtotal - discountAmount + extras).toFixed(2));

  return {
    subtotal,
    discount: discountAmount,
    additionalCharges: extras,
    total: Math.max(0, total),
  };
};

/**
 * Format a number as Indian Rupee currency
 * @param {number} amount
 * @returns {string}
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

module.exports = {
  generateBookingReference,
  generateInvoiceNumber,
  calculateRentalDays,
  calculateRentalCost,
  formatCurrency,
};
