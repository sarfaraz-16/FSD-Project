import React, { useState } from 'react';
import { Building2, Lock, Sliders, Save, CheckCircle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  // Load saved settings or defaults
  const [companyInfo, setCompanyInfo] = useState(() => {
    const saved = localStorage.getItem('smarterp_company_settings');
    return saved ? JSON.parse(saved) : {
      companyName: 'SmartERP Inc.',
      address: '123 Business Rd, Tech Park, City 12345',
      contactEmail: 'billing@smarterp.com',
      currency: 'USD ($)',
      taxId: 'US-984021-ERP'
    };
  });

  const [stockSettings, setStockSettings] = useState(() => {
    const saved = localStorage.getItem('smarterp_stock_settings');
    return saved ? JSON.parse(saved) : {
      defaultReorderLevel: 10,
      enableLowStockBadge: true,
      autoRestockAlerts: true
    };
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [savingCompany, setSavingCompany] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingStock, setSavingStock] = useState(false);

  const handleSaveCompany = (e) => {
    e.preventDefault();
    setSavingCompany(true);
    setTimeout(() => {
      localStorage.setItem('smarterp_company_settings', JSON.stringify(companyInfo));
      setSavingCompany(false);
      toast.success('Company & Invoice preferences saved successfully');
    }, 400);
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      return toast.error('Please enter your current password');
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('New passwords do not match');
    }

    setSavingPassword(true);
    setTimeout(() => {
      setSavingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Security password updated successfully');
    }, 500);
  };

  const handleSaveStock = (e) => {
    e.preventDefault();
    setSavingStock(true);
    setTimeout(() => {
      localStorage.setItem('smarterp_stock_settings', JSON.stringify(stockSettings));
      setSavingStock(false);
      toast.success('Stock alert thresholds updated');
    }, 400);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
            <Shield size={13} />
            <span>Admin Governance Only</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure global enterprise defaults, invoice branding, security credentials, and inventory thresholds.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card 1: Company & Invoice Info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                <Building2 size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Company & Invoice Info</h2>
                <p className="text-xs text-slate-500">Appears on generated PDFs, orders, and receipts</p>
              </div>
            </div>

            <form id="company-form" onSubmit={handleSaveCompany} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyInfo.companyName}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, companyName: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Business Address</label>
                <textarea
                  rows={2}
                  required
                  value={companyInfo.address}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={companyInfo.contactEmail}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, contactEmail: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Default Currency</label>
                  <select
                    value={companyInfo.currency}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, currency: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="GBP (£)">GBP (£)</option>
                    <option value="INR (₹)">INR (₹)</option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              form="company-form"
              disabled={savingCompany}
              className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
            >
              <Save size={16} />
              <span>{savingCompany ? 'Saving...' : 'Save Company Info'}</span>
            </button>
          </div>
        </div>

        {/* Card 2: Security & Password Management */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Lock size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Security & Password</h2>
                <p className="text-xs text-slate-500">Update your administrator credentials</p>
              </div>
            </div>

            <form id="password-form" onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Re-type new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </form>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              form="password-form"
              disabled={savingPassword}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
            >
              <CheckCircle size={16} />
              <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Card 3: Stock Alert Thresholds */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Sliders size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Stock Alert Thresholds</h2>
            <p className="text-xs text-slate-500">Configure low-inventory trigger levels and notification rules</p>
          </div>
        </div>

        <form onSubmit={handleSaveStock} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Default Reorder Level (Units)
              </label>
              <input
                type="number"
                min="1"
                required
                value={stockSettings.defaultReorderLevel}
                onChange={(e) => setStockSettings({ ...stockSettings, defaultReorderLevel: Number(e.target.value) })}
                className="w-full max-w-xs px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <p className="text-xs text-slate-400 mt-1">
                When product stock falls at or below this value, an alert is triggered in the navbar badge.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stockSettings.enableLowStockBadge}
                  onChange={(e) => setStockSettings({ ...stockSettings, enableLowStockBadge: e.target.checked })}
                  className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                />
                <span className="text-sm font-medium text-slate-700">Display low stock count badge in top navigation</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stockSettings.autoRestockAlerts}
                  onChange={(e) => setStockSettings({ ...stockSettings, autoRestockAlerts: e.target.checked })}
                  className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                />
                <span className="text-sm font-medium text-slate-700">Include low-stock items in the daily automated cron report</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={savingStock}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
            >
              <Save size={16} />
              <span>{savingStock ? 'Saving...' : 'Save Thresholds'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
