import { PiForkKnifeBold } from "react-icons/pi";
import { properNouns } from "../../../tools/format";

export default function Ingredients({
  n_ingredients,
  ingredients,
}: {
  n_ingredients: number;
  ingredients: Array<string>;
}) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-1 text-xl text-green-600">
          <PiForkKnifeBold />
          Ingredients ({n_ingredients})
        </h1>
        <div className="grid grid-cols-1 gap-1 px-4 md:grid-cols-2 xl:grid-cols-3">
          {ingredients.map((item: string) => (
            <div className="flex items-center gap-1" key={item}>
              <h1 className="h-2 w-2 rounded-full bg-green-600"> </h1>
              <h1 className="text-sm text-gray-600">{properNouns(item)}</h1>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
