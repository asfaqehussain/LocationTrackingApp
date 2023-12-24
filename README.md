
<img src="https://github.com/asfaqehussain/LocationTrackingApp/assets/51645676/b5af9aa7-7a44-43e3-8370-ce30b2d5d1f6" width="130" height="130">

# Location Tracking App


## Overview

LocationTrackingApp is a React Native application designed for real-time location tracking with background location refresh and a Socket.IO connection to the server. This app utilizes various libraries such as "@react-native-community/geolocation", "react-native-background-timer", "react-native-maps", "react-native-maps-directions", and "socket.io-client" to provide a seamless and efficient location tracking experience.

## Installation

Make sure you have Node.js and npm installed on your machine.

1. Clone the repository:

   ```bash
   git clone https://github.com/asfaqehussain/LocationTrackingApp
   ```

2. Navigate to the project directory:

   ```bash
   cd locationtrackingapp
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

## Configuration

Before running the app, make sure to configure the necessary settings.

1. Open the `src/SocketClient` file.

2. Update the Socket.IO client file.

3. Update any additional configuration parameters based on your requirements.

## Usage

### Running the App

To run the app on a connected device or emulator, use the following command:

```bash
npx react-native run-android  # For Android
# or
npx react-native run-ios      # For iOS
```

### Background Location Tracking

The app leverages the "@react-native-community/geolocation" and "react-native-background-timer" libraries for background location tracking. Ensure that the necessary permissions are granted for location services on the device.

### Maps Integration

The app incorporates the "react-native-maps" and "react-native-maps-directions" libraries for displaying maps and directions. Make sure to follow the documentation for these libraries for any additional setup.

## Dependencies

- "@react-native-community/geolocation": "^3.1.0"
- "react-native": "0.71.11"
- "react-native-background-timer": "^2.4.1"
- "react-native-maps": "^1.8.0"
- "react-native-maps-directions": "^1.9.0"
- "socket.io-client": "^4.7.2"

Happy tracking! 🌎🚀
