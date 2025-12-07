import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { useUserStore } from "../store/user";
import { useVerifyStore } from "../store/verify";

import type { SignUpResponse } from "../models/user";

import PasswordValidator from "password-validator";
import PasswordChecklist from "../components/authentication/PasswordChecklist";

import { LuChefHat } from "react-icons/lu";
import { BsPerson } from "react-icons/bs";
import { CiMail } from "react-icons/ci";
import { IoLockClosedOutline } from "react-icons/io5";
import { FaArrowLeftLong } from "react-icons/fa6";
import { AiFillEyeInvisible, AiOutlineEye } from "react-icons/ai";
import { RiLoader4Fill } from "react-icons/ri";

export default function SignUp() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordError, setPasswordError] = useState<any[]>();

  const [isVisible, setIsVisible] = useState(true);

  const signup = useUserStore((state) => state.signup);
  const setUser = useVerifyStore((state) => state.setVerifyUser);
  const setToken = useVerifyStore((state) => state.setVerifyToken);

  const passwordValidator = new PasswordValidator();
  passwordValidator
    .is()
    .min(8) // Minimum length 8
    .is()
    .max(100) // Maximum length 100
    .has()
    .uppercase() // Must have uppercase letters
    .has()
    .lowercase() // Must have lowercase letters
    .has()
    .digits() // Must have at least a digit
    .has()
    .symbols() // Must have at least a symbol
    .has()
    .not()
    .spaces(); // Should not have spaces

  const onPasswordChange = (password: string) => {
    setPassword(password);
    const errorList = passwordValidator.validate(password, { list: true });
    if (Array.isArray(errorList)) {
      setPasswordError(errorList);
    }
  };

  const { error, status, mutate } = useMutation({
    mutationFn: signup,
    onSuccess: (data: SignUpResponse) => {
      setUser({
        username: data.user_info.username,
        email: data.user_info.email,
      });
      setToken(data.token);

      navigate("/verify");
    },
  });

  return (
    <>
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="relative my-12 flex w-[28rem] flex-col items-center justify-center rounded-lg border border-green-200 bg-white px-4 py-10 shadow-xl">
          {status !== "pending" && (
            <button
              className="absolute top-4 left-3 flex items-center gap-2 rounded px-2 py-1 text-sm text-green-600 hover:cursor-pointer hover:bg-green-200"
              onClick={() => navigate("/")}
            >
              <FaArrowLeftLong />
              Back to Home
            </button>
          )}
          <div className="flex w-[90%] flex-col items-center">
            <div className="rounded-full bg-emerald-100 p-4">
              <LuChefHat className="text-4xl text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-800">
              Join Savorly
            </div>
            <div className="text-green-600">
              Create your account to start discovering recipes
            </div>
          </div>
          {status === "pending" ? (
            <RiLoader4Fill className="mt-2 w-full animate-spin text-7xl text-green-600" />
          ) : (
            <div className="mt-4 flex w-full flex-col items-center">
              <div className="mb-2 flex w-[90%] flex-col items-center gap-5">
                <div className="flex w-full flex-col gap-1">
                  <h1 className="font-semibold text-green-700">Username</h1>
                  <div className="relative h-fit">
                    <BsPerson className="absolute top-1/2 left-3 -translate-y-1/2 transform text-xl" />
                    <input
                      className={`border ${error && !username ? "border-red-300" : "border-green-200"} w-full rounded py-2 pl-10`}
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    ></input>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-1">
                  <h1 className="font-semibold text-green-700">Email</h1>
                  <div className="relative h-fit">
                    <CiMail className="absolute top-1/2 left-3 -translate-y-1/2 transform text-xl" />
                    <input
                      className={`border ${error && !email ? "border-red-300" : "border-green-200"} w-full rounded py-2 pl-10`}
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    ></input>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-1">
                  <h1 className="font-semibold text-green-700">Password</h1>
                  <div className="relative h-fit">
                    <IoLockClosedOutline className="absolute top-1/2 left-3 -translate-y-1/2 transform text-xl" />
                    <input
                      className={`border ${error && (!password || password !== confirmPassword) ? "border-red-300" : "border-green-200"} w-full rounded px-10 py-2`}
                      type={isVisible ? "password" : "text"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => onPasswordChange(e.target.value)}
                    ></input>
                    <div
                      className="absolute top-1/2 right-2 -translate-y-1/2 transform rounded-lg p-1 hover:cursor-pointer hover:bg-slate-400"
                      onClick={() => setIsVisible((prev) => !prev)}
                    >
                      {isVisible ? (
                        <AiOutlineEye className="text-xl" />
                      ) : (
                        <AiFillEyeInvisible className="text-xl" />
                      )}
                    </div>
                  </div>
                  {passwordError && passwordError.length > 0 && (
                    <PasswordChecklist requirements={passwordError} />
                  )}
                </div>

                <div className="flex w-full flex-col gap-1">
                  <h1 className="font-semibold text-green-700">
                    Confirm Password
                  </h1>
                  <div className="relative h-fit">
                    <IoLockClosedOutline className="absolute top-1/2 left-3 -translate-y-1/2 transform text-xl" />
                    <input
                      className={`border ${error && (!confirmPassword || password !== confirmPassword) ? "border-red-300" : "border-green-200"} w-full rounded py-2 pl-10`}
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    ></input>
                  </div>
                </div>

                <button
                  className="w-full rounded bg-green-600 py-2 text-white hover:cursor-pointer hover:bg-green-700"
                  onClick={() =>
                    mutate({
                      username: username,
                      email: email,
                      password: password,
                      confirmPassword: confirmPassword,
                      passwordError: passwordError,
                    })
                  }
                >
                  Sign Up
                </button>
              </div>

              {error && (
                <div className="mb-1 text-red-600">{error.message}</div>
              )}

              <div className="flex flex-col items-center gap-1">
                <h1>
                  Already have an account?{" "}
                  <Link
                    to={"/login"}
                    className="text-green-600 hover:text-green-700 hover:underline"
                  >
                    Log In
                  </Link>
                </h1>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
