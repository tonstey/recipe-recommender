import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { useRecipeStore } from "../store/recipe";
import { useDebounce } from "../tools/debounce";

import RecipeContainer from "../components/recipe/RecipeContainer";
import RecipeModal from "../components/recipe/RecipeModal";

import { IoSearchOutline } from "react-icons/io5";
import { RiLoader4Fill } from "react-icons/ri";

export default function RecipeTab() {
  const likedRecipes = useRecipeStore((state) => state.likedRecipes);

  const [searchQuery, setSearchQuery] = useState("");
  const debounceRecipe = useDebounce(searchQuery, 500);
  const limit = 10;

  const { searchRecipes } = useRecipeStore.getState();

  const {
    data,
    error,
    status,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["recipes", debounceRecipe, limit],
    queryFn: async ({ pageParam = 1 }) =>
      await searchRecipes(debounceRecipe, pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) =>
      lastPage.length < limit ? undefined : pages.length + 1,
    enabled: debounceRecipe.length > 0,
  });

  const recipes = data?.pages.flat() ?? [];

  return (
    <>
      <div>
        <div className="my-12 rounded-xl border border-green-200 bg-white px-8 py-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-semibold text-green-800">
              Discover Recipes from Food.com
            </h1>
            <h1 className="text-gray-600">
              Search for recipes and rate the ones you try
            </h1>
          </div>
          <div className="relative mt-6">
            <IoSearchOutline className="absolute top-1/2 left-3 -translate-y-1/2 transform text-xl" />
            <input
              className="h-10 w-full rounded-lg border border-green-300 pl-12 hover:cursor-text"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes..."
            ></input>
          </div>
        </div>

        {debounceRecipe.length === 0 ? (
          <div className="w-full text-center text-green-700">
            Please search for a recipe using the search bar above
          </div>
        ) : status === "pending" ? (
          <RiLoader4Fill className="w-full animate-spin text-7xl text-green-600" />
        ) : error ? (
          <div className="w-full text-center text-red-600">{error.message}</div>
        ) : recipes.length > 0 ? (
          <div className="mb-10 flex w-full flex-col items-center">
            <RecipeModal />
            <div className="mb-20 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
              {recipes.map((item) => (
                <RecipeContainer
                  key={Math.random() * 10}
                  recipe={item}
                  matchPercentage={null}
                  liked={likedRecipes.includes(item.id)}
                />
              ))}
            </div>
            {hasNextPage && (
              <button
                className={`rounded-lg border border-green-600 bg-white px-2 text-green-600 ${!isFetchingNextPage && "hover:cursor-pointer hover:bg-green-100"}`}
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Loading" : "Show more"}
              </button>
            )}
          </div>
        ) : (
          <div className="w-full text-center text-green-700">
            There are no recipes with that name!
          </div>
        )}
      </div>
    </>
  );
}
