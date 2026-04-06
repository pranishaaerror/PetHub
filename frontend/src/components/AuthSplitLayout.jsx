import { ShieldCheck, Sparkles, Star } from "lucide-react";

export const AuthSplitLayout = ({
  children,
  sideLabel = "PetHub",
}) => {
  return (
    <div className="h-screen overflow-hidden bg-[#F4EAD9] text-[#2D2D2D]  px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,179,71,0.35),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(245,166,35,0.18),_transparent_28%)]" />
      <div className="relative mx-auto flex h-full max-w-[1500px] overflow-hidden rounded-[36px] bg-white/60 shadow-[0_28px_80px_rgba(45,45,45,0.09)] backdrop-blur-xl ">
        <div className="hidden w-[46%] flex-col overflow-hidden bg-[linear-gradient(155deg,#FFE5BF,#F5A623)] p-6 lg:flex xl:p-8 gap-6">

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8E5E17]">
                {sideLabel}
              </p>
              <h1 className="mt-2 text-[28px] font-bold">Warm care for every wag, purr, and paw.</h1>
              <p className="text-[13px] mt-1">Book vets, track health records, and connect with your pet's care team — all in one place.</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white/25 text-white shadow-[0_18px_35px_rgba(45,45,45,0.1)]">
              <Sparkles className="h-6 w-6" />
            </div>
          </div>
          <div className="flex justify-center items-center w-full max-h-[70vh] rounded-2xl shadow-lg">
            <img alt="Dog" className="w-full h-full object-cover rounded-2xl" src="/src/assets/dog.jpg" />
          </div>
        </div>

        <div className="flex w-full flex-col justify-center px-4 py-6 sm:px-5 md:px-8 lg:w-[45%] lg:px-12 xl:px-16 m-auto relative">
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};
