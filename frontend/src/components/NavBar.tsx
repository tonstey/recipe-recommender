import { useEffect } from "react";
import { useNavigate } from "react-router";

import { useQuery } from "@tanstack/react-query";

import { useUserStore } from "../store/user";
import { useRecipeStore } from "../store/recipe";
import { usePantryStore } from "../store/pantry";

import { LuChefHat } from "react-icons/lu";
import { BsPerson } from "react-icons/bs";

export default function NavBar() {
  const user = useUserStore((state) => state.user);

  const getUser = useUserStore((state) => state.setUser);
  const getLikedRecipes = useRecipeStore((state) => state.getLikedRecipes);
  const getPantry = usePantryStore((state) => state.getPantry);

  const access_token = useUserStore((state) => state.token);
  const logout = useUserStore((state) => state.logout);
  const navigate = useNavigate();

  const { error: userError } = useQuery({
    queryKey: ["user", access_token],
    queryFn: () => getUser(access_token),
    enabled: !!access_token,
  });

  const { error: recipeError } = useQuery({
    queryKey: ["likedrecipes", access_token],
    queryFn: () => getLikedRecipes(access_token),
    enabled: !!access_token,
  });

  const { error: pantryError } = useQuery({
    queryKey: ["pantry", access_token],
    queryFn: () => getPantry(access_token),
    enabled: !!access_token,
  });

  useEffect(() => {
    if (userError) {
      alert(userError.message);
    }
  }, [userError]);
  useEffect(() => {
    if (recipeError) {
      alert(recipeError.message);
    }
  }, [recipeError]);
  useEffect(() => {
    if (pantryError) {
      alert(pantryError.message);
    }
  }, [pantryError]);

  return (
    <>
      <div className="fixed top-0 right-0 left-0 z-40 flex h-20 w-full items-center justify-between gap-4 bg-white px-8 shadow-lg md:px-24">
        <div className="flex items-center gap-2">
          <LuChefHat className="text-4xl text-green-600 md:text-5xl" />
          <h1 className="text-2xl font-bold text-green-800 md:text-3xl">
            Savorly
          </h1>
        </div>

        {user.username ? (
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-200 p-2">
              <BsPerson className="text-lg text-green-600 md:text-2xl" />
            </div>
            <h1 className="text-sm font-semibold text-green-600 md:text-lg">
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
              className="md:text-md rounded border border-green-600 px-4 py-2 text-sm font-semibold text-green-600 hover:cursor-pointer hover:bg-green-100"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="md:text-md rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:cursor-pointer hover:bg-green-500"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </>
  );
}
