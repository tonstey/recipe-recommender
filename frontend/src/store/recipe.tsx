import { create } from "zustand";
import { type Recipe } from "../models/recipe";

interface RecipeStore {
  likedRecipes: Array<number>;
  recommendedRecipes: Array<Recipe>;
  searchRecipes: (recipe_name: string, page: number, limit: number) => any;
  recommendRecipes: (token: string) => any;
  getLikedRecipes: (token: string) => any;
  editLikedRecipes: (
    token: string,
    recipe_id: number,
    type: "add" | "remove",
  ) => any;
}

export const useRecipeStore = create<RecipeStore>()((set) => ({
  likedRecipes: [],
  recommendedRecipes: [],

  searchRecipes: async (recipe_name: string, page: number, limit: number) => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/recipe/search?recipe=${recipe_name}&page=${page}&limit=${limit}`,
      {
        credentials: "include",
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error ?? "Error occurred while fetching recipes.");
    }

    return data;
  },

  recommendRecipes: async (token: string) => {
    if (!token) {
      throw new Error("There is no token.");
    }

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/recipe/recommend`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Recommending recipes was unsuccessful.");
    }

    set({ recommendedRecipes: data });
    return { success: true };
  },

  getLikedRecipes: async (token: string) => {
    if (!token) {
      return { success: false, error: "There is no token." };
    }

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/recipe/getlikedrecipes`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error };
    }

    set({ likedRecipes: data });
    return { success: true };
  },

  editLikedRecipes: async (
    token: string,
    recipe_id: number,
    type: "add" | "remove",
  ) => {
    if (!token) {
      throw new Error("There is no token.");
    }

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/recipe/${type}likedrecipe`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipe_id: recipe_id }),
      },
    );
    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.detail || "Editting liked recipes was unsuccessful.",
      );
    }

    set({ likedRecipes: data });
    return { success: true };
  },
}));
