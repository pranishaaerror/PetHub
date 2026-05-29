import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LandingPageDog from "../assets/landingpagedog.png";
import Header from "./Header";
import Footer from "./Footer";
import { FaHouse, FaFileMedical, FaCalendarCheck, FaPeopleGroup } from "react-icons/fa6";
import { MdDashboardCustomize } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";

const features = [
    {
        title: "Live Adoption",
        detail: "Browse hundreds of verified pets with real-time availability. Connect directly with shelters and foster families.",
        icon: <FaHouse size={22} color="#E8920A" />,
    },
    {
        title: "Medical Records",
        detail: "Keep all vaccinations, checkups, and vet history organized in one secure, always-accessible place.",
        icon: <FaFileMedical size={22} color="#E8920A" />,
    },
    {
        title: "Service Booking",
        detail: "Schedule grooming, training, vet visits, and boarding with trusted local providers in seconds.",
        icon: <FaCalendarCheck size={22} color="#E8920A" />,
    },
    {
        title: "Community Warmth",
        detail: "Join playdates, share tips, find pet-parents in your area, and celebrate milestones together.",
        icon: <FaPeopleGroup size={22} color="#E8920A" />,
    },
    {
        title: "Smart Dashboard",
        detail: "At-a-glance view of upcoming appointments, due vaccinations, and your pet's recent activity.",
        icon: <MdDashboardCustomize size={22} color="#E8920A" />,
    },
    {
        title: "Reminders & Alerts",
        detail: "Never miss a flea treatment or annual checkup. Customizable reminders keep your pet on schedule.",
        icon: <IoNotifications size={22} color="#E8920A" />,
    },
];


export const LandingPage = () => {
    const { currentUser } = useAuth();
    const adoptHref = currentUser ? "/dashboard/adoption" : "/login?redirect=%2Fdashboard%2Fadoption";
    const signupAdoptHref = currentUser ? "/dashboard/adoption" : "/signup?redirect=%2Fdashboard%2Fadoption";

    return (
        <div className="min-h-screen bg-[#F4EAD9] px-2 py-2 text-[#2D2D2D] sm:px-3 sm:py-3 md:px-4 md:py-4">
            <div className="mx-auto max-w-[1500px] rounded-[36px] bg-white/60 shadow-[0_28px_80px_rgba(45,45,45,0.09)] backdrop-blur-xl">

                <Header />

                {/* Hero Section */}
                <section className="px-6 py-20 md:px-12 lg:px-16" id="home">
                    <div className="pet-rise-in flex items-center gap-8">
                        <div className="flex-1">
                            <span className="pet-chip">🐾 Warm, modern, premium</span>
                            <h1 className="mt-5 max-w-[900px] text-5xl font-bold leading-[1.02] md:text-5xl">
                                Every pet deserves a{" "}
                                <span className="text-[#FFB347]">loving</span>{" "}
                                home & perfect care.
                            </h1>
                            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6B6B6B]">
                                PetHub brings together adoption, medical records, grooming
                                bookings, and a warm community — all in one beautifully
                                simple platform.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-4">
                                <Link to={adoptHref} className="pet-button-primary gap-2">
                                    Adopt me
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link to={signupAdoptHref} className="pet-button-secondary gap-2">
                                    Sign up to adopt
                                    <ArrowRight className="h-4 w-4 text-[#F5A623]" />
                                </Link>
                            </div>
                        </div>

                        <div className="w-[380px] shrink-0">
                            <img
                                src={LandingPageDog}
                                alt="Dog"
                                className="w-full"
                            />
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="px-6 py-20 md:px-12 lg:px-16 bg-white" id="features">
                    <div>
                        <p className="text-[11px] font-semibold uppercase mb-3 text-[#E8920A] tracking-wide">
                            Everything in one place
                        </p>
                        <h2 className="text-[38px] font-extrabold mb-4">
                            Built for pet parents who care deeply
                        </h2>
                        <p className="text-base max-w-[560px] text-[#6B6B6B] leading-7">
                            From finding your next companion to tracking their health
                            journey — PetHub has you covered every step of the way.
                        </p>

                        <div className="grid grid-cols-3 gap-4 mt-12">
                            {features.map((item) => (
                                <div
                                    key={item.title}
                                    className="bg-[#FAF6F0] p-7 border border-[#E8E2D9] rounded-2xl"
                                >
                                    <div className="w-12 h-12 bg-[#FEF3DC] rounded-full flex items-center justify-center mb-4">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                    <p className="text-sm text-[#78716C] leading-6">
                                        {item.detail}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="px-6 py-20 md:px-12 lg:px-16" id="how-it-works">
                    <p className="text-[11px] font-semibold uppercase mb-3 text-[#E8920A] tracking-wide">
                        How it works
                    </p>
                    <h2 className="text-[38px] font-extrabold mb-4">
                        Three steps to a better pet life
                    </h2>

                    <div className="grid grid-cols-3 gap-8 mt-12">
                        <div>
                            <p className="text-sm text-[#A8A29E] mb-3 font-medium">01</p>
                            <h3 className="text-xl font-bold mb-2">Create your profile</h3>
                            <p className="text-sm text-[#78716C] leading-6">
                                Sign up free and add your pets. Import existing records or
                                start fresh — it takes under two minutes.
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-[#A8A29E] mb-3 font-medium">02</p>
                            <h3 className="text-xl font-bold mb-2">Discover & book</h3>
                            <p className="text-sm text-[#78716C] leading-6">
                                Browse adoptable pets, book services, track health records,
                                and connect with your local pet community.
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-[#A8A29E] mb-3 font-medium">03</p>
                            <h3 className="text-xl font-bold mb-2">Stay connected</h3>
                            <p className="text-sm text-[#78716C] leading-6">
                                Get reminders, share moments, join events, and be part of a
                                community that loves pets as much as you do.
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <Link
                            to="/signup"
                            className="inline-block px-12 py-3 text-[15px] font-semibold text-white bg-[#E8920A] rounded-full border border-transparent hover:bg-[#D4820A] transition-colors"
                        >
                            Get Started for Free →
                        </Link>
                    </div>
                </section>

                <Footer />
            </div>
        </div>
    );
};