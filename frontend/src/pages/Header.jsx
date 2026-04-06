import { PawPrint } from 'lucide-react';
import React from 'react'
import { Link } from 'react-router-dom';

const Header = () => {
    const token = localStorage.getItem("userToken");
    const quickLinks = [
        { label: "Home", href: "/" },
        { label: "Service Booking", href: "/service-booking" },
        { label: "Adoption", href: "/adoption" },
        { label: "Community", href: "/community" },
    ];
    return (
        <div className="p-4 md:p-6 lg:p-7">
            <nav className="glass-surface flex flex-col gap-4 rounded-[28px] px-5 py-4 shadow-[0_18px_45px_rgba(45,45,45,0.06)] md:flex-row md:items-center md:justify-between">
                <Link to="/" className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#F5A623,#FFB347)] text-white shadow-[0_18px_35px_rgba(245,166,35,0.28)]">
                        <PawPrint className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#B78331]">PetHub</p>
                        <p className="text-lg font-bold">Premium Pet Care Platform</p>
                    </div>
                </Link>

                <div className="hidden items-center gap-6 text-sm font-semibold text-[#6B6B6B] lg:flex">
                    {quickLinks.map((item) => (
                        <Link key={item.href} to={item.href}>
                            {item.label}
                        </Link>))}
                </div>

                <div className="flex flex-wrap gap-3">
                    {!token ? (
                        <>
                            <Link to="/login" className="pet-button-secondary">
                                Login
                            </Link>
                            <Link to="/signup" className="pet-button-primary">
                                Sign up
                            </Link>
                        </>
                    ) : (
                        <Link to="/dashboard" className="pet-button-primary">
                            Dashboard
                        </Link>
                    )}
                </div>
            </nav>
        </div>
    )
}

export default Header