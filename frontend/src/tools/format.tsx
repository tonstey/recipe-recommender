export function properNouns(word: string) {
  let separated = word.split(" ");
  let capitalize = separated.map(
    (word) => word[0].toUpperCase() + word.slice(1, word.length),
  );

  return capitalize.join(" ");
}

export function properSentences(sentence: string) {
  let period = sentence
    .split(". ")
    .map((sent) => sent[0].toUpperCase() + sent.slice(1))
    .join(". ");
  let question = period
    .split("? ")
    .map((sent) => sent[0].toUpperCase() + sent.slice(1))
    .join("? ");
  return question
    .split("! ")
    .map((sent) => sent[0].toUpperCase() + sent.slice(1))
    .join("! ");
}
