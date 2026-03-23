import { PiHeartbeatBold } from "react-icons/pi";

export default function Nutrition({ nutrition }: { nutrition: Array<number> }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-gray-100 px-4 py-4">
      <h1 className="flex items-center gap-1 text-xl text-green-600">
        <PiHeartbeatBold />
        Nutrition Information
      </h1>
      <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
        <div className="flex justify-between">
          <h1 className="text-gray-600">Calories:</h1>
          <h1>{nutrition[0]}</h1>
        </div>
        <div className="flex justify-between">
          <h1 className="text-gray-600">Total Fat:</h1>
          <h1>{nutrition[1]}g</h1>
        </div>
        <div className="flex justify-between">
          <h1 className="text-gray-600">Sugar:</h1>
          <h1>{nutrition[2]}g</h1>
        </div>
        <div className="flex justify-between">
          <h1 className="text-gray-600">Sodium:</h1>
          <h1>{nutrition[3]}g</h1>
        </div>
        <div className="flex justify-between">
          <h1 className="text-gray-600">Protein:</h1>
          <h1>{nutrition[4]}g</h1>
        </div>
        <div className="flex justify-between">
          <h1 className="text-gray-600">Saturated Fat:</h1>
          <h1>{nutrition[5]}g</h1>
        </div>
        <div className="flex justify-between">
          <h1 className="text-gray-600">Carbohydrates:</h1>
          <h1>{nutrition[6]}g</h1>
        </div>
      </div>
    </div>
  );
}
