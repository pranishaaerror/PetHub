import React, { useEffect, useState } from 'react'
import Footer from '../Footer'
import Header from '../Header'
import { listAdoption } from '../../apis/adoption/apis';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';

const Adoption = () => {
        const navigate = useNavigate();

    const [adoptionPets, setAdoptionPets] = useState([]);
    useEffect(() => {
        listAdoption()
            .then((res) => {
                console.log(res)
                setAdoptionPets(res.data?.pets);
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);

    const handleAdoption = (petId) => {
        const token = localStorage.getItem("userToken"); 
        if (!token) {
            navigate("/login");
        } else {
            navigate(`/adoption`);
        }
    }


    return (
        <div className="min-h-screen bg-[#F4EAD9] px-2 py-2 text-[#2D2D2D] sm:px-3 sm:py-3 md:px-4 md:py-4">
            <div className="mx-auto max-w-[1500px] rounded-[36px] bg-white/60 shadow-[0_28px_80px_rgba(45,45,45,0.09)] backdrop-blur-xl ">
                <Header />
                <div className="bg-[#FAF6F0] text-[#1C1917]">
                    <div className="bg-gradient-to-br from-[#1C1917] to-[#2C2520] text-white px-4 md:px-6 lg:px-7 py-20">
                        <div>
                            <div className="text-[11px] font-semibold tracking-[2px] uppercase text-[#E8920A] mb-3">
                                Find Your Companion
                            </div>

                            <h1 className="text-[44px] font-extrabold mb-3 leading-tight">
                                Give your pet the care <br /> they deserve.
                            </h1>

                            <p className="text-[17px] text-white/70 max-w-[500px]">
                                Thousands of pets are waiting to meet their loving forever family.
                            </p>
                        </div>
                    </div>
                    <div className=" px-4 md:px-6 lg:px-40 py-20">

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {adoptionPets.map((pet) => (
                                <div key={pet._id} className="bg-white rounded-xl border border-[#D3D3D3] hover:shadow-lg transition">
                                    {pet.imageGallery?.[0] ? (
                                        <img src={pet.imageGallery[0]} alt={pet.petName} className="h-48 w-full object-cover" />
                                    ) : (
                                        <div className="rounded-t-xl h-48 flex items-center justify-center text-6xl bg-gradient-to-br from-amber-100 to-amber-400 relative">
                                            🐕
                                        </div>
                                    )}
                                    <div className="p-4">

                                        <h2 className="text-xl font-bold">{pet.petName}</h2>
                                        <p className="text-sm text-gray-500 mb-3">
                                            {pet.breed} · {pet.age} years · {pet.gender} . {pet.size}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className="text-xs border px-2 py-1 rounded-full">{pet.healthStatus}</span>
                                        </div>

                                        <div className="flex gap-4 items-center justify-center">
                                            <Button className="w-full bg-stone-500 text-white py-2  hover:bg-stone-600 transition">
                                                Open Profile
                                            </Button>
                                            <Button className="w-full bg-amber-500 text-white py-2  hover:bg-amber-600 transition" onClick={() => handleAdoption(pet._id)}>
                                                Adopt
                                            </Button>
                                        </div>

                                    </div>
                                </div>
                            ))}

                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    )
}

export default Adoption