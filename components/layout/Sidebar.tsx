import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building2, FileText, 
  Calendar, DollarSign, Briefcase, Settings,
  LogOut, ChevronDown, Menu
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  userRole: string;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ userRole, onLogout, isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const menuItems: any = {
    admin: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
      { icon: Building2, label: 'Entreprises', path: '/admin/entreprises' },
      { icon: Users, label: 'Utilisateurs', path: '/admin/users' },
      { icon: Settings, label: 'Paramètres', path: '/admin/settings' },
    ],
    directeur: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/direction/dashboard' },
      { icon: Building2, label: 'Mon Entreprise', path: '/direction/entreprise' },
      { 
        icon: Users, 
        label: 'Ressources Humaines', 
        subItems: [
          { label: 'Employés', path: '/direction/membres' },
          { label: 'Services', path: '/direction/services' },
          { label: 'Postes', path: '/direction/postes' },
        ]
      },
      { icon: FileText, label: 'Rapports', path: '/direction/rapports' },
      { icon: Calendar, label: 'Statistiques', path: '/direction/stats' },
    ],
    rh: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/rh/dashboard' },
      { icon: Users, label: 'Employés', path: '/rh/employes' },
      { icon: FileText, label: 'Contrats', path: '/rh/contrats' },
      { icon: DollarSign, label: 'Paie', path: '/rh/paies' },
      { icon: Calendar, label: 'Congés', path: '/rh/conges' },
      { icon: Briefcase, label: 'Recrutement', path: '/rh/recrutement' },
    ],
    employe: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/employe/dashboard' },
      { icon: DollarSign, label: 'Mes Paies', path: '/employe/paies' },
      { icon: Calendar, label: 'Mes Congés', path: '/employe/conges' },
      { icon: FileText, label: 'Documents', path: '/employe/documents' },
    ],
  };

  const items = menuItems[userRole] || menuItems.employe;

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => 
      prev.includes(label) 
        ? prev.filter(m => m !== label)
        : [...prev, label]
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-slate-900 text-white
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-500 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">RH MANAGER</span>
            </div>
            <button onClick={onClose} className="lg:hidden">
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {items.map((item: any) => (
              <div key={item.path || item.label}>
                {item.subItems ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform ${
                        openMenus.includes(item.label) ? 'rotate-180' : ''
                      }`} />
                    </button>
                    {openMenus.includes(item.label) && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.subItems.map((subItem: any) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                              location.pathname === subItem.path
                                ? 'bg-primary-600 text-white'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-primary-600 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};