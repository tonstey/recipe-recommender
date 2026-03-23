import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useDebounce } from "../../tools/debounce";

import { usePantryStore } from "../../store/pantry";
import { useUserStore } from "../../store/user";

import type { Ingredient } from "../../models/pantry";
import type { SelectOption } from "../../models/option";

import Ingredients from "./Ingredients";
import IngredientOption from "./IngredientOption";

import Select, { type SingleValue } from "react-select";

export default function SearchIngredient() {
  const [ingredientInput, setIngredientInput] = useState("");
  const debounceIngredient = useDebounce(ingredientInput, 500);

  const token = useUserStore((state) => state.token);
  const pantry = usePantryStore((state) => state.pantry);

  const { searchIngredient, editIngredient } = usePantryStore.getState();

  const { data, error, status } = useQuery({
    queryKey: ["ingredients", debounceIngredient],
    queryFn: async () => await searchIngredient(debounceIngredient),
    enabled: debounceIngredient.length > 0,
  });

  // Filters ingredients already in pantry & formats for search bar
  const searchResult =
    data
      ?.filter(
        (ing: Ingredient) =>
          !pantry.some((pantryIng: Ingredient) => pantryIng.id === ing.id),
      )
      .map((ing: Ingredient) => ({
        label: ing.name,
        value: ing.id,
        inPantry: ing.inPantry,
      })) ?? [];
  //

  // Click on search item to add to pantry
  const addIngredient = async (selected: SingleValue<SelectOption>) => {
    const convert = {
      name: selected?.label,
      id: selected?.value,
      inPantry: selected?.inPantry,
    };
    if (convert?.id && !pantry.some((item) => item.id === convert.id)) {
      const result = await editIngredient(token, convert.id, "add");

      if (!result.success) {
        alert(result.error);
        return;
      }
    }
    setIngredientInput("");
  };
  //

  return (
    <>
      <div className="flex h-fit flex-1 flex-col gap-6 rounded-xl border border-green-200 bg-white px-8 py-8">
        <div>
          <h1 className="text-3xl font-semibold text-green-800">
            My Available Ingredients
          </h1>
          <h1 className="text-gray-600">Add ingredients you have on hand</h1>
        </div>
        <div className="flex w-full flex-col gap-4">
          <div className="relative">
            <Select<SelectOption, false>
              options={searchResult}
              placeholder="Search for an ingredient..."
              isLoading={status === "pending"}
              inputValue={ingredientInput}
              onInputChange={(input) => setIngredientInput(input)}
              onChange={addIngredient}
              components={{
                Option: IngredientOption,
                DropdownIndicator: () => null,
                IndicatorSeparator: () => null,
                LoadingIndicator: () => null,
              }}
              noOptionsMessage={() =>
                error?.message
                  ? error.message
                  : ingredientInput
                    ? "No results found."
                    : "Start typing above!"
              }
              styles={{
                option: (base, props) => ({
                  ...base,
                  cursor: props.data.inPantry ? "not-allowed" : "pointer",
                  backgroundColor: props.data.inPantry
                    ? "#9ca3af"
                    : props.isFocused
                      ? "#bbf7d0"
                      : undefined,
                }),
              }}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {pantry.length > 0 ? (
              pantry.map((i) => <Ingredients ingredient={i} key={i.id} />)
            ) : (
              <h1 className="text-gray-500 italic">No ingredients added yet</h1>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
