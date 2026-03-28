import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { useVerifyStore } from "../store/verify";

import { LuMail, LuPencil } from "react-icons/lu";
import { FaArrowLeftLong } from "react-icons/fa6";
import { RiLoader4Fill } from "react-icons/ri";

export default function CheckEmail() {
  const verifyUser = useVerifyStore((state) => state.verifyUser);
  const setToken = useVerifyStore((state) => state.setVerifyToken);
  const changeEmail = useVerifyStore((state) => state.changeEmail);
  const sendEmail = useVerifyStore((state) => state.sendEmail);
  const resetVerify = useVerifyStore((state) => state.resetVerify);

  const [isEditting, setIsEditting] = useState(false);
  const [email, setEmail] = useState(verifyUser.email);

  const navigate = useNavigate();

  const {
    mutate: editEmailMutate,
    error: editEmailError,
    status: editEmailStatus,
  } = useMutation({
    mutationFn: changeEmail,
    onSuccess: (data: string) => {
      setToken(data);
      setIsEditting(false);
    },
  });

  const {
    mutate: verifyEmailMutate,
    error: verifyEmailError,
    status: verifyEmailStatus,
  } = useMutation({
    mutationKey: ["sendEmail"],
    mutationFn: sendEmail,
    onSuccess: () => {
      alert("Verification email sent successfully.");
    },
  });

  return (
    <>
      <div className="flex h-full w-full items-center justify-center">
        <div className="relative flex max-h-[90%] w-160 flex-col justify-between rounded-lg bg-white px-4 py-8 shadow-lg">
          <div className="w-full">
            {verifyEmailStatus !== "pending" &&
              editEmailStatus !== "pending" && (
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
            <div className="mb-8 flex w-full flex-col items-center">
              <LuMail className="rounded-full bg-green-200 p-3 text-6xl text-green-600" />
              <h1 className="text-lg font-bold text-green-600">
                Verify Your Email
              </h1>
              <h1 className="text-green-500">
                Click the button below to send a verification link to your
                email.
              </h1>
            </div>
          </div>
          <div className="flex w-full flex-col items-center">
            {isEditting ? (
              editEmailStatus === "pending" ? (
                <RiLoader4Fill className="mt-2 w-full animate-spin text-7xl text-green-600" />
              ) : (
                <div className="mb-6 flex w-[90%] flex-col">
                  <h1 className="font-semibold text-green-600">
                    New Email Address
                  </h1>
                  <input
                    type="email"
                    placeholder="Enter new email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded border border-green-400 px-2 py-0.5 text-lg"
                  ></input>
                  <div className="mx-auto mt-4 flex gap-4">
                    <button
                      onClick={() => editEmailMutate({ email: email })}
                      className="w-44 rounded-lg bg-green-500 py-1 text-white hover:cursor-pointer hover:bg-green-600"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setIsEditting(false)}
                      className="w-44 rounded-lg border border-green-500 py-1 text-green-500 hover:cursor-pointer hover:bg-green-100"
                    >
                      Cancel
                    </button>
                  </div>
                  {editEmailError && (
                    <div className="text-red-600">{editEmailError.message}</div>
                  )}
                </div>
              )
            ) : (
              <div className="mb-6 flex w-[90%] flex-col items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-3 py-1">
                <div className="flex w-full justify-between">
                  <h1 className="font-semibold text-green-800">{email}</h1>
                  <button
                    onClick={() => setIsEditting(true)}
                    className="flex items-center gap-2 rounded-lg px-1 py-0.5 text-green-500 hover:cursor-pointer hover:bg-green-200"
                  >
                    <LuPencil />
                    Change
                  </button>
                </div>
                <h1 className="text-center text-sm">
                  Please check your inbox and click the verification link to
                  confirm your account.
                </h1>
              </div>
            )}
            <ul className="text-md mb-6 list-disc text-gray-600 marker:text-green-600">
              <li>
                Check your spam or junk folder if you don't see the email in
                your inbox
              </li>
              <li>The verification link will expire in 1 hour</li>
              <li>Click the link in the email to activate your account</li>
            </ul>
          </div>
          <div className="flex w-full flex-col items-center">
            {verifyEmailStatus === "pending" ? (
              <RiLoader4Fill className="mt-2 w-full animate-spin text-7xl text-green-600" />
            ) : (
              <button
                className="rounded-lg border border-green-500 px-3 py-1 text-green-500 hover:cursor-pointer hover:bg-green-50 hover:text-black"
                onClick={() => verifyEmailMutate({ email: email })}
              >
                Send Verification Email
              </button>
            )}
            {verifyEmailError && (
              <div className="text-red-600">{verifyEmailError.message}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
