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

const previewCards = [
  {
    title: "Live adoption",
    detail: "A clean adopt-me showcase built with soft cards that are easy to scan and open.",
    icon: HeartHandshake,
  },
  {
    title: "Care records",
    detail: "Medical notes, reminders, and service history tucked into one calm flow.",
    icon: ShieldCheck,
  },
  {
    title: "Community warmth",
    detail: "Playdates, meetups, and pet-parent support that feels social, not corporate.",
    icon: UsersRound,
  },
];

const quickLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Medical Records", href: "/medical-records" },
  { label: "Service Booking", href: "/service-booking" },
  { label: "Adoption", href: "/adoption" },
  { label: "Community", href: "/community" },
];

const supportLinks = [
  { label: "Login", href: "/login" },
  { label: "Signup", href: "/signup" },
];

export const OldLandingPage = () => {
  const { currentUser } = useAuth();
  const { data: adoptionResponse } = useAdoption();
  const orbitPets = getLandingOrbitPets(adoptionResponse?.data?.pets ?? []);
  const adoptHref = currentUser ? "/adoption" : "/login?redirect=%2Fadoption";
  const signupAdoptHref = currentUser ? "/adoption" : "/signup?redirect=%2Fadoption";

  return (
    <div className="min-h-screen bg-[#F4EAD9] px-2 py-2 text-[#2D2D2D] sm:px-3 sm:py-3 md:px-4 md:py-4">
      <div className="mx-auto max-w-[1500px] rounded-[36px] bg-white/60 p-4 shadow-[0_28px_80px_rgba(45,45,45,0.09)] backdrop-blur-xl md:p-6 lg:p-7">
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
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/login" className="pet-button-secondary">
              Login
            </Link>
            <Link to="/signup" className="pet-button-primary">
              Sign up
            </Link>
          </div>
        </nav>

        <section className="grid gap-8 px-2 py-10 xl:grid-cols-[0.9fr_1.1fr] xl:items-center">
          <div className="pet-rise-in">
            <span className="pet-chip">Warm, modern, premium</span>
            <h1 className="mt-5 max-w-3xl text-5xl font-bold leading-[1.02] md:text-6xl">
              PetHub makes adopting, caring, and staying connected feel beautifully soft.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6B6B6B]">
              The homepage now leads with adoption through clean showcase cards. Open a pet, sign in
              or sign up if needed, and continue straight into the adoption space.
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

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {previewCards.map((card) => (
                <div key={card.title} className="rounded-[28px] bg-[#FFF8EE] p-5 shadow-[0_16px_35px_rgba(45,45,45,0.04)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white text-[#F5A623] shadow-[0_14px_28px_rgba(45,45,45,0.05)]">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-lg font-semibold">{card.title}</p>
                  <p className="mt-2 text-sm leading-7 text-[#6B6B6B]">{card.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pet-rise-in [animation-delay:160ms]">
            <AdoptionOrbitCarousel
              pets={orbitPets}
              chipLabel="Adopt Me"
              title="Keep adopt-me cards visible on the front page."
              description="Each pet appears in a clear box-based showcase. Click one and PetHub will take you into sign in or signup first, then continue to adoption."
              emptyHeading="Adopt-me cards appear here."
              emptyDescription="As soon as adoption profiles are added, the front-page showcase fills automatically."
              getLink={() => "/adoption"}
            />
          </div>
        </section>

        <section className="px-2 py-4">
          <div className="pet-rise-in rounded-[32px] bg-[linear-gradient(145deg,#FFF4E2,#FFFFFF)] p-6 shadow-[0_18px_35px_rgba(45,45,45,0.05)] md:p-8 [animation-delay:260ms]">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-[26px] bg-white/85 p-5 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#B78331]">01</p>
                <h2 className="mt-3 text-2xl font-bold">Open the cards</h2>
                <p className="mt-3 text-sm leading-7 text-[#6B6B6B]">
                  The adopt-me cards stay visible on the homepage and act as the main entry to adoption.
                </p>
              </div>
              <div className="rounded-[26px] bg-white/85 p-5 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#B78331]">02</p>
                <h2 className="mt-3 text-2xl font-bold">Sign in or sign up</h2>
                <p className="mt-3 text-sm leading-7 text-[#6B6B6B]">
                  If you are not logged in, PetHub now keeps your destination and sends you back to adoption after auth.
                </p>
              </div>
              <div className="rounded-[26px] bg-white/85 p-5 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#B78331]">03</p>
                <h2 className="mt-3 text-2xl font-bold">Continue the story</h2>
                <p className="mt-3 text-sm leading-7 text-[#6B6B6B]">
                  Move straight into the adopt-me page and explore the gallery, filters, and pet details.
                </p>
              </div>
            </div>
          </div>
        </section>

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
        </footer>
      </div>
    </div>
  );
};
