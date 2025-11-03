export default function Ingredients({ingredient, removeIngredient}: {ingredient: string, removeIngredient:Function}) {
  return (
    <>
    
      <div className="w-fit bg-green-100 rounded-full px-3  hover:bg-green-200 hover:cursor-pointer">
        <div className="text-green-800 h-6 flex text-center items-center" onClick={() => removeIngredient(ingredient)}>{ingredient}   <div className="ml-2 text-center text-gray-600">x</div></div>
      </div>
    </>
  )
}