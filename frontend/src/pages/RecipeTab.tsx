import RecipeContainer from "../components/recipe/RecipeContainer";
import SearchBar from "../components/recipe/SearchBar";
import recipes from "../data/recipedata";


export default function RecipeTab() {
  return (
    <>
      <div>

        <SearchBar />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-20">
          {recipes.map(item => <RecipeContainer key={4} recipe={item} matchPercentage={null}/>)}
        </div>


      </div>
    </>
  )
}