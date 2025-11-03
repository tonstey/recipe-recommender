import { LuChefHat } from "react-icons/lu";
import { BsPerson } from "react-icons/bs";

export default function NavBar() {
  return (
    <>
      <div className="sticky top-0 right-0 left-0 bg-white h-20 flex items-center justify-between px-24 shadow-lg">
        <div className="flex gap-2 items-center">
          <LuChefHat className="text-green-600 text-5xl" />
          <h1 className="text-3xl text-green-800 font-bold">Savorly</h1>
        </div>
        <div className="flex gap-3 items-center">
          <div className="rounded-full p-2 bg-slate-300">
            <BsPerson className="text-2xl" />
          </div>
          <h1 className="text-lg">Welcome back {"user"}</h1>
        </div>
      </div>
    </>
  );
}
