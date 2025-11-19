import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Button,
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
	const cameraRef = useRef<CameraView>(null);

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
				<Button onPress={requestPermission} title="grant permission" />
			</View>
		);
	}

	const toggleCameraFacing = () => {
		setFacing((current) => (current === "back" ? "front" : "back"));
	};

	const takePicture = async () => {
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
		setIsAnalyzing(true);
		try {
			const result = await analyzeFoodImage(base64);
			setAnalysis(result);
		} catch (error) {
			Alert.alert("Error", "Failed to analyze food. Please try again.");
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
				<View style={styles.buttonContainer}>
					<TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
						<Text style={styles.text}>Flip</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.captureButton}
						onPress={takePicture}
						disabled={isAnalyzing}>
						<View style={styles.captureInner} />
					</TouchableOpacity>

					<View style={styles.spacer} />
				</View>

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
	},
	message: {
		textAlign: "center",
		paddingBottom: 10,
	},
	camera: {
		flex: 1,
	},
	buttonContainer: {
		flex: 1,
		flexDirection: "row",
		backgroundColor: "transparent",
		margin: 64,
		justifyContent: "space-between",
		alignItems: "flex-end",
	},
	button: {
		alignSelf: "flex-end",
		alignItems: "center",
	},
	text: {
		fontSize: 18,
		fontWeight: "bold",
		color: "white",
	},
	captureButton: {
		width: 70,
		height: 70,
		borderRadius: 35,
		backgroundColor: "rgba(255, 255, 255, 0.3)",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 20,
	},
	captureInner: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: "white",
	},
	spacer: {
		width: 40, // To balance the Flip button
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
