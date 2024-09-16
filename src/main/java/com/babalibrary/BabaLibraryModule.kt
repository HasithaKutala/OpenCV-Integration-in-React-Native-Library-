package com.babalibrary

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.util.Log
import org.opencv.android.OpenCVLoader
import org.opencv.core.CvType
import org.opencv.core.Mat
import org.opencv.imgproc.Imgproc
import org.opencv.android.Utils
import java.io.File
import java.io.FileOutputStream

class BabaLibraryModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    init {
        if (!OpenCVLoader.initDebug()) {
            Log.e("OpenCV", "Unable to load OpenCV!")
        } else {
            Log.d("OpenCV", "OpenCV loaded Successfully!")
        }
    }

    override fun getName(): String {
        return NAME
    }

    // Function to process the image using OpenCV (example: grayscale)
    @ReactMethod
    fun processImage(imageUri: String, promise: Promise) {
        try {
            // Remove 'file://' prefix from the URI if it's present
            val imagePath = imageUri.replace("file://", "")

            val file = File(imagePath)
            if (!file.exists()) {
                promise.reject("File not found", "Could not find image file at $imageUri")
                return
            }

            // Decode the image file into a Bitmap
            val bitmap = BitmapFactory.decodeFile(imagePath)

            // Initialize a matrix to hold the image data
            val mat = Mat(bitmap.height, bitmap.width, CvType.CV_8UC1)

            // Convert the Bitmap to an OpenCV Mat
            Utils.bitmapToMat(bitmap, mat)

            // Apply a grayscale filter using OpenCV
            Imgproc.cvtColor(mat, mat, Imgproc.COLOR_BGR2GRAY)

            // Convert the processed Mat back to a Bitmap
            val processedBitmap = Bitmap.createBitmap(mat.cols(), mat.rows(), Bitmap.Config.ARGB_8888)
            Utils.matToBitmap(mat, processedBitmap)

            // Save the processed bitmap to a new file (optional)
            val processedFile = File(imagePath)
            val outStream = FileOutputStream(processedFile)
            processedBitmap.compress(Bitmap.CompressFormat.JPEG, 100, outStream)
            outStream.flush()
            outStream.close()

            // Return the path/URI of the processed image
            promise.resolve("file://${processedFile.absolutePath}")
        } catch (e: Exception) {
            promise.reject("OpenCV Error", e)
        }
    }

    companion object {
        const val NAME = "BabaLibrary"
    }
}
