import {
  View,
  Text,
  ImageBackground,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  Alert,
  Modal,
  ActivityIndicator,
  StyleSheet,
  //TextInput
} from 'react-native';
import React, {useEffect, useState} from 'react';
import CustomButton from '../components/custom/CustomButton';
import DeviceInfo from 'react-native-device-info';
import {BASE_URL} from '@env';
import {TextInput} from 'react-native-paper';
import CRMImg from '../images/CRMNEW.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const Register = ({navigation}) => {
  const [deviceId, setDeviceId] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [useBName, setBName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaderText, setLoaderText] = useState('Please wait...');
  const {height} = Dimensions.get('window');
  useEffect(() => {
    let deviceId = DeviceInfo.getDeviceId();
    DeviceInfo.getDeviceName().then(deviceName => {
      setDeviceName(deviceName);
      console.log(deviceName);
      setDeviceId(deviceId);
      console.log(deviceId);
    });
  }, []);
  const registerDevice = async () => {
    if (useBusinessID === '' || useBName === '') {
      Alert.alert('Please fill all fields');
      return;
    } else {
      setLoading(true);
      const data = {
        UserName: useBName,
        DeviceID: deviceId,
        DeviceName: deviceName + ' ' + deviceId,
        BusinessCode: useBusinessID,
      };
      console.log(data);

      try {
        const response = await fetch(BASE_URL + 'Device/Registration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data), // ✅ FIXED
        });

        const json = await response.json();

        console.log('Full API Response:', json);
        console.log('Result:', json?.data?.Result); // ✅ safe access
        // ✅ Save in AsyncStorage
        await AsyncStorage.setItem('GUID', json?.data?.Result);
        await AsyncStorage.setItem('BUSINESS_ID', useBusinessID);
        await AsyncStorage.setItem('User_Name', useBName);
        // if (json.data === 'Device already registered') {
        //   navigation.navigate('LogIn');
        // } else {

        checkDeviceExist(json.data.Result);
        //}
      } catch (error) {
        console.error('API Error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const checkDeviceExist = async guid => {
    try {
      setLoading(true);
      const url =
        BASE_URL +
        'Device/Registration/Exist?Businessid=' +
        useBusinessID +
        '&DeviceID=' +
        guid;
      console.log(url);

      const response = await fetch(url);

      const json = await response.json();

      // store "EXIST" in state
      console.log(json.data);
      //console.log(json.data);
      if (json.data === 'YES') {
        navigation.navigate('LogIn');
      } else {
        Alert.alert('Device Successfully Registered. Approval is Pending.');
      }
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <ImageBackground
      source={require('../images/bg2.png')}
      style={{flex: 1}}
      resizeMode="cover">
      <SafeAreaView style={{flex: 1}}>
        {/* <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}> */}
        <KeyboardAwareScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 20,
          }}
          enableOnAndroid={true}
          keyboardShouldPersistTaps="handled">
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 20,
            }}>
            <CRMImg
              //source={require('../images/CRMNEW.jpeg')}
              width={300}
              height={300}
              //style={{transform: [{rotate: '-15deg'}]}}
            />

            {/* Business ID */}
            <TextInput
              label="Business Id"
              mode="outlined"
              style={{width: '100%', marginBottom: 16}}
              autoCapitalize="characters"
              value={useBusinessID}
              onChangeText={setBusinessID}
            />

            {/* User Name */}
            <TextInput
              label="User Name"
              mode="outlined"
              style={{width: '100%', marginBottom: 24}}
              autoCapitalize="none"
              autoCorrect={false}
              value={useBName}
              onChangeText={setBName}
            />
            <TextInput
              label="Device ID"
              mode="outlined"
              style={{width: '100%', marginBottom: 24}}
              autoCapitalize="none"
              autoCorrect={false}
              value={deviceId}
              editable={false}
            />
            <TextInput
              label="Device Name"
              mode="outlined"
              style={{width: '100%', marginBottom: 24}}
              autoCapitalize="none"
              autoCorrect={false}
              value={deviceName}
              editable={false}
              //onChangeText={setBName}
            />

            {/* Button */}
            <CustomButton
              label="Register Yourself"
              onPress={registerDevice}
              style={{width: '100%'}}
            />
          </View>
        </KeyboardAwareScrollView>
        {/* </KeyboardAvoidingView> */}
        {loading && (
          <Modal transparent animationType="fade" visible={loading}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <ActivityIndicator size="large" color="#0E7777" />
                <Text style={styles.modalText}>{loaderText}</Text>
              </View>
            </View>
          </Modal>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {padding: 16},
  map: {height: 180, borderRadius: 12, margin: -15, marginBottom: 5},
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginVertical: 10,
    elevation: 4,
  },
  row: {flexDirection: 'row', alignItems: 'center', marginBottom: 6},
  rowText: {marginLeft: 6, fontSize: 14},
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
  },
  rowBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  btn: {backgroundColor: '#005696', padding: 12, borderRadius: 8, width: '48%'},
  btnText: {color: '#fff', textAlign: 'center', fontWeight: '700'},
  file: {fontSize: 12, marginTop: 4},
  saveBtn: {
    marginTop: 20,
    backgroundColor: '#16a34a',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },

  attachmentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  attachmentName: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },

  deleteIcon: {
    padding: 6,
  },

  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },

  previewContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    width: '100%',
    padding: 10,
    marginTop: 10,
    backgroundColor: '#ff4444',
    borderRadius: 5,
    alignItems: 'center',
  },
  button: {
    width: '100%',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  previewFileName: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  previewCloseBtn: {
    marginTop: 16,
    backgroundColor: '#ef4444',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  button1: {
    width: '100%',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#166AD4',
    borderRadius: 5,
    alignItems: 'center',
  },
  previewCloseText: {
    color: '#fff',
    fontWeight: '700',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: 260,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 5, // Android shadow
  },
  modalText: {
    marginTop: 15,
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
  },
});
