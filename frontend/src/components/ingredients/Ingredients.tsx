import type { Ingredient } from "../../models/pantry";

import { useUserStore } from "../../store/user";
import { usePantryStore } from "../../store/pantry";

import { properNouns } from "../../tools/format";

export default function Ingredients({
  ingredient,
}: {
  ingredient: Ingredient;
}) {
  const token = useUserStore((state) => state.token);
  const { editIngredient } = usePantryStore.getState();

  return (
    <>
      <div className="w-fit rounded-full bg-green-100 px-3 hover:cursor-pointer hover:bg-green-200">
        <div
          className="flex min-h-6 items-center text-center text-green-800"
          onClick={async () =>
            await editIngredient(token, ingredient.id, "remove")
          }
        >
          {`${properNouns(ingredient.name)} `}
          <div className="ml-2 text-center text-gray-600">x</div>
        </div>
      </div>
    </>
  );
}
