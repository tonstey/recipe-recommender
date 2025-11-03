

export default function MiniRecipeContainer({recipe, matchPercentage}: {recipe:any, matchPercentage: number}) {
  return (
    <>
      <div className="flex flex-col bg-white px-8 py-6 gap-4 border border-green-100 rounded-xl hover:bg-green-50">

        <div className="flex justify-between items-start font-semibold text-lg text-green-800 ">
          <a className="font-semibold w-fit text-green-800 hover:underline" href="" target="_blank">
            {recipe.name}
          </a>
      
          <div className="flex gap-4 text-center flex-shrink-0">
            <h1 className="bg-green-100 text-green-700 w-fit px-3 rounded-full">{recipe.minutes} min</h1>
            <div className="bg-green-700 text-white w-fit px-3 rounded-full">{Math.round(matchPercentage * 100)}% match</div>
          </div>
        </div>

        <div className="text-gray-600 ">
          {recipe.description}
        </div>

        <div className="flex justify-between">
          <div className="flex gap-3  text-sm text-gray-600 ">
              <div className="">{Math.round(recipe.nutrition[0])} cal</div>
              <div className="">{recipe.nutrition[4]}g protein</div>
              <div className="">{recipe.n_ingredients} ingredients</div>
          </div>

          <div>STARSS</div>
        </div>

      </div>
    </>
  )
}