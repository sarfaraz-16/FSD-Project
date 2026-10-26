import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ShieldCheck, Briefcase, ShoppingBag, ArrowLeft, KeyRound, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const portalConfig = {
  admin: {
    key: 'admin',
    name: 'Admin Control Portal',
    subtitle: 'System Governance & Full Access',
    badge: 'System Governance',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: ShieldCheck,
    iconBg: 'bg-indigo-600 text-white shadow-indigo-200',
    btnClass: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 shadow-indigo-600/20',
    demoUser: 'admin@smarterp.com',
    demoPass: 'password123',
    description: 'Governance portal for system administrators and IT controllers.'
  },
  manager: {
    key: 'manager',
    name: 'Operations Portal',
    subtitle: 'Inventory, Purchasing & Sales Management',
    badge: 'Operations & Procurement',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: Briefcase,
    iconBg: 'bg-primary text-white shadow-sky-200',
    btnClass: 'bg-primary hover:bg-primary-hover focus:ring-primary shadow-primary/20',
    demoUser: 'manager@smarterp.com',
    demoPass: 'password123',
    description: 'Operations portal for warehouse managers and procurement leads.'
  },
  staff: {
    key: 'staff',
    name: 'Staff Desk',
    subtitle: 'POS, Sales Orders & Inventory Lookup',
    badge: 'Counter & POS Intake',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: ShoppingBag,
    iconBg: 'bg-emerald-600 text-white shadow-emerald-200',
    btnClass: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 shadow-emerald-600/20',
    demoUser: 'staff@smarterp.com',
    demoPass: 'password123',
    description: 'Sales desk for counter staff and point-of-sale operators.'
  }
};

const PortalLogin = () => {
  const { portalRole } = useParams();
  const navigate = useNavigate();
  const { login, getRoleLandingPath } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [demoPillActive, setDemoPillActive] = useState(false);

  // Validate portalRole parameter
  const currentPortal = portalConfig[portalRole];

  useEffect(() => {
    if (!currentPortal) {
      navigate('/login', { replace: true });
    } else {
      setError(null);
      setDemoPillActive(false);
    }
  }, [portalRole, currentPortal, navigate]);

  if (!currentPortal) return null;

  const Icon = currentPortal.icon;

  const handleFillDemo = () => {
    setEmail(currentPortal.demoUser);
    setPassword(currentPortal.demoPass);
    setError(null);
    setDemoPillActive(true);
    toast.success(`Demo credentials loaded for ${currentPortal.name}`);
    setTimeout(() => setDemoPillActive(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Pass expectedRole to enforce strict portal validation on both backend and client
      const user = await login(email, password, portalRole);
      toast.success(`Welcome, ${user.name}! Connected to ${currentPortal.name}`);
      const landingPath = getRoleLandingPath(user.role);
      navigate(landingPath);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please verify credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Return Gateway Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4 flex items-center justify-between">
        <Link
          to="/login"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-200/50"
        >
          <ArrowLeft size={14} className="mr-1.5" />
          <span>Return to Portal Selection</span>
        </Link>
        <span className="text-xs text-slate-400 font-medium">SmartERP Security</span>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Role Switcher Tab Header */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs mb-4 grid grid-cols-3 gap-1">
          {Object.values(portalConfig).map((p) => {
            const isSelected = p.key === portalRole;
            const TabIcon = p.icon;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => {
                  if (!isSelected) {
                    setEmail('');
                    setPassword('');
                    setError(null);
                    navigate(`/login/${p.key}`);
                  }
                }}
                className={`flex items-center justify-center space-x-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <TabIcon size={14} />
                <span className="truncate">{p.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Main Portal Card */}
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mb-3 ${currentPortal.iconBg}`}>
              <Icon size={28} />
            </div>
            <div className="inline-block mb-1.5">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${currentPortal.badgeClass}`}>
                {currentPortal.badge}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {currentPortal.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              {currentPortal.subtitle}
            </p>
          </div>

          {/* Quick Demo Pill */}
          <div className="mb-6 flex justify-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                demoPillActive
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              {demoPillActive ? (
                <>
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>Demo Credentials Filled</span>
                </>
              ) : (
                <>
                  <KeyRound size={13} className="text-slate-400" />
                  <span>Fill Demo Credentials ({currentPortal.name.split(' ')[0]})</span>
                </>
              )}
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 text-red-700 p-3.5 rounded-xl text-xs border border-red-200 flex items-start space-x-2.5">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{error}</div>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="appearance-none block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl shadow-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">Security Encrypted</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="appearance-none block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl shadow-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white transition-all disabled:opacity-50 ${currentPortal.btnClass}`}
              >
                <Lock size={15} />
                <span>{loading ? 'Authenticating...' : `Sign in to ${currentPortal.name.split(' ')[0]} Portal`}</span>
              </button>
            </div>
          </form>

          {/* Security Note */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Only authorized <span className="font-semibold text-slate-600">{portalRole.toUpperCase()}</span> credentials can unlock this portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalLogin;
