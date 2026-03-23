import { properNouns } from "../../tools/format";

import { useRecipeStore } from "../../store/recipe";

import { GoHeart, GoHeartFill } from "react-icons/go";

export default function RecipeContainer({
  recipe,
  matchPercentage,
  liked,
}: {
  recipe: any;
  matchPercentage: number | null;
  liked: boolean;
}) {
  const { setDisplayRecipeID } = useRecipeStore.getState();

  return (
    <>
      <div
        className="flex h-112 flex-col justify-evenly gap-4 rounded-lg bg-white px-8 py-6 transition-all duration-200 hover:scale-105 hover:cursor-pointer hover:shadow-lg"
        onClick={() => {
          setDisplayRecipeID(recipe.id);
        }}
      >
        <div className="flex w-full justify-between">
          <h1 className="w-fit text-xl font-semibold text-green-800">
            {properNouns(recipe.name)}
          </h1>
          <div>
            {liked ? (
              <GoHeartFill className="text-4xl text-green-700 hover:cursor-pointer hover:text-green-500" />
            ) : (
              <GoHeart className="text-4xl text-green-700 hover:cursor-pointer hover:text-green-400" />
            )}
          </div>
        </div>

        <div className="flex gap-4 text-center">
          <h1 className="w-fit rounded-full bg-green-100 px-3 font-semibold text-green-700">
            {recipe.minutes} min
          </h1>
          <h1 className="w-fit rounded-full border border-green-200 px-3 font-semibold text-green-600">
            {recipe.n_ingredients} ingredients
          </h1>
          {matchPercentage ? (
            <div className="w-fit rounded-full bg-green-700 px-3 font-semibold text-white">
              {Math.round(matchPercentage * 100)}% match
            </div>
          ) : (
            ""
          )}
        </div>

        <div className="text-md mb-4 max-h-60 overflow-hidden overflow-ellipsis text-gray-600">
          {recipe.description}
        </div>

        <div className="mb-4 grid grid-cols-3 gap-3 rounded-lg bg-green-50 p-3">
          <div className="text-center">
            <div className="font-semibold text-green-700">
              {Math.round(recipe.nutrition[0])}
            </div>
            <div className="text-sm text-gray-600">calories</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-700">
              {recipe.nutrition[4]}g
            </div>
            <div className="text-sm text-gray-600">protein</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-700">
              {recipe.nutrition[1]}g
            </div>
            <div className="text-sm text-gray-600">fat</div>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {recipe.tags.slice(0, 4).map((tag: string) => (
            <div
              key={tag}
              className="rounded-full border-green-200 bg-green-100 px-2 py-0.5 text-sm text-green-600"
            >
              {tag.replace(/-/g, " ")}
            </div>
          ))}
          {recipe.tags.length > 4 && (
            <div className="bg-gray-50 text-xs text-gray-500">
              +{recipe.tags.length - 4} more
            </div>
          )}
        </div>

        <h1 className="text-xs text-gray-500">Click to expand</h1>
      </div>
    </>
  );
}
