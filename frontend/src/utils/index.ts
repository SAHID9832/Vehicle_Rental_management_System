/** Format a number as INR currency */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Calculate rental days between two datetime strings (min 1 day) */
export function calculateRentalDays(pickup: string, returnDate: string): number {
  const ms = new Date(returnDate).getTime() - new Date(pickup).getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/** Format a datetime string for display */
export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

/** Format a date string for display */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

/** Format datetime for input[type="datetime-local"] */
export function toInputDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Get minimum pickup datetime (now + 1 hour) for input */
export function getMinPickupDateTime(): string {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Status color mapping */
export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    Available: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    Rented: 'text-blue-700 bg-blue-50 border-blue-200',
    Reserved: 'text-amber-700 bg-amber-50 border-amber-200',
    Maintenance: 'text-orange-700 bg-orange-50 border-orange-200',
    Inactive: 'text-gray-600 bg-gray-50 border-gray-200',
    Confirmed: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    Pending: 'text-amber-700 bg-amber-50 border-amber-200',
    Active: 'text-blue-700 bg-blue-50 border-blue-200',
    Completed: 'text-gray-700 bg-gray-50 border-gray-200',
    Cancelled: 'text-red-700 bg-red-50 border-red-200',
    Overdue: 'text-red-700 bg-red-50 border-red-200',
    Paid: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    Waiting: 'text-amber-700 bg-amber-50 border-amber-200',
    Scheduled: 'text-blue-700 bg-blue-50 border-blue-200',
    InProgress: 'text-purple-700 bg-purple-50 border-purple-200',
  };
  return map[status] || 'text-gray-600 bg-gray-50 border-gray-200';
}

/** Fuel type icon mapping */
export function getFuelIcon(fuelType: string): string {
  const map: Record<string, string> = {
    Petrol: '⛽', Diesel: '🛢️', Electric: '⚡', CNG: '💨', Hybrid: '🔋',
  };
  return map[fuelType] || '⛽';
}

/** Generate a booking reference */
export function generateBookingRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'BK';
  for (let i = 0; i < 8; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

/** Truncate text */
export function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

/** Extract error message from axios error */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    return err.response?.data?.message || err.message || 'An unexpected error occurred';
  }
  return 'An unexpected error occurred';
}

/** Fallback vehicle imagery by category or model */
export function getVehicleImageUrl(vehicle?: {
  image_url?: string;
  name?: string;
  category_name?: string;
  brand?: string;
}): string {
  if (vehicle?.image_url && vehicle.image_url.startsWith('http')) {
    return vehicle.image_url;
  }
  const name = (vehicle?.name || vehicle?.brand || '').toLowerCase();
  const cat = (vehicle?.category_name || '').toLowerCase();

  if (name.includes('swift')) return 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80';
  if (name.includes('i20')) return 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80';
  if (name.includes('city') || name.includes('honda')) return 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80';
  if (name.includes('innova')) return 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80';
  if (name.includes('meteor') || name.includes('enfield') || cat.includes('motorcycle')) return 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80';
  if (name.includes('activa') || name.includes('pulsar')) return 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80';
  if (name.includes('seltos') || name.includes('creta')) return 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80';
  if (name.includes('nexon') || name.includes('tigor') || cat.includes('electric')) return 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80';
  if (name.includes('xuv') || name.includes('fortuner')) return 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80';
  if (name.includes('bmw')) return 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80';
  if (name.includes('mercedes') || cat.includes('luxury')) return 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80';
  if (name.includes('traveller') || cat.includes('van')) return 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?auto=format&fit=crop&w=800&q=80';
  if (cat.includes('suv')) return 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80';

  return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
}

