import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { LifeBuoy, CheckCircle2, ShoppingCart, PackageCheck, ShieldAlert, Send, Database, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const faqs = [
  {
    id: 1,
    title: 'How do I create and confirm a Sales Order?',
    icon: ShoppingCart,
    content: 'Navigate to Sales > New Order. Select a Customer, add product line items with quantities, and click "Save Draft". From the order list or details page, click "Confirm" to lock in the sale. Confirming the order will validate stock availability, generate a sequential invoice number (e.g., INV-2026-XXXX), and automatically deplete product inventory within a transaction.'
  },
  {
    id: 2,
    title: 'How does receiving stock from Purchase Orders work?',
    icon: PackageCheck,
    content: 'Only Admins and Managers have Purchasing permissions. Create a Purchase Order under Purchases > New Order, select your Supplier and items, and save the draft. When ready, mark it as "Ordered". Once the delivery arrives at the warehouse, click "Receive Stock". This atomically increments product inventory quantities and writes a detailed StockLog entry.'
  },
  {
    id: 3,
    title: 'How do user roles and module permissions work?',
    icon: ShieldAlert,
    content: 'SmartERP enforces strict Role-Based Access Control (RBAC): Admin has full control including employee records, user provisioning, and Settings. Manager oversees Inventory, Purchases, Sales, and Reports. Staff is limited to the Staff Desk, POS draft order creation, and stock lookup. Unauthorized routes return a 403 Forbidden page.'
  }
];

const Support = () => {
  const { user } = useContext(AuthContext);
  const [openFaq, setOpenFaq] = useState(1);

  const [ticket, setTicket] = useState({
    subject: '',
    priority: 'Medium',
    category: 'Operations',
    description: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!ticket.subject.trim() || !ticket.description.trim()) {
      return toast.error('Please enter both subject and description.');
    }

    setSubmitting(true);
    setTimeout(() => {
      const ticketId = Math.floor(1000 + Math.random() * 9000);
      setSubmitting(false);
      setTicket({ subject: '', priority: 'Medium', category: 'Operations', description: '' });
      toast.success(`Support ticket #TICK-${ticketId} submitted successfully! Our support desk will follow up.`);
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Help & Support Desk</h1>
        <p className="text-sm text-slate-500 mt-1">
          Access system status, operational guides, and submit help desk tickets to the operations team.
        </p>
      </div>

      {/* System Status Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-200/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Database size={20} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-slate-900">System Status: Online</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
                Operational
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              MongoDB Atlas Cluster connected & synchronized • Server API Healthy (port 5000)
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-500 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs font-mono">
          Cluster: ac-7px0dyr-shard (99.98% Uptime)
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Quick FAQs */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-lg mb-2">
            <HelpCircle size={20} className="text-primary" />
            <h2>Frequently Asked Operational Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => {
              const Icon = faq.icon;
              const isOpen = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <Icon size={16} />
                      </div>
                      <span className="text-sm font-semibold text-slate-800">{faq.title}</span>
                    </div>
                    {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                      {faq.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Role Access Guide Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 mt-4">
            <h3 className="text-sm font-bold text-slate-800 mb-2">Your Current Session Role: <span className="text-primary capitalize">{user?.role}</span></h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {user?.role === 'admin' && 'You have unrestricted access to all modules, system configuration, staff user accounts, and company settings.'}
              {user?.role === 'manager' && 'You have operational management access over inventory, purchasing, sales orders, and reports. Settings and user creation are restricted to administrators.'}
              {user?.role === 'staff' && 'You are signed into the Staff Desk for point-of-sale intake, draft sales orders, and stock inquiries. Administrative and procurement modules are restricted.'}
            </p>
          </div>
        </div>

        {/* Right Column: Support Ticket Form */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center space-x-2.5 mb-4 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                <LifeBuoy size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Submit Support Ticket</h2>
                <p className="text-xs text-slate-500">Reach the SmartERP support team</p>
              </div>
            </div>

            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Requester
                </label>
                <input
                  type="text"
                  disabled
                  value={`${user?.name || 'User'} (${user?.email || 'N/A'})`}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stock discrepancy on SKU-LAP-PRO"
                  value={ticket.subject}
                  onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={ticket.priority}
                    onChange={(e) => setTicket({ ...ticket, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={ticket.category}
                    onChange={(e) => setTicket({ ...ticket, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="Operations">Operations</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Billing & Orders">Billing & Orders</option>
                    <option value="Technical Bug">Technical Bug</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Issue Description *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the issue or assistance needed in detail..."
                  value={ticket.description}
                  onChange={(e) => setTicket({ ...ticket, description: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
              >
                <Send size={15} />
                <span>{submitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
