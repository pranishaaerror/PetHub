import { Link } from 'react-router-dom';
import signupdog from '../assets/dogsignup.jpg'
import { useSignup } from '../apis/auth/hooks';
import { useState } from 'react';

export const SignupPage = () => {
    const {mutate,isPending} = useSignup()
    const [name,setName] = useState("")
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
  
  return (
    <div className="w-full h-screen overflow-hidden flex bg-[#FFF7EB] font-sans">

      {/* LEFT SECTION */}
      <div className="w-1/2 relative flex flex-col justify-center items-center rounded-r-3xl p-10 bg-gradient-to-br from-[#FCDCA5] to-[#F7B864]">
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Welcome to PetHub
        </h1>
        <p className="text-gray-800 mb-6 text-center">
          For a better experience with your pets - join us today!
        </p>

        <div className="w-3/4 max-h-[70%] flex justify-center items-center shadow-lg rounded-2xl overflow-hidden">
          <img 
            src={signupdog} 
            alt="Dog" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="w-1/2 flex flex-col items-center justify-center px-14">

        <h2 className="text-3xl font-bold mb-6 text-gray-900">Sign Up</h2>

        {/* Form */}
        <form onSubmit={(e) => {
          e.preventDefault()
          mutate({
            name,
            email,
            password
          })
           }}className="w-full max-w-sm space-y-4">

          <input
            type="text"
            placeholder="Email "
            onChange={(e) => {
              setEmail(e.target.value)
            }}
          
            
            className="w-full p-3 border rounded-lg bg-gray-100"
          />

          <input
            type="text"
            placeholder="Full Name"
             onChange={(e) => {
            setName(e.target.value)}}
            className="w-full p-3 border rounded-lg bg-gray-100"
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) => {
            setPassword(e.target.value)}}
            className="w-full p-3 border rounded-lg bg-gray-100"
          />

          <button type='submit' disabled={isPending} className="w-full bg-[#F5A623] hover:bg-[#e6951f] text-white p-3 rounded-lg font-semibold">
            {isPending ? "Please Wait ...":" Sign Up"}
          </button>

          <p className="text-center text-sm text-gray-700 pt-2">
            Already a member?{" "}
            <Link to ="/login" className="text-blue-600 font-semibold">Log In</Link>
          </p>

        </form>
      </div>
    </div>
  );

};
