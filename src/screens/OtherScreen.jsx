import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Dimensions,
  StyleSheet,
  KeyboardAvoidingView,
  Alert,
  BackHandler,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState,useRef, useCallback} from 'react';
import Geolocation from '@react-native-community/geolocation';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import {Dropdown} from 'react-native-element-dropdown';
import {TextInput} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {openDatabase} from 'react-native-sqlite-storage';
import CustomButton from '../components/custom/CustomButton';
import moment from 'moment';
import DeviceInfo from 'react-native-device-info';
import {BASE_URL} from '@env';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import {useFocusEffect} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {showLocalNotification} from '../services/notifications';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

//database connection
const db = openDatabase(
  {
    name: 'CRM_db',
    location: 'default',
  },
  () => {
    console.log('Database connected!');
  }, //on success
  error => console.log('Database error', error), //on error
);

const OtherScreen = ({navigation}) => {
  const [currentLongitude, setCurrentLongitude] = useState('0.00');
  const [currentLatitude, setCurrentLatitude] = useState('0.00');
  const [locationStatus, setLocationStatus] = useState('');
  const [useDivision, setDivision] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [empNO, setEmpno] = useState('');
  const [empName, setEmpName] = useState('');
  const [useHQ, setHQ] = useState('');
  const [currDate, setcurrDate] = useState('');
  const [useWTData, setWTData] = useState([]);
  const [currTime, setcurrTime] = useState('');
  const [wtdataLabel, setwtdataLabel] = useState('');
  const [wtdataValue, setwtdataValue] = useState('');
  const [deviceType, setDevice] = useState('');
  const [isSaving, setIsSaving] = useState(false);
    const saveInProgress = useRef(false);
  const [useIDEmployee, setIDEmployee] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [username, setUsername] = useState('');
  const [empPassword, setusePassword] = useState('');
  const [useManagerToken, setuseManagerToken] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [useRemarks, setRemarks] = useState('');
  const [useMobileAccess, setuseMobileAccess] = useState('');
  const [useManagerAccess, setuseManagerAccess] = useState('');
  const [allowBackdatedEntry, setAllowBackdatedEntry] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [cdate, setcurDate] = useState('');

  //var cdate = moment().format('D/MMM/YYYY');

  var date = new Date().getDate(); //Current Date
  var month = new Date().getMonth() + 1; //Current Month
  var year = new Date().getFullYear(); //Current Year

  useEffect(() => {
    getOneTimeLocation();
    handleEnabledPressed();
    handleCheckPressed();

    setcurrDate(date + '/' + month + '/' + year);

    var currDate = moment().format('D/MMM/YYYY');
    setcurDate(currDate);
    DeviceInfo.getDeviceName().then(deviceName => {
      setDevice(deviceName);
    });

    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          setEmpno(user.Empno);
          setuseManagerAccess(user.ManagerAccess);
          setHQ(user.HQ);
          setDivision(user.Division);
          setIDEmployee(user.IDEmployee);
          setEmpEmail(user.Empemail);
          setUsername(user.Empname);
          setusePassword(user.Password);
          setuseManagerToken(user.ManagerToken);
          setBusinessID(user.BusinessID);
          setEmpName(user.Empname);
          setuseMobileAccess(user.MobileAccess);
          //console.warn(user);

          NetInfo.fetch().then(async state => {
            if (state.isConnected) {
              try {
                const response = await fetch(
                  BASE_URL +
                    'Configuration/ConfigurationDetail?Businessid=' +
                    user.BusinessID,
                );

                const json = await response.json();

                // API returns array
                if (json.length > 0) {
                  setAllowBackdatedEntry(json[0].CKBAllowBackdatedEntryInDcr);
                }
              } catch (error) {
                console.log(error);
              }
              const wturl =
                BASE_URL +
                'Misc/EmployeeDesignationWiseList?Businessid=' +
                user.BusinessID +
                '&Type=WORKTYPE' +
                '&IDEmployee=' +
                user.IDEmployee;
              console.log(wturl);
              var config = {
                method: 'get',
                url: wturl,
              };
              axios(config)
                .then(function (response) {
                  var count = Object.keys(response.data).length;
                  let wtNameArray = [];
                  for (var i = 0; i < count; i++) {
                    wtNameArray.push({
                      //value: response.data[i].Value,
                      value: response.data[i].IDMisc,
                      label: response.data[i].Name,
                    });
                  }
                  wtNameArray.shift();
                  setWTData(wtNameArray);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });
            } else {
              fetchOfflineTableData();
            }
          }, []);
        }
      });
    } catch (error) {
      Alert.alert(error);
    }

    setInterval(() => {
      setcurrTime(new Date().toLocaleTimeString());
      //setcurrTime(new Date().getHours()+':'+new Date().getMinutes()+':'+new Date().getSeconds());
    }, 1000);

    const interval = setInterval(() => {
      handleCheckPressed();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('AppNavDCRScreen'); // <-- Your main screen
        return true; // prevent default back behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation]),
  );

  const save = () => {
    if (currentLongitude == 0.0 && currentLatitude == 0.0) {
      Alert.alert(
        'Invalid Location',
        'Latitude and Longitude are both 0.00. Closing the app.',
        [
          {
            text: 'OK',
            onPress: () => {
              BackHandler.exitApp(); // This will close the app
              navigation.navigate('AppNavScreen');
            },
          },
        ],
        {cancelable: false},
      );
    } else if (useRemarks === '') {
      Alert.alert('Type Remarks');
    } else if (wtdataValue === '') {
      Alert.alert('Select Work Type');
    } else {
      try {
        AsyncStorage.getItem('IDday').then(value => {
          if (value != null) {
            let IDday = JSON.parse(value);

            EndOthersDcr(IDday);
          }
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const EndOthersDcr = IDday => {
    let Mvisitwith = [];
    let GProdID = [];
    let GfStatus = [];
    let ProdID = [];
    let curstageID = [];
    let fStatus = [];
    let SProdID = [];
    let SfStatus = [];
    let samples = [];
    let gifts = [];
    let statuss = [];
    let visitwith = [];

    var date = moment().utcOffset('+05:30').format('YYYY-MM-DD hh:mm:ss A');
    //console.warn(date);

    if (useMobileAccess === 'ONLINE') {
      NetInfo.fetch().then(async state => {
        if (state.isConnected) {
          if (useManagerAccess === true) {
            const data_api = {
              IDDCR: 0,
              IDDay: IDday,
              DCRDate: cdate,
              DCRTime: date,
              DCRType: 'OTHERS',
              EntryType: 'ONLINE_' + deviceType,
              Sync: false,
              UNListed: false,
              User: empEmail,
              Businessid: useBusinessID,
              UserLat: currentLatitude,
              UserLong: currentLongitude,
              IDEmployee: useIDEmployee,
              IDWorktype: wtdataValue,
              IDDoctor: 0,
              Remarks: useRemarks,
              Samples: samples,
              Gifts: gifts,
              ProductStatuss: statuss,
              Visitwiths: visitwith,
            };

            //console.log(data_api);
            if (saveInProgress.current) {
      return;
    }

    saveInProgress.current = true;
    setIsSaving(true);
try{
            let result = await fetch(BASE_URL + 'Manager/DCR/Web/Save', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data_api),
            });

            result = await result.json();
            //console.log(result);
            if (result.result === '') {
              showLocalNotification(
                `Hi ${username}`,
                `Successfully Submit the Other Dcr \nDate & Time: ${
                  date || 'N/A'
                }.`,
              );
              const token = await getAccessToken(); // get Bearer token
              const messageTitle = 'New Others DCR Submitted by ' + username;
              const messageBody = `Employee ${username} Successfully Submit the Other Dcr \nDate & Time: ${
                date || 'N/A'
              }.`;
              await sendNotificationToManager(
                useManagerToken,
                messageTitle,
                messageBody,
                token,
              );

              Alert.alert(
                'Success',
                'Record Successfully Saved',
                [
                  {
                    text: 'Ok',
                    //onPress: () => navigation.navigate('Report DashBoard'),
                    onPress: () => navigation.navigate('AppNavDCRScreen'),
                  },
                ],
                {cancelable: false},
              );
            } else {
              Alert.alert(`${result.result}`);
              navigation.navigate('AppNavDCRScreen');
            }
          } catch (error) { 
            console.error('Error during save operation:', error);
            Alert.alert('Error', 'An error occurred while saving the record. Please try again.');
          }
          finally {
            saveInProgress.current = false;
            setIsSaving(false);
          }
          } else {
            const data_api = {
              IDDCR: 0,
              IDDay: IDday,
              DCRDate: cdate,
              DCRType: 'OTHERS',
              EntryType: 'ONLINE_' + deviceType,
              UserLat: currentLatitude,
              UserLong: currentLongitude,
              Remarks: useRemarks,
              User: empEmail,
              IDEmployee: useIDEmployee,
              IDWorktype: wtdataValue,
              IDDoctor: 0,
              Businessid: useBusinessID,
              UNListed: false,
            };

            //console.log(data_api);
            if (saveInProgress.current) {
      return;
    }

    saveInProgress.current = true;
    setIsSaving(true);
try{
            let result = await fetch(BASE_URL + 'DCR/Mobile/Save', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data_api),
            });

            result = await result.json();
            //console.log(result);
            if (result.result === '') {
              showLocalNotification(
                `Hi ${username}`,
                `Successfully Submit the Other Dcr \nDate & Time: ${
                  date || 'N/A'
                }.`,
              );
              const token = await getAccessToken(); // get Bearer token
              const messageTitle = 'New Others DCR Submitted by ' + username;
              const messageBody = `Employee ${username} Successfully Submit the Other Dcr \nDate & Time: ${
                date || 'N/A'
              }.`;
              await sendNotificationToManager(
                useManagerToken,
                messageTitle,
                messageBody,
                token,
              );
              Alert.alert(
                'Success',
                'Record Successfully Saved',
                [
                  {
                    text: 'Ok',
                    //onPress: () => navigation.navigate('Report DashBoard'),
                    onPress: () => navigation.navigate('AppNavDCRScreen'),
                  },
                ],
                {cancelable: false},
              );
            } else {
              Alert.alert(`${result.result}`);
              navigation.navigate('AppNavDCRScreen')
            }
          }
          catch (error) {
            console.error('Error during save operation:', error);
            Alert.alert('Error', 'An error occurred while saving the record. Please try again.');
          }
          finally {
            saveInProgress.current = false;
            setIsSaving(false);
          }
          }
        } else {
          Alert.alert('You are Offline Contact With Administrator!');
        }
      }, []);
    } else if (useMobileAccess === 'ONLINE & OFFLINE') {
      NetInfo.fetch().then(async state => {
        if (state.isConnected) {
          if (useManagerAccess === true) {
            const data_api = {
              IDDCR: 0,
              IDDay: IDday,
              DCRDate: cdate,
              DCRTime: date,
              DCRType: 'OTHERS',
              EntryType: 'ONLINE_' + deviceType,
              Sync: false,
              UNListed: false,
              User: empEmail,
              Businessid: useBusinessID,
              UserLat: currentLatitude,
              UserLong: currentLongitude,
              IDEmployee: useIDEmployee,
              IDWorktype: wtdataValue,
              IDDoctor: 0,
              Remarks: useRemarks,
              Samples: samples,
              Gifts: gifts,
              ProductStatuss: statuss,
              Visitwiths: visitwith,
            };
 if (saveInProgress.current) {
      return;
    }

    saveInProgress.current = true;
    setIsSaving(true);
try{
            //console.log(data_api);
            let result = await fetch(BASE_URL + 'Manager/DCR/Web/Save', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data_api),
            });

            result = await result.json();
            //console.log(result);
            if (result.result === '') {
              showLocalNotification(
                `Hi ${username}`,
                `Successfully Submit the Other Dcr \nDate & Time: ${
                  date || 'N/A'
                }.`,
              );
              const token = await getAccessToken(); // get Bearer token
              const messageTitle = 'New Others DCR Submitted by ' + username;
              const messageBody = `Employee ${username} Successfully Submit the Other Dcr \nDate & Time: ${
                date || 'N/A'
              }.`;
              await sendNotificationToManager(
                useManagerToken,
                messageTitle,
                messageBody,
                token,
              );
              Alert.alert(
                'Success',
                'Record Successfully Saved',
                [
                  {
                    text: 'Ok',
                    //onPress: () => navigation.navigate('Report DashBoard'),
                    onPress: () => navigation.navigate('AppNavDCRScreen'),
                  },
                ],
                {cancelable: false},
              );
            } else {
              Alert.alert(`${result.result}`);
              navigation.navigate('AppNavDCRScreen');
            }
          } catch (error) {
            console.error('Error during save operation:', error);
            Alert.alert('Error', 'An error occurred while saving the record. Please try again.');
          }
          finally {
            saveInProgress.current = false;
            setIsSaving(false);
          }
          } else {
            const data_api = {
              IDDCR: 0,
              IDDay: IDday,
              DCRDate: cdate,
              DCRType: 'OTHERS',
              EntryType: 'ONLINE_' + deviceType,
              UserLat: currentLatitude,
              UserLong: currentLongitude,
              Remarks: useRemarks,
              User: empEmail,
              IDEmployee: useIDEmployee,
              IDWorktype: wtdataValue,
              IDDoctor: 0,
              Businessid: useBusinessID,
              UNListed: false,
            };

            //console.log(data_api);
             if (saveInProgress.current) {
      return;
    }

    saveInProgress.current = true;
    setIsSaving(true);
try{
            let result = await fetch(BASE_URL + 'DCR/Mobile/Save', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data_api),
            });

            result = await result.json();
            //console.log(result);
            if (result.result === '') {
              showLocalNotification(
                `Hi ${username}`,
                `Successfully Submit the Other Dcr \nDate & Time: ${
                  date || 'N/A'
                }.`,
              );
              const token = await getAccessToken(); // get Bearer token
              const messageTitle = 'New Others DCR Submitted by ' + username;
              const messageBody = `Employee ${username} Successfully Submit the Other Dcr \nDate & Time: ${
                date || 'N/A'
              }.`;
              await sendNotificationToManager(
                useManagerToken,
                messageTitle,
                messageBody,
                token,
              );
              Alert.alert(
                'Success',
                'Record Successfully Saved',
                [
                  {
                    text: 'Ok',
                    //onPress: () => navigation.navigate('Report DashBoard'),
                    onPress: () => navigation.navigate('AppNavDCRScreen'),
                  },
                ],
                {cancelable: false},
              );
            } else {
              Alert.alert(`${result.result}`);
              navigation.navigate('AppNavDCRScreen');
            }
          } catch (error) {
            console.error('Error during save operation:', error);
            Alert.alert('Error', 'An error occurred while saving the record. Please try again.');
          }
          finally {
            saveInProgress.current = false;
            setIsSaving(false);
          }
          }
        } else {
          const data_api = {
            dcrDate: cdate,
            businessID: useBusinessID,
            dcrType: 'OTHERS',
            //deviceType: DeviceInfo.getModel(),
            deviceType: 'OFFLINE_' + deviceType,
            dcrDateTime: date,
            UNListed: false,
            // startLat: 0,
            // startLong: 0,
            // endLat: currentLatitude,
            // endLong: currentLongitude,
            userLat: currentLatitude,
            userLong: currentLongitude,
            idCustomer: 0,
            idDoctor: 0,
            idEmployee: useIDEmployee,
            idWorktype: wtdataValue,
            giftsProducts: GfStatus,
            giftsQty: GProdID,
            productsCurrentStatus: curstageID,
            productsFinalStatus: fStatus,
            products: ProdID,
            samplesProduct: SfStatus,
            samplesProductQty: SProdID,
            visitWiths: Mvisitwith,
            entryUser: empEmail,
            Remarks: useRemarks,
          };
 if (saveInProgress.current) {
      return;
    }

    saveInProgress.current = true;
    setIsSaving(true);
try{
          db.transaction(tx => {
            tx.executeSql(
              'CREATE TABLE IF NOT EXISTS CRM_Others(id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT);',
              [],
              (_, result) => {
                console.log('Table created successfully:', result);
              },
              (_, error) => {
                Alert.alert('Error creating table:', error);
              },
            );
          });

          db.transaction(tx => {
            tx.executeSql(
              'INSERT INTO CRM_Others(data) VALUES (?)',
              [JSON.stringify(data_api)],
              (_, result) => {
                console.log('Data inserted successfully:', result);
                // 🔔 Show local notification
                showLocalNotification(
                  `Hi ${username}`,
                  `Successfully Submit the Other Dcr \nDate & Time: ${
                    date || 'N/A'
                  }.`,
                );
                Alert.alert(
                  'Success',
                  'Record Successfully Saved',
                  [
                    {
                      text: 'Ok',
                      //onPress: () => navigation.navigate('Report DashBoard'),
                      onPress: () => navigation.navigate('AppNavDCRScreen'),
                    },
                  ],
                  {cancelable: false},
                );
                // navigation.navigate('AppNavDCRScreen');
              },
              (_, error) => {
                console.warn('Error inserting data:', error);
              },
            );
          });
        
        } catch (error) {
          console.error('Error during save operation:', error);
          Alert.alert('Error', 'An error occurred while saving the record. Please try again.');
        }
        finally { 
          saveInProgress.current = false;
          setIsSaving(false);
        }
      }
      }, []);
    } else {
      Alert.alert('Contact With Administrator!');
    }
  };

  const getAccessToken = async () => {
    try {
      const response = await fetch(`${BASE_URL}Authentication/Generatetoken`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Token request failed:', response.status);
        return null;
      }

      const data = await response.json();

      if (data && data.Token) {
        console.log('Access Token:', data.Token);

        // Optionally store in AsyncStorage or state
        // await AsyncStorage.setItem('AccessToken', data.Token);
        setAccessToken(data.Token);

        return data.Token;
      } else {
        console.warn('No token returned from API');
        return null;
      }
    } catch (error) {
      console.error('Error fetching access token:', error);
      return null;
    }
  };

  const sendNotificationToManager = async (
    managerToken,
    title,
    body,
    accessToken,
  ) => {
    if (!managerToken || managerToken.trim() === '') {
      console.warn(
        '⚠️ No manager FCM token available — skipping notification.',
      );
      return;
    }
    try {
      const url =
        'https://fcm.googleapis.com/v1/projects/iecrmnotificationapp-5ed0c/messages:send';

      const message = {
        message: {
          token: managerToken,
          notification: {title, body},
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(message),
      });

      if (response.ok) {
        console.log('✅ Notification sent successfully');
        return;
      }

      // Parse FCM error response
      let err;
      try {
        err = await response.json();
      } catch {
        console.warn('⚠️ FCM error not JSON');
        return;
      }

      console.warn('❌ Notification failed:', JSON.stringify(err, null, 2));

      const isUnregistered = err?.error?.details?.some(
        d => d.errorCode === 'UNREGISTERED',
      );

      if (isUnregistered) {
        console.log('⚠️ Manager token invalid — attempting refresh.');
        await regenerateManagerTokenLocal(managerToken);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const regenerateManagerTokenLocal = async oldToken => {
    try {
      const loginBody = {
        businessid: useBusinessID,
        email: empEmail,
        password: empPassword,
      };

      const response = await fetch(`${BASE_URL}/login/validlogin`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(loginBody),
      });

      const data = await response.json();

      if (data?.Success && data?.Token) {
        const newToken = data.Token.trim();
        const oldTrimmed = oldToken?.trim();

        if (newToken === oldTrimmed) {
          console.log('ℹ️ New FCM token same as previous — skipping update.');
        } else {
          console.log('✅ New FCM token detected:', newToken);
          // Update locally only
          useManagerToken = newToken; // or setManagerToken(newToken);
        }
      } else {
        console.warn('⚠️ Failed to regenerate FCM token.');
      }
    } catch (error) {
      console.error('Error regenerating FCM token:', error);
    }
  };

  const getOneTimeLocation = () => {
    setLocationStatus('Getting Location ...');
    Geolocation.getCurrentPosition(
      //Will give you the current location
      position => {
        setLocationStatus('You are Here');
        //const currentLongitude = JSON.stringify(position.coords.longitude);
        //getting the Longitude from the location json
        //const currentLatitude = JSON.stringify(position.coords.latitude);
        const lat = position.coords.latitude;
        const long = position.coords.longitude;

        // Round to 6 decimal places for consistency
        const currentLatitude = lat.toFixed(6); // "22.507298"
        const currentLongitude = long.toFixed(6); // "88.336675"
        //getting the Latitude from the location json
        setCurrentLongitude(currentLongitude);
        //Setting state Longitude to re re-render the Longitude Text
        setCurrentLatitude(currentLatitude);
        //Setting state Latitude to re re-render the Longitude Text
        //console.log('checkEnabled', currentLatitude + ' ' + currentLongitude);
      },
      error => {
        setLocationStatus(error.message);
      },
      //{enableHighAccuracy: false, timeout: 30000, maximumAge: 1000},
      // {enableHighAccuracy: true, timeout: 15000, maximumAge: 1000},
      {timeout: 15000}, // 15 seconds timeout
    );
  };

  const handleCheckPressed = async () => {
    if (Platform.OS === 'android') {
      var checkEnabled = await isLocationEnabled();
      //console.log('checkEnabled', checkEnabled);
      if (checkEnabled === false) {
        Alert.alert('GPS Not Active');
        BackHandler.exitApp();
        navigation.navigate('AppNavScreen');
      } else if (checkEnabled === true) {
        //xAlert.alert('GPS Active');
        //getOneTimeLocation();
        getMultipleTimeLocation();
      }
    }
  };
  const handleEnabledPressed = async () => {
    if (Platform.OS === 'android') {
      try {
        var enableResult = await promptForEnableLocationIfNeeded();
        //console.log('enableResult', enableResult);
      } catch (error) {
        if (error instanceof Error) {
          Alert.alert(error.message);
        }
      }
    }
  };

  const getMultipleTimeLocation = () => {
    setLocationStatus('Getting Location ...');
    Geolocation.getCurrentPosition(
      //Will give you the current location
      position => {
        setLocationStatus('You are Here');
        //const currentLongitude = JSON.stringify(position.coords.longitude);
        //getting the Longitude from the location json
        //const currentLatitude = JSON.stringify(position.coords.latitude);
        const lat = position.coords.latitude;
        const long = position.coords.longitude;

        // Round to 6 decimal places for consistency
        const currentLatitude = lat.toFixed(6); // "22.507298"
        const currentLongitude = long.toFixed(6); // "88.336675"
        //getting the Latitude from the location json
        setCurrentLongitude(currentLongitude);
        //Setting state Longitude to re re-render the Longitude Text
        setCurrentLatitude(currentLatitude);
        //Setting state Latitude to re re-render the Longitude Text
        //console.log('checkEnabled', currentLatitude + ' ' + currentLongitude);
      },
      error => {
        setLocationStatus(error.message);
      },
      //{enableHighAccuracy: false, timeout: 30000, maximumAge: 1000},
      {enableHighAccuracy: false, timeout: 10000, maximumAge: 1000},
      //{ timeout: 15000 } // 15 seconds timeout
    );
  };

  const fetchOfflineTableData = () => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM CRM_getConfigurationDetail LIMIT 1`,
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            const value = results.rows.item(0).BackdatedReason;

            console.log('SQLite Value:', value);

            // 1 = show
            // 0 = hide

            if (value === 1) {
              setAllowBackdatedEntry(true);
            } else {
              setAllowBackdatedEntry(false);
            }
          }
        },
      );
    });

    //Retrieve data from CRM_WorkTypeList
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CRM_WorkTypeList',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              temp.push({
                value: results.rows.item(i).IDMisc,
                label: results.rows.item(i).Name,
              });
            }
            temp.shift();
            setWTData(temp);
            console.log('Data is inserted:', temp);
          } else {
            console.log('No data found');
            //setWTData('No data found');
          }
        },
        (tx, error) => {
          console.error('Error checking data', error);
          console.log('Error checking data', error);
        },
      );
    });
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = daten => {
    const formattedDate = moment(daten).format('D/MMM/YYYY').toUpperCase();
    setcurDate(formattedDate);
    hideDatePicker();
  };

  return (
    <>
      <StatusBar backgroundColor="#a9ddfaff" barStyle="light-content" />
      <ScrollView
        style={{flex: 1, backgroundColor: false}}
        showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={require('../images/bg2.png')}
          style={{height: Dimensions.get('window').height}}>
          <View
            style={{
              backgroundColor: '#ffffff',
              justifyContent: 'space-between',
              flexDirection: 'row',
              alignItems: 'center',
              padding: 12,
              margin: 12,
              borderRadius: 14,
              // 🟢 3D EFFECT BELOW
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 4},
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 8,
              borderWidth: 0.5,
              borderColor: '#e0e0e0',
              //transform: [{ perspective: 800 }, { rotateX: '3deg' }, { rotateY: '-2deg' }],
              transform:
                Platform.OS === 'android'
                  ? [{perspective: 800}, {rotateX: '3deg'}, {rotateY: '-2deg'}]
                  : [], // ❗ No 3D transform on iOS
            }}>
            <View
              style={{flexDirection: 'row', alignItems: 'center', padding: 5}}>
              <Ionicons
                name="location-outline"
                size={32}
                color="#005696"
                style={{marginRight: 8}}
              />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 5,
                }}>
                <Text
                  style={{
                    paddingVertical: 3,
                    fontFamily: 'Lato-Bold',
                    fontSize: 13,
                    color: '#333',
                    marginRight: 10,
                  }}
                  numberOfLines={1}>
                  Latitude: {currentLatitude}
                </Text>
                <Text
                  style={{
                    paddingVertical: 3,
                    fontFamily: 'Lato-Bold',
                    fontSize: 13,
                    color: '#333',
                  }}
                  numberOfLines={1}>
                  Longitude: {currentLongitude}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={{
              backgroundColor: '#ffffff',
              padding: 5,
              margin: 8,
              borderRadius: 14,
              // 🟢 3D EFFECT BELOW
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 4},
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 8,
              borderWidth: 0.5,
              borderColor: '#e0e0e0',
              // transform: [
              //   {perspective: 800},
              //   {rotateX: '3deg'},
              //   {rotateY: '-2deg'},
              // ],
              transform:
                Platform.OS === 'android'
                  ? [{perspective: 800}, {rotateX: '3deg'}, {rotateY: '-2deg'}]
                  : [], // ❗ No 3D transform on iOS
            }}>
            <Text
              style={{
                fontSize: 20,
                color: '#333',
                fontFamily: 'Lato-Bold',
                //textAlign: 'center',
                marginBottom: 5,
                padding: 5,
              }}>
              Enter Details
            </Text>
            {allowBackdatedEntry && (
              <View>
                <TouchableOpacity
                  style={{
                    width: '100%',
                    alignSelf: 'center',
                    justifyContent: 'center',
                    marginBottom: 10,
                    marginTop: 5,
                  }}
                  activeOpacity={0.8}
                  onPress={showDatePicker}>
                  <View pointerEvents="none">
                    <TextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholder="DCR Date"
                      placeholderTextColor="#555"
                      value={cdate}
                      editable={false}
                      style={{
                        borderWidth: 1,
                        borderColor: '#000',
                        marginHorizontal: 10,
                        fontSize: 16,
                        height: 50,
                        paddingHorizontal: 12,
                        borderRadius: 5,
                        color: '#000',
                        backgroundColor: '#fff',
                      }}
                    />
                  </View>
                </TouchableOpacity>
                <DateTimePickerModal
                  isVisible={isDatePickerVisible}
                  mode="date"
                  onConfirm={handleDateConfirm}
                  onCancel={hideDatePicker}
                  minimumDate={moment().startOf('month').toDate()}
                  maximumDate={new Date()}
                  presentationStyle="overFullScreen"
                />
              </View>
            )}
            <View
              style={{
                paddingLeft: 5,
                paddingRight: 5,
                marginRight: 5,
                marginLeft: 5,
              }}>
              <TextInput
                label="Division"
                mode="outlined"
                autoCapitalize="none"
                autoCorrect={false}
                value={useDivision}
                editable={false}
              />
              <View style={{marginTop: 2, paddingTop: 2}}>
                <TextInput
                  label="Employee"
                  mode="outlined"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={empName}
                  editable={false}
                />
              </View>
              {/* <View style={{marginTop: 2, paddingTop: 2}}>
            <TextInput
              label="Employee No"
              mode="outlined"
              autoCapitalize="none"
              autoCorrect={false}
              style={{marginTop: 5}}
              value={empNO}
              editable={false}
            />
          </View>
          <View style={{marginTop: 2, paddingTop: 2}}>
            <TextInput
              label="HQ"
              mode="outlined"
              autoCapitalize="none"
              autoCorrect={false}
              style={{marginTop: 5}}
              value={useHQ}
              editable={false}
            />
          </View> */}
              <View style={{marginTop: 2, paddingTop: 2}}>
                <TextInput
                  label="DCR Date"
                  mode="outlined"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{marginBottom: 5}}
                  value={currDate}
                  editable={false}
                />
              </View>
              <KeyboardAvoidingView
                behavior="padding"
                style={{justifyContent: 'space-between'}}>
                <View style={{marginTop: 2, paddingTop: 2}}>
                  <Dropdown
                    style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                    placeholderStyle={style.placeholderStyle}
                    selectedTextStyle={style.selectedTextStyle}
                    inputSearchStyle={style.inputSearchStyle}
                    iconStyle={style.iconStyle}
                    data={useWTData}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={!isFocus ? 'Select Work Type' : '...'}
                    searchPlaceholder="Search Work Type"
                    //value={wtdataLabel}
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={item => {
                      setwtdataValue(item.value);
                      setwtdataLabel(item.label);
                      // handleState(item.value);
                      setIsFocus(false);
                    }}
                  />
                </View>
                <View style={{marginTop: 2, paddingTop: 2}}>
                  <TextInput
                    label="Remarks"
                    mode="outlined"
                    autoCapitalize="none"
                    numberOfLines={4}
                    autoCorrect={false}
                    multiline={true}
                    style={{marginBottom: 5}}
                    value={useRemarks}
                    onChangeText={text => setRemarks(text)}
                  />
                </View>
              </KeyboardAvoidingView>
            </View>
          </View>
          <View style={{margin: 5, padding: 5}}>
            <CustomButton label={'Start DCR'} disabled={isSaving} onPress={() => save()} />
          </View>
        </ImageBackground>
      </ScrollView>
    </>
  );
};

export default OtherScreen;
const style = StyleSheet.create({
  boldText: {
    fontSize: 24,
    color: 'red',
    marginVertical: 10,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    //marginBottom: 10,
    //marginTop: 5,
  },
  dropdownStage: {
    height: 50,
    width: '40%',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    //marginBottom: 10,
    margin: 5,
  },
  cStage: {
    height: 45,
    width: '35%',
    borderColor: 'gray',
    // borderWidth: 0.5,
    borderRadius: 8,
    //paddingHorizontal: 5,
    backgroundColor: '#fff',
    marginBottom: 5,
    // margin: 5,
  },
  menu: {
    marginBottom: 10,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 5,
    padding: 5,
    //width: 140,
    //height: 135,
    elevation: 5,
    borderRadius: 5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  container: {
    marginTop: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  btnTab: {
    width: Dimensions.get('window').width / 1.5,
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: '#EBEBEB',
    padding: 10,
    //justifyContent: 'center',
    backgroundColor: '#E6838D',
    marginTop: 5,
    marginBottom: 5,
  },
  btnTabE: {
    width: Dimensions.get('window').width / 1.5,
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: '#EBEBEB',
    padding: 10,
    //justifyContent: 'center',
    backgroundColor: '#E6838D',
    marginTop: 10,
    marginBottom: 5,
  },
  textTab: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Lato-Bold',
  },
  menuItem: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#000',
    margin: 5,
    padding: 5,
    textAlignVertical: 'center',
    textAlign: 'center',
    alignItems: 'center', // Centered horizontally
  },
  menuItemPS: {
    fontSize: 16,
    fontFamily: 'Lato-Regular',
    color: '#000',
    margin: 2,
    marginBottom: 4,
    //padding: 5,
    textAlignVertical: 'center',
    textAlign: 'center',
    alignItems: 'center', // Centered horizontally
  },
});
