export default function MiniRecipeContainer({
  recipe,
  matchPercentage,
}: {
  recipe: any;
  matchPercentage: number;
}) {
  return (
    <>
      <div className="flex flex-col gap-4 rounded-xl border border-green-100 bg-white px-8 py-6 hover:bg-green-50">
        <div className="flex items-start justify-between text-lg font-semibold text-green-800">
          <a
            className="w-fit font-semibold text-green-800 hover:underline"
            href=""
            target="_blank"
          >
            {recipe.name}
          </a>

          <div className="flex shrink-0 gap-4 text-center">
            <h1 className="w-fit rounded-full bg-green-100 px-3 text-green-700">
              {recipe.minutes} min
            </h1>
            <div className="w-fit rounded-full bg-green-700 px-3 text-white">
              {Math.round(matchPercentage * 100)}% match
            </div>
          </div>
        </div>

        <div className="text-gray-600">{recipe.description}</div>

        <div className="flex justify-between">
          <div className="flex gap-3 text-sm text-gray-600">
            <div className="">{Math.round(recipe.nutrition[0])} cal</div>
            <div className="">{recipe.nutrition[4]}g protein</div>
            <div className="">{recipe.n_ingredients} ingredients</div>
          </div>

          <div>STARSS</div>
        </div>
      </div>
    </>
  );
}
