import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  SafeAreaView,
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  StatusBar,
  TouchableOpacity,
  Modal,
  PermissionsAndroid,
  Image,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState, useCallback, useRef} from 'react';
import {TextInput} from 'react-native-paper';
import {Dropdown} from 'react-native-element-dropdown';
import {MultipleSelectList} from 'react-native-dropdown-select-list';
import Geocoder from 'react-native-geocoding';
import {BASE_URL} from '@env';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import NetInfo from '@react-native-community/netinfo';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CustomButton from '../components/custom/CustomButton';
import {openDatabase} from 'react-native-sqlite-storage';
import {FlatList} from 'react-native-gesture-handler';
import AntDesign from 'react-native-vector-icons/AntDesign';
import DeviceInfo from 'react-native-device-info';
import ProgressDialog from '../components/custom/ProgressDialog';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import KeyboardAwareLayout from '../components/custom/KeyboardAwareLayout';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {
  launchImageLibrary as _launchImageLibrary,
  launchCamera as _launchCamera,
} from 'react-native-image-picker';
let launchImageLibrary = _launchImageLibrary;
let launchCamera = _launchCamera;
import ImageResizer from '@bam.tech/react-native-image-resizer';

// Initialize Geocoder with your Google API Key
Geocoder.init('AIzaSyAK6U3-x1ro826D0T0P1_gShb4rst_ka2c'); // Replace with your API Key

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

const MasterDoctor = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const [useCode, setCode] = useState('');
  const [docCode, setDocCode] = useState('');
  const [useNoOfDoctorWiseProduct, setNoOfDoctorWiseProduct] = useState('');
  const [useName, setName] = useState('');
  const [useIDDivision, setIDDivision] = useState('');
  const [useIDEmployee, setIDEmployee] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [useempEmail, setempEmail] = useState('');
  const [useMobile, setMobile] = useState('');
  const [selectedMArea, setSelectedMArea] = useState([]);
  const [useType, setType] = useState([]);
  const [useData, setData] = useState([]);
  const [useQData, setQData] = useState([]);
  const [useQValue, setQValue] = useState('');
  const [useQLabel, setQLabel] = useState('');
  const [useSData, setSData] = useState([]);
  const [useSValue, setSValue] = useState('');
  const [useSLabel, setSLabel] = useState('');
  const [useCData, setCData] = useState([]);
  const [useCValue, setCValue] = useState('');
  const [useCLabel, setCLabel] = useState('');
  const [useAData, setAData] = useState([]);
  const [useAValue, setAValue] = useState('');
  const [useALabel, setALabel] = useState('');
  const [usePData, setPData] = useState([]);
  const [usePValue, setPValue] = useState('');
  const [usePLabel, setPLabel] = useState('');
  const [useAreaSelected, setAreaSelected] = useState('');
  const [useTypeSelected, setTypeSelected] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [locationStatus, setLocationStatus] = useState('');
  const [currentLongitude, setCurrentLongitude] = useState('0.00');
  const [currentLatitude, setCurrentLatitude] = useState('0.00');
  const [fStageData, setfStageData] = useState([]);
  const [fStageLabel, setfStageLabel] = useState('');
  const [fStageValue, setfStageValue] = useState('');
  const [shouldShowMD, setshouldShowMD] = useState(true);
  const [useMobileAccess, setuseMobileAccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationAddress, setLocationAddress] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedImageName, setSelectedImageName] = useState('');
  const [selectedImageType, setSelectedImageType] = useState('');
  const [activeImageType, setActiveImageType] = useState(null); // 'CARD' | 'PRESCRIPTION'
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUri, setPreviewUri] = useState('');
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [nearByDoctors, setNearByDoctors] = useState([]);
  const [nearByDoctorLoading, setNearByDoctorLoading] = useState(false);
  const [mapRegion, setMapRegion] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [showData, setShowData] = useState(true);
  const [useFData, setFData] = useState([]);
  const [useFValue, setFValue] = useState('');
  const [useFLabel, setFLabel] = useState('');
  const [loadingSave, setLoadingSave] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveInProgress = useRef(false);

  const [images, setImages] = useState({
    CARD: {
      uri: '',
      name: '',
      type: '',
    },
    PRESCRIPTION: {
      uri: '',
      name: '',
      type: '',
    },
  });

  const openImagePicker = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      // maxHeight: 180,
      // maxWidth: 150,
    };

    launchImageLibrary(options, handleResponse);
  };

  let options = {
    saveToPhotos: true,
    mediaType: 'photo',
    includeBase64: false,
    // maxHeight: 180,
    // maxWidth: 150,
  };

  // const handleCameraLaunch = async () => {
  //   try {
  //     if (Platform.OS === 'android') {
  //       const granted = await PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.CAMERA,
  //       );
  //       if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
  //     }

  //     const result = await launchCamera({
  //       mediaType: 'photo',
  //       saveToPhotos: true,
  //       quality: 1,
  //     });

  //     if (result.didCancel || result.errorMessage) return;

  //     const asset = result.assets?.[0];
  //     if (!asset || !activeImageType) return;

  //     setImages(prev => ({
  //       ...prev,
  //       [activeImageType]: {
  //         uri: asset.uri,
  //         name: asset.fileName,
  //         type: asset.type,
  //       },
  //     }));

  //     setModalVisible(false);
  //   } catch (err) {
  //     console.log('Camera error:', err);
  //   }
  // };

  // const handleResponse = response => {
  //   if (response.didCancel) {
  //     console.log('User cancelled image picker');
  //   } else if (response.error) {
  //     console.log('Image picker error: ', response.error);
  //   } else {
  //     let imageUri = response.uri || response.assets?.[0]?.uri;
  //     //setSelectedImage(imageUri);
  //     //uploadImage(imageUri);
  //     const imageuri = response.assets[0].uri;
  //     const fileName = response.assets[0].fileName;
  //     const fileType = response.assets[0].type;
  //     setSelectedImage(imageuri);
  //     setSelectedImageName(fileName);
  //     setSelectedImageType(fileType);
  //     // console.log('imageuri',imageuri);
  //     // console.log('fileName',fileName);
  //     // console.log('fileType',fileType);
  //   }
  //   setModalVisible(false);
  // };

  // const handleResponse = response => {
  //   if (response.didCancel || !response.assets?.[0] || !activeImageType) {
  //     setModalVisible(false);
  //     return;
  //   }

  //   const asset = response.assets[0];

  //   setImages(prev => ({
  //     ...prev,
  //     [activeImageType]: {
  //       uri: asset.uri,
  //       name: asset.fileName,
  //       type: asset.type,
  //     },
  //   }));

  //   setModalVisible(false);
  // };

  const validateImageSize = asset => {
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

    if (asset.fileSize && asset.fileSize > MAX_SIZE) {
      Alert.alert(
        'Image Too Large',
        `Selected image size is ${(asset.fileSize / (1024 * 1024)).toFixed(
          5,
        )} MB.\nPlease select an image smaller than 5 MB.`,
      );
      return false;
    }

    return true;
  };

  const handleCameraLaunch = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      }

      const result = await launchCamera({
        mediaType: 'photo',
        saveToPhotos: true,
        quality: 1,
      });

      if (result.didCancel || result.errorMessage) return;

      const asset = result.assets?.[0];

      if (!asset || !activeImageType) return;

      let image = {
        uri: asset.uri,
        name: asset.fileName,
        type: asset.type,
      };

      // Convert HEIC/HEIF to JPEG
      if (asset.type?.includes('heic') || asset.type?.includes('heif')) {
        const resized = await ImageResizer.createResizedImage(
          asset.uri,
          1500,
          1500,
          'JPEG',
          90,
        );

        image = {
          uri: resized.uri,
          name: 'image.jpg',
          type: 'image/jpeg',
        };
      }

      setImages(prev => ({
        ...prev,
        [activeImageType]: image,
      }));

      setModalVisible(false);

      if (!validateImageSize(asset)) {
        setModalVisible(false);
        return;
      }
    } catch (err) {
      console.log('Camera error:', err);
    }
  };

  const handleResponse = async response => {
    if (response.didCancel || !response.assets?.[0] || !activeImageType) {
      setModalVisible(false);
      return;
    }

    const asset = response.assets[0];

    if (!validateImageSize(asset)) {
      setModalVisible(false);
      return;
    }

    let image = {
      uri: asset.uri,
      name: asset.fileName,
      type: asset.type,
    };

    // Convert HEIC/HEIF to JPEG
    if (asset.type?.includes('heic') || asset.type?.includes('heif')) {
      const resized = await ImageResizer.createResizedImage(
        asset.uri,
        1500,
        1500,
        'JPEG',
        90,
      );

      image = {
        uri: resized.uri,
        name: 'image.jpg',
        type: 'image/jpeg',
      };
    }

    setImages(prev => ({
      ...prev,
      [activeImageType]: image,
    }));

    setModalVisible(false);
  };

  useEffect(() => {
    getOneTimeLocation();
    handleEnabledPressed();
    handleCheckPressed();
    //getAddress();
    //AIzaSyCom4hOSUuk0f1RE6w1C_HDMhpwH70nr8A
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          setBusinessID(user.BusinessID);
          setempEmail(user.Empemail);
          setIDDivision(user.IDDivision);
          setIDEmployee(user.IDEmployee);
          setuseMobileAccess(user.MobileAccess);
          NetInfo.fetch().then(async state => {
            if (state.isConnected) {
              const wturl =
                BASE_URL +
                'Doctor/DoctorAutoCode?Businessid=' +
                user.BusinessID +
                '&Type=Doctor';
              //console.log(wturl);
              var config = {
                method: 'get',
                url: wturl,
              };
              axios(config)
                .then(function (response) {
                  //console.log('doctorViewDCR', response.data.d);
                  setDocCode(response.data.d);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });

              try {
                const response = await fetch(
                  BASE_URL +
                    'Configuration/ConfigurationDetail?Businessid=' +
                    user.BusinessID,
                );

                const json = await response.json();

                // API returns array
                if (json.length > 0) {
                  setNoOfDoctorWiseProduct(json[0].NoOfDoctorWiseProduct);
                  console.log(
                    'NoOfDoctorWiseProduct',
                    json[0].NoOfDoctorWiseProduct,
                  );
                }
              } catch (error) {
                console.log(error);
              }

              fetchOnlineTableData(
                user.BusinessID,
                user.IDEmployee,
                user.IDDivision,
                user.IDHQ,
              );
            } else {
              Alert.alert('No Internet');
              fetchOfflineTableData();
            }
          }, []);
        }
      });
    } catch (error) {
      Alert.alert(error);
    }

    const interval = setInterval(() => {
      handleCheckPressed();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('AppNavMaster'); // <-- Your main screen
        return true; // prevent default back behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation]),
  );

  const handleCheckPressed = async () => {
    if (Platform.OS === 'android') {
      var checkEnabled = await isLocationEnabled();
      //console.log('checkEnabled', checkEnabled);
      if (checkEnabled === false) {
        Alert.alert('GPS Not Active');
        BackHandler.exitApp();
        //navigation.navigate('AppNavScreen');
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

  const getOneTimeLocation = () => {
    setLocationStatus('Getting Location ...');
    Geolocation.getCurrentPosition(
      //Will give you the current location
      async position => {
        setLocationStatus('You are Here');
        const currentLongitude = JSON.stringify(position.coords.longitude);
        //getting the Longitude from the location json
        const currentLatitude = JSON.stringify(position.coords.latitude);
        //getting the Latitude from the location json
        setCurrentLongitude(currentLongitude);
        //Setting state Longitude to re re-render the Longitude Text
        setCurrentLatitude(currentLatitude);
        //Setting state Latitude to re re-render the Longitude Text
        //console.log('checkEnabled', currentLatitude + ' ' + currentLongitude);

        try {
          const response = await Geocoder.from(
            currentLatitude,
            currentLongitude,
          ); // Example: San Francisco coordinates
          console.log(currentLatitude, currentLongitude);

          const address = response.results[0].formatted_address;
          setLocationAddress(address);
          console.log('getOneTimeLocation', address);
        } catch (error) {
          console.error('Error fetching location', error);
        }
      },
      error => {
        setLocationStatus(error.message);
      },
      //{enableHighAccuracy: false, timeout: 30000, maximumAge: 1000},
      //{enableHighAccuracy: true, timeout: 15000, maximumAge: 1000},
      {timeout: 15000}, // 15 seconds timeout
    );
  };

  const getMultipleTimeLocation = () => {
    setLocationStatus('Getting Location ...');
    Geolocation.getCurrentPosition(
      //Will give you the current location
      async position => {
        setLocationStatus('You are Here');
        const currentLongitude = JSON.stringify(position.coords.longitude);
        //getting the Longitude from the location json
        const currentLatitude = JSON.stringify(position.coords.latitude);
        //getting the Latitude from the location json
        setCurrentLongitude(currentLongitude);
        //Setting state Longitude to re re-render the Longitude Text
        setCurrentLatitude(currentLatitude);
        //Setting state Latitude to re re-render the Longitude Text
        //console.log('checkEnabled', currentLatitude + ' ' + currentLongitude);

        try {
          const response = await Geocoder.from(
            currentLatitude,
            currentLongitude,
          ); // Example: San Francisco coordinates
          console.log(currentLatitude, currentLongitude);

          const address = response.results[0].formatted_address;
          setLocationAddress(address);
          console.log('getMultipleTimeLocation', address);
        } catch (error) {
          console.error('Error fetching location', error);
        }
      },
      error => {
        setLocationStatus(error.message);
      },
      //{enableHighAccuracy: false, timeout: 30000, maximumAge: 1000},
      {enableHighAccuracy: false, timeout: 10000, maximumAge: 1000},
      //{ timeout: 15000 } // 15 seconds timeout
    );
  };

  const fetchOnlineTableData = (businessID, idEmp, idDivision, IDHQ) => {
    const qurl =
      BASE_URL + 'Qualification/QualificationList?Businessid=' + businessID;
    //console.log(qurl);
    var config = {
      method: 'get',
      url: qurl,
    };
    axios(config)
      .then(function (response) {
        var count = Object.keys(response.data).length;
        let wtNameArray = [];
        for (var i = 0; i < count; i++) {
          wtNameArray.push({
            //value: response.data[i].Value,
            value: response.data[i].IDQualification,
            label: response.data[i].Name,
          });
        }
        setQData(wtNameArray);
      })
      .catch(function (error) {
        Alert.alert(error);
      });

    const furl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=FREQUENCYTYPE';
    //console.log(qurl);
    var config = {
      method: 'get',
      url: furl,
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
        setFData(wtNameArray);
      })
      .catch(function (error) {
        Alert.alert(error);
      });

    const surl =
      BASE_URL + 'Speciality/SpecialityList?Businessid=' + businessID;
    //console.log(surl);
    var config = {
      method: 'get',
      url: surl,
    };
    axios(config)
      .then(function (response) {
        var count = Object.keys(response.data).length;
        let wtNameArray = [];
        for (var i = 0; i < count; i++) {
          wtNameArray.push({
            //value: response.data[i].Value,
            value: response.data[i].IDSpeciality,
            label: response.data[i].Name,
          });
        }
        setSData(wtNameArray);
      })
      .catch(function (error) {
        Alert.alert(error);
      });

    const curl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=PRODUCTCLASS';
    //console.log(curl);
    var config = {
      method: 'get',
      url: curl,
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
        setCData(wtNameArray);
      })
      .catch(function (error) {
        Alert.alert(error);
      });

    const aurl =
      // BASE_URL +
      // 'Area/DivisionWiseAreaList?Businessid=' +
      // businessID +
      // '&IDDivision=' +
      // idDivision;
      BASE_URL +
      'Area/DivisionAndHQWiseAreaList?Businessid=' +
      businessID +
      '&IDDivision=' +
      idDivision +
      '&IDHQ=' +
      IDHQ;
    //console.log('surllll', aurl);
    var config = {
      method: 'get',
      url: aurl,
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
        setAData(wtNameArray);
      })
      .catch(function (error) {
        Alert.alert(error);
      });

    const durl =
      BASE_URL +
      //'Product/ProductListDivisionWise?Businessid=' +
      'Product/ProductDivisionTypeList?Businessid=' +
      businessID +
      '&IDDivision=' +
      idDivision +
      '&Type=DOCTORPRODUCT';
    //console.log(durl);
    var config = {
      method: 'get',
      url: durl,
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
        setPData(wtNameArray);
      })
      .catch(function (error) {
        Alert.alert(error);
      });

    const finalurl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=TARGET';
    //console.log(finalurl);
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
        Alert.alert(error);
      });

    const empurl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=DOCTORTYPE';
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
            key: response.data[i].IDMisc,
          });
        }
        setTypeSelected(wtNameArray);
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const fetchOfflineTableData = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CRM_Qualification',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              temp.push({
                value: results.rows.item(i).IDQualification,
                label: results.rows.item(i).Name,
              });
            }
            //temp.shift();
            setQData(temp);
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

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CRM_Speciality',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              temp.push({
                value: results.rows.item(i).IDSpeciality,
                label: results.rows.item(i).Name,
              });
            }
            //temp.shift();
            setSData(temp);
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

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM MasterDoctorType',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              temp.push({
                value: results.rows.item(i).Name,
                key: results.rows.item(i).IDMisc,
              });
            }
            //temp.shift();
            setTypeSelected(temp);
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

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CRM_Category',
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
            //temp.shift();
            setCData(temp);
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

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CRM_Master_Area',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              temp.push({
                value: results.rows.item(i).IDArea,
                label: results.rows.item(i).Name,
              });
            }
            //temp.shift();
            setAData(temp);
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

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CRM_Master_Doctor_Product',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              temp.push({
                value: results.rows.item(i).IDProduct,
                label: results.rows.item(i).Name,
              });
            }
            //temp.shift();
            setPData(temp);
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

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CRM_finalStageList',
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
            //temp.shift();
            setfStageData(temp);
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

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CRM_frequencyList',
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
            //temp.shift();
            setFData(temp);
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

    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM CRM_getConfigurationDetail LIMIT 1`,
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            const value = results.rows.item(0).NoOfDoctorWiseProduct;

            console.log('SQLite Value:', value);

            // 1 = show
            // 0 = hide

            setNoOfDoctorWiseProduct(value);
          }
        },
      );
    });
  };

  const onDelete = id => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM CRM_MasterDoctor WHERE id = ?',
        [id],
        (tx, results) => {
          // Check if deletion was successful
          if (results.rowsAffected > 0) {
            // Update the state to re-render the FlatList without the deleted item
            setData(prevData => prevData.filter(item => item.id !== id));
          }
        },
      );
    });
  };

  const next = () => {
    if (useName === '') {
      Alert.alert('Type Name');
    } else if (useQLabel === '') {
      Alert.alert('Select Qualification');
    } else if (useSLabel === '') {
      Alert.alert('Select Speciality');
    } else if (useCLabel === '') {
      Alert.alert('Select Category');
    } else if (useALabel === '') {
      Alert.alert('Select Area');
    } else if (!useMobile.trim()) {
      Alert.alert('Type Mobile Number');
    } else if (!/^\d{10}$/.test(useMobile)) {
      Alert.alert('Please enter a valid 10-digit mobile number');
    } else if (useFLabel === '') {
      Alert.alert('Select Frequency');
    } else {
      setshouldShowMD(false);

      db.transaction(txn => {
        //txn.executeSql('DROP TABLE IF EXISTS ManagerAreaListTBL', []);
        txn.executeSql(
          'CREATE TABLE IF NOT EXISTS CRM_MasterDoctorCode(id INTEGER PRIMARY KEY AUTOINCREMENT,Name VARCHAR)',
          [],
        );
      });

      let sql = 'INSERT INTO CRM_MasterDoctorCode(Name) VALUES (?)';
      let params = [useName]; //storing user data in an array
      db.executeSql(sql, params);

      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM CRM_MasterDoctorCode',
          [],
          (_, results) => {
            if (results.rows.length > 0) {
              //console.warn('Table has data');
              var temp = [];
              for (let i = 0; i < results.rows.length; ++i) {
                temp.push(results.rows.item(i).id);
              }
              setCode(temp);
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
  const nextDoctor = () => {
    if (useFLabel === '') {
      Alert.alert('Select Frequency');
    } else {
      setshouldShowMD(false);

      setQValue(doctor?.Qualification?.IDQualification || '');
      setSValue(doctor?.Speciality?.IDSpeciality || '');
      setCValue(doctor?.Category?.IDMisc || '');
      setAValue(doctor?.Area1?.IDArea || '');

      db.transaction(txn => {
        //txn.executeSql('DROP TABLE IF EXISTS ManagerAreaListTBL', []);
        txn.executeSql(
          'CREATE TABLE IF NOT EXISTS CRM_MasterDoctorCode(id INTEGER PRIMARY KEY AUTOINCREMENT,Name VARCHAR)',
          [],
        );
      });

      let sql = 'INSERT INTO CRM_MasterDoctorCode(Name) VALUES (?)';
      let params = [useName]; //storing user data in an array
      db.executeSql(sql, params);

      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM CRM_MasterDoctorCode',
          [],
          (_, results) => {
            if (results.rows.length > 0) {
              //console.warn('Table has data');
              var temp = [];
              for (let i = 0; i < results.rows.length; ++i) {
                temp.push(results.rows.item(i).id);
              }
              setCode(temp);
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

  // const addData = () => {
  //   if (usePLabel.length === 0) {
  //     Alert.alert('Select Product');
  //   } else if (fStageLabel.length === 0) {
  //     Alert.alert('Select Stage');
  //   } else {
  //     //CREATE TABLE for CRM_MasterDoctor
  //     db.transaction(txn => {
  //       //txn.executeSql('DROP TABLE IF EXISTS ManagerAreaListTBL', []);
  //       txn.executeSql(
  //         'CREATE TABLE IF NOT EXISTS CRM_MasterDoctor(id INTEGER PRIMARY KEY AUTOINCREMENT,ProductValue VARCHAR,ProductLabel VARCHAR,StageValue VARCHAR,StageLabel VARCHAR)',
  //         [],
  //       );
  //     });

  //     let sql =
  //       'INSERT INTO CRM_MasterDoctor(ProductValue,ProductLabel,StageValue,StageLabel) VALUES (?,?,?,?)';
  //     let params = [usePValue, usePLabel, fStageValue, fStageLabel]; //storing user data in an array
  //     db.executeSql(sql, params);

  //     db.transaction(tx => {
  //       tx.executeSql(
  //         'SELECT * FROM CRM_MasterDoctor',
  //         [],
  //         (_, results) => {
  //           if (results.rows.length > 0) {
  //             //console.warn('Table has data');
  //             var temp = [];
  //             for (let i = 0; i < results.rows.length; ++i) {
  //               temp.push(results.rows.item(i));
  //             }
  //             setData(temp);
  //             //console.log(temp);
  //           }
  //         },
  //         (_, error) => {
  //           console.log('Error fetching data:', error);
  //         },
  //       );
  //     });
  //   }
  // };

  // const saveData = async () => {
  //   if (useData.length === 0) {
  //     Alert.alert('Select Product & Stage');
  //   } else {
  //     let deviceId = DeviceInfo.getDeviceId();
  //     if (useMobileAccess === 'ONLINE') {
  //       NetInfo.fetch().then(async state => {
  //         if (state.isConnected) {
  //           let productsID = [];
  //           let doctorType = [];
  //           useData.map(function (value) {
  //             productsID.push({
  //               IDProduct: value.ProductValue,
  //               IDSatge: value.StageValue,
  //             });
  //           });
  //           useType.map(function (value) {
  //             doctorType.push({
  //               IDType: value.IDMisc,
  //             });
  //           });

  //           const data = {
  //             IDDoctor: 0,
  //             //Code: 'MDOC'+useIDEmployee + useCode,
  //             //Code: deviceId + useCode,
  //             Code: docCode,
  //             Name: useName,
  //             Practice: '',
  //             IDQualification: useQValue,
  //             IDDivision: useIDDivision,
  //             IDSpeciality: useSValue,
  //             IDCategory: useCValue,
  //             IDArea: useAValue,
  //             IDArea2: 0,
  //             IDHQ: 0,
  //             Mobile: useMobile,
  //             Email: '',
  //             //IDEmployee: useIDEmployee,
  //             Employee: { IDEmployee: useIDEmployee },
  //             Latitude1: 0,
  //             Longitude1: 0,
  //             Latitude2: 0,
  //             Longitude2: 0,
  //             Address1: '',
  //             Address2: '',
  //             Pincode: '',
  //             DOB: '',
  //             Age: 0,
  //             PatientNo: 0,
  //             CreatedBy: useempEmail,
  //             Businessid: useBusinessID,
  //             Products: productsID,
  //             DoctorType: doctorType,
  //           };
  //           console.log('data,', data);

  //           let result = await fetch(BASE_URL + 'Doctor/MobileDoctorAddEdit', {
  //             method: 'POST',
  //             headers: {
  //               Accept: 'application/json',
  //               'Content-Type': 'application/json',
  //             },
  //             body: JSON.stringify(data),
  //           });

  //           result = await result.json();
  //           //console.log(result);
  //           if (result.result === '') {
  //             setLoading(true);
  //             setTimeout(() => {
  //               setLoading(false);
  //             }, 5000);
  //             db.transaction(tx => {
  //               tx.executeSql('DELETE from CRM_MasterDoctor');
  //             });
  //             db.transaction(tx => {
  //               tx.executeSql('DELETE from CRM_MasterDoctorCode');
  //             });
  //             Alert.alert(
  //               'Success',
  //               'Record Successfully Saved',
  //               [
  //                 {
  //                   text: 'Ok',
  //                   //onPress: () => navigation.navigate('Report DashBoard'),
  //                   onPress: () => navigation.navigate('AppNavMaster'),
  //                 },
  //               ],
  //               { cancelable: false },
  //             );
  //           } else {
  //             setLoading(true);
  //             setTimeout(() => {
  //               setLoading(false);
  //             }, 5000);
  //             db.transaction(tx => {
  //               tx.executeSql('DELETE from CRM_MasterDoctor');
  //             });
  //             db.transaction(tx => {
  //               tx.executeSql('DELETE from CRM_MasterDoctorCode');
  //             });
  //             Alert.alert('Else : ' + result.result);
  //             navigation.navigate('AppNavMaster');
  //           }
  //         } else {
  //           Alert.alert('You Are Offline Contact With Administrator!');
  //         }
  //       }, []);
  //     } else if (useMobileAccess === 'ONLINE & OFFLINE') {
  //       NetInfo.fetch().then(async state => {
  //         if (state.isConnected) {
  //           let productsID = [];
  //           let doctorType = [];
  //           // useData.map(function (value) {
  //           //   productsID.push({
  //           //     IDProduct: value.ProductValue,
  //           //     IDSatge: value.StageValue,
  //           //   });
  //           // });

  //           productsID = useData.map(item => ({
  //             IDProduct: String(parseInt(item.ProductValue)), // removes .0
  //             IDSatge: String(parseInt(item.StageValue)),
  //           }));

  //           useType.map(function (value) {
  //             doctorType.push({
  //               IDType: value,
  //             });
  //             //console.log('value.IDMisc', value);
  //           });
  //           const data = {
  //             IDDoctor: 0,
  //             //Code: 'MDOC'+useIDEmployee + useCode,
  //             //Code: deviceId + useCode,
  //             Code: docCode,
  //             Name: useName,
  //             Practice: '',
  //             IDQualification: useQValue,
  //             IDDivision: useIDDivision,
  //             IDSpeciality: useSValue,
  //             IDCategory: useCValue,
  //             IDArea: useAValue,
  //             IDArea2: 0,
  //             IDHQ: 0,
  //             Mobile: useMobile,
  //             Email: '',
  //             Employee: { IDEmployee: useIDEmployee },
  //             Latitude1: 0,
  //             Longitude1: 0,
  //             Latitude2: 0,
  //             Longitude2: 0,
  //             Address1: '',
  //             Address2: '',
  //             Pincode: '',
  //             DOB: '',
  //             Age: 0,
  //             PatientNo: 0,
  //             CreatedBy: useempEmail,
  //             Businessid: useBusinessID,
  //             Products: productsID,
  //             DoctorType: doctorType,
  //           };
  //           console.log('data', data);

  //           let result = await fetch(BASE_URL + 'Doctor/MobileDoctorAddEdit', {
  //             method: 'POST',
  //             headers: {
  //               Accept: 'application/json',
  //               'Content-Type': 'application/json',
  //             },
  //             body: JSON.stringify(data),
  //           });

  //           result = await result.json();
  //           console.log(result);
  //           if (result.result === '') {
  //             db.transaction(tx => {
  //               tx.executeSql('DELETE from CRM_MasterDoctor');
  //             });
  //             db.transaction(tx => {
  //               tx.executeSql('DELETE from CRM_MasterDoctorCode');
  //             });
  //             Alert.alert(
  //               'Success',
  //               'Record Successfully Saved',
  //               [
  //                 {
  //                   text: 'Ok',
  //                   //onPress: () => navigation.navigate('Report DashBoard'),
  //                   onPress: () => navigation.navigate('AppNavMaster'),
  //                 },
  //               ],
  //               { cancelable: false },
  //             );
  //           } else {
  //             db.transaction(tx => {
  //               tx.executeSql('DELETE from CRM_MasterDoctor');
  //             });
  //             db.transaction(tx => {
  //               tx.executeSql('DELETE from CRM_MasterDoctorCode');
  //             });
  //             Alert.alert('Else : ' + result.result);
  //             navigation.navigate('AppNavMaster');
  //           }
  //         } else {
  //           let productsID = [];
  //           useData.map(function (value) {
  //             productsID.push(
  //               // IDProduct: value.ProductValue,
  //               // IDSatge: value.StageValue,
  //               value.ProductValue,
  //             );
  //           });

  //           let stageID = [];
  //           useData.map(function (value) {
  //             stageID.push(value.StageValue);
  //           });

  //           let doctorType = [];
  //           useType.map(function (value) {
  //             doctorType.push(value);
  //             console.log('value.IDMisc', value);
  //           });

  //           const data = {
  //             IDDoctor: 0,
  //             //Code: 'MDOC'+useIDEmployee + useCode,
  //             Code: deviceId + useCode,
  //             //Code: docCode,
  //             Name: useName,
  //             Practice: '',
  //             IDQualification: useQValue,
  //             IDDivision: useIDDivision,
  //             IDSpeciality: useSValue,
  //             IDCategory: useCValue,
  //             IDArea: useAValue,
  //             IDArea2: 0,
  //             IDHQ: 0,
  //             Mobile: useMobile,
  //             Email: '',
  //             IDEmployee: useIDEmployee,
  //             Latitude1: 0,
  //             Longitude1: 0,
  //             Latitude2: 0,
  //             Longitude2: 0,
  //             Address1: '',
  //             Address2: '',
  //             Pincode: '',
  //             DOB: '',
  //             Age: 0,
  //             PatientNo: 0,
  //             CreatedBy: useempEmail,
  //             Businessid: useBusinessID,
  //             IDProducts: productsID,
  //             IDStage: stageID,
  //             DoctorType: doctorType,
  //           };
  //           console.log(' data for offline', data);

  //           db.transaction(txn => {
  //             txn.executeSql(
  //               'CREATE TABLE IF NOT EXISTS ViewMasterDocList(IDDoctor INTEGER,Code VARCHAR,Name VARCHAR,Area VARCHAR,ApprovalStatus NUMERIC)',
  //               [],
  //             );
  //           });

  //           let sql =
  //             'INSERT INTO ViewMasterDocList(IDDoctor,Code,Name,Area,ApprovalStatus) VALUES (?,?,?,?,?)';
  //           //let params = [0, deviceId + useCode, useName, useAValue, ,]; //storing user data in an array
  //           let params = [0, docCode, useName, useAValue, ,]; //storing user data in an array
  //           db.executeSql(sql, params);

  //           db.transaction(tx => {
  //             tx.executeSql(
  //               'CREATE TABLE IF NOT EXISTS CRM_MasterDoctorDataSave (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT);',
  //               [],
  //               (_, result) => {
  //                 console.log('Table created successfully:', result);
  //               },
  //               (_, error) => {
  //                 Alert.alert('Error creating table:', error);
  //               },
  //             );
  //           });

  //           db.transaction(tx => {
  //             tx.executeSql(
  //               'INSERT INTO CRM_MasterDoctorDataSave (data) VALUES (?);',
  //               [JSON.stringify(data)],
  //               (_, result) => {
  //                 console.log('Data inserted successfully:', result);
  //                 db.transaction(tx => {
  //                   tx.executeSql('DELETE from CRM_MasterDoctor');
  //                 });
  //                 db.transaction(tx => {
  //                   tx.executeSql('DELETE from CRM_MasterDoctorCode');
  //                 });
  //                 navigation.navigate('AppNavMaster');
  //               },
  //               (_, error) => {
  //                 console.log('Error inserting data:', error);
  //               },
  //             );
  //           });
  //         }
  //       }, []);
  //     } else {
  //       Alert.alert('Contact With Administrator!');
  //     }
  //   }
  // };

  const addData = () => {
    if (usePLabel.length === 0) {
      Alert.alert('Select Product');
      return;
    }

    if (fStageLabel.length === 0) {
      Alert.alert('Select Stage');
      return;
    }

    // Maximum 6 products
    if (useData.length >= useNoOfDoctorWiseProduct) {
      Alert.alert(`Maximum ${useNoOfDoctorWiseProduct} products can be added.`);
      return;
    }

    // Duplicate Product check
    // const duplicateProduct = useData.some(item => item.ProductValue === usePValue);

    // if (duplicateProduct) {
    //   Alert.alert('This product has already been added.');
    //   return;
    // }

    const duplicateProduct = useData.some(
      item =>
        item.ProductLabel.trim().toUpperCase() ===
        usePLabel.trim().toUpperCase(),
    );

    if (duplicateProduct) {
      Alert.alert('This product has already been added.');
      return;
    }

    // If Product + Stage should be unique instead, use this:
    /*
  const duplicateProduct = data.some(
    item =>
      item.ProductValue === usePValue &&
      item.StageValue === fStageValue,
  );

  if (duplicateProduct) {
    Alert.alert('This product with the selected stage has already been added.');
    return;
  }
  */

    db.transaction(txn => {
      txn.executeSql(
        `CREATE TABLE IF NOT EXISTS CRM_MasterDoctor(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ProductValue VARCHAR,
        ProductLabel VARCHAR,
        StageValue VARCHAR,
        StageLabel VARCHAR
      )`,
        [],
      );

      txn.executeSql(
        `INSERT INTO CRM_MasterDoctor
      (ProductValue, ProductLabel, StageValue, StageLabel)
      VALUES (?, ?, ?, ?)`,
        [usePValue, usePLabel, fStageValue, fStageLabel],
        () => {
          fetchProducts(); // Refresh list after successful insert
        },
        (_, error) => {
          console.log(error);
        },
      );
    });
  };

  const fetchProducts = () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM CRM_MasterDoctor', [], (_, results) => {
        let temp = [];

        for (let i = 0; i < results.rows.length; i++) {
          temp.push(results.rows.item(i));
        }

        setData(temp);
      });
    });
  };

  const saveDoctorOnline = async () => {
    setLoadingSave(true);
    saveInProgress.current = true;
    setIsSaving(true);

    try {
      let formData = new FormData();

      /* ---------- BASIC ---------- */
      formData.append('IDDoctor', '0');
      formData.append('Code', docCode);
      formData.append('Name', useName);
      formData.append('Practice', '');
      formData.append('IDQualification', String(useQValue));
      formData.append('IDDivision', String(useIDDivision));
      formData.append('IDSpeciality', String(useSValue));
      formData.append('IDCategory', String(useCValue));
      formData.append('IDArea', String(useAValue));
      formData.append('IDArea2', '0');
      formData.append('IDHQ', '0');
      formData.append('Mobile', useMobile);
      formData.append('IDFrequency', useFValue);
      formData.append('Email', '');
      formData.append('CreatedBy', useempEmail);
      formData.append('Businessid', useBusinessID);

      /* ---------- EMPLOYEE ---------- */
      formData.append('Employee.IDEmployee', String(useIDEmployee));

      /* ---------- LOCATION ---------- */
      formData.append('Latitude1', '0');
      formData.append('Longitude1', '0');
      formData.append('Latitude2', '0');
      formData.append('Longitude2', '0');

      /* ---------- PRODUCTS ---------- */
      useData.forEach((item, index) => {
        String(parseInt(item.ProductValue));
        //formData.append(`Products[${index}].IDProduct`, item.ProductValue);
        //formData.append(`Products[${index}].IDSatge`, item.StageValue);
        formData.append(
          `Products[${index}].IDProduct`,
          String(parseInt(item.ProductValue)),
        );
        formData.append(
          `Products[${index}].IDSatge`,
          String(parseInt(item.StageValue)),
        );
      });

      /* ---------- DOCTOR TYPE ---------- */
      useType.forEach((item, index) => {
        formData.append(`DoctorType[${index}].IDType`, item.IDMisc ?? item);
      });

      /* ---------- OPTIONAL FILES ---------- */
      if (images?.CARD?.uri) {
        formData.append('VisitCard', {
          uri: images.CARD.uri,
          type: images.CARD.type,
          name: images.CARD.name,
        });
      }

      if (images?.PRESCRIPTION?.uri) {
        formData.append('Prescription', {
          uri: images.PRESCRIPTION.uri,
          type: images.PRESCRIPTION.type,
          name: images.PRESCRIPTION.name,
        });
      }

      console.log('--- FORM DATA START ---');
      formData._parts.forEach(p => console.log(p[0], p[1]));
      console.log('--- FORM DATA END ---');

      let response = await fetch(BASE_URL + 'Doctor/MobileDoctorAddEdit', {
        method: 'POST',
        headers: {'Content-Type': 'multipart/form-data'},
        body: formData,
      });

      let result = await response.json();

      if (result.result === '') {
        db.transaction(tx => tx.executeSql('DELETE FROM CRM_MasterDoctor'));
        db.transaction(tx => tx.executeSql('DELETE FROM CRM_MasterDoctorCode'));

        // Alert.alert(
        //   'Success',
        //   'Record Successfully Saved',
        //   [{text: 'Ok', onPress: () => navigation.navigate('AppNavMaster')}],
        //   {cancelable: false},
        // );
        Alert.alert(
          'Success',
          'Record Successfully Saved',
          [
            {
              text: 'OK',
              onPress: () => {
                setLoadingSave(false);
                navigation.navigate('AppNavMaster');
              },
            },
          ],
          {cancelable: false},
        );
      } else {
        // Alert.alert('Error', result.result);
        // console.error('Doctor upload failed:', result.result);
        Alert.alert(
          'Error',
          `${result.result}`,
          [
            {
              text: 'OK',
              onPress: () => setLoadingSave(false),
            },
          ],
          {cancelable: false},
        );
      }
    } catch (err) {
      console.error('Doctor upload error:', err);
      Alert.alert('Upload Failed', 'Please try again');
    } finally {
      saveInProgress.current = false;
      setIsSaving(false);
    }
  };

  const saveData = async () => {
    // console.log('IDEmployee sending:', useIDEmployee);

    if (useData.length === 0) {
      Alert.alert('Select Product & Stage');
      return;
    }

    const deviceId = DeviceInfo.getDeviceId();

    if (useMobileAccess === 'ONLINE') {
      NetInfo.fetch().then(state => {
        if (state.isConnected) {
          saveDoctorOnline(); // ✅ correct
        } else {
          Alert.alert('You Are Offline Contact With Administrator!');
        }
      });
    } else if (useMobileAccess === 'ONLINE & OFFLINE') {
      NetInfo.fetch().then(state => {
        if (state.isConnected) {
          saveDoctorOnline(); // ✅ correct
        } else {
          /* ---------- OFFLINE SAVE ---------- */
          const offlineData = {
            IDDoctor: 0,
            Code: deviceId + useCode,
            Name: useName,
            IDQualification: useQValue,
            IDDivision: useIDDivision,
            IDSpeciality: useSValue,
            IDCategory: useCValue,
            IDArea: useAValue,
            Mobile: useMobile,
            IDEmployee: useIDEmployee,
            CreatedBy: useempEmail,
            Businessid: useBusinessID,
            IDFrequency: useFValue,
            IDProducts: useData.map(v => v.ProductValue),
            IDStage: useData.map(v => v.StageValue),
            DoctorType: useType.map(v => v.IDMisc ?? v),
          };
          if (saveInProgress.current) {
            return;
          }

          saveInProgress.current = true;
          setIsSaving(true);
          try {
            db.transaction(tx => {
              tx.executeSql(
                'CREATE TABLE IF NOT EXISTS CRM_MasterDoctorDataSave (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)',
              );
              tx.executeSql(
                'INSERT INTO CRM_MasterDoctorDataSave (data) VALUES (?)',
                [JSON.stringify(offlineData)],
              );
            });

            navigation.navigate('AppNavMaster');
          } catch (error) {
            console.error('Error saving offline data:', error);
            Alert.alert(
              'Error',
              'Failed to save data offline. Please try again.',
            );
          } finally {
            saveInProgress.current = false;
            setIsSaving(false);
          }
        }
      });
    } else {
      Alert.alert('Contact With Administrator!');
    }
  };

  const getMapCoordinate = () => {
    const latitude = parseFloat(currentLatitude);
    const longitude = parseFloat(currentLongitude);

    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude !== 0 &&
      longitude !== 0
    ) {
      return {latitude, longitude};
    }

    return null;
  };

  const fetchNearByDoctorList = async (latitude, longitude) => {
    try {
      setNearByDoctorLoading(true);
      setNearByDoctors([]);

      const userValue = await AsyncStorage.getItem('UserData');

      if (!userValue) {
        Alert.alert('User data not found');
        return;
      }

      const user = JSON.parse(userValue);

      const body = {
        IDDivision: Number(user.IDDivision),
        IDEmployee: Number(user.IDEmployee),
        Latitude: String(latitude),
        Longitude: String(longitude),
        Active: true,
        Businessid: user.BusinessID,
      };

      console.log('NearByDoctorList URL:', BASE_URL + 'NearByDoctorList');
      console.log('NearByDoctorList Body:', body);

      const response = await axios.post(BASE_URL + 'NearByDoctorList', body, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('NearByDoctorList Response:', response.data);

      const responseData = response.data?.Data;

      const doctors = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData?.Doctors)
        ? responseData.Doctors
        : [];

      if (response.data?.Success === true && doctors.length > 0) {
        setNearByDoctors(doctors);
      } else {
        setNearByDoctors([]);
        Alert.alert('No nearby doctors found');
      }
    } catch (error) {
      console.log('Nearby Doctor API Error:', error?.response?.data || error);
      Alert.alert('Error', 'Unable to fetch nearby doctors');
    } finally {
      setNearByDoctorLoading(false);
    }
  };

  const getCurrentLocationForMap = () => {
    return new Promise((resolve, reject) => {
      setLocationStatus('Getting Location ...');

      Geolocation.getCurrentPosition(
        async position => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          const latString = String(latitude);
          const longString = String(longitude);

          setLocationStatus('You are Here');
          setCurrentLatitude(latString);
          setCurrentLongitude(longString);

          const region = {
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };

          setMapRegion(region);

          try {
            const response = await Geocoder.from(latitude, longitude);
            const address = response.results?.[0]?.formatted_address || '';
            setLocationAddress(address);
          } catch (error) {
            console.log('Address fetch error:', error);
          }

          resolve({
            latitude,
            longitude,
          });
        },
        error => {
          setLocationStatus(error.message);
          reject(error);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 1000,
        },
      );
    });
  };

  const openLocationMapModal = async () => {
    try {
      setMapModalVisible(true);
      setNearByDoctors([]);
      setNearByDoctorLoading(true);

      const location = await getCurrentLocationForMap();

      await fetchNearByDoctorList(location.latitude, location.longitude);
    } catch (error) {
      setNearByDoctorLoading(false);
      Alert.alert('Location Error', 'Unable to get current location');
    }
  };

  const CorporateHospitalCard = () => {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        // onPress={() => {
        //   console.log('Find nearby network hospital clicked');
        //   // navigation.navigate('NetworkHospital');
        // }}
        onPress={openLocationMapModal}
        style={style.hospitalCardWrapper}>
        <LinearGradient
          colors={['#2F80ED', '#4B3F8F']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={style.hospitalCard}>
          <View style={style.hospitalIconBox}>
            <MaterialCommunityIcons
              name="hospital-building"
              size={18}
              color="#fff"
            />
          </View>

          {/* <View style={{flex: 1}}>
            <Text style={style.hospitalCardTitle}>
              Find nearby network Doctors
            </Text>
            <Text style={style.hospitalCardSubtitle}>
              Discover 15,000+ network Doctors
            </Text>
          </View> */}
          <View style={{flex: 1}}>
            <Text style={style.hospitalCardTitle}>Find Nearby Doctors</Text>
            <Text style={style.hospitalCardSubtitle}>Discover Doctors</Text>
          </View>

          <View style={style.hospitalArrowBox}>
            <Feather name="chevron-right" size={18} color="#fff" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const handleDoctorPress = async docID => {
    console.log('Doctor pressed:', docID);
    try {
      const response = await axios.get(
        `${BASE_URL}Doctor/DoctorDetailByID?Businessid=${useBusinessID}&IDDoctor=${docID}`,
      );

      console.log('Doctor detail response:', response.data[0].Name);
      setDoctor(response.data[0]);
      setName(response.data[0].Name);
      setMobile(response.data[0].Mobile);

      setShowData(false);
      setMapModalVisible(false);
    } catch (error) {
      console.log('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareLayout>
      <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />
      {shouldShowMD ? (
        <View
          style={{
            padding: 8,
            margin: 5,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: 'lightgrey',
            backgroundColor: 'white',
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.8,
            shadowRadius: 2,
            elevation: 5,
          }}>
          <Text style={{fontWeight: 'bold', marginBottom: 5, fontSize: 16}}>
            Doctor Information
          </Text>
          <CorporateHospitalCard />
          {showData ? (
            <SafeAreaView>
              <View>
                <TextInput
                  label="Name"
                  mode="outlined"
                  autoCapitalize="words"
                  autoCorrect={false}
                  value={useName}
                  onChangeText={text => {
                    const filteredText = text.replace(/[^a-zA-Z.\s]/g, '');
                    setName(filteredText);
                  }}
                />

                <View
                  style={{
                    marginTop: 5,
                  }}>
                  <TextInput
                    label="Code"
                    mode="outlined"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{marginBottom: 5}}
                    value={docCode}
                    editable={false}
                    // onChangeText={text => setDocCode(text)}
                  />
                </View>
                <View
                  style={{
                    marginTop: 5,
                    // marginBottom: 2,
                    // paddingBottom: 2,
                    paddingTop: 5,
                  }}>
                  <Dropdown
                    style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                    placeholderStyle={style.placeholderStyle}
                    selectedTextStyle={style.selectedTextStyle}
                    inputSearchStyle={style.inputSearchStyle}
                    iconStyle={style.iconStyle}
                    data={useQData}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={!isFocus ? 'Qualification' : '...'}
                    searchPlaceholder="Search"
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={item => {
                      console.log(item.label);
                      setQLabel(item.label);
                      setQValue(item.value);
                      // handleState(item.value);
                      setIsFocus(false);
                    }}
                  />
                </View>
                <View
                  style={{
                    marginTop: 5,
                    // marginBottom: 2,
                    // paddingBottom: 2,
                    paddingTop: 5,
                  }}>
                  <Dropdown
                    style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                    placeholderStyle={style.placeholderStyle}
                    selectedTextStyle={style.selectedTextStyle}
                    inputSearchStyle={style.inputSearchStyle}
                    iconStyle={style.iconStyle}
                    data={useSData}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={!isFocus ? 'Speciality' : '...'}
                    searchPlaceholder="Search"
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={item => {
                      console.log(item.label);
                      console.log(item.value);
                      setSLabel(item.label);
                      setSValue(item.value);
                      setIsFocus(false);
                    }}
                  />
                </View>
                <View
                  style={{
                    marginTop: 5,
                    // marginBottom: 2,
                    // paddingBottom: 2,
                    paddingTop: 5,
                  }}>
                  <Dropdown
                    style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                    placeholderStyle={style.placeholderStyle}
                    selectedTextStyle={style.selectedTextStyle}
                    inputSearchStyle={style.inputSearchStyle}
                    iconStyle={style.iconStyle}
                    data={useCData}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={!isFocus ? 'Category' : '...'}
                    searchPlaceholder="Search"
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={item => {
                      console.log(item.label);
                      setCLabel(item.label);
                      setCValue(item.value);
                      setIsFocus(false);
                    }}
                  />
                </View>
                <View
                  style={{
                    marginTop: 5,
                    // marginBottom: 2,
                    // paddingBottom: 2,
                    paddingTop: 5,
                  }}>
                  {/* {useBusinessID === 'MEND-PVTL-890' ? ( */}
                  {/* <MultipleSelectList
                    setSelected={val => setType(val)}
                    data={useTypeSelected}
                    placeholder="Type"
                    label="Type"
                    //save="value"
                    save="key"
                    onSelect={
                      () => console.log(useType)
                      //multiSelectAreaList()
                    }
                    fontFamily="Roboto-Bold"
                    notFoundText="No Data Exists"
                    //badgeTextStyles={{color:'red'}}
                    badgeStyles={{backgroundColor: 'green'}}
                    labelStyles={{fontWeight: '800', color: 'black'}}
                  /> */}
                  {/* ) : null} */}

                  <View
                    style={{
                      marginBottom: 5,
                    }}>
                    <Dropdown
                      style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                      placeholderStyle={style.placeholderStyle}
                      selectedTextStyle={style.selectedTextStyle}
                      inputSearchStyle={style.inputSearchStyle}
                      iconStyle={style.iconStyle}
                      data={useFData}
                      search
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      placeholder={!isFocus ? 'Frequency' : '...'}
                      searchPlaceholder="Search"
                      onFocus={() => setIsFocus(true)}
                      onBlur={() => setIsFocus(false)}
                      onChange={item => {
                        console.log(item.label);
                        setFLabel(item.label);
                        setFValue(item.value);
                        // handleState(item.value);
                        setIsFocus(false);
                      }}
                    />
                  </View>

                  <Dropdown
                    style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                    placeholderStyle={style.placeholderStyle}
                    selectedTextStyle={style.selectedTextStyle}
                    inputSearchStyle={style.inputSearchStyle}
                    iconStyle={style.iconStyle}
                    data={useAData}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    dropdownPosition="top"
                    placeholder={!isFocus ? 'Area' : '...'}
                    searchPlaceholder="Search"
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={item => {
                      console.log(item.label);
                      setALabel(item.label);
                      setAValue(item.value);
                      setIsFocus(false);
                    }}
                  />
                </View>
                <TextInput
                  label="Mobile"
                  mode="outlined"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={10}
                  value={useMobile}
                  keyboardType="numeric"
                  onChangeText={text => setMobile(text)}
                />
              </View>
              <View style={{margin: 2, padding: 2}}>
                <CustomButton label={'Next'} onPress={() => next()} />
              </View>
            </SafeAreaView>
          ) : (
            <SafeAreaView>
              <TextInput
                label="Doctor Name"
                value={doctor?.Name || ''}
                mode="outlined"
                editable={false}
                style={style.input}
              />

              <TextInput
                label="Doctor Code"
                value={docCode}
                mode="outlined"
                editable={false}
                keyboardType="email-address"
                style={style.input}
              />
              <TextInput
                label="Qualification"
                value={doctor?.Qualification?.Name || ''}
                mode="outlined"
                editable={false}
                style={style.input}
              />

              <TextInput
                label="Speciality"
                value={doctor?.Speciality?.Name || ''}
                mode="outlined"
                editable={false}
                style={style.input}
              />

              <TextInput
                label="Category"
                value={doctor?.Category?.Name || ''}
                mode="outlined"
                editable={false}
                style={style.input}
              />

              <TextInput
                label="Area"
                value={doctor?.Area1?.Name || ''}
                mode="outlined"
                editable={false}
                style={style.input}
              />

              {/* <MultipleSelectList
                setSelected={val => setType(val)}
                data={useTypeSelected}
                placeholder="Type"
                label="Type"
                //save="value"
                save="key"
                onSelect={
                  () => console.log(useType)
                  //multiSelectAreaList()
                }
                fontFamily="Roboto-Bold"
                notFoundText="No Data Exists"
                //badgeTextStyles={{color:'red'}}
                badgeStyles={{backgroundColor: 'green'}}
                labelStyles={{fontWeight: '800', color: 'black'}}
              /> */}

              <Dropdown
                style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                placeholderStyle={style.placeholderStyle}
                selectedTextStyle={style.selectedTextStyle}
                inputSearchStyle={style.inputSearchStyle}
                iconStyle={style.iconStyle}
                data={useFData}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? 'Frequency' : '...'}
                searchPlaceholder="Search"
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  console.log(item.label);
                  setFLabel(item.label);
                  setFValue(item.value);
                  // handleState(item.value);
                  setIsFocus(false);
                }}
              />

              <TextInput
                label="Mobile"
                value={useMobile}
                mode="outlined"
                editable={true}
                keyboardType="phone-pad"
                style={style.input}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={10}
                onChangeText={text => setMobile(text)}
              />
              <View style={{margin: 2, padding: 2}}>
                <CustomButton label={'Next'} onPress={() => nextDoctor()} />
              </View>
            </SafeAreaView>
          )}
        </View>
      ) : (
        <ScrollView
          style={{
            padding: 8,
            margin: 5,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: 'lightgrey',
            backgroundColor: 'white',
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.8,
            shadowRadius: 2,
            elevation: 5,
          }}>
          <Text style={{fontWeight: 'bold', marginBottom: 5, fontSize: 16}}>
            Doctor Information
          </Text>
          {/* <CorporateHospitalCard /> */}
          <View
            style={{
              marginTop: 5,
              // marginBottom: 2,
              // paddingBottom: 2,
              paddingTop: 5,
            }}>
            <Dropdown
              style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
              placeholderStyle={style.placeholderStyle}
              selectedTextStyle={style.selectedTextStyle}
              inputSearchStyle={style.inputSearchStyle}
              iconStyle={style.iconStyle}
              data={usePData}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={!isFocus ? 'Product' : '...'}
              searchPlaceholder="Search"
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={item => {
                console.log(item.label);
                setPLabel(item.label);
                setPValue(item.value);
                setIsFocus(false);
              }}
            />
          </View>
          <View
            style={{
              marginTop: 5,
              // marginBottom: 2,
              // paddingBottom: 2,
              paddingTop: 5,
            }}>
            <Dropdown
              style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
              placeholderStyle={style.placeholderStyle}
              selectedTextStyle={style.selectedTextStyle}
              inputSearchStyle={style.inputSearchStyle}
              iconStyle={style.iconStyle}
              data={fStageData}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={!isFocus ? 'Stage' : '...'}
              searchPlaceholder="Search"
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={item => {
                console.log(item.label);
                setfStageLabel(item.label);
                setfStageValue(item.value);
                setIsFocus(false);
              }}
            />
          </View>
          <View style={{margin: 2, padding: 2}}>
            <CustomButton label={'Add'} onPress={() => addData()} />
          </View>
          {useData && useData.length > 0 ? (
            <View style={{margin: 5}}>
              {/* Header */}
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: '#005696',
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 15,
                }}>
                <Text style={{flex: 0.2, color: '#fff', fontWeight: 'bold'}}>
                  No
                </Text>
                <Text style={{flex: 0.4, color: '#fff', fontWeight: 'bold'}}>
                  Product
                </Text>
                <Text style={{flex: 0.3, color: '#fff', fontWeight: 'bold'}}>
                  Stage
                </Text>
                <Text
                  style={{
                    flex: 0.1,
                    color: '#fff',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}>
                  Del
                </Text>
              </View>

              {/* Body */}
              <ScrollView style={{maxHeight: 400}}>
                {useData.map((dataItem, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      backgroundColor: index % 2 === 0 ? '#f7f9f9' : '#ecf0f1',
                      paddingVertical: 10,
                      paddingHorizontal: 15,
                      borderBottomWidth: 1,
                      borderColor: '#ddd',
                      alignItems: 'center',
                    }}>
                    <Text style={{flex: 0.2, color: '#000'}}>{index + 1}</Text>
                    <Text style={{flex: 0.4, color: '#000', fontWeight: '600'}}>
                      {dataItem.ProductLabel}
                    </Text>
                    <Text style={{flex: 0.3, color: '#000'}}>
                      {dataItem.StageLabel}
                    </Text>
                    <TouchableOpacity
                      style={{flex: 0.1, alignItems: 'center'}}
                      onPress={() => onDelete(dataItem.id)}>
                      <AntDesign name="delete" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* <View style={{ alignItems: 'center', margin: 10 }}>
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={{ height: 200, width: 200 }}
                resizeMode="contain"
              />
            )}
          </View> */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingHorizontal: 15, marginTop: 10}}>
            {images.CARD.uri ? (
              <TouchableOpacity
                onPress={() => {
                  setPreviewUri(images.CARD.uri);
                  setPreviewVisible(true);
                }}
                style={{marginRight: 20, marginLeft: 25}}>
                <Image source={{uri: images.CARD.uri}} style={style.thumb} />
                <Text style={style.thumbLabel}>Card</Text>
              </TouchableOpacity>
            ) : null}

            {images.PRESCRIPTION.uri ? (
              <TouchableOpacity
                onPress={() => {
                  setPreviewUri(images.PRESCRIPTION.uri);
                  setPreviewVisible(true);
                }}>
                <Image
                  source={{uri: images.PRESCRIPTION.uri}}
                  style={style.thumb}
                />
                <Text style={style.thumbLabel}>Prescription</Text>
              </TouchableOpacity>
            ) : null}
          </ScrollView>

          <Modal
            visible={previewVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setPreviewVisible(false)}>
            <View style={style.previewContainer}>
              {/* Close button */}
              <TouchableOpacity
                style={style.closeBtn}
                onPress={() => setPreviewVisible(false)}>
                <Text style={{color: '#fff', fontSize: 18}}>✕</Text>
              </TouchableOpacity>

              {/* Scroll down to close */}
              <ScrollView
                maximumZoomScale={3}
                minimumZoomScale={1}
                contentContainerStyle={style.previewScroll}
                onScrollEndDrag={e => {
                  if (e.nativeEvent.contentOffset.y > 120) {
                    setPreviewVisible(false);
                  }
                }}>
                <Image
                  source={{uri: previewUri}}
                  style={style.previewImage}
                  resizeMode="contain"
                />
              </ScrollView>
            </View>
          </Modal>

          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              // marginTop: 5,
            }}>
            {/* <Button
              title="Attach Image"
              onPress={() => setModalVisible(true)}
            /> */}
            <TouchableOpacity
              style={style.button1}
              onPress={() => {
                setActiveImageType('CARD');
                setModalVisible(true);
              }}>
              <Text style={{color: '#fff'}}>Attach Card Image</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={style.button1}
              onPress={() => {
                setActiveImageType('PRESCRIPTION');
                setModalVisible(true);
              }}>
              <Text style={{color: '#fff'}}>Attach Prescription Image</Text>
            </TouchableOpacity>

            {/* <AvatarAlert
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
            /> */}
            {/* <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(!modalVisible);
              }}>
              <View style={style.centeredView}>
                <View style={style.modalView}>
                  <TouchableOpacity
                    style={style.button}
                    onPress={handleCameraLaunch}>
                    <Text style={style.modalText}>Take Photo...</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={style.button}
                    onPress={openImagePicker}>
                    <Text style={style.modalText}>Choose from Library...</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[style.button, style.cancelButton]}
                    onPress={() => setModalVisible(!modalVisible)}>
                    <Text style={style.modalText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal> */}
            <Modal
              animationType="slide"
              transparent
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}>
              <View style={style.centeredView}>
                <View style={style.modalView}>
                  <TouchableOpacity
                    style={style.button}
                    onPress={handleCameraLaunch}>
                    <Text>Take Photo...</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={style.button}
                    onPress={openImagePicker}>
                    <Text>Choose from Library...</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[style.button, style.cancelButton]}
                    onPress={() => setModalVisible(false)}>
                    <Text style={{color: '#fff'}}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>

          {/* <View>
            {useData.length
              ? useData.map(function (dataItem, index) {
                return (
                  // <ScrollView>
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
                          marginLeft: 20,
                        }}>
                        <AntDesign
                          name="delete"
                          size={30}
                          color="red"
                          onPress={() => {
                            onDelete(dataItem.id);
                          }}
                        />
                      </View>
                      <View
                        style={{
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: 20,
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                          }}>
                          <Text
                            style={{
                              fontSize: 14,
                              fontFamily: 'Lato-Regular',
                              color: '#000',
                              marginTop: 5,
                              paddingTop: 5,
                              textAlignVertical: 'center',
                            }}>
                            Product :{' '}
                          </Text>
                          <Text
                            style={{
                              fontSize: 16,
                              fontFamily: 'Lato-Bold',
                              color: '#000',
                              marginTop: 5,
                              paddingTop: 5,
                              textAlignVertical: 'center',
                            }}>
                            {dataItem.ProductLabel}
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
                              marginTop: 5,
                              paddingTop: 5,
                              textAlignVertical: 'center',
                            }}>
                            Stage :{' '}
                          </Text>
                          <Text
                            style={{
                              fontSize: 16,
                              fontFamily: 'Lato-Bold',
                              color: '#000',
                              marginTop: 5,
                              paddingTop: 5,
                              textAlignVertical: 'center',
                            }}>
                            {dataItem.StageLabel}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                  //</ScrollView>
                );
              })
              : null}
          </View> */}

          <View
            style={{
              marginLeft: 5,
              marginRight: 5,
              paddingLeft: 5,
              paddingRight: 5,
            }}>
            <CustomButton
              label={'Save'}
              disabled={isSaving}
              onPress={() => saveData()}
            />
          </View>
          <ProgressDialog visible={loading} message="Please Wait..." />
        </ScrollView>
      )}

      {/* Map Modal */}
      <Modal
        visible={mapModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMapModalVisible(false)}>
        <View style={style.mapModalOverlay}>
          <View style={style.mapModalBox}>
            <View style={style.mapModalHeader}>
              <View>
                <Text style={style.mapModalTitle}>Current Location</Text>
                <Text style={style.mapModalSubTitle} numberOfLines={1}>
                  {locationAddress || 'Fetching address...'}
                </Text>
              </View>

              <TouchableOpacity
                style={style.mapCloseBtn}
                onPress={() => setMapModalVisible(false)}>
                <Text style={style.mapCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {mapRegion ? (
              <>
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={style.mapView}
                  initialRegion={mapRegion}
                  showsUserLocation={true}
                  showsMyLocationButton={true}>
                  <Marker
                    coordinate={{
                      latitude: mapRegion.latitude,
                      longitude: mapRegion.longitude,
                    }}
                    title="My Location"
                    description={locationAddress || 'Current location'}
                    pinColor="#166AD4"
                  />

                  {nearByDoctors.map((doctor, index) => {
                    const doctorLat = Number(doctor.Latitude);
                    const doctorLong = Number(doctor.Lontitude); // API spelling is Lontitude

                    if (
                      !Number.isFinite(doctorLat) ||
                      !Number.isFinite(doctorLong)
                    ) {
                      return null;
                    }

                    return (
                      <Marker
                        key={`${doctor.IDDoctor}_${index}`}
                        coordinate={{
                          latitude: doctorLat,
                          longitude: doctorLong,
                        }}
                        title={doctor.Name}
                        description={`${doctor.distance} meter away`}
                        pinColor={
                          doctor.IsInsideGeofence ? '#55a070' : '#EF4444'
                        }
                      />
                    );
                  })}
                </MapView>

                <View style={style.doctorListBox}>
                  <View style={style.doctorListHeader}>
                    <Text style={style.doctorListTitle}>
                      Nearby Doctors ({nearByDoctors.length})
                    </Text>

                    {nearByDoctorLoading ? (
                      <ActivityIndicator size="small" color="#166AD4" />
                    ) : null}
                  </View>

                  {nearByDoctors.length > 0 ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={style.doctorScrollContent}>
                      {nearByDoctors.map((doctor, index) => (
                        <TouchableOpacity
                          key={`${doctor.IDDoctor}_card_${index}`}
                          style={style.doctorCard}
                          onPress={() => handleDoctorPress(doctor.IDDoctor)}>
                          <Text style={style.doctorName} numberOfLines={1}>
                            {doctor.Name}
                          </Text>

                          <Text style={style.doctorCode} numberOfLines={1}>
                            {doctor.Code}
                          </Text>

                          <View style={style.distanceRow}>
                            <View
                              style={[
                                style.geoDot,
                                {
                                  backgroundColor: doctor.IsInsideGeofence
                                    ? '#16A34A'
                                    : '#EF4444',
                                },
                              ]}
                            />

                            <Text style={style.distanceText}>
                              {doctor.distance} m away
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  ) : (
                    <Text style={style.noDoctorText}>
                      {nearByDoctorLoading
                        ? 'Fetching nearby doctors...'
                        : 'No nearby doctors found'}
                    </Text>
                  )}
                </View>
              </>
            ) : (
              <View style={style.noLocationBox}>
                <Text style={style.noLocationText}>
                  Location not available. Please wait or enable GPS.
                </Text>

                <TouchableOpacity
                  style={style.refreshLocationBtn}
                  onPress={openLocationMapModal}>
                  <Text style={style.refreshLocationText}>
                    Refresh Location
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
      {loadingSave && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 999,
          }}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
    </KeyboardAwareLayout>
  );
};

export default MasterDoctor;

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
    fontSize: 16,
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
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    marginTop: 2,
    paddingTop: 2,
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
    borderRadius: 2,
  },
  menuItem: {
    fontSize: 14,
    fontFamily: 'Lato-Bold',
    color: '#000',
    margin: 5,
    padding: 5,
    textAlignVertical: 'center',
    textAlign: 'center',
    alignItems: 'center', // Centered horizontally
  },
  input: {
    marginBottom: 12,
  },
  areaStyle: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
    borderColor: 'black',
    //borderWidth: 1,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 5,
    //elevation: 5,
    borderRadius: 5,
  },
  button1: {
    width: '90%',
    padding: 10,
    //marginVertical: 5,
    backgroundColor: '#166AD4',
    borderRadius: 5,
    alignItems: 'center',
    margin: 6,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  button: {
    width: '100%',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
  cancelButton: {
    width: '100%',
    padding: 10,
    marginTop: 10,
    backgroundColor: '#ff4444',
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: 'white',
  },
  thumb: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  thumbLabel: {
    textAlign: 'center',
    marginTop: 4,
    fontSize: 12,
  },

  previewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  closeBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  previewScroll: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  hospitalCardWrapper: {
    marginTop: 6,
    marginBottom: 12,
  },

  hospitalCard: {
    minHeight: 64,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },

  hospitalIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E7354F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },

  hospitalCardTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },

  hospitalCardSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    marginTop: 3,
  },

  hospitalArrowBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  mapModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  mapModalBox: {
    width: '92%',
    height: '75%',
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 8,
  },

  mapModalHeader: {
    minHeight: 68,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
  },

  mapModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  mapModalSubTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
    maxWidth: 250,
  },

  mapCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },

  mapCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  mapView: {
    flex: 1,
  },

  noLocationBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  noLocationText: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    marginBottom: 12,
  },

  refreshLocationBtn: {
    backgroundColor: '#166AD4',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },

  refreshLocationText: {
    color: '#fff',
    fontWeight: '700',
  },
  doctorListBox: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 14,
    padding: 10,
    elevation: 6,
  },

  doctorListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  doctorListTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },

  doctorScrollContent: {
    paddingRight: 8,
  },

  doctorCard: {
    width: 170,
    padding: 10,
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  doctorName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },

  doctorCode: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 3,
  },

  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  geoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  distanceText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },

  noDoctorText: {
    fontSize: 12,
    color: '#6B7280',
    paddingVertical: 8,
  },
});
