import React from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { FoodAnalysis } from "../services/gemini";

interface ResultViewProps {
	analysis: FoodAnalysis;
	onRetake: () => void;
}

export default function ResultView({ analysis, onRetake }: ResultViewProps) {
	const getHealthColor = (status: string) => {
		switch (status) {
			case "Healthy":
				return "#4CAF50";
			case "Moderate":
				return "#FFC107";
			case "Unhealthy":
				return "#F44336";
			default:
				return "#9E9E9E";
		}
	};

	return (
		<View style={[styles.container, 
			{
				backgroundColor: getHealthColor(analysis.healthClassification),
			}	
		]}>
			<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
				<Text style={styles.title}>Analysis Result</Text>

				<View
					style={[
						styles.card,
						{
							borderLeftColor: getHealthColor(analysis.healthClassification),
							borderLeftWidth: 6,
						},
					]}>
					<Text style={styles.label}>Health Status</Text>
					<Text
						style={[
							styles.value,
							{ color: getHealthColor(analysis.healthClassification) },
						]}>
						{analysis.healthClassification}
					</Text>
				</View>
				<View style={styles.card}>
					<Text style={styles.label}>Name</Text>
					<Text style={styles.value}>{analysis.name}</Text>
				</View>

				<View style={styles.card}>
					<Text style={styles.label}>Origin</Text>
					<Text style={styles.value}>{analysis.origin}</Text>
				</View>

				<View style={styles.card}>
					<Text style={styles.label}>Quantity</Text>
					<Text style={styles.value}>{analysis.quantity}</Text>
				</View>
				<View style={styles.card}>
					<Text style={styles.label}>Calories</Text>
					<Text style={styles.value}>{analysis.calories}</Text>
				</View>

				{analysis.macronutrients && (
					<View style={styles.card}>
						<Text style={styles.label}>Macronutrients</Text>
						<View style={styles.macroRow}>
							<View style={styles.macroItem}>
								<Text style={styles.macroLabel}>Protein</Text>
								<Text style={styles.macroValue}>
									{analysis.macronutrients.protein}
								</Text>
							</View>
							<View style={styles.macroItem}>
								<Text style={styles.macroLabel}>Carbs</Text>
								<Text style={styles.macroValue}>
									{analysis.macronutrients.carbs}
								</Text>
							</View>
							<View style={styles.macroItem}>
								<Text style={styles.macroLabel}>Fat</Text>
								<Text style={styles.macroValue}>
									{analysis.macronutrients.fat}
								</Text>
							</View>
						</View>
					</View>
				)}

				<View style={styles.card}>
					<Text style={styles.label}>Ingredients</Text>
					{analysis.ingredients.map((ing, index) => (
						<Text key={index} style={styles.ingredient}>
							• {ing}
						</Text>
					))}
				</View>
			</ScrollView>

			<TouchableOpacity style={styles.button} onPress={onRetake}>
				<Text style={styles.buttonText}>Scan Another</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
		padding: 20,
		paddingTop: 60,
	},
	scrollContent: {
		paddingBottom: 100,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		marginBottom: 20,
		color: "#333",
		textAlign: "center",
	},
	card: {
		backgroundColor: "white",
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
		flexDirection : "column",
		justifyContent : "space-between",	
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	label: {
		fontSize: 14,
		color: "#666",
		marginBottom: 4,
		textTransform: "uppercase",
		letterSpacing: 1,
	},
	value: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#333",
	},
	macroRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 8,
	},
	macroItem: {
		alignItems: "center",
	},
	macroLabel: {
		fontSize: 12,
		color: "#888",
	},
	macroValue: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
	},
	ingredient: {
		fontSize: 16,
		color: "#444",
		marginBottom: 4,
	},
	button: {
		position: "absolute",
		bottom: 30,
		left: 20,
		right: 20,
		backgroundColor: "#2196F3",
		padding: 16,
		borderRadius: 30,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 5,
	},
	buttonText: {
		color: "white",
		fontSize: 18,
		fontWeight: "bold",
	},
});
