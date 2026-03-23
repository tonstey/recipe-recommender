import { PiTagBold } from "react-icons/pi";

export default function Tags({ tags }: { tags: Array<string> }) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-2 text-lg text-green-600">
          <PiTagBold />
          Tags
        </h1>
        <div className="flex flex-wrap gap-x-2 gap-y-1 px-4">
          {tags.map((item: string) => (
            <div
              className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-600"
              key={item}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
