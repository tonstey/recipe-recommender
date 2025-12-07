import { create } from "zustand";
import { type Ingredient } from "../models/pantry";
import { useUserStore } from "./user";

interface PantryStore {
  pantry: Array<Ingredient>;
  searchIngredient: (ingredient: string) => any;
  getPantry: () => any;
  editIngredient: (ingredientID: number, method: "add" | "remove") => any;
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

  getPantry: async () => {
    const { token } = useUserStore.getState();
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

  editIngredient: async (ingredientID: number, method: "add" | "remove") => {
    const { token } = useUserStore.getState();
    if (!token) {
      return { success: false, error: "There is no token." };
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
      return { success: false, error: data.error };
    }

    set({ pantry: data });

    return { success: true };
  },
}));
