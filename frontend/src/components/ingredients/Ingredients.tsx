import type { Ingredient } from "../../models/pantry";
import { usePantryStore } from "../../store/pantry";

export default function Ingredients({
  ingredient,
}: {
  ingredient: Ingredient;
}) {
  const { editIngredient } = usePantryStore.getState();

  return (
    <>
      <div className="w-fit rounded-full bg-green-100 px-3 hover:cursor-pointer hover:bg-green-200">
        <div
          className="flex h-6 items-center text-center text-green-800"
          onClick={async () => await editIngredient(ingredient.id, "remove")}
        >
          {`${ingredient.name} `}
          <div className="ml-2 text-center text-gray-600">x</div>
        </div>
      </div>
    </>
  );
}
