import { useUsers } from "../apis/users/hooks"
import landingpagedog from "../assets/landingpage.png"
import { Link } from "react-router-dom"

export const LandingPage = () => {
  const { data } = useUsers()
  console.log({ data })

  return (
    <div className="font-sans h-screen overflow-hidden bg-[#FFF7EB] text-gray-900 flex flex-col">
      <nav className="flex justify-between items-center px-10 py-5 bg-gradient-to-r from-[#FCDCA5] to-[#F7B864] text-gray-900 shadow flex-none">
        <h1 className="text-2xl font-semibold flex items-center gap-2">PetHub</h1>

        <div className="hidden md:flex gap-8 text-sm">
          <a href="#home" className="hover:text-gray-700">
            Home
          </a>
          <a href="#about" className="hover:text-gray-700">
            About Us
          </a>
          <a href="#services" className="hover:text-gray-700">
            Services
          </a>
          <a href="#health" className="hover:text-gray-700">
            Pet Health
          </a>
          <a href="#contact" className="hover:text-gray-700">
            Contact Us
          </a>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white text-black border border-gray-300 rounded-md text-sm hover:bg-gray-100">
            <Link to="/Login"> Login </Link>
          </button>
          <button className="px-4 py-2 bg-[#F5A623] text-white rounded-md text-sm hover:bg-[#e6951f]">
            <Link to="/signup"> Signup </Link>
          </button>
        </div>
      </nav>

      <section className="flex-1 grid grid-cols-1 md:grid-cols-2 items-center px-10 overflow-hidden">
        <div className="flex flex-col justify-center">
          <h1 className="text-6xl font-black leading-tight text-gray-900">Your Pet</h1>
          <h2 className="text-4xl font-light mt-2 text-gray-800">Our Services</h2>
          <p className="mt-4 text-gray-700 text-lg max-w-md">Connecting Pets, People and Love.</p>
          <div className="flex gap-4 mt-8">
            <button className="px-5 py-3 bg-[#F5A623] text-white rounded-lg hover:bg-[#e6951f]">
              Explore Services
            </button>
            <button className="px-5 py-3 border border-gray-800 text-gray-900 rounded-lg hover:bg-gray-200">
              Book Appointment
            </button>
          </div>
        </div>

        <div className="hidden md:flex relative justify-end items-center w-full h-full">
          <div className="relative flex justify-center items-center w-[520px] h-[520px] absolute right-0">
            {/* Main circle with subtle border */}
            <div className="absolute w-[520px] h-[520px] bg-[#FEE3C4] rounded-full border-4 border-[#FCDCA5]/30"></div>

            {/* Inner decorative circle */}
            <div className="absolute w-[420px] h-[420px] bg-[#FCDCA5]/20 rounded-full"></div>

            {/* Outer glow circle */}
            <div className="absolute w-[560px] h-[560px] bg-[#F7B864]/10 rounded-full blur-xl"></div>

            {/* Pet image with enhanced shadow and positioning */}
            <img
              src={landingpagedog || "/placeholder.svg"}
              alt="Dog"
              className="relative z-10 w-[380px] drop-shadow-2xl hover:scale-105 transition-transform duration-300 ease-in-out"
              style={{
                filter: "drop-shadow(0 25px 50px rgba(245, 166, 35, 0.25))",
              }}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
