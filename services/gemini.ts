import { GoogleGenerativeAI } from "@google/generative-ai";

// TODO: Replace with your actual API Key
const API_KEY = "AIzaSyA0z9QcgzKimAAsCxDUC2HiaPUd_dibm7w";

const genAI = new GoogleGenerativeAI(API_KEY);

export interface FoodAnalysis {
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
      2. Total calories (estimated).
      3. Health classification (Healthy, Moderate, or Unhealthy).
      4. Macronutrients (Protein, Carbs, Fat) estimated.

      Return ONLY valid JSON in the following format:
      {
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
