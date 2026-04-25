import { useEffect, useState } from 'react'
import Footer from '../Footer'
import Header from '../Header'
import { listAdoption } from '../../apis/adoption/apis';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ArrowRight, Sparkles, Shield, Clock, Star } from 'lucide-react';

const Adoption = () => {
  const navigate = useNavigate();
  const [adoptionPets, setAdoptionPets] = useState([]);

  useEffect(() => {
    listAdoption()
      .then((res) => {
        setAdoptionPets(res.data?.pets);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleAdoption = (petId) => {
    const token = localStorage.getItem("userToken");
    const target = `/dashboard/adoption/${petId}`;
    if (!token) {
      navigate(`/login?redirect=${encodeURIComponent(target)}`);
    } else {
      navigate(target);
    }
  };

  const ageLabel = (age) => {
    if (!age && age !== 0) return "Unknown";
    const num = parseFloat(age);
    if (num < 1) return `${Math.round(num * 12)} mo`;
    if (num === 1) return `1 yr`;
    return `${num} yrs`;
  };

  return (
    <div className="min-h-screen bg-[#F4EAD9] px-2 py-2 text-[#2D2D2D] sm:px-3 sm:py-3 md:px-4 md:py-4">
      <style>{`
        .adopt-root { font-family: inherit; }
        .adopt-serif { font-family: inherit; }

        .pet-card {
          background: #fff;
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .pet-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.12);
        }

        .pet-img-wrap {
          position: relative;
          overflow: hidden;
          height: 220px;
        }
        .pet-img-wrap img, .pet-img-wrap .pet-emoji-bg {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        .pet-card:hover .pet-img-wrap img { transform: scale(1.06); }

        .adopt-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #F5A623, #FF8C00);
          color: white;
          font-weight: 600;
          font-size: 13px;
          padding: 10px 18px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 8px 20px rgba(245,166,35,0.3);
        }
        .adopt-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 28px rgba(245,166,35,0.4);
        }

        .profile-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #F7F3ED;
          color: #5B4A36;
          font-weight: 600;
          font-size: 13px;
          padding: 10px 18px;
          border-radius: 14px;
          border: 1px solid #E8DDD0;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
        }
        .profile-btn:hover {
          background: #EDE3D6;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 100px;
        }

        .trust-card {
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(255,255,255,0.5);
          border-radius: 20px;
          padding: 20px;
          backdrop-filter: blur(10px);
          transition: background 0.2s;
        }
        .trust-card:hover { background: rgba(255,255,255,0.9); }

        .hero-stat {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 16px;
          padding: 16px 20px;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .float { animation: float 4s ease-in-out infinite; }
        .float-delay { animation: float 4s ease-in-out 1.5s infinite; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.6s ease both; }
        .fade-up-1 { animation-delay: 0.1s; }
        .fade-up-2 { animation-delay: 0.22s; }
        .fade-up-3 { animation-delay: 0.34s; }
        .fade-up-4 { animation-delay: 0.46s; }
      `}</style>

      <div className="adopt-root mx-auto max-w-[1500px] rounded-[36px] bg-white/60 shadow-[0_28px_80px_rgba(45,45,45,0.09)] backdrop-blur-xl overflow-hidden">
        <Header />

        {/* ── HERO ── */}
        <div
          className="relative overflow-hidden px-6 py-20 md:px-12 lg:px-16"
          style={{ background: "linear-gradient(135deg, #1A1614 0%, #2D2218 50%, #1A1A2E 100%)" }}
        >
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-20 float"
            style={{ background: "radial-gradient(circle, #F5A623, transparent 70%)" }} />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-56 w-56 rounded-full opacity-10 float-delay"
            style={{ background: "radial-gradient(circle, #FF8C00, transparent 70%)" }} />

          <div className="relative z-10 max-w-4xl">
            <div className="fade-up fade-up-1 mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-700 uppercase tracking-widest text-amber-400">
              <Sparkles className="h-3.5 w-3.5" />
              Find Your Companion
            </div>

            <h1 className="adopt-serif fade-up fade-up-2 text-4xl font-800 leading-[1.15] text-white sm:text-5xl lg:text-6xl">
              Every pet deserves<br />
              <span className="text-amber-400">a loving home.</span>
            </h1>

            <p className="fade-up fade-up-3 mt-5 max-w-lg text-base leading-relaxed text-white/60">
              Thousands of wonderful companions are waiting to meet their forever family. Find your perfect match today.
            </p>

            <div className="fade-up fade-up-4 mt-10 flex flex-wrap gap-4">
              <div className="hero-stat text-center">
                <p className="adopt-serif text-3xl font-700 text-amber-400">{adoptionPets.length}+</p>
                <p className="mt-1 text-xs text-white/50 uppercase tracking-widest">Pets Available</p>
              </div>
              <div className="hero-stat text-center">
                <p className="adopt-serif text-3xl font-700 text-amber-400">
                  {adoptionPets.filter(p => p.status === 'Available').length}
                </p>
                <p className="mt-1 text-xs text-white/50 uppercase tracking-widest">Ready to Adopt</p>
              </div>
              <div className="hero-stat text-center">
                <p className="adopt-serif text-3xl font-700 text-amber-400">
                  {adoptionPets.filter(p => p.status === 'Adopted').length}
                </p>
                <p className="mt-1 text-xs text-white/50 uppercase tracking-widest">Found Homes</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── TRUST STRIP ── */}
        <div className="bg-[#FAF6F0] px-6 py-8 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: Shield, color: "#43A047", bg: "#E8F5E9", title: "Vet Verified", body: "All pets are health-checked and vaccinated before listing." },
              { icon: Heart, color: "#E53935", bg: "#FFEBEE", title: "Ethical Adoption", body: "We partner only with trusted shelters and rescue organizations." },
              { icon: Clock, color: "#F5A623", bg: "#FFF8E1", title: "Quick Process", body: "Complete your adoption application in under 10 minutes." },
            ].map(({ icon: Icon, color, bg, title, body }) => (
              <div key={title} className="trust-card flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: bg }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <div>
                  <p className="text-sm font-700 text-[#1A1A1A]">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#7B7B7B]">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PET GRID ── */}
        <div className="bg-[#FAF6F0] px-6 pb-20 md:px-12 lg:px-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-700 uppercase tracking-[0.2em] text-amber-600">Available Now</p>
              <h2 className="adopt-serif mt-1 text-3xl font-700 text-[#1A1A1A] sm:text-4xl">Meet Your Match</h2>
            </div>
            <p className="hidden text-sm text-[#9B9B9B] sm:block">{adoptionPets.length} pets looking for a home</p>
          </div>

          {adoptionPets.length === 0 ? (
            <div className="py-24 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-4xl">🐾</div>
              <p className="text-lg font-600 text-[#5B5B5B]">No pets available right now</p>
              <p className="mt-1 text-sm text-[#9B9B9B]">Check back soon — new companions are added regularly.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {adoptionPets.map((pet, i) => (
                <div
                  key={pet._id}
                  className="pet-card"
                >
                  {/* Image */}
                  <div className="pet-img-wrap">
                    {pet.imageGallery?.[0] ? (
                      <img src={pet.imageGallery[0]} alt={pet.petName} />
                    ) : (
                      <div
                        className="pet-emoji-bg flex items-center justify-center text-6xl"
                        style={{ background: "linear-gradient(135deg, #FFF3E0, #FFB74D)" }}
                      >
                        🐕
                      </div>
                    )}

                    {/* Overlay badges */}
                    <div className="absolute left-3 top-3">
                      <span className="badge" style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}>
                        {pet.species || "Dog"}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <span
                        className="badge w-full justify-center"
                        style={{
                          background: pet.healthStatus === "Healthy" ? "rgba(67,160,71,0.88)" : "rgba(245,166,35,0.88)",
                          color: "#fff",
                        }}
                      >
                        <Star className="h-2.5 w-2.5 shrink-0" />
                        {pet.healthStatus}
                      </span>
                    </div>

                    {/* Gradient fade at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-16"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.35), transparent)" }} />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="adopt-serif text-xl font-700 text-[#1A1A1A]">{pet.petName}</h3>
                        <p className="mt-0.5 text-xs text-[#9B8A78]">{pet.breed}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="badge" style={{ background: "#FFF0D6", color: "#B77A1A" }}>
                          {ageLabel(pet.age)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="badge" style={{ background: "#F0F0F0", color: "#5B5B5B" }}>{pet.gender}</span>
                      {pet.size && (
                        <span className="badge" style={{ background: "#F0F0F0", color: "#5B5B5B" }}>{pet.size}</span>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link to={`/dashboard/adoption/${pet._id}`} className="profile-btn flex-1 justify-center">
                        Profile
                      </Link>
                      <button
                        className="adopt-btn flex-1 justify-center"
                        onClick={() => handleAdoption(pet._id)}
                      >
                        Adopt <Heart className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── CTA BANNER ── */}
        <div
          className="mx-6 mb-10 overflow-hidden rounded-[28px] px-8 py-12 md:mx-12 md:px-12 lg:mx-16"
          style={{ background: "linear-gradient(135deg, #F5A623 0%, #FF8C00 100%)" }}
        >
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
            <div>
              <p className="text-[11px] font-700 uppercase tracking-widest text-white/70">List a pet</p>
              <h3 className="adopt-serif mt-1 text-2xl font-700 text-white sm:text-3xl">
                Have a pet that needs a home?
              </h3>
              <p className="mt-2 max-w-md text-sm text-white/75">
                Partner with PetHub to help your rescue or shelter reach thousands of loving families.
              </p>
            </div>
            <Link
              to="/dashboard/adoption/new"
              className="inline-flex shrink-0 items-center gap-2 rounded-[14px] bg-white px-6 py-3 text-sm font-700 text-amber-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Adoption;
