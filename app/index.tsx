import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	SafeAreaView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import ResultView from "../components/ResultView";
import { analyzeFoodImage, FoodAnalysis } from "../services/gemini";

export default function App() {
	const [facing, setFacing] = useState<CameraType>("back");
	const [permission, requestPermission] = useCameraPermissions();
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
	const [apiKey, setApiKey] = useState<string | null>(null);
	const cameraRef = useRef<CameraView>(null);
	const router = useRouter();

	useFocusEffect(
		useCallback(() => {
			loadApiKey();
		}, [])
	);

	const loadApiKey = async () => {
		try {
			const key = await AsyncStorage.getItem("gemini_api_key");
			setApiKey(key);
		} catch (error) {
			console.error("Error loading API key:", error);
		}
	};

	if (!permission) {
		// Camera permissions are still loading.
		return <View />;
	}

	if (!permission.granted) {
		// Camera permissions are not granted yet.
		return (
			<View style={styles.container}>
				<Text style={styles.message}>
					We need your permission to show the camera
				</Text>
				<TouchableOpacity
					style={styles.permissionButton}
					onPress={requestPermission}>
					<Text style={styles.permissionButtonText}>Grant Permission</Text>
				</TouchableOpacity>
			</View>
		);
	}

	const toggleCameraFacing = () => {
		setFacing((current) => (current === "back" ? "front" : "back"));
	};

	const takePicture = async () => {
		if (!apiKey) {
			Alert.alert(
				"API Key Missing",
				"Please configure your Google Gemini API Key in settings to scan food.",
				[
					{ text: "Cancel", style: "cancel" },
					{ text: "Go to Settings", onPress: () => router.push("./settings") },
				]
			);
			return;
		}

		if (cameraRef.current) {
			try {
				const photo = await cameraRef.current.takePictureAsync({
					base64: true,
					quality: 0.5,
				});

				if (photo?.base64) {
					analyzeImage(photo.base64);
				}
			} catch (error) {
				console.error("Failed to take picture:", error);
				Alert.alert("Error", "Failed to capture image.");
			}
		}
	};

	const analyzeImage = async (base64: string) => {
		if (!apiKey) return;

		setIsAnalyzing(true);
		try {
			const result = await analyzeFoodImage(base64, apiKey);
			setAnalysis(result);
		} catch (error) {
			Alert.alert(
				"Error",
				"Failed to analyze food. Please check your API key and try again."
			);
		} finally {
			setIsAnalyzing(false);
		}
	};

	const resetAnalysis = () => {
		setAnalysis(null);
	};

	if (analysis) {
		return <ResultView analysis={analysis} onRetake={resetAnalysis} />;
	}

	return (
		<View style={styles.container}>
			<CameraView style={styles.camera} facing={facing} ref={cameraRef}>
				<SafeAreaView style={styles.safeArea}>
					<View style={styles.header}>
						<TouchableOpacity
							style={styles.settingsButton}
							onPress={() => router.push("./settings")}>
							<Ionicons name="settings-outline" size={28} color="white" />
						</TouchableOpacity>
					</View>

					<View style={styles.buttonContainer}>
						<TouchableOpacity
							style={styles.button}
							onPress={toggleCameraFacing}>
							<Ionicons name="camera-reverse-outline" size={32} color="white" />
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.captureButton}
							onPress={takePicture}
							disabled={isAnalyzing}>
							<View style={styles.captureInner} />
						</TouchableOpacity>

						<View style={styles.spacer} />
					</View>
				</SafeAreaView>

				{isAnalyzing && (
					<View style={styles.loadingOverlay}>
						<ActivityIndicator size="large" color="#ffffff" />
						<Text style={styles.loadingText}>Analyzing Food...</Text>
					</View>
				)}
			</CameraView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		backgroundColor: "black",
	},
	safeArea: {
		flex: 1,
		justifyContent: "space-between",
	},
	message: {
		textAlign: "center",
		paddingBottom: 10,
		color: "white",
	},
	permissionButton: {
		backgroundColor: "#2196F3",
		padding: 10,
		borderRadius: 5,
		alignSelf: "center",
	},
	permissionButtonText: {
		color: "white",
		fontWeight: "bold",
	},
	camera: {
		flex: 1,
	},
	header: {
		flexDirection: "row",
		justifyContent: "flex-end",
		padding: 20,
	},
	settingsButton: {
		padding: 8,
		backgroundColor: "rgba(0,0,0,0.3)",
		borderRadius: 20,
	},
	buttonContainer: {
		flexDirection: "row",
		backgroundColor: "transparent",
		margin: 40,
		justifyContent: "space-between",
		alignItems: "center",
	},
	button: {
		alignItems: "center",
		justifyContent: "center",
		width: 50,
		height: 50,
	},
	text: {
		fontSize: 18,
		fontWeight: "bold",
		color: "white",
	},
	captureButton: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: "rgba(255, 255, 255, 0.3)",
		justifyContent: "center",
		alignItems: "center",
	},
	captureInner: {
		width: 65,
		height: 65,
		borderRadius: 32.5,
		backgroundColor: "white",
	},
	spacer: {
		width: 50, // To balance the Flip button
	},
	loadingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0,0,0,0.7)",
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		color: "white",
		marginTop: 10,
		fontSize: 18,
	},
});
