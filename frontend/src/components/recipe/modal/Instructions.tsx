import { PiChefHatBold } from "react-icons/pi";

export default function Instructions({
  n_instructions,
  instructions,
}: {
  n_instructions: number;
  instructions: Array<string>;
}) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-1 text-xl text-green-600">
          <PiChefHatBold />
          Instructions ({n_instructions} steps)
        </h1>
        <div className="flex flex-col gap-2 px-4">
          {instructions.map((item: string, index: number) => (
            <div className="flex gap-2" key={item}>
              <h1 className="text-md min-h-7 min-w-7 rounded-full bg-green-700 pt-0.5 text-center font-semibold text-white">
                {index + 1}
              </h1>
              <h1 className="pt-0.75 text-sm text-gray-600">
                {item.at(0)?.toUpperCase() + item.slice(1)}
              </h1>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
