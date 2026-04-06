import { CalendarHeart, PawPrint } from 'lucide-react';
import React from 'react'
import { Link } from 'react-router-dom';

const Footer = () => {
    const quickLinks = [
        { label: "Home", href: "/" },
        { label: "Service Booking", href: "/service-booking" },
        { label: "Adoption", href: "/adoption" },
        { label: "Community", href: "/community" },
    ];

    const supportLinks = [
        { label: "Login", href: "/login" },
        { label: "Signup", href: "/signup" },
    ];
    return (
        <div className="px-4 md:px-6 lg:px-7 py-5">
            <footer className="pet-rise-in mt-8 rounded-[32px] bg-[#2D2D2D] px-6 py-8 text-white shadow-[0_22px_50px_rgba(45,45,45,0.16)] [animation-delay:340ms] md:px-8">
                <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#F5A623,#FFB347)] text-white">
                                <PawPrint className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#FFD48C]">PetHub</p>
                                <p className="text-xl font-bold">Adopt. Care. Belong.</p>
                            </div>
                        </div>
                        <p className="mt-4 max-w-xl text-sm leading-7 text-white/75">
                            A warmer pet care platform for adoption, medical records, service booking, and community moments.
                        </p>
                    </div>

                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#FFD48C]">Explore</p>
                        <div className="mt-4 flex flex-col gap-3 text-sm text-white/80">
                            {quickLinks.map((item) => (
                                <Link key={item.href} to={item.href} className="transition-colors hover:text-white">
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#FFD48C]">Access</p>
                        <div className="mt-4 flex flex-col gap-3 text-sm text-white/80">
                            {supportLinks.map((item) => (
                                <Link key={item.href} to={item.href} className="transition-colors hover:text-white">
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-[#FFD48C]">
                            <CalendarHeart className="h-4 w-4" />
                            Adoption-first landing experience
                        </div>
                    </div>
                </div>
                <div className="text-[14px] text-center border-t border-white mt-8">
                    <p className="mt-2">Copyright © {new Date().getFullYear()} PetHub. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    )
}

export default Footer