export function properNouns(word: string) {
  let separated = word.split(" ");
  let capitalize = separated.map(
    (word) => word[0].toUpperCase() + word.slice(1, word.length),
  );

  return capitalize.join(" ");
}
