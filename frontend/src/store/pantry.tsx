import { create } from "zustand";
import { type Ingredient } from "../models/pantry";

interface PantryStore {
  pantry: Array<Ingredient>;
  searchIngredient: (ingredient: string) => any;
  getPantry: (token: string) => any;
  editIngredient: (
    token: string,
    ingredientID: number,
    method: "add" | "remove",
  ) => any;
}

export const usePantryStore = create<PantryStore>()((set) => ({
  pantry: [],

  searchIngredient: async (ingredient: string) => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/pantry/search?ingredient=${ingredient}`,
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.error ?? "Error occurred while fetching ingredients.",
      );
    }

    return data;
  },

  getPantry: async (token: string) => {
    if (!token) {
      return { success: false, error: "There is no token." };
    }

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/pantry/getpantry`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error };
    }

    set({ pantry: data });
    return { success: true };
  },

  editIngredient: async (
    token: string,
    ingredientID: number,
    method: "add" | "remove",
  ) => {
    if (!token) {
      throw new Error("There is no token.");
    }
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/pantry/editpantry?method=${method}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ingredient_id: ingredientID }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Editing pantry was unsuccessful.");
    }

    set({ pantry: data });

    return { success: true };
  },
}));
