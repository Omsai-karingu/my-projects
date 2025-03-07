# Bad Posture Detection Web App

This web application uses computer vision to detect bad posture through your webcam and provides real-time feedback to help improve your sitting habits.

## Features

- Real-time posture detection using webcam
- Visual and audio alerts when bad posture is detected
- Dashboard with posture statistics
- Customizable sensitivity and alert settings

## Setup and Installation

1. Clone this repository
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Run the application:
   ```
   python app.py
   ```
4. Open your browser and navigate to `http://localhost:5000`

## Usage

1. Allow camera access when prompted
2. Sit in a proper posture and click "Calibrate" to set your baseline
3. The app will alert you when your posture deviates from the baseline

## Technologies Used

- Python (Flask)
- TensorFlow.js / PoseNet
- HTML/CSS/JavaScript
- OpenCV (for development and training) 