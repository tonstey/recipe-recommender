import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { LuChefHat } from "react-icons/lu";
import { CiMail } from "react-icons/ci";
import { IoLockClosedOutline } from "react-icons/io5";
import { AiFillEyeInvisible, AiOutlineEye } from "react-icons/ai";





export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [errorEmail, setErrorEmail] = useState(false)
  const [password, setPassword] = useState("")
  const [errorPassword, setErrorPassword] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  const submitLogin = () => {
    if (!email) {setErrorEmail(true)}
    else {setErrorEmail(false)}
    if (!password) {setErrorPassword(true)}
    else {setErrorPassword(false)}

    if (!email || !password){return}
    else {navigate("/")}
  }

  return (
    <>
      <div className="w-screen h-screen flex justify-center items-center">

        <div className=" border border-green-200 shadow-xl bg-white w-[28rem] px-4 py-10 flex flex-col justify-center items-center rounded-lg gap-6">
          <div className="flex flex-col items-center w-[90%]">
            <div className="bg-emerald-100 rounded-full p-4">
              <LuChefHat className="text-4xl text-green-600"/>
            </div>
            <div className="text-2xl font-bold text-green-800">
              Welcome Back
            </div>
            <div className="text-green-600">
              Sign in to your ___ account
            </div>
          </div>

          <div className="w-[90%] flex flex-col items-center gap-5">
            <div className="w-full flex flex-col gap-1">
              <h1 className="text-green-700 font-semibold">Email</h1>
              <div className="relative h-fit">
                <CiMail className="absolute top-1/2 transform -translate-y-1/2 left-3 text-xl" />
                <input className={`border ${errorEmail ? "border-red-300":"border-green-200"} rounded w-full pl-10 py-2`} type="email" placeholder="Enter your email" value={email} onChange={(e)=>setEmail(e.target.value)}></input>
              </div>
              {errorEmail && <div className="text-sm text-red-600">Email is required</div>}

            </div>

            <div className="w-full flex flex-col gap-1">
              <h1 className="text-green-700 font-semibold">Password</h1>
              <div className="relative h-fit">
                <IoLockClosedOutline className="absolute top-1/2 transform -translate-y-1/2 left-3 text-xl"/>
                <input className={`border ${errorPassword ? "border-red-300":"border-green-200"} rounded w-full px-10 py-2`} type={isVisible ? "password" : "text"} placeholder="Enter your password" value={password} onChange={(e)=>setPassword(e.target.value)}></input>
                <div className="absolute top-1/2 transform -translate-y-1/2 right-2 hover:bg-slate-400 hover:cursor-pointer rounded-lg p-1" onClick={()=>setIsVisible(prev=>!prev)}>
                  {isVisible ? <AiOutlineEye className="text-xl"/> : <AiFillEyeInvisible className=" text-xl " />}
                </div>
              </div>
              {errorPassword && <div className="text-sm text-red-600">Password is required</div>}
            </div>

            <button className="w-full rounded py-2 text-white bg-green-600 hover:bg-green-700 hover:cursor-pointer" onClick={()=>submitLogin()}>Sign In</button>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Link to={"/"} className="text-green-600 hover:text-green-700 hover:underline">Forgot your password?</Link>
            <h1>Don't have an account? <Link to={"/signup"} className="text-green-600 hover:text-green-700 hover:underline">Sign up</Link></h1>
          </div>
        </div>
      </div>
    </>
  )
}