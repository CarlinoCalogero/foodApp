export type Food = {
    foodId: number,
    foodName: string,
}

export type FoodCombination = {
    food: Food,
    foodsAllowedCombinations: Food[],
    foodsNotAllowedCombinations: Food[]
}