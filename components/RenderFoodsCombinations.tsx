import { getAllFood } from "@/clientlib/utils";
import { CombinationStatus, Food, FoodCombination } from "@/types/Food";
import styles from "./RenderFoodsCombinations.module.css";

interface RenderFoodsCombinationsProps {
  foodCombinations: FoodCombination[];
}

function sortDisplayFoodCombinationByAscendingFoodId(
  displayFoodCombination: [Food, CombinationStatus][]
) {
  displayFoodCombination.sort((combination1, combination2) => {
    if (combination1[0].foodId > combination2[0].foodId) {
      return 1;
    } else if (combination1[0].foodId < combination2[0].foodId) {
      return -1;
    }
    return 0;
  });
}

export function RenderFoodsCombinations({
  foodCombinations,
}: RenderFoodsCombinationsProps) {
  console.log(foodCombinations);

  const foods = getAllFood();

  return (
    <table>
      <thead>
        <tr>
          <td></td>
          {foods.map((food) => (
            <td key={food.foodId + food.foodName}>{food.foodName}</td>
          ))}
        </tr>
      </thead>
      <tbody>
        {foodCombinations.map((combination) => {
          //create an array to store the food and if it's combination is allowed or not
          let displayFoodCombination: [Food, CombinationStatus][] = [];
          //populate the newly created array with the allowedFoods
          combination.foodsAllowedCombinations.forEach((foodAllowed) => {
            displayFoodCombination.push([
              foodAllowed,
              CombinationStatus.ALLOWED,
            ]);
          });
          //populate the newly created array with the notAllowedFoods
          combination.foodsNotAllowedCombinations.forEach((foodNotAllowed) => {
            displayFoodCombination.push([
              foodNotAllowed,
              CombinationStatus.NOTALLOWED,
            ]);
          });
          //sort the array to reduce future operations' computation time
          sortDisplayFoodCombinationByAscendingFoodId(displayFoodCombination);
          console.log(
            "sorted",
            combination.food.foodName,
            displayFoodCombination
          );

          return (
            <tr key={combination.food.foodId}>
              <td>{combination.food.foodName}</td>
              {foods.map((food) => {
                //check if there is an existing food combination with this food
                const index = displayFoodCombination.findIndex(
                  (displayFood) => displayFood[0] === food
                );
                if (index > -1) {
                  //if true the food combination exists

                  return (
                    <td>
                      {displayFoodCombination[index][1] ===
                        CombinationStatus.ALLOWED && "Y"}
                      {displayFoodCombination[index][1] ===
                        CombinationStatus.NOTALLOWED && "X"}
                    </td>
                  );
                }
                //if false the food combination does not exist
                return <td></td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
