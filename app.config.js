export default ({ config }) => {
  return {
    ...config,
    "plugins": [
        "expo-build-properties"
    ],
    "buildProperties": {
        "android": {
            "abiFilters": ["arm64-v8a"] 
        }
    }

  };
};