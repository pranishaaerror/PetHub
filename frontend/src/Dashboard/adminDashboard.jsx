import { Users, Stethoscope, Scissors, Heart, PawPrint,  } from 'lucide-react';

export const AdminDashboard = () => {
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


  return (

        
      

        
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

  );
}