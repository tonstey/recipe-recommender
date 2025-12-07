export interface Recipe {
  name: string;
  id: number;
  minutes: number;
  tags: Array<string>;
  nutrition: Array<number>;
  n_steps: number;
  steps: Array<string>;
  description: string;
  ingredients: Array<string>;
  n_ingredients: number;
}

export const BaseRecipe: Recipe = {
  name: "",
  id: 0,
  minutes: 0,
  tags: [],
  nutrition: [],
  n_steps: 0,
  steps: [],
  description: "",
  ingredients: [],
  n_ingredients: 0,
};
