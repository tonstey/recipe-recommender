import { useState } from "react";

import { IoSearchOutline } from "react-icons/io5";

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <>
      <div className="bg-white border border-green-200 px-8 py-8 rounded-xl my-12">
        <div className="flex flex-col gap-1">
          <h1 className="text-green-800 text-3xl font-semibold">Discover Recipes</h1>
          <h1 className="text-gray-600 ">Search for recipes and rate the ones you try</h1>
        </div>
        <div className="relative mt-6">
          <IoSearchOutline className="absolute top-1/2 transform -translate-y-1/2 left-3 text-xl"/>
          <input className="w-full pl-12 border border-green-300 rounded-lg h-10" type="text" value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} placeholder="Search recipes..."></input>
        </div>
      </div>
    </>
  )
}