import { useNavigate } from "react-router";

import { useUserStore } from "../store/user";

import { LuChefHat } from "react-icons/lu";
import { BsPerson } from "react-icons/bs";

export default function NavBar() {
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const navigate = useNavigate();

  return (
    <>
      <div className="sticky top-0 right-0 left-0 z-40 flex h-20 items-center justify-between bg-white px-24 shadow-lg">
        <div className="flex items-center gap-2">
          <LuChefHat className="text-5xl text-green-600" />
          <h1 className="text-3xl font-bold text-green-800">Savorly</h1>
        </div>

        {user.username ? (
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-200 p-2">
              <BsPerson className="text-2xl text-green-600" />
            </div>
            <h1 className="text-lg font-semibold text-green-600">
              Welcome back {user.username}
            </h1>
            <h1
              className="text-sm hover:cursor-pointer hover:underline"
              onClick={() => logout()}
            >
              Logout
            </h1>
          </div>
        ) : (
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/login")}
              className="rounded border border-green-600 px-4 py-2 font-semibold text-green-600 hover:cursor-pointer hover:bg-green-100"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="rounded bg-green-600 px-4 py-2 font-semibold text-white hover:cursor-pointer hover:bg-green-500"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </>
  );
}
