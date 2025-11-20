import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
	Alert,
	Linking,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

export default function Settings() {
	const [apiKey, setApiKey] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		loadApiKey();
	}, []);

	const loadApiKey = async () => {
		try {
			const savedKey = await AsyncStorage.getItem("gemini_api_key");
			if (savedKey) {
				setApiKey(savedKey);
			}
		} catch (error) {
			console.error("Failed to load API key", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSave = async () => {
		if (!apiKey.trim()) {
			Alert.alert("Required", "Please enter a valid API Key");
			return;
		}

		try {
			await AsyncStorage.setItem("gemini_api_key", apiKey.trim());
			Alert.alert("Success", "API Key saved successfully");
			router.back();
		} catch (error) {
			Alert.alert("Error", "Failed to save API Key");
		}
	};

	const openGetApiKey = () => {
		Linking.openURL("https://aistudio.google.com/app/apikey");
	};

	return (
		<View style={styles.container}>
			<StatusBar style="dark" />
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.backButton}>
					<Ionicons name="arrow-back" size={24} color="#333" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Settings</Text>
			</View>

			<ScrollView contentContainerStyle={styles.content}>
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>API Configuration</Text>
					<Text style={styles.description}>
						This app requires a Google Gemini API key to analyze food images.
						Your key is stored locally on your device.
					</Text>

					<View style={styles.inputContainer}>
						<Text style={styles.label}>Gemini API Key</Text>
						<TextInput
							style={styles.input}
							placeholder="Enter your API Key"
							value={apiKey}
							onChangeText={setApiKey}
							autoCapitalize="none"
							secureTextEntry={true}
						/>
					</View>

					<TouchableOpacity style={styles.helpLink} onPress={openGetApiKey}>
						<Text style={styles.helpText}>How to get an API Key?</Text>
						<Ionicons name="open-outline" size={16} color="#2196F3" />
					</TouchableOpacity>
				</View>

				<TouchableOpacity style={styles.saveButton} onPress={handleSave}>
					<Text style={styles.saveButtonText}>Save Configuration</Text>
				</TouchableOpacity>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingTop: 60,
		paddingBottom: 20,
		paddingHorizontal: 20,
		backgroundColor: "white",
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	backButton: {
		padding: 8,
		marginRight: 16,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#333",
	},
	content: {
		padding: 20,
	},
	section: {
		backgroundColor: "white",
		borderRadius: 12,
		padding: 20,
		marginBottom: 24,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 12,
	},
	description: {
		fontSize: 14,
		color: "#666",
		marginBottom: 20,
		lineHeight: 20,
	},
	inputContainer: {
		marginBottom: 16,
	},
	label: {
		fontSize: 14,
		fontWeight: "600",
		color: "#333",
		marginBottom: 8,
	},
	input: {
		backgroundColor: "#f9f9f9",
		borderWidth: 1,
		borderColor: "#e0e0e0",
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
	},
	helpLink: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-end",
	},
	helpText: {
		color: "#2196F3",
		fontSize: 14,
		marginRight: 4,
	},
	saveButton: {
		backgroundColor: "#2196F3",
		padding: 18,
		borderRadius: 12,
		alignItems: "center",
		shadowColor: "#2196F3",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 4,
	},
	saveButtonText: {
		color: "white",
		fontSize: 18,
		fontWeight: "bold",
	},
});
