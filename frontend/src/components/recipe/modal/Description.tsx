import { PiChefHatBold, PiClockBold, PiForkKnifeBold } from "react-icons/pi";

export default function Description({
  minutes,
  n_steps,
  n_ingredients,
  description,
}: {
  minutes: number;
  n_steps: number;
  n_ingredients: number;
  description: string;
}) {
  return (
    <>
      <div className="flex flex-col gap-2 rounded-xl bg-green-50 px-4 py-4">
        <div className="flex gap-2 text-sm">
          <h1 className="flex items-center gap-1 rounded-full bg-green-500 px-2 py-1 text-white">
            <PiClockBold />
            {minutes} minutes
          </h1>
          <h1 className="flex items-center gap-1">
            <PiChefHatBold className="text-green-500" />
            {n_steps} steps
          </h1>
          <h1 className="flex items-center gap-1">
            <PiForkKnifeBold className="text-green-500" />
            {n_ingredients + " "}
            Ingredients
          </h1>
        </div>
        <div>{description}</div>
      </div>
    </>
  );
}
