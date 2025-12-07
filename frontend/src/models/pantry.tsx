export interface Ingredient {
  name: string;
  id: number;
  inPantry?: boolean;
}

export const BaseIngredient: Ingredient = {
  name: "",
  id: 0,
};
