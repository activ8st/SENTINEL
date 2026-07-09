import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Map, Plus, Bell, User } from 'lucide-react';
import { MOCK_INCIDENTS } from '@/components/data/mockData';

const navItems = [
  { name: 'Feed',     icon: Home,  page: 'Home' },
  { name: 'Mappa',    icon: Map,   page: 'MapView' },
  { name: null,       icon: Plus,  page: 'Report', isMain: true },
  { name: 'Alerts',   icon: Bell,  page: 'Notifications' },
  { name: 'Profilo',  icon: User,  page: 'Profile' },
];

export default function BottomNav() {
  const location = useLocation();
  const unreadCount = MOCK_INCIDENTS.filter(i => i.severity === 'critical' || i.severity === 'high').length;

  const isActive = (page) => location.pathname.toLowerCase().includes(page.toLowerCase());

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-xl border-t border-white/8">
      <div className="flex items-end justify-around px-2 pt-2 pb-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.page);

          if (item.isMain) {
            return (
              <Link key="report" to={createPageUrl(item.page)} className="relative -mt-5 flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/40 active:scale-95 transition-transform">
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className="flex flex-col items-center gap-1 flex-1 py-1 relative"
            >
              <div className="relative">
                <Icon className={`w-6 h-6 transition-colors ${active ? 'text-orange-500' : 'text-gray-500'}`} />
                {item.page === 'Notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium transition-colors ${active ? 'text-orange-500' : 'text-gray-600'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}