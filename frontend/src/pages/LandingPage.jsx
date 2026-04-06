import {
    ArrowRight,
    CalendarHeart,
    HeartHandshake,
    PawPrint,
    ShieldCheck,
    UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AdoptionOrbitCarousel } from "../components/AdoptionOrbitCarousel";
import { useAuth } from "../context/AuthContext";
import { useAdoption } from "../apis/adoption/hooks";
import { getLandingOrbitPets } from "../utils/adoptionPets";
import LandingPageDog from "../assets/landingpagedog.png";
import Header from "./Header";
import Footer from "./Footer";

const features = [
    {
        title: "Live Adoption",
        detail: "Browse hundreds of verified pets with real-time availability. Connect directly with shelters and foster families.",
        icon: '🏡',
    },
    {
        title: "Medical Records",
        detail: "Keep all vaccinations, checkups, and vet history organized in one secure, always-accessible place.",
        icon: '📋',
    },
    {
        title: "Service Booking",
        detail: "Schedule grooming, training, vet visits, and boarding with trusted local providers in seconds.",
        icon: '✂️',
    },
    {
        title: "Community Warmth",
        detail: "Join playdates, share tips, find pet-parents in your area, and celebrate milestones together.",
        icon: '🤝',
    },
    {
        title: "Smart Dashboard",
        detail: "At-a-glance view of upcoming appointments, due vaccinations, and your pet's recent activity.",
        icon: '📊',
    },
    {
        title: "Reminders & Alerts",
        detail: "Never miss a flea treatment or annual checkup. Customizable reminders keep your pet on schedule.",
        icon: '🔔',
    },
];


export const LandingPage = () => {
    const { currentUser } = useAuth();
    const { data: adoptionResponse } = useAdoption();
    const orbitPets = getLandingOrbitPets(adoptionResponse?.data?.pets ?? []);
    const adoptHref = currentUser ? "/adoption" : "/login?redirect=%2Fadoption";
    const signupAdoptHref = currentUser ? "/adoption" : "/signup?redirect=%2Fadoption";

    return (
        <div className="min-h-screen bg-[#F4EAD9] px-2 py-2 text-[#2D2D2D] sm:px-3 sm:py-3 md:px-4 md:py-4">
            <div className="mx-auto max-w-[1500px] rounded-[36px] bg-white/60 shadow-[0_28px_80px_rgba(45,45,45,0.09)] backdrop-blur-xl ">
              
                <Header />
                <section className="px-4 md:px-6 lg:px-7 py-20" id="home">
                    <div className="pet-rise-in flex">
                        <div>
                            <span className="pet-chip">🐾 Warm, modern, premium</span>
                            <h1 className="mt-5 max-w-[900px] text-5xl font-bold leading-[1.02] md:text-5xl">
                                Every pet deserves a <span className="text-[#FFB347]">loving</span> home & perfect care.
                            </h1>
                            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6B6B6B]">
                                PetHub brings together adoption, medical records, grooming bookings, and a warm community — all in one beautifully simple platform.
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
                        <div className="w-[380px]">
                            <img src={LandingPageDog} alt="Dog" className="w-full" />
                        </div>
                    </div>
                </section>

                <section className="px-4 md:px-6 lg:px-7 py-20 bg-white" id="features">
                    <div className="my-0 mx-auto">
                        <div className="text-[11px] font-semibold uppercase mb-[12px] text-[#E8920A]">Everything in one place</div>
                        <h2 className="text-[38px] font-[800] mb-4">Built for pet parents who care deeply</h2>
                        <p className="text-[16px] max-w-[560px]">From finding your next companion to tracking their health journey — PetHub has you covered every step of the way.</p>
                        <div className="grid grid-cols-3 gap-4 mt-[48px]">
                            {features.map((item) => (
                                <div className="bg-[#FAF6F0] p-[28px] border border-[#E8E2D9] rounded-[14px]" >
                                    <div className="w-[48px] h-[48px] bg-[#FEF3DC] rounded-full flex items-center justify-center text-[22px] mb-[16px]">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-[18px] font-[700] mb-2">{item.title}</h3>
                                    <p className="text-[14px] text-[#78716C]">{item.detail}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="px-4 md:px-6 lg:px-7 py-20" id="how-it-works">
                    <div className="text-[11px] font-semibold uppercase mb-[12px] text-[#E8920A]">How it works</div>
                    <h2 className="text-[38px] font-[800] mb-4">Three steps to a better pet life</h2>
                    <div className="grid grid-cols-3 gap-8 mt-[48px]">
                        <div className="relative">
                            <div className="text-[13px] text-[#A8A29E] mb-[12px]">01</div>
                            <h3 className="text-[20px] font-[700] mb-[10px]">Create your profile</h3>
                            <p className="text-[14px] text-[#78716C]">Sign up free and add your pets. Import existing records or start fresh — it takes under two minutes.</p>
                        </div>
                        <div className="relative">
                            <div className="text-[13px] text-[#A8A29E] mb-[12px]">02</div>
                            <h3 className="text-[20px] font-[700] mb-[10px]">Discover & book</h3>
                            <p className="text-[14px] text-[#78716C]">Browse adoptable pets, book services, track health records, and connect with your local pet community.</p>
                        </div>
                        <div className="relative">
                            <div className="text-[13px] text-[#A8A29E] mb-[12px]">03</div>
                            <h3 className="text-[20px] font-[700] mb-[10px]">Stay connected</h3>
                            <p className="text-[14px] text-[#78716C]">Get reminders, share moments, join events, and be part of a community that loves pets as much as you do.</p>
                        </div>
                    </div>
                    <div className="mt-[48px] text-center">
                        <Link key="/signup" to="/signup" className="px-12 py-3 text-[15px] font-semibold text-white bg-[#E8920A] cursor-pointer border border-transparent rounded-full">
                            Get Started for Free →
                        </Link>
                    </div>
                </section>

                <Footer />
            </div>
        </div>
    );
};
