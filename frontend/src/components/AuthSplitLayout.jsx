import { RiSparklingFill } from "react-icons/ri";
import sideImage from "../assets/landingpagedog.png";

export const AuthSplitLayout = ({
  children,
  sideLabel = "PetHub",
  embedded = false,
  /** When embedded, fill parent flex space and allow internal scrolling — prevents form clipping. */
  fitViewport = false,
}) => {
  const outerClass = embedded
    ? "relative flex w-full min-h-0 flex-1 flex-col overflow-hidden text-[#2D2D2D]"
    : "relative h-screen overflow-hidden bg-[#F4EAD9] px-2 py-2 text-[#2D2D2D] sm:px-3 sm:py-3 md:px-4 md:py-4";

  // fitViewport: card fills all remaining flex space — no min/max-h cap that clips content
  // default embedded: card has a bounded height range (original behaviour)
  const cardClass = embedded
    ? fitViewport
      ? "relative mx-auto mb-2 flex w-full flex-1 min-h-0 flex-row overflow-hidden rounded-[28px] bg-white/60 shadow-[0_28px_80px_rgba(45,45,45,0.09)] backdrop-blur-xl sm:mb-2 md:mx-3 md:mb-2"
      : "relative mx-auto mb-3 flex w-full min-h-[min(640px,calc(100dvh-220px))] max-h-[min(900px,calc(100dvh-200px))] flex-1 overflow-hidden rounded-[28px] bg-white/60 shadow-[0_28px_80px_rgba(45,45,45,0.09)] backdrop-blur-xl sm:mb-4 md:mx-4 md:mb-5"
    : "relative mx-auto flex h-full max-w-[1500px] overflow-hidden rounded-[36px] bg-white/60 shadow-[0_28px_80px_rgba(45,45,45,0.09)] backdrop-blur-xl";

  // Form column is always scrollable so content is never clipped regardless of viewport size
  const formColClass = embedded
    ? "relative flex min-h-0 w-full flex-col justify-start overflow-y-auto overscroll-contain px-4 py-6 sm:px-5 md:px-8 lg:w-[55%] lg:px-12 xl:px-16"
    : "relative m-auto flex w-full flex-col justify-center overflow-y-auto px-4 py-6 sm:px-5 md:px-8 lg:w-[45%] lg:px-12 xl:px-16";

  return (
    <div className={outerClass}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,179,71,0.35),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(245,166,35,0.18),_transparent_28%)]" />
      <div className={cardClass}>

        {/* Left decorative panel */}
        <div
          className={`hidden w-[45%] flex-col overflow-hidden bg-[linear-gradient(155deg,#FFE5BF,#F5A623)] lg:flex ${
            fitViewport ? "min-h-0 flex-1 gap-3 p-4 xl:gap-4 xl:p-5" : "gap-6 p-6 xl:p-8"
          }`}
        >
          <div className="flex shrink-0 items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8E5E17]">
                {sideLabel}
              </p>
              <h1
                className={`mt-1 font-bold leading-tight ${
                  fitViewport ? "text-[22px] xl:text-[26px]" : "mt-2 text-[28px]"
                }`}
              >
                Warm care for every wag, purr, and paw.
              </h1>
              <p
                className={`text-[#5c3d0c]/90 ${
                  fitViewport
                    ? "mt-0.5 text-[12px] leading-snug xl:text-[13px]"
                    : "mt-1 text-[13px]"
                }`}
              >
                Book vets, track health records, and connect with your pet's care team — all in one
                place.
              </p>
            </div>
            <div
              className={`flex shrink-0 items-center justify-center rounded-[20px] bg-white/25 text-white shadow-[0_18px_35px_rgba(45,45,45,0.1)] ${
                fitViewport ? "h-10 w-10" : "h-14 w-14"
              }`}
            >
              <RiSparklingFill size={fitViewport ? 20 : 24} />
            </div>
          </div>

          <div
            className={`flex min-h-0 w-full flex-1 items-center justify-center rounded-2xl shadow-lg ${
              fitViewport ? "max-h-none" : "max-h-[70vh]"
            }`}
          >
            <img
              alt="Dog"
              className="max-h-full min-h-0 w-full rounded-2xl object-cover"
              src={sideImage}
            />
          </div>
        </div>

        {/* Right form column — always scrollable */}
        <div className={formColClass}>
          <div className="my-auto py-2">{children}</div>
        </div>
      </div>
    </div>
  );
};
