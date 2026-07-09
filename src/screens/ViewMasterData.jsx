import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
  TextInput,
  TouchableOpacity,
  ScrollView,
  LogBox,
  Modal,
  ActivityIndicator,
  Alert,
  BackHandler,
  StatusBar,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import React, {useEffect, useState, useCallback} from 'react';
import {openDatabase} from 'react-native-sqlite-storage';
import CustomViewMaster from '../components/custom/CustomViewMaster';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {BASE_URL} from '@env';
import {Image} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {useNavigation} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import LottieView from 'lottie-react-native';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import {
  launchImageLibrary as _launchImageLibrary,
  launchCamera as _launchCamera,
} from 'react-native-image-picker';
let launchImageLibrary = _launchImageLibrary;
let launchCamera = _launchCamera;
// Open DB
const db = openDatabase(
  {name: 'CRM_db', location: 'default'},
  () => console.log('Database connected!'),
  error => console.log('Database error', error),
);

const ViewMasterData = () => {
  const navigation = useNavigation();
  const [gamesTab, setGamesTab] = useState(1);
  const [useDoctors, setDoctors] = useState([]);
  const [useRetailers, setRetailers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryRet, setSearchQueryRet] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null); // track which product is being edited
  const [productList, setProductList] = useState([]);
  const [stageList, setStageList] = useState([]);
  const [isFocus, setIsFocus] = useState(false);
  const [isAddProductModalVisible, setIsAddProductModalVisible] =
    useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [address1, setAddress1] = useState('');
  const [pincode, setPincode] = useState('');
  const [Mobile, setMobile] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [activeImageType, setActiveImageType] = useState(null); // 'CARD' | 'PRESCRIPTION'
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUri, setPreviewUri] = useState('');
  const [saving, setSaving] = useState(false);
  const [useFData, setFData] = useState([]);
  const [useFValue, setFValue] = useState('');
  const [useFLabel, setFLabel] = useState('');

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
    LogBox.ignoreLogs([
      'VirtualizedLists should never be nested',
      'Each child in a list should have a unique "key" prop.',
    ]);

    // Step 1: Create tables if not exist
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS ViewMasterDocList (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          Name TEXT,
          Code TEXT,
          Area TEXT,
          ApprovalStatus INTEGER
        )`,
      );
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS ViewMasterRetList (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          Name TEXT,
          Code TEXT,
          Area TEXT,
          ApprovalStatus INTEGER
        )`,
      );
    });

    // Step 2: Load data
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          NetInfo.fetch().then(async state => {
            if (state.isConnected) {
              // Fetch doctor list
              const url = `${BASE_URL}Doctor/Mobile/List?Businessid=${user.BusinessID}&EntryUser=${user.Empemail}&IDEmployee=${user.IDEmployee}`;
              console.log(url);

              let result = await fetch(url);
              result = await result.json();
              setDoctors(result);

              // Save to local DB
              db.transaction(tx => {
                tx.executeSql('DELETE FROM ViewMasterDocList');
                result.forEach(doc => {
                  tx.executeSql(
                    'INSERT INTO ViewMasterDocList (Name, Code, Area, ApprovalStatus) VALUES (?, ?, ?, ?)',
                    [doc.Name, doc.Code, doc.Area, doc.ApprovalStatus],
                  );
                });
              });

              const furl = `${BASE_URL}Misc/List?Businessid=${user.BusinessID}&Type=FREQUENCYTYPE`;
              console.log(furl);
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

              // Fetch retailer list
              const empurl = `${BASE_URL}Retailer/Mobile/List?Businessid=${user.BusinessID}&EntryUser=${user.Empemail}&IDEmployee=${user.IDEmployee}`;
              let result_empurl = await fetch(empurl);
              result_empurl = await result_empurl.json();
              setRetailers(result_empurl);

              // Save to local DB
              db.transaction(tx => {
                tx.executeSql('DELETE FROM ViewMasterRetList');
                result_empurl.forEach(ret => {
                  tx.executeSql(
                    'INSERT INTO ViewMasterRetList (Name, Code, Area, ApprovalStatus) VALUES (?, ?, ?, ?)',
                    [ret.Name, ret.Code, ret.Area, ret.ApprovalStatus],
                  );
                });
              });
            } else {
              // Offline fallback
              db.transaction(tx => {
                tx.executeSql(
                  'SELECT * FROM ViewMasterDocList',
                  [],
                  (_, results) => {
                    let temp = [];
                    for (let i = 0; i < results.rows.length; ++i) {
                      temp.push(results.rows.item(i));
                    }
                    setDoctors(temp);
                  },
                  (tx, error) => {
                    console.log('Error fetching doctor data:', error.message);
                  },
                );
              });

              db.transaction(tx => {
                tx.executeSql(
                  'SELECT * FROM ViewMasterRetList',
                  [],
                  (_, results) => {
                    let temp = [];
                    for (let i = 0; i < results.rows.length; ++i) {
                      temp.push(results.rows.item(i));
                    }
                    setRetailers(temp);
                  },
                  (tx, error) => {
                    console.log('Error fetching retailer data:', error.message);
                  },
                );
              });
            }
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
    if (selectedDoctor) {
      setAddress1(selectedDoctor.Address1 || '');
      setPincode(selectedDoctor.Pincode || '');
      setMobile(selectedDoctor.Mobile || '');
    }
  }, [selectedDoctor]);

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

  const handleEdit = async item => {
    const IDDoctor = item.IDDoctor || item.ID;
    const userData = await AsyncStorage.getItem('UserData');
    const user = JSON.parse(userData);

    setIsLoading(true); // start loader

    try {
      const net = await NetInfo.fetch();
      if (!net.isConnected) {
        Alert.alert('No internet connection.');
        return;
      }

      // 1. Fetch doctor detail
      const url = `${BASE_URL}Doctor/Mobile/DoctorDetailByID?Businessid=${user.BusinessID}&IDDoctor=${IDDoctor}`;
      console.log('Fetching doctor details from:', url);
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch doctor details');
      const json = await res.json();
      const doctor = json[0];
      setSelectedDoctor(doctor);
      // Frequency
      setFLabel(doctor.Frequency || '');
      setFValue(doctor.IDFrequency || '');

      // 2. Fetch products
      //const divisionId = doctor?.Division?.IDDivision || 0;
      const divisionId = doctor?.IDDivision || 0;
      const productUrl = `${BASE_URL}Product/ProductDivisionTypeList?Businessid=${user.BusinessID}&IDDivision=${divisionId}&Type=DOCTORPRODUCT`;
      console.log('productUrl', productUrl);

      const productRes = await fetch(productUrl);
      if (!productRes.ok) throw new Error('Failed to fetch products');
      const productJson = await productRes.json();
      setProductList(
        productJson.map(p => ({label: p.Name, value: p.IDProduct})),
      );

      // 3. Fetch stages
      const stageUrl = `${BASE_URL}Misc/List?Businessid=${user.BusinessID}&Type=TARGET`;
      const stageRes = await fetch(stageUrl);
      if (!stageRes.ok) throw new Error('Failed to fetch stages');
      const stageJson = await stageRes.json();
      setStageList(stageJson.map(s => ({label: s.Name, value: s.IDMisc})));

      // ✅ Only open modal if all above succeeds
      setIsModalVisible(true);
    } catch (err) {
      console.error(err);
      Alert.alert(err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false); // Always stop loader
    }
  };

  // New saveData method for Modal Submit button
  // const saveData = async () => {
  //   if (
  //     !selectedDoctor ||
  //     !selectedDoctor.Products ||
  //     selectedDoctor.Products.length === 0
  //   ) {
  //     Alert.alert('Select Product & Stage');
  //     return;
  //   }

  //   const userData = await AsyncStorage.getItem('UserData');
  //   const user = JSON.parse(userData);
  //   //const deviceId = DeviceInfo.getDeviceId();

  //   const productsID = selectedDoctor.Products.map(p => ({
  //     IDProduct: p.Product.IDProduct,
  //     IDSatge: p.Stage.IDMisc,
  //   }));

  //   const data = {
  //     IDDoctor: selectedDoctor.IDDoctor || 0,
  //     Code: selectedDoctor.Code || '',
  //     Name: selectedDoctor.Name,
  //     Practice: '',
  //     IDQualification: selectedDoctor.Qualification?.IDQualification || 0,
  //     IDDivision: selectedDoctor.Division?.IDDivision || 0,
  //     IDSpeciality: selectedDoctor.Speciality?.IDSpeciality || 0,
  //     IDCategory: selectedDoctor.Category?.IDMisc || 0,
  //     IDArea: selectedDoctor.Area1?.IDArea || 0,
  //     IDArea2: 0,
  //     IDHQ: selectedDoctor.HQ?.IDHQ || 0,
  //     Mobile: selectedDoctor.Mobile || '',
  //     Email: selectedDoctor.Email || '',
  //     Employee: {IDEmployee: user.IDEmployee},
  //     Latitude1: 0,
  //     Longitude1: 0,
  //     Latitude2: 0,
  //     Longitude2: 0,
  //     Address1: selectedDoctor.Address1 || '',
  //     Address2: selectedDoctor.Address2 || '',
  //     Pincode: selectedDoctor.Pincode || '',
  //     DOB: selectedDoctor.DOB || '',
  //     Age: selectedDoctor.Age || 0,
  //     PatientNo: selectedDoctor.PatientNo || 0,
  //     CreatedBy: user.Empemail,
  //     Businessid: user.BusinessID,
  //     Products: productsID,
  //   };

  //   console.log('Submitting:', data);

  //   NetInfo.fetch().then(async state => {
  //     if (state.isConnected) {
  //       try {
  //         const response = await fetch(
  //           BASE_URL + 'Doctor/MobileDoctorAddEdit',
  //           {
  //             method: 'POST',
  //             headers: {
  //               Accept: 'application/json',
  //               'Content-Type': 'application/json',
  //             },
  //             body: JSON.stringify(data),
  //           },
  //         );

  //         const result = await response.json();
  //         console.log('API Result:', result);

  //         if (result.result === '') {
  //           Alert.alert('Success', 'Record Successfully Saved', [
  //             {text: 'Ok', onPress: () => navigation.navigate('AppNavMaster')},
  //           ]);
  //         } else {
  //           Alert.alert('Error', result.result);
  //         }
  //       } catch (err) {
  //         console.log('Error submitting doctor:', err);
  //         Alert.alert('Error', 'Something went wrong while saving.');
  //       }
  //     } else {
  //       Alert.alert(
  //         'No internet connection',
  //         'You are offline, try again later.',
  //       );
  //     }
  //   });
  // };

  const saveData = async () => {
    if (
      !selectedDoctor ||
      !selectedDoctor.Products ||
      selectedDoctor.Products.length === 0
    ) {
      Alert.alert('Select Product & Stage');
      return;
    }
    /* 🔴 HARD VALIDATION (EDIT FIX) */
    // const address1 = (address1 || '').trim();
    // const pincode = (pincode || '').trim();
    // const Mobile = (Mobile || '').trim();

    if (!address1) {
      Alert.alert('Validation', 'Address is mandatory');
      return;
    }
    if (!pincode || pincode.length !== 6) {
      Alert.alert('Validation', 'Valid 6-digit Pincode is mandatory');
      return;
    }
    if (!Mobile || Mobile.length !== 10) {
      Alert.alert('Validation', 'Valid 10-digit Mobile number is mandatory');
      return;
    }
    setSaving(true); // 🔵 START LOADER
    const userData = await AsyncStorage.getItem('UserData');
    const user = JSON.parse(userData);

    NetInfo.fetch().then(async state => {
      if (!state.isConnected) {
        setSaving(false); // 🔴 STOP LOADER
        Alert.alert('No internet connection');
        return;
      }

      try {
        const formData = new FormData();

        /* ---------- BASIC ---------- */
        formData.append('IDDoctor', String(selectedDoctor.IDDoctor ?? 0));
        formData.append('Code', String(selectedDoctor.Code ?? ''));
        formData.append('Name', String(selectedDoctor.Name ?? ''));
        formData.append('IDFrequency', useFValue);
        formData.append('Practice', '');

        formData.append(
          'IDQualification',
          //String(selectedDoctor.Qualification?.IDQualification ?? 0),
          String(selectedDoctor.IDQualification ?? 0),
        );
        formData.append(
          'IDDivision',
          //String(selectedDoctor.Division?.IDDivision ?? 0),
          String(selectedDoctor.IDDivision ?? 0),
        );
        formData.append(
          'IDSpeciality',
          String(selectedDoctor.IDSpeciality ?? 0),
        );
        formData.append('IDCategory', String(selectedDoctor.IDMisc ?? 0));
        //formData.append('IDArea', String(selectedDoctor.Area1?.IDArea ?? 0));
        formData.append('IDArea', String(selectedDoctor.IDArea1 ?? 0));
        formData.append('IDArea2', '0');
        formData.append('IDHQ', String(selectedDoctor.HQ?.IDHQ ?? 0));

        formData.append('Mobile', Mobile); // NEVER EMPTY
        formData.append('Email', String(selectedDoctor.Email ?? ''));

        /* ---------- ADDRESS (CRITICAL FIX) ---------- */
        formData.append('Address1', address1); // NEVER EMPTY
        formData.append('Address2', String(selectedDoctor.Address2 ?? ''));
        formData.append('Pincode', pincode); // NEVER EMPTY

        /* ---------- PERSONAL ---------- */
        formData.append('DOB', String(selectedDoctor.DOB ?? ''));
        formData.append('Age', String(selectedDoctor.Age ?? 0));
        formData.append('PatientNo', String(selectedDoctor.PatientNo ?? 0));

        /* ---------- LOCATION ---------- */
        formData.append('Latitude1', String(selectedDoctor.Latitude1 ?? 0));
        formData.append('Longitude1', String(selectedDoctor.Longitude1 ?? 0));
        formData.append('Latitude2', '0');
        formData.append('Longitude2', '0');

        /* ---------- EMPLOYEE ---------- */
        formData.append('Employee.IDEmployee', String(user.IDEmployee ?? 0));

        formData.append('CreatedBy', String(user.Empemail ?? ''));
        formData.append('Businessid', String(user.BusinessID ?? ''));

        /* ---------- PRODUCTS ---------- */
        // selectedDoctor.Products.forEach((p, index) => {
        //   formData.append(
        //     `Products[${index}].IDProduct`,
        //     String(p.Product?.IDProduct ?? 0),
        //   );
        //   formData.append(
        //     `Products[${index}].IDSatge`,
        //     String(p.Stage?.IDMisc ?? 0),
        //   );
        // });

        selectedDoctor.Products.forEach((p, index) => {
          formData.append(
            `Products[${index}].IDProduct`,
            String(p.IDProduct ?? 0),
          );

          formData.append(`Products[${index}].IDSatge`, String(p.IDStage ?? 0));
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

        console.log('FormData:', formData);

        /* ---------- API CALL ---------- */
        const response = await fetch(BASE_URL + 'Doctor/MobileDoctorAddEdit', {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        const result = await response.json();
        console.log('API Result:', result);
        setSaving(false); // 🔴 STOP LOADER
        if (result.result === '') {
          setIsModalVisible(false);
          Alert.alert('Success', 'Record Successfully Saved', [
            {
              text: 'Ok',
              // onPress: () => navigation.navigate('View Master Data')
            },
          ]);
        } else {
          Alert.alert('Error', result.result);
        }
      } catch (err) {
        setSaving(false); // 🔴 STOP LOADER
        console.error('Doctor submit error:', err);
        Alert.alert('Error', 'Something went wrong');
      }
    });
  };

  // Search handlers
  const handleSearch = text => setSearchQuery(text);
  const handleSearchRet = text => setSearchQueryRet(text);

  const onSelectSwitch = value => setGamesTab(value);

  const ApprovalStatus = item =>
    item === 0 ? (
      <Text style={styles.approvalNo}> Rejected </Text>
    ) : item === 1 ? (
      <Text style={styles.approvalYes}> Approved </Text>
    ) : (
      <Text style={styles.approvalText}> : </Text>
    );

  const filteredDoctors = useDoctors.filter(
    item =>
      item.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.Area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.Code?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredRetailer = useRetailers.filter(
    item =>
      item.Name?.toLowerCase().includes(searchQueryRet.toLowerCase()) ||
      item.Area?.toLowerCase().includes(searchQueryRet.toLowerCase()) ||
      item.Code?.toLowerCase().includes(searchQueryRet.toLowerCase()),
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />
      {isLoading && (
        <View style={styles.loaderContainer}>
          {/* <ActivityIndicator size="large" color="#007bff" /> */}
          <LottieView
            source={require('../assets/inside_page_loader.json')}
            autoPlay
            loop
            style={{width: 150, height: 150}}
          />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {/* <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}> */}
      <SafeAreaView style={{flex: 1}}>
        <View style={{marginLeft: 10, marginRight: 10, marginTop: 10}}>
          <CustomViewMaster
            selectionMode={1}
            option1="Master Doctors"
            option2="Master Retailers"
            onSelectSwitch={onSelectSwitch}
          />
        </View>

        {gamesTab === 1 ? (
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                borderRadius: 10,
                margin: 10,
                paddingHorizontal: 10,
                elevation: 2,
              }}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput
                style={styles.searchBar}
                placeholder="Search..."
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </View>
            {filteredDoctors.length ? (
              <View style={styles.areaStyle}>
                <FlatList
                  data={filteredDoctors}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item}) => (
                    <TouchableWithoutFeedback>
                      <View style={styles.menu}>
                        {item.ApprovalStatus === 1 && (
                          <TouchableOpacity onPress={() => handleEdit(item)}>
                            <Text style={styles.editButton}>Edit</Text>
                          </TouchableOpacity>
                        )}
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <MaterialCommunityIcons
                            name="doctor"
                            size={45}
                            color="#005696"
                            style={{marginRight: 10}}
                          />
                          <View style={{flex: 1}}>
                            <Text
                              style={{
                                fontSize: 16,
                                fontFamily: 'Lato-Bold',
                                color: '#000',
                              }}>
                              Dr. {item.Name}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.menuItem}>Code : {item.Code}</Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 4,
                          }}>
                          <Text
                            style={[styles.menuItem, {flex: 1}]}
                            numberOfLines={4}>
                            Area : {item.Area}
                          </Text>
                          {ApprovalStatus(item.ApprovalStatus)}
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                  )}
                />
              </View>
            ) : (
              <Text style={styles.noData}>No Doctors Found</Text>
            )}
          </View>
        ) : (
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                borderRadius: 10,
                margin: 10,
                paddingHorizontal: 10,
                elevation: 2,
              }}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput
                style={styles.searchBar}
                placeholder="Search..."
                value={searchQueryRet}
                onChangeText={handleSearchRet}
              />
            </View>
            {filteredRetailer.length ? (
              <View style={styles.areaStyle}>
                <FlatList
                  data={filteredRetailer}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item}) => (
                    <TouchableWithoutFeedback>
                      <View style={styles.menu}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <MaterialCommunityIcons
                            name="store-outline"
                            size={45}
                            color="#005696"
                            style={{marginRight: 10}}
                          />

                          <View style={{flex: 1}}>
                            <Text
                              style={{
                                fontSize: 16,
                                fontFamily: 'Lato-Bold',
                                color: '#000',
                              }}>
                              {item.Name}
                            </Text>
                          </View>
                        </View>
                        {/* <Text style={styles.menuItem}>Name : {item.Name}</Text> */}
                        <Text style={styles.menuItem}>Code : {item.Code}</Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}>
                          <Text style={styles.menuItem}>
                            Area : {item.Area}
                          </Text>
                          {ApprovalStatus(item.ApprovalStatus)}
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                  )}
                />
              </View>
            ) : (
              <Text style={styles.noData}>No Retailers Found</Text>
            )}
          </View>
        )}

        {/* {isModalVisible && selectedDoctor && (
          <Modal visible={isModalVisible} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Doctor Details</Text>
                <ScrollView style={{ maxHeight: 400 }}>
                  <Text>Name: {selectedDoctor?.Name || '-'}</Text>
                  <Text>Code: {selectedDoctor?.Code || '-'}</Text>
                  <Text>Mobile: {selectedDoctor?.Mobile || '-'}</Text>
                  <Text>
                    Qualification:{' '}
                    {selectedDoctor?.Qualification?.Name || '-'}
                  </Text>
                  <Text>
                    Speciality: {selectedDoctor?.Speciality?.Name || '-'}
                  </Text>
                  <Text>
                    Category: {selectedDoctor?.Category?.Name || '-'}
                  </Text>
                  <Text style={{ marginTop: 10, fontWeight: 'bold' }}>
                    Products:
                  </Text>

                  <FlatList
                    data={selectedDoctor?.Products || []}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => (
                      <View style={styles.productItem}>
                        <View
                          style={{
                            flex: 1,
                            fontFamily: 'Roboto-BoldItalic',
                            fontSize: 18,
                            fontWeight: 'bold',
                          }}>
                          <Text>Product: {item.Product.Name}</Text>
                          <Text>Stage: {item.Stage.Name}</Text>
                        </View>
                        <View style={styles.iconGroup}>
                          <TouchableOpacity
                            onPress={() => {
                              const updated = [...selectedDoctor.Products];
                              updated.splice(index, 1);
                              setSelectedDoctor({
                                ...selectedDoctor,
                                Products: updated,
                              });
                            }}>
                            <Image
                              source={require('../images/Delete_icon.png')}
                              style={styles.deleteIconImage}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  />
                </ScrollView>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.EditButton}
                    onPress={() => setIsAddProductModalVisible(true)}>
                    <Text style={styles.buttonText}>Add</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={saveData}>
                    <Text style={styles.buttonText}>Submit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setIsModalVisible(false)}>
                    <Text style={styles.buttonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
<Modal
          visible={isAddProductModalVisible}
          transparent
          animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Product & Stage</Text>

              <Dropdown
                style={styles.dropdown}
                data={productList}
                labelField="label"
                valueField="value"
                placeholder="Select Product"
                value={selectedProduct}
                onChange={item => setSelectedProduct(item)}
              />
              <Dropdown
                style={styles.dropdown}
                data={stageList}
                labelField="label"
                valueField="value"
                placeholder="Select Stage"
                value={selectedStage}
                onChange={item => setSelectedStage(item)}
              />

              <View style={styles.verticalButtonGroup}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => {
                    if (selectedProduct && selectedStage) {
                      const isDuplicate = selectedDoctor.Products?.some(
                        p =>
                          p.Product.IDProduct === selectedProduct.value,
                      );

                      if (isDuplicate) {
                        Alert.alert(
                          'Duplicate Product',
                          'This product is already added.',
                        );
                        return;
                      }

                      const updated = [
                        ...(selectedDoctor.Products || []),
                      ];
                      updated.push({
                        Product: {
                          IDProduct: selectedProduct.value,
                          Name: selectedProduct.label,
                        },
                        Stage: {
                          IDMisc: selectedStage.value,
                          Name: selectedStage.label,
                        },
                      });

                      setSelectedDoctor({
                        ...selectedDoctor,
                        Products: updated,
                      });
                      setIsAddProductModalVisible(false);
                      setSelectedProduct(null);
                      setSelectedStage(null);
                    } else {
                      Alert.alert(
                        'Validation',
                        'Please select both Product and Stage.',
                      );
                    }
                  }}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsAddProductModalVisible(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
            
          </Modal>
        )} */}

        <Modal
          visible={isAddProductModalVisible}
          transparent
          animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Product & Stage</Text>

              <Dropdown
                style={styles.dropdown}
                data={productList}
                labelField="label"
                valueField="value"
                placeholder="Select Product"
                value={selectedProduct}
                onChange={item => setSelectedProduct(item)}
              />
              <Dropdown
                style={styles.dropdown}
                data={stageList}
                labelField="label"
                valueField="value"
                placeholder="Select Stage"
                value={selectedStage}
                onChange={item => setSelectedStage(item)}
              />

              <View style={styles.verticalButtonGroup}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => {
                    // if (selectedProduct && selectedStage) {
                    //   const isDuplicate = selectedDoctor.Products?.some(
                    //     p => p.Product.IDProduct === selectedProduct.value,
                    //   );

                    //   if (isDuplicate) {
                    //     Alert.alert(
                    //       'Duplicate Product',
                    //       'This product is already added.',
                    //     );
                    //     return;
                    //   }

                    //   const updated = [...(selectedDoctor.Products || [])];
                    //   updated.push({
                    //     Product: {
                    //       IDProduct: selectedProduct.value,
                    //       Name: selectedProduct.label,
                    //     },
                    //     Stage: {
                    //       IDMisc: selectedStage.value,
                    //       Name: selectedStage.label,
                    //     },
                    //   });

                    //   setSelectedDoctor({
                    //     ...selectedDoctor,
                    //     Products: updated,
                    //   });
                    //   setIsAddProductModalVisible(false);
                    //   setSelectedProduct(null);
                    //   setSelectedStage(null);
                    // } else {
                    //   Alert.alert(
                    //     'Validation',
                    //     'Please select both Product and Stage.',
                    //   );
                    // }

                    if (selectedProduct && selectedStage) {
                      const isDuplicate = selectedDoctor.Products?.some(
                        p => p.IDProduct === selectedProduct.value,
                      );

                      if (isDuplicate) {
                        Alert.alert(
                          'Duplicate Product',
                          'This product is already added.',
                        );
                        return;
                      }

                      const updated = [...(selectedDoctor.Products || [])];

                      updated.push({
                        IDProduct: selectedProduct.value,
                        IDStage: selectedStage.value,
                        Product: selectedProduct.label,
                        Stage: selectedStage.label,
                      });

                      setSelectedDoctor({
                        ...selectedDoctor,
                        Products: updated,
                      });

                      setIsAddProductModalVisible(false);

                      setSelectedProduct(null);
                      setSelectedStage(null);
                    } else {
                      Alert.alert(
                        'Validation',
                        'Please select both Product and Stage.',
                      );
                    }
                  }}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsAddProductModalVisible(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {isModalVisible && selectedDoctor && (
          <Modal visible transparent animationType="slide">
            <View style={styles.modalContainer}>
              {/* 🔴 LOADER OVER MODAL */}
              {saving && (
                <View style={styles.loaderOverlay}>
                  <View style={styles.loaderCard}>
                    <LottieView
                      source={require('../assets/Loading animation blue.json')}
                      autoPlay
                      loop
                      style={{width: 120, height: 90}}
                    />
                    <Text style={styles.loaderText}>Saving, please wait…</Text>
                  </View>
                </View>
              )}
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Doctor Details</Text>

                <ScrollView style={{maxHeight: 450}}>
                  <Text>Name: {selectedDoctor.Name}</Text>
                  <Text>Code: {selectedDoctor.Code}</Text>
                  {/* <Text>Mobile: {selectedDoctor.Mobile}</Text> */}
                  <Text>
                    {/* Qualification: {selectedDoctor.Qualification?.Name || '-'} */}
                    Qualification: {selectedDoctor.Qualification || '-'}
                  </Text>
                  <Text>
                    {/* Speciality: {selectedDoctor.Speciality?.Name || '-'} */}
                    Speciality: {selectedDoctor.Speciality || '-'}
                  </Text>
                  {/* <Text>Category: {selectedDoctor.Category?.Name || '-'}</Text> */}
                  <Text>Category: {selectedDoctor.Category || '-'}</Text>

                  {/* 🔴 Phone INPUT (MANDATORY) */}
                  <Text style={styles.label}>Phone *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Mobile"
                    value={Mobile}
                    onChangeText={setMobile}
                    maxLength={10}
                    keyboardType="phone-pad"
                  />

                  <View
                    style={{
                      marginBottom: 5,
                    }}>
                    <Text style={styles.label}>Frequency *</Text>
                    {/*<Dropdown
                      style={[
                        styles.dropdown,
                        isFocus && {borderColor: 'blue'},
                      ]}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      inputSearchStyle={styles.inputSearchStyle}
                      iconStyle={styles.iconStyle}
                      data={useFData}
                      search
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      placeholder={!isFocus ? 'Select Frequency' : '...'}
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
                    />*/}
                    <Dropdown
                      style={[
                        styles.dropdown,
                        isFocus && {borderColor: 'blue'},
                      ]}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      inputSearchStyle={styles.inputSearchStyle}
                      iconStyle={styles.iconStyle}
                      data={useFData}
                      search
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      value={useFValue} // ✅ IMPORTANT
                      placeholder={!isFocus ? 'Select Frequency' : '...'}
                      searchPlaceholder="Search"
                      onFocus={() => setIsFocus(true)}
                      onBlur={() => setIsFocus(false)}
                      onChange={item => {
                        console.log(item.label);

                        setFLabel(item.label);
                        setFValue(item.value);

                        setIsFocus(false);
                      }}
                    />
                  </View>

                  {/* 🔴 ADDRESS INPUT (MANDATORY) */}
                  <Text style={styles.label}>Address *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Address"
                    value={address1}
                    onChangeText={setAddress1}
                  />

                  {/* 🔴 PINCODE INPUT (MANDATORY) */}
                  <Text style={styles.label}>Pincode *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Pincode"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={pincode}
                    onChangeText={setPincode}
                  />

                  <TouchableOpacity
                    style={styles.button1}
                    onPress={() => {
                      setActiveImageType('CARD');
                      setModalVisible(true);
                    }}>
                    <Text style={{color: '#fff'}}>Attach Card Image</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.button1}
                    onPress={() => {
                      setActiveImageType('PRESCRIPTION');
                      setModalVisible(true);
                    }}>
                    <Text style={{color: '#fff'}}>
                      Attach Prescription Image
                    </Text>
                  </TouchableOpacity>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                      paddingHorizontal: 15,
                      marginTop: 10,
                    }}>
                    {images.CARD.uri ? (
                      <TouchableOpacity
                        onPress={() => {
                          setPreviewUri(images.CARD.uri);
                          setPreviewVisible(true);
                        }}
                        style={{marginRight: 20, marginLeft: 25}}>
                        <Image
                          source={{uri: images.CARD.uri}}
                          style={styles.thumb}
                        />
                        <Text style={styles.thumbLabel}>Card</Text>
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
                          style={styles.thumb}
                        />
                        <Text style={styles.thumbLabel}>Prescription</Text>
                      </TouchableOpacity>
                    ) : null}
                  </ScrollView>

                  <Text style={{marginTop: 10, fontWeight: 'bold'}}>
                    Products:
                  </Text>

                  <FlatList
                    data={selectedDoctor.Products || []}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({item, index}) => (
                      <View style={styles.productItem}>
                        <View style={{flex: 1}}>
                          <Text>Product: {item.Product}</Text>
                          <Text>Stage: {item.Stage}</Text>
                        </View>

                        <TouchableOpacity
                          onPress={() => {
                            const updated = [...selectedDoctor.Products];

                            updated.splice(index, 1);

                            setSelectedDoctor({
                              ...selectedDoctor,
                              Products: updated,
                            });
                          }}>
                          <Image
                            source={require('../images/Delete_icon.png')}
                            style={styles.deleteIconImage}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                </ScrollView>

                {/* BUTTONS */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.EditButton}
                    onPress={() => setIsAddProductModalVisible(true)}>
                    <Text style={styles.buttonText}>Add</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={() => {
                      if (useFLabel === '') {
                        Alert.alert('Select Frequency');
                        return;
                      }
                      if (!address1.trim()) {
                        Alert.alert('Validation', 'Address is required');
                        return;
                      }
                      if (!pincode || pincode.length !== 6) {
                        Alert.alert('Validation', 'Valid Pincode is required');
                        return;
                      }

                      //  Update selectedDoctor BEFORE save
                      setSelectedDoctor({
                        ...selectedDoctor,
                        Address1: address1,
                        Pincode: pincode,
                      });

                      saveData();
                    }}>
                    <Text style={styles.buttonText}>Submit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setIsModalVisible(false)}>
                    <Text style={styles.buttonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleCameraLaunch}>
                <Text>Take Photo...</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={openImagePicker}>
                <Text>Choose from Library...</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}>
                <Text style={{color: '#fff'}}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={previewVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setPreviewVisible(false)}>
          <View style={styles.previewContainer}>
            {/* Close button */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setPreviewVisible(false)}>
              <Text style={{color: '#fff', fontSize: 18}}>✕</Text>
            </TouchableOpacity>

            {/* Scroll down to close */}
            <ScrollView
              maximumZoomScale={3}
              minimumZoomScale={1}
              contentContainerStyle={styles.previewScroll}
              onScrollEndDrag={e => {
                if (e.nativeEvent.contentOffset.y > 120) {
                  setPreviewVisible(false);
                }
              }}>
              <Image
                source={{uri: previewUri}}
                style={styles.previewImage}
                resizeMode="contain"
              />
            </ScrollView>
          </View>
        </Modal>
      </SafeAreaView>
      {/* </ScrollView> */}
    </>
  );
};

export default ViewMasterData;

const styles = StyleSheet.create({
  areaStyle: {
    paddingLeft: 10,
    paddingRight: 10,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 10,
  },
  searchBar: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 8,
    fontSize: 15,
  },
  menu: {
    margin: 5,
    padding: 5,
    backgroundColor: '#ffffff',
    elevation: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuItem: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    margin: 5,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'left',
    textAlign: 'left',
  },
  editButton: {
    flex: 1,
    width: 60,
    fontSize: 15,
    fontFamily: 'Lato-Bold',
    backgroundColor: '#007bff',
    color: '#ffffff',
    borderRadius: 20,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    margin: 5,
    padding: 5,
    right: 10, // Adjust as needed
  },

  approvalYes: {
    backgroundColor: '#3cb371',
    color: '#fff',
    fontSize: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  approvalNo: {
    backgroundColor: '#f24633',
    color: '#fff',
    fontSize: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'center',
  },

  approvalText: {
    fontSize: 16,
    margin: 5,
    padding: 5,
  },
  noData: {
    fontFamily: 'Roboto-BoldItalic',
    fontSize: 18,
    color: '#FF0000',
    textAlign: 'center',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  closeButton: {
    backgroundColor: '#f24633',
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
    marginRight: 10,
  },
  EditButton: {
    backgroundColor: '#016e22',
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
    minWidth: 100,
    alignItems: 'center',
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginTop: 5,
    marginBottom: 5,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
  },
  iconGroup: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  editIcon: {
    fontSize: 20,
    color: '#007bff',
    marginRight: 10,
  },
  deleteIcon: {
    fontSize: 20,
    color: '#dc3545',
  },
  deleteIconImage: {
    width: 24,
    height: 24,
    tintColor: '#dc3545', // Optional red tint
  },
  EditIconImage: {
    width: 24,
    height: 24,
    tintColor: '#5865e0', // Optional blue tint
    marginRight: 15,
  },
  dropdown: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    marginTop: 5,
    marginBottom: 5,
  },
  verticalButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 10, // for spacing between Add and Cancel buttons
  },
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
  // buttonText: {
  //   fontSize: 16,
  // },
  // cancelButton: {
  //   width: '100%',
  //   padding: 10,
  //   marginTop: 10,
  //   backgroundColor: '#ff4444',
  //   borderRadius: 5,
  //   alignItems: 'center',
  // },
  cancelButtonText: {
    fontSize: 16,
    color: 'white',
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

  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)', // dim background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  loaderCard: {
    width: 200,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',

    // iOS shadow
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 10,

    // Android shadow
    elevation: 10,
  },

  loaderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#005696',
    fontWeight: '500',
  },
});
