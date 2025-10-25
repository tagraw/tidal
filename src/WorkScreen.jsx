import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';

// 1. Import TensorFlow.js and the Coco SSD model
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

// Define parameters for speed and trigger sensitivity
const DETECTION_INTERVAL_MS = 400; // Check every 400ms for performance
const CONFIDENCE_THRESHOLD = 0.65; // Only trigger if model is 65%+ sure
const UPPER_HALF_THRESHOLD = 0.5; // Defines the top 50% of the screen

// --- Component Definition ---
// It accepts 'navigate' to switch screens and 'setInsult' to pass data (Lift State Up)
const WorkScreen = ({ navigate, setInsult }) => {
    const webcamRef = useRef(null);
    const [model, setModel] = useState(null);
    const [status, setStatus] = useState("Loading AI Model...");

    // Constants for screen navigation
    const SCREENS = { WORK: 'work', ALERT: 'alert', STATS: 'stats' };

    // --- 1. Model Loading (Runs ONLY Once) ---
    useEffect(() => {
        const loadModel = async () => {
            try {
                await tf.ready();
                // Use a lighter model base for faster hackathon performance
                const loadedModel = await cocoSsd.load({ base: 'mobilenet_v2' });
                setModel(loadedModel);
                setStatus("AI Ready. Get to work!");
            } catch (error) {
                console.error("Failed to load model:", error);
                setStatus("Error loading AI. Check console.");
            }
        };
        loadModel();
    }, []);

    // --- 2. Detection Logic (The Loop) ---
    const runDetection = useCallback(async () => {
        // Only run if the model is loaded AND the webcam feed is ready
        if (model && webcamRef.current && webcamRef.current.video.readyState === 4) {
            
            // Get the raw HTMLVideoElement from the react-webcam ref
            const video = webcamRef.current.video;
            const videoHeight = video.videoHeight;

            // Run the object detection
            const predictions = await model.detect(video);

            // --- 3. Trigger Logic Check ---
            const distracted = predictions.some(prediction => {
                // Coco-SSD's output format: [x, y, width, height]
                const [x, y, width, height] = prediction.bbox; 
                
                // Check if it's a "cell phone" (or a proxy like "remote")
                const isPhone = prediction.class === 'cell phone' || prediction.class === 'remote';
                
                // Check confidence and position (is the object in the upper half?)
                const isHighConfidence = prediction.score > CONFIDENCE_THRESHOLD;
                const isUpperHalf = y < videoHeight * UPPER_HALF_THRESHOLD; 

                // Log the findings (for debugging/demonstration)
                if (isPhone && isHighConfidence) {
                    console.log(`[ALERT] Found ${prediction.class} (${(prediction.score * 100).toFixed(1)}%) at y=${y}. Upper Half: ${isUpperHalf ? 'YES' : 'NO'}`);
                }
                
                // If the conditions are met, return true to trigger the distraction
                return isPhone && isHighConfidence && isUpperHalf;
            });

            if (distracted) {
                // --- Switch to Alert Screen ---
                // In a real app, you would fetch the Gemini insult here first.
                // For the hackathon, we'll navigate and let the AlertScreen handle the fetch.
                
                // Temporary mock data for insult (will be replaced by Gemini fetch)
                const mockInsult = "Seriously, another tab? Truly groundbreaking procrastination. Get back to the code!";
                
                // Navigate to the Alert Screen and pass the mock insult data
                navigate(SCREENS.ALERT, { insult: mockInsult });
                
                // We use a clean-up function in the next useEffect to stop the loop
                return; 
            }
        }
        
        // Schedule the next detection call
        // Using setTimeout keeps the loop going until the component is unmounted or the state changes
        setTimeout(runDetection, DETECTION_INTERVAL_MS);
    }, [model, navigate, setInsult]);


    // --- 4. Start/Stop Loop Management (Runs When Model Loads) ---
    useEffect(() => {
        let timerId;
        
        if (model) {
            // Start the detection loop once the model is ready
            timerId = setTimeout(runDetection, DETECTION_INTERVAL_MS);
        }

        // Cleanup function: This stops the loop when the component unmounts 
        // or before the useEffect runs again (i.e., when switching to AlertScreen)
        return () => {
            if (timerId) clearTimeout(timerId);
        };
    }, [model, runDetection]); // Dependency on model and runDetection

    
    // --- 5. JSX Output ---
    return (
        <div className="flex flex-col md:flex-row w-full h-full p-6 space-y-6 md:space-y-0 md:space-x-6">
            
            {/* Left Panel: Webcam Monitor */}
            <div className="md:w-1/3 flex flex-col items-center p-4 bg-white shadow-lg rounded-xl">
                <h3 className="text-xl font-bold mb-2">Focus Monitor</h3>
                <p className={`mb-4 text-sm ${model ? 'text-green-600' : 'text-red-600'}`}>{status}</p>
                
                <div className="relative w-full aspect-video">
                    {/* The Webcam component */}
                    <Webcam
                        audio={false}
                        ref={webcamRef} 
                        mirrored={true} 
                        videoConstraints={{ width: 640, height: 480 }}
                        style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '8px',
                            objectFit: 'cover',
                        }}
                    />
                </div>

                {/* Button to go to Stats Page */}
                <button 
                    onClick={() => navigate(SCREENS.STATS)}
                    className="mt-6 w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
                >
                    Done for now? View Stats »
                </button>
            </div>
        </div>
    );
};

export default WorkScreen;