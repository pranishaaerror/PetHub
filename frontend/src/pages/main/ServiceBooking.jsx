import React, { useEffect, useState } from 'react'
import { listServices } from '../../apis/services/apis';
import { Clock } from 'lucide-react';
import Header from '../Header';
import Footer from '../Footer';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';

const ServiceBooking = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    useEffect(() => {
        listServices()
            .then((res) => {
                setServices(res.data);
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);

    const handleServiceBook = (serviceId) => {
       const token = localStorage.getItem("userToken");

        if (!token) {
            navigate("/login");
        } else {
            navigate(`/service-booking`);
        }
    }


    return (
       <div className="min-h-screen bg-[#F4EAD9] px-2 py-2 text-[#2D2D2D] sm:px-3 sm:py-3 md:px-4 md:py-4">
    <div className="mx-auto max-w-[1500px] rounded-[36px] bg-white/60 shadow-[0_28px_80px_rgba(45,45,45,0.09)] backdrop-blur-xl">
        <Header />
        <div className="bg-[#FAF6F0] text-[#1C1917]">
            <section className="bg-[#2C2520] px-4 md:px-6 lg:px-7 py-20">
                <div className="pet-rise-in">
                    <div className="text-[11px] font-semibold tracking-[2px] uppercase text-[#E8920A] mb-3">
                        Premium Services
                    </div>

                    <h1 className="text-[44px] font-extrabold mb-3 leading-tight text-white">
                        Book the best care <br /> for your companion.
                    </h1>

                    <p className="text-[17px] text-white/70 max-w-[500px]">
                        Grooming, vet visits, vaccination, boarding, and more — all bookable in under 60 seconds.
                    </p>
                </div>
            </section>
                    <div className=" px-4 md:px-6 lg:px-7 py-20">

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {services.map((service) => (

                                <div key={service._id} className="bg-white rounded-xl border border-[#E8E2D9] overflow-hidden hover:shadow-lg hover:-translate-y-1 transition">

                                    <div className="p-5">

                                        <h3 className="text-lg font-bold mt-2">
                                            {service.serviceName}
                                        </h3>

                                        <p className="text-sm text-[#78716C] mt-1 line-clamp-1">
                                            {service.description}
                                        </p>

                                        <div className="flex justify-between items-center mt-4">
                                            <div>
                                                <div className="text-xl font-bold text-[#E8920A]">
                                                    NPR {service.price} <span className="text-sm text-[#78716C]">/ session</span>
                                                </div>
                                                <div className="text-xs text-[#78716C] flex items-center gap-1">
                                                    <Clock size={12} />
                                                    <span>{service.durationMinutes} minutes</span>
                                                </div>
                                            </div>

                                            <Button className="bg-[#E8920A] hover:bg-[#C4780A] text-white px-4 py-2  text-sm font-semibold" onClick={() => handleServiceBook(service._id)}>
                                                Book Now
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
    );
};

export default ServiceBooking