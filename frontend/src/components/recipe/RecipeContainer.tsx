import { GoHeart, GoHeartFill } from "react-icons/go";
import { properNouns } from "../../tools/format";

export default function RecipeContainer({
  recipe,
  matchPercentage,
  liked,
}: {
  recipe: any;
  matchPercentage: number | null;
  liked: boolean;
}) {
  return (
    <>
      <div className="flex flex-col gap-4 rounded-lg bg-white px-8 py-6 transition-all duration-200 hover:scale-105 hover:shadow-lg">
        <div className="flex w-full justify-between">
          <a
            className="w-fit text-xl font-semibold text-green-800 hover:underline"
            href={`https://www.food.com/recipe/${recipe.name.replace(" ", "-")}-${recipe.id}`}
            target="_blank"
          >
            {properNouns(recipe.name)}
          </a>
          <div>
            {liked ? (
              <GoHeartFill className="text-4xl text-green-700 hover:cursor-pointer hover:text-green-500" />
            ) : (
              <GoHeart className="text-4xl text-green-700 hover:cursor-pointer hover:text-green-500" />
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

        <div className="flex items-center justify-between border-t border-green-100 pt-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">(4.2)</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs text-gray-500">Your rating:</span>
          </div>
        </div>
      </div>
    </>
  );
}
