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
      `${import.meta.env.BACKEND_URL}/api/pantry/search?ingredient=${ingredient}`,
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
      throw new Error("There is no token.");
    }

    const res = await fetch(`${import.meta.env.BACKEND_URL}/api/pantry/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Error in fetching pantry.");
    }

    set({
      pantry: data.stored_ingredients.map((item: Ingredient) => ({
        ...item,
        inPantry: true,
      })),
    });
    return { success: true };
  },

  editIngredient: async (
    token: string,
    ingredient_id: number,
    method: "add" | "remove",
  ) => {
    if (!token) {
      throw new Error("There is no token.");
    }

    if (!ingredient_id || !method) {
      throw new Error("Missing fields.");
    }

    const res = await fetch(`${import.meta.env.BACKEND_URL}/api/pantry/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ingredient_id: ingredient_id, method: method }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Error in editting pantry.");
    }

    set({
      pantry: data.stored_ingredients.map((item: Ingredient) => ({
        ...item,
        inPantry: true,
      })),
    });

    return { success: true };
  },
}));
