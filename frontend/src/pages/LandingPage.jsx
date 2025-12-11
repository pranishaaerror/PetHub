import { useUsers } from "../apis/users/hooks";

export const LandingPage = () => {
  const {data} = useUsers();
  console.log({data})
  return (
<div className="font-sans bg-white text-gray-900">

      {/* NavBar */}
      <nav className="flex justify-between items-center px-10 py-5 bg-black text-white">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          PetHub
        </h1>

        <div className="hidden md:flex gap-8 text-sm">
          <a href="#home" className="hover:text-gray-300">Home</a>
          <a href="#about" className="hover:text-gray-300">About Us</a>
          <a href="#services" className="hover:text-gray-300">Services</a>
          <a href="#health" className="hover:text-gray-300">Pet Health</a>
          <a href="#contact" className="hover:text-gray-300">Contact Us</a>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm">Login</button>
          <button className="px-4 py-2 bg-white text-black rounded-md text-sm hover:bg-gray-100">Sign up</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-10 py-20 grid grid-cols-1 md:grid-cols-2 items-center gap-10">

        {/* Left text */}
        <div>
          <h1 className="text-6xl font-black leading-tight">Your Pet</h1>
          <h2 className="text-4xl font-light mt-2">Our Services</h2>
          <p className="mt-4 text-gray-600 text-lg max-w-md">
            Connecting Pets, People and Love.
          </p>

          <div className="flex gap-4 mt-8">
            <button className="px-5 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700">
              Explore Services
            </button>
            <button className="px-5 py-3 border border-black rounded-lg hover:bg-gray-100">
              Book Appointment
            </button>
          </div>
        </div>

      

      </section>

    </div>
  );

}

