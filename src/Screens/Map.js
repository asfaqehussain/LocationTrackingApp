import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
  AppState,
} from 'react-native';
import MapView, { Marker, AnimatedRegion } from 'react-native-maps';
import images from '../constants/images';
import Loader from '../components/Loader';
import { locationPermission, getCurrentLocation } from '../helper/helperFunction';
import BackgroundTimer from 'react-native-background-timer';

const screen = Dimensions.get('window');
const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.04;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
let usersData = [];

const Map = ({ navigation, route }) => {
  const SocketClient = require('../SocketClient');

  const mapRef = useRef();
  const markerRef = useRef();

  // ------------------socket CODE-----------------
  const track = new SocketClient('01HBJYWF109Q3FEJX5X4748CNR');

  const socketSubscribeFunction = () => {
    track.subscribe('tasleem_channel', 'event_name', data => {
      // Check if the user with the given userID already exists in the array
      const existingUserIndex = usersData.findIndex(
        user => user.userId === data.userId,
      );

      if (existingUserIndex !== -1) {
        // If the user already exists, update their lat and long
        usersData[existingUserIndex].lat = data.coordinate.latitude;
        usersData[existingUserIndex].long = data.coordinate.longitude;
      } else {
        // If the user doesn't exist, create a new entry in the array
        const newUser = {
          userId: data.userId,
          lat: data.coordinate.latitude,
          long: data.coordinate.longitude,
        };
        usersData.push(newUser);
      }
    });
  };

  useEffect(() => {
    socketSubscribeFunction();
  }, []);

  track.listen('track:subscription_error', err => {
    console.log('subscription_error ---> ', err);
  });
  track.listen('track:subscription_sucess', msg => {
    console.log('subscription_sucess ---> ', msg);
  });

  const callTrigger = (latitude, longitude) => {
    console.log('trigger call ---> ', route?.params?.user_id);

    track.trigger('tasleem_channel', 'event_name', {
      coordinate: {
        latitude,
        longitude,
      },
      userId: route?.params?.user_id,
    });
  };

  // -------------------App State Code ------------------
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground!');
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
      console.log('AppState', appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);
  console.log('appStateVisible====>', appStateVisible);

  // ------------------------

  const disconnectSocket = () => {
    track.unbind('tasleem_channel', 'event_name');
    console.log('Unbind call --> ');
    // track.disconnect();
    navigation.goBack();
  };

  // socket background call
  useEffect(() => {
    if (appStateVisible == 'background') {
      BackgroundTimer.runBackgroundTimer(() => {
        getLiveLocation();
        console.log('call -- BG Func ---> ');
      }, 4000);
    } else {
      null;
    }

    return () => {
      BackgroundTimer.stopBackgroundTimer();
    };
  }, [appStateVisible]);
  // -----------------socket CODE------------------

  const [state, setState] = useState({
    curLoc: {
      latitude: 30.7046,
      longitude: 77.1025,
    },
    isLoading: false,
    coordinate: new AnimatedRegion({
      latitude: 30.7046,
      longitude: 77.1025,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    }),
    time: 0,
    distance: 0,
    heading: 0,
  });

  const { curLoc, isLoading, coordinate, heading } = state;
  const updateState = data => setState(state => ({ ...state, ...data }));

  useEffect(() => {
    getLiveLocation();
  }, []);

  const getLiveLocation = async () => {
    const locPermissionDenied = await locationPermission();
    console.log(' locPermissionDenied----', locPermissionDenied);

    if (locPermissionDenied) {
      const { latitude, longitude, heading } = await getCurrentLocation();
      console.log('call the live location --- >>', latitude, longitude);
      callTrigger(latitude, longitude, heading);
      animate(latitude, longitude);
      updateState({
        heading: heading,
        curLoc: { latitude, longitude },
        coordinate: new AnimatedRegion({
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }),
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      getLiveLocation();
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const animate = (latitude, longitude) => {
    const newCoordinate = { latitude, longitude };
    if (Platform.OS == 'android') {
      if (markerRef.current) {
        markerRef.current.animateMarkerToCoordinate(newCoordinate, 7000);
      }
    } else {
      coordinate.timing(newCoordinate).start();
    }
  };

  const onCenter = () => {
    mapRef.current.animateToRegion({
      latitude: curLoc.latitude,
      longitude: curLoc.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    });
  };

  return (
    <View style={styles.container}>
      <>
        <View
          style={{
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center',
            height: 70,
          }}>
          <Image
            source={images.logo}
            style={{ height: 30, width: 250, resizeMode: 'contain' }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            initialRegion={{
              ...curLoc,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}>
            <Marker.Animated ref={markerRef} coordinate={coordinate}>
              <Image
                source={images.primaryMarker}
                style={{
                  width: 40,
                  height: 40,
                  transform: [{ rotate: `${heading}deg` }],
                }}
                resizeMode="contain"
              />
            </Marker.Animated>

            {usersData.map((user, index) => (
              <Marker
                key={index}
                coordinate={{ latitude: user.lat, longitude: user.long }}>
                <Image
                  source={images.secondaryMarker}
                  style={{ height: 60, width: 60, resizeMode: 'contain' }}
                />
              </Marker>
            ))}
          </MapView>
          <TouchableOpacity
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
            }}
            onPress={onCenter}>
            <Image source={images.button} />
          </TouchableOpacity>
        </View>

        <Loader isLoading={isLoading} />
        <View style={styles.bottomView}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#000' }}>
            CurrentLocation: {curLoc.latitude} / {curLoc.longitude}
          </Text>

          <TouchableOpacity
            style={styles.unbindButton}
            onPress={disconnectSocket}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Unbind</Text>
          </TouchableOpacity>
        </View>
      </>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomCard: {
    backgroundColor: 'white',
    width: '100%',
    padding: 30,
    borderTopEndRadius: 24,
    borderTopStartRadius: 24,
  },
  inpuStyle: {
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    marginTop: 16,
  },
  unbindButton: {
    backgroundColor: '#7F00FF',
    height: 35,
    width: 95,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
  },
  bottomView: {
    backgroundColor: '#fff',
    height: 100,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Map;
