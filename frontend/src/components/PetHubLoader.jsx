import { useId } from "react";

const flowerPath =
  "M63,37c-6.7-4-4-27-13-27s-6.3,23-13,27-27,4-27,13,20.3,9,27,13,4,27,13,27,6.3-23,13-27,27-4,27-13-20.3-9-27-13Z";

const LoaderFlower = ({ idPrefix, className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-hidden="true">
    <defs>
      <filter id={`${idPrefix}-shine`}>
        <feGaussianBlur stdDeviation="3" />
      </filter>
      <mask id={`${idPrefix}-mask`}>
        <path d={flowerPath} fill="white" />
      </mask>
      <radialGradient
        id={`${idPrefix}-gradient-1`}
        cx="50"
        cy="66"
        fx="50"
        fy="66"
        r="30"
        gradientTransform="translate(0 35) scale(1 0.5)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="black" stopOpacity="0.3" />
        <stop offset="50%" stopColor="black" stopOpacity="0.1" />
        <stop offset="100%" stopColor="black" stopOpacity="0" />
      </radialGradient>
      <radialGradient
        id={`${idPrefix}-gradient-2`}
        cx="55"
        cy="20"
        fx="55"
        fy="20"
        r="30"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="white" stopOpacity="0.3" />
        <stop offset="50%" stopColor="white" stopOpacity="0.1" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${idPrefix}-gradient-3`} cx="85" cy="50" fx="85" fy="50" href={`#${idPrefix}-gradient-2`} />
      <radialGradient
        id={`${idPrefix}-gradient-4`}
        cx="50"
        cy="58"
        fx="50"
        fy="58"
        r="60"
        gradientTransform="translate(0 47) scale(1 0.2)"
        href={`#${idPrefix}-gradient-3`}
      />
      <linearGradient id={`${idPrefix}-gradient-5`} x1="50" y1="90" x2="50" y2="10" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="black" stopOpacity="0.2" />
        <stop offset="40%" stopColor="black" stopOpacity="0" />
      </linearGradient>
    </defs>
    <g>
      <path d={flowerPath} fill="currentColor" />
      <path d={flowerPath} fill={`url(#${idPrefix}-gradient-1)`} />
      <path
        d={flowerPath}
        fill="none"
        stroke="white"
        opacity="0.32"
        strokeWidth="3"
        filter={`url(#${idPrefix}-shine)`}
        mask={`url(#${idPrefix}-mask)`}
      />
      <path d={flowerPath} fill={`url(#${idPrefix}-gradient-2)`} />
      <path d={flowerPath} fill={`url(#${idPrefix}-gradient-3)`} />
      <path d={flowerPath} fill={`url(#${idPrefix}-gradient-4)`} />
      <path d={flowerPath} fill={`url(#${idPrefix}-gradient-5)`} />
    </g>
  </svg>
);

export const PetHubLoader = ({
  message = "Preparing PetHub...",
  title = "Loading",
  fullScreen = false,
}) => {
  const id = useId().replace(/:/g, "");

  const content = (
    <div className="pet-card flex w-full max-w-[420px] flex-col items-center gap-5 p-8 text-center shadow-[0_24px_60px_rgba(45,45,45,0.08)]">
      <div className="pethub-loader" aria-hidden="true">
        <LoaderFlower idPrefix={`${id}-one`} className="pethub-loader__flower pethub-loader__flower--one" />
        <LoaderFlower idPrefix={`${id}-two`} className="pethub-loader__flower pethub-loader__flower--two" />
        <LoaderFlower idPrefix={`${id}-three`} className="pethub-loader__flower pethub-loader__flower--three" />
      </div>
      <div>
        <span className="pet-chip">PetHub</span>
        <h2 className="mt-4 text-2xl font-bold text-[#2D2D2D]">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-[#6B6B6B]">{message}</p>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-[#F4EAD9] px-4 py-4 text-[#2D2D2D]">
        <div className="mx-auto flex min-h-[88vh] max-w-[1500px] items-center justify-center rounded-[36px] bg-white/60 p-6 shadow-[0_28px_80px_rgba(45,45,45,0.09)] backdrop-blur-xl">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="pet-page">
      <div className="flex justify-center">{content}</div>
    </div>
  );
};
