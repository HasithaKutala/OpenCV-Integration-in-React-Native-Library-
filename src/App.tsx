import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, PermissionsAndroid, Platform } from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import type { ImagePickerResponse } from 'react-native-image-picker';
import { processImage } from '../../src/index'; // Ensure the correct import path

const App = () => {
  const [resourcePath, setResourcePath] = useState<ImagePickerResponse | null>(null);

  // Request permissions based on Android version
  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        // Check for Android 13+ (API level 33 and above)
        const storagePermission =
          Platform.Version >= 33
            ? await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
              ])
            : await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
              );

        const cameraPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );

        // Check if all permissions are granted
        if (
          (storagePermission === PermissionsAndroid.RESULTS.GRANTED ||
            storagePermission['android.permission.READ_MEDIA_IMAGES'] ===
              PermissionsAndroid.RESULTS.GRANTED ||
            storagePermission['android.permission.READ_MEDIA_VIDEO'] ===
              PermissionsAndroid.RESULTS.GRANTED) &&
          cameraPermission === PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('All permissions granted');
        } else {
          console.log('Permissions denied');
        }
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  // Function to handle image picker response
  const handleResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.errorCode) {
      console.log('ImagePicker Error: ', response.errorMessage);
    } else if (response.assets && response.assets[0]?.uri) {
      const imageUri = response.assets[0].uri;

      // Log the selected image URI
      console.log("Selected Image URI: ", imageUri);

      // Call the native OpenCV function to process the image
      processImage(imageUri)
        .then((processedImageUri: string) => {
          // Set the processed image URI
          console.log('Processed Image URI:', processedImageUri);
          setResourcePath({
            assets: [{ uri: processedImageUri }],
          });
        })
        .catch((error: any) => console.log('OpenCV Error: ', error));
    }
  };

  // Function to select a file from gallery or camera
  const selectFile = () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: () => launchCamera({ mediaType: 'photo' }, handleResponse),
        },
        {
          text: 'Choose From Library',
          onPress: () => launchImageLibrary({ mediaType: 'photo' }, handleResponse),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      {resourcePath?.assets && resourcePath.assets[0]?.uri && (
        <Image
          source={{ uri: resourcePath.assets[0].uri }}
          style={{ width: 200, height: 200 }}
        />
      )}
      <TouchableOpacity onPress={selectFile} style={styles.button}>
        <Text style={styles.buttonText}>Select File</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  button: {
    width: 250,
    height: 60,
    backgroundColor: '#3740ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    marginBottom: 12
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#fff'
  }
});

export default App;
