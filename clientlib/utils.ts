import { Food } from "@/types/Food";
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