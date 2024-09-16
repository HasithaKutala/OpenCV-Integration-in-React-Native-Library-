import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-baba-library' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const BabaLibrary = NativeModules.BabaLibrary
  ? NativeModules.BabaLibrary
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

// Expose the OpenCV image processing function
export function processImage(imageUri: string): Promise<string> {
  return BabaLibrary.processImage(imageUri);
}

export function multiply(a: number, b: number): Promise<number> {
  return BabaLibrary.multiply(a, b);
}
