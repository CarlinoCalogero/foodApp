export type Food = {
    foodId: number,
    foodName: string,
}

export type FoodPair = [Food, Food];

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

export type FoodCombinationStatusCompleteView = {
    completeFoodCombinationStatus: FoodCombinationStatus[],
    allowedFoodCombinations: FoodPair[],
    notAllowedFoodCombinations: FoodPair[],
    notExistingFoodCombinations: FoodPair[]
}

export enum CombinationStatus {
    ALLOWED,
    NOTALLOWED,
    DOESNOTEXIST
}