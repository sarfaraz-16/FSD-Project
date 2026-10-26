import { LayoutDashboard, Package, ShoppingCart, ShoppingBag, Users, Settings, LifeBuoy, FileText } from 'lucide-react';
import permissions from '../../../shared/permissions.json';

const getRolesForModule = (moduleName) => {
  return Object.keys(permissions).filter(role => permissions[role][moduleName]?.includes('read'));
};

export const navigationMenu = [
  {
    title: 'MAIN',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['admin', 'manager', 'staff'] },
      { name: 'Inventory', icon: Package, path: '/inventory', roles: getRolesForModule('inventory') },
      { name: 'Sales', icon: ShoppingCart, path: '/sales', roles: getRolesForModule('sales') },
      { name: 'Purchases', icon: ShoppingBag, path: '/purchases', roles: getRolesForModule('purchases') },
      { name: 'Reports', icon: FileText, path: '/reports', roles: getRolesForModule('reports') },
      { name: 'HR', icon: Users, path: '/hr', roles: getRolesForModule('employees') },
    ]
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { name: 'Settings', icon: Settings, path: '/settings', roles: ['admin'] },
    ]
  },
  {
    title: 'HELP & SUPPORT',
    items: [
      { name: 'Support', icon: LifeBuoy, path: '/support', roles: ['admin', 'manager', 'staff'] },
    ]
  }
];
