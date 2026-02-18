import { useState } from 'react';
import { Menu, X, ChevronDown, TrendingUp, Users, Stethoscope, Scissors, Settings, LogOut, PawPrint, Heart } from 'lucide-react';
import { Link } from "react-router-dom"
import { Outlet } from 'react-router-dom';

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { icon: TrendingUp, label: 'Dashboard', active: true, url: "/admin" },
    // { icon: Users, label: 'Users', active: false, url: "/admin/users" },
    // { icon: Stethoscope, label: 'Vets', active: false, url: "/admin/vets" },
    { icon: Scissors, label: 'Services', active: false, url: "/admin/services" },
    { icon: PawPrint, label: 'Appointments', active: false, url: "/admin/appointments" },
    { icon: Scissors, label: 'Groomer', active: false, url: "/admin/groomer" },
    { icon: Heart, label: 'Adoption', active: false, url: "/admin/adoption" },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#FFF7EB]">
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#F7B864]/30 transition-transform duration-300 flex flex-col`}>

        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FCDCA5] to-[#F7B864] flex items-center justify-center shadow-sm">
            <PawPrint className="w-6 h-6 text-gray-900" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-gray-900 text-lg font-bold leading-none">PetHub</h1>
            <p className="text-[#F5A623] text-xs font-medium">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-2 px-4 py-4 overflow-y-auto">
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.url}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${item.active
                  ? 'bg-gradient-to-r from-[#FCDCA5] to-[#F7B864] text-gray-900 shadow-sm font-bold'
                  : 'text-gray-700 hover:bg-[#FFF7EB] font-medium'
                }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}

          <div className="my-2 border-t border-gray-200"></div>

          <a href="#" className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </a>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </a>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-[#FFF7EB]">
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#F7B864]/30 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-gray-900 p-1"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h2 className="text-xl font-bold tracking-tight text-gray-900 hidden md:block">Overview</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-8 w-px bg-gray-200 mx-1"></div>
            <button className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-[#FFF7EB]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FCDCA5] to-[#F7B864] border-2 border-[#F5A623] flex items-center justify-center text-gray-900 font-semibold">
                A
              </div>
              <span className="text-sm font-semibold text-gray-900 hidden sm:block">Admin User</span>
              <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
            </button>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
};