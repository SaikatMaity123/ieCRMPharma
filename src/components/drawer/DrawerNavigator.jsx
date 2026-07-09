import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserInfoScreen from '../../screens/UserInfoScreen';
import LogoutScreen from '../../screens/LogoutScreen';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawer from '../custom/CustomDrawer';
import { useAppContext } from '../custom/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { BASE_URL } from '@env';
import { openDatabase } from 'react-native-sqlite-storage';
import { CommonActions } from '@react-navigation/native';
import CRMDashBoard from '../../screens/CRMDashBoard';
import BirthDayScreen from '../../screens/BirthDayScreen';
import { StatusBar, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const Drawer = createDrawerNavigator();

//database connection
// const db = openDatabase(
//   {
//     name: 'CRM_db',
//     location: 'default',
//   },
//   () => {
//     //console.log('Database connected!');
//   }, //on success
//   error => console.log('Database error', error), //on error
// );

const DrawerNavigator = () => {
  // const [modules, setModules] = useState([]);
  // const {
  //   useBusinessID,
  //   useEmpemail,
  //   useSecurityKey,
  //   useManagerAccess,
  //   useIDEmployee,
  //   useEmpname,
  //   useMobileAccess,
  //   useDivision,
  // } = useAppContext();
  // const [loading, setLoading] = useState(false);
  // const [hasFetched, setHasFetched] = useState(false);
  // var cdate = moment().format('D/MMM/YYYY');
  // var ctdate = moment().format('DD/MM/YYYY');
  // const navigation = useNavigation();

  // useEffect(() => {
  //   AsyncStorage.getItem('UserData').then(value => {
  //     if (value != null) {
  //       let user = JSON.parse(value);
  //       fetchModules(user.BusinessID, user.Designation);
  //     }
  //   });
  // }, []);

  // const fetchModules = (businessID, useDesig) => {
  //   NetInfo.fetch().then(async state => {
  //     if (state.isConnected) {
  //       if (useDesig !== 'DY_ZSM' && useDesig !== 'ZSM') {
  //         try {
  //           const url =
  //             BASE_URL + 'user/MobileModuleList?Businessid=' + businessID;
  //           const response = await axios.get(url);
  //           setModules(response.data);
  //           //console.log(response.data);
  //           const dashBoardJsonArray = response.data;

  //           //CREATE TABLE for CRM_TourPlanDate
  //           db.transaction(txn => {
  //             txn.executeSql('DROP TABLE IF EXISTS DashboardData', []);
  //             txn.executeSql(
  //               'CREATE TABLE IF NOT EXISTS DashboardData(Module VARCHAR,IDMenu VARCHAR,MainModuleSRL VARCHAR)',
  //               [],
  //             );
  //           });

  //           //SQLITE INSERT CRM_TourPlanDate
  //           var _value = [];
  //           _value = dashBoardJsonArray;
  //           //console.log(_value);
  //           for (var j = 0; j < _value.length; j++) {
  //             const array = _value[j];
  //             let sql =
  //               'INSERT INTO DashboardData(Module,IDMenu,MainModuleSRL) VALUES (?,?,?)';
  //             let params = [array.Module, array.IDMenu, array.MainModuleSRL]; //storing user data in an array
  //             db.executeSql(sql, params);
  //           }
  //         } catch (error) {
  //           console.error('Failed to fetch modules:', error);
  //         }
  //       } else {
  //         try {
  //           const url =
  //             BASE_URL + 'user/MobileModuleList?Businessid=' + businessID;
  //           const response = await axios.get(url);
  //           setModules(response.data);
  //           //console.log(response.data);
  //           const dashBoardJsonArray = response.data;

  //           //CREATE TABLE for CRM_TourPlanDate
  //           db.transaction(txn => {
  //             txn.executeSql('DROP TABLE IF EXISTS DashboardData', []);
  //             txn.executeSql(
  //               'CREATE TABLE IF NOT EXISTS DashboardData(Module VARCHAR,IDMenu VARCHAR,MainModuleSRL VARCHAR)',
  //               [],
  //             );
  //           });

  //           //SQLITE INSERT CRM_TourPlanDate
  //           var _value = [];
  //           _value = dashBoardJsonArray;
  //           //console.log(_value);
  //           for (var j = 0; j < _value.length; j++) {
  //             const array = _value[j];
  //             let sql =
  //               'INSERT INTO DashboardData(Module,IDMenu,MainModuleSRL) VALUES (?,?,?)';
  //             let params = [array.Module, array.IDMenu, array.MainModuleSRL]; //storing user data in an array
  //             db.executeSql(sql, params);
  //           }
  //         } catch (error) {
  //           console.error('Failed to fetch modules:', error);
  //         }
  //       }
  //     } else {
  //       if (useDesig !== 'DY_ZSM' && useDesig !== 'ZSM') {
  //         db.transaction(tx => {
  //           tx.executeSql(
  //             'SELECT Module, IDMenu, MainModuleSRL FROM DashboardData',
  //             [],
  //             (tx, results) => {
  //               const rows = results.rows;
  //               let temp = [];

  //               for (let i = 0; i < rows.length; i++) {
  //                 temp.push(rows.item(i));
  //               }
  //               console.log(temp);

  //               setModules(temp);
  //             },
  //             error => {
  //               console.log('Error fetching modules: ', error);
  //             },
  //           );
  //         });
  //       } else {
  //         db.transaction(tx => {
  //           tx.executeSql(
  //             'SELECT Module, IDMenu, MainModuleSRL FROM DashboardData',
  //             [],
  //             (tx, results) => {
  //               const rows = results.rows;
  //               let temp = [];

  //               for (let i = 0; i < rows.length; i++) {
  //                 temp.push(rows.item(i));
  //               }
  //               console.log(temp);

  //               setModules(temp);
  //             },
  //             error => {
  //               console.log('Error fetching modules: ', error);
  //             },
  //           );
  //         });
  //       }
  //     }
  //   }, []);
  // };

  // const renderScreen = module => {
  //   const CustomScreen = () => {
  //     useEffect(() => {
  //       if (!hasFetched) {
  //         handleNavigation();
  //         setHasFetched(true);
  //       }
  //     }, [hasFetched]);

  //     const handleNavigation = async () => {
  //       switch (module.Module) {
  //         case 'TOUR PROGRAM':
  //           NetInfo.fetch().then(state => {
  //             if (state.isConnected) {
  //               //navigation.navigate('Quiz Dashboard');
  //               navigation.dispatch(
  //                 CommonActions.reset({
  //                   index: 0,
  //                   routes: [{name: 'Tour Plan Submission'}], // or whatever your main screen is
  //                 }),
  //               );
  //             } else {
  //               Alert.alert('Internet Is Required!');
  //               navigation.dispatch(
  //                 CommonActions.reset({
  //                   index: 0,
  //                   routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
  //                 }),
  //               );
  //             }
  //           });
  //           break;
  //         case 'DCR':
  //           if (useMobileAccess === 'ONLINE') {
  //             NetInfo.fetch().then(state => {
  //               if (state.isConnected) {
  //                 //checkStartDay();
  //                 checkDCRData();
  //               } else {
  //                 Alert.alert('Contact With Administrator!');
  //               }
  //             }, []);
  //           } else if (useMobileAccess === 'ONLINE & OFFLINE') {
  //             NetInfo.fetch().then(state => {
  //               if (state.isConnected) {
  //                 //checkStartDay();
  //                 checkDCRData();
  //               } else {
  //                 if (useManagerAccess === true) {
  //                   db.transaction(tx => {
  //                     // Execute a query to retrieve table information
  //                     tx.executeSql(
  //                       //"SELECT name FROM sqlite_master WHERE type='table' AND name='CRM_StartDay'",
  //                       "SELECT name FROM sqlite_master WHERE type='table' AND name='CRM_ManagerStartDayDummy'",
  //                       [],
  //                       (tx, results) => {
  //                         // Check if any rows are returned
  //                         if (results.rows.length > 0) {
  //                           db.transaction(tx => {
  //                             tx.executeSql(
  //                               'SELECT * FROM CRM_ManagerStartDayDummy where StartDate=?',
  //                               [cdate],
  //                               (tx, results) => {
  //                                 // Check if there are rows in the result set
  //                                 if (results.rows.length > 0) {
  //                                   console.log('Table has data');
  //                                   //navigation.navigate('AppNavDCRScreen');
  //                                   navigation.dispatch(
  //                                     CommonActions.reset({
  //                                       index: 0,
  //                                       routes: [{name: 'AppNavDCRScreen'}], // or whatever your main screen is
  //                                     }),
  //                                   );
  //                                 } else {
  //                                   console.log('Table is empty');
  //                                   //navigation.navigate('DCR Session');
  //                                   Alert.alert(
  //                                     'Start Your Day By Connecting Internet.',
  //                                   );
  //                                   navigation.dispatch(
  //                                     CommonActions.reset({
  //                                       index: 0,
  //                                       routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
  //                                     }),
  //                                   );
  //                                 }
  //                               },
  //                               error =>
  //                                 console.error(
  //                                   'Error executing SELECT query: ',
  //                                   error,
  //                                 ),
  //                             );
  //                           });
  //                         } else {
  //                           // Table does not exist
  //                           //console.warn('Table does not exists');
  //                           //navigation.navigate('DCR Session');
  //                           Alert.alert(
  //                             'Start Your Day By Connecting Internet.',
  //                           );
  //                           navigation.dispatch(
  //                             CommonActions.reset({
  //                               index: 0,
  //                               routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
  //                             }),
  //                           );
  //                         }
  //                       },
  //                       error => {
  //                         // Error occurred while executing the query
  //                         console.log(error);
  //                       },
  //                     );
  //                   });
  //                 } else {
  //                   // console.log(ctdate);
  //                   db.transaction(tx => {
  //                     tx.executeSql(
  //                       // 'SELECT * FROM CRM_ManagerStartDay where StartDate=?',
  //                       'SELECT * FROM CRM_offlinePendingDCRDate',
  //                       [],

  //                       (tx, results) => {
  //                         // Check if there are rows in the result set
  //                         if (results.rows.length > 0) {
  //                           console.log('Table has data');
  //                           Alert.alert(
  //                             'Go to Reports and clear your pending DCR',
  //                           );
  //                         } else {
  //                           console.log('Table is empty');
  //                           db.transaction(tx => {
  //                             // Execute a query to retrieve table information
  //                             tx.executeSql(
  //                               "SELECT name FROM sqlite_master WHERE type='table' AND name='Stay_Table'",
  //                               [],
  //                               (tx, results) => {
  //                                 // Check if any rows are returned
  //                                 if (results.rows.length > 0) {
  //                                   // Table exists
  //                                   console.warn('Stay_Table exists');
  //                                   db.transaction(tx => {
  //                                     tx.executeSql(
  //                                       // 'SELECT * FROM CRM_ManagerStartDay where StartDate=?',
  //                                       'SELECT * FROM Stay_Table where StayDate=?',
  //                                       [cdate],
  //                                       (tx, results) => {
  //                                         // Check if there are rows in the result set
  //                                         if (results.rows.length > 0) {
  //                                           console.log('Table has data');
  //                                           Alert.alert(
  //                                             useEmpname +
  //                                               ' stay already exist on this date : ' +
  //                                               cdate,
  //                                           );
  //                                         } else {
  //                                           console.log('Table is empty');
  //                                           chectTourPlanData();
  //                                         }
  //                                       },
  //                                       error =>
  //                                         console.error(
  //                                           'Error executing SELECT query: ',
  //                                           error,
  //                                         ),
  //                                     );
  //                                   });
  //                                 } else {
  //                                   // Table does not exist
  //                                   console.warn('Stay_Table does not exists');
  //                                   chectTourPlanData();
  //                                 }
  //                               },
  //                               error => {
  //                                 // Error occurred while executing the query
  //                                 Alert.alert(error);
  //                               },
  //                             );
  //                           });
  //                         }
  //                       },
  //                       error =>
  //                         console.error(
  //                           'Error executing SELECT query: ',
  //                           error,
  //                         ),
  //                     );
  //                   });
  //                 }
  //               }
  //             }, []);
  //           } else {
  //             Alert.alert('Contact With Administrator!');
  //           }
  //           break;
  //         case 'SETTING':
  //           NetInfo.fetch().then(state => {
  //             if (state.isConnected) {
  //               //navigation.navigate('Quiz Dashboard');
  //               navigation.dispatch(
  //                 CommonActions.reset({
  //                   index: 0,
  //                   routes: [{name: 'SettingScreen'}], // or whatever your main screen is
  //                 }),
  //               );
  //             } else {
  //               Alert.alert('Internet Is Required!');
  //               navigation.dispatch(
  //                 CommonActions.reset({
  //                   index: 0,
  //                   routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
  //                 }),
  //               );
  //             }
  //           });
  //           break;
  //         case 'MASTER':
  //           if (useManagerAccess === true) {
  //             navigation.dispatch(
  //               CommonActions.reset({
  //                 index: 0,
  //                 routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
  //               }),
  //             );
  //             Alert.alert('You are not authorized');
  //           } else {
  //             setLoading(true);
  //             setTimeout(() => {
  //               setLoading(false);
  //             }, 5000);
  //             //console.warn(useManagerAccess);
  //             NetInfo.fetch().then(state => {
  //               if (state.isConnected) {
  //                 //navigation.navigate('Quiz Dashboard');
  //                 navigation.dispatch(
  //                   CommonActions.reset({
  //                     index: 0,
  //                     routes: [{name: 'AppNavMaster'}], // or whatever your main screen is
  //                   }),
  //                 );
  //               } else {
  //                 //Alert.alert('Internet Is Required!');
  //                 navigation.dispatch(
  //                   CommonActions.reset({
  //                     index: 0,
  //                     routes: [{name: 'AppNavMaster'}], // or whatever your main screen is
  //                   }),
  //                 );
  //               }
  //             });
  //           }
  //           break;
  //         case 'REPORTS':
  //           NetInfo.fetch().then(state => {
  //             if (state.isConnected) {
  //               const base =
  //                 useBusinessID.trim() === 'MEND-PVTL-890'
  //                   ? 'https://crmfieldforceui.mendine.co.in/Login/MobileWebAccess'
  //                   : 'https://iecrm.iecsl.in/Login/MobileWebAccess';

  //               const url = `${base}?BusinessID=${useBusinessID}&email=${useEmpemail}&securitykey=${useSecurityKey}`;
  //               console.log(url);

  //               navigation.dispatch(
  //                 CommonActions.reset({
  //                   index: 0,
  //                   routes: [
  //                     {
  //                       name: 'ReportsWebView',
  //                       params: {url},
  //                     },
  //                   ],
  //                 }),
  //               );
  //             } else {
  //               Alert.alert('Internet Is Required!');
  //               navigation.dispatch(
  //                 CommonActions.reset({
  //                   index: 0,
  //                   routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
  //                 }),
  //               );
  //             }
  //           });

  //           break;
  //         case 'ORDER':
  //           setLoading(true);
  //           setTimeout(() => setLoading(false), 5000);

  //           if (
  //             ['GENI-QST-536', 'DEV-GENI-536'].includes(useBusinessID.trim())
  //           ) {
  //             Alert.alert('You are not authorized to access the module');
  //           } else {
  //             db.transaction(txn => {
  //               txn.executeSql('DROP TABLE IF EXISTS CRM_ProductOrder', []);
  //             });

  //             NetInfo.fetch().then(state => {
  //               if (state.isConnected) {
  //                 navigation.dispatch(
  //                   CommonActions.reset({
  //                     index: 0,
  //                     routes: [{name: 'AppNavOrder'}], // or whatever your main screen is
  //                   }),
  //                 );
  //               } else {
  //                 navigation.dispatch(
  //                   CommonActions.reset({
  //                     index: 0,
  //                     routes: [{name: 'AppNavOrder'}], // or whatever your main screen is
  //                   }),
  //                 );
  //               }
  //             });
  //           }
  //           break;
  //         case 'ACTIVITIES':
  //           if (useBusinessID.trim() === 'GENI-QST-536') {
  //             Alert.alert('You are not authorized to access the module');
  //             navigation.dispatch(
  //               CommonActions.reset({
  //                 index: 0,
  //                 routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
  //               }),
  //             );
  //           } else if (useBusinessID.trim() === 'DEV-GENI-536') {
  //             Alert.alert('You are not authorized to access the module');
  //             navigation.dispatch(
  //               CommonActions.reset({
  //                 index: 0,
  //                 routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
  //               }),
  //             );
  //           } else {
  //             NetInfo.fetch().then(async state => {
  //               if (state.isConnected) {
  //                 if (useDivision === 'MARKETING') {
  //                   navigation.dispatch(
  //                     CommonActions.reset({
  //                       index: 0,
  //                       routes: [{name: 'AppNavActivity'}], // or whatever your main screen is
  //                     }),
  //                   );
  //                 } else {
  //                   navigation.dispatch(
  //                     CommonActions.reset({
  //                       index: 0,
  //                       routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
  //                     }),
  //                   );
  //                   Alert.alert('You are not authorized');
  //                 }
  //               } else {
  //                 Alert.alert('No Internet');
  //                 navigation.dispatch(
  //                   CommonActions.reset({
  //                     index: 0,
  //                     routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
  //                   }),
  //                 );
  //               }
  //             }, []);
  //           }
  //           break;
  //         case 'SURVEY':
  //           if (
  //             ['GENI-QST-536', 'DEV-GENI-536'].includes(useBusinessID.trim())
  //           ) {
  //             Alert.alert('You are not authorized to access the module');
  //             navigation.dispatch(
  //               CommonActions.reset({
  //                 index: 0,
  //                 routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
  //               }),
  //             );
  //           } else {
  //             NetInfo.fetch().then(state => {
  //               if (state.isConnected) {
  //                 //navigation.navigate('Quiz Dashboard');
  //                 navigation.dispatch(
  //                   CommonActions.reset({
  //                     index: 0,
  //                     routes: [{name: 'AppNavQuiz'}], // or whatever your main screen is
  //                   }),
  //                 );
  //               } else {
  //                 Alert.alert('Internet Is Required!');
  //                 navigation.dispatch(
  //                   CommonActions.reset({
  //                     index: 0,
  //                     routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
  //                   }),
  //                 );
  //               }
  //             });
  //           }
  //           break;
  //         case 'EXPENSE':
  //           NetInfo.fetch().then(state => {
  //             if (state.isConnected) {
  //               setLoading(true);
  //               setTimeout(() => {
  //                 setLoading(false);
  //               }, 5000);
  //               navigation.dispatch(
  //                 CommonActions.reset({
  //                   index: 0,
  //                   routes: [{name: 'AppNavExpense'}], // or whatever your main screen is
  //                 }),
  //               );
  //             } else {
  //               navigation.dispatch(
  //                 CommonActions.reset({
  //                   index: 0,
  //                   routes: [{name: 'AppNavExpense'}], // or whatever your main screen is
  //                 }),
  //               );
  //             }
  //           });
  //           break;
  //         default:
  //           Alert.alert(module.Module);
  //       }
  //     };

  //     return null;
  //   };

  //   return (
  //     <Drawer.Screen
  //       key={module.IDMenu}
  //       name={module.Module}
  //       component={CustomScreen}
  //       options={{
  //         drawerIcon: ({color}) => (
  //           <Ionicons name="apps-outline" size={22} color={color} />
  //         ),
  //       }}
  //     />
  //   );
  // };

  // const checkDCRData = async () => {
  //   const url =
  //     BASE_URL +
  //     'Configuration/LockDCR?Businessid=' +
  //     useBusinessID +
  //     '&IdEmployee=' +
  //     useIDEmployee;
  //   console.log(url);
  //   let result = await fetch(url);
  //   result = await result.json();

  //   if (result.d === '') {
  //     setLoading(true);
  //     setTimeout(() => {
  //       setLoading(false);
  //     }, 2000);
  //     checkStartDay();
  //   } else {
  //     setLoading(true);
  //     setTimeout(() => {
  //       setLoading(false);
  //     }, 2000);
  //     Alert.alert(
  //       'Notice', // Title
  //       `${result.d}, Go to Reports and clear your pending DCR.`, // Message
  //     );
  //     navigation.dispatch(
  //       CommonActions.reset({
  //         index: 0,
  //         routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
  //       }),
  //     );
  //   }
  // };

  // const checkStartDay = async () => {
  //   const url =
  //     BASE_URL +
  //     'DCR/StartDay/Check?Businessid=' +
  //     useBusinessID +
  //     '&IDEmployee=' +
  //     useIDEmployee +
  //     '&StartDate';
  //   console.log(url);
  //   let result = await fetch(url);
  //   result = await result.json();

  //   if (result.status === 'STARTED') {
  //     setLoading(true);
  //     setTimeout(() => {
  //       setLoading(false);
  //     }, 2000);
  //     checkStayData();
  //   } else if (result.status === 'NOTSTARTED') {
  //     setLoading(true);
  //     setTimeout(() => {
  //       setLoading(false);
  //     }, 2000);
  //     Alert.alert(result.status);
  //     //navigation.navigate('DCR Session');
  //     navigation.dispatch(
  //       CommonActions.reset({
  //         index: 0,
  //         routes: [{name: 'DCR Session'}], // or whatever your main screen is
  //       }),
  //     );
  //   } else {
  //     navigation.dispatch(
  //       CommonActions.reset({
  //         index: 0,
  //         routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
  //       }),
  //     );
  //     Alert.alert(result.status);
  //   }
  //   try {
  //     const jsonValue = JSON.stringify(result.idday);
  //     await AsyncStorage.setItem('IDday', jsonValue);
  //     //console.log(jsonValue);
  //   } catch (e) {
  //     // saving error
  //     Alert.alert(e);
  //   }
  // };

  // const checkStayData = async () => {
  //   const stay_url =
  //     BASE_URL +
  //     'DCR/Stay/Check?Businessid=' +
  //     useBusinessID +
  //     '&IDEmployee=' +
  //     useIDEmployee +
  //     '&DCRDate=' +
  //     cdate;
  //   console.log(stay_url);
  //   var config = {
  //     method: 'post',
  //     url: stay_url,
  //   };
  //   axios(config)
  //     .then(function (response) {
  //       //CREATE TABLE for CRM_AreaList
  //       //console.log(response.data.result);
  //       if (response.data.result === 'False') {
  //         setLoading(true);
  //         setTimeout(() => {
  //           setLoading(false);
  //         }, 5000);
  //         //navigation.navigate('AppNavDCRScreen');
  //         navigation.dispatch(
  //           CommonActions.reset({
  //             index: 0,
  //             routes: [{name: 'AppNavDCRScreen'}], // or whatever your main screen is
  //           }),
  //         );
  //       } else if (response.data.result === 'True') {
  //         setLoading(true);
  //         setTimeout(() => {
  //           setLoading(false);
  //         }, 3000);
  //         Alert.alert(
  //           useEmpname + ' stay already exist on this date : ' + cdate,
  //         );
  //         navigation.dispatch(
  //           CommonActions.reset({
  //             index: 0,
  //             routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
  //           }),
  //         );
  //       }
  //     })
  //     .catch(function (error) {
  //       Alert.alert(error);
  //     });
  // };

  // const chectTourPlanData = () => {
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       // 'SELECT * FROM CRM_ManagerStartDay where StartDate=?',
  //       //'SELECT * FROM CRM_TourPlanDate where TourDate=?',
  //       'SELECT * FROM CRM_TourPlanDate where TourDate=? AND Approved = ?',
  //       [ctdate, true],
  //       (tx, results) => {
  //         // Check if there are rows in the result set
  //         if (results.rows.length > 0) {
  //           console.warn('Tour Program Approved');
  //           db.transaction(tx => {
  //             // Execute a query to retrieve table information
  //             tx.executeSql(
  //               //"SELECT name FROM sqlite_master WHERE type='table' AND name='CRM_StartDay'",
  //               "SELECT name FROM sqlite_master WHERE type='table' AND name='CRM_StartDayDummy'",
  //               [],
  //               (tx, results) => {
  //                 // Check if any rows are returned
  //                 if (results.rows.length > 0) {
  //                   // Table exists
  //                   console.warn('Table exists');
  //                   //navigation.navigate('AppNavDCRScreen');
  //                   checkTableData();
  //                 } else {
  //                   // Table does not exist
  //                   console.warn('Table does not exists');
  //                   //navigation.navigate('DCR Session');
  //                   navigation.dispatch(
  //                     CommonActions.reset({
  //                       index: 0,
  //                       routes: [{name: 'DCR Session'}], // or whatever your main screen is
  //                     }),
  //                   );
  //                 }
  //               },
  //               error => {
  //                 // Error occurred while executing the query
  //                 console.log(error);
  //               },
  //             );
  //           });
  //         } else {
  //           console.log('Table is empty');
  //           Alert.alert('Tour Program not found on this day: ' + ctdate);
  //           navigation.dispatch(
  //             CommonActions.reset({
  //               index: 0,
  //               routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
  //             }),
  //           );
  //         }
  //       },
  //       error => console.error('Error executing SELECT query: ', error),
  //     );
  //   });
  //   //}
  // };

  // const checkTableData = () => {
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       //'SELECT * FROM CRM_StartDay where StartDate=?',
  //       'SELECT * FROM CRM_StartDayDummy where StartDate=?',
  //       [cdate],
  //       (tx, results) => {
  //         // Check if there are rows in the result set
  //         if (results.rows.length > 0) {
  //           console.log('Table has data');
  //           //navigation.navigate('AppNavDCRScreen');
  //           navigation.dispatch(
  //             CommonActions.reset({
  //               index: 0,
  //               routes: [{name: 'AppNavDCRScreen'}], // or whatever your main screen is
  //             }),
  //           );
  //         } else {
  //           console.log('Table is empty');
  //           //navigation.navigate('DCR Session');
  //           navigation.dispatch(
  //             CommonActions.reset({
  //               index: 0,
  //               routes: [{name: 'DCR Session'}], // or whatever your main screen is
  //             }),
  //           );
  //         }
  //       },
  //       error => console.error('Error executing SELECT query: ', error),
  //     );
  //   });
  // };

  return (
    <>
      <StatusBar backgroundColor="#a9ddfaff" barStyle="light-content" />

      <Drawer.Navigator drawerContent={props => <CustomDrawer {...props} />}>
        <Drawer.Screen
          name="Dashboard"
          component={CRMDashBoard}
          options={{
            drawerIcon: ({ color }) => (
              <Ionicons name="home-outline" size={22} color={color} />
            ),
            headerBackground: () => (
              <LinearGradient
                colors={['#a9ddfaff', '#005696']} // light → dark
                style={{ flex: 1 }}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
            ),
            headerTintColor: '#ffffff', // white back button and title
            headerTitleStyle: {
              fontWeight: 'bold',
              color: '#ffffff',
              fontSize: 22,
              textAlign: 'center',
              justifyContent: 'center',
            },
          }}
        />
        <Drawer.Screen
          name="BirthDay List"
          component={BirthDayScreen}
          options={{
            drawerIcon: ({ color }) => (
              <Ionicons name="calendar-outline" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="User Info"
          component={UserInfoScreen}
          options={{
            drawerIcon: ({ color }) => (
              <Ionicons name="person-outline" size={22} color={color} />
            ),
          }}
        />
        {/* {modules.map(renderScreen)} */}
        <Drawer.Screen
          name="LogOut"
          component={LogoutScreen}
          options={{
            drawerIcon: ({ color }) => (
              <Ionicons name="exit-outline" size={22} color={color} />
            ),
          }}
        />
      </Drawer.Navigator>
    </>
  );
};

export default DrawerNavigator;
