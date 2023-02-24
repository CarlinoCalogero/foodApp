export type Food = {
    foodId: number,
    foodName: string,
}

export type FoodCombination = {
    food: Food,
    foodsAllowedCombinations: Food[],
    foodsNotAllowedCombinations: Food[]
}

export type FoodCombinationStatus = {
    food1: Food,
    food2: Food,
    combinationIsAllowedNotAllowedOrDoesNotExist: CombinationStatus
}

export enum CombinationStatus {
    ALLOWED,
    NOTALLOWED,
    DOESNOTEXIST
}