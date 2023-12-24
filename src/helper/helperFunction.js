// import { showMessage } from "react-native-flash-message"
import { PermissionsAndroid, Platform } from "react-native";
import Geolocation from '@react-native-community/geolocation';

export const getCurrentLocation = () =>

    new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
            position => {
                const cords = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    heading: position?.coords?.heading,
                };
                console
                resolve(cords);
            },
            error => {
                reject(error.message);
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 },
        )
    })
export const getCurrentWatch = () =>

    new Promise((resolve, reject) => {
        Geolocation.watchPosition(
            position => {
                console.log('position call ---', position.coords.latitude, position.coords.longitude);
                const cords = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    heading: position?.coords?.heading,
                };
                console
                resolve(cords);
            },
            error => {
                reject(error.message);
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 },
        )
    })

export const locationPermission = () => new Promise(async (resolve, reject) => {
    if (Platform.OS === 'ios') {
        try {
            const permissionStatus = await Geolocation.requestAuthorization('always');
            if (permissionStatus === 'granted') {
                return resolve("granted");
            }
            reject('Permission not granted');
        } catch (error) {
            return reject(error);
        }
    }
    return PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ).then((granted) => {
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            resolve("granted");
        }
        return reject('Location Permission denied');
    }).catch((error) => {
        console.log('Ask Location permission error: ', error);
        return reject(error);
    });
});

const showError = (message) => {
    console.log('showError', message);
}

const showSuccess = (message) => {
    console.log('showSuccess', message);
}

export {
    showError,
    showSuccess
}