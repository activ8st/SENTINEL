import React from 'react';
import BottomNav from '@/components/common/BottomNav';
import Sidebar from '@/components/common/Sidebar';
import GdprBanner from '@/components/common/GdprBanner';

const NO_NAV_PAGES = ['IncidentDetail'];

export default function Layout({ children, currentPageName }) {
  const showNav = !NO_NAV_PAGES.includes(currentPageName);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white relative flex transition-colors duration-300">
      <style>{`
        * { font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif; }
        body { background: #030712; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }
        ::-webkit-scrollbar { width: 0; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        [data-state=active].bg-orange-500 { background-color: rgb(249 115 22) !important; }

        /* Active/pressed: feedback visivo al tap */
        button:active, [role="button"]:active { transform: scale(0.94); transition: transform 0.08s ease; }
        /* Toggle attivo: alone arancione */
        button[aria-pressed="true"] { box-shadow: 0 0 0 2px rgba(249,115,22,0.55); }
        /* Focus tastiera visibile */
        button:focus-visible, a:focus-visible { outline: 2px solid rgb(249 115 22); outline-offset: 2px; border-radius: 6px; }
      `}</style>

      {showNav && <Sidebar />}

      <div className="flex-1 min-w-0 flex flex-col relative">
        <main id="main-content" className={showNav ? 'pb-20 md:pb-0' : ''}>
          {children}
        </main>
        {showNav && <div className="md:hidden"><BottomNav /></div>}
      </div>

      <GdprBanner />
    </div>
  );
}