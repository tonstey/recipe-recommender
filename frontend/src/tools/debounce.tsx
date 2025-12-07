import { useState, useEffect } from "react";

export const useDebounce = (query: string, delay = 500) => {
  const [debounceValue, setDebounceValue] = useState("");

  useEffect(() => {
    const timeoutID = setTimeout(() => {
      setDebounceValue(query);
    }, delay);

    return () => clearTimeout(timeoutID);
  }, [query, delay]);

  return debounceValue;
};
