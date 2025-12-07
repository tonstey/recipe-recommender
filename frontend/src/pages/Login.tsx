import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";

import { useUserStore } from "../store/user";
import { useVerifyStore } from "../store/verify";

import type { LoginResponse } from "../models/verify";

import { CiMail } from "react-icons/ci";
import { LuChefHat } from "react-icons/lu";
import { RiLoader4Fill } from "react-icons/ri";
import { FaArrowLeftLong } from "react-icons/fa6";
import { IoLockClosedOutline } from "react-icons/io5";
import { AiFillEyeInvisible, AiOutlineEye } from "react-icons/ai";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  const login = useUserStore((state) => state.login);
  const setUser = useUserStore((state) => state.setUser);
  const setAccessToken = useUserStore((state) => state.setToken);
  const setVerifyToken = useVerifyStore((state) => state.setVerifyToken);
  const setVerifyUser = useVerifyStore((state) => state.setVerifyUser);

  const { error, status, mutate } = useMutation({
    mutationFn: login,
    onSuccess: (data: LoginResponse) => {
      if (!data.token.token) {
        throw new Error("No access token was returned.");
      }

      if (data.token.token_type === "login") {
        setAccessToken(data.token.token);

        if (data.token.token) {
          setUser(data.token.token);
        }
      }

      if (data.token.token_type === "verify") {
        setVerifyToken(data.token.token);
        if (data.user_info) {
          setVerifyUser(data.user_info);
        }
      }
      navigate(`${data.token.token_type === "verify" ? "/verify" : "/"}`);
    },
  });

  return (
    <>
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="relative flex w-[28rem] flex-col items-center justify-center gap-6 rounded-lg border border-green-200 bg-white py-10 shadow-xl">
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
              Welcome Back
            </div>
            <div className="text-green-600">
              Sign in to your Savorly account
            </div>
          </div>

          {status === "pending" ? (
            <RiLoader4Fill className="mt-2 w-full animate-spin text-7xl text-green-600" />
          ) : (
            <div>
              <div className="flex w-full flex-col items-center gap-5">
                <div className="flex w-full flex-col gap-1">
                  <h1 className="font-semibold text-green-700">Email</h1>
                  <div className="relative h-fit">
                    <CiMail className="absolute top-1/2 left-3 -translate-y-1/2 transform text-xl" />
                    <input
                      className="w-full rounded border border-green-200 py-2 pl-10"
                      type="email"
                      placeholder="Enter your username"
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
                      className="w-full rounded border border-green-200 px-10 py-2"
                      type={isVisible ? "password" : "text"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                </div>

                <button
                  className="w-full rounded bg-green-600 py-2 text-white hover:cursor-pointer hover:bg-green-700"
                  onClick={() => mutate({ email: email, password: password })}
                >
                  Sign In
                </button>
                {error && (
                  <div className="mb-1 text-red-600">{error.message}</div>
                )}
              </div>

              <div className="flex flex-col items-center gap-1">
                <Link
                  to={"/"}
                  className="text-green-600 hover:text-green-700 hover:underline"
                >
                  Forgot your password?
                </Link>
                <h1>
                  Don't have an account?{" "}
                  <Link
                    to={"/signup"}
                    className="text-green-600 hover:text-green-700 hover:underline"
                  >
                    Sign up
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
