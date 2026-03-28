import { useState } from "react";

import NavBar from "./components/NavBar.tsx";
import RecipeTab from "./pages/RecipeTab.tsx";
import IngredientsTab from "./pages/IngredientsTab.tsx";

function App() {
  const [activeTab, setActiveTab] = useState<"recipes" | "ingredients">(
    "recipes",
  );

  return (
    <>
      <div className="relative overflow-auto">
        <NavBar />
        <div className="relative mt-24 w-full px-10 md:px-24">
          <div className="my-12 flex h-12 w-full items-center rounded bg-green-100 px-2 py-1">
            <h1
              className={`md:text-md flex h-10 flex-1 items-center justify-center rounded-sm text-center text-sm font-semibold transition duration-200 ease-linear ${activeTab === "recipes" ? "bg-green-600 text-white" : "text-gray-600"} hover:cursor-pointer`}
              onClick={() => setActiveTab("recipes")}
            >
              Search & Rate Recipes
            </h1>
            <h1
              className={`md:text-md flex h-10 flex-1 items-center justify-center rounded-sm text-center text-sm font-semibold transition duration-200 ease-linear ${activeTab === "ingredients" ? "bg-green-600 text-white" : "text-gray-600"} hover:cursor-pointer`}
              onClick={() => setActiveTab("ingredients")}
            >
              My Ingredients
            </h1>
          </div>

          {activeTab === "recipes" ? <RecipeTab /> : <IngredientsTab />}
        </div>
      </div>
    </>
  );
}

export default App;
