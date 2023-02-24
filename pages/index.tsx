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

export default function Home() {
  const [selectedOption, setSelectedOption] = useState<any>([]);

  const [combinations, setCombinations] = useState<FoodCombination[]>([]);

  // Handles the submit event on form submit.
  function handleSubmit(event: any) {
    // Stop the form from submitting and refreshing the page.
    event.preventDefault();

    // Get data from the form.
    const data = {
      glycemiaValue: event.target.glycemiaValueTarget.value,
    };

    //******START*******
    //food combination logic
    if (data.glycemiaValue < 140) {
      //if true all foods combinations are allowed

      //fetch food data
      let foodsId: number[] = [];
      selectedOption.map((option: { value: string; label: string }) => {
        foodsId.push(Number(option.value));
      });
      const selectedFoods = getFoodsFromId(foodsId);

      //update food combinations
      if (combinations.length === 0) {
        //if true there are no combinations yet so we can populate it from scratch

        //first let's populate a new array
        let newCombinations: FoodCombination[] = [];
        selectedFoods.forEach((food) =>
          newCombinations.push({
            food: food,
            foodsAllowedCombinations: selectedFoods.filter(
              (selectedFood) => selectedFood != food
            ),
            foodsNotAllowedCombinations: [],
          })
        );

        //let's now update the state
        return setCombinations(newCombinations);
      } else {
        //if false there are already combinations so we need to understed if some combination are already present
      }
    }
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
