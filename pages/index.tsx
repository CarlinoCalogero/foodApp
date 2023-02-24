import { getAllFood, getFoodsFromId } from "@/clientlib/utils";
import { RenderFoodsCombinations } from "@/components/RenderFoodsCombinations";
import { Food, FoodCombination } from "@/types/Food";
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

function sortFoodCombinationsByAscendingFoodId(
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

function sortFoodByAscendingFoodId(foods: Food[]) {
  foods.sort((food1, food2) => {
    if (food1.foodId > food2.foodId) {
      return 1;
    } else if (food1.foodId < food2.foodId) {
      return -1;
    }
    return 0;
  });
}

function handleCombinationsUpdate(
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

        newCombinations = handleCombinationsUpdate(
          newCombinations,
          combinations,
          true
        );
      }
      //if false there are no combinations yet so we can populate it from scratch
    } else {
      //if false there is at least a combination that is not allowed

      if (selectedFoods.length > 2) {
        //if true we do not know which food combination is the one not allowed
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

        <RenderFoodsCombinations />
      </form>
    </div>
  );
}
