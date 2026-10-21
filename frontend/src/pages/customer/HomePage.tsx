import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  Shield,
  Zap,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Car,
  ChevronRight,
} from 'lucide-react';
import { vehiclesApi, branchesApi } from '../../services/api';
import { Vehicle, Branch, VehicleCategory } from '../../types';
import VehicleCard from '../../components/vehicles/VehicleCard';
import { formatINR, getMinPickupDateTime, getVehicleImageViews } from '../../utils';

export default function HomePage() {
  const navigate = useNavigate();

  // Search panel state
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [pickupBranch, setPickupBranch] = useState<string>('');
  const [returnBranch, setReturnBranch] = useState<string>('');
  const [pickupDateTime, setPickupDateTime] = useState<string>('');
  const [returnDateTime, setReturnDateTime] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [branchRes, catRes, vehRes] = await Promise.all([
          branchesApi.getAll(),
          vehiclesApi.getCategories(),
          vehiclesApi.getAll({ limit: 6, status: 'Available' }),
        ]);

        const branchList = branchRes.data.data || [];
        setBranches(branchList);
        if (branchList.length > 0) {
          setPickupBranch(String(branchList[0].id));
          setReturnBranch(String(branchList[0].id));
        }

        setCategories(catRes.data.data || []);
        const rawVeh = vehRes.data.data?.data || vehRes.data.data || [];
        const enriched = rawVeh.map((v: Vehicle) => ({
          ...v,
          image_views: getVehicleImageViews(v),
        }));
        setFeaturedVehicles(enriched);

        // Default dates: tomorrow 10am to day after tomorrow 10am
        const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
        tomorrow.setHours(10, 0, 0, 0);
        const dayAfter = new Date(Date.now() + 48 * 3600 * 1000);
        dayAfter.setHours(10, 0, 0, 0);

        const pad = (n: number) => String(n).padStart(2, '0');
        const fmt = (d: Date) =>
          `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

        setPickupDateTime(fmt(tomorrow));
        setReturnDateTime(fmt(dayAfter));
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (pickupBranch) query.set('branch', pickupBranch);
    if (selectedCategory) query.set('category', selectedCategory);
    if (pickupDateTime) query.set('pickup', pickupDateTime);
    if (returnDateTime) query.set('return', returnDateTime);
    navigate(`/vehicles?${query.toString()}`);
  };

  const steps = [
    {
      step: '01',
      title: 'Select City Hub',
      desc: 'Choose from 24 connected hubs across India with instant availability checks.',
    },
    {
      step: '02',
      title: 'Pick Dates & Times',
      desc: 'Transparent pricing with stack-evaluated rental estimates and zero hidden fees.',
    },
    {
      step: '03',
      title: 'Greedy Fleet Match',
      desc: 'Our greedy allocation algorithm recommends the most cost-effective vehicle.',
    },
    {
      step: '04',
      title: 'Instant Confirmation',
      desc: 'Key pickup within 5 minutes at your chosen hub with verified vehicle inspection.',
    },
  ];

  const faqs = [
    {
      q: 'What documents are required to rent a vehicle?',
      a: 'A valid Indian driving license, government photo ID (Aadhaar or Passport), and proof of address. Original documents must be presented at vehicle pickup.',
    },
    {
      q: 'How does Movo calculate rental charges?',
      a: 'We evaluate rental pricing using a clear arithmetic expression: (Rental Days × Daily Rate) − Discounts + Additional Services. Duration is rounded up to the nearest 24-hour cycle.',
    },
    {
      q: 'Can I pick up in Indiranagar and drop off at Kempegowda Airport (KIAL)?',
      a: 'Yes! Our multi-hub network is connected via our branch graph. Select your distinct pickup and return branches during reservation.',
    },
    {
      q: 'Is fuel included in the rental cost?',
      a: 'Vehicles are handed over with a full tank or recorded level. Return the vehicle with the same fuel level to avoid refueling surcharges.',
    },
  ];

  // Group branches by state
  const groupedBranches = React.useMemo(() => {
    const map: Record<string, Branch[]> = {};
    branches.forEach((b) => {
      const stateName = b.state || 'Other';
      if (!map[stateName]) map[stateName] = [];
      map[stateName].push(b);
    });
    return map;
  }, [branches]);

  const handleStatePillClick = (stateName: string) => {
    navigate(`/vehicles?state=${encodeURIComponent(stateName)}`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Opening Logo Slide-In Animation (Towards Up Side) */}
      {showSplash && (
        <div
          onClick={() => setShowSplash(false)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md animate-movo-splash-overlay cursor-pointer select-none"
        >
          <div className="flex flex-col items-center animate-movo-splash-logo">
            <div className="p-5 sm:p-7 rounded-3xl bg-white shadow-2xl shadow-blue-500/25 border border-white/40">
              <img
                src="/movo-logo.png"
                alt="Movo Logo"
                className="w-44 sm:w-56 h-auto object-contain"
              />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
              <p className="text-xs font-bold uppercase tracking-widest text-teal-300">
                Opening Movo...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Search Panel */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-10 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-8">
            {/* Prominent Movo Logo sliding towards up side */}
            <div className="flex justify-center mb-6 animate-movo-slide-up">
              <div className="inline-flex items-center gap-3.5 px-5 py-2.5 rounded-2xl bg-white shadow-xl shadow-teal-500/10 border border-white/20 transition-transform hover:scale-105 duration-200">
                <img
                  src="/movo-logo.png"
                  alt="Movo Vehicle Rental"
                  className="h-11 sm:h-13 w-auto object-contain"
                />
                <div className="text-left border-l border-gray-200 pl-3">
                  <div className="flex items-center gap-1">
                    <span className="text-xl font-black text-gray-900 tracking-tight">MOVO</span>
                    <span className="text-xl font-light text-teal-600 tracking-tight">RENTAL</span>
                  </div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-teal-600 -mt-0.5">
                    Move Your Way
                  </p>
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Movo Pan-India Fleet Network</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Rent Any Vehicle, <br className="hidden sm:inline" />
              <span className="text-teal-400">Any State, Anywhere in India.</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
              Book India's favorite cars, SUVs, and bikes across 25+ states and 70+ major hubs nationwide with Movo.
              Move your way with instant availability, clean verified fleet, and transparent pricing.
            </p>

            {/* Quick State Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
              <span className="text-xs text-slate-400 font-semibold mr-1">Popular States:</span>
              {['Goa', 'Maharashtra', 'Delhi', 'Karnataka', 'Rajasthan', 'Himachal Pradesh', 'Kerala'].map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatePillClick(st)}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 hover:bg-teal-600 hover:text-white border border-slate-700 text-slate-300 transition-colors"
                >
                  📍 {st}
                </button>
              ))}
            </div>
          </div>

          {/* Prominent Booking Search Panel */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl text-gray-900 border border-gray-100 max-w-5xl mx-auto">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Pickup Hub */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    Pickup Hub & State
                  </label>
                  <select
                    value={pickupBranch}
                    onChange={(e) => setPickupBranch(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    {Object.entries(groupedBranches).map(([st, bList]) => (
                      <optgroup key={st} label={`📍 ${st} (${bList.length} Hubs)`}>
                        {bList.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.city}: {b.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Return Hub */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    Drop-off Hub
                  </label>
                  <select
                    value={returnBranch}
                    onChange={(e) => setReturnBranch(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    {Object.entries(groupedBranches).map(([st, bList]) => (
                      <optgroup key={st} label={`📍 ${st} (${bList.length} Hubs)`}>
                        {bList.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.city}: {b.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Pickup Date & Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    Pickup Date
                  </label>
                  <input
                    type="datetime-local"
                    value={pickupDateTime}
                    min={getMinPickupDateTime()}
                    onChange={(e) => setPickupDateTime(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                {/* Return Date & Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    Return Date
                  </label>
                  <input
                    type="datetime-local"
                    value={returnDateTime}
                    min={pickupDateTime || getMinPickupDateTime()}
                    onChange={(e) => setReturnDateTime(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                {/* Vehicle Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-teal-600" />
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Real-time overlap validation • Interstate & local rentals supported</span>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-sm shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>Search Available Fleet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Explore Fleet Categories</h2>
            <p className="text-sm text-gray-600 mt-1">From nimble scooters to executive luxury sedans</p>
          </div>
          <Link
            to="/vehicles"
            className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/vehicles?category=${encodeURIComponent(cat.name)}`}
              className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:border-teal-200 hover:shadow-md transition-all text-center group"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg mb-3 group-hover:bg-teal-600 group-hover:text-white transition-all">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">{cat.name}</h3>
              <p className="text-[11px] text-gray-600 mt-1 line-clamp-1">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Fleet Vehicles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Featured Available Vehicles</h2>
            <p className="text-sm text-gray-600 mt-1">Ready for pickup at our top Pan-India hubs (Bengaluru, Mumbai, Delhi-NCR, Goa, Jaipur & more)</p>
          </div>
          <Link
            to="/vehicles"
            className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <span>View All Fleet</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-white rounded-2xl border border-gray-100 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </section>


      {/* How it Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            How Movo Works
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Streamlined 4-step workflow inspired by India's top mobility platforms
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div
              key={s.step}
              className="p-6 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-sm transition-all relative"
            >
              <div className="text-3xl font-black text-teal-600/30 mb-3">{s.step}</div>
              <h3 className="font-bold text-gray-900 text-base mb-1.5">{s.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Why India Chooses Movo
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Engineered for absolute reliability, fair pricing, and rapid vehicle handover
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xs flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Verified Clean Fleet</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Every vehicle undergoes a 40-point safety and cleanliness audit before handover.
                Real odometer logging on pickup and return.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xs flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Transparent INR Pricing</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Zero surprise charges at return. Clear daily rates, refundable security deposits,
                and upfront estimates calculated transparently.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xs flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Fast Hub Handover</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Pick up at MG Road, Indiranagar, Whitefield, Electronic City, or KIAL Airport
                with your booking reference in under 5 minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Everything you need to know about renting with Movo
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
              <h3 className="text-base font-bold text-gray-900 mb-2 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-teal-600 shrink-0 mt-1" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 pl-6 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
