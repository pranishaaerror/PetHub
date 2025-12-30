import { useState } from "react";
import { Menu } from "lucide-react";
export const AdminDashboard = () =>{

const [sidebarOpen, setSidebarOpen] = useState(false);

return (
<div className = "bg-gray-100 h-screen">
{/* slidebar */}
<div className={`fixed bg-white w-64 h-screen shadow ${sidebarOpen ? "translate-x-0" :"-translate-x-64"}`}></div>

{/* main content */}
<main>
    <header className="bg-white flex justify-between p-4">
        <button className="p-2 text-xl font-bold lg:hidden" 
        onClick={()=> setSidebarOpen(true)} >
            <Menu/> 
            </button>
            <h1 className="text-2xl font-bold"> Dashboard</h1>
            <div className = "bg-gray-300 w-10 h-10 rounded-full"></div>
        
    </header>
</main>

</div>
)
}