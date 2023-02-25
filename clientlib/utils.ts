import { Food, FoodCombination } from "@/types/Food";
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

//checks if there are not allowed food combination and stores them in an array which is later returned
export function checkNotAllowedFoodCombination(selectedFoods: Food[], combinations: FoodCombination[]) {

    //create an array to store the not allowed food combinations
    let notAllowedFoodCombinations: [Food, Food][] = [];

    selectedFoods.forEach((food) => {

        //check if food has combinations stored
        const index = combinations.findIndex((combination) => combination.food === food)
        if (index > -1) {
            //if true food has combinations stored

            selectedFoods.forEach((potentiallyNotAllowedFood) => {

                //check if food is the same as the one being considered
                if (potentiallyNotAllowedFood != food) {
                    //if true we are considering a different food

                    const indexNotAllowedFood = combinations[index].foodsNotAllowedCombinations.indexOf(potentiallyNotAllowedFood);
                    if (indexNotAllowedFood > -1) {
                        //if true this food combination is not allowed

                        //store the notAllowedFood combination
                        notAllowedFoodCombinations.push([food, potentiallyNotAllowedFood])
                    }
                    //if false this food combination either does not exist yet or is allowed
                }
                //if false we are considering the same food so we do nothing
            })
        }
        //if false food has not combinations stored
    })

    //create a new array in order to skim the notAllowedFoodCombinations array
    let skimmedNotAllowedFoodCombinations: [Food, Food][] = [];
    //skim the notAllowedFoodCombinations array
    notAllowedFoodCombinations.forEach((notAllowedCombination) => {
        if (
            !skimmedNotAllowedFoodCombinations.find(
                (combination) =>
                    combination[0] === notAllowedCombination[0] &&
                    combination[1] === notAllowedCombination[1]
            ) &&
            !skimmedNotAllowedFoodCombinations.find(
                (combination) =>
                    combination[0] === notAllowedCombination[1] &&
                    combination[1] === notAllowedCombination[0]
            )
        ) {
            //if true we add the combination status to the skimmedNotAllowedFoodCombinations array

            skimmedNotAllowedFoodCombinations.push(notAllowedCombination);
        }
    });

    //return the not allowed food combinations
    return skimmedNotAllowedFoodCombinations;

}