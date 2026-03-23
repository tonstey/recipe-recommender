import { create } from "zustand";

interface RatingStore {
  getRating: (ratingID: String, token: String) => any;
  createRating: (score: Number, recipe_uuid: String, token: String) => any;
  adjustRating: (
    score: Number,
    recipe_uuid: String,
    ratingID: String,
    token: String,
  ) => any;
  deleteRating: (ratingID: String, token: String) => any;
}

export const useRatingStore = create<RatingStore>(() => ({
  getRating: async (ratingID: String, token: String) => {
    if (!token) {
      throw new Error("There is no token.");
    }

    if (!ratingID) {
      throw new Error("Missing fields.");
    }

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/ratings/${ratingID}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Error in retrieving rating.");
    }

    return data;
  },
  createRating: async (score: Number, recipe_uuid: String, token: String) => {
    if (!token) {
      throw new Error("There is no token.");
    }

    if (!score || !recipe_uuid) {
      throw new Error("Missing fields.");
    }

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/ratings/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          req: { recipe_uuid: recipe_uuid, score: score },
        }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Error in creating rating.");
    }

    return data;
  },
  adjustRating: async (
    score: Number,
    recipe_uuid: String,
    ratingID: String,
    token: String,
  ) => {
    if (!token) {
      throw new Error("There is no token.");
    }

    if (!score || recipe_uuid || ratingID) {
      throw new Error("Missing fields.");
    }

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/ratings/${ratingID}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          req: { recipe_uuid: recipe_uuid, score: score },
        }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Error in updating rating.");
    }

    return data;
  },
  deleteRating: async (ratingID: String, token: String) => {
    if (!token) {
      throw new Error("There is no token.");
    }

    if (!ratingID) {
      throw new Error("Missing fields.");
    }

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/ratings/${ratingID}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Error in removing rating.");
    }
  },
}));
