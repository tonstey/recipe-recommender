import { useState } from "react";

import NavBar from "./components/NavBar.tsx";
import RecipeTab from "./pages/RecipeTab.tsx";
import IngredientsTab from "./pages/IngredientsTab.tsx";

function App() {
  const [activeTab, setActiveTab] = useState("recipes");

  return (
    <>
      <NavBar />
      <div className="w-screen border px-24">
        <div className="my-12 flex h-12 w-full items-center rounded bg-green-100 px-2 py-1">
          <h1
            className={`flex h-10 flex-1 items-center justify-center rounded-sm text-center font-semibold transition duration-200 ease-linear ${activeTab === "recipes" ? "bg-green-600 text-white" : "text-gray-600"} hover:cursor-pointer`}
            onClick={() => setActiveTab("recipes")}
          >
            Search & Rate Recipes
          </h1>
          <h1
            className={`flex h-10 flex-1 items-center justify-center rounded-sm text-center font-semibold transition duration-200 ease-linear ${activeTab === "ingredients" ? "bg-green-600 text-white" : "text-gray-600"} hover:cursor-pointer`}
            onClick={() => setActiveTab("ingredients")}
          >
            My Ingredients
          </h1>
        </div>

        {activeTab === "recipes" ? <RecipeTab /> : <IngredientsTab />}
      </div>
    </>
  );
}

export default App;
