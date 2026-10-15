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
  Cpu,
  Car,
  ChevronRight,
} from 'lucide-react';
import { vehiclesApi, branchesApi } from '../../services/api';
import { Vehicle, Branch, VehicleCategory } from '../../types';
import VehicleCard from '../../components/vehicles/VehicleCard';
import { formatINR, getMinPickupDateTime } from '../../utils';

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
        setFeaturedVehicles(vehRes.data.data || []);

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
      desc: 'Choose from 5 connected hubs across Bengaluru with instant availability checks.',
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
      q: 'How does Vektor Rentals calculate rental charges?',
      a: 'We evaluate rental pricing using an arithmetic stack expression: (Rental Days × Daily Rate) − Discounts + Additional Services. Duration is rounded up to the nearest 24-hour cycle.',
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

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section with Search Panel */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bengaluru's Algorithmic Fleet Network</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Smarter Drives, <br className="hidden sm:inline" />
              <span className="text-teal-400">Algorithmic Efficiency.</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
              Book verified cars, SUVs, and bikes across Bengaluru. Optimized with Data Structures
              and Algorithms for instant availability and the best rates.
            </p>
          </div>

          {/* Prominent Booking Search Panel */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl text-gray-900 border border-gray-100 max-w-5xl mx-auto">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Pickup Hub */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    Pickup Hub
                  </label>
                  <select
                    value={pickupBranch}
                    onChange={(e) => setPickupBranch(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Return Hub */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    Return Hub
                  </label>
                  <select
                    value={returnBranch}
                    onChange={(e) => setReturnBranch(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
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
                  <span>Real-time overlap validation • Zero double-booking</span>
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
            <p className="text-sm text-gray-600 mt-1">Ready for pickup at our top Bengaluru branches</p>
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

      {/* DSA Academic Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="absolute right-0 top-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 text-xs font-bold uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" />
              <span>Interactive DSA Laboratory</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              See the Algorithms Behind Every Rental
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Explore step-by-step executions of Singly Linked Lists, Stack-based pricing expressions,
              FIFO waiting queues, BST lookups, Branch Graph BFS traversals, and Merge Sort price sorting.
            </p>

            <div className="pt-2">
              <Link
                to="/admin/dsa-lab"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-teal-500/20"
              >
                <span>Open DSA Lab</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            How Vektor Rentals Works
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
              Why Bengaluru Chooses Vektor
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
                and upfront estimates calculated via stack logic.
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
            Everything you need to know about renting with Vektor
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
