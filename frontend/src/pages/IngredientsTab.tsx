import MiniRecipeContainer from "../components/recipe/MiniRecipeContainer";
import RecipeContainer from "../components/recipe/RecipeContainer";

import recipes from "../data/recipedata";
import SearchIngredient from "../components/ingredients/SearchIngredient";
import { usePantryStore } from "../store/pantry";
import { useRecipeStore } from "../store/recipe";

export default function IngredientsTab() {
  const { pantry } = usePantryStore.getState();
  const { likedRecipes } = useRecipeStore.getState();
  return (
    <>
      <div className="my-12 flex w-full gap-2">
        <SearchIngredient />

        <div className="flex-1 rounded-xl border border-green-200 bg-white px-8 py-8">
          <div>
            <h1 className="text-3xl font-semibold text-green-800">
              Top Recipe Recommendations
            </h1>
            <h1 className="text-gray-600">
              Based on your available ingredients and preferences
            </h1>
            {pantry.length > 4 ? (
              <div className="mt-6 flex flex-col gap-3">
                {recipes.map((item) => (
                  <MiniRecipeContainer
                    key={item.id}
                    recipe={item}
                    matchPercentage={0.143}
                  />
                ))}
              </div>
            ) : (
              <h1 className="py-8 text-center text-gray-500">
                Add some ingredients to see recommendations
              </h1>
            )}
          </div>
        </div>
      </div>

      <div className="">
        <h1 className="mb-4 text-2xl font-bold text-green-800">
          All Recommendations
        </h1>
        <div className="mb-20 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((item) => (
            <RecipeContainer
              key={Math.random() * 5}
              recipe={item}
              matchPercentage={0.5}
              liked={likedRecipes.includes(item.id)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
