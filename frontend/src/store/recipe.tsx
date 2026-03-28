import { create } from "zustand";
import { type Recipe } from "../models/recipe";

interface RecipeStore {
  displayRecipeID: number;
  likedRecipes: Array<number>;
  recommendedRecipes: Array<{ recipe: Recipe; score: number }>;
  setDisplayRecipeID: (recipeID: number) => any;
  searchRecipes: (recipe_name: string, page: number, limit: number) => any;
  recommendRecipes: (token: string) => any;
  getLikedRecipes: (token: string) => any;
  addToLikedRecipes: (token: string, recipe_id: number) => any;
  removeFromLikedRecipes: (token: string, reipe_id: number) => any;
}

export const useRecipeStore = create<RecipeStore>()((set) => ({
  displayRecipeID: 0,
  likedRecipes: [],
  recommendedRecipes: [],

  setDisplayRecipeID: (recipeID: number) => {
    set({ displayRecipeID: recipeID });
  },

  searchRecipes: async (recipe_name: string, page: number, limit: number) => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/recipes?recipe=${recipe_name}&page=${page}&limit=${limit}`,
      {
        credentials: "include",
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail ?? "Error occurred while fetching recipes.");
    }

    return data.recipes;
  },

  recommendRecipes: async (token: string) => {
    if (!token) {
      throw new Error("There is no token.");
    }

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/recipes/recommend`,
      {
        credentials: "include",
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
      throw new Error("There is no token.");
    }

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/recipes/liked`,
      {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Error in getting liked recipes.");
    }

    set({ likedRecipes: data.liked_recipes });
    return { success: true };
  },

  addToLikedRecipes: async (token: string, recipe_id: number) => {
    if (!token) {
      throw new Error("There is no token.");
    }

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/recipes/liked/${recipe_id}`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipe_id: recipe_id }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Error in liking recipe.");
    }

    set({ likedRecipes: data.liked_recipes });
    return { success: true };
  },
  removeFromLikedRecipes: async (token: string, recipe_id: number) => {
    if (!token) {
      throw new Error("There is no token.");
    }

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/recipes/liked/${recipe_id}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Error in removing liked recipe.");
    }

    set({ likedRecipes: data.liked_recipes });
    return { success: true };
  },
}));
