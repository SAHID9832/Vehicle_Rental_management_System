import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Car, ArrowRight, ShieldCheck, User, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register, isAuthenticated, isAdmin } = useAuth();

  const [isRegister, setIsRegister] = useState(searchParams.get('mode') === 'register');
  const roleParam = searchParams.get('role');
  const [selectedRole, setSelectedRole] = useState<'Customer' | 'Admin'>(
    roleParam === 'admin' ? 'Admin' : 'Customer'
  );
  const [isLoading, setIsLoading] = useState(false);

  // Sign In State
  const [email, setEmail] = useState(() => (roleParam === 'admin' ? 'admin@vektor.in' : ''));
  const [password, setPassword] = useState('');

  // Register State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [drivingLicense, setDrivingLicense] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleRoleSwitch = (role: 'Customer' | 'Admin') => {
    setSelectedRole(role);
    if (!isRegister) {
      if (role === 'Admin') {
        if (!email || email.includes('gmail.com')) setEmail('admin@vektor.in');
      } else {
        if (email === 'admin@vektor.in') setEmail('');
      }
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const loggedUser = await login(email, password);
      const isUserAdmin = loggedUser?.role === 'Admin' || loggedUser?.role === 'Manager' || loggedUser?.role === 'Agent';

      if (selectedRole === 'Admin') {
        if (!isUserAdmin) {
          toast.error('This account is registered as a Customer. Please switch to the Customer Portal tab to sign in.');
          setIsLoading(false);
          return;
        }
        toast.success(`Welcome Administrator, ${loggedUser.name || 'Admin'}!`);
        navigate('/admin', { replace: true });
      } else {
        if (isUserAdmin) {
          toast.success(`Welcome, ${loggedUser.name}! Opening Admin Operations Center.`);
          navigate('/admin', { replace: true });
        } else {
          toast.success(`Welcome back, ${loggedUser.name}!`);
          navigate('/', { replace: true });
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newUser = await register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        phone: phone || (selectedRole === 'Admin' ? '08041234567' : '9876543210'),
        role: selectedRole,
        driving_license: drivingLicense,
        date_of_birth: dateOfBirth || '1998-01-01',
      });
      const isNewAdmin = newUser?.role === 'Admin';
      toast.success(`${isNewAdmin ? 'Administrator' : 'Customer'} account created successfully!`);
      navigate(isNewAdmin ? '/admin' : '/', { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex flex-col items-center gap-1 group">
            <img
              src="/movo-logo.png"
              alt="Movo Vehicle Rental"
              className="h-16 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <p className="text-[10px] uppercase font-bold tracking-widest text-teal-600">
              Move Your Way
            </p>
          </Link>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            {isRegister
              ? `Register as ${selectedRole}`
              : `${selectedRole} Sign In`}
          </h2>
          <p className="text-xs text-gray-600">
            {selectedRole === 'Admin'
              ? (isRegister
                  ? 'Register a new system administrator with full site control'
                  : 'Access site governance, fleet management, and settings')
              : (isRegister
                  ? 'Create a customer account to reserve vehicles anytime'
                  : 'Sign in to access your bookings, invoices, and profile')}
          </p>
        </div>

        {/* Role Selection Options: Customer vs Admin */}
        <div className="bg-gray-100 p-1.5 rounded-2xl flex gap-1.5">
          <button
            type="button"
            onClick={() => handleRoleSwitch('Customer')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              selectedRole === 'Customer'
                ? 'bg-white text-teal-700 shadow-sm border border-teal-100'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Customer Portal</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleSwitch('Admin')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              selectedRole === 'Admin'
                ? 'bg-white text-indigo-700 shadow-sm border border-indigo-100'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Administrator</span>
          </button>
        </div>

        {/* Auth Card */}
        <div className="bg-white p-7 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          {/* Action Tabs: Sign In vs Register */}
          <div className="flex rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                !isRegister ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                isRegister ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Register New
            </button>
          </div>

          {isRegister ? (
            /* Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={selectedRole === 'Admin' ? 'Admin' : 'Arjun'}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={selectedRole === 'Admin' ? 'Officer' : 'Sharma'}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={selectedRole === 'Admin' ? 'new.admin@vektor.in' : 'customer@example.com'}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={selectedRole === 'Admin' ? '08041234567' : '9876543210'}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {selectedRole === 'Customer' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Driving License Number</label>
                    <input
                      type="text"
                      value={drivingLicense}
                      onChange={(e) => setDrivingLicense(e.target.value)}
                      placeholder="KA-01 2023 1234567"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-xl text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all mt-4 ${
                  selectedRole === 'Admin'
                    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
                    : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/30'
                }`}
              >
                <span>{isLoading ? 'Creating Account...' : `Register as ${selectedRole}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Sign In Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {selectedRole === 'Admin' ? 'Admin Email Address' : 'Customer Email Address'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={selectedRole === 'Admin' ? 'admin@vektor.in' : 'customer@example.com'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-xl text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all mt-4 ${
                  selectedRole === 'Admin'
                    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
                    : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/30'
                }`}
              >
                <span>{isLoading ? 'Signing In...' : `Sign In as ${selectedRole}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
