import {
  View,
  Text,
  SafeAreaView,
  Dimensions,
  TouchableWithoutFeedback,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  LogBox,
  BackHandler,
  TextInput,
  FlatList,
  Modal,
  Button,
  StatusBar,
  Keyboard,
  PermissionsAndroid,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Geolocation from 'react-native-geolocation-service';
import { getDistance } from 'geolib';
import KeyboardAwareLayout from '../components/custom/KeyboardAwareLayout';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LottieView from 'lottie-react-native';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL, url } from '@env';
import NetInfo from '@react-native-community/netinfo';
import { openDatabase } from 'react-native-sqlite-storage';
import moment from 'moment';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Dropdown } from 'react-native-element-dropdown';
import Octicons from 'react-native-vector-icons/Octicons';
import { MultipleSelectList } from 'react-native-dropdown-select-list';
import DoctorDetailsModal from './DoctorDetailsModal';
import Snackbar from 'react-native-snackbar';
import Voice from '@react-native-voice/voice';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
//import CustomDCR from '../components/custom/CustomDCR';
import CustomDCRNew from '../components/custom/CustomDCRNew';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import RNFS from 'react-native-fs';
import Pdf from 'react-native-pdf';
import MapView, { Marker, Circle } from 'react-native-maps';

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

const DCRDoctor = ({ navigation }) => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
  });
  const [currentLongitude, setCurrentLongitude] = useState('0.00');
  const [currentLatitude, setCurrentLatitude] = useState('0.00');
  const previousLocation = useRef(null);
  const [allowBackdatedEntry, setAllowBackdatedEntry] = useState(false);
  const [useIDEmployee, setIDEmployee] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [useMobileAccess, setuseMobileAccess] = useState('');
  const [useManagerAccess, setuseManagerAccess] = useState('');
  const [useMvisitWTDataSelected, setMvisitWTDataSelected] = useState('');
  const [useArea, setArea] = useState([]);
  const [usevisitWTDataSelected, setvisitWTDataSelected] = useState('');
  const [usedoctorData, setdoctorData] = useState([]);
  const [sampleData, setsampleData] = useState([]);
  const [giftData, setgiftData] = useState([]);
  const [fStageData, setfStageData] = useState([]);
  const [campData, setcampData] = useState([]);
  const [prodData, setprodData] = useState([]);
  const [useGeofencing, setGeofencing] = useState('');
  const [useDoctorGeofencing, setDoctorGeofencing] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [cdate, setcurrDate] = useState('');
  const [shouldShowDocVisitWithData, setshouldShowDocVisitWithData] =
    useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [selectedMArea, setSelectedMArea] = useState(null);
  const [useAreaLabel, setAreaLabel] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [usevisitWTData, setvisitWTData] = useState([]);
  const [useRemarks, setRemarks] = useState('');
  const [docLabel, setdocLabel] = useState('');
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [docValue, setdocValue] = useState('');
  const [docCode, setDocCode] = useState('');
  const [docName, setDocName] = useState('');
  const [useMArea, setMArea] = useState([]);
  const [deviceType, setDevice] = useState('');
  const [dataProduct, setdataProduct] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [gamesTab, setGamesTab] = useState(1);
  const [sLabel, setSLabel] = useState('');
  const [sValue, setSValue] = useState('');
  const [useQty, setQty] = useState('');
  const [gLabel, setGLabel] = useState('');
  const [useGQty, setGQty] = useState('');
  const [sampleQtyData, setsampleQtyData] = useState([]);
  const [giftQtyData, setgiftQtyDataData] = useState([]);
  const [gValue, setGValue] = useState('');
  const [campaignData, setCampaignData] = useState([]);
  const [cLabel, setCLabel] = useState('');
  const [cValue, setCValue] = useState('');
  const [pLabel, setPLabel] = useState('');
  const [useMAreaLabel, setMAreaLabel] = useState('');
  const [useCRemarks, setCRemarks] = useState('');
  const [pValue, setPValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfVisible, setPdfVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [selectedStages, setSelectedStages] = useState({});
  const [usedataStage, setdataStage] = useState([]);
  const [showGeoFenceModal, setShowGeoFenceModal] = useState(false);
  const [useMvisitWTData, setMvisitWTData] = useState([]);
  const [useMultipleIDEmployee, setMultipleIDEmployee] = useState('');
  const [distanceInfo, setDistanceInfo] = useState({
    distance: 0,
    doctorName: '',
    doctorCode: '',
    doctorLat: '',
    doctorLng: '',
  });

  useEffect(() => {
    LogBox.ignoreLogs([
      'VirtualizedLists should never be nested',
      'Each child in a list should have a unique "key" prop.',
    ]);
    DeviceInfo.getDeviceName().then(name => setDevice(name));
    var currDate = moment().format('D/MMM/YYYY');
    setcurrDate(currDate);
    let watchId;
    getData();
    setshouldShowDocVisitWithData(true);
    const startTracking = async () => {
      const hasPermission = await requestLocationPermission();

      if (!hasPermission) {
        return;
      }

      watchId = Geolocation.watchPosition(
        position => {
          const currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          // First location
          if (!previousLocation.current) {
            previousLocation.current = currentLocation;

            setLocation(currentLocation);
            setCurrentLatitude(currentLocation.latitude.toFixed(6));
            setCurrentLongitude(currentLocation.longitude.toFixed(6));

            return;
          }

          const distance = getDistance(
            previousLocation.current,
            currentLocation,
          );

          console.log('Distance:', distance, 'meters');

          if (position.coords.accuracy <= 20 && distance >= 10) {
            previousLocation.current = currentLocation;

            setLocation(currentLocation);
            setCurrentLatitude(currentLocation.latitude.toFixed(6));
            setCurrentLongitude(currentLocation.longitude.toFixed(6));

            console.log('Location Updated');
          }
        },
        error => {
          console.log(error);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 0, // receive all updates
          interval: 5000,
          fastestInterval: 2000,
          useSignificantChanges: false,
        },
      );
    };

    startTracking();

    return () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const getData = () => {
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          setIDEmployee(user.IDEmployee);
          setEmpEmail(user.Empemail);
          setBusinessID(user.BusinessID);
          setuseManagerAccess(user.ManagerAccess);
          setuseMobileAccess(user.MobileAccess);
          NetInfo.fetch().then(async state => {
            if (state.isConnected) {
              if (user.ManagerAccess === true) {
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
                    console.log(error.message);
                  });
              } else {
                const areaurl =
                  BASE_URL +
                  'Area/EmployeeWiseAreaList?Businessid=' +
                  user.BusinessID +
                  '&IDEmployee=' +
                  user.IDEmployee;
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
                        value: response.data[i].IDArea,
                        label: response.data[i].Name,
                      });
                    }
                    setArea(wtNameArray);
                  })
                  .catch(function (error) {
                    console.log(error.message);
                  });
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
                    console.log(error.message);
                  });

                const docurl =
                  BASE_URL +
                  'Doctor/EmployeeAndAreaWiseDoctorList?Businessid=' +
                  user.BusinessID +
                  '&IDEmployee=' +
                  user.IDEmployee +
                  '&IDArea=0';
                console.log('Doctor List URL:', docurl);
                var config = {
                  method: 'get',
                  url: docurl,
                };
                axios(config)
                  .then(function (response) {
                    var count = Object.keys(response.data).length;
                    let wtNameArray = [];
                    for (var i = 0; i < count; i++) {
                      wtNameArray.push({
                        //value: response.data[i].Value,
                        value: response.data[i].IDDoctor,
                        label: response.data[i].Name,
                        IDDoctor: response.data[i].IDDoctor,
                        Name: response.data[i].Name,
                        Code: response.data[i].Code,
                        Latitude: response.data[i].Latitude,
                        Longitude: response.data[i].Longitude,
                      });
                    }
                    setdoctorData(wtNameArray);
                  })
                  .catch(function (error) {
                    console.log(error.message);
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

              const sampleurl =
                BASE_URL +
                'Product/ProductDivisionSampleGiftList?Businessid=' +
                user.BusinessID +
                '&IDDivision=' +
                user.IDDivision +
                '&Type=DOCTORPRODUCT';
              console.log(sampleurl);
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
                  console.log(error.message);
                });

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
                  console.log(error.message);
                });

              const finalurl =
                BASE_URL +
                'Misc/List?Businessid=' +
                user.BusinessID +
                '&Type=TARGET';
              // console.log(finalurl);
              var config = {
                method: 'get',
                url: finalurl,
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
                  setfStageData(wtNameArray);
                })
                .catch(function (error) {
                  console.log(error.message);
                });

              const campurl =
                BASE_URL +
                'Campaign/EmployeeWiseCampaignList?Businessid=' +
                user.BusinessID +
                '&IDEmployee=' +
                user.IDEmployee;
              //console.log(prdurl);
              var config = {
                method: 'get',
                url: campurl,
              };

              axios(config)
                .then(function (response) {
                  var count = Object.keys(response.data).length;
                  let wtNameArray = [];
                  for (var i = 0; i < count; i++) {
                    wtNameArray.push({
                      //value: response.data[i].Value,
                      value: response.data[i].IDCampaign,
                      label: response.data[i].Campaign,
                    });
                  }
                  setcampData(wtNameArray);
                })
                .catch(function (error) {
                  console.log(error.message);
                });
              const produrl =
                BASE_URL +
                'Campaign/EmployeeWiseCampaignList?Businessid=' +
                user.BusinessID +
                '&IDEmployee=' +
                user.IDEmployee;
              //console.log(prdurl);
              var config = {
                method: 'get',
                url: produrl,
              };

              axios(config)
                .then(function (response) {
                  var count = Object.keys(response.data).length;
                  let wtNameArray = [];
                  for (var i = 0; i < count; i++) {
                    wtNameArray.push({
                      //value: response.data[i].Value,
                      value: response.data[i].IDProduct,
                      label: response.data[i].Product,
                    });
                  }
                  setprodData(wtNameArray);
                })
                .catch(function (error) {
                  console.log(error.message);
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
      console.log(error.message);
    }
  };

  const fetchOfflineTableData = ManagerAccess => {
    if (ManagerAccess === true) {
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
                  //value: results.rows.item(i).Name,
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
            console.error('Error checking data', error);
          },
        );
      });
    } else {
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

      //  db.transaction(tx => {
      //     tx.executeSql(
      //       'SELECT * FROM CRM_DocList WHERE IDArea = ?',
      //       //'SELECT * FROM CRM_EmployeeDoctorList WHERE IDArea = ?',
      //       [IDArea],
      //       (tx, results) => {
      //         const rows = results.rows;
      //         let data = [];
      //         for (let i = 0; i < rows.length; i++) {
      //           //data.push(rows.item(i));
      //           const item = rows.item(i);

      //           data.push({
      //             label: item.Name,
      //             value: item.IDDoctor,
      //             Name: item.Name,
      //             IDDoctor: item.IDDoctor,
      //             Code: item.Code,
      //             Latitude: item.Latitude,
      //             Longitude: item.Longitude,
      //           });
      //         }
      //         console.log('areaWiseDoctorList', data);
      //         setdoctorData(data);
      //       },
      //       error => {
      //         console.log('Query error:', error);
      //       },
      //     );
      //   });

      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM CRM_DocList',
          [],
          (tx, results) => {
            let data = [];

            for (let i = 0; i < results.rows.length; i++) {
              const item = results.rows.item(i);

              data.push({
                label: item.Name,
                value: item.IDDoctor,
                Name: item.Name,
                IDDoctor: item.IDDoctor,
                Code: item.Code,
                Latitude: item.Latitude,
                Longitude: item.Longitude,
              });
            }

            console.log('Doctor List:', data);
            setdoctorData(data);
          },
          error => {
            console.log('Query error:', error);
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
            //console.log('Data is inserted:', temp);
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

    //Retrieve data from CRM_finalStageList
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CRM_finalStageList',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i)
              temp.push({
                value: results.rows.item(i).IDMisc,
                label: results.rows.item(i).Name,
              });
            setfStageData(temp);
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
            //console.log('Data is inserted CRM_SAMPLE:', temp);
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
        'SELECT * FROM CRM_Campaign',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              //temp.push(results.rows.item(i));
              temp.push({
                value: results.rows.item(i).IDCampaign,
                label: results.rows.item(i).Campaign,
              });
            }
            setcampData(temp);
            //console.log('Data is inserted CRM_SAMPLE:', temp);
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
        'SELECT * FROM CRM_CampaignProduct',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              //temp.push(results.rows.item(i));
              temp.push({
                value: results.rows.item(i).IDProduct,
                label: results.rows.item(i).Product,
              });
            }
            setprodData(temp);
            //console.log('Data is inserted CRM_SAMPLE:', temp);
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

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

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

  const areaWiseDoctorList = IDArea => {
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        const docurl =
          BASE_URL +
          'Doctor/EmployeeAndAreaWiseDoctorList?Businessid=' +
          useBusinessID +
          '&IDEmployee=' +
          useIDEmployee +
          '&IDArea=' +
          IDArea;

        console.log('Doctor List URL:', docurl);
        var config = {
          method: 'get',
          url: docurl,
        };
        axios(config)
          .then(function (response) {
            var count = Object.keys(response.data).length;
            let wtNameArray = [];
            for (var i = 0; i < count; i++) {
              wtNameArray.push({
                //value: response.data[i].Value,
                value: response.data[i].IDDoctor,
                label: response.data[i].Name,
                IDDoctor: response.data[i].IDDoctor,
                Name: response.data[i].Name,
                Code: response.data[i].Code,
                Latitude: response.data[i].Latitude,
                Longitude: response.data[i].Longitude,
              });
            }
            setdoctorData(wtNameArray);
          })
          .catch(function (error) {
            console.log(error.message);
          });
      } else {
        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM CRM_DocList WHERE IDArea = ?',
            //'SELECT * FROM CRM_EmployeeDoctorList WHERE IDArea = ?',
            [IDArea],
            (tx, results) => {
              const rows = results.rows;
              let data = [];
              for (let i = 0; i < rows.length; i++) {
                //data.push(rows.item(i));
                const item = rows.item(i);

                data.push({
                  label: item.Name,
                  value: item.IDDoctor,
                  Name: item.Name,
                  IDDoctor: item.IDDoctor,
                  Code: item.Code,
                  Latitude: item.Latitude,
                  Longitude: item.Longitude,
                });
              }
              console.log('areaWiseDoctorList', data);
              setdoctorData(data);
            },
            error => {
              console.log('Query error:', error);
            },
          );
        });
      }
    }, []);
  };

  const onSelectDoctor = item => {
    if (!item) {
        return;
    }

    if (!item.IDDoctor) {
       console.log("Doctor not selected");
        return;
    }

    if (
        location.latitude == null ||
        location.longitude == null
    ) {
        Alert.alert("Please wait for GPS location.");
        return;
    }
    setSelectedDoctor(item);
    setSelectedDoctorId(item.IDDoctor);
    setdocValue(item.IDDoctor);
    setdocLabel(item.Name);
    doctorWiseProductListAPI(item.IDDoctor);
    doctorWiseAreaListAPI(item.IDDoctor);
    setDocCode(item.IDDoctor);
    setDocName(item.Name);

    const lat = Number(item?.Latitude);
    const lon = Number(item?.Longitude);

    const doctorLocation = {
      latitude: lat,
      longitude: lon,
    };
    const hasCoords =
      Number.isFinite(lat) && Number.isFinite(lon) && !(lat === 0 && lon === 0);
    if (useGeofencing === 'YES' && hasCoords) {
      console.log('doctorLocation', doctorLocation);
      console.log('currentlocation', location);
      console.log('useDoctorGeofencing', useDoctorGeofencing);
      const calculatedDistance = getDistance(doctorLocation, location);
      if (calculatedDistance > useDoctorGeofencing) {
        setDistanceInfo({
          distance: calculatedDistance,
          doctorName: item.Name,
          doctorCode: item.IDDoctor,
          doctorLat: item.Latitude,
          doctorLng: item.Longitude,
        });
        setShowGeoFenceModal(true);
        setdoctorData([]); // Clear doctor data when outside geofence
        setSelectedDoctor(null);
        setSelectedDoctorId(null);
        setdocValue(null);
        setdocLabel('');
        setDocCode('');
        setDocName('');
        return;
      }
      else {
        setShowGeoFenceModal(true);
      }
    }
  };

  const doctorWiseProductListAPI = docID => {
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        const returl =
          BASE_URL +
          'Doctor/ManagerDCRDoctorProductMappingOfflineList?Businessid=' +
          useBusinessID +
          '&IDDoctor=' +
          docID;

        let result = await fetch(returl);
        result = await result.json();
        console.log(returl);
        setdataProduct(result.d);
      } else {
        if (useManagerAccess === true) {
          //Retrieve data from ManagerEmployeeWiseDoctorList
          db.transaction(tx => {
            tx.executeSql(
              'SELECT * FROM CRM_ManagerDoctorProductMappingOfflineList where IDDoctor=?',
              [docID],
              (tx, results) => {
                if (results.rows.length > 0) {
                  var temp = [];
                  for (let i = 0; i < results.rows.length; ++i)
                    temp.push(results.rows.item(i));
                  setdataProduct(temp);
                  console.log(temp);
                } else {
                  Snackbar.show({
                    text: 'No Products Found',
                    duration: Snackbar.LENGTH_LONG,
                    action: {
                      text: 'UNDO',
                      textColor: 'red',
                      onPress: () => {
                        console.log('Undo pressed');
                      },
                    },
                  });
                }
              },
              (tx, error) => {
                console.error('Error checking data', error);
              },
            );
          });
        } else {
          console.log('docID', docID);
          //Retrieve data from CRM_DoctorProductMappingListt
          db.transaction(tx => {
            tx.executeSql(
              'SELECT * FROM CRM_DoctorProductMappingListt where IDDoctor=?',
              [docID],
              (tx, results) => {
                if (results.rows.length > 0) {
                  var temp = [];
                  for (let i = 0; i < results.rows.length; ++i)
                    temp.push(results.rows.item(i));
                  setdataProduct(temp);
                  console.log(temp);
                } else {
                  Snackbar.show({
                    text: 'No Products Found',
                    duration: Snackbar.LENGTH_LONG,
                    action: {
                      text: 'UNDO',
                      textColor: 'red',
                      onPress: () => {
                        console.log('Undo pressed');
                      },
                    },
                  });
                }
              },
              (tx, error) => {
                console.error('Error checking data', error);
              },
            );
          });
        }
      }
    }, []);
  };

  const doctorWiseAreaListAPI = docID => {
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        if (useManagerAccess === true) {
          // const areaurl =
          //   BASE_URL +
          //   'Area/EmployeeAndDoctorWiseAreaList?Businessid=' +
          //   useBusinessID +
          //   '&IDEmployee=' +
          //   useMultipleIDEmployee +
          //   '&IDDoctor=' +
          //   docID;
          // console.log('returl ' + areaurl);
          // var config = {
          //   method: 'get',
          //   url: areaurl,
          // };
          // axios(config)
          //   .then(function (response) {
          //     var count = Object.keys(response.data).length;
          //     let wtNameArray = [];
          //     for (var i = 0; i < count; i++) {
          //       wtNameArray.push({
          //         //value: response.data[i].Value,
          //         value: response.data[i].IDArea,
          //         label: response.data[i].Area,
          //       });
          //     }
          //     setMArea(wtNameArray);
          //   })
          //   .catch(function (error) {
          //     console.log(error.message);
          //     if (error.response) {
          //       // Server responded with a status other than 2xx
          //       console.log('Error Status:', error.response.status);
          //       console.log('Error Data:', error.response.data);
          //       if (error.response.status === 400) {
          //         // Handle validation errors
          //         const errors = error.response.data.errors;
          //         if (errors) {
          //           Object.keys(errors).forEach(key => {
          //             console.log(`${key}: ${errors[key].join(', ')}`);
          //           });
          //         }
          //       }
          //     } else if (error.request) {
          //       // No response received from server
          //       console.log('No response received:', error.request);
          //     } else {
          //       // Other errors
          //       console.log('Error:', error.message);
          //     }
          //   });
        } else {
          const areaurl =
            BASE_URL +
            'Area/EmployeeAndDoctorWiseAreaList?Businessid=' +
            useBusinessID +
            '&IDEmployee=' +
            useIDEmployee +
            '&IDDoctor=' +
            docID;
          console.log('returl ' + areaurl);
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
                  label: response.data[i].Area,
                });
              }
              //console.log(wtNameArray);

              setArea(wtNameArray);
            })
            .catch(function (error) {
              console.log(error.message);
              console.log(error.response);
            });
        }
      } else {
        if (useManagerAccess === true) {
          //Retrieve data from ManagerEmployeeWiseDoctorList
          db.transaction(tx => {
            tx.executeSql(
              'SELECT * FROM CRM_ManagerDoctorProductMappingOfflineList where IDDoctor=?',
              [docID],
              (tx, results) => {
                if (results.rows.length > 0) {
                  var temp = [];
                  for (let i = 0; i < results.rows.length; ++i)
                    temp.push(results.rows.item(i));
                  setdataProduct(temp);
                  console.log(temp);
                } else {
                  //Alert.alert('No Products Found');
                  //setSelectedMAreaData('No data found');
                  Snackbar.show({
                    text: 'No Products Found',
                    duration: Snackbar.LENGTH_LONG,
                    action: {
                      text: 'UNDO',
                      textColor: 'red',
                      onPress: () => {
                        console.log('Undo pressed');
                      },
                    },
                  });
                }
              },
              (tx, error) => {
                console.error('Error checking data', error);
              },
            );
          });
        } else {
          console.log('docID', docID);
          //Retrieve data from CRM_DoctorProductMappingListt
          db.transaction(tx => {
            tx.executeSql(
              'SELECT * FROM CRM_DoctorProductMappingListt where IDDoctor=?',
              [docID],
              (tx, results) => {
                if (results.rows.length > 0) {
                  var temp = [];
                  for (let i = 0; i < results.rows.length; ++i)
                    temp.push(results.rows.item(i));
                  setdataProduct(temp);
                  console.log(temp);
                } else {
                  //Alert.alert('No Products Found');
                  //setSelectedMAreaData('No data found');
                  Snackbar.show({
                    text: 'No Products Found',
                    duration: Snackbar.LENGTH_LONG,
                    action: {
                      text: 'UNDO',
                      textColor: 'red',
                      onPress: () => {
                        console.log('Undo pressed');
                      },
                    },
                  });
                }
              },
              (tx, error) => {
                console.error('Error checking data', error);
              },
            );
          });
        }
      }
    }, []);
  };

  const onSelectSwitch = value => {
    setGamesTab(value);
  };
  const transliterate = async banglaText => {
    try {
      const res = await fetch(
        `https://inputtools.google.com/request?itc=bn-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&q=${encodeURIComponent(
          banglaText,
        )}`,
      );
      const data = await res.json();
      if (data[0] === 'SUCCESS') {
        return data[1][0][1][0]; // transliterated text
      }
    } catch (e) {
      console.error('Transliteration error:', e);
    }
    return banglaText; // fallback
  };
  // Voice processing
  useEffect(() => {
    Voice.onSpeechResults = async event => {
      if (event.value && event.value.length > 0) {
        const bengaliText = event.value[0]; // speech result in Bangla
        const englishText = await transliterate(bengaliText); // 🔹 API call
        setRemarks(prev => prev + ' ' + englishText);
      }
    };

    Voice.onSpeechEnd = () => {
      setIsListening(false);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    try {
      await Voice.start('bn-IN'); // capture Bangla speech
      setIsListening(true);
    } catch (e) {
      console.error('Error starting voice', e);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.error('Error stopping voice', e);
    }
  };
  //end of code for voice processing

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

  const handleDoctorDetailModal = () => {
    if (docLabel === '') {
      Alert.alert('Select Doctor');
    } else {
      setDetailsModalVisible(true);
    }
  };

  const handleDoctorModalClose = () => {
    setDetailsModalVisible(false);
  };

  const addSample = () => {
    if (sLabel.length === 0) {
      Alert.alert('Select Sample');
    } else if (useQty === '') {
      Alert.alert('Type Quantity');
    } else {
      setsampleQtyData([
        ...sampleQtyData,
        //{key: Math.random().toString(), value: `${sLabel} ${useQty}`},
        { key: useQty, label: sLabel, value: sValue },
      ]);

      // Clear the inputs
      setQty('');
      setSValue('');
    }
  };

  const addGift = () => {
    if (gLabel.length === 0) {
      Alert.alert('Select Gift');
    } else if (useGQty === '') {
      Alert.alert('Type Quantity');
    } else {
      setgiftQtyDataData([
        ...giftQtyData,
        //{key: Math.random().toString(), value: `${sLabel} ${useQty}`},
        { key: useGQty, label: gLabel, value: gValue },
      ]);

      // Clear the inputs
      setGQty('');
      setGValue('');
    }
  };
  const addCampaign = () => {
    if (cLabel.length === 0) {
      Alert.alert('Select Campaign');
    } else if (pLabel.length === 0) {
      Alert.alert('Select Product');
    } else if (useCRemarks === '') {
      Alert.alert('Type Remarks');
    } else {
      setCampaignData([
        ...campaignData,
        //{key: Math.random().toString(), value: `${sLabel} ${useQty}`},
        {
          key: useCRemarks,
          idCampaign: cValue,
          campaignName: cLabel,
          idProduct: pValue,
          productName: pLabel,
        },
      ]);

      // Clear the inputs
      setCRemarks('');
      setCValue('');
      se;
    }
  };

  const onDeleteSample = id => {
    const newData = [...sampleQtyData]; // Create a copy of the data array
    newData.splice(id, 1); // Remove the item at the given index
    setsampleQtyData(newData); // Update state
  };
  const onDeleteGift = id => {
    console.log(id);
    const newData = [...giftQtyData]; // Create a copy of the data array
    newData.splice(id, 1); // Remove the item at the given index
    setgiftQtyDataData(newData);
  };

  const onDeleteCampaign = id => {
    console.log(id);
    const newData = [...campaignData]; // Create a copy of the data array
    newData.splice(id, 1); // Remove the item at the given index
    setCampaignData(newData);
  };

  const rendervisualaids = ({ item }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={style.vaCard}
        onPress={() => item.FilePath && openPDF(item.FilePath)}>
        {/* LEFT: Product Info */}
        <View style={style.vaLeft}>
          <Text style={style.vaProduct}>{item.ProductName}</Text>

          <View style={style.vaStagePill}>
            <Text style={style.vaStageText}>{item.StageName}</Text>
          </View>
        </View>

        {/* RIGHT: PDF Action */}
        {item.FilePath && (
          <View style={style.vaRight}>
            <View style={style.pdfCircle}>
              <FontAwesome name="file-pdf-o" size={22} color="#E53935" />
            </View>
            <Text style={style.pdfLabel}>View PDF</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderProductItem = ({ item }) => {
    return (
      <View style={[style.cardContainer]}>
        {/* Product Name */}
        <Text style={style.productName}>{item.ProductName}</Text>

        {/* Stage Row */}
        <View style={style.row}>
          {/* Static Stage Label */}
          <View style={style.stageBox}>
            <Text style={style.stageText}>{item.StageName}</Text>
          </View>

          {/* Dropdown */}
          <Dropdown
            style={style.dropdownStageNew}
            placeholderStyle={style.placeholderStyleStage}
            selectedTextStyle={style.selectedTextStyleStage}
            data={fStageData}
            mode="modal"
            search
            maxHeight={250}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? item.StageName : '...'}
            value={selectedStages[item.IDProduct]?.IDMisc ?? null}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={e => {
              const updated = {
                ...selectedStages,
                [item.IDProduct]: {
                  IDMisc: e.value,
                  IDStage: item.IDStage,
                },
              };

              setSelectedStages(updated);

              const formatted = Object.entries(updated).map(
                ([IDProduct, values]) => ({
                  IDProduct: parseInt(IDProduct, 10),
                  IDMisc: values.IDMisc,
                  IDStage: values.IDStage,
                }),
              );

              setdataStage(formatted);
              setIsFocus(false);
            }}
          />
        </View>
      </View>
    );
  };

  const openPDF = async filePath => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      setLoading(true);
      setPdfVisible(true);

      const fullUrl = encodeURI(url + filePath);
      const fileName = filePath.split('/').pop();
      const localPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      const fileExists = await RNFS.exists(localPath);

      if (fileExists) {
        // ✅ Already downloaded — just open it
        setPdfUrl(localPath);
      } else {
        // ⬇️ Download only once
        const download = RNFS.downloadFile({
          fromUrl: fullUrl,
          toFile: localPath,
        });

        await download.promise;
        setPdfUrl(localPath);
      }

      setLoading(false);
      setIsProcessing(false);
    } catch (error) {
      setLoading(false);
      setIsProcessing(false);
      console.log('PDF error:', error);
    }
  };

  const formatDistance = distance => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(2)} km`;
    }
    return `${distance} meters`;
  };

  const getDoctorList = () => {
    //setModalVisible(false);
    //Alert.alert('Selected Area', selectedMArea);
    const areaId =
      selectedMArea === null ||
        selectedMArea === undefined ||
        selectedMArea === '' ||
        selectedMArea === 'null'
        ? 0
        : selectedMArea;
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        if (useManagerAccess === true) {
          const docurl =
            BASE_URL +
            'manager/DCR/MultipleEmployeeAndAreaWiseDoctorList?Businessid=' +
            useBusinessID +
            '&Employees=' +
            useMultipleIDEmployee +
            '&IDArea=' +
            areaId;
          console.log('Doctor List URL:', docurl);
          var config = {
            method: 'get',
            url: docurl,
          };
          axios(config)
            .then(function (response) {
              var count = Object.keys(response.data).length;
              let wtNameArray = [];
              for (var i = 0; i < count; i++) {
                wtNameArray.push({
                  //value: response.data[i].Value,
                  value: response.data[i].IDDoctor,
                  label: response.data[i].Name,
                  IDDoctor: response.data[i].IDDoctor,
                  Name: response.data[i].Name,
                  //Code: response.data[i].Code,
                  Latitude: response.data[i].Latitude,
                  Longitude: response.data[i].Longitude,
                });
              }
              setdoctorData(wtNameArray);
            })
            .catch(function (error) {
              console.log(error.message);
            });
        } else {
          const docurl =
            BASE_URL +
            'Doctor/EmployeeAndAreaWiseDoctorList?Businessid=' +
            useBusinessID +
            '&IDEmployee=' +
            useIDEmployee +
            '&IDArea=' +
            areaId;

          console.log('Doctor List URL getDoctorList:', docurl);
          var config = {
            method: 'get',
            url: docurl,
          };
          axios(config)
            .then(function (response) {
              var count = Object.keys(response.data).length;
              let wtNameArray = [];
              for (var i = 0; i < count; i++) {
                wtNameArray.push({
                  //value: response.data[i].Value,
                  value: response.data[i].IDDoctor,
                  label: response.data[i].Name,
                  IDDoctor: response.data[i].IDDoctor,
                  Name: response.data[i].Name,
                  Code: response.data[i].Code,
                  Latitude: response.data[i].Latitude,
                  Longitude: response.data[i].Longitude,
                });
              }
              setdoctorData(wtNameArray);
            })
            .catch(function (error) {
              console.log(error.message);
            });
        }
      } else {
        if (useManagerAccess === true) {
          const query =
            'SELECT * FROM CRM_offlineManagerDoctorList WHERE IDArea=?';
          //const params = [IDArea];
          const params = [selectedMArea];
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
                      //value: results.rows.item(i).IDDoctor,
                      // IDDoctor: results.rows.item(i).IDDoctor,
                      // Name: results.rows.item(i).Name,

                      value: results.rows.item(i).IDDoctor,
                      label: results.rows.item(i).Name,
                      IDDoctor: results.rows.item(i).IDDoctor,
                      Name: results.rows.item(i).Name,
                      //Code: response.data[i].Code,
                      Latitude: results.rows.item(i).Latitude,
                      Longitude: results.rows.item(i).Longitude,
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
        } else {
          db.transaction(tx => {
            tx.executeSql(
              'SELECT * FROM CRM_DocList WHERE IDArea = ?',
              //'SELECT * FROM CRM_EmployeeDoctorList WHERE IDArea = ?',
              [selectedMArea],
              (tx, results) => {
                const rows = results.rows;
                let data = [];
                for (let i = 0; i < rows.length; i++) {
                  //data.push(rows.item(i));
                  const item = rows.item(i);

                  data.push({
                    label: item.Name,
                    value: item.IDDoctor,
                    Name: item.Name,
                    IDDoctor: item.IDDoctor,
                    Code: item.Code,
                    Latitude: item.Latitude,
                    Longitude: item.Longitude,
                  });
                }
                console.log(data);
                setdoctorData(data);
              },
              error => {
                console.log('Query error:', error);
              },
            );
          });
        }
      }
    }, []);
  };

  const multiSelectVisitWith = () => {
    let mvwt = useMvisitWTData;
    let mvwtList = mvwt.toString();
    console.log(mvwt);
    console.log(mvwtList);
    setMultipleIDEmployee(mvwtList);
    managerAreaList(mvwtList);
  };

  const managerAreaList = empLoyee => {
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        const areaurl =
          BASE_URL +
          'manager/DCR/MultipleEmployeeWiseAreaList?Businessid=' +
          useBusinessID +
          '&Employees=' +
          empLoyee;

        console.log('Manager Area List URL:', areaurl);

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
            console.log(error.message);
          });
      } else {
        console.log('empLoyee', empLoyee);
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
                    //label: results.rows.item(i).AreaName,
                    label: results.rows.item(i).Name,
                  });
                }
                setMArea(temp);
                console.log('Data is inserted:', temp);
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
    }, []);
  };

  const areaWiseMDoctorList = IDArea => {
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        const docurl =
          BASE_URL +
          'manager/DCR/MultipleEmployeeAndAreaWiseDoctorList?Businessid=' +
          useBusinessID +
          '&Employees=' +
          useMultipleIDEmployee +
          '&IDArea=' +
          IDArea;

        console.log('Doctor List URL:', docurl);
        var config = {
          method: 'get',
          url: docurl,
        };
        axios(config)
          .then(function (response) {
            var count = Object.keys(response.data).length;
            let wtNameArray = [];
            for (var i = 0; i < count; i++) {
              wtNameArray.push({
                //value: response.data[i].Value,
                value: response.data[i].IDDoctor,
                label: response.data[i].Name,
                IDDoctor: response.data[i].IDDoctor,
                Name: response.data[i].Name,
                //Code: response.data[i].Code,
                Latitude: response.data[i].Latitude,
                Longitude: response.data[i].Longitude,
              });
            }
            setdoctorData(wtNameArray);
          })
          .catch(function (error) {
            console.log(error.message);
          });
      } else {
        const query =
          'SELECT * FROM CRM_offlineManagerDoctorList WHERE IDArea=?';
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
                    //value: results.rows.item(i).IDDoctor,
                    // IDDoctor: results.rows.item(i).IDDoctor,
                    // Name: results.rows.item(i).Name,
                    value: results.rows.item(i).IDDoctor,
                    label: results.rows.item(i).Name,
                    IDDoctor: results.rows.item(i).IDDoctor,
                    Name: results.rows.item(i).Name,
                    //Code: response.data[i].Code,
                    Latitude: results.rows.item(i).Latitude,
                    Longitude: results.rows.item(i).Longitude,
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

  const submit = () => {
    if (useManagerAccess === true) {
      if (useMvisitWTData.length === 0) {
        Alert.alert('Select Visit With');
      } else if (docLabel === '') {
        Alert.alert('Select Doctor');
      } else if (useRemarks === '') {
        Alert.alert('Type Remarks');
      } else {
        save();
      }
    } else {
      if (docLabel === '') {
        Alert.alert('Select Doctor');
      } else if (usevisitWTData.length === 0) {
        Alert.alert('Select Visit With');
      } else if (
        useBusinessID !== 'INICIO-LAB-682' &&
        sampleQtyData.length === 0
      ) {
        Alert.alert('Select Sample & Qty');
      } else if (useRemarks === '') {
        Alert.alert('Type Remarks');
      } else {
        save();
      }
    }
  };
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
        { cancelable: false },
      );
    } else {
      if (useMobileAccess === 'ONLINE') {
        NetInfo.fetch().then(state => {
          if (state.isConnected) {
            try {
              AsyncStorage.getItem('IDday').then(value => {
                if (value != null) {
                  let IDday = JSON.parse(value);
                  EndDocDcr(IDday);
                }
              });
            } catch (error) {
              console.log(error.message);
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
                  EndDocDcr(IDday);
                }
              });
            } catch (error) {
              console.log(error.message);
            }
          } else {
            var date = moment()
              .utcOffset('+05:30')
              .format('YYYY-MM-DD hh:mm:ss A');
            console.warn(date);
            if (useManagerAccess === true) {
              let Mvisitwith = [];
              let GProdID = [];
              let GfStatus = [];
              let ProdID = [];
              let curstageID = [];
              let fStatus = [];
              let SProdID = [];
              let SfStatus = [];
              let idCampaign = [];
              let idProduct = [];
              let idRemarks = [];

              useMvisitWTData.map(function (value) {
                Mvisitwith.push(value);
              });

              // console.log('value.IDEmployee', value.IDEmployee);
              // console.log('value', value);
              if (campaignData.length === 0) {
                idCampaign = [];
                idProduct = [];
                idRemarks = [];
              } else {
                campaignData.map(function (value) {
                  idCampaign.push(value.idCampaign);
                  idProduct.push(value.idProduct);
                  idRemarks.push(value.key);
                });
              }
              //console.log(Mvisitwith);
              if (sampleQtyData.length === 0) {
                SProdID = [];
                SfStatus = [];
              } else {
                sampleQtyData.map(function (value) {
                  SfStatus.push(value.value);
                  SProdID.push(value.key);
                });
              }

              if (giftQtyData.length === 0) {
                GProdID = [];
                GfStatus = [];
              } else {
                giftQtyData.map(function (value) {
                  GfStatus.push(value.value);
                  GProdID.push(value.key);
                });
              }

              usedataStage.map(function (value) {
                //curstageID.push({IDStage: value.IDStage});
                curstageID.push(value.IDStage);
              });
              usedataStage.map(function (value) {
                //ProdID.push({IDProduct: value.IDProduct});
                ProdID.push(value.IDProduct);
              });

              usedataStage.map(function (valueMisc) {
                //fStatus.push({IDMisc: valueMisc.IDMisc});
                fStatus.push(valueMisc.IDMisc);
              });
              const data_api = {
                dcrDate: cdate,
                businessID: useBusinessID,
                dcrType: 'DOCTOR',
                //deviceType: DeviceInfo.getModel(),
                deviceType: 'OFFLINE_' + deviceType,
                //dcrDateTime: currTime,
                dcrDateTime: date,
                userLat: currentLatitude,
                userLong: currentLongitude,
                //idCustomer: docCode,
                idCustomer: docValue,
                idDoctor: docLabel,
                idEmployee: useIDEmployee,
                idWorktype: 57,
                giftsProducts: GfStatus,
                giftsQty: GProdID,
                UNListed: false,
                productsCurrentStatus: curstageID,
                productsFinalStatus: fStatus,
                products: ProdID,
                samplesProduct: SfStatus,
                samplesProductQty: SProdID,
                visitWiths: Mvisitwith,
                //visitWiths: [{IDEmployee: useMvisitWTData}],
                entryUser: empEmail,
                Remarks: useRemarks,
                IDCampaign: idCampaign,
                IDProduct: idProduct,
                Remarkss: idRemarks,
              };

              console.log('data_apiManager', data_api);
              console.warn('data_apiManager', data_api);
              db.transaction(tx => {
                tx.executeSql(
                  'CREATE TABLE IF NOT EXISTS CRM_ManagerDoctorDataSave (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT);',
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
                  'INSERT INTO CRM_ManagerDoctorDataSave (data) VALUES (?);',
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
                      { cancelable: false },
                    );
                    //navigation.navigate('AppNavDCRScreen');
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
                  'CREATE TABLE IF NOT EXISTS CRM_ManagerOfflineViewDocDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,Area VARCHAR,CustomerType VARCHAR)',
                  [],
                );
              });

              let sql =
                'INSERT INTO CRM_ManagerOfflineViewDocDCR(Customer,Code,DCRDate,Area,CustomerType) VALUES (?,?,?,?,?)';
              let params = [docLabel, docValue, cdate, useMAreaLabel, '']; //storing user data in an array
              db.executeSql(sql, params);
              //}
            } else {
              let Mvisitwith = [];
              let GProdID = [];
              let GfStatus = [];
              let ProdID = [];
              let curstageID = [];
              let fStatus = [];
              let SProdID = [];
              let SfStatus = [];
              let idCampaign = [];
              let idProduct = [];
              let idRemarks = [];

              usevisitWTData.map(function (value) {
                //Mvisitwith.push({IDEmployee: value});
                Mvisitwith.push(value);
              });
              if (sampleQtyData.length === 0) {
                SProdID = [];
                SfStatus = [];
              } else {
                sampleQtyData.map(function (value) {
                  SfStatus.push(value.value);
                  SProdID.push(value.key);
                });
              }

              if (giftQtyData.length === 0) {
                GProdID = [];
                GfStatus = [];
              } else {
                giftQtyData.map(function (value) {
                  // GfStatus.push(value.IDProduct);
                  // GProdID.push(value.Qty);
                  GfStatus.push(value.value);
                  GProdID.push(value.key);
                });
              }

              if (campaignData.length === 0) {
                idCampaign = [];
                idProduct = [];
                idRemarks = [];
              } else {
                campaignData.map(function (value) {
                  idCampaign.push(value.idCampaign);
                  idProduct.push(value.idProduct);
                  idRemarks.push(value.key);
                });
              }
              usedataStage.map(function (value) {
                //curstageID.push({ IDStage: value.IDStage });
                curstageID.push(value.IDStage);
              });
              usedataStage.map(function (value) {
                //ProdID.push({ IDProduct: value.IDProduct });
                ProdID.push(value.IDProduct);
              });

              usedataStage.map(function (valueMisc) {
                //fStatus.push({ IDMisc: valueMisc.IDMisc });
                fStatus.push(valueMisc.IDMisc);
              });
              const data_api = {
                dcrDate: cdate,
                businessID: useBusinessID,
                dcrType: 'DOCTOR',
                //deviceType: DeviceInfo.getModel(),
                deviceType: 'OFFLINE_' + deviceType,
                //dcrDateTime: currTime,
                dcrDateTime: date,
                userLat: currentLatitude,
                userLong: currentLongitude,
                //idCustomer: docCode,
                idCustomer: docValue,
                idDoctor: docLabel,

                idEmployee: useIDEmployee,
                idWorktype: 57,
                giftsProducts: GfStatus,
                giftsQty: GProdID,
                UNListed: false,
                productsCurrentStatus: curstageID,
                productsFinalStatus: fStatus,
                products: ProdID,
                samplesProduct: SfStatus,
                samplesProductQty: SProdID,
                visitWiths: Mvisitwith,
                entryUser: empEmail,
                Remarks: useRemarks,
                IDCampaign: idCampaign,
                IDProduct: idProduct,
                Remarkss: idRemarks,
              };

              console.log(data_api);
              db.transaction(tx => {
                tx.executeSql(
                  'CREATE TABLE IF NOT EXISTS CRM_DoctorDataSave (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT);',
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
                  'INSERT INTO CRM_DoctorDataSave (data) VALUES (?);',
                  [JSON.stringify(data_api)],
                  (_, result) => {
                    // console.log('Data inserted successfully:', result);
                    console.warn('Data inserted successfully:', result);
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
                      { cancelable: false },
                    );
                    //navigation.navigate('AppNavDCRScreen');
                    db.transaction(txn => {
                      txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
                      txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
                    });
                  },
                  (_, error) => {
                    console.log('Error inserting data:', error);
                    console.warn('Error inserting data:', error);
                    db.transaction(txn => {
                      txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
                      txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
                    });
                  },
                );
              });
              //}

              db.transaction(txn => {
                txn.executeSql(
                  'CREATE TABLE IF NOT EXISTS CRM_OfflineViewDocDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,Area VARCHAR,CustomerType VARCHAR)',
                  [],
                );
              });

              let sql =
                'INSERT INTO CRM_OfflineViewDocDCR(Customer,Code,DCRDate,Area,CustomerType) VALUES (?,?,?,?,?)';
              let params = [docLabel, docValue, cdate, useAreaLabel, '']; //storing user data in an array
              db.executeSql(sql, params);
            }
          }
        }, []);
      } else {
        Alert.alert('Contact With Administrator!');
      }
    }
  };

  const EndDocDcr = async IDday => {
    var date = moment().utcOffset('+05:30').format('YYYY-MM-DD hh:mm:ss A');
    console.warn(date);
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
        { cancelable: false },
      );
    } else {
      if (useManagerAccess === true) {
        let samples = [];
        let gifts = [];
        let status = [];
        let Mvisitwith = [];
        let ProdID = [];
        let curstageID = [];
        let fStatus = [];
        let campaign = [];

        useMvisitWTData.map(function (value) {
          Mvisitwith.push({ IDEmployee: value });
        });

        if (sampleQtyData.length === 0) {
          samples = [];
        } else {
          sampleQtyData.map(function (value) {
            samples.push({
              IDProduct: value.value,
              Qty: value.key,
            });
          });
        }
        if (giftQtyData.length === 0) {
          gifts = [];
        } else {
          giftQtyData.map(function (value) {
            gifts.push({
              IDProduct: value.value,
              Qty: value.key,
            });
          });
        }

        if (campaignData.length === 0) {
          campaign = [];
        } else {
          campaignData.map(function (value) {
            campaign.push({
              IDCampaign: value.idCampaign,
              IDProduct: value.idProduct,
              Remarks: value.key,
            });
          });
        }

        usedataStage.map(function (value) {
          curstageID.push({ IDStage: value.IDStage });
        });
        usedataStage.map(function (value) {
          ProdID.push({ IDProduct: value.IDProduct });
        });

        usedataStage.map(function (valueMisc) {
          fStatus.push({ IDMisc: valueMisc.IDMisc });
        });

        var countProdID = Object.keys(ProdID).length;
        var countProdID = Object.keys(curstageID).length;
        var countProdID = Object.keys(fStatus).length;

        for (var i = 0; i < countProdID; i++) {
          status.push({
            IDProduct: ProdID[i].IDProduct,
            IDCurrentStatus: curstageID[i].IDStage,
            IDFinalStatus: fStatus[i].IDMisc,
            OrderQty: 0,
            FreeQty: 0,
          });
        }

        const data_api = {
          IDDCR: 0,
          IDDay: IDday,
          DCRDate: cdate,
          DCRType: 'DOCTOR',
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
          Visitwiths: Mvisitwith,
          //Visitwiths: [{IDEmployee: useMvisitWTData}],
          Campaign: campaign,
        };
        console.log(data_api);
        let result = await fetch(BASE_URL + 'manager/DCR/Mobile/SaveNew', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data_api),
        });
        result = await result.json();
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
            { cancelable: false },
          );
        } else {
          db.transaction(txn => {
            txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
            txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
          });
          Alert.alert(result.result, `${result.result}`);
        }
      } else {
        let samples = [];
        let gifts = [];
        let campaign = [];
        let status = [];
        let Mvisitwith = [];
        let ProdID = [];
        let curstageID = [];
        let fStatus = [];

        usevisitWTData.map(function (value) {
          Mvisitwith.push({ IDEmployee: value });
        });

        if (sampleQtyData.length === 0) {
          samples = [];
        } else {
          sampleQtyData.map(function (value) {
            samples.push({
              // IDProduct: value.IDProduct,
              // Qty: value.Qty,
              IDProduct: value.value,
              Qty: value.key,
            });
          });
        }
        if (giftQtyData.length === 0) {
          gifts = [];
        } else {
          giftQtyData.map(function (value) {
            gifts.push({
              IDProduct: value.value,
              Qty: value.key,
            });
          });
        }
        if (campaignData.length === 0) {
          campaign = [];
        } else {
          campaignData.map(function (value) {
            campaign.push({
              IDCampaign: value.idCampaign,
              IDProduct: value.idProduct,
              Remarks: value.key,
            });
          });
        }

        usedataStage.map(function (value) {
          curstageID.push({ IDStage: value.IDStage });
        });
        usedataStage.map(function (value) {
          ProdID.push({ IDProduct: value.IDProduct });
        });

        usedataStage.map(function (valueMisc) {
          fStatus.push({ IDMisc: valueMisc.IDMisc });
        });

        var countProdID = Object.keys(ProdID).length;
        var countProdID = Object.keys(curstageID).length;
        var countProdID = Object.keys(fStatus).length;

        for (var i = 0; i < countProdID; i++) {
          status.push({
            IDProduct: ProdID[i].IDProduct,
            IDCurrentStatus: curstageID[i].IDStage,
            IDFinalStatus: fStatus[i].IDMisc,
            OrderQty: 0,
            FreeQty: 0,
          });
        }
        const data_api = {
          IDDCR: 0,
          IDDay: IDday,
          DCRDate: cdate,
          DCRType: 'DOCTOR',
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
          Campaign: campaign,
        };
        console.log('User', data_api);
        let result = await fetch(BASE_URL + 'DCR/Mobile/SaveNew', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data_api),
        });

        result = await result.json();
        console.log(result);
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
            { cancelable: false },
          );
        } else {
          db.transaction(txn => {
            txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
            txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
          });
          //Alert.alert('Else : ' + result.result);
          //Alert.alert('Error Alert', `${result.result}`);
          Alert.alert(result.result, `${result.result}`);
        }
      }
    }
  };

  return (
    <KeyboardAwareLayout>
      <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />
      <View
        style={{
          backgroundColor: '#ecf0f1',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 10,
          borderWidth: 0.5,
          margin: 10,
          elevation: 2,
          borderRadius: 8,
        }}>
        {/* Left Side - Location */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
          }}>
          <Ionicons
            name="location-outline"
            size={40}
            color="#005696"
            style={{ marginRight: 12 }}
          />

          <View>
            <Text style={{ fontSize: 16, paddingVertical: 2 }}>
              Lat : {currentLatitude}
            </Text>

            <Text style={{ fontSize: 16, paddingVertical: 2 }}>
              Long : {currentLongitude}
            </Text>
          </View>
        </View>

        {/* Right Side - End DCR Button */}
        <TouchableOpacity
          onPress={() => submit()}
          style={{
            backgroundColor: '#E53935',
            paddingHorizontal: 15,
            paddingVertical: 10,
            borderRadius: 8,
            elevation: 3,
            flexDirection: 'row',
          }}>
          <Text
            style={{
              color: '#fff',
              fontSize: 14,
              fontWeight: 'bold',
            }}>
            End DCR
          </Text>
          <View
            style={{
              marginLeft: 2,
              paddingLeft: 2,
            }}>
            <AntDesign name="arrowright" size={20} color="white" />
          </View>
        </TouchableOpacity>
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
              <View style={{ marginBottom: 5, paddingBottom: 5 }}>
                <MultipleSelectList
                  setSelected={val => setMvisitWTData(val)}
                  data={useMvisitWTDataSelected}
                  placeholder="Select Visit With"
                  label="Visit With"
                  save="key"
                  onSelect={() => multiSelectVisitWith()}
                  fontFamily="Roboto-Bold"
                  notFoundText="No Data Exists"
                  badgeStyles={{ backgroundColor: 'green' }}
                  labelStyles={{ fontWeight: '800', color: 'black' }}
                />
              </View>
              <View style={{ marginBottom: 5, paddingBottom: 5 }}>
                <Dropdown
                  style={[style.dropdown, isFocus && { borderColor: 'blue' }]}
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
                  value={selectedMArea}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    setSelectedMArea(item.value);
                    setMAreaLabel(item.label);
                    setIsFocus(false);
                    areaWiseMDoctorList(item.value);
                  }}
                />
              </View>
              <View
                style={{
                  marginBottom: 5,
                  paddingBottom: 5,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Dropdown
                  style={[style.dropdown1, isFocus && { borderColor: 'blue' }]}
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
                  placeholder={!isFocus ? 'Select Doctor' : '...'}
                  searchPlaceholder="Search..."
                  value={selectedDoctorId}
                  //onFocus={() => setIsFocus(true)}
                  onFocus={() => {
                    setIsFocus(true);
                    if (usedoctorData.length === 0) {
                      getDoctorList();
                    }
                  }}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    onSelectDoctor(item);
                  }}
                />
                <TouchableOpacity
                  onPress={handleDoctorDetailModal}
                  style={{
                    marginLeft: 10,
                    padding: 5,
                  }}>
                  <Octicons name="info" size={24} color="#2142f9" />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  marginBottom: 5,
                  marginTop: 5,
                  paddingBottom: 5,
                  flexDirection: 'row', // ⬅️ row layout
                  alignItems: 'center',
                }}>
                {/* Remarks Input */}
                <TextInput
                  //mode="outlined"
                  //autoCapitalize="none"
                  autoCorrect={false}
                  style={style.remarkstextInput}
                  placeholder="Remarks"
                  placeholderTextColor="#555"
                  value={useRemarks}
                  onChangeText={text => setRemarks(text)}
                  multiline={true}
                  numberOfLines={3}
                />

                {/* Mic Icon */}
                <TouchableOpacity
                  style={style.micButton}
                  onPressIn={startListening} // ⬅️ when finger goes down
                  onPressOut={stopListening} // ⬅️ when finger is lifted
                >
                  <Icon
                    name={isListening ? 'mic' : 'mic-off'}
                    size={28}
                    color={isListening ? 'red' : '#4285F4'}
                  />
                </TouchableOpacity>
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
              <View style={{ marginBottom: 5, paddingBottom: 5 }}>
                <Dropdown
                  style={[style.dropdown, isFocus && { borderColor: 'blue' }]}
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
                  value={selectedMArea}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    // setdocValue(item.value);
                    // setdocLabel(item.label);
                    setSelectedMArea(item.value);
                    setAreaLabel(item.label);
                    setIsFocus(false);
                    areaWiseDoctorList(item.value);
                    // doctorWiseProductListAPI(item.value);
                    //setDocCode(item.value);
                  }}
                />
              </View>
              <View
                style={{
                  marginBottom: 5,
                  paddingBottom: 5,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Dropdown
                  style={[style.dropdown1, isFocus && { borderColor: 'blue' }]}
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
                  placeholder={!isFocus ? 'Select Doctor' : '...'}
                  searchPlaceholder="Search..."
                  value={selectedDoctorId}
                  onFocus={() => {
                    setIsFocus(true);
                    if (usedoctorData.length === 0) {
                      getDoctorList();
                    }
                  }}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                     if (!item) return;
                    onSelectDoctor(item);
                  }}
                />
                <TouchableOpacity
                  onPress={handleDoctorDetailModal}
                  style={{
                    marginLeft: 10,
                    padding: 5,
                  }}>
                  <Octicons name="info" size={24} color="#2142f9" />
                </TouchableOpacity>
              </View>

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
                badgeStyles={{ backgroundColor: 'green' }}
                labelStyles={{ fontWeight: '800', color: 'black' }}
              />

              <View
                style={{
                  marginBottom: 5,
                  paddingBottom: 5,
                  flexDirection: 'row', // ⬅️ row layout
                  alignItems: 'center',
                }}>
                {/* Remarks Input */}
                <TextInput
                  // mode="outlined"
                  // autoCapitalize="none"
                  autoCorrect={false}
                  style={style.remarkstextInput}
                  placeholder="Remarks"
                  placeholderTextColor="#555"
                  value={useRemarks}
                  onChangeText={text => setRemarks(text)}
                  multiline={true}
                  numberOfLines={3}
                />
                {/* Mic Icon */}
                <TouchableOpacity
                  style={style.micButton}
                  onPressIn={startListening} // ⬅️ when finger goes down
                  onPressOut={stopListening} // ⬅️ when finger is lifted
                >
                  <Icon
                    name={isListening ? 'mic' : 'mic-off'}
                    size={28}
                    color={isListening ? 'red' : '#4285F4'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
      )}

      <SafeAreaView style={{ flex: 1 }}>
        <CustomDCRNew
          selectionMode={1}
          option1="Sample"
          option2="Gift"
          option3="Stage"
          option4="Campaign"
          option5="VisualAids"
          onSelectSwitch={onSelectSwitch}
        />

        {gamesTab == 1 && (
          <View style={{ margin: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Dropdown
                style={[
                  style.dropdownNew,
                  isFocus && { borderColor: 'blue', width: '50%' },
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
                value={sValue}
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
                //label="Quantity"
                mode="outlined"
                autoCapitalize="none"
                inputMode="numeric"
                autoCorrect={false}
                value={useQty}
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
                    color: '#ffffff',
                  }}>
                  Add
                </Text>
              </TouchableOpacity>
            </View>

            {sampleQtyData && sampleQtyData.length > 0 ? (
              <View style={{ marginTop: 10, marginHorizontal: 8 }}>
                {/* 🔹 Table Header */}
                <View
                  style={{
                    flexDirection: 'row',
                    backgroundColor: '#005696',
                    borderWidth: 1,
                    borderColor: '#bdc3c7',
                  }}>
                  {/* Name Header */}
                  <View
                    style={{
                      width: '55%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRightWidth: 1,
                      borderColor: '#bdc3c7',
                      paddingVertical: 8,
                    }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: 'Lato-Bold',
                        color: '#ffffff',
                      }}>
                      Name
                    </Text>
                  </View>

                  {/* Qty Header */}
                  <View
                    style={{
                      width: '30%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRightWidth: 1,
                      borderColor: '#bdc3c7',
                      paddingVertical: 8,
                    }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: 'Lato-Bold',
                        color: '#ffffff',
                      }}>
                      Qty
                    </Text>
                  </View>

                  {/* Action Header */}
                  <View
                    style={{
                      width: '15%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 8,
                    }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: 'Lato-Bold',
                        color: '#ffffff',
                      }}>
                      Action
                    </Text>
                  </View>
                </View>

                {/* 🔹 Table Rows */}
                <FlatList
                  data={sampleQtyData}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item, index }) => (
                    <TouchableWithoutFeedback>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor:
                            index % 2 === 0 ? '#ecf0f1' : '#ffffff',
                          borderWidth: 1,
                          borderColor: '#bdc3c7',
                          borderTopWidth: 0,
                        }}>
                        {/* Name Column */}
                        <View
                          style={{
                            width: '55%',
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderRightWidth: 1,
                            borderColor: '#bdc3c7',
                            paddingVertical: 6,
                            paddingHorizontal: 8,
                          }}>
                          <Text
                            style={{
                              fontSize: 14,
                              fontFamily: 'Lato-Regular',
                              color: '#000',
                              flexShrink: 1,
                            }}>
                            {item.label}
                          </Text>
                        </View>

                        {/* Qty Column */}
                        <View
                          style={{
                            width: '30%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRightWidth: 1,
                            borderColor: '#bdc3c7',
                            paddingVertical: 6,
                          }}>
                          <Text
                            style={{
                              fontSize: 14,
                              fontFamily: 'Lato-Regular',
                              color: '#000',
                            }}>
                            {item.key}
                          </Text>
                        </View>

                        {/* Delete Column */}
                        <View
                          style={{
                            width: '15%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 8,
                          }}>
                          <AntDesign
                            name="delete"
                            size={22}
                            color="red"
                            onPress={() => onDeleteSample(index)}
                          />
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                  )}
                />
              </View>
            ) : null}
          </View>
        )}
        {gamesTab == 2 && (
          <View style={{ margin: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Dropdown
                style={[
                  style.dropdownNew,
                  isFocus && { borderColor: 'blue', width: '50%' },
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
                value={gValue}
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
                mode="outlined"
                autoCapitalize="none"
                inputMode="numeric"
                autoCorrect={false}
                value={useGQty}
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
                    color: '#ffffff',
                  }}>
                  Add
                </Text>
              </TouchableOpacity>
            </View>

            {giftQtyData && giftQtyData.length > 0 ? (
              <View style={{ marginTop: 10, marginHorizontal: 8 }}>
                {/* 🔹 Table Header */}
                <View
                  style={{
                    flexDirection: 'row',
                    backgroundColor: '#005696',
                    borderWidth: 1,
                    borderColor: '#dee2e6ff',
                  }}>
                  {/* Name Column */}
                  <View
                    style={{
                      width: '55%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRightWidth: 1,
                      borderColor: '#e6e8e9ff',
                      paddingVertical: 8,
                    }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: 'Lato-Bold',
                        color: '#ffffff',
                      }}>
                      Name
                    </Text>
                  </View>

                  {/* Qty Column */}
                  <View
                    style={{
                      width: '30%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRightWidth: 1,
                      borderColor: '#e6e8e9ff',
                      paddingVertical: 8,
                    }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: 'Lato-Bold',
                        color: '#ffffff',
                      }}>
                      Qty
                    </Text>
                  </View>

                  {/* Action Column */}
                  <View
                    style={{
                      width: '15%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 8,
                    }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: 'Lato-Bold',
                        color: '#ffffff',
                      }}>
                      Action
                    </Text>
                  </View>
                </View>

                {/* 🔹 Table Rows */}
                <FlatList
                  data={giftQtyData}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item, index }) => (
                    <TouchableWithoutFeedback>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: '#ffffff',
                          borderWidth: 1,
                          borderColor: '#bdc3c7',
                          borderTopWidth: 0,
                        }}>
                        {/* Name Column */}
                        <View
                          style={{
                            width: '55%',
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderRightWidth: 1,
                            borderColor: '#bdc3c7',
                            paddingVertical: 6,
                            paddingHorizontal: 8,
                          }}>
                          <Text
                            style={{
                              fontSize: 14,
                              fontFamily: 'Lato-Bold',
                              color: '#000',
                              flexShrink: 1,
                            }}>
                            {item.label}
                          </Text>
                        </View>

                        {/* Qty Column */}
                        <View
                          style={{
                            width: '30%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRightWidth: 1,
                            borderColor: '#bdc3c7',
                            paddingVertical: 6,
                          }}>
                          <Text
                            style={{
                              fontSize: 14,
                              fontFamily: 'Lato-Bold',
                              color: '#000',
                            }}>
                            {item.key}
                          </Text>
                        </View>

                        {/* Delete Action */}
                        <View
                          style={{
                            width: '15%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 6,
                          }}>
                          <AntDesign
                            name="delete"
                            size={24}
                            color="red"
                            onPress={() => onDeleteGift(index)}
                          />
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                  )}
                />
              </View>
            ) : null}
          </View>
        )}
        {gamesTab == 3 && (
          <SafeAreaView style={style.container}>
            {/* <View style={style.btnTab}>
              <Text style={style.textTab}>Product Stage</Text>
            </View> */}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <FlatList
                data={dataProduct}
                keyExtractor={item => item.IDProduct?.toString()}
                renderItem={renderProductItem}
                ListEmptyComponent={() => (
                  <View style={{ alignItems: 'center', marginTop: 50 }}>
                    <Text style={{ fontSize: 16, color: 'gray' }}>
                      No Data Found
                    </Text>
                  </View>
                )}
                contentContainerStyle={{ paddingBottom: 50 }}
              />
            </TouchableWithoutFeedback>
            {/* <CustomButton label={'End DCR'} onPress={() => save()} /> */}
          </SafeAreaView>
        )}
        {gamesTab == 4 && (
          <View style={{ margin: 10 }}>
            <View
              style={{
                backgroundColor: '#ecf0f1',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 10,
                borderWidth: 0.1,
                margin: 10,
                elevation: 2,
                borderRadius: 1,
              }}>
              <View style={{ flexDirection: 'row' }}>
                <Dropdown
                  style={[
                    style.dropdownNew,
                    isFocus && { borderColor: 'blue', width: '50%' },
                  ]}
                  placeholderStyle={style.placeholderStyle}
                  selectedTextStyle={style.selectedTextStyle}
                  inputSearchStyle={style.inputSearchStyle}
                  iconStyle={style.iconStyle}
                  data={campData}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  value={cValue}
                  placeholder={!isFocus ? 'Campaign' : '...'}
                  searchPlaceholder="Search"
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    console.log(item.value);
                    setCLabel(item.label);
                    setCValue(item.value);
                    setIsFocus(false);
                  }}
                />
                <Dropdown
                  style={[
                    style.dropdownNew,
                    isFocus && { borderColor: 'blue', width: '50%' },
                  ]}
                  placeholderStyle={style.placeholderStyle}
                  selectedTextStyle={style.selectedTextStyle}
                  inputSearchStyle={style.inputSearchStyle}
                  iconStyle={style.iconStyle}
                  data={prodData}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  value={pValue}
                  placeholder={!isFocus ? 'Select Product' : '...'}
                  searchPlaceholder="Search"
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    console.log(item.value);
                    setPLabel(item.label);
                    setPValue(item.value);
                    setIsFocus(false);
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  margin: 5,
                  alignSelf: 'center',
                }}>
                <TextInput
                  //label="Quantity"
                  mode="outlined"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={useCRemarks}
                  style={[
                    style.textInput,
                    { width: '40%', alignItems: 'center', marginRight: 5 },
                  ]}
                  placeholder="Remarks"
                  placeholderTextColor="#555"
                  onChangeText={text => setCRemarks(text)}
                  multiline={true}
                //numberOfLines={3}
                />
                <TouchableOpacity
                  style={{
                    backgroundColor: '#005696',
                    width: '21%',
                    height: '73%',
                    margin: 5,
                    borderRadius: 5,
                    flexDirection: 'row',
                    marginTop: 10,
                  }}
                  onPress={() => addCampaign()}>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontWeight: '700',
                      fontSize: 16,
                      marginLeft: 10,
                      marginTop: 5,
                      padding: 5,
                      fontFamily: 'Lato-Regular',
                      color: '#ffffff',
                    }}>
                    Add
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {campaignData && campaignData.length > 0 ? (
              <View style={{ marginTop: 10, marginHorizontal: 8 }}>
                {/* 🔹 Table Header */}
                <View
                  style={{
                    flexDirection: 'row',
                    backgroundColor: '#005696',
                    borderWidth: 1,
                    borderColor: '#bdc3c7',
                  }}>
                  <View
                    style={{
                      width: '35%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRightWidth: 1,
                      borderColor: '#bdc3c7',
                      paddingVertical: 8,
                    }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: 'Lato-Bold',
                        color: '#ffffff',
                      }}>
                      Campaign Name
                    </Text>
                  </View>

                  <View
                    style={{
                      width: '35%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRightWidth: 1,
                      borderColor: '#bdc3c7',
                      paddingVertical: 8,
                    }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: 'Lato-Bold',
                        color: '#ffffff',
                      }}>
                      Product Name
                    </Text>
                  </View>

                  <View
                    style={{
                      width: '20%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRightWidth: 1,
                      borderColor: '#bdc3c7',
                      paddingVertical: 8,
                    }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: 'Lato-Bold',
                        color: '#ffffff',
                      }}>
                      Remarks
                    </Text>
                  </View>

                  <View
                    style={{
                      width: '10%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 8,
                    }}>
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: 'Lato-Bold',
                        color: '#ffffff',
                      }}>
                      Action
                    </Text>
                  </View>
                </View>

                {/* 🔹 Table Rows */}
                <FlatList
                  data={campaignData}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item, index }) => (
                    <TouchableWithoutFeedback>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor:
                            index % 2 === 0 ? '#ecf0f1' : '#ffffff',
                          borderWidth: 1,
                          borderColor: '#bdc3c7',
                          borderTopWidth: 0,
                        }}>
                        <View
                          style={{
                            width: '35%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRightWidth: 1,
                            borderColor: '#bdc3c7',
                            paddingVertical: 6,
                            paddingHorizontal: 8,
                          }}>
                          <Text
                            style={{
                              fontSize: 13,
                              fontFamily: 'Lato-Regular',
                              color: '#000',
                              textAlign: 'center',
                            }}>
                            {item.campaignName}
                          </Text>
                        </View>

                        <View
                          style={{
                            width: '35%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRightWidth: 1,
                            borderColor: '#bdc3c7',
                            paddingVertical: 6,
                            paddingHorizontal: 8,
                          }}>
                          <Text
                            style={{
                              fontSize: 13,
                              fontFamily: 'Lato-Regular',
                              color: '#000',
                              textAlign: 'center',
                            }}>
                            {item.productName}
                          </Text>
                        </View>

                        <View
                          style={{
                            width: '20%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRightWidth: 1,
                            borderColor: '#bdc3c7',
                            paddingVertical: 6,
                            paddingHorizontal: 8,
                          }}>
                          <Text
                            style={{
                              fontSize: 13,
                              fontFamily: 'Lato-Regular',
                              color: '#000',
                              textAlign: 'center',
                            }}>
                            {item.key}
                          </Text>
                        </View>

                        <View
                          style={{
                            width: '10%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 6,
                          }}>
                          <AntDesign
                            name="delete"
                            size={22}
                            color="red"
                            onPress={() => onDeleteCampaign(index)}
                          />
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                  )}
                />
              </View>
            ) : null}
          </View>
        )}
        {gamesTab == 5 && (
          <View style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
            <FlatList
              data={dataProduct}
              keyExtractor={item => item.IDProduct?.toString()}
              renderItem={rendervisualaids}
              ListEmptyComponent={() => (
                <View style={{ alignItems: 'center', marginTop: 50 }}>
                  <Text style={{ fontSize: 16, color: 'gray' }}>
                    No Data Found
                  </Text>
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 50 }}
            />
          </View>
        )}
      </SafeAreaView>

      <DoctorDetailsModal
        visible={detailsModalVisible}
        onClose={handleDoctorModalClose}
        //onClose={() => setDetailsModalVisible(false)}
        doctorId={selectedDoctor?.IDDoctor}
        employeeId={useIDEmployee}
        businessId={useBusinessID}
      />
      <Modal
        visible={showGeoFenceModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGeoFenceModal(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              width: '92%',
              backgroundColor: '#fff',
              borderRadius: 15,
              padding: 20,
              maxHeight: '85%',
            }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: '#555',
                }}>
                Distance Alert
              </Text>

              <Text
                style={{
                  marginTop: 20,
                  fontSize: 18,
                  color: '#666',
                }}>
                Distance exceeds {useDoctorGeofencing} meters.
              </Text>

              {/* <Text
                style={{
                  color: 'red',
                  fontSize: 24,
                  fontWeight: 'bold',
                  marginTop: 25,
                }}>
                Distance: {distanceInfo.distance} meters
              </Text> */}

              <Text
                style={{
                  color: 'red',
                  fontSize: 24,
                  fontWeight: 'bold',
                  marginTop: 25,
                }}>
                Distance:{' '}
                {distanceInfo.distance != null
                  ? formatDistance(distanceInfo.distance)
                  : '0.00 meters'}
              </Text>
              <Text
                style={{
                  marginTop: 25,
                  fontSize: 18,
                  color: '#555',
                }}>
                Doctor Code: {distanceInfo.doctorCode}
              </Text>

              <Text
                style={{
                  marginTop: 20,
                  fontSize: 18,
                  color: '#555',
                }}>
                Doctor Name: {distanceInfo.doctorName}
              </Text>

              <Text
                style={{
                  marginTop: 30,
                  fontSize: 18,
                  color: '#0D47A1',
                  lineHeight: 28,
                }}>
                Your Location:
                {'\n'}
                Latitude: {currentLatitude}
                {'\n'}
                Longitude: {currentLongitude}
              </Text>

              <Text
                style={{
                  marginTop: 30,
                  fontSize: 18,
                  color: 'red',
                  lineHeight: 28,
                }}>
                Doctor Location:
                {'\n'}
                Latitude: {distanceInfo.doctorLat}
                {'\n'}
                Longitude: {distanceInfo.doctorLng}
              </Text>

              {/* Map */}

              {/* <MapView
                style={{
                  height: 250,
                  marginTop: 25,
                  borderRadius: 10,
                }}
                initialRegion={{
                  latitude: parseFloat(currentLatitude),
                  longitude: parseFloat(currentLongitude),
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}> */}
              <MapView
                style={{
                  width: '100%',
                  height: 280, // Adjusted height for the map to make it bigger
                  marginVertical: 20,
                  borderRadius: 10,
                }}
                region={{
                  latitude: parseFloat(distanceInfo.doctorLat),
                  longitude: parseFloat(distanceInfo.doctorLng),
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.0121,
                }}
                showsUserLocation
                followsUserLocation>
                {/* Doctor Marker */}
                <Marker
                  coordinate={{
                    latitude: parseFloat(distanceInfo.doctorLat),
                    longitude: parseFloat(distanceInfo.doctorLng),
                  }}
                  pinColor="red"
                  title="Doctor Chamber"
                />

                {/* User Marker */}
                {/* <Marker
                  coordinate={{
                    latitude: parseFloat(currentLatitude),
                    longitude: parseFloat(currentLongitude),
                  }}
                  pinColor="blue"
                  title="My Location"
                /> */}

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

                {/* 150 Meter Circle */}
                {Number(useDoctorGeofencing) > 0 && (
                  <Circle
                    center={{
                      latitude: parseFloat(distanceInfo.doctorLat),
                      longitude: parseFloat(distanceInfo.doctorLng),
                    }}
                    radius={Number(useDoctorGeofencing)}
                    strokeWidth={1}
                    strokeColor="rgba(22,125,128,0.9)"
                    fillColor="rgba(22,125,128,0.2)"
                  />
                )}
              </MapView>
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowGeoFenceModal(false)}
              style={{
                backgroundColor: '#2196F3',
                marginTop: 15,
                padding: 15,
                borderRadius: 8,
              }}>
              <Text
                style={{
                  color: '#fff',
                  textAlign: 'center',
                  fontSize: 18,
                  fontWeight: 'bold',
                }}>
                CLOSE
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={pdfVisible}
        animationType="slide"
        onRequestClose={() => setPdfVisible(false)}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          {/* Header */}
          <View
            style={{
              height: 50,
              backgroundColor: '#005696',
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
            }}>
            <TouchableOpacity onPress={() => setPdfVisible(false)}>
              <Text style={{ color: '#fff', fontSize: 16 }}>Close</Text>
            </TouchableOpacity>

            <Text
              style={{
                color: '#fff',
                fontSize: 16,
                marginLeft: 20,
                fontWeight: '600',
              }}>
              Visual Aid
            </Text>
          </View>

          {loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          ) : (
            <Pdf source={{ uri: pdfUrl }} style={{ flex: 1 }} />
          )}
        </View>
      </Modal>
    </KeyboardAwareLayout>
  );
};

export default DCRDoctor;

const style = StyleSheet.create({
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  dropdown1: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FFF',
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
  micButton: {
    marginLeft: 8,
    marginTop: 5,
  },
  remarkstextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#a9a9aaff', // Border color
    borderRadius: 8, // Rounded corners
    padding: 10, // Inner padding
    fontSize: 16,
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
  pdfButton: {
    padding: 6,
  },
  vaCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    // Feather touch shadow
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  vaLeft: {
    flex: 1,
    paddingRight: 10,
  },

  vaProduct: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },

  vaStagePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  vaStageText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3949AB',
  },

  vaRight: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },

  pdfCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FDECEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },

  pdfLabel: {
    fontSize: 11,
    color: '#E53935',
    fontWeight: '500',
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
    backgroundColor: '#005696',
    marginBottom: 10,
  },
  textTab: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Lato-Bold',
  },
  cardContainer: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 5,
    flexShrink: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stageBox: {
    flex: 1,
    height: 50,
    borderWidth: 0.7,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    marginRight: 6,
    backgroundColor: '#fff',
  },

  stageText: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
  dropdownStageNew: {
    flex: 1,
    height: 50,
    borderWidth: 0.7,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    marginLeft: 6,
    marginRight: 6,
  },
  placeholderStyleStage: {
    fontSize: 14,
    color: '#666',
  },
  selectedTextStyleStage: {
    fontSize: 14,
    fontWeight: '600',
  },
});
