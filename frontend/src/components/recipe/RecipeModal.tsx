import * as Dialog from "@radix-ui/react-dialog";

import { useRecipeStore } from "../../store/recipe";
import { properNouns } from "../../tools/format";

import { useQuery } from "@tanstack/react-query";

import Description from "./modal/Description";
import Rating from "./modal/Rating";
import Nutrition from "./modal/Nutrition";
import Ingredients from "./modal/Ingredients";
import Instructions from "./modal/Instructions";
import Tags from "./modal/Tags";

import { PiLinkBold, PiXBold } from "react-icons/pi";
import { Ring2 } from "ldrs/react";
import "ldrs/react/Ring2.css";

export default function RecipeModal() {
  const displayRecipeID = useRecipeStore((state) => state.displayRecipeID);
  const setDisplayRecipeID = useRecipeStore(
    (state) => state.setDisplayRecipeID,
  );

  const isOpen = !!displayRecipeID;

  const {
    data: displayRecipe,
    error,
    status,
  } = useQuery({
    queryKey: ["recipe", displayRecipeID],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.BACKEND_URL}/api/recipes/${displayRecipeID}`,
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Error in fetching recipe.");
      }
      return data;
    },
    enabled: !!displayRecipeID,
  });

  return (
    <>
      <Dialog.Root
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDisplayRecipeID(0);
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />

          <Dialog.Content className="fixed top-1/2 left-1/2 mt-12 max-h-[85vh] w-[85%] -translate-x-1/2 -translate-y-1/2 overflow-y-scroll rounded-xl bg-white p-6 shadow-lg">
            {error && <div className="text-red-600">{error.message}</div>}

            <Dialog.Close
              className="absolute top-3 right-3 rounded-lg p-1 hover:cursor-pointer hover:bg-gray-200"
              onClick={() => setDisplayRecipeID(0)}
            >
              <PiXBold className="text-xl" />
            </Dialog.Close>

            {status === "pending" ? (
              <Dialog.Title>
                <div className="flex w-full justify-center">
                  <Ring2 size={60} stroke={6} />
                </div>
                <Dialog.Description className="hidden" />
              </Dialog.Title>
            ) : (
              !!displayRecipe && (
                <div className="flex flex-col gap-4">
                  <Dialog.Title className="flex max-w-[95%] items-center gap-2 text-3xl font-bold text-green-600">
                    {properNouns(displayRecipe.name)}
                    <a
                      className="w-fit rounded-full bg-gray-200 px-1 py-1 text-xl text-green-800"
                      href={`https://www.food.com/recipe/${displayRecipe.name.replace(" ", "-")}-${displayRecipe.id}`}
                      target="_blank"
                    >
                      <PiLinkBold />
                    </a>
                    <Dialog.Description className="hidden" />
                  </Dialog.Title>

                  <Description
                    minutes={displayRecipe.minutes}
                    n_ingredients={displayRecipe.n_ingredients}
                    n_steps={displayRecipe.n_steps}
                    description={displayRecipe.description}
                  />

                  <Rating />

                  <Nutrition nutrition={displayRecipe.nutrition} />

                  <div>
                    <Ingredients
                      n_ingredients={displayRecipe.n_ingredients}
                      ingredients={displayRecipe.ingredients}
                    />
                    <hr className="my-3 h-px border-none bg-gray-300" />
                    <Instructions
                      n_instructions={displayRecipe.n_instructions}
                      instructions={displayRecipe.steps}
                    />
                  </div>
                  <Tags tags={displayRecipe.tags} />
                </div>
              )
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
