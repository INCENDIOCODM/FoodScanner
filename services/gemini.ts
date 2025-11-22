import { GoogleGenerativeAI } from "@google/generative-ai";

export interface FoodAnalysis {
	name: string;
	origin: string;
	ingredients: string[];
	calories: string;
	quantity: string;
	healthClassification: "Healthy" | "Moderate" | "Unhealthy";
	macronutrients?: {
		protein: string;
		carbs: string;
		fat: string;
	};
}

export const analyzeFoodImage = async (
	base64Image: string,
	apiKey: string
): Promise<FoodAnalysis> => {
	try {
		if (!apiKey) {
			throw new Error("API Key is required");
		}
		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

		const prompt = `
      Analyze this food image and provide a structured JSON response.
      I need:
      1. List of ingredients (estimated).
      2. Total calories (estimated, also don't show estimated written in the json file only show "5-10" not "5-10 estimated").
      3. Health classification (Healthy, Moderate, or Unhealthy).
      4. Macronutrients (Protein, Carbs, Fat) estimated.
	  5. If the Origin is not known, make it global. or unknown.
	  6. Quantity of the food (estimated) in ml or grams or litre or kg (whatever is nearest according to image).

      Return ONLY valid JSON in the following format:
      {
		"name" : "name of the food",
		"origin" : "origin of the food and the flag of the country (emoji)",
        "ingredients": ["item1", "item2"],
        "quantity": "quantity of the food",
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
