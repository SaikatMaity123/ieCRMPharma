import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import CRMImg from '../images/CRMNEW.svg';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '@env';
const Splash = ({navigation}) => {
  const [loading, setLoading] = useState(false);

  //ActivityIndicator display
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 3000);
    getAsyncData();
  }, []);
  //ActivityIndicator hide
  const getAsyncData = async () => {
    const id = await AsyncStorage.getItem('GUID');
    const bid = await AsyncStorage.getItem('BUSINESS_ID');
    if (id !== null) {
      checkDeviceExist(id, bid);
    } else {
      navigation.navigate('Register');
    }
  };

  const checkDeviceExist = async (guid, bid) => {
    try {
      setLoading(true);
      const url =
        BASE_URL +
        'Device/Registration/Exist?Businessid=' +
        bid +
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
    <SafeAreaView
      style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      {/* <View style={{marginTop: 20}}>
        <Text
          style={{
            fontSize: 30,
            fontWeight: 'bold',
            color: '#20315f',
            fontFamily: 'Inter-Bold',
          }}>
          CRM
        </Text>
      </View>  */}
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <CRMImg
          //source={require('../images/CRMNEW.jpeg')}
          width={300}
          height={300}
          //style={{transform: [{rotate: '-15deg'}]}}
        />
        <ActivityIndicator size="large" color="#45747B" animating={loading} />
      </View>

      {/* <TouchableOpacity
        onPress={() => navigation.navigate('LogIn')}
        //onPress={hideLoader}
        style={{
          padding: 20,
          width: '90%',
          borderRadius: 5,
          flexDirection: 'row',
          backgroundColor: '#33767C',
          justifyContent: 'space-between',
          marginBottom: 50,
        }}>
        <Text
          style={{
            fontWeight: 'bold',
            fontSize: 18,
            color: '#fff',
            fontFamily: 'Roboto-MediumItalic',
          }}>
          Let's Begin
        </Text>
        <MaterialIcons name="arrow-forward-ios" size={30} color="#fff" />
      </TouchableOpacity> */}
    </SafeAreaView>
  );
};
export default Splash;
