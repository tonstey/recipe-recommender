

export default function RecipeContainer({recipe, matchPercentage}: {recipe:any, matchPercentage: number | null}) {
  return (
    <>
      <div className="flex flex-col bg-white px-8 py-6 gap-4 hover:shadow-lg rounded-lg">

        <a className="font-semibold text-xl w-fit text-green-800 hover:underline" href="" target="_blank">
          {recipe.name}
        </a>

        <div className="flex gap-4 text-center">
          <h1 className="bg-green-100 text-green-700 w-fit px-3 rounded-full font-semibold">{recipe.minutes} min</h1>
          <h1 className="text-green-600 border border-green-200 w-fit rounded-full px-3 font-semibold">{recipe.n_ingredients} ingredients</h1>
          {matchPercentage ? <div className="bg-green-700 text-white w-fit px-3 rounded-full font-semibold">{Math.round(matchPercentage * 100)}% match</div> : ''}
        </div>

        <div className="text-gray-600 text-md mb-4">
          {recipe.description}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-green-50 rounded-lg">
          <div className="text-center">
            <div className="font-semibold text-green-700">{Math.round(recipe.nutrition[0])}</div>
            <div className="text-sm text-gray-600">calories</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-700">{recipe.nutrition[4]}g</div>
            <div className="text-sm text-gray-600">protein</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-700">{recipe.nutrition[1]}g</div>
            <div className="text-sm text-gray-600">fat</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 items-center">
          {recipe.tags.slice(0, 4).map((tag: string) => (
            <div key={tag} className="text-sm bg-green-100 text-green-600 border-green-200 px-2 py-0.5 rounded-full">
              {tag.replace(/-/g, " ")}
            </div>
          ))}
          {recipe.tags.length > 4 && (
            <div className="text-xs bg-gray-50 text-gray-500">
              +{recipe.tags.length - 4} more
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-green-100">
          <div className="flex items-center gap-2">
         
            <span className="text-sm text-gray-500">(4.2)</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs text-gray-500">Your rating:</span>
          </div>
        </div>
      </div>
    </>
  )
}