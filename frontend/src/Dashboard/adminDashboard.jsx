import React, { useState } from 'react';
import { Menu, X,  ChevronDown, TrendingUp, Users, Stethoscope, Scissors, Heart, Settings, LogOut, PawPrint,  } from 'lucide-react';

export const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const stats = [
    { 
      label: 'Total Users', 
      value: '', 
      positive: true,
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    { 
      label: 'Active Vets', 
      value: '45', 
      positive: null,
      icon: Stethoscope,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    { 
      label: 'Grooming Today', 
      value: '12', 
      positive: true,
      icon: Scissors,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    { 
      label: 'Adoption Requests', 
      value: '8', 
      positive: true,
      icon: Heart,
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600'
    }
  ];

  const quickActions = [
    { 
      icon: Users, 
      title: 'User Management', 
      description: 'Manage profiles and roles' 
    },
    { 
      icon: Stethoscope, 
      title: 'Vet Management', 
      description: 'Schedule & verify vets' 
    },
    { 
      icon: Scissors, 
      title: 'Grooming Services', 
      description: 'Booking & service list' 
    },
    { 
      icon: PawPrint, 
      title: 'Adoption Center', 
      description: 'Pet profiles & status' 
    }
  ];

  const navItems = [
    { icon: TrendingUp, label: 'Dashboard', active: true },
    { icon: Users, label: 'Users', active: false },
    { icon: Stethoscope, label: 'Vets', active: false },
    { icon: Scissors, label: 'Grooming', active: false },
    { icon: PawPrint, label: 'Adoption', active: false }
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
            <a
              key={idx}
              href="#"
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                item.active
                  ? 'bg-gradient-to-r from-[#FCDCA5] to-[#F7B864] text-gray-900 shadow-sm font-bold'
                  : 'text-gray-700 hover:bg-[#FFF7EB] font-medium'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </a>
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

        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto flex flex-col gap-8">
           
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                  Welcome back, Admin!
                </h1>
                <p className="text-gray-600 text-base">
                  Here is what's happening in your Pet Hub today.
                </p>
              </div>
            </div>

           
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-3 rounded-xl p-5 bg-white border border-[#F7B864]/30 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className={`${stat.bgColor} ${stat.iconColor} p-2 rounded-lg`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
                      stat.positive === true
                        ? 'text-[#F5A623] bg-[#FFF7EB]'
                        : 'text-gray-500 bg-gray-100'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                  </div>
                </div>
              ))}
            </div>

          
            <div className="flex flex-col gap-6">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
                  
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="group flex flex-col gap-4 rounded-xl border border-[#F7B864]/30 bg-white p-6 hover:border-[#F5A623] transition-all hover:shadow-lg"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#FFF7EB] flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-[#FCDCA5] group-hover:to-[#F7B864] transition-all text-gray-900">
                      <action.icon className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-gray-900 text-base font-bold leading-tight">{action.title}</h2>
                      <p className="text-gray-600 text-sm font-normal leading-normal">{action.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="h-10"></div>
          </div>
        </div>
      </main>
    </div>
  );
}