// export const LoginPage = () => {
//   return (
  

//      <div className="w-full h-screen overflow-hidden flex bg-[#FFF7EB] font-sans">

//       {/* LEFT SECTION */}
//       <div className="w-1/2 bg-[#FCDCA5] rounded-r-3xl flex flex-col justify-center items-center relative p-10">
        
//         <h1 className="text-3xl font-bold text-gray-800 mb-2">
//           Welcome Back!
//         </h1>
//         <p className="text-gray-700 mb-6">Login to manage your pets easily!</p>

//         <img 
//           src="/dogsignup.jpg"   // Put image in public/dog.jpg
//           alt="Dog" 
//           className="w-3/4 max-h-[80%] object-contain"
//         />
//       </div>

//       {/* RIGHT FORM SECTION */}
//       <div className="w-1/2 flex flex-col justify-center px-20">

//         <h2 className="text-3xl font-bold mb-2 text-gray-900">Log In</h2>

//         <p className="text-gray-700 mb-6">
//           Not a member yet?{" "}
//           <a href="#" className="text-blue-600 font-semibold">Register now</a>
//         </p>

//         {/* FORM */}
//         <div className="w-full max-w-md space-y-5">

//           <input
//             type="text"
//             placeholder="Email"
//             className="w-full p-3 rounded-full bg-gray-100 border outline-none"
//           />

//           <input
//             type="password"
//             placeholder="Password"
//             className="w-full p-3 rounded-full bg-gray-100 border outline-none"
//           />

//           <div className="flex items-center gap-2">
//             <input type="checkbox" />
//             <span className="text-gray-700 text-sm">Keep me logged in</span>
//           </div>

//           <button className="w-full bg-[#F5A623] hover:bg-[#e6951f] text-white p-3 rounded-full text-lg font-semibold">
//             LOG IN
//           </button>

//           <div className="flex justify-between items-center text-sm text-gray-600">
//             <span></span>
//             <a href="#" className="hover:underline">Forgot your password?</a>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };
import { Link } from 'react-router-dom';
import dog from '../assets/dog.jpg'
import { useLogin } from '../apis/auth/hooks';
import { useState } from 'react';


export const LoginPage = () => {
  const {mutate,isPending} = useLogin()
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  return (
    <div className="w-full h-screen overflow-hidden flex bg-[#FFF7EB] font-sans">

      {/* LEFT SECTION */}
      <div className="w-1/2 relative flex flex-col justify-center items-center rounded-r-3xl p-10 bg-gradient-to-br from-[#FCDCA5] to-[#F7B864]">
        -
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Welcome Back!
        </h1>
        <p className="text-gray-800 mb-6 text-center">
         Login to manage your pets easily!
        </p>

        <div className="w-3/4 max-h-[70%] flex justify-center items-center shadow-lg rounded-2xl overflow-hidden">
          <img 
            src={dog}   
            alt="Dog" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="w-1/2 flex flex-col items-center justify-center px-14">

        <h2 className="text-3xl font-bold mb-6 text-gray-900">Log In</h2>

        {/* Form */}
        <form onSubmit={(e) => {
          e.preventDefault()
          mutate({
            email,
            password
          })
        }} className="w-full max-w-sm space-y-4">

          <input
            type="text"
            placeholder="Email "
            onChange={(e) => {
              setEmail(e.target.value)
            }}
            className="w-full p-3 border rounded-lg bg-gray-100"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg bg-gray-100"
             onChange={(e) => {
              setPassword(e.target.value)
            }}
          />

          <button type='submit' disabled={isPending} className="w-full bg-[#F5A623] hover:bg-[#e6951f] text-white p-3 rounded-lg font-semibold">
           {isPending ? "Please Wait ...":" Log In"}
          </button>

          <p className="text-center text-sm text-gray-700 pt-2">
            Not a member yet?{" "}
            <Link to="/signup" className="text-blue-600 font-semibold">Sign Up</Link>
          </p>

          <p className="text-center text-sm text-gray-700">
            <a href="#" className="hover:underline">Forgot your password?</a>
          </p>

        </form>
      </div>
    </div>
  );
};
