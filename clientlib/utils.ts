import { CombinationStatus, Food, FoodCombination, FoodCombinationStatus, FoodCombinationStatusCompleteView, FoodPair } from "@/types/Food";
import foods from "content/foods.json"

export function getAllFood() {
    return foods;
}

export function getFoodsFromId(foodsId: number[]) {
    let foodsFromId: Food[] = [];
    foodsId.forEach((id) => {
        const foundFood = foods.find(food => food.foodId === id)
        if (foundFood)
            foodsFromId.push(foundFood)
    })
    return foodsFromId;
}

export function sortFoodCombinationsByAscendingFoodId(
    combinations: FoodCombination[]
) {
    combinations.sort((combination1, combination2) => {
        if (combination1.food.foodId > combination2.food.foodId) {
            return 1;
        } else if (combination1.food.foodId < combination2.food.foodId) {
            return -1;
        }
        return 0;
    });
}

export function sortFoodByAscendingFoodId(foods: Food[]) {
    foods.sort((food1, food2) => {
        if (food1.foodId > food2.foodId) {
            return 1;
        } else if (food1.foodId < food2.foodId) {
            return -1;
        }
        return 0;
    });
}

export function handleCombinationsUpdate(
    newCombinations: FoodCombination[],
    combinations: FoodCombination[],
    isGlycemiaNormal: boolean
) {
    //merge the old and the new food combinations
    let mergedCombinations = newCombinations.concat(combinations);
    //sort our array in order to decrease future operations' computation time
    sortFoodCombinationsByAscendingFoodId(mergedCombinations);
    //let's clear our combination array
    newCombinations = [];
    //do our combination logic
    mergedCombinations.forEach((foodCombination) => {
        //find the index of this food combination
        const index = newCombinations.findIndex(
            (combination) => combination.food === foodCombination.food
        );
        if (index > -1) {
            //if true there is already a combination so we just merge the two entries

            //create an array for merging the old and new foodsAllowedCombinations/foodsNotAllowedCombinations array of this food
            let mergedAllowedOrNotAllowedFoodCombinations: Food[] = [];
            //create an array to store the reference of the foodsAllowedCombinations/foodsNotAllowedCombinations array
            let foodsAllowedNotAllowedCombination: Food[] = [];
            //check if glycemia's normal (we are talking about an allowed combination) or not (we are talking about a not allowed combination)
            if (isGlycemiaNormal) {
                //if true merge the old and new foodsAllowedCombinations array of this food
                mergedAllowedOrNotAllowedFoodCombinations = newCombinations[
                    index
                ].foodsAllowedCombinations.concat(
                    foodCombination.foodsAllowedCombinations
                );
                //clear foodsAllowedCombinations array
                newCombinations[index].foodsAllowedCombinations = [];
                //set the reference array to the foodsAllowedCombinations array
                foodsAllowedNotAllowedCombination =
                    newCombinations[index].foodsAllowedCombinations;
                //save foodsNotAllowedCombinations if present any
                newCombinations[index].foodsNotAllowedCombinations =
                    foodCombination.foodsNotAllowedCombinations;
            } else {
                //if false merge the old and new foodsNotAllowedCombinations array of this food
                mergedAllowedOrNotAllowedFoodCombinations = newCombinations[
                    index
                ].foodsNotAllowedCombinations.concat(
                    foodCombination.foodsNotAllowedCombinations
                );
                //clear foodsNotAllowedCombinations array
                newCombinations[index].foodsNotAllowedCombinations = [];
                //set the reference array to the foodsNotAllowedCombinations array
                foodsAllowedNotAllowedCombination =
                    newCombinations[index].foodsNotAllowedCombinations;
                //save foodsAllowedCombinations if present any
                newCombinations[index].foodsAllowedCombinations =
                    foodCombination.foodsAllowedCombinations;
            }
            //sort merged foodsAllowedCombinations/foodsNotAllowedCombinations arrays
            sortFoodByAscendingFoodId(mergedAllowedOrNotAllowedFoodCombinations);
            //re-populate foodsAllowedCombinations/foodsNotAllowedCombinations array
            mergedAllowedOrNotAllowedFoodCombinations.forEach(
                (allowedNotAllowedFood) => {
                    if (
                        !foodsAllowedNotAllowedCombination.find(
                            (food) => food === allowedNotAllowedFood
                        )
                    ) {
                        //if true we add the allowed/not allowed food to the array because it's not present
                        foodsAllowedNotAllowedCombination.push(allowedNotAllowedFood);
                    }
                }
            );
        } else {
            //if false we just add the new combination

            newCombinations.push(foodCombination);
        }
    });
    return newCombinations;
}

//checks if a food combination exists, is allowed or is not allowed
export function checkFoodCombinationStatus(selectedFoods: Food[], combinations: FoodCombination[]) {

    //if true we do not even have one combination already registered
    if (combinations.length == 0) {
        console.log("We do not even have one combination already registered");
        return null;
    }

    //create an array to store if a food combination exists, is allowed or is not allowed
    let foodCombinationsStatus: FoodCombinationStatus[] = [];
    //figure out which food combinations is allowed, not allowed or does not exist and store data in the array
    selectedFoods.forEach((food) => {
        const index = combinations.findIndex(
            (combination) => combination.food === food
        );

        if (index > -1) {
            //if true the food has already some combinations already registered

            selectedFoods.forEach((foodToFigureOutCombinationStatusWith) => {
                if (foodToFigureOutCombinationStatusWith != food) {
                    //if true we are not examining the same food

                    console.log(foodToFigureOutCombinationStatusWith, food);


                    if (
                        combinations[index].foodsAllowedCombinations.find(
                            (foodAllowed) =>
                                foodAllowed === foodToFigureOutCombinationStatusWith
                        )
                    ) {
                        //if true the food combination is allowed

                        foodCombinationsStatus.push({
                            food1: food,
                            food2: foodToFigureOutCombinationStatusWith,
                            combinationIsAllowedNotAllowedOrDoesNotExist:
                                CombinationStatus.ALLOWED,
                        });
                    } else if (
                        combinations[index].foodsNotAllowedCombinations.find(
                            (foodNotAllowed) =>
                                foodNotAllowed === foodToFigureOutCombinationStatusWith
                        )
                    ) {
                        //if true the food combination is not allowed

                        foodCombinationsStatus.push({
                            food1: food,
                            food2: foodToFigureOutCombinationStatusWith,
                            combinationIsAllowedNotAllowedOrDoesNotExist:
                                CombinationStatus.NOTALLOWED,
                        });
                    } else {
                        //food combination does not exist

                        foodCombinationsStatus.push({
                            food1: food,
                            food2: foodToFigureOutCombinationStatusWith,
                            combinationIsAllowedNotAllowedOrDoesNotExist:
                                CombinationStatus.DOESNOTEXIST,
                        });
                    }
                }
            });

        } else {
            //if false the food does not have some combinations already registered

            return console.log(
                "Food does not have combinations", food
            );
        }
    });

    // create an array to store all food informations
    let completedFoodCombinationStatus: FoodCombinationStatusCompleteView = {
        completeFoodCombinationStatus: foodCombinationsStatus,
        allowedFoodCombinations: [], //create an array to store allowed food combination
        notAllowedFoodCombinations: [], //create an array to store not allowed food combination
        notExistingFoodCombinations: [] //create an array to store not existing food combination
    };

    // if true all the selected foods do not have some combinations already registered
    if (foodCombinationsStatus.length == 0) {
        console.log("All selected foods do not have some combinations already registered");
        completedFoodCombinationStatus.completeFoodCombinationStatus = foodCombinationsStatus
        return completedFoodCombinationStatus;
    }
    //if false we now have all the combinations status written between the selected foods stored in an array

    //create a new array in order to skim the foodCombinationsStatus array
    let skimmedFoodCombinationsStatus: FoodCombinationStatus[] = [];
    //skim the foodCombinationsStatus array
    foodCombinationsStatus.forEach((combinationStatus) => {
        if (
            !skimmedFoodCombinationsStatus.find(
                (combination) =>
                    combination.food1 === combinationStatus.food1 &&
                    combination.food2 === combinationStatus.food2
            ) &&
            !skimmedFoodCombinationsStatus.find(
                (combination) =>
                    combination.food1 === combinationStatus.food2 &&
                    combination.food2 === combinationStatus.food1
            )
        ) {
            //if true we add the combination status to the skimmedFoodCombinationsStatus array

            skimmedFoodCombinationsStatus.push(combinationStatus);
        }
    });

    //sort the skimmed food combination status
    skimmedFoodCombinationsStatus.forEach((skimmedfoodCombination) => {

        if (
            skimmedfoodCombination.combinationIsAllowedNotAllowedOrDoesNotExist ===
            CombinationStatus.ALLOWED
        ) {
            //if true we add it to the array to store not allowed food combination

            completedFoodCombinationStatus.allowedFoodCombinations.push([
                skimmedfoodCombination.food1,
                skimmedfoodCombination.food2,
            ]);
        }

        if (
            skimmedfoodCombination.combinationIsAllowedNotAllowedOrDoesNotExist ===
            CombinationStatus.NOTALLOWED
        ) {
            //if true we add it to the array to store not allowed food combination

            completedFoodCombinationStatus.notAllowedFoodCombinations.push([
                skimmedfoodCombination.food1,
                skimmedfoodCombination.food2,
            ]);
        }

        if (
            skimmedfoodCombination.combinationIsAllowedNotAllowedOrDoesNotExist ===
            CombinationStatus.DOESNOTEXIST
        ) {
            //if true we add it to the array to store not existing food combination

            completedFoodCombinationStatus.notExistingFoodCombinations.push([
                skimmedfoodCombination.food1,
                skimmedfoodCombination.food2,
            ]);
        }


    });

    return completedFoodCombinationStatus;

}

//populates newCombination array with an allowed or a not allowed food combination
export function populateNewCombinationArray(selectedFoods: Food[], isAllowedCombination: boolean) {

    //create a new array to update the combinations
    let newCombinations: FoodCombination[] = [];

    if (isAllowedCombination) {

        //populate the new combinations array
        selectedFoods.forEach((food) =>
            newCombinations.push({
                food: food,
                foodsAllowedCombinations: selectedFoods.filter(
                    (selectedFood) => selectedFood != food
                ),
                foodsNotAllowedCombinations: [],
            })
        );


    } else {

        selectedFoods.forEach((food) =>
            newCombinations.push({
                food: food,
                foodsAllowedCombinations: [],
                foodsNotAllowedCombinations: selectedFoods.filter(
                    (selectedFood) => selectedFood != food
                ),
            })
        );

    }

    return newCombinations;

}

export function handleFoodLogic(selectedOption: any, combinations: FoodCombination[], data: any) {

    //fetch food data
    let foodsId: number[] = [];
    selectedOption.map((option: { value: string; label: string }) => {
        foodsId.push(Number(option.value));
    });
    const selectedFoods = getFoodsFromId(foodsId);

    //if true than we do nothing because a combination is made up of at least 2 foods
    if (selectedFoods.length == 0 || selectedFoods.length == 1) {
        console.log("Error! Select 2 foods at least");
        return null;
    }
    //if false we have at least 2 foods

    //create a new array to update the combinations
    let newCombinations: FoodCombination[] = [];

    //create an array to store if a food combination exists, is allowed or is not allowed
    let foodCombinationsStatus: null | FoodCombinationStatusCompleteView = checkFoodCombinationStatus(selectedFoods, combinations);

    if (data.glycemiaValue < 140) {
        //if true all foods combinations are allowed

        //if true we have at least one combination already registered
        if (foodCombinationsStatus) {

            // if true foods have some combinations already registered
            if (foodCombinationsStatus?.completeFoodCombinationStatus.length != 0) {

                console.log("Foods have some combinations already registered");

                //if true than this food combination is allowed and the input glicemia value is wrong
                if (foodCombinationsStatus.notAllowedFoodCombinations.length != 0) {
                    console.log("Error! This combination is not allowed, please make sure that the inserted glicemia value is correct", foodCombinationsStatus.notAllowedFoodCombinations);
                    return;
                }

                //if true than this food combination does not already exist and is the one which is not allowed
                if (foodCombinationsStatus.notExistingFoodCombinations.length != 0) {
                    //populate the new combinations array
                    newCombinations = populateNewCombinationArray(selectedFoods, true)
                }

            } else {
                //if false foods do not have some combinations already registered

                console.log("Foods do not have some combinations already registered");

                //populate the new combinations array
                newCombinations = populateNewCombinationArray(selectedFoods, true)

            }

        } else {
            //if false we do not even have one combination already registered

            console.log("We do not even have one combination already registered");

            //populate the new combinations array
            newCombinations = populateNewCombinationArray(selectedFoods, true)

        }

        //update food combinations
        if (foodCombinationsStatus) {
            //if true we need to understand if some food combinations are already in our array

            newCombinations = handleCombinationsUpdate(
                newCombinations,
                combinations,
                true
            );
        }
        //if false there are no combinations yet so we can populate it from scratch

    } else {
        //if false there is maybe a combination that is not allowed

        if (selectedFoods.length > 2) {
            //if true we do not know which food combination is the one not allowed

            //try to figure out which combinations are not allowed
            if (foodCombinationsStatus) {
                //if true we need to understand if some food combinations are already in our array

                //understand if we can really try to figure out which combination is the one not allowed
                if (foodCombinationsStatus?.completeFoodCombinationStatus) {
                    //try to figure out which combination is the one not allowed

                    //we can't have the case in which  notExistingFoodCombinations.length === 0 && notAllowedFoodCombinations.length === 0 because it would mean that the glycemia value is normal

                    if (
                        foodCombinationsStatus.notExistingFoodCombinations.length === 1 &&
                        foodCombinationsStatus.notAllowedFoodCombinations.length === 0
                    ) {
                        //if true we have successfully figured out which food combination is the one not allowed

                        return console.log(
                            "The not allowed food combination is",
                            foodCombinationsStatus.notExistingFoodCombinations
                        );
                    }

                    if (
                        foodCombinationsStatus.notExistingFoodCombinations.length === 0 &&
                        foodCombinationsStatus.notAllowedFoodCombinations.length === 1
                    ) {
                        //if true we have successfully figured out which food combination is the one not allowed

                        return console.log(
                            "The not allowed food combination is",
                            foodCombinationsStatus.notAllowedFoodCombinations
                        );
                    }

                    if (foodCombinationsStatus.notExistingFoodCombinations.length === 0) {
                        //if true we know that the high glicemia value is due to this or these not allowed food combinations

                        return console.log(
                            "The not allowed food combination is",
                            foodCombinationsStatus.notAllowedFoodCombinations
                        );
                    } else {
                        //if false we cannot try to figure out which combination is the one not allowed

                        return console.log(
                            "We cannot undestrand which food combination is the one which is not allowed"
                        );
                    }

                } else {
                    //if false we cannot try to figure out which combination is the one not allowed

                    return console.log(
                        "We cannot undestrand which food combination is the one which is not allowed"
                    );
                }

            } else {
                //if false we do not even have one combination already registered so we cannot try to figure out which food combination is the one not allowed

                return console.log(
                    "We cannot understand which food combination is the one which is not allowed"
                );

            }

        } else {
            //if false we have 2 foods selected

            //if true we have at least one combination already registered
            if (foodCombinationsStatus) {

                // if true foods have some combinations already registered
                if (foodCombinationsStatus?.completeFoodCombinationStatus.length != 0) {

                    console.log("Foods have some combinations already registered");

                    //if true than this food combination is allowed and the input glicemia value is wrong
                    if (foodCombinationsStatus.allowedFoodCombinations.length != 0) {
                        console.log("Error! This combination is allowed, please make sure that the inserted glicemia value is correct", foodCombinationsStatus.allowedFoodCombinations);
                        return;
                    }

                    //if true than this food combination does not already exist and is the one which is not allowed
                    if (foodCombinationsStatus.notExistingFoodCombinations.length != 0) {
                        //populate the new combinations array
                        newCombinations = populateNewCombinationArray(selectedFoods, false)
                    }

                } else {
                    //if false foods do not have some combinations already registered

                    console.log("Foods do not have some combinations already registered");

                    //populate the new combinations array
                    newCombinations = populateNewCombinationArray(selectedFoods, false)

                }

            } else {
                //if false we do not even have one combination already registered

                console.log("We do not even have one combination already registered");

                //populate the new combinations array
                newCombinations = populateNewCombinationArray(selectedFoods, false)

            }

        }

        //update food combinations
        if (foodCombinationsStatus) {
            //if true we need to understand if some food combinations are already in our array

            newCombinations = handleCombinationsUpdate(
                newCombinations,
                combinations,
                false
            );
        }
        //if false there are no combinations yet so we can populate it from scratch

    }
    //update the state

    return newCombinations;

}