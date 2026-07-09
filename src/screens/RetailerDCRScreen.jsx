import {
  View,
  Text,
  SafeAreaView,
  ImageBackground,
  Dimensions,
  TouchableWithoutFeedback,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  PermissionsAndroid,
  Platform,
  LogBox,
  BackHandler,
  TextInput,
  StatusBar,
  Modal,
  Button,
} from 'react-native';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import React, {useEffect, useState, useCallback, useRef} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {openSettings} from 'react-native-permissions';
//import {TextInput} from 'react-native-paper';
import {MultipleSelectList} from 'react-native-dropdown-select-list';
import {SelectList} from 'react-native-dropdown-select-list';
import {format, set} from 'date-fns';
import {Dropdown} from 'react-native-element-dropdown';
import axios from 'axios';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import CustomButton from '../components/custom/CustomButton';
import {FlatList} from 'react-native';
import {ca, id, te, tr} from 'date-fns/locale';
//import all the components we are going to use.
import Geolocation from '@react-native-community/geolocation';
import MapView, {PROVIDER_GOOGLE, Marker, Circle} from 'react-native-maps';
import DeviceInfo from 'react-native-device-info';
import {BASE_URL} from '@env';
import NetInfo from '@react-native-community/netinfo';
import {openDatabase} from 'react-native-sqlite-storage';
import moment from 'moment';
import Octicons from 'react-native-vector-icons/Octicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ProgressDialog from '../components/custom/ProgressDialog';
import CustomRetailer from '../components/custom/CustomRetailer';
import {useFocusEffect} from '@react-navigation/native';
import KeyboardAwareLayout from '../components/custom/KeyboardAwareLayout';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
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

const RetailerDCRScreen = ({navigation}) => {
  const [showData, setshowData] = useState(true);
  const [shouldShowDocVisitWithData, setshouldShowDocVisitWithData] =
    useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [distance, setDistance] = useState(null);
  const [docName, setDocName] = useState('');
  const [docCode, setDocCode] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [useBusinessID, setBusinessID] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [useIDEmployee, setIDEmployee] = useState('');
  const [useMultipleIDEmployee, setMultipleIDEmployee] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [usedoctorData, setdoctorData] = useState([]);
  const [docLabel, setdocLabel] = useState('');
  const [docValue, setdocValue] = useState('');
  const [usevisitWTData, setvisitWTData] = useState([]);
  const [usevisitWTDataSelected, setvisitWTDataSelected] = useState('');
  const [useManagerAccess, setuseManagerAccess] = useState('');
  const [doctorLocation, setDoctorLocation] = useState(null);
  const lastInsideRef = useRef(null); // remembers last in/out state to stop flapping
  //const [usevisitWTDataTest, setvisitWTDataTest] = useState([]);
  const [gamesTab, setGamesTab] = useState(1);
  const [useArea, setArea] = useState([]);
  const [useAreaLabel, setAreaLabel] = useState('');
  const [useAreaValue, setAreaValue] = useState('');
  const [useMArea, setMArea] = useState([]);
  const [useMAreaLabel, setMAreaLabel] = useState('');
  const [useMAreaValue, setMAreaValue] = useState('');
  const [useMvisitWTData, setMvisitWTData] = useState([]);
  const [useMvisitWTDataSelected, setMvisitWTDataSelected] = useState('');
  const [useMobileAccess, setuseMobileAccess] = useState('');
  const [currentLongitude, setCurrentLongitude] = useState('0.00');
  const [currentLatitude, setCurrentLatitude] = useState('0.00');
  const [locationStatus, setLocationStatus] = useState('');
  const [deviceType, setDevice] = useState('');
  const [useRemarks, setRemarks] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [sampleData, setsampleData] = useState([]);
  const [sampleQtyData, setsampleQtyData] = useState([]);
  const [giftQtyData, setgiftQtyDataData] = useState([]);
  const [giftData, setgiftData] = useState([]);
  const [useQty, setQty] = useState('');
  const [useGQty, setGQty] = useState('');
  const [sLabel, setSLabel] = useState('');
  const [sValue, setSValue] = useState('');
  const [gLabel, setGLabel] = useState('');
  const [gValue, setGValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [useGeofencing, setGeofencing] = useState('');
  const [useDoctorGeofencing, setDoctorGeofencing] = useState('');
  //var cdate = moment().format('D/MMM/YYYY');
  const retryPermissionInterval = useRef(null);
  const failureCount = useRef(0);
  const watchIdRef = useRef(null);
  const lastKnownLocationRef = useRef(null);
  const [allowBackdatedEntry, setAllowBackdatedEntry] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [cdate, setcurrDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const saveInProgress = useRef(false);

  // useEffect(() => {
  //   //Disabling VirtualizedLists warning error start
  //   LogBox.ignoreLogs([
  //     'VirtualizedLists should never be nested',
  //     'Each child in a list should have a unique "key" prop.',
  //   ]);
  //   //Disabling VirtualizedLists warning error end

  //   // setLoading(true);
  //   // setTimeout(() => {
  //   //   setLoading(false);
  //   // }, 5000);

  //   getOneTimeLocation();
  //   handleEnabledPressed();
  //   handleCheckPressed();
  //   //fetchOfflineTableData();
  //   getData();

  //   setshowData(false);
  //   setshouldShowDocVisitWithData(true);

  //   DeviceInfo.getDeviceName().then(deviceName => {
  //     setDevice(deviceName);
  //   });

  //   setInterval(() => {
  //     //setcurrTime(new Date().toLocaleTimeString());
  //     //setcurrTime(new Date().getHours()+':'+new Date().getMinutes()+':'+new Date().getSeconds());
  //   }, 1000);

  //   const interval = setInterval(() => {
  //     handleCheckPressed();
  //   }, 10000);
  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    LogBox.ignoreLogs([
      'VirtualizedLists should never be nested',
      'Each child in a list should have a unique "key" prop.',
    ]);
    var currDate = moment().format('D/MMM/YYYY');
    setcurrDate(currDate);
    getData();
    setshowData(false);
    setshouldShowDocVisitWithData(true);

    DeviceInfo.getDeviceName().then(name => setDevice(name));

    if (Platform.OS === 'android') {
      startLocationFlow();
    } else {
      // iOS: trigger popup automatically the first time
      getCurrentLocation();
      startLocationWatch();
    }

    //lastInsideRef.current = null;

    return () => {
      if (retryPermissionInterval.current) {
        clearInterval(retryPermissionInterval.current);
        retryPermissionInterval.current = null;
      }
      return () => {
        if (retryPermissionInterval.current) {
          clearInterval(retryPermissionInterval.current);
          retryPermissionInterval.current = null;
        }

        stopLocationUpdates(); // 🔥 stop watchPosition
      };
    };
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

  const getData = () => {
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          setIDEmployee(user.IDEmployee);
          setEmpEmail(user.Empemail);
          setBusinessID(user.BusinessID);
          setuseManagerAccess(user.ManagerAccess);
          //console.warn(user.ManagerAccess);
          setuseMobileAccess(user.MobileAccess);

          NetInfo.fetch().then(async state => {
            if (state.isConnected) {
              if (user.ManagerAccess === true) {
                // const empurl =
                //   BASE_URL +
                //   'Employee/DivisionWiseEmployeeList?Businessid=' +
                //   user.BusinessID +
                //   '&IDDivision=' +
                //   user.IDDivision +
                //   '&IDEmployeeDesignation=0';
                //console.log(empurl);
                // const empurl =
                //   BASE_URL +
                //   'Employee/Hierarchy/All?Businessid=' +
                //   user.BusinessID +
                //   '&IDEmployee=' +
                //   user.IDEmployee;
                // var config = {
                //   method: 'get',
                //   url: empurl,
                // };
                // axios(config)
                //   .then(function (response) {
                //     //CREATE TABLE for MangerVisitWithTBL
                //     var count = Object.keys(response.data).length;
                //     let wtNameArray = [];
                //     for (var i = 0; i < count; i++) {
                //       wtNameArray.push({
                //         //value: response.data[i].Value,
                //         value: response.data[i].EmployeeName,
                //         key: response.data[i].IDEmployee,
                //       });
                //     }
                //     setMvisitWTDataSelected(wtNameArray);
                //   })
                const empurl =
                  BASE_URL +
                  'Employee/ManagerVisitwithList?Businessid=' +
                  user.BusinessID +
                  '&IDEmployee=' +
                  user.IDEmployee;
                console.log(empurl);
                var config = {
                  method: 'get',
                  url: empurl,
                };
                axios(config)
                  .then(function (response) {
                    //CREATE TABLE for MangerVisitWithTBL
                    var count = Object.keys(response.data).length;
                    let wtNameArray = [];
                    for (var i = 0; i < count; i++) {
                      wtNameArray.push({
                        value: response.data[i].Name,
                        key: response.data[i].IDEmployee,
                      });
                    }
                    setMvisitWTDataSelected(wtNameArray);
                  })
                  .catch(function (error) {
                    Alert.alert(error);
                  });
              } else {
                // const returl =
                //   BASE_URL +
                //   'Retailer/OfflineRetailerList?Businessid=' +
                //   user.BusinessID +
                //   '&IDEmployee=' +
                //   user.IDEmployee;
                // console.log('returl ' + returl);
                // var config = {
                //   method: 'get',
                //   url: returl,
                // };
                // axios(config)
                //   .then(function (response) {
                //     var count = Object.keys(response.data.data).length;
                //     let wtNameArray = [];
                //     for (var i = 0; i < count; i++) {
                //       wtNameArray.push({
                //         //value: response.data[i].Value,
                //         value: response.data.data[i].IDRetailer,
                //         label:
                //           response.data.data[i].Name +
                //           ' ' +
                //           response.data.data[i].Code,
                //       });
                //     }
                //     setdoctorData(wtNameArray);
                //   })
                //   .catch(function (error) {
                //     console.log(error);
                //   });

                const areaurl =
                  BASE_URL +
                  'Area/EmployeeWiseAreaList?Businessid=' +
                  user.BusinessID +
                  '&IDEmployee=' +
                  user.IDEmployee;
                //console.log('returl ' + areaurl);
                var config = {
                  method: 'get',
                  url: areaurl,
                };
                axios(config)
                  .then(function (response) {
                    var count = Object.keys(response.data).length;
                    let wtNameArray = [];
                    for (var i = 0; i < count; i++) {
                      wtNameArray.push({
                        //value: response.data[i].Value,
                        value: response.data[i].IDArea,
                        label: response.data[i].Name,
                      });
                    }
                    //console.log(wtNameArray);

                    setArea(wtNameArray);
                  })
                  .catch(function (error) {
                    Alert.alert(error);
                  });

                // const vwturl =
                //   BASE_URL +
                //   'Employee/EmployeeUpwardManagerList?Businessid=' +
                //   user.BusinessID +
                //   '&IDEmployee=' +
                //   user.IDEmployee;
                const vwturl =
                  BASE_URL +
                  'Employee/MSRVisitwithList?Businessid=' +
                  user.BusinessID +
                  '&IDEmployee=' +
                  user.IDEmployee;
                //console.log(vwturl);
                var config = {
                  method: 'get',
                  url: vwturl,
                };
                axios(config)
                  .then(function (response) {
                    var count = Object.keys(response.data).length;
                    let wtNameArray = [];
                    for (var i = 0; i < count; i++) {
                      wtNameArray.push({
                        //value: response.data[i].Value,
                        value: response.data[i].Name,
                        key: response.data[i].IDEmployee,
                      });
                    }
                    setvisitWTDataSelected(wtNameArray);
                  })
                  .catch(function (error) {
                    Alert.alert(error);
                  });
              }

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
              const prdurl =
                BASE_URL +
                'Product/ProductDivisionSampleGiftList?Businessid=' +
                user.BusinessID +
                '&IDDivision=' +
                user.IDDivision +
                '&Type=GIFT';
              //console.log(prdurl);
              var config = {
                method: 'get',
                url: prdurl,
              };

              axios(config)
                .then(function (response) {
                  var count = Object.keys(response.data).length;
                  let wtNameArray = [];
                  for (var i = 0; i < count; i++) {
                    wtNameArray.push({
                      //value: response.data[i].Value,
                      value: response.data[i].IDProduct,
                      label: response.data[i].Name,
                    });
                  }
                  setgiftData(wtNameArray);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });

              const sampleurl =
                BASE_URL +
                'Product/ProductDivisionSampleGiftList?Businessid=' +
                user.BusinessID +
                '&IDDivision=' +
                user.IDDivision +
                '&Type=DOCTORPRODUCT';
              //console.log(sampleurl);
              var config = {
                method: 'get',
                url: sampleurl,
              };

              axios(config)
                .then(function (response) {
                  var count = Object.keys(response.data).length;
                  let wtNameArray = [];
                  for (var i = 0; i < count; i++) {
                    wtNameArray.push({
                      //value: response.data[i].Value,
                      value: response.data[i].IDProduct,
                      label: response.data[i].Name,
                    });
                  }
                  setsampleData(wtNameArray);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });
              const url =
                BASE_URL +
                'Configuration/MobileGeofencing?Businessid=' +
                user.BusinessID +
                '&IDEmployee=' +
                user.IDEmployee;
              console.log('Geofencing URL:', url);
              try {
                const response = await axios.get(url);
                console.log('API Response:', response.data[0].Geofencing);
                setGeofencing(response.data[0].Geofencing);
                setDoctorGeofencing(response.data[0].DoctorGeoFencing);
              } catch (error) {
                console.error('Error fetching geofencing data:', error);
              }
            } else {
              fetchOfflineTableData(user.ManagerAccess);
            }
          }, []);
        }
      });
    } catch (error) {
      Alert.alert(error);
    }
  };

  const fetchOfflineTableData = ManagerAccess => {
    if (ManagerAccess === true) {
      //console.warn('manager', useManagerAccess);
      //Retrieve data from MangerVisitWithTBL
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM MangerVisitWithTBL',
          [],
          (tx, results) => {
            if (results.rows.length > 0) {
              var temp = [];
              for (let i = 0; i < results.rows.length; ++i)
                temp.push({
                  value: results.rows.item(i).EmployeeName,
                  key: results.rows.item(i).IDEmployee,
                });
              setMvisitWTDataSelected(temp);
              console.log('Manger Data is inserted:', temp);
            } else {
              console.log('No data found');
              //setSelectedMAreaData('No data found');
            }
          },
          (tx, error) => {
            console.error('MangerVisitWithTBL Error checking data', error);
          },
        );
      });

      //Retrieve data from CRM_productList
      // db.transaction(tx => {
      //   tx.executeSql(
      //     'SELECT * FROM CRM_productList',
      //     [],
      //     (tx, results) => {
      //       if (results.rows.length > 0) {
      //         var temp = [];
      //         for (let i = 0; i < results.rows.length; ++i)
      //           temp.push(results.rows.item(i));
      //         setdataSample(temp);
      //         //console.log('Data is inserted:', temp);
      //       } else {
      //         console.log('No data found');
      //         //setSelectedMAreaData('No data found');
      //       }
      //     },
      //     (tx, error) => {
      //       console.error('MangerCRM_productList Error checking data', error);
      //     },
      //   );
      // });
    } else {
      //console.warn('MSR', useManagerAccess);
      //Retrieve data from CRM_EmployeeWiseAreaList
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM CRM_EmployeeWiseAreaList',
          [],
          (tx, results) => {
            if (results.rows.length > 0) {
              var temp = [];
              for (let i = 0; i < results.rows.length; ++i)
                temp.push({
                  value: results.rows.item(i).IDArea,
                  label: results.rows.item(i).Name,
                  // value: results.rows.item(i).Name,
                  // key: results.rows.item(i).IDEmployee,
                });
              setArea(temp);
              //console.log('User Data is inserted:', temp);
            } else {
              console.log('No data found');
            }
          },
          (tx, error) => {
            console.error('Error checking data', error);
          },
        );
      });
      // //Retrieve data from CRM_RetList
      // db.transaction(tx => {
      //   tx.executeSql(
      //     'SELECT * FROM CRM_RetList',
      //     [],
      //     (tx, results) => {
      //       if (results.rows.length > 0) {
      //         var temp = [];
      //         for (let i = 0; i < results.rows.length; ++i) {
      //           temp.push({
      //             value: results.rows.item(i).IDRetailer,
      //             label:
      //               results.rows.item(i).Name +
      //               '  ' +
      //               results.rows.item(i).Code,
      //           });
      //         }
      //         setdoctorData(temp);
      //         //console.log('Data is inserted:', temp);
      //       } else {
      //         console.log('No data found');
      //         //setWTData('No data found');
      //       }
      //     },
      //     (tx, error) => {
      //       console.error('Error checking data', error);
      //     },
      //   );
      // });

      //Retrieve data from CRM_VisitWithList
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM CRM_VisitWithList',
          [],
          (tx, results) => {
            if (results.rows.length > 0) {
              var temp = [];
              for (let i = 0; i < results.rows.length; ++i)
                temp.push({
                  value: results.rows.item(i).Name,
                  key: results.rows.item(i).IDEmployee,
                });
              setvisitWTDataSelected(temp);
              //console.log('Data is inserted:', temp);
            } else {
              console.log('No data found');
            }
          },
          (tx, error) => {
            console.error('Error checking data', error);
          },
        );
      });
    }

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
    //Retrieve data from CRM_productList
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CRM_GIFT',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              //temp.push(results.rows.item(i));
              temp.push({
                value: results.rows.item(i).IDProduct,
                label: results.rows.item(i).Name,
              });
            }
            setgiftData(temp);
            console.log('Data is inserted:', temp);
          } else {
            console.log('No data found');
            //setSelectedMAreaData('No data found');
          }
        },
        (tx, error) => {
          console.error('Error checking data', error);
        },
      );
    });
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CRM_SAMPLE',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              //temp.push(results.rows.item(i));
              temp.push({
                value: results.rows.item(i).IDProduct,
                label: results.rows.item(i).Name,
              });
            }
            setsampleData(temp);
            console.log('Data is inserted CRM_SAMPLE:', temp);
          } else {
            console.log('No data found');
            //setSelectedMAreaData('No data found');
          }
        },
        (tx, error) => {
          console.error('Error checking data', error);
        },
      );
    });
    db.transaction(tx => {
      //tx.executeSql('SELECT Geofencing FROM Geofencing', [], (tx, results) => {
      tx.executeSql('SELECT * FROM Geofencing', [], (tx, results) => {
        if (results.rows.length > 0) {
          const geo = results.rows.item(0).Geofencing;
          const doc_geo = results.rows.item(0).DoctorGeoFencing;
          console.log('geo ', geo);
          console.log('doc_geo ', doc_geo);

          setGeofencing(geo);
          setDoctorGeofencing(doc_geo);
        }
      });
    });
  };
  const save = async () => {
    if (useManagerAccess === true) {
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
      } else if (useMvisitWTData.length === 0) {
        Alert.alert('Select Visit With');
      } else if (docLabel === '') {
        Alert.alert('Select Retailer');
      } else if (useRemarks === '') {
        Alert.alert('Type Remarks');
      } else {
        saveEndDCR();
      }
    } else {
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
      } else if (docLabel === '') {
        Alert.alert('Select Retailer');
      } else if (usevisitWTData.length === 0) {
        Alert.alert('Select Visit With');
      } else {
        saveEndDCR();
      }
    }
  };

  const startLocationFlow = async () => {
    try {
      const gpsEnabled = await isLocationEnabled();
      if (!gpsEnabled) {
        await promptForEnableLocationIfNeeded();
      }
    } catch {}

    setTimeout(() => {
      getCurrentLocation(); // first fast fix
      startLocationWatch(); // continuous tracking
    }, 1000);
  };

  // ========= GET CURRENT LOCATION =========
  const getCurrentLocation = () => {
    setLocationStatus('Getting Location...');

    // Try network FIRST → fast indoors
    Geolocation.getCurrentPosition(
      position => {
        updateLocation(position, false);
      },
      error => {
        console.log('Network Location failed => switching to GPS:', error);

        // Fallback to GPS satellite → works offline
        Geolocation.getCurrentPosition(
          gpsPos => {
            updateLocation(gpsPos, true);
          },
          gpsErr => {
            console.log('GPS also failed:', gpsErr);
            setLocationStatus(gpsErr.message);
            showSettingsPopup();
          },
          {
            enableHighAccuracy: true, // ← Satellite GPS
            timeout: 25000,
            maximumAge: 5000,
            distanceFilter: 10,
          },
        );
      },
      {
        enableHighAccuracy: false, // fast first
        timeout: 10000,
        maximumAge: 15000,
        distanceFilter: 10,
      },
    );
  };

  const updateLocation = (pos, isGPS) => {
    const lat = pos.coords.latitude.toFixed(6);
    const lng = pos.coords.longitude.toFixed(6);
    console.log(`Location obtained: ${lat}, ${lng} (GPS: ${isGPS})`);
    //Alert.alert('Location Obtained', `Lat: ${lat}, Lon: ${lng} GPS: ${isGPS}`);
    setCurrentLatitude(lat);
    setCurrentLongitude(lng);

    setLocationStatus(
      isGPS ? 'GPS (Offline Ready)' : 'Network Location (Fast)',
    );
  };

  // ========= CHECK GPS ENABLED (ANDROID) =========
  const handleGPSCheck = async () => {
    if (Platform.OS === 'android') {
      try {
        const gpsEnabled = await isLocationEnabled();
        if (!gpsEnabled) {
          promptForEnableLocationIfNeeded();
        }
      } catch {}
    }
  };

  // ========= REQUEST PERMISSION =========

  const requestLocationPermission = async () => {
    if (Platform.OS !== 'android') return;

    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Required',
          message: 'Enable location to continue using the app',
          buttonPositive: 'OK',
        },
      );

      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        handleGPSCheck();
        getCurrentLocation();
      } else if (result === PermissionsAndroid.RESULTS.DENIED) {
        // Can still ask gain
        console.log('Permission Denied: Retrying...');
        showRetryAlert(); // Show a clear dialog instead of silent retry
      } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        console.log('Permission set to NEVER ASK AGAIN');
        stopLocationUpdates(); // Important!
        showSettingsPopup(); // Must redirect to settings
      }
    } catch (err) {
      console.log('Permission Error:', err);
    }
  };

  // ========= SHOW SETTINGS POPUP =========
  const showSettingsPopup = () => {
    Alert.alert(
      'Location Required',
      'Please enable location permission from Settings to continue',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => {
            openSettings();
          },
        },
      ],
    );
  };

  const showRetryAlert = () => {
    Alert.alert(
      'Permission Required',
      'Location permission is needed for visit tracking.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Try Again',
          onPress: () => requestLocationPermission(),
        },
      ],
    );
  };

  const startLocationWatch = () => {
    if (watchIdRef.current !== null) return; // prevent duplicate

    setLocationStatus('Tracking location...');

    watchIdRef.current = Geolocation.watchPosition(
      position => {
        updateLocation(position, true);

        // cache last valid location
        lastKnownLocationRef.current = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: Date.now(),
        };
      },
      error => {
        console.log('watchPosition error:', error);

        // 🔁 FALLBACK to last known location
        if (lastKnownLocationRef.current) {
          const cached = lastKnownLocationRef.current;
          console.log('Using cached location');

          updateLocation(
            {
              coords: {
                latitude: cached.latitude,
                longitude: cached.longitude,
              },
            },
            false,
          );

          setLocationStatus('Cached Location');
        } else {
          setLocationStatus(error.message);
          showSettingsPopup();
        }
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // 🔥 movement based (10 meters)
        interval: 15000, // Android fallback
        fastestInterval: 8000,
        maximumAge: 100, // allow cached from OS
      },
    );
  };

  const stopLocationUpdates = () => {
    if (watchIdRef.current !== null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      console.log('Location watch stopped');
    }
  };
  //Hide Gift End

  // const getOneTimeLocation = () => {
  //   setLocationStatus('Getting Location ...');
  //   Geolocation.getCurrentPosition(
  //     //Will give you the current location
  //     position => {
  //       setLocationStatus('You are Here');
  //       // const currentLongitude = JSON.stringify(position.coords.longitude);
  //       // //getting the Longitude from the location json
  //       // const currentLatitude = JSON.stringify(position.coords.latitude);
  //       const lat = position.coords.latitude;
  //       const long = position.coords.longitude;

  //       // Round to 6 decimal places for consistency
  //       const currentLatitude = lat.toFixed(6); // "22.507298"
  //       const currentLongitude = long.toFixed(6); // "88.336675"
  //       //getting the Latitude from the location json
  //       setCurrentLongitude(currentLongitude);
  //       //Setting state Longitude to re re-render the Longitude Text
  //       setCurrentLatitude(currentLatitude);
  //       //Setting state Latitude to re re-render the Longitude Text
  //       //console.log('checkEnabled', currentLatitude + ' ' + currentLongitude);
  //     },
  //     error => {
  //       setLocationStatus(error.message);
  //     },
  //     //{enableHighAccuracy: false, timeout: 30000, maximumAge: 1000},
  //     //{enableHighAccuracy: true, timeout: 15000, maximumAge: 1000},
  //     {timeout: 15000}, // 15 seconds timeout
  //   );
  // };

  // const handleCheckPressed = async () => {
  //   if (Platform.OS === 'android') {
  //     var checkEnabled = await isLocationEnabled();
  //     //console.log('checkEnabled', currentLatitude + ' ' + currentLongitude);
  //     if (checkEnabled === false) {
  //       Alert.alert('GPS Not Active');
  //       BackHandler.exitApp();
  //       navigation.navigate('AppNavScreen');
  //     } else if (checkEnabled === true) {
  //       //xAlert.alert('GPS Active');
  //       //getOneTimeLocation();
  //       getMultipleTimeLocation();
  //     }
  //   }
  // };
  // const handleEnabledPressed = async () => {
  //   if (Platform.OS === 'android') {
  //     try {
  //       var enableResult = await promptForEnableLocationIfNeeded();
  //       //console.log('enableResult', enableResult);
  //     } catch (error) {
  //       if (error instanceof Error) {
  //         Alert.alert(error.message);
  //       }
  //     }
  //   }
  // };

  // const getMultipleTimeLocation = () => {
  //   setLocationStatus('Getting Location ...');
  //   Geolocation.getCurrentPosition(
  //     //Will give you the current location
  //     position => {
  //       setLocationStatus('You are Here');
  //       // const currentLongitude = JSON.stringify(position.coords.longitude);
  //       // //getting the Longitude from the location json
  //       // const currentLatitude = JSON.stringify(position.coords.latitude);
  //       const lat = position.coords.latitude;
  //       const long = position.coords.longitude;

  //       // Round to 6 decimal places for consistency
  //       const currentLatitude = lat.toFixed(6); // "22.507298"
  //       const currentLongitude = long.toFixed(6); // "88.336675"
  //       //getting the Latitude from the location json
  //       setCurrentLongitude(currentLongitude);
  //       //Setting state Longitude to re re-render the Longitude Text
  //       setCurrentLatitude(currentLatitude);
  //       //Setting state Latitude to re re-render the Longitude Text
  //       //console.log('checkEnabled', currentLatitude + ' ' + currentLongitude);
  //     },
  //     error => {
  //       setLocationStatus(error.message);
  //     },
  //     //{enableHighAccuracy: false, timeout: 30000, maximumAge: 1000},
  //     {enableHighAccuracy: false, timeout: 10000, maximumAge: 1000},
  //     //{ timeout: 15000 } // 15 seconds timeout
  //   );
  // };

  const multiSelectVisitWith = async val => {
    setMultipleIDEmployee(val);
    managerAreaList(val);
    // let mvwt = useMvisitWTData;
    // let mvwtList = mvwt.toString();
    // //console.log(mvwt);
    // //retailerDDOpenM(useBusinessID, mvwtList);
    // //retailerDDOpenM(mvwt);
    // setMultipleIDEmployee(mvwtList);
    // managerAreaList(mvwtList);
    //setMAreaEmployee(mvwtList);
  };

  const managerAreaList = empLoyee => {
    console.log('empLoyee', empLoyee);

    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        const areaurl =
          BASE_URL +
          'manager/DCR/MultipleEmployeeWiseAreaList?Businessid=' +
          useBusinessID +
          '&Employees=' +
          empLoyee;
        console.log('managerAreaList ' + areaurl);
        var config = {
          method: 'get',
          url: areaurl,
        };
        axios(config)
          .then(function (response) {
            var count = Object.keys(response.data).length;
            let wtNameArray = [];
            for (var i = 0; i < count; i++) {
              wtNameArray.push({
                //value: response.data[i].Value,
                value: response.data[i].IDArea,
                label: response.data[i].Name,
              });
            }
            setMArea(wtNameArray);
          })
          .catch(function (error) {
            Alert.alert(error);
          });
      } else {
        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM CRM_offlineAreaList where IDEmployee=?',
            [empLoyee],
            (tx, results) => {
              if (results.rows.length > 0) {
                var temp = [];
                for (let i = 0; i < results.rows.length; ++i) {
                  temp.push({
                    value: results.rows.item(i).IDArea,
                    label: results.rows.item(i).Name,
                  });
                }
                setMArea(temp);
                console.log('Data is inserted:', temp);
              } else {
                // var temp = [];
                // setMArea(temp);
                console.log('No data found');
                //setWTData('No data found');
              }
            },
            (tx, error) => {
              console.error('Error checking data', error);
            },
          );
        });
      }
    }, []);
  };

  //const retailerDDOpenM = (businessID, idemp) => {
  // const retailerDDOpenM = idemp => {
  //   // Example array of values for the IN clause
  //   const values = idemp;
  //   // Construct the SQL query dynamically with the values
  //   const sqlQuery = `SELECT * FROM ManagerEmployeeWiseRetailerList WHERE IDEmployee IN (${values
  //     .map(() => '?')
  //     .join(',')})`;

  //   // Execute the query
  //   db.transaction(tx => {
  //     //tx.executeSql(sqlQuery, values, (_, { rows }) => {
  //     tx.executeSql(
  //       sqlQuery,
  //       values,
  //       (_, results) => {
  //         // Process the result rows here
  //         //const results = rows;
  //         console.log('Query results:', results.rows.length);
  //         console.log('Query values:', values);
  //         if (results.rows.length > 0) {
  //           var temp = [];
  //           for (let i = 0; i < results.rows.length; ++i) {
  //             temp.push({
  //               value: results.rows.item(i).IDRetailer,
  //               label:
  //                 results.rows.item(i).Name + '  ' + results.rows.item(i).Code,
  //             });
  //           }
  //           setdoctorData(temp);
  //           console.log(temp);
  //         } else {
  //           console.log('No data found');
  //           //setSelectedMAreaData('No data found');
  //         }
  //       },
  //       (_, error) => {
  //         console.error(
  //           'ManagerEmployeeWiseRetailerList Error executing SQL query:',
  //           error,
  //         );
  //       },
  //     );
  //   });
  // };

  const saveEndDCR = async () => {
    if (useMobileAccess === 'ONLINE') {
      NetInfo.fetch().then(state => {
        if (state.isConnected) {
          try {
            AsyncStorage.getItem('IDday').then(value => {
              if (value != null) {
                let IDday = JSON.parse(value);
                // startRetDCR(
                //   useBusinessID,
                //   useIDEmployee,
                //   IDday,
                //   currentLatitude,
                //   currentLongitude,
                // );
                EndRetDcr(IDday);
              }
            });
          } catch (error) {
            Alert.alert(error);
          }
        } else {
          Alert.alert('You are Offline Contact With Administrator!');
        }
      }, []);
    } else if (useMobileAccess === 'ONLINE & OFFLINE') {
      NetInfo.fetch().then(state => {
        if (state.isConnected) {
          try {
            AsyncStorage.getItem('IDday').then(value => {
              if (value != null) {
                let IDday = JSON.parse(value);
                // startRetDCR(
                //   useBusinessID,
                //   useIDEmployee,
                //   IDday,
                //   currentLatitude,
                //   currentLongitude,
                // );
                EndRetDcr(IDday);
              }
            });
          } catch (error) {
            Alert.alert(error);
          }
        } else {
          var date = moment()
            .utcOffset('+05:30')
            .format('YYYY-MM-DD hh:mm:ss A');
          //console.warn(date);

          if (useManagerAccess === true) {
            let Mvisitwith = [];
            let GProdID = [];
            let GfStatus = [];
            let ProdID = [];
            let curstageID = [];
            let fStatus = [];
            let SProdID = [];
            let SfStatus = [];

            // usevisitWTData.map(function (value) {
            //   //Mvisitwith.push({IDEmployee: value});
            //   Mvisitwith.push(value);
            // });

            //console.log(Mvisitwith);
            if (sampleQtyData.length === 0) {
              SProdID = [];
              SfStatus = [];
            } else {
              sampleQtyData.map(function (value) {
                SfStatus.push(value.IDProduct);
                SProdID.push(value.Qty);
              });
            }

            if (giftQtyData.length === 0) {
              GProdID = [];
              GfStatus = [];
            } else {
              giftQtyData.map(function (value) {
                GfStatus.push(value.IDProduct);
                GProdID.push(value.Qty);
              });
            }

            const data_api = {
              dcrDate: cdate,
              businessID: useBusinessID,
              dcrType: 'RETAILER',
              //deviceType: DeviceInfo.getModel(),
              deviceType: 'OFFLINE_' + deviceType,
              //dcrDateTime: currTime,
              dcrDateTime: date,
              userLat: currentLatitude,
              userLong: currentLongitude,
              idCustomer: docValue,
              idDoctor: docLabel,
              idEmployee: useIDEmployee,
              idWorktype: 57,
              giftsProducts: GfStatus,
              giftsQty: GProdID,
              UNListed: false,
              //productsCurrentStatus: '5',
              productsCurrentStatus: curstageID,
              productsFinalStatus: fStatus,
              products: ProdID,
              samplesProduct: SfStatus,
              samplesProductQty: SProdID,
              //visitWiths: Mvisitwith,
              visitWiths: [{IDEmployee: useMvisitWTData}],
              entryUser: empEmail,
              Remarks: useRemarks,
            };
            //console.log(data_api);
            if (saveInProgress.current) {
              return;
            }

            saveInProgress.current = true;
            setIsSaving(true);
            try {
              db.transaction(tx => {
                tx.executeSql(
                  'CREATE TABLE IF NOT EXISTS CRM_MangerRetailerDataSave (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT);',
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
                  'INSERT INTO CRM_MangerRetailerDataSave (data) VALUES (?);',
                  [JSON.stringify(data_api)],
                  (_, result) => {
                    console.log('Data inserted successfully:', result);
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
                    db.transaction(txn => {
                      txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
                      txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
                    });
                  },
                  (_, error) => {
                    db.transaction(txn => {
                      txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
                      txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
                    });
                    console.log('Error inserting data:', error);
                  },
                );
              });

              db.transaction(txn => {
                txn.executeSql(
                  'CREATE TABLE IF NOT EXISTS CRM_ManagerOfflineViewRetDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,Area VARCHAR,CustomerType VARCHAR)',
                  [],
                );
              });

              let sql =
                'INSERT INTO CRM_ManagerOfflineViewRetDCR(Customer,Code,DCRDate,Area,CustomerType) VALUES (?,?,?,?,?)';
              let params = [docLabel, docValue, cdate, useMAreaLabel, '']; //storing user data in an array
              db.executeSql(sql, params);
            } catch (error) {
              console.error('Error during save operation:', error);
            } finally {
              saveInProgress.current = false;
              setIsSaving(false);
            }
          } else {
            let Mvisitwith = [];
            let GProdID = [];
            let GfStatus = [];
            let ProdID = [];
            let curstageID = [];
            let fStatus = [];
            let SProdID = [];
            let SfStatus = [];

            usevisitWTData.map(function (value) {
              //Mvisitwith.push({IDEmployee: value});
              Mvisitwith.push(value);
            });

            //console.log(Mvisitwith);
            if (sampleQtyData.length === 0) {
              SProdID = [];
              SfStatus = [];
            } else {
              sampleQtyData.map(function (value) {
                SfStatus.push(value.IDProduct);
                SProdID.push(value.Qty);
              });
            }

            if (giftQtyData.length === 0) {
              GProdID = [];
              GfStatus = [];
            } else {
              giftQtyData.map(function (value) {
                GfStatus.push(value.IDProduct);
                GProdID.push(value.Qty);
              });
            }

            const data_api = {
              dcrDate: cdate,
              businessID: useBusinessID,
              dcrType: 'RETAILER',
              //deviceType: DeviceInfo.getModel(),
              deviceType: 'OFFLINE_' + deviceType,
              //dcrDateTime: currTime,
              dcrDateTime: date,
              userLat: currentLatitude,
              userLong: currentLongitude,
              idCustomer: docValue,
              idDoctor: docLabel,
              idEmployee: useIDEmployee,
              idWorktype: 57,
              giftsProducts: GfStatus,
              giftsQty: GProdID,
              UNListed: false,
              //productsCurrentStatus: '5',
              productsCurrentStatus: curstageID,
              productsFinalStatus: fStatus,
              products: ProdID,
              samplesProduct: SfStatus,
              samplesProductQty: SProdID,
              visitWiths: Mvisitwith,
              entryUser: empEmail,
              Remarks: useRemarks,
            };
            console.log(data_api);

            if (saveInProgress.current) {
              return;
            }

            saveInProgress.current = true;
            setIsSaving(true);
            try {
              db.transaction(tx => {
                tx.executeSql(
                  'CREATE TABLE IF NOT EXISTS CRM_RetailerDataSave (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT);',
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
                  'INSERT INTO CRM_RetailerDataSave (data) VALUES (?);',
                  [JSON.stringify(data_api)],
                  (_, result) => {
                    console.log('Data inserted successfully:', result);
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
                    db.transaction(txn => {
                      txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
                      txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
                    });
                  },
                  (_, error) => {
                    console.log('Error inserting data:', error);
                    db.transaction(txn => {
                      txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
                      txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
                    });
                  },
                );
              });

              db.transaction(txn => {
                txn.executeSql(
                  'CREATE TABLE IF NOT EXISTS CRM_OfflineViewRetDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,Area VARCHAR,CustomerType VARCHAR)',
                  [],
                );
              });

              let sql =
                'INSERT INTO CRM_OfflineViewRetDCR(Customer,Code,DCRDate,Area,CustomerType) VALUES (?,?,?,?,?)';
              let params = [docLabel, docValue, cdate, useAreaLabel, '']; //storing user data in an array
              db.executeSql(sql, params);
            } catch (error) {
              console.error('Error during save operation:', error);
            } finally {
              saveInProgress.current = false;
              setIsSaving(false);
            }
          }
        }
      }, []);
    } else {
      Alert.alert('Contact With Administrator!');
      //Alert.alert(useMobileAccess);
    }
  };

  const EndRetDcr = async IDday => {
    var date = moment().utcOffset('+05:30').format('YYYY-MM-DD hh:mm:ss A');
    //console.warn(date);
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
    } else {
      if (useManagerAccess === true) {
        let samples = [];
        let gifts = [];
        let status = [];
        let Mvisitwith = [];

        // useMvisitWTData.map(function (value) {
        //   Mvisitwith.push({ IDEmployee: value });
        //   //Mvisitwith.push(value);
        // });
        //console.log(Mvisitwith);

        if (sampleQtyData.length === 0) {
          samples = [];
        } else {
          sampleQtyData.map(function (value) {
            samples.push({
              IDProduct: value.IDProduct,
              Qty: value.Qty,
            });
          });
        }

        if (giftQtyData.length === 0) {
          gifts = [];
        } else {
          giftQtyData.map(function (value) {
            gifts.push({
              IDProduct: String(parseInt(value.IDProduct)),
              Qty: String(parseInt(value.Qty)),
            });
          });
        }
        const data_api = {
          IDDCR: 0,
          IDDay: IDday,
          DCRDate: cdate,
          DCRType: 'RETAILER',
          EntryType: 'ONLINE_' + deviceType,
          Sync: false,
          UserLat: currentLatitude,
          UserLong: currentLongitude,
          Remarks: useRemarks,
          User: empEmail,
          IDEmployee: useIDEmployee,
          IDWorktype: 57,
          IDDoctor: docValue,
          Businessid: useBusinessID,
          UNListed: false,
          Samples: samples,
          Gifts: gifts,
          ProductStatuss: status,
          //Visitwiths: Mvisitwith,
          Visitwiths: [{IDEmployee: useMvisitWTData}],
        };
        console.log(data_api);

        if (saveInProgress.current) {
          return;
        }

        saveInProgress.current = true;
        setIsSaving(true);
        try {
          let result = await fetch(BASE_URL + 'Manager/DCR/Mobile/Save', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data_api),
          });

          result = await result.json();
          // console.log(result);
          // console.log('Manager', data_api);
          if (result.result === '') {
            db.transaction(txn => {
              txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
              txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
            });
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
            db.transaction(txn => {
              txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
              txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
            });
            //Alert.alert(result.result);
            Alert.alert('Error Alert', `${result.result}`);
            navigation.navigate('AppNavDCRScreen');
            //Alert.alert(result.result, `${result.result}`);
          }
        } catch (error) {
          console.error('Error during API call:', error);
        } finally {
          saveInProgress.current = false;
          setIsSaving(false);
        }
      } else {
        let samples = [];
        let gifts = [];
        let status = [];
        let Mvisitwith = [];

        usevisitWTData.map(function (value) {
          Mvisitwith.push({IDEmployee: value});
          //Mvisitwith.push(value);
        });
        //console.log(Mvisitwith);

        if (sampleQtyData.length === 0) {
          samples = [];
        } else {
          // sampleQtyData.map(function (value) {
          //   samples.push({
          //     IDProduct: value.IDProduct,
          //     Qty: value.Qty,
          //   });
          // });
          samples = sampleQtyData.map(item => ({
            IDProduct: String(parseInt(item.IDProduct)), // removes .0
            Qty: item.Qty,
          }));
        }

        if (giftQtyData.length === 0) {
          gifts = [];
        } else {
          giftQtyData.map(function (value) {
            gifts.push({
              IDProduct: String(parseInt(value.IDProduct)),
              Qty: String(parseInt(value.Qty)),
            });
          });
        }

        const data_api = {
          IDDCR: 0,
          IDDay: IDday,
          DCRDate: cdate,
          DCRType: 'RETAILER',
          EntryType: 'ONLINE_' + deviceType,
          UserLat: currentLatitude,
          UserLong: currentLongitude,
          Remarks: useRemarks,
          User: empEmail,
          IDEmployee: useIDEmployee,
          IDWorktype: 57,
          IDDoctor: docValue,
          Businessid: useBusinessID,
          UNListed: false,
          Samples: samples,
          Gifts: gifts,
          ProductStatuss: status,
          Visitwiths: Mvisitwith,
        };
        console.log('User End', data_api);
        //let result = await fetch(BASE_URL + 'DCR/Mobile/End', {
        if (saveInProgress.current) {
          return;
        }

        saveInProgress.current = true;
        setIsSaving(true);
        try {
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
            db.transaction(txn => {
              txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
              txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
            });
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
            db.transaction(txn => {
              txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
              txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
            });
            //Alert.alert('Else : ' + result.result);
            Alert.alert('Error Alert', `${result.result}`);
            navigation.navigate('AppNavDCRScreen');
            //Alert.alert(result.result, `${result.result}`);
          }
        } catch (error) {
          console.error('Error during API call:', error);
        } finally {
          saveInProgress.current = false;
          setIsSaving(false);
        }
      }
    }
  };

  const onSelectSwitch = value => {
    setGamesTab(value);
  };
  const addSample = () => {
    if (sLabel.length === 0) {
      Alert.alert('Select Sample');
    } else if (useQty === '') {
      Alert.alert('Type Quantity');
    } else {
      setQty('');
      db.transaction(txn => {
        //txn.executeSql('DROP TABLE IF EXISTS ManagerAreaListTBL', []);
        txn.executeSql(
          'CREATE TABLE IF NOT EXISTS CRM_SAMPLEQTY(id INTEGER PRIMARY KEY AUTOINCREMENT,IDProduct VARCHAR,Name VARCHAR,Qty VARCHAR)',
          [],
        );
      });

      let sql = 'INSERT INTO CRM_SAMPLEQTY(IDProduct,Name,Qty) VALUES (?,?,?)';
      let params = [sValue, sLabel, useQty]; //storing user data in an array
      db.executeSql(sql, params);

      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM CRM_SAMPLEQTY',
          [],
          (_, results) => {
            if (results.rows.length > 0) {
              //console.warn('Table has data');
              var temp = [];
              for (let i = 0; i < results.rows.length; ++i) {
                temp.push(results.rows.item(i));
              }
              setsampleQtyData(temp);
              //console.log(temp);
            }
          },
          (_, error) => {
            console.log('Error fetching data:', error);
          },
        );
      });
    }
  };

  const addGift = () => {
    if (gLabel.length === 0) {
      Alert.alert('Select Gift');
    } else if (useGQty === '') {
      Alert.alert('Type Quantity');
    } else {
      setGQty('');
      db.transaction(txn => {
        //txn.executeSql('DROP TABLE IF EXISTS ManagerAreaListTBL', []);
        txn.executeSql(
          'CREATE TABLE IF NOT EXISTS CRM_GIFTQTY(id INTEGER PRIMARY KEY AUTOINCREMENT,IDProduct VARCHAR,Name VARCHAR,Qty VARCHAR)',
          [],
        );
      });

      let sql = 'INSERT INTO CRM_GIFTQTY(IDProduct,Name,Qty) VALUES (?,?,?)';
      let params = [gValue, gLabel, useGQty]; //storing user data in an array
      db.executeSql(sql, params);

      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM CRM_GIFTQTY',
          [],
          (_, results) => {
            if (results.rows.length > 0) {
              //console.warn('Table has data');
              var temp = [];
              for (let i = 0; i < results.rows.length; ++i) {
                temp.push(results.rows.item(i));
              }
              setgiftQtyDataData(temp);
              //console.log(temp);
            }
          },
          (_, error) => {
            console.log('Error fetching data:', error);
          },
        );
      });
    }
  };

  const onDeleteSample = id => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM CRM_SAMPLEQTY WHERE id = ?',
        [id],
        (tx, results) => {
          // Check if deletion was successful
          if (results.rowsAffected > 0) {
            // Update the state to re-render the FlatList without the deleted item
            setsampleQtyData(prevData =>
              prevData.filter(item => item.id !== id),
            );
          }
        },
      );
    });
  };
  const onDeleteGift = id => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM CRM_GIFTQTY WHERE id = ?',
        [id],
        (tx, results) => {
          // Check if deletion was successful
          if (results.rowsAffected > 0) {
            // Update the state to re-render the FlatList without the deleted item
            setgiftQtyDataData(prevData =>
              prevData.filter(item => item.id !== id),
            );
          }
        },
      );
    });
  };

  const areaWiseDoctorList = IDArea => {
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        console.log('IDArea', IDArea);

        // const returl =
        //   BASE_URL +
        //   'Retailer/AreaWiseRetailerList?Businessid=' +
        //   useBusinessID +
        //   '&IDArea=' +
        const returl =
          BASE_URL +
          'Retailer/EmployeeAndAreaWiseRetailerList?Businessid=' +
          useBusinessID +
          '&IDEmployee=' +
          useIDEmployee +
          '&IDArea=' +
          IDArea;
        console.log('returl ' + returl);
        var config = {
          method: 'get',
          url: returl,
        };
        axios(config)
          .then(function (response) {
            var count = Object.keys(response.data).length;
            let wtNameArray = [];
            for (var i = 0; i < count; i++) {
              wtNameArray.push({
                //value: response.data[i].Value,
                value: response.data[i].IDRetailer,
                label: response.data[i].Name + ' ' + response.data[i].Code,
                lati: response.data[i].Latitude,
                longi: response.data[i].Longitude,
                name: response.data[i].Name,
              });
            }
            setdoctorData(wtNameArray);
          })
          .catch(function (error) {
            Alert.alert(error);
          });
      } else {
        //Retrieve data from CRM_RetList
        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM CRM_RetList where Area=?',
            [IDArea],
            (tx, results) => {
              if (results.rows.length > 0) {
                var temp = [];
                for (let i = 0; i < results.rows.length; ++i) {
                  temp.push({
                    value: results.rows.item(i).IDRetailer,
                    label:
                      results.rows.item(i).Name +
                      '  ' +
                      results.rows.item(i).Code,
                    lati: results.rows.item(i).Latitude,
                    longi: results.rows.item(i).Longitude,
                    name: results.rows.item(i).Name,
                  });
                }
                setdoctorData(temp);
                //console.log('Data is inserted:', temp);
              } else {
                console.log('No data found');
                //setWTData('No data found');
              }
            },
            (tx, error) => {
              console.error('Error checking data', error);
            },
          );
        });
      }
    }, []);
  };
  const areaWiseMDoctorList = IDArea => {
    console.log(IDArea);

    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        // const returl =
        //   BASE_URL +
        //   'Retailer/AreaWiseRetailerList?Businessid=' +
        //   useBusinessID +
        //   '&IDArea=' +
        //   IDArea;
        const returl =
          BASE_URL +
          'manager/DCR/MultipleEmployeeAndAreaWiseRetailerList?Businessid=' +
          useBusinessID +
          '&Employees=' +
          useMultipleIDEmployee +
          '&IDArea=' +
          IDArea;
        //console.log('returl ' + returl);
        var config = {
          method: 'get',
          url: returl,
        };
        axios(config)
          .then(function (response) {
            var count = Object.keys(response.data).length;
            let wtNameArray = [];
            for (var i = 0; i < count; i++) {
              wtNameArray.push({
                //value: response.data[i].Value,
                value: response.data[i].IDRetailer,
                label: response.data[i].Name,
                lati: response.data[i].Latitude,
                longi: response.data[i].Longitude,
                name: response.data[i].Name,
              });
            }
            setdoctorData(wtNameArray);
          })
          .catch(function (error) {
            Alert.alert(error);
          });
      } else {
        const query =
          'SELECT * FROM CRM_offlineManagerRetailerList WHERE IDArea=?';
        const params = [IDArea];
        console.log(query + ' ' + params);
        //Retrieve data from CRM_RetList
        db.transaction(tx => {
          tx.executeSql(
            query,
            params,
            (tx, results) => {
              if (results.rows.length > 0) {
                var temp = [];
                for (let i = 0; i < results.rows.length; ++i) {
                  temp.push({
                    value: results.rows.item(i).IDRetailer,
                    label: results.rows.item(i).Name,
                    lati: results.rows.item(i).Latitude,
                    longi: results.rows.item(i).Longitude,
                    name: results.rows.item(i).Name,
                  });
                }
                setdoctorData(temp);
                //console.log('Data is inserted:', temp);
              } else {
                console.log('No data found');
                //setWTData('No data found');
              }
            },
            (tx, error) => {
              console.error('Error checking data', error);
            },
          );
        });
      }
    }, []);
  };

  const fmt = v => {
    const n = Number(v);
    return Number.isFinite(n) ? n.toFixed(6) : 'N/A';
  };

  const calculateDistane = (apiLat, apiLong, docCode, docName) => {
    setDocCode(docCode);
    setDocName(docName);
    // --- 0) Target guard: skip if API sent zero-like coordinates
    const lat2 = Number(apiLat);
    const lon2 = Number(apiLong);
    if (
      !Number.isFinite(lat2) ||
      !Number.isFinite(lon2) ||
      (lat2 === 0 && lon2 === 0)
    ) {
      console.log(
        `[GPS] Skip: target is zero-like target=(${apiLat}, ${apiLong}) (docCode=${
          docCode ?? '-'
        }, docName=${docName ?? '-'})`,
      );
      return;
    }

    // --- 1) Coerce current + radius (meters)
    const lat1 = Number(currentLatitude);
    const lon1 = Number(currentLongitude);
    const radius = Number(useDoctorGeofencing || 0); // e.g., 150

    // ⛔ Location not ready
    if (
      !Number.isFinite(lat1) ||
      !Number.isFinite(lon1) ||
      (lat1 === 0 && lon1 === 0)
    ) {
      Alert.alert(
        'Fetching Location',
        'Please wait while we fetch your current location…',
      );
      return;
    }

    // Validate current + radius
    if (![lat1, lon1, radius].every(Number.isFinite)) {
      console.warn('Invalid inputs for distance calc:', {lat1, lon1, radius});
      return;
    }

    // --- 2) Debug log current/target
    console.log(
      `[GPS] now=${new Date().toISOString()} ` +
        `current=(${lat1.toFixed(6)}, ${lon1.toFixed(6)}) ` +
        `target=(${lat2.toFixed(6)}, ${lon2.toFixed(6)}) ` +
        `acc=${
          Number.isFinite(gpsAccuracy) ? Math.round(gpsAccuracy) + 'm' : 'n/a'
        }`,
    );

    // --- 3) Haversine (meters)
    const toRad = d => (d * Math.PI) / 180;
    const R = 6371000; // meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

    const metersRaw = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    const meters = Math.floor(metersRaw + 1e-6); // stabilize decimals like 150.076 -> 150
    setDistance(meters);
    setCurrentLocation({Latitude: lat1, Longitude: lon1}); // UI only

    // --- 4) Tolerance + HYSTERESIS (prevents in/out flapping near the edge)
    // Base cushion
    const BASE_EPS = 4; // meters
    // If you have GPS accuracy, adapt EPS = max(BASE, accuracy * 0.5)
    const epsFromAcc = Number.isFinite(gpsAccuracy)
      ? Math.round(gpsAccuracy * 0.5)
      : 0;
    const EPS = Math.max(BASE_EPS, epsFromAcc);

    // Hysteresis:
    // - If we were INSIDE, require meters > (radius + EPS) to flip OUTSIDE.
    // - If we were OUTSIDE, require meters < max(0, radius - EPS) to flip INSIDE.
    let inside = lastInsideRef.current;
    if (inside === null) {
      // Initialize state with a relaxed check so first reading doesn’t jitter
      inside = meters <= radius + EPS;
    } else if (inside === true) {
      if (meters > radius + EPS) inside = false;
    } else {
      // if (meters < Math.max(0, radius - EPS)) inside = true;
      if (meters <= radius) inside = true; // simpler logic on outside->inside
    }
    lastInsideRef.current = inside;

    console.log(
      `dist=${meters}m, radius=${radius}m, state=${
        inside ? 'INSIDE' : 'OUTSIDE'
      }`,
    );

    // Alert.alert(
    //   'Distance Info',
    //   `Doctor Geofencing Radius: ${radius} meters.\nYour distance: ${meters} meter\nDoc Code: ${docCode}\nDoc Name: ${docName}`,
    // );
    // --- 5) UI action
    if (!inside) {
      setModalVisible(true);
      setDoctorLocation({latitude: lat2, longitude: lon2});
      //setdoctorData('');

      if (useManagerAccess === true) {
        setMArea([]);
        setdoctorData([]);
        setdocValue('');
        setdocLabel('');
      } else {
        setdoctorData([]);
        setdocValue('');
        setdocLabel('');
      }
    } else {
      setModalVisible(false);
    }
  };

  useEffect(() => {
    lastInsideRef.current = null;
  }, [
    doctorLocation?.latitude,
    doctorLocation?.longitude,
    useDoctorGeofencing,
  ]);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = daten => {
    const formattedDate = moment(daten).format('D/MMM/YYYY').toUpperCase();

    setcurrDate(formattedDate);
    hideDatePicker();
  };
  return (
    <KeyboardAwareLayout>
      <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />
      <View
        style={{
          backgroundColor: '#ecf0f1',
          justifyContent: 'space-between',
          flexDirection: 'row',
          alignItems: 'center',
          padding: 10,
          borderWidth: 0.1,
          margin: 10,
          elevation: 2,
          borderRadius: 1,
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center', padding: 5}}>
          {/* Big Location Icon */}
          <Ionicons
            name="location-outline"
            size={40}
            color="#005696"
            style={{marginRight: 12}}
          />

          <View>
            {/* <Text style={style.boldText}>{locationStatus}</Text> */}
            <Text style={{padding: 5}}>Lat: {currentLatitude}</Text>
            <Text style={{padding: 5}}>Long: {currentLongitude} </Text>
            {/* <Text style={{padding: 5}}>DCR Status : </Text> */}
          </View>
        </View>
        {/* {showData ? ( */}
        <TouchableOpacity
          disabled={isSaving}
          style={{
            backgroundColor: '#005696',
            width: '35%',
            padding: 5,
            margin: 5,
            borderRadius: 5,
            flexDirection: 'row',
          }}
          onPress={() => save()}>
          <Text
            style={{
              textAlign: 'center',
              fontWeight: '700',
              fontSize: 18,
              margin: 5,
              padding: 5,
              fontFamily: 'Lato-Regular',
              color: '#fff',
            }}>
            End DCR
          </Text>
          {/* <View style={{marginTop: 5, marginBottom: 5, marginLeft: 2}}>
          <AntDesign
            name="arrowright"
            size={20}
            color="white"
            // onPress={() => {
            //   onDelete(dataItem.id);
            // }}
          />
        </View> */}
        </TouchableOpacity>
        {/* ) : null} */}
      </View>
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
      {useManagerAccess ? (
        <View>
          {shouldShowDocVisitWithData ? (
            <View
              style={{
                paddingLeft: 5,
                paddingRight: 5,
                marginLeft: 5,
                marginRight: 5,
              }}>
              <View style={{marginBottom: 5, paddingBottom: 5}}>
                {/* <MultipleSelectList
                  setSelected={val => setMvisitWTData(val)}
                  data={useMvisitWTDataSelected}
                  placeholder="Select Visit With"
                  label="Visit With"
                  //save="value"
                  save="key"
                  onSelect={() =>
                    //console.log(usevisitWTData)
                    multiSelectVisitWith()
                  }
                  fontFamily="Roboto-Bold"
                  notFoundText="No Data Exists"
                  //badgeTextStyles={{color:'red'}}
                  badgeStyles={{ backgroundColor: 'green' }}
                  labelStyles={{ fontWeight: '800', color: 'black' }}
                /> */}

                <SelectList
                  setSelected={val => {
                    setMvisitWTData(val);
                    multiSelectVisitWith(val); // optional if you still need callback
                  }}
                  data={useMvisitWTDataSelected}
                  placeholder="Select Visit With"
                  save="key"
                  fontFamily="Roboto-Bold"
                  notFoundText="No Data Exists"
                  boxStyles={{}}
                  dropdownStyles={{}}
                />
              </View>
              <View style={{marginBottom: 5, paddingBottom: 5}}>
                <Dropdown
                  style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                  placeholderStyle={style.placeholderStyle}
                  selectedTextStyle={style.selectedTextStyle}
                  inputSearchStyle={style.inputSearchStyle}
                  iconStyle={style.iconStyle}
                  data={useMArea}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  //dropdownPosition="top"
                  placeholder={!isFocus ? 'Select Area' : '...'}
                  searchPlaceholder="Search..."
                  //value={wtdataLabel}
                  onFocus={() => {
                    setIsFocus(true);
                    if (
                      setMultipleIDEmployee !== null &&
                      setMultipleIDEmployee !== ''
                    ) {
                      managerAreaList(useMultipleIDEmployee);
                    }
                    //areaWiseDoctorList(useAreaValue);
                  }}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    // setdocValue(item.value);
                    setMAreaLabel(item.label);
                    setMAreaValue(item.value);
                    setIsFocus(false);
                    areaWiseMDoctorList(item.value);
                    // doctorWiseProductListAPI(item.value);
                    //setDocCode(item.value);
                  }}
                />
              </View>
              <View style={{marginBottom: 2, paddingBottom: 2}}>
                <Dropdown
                  style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                  placeholderStyle={style.placeholderStyle}
                  selectedTextStyle={style.selectedTextStyle}
                  inputSearchStyle={style.inputSearchStyle}
                  iconStyle={style.iconStyle}
                  data={usedoctorData}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  //dropdownPosition="top"
                  placeholder={!isFocus ? 'Select Retailer' : '...'}
                  searchPlaceholder="Search..."
                  //value={wtdataLabel}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    setdocValue(item.value);
                    setdocLabel(item.label);
                    setIsFocus(false);
                    //doctorWiseProductListAPI(item.value);
                    if (useGeofencing === 'YES') {
                      calculateDistane(
                        item.lati,
                        item.longi,
                        item.value,
                        item.name,
                      );
                    }
                    console.log('useGeofencing', useGeofencing);
                  }}
                />
              </View>
              <View style={{marginBottom: 2, paddingBottom: 2}}>
                <TextInput
                  //label="Remarks"
                  mode="outlined"
                  autoCapitalize="none"
                  multiline={true}
                  numberOfLines={3}
                  autoCorrect={false}
                  style={[style.textInput, {marginBottom: 5}]}
                  placeholder="Remarks"
                  placeholderTextColor="#555"
                  value={useRemarks}
                  onChangeText={text => setRemarks(text)}
                />
              </View>
            </View>
          ) : null}
        </View>
      ) : (
        <View>
          {shouldShowDocVisitWithData ? (
            <View
              style={{
                paddingLeft: 5,
                paddingRight: 5,
                marginLeft: 5,
                marginRight: 5,
              }}>
              <View style={{marginBottom: 5, paddingBottom: 5}}>
                <Dropdown
                  style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                  placeholderStyle={style.placeholderStyle}
                  selectedTextStyle={style.selectedTextStyle}
                  inputSearchStyle={style.inputSearchStyle}
                  iconStyle={style.iconStyle}
                  data={useArea}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  //dropdownPosition="top"
                  placeholder={!isFocus ? 'Select Area' : '...'}
                  searchPlaceholder="Search..."
                  //value={wtdataLabel}
                  onFocus={() => {
                    setIsFocus(true);

                    //areaWiseDoctorList(useAreaValue);
                  }}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    // setdocValue(item.value);
                    setAreaLabel(item.label);
                    setAreaValue(item.value);
                    setIsFocus(false);
                    areaWiseDoctorList(item.value);
                    // doctorWiseProductListAPI(item.value);
                    //setDocCode(item.value);
                  }}
                />
              </View>
              <Dropdown
                style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                placeholderStyle={style.placeholderStyle}
                selectedTextStyle={style.selectedTextStyle}
                inputSearchStyle={style.inputSearchStyle}
                iconStyle={style.iconStyle}
                data={usedoctorData}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                //dropdownPosition="top"
                placeholder={!isFocus ? 'Select Retailer' : '...'}
                searchPlaceholder="Search..."
                //value={wtdataLabel}
                onFocus={() => {
                  setIsFocus(true);
                  if (useAreaValue !== null && useAreaValue !== '') {
                    areaWiseDoctorList(useAreaValue);
                  }
                }}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  setdocValue(item.value);
                  setdocLabel(item.label);
                  setIsFocus(false);
                  if (useGeofencing === 'YES') {
                    calculateDistane(
                      item.lati,
                      item.longi,
                      item.value,
                      item.name,
                    );
                  }
                  console.log('useGeofencing', useGeofencing);

                  // doctorWiseProductListAPI(item.value);
                  // setDocCode(item.value);
                }}
              />
              <View style={{marginTop: 5, paddingTop: 5}}>
                <MultipleSelectList
                  setSelected={val => setvisitWTData(val)}
                  data={usevisitWTDataSelected}
                  placeholder="Select Visit With"
                  label="Visit With"
                  //save="value"
                  save="key"
                  onSelect={
                    () => console.log(usevisitWTData)
                    //multiSelectVisitWith()
                  }
                  fontFamily="Roboto-Bold"
                  notFoundText="No Data Exists"
                  //badgeTextStyles={{color:'red'}}
                  badgeStyles={{backgroundColor: 'green'}}
                  labelStyles={{fontWeight: '800', color: 'black'}}
                />
              </View>
              <View style={{marginBottom: 2, paddingBottom: 2}}>
                <TextInput
                  //label="Remarks"
                  mode="outlined"
                  autoCapitalize="none"
                  multiline={true}
                  numberOfLines={3}
                  autoCorrect={false}
                  style={[style.textInput, {marginBottom: 5}]}
                  placeholder="Remarks"
                  placeholderTextColor="#555"
                  value={useRemarks}
                  onChangeText={text => setRemarks(text)}
                />
              </View>
            </View>
          ) : null}
        </View>
      )}
      <SafeAreaView style={{flex: 1}}>
        <View style={{marginLeft: 10, marginRight: 10}}>
          <CustomRetailer
            selectionMode={1}
            option1="Sample"
            option2="Gift"
            onSelectSwitch={onSelectSwitch}
          />
        </View>
        {gamesTab == 1 && (
          <View style={{margin: 10}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Dropdown
                style={[
                  style.dropdownNew,
                  isFocus && {borderColor: 'blue', width: '50%'},
                ]}
                placeholderStyle={style.placeholderStyle}
                selectedTextStyle={style.selectedTextStyle}
                inputSearchStyle={style.inputSearchStyle}
                iconStyle={style.iconStyle}
                data={sampleData}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? 'Select Sample' : '...'}
                searchPlaceholder="Search"
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  console.log(item.value);
                  setSLabel(item.label);
                  setSValue(item.value);
                  setIsFocus(false);
                }}
              />
              <TextInput
                label="Quantity"
                mode="outlined"
                autoCapitalize="none"
                inputMode="numeric"
                autoCorrect={false}
                value={useQty}
                // key={index}
                // value={dataGift[index]}
                style={[
                  style.textInput,
                  {
                    width: '20%',
                    alignItems: 'center',
                    marginRight: 5,
                    height: '86%',
                  },
                ]}
                placeholder="Qty"
                placeholderTextColor="#555"
                onChangeText={text => setQty(text)}
              />
              <TouchableOpacity
                style={{
                  backgroundColor: '#005696',
                  width: '25%',
                  height: '86%',
                  margin: 5,
                  borderRadius: 5,
                  flexDirection: 'row',
                }}
                onPress={() => addSample()}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontWeight: '700',
                    fontSize: 18,
                    marginLeft: 20,
                    marginTop: 5,
                    padding: 5,
                    fontFamily: 'Lato-Regular',
                    color: '#fff',
                  }}>
                  Add
                </Text>
              </TouchableOpacity>
            </View>
            {/* <View>
              {sampleQtyData.length
                ? sampleQtyData.map((item, index) => {
                  return (
                    <ScrollView>
                      <TouchableWithoutFeedback>
                        <View
                          style={[
                            style.menu,
                            {
                              backgroundColor: '#ecf0f1',
                              flexDirection: 'row',
                            },
                          ]}>
                          <View
                            style={{
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <AntDesign
                              name="delete"
                              size={30}
                              color="red"
                              onPress={() => {
                                onDeleteSample(item.id);
                              }}
                            />
                          </View>
                          <View
                            style={{
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: 5,
                            }}>
                            <View
                              style={{
                                flexDirection: 'row',
                              }}>
                              <Text
                                style={{
                                  fontSize: 12,
                                  fontFamily: 'Lato-Regular',
                                  color: '#000',
                                  margin: 2,
                                  padding: 2,
                                  textAlignVertical: 'center',
                                }}>
                                Name :{' '}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontFamily: 'Lato-Bold',
                                  color: '#000',
                                  width: '80%',
                                  textAlignVertical: 'center',
                                }}>
                                {item.Name}
                              </Text>
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                              }}>
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontFamily: 'Lato-Regular',
                                  color: '#000',
                                  margin: 2,
                                  padding: 2,
                                  textAlignVertical: 'center',
                                }}>
                                Qty :{' '}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontFamily: 'Lato-Bold',
                                  color: '#000',
                                  textAlignVertical: 'center',
                                }}>
                                {item.Qty}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </TouchableWithoutFeedback>
                    </ScrollView>
                  );
                })
                : null}
            </View> */}
            {sampleQtyData && sampleQtyData.length > 0 ? (
              <View
                style={{
                  marginTop: 10,
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 6,
                  overflow: 'hidden',
                }}>
                {/* Header Row */}
                <View
                  style={{
                    flexDirection: 'row',
                    backgroundColor: '#005696',
                    paddingVertical: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: '#ccc',
                  }}>
                  <Text
                    style={{
                      flex: 0.1,
                      color: '#fff',
                      fontFamily: 'Lato-Bold',
                      textAlign: 'center',
                      borderRightWidth: 1,
                      borderRightColor: '#ccc',
                    }}>
                    No
                  </Text>
                  <Text
                    style={{
                      flex: 0.5,
                      color: '#fff',
                      fontFamily: 'Lato-Bold',
                      textAlign: 'center',
                      borderRightWidth: 1,
                      borderRightColor: '#ccc',
                    }}>
                    Name
                  </Text>
                  <Text
                    style={{
                      flex: 0.2,
                      color: '#fff',
                      fontFamily: 'Lato-Bold',
                      textAlign: 'center',
                      borderRightWidth: 1,
                      borderRightColor: '#ccc',
                    }}>
                    Qty
                  </Text>
                  <Text
                    style={{
                      flex: 0.2,
                      color: '#fff',
                      fontFamily: 'Lato-Bold',
                      textAlign: 'center',
                    }}>
                    Action
                  </Text>
                </View>

                {/* Data Rows */}
                <ScrollView>
                  {sampleQtyData.map((item, index) => (
                    <View
                      key={index}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor:
                          index % 2 === 0 ? '#f9f9f9' : '#ffffff',
                        borderBottomWidth: 1,
                        borderBottomColor: '#ccc',
                      }}>
                      {/* Sr. No */}
                      <Text
                        style={{
                          flex: 0.1,
                          fontFamily: 'Lato-Regular',
                          color: '#000',
                          textAlign: 'center',
                          borderRightWidth: 1,
                          borderRightColor: '#ccc',
                          paddingVertical: 8,
                        }}>
                        {index + 1}
                      </Text>

                      {/* Name */}
                      <Text
                        style={{
                          flex: 0.5,
                          fontFamily: 'Lato-Bold',
                          color: '#000',
                          textAlign: 'center',
                          borderRightWidth: 1,
                          borderRightColor: '#ccc',
                          paddingVertical: 8,
                        }}
                        numberOfLines={3}
                        ellipsizeMode="tail">
                        {item.Name}
                      </Text>

                      {/* Quantity */}
                      <Text
                        style={{
                          flex: 0.2,
                          fontFamily: 'Lato-Regular',
                          color: '#000',
                          textAlign: 'center',
                          borderRightWidth: 1,
                          borderRightColor: '#ccc',
                          paddingVertical: 8,
                        }}>
                        {item.Qty}
                      </Text>

                      {/* Delete Icon */}
                      <TouchableOpacity
                        style={{
                          flex: 0.2,
                          alignItems: 'center',
                          paddingVertical: 6,
                        }}
                        onPress={() => onDeleteSample(item.id)}>
                        <AntDesign name="delete" size={22} color="red" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </View>
        )}
        {gamesTab == 2 && (
          <View style={{margin: 10}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Dropdown
                style={[
                  style.dropdownNew,
                  isFocus && {borderColor: 'blue', width: '50%'},
                ]}
                placeholderStyle={style.placeholderStyle}
                selectedTextStyle={style.selectedTextStyle}
                inputSearchStyle={style.inputSearchStyle}
                iconStyle={style.iconStyle}
                data={giftData}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? 'Select Gift' : '...'}
                searchPlaceholder="Search"
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  console.log(item.value);
                  setGLabel(item.label);
                  setGValue(item.value);
                  setIsFocus(false);
                }}
              />
              <TextInput
                //label="Quantity"
                mode="outlined"
                autoCapitalize="none"
                inputMode="numeric"
                autoCorrect={false}
                value={useGQty}
                // key={index}
                // value={dataGift[index]}
                style={[
                  style.textInput,
                  {
                    width: '20%',
                    alignItems: 'center',
                    marginRight: 5,
                    height: '86%',
                  },
                ]}
                placeholder="Qty"
                placeholderTextColor="#555"
                onChangeText={text => setGQty(text)}
              />
              <TouchableOpacity
                style={{
                  backgroundColor: '#005696',
                  width: '25%',
                  height: '86%',
                  margin: 5,
                  borderRadius: 5,
                  flexDirection: 'row',
                }}
                onPress={() => addGift()}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontWeight: '700',
                    fontSize: 18,
                    marginLeft: 20,
                    marginTop: 5,
                    padding: 5,
                    fontFamily: 'Lato-Regular',
                    color: '#fff',
                  }}>
                  Add
                </Text>
              </TouchableOpacity>
            </View>
            {/* <View>
              {giftQtyData.length
                ? giftQtyData.map((item, index) => {
                  return (
                    <ScrollView>
                      <TouchableWithoutFeedback>
                        <View
                          style={[
                            style.menu,
                            {
                              backgroundColor: '#ecf0f1',
                              flexDirection: 'row',
                            },
                          ]}>
                          <View
                            style={{
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <AntDesign
                              name="delete"
                              size={25}
                              color="red"
                              onPress={() => {
                                onDeleteGift(item.id);
                              }}
                            />
                          </View>
                          <View
                            style={{
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: 5,
                            }}>
                            <View
                              style={{
                                flexDirection: 'row',
                              }}>
                              <Text
                                style={{
                                  fontSize: 12,
                                  fontFamily: 'Lato-Regular',
                                  color: '#000',
                                  margin: 2,
                                  padding: 2,
                                  textAlignVertical: 'center',
                                }}>
                                Name :{' '}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontFamily: 'Lato-Bold',
                                  color: '#000',
                                  width: '80%',
                                  textAlignVertical: 'center',
                                }}>
                                {item.Name}
                              </Text>
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                              }}>
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontFamily: 'Lato-Regular',
                                  color: '#000',
                                  margin: 2,
                                  padding: 2,
                                  textAlignVertical: 'center',
                                }}>
                                Qty :{' '}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontFamily: 'Lato-Bold',
                                  color: '#000',
                                  textAlignVertical: 'center',
                                }}>
                                {item.Qty}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </TouchableWithoutFeedback>
                    </ScrollView>
                  );
                })
                : null}
            </View> */}
            {giftQtyData && giftQtyData.length > 0 ? (
              <View
                style={{
                  marginTop: 10,
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 6,
                  overflow: 'hidden',
                }}>
                {/* Header Row */}
                <View
                  style={{
                    flexDirection: 'row',
                    backgroundColor: '#005696',
                    paddingVertical: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: '#ccc',
                  }}>
                  <Text
                    style={{
                      flex: 0.1,
                      color: '#fff',
                      fontFamily: 'Lato-Bold',
                      textAlign: 'center',
                      borderRightWidth: 1,
                      borderRightColor: '#ccc',
                    }}>
                    No
                  </Text>
                  <Text
                    style={{
                      flex: 0.5,
                      color: '#fff',
                      fontFamily: 'Lato-Bold',
                      textAlign: 'center',
                      borderRightWidth: 1,
                      borderRightColor: '#ccc',
                    }}>
                    Name
                  </Text>
                  <Text
                    style={{
                      flex: 0.2,
                      color: '#fff',
                      fontFamily: 'Lato-Bold',
                      textAlign: 'center',
                      borderRightWidth: 1,
                      borderRightColor: '#ccc',
                    }}>
                    Qty
                  </Text>
                  <Text
                    style={{
                      flex: 0.2,
                      color: '#fff',
                      fontFamily: 'Lato-Bold',
                      textAlign: 'center',
                    }}>
                    Action
                  </Text>
                </View>

                {/* Data Rows */}
                <ScrollView>
                  {giftQtyData.map((item, index) => (
                    <View
                      key={index}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor:
                          index % 2 === 0 ? '#f9f9f9' : '#ffffff',
                        borderBottomWidth: 1,
                        borderBottomColor: '#ccc',
                      }}>
                      {/* Sr. No */}
                      <Text
                        style={{
                          flex: 0.1,
                          fontFamily: 'Lato-Regular',
                          color: '#000',
                          textAlign: 'center',
                          borderRightWidth: 1,
                          borderRightColor: '#ccc',
                          paddingVertical: 8,
                        }}>
                        {index + 1}
                      </Text>

                      {/* Name */}
                      <Text
                        style={{
                          flex: 0.5,
                          fontFamily: 'Lato-Bold',
                          color: '#000',
                          textAlign: 'center',
                          borderRightWidth: 1,
                          borderRightColor: '#ccc',
                          paddingVertical: 8,
                        }}
                        numberOfLines={3}
                        ellipsizeMode="tail">
                        {item.Name}
                      </Text>

                      {/* Quantity */}
                      <Text
                        style={{
                          flex: 0.2,
                          fontFamily: 'Lato-Regular',
                          color: '#000',
                          textAlign: 'center',
                          borderRightWidth: 1,
                          borderRightColor: '#ccc',
                          paddingVertical: 8,
                        }}>
                        {item.Qty}
                      </Text>

                      {/* Delete Icon */}
                      <TouchableOpacity
                        style={{
                          flex: 0.2,
                          alignItems: 'center',
                          paddingVertical: 6,
                        }}
                        onPress={() => onDeleteGift(item.id)}>
                        <AntDesign name="delete" size={20} color="red" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </View>
        )}
        {/* <View style={{marginLeft: 10, marginRight: 10}}>
        <CustomButton label={'End DCR'} onPress={() => save()} />
      </View> */}
      </SafeAreaView>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={style.modalContainer}>
          <View style={style.modalContent}>
            <Text style={style.modalTitle}>Distance Alert</Text>
            <Text style={style.modalText}>
              Distance exceeds{' '}
              {typeof useDoctorGeofencing === 'number'
                ? useDoctorGeofencing
                : 'N/A'}{' '}
              meters.
            </Text>

            <Text style={style.distanceText}>
              Distance: {distance != null ? distance : '0.00'} meters
            </Text>

            <Text style={style.textLabel}>Retailer Code: {docCode}</Text>
            <Text style={style.textLabel}>Retailer Name: {docName}</Text>

            {/* NEW: show current device location */}
            <Text style={[style.textLabel, {color: 'blue'}]}>
              Your Location: Latitude: {fmt(currentLatitude)}, Longitude:{' '}
              {fmt(currentLongitude)}
            </Text>

            {doctorLocation &&
              typeof doctorLocation.latitude === 'number' &&
              typeof doctorLocation.longitude === 'number' && (
                <>
                  <Text style={[style.textLabel, {color: 'red'}]}>
                    Retailer Location: Latitude: {doctorLocation.latitude},
                    Longitude: {doctorLocation.longitude}
                  </Text>

                  <MapView
                    provider={
                      Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined
                    }
                    style={style.mapView}
                    region={{
                      latitude: doctorLocation.latitude,
                      longitude: doctorLocation.longitude,
                      latitudeDelta: 0.015,
                      longitudeDelta: 0.0121,
                    }}
                    showsUserLocation
                    followsUserLocation>
                    {/* Retailer / Doctor marker */}
                    <Marker
                      coordinate={{
                        latitude: doctorLocation.latitude,
                        longitude: doctorLocation.longitude,
                      }}
                      title="Retailer's Location"
                    />

                    {/* Current user marker */}
                    {Number.isFinite(Number(currentLatitude)) &&
                      Number.isFinite(Number(currentLongitude)) && (
                        <Marker
                          coordinate={{
                            latitude: Number(currentLatitude),
                            longitude: Number(currentLongitude),
                          }}
                          title="Your Location"
                          pinColor="blue"
                        />
                      )}

                    {/* Geofence circle */}
                    {Number(useDoctorGeofencing) > 0 && (
                      <Circle
                        center={{
                          latitude: doctorLocation.latitude,
                          longitude: doctorLocation.longitude,
                        }}
                        radius={Number(useDoctorGeofencing)}
                        strokeWidth={1}
                        strokeColor="rgba(22,125,128,0.9)"
                        fillColor="rgba(22,125,128,0.2)"
                      />
                    )}
                  </MapView>
                </>
              )}
          </View>

          <View style={style.closeButtonContainer}>
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </KeyboardAwareLayout>
  );
};

export default RetailerDCRScreen;

const style = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
    padding: 15,
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12, // Rounded corners
    justifyContent: 'space-between',
    flex: 1,
  },
  mapView: {
    width: '100%',
    height: 280, // Adjusted height for the map to make it bigger
    marginVertical: 20,
    borderRadius: 10,
  },
  closeButtonContainer: {
    marginTop: 'auto', // Push the button to the bottom
    marginBottom: 10, // Space from the bottom
    width: '90%',
    padding: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 5,
    //textAlign: 'center',
  },
  distanceText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'left',
    color: 'red',
  },
  textLabel: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'Left',
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    //marginBottom: 10,
    //marginTop: 10,
  },
  dropdownNew: {
    height: 50,
    width: '50%',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    //marginBottom: 10,
    marginRight: 5,
    marginTop: 5,
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
    fontSize: 12,
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
    marginBottom: 10,
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
  boldText: {
    fontSize: 24,
    color: 'red',
    marginVertical: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#b2b1b9ff', // Border color
    borderRadius: 8, // Rounded corners
    padding: 10, // Inner padding
    fontSize: 16,
  },
});
