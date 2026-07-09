import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, Map as MapIcon, PlusSquare, Bell, User, Shield, Menu, Sun, Moon } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useTheme } from 'next-themes';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const NAV_ITEMS = [
    { name: 'Feed', icon: Home, path: '/' },
    { name: 'Mappa', icon: MapIcon, path: createPageUrl('MapView') },
    { name: 'Segnala', icon: PlusSquare, path: createPageUrl('Report') },
    { name: 'Alerts', icon: Bell, path: createPageUrl('Notifications') },
    { name: 'Profilo', icon: User, path: createPageUrl('Profile') },
  ];

  return (
    <aside className={`hidden md:flex flex-col h-screen sticky top-0 left-0 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-white/5 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/5">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Sentinel" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">Sentinel</span>
          </Link>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 py-4 px-3 flex flex-col gap-2">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200
              ${isActive ? 'bg-orange-500/10 text-orange-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'}
            `}
          >
            <item.icon className="w-6 h-6 flex-shrink-0" />
            {!collapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-white/5 flex flex-col gap-3">
        <button 
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="flex items-center justify-center p-3 rounded-xl font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200"
        >
          {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
      </div>
    </aside>
  );
}
