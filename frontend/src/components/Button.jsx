import React from "react";

export const Button = ({ children,  onClick, icon, className = "", type = "button", disabled = false }) => {

   
   return( <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-5 py-3 text-[14px] font-semibold text-white bg-[#E8920A] border rounded-full hover:bg-[#d67f09] transition cursor-pointer ${className}`}
    >
      {children}
      {icon && <span>{icon}</span>}
    </button>)
 
};

