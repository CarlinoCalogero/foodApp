import {
  checkNotAllowedFoodCombination,
  getAllFood,
  getFoodsFromId,
  handleCombinationsUpdate,
} from "@/clientlib/utils";
import { RenderFoodsCombinations } from "@/components/RenderFoodsCombinations";
import {
  CombinationStatus,
  Food,
  FoodCombination,
  FoodCombinationStatus,
} from "@/types/Food";
import { useEffect, useState } from "react";
import ReactSelect from "react-select";
import styles from "./index.module.css";

function parseFoodForForm() {
  //take all foods data
  const foods = getAllFood();
  //parse the food data into an array that can be fed to the ReactSelect component
  let foodOptions: any = [];
  foods.map((food) => {
    foodOptions.push({ value: `${food.foodId}`, label: `${food.foodName}` });
  });
  return foodOptions;
}

export default function Home() {
  const [selectedOption, setSelectedOption] = useState<any>([]);

  //array which contains all foodCombinations
  const [combinations, setCombinations] = useState<FoodCombination[]>([]);

  // Handles the submit event on form submit.
  function handleSubmit(event: any) {
    // Stop the form from submitting and refreshing the page.
    event.preventDefault();

    // Get data from the form.
    const data = {
      glycemiaValue: event.target.glycemiaValueTarget.value,
    };

    //******FOOD COMBINATION LOGIC - START*******
    //fetch food data
    let foodsId: number[] = [];
    selectedOption.map((option: { value: string; label: string }) => {
      foodsId.push(Number(option.value));
    });
    const selectedFoods = getFoodsFromId(foodsId);

    //create a new array to update the combinations
    let newCombinations: FoodCombination[] = [];

    if (data.glycemiaValue < 140) {
      //if true all foods combinations are allowed

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

      //update food combinations
      if (combinations.length != 0) {
        //if true we need to understand if some food combinations are already in our array

        //check if there are one or more a not allowed food combination between the selected foods
        //If one or more not allowed food combination between the selected foods do exist, notify the user that, maybe, he has made a mistake
        const notAllowedFoodCombinations = checkNotAllowedFoodCombination(
          selectedFoods,
          combinations
        );

        if (notAllowedFoodCombinations.length === 0) {
          //if true we can update the combinations

          newCombinations = handleCombinationsUpdate(
            newCombinations,
            combinations,
            true
          );
        } else {
          //if false then maybe the user has made a mistake

          return console.log(
            "glicemia value cannot be normal because there are one or more not allowed food combinations!",
            notAllowedFoodCombinations
          );
        }
      }
      //if false there are no combinations yet so we can populate it from scratch
    } else {
      //if false there is at least a combination that is not allowed

      if (selectedFoods.length > 2) {
        //if true we do not know which food combination is the one not allowed

        //try to figure out which combinations are not allowed
        if (combinations.length != 0) {
          //if true we need to understand if some food combinations are already in our array

          //create an array to store if a food combination exists, is allowed or is not allowed
          let foodCombinationsStatus: FoodCombinationStatus[] = [];
          //figure out which food combinations is allowed, not allowed or does not exist and store data in the array
          selectedFoods.forEach((food) => {
            const index = combinations.findIndex(
              (combination) => combination.food === food
            );

            if (index > -1) {
              //if true the food has combinations

              selectedFoods.forEach((foodToFigureOutCombinationStatusWith) => {
                if (foodToFigureOutCombinationStatusWith != food) {
                  //if true we are not examining the same food

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
              //if false the food does not have combinations

              return console.log(
                "We cannot undestrand which food combination is the one which is not allowed"
              );
            }
          });
          //understand if we can really try to figure out which combination is the one not allowed
          if (foodCombinationsStatus.length > 0) {
            //if true we now have all the combinations status written between the selected foods stored in an array

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
            //create an array to store not existing food combination
            let notExistingFoodCombinations: [Food, Food][] = [];
            //create an array to store not allowed food combination
            let notAllowedFoodCombinations: [Food, Food][] = [];
            //sort the skimmed food combination status
            skimmedFoodCombinationsStatus.forEach((skimmedfoodCombination) => {
              if (
                skimmedfoodCombination.combinationIsAllowedNotAllowedOrDoesNotExist ===
                CombinationStatus.DOESNOTEXIST
              ) {
                //if true we add it to the array to store not existing food combination

                notExistingFoodCombinations.push([
                  skimmedfoodCombination.food1,
                  skimmedfoodCombination.food2,
                ]);
              }

              if (
                skimmedfoodCombination.combinationIsAllowedNotAllowedOrDoesNotExist ===
                CombinationStatus.NOTALLOWED
              ) {
                //if true we add it to the array to store not allowed food combination

                notAllowedFoodCombinations.push([
                  skimmedfoodCombination.food1,
                  skimmedfoodCombination.food2,
                ]);
              }
            });
            //try to figure out which combination is the one not allowed
            //we can't have the case in which  notExistingFoodCombinations.length === 0 && notAllowedFoodCombinations.length === 0 because it would mean that the glycemia value is normal
            if (
              notExistingFoodCombinations.length === 1 &&
              notAllowedFoodCombinations.length === 0
            ) {
              //if true we have successfully figured out which food combination is the one not allowed

              return console.log(
                "The not allowed food combination is",
                notExistingFoodCombinations
              );
            }

            if (
              notExistingFoodCombinations.length === 0 &&
              notAllowedFoodCombinations.length === 1
            ) {
              //if true we have successfully figured out which food combination is the one not allowed

              return console.log(
                "The not allowed food combination is",
                notAllowedFoodCombinations
              );
            }

            if (notExistingFoodCombinations.length === 0) {
              //if true we know that the high glicemia value is due to this or these not allowed food combinations

              return console.log(
                "The not allowed food combination is",
                notAllowedFoodCombinations
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
          //if false we cannot try to figure out which food combination is the one not allowed
          return console.log(
            "We cannot undestrand which food combination is the one which is not allowed"
          );
        }
      } else {
        //if false we only have 2 foods so the combination between this 2 foods is not allowed

        //populate the new combinations array
        selectedFoods.forEach((food) =>
          newCombinations.push({
            food: food,
            foodsAllowedCombinations: [],
            foodsNotAllowedCombinations: selectedFoods.filter(
              (selectedFood) => selectedFood != food
            ),
          })
        );

        //update food combinations
        if (combinations.length != 0) {
          //if true we need to understand if some food combinations are already in our array

          newCombinations = handleCombinationsUpdate(
            newCombinations,
            combinations,
            false
          );
        }
        //if false there are no combinations yet so we can populate it from scratch
      }
    }
    //update the state

    setCombinations(newCombinations);
    //******FOOD COMBINATION LOGIC - END*******
  }

  useEffect(() => {
    console.log("updated", combinations);
  }, [combinations]);

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="glycemiaValue">Glycemia Value</label>
        <input
          type="number"
          id="glycemiaValue"
          name="glycemiaValueTarget"
          min={0}
          max={400}
          step={1}
          required
        />

        <ReactSelect
          defaultValue={selectedOption}
          onChange={setSelectedOption}
          options={parseFoodForForm()}
          instanceId={"foods"}
          isMulti
        />

        <button type="submit">Submit</button>

        <RenderFoodsCombinations foodCombinations={combinations} />
      </form>
    </div>
  );
}
