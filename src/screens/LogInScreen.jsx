import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
  TouchableWithoutFeedback,
  PermissionsAndroid,
  PanResponder,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import CRMImg from '../images/ieCRM Logo 1.svg';
import ProgressDialog from '../components/custom/ProgressDialog';
import NetInfo from '@react-native-community/netinfo';
import { BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const LogInScreen = ({ navigation }) => {
  const initialvalues = {
    businessID: '',
    emailID: '',
    pwdID: '',
  };

  const [data, setData] = useState(initialvalues);
  const dataRef = useRef(initialvalues);
  const [secureText, setSecureText] = useState(true);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [device, setDevice] = useState('');
  const [fcmToken, setFcmToken] = useState('');
  const [focusedInput, setFocusedInput] = useState('');
  const deviceRef = useRef('');
  const fcmTokenRef = useRef('');

  const scaleValue = useRef(new Animated.Value(1)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const swipeX = useRef(new Animated.Value(0)).current;
  const swipeLoginRunningRef = useRef(false);
  const swipeButtonWidthRef = useRef(0);
  const [swipeButtonWidth, setSwipeButtonWidth] = useState(0);

  const dash_url = BASE_URL + 'login/validlogin';

  const togglePasswordVisibility = () => setSecureText(!secureText);
  const toggleCheckbox = () => setChecked(!checked);

  useEffect(() => {
    DeviceInfo.getDeviceName().then(name => {
      deviceRef.current = name;
      setDevice(name);
    });
    requestNotificationPermission();
    getFcmToken();
    getData();

    Animated.parallel([
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 1200,
        delay: 350,
        useNativeDriver: true,
      }),
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 1400,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 3200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 3200,
          useNativeDriver: true,
        }),
      ]),
    ).start();

  }, []);

  const requestNotificationPermission = async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        try {
          const hasPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );

          if (!hasPermission) {
            const result = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
              {
                title: 'Notification Permission',
                message: 'This app wants to send you notifications',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              },
            );

            if (result === PermissionsAndroid.RESULTS.GRANTED) {
              console.log('Permission granted');
            } else {
              Alert.alert('Notification permission denied');
            }
          }
        } catch (err) {
          console.warn('Permission request error:', err);
        }
      }
    }
  };

  const getFcmToken = async () => {
    try {
      await messaging().registerDeviceForRemoteMessages();

      const token = await messaging().getToken();

      console.log('FCM Token:', token);

      fcmTokenRef.current = token;
      setFcmToken(token);

      return token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return '';
    }
  };

  const saveTokenToDatabase = async (
    latestFcmToken,
    IDEmployee,
    loginData = dataRef.current,
    latestDevice = deviceRef.current,
  ) => {
    try {
      const finalToken = latestFcmToken || fcmTokenRef.current || '';
      const finalDevice = latestDevice || deviceRef.current || device || '';

      const body = {
        Businessid: String(loginData.businessID || '').trim(),
        IDEmployee: IDEmployee,
        Token: finalToken,
        EntryUser: String(loginData.emailID || '').trim(),
        EntryDevice: `Mobile- ${finalDevice}`,
      };

      console.log('Saving token to database:', body);

      const response = await fetch(`${BASE_URL}Authentication/TokenSave`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      console.log('TokenSave response:', result);

      if (result.result === '') {
        console.log('Token saved successfully.');
      } else {
        console.warn('Token save failed:', result.result);
      }
    } catch (error) {
      console.error('Error saving token:', error);
    }
  };

  const getData = () => {
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          const parsedData = JSON.parse(value);
          const businessID = parsedData.BusinessID?.trim();
          console.log('Business ID:', businessID);

          navigation.navigate('AppNavScreen');
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  // const login = () => {
  //   NetInfo.fetch().then(state => {
  //     if (state.isConnected) {
  //       setLoading(true);
  //       setTimeout(() => {
  //         setLoading(false);
  //       }, 5000);
  //       submit(dash_url);
  //     } else {
  //       Alert.alert('Please Connect Internet');
  //       setLoading(true);
  //       setTimeout(() => {
  //         setLoading(false);
  //       }, 5000);
  //     }
  //   }, []);
  // };


  const login = () => {
    const latestData = dataRef.current;

    console.log('LOGIN LATEST DATA:', latestData);

    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        setLoading(true);

        setTimeout(() => {
          setLoading(false);
        }, 5000);

        submit(latestData);
      } else {
        Alert.alert('Please Connect Internet');

        setLoading(true);

        setTimeout(() => {
          setLoading(false);
        }, 5000);
      }
    });
  };

  // const submit = async (loginData = dataRef.current) => {
  //   let checkEmail = '[a-zA-Z0-9._-]+@[a-z]+.+[a-z]+';
  //   var response,
  //     IDEmployee,
  //     Empname,
  //     Division,
  //     IDDivision,
  //     IDDesignation,
  //     Empemail,
  //     Designation,
  //     Empno,
  //     HQ,
  //     IDHQ,
  //     Manager,
  //     ManagerAccess,
  //     TrackingTime,
  //     Message,
  //     MobileAccess,
  //     SecurityKey,
  //     FrameFilePath,
  //     ProfilePicPath,
  //     AdminAccess,
  //     System,
  //     ManagerToken;

  //   console.log('SUBMIT LOGIN DATA:', loginData);

  //   if (loginData.businessID === '') {
  //     Alert.alert('Business ID is empty');
  //   } else if (loginData.emailID === '') {
  //     Alert.alert('Email is empty');
  //   } else if (loginData.pwdID === '') {
  //     Alert.alert('Password is empty');
  //   } else if (!loginData.emailID.match(checkEmail)) {
  //     Alert.alert('Invalid Email!');
  //   } else {
  //     const data_api = {
  //       businessid: loginData.businessID,
  //       email: loginData.emailID,
  //       password: loginData.pwdID,
  //     };

  //     console.log(data_api);

  //     let result = await fetch(dash_url, {
  //       method: 'POST',
  //       headers: {
  //         Accept: 'application/json',
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(data_api),
  //     });

  //     result = await result.json();
  //     console.log(result);

  //     response = result.Success;
  //     IDEmployee = result.IDEmployee;
  //     Empname = result.Empname;
  //     Division = result.Division;
  //     IDDivision = result.IDDivision;
  //     IDDesignation = result.IDDesignation;
  //     Empemail = result.Empemail;
  //     Designation = result.Designation;
  //     Empno = result.Empno;
  //     HQ = result.HQ;
  //     IDHQ = result.IDHQ;
  //     Manager = result.Manager;
  //     System = result.System;
  //     Message = result.Message;
  //     MobileAccess = result.MobileAccess;
  //     ManagerAccess = result.ManagerAccess;
  //     TrackingTime = result.TrackingTime;
  //     SecurityKey = result.SecurityKey;
  //     FrameFilePath = result.FrameFilePath;
  //     ProfilePicPath = result.ProfilePicPath;
  //     AdminAccess = result.AdminAccess;
  //     ManagerToken = result.Token;

  //     if (response === false) {
  //       Alert.alert(Message);
  //     } else if (Message === 'Wrong User credential') {
  //       Alert.alert(Message);
  //     } else {
  //       var BusinessID = loginData.businessID;

  //       try {
  //         var userinfo = {
  //           IDEmployee,
  //           Empname,
  //           Division,
  //           IDDivision,
  //           IDDesignation,
  //           Empemail,
  //           Designation,
  //           Empno,
  //           HQ,
  //           IDHQ,
  //           Manager,
  //           System,
  //           response,
  //           BusinessID,
  //           MobileAccess,
  //           ManagerAccess,
  //           TrackingTime,
  //           SecurityKey,
  //           FrameFilePath,
  //           ProfilePicPath,
  //           AdminAccess,
  //           ManagerToken,
  //           Password: loginData.pwdID,
  //           userFcm: fcmToken,
  //         };

  //         await AsyncStorage.setItem('UserData', JSON.stringify(userinfo));
  //         saveTokenToDatabase(fcmToken, IDEmployee, loginData);
  //         navigation.navigate('AppNavScreen');
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     }
  //   }
  // };

  const submit = async (loginData = dataRef.current) => {
    let checkEmail = '[a-zA-Z0-9._-]+@[a-z]+.+[a-z]+';

    var response,
      IDEmployee,
      Empname,
      Division,
      IDDivision,
      IDDesignation,
      Empemail,
      Designation,
      Empno,
      HQ,
      IDHQ,
      Manager,
      ManagerAccess,
      TrackingTime,
      Message,
      MobileAccess,
      SecurityKey,
      FrameFilePath,
      ProfilePicPath,
      AdminAccess,
      System,
      ManagerToken,
      HRMSLeaveKey;

    const cleanLoginData = {
      businessID: String(loginData?.businessID || '').trim(),
      emailID: String(loginData?.emailID || '').trim(),
      pwdID: String(loginData?.pwdID || '').trim(),
    };

    console.log('SUBMIT LOGIN DATA:', cleanLoginData);

    if (cleanLoginData.businessID === '') {
      Alert.alert('Business ID is empty');
      return;
    }

    if (cleanLoginData.emailID === '') {
      Alert.alert('Email is empty');
      return;
    }

    if (cleanLoginData.pwdID === '') {
      Alert.alert('Password is empty');
      return;
    }

    if (!cleanLoginData.emailID.match(checkEmail)) {
      Alert.alert('Invalid Email!');
      return;
    }

    try {
      const data_api = {
        businessid: cleanLoginData.businessID,
        email: cleanLoginData.emailID,
        password: cleanLoginData.pwdID,
      };

      console.log('LOGIN API BODY:', data_api);

      let result = await fetch(dash_url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data_api),
      });

      result = await result.json();

      console.log('LOGIN API RESPONSE:', result);

      response = result.Success;
      IDEmployee = result.IDEmployee;
      Empname = result.Empname;
      Division = result.Division;
      IDDivision = result.IDDivision;
      IDDesignation = result.IDDesignation;
      Empemail = result.Empemail;
      Designation = result.Designation;
      Empno = result.Empno;
      HQ = result.HQ;
      IDHQ = result.IDHQ;
      Manager = result.Manager;
      System = result.System;
      Message = result.Message;
      MobileAccess = result.MobileAccess;
      ManagerAccess = result.ManagerAccess;
      TrackingTime = result.TrackingTime;
      SecurityKey = result.SecurityKey;
      FrameFilePath = result.FrameFilePath;
      ProfilePicPath = result.ProfilePicPath;
      AdminAccess = result.AdminAccess;
      ManagerToken = result.Token;
      HRMSLeaveKey = result.HRMSLeaveKey;
      if (response === false) {
        Alert.alert(Message || 'Login failed');
        return;
      }

      if (Message === 'Wrong User credential') {
        Alert.alert(Message);
        return;
      }

      // ✅ Get latest FCM token safely
      let latestFcmToken = fcmTokenRef.current || fcmToken || '';

      if (!latestFcmToken) {
        latestFcmToken = await getFcmToken();
      }

      if (latestFcmToken) {
        fcmTokenRef.current = latestFcmToken;
        setFcmToken(latestFcmToken);
      }

      // ✅ Get latest device name safely
      let latestDevice = deviceRef.current || device || '';

      if (!latestDevice) {
        try {
          latestDevice = await DeviceInfo.getDeviceName();
          deviceRef.current = latestDevice;
          setDevice(latestDevice);
        } catch (deviceError) {
          console.log('Device name error:', deviceError);
        }
      }

      var BusinessID = cleanLoginData.businessID;

      var userinfo = {
        IDEmployee,
        Empname,
        Division,
        IDDivision,
        IDDesignation,
        Empemail,
        Designation,
        Empno,
        HQ,
        IDHQ,
        Manager,
        System,
        response,
        BusinessID,
        MobileAccess,
        ManagerAccess,
        TrackingTime,
        SecurityKey,
        FrameFilePath,
        ProfilePicPath,
        AdminAccess,
        ManagerToken,
        HRMSLeaveKey,
        Password: cleanLoginData.pwdID,
        userFcm: latestFcmToken,
      };

      console.log('USER INFO TO SAVE:', userinfo);

      await AsyncStorage.setItem('UserData', JSON.stringify(userinfo));

      await saveTokenToDatabase(
        latestFcmToken,
        IDEmployee,
        cleanLoginData,
        latestDevice,
      );

      navigation.navigate('AppNavScreen');
    } catch (error) {
      console.log('Login submit error:', error);
      Alert.alert('Error', 'Unable to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  const handleOnchange = (text, input) => {
    const updatedData = {
      ...dataRef.current,
      [input]: text,
    };

    dataRef.current = updatedData;
    setData(updatedData);
  };

  const resetSwipeLogin = () => {
    Animated.spring(swipeX, {
      toValue: 0,
      friction: 7,
      tension: 80,
      useNativeDriver: false, // width animation needs false
    }).start(() => {
      swipeLoginRunningRef.current = false;
    });
  };

  const swipeLoginResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },

      onPanResponderMove: (_, gestureState) => {
        if (swipeLoginRunningRef.current) return;

        const buttonWidth = swipeButtonWidthRef.current;
        const maxSwipe = Math.max(buttonWidth - 58, 0);

        let nextX = gestureState.dx;

        if (nextX < 0) nextX = 0;
        if (nextX > maxSwipe) nextX = maxSwipe;

        swipeX.setValue(nextX);
      },

      onPanResponderRelease: (_, gestureState) => {
        if (swipeLoginRunningRef.current) return;

        const buttonWidth = swipeButtonWidthRef.current;
        const maxSwipe = Math.max(buttonWidth - 58, 0);
        const shouldLogin = gestureState.dx >= maxSwipe * 0.72;

        if (shouldLogin) {
          swipeLoginRunningRef.current = true;

          Animated.timing(swipeX, {
            toValue: maxSwipe,
            duration: 180,
            useNativeDriver: false, // width animation needs false
          }).start(() => {
            login();

            setTimeout(() => {
              resetSwipeLogin();
            }, 700);
          });
        } else {
          resetSwipeLogin();
        }
      },

      onPanResponderTerminate: () => {
        resetSwipeLogin();
      },
    }),
  ).current;

  const swipeProgressWidth = swipeX.interpolate({
    inputRange: [0, Math.max(swipeButtonWidth - 58, 1)],
    outputRange: [0, Math.max(swipeButtonWidth, 1)],
    extrapolate: 'clamp',
  });

  const swipeTextOpacity = swipeX.interpolate({
    inputRange: [0, Math.max(swipeButtonWidth * 0.45, 1)],
    outputRange: [1, 0.35],
    extrapolate: 'clamp',
  });

  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.975,
      friction: 6,
      tension: 90,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 5,
      tension: 75,
      useNativeDriver: true,
    }).start();
  };

  const cardTranslateY = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  const logoTranslateY = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-12, 0],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0.8],
  });

  return (
    <KeyboardAvoidingView
      style={styles.mainWrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <StatusBar barStyle="light-content" backgroundColor="#003d73" />

      <View style={styles.background}>
        <View style={styles.topGradientBlock} />
        <Animated.View
          style={[
            styles.glowCircleOne,
            {
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            },
          ]}
        />
        <View style={styles.glowCircleTwo} />
        <View style={styles.glowCircleThree} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <Animated.View
            style={[
              styles.logoSection,
              {
                opacity: logoAnim,
                transform: [{ translateY: logoTranslateY }],
              },
            ]}>
            <View style={styles.logoCard}>
              <CRMImg height={160} width={148} />
            </View>

            {/* <Text style={styles.appName}>ie.CRM</Text> */}
            <Text style={styles.tagline}>Smart Field Force Automation</Text>
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>Version 1.3</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.container,
              {
                opacity: cardAnim,
                transform: [{ translateY: cardTranslateY }],
              },
            ]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.brandViewTextMain}>Welcome Back</Text>
                <Text style={styles.brandViewTextSub}>
                  Sign in to continue your CRM workspace
                </Text>
              </View>

              <View style={styles.secureBadge}>
                <Ionicons name="shield-checkmark" size={16} color="#67bc45" />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.inputRow,
                  focusedInput === 'businessID' && styles.inputRowActive,
                ]}>
                <View
                  style={[
                    styles.iconBox,
                    focusedInput === 'businessID' && styles.iconBoxActive,
                  ]}>
                  <MaterialIcons
                    name="business"
                    size={21}
                    color={
                      focusedInput === 'businessID' ? '#ffffff' : '#005696'
                    }
                  />
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Business ID"
                  placeholderTextColor="#8b99a8"
                  onChangeText={text => handleOnchange(text, 'businessID')}
                  autoCapitalize="characters"
                  onFocus={() => setFocusedInput('businessID')}
                  onBlur={() => setFocusedInput('')}
                />
              </View>

              <View
                style={[
                  styles.inputRow,
                  focusedInput === 'emailID' && styles.inputRowActive,
                ]}>
                <View
                  style={[
                    styles.iconBox,
                    focusedInput === 'emailID' && styles.iconBoxActive,
                  ]}>
                  <MaterialIcons
                    name="alternate-email"
                    size={21}
                    color={focusedInput === 'emailID' ? '#ffffff' : '#005696'}
                  />
                </View>

                <TextInput
                  placeholder="Email ID"
                  placeholderTextColor="#8b99a8"
                  onChangeText={text => handleOnchange(text, 'emailID')}
                  autoCapitalize="none"
                  style={styles.input}
                  keyboardType="email-address"
                  onFocus={() => setFocusedInput('emailID')}
                  onBlur={() => setFocusedInput('')}
                />
              </View>

              <View
                style={[
                  styles.inputRow,
                  focusedInput === 'pwdID' && styles.inputRowActive,
                ]}>
                <View
                  style={[
                    styles.iconBox,
                    focusedInput === 'pwdID' && styles.iconBoxActive,
                  ]}>
                  <Entypo
                    name="key"
                    size={20}
                    color={focusedInput === 'pwdID' ? '#ffffff' : '#005696'}
                  />
                </View>

                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#8b99a8"
                  onChangeText={text => handleOnchange(text, 'pwdID')}
                  style={styles.input}
                  secureTextEntry={secureText}
                  autoCapitalize="none"
                  onFocus={() => setFocusedInput('pwdID')}
                  onBlur={() => setFocusedInput('')}
                />

                <TouchableOpacity
                  onPress={togglePasswordVisibility}
                  style={styles.eyeButton}
                  activeOpacity={0.75}>
                  <Ionicons
                    name={secureText ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color="#6b7b8f"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.rememberContainer}>
                <TouchableOpacity
                  style={[styles.checkbox, checked && styles.checked]}
                  onPress={toggleCheckbox}
                  activeOpacity={0.8}>
                  {checked && <Feather name="check" size={15} color="#fff" />}
                </TouchableOpacity>

                <TouchableOpacity onPress={toggleCheckbox} activeOpacity={0.8}>
                  <Text style={styles.rememberText}>Remember Me</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* <TouchableWithoutFeedback
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              onPress={login}>
              <Animated.View
                style={[
                  styles.loginButtonModern,
                  { transform: [{ scale: scaleValue }] },
                ]}>
                <View style={styles.loginButtonGlow} />

                <View style={styles.loginButtonContent}>
                  <View style={styles.loginTextWrap}>
                    <Text style={styles.loginTextModern}>Login</Text>
                    <Text style={styles.loginSubText}>Secure CRM access</Text>
                  </View>

                  <View style={styles.loginArrowBox}>
                    <Feather name="arrow-up-right" size={20} color="#005696" />
                  </View>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback> */}
            <View
              style={styles.swipeLoginWrapper}
              onLayout={event => {
                const layoutWidth = event.nativeEvent.layout.width;
                swipeButtonWidthRef.current = layoutWidth;
                setSwipeButtonWidth(layoutWidth);
              }}>
              <Animated.View
                style={[
                  styles.loginButtonModern,
                  {
                    transform: [{ scale: scaleValue }],
                  },
                ]}>
                <View style={styles.loginButtonGlow} />

                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.swipeLoginProgress,
                    {
                      width: swipeProgressWidth,
                    },
                  ]}
                />

                <Animated.View
                  style={[
                    styles.swipeLoginTextArea,
                    {
                      opacity: swipeTextOpacity,
                    },
                  ]}>
                  <Text style={styles.loginTextModern}>Swipe to Login</Text>
                  <Text style={styles.loginSubText}>Secure CRM access</Text>
                </Animated.View>

                <Animated.View
                  {...swipeLoginResponder.panHandlers}
                  style={[
                    styles.loginSwipeArrowBox,
                    {
                      transform: [{ translateX: swipeX }],
                    },
                  ]}>
                  <Feather name="arrow-right" size={22} color="#005696" />
                </Animated.View>
              </Animated.View>
            </View>

          </Animated.View>

          <View style={styles.footerBox}>
            <Text style={styles.footerText}>
              By login you agree to the{' '}
              <Text style={styles.link}>Terms & Conditions</Text> and Privacy
              policy.
            </Text>
            <Text style={styles.copyText}>
              © {currentYear} ie.CRM Pharma. All rights reserved.
            </Text>
          </View>

          {/* <ProgressDialog visible={loading} message="Please Wait..." /> */}
          {loading && <View style={styles.loader}>
            <LottieView
              source={require('../assets/inside_page_loader.json')}
              autoPlay
              loop
              style={{ width: 150, height: 150 }}
            />
            <Text style={styles.loaderText}>Please Wait...</Text>
          </View>}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LogInScreen;

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: '#003d73',
  },

  background: {
    flex: 1,
    backgroundColor: '#eef7fb',
    overflow: 'hidden',
  },

  topGradientBlock: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.47,
    backgroundColor: '#005696',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },

  glowCircleOne: {
    position: 'absolute',
    width: width * 0.92,
    height: width * 0.92,
    borderRadius: width,
    backgroundColor: '#0a71b8',
    top: -width * 0.42,
    right: -width * 0.35,
  },

  glowCircleTwo: {
    position: 'absolute',
    width: width * 0.45,
    height: width * 0.45,
    borderRadius: width,
    backgroundColor: 'rgba(103,188,69,0.26)',
    top: height * 0.17,
    left: -width * 0.18,
  },

  glowCircleThree: {
    position: 'absolute',
    width: width * 0.34,
    height: width * 0.34,
    borderRadius: width,
    backgroundColor: 'rgba(255,255,255,0.13)',
    top: height * 0.08,
    right: width * 0.08,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: width * 0.055,
    paddingTop: Platform.OS === 'ios' ? height * 0.045 : height * 0.035,
    paddingBottom: 26,
  },

  logoSection: {
    alignItems: 'center',
    marginTop: height * 0.02,
  },

  logoCard: {
    width: 164,
    height: 134,
    borderRadius: 38,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    marginTop: -30,
  },

  appName: {
    color: '#ffffff',
    fontSize: 29,
    fontWeight: '800',
    marginTop: 16,
    letterSpacing: 0.3,
  },

  tagline: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    marginTop: 4,
    letterSpacing: 0.4,
  },

  versionBadge: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },

  versionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },

  container: {
    backgroundColor: '#ffffff',
    marginTop: height * 0.035,
    paddingHorizontal: width * 0.055,
    paddingTop: 26,
    paddingBottom: 28,
    borderRadius: 30,

    shadowColor: '#003d73',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 12,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },

  brandViewTextMain: {
    color: '#16324f',
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  brandViewTextSub: {
    color: '#7b8a9b',
    fontSize: 13,
    marginTop: 6,
    lineHeight: 19,
  },

  secureBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eef8eb',
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputContainer: {
    width: '100%',
  },

  inputRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f8fb',
    borderRadius: 18,
    paddingHorizontal: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e4edf3',
  },

  inputRowActive: {
    backgroundColor: '#ffffff',
    borderColor: '#67bc45',

    shadowColor: '#67bc45',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 14,
    elevation: 3,
  },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#e8f2f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  iconBoxActive: {
    backgroundColor: '#005696',
  },

  input: {
    flex: 1,
    fontSize: 15.5,
    color: '#15283c',
    fontWeight: '500',
    paddingVertical: Platform.OS === 'ios' ? 13 : 9,
  },

  eyeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 22,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: '#b8c4cf',
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },

  checked: {
    backgroundColor: '#67bc45',
    borderColor: '#67bc45',
  },

  rememberText: {
    marginLeft: 10,
    color: '#506276',
    fontSize: 14,
    fontWeight: '600',
  },

  loginButtonModern: {
    height: 64,
    borderRadius: 22,
    backgroundColor: '#0d88e6',
    alignSelf: 'center',
    width: '100%',
    overflow: 'hidden',

    shadowColor: '#0d88e6',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 22,
    elevation: 10,
  },

  loginButtonGlow: {
    position: 'absolute',
    width: '62%',
    height: 120,
    borderRadius: 80,
    //backgroundColor: 'rgba(253, 166, 51, 0.92)',
    top: -42,
    right: -28,
    backgroundColor: '#0d88e6',
  },

  loginButtonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 24,
    paddingRight: 12,
  },

  loginTextWrap: {
    justifyContent: 'center',
  },

  loginTextModern: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  loginSubText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 3,
    letterSpacing: 0.2,
  },

  loginArrowBox: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#001b33',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },

  footerBox: {
    marginTop: 24,
    paddingHorizontal: 10,
    alignItems: 'center',
  },

  footerText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#506276',
    lineHeight: 18,
  },

  copyText: {
    marginTop: 6,
    fontSize: 12,
    textAlign: 'center',
    color: '#7a8a9b',
  },

  link: {
    textDecorationLine: 'underline',
    color: '#005696',
    fontWeight: '700',
  },
  swipeLoginWrapper: {
    width: '100%',
    alignSelf: 'center',
  },

  swipeLoginProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(103,188,69,0.88)',
    borderRadius: 22,
  },

  swipeLoginTextArea: {
    position: 'absolute',
    left: 76,
    right: 18,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },

  loginSwipeArrowBox: {
    position: 'absolute',
    left: 8,
    top: 8,
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#001b33',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loaderText: {
    marginTop: 12,
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});