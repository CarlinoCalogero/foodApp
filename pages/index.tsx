import { getAllFood, handleFoodLogin } from "@/clientlib/utils";
import { RenderFoodsCombinations } from "@/components/RenderFoodsCombinations";
import { FoodCombination } from "@/types/Food";
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

    //food combination logic
    const newCombinations = handleFoodLogin(selectedOption, combinations, data);
    if (newCombinations) {
      setCombinations(newCombinations);
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

        <RenderFoodsCombinations foodCombinations={combinations} />
      </form>
    </div>
  );
}
