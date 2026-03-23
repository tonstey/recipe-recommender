import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";

import { useVerifyStore } from "../store/verify";

import { FaRegCheckCircle, FaRegTimesCircle } from "react-icons/fa";
import { FaArrowLeftLong } from "react-icons/fa6";
import { RiLoader4Fill } from "react-icons/ri";

export default function ConfirmAccount() {
  const { token } = useParams();
  const navigate = useNavigate();

  const { verifyAccount, resetVerify } = useVerifyStore.getState();

  const { error, status } = useQuery({
    queryKey: ["confirm", token],
    queryFn: async () => verifyAccount(token || ""),
  });

  return (
    <>
      <div className="flex h-screen w-screen items-center justify-center border">
        <div className="relative flex max-h-[90%] w-160 flex-col justify-between rounded-lg bg-white px-4 py-8 shadow-lg">
          {status !== "pending" && (
            <button
              className="absolute top-4 left-3 flex items-center gap-2 rounded px-2 py-1 text-sm text-green-600 hover:cursor-pointer hover:bg-green-200"
              onClick={() => {
                resetVerify();
                navigate("/");
              }}
            >
              <FaArrowLeftLong />
              Back to Home
            </button>
          )}

          {status === "pending" ? (
            <RiLoader4Fill className="mt-2 w-full animate-spin text-7xl text-green-600" />
          ) : error ? (
            <div className="flex flex-col items-center">
              <div className="w-full">
                <div className="mb-8 flex w-full flex-col items-center">
                  <FaRegTimesCircle className="rounded-full bg-red-200 p-3 text-6xl text-red-600" />
                  <h1 className="text-lg font-bold text-green-600">
                    Verification Failed
                  </h1>
                  <h1 className="text-red-500">
                    We could not verify your account
                  </h1>
                </div>
              </div>
              <div className="mb-6 flex w-[90%] flex-col items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-3">
                <h1 className="text-center text-sm leading-8 text-gray-600">
                  This verification link may have expired or is invalid.
                  <br></br>
                  Verification links expire after 24 hours for security reasons.
                  <br></br>
                  <span className="leading-5">
                    Try logging in to confirm that the account was verified or
                    be sent a new verification link.
                  </span>
                </h1>
              </div>

              <div className="flex w-96 flex-col items-center gap-2">
                <button
                  className="w-full rounded-lg border border-green-500 px-4 py-2 text-lg text-green-500 hover:cursor-pointer hover:bg-green-100"
                  onClick={() => navigate("/login")}
                >
                  Try Logging In
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="w-full">
                <div className="mb-8 flex w-full flex-col items-center">
                  <FaRegCheckCircle className="rounded-full bg-green-200 p-3 text-6xl text-green-600" />
                  <h1 className="text-lg font-bold text-green-600">
                    Account Verified!
                  </h1>
                  <h1 className="text-green-500">
                    Your email has been successfully confirmed!
                  </h1>
                </div>
              </div>
              <div className="flex w-full flex-col items-center">
                <div className="mb-6 flex w-[90%] flex-col items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-3 py-1">
                  <h1 className="text-center text-sm text-gray-600">
                    Your account has been successfully verified! You can now log
                    in and start discovering amazing recipes.
                  </h1>
                </div>

                <ul className="text-md mb-6 list-disc text-gray-600 marker:text-green-600">
                  <li>Search and rate thousands of recipes</li>
                  <li>Get personalized recipe recommendations</li>
                  <li>Find recipes based on your ingredients</li>
                </ul>
              </div>
              <div className="flex w-full flex-col items-center">
                <button
                  className="rounded-lg bg-green-500 px-4 py-2 text-lg text-white hover:cursor-pointer hover:bg-green-600"
                  onClick={() => navigate("/login")}
                >
                  Go to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
