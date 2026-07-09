import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ImageBackground,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import CRMImg from '../images/ieCRM Logo 1.svg';
import ProgressDialog from '../components/custom/ProgressDialog';
import NetInfo from '@react-native-community/netinfo';
import {BASE_URL} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';

const {width, height} = Dimensions.get('window');

const LogInScreen = ({navigation}) => {
  const initialvalues = {
    //businessID: 'PHARMA-CITY-730',
    businessID: '',
    emailID: '',
    pwdID: '',
  };
  const [data, setData] = useState(initialvalues);
  const [secureText, setSecureText] = useState(true);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const scaleValue = useRef(new Animated.Value(1)).current;
  const dash_url = BASE_URL + 'login/validlogin';
  const [device, setDevice] = useState('');
  const [fcmToken, setFcmToken] = useState('');

  const togglePasswordVisibility = () => setSecureText(!secureText);
  const toggleCheckbox = () => setChecked(!checked);
  useEffect(() => {
    // code by suman jana 07/11/2025
    DeviceInfo.getDeviceName().then(setDevice);
    requestNotificationPermission();
    getFcmToken();
    // end code by suman jana 07/11/2025
    //console.log('dash_url', dash_url);
    getData();
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
      // Register the device (important for iOS)
      await messaging().registerDeviceForRemoteMessages();

      const token = await messaging().getToken();
      console.log('FCM Token:', token);

      //  Save token to your backend or SQLite
      // saveTokenToDatabase(token); // Your own implementation
      setFcmToken(token);
    } catch (error) {
      console.error('Failed to get FCM token:', error);
    }
  };
  const saveTokenToDatabase = async (fcmToken, IDEmployee) => {
    try {
      const body = {
        Businessid: data.businessID,
        IDEmployee: IDEmployee,
        Token: fcmToken,
        EntryUser: data.emailID,
        EntryDevice: `Mobile- ${device}`,
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
          //navigation.navigate(DashBoard);
          //navigation.navigate('AppNavScreen');
          const parsedData = JSON.parse(value); // convert JSON string to object
          const businessID = parsedData.BusinessID?.trim(); // safely access BusinessID and trim whitespace
          console.log('Business ID:', businessID);

          navigation.navigate('AppNavScreen');
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const login = () => {
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        //Alert.alert('Online');
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
        }, 5000);
        submit(dash_url);
      } else {
        Alert.alert('Please Connect Internet');
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
        }, 5000);
      }
    }, []);
  };
  const submit = async () => {
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
      GUID,
      BUSINESS_ID;
    console.log(data);
    //setData(initialvalues);
    if (data.businessID === '') {
      //console.warn('Business ID is empty');
      Alert.alert('Business ID is empty');
    } else if (data.emailID === '') {
      Alert.alert('Email is empty');
    } else if (data.pwdID === '') {
      Alert.alert('Password is empty');
    } else if (!data.emailID.match(checkEmail)) {
      Alert.alert('Invalid Email!');
    } else {
      const data_api = {
        businessid: data.businessID,
        email: data.emailID,
        password: data.pwdID,
      };
      console.log(data_api);

      let result = await fetch(dash_url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data_api),
      });

      result = await result.json();
      console.log(result);

      //Fetch data from API & display the result
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
      GUID = await AsyncStorage.getItem('GUID');
      BUSINESS_ID = await AsyncStorage.getItem('BUSINESS_ID');

      if (response === false) {
        //Alert.alert('Either business id or email or password incorrect!!');
        Alert.alert(Message);
      } else if (Message === 'Wrong User credential') {
        Alert.alert(Message);
      } else {
        var BusinessID = data.businessID;
        //AsyncStorage for multiple item start
        try {
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
            GUID,
            BUSINESS_ID,
            Password: data.pwdID, //  Store password here
            userFcm: fcmToken, // Store FCM token here
          };
          await AsyncStorage.setItem('UserData', JSON.stringify(userinfo));
          //console.warn(data.businessID);
          saveTokenToDatabase(fcmToken, IDEmployee); // Save FCM token to database
          navigation.navigate('AppNavScreen');
        } catch (error) {
          console.log(error);
        }
        //AsyncStorage for multiple item end
      }
    }
  };

  const currentYear = new Date().getFullYear();

  const handleOnchange = (text, input) => {
    setData(prevState => ({...prevState, [input]: text}));
  };

  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 1.4, // shrink a bit
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1, // back to normal
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1, backgroundColor: '#005696'}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <StatusBar barStyle="light-content" backgroundColor="#005696" />

      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        keyboardShouldPersistTaps="handled"
        bounces={false}>
        {/* Logo */}
        <View style={{alignItems: 'center', marginTop: height * 0.05}}>
          <CRMImg height={183} width={154} />
          <Text style={styles.versionText}>Version 1.1</Text>
        </View>

        {/* Login Box */}
        <View style={styles.container}>
          <View style={styles.inputContainer}>
            <Text style={styles.brandViewTextMain}>User Login</Text>

            {/* Business ID */}
            <View style={styles.inputRow}>
              <MaterialIcons name="home" size={24} color="#555" />
              <TextInput
                style={styles.input}
                placeholder="Business ID"
                onChangeText={text => handleOnchange(text, 'businessID')}
                autoCapitalize="characters"
              />
            </View>

            {/* Email */}
            <View style={styles.inputRow}>
              <MaterialIcons name="alternate-email" size={22} color="#555" />
              <TextInput
                placeholder="Email ID"
                onChangeText={text => handleOnchange(text, 'emailID')}
                autoCapitalize="none"
                style={styles.input}
                keyboardType="email-address"
              />
            </View>

            {/* Password */}
            <View style={styles.inputRow}>
              <Entypo name="key" size={22} color="#555" />
              <TextInput
                placeholder="Password"
                onChangeText={text => handleOnchange(text, 'pwdID')}
                style={styles.input}
                secureTextEntry={secureText}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={togglePasswordVisibility}>
                <Ionicons
                  name={secureText ? 'eye-off' : 'eye'}
                  size={22}
                  color="#555"
                />
              </TouchableOpacity>
            </View>

            {/* Remember Me */}
            <View style={styles.rememberContainer}>
              <TouchableOpacity
                style={[styles.checkbox, checked && styles.checked]}
                onPress={toggleCheckbox}>
                {checked && <Feather name="check" size={16} color="#fff" />}
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleCheckbox}>
                <Text style={{marginLeft: 10}}>Remember Me</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          {/* <TouchableOpacity onPress={login} activeOpacity={0.8}>
            <View style={styles.loginButton}>
              <Text style={styles.loginText}>Login</Text>
            </View>
          </TouchableOpacity> */}
          <TouchableWithoutFeedback
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={login}>
            <Animated.View
              style={[styles.loginButton, {transform: [{scale: scaleValue}]}]}>
              <Text style={styles.loginText}>Login</Text>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          By login you agree to the{' '}
          <Text style={styles.link}>Terms & Conditions</Text> and Privacy
          policy.{'\n'}© {currentYear} ie.CRM. All rights reserved.
        </Text>

        <ProgressDialog visible={loading} message="Please Wait..." />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LogInScreen;
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f7fdfd',
    marginHorizontal: width * 0.06,
    marginTop: height * 0.03,
    padding: width * 0.05,
    paddingBottom: 30,
    borderRadius: 18,

    // iOS Shadows
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 6,

    // Android elevation
    elevation: 7,
  },

  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 12,
    marginBottom: 10,
  },

  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },

  loginButton: {
    backgroundColor: '#005696',
    paddingVertical: 15,
    borderRadius: 10,
    width: width * 0.7,
    alignSelf: 'center',
    marginTop: 10,
  },

  loginText: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },

  versionText: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 10,
  },

  brandViewTextMain: {
    color: '#786c77',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },

  checked: {
    backgroundColor: '#005696',
  },

  footerText: {
    marginTop: 18,
    fontSize: 12,
    textAlign: 'center',
    color: '#ffffff',
    paddingHorizontal: 20,
    lineHeight: 18,
  },

  link: {
    textDecorationLine: 'underline',
    color: '#ffffff',
  },
});
