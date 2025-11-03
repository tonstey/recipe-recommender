import { useState } from "react"
import Ingredients from "../components/ingredients/Ingredients"

import MiniRecipeContainer from "../components/recipe/MiniRecipeContainer"
import RecipeContainer from "../components/recipe/RecipeContainer"

import recipes from "../data/recipedata"

export default function IngredientsTab() {
  const [ingredientInput, setIngredientInput] = useState("")
  const [ingredientList, setIngredientList] = useState<string[]>([])

  const addIngredient = (ingredient:string) => {
    setIngredientList(prev=>[...prev, ingredient])
    setIngredientInput("")
  }

  const removeIngredient = (ingredient:string) => [
    setIngredientList(prev=> prev.filter(item => item != ingredient))
  ]

  return (
    <>
      <div className="flex gap-2 w-full my-12">
        <div className="bg-white border border-green-200 px-8 py-8 rounded-xl flex-1 flex flex-col gap-6 h-fit">
          <div>
            <h1 className="text-green-800 text-3xl font-semibold">My Available Ingredients</h1>
            <h1 className="text-gray-600">Add ingredients you have on hand</h1>
          </div>

          <div className="flex w-full gap-4">
            <input className="border border-green-300 flex-1 pl-4 py-1 text-lg" type="text" placeholder="Add an ingredient..." value={ingredientInput} onChange={(e)=>setIngredientInput(e.target.value)}></input>
            <button className="bg-green-600 text-white h-10 w-10 rounded-lg text-lg hover:cursor-pointer hover:bg-green-700" onClick={()=>addIngredient(ingredientInput)}>+</button>
          </div>

          <div className="flex flex-wrap gap-2">
            {ingredientList.length > 0 ? 
              ingredientList.map(i => <Ingredients ingredient={i} removeIngredient={removeIngredient}/>) :
              <h1 className="text-gray-500 italic">No ingredients added yet</h1>
            }
          </div>
        </div>

        <div className="bg-white border border-green-200 px-8 py-8 rounded-xl flex-1">
          <div>
            <h1 className="text-green-800 text-3xl font-semibold">Recipe Recommendations</h1>
            <h1 className="text-gray-600">Based on your available ingredients and preferences</h1>
            {ingredientList.length > 4 ? 
              <div className="flex flex-col gap-3 mt-6">
                {recipes.map(item => <MiniRecipeContainer key={15} recipe={item} matchPercentage={0.143}/>)}
              </div>:
              <h1 className="text-gray-500 text-center py-8">Add some ingredients to see recommendations</h1>
            }
          </div>
 
        </div>

        
      </div>

      <div className="">
        <h1 className="text-2xl font-bold text-green-800 mb-4">All Recommendations</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
              {recipes.map(item => <RecipeContainer key={2} recipe={item} matchPercentage={0.5}/>)}
        </div>
      </div>
    </>
  )
}