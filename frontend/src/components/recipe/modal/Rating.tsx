import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useRecipeStore } from "../../../store/recipe";
import { useUserStore } from "../../../store/user";

import { Ring2 } from "ldrs/react";
import "ldrs/react/Ring2.css";

import {
  PiThumbsUpBold,
  PiArticleBold,
  PiStarFill,
  PiHeartBold,
  PiHeartFill,
  PiHeartBreakBold,
} from "react-icons/pi";

export default function Rating() {
  const navigate = useNavigate();

  const starsArray = [1, 2, 3, 4, 5];

  const token = useUserStore((state) => state.token);
  const displayRecipeID = useRecipeStore((state) => state.displayRecipeID);

  // BEGIN RATING METHODS & FIELDS
  const {
    data: recipeRating,
    error: recipeRatingError,
    status: recipeRatingStatus,
  } = useQuery({
    queryKey: ["avg_rating"],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.BACKEND_URL}/api/ratings/recipe/${displayRecipeID}`,
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Error in fetching average rating");
      }

      return data;
    },
    enabled: !!displayRecipeID,
  });

  const average_rating = recipeRating?.rating_count
    ? recipeRating.rating_sum / recipeRating.rating_count
    : 0;

  const { data: userRating } = useQuery({
    queryKey: ["user_rating", displayRecipeID],
    queryFn: async () => {
      if (token) {
        const res = await fetch(
          `${import.meta.env.BACKEND_URL}/api/ratings/${displayRecipeID}`,
          {
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.detail || "Error in fetching user rating.");
        }
        return data;
      }
      return 0;
    },
    enabled: !!displayRecipeID,
  });

  const [hoverRating, setHoverRating] = useState(0);
  const queryClient = useQueryClient();
  const onRate = useMutation({
    mutationFn: async (score: number) => {
      if (!token) {
        navigate("/login");
      }
      await fetch(`${import.meta.env.BACKEND_URL}/api/ratings`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipe_id: displayRecipeID,
          score: score,
        }),
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user_rating"] }),
        queryClient.invalidateQueries({ queryKey: ["avg_rating"] }),
      ]);
    },
  });
  // END RATING FIELDS & METHODS

  // BEGIN LIKE & DISLIKE FIELDS & METHODS
  const likedRecipes = useRecipeStore((state) => state.likedRecipes);
  const likeRecipe = useRecipeStore((state) => state.addToLikedRecipes);
  const dislikeRecipe = useRecipeStore((state) => state.removeFromLikedRecipes);

  const [isSaved, setIsSaved] = useState(
    likedRecipes.includes(displayRecipeID),
  );
  const [isSavedHover, setIsSavedHover] = useState(false);
  useEffect(() => {
    setIsSaved(likedRecipes.includes(displayRecipeID));
  }, []);

  const onSave = useMutation({
    mutationFn: async () => {
      if (!token) {
        navigate("/login");
      }
      await likeRecipe(token, displayRecipeID);
    },
    onSuccess: async () => setIsSaved(true),
  });

  const onUnsave = useMutation({
    mutationFn: async () => {
      if (!token) {
        navigate("/login");
      }
      await dislikeRecipe(token, displayRecipeID);
    },
    onSuccess: async () => setIsSaved(false),
  });
  // END LIKE & DISLIKE FIELDS & METHODS

  return (
    <>
      <div className="flex flex-col gap-4 bg-green-50 p-4">
        <div className="flex flex-col items-center md:flex-row md:justify-between">
          <div className="flex flex-col items-center">
            <h1 className="flex items-center gap-2 text-lg text-green-600">
              <PiThumbsUpBold />
              Rate this Recipe
            </h1>
            {onRate.status === "pending" ? (
              <div className="h-8">
                <Ring2 size={30} />
              </div>
            ) : (
              <div className="flex items-center gap-1">
                {starsArray.map((item) => (
                  <PiStarFill
                    key={"USER_RATING" + item * 0.0002}
                    className={`h-8 w-8 hover:cursor-pointer ${item <= userRating ? "text-yellow-400" : item <= hoverRating ? "text-yellow-200" : "text-gray-300"}`}
                    onMouseEnter={() => setHoverRating(item)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => onRate.mutate(item)}
                  />
                ))}
              </div>
            )}
            {onRate.error && (
              <div className="text-red-600">{onRate.error.message}</div>
            )}
          </div>
          <div className="flex flex-col items-center">
            <h1 className="flex items-center gap-2 text-lg text-green-600">
              <PiArticleBold />
              Average Ratings:
            </h1>
            {recipeRatingStatus === "pending" ? (
              <div className="h-8">
                <Ring2 size={30} />
              </div>
            ) : (
              recipeRating && (
                <div className="flex items-center gap-1">
                  {starsArray.map((item) => (
                    <PiStarFill
                      key={"AVERAGE_RATING" + item * 2}
                      className={`h-8 w-8 ${item <= average_rating ? "text-yellow-400" : ""}`}
                    />
                  ))}
                  <h1 className="text-lg">({average_rating})</h1>
                </div>
              )
            )}

            {recipeRatingError && (
              <h1 className="text-red-600">{recipeRatingError.message}</h1>
            )}
          </div>
        </div>
        {onSave.status === "pending" || onUnsave.status === "pending" ? (
          <div className="flex w-full justify-center rounded-lg bg-gray-200 py-2 hover:cursor-not-allowed">
            <Ring2 />
          </div>
        ) : isSaved ? (
          <button
            onClick={() => onUnsave.mutate()}
            onMouseEnter={() => setIsSavedHover(true)}
            onMouseLeave={() => setIsSavedHover(false)}
            className="w-full rounded-lg bg-green-500 py-2 text-lg text-white hover:cursor-pointer hover:bg-red-600"
          >
            {isSavedHover ? (
              <h1 className="flex items-center justify-center gap-3">
                <PiHeartBreakBold />
                Unsave
              </h1>
            ) : (
              <h1 className="flex items-center justify-center gap-3">
                <PiHeartFill />
                Saved!
              </h1>
            )}
          </button>
        ) : (
          <button
            onClick={() => onSave.mutate()}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-green-500 py-2 text-lg text-white hover:cursor-pointer hover:bg-green-600"
          >
            <PiHeartBold />
            Save Recipe
          </button>
        )}
        <div className="w-full text-center">
          {onSave.error && (
            <div className="text-red-600">{onSave.error.message}</div>
          )}
          {onUnsave.error && (
            <div className="text-red-600">{onUnsave.error.message}</div>
          )}
        </div>
      </div>
    </>
  );
}
