import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Briefcase, ShoppingBag, ArrowRight, Layers, Sparkles } from 'lucide-react';

const portals = [
  {
    id: 'admin',
    path: '/login/admin',
    name: 'Admin Control Portal',
    badge: 'System Governance',
    badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: ShieldCheck,
    iconStyle: 'bg-indigo-600 text-white shadow-indigo-200',
    cardBorder: 'hover:border-indigo-400 group-hover:shadow-indigo-500/10',
    btnStyle: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20',
    description: 'System orchestration, security policies, staff record provisioning, role permissions, and full organizational audit.',
    tags: ['Executive Governance', 'User & Role Control', 'System Audit'],
    demo: 'admin@smarterp.com'
  },
  {
    id: 'manager',
    path: '/login/manager',
    name: 'Operations Portal',
    badge: 'Operations & Procurement',
    badgeStyle: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: Briefcase,
    iconStyle: 'bg-sky-600 text-white shadow-sky-200',
    cardBorder: 'hover:border-sky-400 group-hover:shadow-sky-500/10',
    btnStyle: 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20',
    description: 'Procurement workflows, vendor management, warehouse stock movements, approval chains, and real-time business reports.',
    tags: ['Inventory Control', 'Purchase Orders', 'Sales & Reports'],
    demo: 'manager@smarterp.com'
  },
  {
    id: 'staff',
    path: '/login/staff',
    name: 'Staff Desk',
    badge: 'Counter & POS Intake',
    badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: ShoppingBag,
    iconStyle: 'bg-emerald-600 text-white shadow-emerald-200',
    cardBorder: 'hover:border-emerald-400 group-hover:shadow-emerald-500/10',
    btnStyle: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
    description: 'Rapid point-of-sale intake, draft sales orders, customer checkout assistance, and live product stock availability check.',
    tags: ['Sales Order Drafts', 'Stock Availability', 'Customer Intake'],
    demo: 'staff@smarterp.com'
  }
];

const LoginGateway = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto w-full text-center pt-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-primary-light text-primary text-xs font-semibold uppercase tracking-wider mb-4 border border-primary/20">
          <Layers size={14} />
          <span>SmartERP Role Gateway</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Select Your Access Portal
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          Choose your designated operational persona to access role-specific workflows, governance tools, and business modules.
        </p>
      </div>

      {/* 3 Portal Cards */}
      <div className="max-w-6xl mx-auto w-full my-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.id}
                className={`group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-7 relative overflow-hidden ${portal.cardBorder}`}
              >
                {/* Background decorative gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-100/50 to-transparent rounded-bl-full pointer-events-none" />

                <div>
                  {/* Badge & Icon Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${portal.iconStyle}`}>
                      <Icon size={24} />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${portal.badgeStyle}`}>
                      {portal.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                    {portal.name}
                  </h2>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {portal.description}
                  </p>

                  {/* Feature Tags */}
                  <div className="space-y-1.5 mb-6">
                    {portal.tags.map((tag, idx) => (
                      <div key={idx} className="flex items-center text-xs text-slate-500 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2 group-hover:bg-primary transition-colors" />
                        <span>{tag}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action & Demo Helper */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span>Default User:</span>
                    <span className="font-mono text-slate-600">{portal.demo}</span>
                  </div>
                  <Link
                    to={portal.path}
                    className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all shadow-md group-hover:translate-y-[-1px] ${portal.btnStyle}`}
                  >
                    <span>Enter {portal.name.split(' ')[0]} Portal</span>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Assurance */}
      <div className="max-w-4xl mx-auto w-full text-center pb-2">
        <div className="inline-flex items-center space-x-2 text-xs text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200/80 shadow-xs">
          <Sparkles size={14} className="text-primary" />
          <span>Strict Role-Governed Access: Accounts are restricted to their authorized portal.</span>
        </div>
      </div>
    </div>
  );
};

export default LoginGateway;
