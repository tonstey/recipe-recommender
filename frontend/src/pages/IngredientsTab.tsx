import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { usePantryStore } from "../store/pantry";
import { useRecipeStore } from "../store/recipe";
import { useUserStore } from "../store/user";

import MiniRecipeContainer from "../components/recipe/MiniRecipeContainer";
import RecipeContainer from "../components/recipe/RecipeContainer";

import SearchIngredient from "../components/ingredients/SearchIngredient";
import RecipeModal from "../components/recipe/RecipeModal";

import { Ring2 } from "ldrs/react";
import "ldrs/react/Ring2.css";

export default function IngredientsTab() {
  const token = useUserStore((state) => state.token);
  const pantry = usePantryStore((state) => state.pantry);
  const likedRecipes = useRecipeStore((state) => state.likedRecipes);
  const recommendedRecipes = useRecipeStore(
    (state) => state.recommendedRecipes,
  );
  const recommend = useRecipeStore((state) => state.recommendRecipes);

  const navigate = useNavigate();

  const { mutate, status, error } = useMutation({
    mutationFn: async () => {
      if (!token) {
        navigate("/login");
      }
      await recommend(token);
    },
  });

  return (
    <>
      <div className="my-12 flex w-full flex-col gap-2 py-8 md:flex-row">
        <RecipeModal />
        <SearchIngredient />

        <div className="w-75 rounded-xl border border-green-200 bg-white px-8 py-8 md:w-200">
          <div>
            <h1 className="text-3xl font-semibold text-green-800">
              Top Recipe Recommendations
            </h1>
            <h1 className="text-gray-600">
              Based on your available ingredients and preferences
            </h1>
            {pantry.length > 4 ? (
              status === "pending" ? (
                <div className="flex w-full justify-center">
                  <Ring2 size={60} stroke={8} />
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => mutate()}
                    className="my-2 w-full rounded-lg bg-green-700 py-1.5 text-lg font-semibold text-white hover:cursor-pointer hover:bg-green-500"
                  >
                    Recommend
                  </button>
                  {error && <div className="text-red-600">{error.message}</div>}
                  <div className="mt-6 flex flex-col gap-3">
                    {recommendedRecipes.slice(0, 3).map((item) => (
                      <MiniRecipeContainer
                        key={"recommended" + item.recipe.id}
                        recipe={item.recipe}
                        matchPercentage={item.score}
                      />
                    ))}
                  </div>
                </div>
              )
            ) : (
              <h1 className="py-8 text-center text-gray-500">
                Add some ingredients to see recommendations
              </h1>
            )}
          </div>
        </div>
      </div>

      <div className="mb-20">
        <h1 className="mb-4 text-2xl font-bold text-green-800">
          All Recommendations
        </h1>
        {status === "pending" ? (
          <div className="flex w-full justify-center">
            <Ring2 size={50} />
          </div>
        ) : (
          <div className="mb-20 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {recommendedRecipes &&
              recommendedRecipes.length > 3 &&
              recommendedRecipes
                .slice(3)
                .map((item) => (
                  <RecipeContainer
                    key={"recommended" + item.recipe.id}
                    recipe={item.recipe}
                    matchPercentage={item.score}
                    liked={likedRecipes.includes(item.recipe.id)}
                  />
                ))}
          </div>
        )}
      </div>
    </>
  );
}
