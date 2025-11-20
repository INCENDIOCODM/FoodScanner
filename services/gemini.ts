import { GoogleGenerativeAI } from "@google/generative-ai";
import Constants from "expo-constants";

const API_KEY = Constants.expoConfig?.extra?.googleApiKey;
const genAI = new GoogleGenerativeAI(API_KEY);

export interface FoodAnalysis {
	name: string;
	origin: string;
	ingredients: string[];
	calories: string;
	healthClassification: "Healthy" | "Moderate" | "Unhealthy";
	macronutrients?: {
		protein: string;
		carbs: string;
		fat: string;
	};
}

export const analyzeFoodImage = async (
	base64Image: string
): Promise<FoodAnalysis> => {
	try {
		const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

		const prompt = `
      Analyze this food image and provide a structured JSON response.
      I need:
      1. List of ingredients (estimated).
      2. Total calories (estimated, also don't show estimated written in the json file only show "5-10" not "5-10 estimated").
      3. Health classification (Healthy, Moderate, or Unhealthy).
      4. Macronutrients (Protein, Carbs, Fat) estimated.
	  5. If the Origin is not known, make it global. or unknown.

      Return ONLY valid JSON in the following format:
      {
		"name" : "name of the food",
		"origin" : "origin of the food and the flag of the country (emoji)",
        "ingredients": ["item1", "item2"],
        "calories": "approx value",
        "healthClassification": "Healthy/Moderate/Unhealthy",
        "macronutrients": {
          "protein": "val",
          "carbs": "val",
          "fat": "val"
        }
      }
      Do not use markdown code blocks. Just the JSON string.
    `;

		const imagePart = {
			inlineData: {
				data: base64Image,
				mimeType: "image/jpeg",
			},
		};

		const result = await model.generateContent([prompt, imagePart]);
		const response = await result.response;
		const text = response.text();

		// Clean up potential markdown formatting if the model adds it despite instructions
		const jsonStr = text
			.replace(/```json/g, "")
			.replace(/```/g, "")
			.trim();

		return JSON.parse(jsonStr) as FoodAnalysis;
	} catch (error) {
		console.error("Error analyzing food:", error);
		throw error;
	}
};
