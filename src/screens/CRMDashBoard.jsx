import {
  View,
  Text,
  SafeAreaView,
  ImageBackground,
  Dimensions,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  BackHandler,
  Linking,
  Modal,
  TextInput,
  Keyboard,
  ScrollView,
  RefreshControl,
  Animated,
  Easing,
  ActivityIndicator,
  StatusBar,
  LogBox,
  Image,
  Pressable,
  Platform,
  PanResponder,
} from 'react-native';
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { BASE_URL, Sales_URL, url } from '@env';
import { openDatabase } from 'react-native-sqlite-storage';
import axios from 'axios';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';
import Voice from '@react-native-voice/voice';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import CustomViewMaster from '../components/custom/CustomViewMaster';
import CRMImg from '../images/CRMNEW.svg';
import ProgressDialog from '../components/custom/ProgressDialog';
import HomeImg from '../images/home.svg';
import { CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { format } from 'date-fns';
import { Dropdown } from 'react-native-element-dropdown';
import { PieChart } from 'react-native-gifted-charts';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { firebaseChatLogin } from '../utils/firebaseChatAuth';
import auth from '@react-native-firebase/auth';
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import RNBlobUtil from 'react-native-blob-util';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Buffer } from 'buffer';
import { log } from 'console';
import { Use } from 'react-native-svg';

//import Share from 'react-native-share';
//import PushNotification from 'react-native-push-notification';
// import { showLocalNotification } from './NotificationService';
//import messaging from '@react-native-firebase/messaging';
const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
global.Buffer = global.Buffer || require('buffer').Buffer;
//database connection
const db = openDatabase(
  {
    name: 'CRM_db',
    location: 'default',
  },
  () => {
    //console.log('Database connected!');
  }, //on success
  error => console.log('Database error', error), //on error
);

const CRMDashBoard = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [useIDEmployee, setIDEmployee] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [useEmpname, setEmpname] = useState('');
  const [useManagerAccess, setuseManagerAccess] = useState('');
  const [useMobileAccess, setuseMobileAccess] = useState('');
  const [useAdminAcess, setAdminAcess] = useState('');
  const [useTrackingTime, setTrackingTime] = useState('');
  const [data, setData] = useState([]);
  //const [dashboarddata, setDashBoardData] = useState([]);
  const [DoctorVisitFrequency, setDoctorDVisitFrequencyata] = useState([]);
  const [RetailerVisitFrequency, setRetailerDVisitFrequencyata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [useDivision, setDivision] = useState('');
  const [useSecurityKey, setSecurityKey] = useState('');
  const [useEmpemail, setEmpemail] = useState('');
  const [useEmpNo, setEmpNo] = useState('');
  const [useDesignation, setDesiganation] = useState('');
  const [speed, setSpeed] = useState(null);
  const [isPoorConnection, setIsPoorConnection] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [netState, setNetState] = useState({ isConnected: true });
  const scrollViewRef = useRef(null);
  const apiTraceInstalledRef = useRef(false);
  const [refreshing, setRefreshing] = useState(false);
  const [todayDashboardData, setTodayDashboardData] = useState([]);
  const [avgDashboardData, setAvgDashboardData] = useState([]);
  const [modules, setModules] = useState([]);
  const [gamesTab, setGamesTab] = useState(1);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isIncentiveModalVisible, setIncentiveModalVisible] = useState(false);
  const [salesLoading, setSalesLoading] = useState(false);
  const [useModalMessage, setModalMessage] = useState('');
  const [birthdays, setBirthdays] = useState([]);
  const [noticeboard, setNoticeBoard] = useState([]);
  const [visible, setVisible] = useState(false);
  const [noticeurl, setNoticeUrl] = useState('');
  const [profilePicPath, setProfilePicPath] = useState('');
  const [myteam, setMyTeam] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [saleData, setSaleData] = useState(null);
  const [achievement, setAchievement] = useState(0);
  const [viewType, setViewType] = useState('Monthly'); // default: Monthly
  const [phoneModalVisible, setPhoneModalVisible] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [visitDetailsModalVisible, setVisitDetailsModalVisible] =
    useState(false);
  const [visitReport, setVisitReport] = useState([]);
  const [reportCount, setReportCount] = useState(null);
  const [loadingVisitDetails, setLoadingVisitDetails] = useState(false);
  const [useHq, setUseHq] = useState('');
  const [showMPPLData, setshowMPPLData] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [useIDyear, setIDyear] = useState([]);
  const [useIDQuarter, setIDQuarter] = useState([]);
  const [useIDyearvalue, setIDyearValue] = useState('');
  const [useIDQuartervalue, setIDQuarterValue] = useState('');
  const [products, setProducts] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [dataFound, setDataFound] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleLoadMessage, setModuleLoadMessage] = useState('');
  const [isDashboardTabOpen, setIsDashboardTabOpen] = useState(false);

  const dashboardTabAnim = useRef(new Animated.Value(0)).current;

  const dashboardTabWidth = Math.min(width * 0.92, isTablet ? 540 : width - 28);

  const openDashboardTab = () => {
    setIsDashboardTabOpen(true);

    Animated.timing(dashboardTabAnim, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const closeDashboardTab = () => {
    Animated.timing(dashboardTabAnim, {
      toValue: 0,
      duration: 240,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setIsDashboardTabOpen(false);
    });
  };

  const dashboardTabTranslateX = dashboardTabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [dashboardTabWidth, 0],
  });

  const dashboardTabBackdropOpacity = dashboardTabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.42],
  });

  const dashboardTabSwipeResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const isHorizontalSwipe =
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy);

        return isHorizontalSwipe && gestureState.dx < -14;
      },

      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -45) {
          openDashboardTab();
        }
      },
    }),
  ).current;

  const dashboardTabCloseResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const isHorizontalSwipe =
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy);

        return isHorizontalSwipe && gestureState.dx > 14;
      },

      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 45) {
          closeDashboardTab();
        }
      },
    }),
  ).current;


  const traceApiError = (label, endpoint, error) => {
    const status = error?.response?.status || error?.status;
    const data = error?.response?.data || error?.data;
    console.log('[API TRACE]', {
      label,
      endpoint,
      message: error?.message,
      status,
      data,
    });
  };

  const getDataShape = value => {
    if (Array.isArray(value)) {
      return {
        type: 'array',
        count: value.length,
        firstItem: value[0] || null,
      };
    }

    if (value && typeof value === 'object') {
      return {
        type: 'object',
        keys: Object.keys(value),
        dataType: Array.isArray(value.data) ? 'data-array' : typeof value.data,
        dataCount: Array.isArray(value.data) ? value.data.length : null,
        firstDataItem: Array.isArray(value.data) ? value.data[0] || null : null,
      };
    }

    return {
      type: typeof value,
      value,
    };
  };

  const traceApiSuccess = (label, endpoint, status, data) => {
    console.log('[API SUCCESS]', {
      label,
      endpoint,
      status,
      shape: getDataShape(data),
    });
  };

  const traceProcessingError = (label, endpoint, step, error, extra = {}) => {
    console.log('[PROCESS TRACE]', {
      label,
      endpoint,
      step,
      message: error?.message || String(error),
      extra,
    });
  };

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  const axiosGetWithRetry = async (label, endpoint, attempts = 3) => {
    let lastError;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        return await axios.get(endpoint, { timeout: 15000 });
      } catch (error) {
        lastError = error;

        if (attempt === attempts) {
          break;
        }

        console.log('[API RETRY]', {
          label,
          endpoint,
          attempt,
          message: error?.message,
        });
        await sleep(800 * attempt);
      }
    }

    throw lastError;
  };

  const insertDashboardRows = (label, endpoint, rows) => {
    if (!Array.isArray(rows)) {
      traceProcessingError(
        label,
        endpoint,
        'DashboardData response is not an array',
        new Error('Invalid DashboardData response'),
        { shape: getDataShape(rows) },
      );
      return;
    }

    rows.forEach((array, index) => {
      const params = [
        array?.Module ?? '',
        array?.IDMenu ?? '',
        array?.MainModuleSRL ?? '',
      ];

      if (!array?.Module || array?.IDMenu === undefined) {
        traceProcessingError(
          label,
          endpoint,
          'DashboardData row has missing fields',
          new Error('Missing fields'),
          { index, item: array, params },
        );
      }

      db.executeSql(
        'INSERT INTO DashboardData(Module,IDMenu,MainModuleSRL) VALUES (?,?,?)',
        params,
        () => {
          console.log('[SQL TRACE]', {
            label,
            table: 'DashboardData',
            index,
            status: 'inserted',
            params,
          });
        },
        error => {
          traceProcessingError(
            label,
            endpoint,
            'DashboardData insert failed',
            error,
            { index, item: array, params },
          );
        },
      );
    });
  };

  const DashboardCard = ({ title, count, icon }) => (
    <View style={styles.compactMetricCard}>
      <View style={styles.compactMetricTop}>
        <View style={styles.compactMetricIconBox}>
          <Feather name={icon} size={16} color="#005696" />
        </View>

        <View style={styles.compactMetricDot} />
      </View>

      <Text style={styles.compactMetricCount} numberOfLines={1}>
        {count ?? 0}
      </Text>

      <Text style={styles.compactMetricTitle} numberOfLines={2}>
        {title}
      </Text>
    </View>
  );

  const QuickAccessCard = ({ title, icon, backgroundColor }) => (
    <TouchableOpacity
      onPress={() => Alert.alert('Notice', 'Quick Access is coming soon')}
      style={{ flex: 1 }}>
      <View style={[styles.dashboardCard, { backgroundColor }]}>
        <Text style={styles.titlequickaccess}>{title}</Text>
        <Feather name={icon} size={28} color="#ffffff" style={styles.icon} />
        {/* <Text style={styles.count}>{count}</Text> */}
      </View>
    </TouchableOpacity>
  );
  let tableCreated = false;

  const onSelectSwitch = value => setGamesTab(value);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const measureSpeed = async () => {
    let poorCount = 0;

    for (let i = 0; i < 3; i++) {
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        console.log('No connection. Skipping speed check.');
        setIsPoorConnection(true);
        return;
      }

      const startTime = Date.now();
      try {
        const response = await fetch(
          'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
        );
        const data = await response.blob();
        const endTime = Date.now();

        const duration = (endTime - startTime) / 1000;
        const fileSizeInBytes = data.size;
        const speedInKbps = fileSizeInBytes / duration / 1024;

        setSpeed(speedInKbps);
        // console.log(Check ${i + 1}: ${speedInKbps.toFixed(2)} KB/s);

        if (speedInKbps < 150.0) {
          poorCount++;
        }
      } catch (err) {
        console.log('Speed check failed.');
        setSpeed(null);
      }

      await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1 second before next check
    }

    if (poorCount === 3) {
      setIsPoorConnection(true);
    } else {
      setIsPoorConnection(false);
    }
  };

  useEffect(() => {
    if (apiTraceInstalledRef.current) {
      return;
    }

    apiTraceInstalledRef.current = true;

    const responseInterceptor = axios.interceptors.response.use(
      response => {
        traceApiSuccess(
          'axios',
          response?.config?.url,
          response?.status,
          response?.data,
        );
        return response;
      },
      error => {
        traceApiError('axios', error?.config?.url, error);
        return Promise.reject(error);
      },
    );

    const originalFetch = global.fetch;
    global.fetch = async (...args) => {
      const endpoint =
        typeof args[0] === 'string' ? args[0] : args[0]?.url || 'unknown';
      try {
        const response = await originalFetch(...args);
        console.log('[FETCH SUCCESS]', {
          endpoint,
          status: response?.status,
          ok: response?.ok,
        });
        return response;
      } catch (error) {
        traceApiError('fetch', endpoint, error);
        throw error;
      }
    };

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
      global.fetch = originalFetch;
      apiTraceInstalledRef.current = false;
    };
    // Install global API tracing once for this dashboard mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    LogBox.ignoreAllLogs();
    // Get the current connection type and check if connected
    // Monitor network changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetState(state);

      // Update poor connection logic
      if (!state.isConnected) {
        setIsPoorConnection(false); // No internet is not the same as poor
      } else {
        // Mark cellular or unknown networks as poor (custom logic)
        const poorTypes = ['cellular', 'unknown'];
        setIsPoorConnection(poorTypes.includes(state.type));
      }
    });

    // Set interval to refresh speed every 5 seconds if connected
    const intervalId = setInterval(() => {
      NetInfo.fetch().then(state => {
        if (state.isConnected) {
          measureSpeed();
        }
      });
    }, 5000); // 5000 milliseconds = 5 seconds

    // Cleanup the event listener and interval on unmount
    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  //Get Current Month Name
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const d = new Date();
  const month = monthNames[d.getMonth()];
  const cYear = moment().year();
  //console.log(month + ' ' + cYear);
  var cdate = moment().format('D/MMM/YYYY');
  var ctdate = moment().format('DD/MM/YYYY');
  //code  by  suman Jana
  const sDate = moment().startOf('month').format('YYYY/MM/DD'); // 2025/05/01
  const eDate = moment().subtract(1, 'days').format('YYYY/MM/DD'); // yesterday
  //end here

  useEffect(() => {
    // code by suman jana 30/05/2025
    // requestNotificationPermission();
    // getFcmToken();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 5000);
    try {
      AsyncStorage.getItem('UserData').then(async value => {
        if (value != null) {
          let user = JSON.parse(value);
          console.log('User Data from AsyncStorage : ', user);
          setIDEmployee(user.IDEmployee);
          setBusinessID(user.BusinessID);
          setEmpname(user.Empname);
          setEmpNo(user.Empno);
          setuseManagerAccess(user.ManagerAccess);
          setuseMobileAccess(user.MobileAccess);
          setAdminAcess(user.AdminAccess);
          setTrackingTime(user.TrackingTime);
          setProfilePicPath(user.ProfilePicPath);
          setDivision(user.Division);
          setSecurityKey(user.SecurityKey);
          setEmpemail(user.Empemail);
          setDesiganation(user.Designation);
          setUseHq(user.HQ);
          fetchModules(user.BusinessID, user.Designation);
          //if (user.Designation !== 'DY_ZSM' && user.Designation !== 'ZSM') {
          if (user.Division === 'MPPL') {
            setshowMPPLData(true);
          } else {
            setshowMPPLData(false);
          }

          // NetInfo.fetch().then(state => {
          //   if (state.isConnected) {
          //     fetchOfflineData(
          //       user.BusinessID,
          //       user.IDEmployee,
          //       user.IDManager,
          //     );
          //   } else {
          //     Alert.alert('No Internet');
          //   }
          // }, []);

          NetInfo.fetch().then(state => {
            if (state.isConnected) {
              if (user.AdminAccess === true) {
                fetchBirthdays(user.BusinessID);
                fetchNoticeBoard(user.BusinessID, user.IDDivision);
                fetchMyTeam(user.BusinessID, user.IDEmployee);
              } else {
                if (
                  user.Designation !== 'DY_ZSM' &&
                  user.Designation !== 'ZSM' &&
                  user.Designation !== 'SR-ZSM'
                ) {
                  if (user.ManagerAccess === true) {
                    managerEmployeeWiseOfflineAreaList(
                      user.BusinessID,
                      user.IDEmployee,
                    );
                    managerEmployeeWiseOfflineDoctorList(
                      user.BusinessID,
                      user.IDEmployee,
                    );
                    managerEmployeeWiseOfflineRetailerList(
                      user.BusinessID,
                      user.IDEmployee,
                    );
                    offlineOrderBookingCustomerListForManager(
                      user.BusinessID,
                      user.IDDivision,
                      user.IDEmployee,
                    );
                  } else {
                    docList(user.BusinessID, user.IDEmployee);
                    retList(user.BusinessID, user.IDEmployee);
                    doctorProductMappingOfflineList(
                      user.BusinessID,
                      user.Empemail,
                      user.IDEmployee,
                    );
                    productMasterDoctor(user.BusinessID, user.IDDivision);
                    areaMaster(user.BusinessID, user.IDDivision, user.IDHQ);
                    typeAPI(user.BusinessID);
                    employeeWiseAreaList(user.BusinessID, user.IDEmployee);
                    offlineOrderBookingCustomerList(
                      user.BusinessID,
                      user.IDEmployee,
                    );
                  }
                  areaList(user.BusinessID, user.IDHQ);
                  visitWithList(user.BusinessID, user.IDEmployee);
                  wtDDOpen(user.BusinessID, user.IDEmployee);
                  getfinalSatge(user.BusinessID);
                  qualificationDDOpen(user.BusinessID);
                  specialityDDOpen(user.BusinessID);
                  categoryDDOpen(user.BusinessID);
                  unlistedtypeAPI(user.BusinessID);
                  tourdateCheck(user.BusinessID, month, cYear, user.IDEmployee);
                  expenseRequestList(user.BusinessID, user.IDEmployee);
                  orderBookingPrice(user.BusinessID);
                  if (user.BusinessID.trim() != 'GENI-QST-536') {
                    getIDYearIncentive(user.BusinessID);
                  }
                  orderBookingBillingSeries(user.BusinessID);
                  orderBookingProductList(user.BusinessID);
                  masterDoctorType(user.BusinessID);
                  productGift(user.BusinessID, user.IDDivision);
                  productSample(user.BusinessID, user.IDDivision);
                  ExpenseHead(user.BusinessID);
                  doctorViewDCR(user.BusinessID, user.IDEmployee);
                  retailerViewDCR(user.BusinessID, user.IDEmployee);
                  unlistedViewDCR(user.BusinessID, user.IDEmployee);
                  employeeWiseDashboardData(
                    user.BusinessID,
                    user.IDEmployee,
                    sDate,
                    eDate,
                  );
                  employeewiseDoctorVisitFrequency(
                    user.BusinessID,
                    user.IDEmployee,
                  );
                  employeewiseRetailerVisitFrequency(
                    user.BusinessID,
                    user.IDEmployee,
                  );
                  fetchBirthdays(user.BusinessID);
                  fetchNoticeBoard(user.BusinessID, user.IDDivision);
                  fetchMyTeam(user.BusinessID, user.IDEmployee);
                  campaignData(user.BusinessID, user.IDEmployee);
                  campaignproductData(user.BusinessID, user.IDEmployee);
                  offlinePendingDCRDate(user.BusinessID, user.IDEmployee);
                  fetchGeofencingData(user.BusinessID, user.IDEmployee);
                  //expenseBookingList(user.BusinessID, user.IDEmployee);
                  //orderbookingRetailerList(user.BusinessID, user.IDEmployee);
                  //expenseList(user.BusinessID, user.IDEmployee);
                  //orderList(user.BusinessID, user.IDEmployee);
                } else {
                  employeeWiseDashboardData(
                    user.BusinessID,
                    user.IDEmployee,
                    sDate,
                    eDate,
                  );
                  employeewiseDoctorVisitFrequency(
                    user.BusinessID,
                    user.IDEmployee,
                  );
                  employeewiseRetailerVisitFrequency(
                    user.BusinessID,
                    user.IDEmployee,
                  );
                  offlinePendingDCRDate(user.BusinessID, user.IDEmployee);
                  fetchGeofencingData(user.BusinessID, user.IDEmployee);
                  masterDoctorType(user.BusinessID);
                  productGift(user.BusinessID, user.IDDivision);
                  productSample(user.BusinessID, user.IDDivision);
                  campaignData(user.BusinessID, user.IDEmployee);
                  campaignproductData(user.BusinessID, user.IDEmployee);
                  wtDDOpen(user.BusinessID, user.IDEmployee);
                  getfinalSatge(user.BusinessID);
                  qualificationDDOpen(user.BusinessID);
                  specialityDDOpen(user.BusinessID);
                  categoryDDOpen(user.BusinessID);
                  unlistedtypeAPI(user.BusinessID);
                  tourdateCheck(user.BusinessID, month, cYear, user.IDEmployee);
                  expenseRequestList(user.BusinessID, user.IDEmployee);
                  orderBookingPrice(user.BusinessID);
                  orderBookingBillingSeries(user.BusinessID);
                  orderBookingProductList(user.BusinessID);
                  ExpenseHead(user.BusinessID);
                  doctorViewDCR(user.BusinessID, user.IDEmployee);
                  retailerViewDCR(user.BusinessID, user.IDEmployee);
                  unlistedViewDCR(user.BusinessID, user.IDEmployee);
                  //Code by Suman Jana
                  fetchBirthdays(user.BusinessID);
                  fetchNoticeBoard(user.BusinessID, user.IDDivision);
                  fetchMyTeam(user.BusinessID, user.IDEmployee);
                }
              }

              getFrequencyDetail(user.BusinessID);
              getConfigurationDetail(user.BusinessID);
              fetchQuizModules(user.BusinessID, user.IDEmployee);
              fetchMasterModules(user.BusinessID, user.IDEmployee);
              fetchDCRModules(user.BusinessID, user.IDEmployee);
              checkCompanyValidation(user.BusinessID);
            } else {
              Alert.alert('No Internet');
              //fetchDashboardFromSQLite(); // fatch the Data From the Sqlite
            }
          }, []);
        }
      });
    } catch (error) {
      console.log(error.message);
    }
    // This is the dashboard bootstrap; rerunning it on every helper identity
    // change would repeat the full startup sync and API load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (useDivision && useEmpemail && useDesignation && useEmpNo) {
      fetchSaledata(viewType);
    }
  }, [
    fetchSaledata,
    useDivision,
    useEmpemail,
    useDesignation,
    useEmpNo,
    viewType,
  ]);

  // code by suman jana date - 24/05/2025
  const onRefresh = useCallback(() => {
    setRefreshing(true);

    AsyncStorage.getItem('UserData')
      .then(value => {
        if (value != null) {
          const user = JSON.parse(value);

          //code by Suman
          employeeWiseDashboardData(
            user.BusinessID,
            user.IDEmployee,
            sDate,
            eDate,
          );
          employeewiseDoctorVisitFrequency(user.BusinessID, user.IDEmployee);
          employeewiseRetailerVisitFrequency(user.BusinessID, user.IDEmployee);
          //Code by Suman Jana
          fetchBirthdays(user.BusinessID);
          fetchNoticeBoard(user.BusinessID, user.IDDivision);
          fetchMyTeam(user.BusinessID, user.IDEmployee);
          fetchModules(user.BusinessID, user.Designation);
          //end
        }
      })
      .catch(error => {
        console.error('Error fetching user data from AsyncStorage:', error);
      })
      .finally(() => {
        setTimeout(() => {
          setRefreshing(false);
          //selectionMode=2;
          onSelectSwitch(1);
        }, 1000); // shorter refresh delay for better UX
      });
    // Keep pull-to-refresh tied to the current computed date range only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eDate, sDate]);
  // end here

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        Alert.alert('Hold on!', 'Are you sure you want to go back?', [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
          { text: 'YES', onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      return () => backHandler.remove();
    }, []),
  );

  const botResponses = {
    hello: 'Hi there! How can I help you?',
    hi: "Hey! What's up?",
    help: 'Sure! Ask me anything.',
    bye: 'Goodbye! Have a great day.',
    thanks: "You're welcome!",
    who: "I'm your offline and Online assistant chatbot.",
    'what is ie.crm':
      "it's a Mendine Group internal app to handel there field Employee.",
    'how do i log in to the crm':
      "Open the app and enter your Business ID, Email ID, and Password on the Login screen. If the credentials are valid, you'll be redirected to the dashboard.",
    'what can i access from the crm dashboard':
      'From the dashboard, you can access DCR, Expense, Orders, Tour Program, Reports, Master Data, and Settings.',
    'how do i start filling a daily call report (dcr)':
      'Navigate to the DCR module, select the client type (Doctor, Retailer, or Others), choose the area, and start entering interaction details, location, samples, and remarks.',
    'what details should i fill in a doctor dcr':
      'You must enter location (captured via GPS), select the doctor, enter remarks, choose samples/gifts given, and update product stages using the Doctor Product Stage Interface.',
    'how can i record doctor feedback during visits':
      'Use the Doctor Product Stage Interface within the DCR to log doctor feedback, product interest, objections, and stage of discussion (TG, CVT, SCT, RX).',
    'can i enter expenses during visits':
      'Yes. In the Expense module, select the expense head (e.g., Travel), enter the amount and remarks, and submit.',
    'how do i log a new customer if they are not listed':
      'Go to the Unlisted section in the DCR module, fill in customer name, mobile, work type, and remarks, then save the record.',
    'what is the use of the order module':
      'The Order module helps you record customer orders. Select the customer, add products with quantity and amount, and submit the order.',
    'how do i plan and track visits using tour program':
      'Use the Tour Program module to add planned visits. You can schedule daily/weekly visits with specific objectives and receive reminders.',
    'what is rcpa in crm':
      'RCPA (Retail Chemist Prescription Audit) tracks prescriptions at chemist shops. You can log doctor prescriptions, check availability, record alternate brands, and get chemist feedback.',
    'what details do i enter in the rcpa module':
      'Enter doctor name, chemist, prescribed product, availability, competitor brand (if any), and save the data for syncing.',
    'how can i track marketing activities in crm':
      'Go to the Activity Tracking module to log events like doctor meetings, CMEs, or detailing activities. Include time, location, and discussion outcomes.',
    'how do i generate my daily activity (da) report':
      'After entering all DCRs, visit logs, and activity records, the DA report is automatically generated and can be submitted for manager review.',
    'can i use the crm app offline':
      'Yes. All modules (DCR, Orders, Expenses, Tour Program) work offline. Data syncs automatically when you regain internet access.',
    'what happens after i submit a dcr':
      'It is stored locally (offline) and will be synchronized with the CRM backend when online. Managers can then review it for compliance and reporting.',
    'what is the purpose of the doctor product stage interface':
      'It allows you to track the stage of discussion for each product (TG, CVT, SCT, RX) during doctor visits for better targeting and reporting.',
    'how do i know if my data is synchronized':
      'Open the Settings module and check the Sync Status. You can also initiate manual sync for DCRs, Orders, and Expenses.',
    'how do managers review field activities':
      'Once data is synced, managers can access real-time reports on visits, expenses, orders, and activities for performance tracking.',
    'what analytics can i see in reports':
      'Reports show doctor visit frequency, order trends, expense summaries, RCPA analytics, and regional activity insights.',
  };

  // const GEMINI_API_KEY = 'AIzaSyCeD80CDM501fhJuWrO7ddNSqyupEKDQlI'; // Replace with your real Gemini API Key

  // const handleSendChat = async () => {
  //   try {
  //     if (!chatInput || chatInput.trim() === '') return;

  //     const userInput = chatInput.trim();
  //     const cleaned = userInput.toLowerCase();
  //     const userMsg = { sender: 'user', text: userInput };
  //     setChatMessages(prev => [...prev, userMsg]);
  //     setIsTyping(true);
  //     setChatInput('');

  //     const net = await NetInfo.fetch();

  //     // ✅ Try to get response from predefined botResponses first
  //     if (botResponses[cleaned]) {
  //       const botMsg = { sender: 'bot', text: botResponses[cleaned] };
  //       setIsTyping(false);
  //       setChatMessages(prev => [...prev, botMsg]);
  //       return;
  //     }

  //     // 🌐 If online and not in botResponses → call Gemini API
  //     if (net.isConnected) {
  //       const response = await fetch(
  //         `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
  //         {
  //           method: 'POST',
  //           headers: {
  //             'Content-Type': 'application/json',
  //           },
  //           body: JSON.stringify({
  //             contents: [
  //               {
  //                 parts: [{ text: userInput }],
  //               },
  //             ],
  //           }),
  //         },
  //       );

  //       const data = await response.json();

  //       const botText =
  //         data?.candidates?.[0]?.content?.parts?.[0]?.text ||
  //         "Sorry, I couldn't generate a response.";

  //       const botMsg = { sender: 'bot', text: botText };
  //       setIsTyping(false);
  //       setChatMessages(prev => [...prev, botMsg]);
  //     } else {
  //       // 🔴 Offline and not in predefined list
  //       const botMsg = {
  //         sender: 'bot',
  //         text: "I'm offline and can't answer this question right now.",
  //       };
  //       setIsTyping(false);
  //       setChatMessages(prev => [...prev, botMsg]);
  //     }
  //   } catch (error) {
  //     console.log('Gemini Chat Error:', error);
  //     const botMsg = {
  //       sender: 'bot',
  //       text: 'Oops! Something went wrong while connecting to Gemini.',
  //     };
  //     setIsTyping(false);
  //     setChatMessages(prev => [...prev, botMsg]);
  //   }
  // };

  const handleSendChat = async () => {
    try {
      if (!chatInput || chatInput.trim() === '') return;

      const userInput = chatInput.trim();
      const cleaned = userInput.toLowerCase();

      const userMsg = { sender: 'user', text: userInput };
      setChatMessages(prev => [...prev, userMsg]);
      setIsTyping(true);
      setChatInput('');

      const net = await NetInfo.fetch();

      /* ✅ 1. Predefined responses */
      if (botResponses[cleaned]) {
        const botMsg = { sender: 'bot', text: botResponses[cleaned] };
        setIsTyping(false);
        setChatMessages(prev => [...prev, botMsg]);
        return;
      }

      /* 🌐 2. Call ChatGPT API */
      if (net.isConnected) {
        const response = await fetch(
          'https://chatgptapi.iecsl.in/api/ChatBot/chat',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              // 'Authorization': `Bearer ${CHATGPT_TOKEN}`, // if needed
            },
            body: JSON.stringify({
              content: userInput,
            }),
          },
        );

        const data = await response.json();

        const botText =
          data?.response || "Sorry, I couldn't generate a response.";

        const botMsg = { sender: 'bot', text: botText };
        setIsTyping(false);
        setChatMessages(prev => [...prev, botMsg]);
      } else {
        /* 🔴 3. Offline fallback */
        const botMsg = {
          sender: 'bot',
          text: "I'm offline and can't answer this question right now.",
        };
        setIsTyping(false);
        setChatMessages(prev => [...prev, botMsg]);
      }
    } catch (error) {
      console.log('ChatGPT API Error:', error);
      const botMsg = {
        sender: 'bot',
        text: 'Oops! Something went wrong while connecting to ChatGPT.',
      };
      setIsTyping(false);
      setChatMessages(prev => [...prev, botMsg]);
    }
  };

  useEffect(() => {
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    try {
      setIsListening(true);

      Voice.onSpeechResults = e => {
        const speech = e.value[0];
        setChatInput(speech);
        setIsListening(false);
        Voice.stop();
      };

      await Voice.start('en-US');

      // ⏳ Auto stop after 5 seconds
      setTimeout(() => {
        if (isListening) {
          Voice.stop();
          setIsListening(false);
        }
      }, 5000); // 5 seconds
    } catch (error) {
      console.error('Voice Error:', error);
      setIsListening(false);
    }
  };
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const chectTourPlanData = () => {
    db.transaction(tx => {
      tx.executeSql(
        // 'SELECT * FROM CRM_ManagerStartDay where StartDate=?',
        //'SELECT * FROM CRM_TourPlanDate where TourDate=?',
        'SELECT * FROM CRM_TourPlanDate where TourDate=? AND Approved = ?',
        [ctdate, true],
        (tx, results) => {
          // Check if there are rows in the result set
          if (results.rows.length > 0) {
            console.warn('Tour Program Approved');
            db.transaction(tx => {
              // Execute a query to retrieve table information
              tx.executeSql(
                //"SELECT name FROM sqlite_master WHERE type='table' AND name='CRM_StartDay'",
                "SELECT name FROM sqlite_master WHERE type='table' AND name='CRM_StartDayDummy'",
                [],
                (tx, results) => {
                  // Check if any rows are returned
                  if (results.rows.length > 0) {
                    // Table exists
                    console.warn('Table exists');
                    //navigation.navigate('AppNavDCRScreen');
                    checkTableData();
                  } else {
                    // Table does not exist
                    console.warn('Table does not exists');
                    //navigation.navigate('DCR Session');
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'DCR Session' }], // or whatever your main screen is
                      }),
                    );
                  }
                },
                error => {
                  // Error occurred while executing the query
                  console.log(error.message);
                },
              );
            });
          } else {
            console.log('Table is empty');
            Alert.alert('Tour Program not found on this day: ' + ctdate);
            // navigation.dispatch(
            //   CommonActions.reset({
            //     index: 0,
            //     routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
            //   }),
            // );
          }
        },
        error => console.error('Error executing SELECT query: ', error),
      );
    });
    //}
  };

  const checkTableData = () => {
    db.transaction(tx => {
      tx.executeSql(
        //'SELECT * FROM CRM_StartDay where StartDate=?',
        'SELECT * FROM CRM_StartDayDummy where StartDate=?',
        [cdate],
        (tx, results) => {
          // Check if there are rows in the result set
          if (results.rows.length > 0) {
            console.log('Table has data');
            //navigation.navigate('AppNavDCRScreen');
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'AppNavDCRScreen' }], // or whatever your main screen is
              }),
            );
          } else {
            console.log('Table is empty');
            //navigation.navigate('DCR Session');
            // navigation.dispatch(
            //   CommonActions.reset({
            //     index: 0,
            //     routes: [{name: 'DCR Session'}], // or whatever your main screen is
            //   }),
            // );
          }
        },
        error => console.error('Error executing SELECT query: ', error),
      );
    });
  };

  const fetchOfflineData = async (businessID, idEmployee, idManager) => {
    const ApiUrl =
      BASE_URL +
      'Mobile/Offline/List?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idEmployee +
      '&IDManager=' +
      idManager;
    console.log('ApiUrl', ApiUrl);

    try {
      const response = await axios.get(ApiUrl);

      if (response.data.Success) {
        const data = response.data.Data;

        //console.log('data.ManagerAreaList', data.ManagerAreaList);

        await saveManagerAreas(data.ManagerAreaList || []);
        await saveManagerDoctors(data.ManagerDoctorList || []);
        await saveManagerRetailers(data.ManagerRetailerList || []);
        await saveEmployeeOfflineOrderBookingCustomerList(
          data.EmployeeOfflineOrderBookingCustomerList || [],
        );
        await saveEmployeeDoctorList(data.EmployeeDoctorList || []);
        await saveEmployeeRetailerList(data.EmployeeRetailerList || []);
        await saveEmployeeDoctorProductMappingList(
          data.EmployeeDoctorProductMappingList || [],
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const saveManagerAreas = areas => {
    db.transaction(txn => {
      txn.executeSql('DROP TABLE IF EXISTS CRM_ManagerAreaList', []);
      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS CRM_ManagerAreaList(IDArea INTEGER,Area VARCHAR,IDEmployee INTEGER)',
        [],
      );
    });
    //SQLITE INSERT AreaListTBL
    var _value = [];
    _value = areas;
    for (var j = 0; j < _value.length; j++) {
      const array = _value[j];
      let sql =
        'INSERT INTO CRM_ManagerAreaList(IDArea,Area,IDEmployee) VALUES (?,?,?)';
      let params = [array.IDArea, array.Area, array.IDEmployee]; //storing user data in an array
      db.executeSql(sql, params);
    }
  };

  const saveManagerDoctors = areas => {
    db.transaction(txn => {
      txn.executeSql('DROP TABLE IF EXISTS CRM_ManagerDoctorList', []);
      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS CRM_ManagerDoctorList (IDDoctor INTEGER PRIMARY KEY,Code TEXT,Name TEXT,Latitude1 TEXT,Longitude1 TEXT,Latitude2 TEXT,Longitude2 TEXT,AreaName TEXT,IDArea INTEGER,IDEmployee INTEGER,FullName TEXT)',
        [],
      );
    });
    //SQLITE INSERT AreaListTBL
    var _value = [];
    _value = areas;
    for (var j = 0; j < _value.length; j++) {
      const item = _value[j];
      let sql =
        'INSERT INTO CRM_ManagerDoctorList(IDDoctor,Code,Name,Latitude1,Longitude1,Latitude2,Longitude2,AreaName,IDArea,IDEmployee,FullName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      let params = [
        item.IDDoctor,
        item.Code,
        item.Name,
        item.Latitude1,
        item.Longitude1,
        item.Latitude2,
        item.Longitude2,
        item.AreaName,
        item.IDArea,
        item.IDEmployee,
        item.FullName,
      ]; //storing user data in an array
      db.executeSql(sql, params);
    }
  };

  const saveManagerRetailers = areas => {
    db.transaction(txn => {
      txn.executeSql('DROP TABLE IF EXISTS CRM_ManagerRetailerList', []);
      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS CRM_ManagerRetailerList (IDRetailer INTEGER PRIMARY KEY,Code TEXT,Name TEXT,Latitude TEXT,Longitude TEXT,AreaName TEXT,IDArea INTEGER,IDEmployee INTEGER,FullName TEXT)',
        [],
      );
    });
    //SQLITE INSERT AreaListTBL
    var _value = [];
    _value = areas;
    for (var j = 0; j < _value.length; j++) {
      const item = _value[j];
      let sql =
        'INSERT INTO CRM_ManagerRetailerList(IDRetailer,Code,Name,Latitude,Longitude,AreaName,IDArea,IDEmployee,FullName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
      let params = [
        item.IDRetailer,
        item.Code,
        item.Name,
        item.Latitude,
        item.Longitude,
        item.AreaName,
        item.IDArea,
        item.IDEmployee,
        item.FullName,
      ]; //storing user data in an array
      db.executeSql(sql, params);
    }
  };

  const saveEmployeeOfflineOrderBookingCustomerList = areas => {
    db.transaction(txn => {
      txn.executeSql(
        'DROP TABLE IF EXISTS CRM_EmployeeOfflineOrderBookingCustomerList',
        [],
      );
      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS CRM_EmployeeOfflineOrderBookingCustomerList (IDRetailer INTEGER PRIMARY KEY,Code TEXT,OtherCode TEXT,Name TEXT,IDArea INTEGER)',
        [],
      );
    });
    //SQLITE INSERT AreaListTBL
    var _value = [];
    _value = areas;
    for (var j = 0; j < _value.length; j++) {
      const item = _value[j];
      let sql =
        'INSERT INTO CRM_EmployeeOfflineOrderBookingCustomerList(IDRetailer,Code,OtherCode,Name,IDArea) VALUES (?, ?, ?, ?, ?)';
      let params = [
        item.IDRetailer,
        item.Code,
        item.OtherCode,
        item.Name,
        item.IDArea,
      ]; //storing user data in an array
      db.executeSql(sql, params);
    }
  };

  const saveEmployeeDoctorList = areas => {
    db.transaction(txn => {
      txn.executeSql('DROP TABLE IF EXISTS CRM_EmployeeDoctorList', []);
      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS CRM_EmployeeDoctorList (IDDoctor INTEGER PRIMARY KEY,Code TEXT,Name TEXT,Latitude1 TEXT,Longitude1 TEXT,Latitude2 TEXT,Longitude2 TEXT,AreaName TEXT,IDArea INTEGER,IDEmployee INTEGER,FullName TEXT)',
        [],
      );
    });
    //SQLITE INSERT AreaListTBL
    var _value = [];
    _value = areas;
    for (var j = 0; j < _value.length; j++) {
      const item = _value[j];
      let sql =
        'INSERT INTO CRM_EmployeeDoctorList(IDDoctor,Code,Name,Latitude1,Longitude1,Latitude2,Longitude2,AreaName,IDArea,IDEmployee,FullName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      let params = [
        item.IDDoctor,
        item.Code,
        item.Name,
        item.Latitude1,
        item.Longitude1,
        item.Latitude2,
        item.Longitude2,
        item.AreaName,
        item.IDArea,
        item.IDEmployee,
        item.FullName,
      ]; //storing user data in an array
      db.executeSql(sql, params);
    }
  };

  const saveEmployeeRetailerList = areas => {
    db.transaction(txn => {
      txn.executeSql('DROP TABLE IF EXISTS CRM_EmployeeRetailerList', []);
      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS CRM_EmployeeRetailerList (IDRetailer INTEGER PRIMARY KEY,Code TEXT,Name TEXT,Latitude TEXT,Longitude TEXT,AreaName TEXT,IDArea INTEGER,IDEmployee INTEGER,FullName TEXT)',
        [],
      );
    });
    //SQLITE INSERT AreaListTBL
    var _value = [];
    _value = areas;
    for (var j = 0; j < _value.length; j++) {
      const item = _value[j];
      let sql =
        'INSERT INTO CRM_EmployeeRetailerList(IDRetailer,Code,Name,Latitude,Longitude,AreaName,IDArea,IDEmployee,FullName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
      let params = [
        item.IDRetailer,
        item.Code,
        item.Name,
        item.Latitude,
        item.Longitude,
        item.AreaName,
        item.IDArea,
        item.IDEmployee,
        item.FullName,
      ]; //storing user data in an array
      db.executeSql(sql, params);
    }
  };
  const saveEmployeeDoctorProductMappingList = areas => {
    db.transaction(txn => {
      txn.executeSql(
        'DROP TABLE IF EXISTS CRM_EmployeeDoctorProductMappingList',
        [],
      );
      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS CRM_EmployeeDoctorProductMappingList (IDDoctor INTEGER PRIMARY KEY,IDStage INTEGER,Stage TEXT,IDProduct INTEGER,ProductName TEXT)',
        [],
      );
    });
    //SQLITE INSERT AreaListTBL
    var _value = [];
    _value = areas;
    for (var j = 0; j < _value.length; j++) {
      const item = _value[j];
      let sql =
        'INSERT INTO CRM_EmployeeDoctorProductMappingList(IDDoctor,IDStage ,Stage ,IDProduct ,ProductName ) VALUES (?, ?, ?, ?,?)';
      let params = [
        item.IDDoctor,
        item.IDStage,
        item.Stage,
        item.IDProduct,
        item.ProductName,
      ]; //storing user data in an array
      db.executeSql(sql, params);
    }
  };

  const areaList = (businessID, hqID) => {
    const aturl =
      BASE_URL +
      'Employee/EmpAreaList?Businessid=' +
      businessID +
      '&IDHQ=' +
      hqID;
    console.log('aturl ' + aturl);
    var config = {
      method: 'get',
      url: aturl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for CRM_AreaList
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_AreaList', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_AreaList(IDArea INTEGER,Name VARCHAR,AreaType VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT AreaListTBL
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_AreaList(IDArea,Name,AreaType) VALUES (?,?,?)';
          let params = [array.IDArea, array.Name, array.AreaType]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };

  const docList = (businessID, empID) => {
    const docurl =
      BASE_URL +
      'Doctor/OfflineDoctorList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      empID;
    console.log('docurl ' + docurl);
    var config = {
      method: 'get',
      url: docurl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        //CREATE TABLE for CRM_DocList
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_DocList', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_DocList(IDDoctor INTEGER,Code INTEGER,IDArea INTEGER,Latitude NUMERIC,Longitude NUMERIC,Name VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT AreaListTBL
        var _value = [];
        _value = response.data.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          //let duplicateData = 'DELETE from CRM_DocList';
          let sql =
            'INSERT INTO CRM_DocList(IDDoctor,Code,IDArea,Latitude,Longitude,Name) VALUES (?,?,?,?,?,?)';
          let params = [
            array.IDDoctor,
            array.Code,
            array.IDArea,
            array.Latitude1,
            array.Longitude1,
            array.Name,
          ]; //storing user data in an array

          db.executeSql(sql, params);
        }
        //console.log(_value);
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };

  const retList = (businessID, empID) => {
    const returl =
      BASE_URL +
      'Retailer/OfflineRetailerList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      empID;
    //console.log('returl ' + returl);
    var config = {
      method: 'get',
      url: returl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        //CREATE TABLE for CRM_RetList
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_RetList', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_RetList(IDRetailer INTEGER,Code INTEGER,Latitude NUMERIC,Longitude NUMERIC,Name TEXT,Area TEXT,OtherCode TEXT)',
            [],
          );
        });

        //SQLITE INSERT AreaListTBL
        var _value = [];
        _value = response.data.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          //let duplicateData = 'DELETE from CRM_DocList';
          let sql =
            'INSERT INTO CRM_RetList(IDRetailer,Code,Latitude,Longitude,Name,Area,OtherCode) VALUES (?,?,?,?,?,?,?)';
          let params = [
            array.IDRetailer,
            array.Code,
            array.Latitude,
            array.Longitude,
            array.Name,
            array.Area.IDArea,
            array.OtherCode,
          ]; //storing user data in an array

          db.executeSql(sql, params);
        }
        //console.log(_value);
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };

  const doctorProductMappingOfflineList = (businessID, empEmail, idEmp) => {
    const returl =
      BASE_URL +
      'Doctor/DoctorProductMappingOfflineList?Businessid=' +
      businessID +
      '&employeeEmail=' +
      empEmail +
      '&IDEmployee=' +
      idEmp;
    console.log('returl ' + returl);
    var config = {
      method: 'get',
      url: returl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data.d);
        //CREATE TABLE for CRM_RetList
        db.transaction(txn => {
          txn.executeSql(
            'DROP TABLE IF EXISTS CRM_DoctorProductMappingListt',
            [],
          );
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_DoctorProductMappingListt(IDDoctor INTEGER,IDProduct INTEGER,IDStage INTEGER,ProductName VARCHAR,StageName VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_DoctorProductMappingListt
        var _value = [];
        _value = response.data.d;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          //let duplicateData = 'DELETE from CRM_DocList';
          let sql =
            'INSERT INTO CRM_DoctorProductMappingListt(IDDoctor,IDProduct,IDStage,ProductName,StageName) VALUES (?,?,?,?,?)';
          let params = [
            array.IDDoctor,
            array.IDProduct,
            array.IDStage,
            array.ProductName,
            array.StageName,
          ]; //storing user data in an array

          db.executeSql(sql, params);
        }
        //console.log(_value);
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };

  const visitWithList = (businessID, idemp) => {
    const vwturl =
      BASE_URL +
      'Employee/EmployeeUpwardManagerList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log(vwturl);
    var config = {
      method: 'get',
      url: vwturl,
    };
    axios(config)
      .then(function (response) {
        // console.log(JSON.stringify(response.data));

        //CREATE TABLE for CRM_VisitWithList
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_VisitWithList', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_VisitWithList(IDEmployee INTEGER,Name VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_VisitWithList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_VisitWithList(IDEmployee,Name) VALUES (?,?)';
          let params = [array.IDEmployee, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };

  const employeeWiseAreaList = (businessID, idemp) => {
    const areaurl =
      BASE_URL +
      'Area/EmployeeWiseAreaList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log('returl ' + areaurl);
    var config = {
      method: 'get',
      url: areaurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for CRM_VisitWithList
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_EmployeeWiseAreaList', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_EmployeeWiseAreaList(IDArea INTEGER,Name VARCHAR,AreaType VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_VisitWithList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_EmployeeWiseAreaList(IDArea,Name,AreaType) VALUES (?,?,?)';
          let params = [array.IDArea, array.Name, array.AreaType]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };

  //code by suman jana Date - 24/08/2025

  // code by  suman jana -30/05/2025
  // const requestNotificationPermission = async () => {
  //     if (Platform.OS === 'ios') {
  //         const authStatus = await messaging().requestPermission();
  //         const enabled =
  //             authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //             authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  //         if (!enabled) {
  //             Alert.alert('Notification permission not granted');
  //         }
  //     } else if (Platform.OS === 'android') {
  //         const granted = await PermissionsAndroid.request(
  //             PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
  //         );
  //         if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
  //             Alert.alert('Notification permission denied');
  //         }
  //     }
  // };
  // const requestNotificationPermission = async () => {
  //   if (Platform.OS === 'android') {
  //     if (Platform.Version >= 33) {
  //       try {
  //         const hasPermission = await PermissionsAndroid.check(
  //           PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
  //         );
  //         if (!hasPermission) {
  //           const result = await PermissionsAndroid.request(
  //             PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  //             {
  //               title: 'Notification Permission',
  //               message: 'This app wants to send you notifications',
  //               buttonNeutral: 'Ask Me Later',
  //               buttonNegative: 'Cancel',
  //               buttonPositive: 'OK',
  //             }
  //           );
  //           if (result === PermissionsAndroid.RESULTS.GRANTED) {
  //             console.log('Permission granted');
  //           } else {
  //             Alert.alert('Notification permission denied');
  //           }
  //         }
  //       } catch (err) {
  //         console.warn('Permission request error:', err);
  //       }
  //     }
  //   }
  // };

  // const getFcmToken = async () => {
  //   try {
  //     // Register the device (important for iOS)
  //     await messaging().registerDeviceForRemoteMessages();

  //     const token = await messaging().getToken();
  //     console.log('FCM Token:', token);

  //     //  Save token to your backend or SQLite
  //     // saveTokenToDatabase(token); // Your own implementation
  //   } catch (error) {
  //     console.error('Failed to get FCM token:', error);
  //   }
  // };

  const employeeWiseDashboardData = async (businessID, idemp, sDate, eDate) => {
    try {
      // 🟢 First API - Today's Tour Program Dashboard
      const url1 = `${BASE_URL}Dashboard/TourProgram/Today?Businessid=${businessID}&IDEmployee=${idemp}`;
      // console.log('TourProgram URL:', url1);
      const response1 = await axios.get(url1);
      setTodayDashboardData(response1.data);
    } catch (error) {
      console.error('TourProgram API Error:', error);
    }

    try {
      // 🟢 Second API - Average Doctor/Retailer Call
      const url2 = `${BASE_URL}user/DoctorAndRetailerCallAverageList?Businessid=${businessID}&IDEmployee=${idemp}&SDate=${sDate}&EDate=${eDate}`;
      //console.log('CallAverage URL:', url2);
      const response2 = await axios.get(url2);
      setAvgDashboardData(response2.data);
    } catch (error) {
      console.error('CallAverage API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const employeewiseDoctorVisitFrequency = async (businessID, idemp) => {
    const DashbourdDoctorVisitFrequencyurl =
      BASE_URL +
      'DCR/DoctorVisitFrequency?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp +
      '&Type=DOCTOR';
    console.log('Dashbourdaurl ' + DashbourdDoctorVisitFrequencyurl);
    try {
      const response = await axios.get(DashbourdDoctorVisitFrequencyurl);
      setDoctorDVisitFrequencyata(response.data);
    } catch (error) {
      traceApiError(
        'DoctorVisitFrequency',
        DashbourdDoctorVisitFrequencyurl,
        error,
      );
    } finally {
      setLoading(false);
    }
  };
  const screenWidth = Dimensions.get('window').width;

  const barData = useMemo(() => {
    const sortedDoctorData = [...DoctorVisitFrequency].sort(
      (a, b) => Number(a.MonthsName) - Number(b.MonthsName),
    );

    return sortedDoctorData.slice(-10).map(item => ({
      value: Number(item.Visit) || 0,
      label: String(item.MonthsName || ''),
      frontColor: '#005696',
      gradientColor: '#A9DDFA',
      topLabelComponent: () => (
        <Text style={styles.chartTopLabel}>{item.Visit}</Text>
      ),
    }));
  }, [DoctorVisitFrequency]);

  // const barData = last10Data.map(item => ({
  //   value: Number(item.Visit) || 0,
  //   label: String(item.MonthsName || ''),
  //   frontColor: '#005696',
  // }));
  const employeewiseRetailerVisitFrequency = async (businessID, idemp) => {
    const DashbourdRetailerVisitFrequencyurl =
      BASE_URL +
      'DCR/PartyVisitFrequency?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp +
      '&Type=RETAILER';
    console.log('Dashbourdaurl ' + DashbourdRetailerVisitFrequencyurl);
    try {
      const response = await axios.get(DashbourdRetailerVisitFrequencyurl);
      setRetailerDVisitFrequencyata(response.data);
    } catch (error) {
      traceApiError(
        'RetailerVisitFrequency',
        DashbourdRetailerVisitFrequencyurl,
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  const chartDataretailer = useMemo(() => {
    const sortedRetailerData = [...RetailerVisitFrequency].sort(
      (a, b) => Number(a.MonthsName) - Number(b.MonthsName),
    );

    return sortedRetailerData.slice(-10).map(item => ({
      value: Number(item.Visit) || 0,
      label: String(item.MonthsName || ''),
      frontColor: '#005696',
      gradientColor: '#A9DDFA',
      topLabelComponent: () => (
        <Text style={styles.chartTopLabel}>{item.Visit}</Text>
      ),
    }));
  }, [RetailerVisitFrequency]);

  // ✅ Separate method to fetch birthdays
  const fetchBirthdays = async businessId => {
    const endpoint = `${BASE_URL}Dashboard/UpcomingBirthday?Businessid=${businessId}`;
    setLoading(true);

    try {
      const response = await axiosGetWithRetry('UpcomingBirthday', endpoint);
      const rows = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setBirthdays(Array.isArray(rows) ? rows : []);
    } catch (error) {
      traceApiError('UpcomingBirthday', endpoint, error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Function to calculate days until birthday
  const getDaysUntilBirthday = dobString => {
    if (!dobString) return '';

    try {
      // Extract month/day safely from API format: "9/10/1980 12:00:00 AM"
      const [month, day] = dobString.split(' ')[0].split('/'); // ["9","10","1980"]
      const today = new Date();
      const currentYear = today.getFullYear();

      // Create this year's birthday
      let nextBirthday = new Date(
        currentYear,
        parseInt(month) - 1,
        parseInt(day),
      );

      // If birthday already passed, take next year
      if (nextBirthday < today.setHours(0, 0, 0, 0)) {
        nextBirthday = new Date(
          currentYear + 1,
          parseInt(month) - 1,
          parseInt(day),
        );
      }

      // Difference in days
      const diffTime = nextBirthday - new Date();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return '🎉 Today';
      if (diffDays === 1) return 'Tomorrow';
      return `In ${diffDays} days`;
    } catch (error) {
      console.error('DOB parsing error:', dobString, error);
      return '';
    }
  };

  const onWish = item => {
    if (!item.Phone) {
      Alert.alert('Phone number not available');
      return;
    }

    let phone = item.Phone;

    // ✅ Ensure correct format (India example: add +91 if not present)
    if (!phone.startsWith('+')) {
      phone = `+91${phone}`;
    }
    const employeeName = item.Employee ? item.Employee.trim() : '';
    const senderName = useEmpname ? useEmpname.trim() : '';
    // insert name right after "Happy Birthday!"
    let birthdayMsg = item.BirthdayMassage || 'Happy Birthday!';
    if (birthdayMsg.startsWith('Happy Birthday!')) {
      // birthdayMsg = birthdayMsg.replace(
      //   "Happy Birthday!",
      //   `Happy Birthday! ${employeeName},`
      // );
    }

    const message = `*Hi , ${employeeName}* 🎉 ${birthdayMsg} – *${senderName}*.\n\n*ieCRM Team*`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'WhatsApp not installed on this device.');
    });
  };

  // ✅ Separate method to fetch NoticeBoard
  const fetchNoticeBoard = async (businessId, divisionId) => {
    const endpoint = `${BASE_URL}Dashboard/NoticeBoard?Businessid=${businessId}&IDDivision=${divisionId}`;
    console.log('🔗 NoticeBoard API URL:', endpoint);
    setLoading(true);

    try {
      const response = await axiosGetWithRetry('NoticeBoard', endpoint);
      const rows = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setNoticeBoard(Array.isArray(rows) ? rows : []);
    } catch (error) {
      traceApiError('NoticeBoard', endpoint, error);
    } finally {
      setLoading(false);
    }
  };
  // ✅ Separate method to fetch MyTeam Data
  const fetchMyTeam = async (businessId, Idemp) => {
    const endpoint = `${BASE_URL}Dashboard/MyTeam?Businessid=${businessId}&IDEmployee=${Idemp}`;
    console.log('🔗 MyTeam API URL:', endpoint);
    setLoading(true);

    try {
      const response = await axiosGetWithRetry('MyTeam', endpoint);
      const rows = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setMyTeam(Array.isArray(rows) ? rows : []);
    } catch (error) {
      traceApiError('MyTeam', endpoint, error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSaledata = useCallback(
    async type => {
      let requestUrl = '';
      try {
        // Prevent empty calls
        if (!useEmpemail || !useDivision || !useDesignation || !useEmpNo) {
          console.warn('⚠️ Missing required params, skipping API call');
          return;
        }

        // ✅ User values
        const Empemail = useEmpemail;
        const Division = useDivision;
        const Designation = useDesignation;
        const Empno = useEmpNo;

        // ✅ Transform Division
        let finalDivision = Division;
        if (Division === 'MCSO' || Division === 'MPPL') {
          finalDivision = 'MAD';
        }

        // ✅ Transform Designation
        let finalDesignation = Designation;
        if (Designation === 'MFSO') {
          finalDesignation = 'MSR-MFSO';
        }

        if (type === 'Monthly') {
          requestUrl = `${Sales_URL}TargetAchieve?div=${finalDivision}&email=${Empemail}`;
        } else {
          requestUrl = `${Sales_URL}CumulativeSaleTarget?post=${finalDesignation}&empno=${Empno}`;
        }

        console.log('🔗 Fetching:', requestUrl);
        console.log('📤 Params:', {
          finalDivision,
          finalDesignation,
          Empemail,
          Empno,
        });

        // ✅ API Call
        const response = await fetch(requestUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const body = await response.text();
          const requestError = new Error(`HTTP ${response.status}`);
          requestError.status = response.status;
          requestError.data = body;
          throw requestError;
        }

        const data = await response.json();
        console.log(`📥 ${type} API Response:`, data);

        // ❌ HANDLE EMPTY / INVALID RESPONSE
        if (!data || !Array.isArray(data) || data.length === 0) {
          console.warn(`⚠️ ${type} API returned empty`);

          setSaleData({ achieved: 0, target: 0 });
          setAchievement(0);
          return;
        }

        const record = data[0];

        // ✅ Extract values safely
        let achieved = 0;
        let target = 0;

        if (type === 'Monthly') {
          achieved = Number(record?.SaleValue || 0);
          target = Number(record?.TargetValue || 0);
        } else {
          achieved = Number(record?.CumulativeSalesvalue || 0);
          target = Number(record?.CumulativeTargetsale || 0);
        }

        // ✅ Safe percentage calculation (NO toFixed crash)
        let percent = 0;
        if (target > 0) {
          percent = Math.round((achieved / target) * 100);
        }

        // ✅ Update state
        setSaleData({ achieved, target });
        setAchievement(percent);
      } catch (error) {
        traceApiError(`SalesData:${type}`, requestUrl, error);

        // ✅ Fail-safe fallback (never crash UI)
        setSaleData({ achieved: 0, target: 0 });
        setAchievement(0);
      } finally {
        // setLoading(false);
      }
    },
    [useDesignation, useDivision, useEmpNo, useEmpemail],
  );

  const handleSearch = text => {
    setSearchQuery(text);
  };

  const filteredMyTeam = useMemo(() => {
    const list = Array.isArray(myteam) ? myteam : [];
    const query = String(searchQuery || '').trim().toLowerCase();

    if (!query) {
      return list;
    }

    return list.filter(item => {
      const employeeNo = String(item?.EmployeeNo || '').toLowerCase();
      const employeeName = String(item?.EmployeeName || '').toLowerCase();
      const employeeDesg = String(item?.EmployeeDesg || '').toLowerCase();
      const manager = String(item?.Manager || '').toLowerCase();
      const phoneNo = String(item?.PhoneNo || '').toLowerCase();
      const division = String(item?.Division || '').toLowerCase();

      return (
        employeeNo.includes(query) ||
        employeeName.includes(query) ||
        employeeDesg.includes(query) ||
        manager.includes(query) ||
        phoneNo.includes(query) ||
        division.includes(query)
      );
    });
  }, [myteam, searchQuery]);

  // ✅ PieChart Data
  const safeAchieved = Number(saleData?.achieved) || 0;
  const safeTarget = Number(saleData?.target) || 0;

  const remaining = Math.max(safeTarget - safeAchieved, 0);

  // ✅ Avoid zero-total crash (important for pie charts)
  const total = safeAchieved + remaining;

  const pieData =
    total > 0
      ? [
        {
          value: safeAchieved,
          color: '#4CAF50',
          text: 'Achieved',
        },
        {
          value: remaining,
          color: '#2E86DE',
          text: 'Remaining',
        },
      ]
      : [
        {
          value: 1, // fallback dummy slice
          color: '#E0E0E0',
          text: 'No Data',
        },
      ];
  const dropdownOptions = [
    { label: 'Monthly', value: 'Monthly' },
    { label: 'Yearly', value: 'Yearly' },
  ];
  // suman jana code End here .

  const offlineOrderBookingCustomerListForManager = (
    businessID,
    idDiv,
    idemp,
  ) => {
    const areaurl =
      BASE_URL +
      'OrderBooking/OfflineOrderBookingCustomerListForManager?Businessid=' +
      businessID +
      '&IDDivision=' +
      idDiv +
      '&IDEmployee=' +
      idemp;
    console.log('returl ' + areaurl);
    var config = {
      method: 'get',
      url: areaurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for CRM_VisitWithList
        db.transaction(txn => {
          txn.executeSql(
            'DROP TABLE IF EXISTS CRM_offlineOrderBookingCustomerListForManager',
            [],
          );
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_offlineOrderBookingCustomerListForManager(IDRetailer INTEGER,IDEmployee INTEGER,IDArea INTEGER,Name VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_VisitWithList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_offlineOrderBookingCustomerListForManager(IDRetailer,IDEmployee,IDArea,Name) VALUES (?,?,?,?)';
          let params = [
            array.IDRetailer,
            array.IDEmployee,
            array.IDArea,
            array.Name,
          ]; //storing user data in an array
          db.executeSql(sql, params);
          //Alert.alert(sql + ' ' + params);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };

  const offlineOrderBookingCustomerList = (businessID, idemp) => {
    const areaurl =
      BASE_URL +
      'OrderBooking/OfflineOrderBookingCustomerList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log('returl ' + areaurl);
    var config = {
      method: 'get',
      url: areaurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for CRM_VisitWithList
        db.transaction(txn => {
          txn.executeSql(
            'DROP TABLE IF EXISTS CRM_offlineOrderBookingCustomerList',
            [],
          );
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_offlineOrderBookingCustomerList(IDRetailer INTEGER,Code VARCHAR,OtherCode VARCHAR,Name VARCHAR,IDArea INTEGER)',
            [],
          );
        });

        //SQLITE INSERT CRM_VisitWithList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_offlineOrderBookingCustomerList(IDRetailer,Code,OtherCode,Name,IDArea) VALUES (?,?,?,?,?)';
          let params = [
            array.IDRetailer,
            array.Code,
            array.OtherCode,
            array.Name,
            array.IDArea,
          ]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };
  const campaignData = (businessID, idemp) => {
    const campurl =
      BASE_URL +
      'Campaign/EmployeeWiseCampaignList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log(campurl);
    var config = {
      method: 'get',
      url: campurl,
    };

    axios(config)
      .then(function (response) {
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_Campaign', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Campaign(IDCampaign VARCHAR,Campaign VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_VisitWithList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_Campaign(IDCampaign,Campaign) VALUES (?,?)';
          let params = [array.IDCampaign, array.Campaign]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };
  const campaignproductData = (businessID, idemp) => {
    const produrl =
      BASE_URL +
      'Campaign/EmployeeWiseCampaignList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log(produrl);
    var config = {
      method: 'get',
      url: produrl,
    };

    axios(config)
      .then(function (response) {
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_CampaignProduct', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_CampaignProduct(IDProduct VARCHAR,Product VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_VisitWithList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_CampaignProduct(IDProduct,Product) VALUES (?,?)';
          let params = [array.IDProduct, array.Product]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };
  const offlinePendingDCRDate = (businessID, idemp) => {
    const produrl =
      BASE_URL +
      'Configuration/OfflinePendingDCRDate?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log(produrl);
    var config = {
      method: 'get',
      url: produrl,
    };

    axios(config)
      .then(function (response) {
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_offlinePendingDCRDate', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_offlinePendingDCRDate(DCRDate VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_offlinePendingDCRDate
        var _value = [];
        _value = response.data;
        console.log('_value', _value);

        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql = 'INSERT INTO CRM_offlinePendingDCRDate(DCRDate) VALUES (?)';
          let params = [array.DCRDate]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };

  const fetchGeofencingData = async (businessID, idemp) => {
    const produrl =
      BASE_URL +
      'Configuration/MobileGeofencing?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log('produrl:', produrl);
    try {
      const response = await fetch(produrl);
      const data = await response.json();

      db.transaction(tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS Geofencing (
            IDEmployee INTEGER PRIMARY KEY,
            Geofencing TEXT,
            EmployeeName TEXT,
            DoctorGeoFencing INTEGER,
            RetailerGeoFencing INTEGER
          );`,
        );
      });
      // Save to SQLite
      if (data.length > 0) {
        const item = data[0];
        db.transaction(tx => {
          tx.executeSql(
            `INSERT OR REPLACE INTO Geofencing (IDEmployee, Geofencing, EmployeeName, DoctorGeoFencing, RetailerGeoFencing) VALUES (?, ?, ?, ?, ?)`,
            [
              item.IDEmployee,
              item.Geofencing,
              item.EmployeeName,
              item.DoctorGeoFencing,
              item.RetailerGeoFencing,
            ],
          );
        });
      }
    } catch (error) {
      console.error('Error fetching geofencing data:', error);
    }
  };

  const wtDDOpen = (businessID, IDEmployee) => {
    //console.log(useBusinessID);
    // const wturl =
    //   BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=WORKTYPE';
    const wturl =
      BASE_URL +
      //'Misc/List?Businessid=' +
      'Misc/EmployeeDesignationWiseList?Businessid=' +
      businessID +
      '&Type=WORKTYPE' +
      '&IDEmployee=' +
      IDEmployee;
    console.log(wturl);
    var config = {
      method: 'get',
      url: wturl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        //CREATE TABLE for WorkTypeTBL
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_WorkTypeList', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_WorkTypeList(IDMisc INTEGER,Name VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT WorkTypeTBL
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql = 'INSERT INTO CRM_WorkTypeList(IDMisc,Name) VALUES (?,?)';
          let params = [array.IDMisc, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };

  const masterDoctorType = businessID => {
    const empurl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=DOCTORTYPE';
    console.log(empurl);
    var config = {
      method: 'get',
      url: empurl,
    };
    axios(config)
      .then(function (response) {
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS MasterDoctorType', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS MasterDoctorType(IDMisc INTEGER,Code VARCHAR,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              console.log('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_productList
        var _value = [];
        _value = response.data;
        for (var i = 0; i < _value.length; i++) {
          const array = _value[i];

          let sql =
            'INSERT INTO MasterDoctorType(IDMisc,Code,Name) VALUES (?,?,?)';
          let params = [array.IDMisc, array.Code, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };
  const productGift = (businessID, idDiv) => {
    const prdurl =
      BASE_URL +
      'Product/ProductDivisionSampleGiftList?Businessid=' +
      businessID +
      '&IDDivision=' +
      idDiv +
      '&Type=GIFT';
    console.log(prdurl);
    var config = {
      method: 'get',
      url: prdurl,
    };

    axios(config)
      .then(function (response) {
        //console.log(response.data);

        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_GIFT', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_GIFT(IDProduct INTEGER,Code VARCHAR,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              console.log('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_productList
        var _value = [];
        _value = response.data;
        for (var i = 0; i < _value.length; i++) {
          const array = _value[i];

          let sql = 'INSERT INTO CRM_GIFT(IDProduct,Code,Name) VALUES (?,?,?)';
          let params = [array.IDProduct, array.Code, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };
  const productSample = (businessID, idDiv) => {
    const prdurl =
      BASE_URL +
      'Product/ProductDivisionSampleGiftList?Businessid=' +
      businessID +
      '&IDDivision=' +
      idDiv +
      '&Type=DOCTORPRODUCT';
    console.log(prdurl);
    var config = {
      method: 'get',
      url: prdurl,
    };

    axios(config)
      .then(function (response) {
        //console.log(response.data);

        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_SAMPLE', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_SAMPLE(IDProduct INTEGER,Code VARCHAR,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              console.log('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_productList
        var _value = [];
        _value = response.data;
        for (var i = 0; i < _value.length; i++) {
          const array = _value[i];

          let sql =
            'INSERT INTO CRM_SAMPLE(IDProduct,Code,Name) VALUES (?,?,?)';
          let params = [array.IDProduct, array.Code, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };

  const getfinalSatge = async businessID => {
    const finalurl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=TARGET';
    console.log(finalurl);
    var config = {
      method: 'get',
      url: finalurl,
    };
    axios(config)
      .then(function (response) {
        // console.log(JSON.stringify(response.data));
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_finalStageList', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_finalStageList(IDMisc INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              console.log('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_finalStageList
        var _value = [];
        _value = response.data;
        for (var i = 0; i < _value.length; i++) {
          const array = _value[i];

          let sql = 'INSERT INTO CRM_finalStageList(IDMisc,Name) VALUES (?,?)';
          let params = [array.IDMisc, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };
  const getFrequencyDetail = async businessID => {
    const finalurl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=FREQUENCYTYPE';
    console.log(finalurl);
    var config = {
      method: 'get',
      url: finalurl,
    };
    axios(config)
      .then(function (response) {
        // console.log(JSON.stringify(response.data));
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_frequencyList', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_frequencyList(IDMisc INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              console.log('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_finalStageList
        var _value = [];
        _value = response.data;
        for (var i = 0; i < _value.length; i++) {
          const array = _value[i];

          let sql = 'INSERT INTO CRM_frequencyList(IDMisc,Name) VALUES (?,?)';
          let params = [array.IDMisc, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };
  const getConfigurationDetail = async businessID => {
    const finalurl =
      BASE_URL + 'Configuration/ConfigurationDetail?Businessid=' + businessID;
    console.log(finalurl);
    var config = {
      method: 'get',
      url: finalurl,
    };
    axios(config)
      .then(function (response) {
        // console.log(JSON.stringify(response.data));
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_getConfigurationDetail', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_getConfigurationDetail(ID INTEGER PRIMARY KEY AUTOINCREMENT,BackdatedReason INTEGER)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              console.log('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_finalStageList
        var _value = [];
        _value = response.data;
        for (var i = 0; i < _value.length; i++) {
          const array = _value[i];

          let sql =
            'INSERT INTO CRM_getConfigurationDetail(BackdatedReason) VALUES (?)';
          let params = [array.CKBAllowBackdatedEntryInDcr]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };

  const qualificationDDOpen = businessID => {
    //console.log(useBusinessID);
    const qurl =
      BASE_URL + 'Qualification/QualificationList?Businessid=' + businessID;
    console.log(qurl);
    var config = {
      method: 'get',
      url: qurl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_Qualification', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Qualification(IDQualification INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_Qualification
        var qualificationArray = [];
        qualificationArray = response.data;
        for (var i = 0; i < qualificationArray.length; i++) {
          const array = qualificationArray[i];

          let sql =
            'INSERT INTO CRM_Qualification(IDQualification,Name) VALUES (?,?)';
          let params = [array.IDQualification, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };
  const specialityDDOpen = businessID => {
    //console.log(useBusinessID);
    const surl =
      BASE_URL + 'Speciality/SpecialityList?Businessid=' + businessID;
    console.log(surl);
    var config = {
      method: 'get',
      url: surl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_Speciality', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Speciality(IDSpeciality INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              console.error('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_Qualification
        var specialityArray = [];
        specialityArray = response.data;
        for (var i = 0; i < specialityArray.length; i++) {
          const array = specialityArray[i];
          let sql =
            'INSERT INTO CRM_Speciality(IDSpeciality,Name) VALUES (?,?)';
          let params = [array.IDSpeciality, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };
  const categoryDDOpen = businessID => {
    //console.log(useBusinessID);
    const surl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=PRODUCTCLASS';
    console.log(surl);
    var config = {
      method: 'get',
      url: surl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_Category', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Category(IDMisc INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              console.log('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_Qualification
        var specialityArray = [];
        specialityArray = response.data;
        for (var i = 0; i < specialityArray.length; i++) {
          const array = specialityArray[i];
          let sql = 'INSERT INTO CRM_Category(IDMisc,Name) VALUES (?,?)';
          let params = [array.IDMisc, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };

  const productMasterDoctor = (businessID, IDDivision) => {
    //console.log(useBusinessID);
    const surl =
      BASE_URL +
      //'Product/ProductListDivisionWise?Businessid=' +
      'Product/ProductDivisionTypeList?Businessid=' +
      businessID +
      '&IDDivision=' +
      IDDivision +
      '&Type=DOCTORPRODUCT';
    console.log(surl);
    var config = {
      method: 'get',
      url: surl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_Master_Doctor_Product', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Master_Doctor_Product(IDProduct INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              console.log('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_Qualification
        var specialityArray = [];
        specialityArray = response.data;
        for (var i = 0; i < specialityArray.length; i++) {
          const array = specialityArray[i];
          let sql =
            'INSERT INTO CRM_Master_Doctor_Product(IDProduct,Name) VALUES (?,?)';
          let params = [array.IDProduct, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };
  const areaMaster = (businessID, empEmail, IDHQ) => {
    const surl =
      BASE_URL +
      'Area/DivisionAndHQWiseAreaList?Businessid=' +
      businessID +
      '&IDDivision=' +
      empEmail +
      '&IDHQ=' +
      IDHQ;
    console.log('surllll', surl);
    var config = {
      method: 'get',
      url: surl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_Master_Area', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Master_Area(IDArea INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              console.log('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_Qualification
        var specialityArray = [];
        specialityArray = response.data;
        for (var i = 0; i < specialityArray.length; i++) {
          const array = specialityArray[i];
          let sql = 'INSERT INTO CRM_Master_Area(IDArea,Name) VALUES (?,?)';
          let params = [array.IDArea, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };

  const typeAPI = businessID => {
    const turl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=RETAILERTYPE';
    console.log(turl);
    var config = {
      method: 'get',
      url: turl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_Master_Type', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Master_Type(IDMisc INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              console.log('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_Master_Type
        var specialityArray = [];
        specialityArray = response.data;
        for (var i = 0; i < specialityArray.length; i++) {
          const array = specialityArray[i];
          let sql = 'INSERT INTO CRM_Master_Type(IDMisc,Name) VALUES (?,?)';
          let params = [array.IDMisc, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };

  const unlistedtypeAPI = businessID => {
    const turl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=UNLISTED';
    console.log(turl);
    var config = {
      method: 'get',
      url: turl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_Unlisted_Type', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Unlisted_Type(IDMisc INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              console.log('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_Master_Type
        var specialityArray = [];
        specialityArray = response.data;
        for (var i = 0; i < specialityArray.length; i++) {
          const array = specialityArray[i];
          let sql = 'INSERT INTO CRM_Unlisted_Type(IDMisc,Name) VALUES (?,?)';
          let params = [array.IDMisc, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };
  const managerEmployeeWiseOfflineAreaList = (businessID, IDEmployee) => {
    //console.log(useBusinessID);
    const empurl =
      BASE_URL +
      'Area/ManagerEmployeeWiseOfflineAreaList?Businessid=' +
      businessID +
      '&IDManager=' +
      IDEmployee;
    console.log(empurl);
    var config = {
      method: 'get',
      url: empurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for MangerVisitWithTBL
        db.transaction(txn => {
          txn.executeSql(
            'DROP TABLE IF EXISTS ManagerEmployeeWiseAreaList',
            [],
          );
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS ManagerEmployeeWiseAreaList(Name VARCHAR,IDArea VARCHAR,IDEmployee VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT ManagerEmployeeWiseAreaList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO ManagerEmployeeWiseAreaList(Name,IDArea,IDEmployee) VALUES (?,?,?)';
          let params = [array.Name, array.IDArea, array.IDEmployee]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };
  const managerEmployeeWiseOfflineDoctorList = (businessID, IDEmployee) => {
    //console.log(useBusinessID);
    const empurl =
      BASE_URL +
      'Doctor/ManagerEmployeeWiseOfflineDoctorList?Businessid=' +
      businessID +
      '&IDManager=' +
      IDEmployee;
    console.log(empurl);
    var config = {
      method: 'get',
      url: empurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for MangerVisitWithTBL
        db.transaction(txn => {
          txn.executeSql(
            'DROP TABLE IF EXISTS ManagerEmployeeWiseDoctorList',
            [],
          );
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS ManagerEmployeeWiseDoctorList(IDDoctor INTEGER,IDArea INTEGER,Name VARCHAR,AreaName VARCHAR,IDEmployee VARCHAR,Code VARCHAR,Latitude1 VARCHAR,Longitude1 VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT ManagerEmployeeWiseAreaList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO ManagerEmployeeWiseDoctorList(IDDoctor,IDArea,Name,AreaName,IDEmployee,Code,Latitude1,Longitude1) VALUES (?,?,?,?,?,?,?,?)';
          let params = [
            array.IDDoctor,
            array.IDArea,
            array.Name,
            array.AreaName,
            array.IDEmployee,
            array.Code,
            array.Latitude1,
            array.Longitude1,
          ]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log('ProductName',array.Product.ProductName);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };
  const managerEmployeeWiseOfflineRetailerList = (businessID, IDEmployee) => {
    //console.log(useBusinessID);
    const empurl =
      BASE_URL +
      'Retailer/ManagerEmployeeWiseOfflineRetailerList?Businessid=' +
      businessID +
      '&IDManager=' +
      IDEmployee;
    console.log(empurl);
    var config = {
      method: 'get',
      url: empurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for MangerVisitWithTBL
        db.transaction(txn => {
          txn.executeSql(
            'DROP TABLE IF EXISTS ManagerEmployeeWiseRetailerList',
            [],
          );
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS ManagerEmployeeWiseRetailerList(IDRetailer INTEGER,IDArea INTEGER,Name VARCHAR,AreaName VARCHAR,IDEmployee VARCHAR,Code VARCHAR,Latitude VARCHAR,Longitude VARCHAR)',
            [],
          );
        });
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO ManagerEmployeeWiseRetailerList(IDRetailer,IDArea,Name,AreaName,IDEmployee,Code,Latitude,Longitude) VALUES (?,?,?,?,?,?,?,?)';
          let params = [
            array.IDRetailer,
            array.IDArea,
            array.Name,
            array.AreaName,
            array.IDEmployee,
            array.Code,
            array.Latitude,
            array.Longitude,
          ]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };
  const orderBookingPrice = businessID => {
    const wturl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=ORDERPRICETYPE';
    console.log(wturl);
    var config = {
      method: 'get',
      url: wturl,
    };
    axios(config)
      .then(function (response) {
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS OrderBookingPrice', []);

          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS OrderBookingPrice(Code VARCHAR,Name VARCHAR)',
            [],
          );
        });

        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql = 'INSERT INTO OrderBookingPrice(Code,Name) VALUES (?,?)';
          let params = [array.Code, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };
  const orderBookingBillingSeries = businessID => {
    const wturl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=BILLINGSERIES';
    console.log(wturl);
    var config = {
      method: 'get',
      url: wturl,
    };
    axios(config)
      .then(function (response) {
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS OrderBookingBillingSeries', []);

          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS OrderBookingBillingSeries(Code VARCHAR,Name VARCHAR)',
            [],
          );
        });
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO OrderBookingBillingSeries(Code,Name) VALUES (?,?)';
          let params = [array.Code, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };

  const orderBookingProductList = async businessID => {
    try {
      const url = BASE_URL + 'Product/Order/List?Businessid=' + businessID;
      console.log(url);
      let result = await fetch(url);
      result = await result.json();

      db.transaction(tx => {
        tx.executeSql('DROP TABLE IF EXISTS OrderBookingProductList', []);
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS OrderBookingProductList(IDProduct INTEGER,Code VARCHAR,Name VARCHAR,PackSize VARCHAR,MRP VARCHAR,PurRate VARCHAR)',
          [],
          (tx, results) => {
            //console.log('Table created successfully');
          },
          error => {
            Alert.alert('Error creating table:', error);
          },
        );
      });
      var _value = [];
      _value = result;
      for (var i = 0; i < _value.length; i++) {
        const array = _value[i];

        let sql =
          'INSERT INTO OrderBookingProductList(IDProduct,Code,Name,PackSize,MRP,PurRate) VALUES (?,?,?,?,?,?)';
        let params = [
          array.IDProduct,
          array.Code,
          array.Name,
          array.PackSize,
          array.MRP,
          array.PurRate,
        ]; //storing user data in an array
        db.executeSql(sql, params);
        //console.log(params);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const ExpenseHead = businessID => {
    const wturl = BASE_URL + 'Expensehead/List?Businessid=' + businessID;
    console.log(wturl);
    var config = {
      method: 'get',
      url: wturl,
    };
    axios(config)
      .then(function (response) {
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_ExpenseHead', []);

          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_ExpenseHead(IDExpenseHead VARCHAR,Name VARCHAR)',
            [],
          );
        });
        var _value = [];
        _value = response.data;
        //console.log('Expense HEAD', _value);
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_ExpenseHead(IDExpenseHead,Name) VALUES (?,?)';
          let params = [array.IDExpenseHead, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };

  const expenseRequestList = async (businessID, idEmp) => {
    const url =
      BASE_URL +
      'ExpenseBooking/Mobile/Requested/List?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idEmp;
    console.log(url);
    let result = await fetch(url);
    result = await result.json();

    db.transaction(txn => {
      txn.executeSql('DROP TABLE IF EXISTS CRM_ExpenseRequestList', []);

      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS CRM_ExpenseRequestList(IDBooking INTEGER,Bookingno VARCHAR,BookingDate VARCHAR,BookingAmount VARCHAR,ExpenseHeadName VARCHAR,Requested NUMERIC,Approved VARCHAR,Rejected VARCHAR,RejectedReason VARCHAR,MonthName VARCHAR)',
        [],
      );
    });

    for (var j = 0; j < result.length; j++) {
      const array = result[j];
      //console.log('result',array);
      let sql =
        'INSERT INTO CRM_ExpenseRequestList(IDBooking,Bookingno,BookingDate,BookingAmount,ExpenseHeadName,Requested,Approved,Rejected,RejectedReason,MonthName) VALUES (?,?,?,?,?,?,?,?,?,?)';
      let params = [
        array.IDBooking,
        array.Bookingno,
        array.BookingDate,
        array.BookingAmount,
        array.ExpenseHeadName,
        array.Requested,
        array.Approved,
        array.Rejected,
        array.RejectedReason,
        array.MonthName,
      ]; //storing user data in an array
      db.executeSql(sql, params);
    }
  };

  const doctorViewDCR = (businessID, idEmp) => {
    if (useManagerAccess === true) {
      const wturl =
        BASE_URL +
        'DCR/Mobile/Manager/DCRList?Businessid=' +
        businessID +
        '&IDEmployee=' +
        idEmp +
        '&Type=Doctor';
      console.log(wturl);
      var config = {
        method: 'get',
        url: wturl,
      };
      axios(config)
        .then(function (response) {
          db.transaction(txn => {
            txn.executeSql(
              'DROP TABLE IF EXISTS CRM_ManagerOnlineViewDocDCR',
              [],
            );

            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS CRM_ManagerOnlineViewDocDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,CustomerType VARCHAR)',
              [],
            );
          });
          var _value = [];
          _value = response.data.d;
          //console.log('doctorViewDCR', _value);
          for (var j = 0; j < _value.length; j++) {
            const array = _value[j];
            let sql =
              'INSERT INTO CRM_ManagerOnlineViewDocDCR(Customer,Code,DCRDate,CustomerType) VALUES (?,?,?,?)';
            let params = [
              array.Customer,
              array.Code,
              array.DCRDate,
              array.CustomerType,
            ]; //storing user data in an array
            db.executeSql(sql, params);
          }
        })
        .catch(function (error) {
          console.log(error.message);
        });
    } else {
      const wturl =
        BASE_URL +
        'DCR/Mobile/Msr/DCRList?Businessid=' +
        businessID +
        '&IDEmployee=' +
        idEmp +
        '&Type=Doctor';
      console.log(wturl);
      var config = {
        method: 'get',
        url: wturl,
      };
      axios(config)
        .then(function (response) {
          db.transaction(txn => {
            txn.executeSql('DROP TABLE IF EXISTS CRM_OnlineViewDocDCR', []);

            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS CRM_OnlineViewDocDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,CustomerType VARCHAR)',
              [],
            );
          });
          var _value = [];
          _value = response.data.d;
          //console.log('doctorViewDCR', _value);
          for (var j = 0; j < _value.length; j++) {
            const array = _value[j];
            let sql =
              'INSERT INTO CRM_OnlineViewDocDCR(Customer,Code,DCRDate,CustomerType) VALUES (?,?,?,?)';
            let params = [
              array.Customer,
              array.Code,
              array.DCRDate,
              array.CustomerType,
            ]; //storing user data in an array
            db.executeSql(sql, params);
          }
        })
        .catch(function (error) {
          console.log(error.message);
        });
    }
  };

  const retailerViewDCR = (businessID, idEmp) => {
    if (useManagerAccess === true) {
      const wturl =
        BASE_URL +
        'DCR/Mobile/Manager/DCRList?Businessid=' +
        businessID +
        '&IDEmployee=' +
        idEmp +
        '&Type=Retailer';
      console.log(wturl);
      var config = {
        method: 'get',
        url: wturl,
      };
      axios(config)
        .then(function (response) {
          db.transaction(txn => {
            txn.executeSql(
              'DROP TABLE IF EXISTS CRM_ManagerOnlineViewRetDCR',
              [],
            );

            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS CRM_ManagerOnlineViewRetDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,CustomerType VARCHAR)',
              [],
            );
          });
          var _value = [];
          _value = response.data.d;
          //console.log('retailerViewDCR', _value);
          for (var j = 0; j < _value.length; j++) {
            const array = _value[j];
            let sql =
              'INSERT INTO CRM_ManagerOnlineViewRetDCR(Customer,Code,DCRDate,CustomerType) VALUES (?,?,?,?)';
            let params = [
              array.Customer,
              array.Code,
              array.DCRDate,
              array.CustomerType,
            ]; //storing user data in an array
            db.executeSql(sql, params);
          }
        })
        .catch(function (error) {
          console.log(error.message);
        });
    } else {
      const wturl =
        BASE_URL +
        'DCR/Mobile/Msr/DCRList?Businessid=' +
        businessID +
        '&IDEmployee=' +
        idEmp +
        '&Type=Retailer';
      console.log(wturl);
      var config = {
        method: 'get',
        url: wturl,
      };
      axios(config)
        .then(function (response) {
          db.transaction(txn => {
            txn.executeSql('DROP TABLE IF EXISTS CRM_OnlineViewRetDCR', []);

            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS CRM_OnlineViewRetDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,DCRDate VARCHAR,CustomerType VARCHAR)',
              [],
            );
          });
          var _value = [];
          _value = response.data.d;
          //console.log('retailerViewDCR', _value);
          for (var j = 0; j < _value.length; j++) {
            const array = _value[j];
            let sql =
              'INSERT INTO CRM_OnlineViewRetDCR(Customer,Code,DCRDate,CustomerType) VALUES (?,?,?,?)';
            let params = [
              array.Customer,
              array.Code,
              array.DCRDate,
              array.CustomerType,
            ]; //storing user data in an array
            db.executeSql(sql, params);
          }
        })
        .catch(function (error) {
          console.log(error.message);
        });
    }
  };

  const unlistedViewDCR = (businessID, idEmp) => {
    if (useManagerAccess === true) {
      const wturl =
        BASE_URL +
        'DCR/Mobile/Manager/DCRList?Businessid=' +
        businessID +
        '&IDEmployee=' +
        idEmp +
        '&Type=Unlisted';
      console.log(wturl);
      var config = {
        method: 'get',
        url: wturl,
      };
      axios(config)
        .then(function (response) {
          db.transaction(txn => {
            txn.executeSql(
              'DROP TABLE IF EXISTS CRM_OnlineMangerViewUnlistedDCR',
              [],
            );

            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS CRM_OnlineMangerViewUnlistedDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,CustomerType VARCHAR)',
              [],
            );
          });
          var _value = [];
          _value = response.data.d;
          //console.log('unlistedViewDCR', _value);
          for (var j = 0; j < _value.length; j++) {
            const array = _value[j];
            let sql =
              'INSERT INTO CRM_OnlineMangerViewUnlistedDCR(Customer,Code,DCRDate,CustomerType) VALUES (?,?,?,?)';
            let params = [
              array.Customer,
              array.Code,
              array.DCRDate,
              array.CustomerType,
            ]; //storing user data in an array
            db.executeSql(sql, params);
          }
        })
        .catch(function (error) {
          console.log(error.message);
        });
    } else {
      const wturl =
        BASE_URL +
        'DCR/Mobile/Msr/DCRList?Businessid=' +
        businessID +
        '&IDEmployee=' +
        idEmp +
        '&Type=Unlisted';
      console.log(wturl);
      var config = {
        method: 'get',
        url: wturl,
      };
      axios(config)
        .then(function (response) {
          db.transaction(txn => {
            txn.executeSql(
              'DROP TABLE IF EXISTS CRM_OnlineViewUnlistedDCR',
              [],
            );

            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS CRM_OnlineViewUnlistedDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,CustomerType VARCHAR)',
              [],
            );
          });
          var _value = [];
          _value = response.data.d;
          //console.log('unlistedViewDCR', _value);
          for (var j = 0; j < _value.length; j++) {
            const array = _value[j];
            let sql =
              'INSERT INTO CRM_OnlineViewUnlistedDCR(Customer,Code,DCRDate,CustomerType) VALUES (?,?,?,?)';
            let params = [
              array.Customer,
              array.Code,
              array.DCRDate,
              array.CustomerType,
            ]; //storing user data in an array
            db.executeSql(sql, params);
          }
        })
        .catch(function (error) {
          console.log(error.message);
        });
    }
  };

  const tourdateCheck = async (businessID, month, year, idEmp) => {
    const url =
      BASE_URL +
      'TourProgram/List?Businessid=' +
      businessID +
      '&Month=' +
      month +
      '&Year=' +
      year +
      '&IDEmployee=' +
      idEmp;
    console.log('tourdateCheck', url);
    let result = await fetch(url);
    result = await result.json();

    //CREATE TABLE for CRM_TourPlanDate
    db.transaction(txn => {
      txn.executeSql('DROP TABLE IF EXISTS CRM_TourPlanDate', []);
      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS CRM_TourPlanDate(TourDate VARCHAR,Approved VARCHAR)',
        [],
      );
    });

    //SQLITE INSERT CRM_TourPlanDate
    var _value = [];
    _value = result;
    //console.log(_value);
    for (var j = 0; j < _value.length; j++) {
      const array = _value[j];
      let sql = 'INSERT INTO CRM_TourPlanDate(TourDate,Approved) VALUES (?,?)';
      let params = [array.TourDate, array.Approved]; //storing user data in an array
      db.executeSql(sql, params);
    }
  };

  const fetchQuizModules = async (businessID, IDEmployee) => {
    const apiUrl =
      BASE_URL +
      'user/MobileSubMenuList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      IDEmployee +
      '&Module=SURVEY';
    try {
      console.log(apiUrl);

      const response = await axios.get(apiUrl);
      const dashBoardJsonArray = response.data;
      //CREATE TABLE for CRM_TourPlanDate
      db.transaction(txn => {
        txn.executeSql('DROP TABLE IF EXISTS SURVEYModuleData', []);
        txn.executeSql(
          'CREATE TABLE IF NOT EXISTS SURVEYModuleData(SubMenu VARCHAR,SubMenuSRL VARCHAR)',
          [],
        );
      });

      //SQLITE INSERT CRM_TourPlanDate
      var _value = [];
      _value = dashBoardJsonArray;
      //console.log(_value);
      for (var j = 0; j < _value.length; j++) {
        const array = _value[j];
        let sql =
          'INSERT INTO SURVEYModuleData(SubMenu,SubMenuSRL) VALUES (?,?)';
        let params = [array.SubMenu, array.SubMenuSRL]; //storing user data in an array
        db.executeSql(sql, params);
      }
    } catch (error) {
      traceApiError('MobileSubMenuList:SURVEY', apiUrl, error);
    }
  };

  const fetchMasterModules = async (businessID, IDEmployee) => {
    const apiUrl =
      BASE_URL +
      'user/MobileSubMenuList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      IDEmployee +
      '&Module=MASTER';
    try {
      console.log(apiUrl);

      const response = await axios.get(apiUrl);
      const dashBoardJsonArray = response.data;
      //CREATE TABLE for CRM_TourPlanDate
      db.transaction(txn => {
        txn.executeSql('DROP TABLE IF EXISTS MasterModuleData', []);
        txn.executeSql(
          'CREATE TABLE IF NOT EXISTS MasterModuleData(SubMenu VARCHAR,SubMenuSRL VARCHAR)',
          [],
        );
      });

      //SQLITE INSERT CRM_TourPlanDate
      var _value = [];
      _value = dashBoardJsonArray;
      //console.log(_value);
      for (var j = 0; j < _value.length; j++) {
        const array = _value[j];
        let sql =
          'INSERT INTO MasterModuleData(SubMenu,SubMenuSRL) VALUES (?,?)';
        let params = [array.SubMenu, array.SubMenuSRL]; //storing user data in an array
        db.executeSql(sql, params);
      }
    } catch (error) {
      traceApiError('MobileSubMenuList:MASTER', apiUrl, error);
    }
  };

  const fetchDCRModules = async (businessID, IDEmployee) => {
    const apiUrl =
      BASE_URL +
      'user/MobileSubMenuList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      IDEmployee +
      '&Module=DCR';
    try {
      console.log(apiUrl);

      const response = await axios.get(apiUrl);
      const dashBoardJsonArray = response.data;
      //CREATE TABLE for CRM_TourPlanDate
      db.transaction(txn => {
        txn.executeSql('DROP TABLE IF EXISTS DCRModuleData', []);
        txn.executeSql(
          'CREATE TABLE IF NOT EXISTS DCRModuleData(SubMenu VARCHAR,SubMenuSRL VARCHAR)',
          [],
        );
      });

      //SQLITE INSERT CRM_TourPlanDate
      var _value = [];
      _value = dashBoardJsonArray;
      //console.log(_value);
      for (var j = 0; j < _value.length; j++) {
        const array = _value[j];
        let sql = 'INSERT INTO DCRModuleData(SubMenu,SubMenuSRL) VALUES (?,?)';
        let params = [array.SubMenu, array.SubMenuSRL]; //storing user data in an array
        db.executeSql(sql, params);
      }
    } catch (error) {
      traceApiError('MobileSubMenuList:DCR', apiUrl, error);
    }
  };

  // const fetchModules = (businessID, useDesig) => {
  //   NetInfo.fetch().then(async state => {
  //     if (state.isConnected) {
  //       if (
  //         useDesig !== 'DY_ZSM' &&
  //         useDesig !== 'ZSM' &&
  //         useDesig !== 'SR-ZSM'
  //       ) {
  //         try {
  //           const url =
  //             BASE_URL + 'user/MobileModuleList?Businessid=' + businessID;
  //           const response = await axiosGetWithRetry(
  //             'MobileModuleList:non-zsm',
  //             url,
  //           );
  //           //setModules(response.data);
  //           console.log('[MobileModuleList RESPONSE]', {
  //             status: response.status,
  //             isArray: Array.isArray(response.data),
  //             count: Array.isArray(response.data) ? response.data.length : null,
  //             firstItem: Array.isArray(response.data)
  //               ? response.data[0]
  //               : response.data,
  //           });
  //           setModules(Array.isArray(response.data) ? response.data : []);
  //           console.log('if', url);
  //           console.warn('if', url);
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
  //           insertDashboardRows('MobileModuleList:non-zsm', url, _value);
  //         } catch (error) {
  //           traceApiError(
  //             'MobileModuleList:non-zsm',
  //             BASE_URL + 'user/MobileModuleList?Businessid=' + businessID,
  //             error,
  //           );
  //         }
  //       } else {
  //         try {
  //           const url =
  //             BASE_URL + 'user/MobileModuleList?Businessid=' + businessID;
  //           const response = await axiosGetWithRetry(
  //             'MobileModuleList:zsm',
  //             url,
  //           );
  //           //setModules(response.data);
  //           console.log('[MobileModuleList RESPONSE]', {
  //             status: response.status,
  //             isArray: Array.isArray(response.data),
  //             count: Array.isArray(response.data) ? response.data.length : null,
  //             firstItem: Array.isArray(response.data)
  //               ? response.data[0]
  //               : response.data,
  //           });
  //           setModules(Array.isArray(response.data) ? response.data : []);
  //           console.log('else', url);
  //           console.warn('else', url);
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
  //           insertDashboardRows('MobileModuleList:zsm', url, _value);
  //         } catch (error) {
  //           traceApiError(
  //             'MobileModuleList:zsm',
  //             BASE_URL + 'user/MobileModuleList?Businessid=' + businessID,
  //             error,
  //           );
  //         }
  //       }
  //     } else {
  //       if (
  //         useDesig !== 'DY_ZSM' &&
  //         useDesig !== 'ZSM' &&
  //         useDesig !== 'SR-ZSM'
  //       ) {
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
  //               console.log('Hi ' + temp);

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
  //               console.log('Hello ' + temp);

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

  const loadModulesFromSQLite = () => {
    return new Promise(resolve => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT Module, IDMenu, MainModuleSRL FROM DashboardData',
          [],
          (tx, results) => {
            const rows = results.rows;
            let temp = [];

            for (let i = 0; i < rows.length; i++) {
              temp.push(rows.item(i));
            }

            resolve(temp);
          },
          error => {
            console.log('Error fetching modules from SQLite:', error);
            resolve([]);
          },
        );
      });
    });
  };

  const fetchModules = async (businessID, useDesig) => {
    const isZsmUser =
      useDesig === 'DY_ZSM' || useDesig === 'ZSM' || useDesig === 'SR-ZSM';

    const apiLabel = isZsmUser
      ? 'MobileModuleList:zsm'
      : 'MobileModuleList:non-zsm';

    const moduleUrl = BASE_URL + 'user/MobileModuleList?Businessid=' + businessID;

    try {
      const state = await NetInfo.fetch();

      // reset before trying
      setModuleLoadMessage('');

      if (state.isConnected) {
        try {
          const response = await axiosGetWithRetry(apiLabel, moduleUrl);

          console.log('[MobileModuleList RESPONSE]', {
            status: response.status,
            isArray: Array.isArray(response.data),
            count: Array.isArray(response.data) ? response.data.length : null,
            firstItem: Array.isArray(response.data)
              ? response.data[0]
              : response.data,
          });

          const moduleList = Array.isArray(response.data) ? response.data : [];

          if (moduleList.length > 0) {
            setModules(moduleList);
            setIsPoorConnection(false);
            setModuleLoadMessage('');

            console.log(isZsmUser ? 'else' : 'if', moduleUrl);
            console.warn(isZsmUser ? 'else' : 'if', moduleUrl);

            db.transaction(txn => {
              txn.executeSql('DROP TABLE IF EXISTS DashboardData', []);
              txn.executeSql(
                'CREATE TABLE IF NOT EXISTS DashboardData(Module VARCHAR,IDMenu VARCHAR,MainModuleSRL VARCHAR)',
                [],
              );
            });

            insertDashboardRows(apiLabel, moduleUrl, moduleList);
          } else {
            setModules([]);
            setIsPoorConnection(true);
            setModuleLoadMessage(
              'Server not responding. Dashboard modules not loaded.',
            );
          }
        } catch (error) {
          traceApiError(apiLabel, moduleUrl, error);

          // API failed, try old SQLite data
          const sqliteModules = await loadModulesFromSQLite();

          if (sqliteModules.length > 0) {
            setModules(sqliteModules);
            setIsPoorConnection(false);
            setModuleLoadMessage('');
          } else {
            setModules([]);
            setIsPoorConnection(true);
            setModuleLoadMessage(
              'Poor Internet connection! Module not loaded.',
            );
          }
        }
      } else {
        // offline, try SQLite
        const sqliteModules = await loadModulesFromSQLite();

        if (sqliteModules.length > 0) {
          setModules(sqliteModules);
          setIsPoorConnection(false);
          setModuleLoadMessage('');
        } else {
          setModules([]);
          setIsPoorConnection(false);
          setModuleLoadMessage(
            'No Internet connection! DashBoard not loaded.',
          );
        }
      }
    } catch (error) {
      console.log('fetchModules error:', error);

      setModules([]);
      setIsPoorConnection(true);
      setModuleLoadMessage(
        'DashBoard not loaded. Poor internet connection.',
      );
    }
  };
  const checkCompanyValidation = async businessID => {
    try {
      const response = await fetch(
        BASE_URL + 'login/CheckCompanyValidation?Businessid=' + businessID,
      );
      console.log(
        BASE_URL + 'login/CheckCompanyValidation?Businessid=' + businessID,
      );

      const data = await response.json();

      if (data.result === '') {
        console.log('✅ Success');
      } else {
        console.log('❌ Failed:', data.result);
        try {
          await AsyncStorage.clear();
          navigation.navigate('LogIn');
          //setModalVisible(false);
        } catch (error) {
          console.log(error.message);
        }
      }
    } catch (error) {
      console.error('Error calling API:', error);
    }
  };

  const checkStartDayCheck = async () => {
    const formattedDate = format(new Date(), 'yyyy-MM-dd');
    console.log(formattedDate); // "2025-10-03"
    setLoading(true); // Show Loader
    try {
      const response = await fetch(
        BASE_URL +
        'DCR/LockDCR/StartDayCheck/StayCheck/TourProgramList?Businessid=' +
        useBusinessID +
        '&IDEmployee=' +
        useIDEmployee +
        '&CurrentDate=' +
        formattedDate,
      );
      console.log('checkStartDayCheck', response.url);
      const json = await response.json();
      setData(json);
      console.log('StartDayCheck', json);
      const isLockDcrEmpty = json.LockDCR === '';
      const isStartDayStarted = json?.StartDayCheck?.message === 'STARTED';
      const isNotStartDayStarted =
        json?.StartDayCheck?.message === 'NOTSTARTED';
      const isStayCheckFalse = json.StayCheck === 'False';
      // ✅ Extract id
      const id = json?.StartDayCheck?.id;

      db.transaction(tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS StartDayStatus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      status TEXT
    );`,
          [],
          () => console.log('Table created'),
          error => console.log('Create table error', error),
        );
      });

      const status = json?.StartDayCheck?.message; // STARTED or NOTSTARTED

      db.transaction(tx => {
        // Delete old value
        tx.executeSql('DELETE FROM StartDayStatus');

        // Insert latest value
        tx.executeSql(
          'INSERT INTO StartDayStatus (status) VALUES (?)',
          [status],
          () => console.log('Status saved'),
          error => console.log('Insert error', error),
        );
      });

      // ✅ Store in AsyncStorage
      if (id) {
        await AsyncStorage.setItem('IDday', id.toString());
        console.log('Saved StartDayID:', id);
      }

      // ✅ Check all conditions
      if (isLockDcrEmpty && isStartDayStarted && isStayCheckFalse) {
        navigation.navigate('AppNavDCRScreen');
      } else if (isLockDcrEmpty && isNotStartDayStarted && isStayCheckFalse) {
        navigation.navigate('DCR Session');
      } else {
        Alert.alert(
          'LockDCR Info',
          `LockDCR: ${json.LockDCR}\nStartDayCheck: ${json?.StartDayCheck?.message}\nStayCheck: ${json.StayCheck}`,
          [{ text: 'OK' }],
        );
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModuleIcon = moduleName => {
    const name = String(moduleName || '').toUpperCase().trim();

    // Existing / known modules
    if (name.includes('DCR')) return 'clipboard';
    if (name.includes('TOUR')) return 'map-pin';
    if (name.includes('DPC')) return 'file-text';
    if (name.includes('ORDER')) return 'shopping-bag';
    if (name.includes('EXPENSE')) return 'credit-card';
    if (name.includes('REPORT')) return 'bar-chart-2';
    if (name.includes('MASTER')) return 'database';
    if (name.includes('SURVEY')) return 'check-square';
    if (name.includes('SETTING')) return 'settings';
    if (name.includes('LEAVE')) return 'calendar';
    if (name.includes('SALES')) return 'trending-up';
    if (name.includes('RECEIPT')) return 'file-plus';
    if (name.includes('ACTIVITIES')) return 'zap';
    if (name.includes('FACEBOOK')) return 'share-2';
    if (name.includes('STOCK')) return 'box';

    // Future module smart matching
    if (
      name.includes('ATTENDANCE') ||
      name.includes('PRESENT') ||
      name.includes('ABSENT') ||
      name.includes('PUNCH') ||
      name.includes('TIME')
    ) {
      return 'clock';
    }

    if (
      name.includes('PAYROLL') ||
      name.includes('SALARY') ||
      name.includes('PAYSLIP') ||
      name.includes('WAGES')
    ) {
      return 'dollar-sign';
    }

    if (
      name.includes('APPROVAL') ||
      name.includes('APPROVE') ||
      name.includes('REQUEST') ||
      name.includes('PENDING')
    ) {
      return 'check-circle';
    }

    if (
      name.includes('EMPLOYEE') ||
      name.includes('TEAM') ||
      name.includes('STAFF') ||
      name.includes('USER')
    ) {
      return 'users';
    }

    if (
      name.includes('DOCTOR') ||
      name.includes('CUSTOMER') ||
      name.includes('CLIENT') ||
      name.includes('PARTY') ||
      name.includes('RETAILER')
    ) {
      return 'user-check';
    }

    if (
      name.includes('VISITOR') ||
      name.includes('GATE') ||
      name.includes('ENTRY') ||
      name.includes('CHECKIN') ||
      name.includes('CHECK-IN')
    ) {
      return 'log-in';
    }

    if (
      name.includes('CAMPAIGN') ||
      name.includes('PROMOTION') ||
      name.includes('MARKETING') ||
      name.includes('NOTICE')
    ) {
      return 'send';
    }

    if (
      name.includes('TRAINING') ||
      name.includes('COURSE') ||
      name.includes('LMS') ||
      name.includes('LEARNING') ||
      name.includes('QUIZ')
    ) {
      return 'book-open';
    }

    if (
      name.includes('TARGET') ||
      name.includes('GOAL') ||
      name.includes('ACHIEVEMENT') ||
      name.includes('PERFORMANCE') ||
      name.includes('KPI') ||
      name.includes('PMS')
    ) {
      return 'target';
    }

    if (
      name.includes('INVENTORY') ||
      name.includes('PRODUCT') ||
      name.includes('ITEM') ||
      name.includes('SAMPLE') ||
      name.includes('GIFT')
    ) {
      return 'box';
    }

    if (
      name.includes('LOCATION') ||
      name.includes('AREA') ||
      name.includes('HQ') ||
      name.includes('MAP') ||
      name.includes('GPS') ||
      name.includes('GEO')
    ) {
      return 'map';
    }

    if (
      name.includes('CHAT') ||
      name.includes('MESSAGE') ||
      name.includes('COMMUNICATION') ||
      name.includes('SUPPORT')
    ) {
      return 'message-circle';
    }

    if (
      name.includes('DOCUMENT') ||
      name.includes('LETTER') ||
      name.includes('FILE') ||
      name.includes('FORM')
    ) {
      return 'file-text';
    }

    if (
      name.includes('SECURITY') ||
      name.includes('LOCK') ||
      name.includes('PASSWORD') ||
      name.includes('ACCESS')
    ) {
      return 'shield';
    }

    if (
      name.includes('SYNC') ||
      name.includes('UPLOAD') ||
      name.includes('DOWNLOAD') ||
      name.includes('BACKUP')
    ) {
      return 'refresh-cw';
    }

    if (
      name.includes('ADMIN') ||
      name.includes('CONFIG') ||
      name.includes('CONTROL')
    ) {
      return 'sliders';
    }

    // Generic but still stable fallback for any future unknown module
    return getFallbackModuleIcon(name);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={() => submit(item)}
      style={styles.moduleCardWrap}>
      <View style={styles.moduleCard}>
        <View style={styles.moduleAccent} />

        <View style={styles.moduleIconOuter}>
          <View style={styles.moduleIconBox}>
            <Feather
              name={getModuleIcon(item.Module)}
              size={20}
              color="#005696"
            />
          </View>
        </View>

        <Text style={styles.moduleTitle} numberOfLines={2}>
          {item.Module}
        </Text>

        <View style={styles.moduleFooter}>
          <Text style={styles.moduleSubTitle}>Open</Text>
          <Feather name="arrow-up-right" size={12} color="#67BC45" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const checkStayTable = () => {
    db.transaction(tx => {
      tx.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='Stay_Table'",
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            console.warn('Stay_Table exists');

            tx.executeSql(
              'SELECT * FROM Stay_Table WHERE StayDate=?',
              [cdate],
              (tx, results) => {
                if (results.rows.length > 0) {
                  Alert.alert(
                    useEmpname + ' stay already exist on this date : ' + cdate,
                  );
                } else {
                  chectTourPlanData();
                }
              },
              (tx, error) => {
                console.log(error);
              },
            );
          } else {
            console.warn('Stay_Table does not exist');
            chectTourPlanData();
          }
        },
        (tx, error) => {
          console.log(error);
        },
      );
    });
  };

  const submit = async module => {
    switch (module.Module) {
      case 'TOUR PROGRAM':
        NetInfo.fetch().then(state => {
          if (state.isConnected) {
            //navigation.navigate('Quiz Dashboard');
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Tour Plan Submission' }], // or whatever your main screen is
              }),
            );
          } else {
            Alert.alert('Internet Is Required!');
            // navigation.dispatch(
            //   CommonActions.reset({
            //     index: 0,
            //     routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
            //   }),
            // );
          }
        });
        break;
      case 'DCR':
        if (useAdminAcess === true) {
          const formattedDate = format(new Date(), 'yyyy-MM-dd');
          console.log(formattedDate); // "2025-10-03"
          setLoading(true); // Show Loader
          try {
            const response = await fetch(
              BASE_URL +
              'DCR/LockDCR/StartDayCheck/StayCheck/TourProgramList?Businessid=' +
              useBusinessID +
              '&IDEmployee=' +
              useIDEmployee +
              '&CurrentDate=' +
              formattedDate,
            );
            console.log('checkStartDayCheck', response.url);
            const json = await response.json();

            const isLockDcrEmpty = json.LockDCR === '';
            const isStartDayStarted =
              json?.StartDayCheck?.message === 'STARTED';
            const isNotStartDayStarted =
              json?.StartDayCheck?.message === 'NOTSTARTED';
            const isStayCheckFalse = json.StayCheck === 'False';

            // ✅ Check all conditions
            if (isLockDcrEmpty && isStartDayStarted && isStayCheckFalse) {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'DcrAdminDashBoard' }], // or whatever your main screen is
                }),
              );
            } else if (
              isLockDcrEmpty &&
              isNotStartDayStarted &&
              isStayCheckFalse
            ) {
              navigation.navigate('DCR Session');
            } else {
              Alert.alert(
                'LockDCR Info',
                `LockDCR: ${json.LockDCR}\nStartDayCheck: ${json?.StartDayCheck?.message}\nStayCheck: ${json.StayCheck}`,
                [{ text: 'OK' }],
              );
            }
          } catch (error) {
            console.error('Error fetching data:', error);
          } finally {
            setLoading(false);
          }
        } else {
          if (useMobileAccess === 'ONLINE') {
            NetInfo.fetch().then(state => {
              if (state.isConnected) {
                checkStartDayCheck();
              } else {
                Alert.alert('Contact With Administrator!');
              }
            }, []);
          } else if (useMobileAccess === 'ONLINE & OFFLINE') {
            NetInfo.fetch().then(state => {
              if (state.isConnected) {
                //checkStartDay();
                checkStartDayCheck();
              } else {
                if (useAdminAcess === true) {
                  Alert.alert('No Internet Connection! Admin!');
                } else {
                  if (useManagerAccess === true) {
                    // db.transaction(tx => {
                    //   // Execute a query to retrieve table information
                    //   tx.executeSql(
                    //     "SELECT name FROM sqlite_master WHERE type='table' AND name='CRM_ManagerStartDayDummy'",
                    //     [],
                    //     (tx, results) => {
                    //       // Check if any rows are returned
                    //       if (results.rows.length > 0) {
                    //         db.transaction(tx => {
                    //           tx.executeSql(
                    //             'SELECT * FROM CRM_ManagerStartDayDummy where StartDate=?',
                    //             [cdate],
                    //             (tx, results) => {
                    //               // Check if there are rows in the result set
                    //               if (results.rows.length > 0) {
                    //                 console.log('Table has data');
                    //                 navigation.dispatch(
                    //                   CommonActions.reset({
                    //                     index: 0,
                    //                     routes: [{name: 'AppNavDCRScreen'}], // or whatever your main screen is
                    //                   }),
                    //                 );
                    //               } else {
                    //                 console.log('Table is empty');
                    //                 Alert.alert(
                    //                   'Start Your Day By Connecting Internet.',
                    //                 );
                    //               }
                    //             },
                    //             error =>
                    //               console.error(
                    //                 'Error executing SELECT query: ',
                    //                 error,
                    //               ),
                    //           );
                    //         });
                    //       } else {
                    //         Alert.alert(
                    //           'Start Your Day By Connecting Internet.',
                    //         );
                    //       }
                    //     },
                    //     error => {
                    //       // Error occurred while executing the query
                    //       console.log(error.message);
                    //     },
                    //   );
                    // });

                    db.transaction(tx => {
                      tx.executeSql(
                        'SELECT * FROM StartDayStatus LIMIT 1',
                        [],
                        (tx, results) => {
                          if (results.rows.length > 0) {
                            const status = results.rows.item(0).status;

                            console.log('Offline Status:', status);

                            if (status === 'STARTED') {
                              navigation.dispatch(
                                CommonActions.reset({
                                  index: 0,
                                  routes: [{ name: 'AppNavDCRScreen' }], // or whatever your main screen is
                                }),
                              );
                            } else if (status === 'NOTSTARTED') {
                              Alert.alert(
                                'Start Your Day By Connecting Internet.',
                              );
                            }
                          } else {
                            Alert.alert('No offline data found');
                          }
                        },
                        error => console.log(error),
                      );
                    });
                  } else {
                    console.log(ctdate);
                    // db.transaction(tx => {
                    //   tx.executeSql(
                    //     // 'SELECT * FROM CRM_ManagerStartDay where StartDate=?',
                    //     'SELECT * FROM CRM_offlinePendingDCRDate',
                    //     [],

                    //     (tx, results) => {
                    //       // Check if there are rows in the result set
                    //       if (results.rows.length > 0) {
                    //         console.log('Table has data');
                    //         Alert.alert(
                    //           'Go to Reports and clear your pending DCR',
                    //         );
                    //       } else {
                    //         console.log('Table is empty');
                    //         db.transaction(tx => {
                    //           // Execute a query to retrieve table information
                    //           tx.executeSql(
                    //             "SELECT name FROM sqlite_master WHERE type='table' AND name='Stay_Table'",
                    //             [],
                    //             (tx, results) => {
                    //               // Check if any rows are returned
                    //               if (results.rows.length > 0) {
                    //                 // Table exists
                    //                 console.warn('Stay_Table exists');
                    //                 db.transaction(tx => {
                    //                   tx.executeSql(
                    //                     // 'SELECT * FROM CRM_ManagerStartDay where StartDate=?',
                    //                     'SELECT * FROM Stay_Table where StayDate=?',
                    //                     [cdate],
                    //                     (tx, results) => {
                    //                       // Check if there are rows in the result set
                    //                       if (results.rows.length > 0) {
                    //                         console.log('Table has data');
                    //                         Alert.alert(
                    //                           useEmpname +
                    //                             ' stay already exist on this date : ' +
                    //                             cdate,
                    //                         );
                    //                       } else {
                    //                         console.log('Table is empty');
                    //                         chectTourPlanData();
                    //                       }
                    //                     },
                    //                     error =>
                    //                       console.error(
                    //                         'Error executing SELECT query: ',
                    //                         error,
                    //                       ),
                    //                   );
                    //                 });
                    //               } else {
                    //                 // Table does not exist
                    //                 console.warn('Stay_Table does not exists');
                    //                 chectTourPlanData();
                    //               }
                    //             },
                    //             error => {
                    //               // Error occurred while executing the query
                    //               console.log(error.message);
                    //             },
                    //           );
                    //         });
                    //       }
                    //     },
                    //     error =>
                    //       console.error(
                    //         'Error executing SELECT query: ',
                    //         error,
                    //       ),
                    //   );
                    // });
                    db.transaction(tx => {
                      tx.executeSql(
                        'SELECT * FROM StartDayStatus LIMIT 1',
                        [],
                        (tx, results) => {
                          if (results.rows.length > 0) {
                            const status = results.rows.item(0).status;

                            console.log('Offline Status:', status);

                            if (status === 'STARTED') {
                              navigation.dispatch(
                                CommonActions.reset({
                                  index: 0,
                                  routes: [{ name: 'AppNavDCRScreen' }], // or whatever your main screen is
                                }),
                              );
                            } else {
                              db.transaction(tx => {
                                // First check whether the table exists
                                tx.executeSql(
                                  "SELECT name FROM sqlite_master WHERE type='table' AND name='CRM_offlinePendingDCRDate'",
                                  [],
                                  (tx, tableResult) => {
                                    if (tableResult.rows.length > 0) {
                                      console.log(
                                        'CRM_offlinePendingDCRDate table exists',
                                      );

                                      // Table exists, now check data
                                      tx.executeSql(
                                        'SELECT * FROM CRM_offlinePendingDCRDate',
                                        [],
                                        (tx, results) => {
                                          if (results.rows.length > 0) {
                                            console.log('Pending DCR found');

                                            Alert.alert(
                                              'Go to Reports and clear your pending DCR',
                                            );
                                          } else {
                                            console.log('No pending DCR');

                                            checkStayTable();
                                          }
                                        },
                                        (tx, error) => {
                                          console.log(
                                            'Error reading CRM_offlinePendingDCRDate',
                                            error,
                                          );
                                        },
                                      );
                                    } else {
                                      console.log(
                                        'CRM_offlinePendingDCRDate table does not exist',
                                      );

                                      // Treat as no pending DCR
                                      checkStayTable();
                                    }
                                  },
                                  (tx, error) => {
                                    console.log(error);
                                  },
                                );
                              });
                            }
                          } else {
                            Alert.alert('No offline data found');
                          }
                        },
                        error => console.log(error),
                      );
                    });
                  }
                }
              }
            }, []);
          } else {
            Alert.alert('Contact With Administrator!');
          }
        }
        break;
      case 'SETTING':
        NetInfo.fetch().then(state => {
          if (state.isConnected) {
            //navigation.navigate('Quiz Dashboard');
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'SettingScreen' }], // or whatever your main screen is
                //routes: [{name: 'RX-Survey'}], // or whatever your main screen is
              }),
            );
          } else {
            Alert.alert('Internet Is Required!');
            // navigation.dispatch(
            //   CommonActions.reset({
            //     index: 0,
            //     routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
            //   }),
            // );
          }
        });
        //navigation.navigate('Test GPS');
        break;
      case 'MASTER':
        if (useManagerAccess === true) {
          // navigation.dispatch(
          //   CommonActions.reset({
          //     index: 0,
          //     routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
          //   }),
          // );
          Alert.alert('You are not authorized');
        } else {
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
          }, 5000);
          //console.warn(useManagerAccess);
          NetInfo.fetch().then(state => {
            if (state.isConnected) {
              //navigation.navigate('Quiz Dashboard');
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'AppNavMaster' }], // or whatever your main screen is
                }),
              );
            } else {
              //Alert.alert('Internet Is Required!');
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'AppNavMaster' }], // or whatever your main screen is
                }),
              );
            }
          });
        }
        break;
      case 'REPORTS':
        NetInfo.fetch().then(state => {
          if (state.isConnected) {
            const base = 'https://iecrmpharma.iecsl.in/Login/MobileWebAccess';
            const url = `${base}?BusinessID=${useBusinessID}&email=${useEmpemail}&securitykey=${useSecurityKey}`;
            console.log(url);

            Linking.openURL(url).catch(err =>
              console.error('An error occurred', err),
            );
            
          } else {
            Alert.alert('Internet Is Required!');
            
          }
        });
        break;
        case 'ORDER':
        setLoading(true);
        setTimeout(() => setLoading(false), 5000);

        if (['GENI-QST-536', 'DEV-GENI-536'].includes(useBusinessID.trim())) {
          Alert.alert('You are not authorized to access the module');
        } else {
          db.transaction(txn => {
            txn.executeSql('DROP TABLE IF EXISTS CRM_ProductOrder', []);
          });

          NetInfo.fetch().then(state => {
            if (state.isConnected) {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'AppNavOrder' }], // or whatever your main screen is
                }),
              );
            } else {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'AppNavOrder' }], // or whatever your main screen is
                }),
              );
            }
          });
        }
        break;
      //case 'ACTIVITIES':
      case 'ACTIVITIES':
        if (useBusinessID.trim() === 'GENI-QST-536') {
          Alert.alert('You are not authorized to access the module');
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'AppNavScreen' }], // or whatever your main screen is
            }),
          );
        } else if (useBusinessID.trim() === 'DEV-GENI-536') {
          Alert.alert('You are not authorized to access the module');
          // navigation.dispatch(
          //   CommonActions.reset({
          //     index: 0,
          //     routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
          //   }),
          // );
        } else {
          NetInfo.fetch().then(async state => {
            if (state.isConnected) {
              if (useDivision === 'MARKETING') {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'AppNavActivity' }], // or whatever your main screen is
                  }),
                );
              } else {
                // navigation.dispatch(
                //   CommonActions.reset({
                //     index: 0,
                //     routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
                //   }),
                // );
                Alert.alert('You are not authorized');
              }
            } else {
              Alert.alert('No Internet');
              // navigation.dispatch(
              //   CommonActions.reset({
              //     index: 0,
              //     routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
              //   }),
              // );
            }
          }, []);
        }
        break;
      case 'SURVEY':
        if (['GENI-QST-536', 'DEV-GENI-536'].includes(useBusinessID.trim())) {
          Alert.alert('You are not authorized to access the module');
          // navigation.dispatch(
          //   CommonActions.reset({
          //     index: 0,
          //     routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
          //   }),
          // );
        } else {
          NetInfo.fetch().then(state => {
            if (state.isConnected) {
              //navigation.navigate('Quiz Dashboard');
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'AppNavQuiz' }], // or whatever your main screen is
                }),
              );
            } else {
              Alert.alert('Internet Is Required!');
              // navigation.dispatch(
              //   CommonActions.reset({
              //     index: 0,
              //     routes: [{name: 'AppNavScreen'}], // or whatever your main screen is
              //   }),
              // );
            }
          });
        }
        break;
      case 'EXPENSE':
        NetInfo.fetch().then(state => {
          if (state.isConnected) {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
            }, 5000);
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'AppNavExpense' }], // or whatever your main screen is
              }),
            );
          } else {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'AppNavExpense' }], // or whatever your main screen is
              }),
            );
          }
        });
        break;
      case 'SECONDARY STOCK':
        NetInfo.fetch().then(async state => {
          try {
            AsyncStorage.getItem('UserData').then(async value => {
              if (value != null) {
                let user = JSON.parse(value);
                const apiUrl = Sales_URL + 'UserNamePwdcheck';
                const username = user.Empemail;
                const password = user.Password;

                NetInfo.fetch().then(async state => {
                  if (state.isConnected) {
                    try {
                      const response = await fetch(
                        `${apiUrl}?uname=${username}&pwd=${password}`,
                        {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                        },
                      );

                      if (!response.ok) {
                        throw new Error('Network response was not ok');
                      }

                      const jsonData = await response.json();

                      if (Array.isArray(jsonData) && jsonData.length > 0) {
                        const userData = jsonData[0];

                        // Store entire user object
                        await AsyncStorage.setItem(
                          'SalesLogin',
                          JSON.stringify(userData),
                        );
                        setLoading(true);
                        setTimeout(() => {
                          setLoading(false);
                        }, 5000);
                        navigation.dispatch(
                          CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'Secondary Closing Stock Entry' }], // or whatever your main screen is
                          }),
                        );
                      } else {
                        Alert.alert(
                          'Login Failed',
                          'Invalid credentials or empty response',
                        );
                      }
                    } catch (error) {
                      console.error('Login error:', error);
                      Alert.alert(
                        'Error',
                        'Failed to login. Please try again.',
                      );
                    }
                  } else {
                    Alert.alert('No Internet');
                    //fetchDashboardFromSQLite(); // fatch the Data From the Sqlite
                  }
                }, []);
              }
            });
          } catch (error) {
            console.log(error.message);
          }
        });
        break;
      case 'SALES REPORT':
        NetInfo.fetch().then(async state => {
          if (state.isConnected) {
            try {
              setSalesLoading(true);
              const storedUser = await AsyncStorage.getItem('UserData');
              if (!storedUser) {
                setSalesLoading(false);
                Alert.alert('User data not found.');
                return;
              }

              const user = JSON.parse(storedUser);
              const email = user.Empemail;
              const password = user.Password;

              if (!email || !password) {
                setSalesLoading(false);
                Alert.alert(
                  'Missing email or password. Please Logout and Login again.',
                );
                return;
              }

              const apiUrl = `${Sales_URL}UserNamePwdcheck?uname=${email}&pwd=${password}`;

              const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
              });

              const result = await response.json();
              console.log('SALES REPORT API RESPONSE:', result);

              if (Array.isArray(result) && result.length > 0) {
                const userData = result[0];
                await AsyncStorage.setItem(
                  'UserDataSales',
                  JSON.stringify(userData),
                );
                setSalesLoading(false);

                // ✅ Redirect based on Division
                if (userData.Division?.toUpperCase() === 'ADMIN') {
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: 'ADMIN_MAIN_SALES_REPORT' }],
                    }),
                  );
                } else {
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: 'SALES REPORT' }],
                    }),
                  );
                }
              } else {
                setSalesLoading(false);
                Alert.alert('Invalid response from server.');
              }
            } catch (error) {
              setSalesLoading(false);
              console.error('Sales Login Error:', error);
              Alert.alert('Error while logging into Sales Report.');
            }
          } else {
            Alert.alert('Internet Is Required!');
          }
        });
        break;
      case 'DPC':
        NetInfo.fetch().then(async state => {
          if (state.isConnected) {
            // navigation.dispatch(
            //   CommonActions.reset({
            //     index: 0,
            //     routes: [{name: 'AppNavDPC'}], // or whatever your main screen is
            //   }),
            // );
            navigation.navigate('AppNavDPC');
          } else {
            Alert.alert('No Internet');
            //fetchDashboardFromSQLite(); // fatch the Data From the Sqlite
          }
        }, []);
        break;
      case 'RX SURVEY':
        NetInfo.fetch().then(async state => {
          if (state.isConnected) {
            // navigation.dispatch(
            //   CommonActions.reset({
            //     index: 0,
            //     routes: [{name: 'AppNavDPC'}], // or whatever your main screen is
            //   }),
            // );
            navigation.navigate('RX-Survey');
          } else {
            Alert.alert('No Internet');
            //fetchDashboardFromSQLite(); // fatch the Data From the Sqlite
          }
        }, []);
        break;
      case 'LEAVE':
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'approvalDashboard' }], // or whatever your main screen is
          }),
        );
        // navigation.dispatch(
        //   CommonActions.reset({
        //     index: 0,
        //     routes: [{name: 'Test GPS'}], // or whatever your main screen is
        //   }),
        // );
        break; // The break should be inside the case block
      case 'FACEBOOK PROMOTION':
        NetInfo.fetch().then(state => {
          if (state.isConnected) {
            //navigation.navigate('Quiz Dashboard');
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'FacebookPromotion' }], // or whatever your main screen is
                //routes: [{name: 'RX-Survey'}], // or whatever your main screen is
              }),
            );
          } else {
            Alert.alert('Internet Is Required!');
          }
        });
        break;
      case 'RECEIPT':
        NetInfo.fetch().then(state => {
          if (state.isConnected) {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
            }, 5000);
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'AppNavReceipt' }], // or whatever your main screen is
              }),
            );
          } else {
            // navigation.dispatch(
            //   CommonActions.reset({
            //     index: 0,
            //     routes: [{name: 'AppNavExpense'}], // or whatever your main screen is
            //   }),
            // );
            Alert.alert('Connect Internet!');
          }
        });
        break;
      default:
        Alert.alert('Working On');
    }
  };

  const BirthdayRenderItem = ({ item }) => {
    // 🔹 Find closest 3 birthdays (sorted)
    const topThree = birthdays
      .map(b => ({
        ...b,
        daysLeft:
          new Date(new Date(b.DOB).setFullYear(new Date().getFullYear())) <
            new Date()
            ? Math.ceil(
              (new Date(
                new Date(b.DOB).setFullYear(new Date().getFullYear() + 1),
              ) -
                new Date()) /
              (1000 * 60 * 60 * 24),
            )
            : Math.ceil(
              (new Date(
                new Date(b.DOB).setFullYear(new Date().getFullYear()),
              ) -
                new Date()) /
              (1000 * 60 * 60 * 24),
            ),
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 3);

    // 🔹 Skip rendering if item not in top 3
    if (!topThree.find(b => b.Employee === item.Employee)) {
      return null;
    }

    const daysUntil = getDaysUntilBirthday(item.DOB);

    return (
      <View style={styles.BirthdayCard}>
        {/* Foreground content */}
        <View style={styles.cardContentBirthday}>
          {item.ProfilePicPath ? (
            <Image
              source={{ uri: `${url}/${item.ProfilePicPath}` }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person-circle-outline" size={50} color="#ccc" />
          )}

          <View style={styles.infobirthday}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                width: screenWidth * 0.4,
              }}>
              <Text
                style={styles.nameBirthday}
                numberOfLines={2}
                ellipsizeMode="tail">
                {item.Employee}
              </Text>
            </View>

            <Text style={styles.detailsBirthday}>
              {item.Designation} • {item.Division}
            </Text>
            <Text style={styles.dob}>🎂 {item.FormattedDOB}</Text>
            {/* <Text style={styles.dob}>({daysUntil})</Text> */}
            <Text style={styles.detail}>Ph : {item.Phone || 'N/A'}</Text>
          </View>

          {/* ✅ Show Wish button only if Phone exists AND it's Today */}
          {item.Phone && daysUntil === '🎉 Today' ? (
            <TouchableOpacity
              style={styles.whatsappButton}
              onPress={() => onWish(item)}>
              <View style={styles.iconContainerBirthday}>
                <Ionicons name="logo-whatsapp" size={20} color="#fff" />
              </View>
              <Text style={styles.whatsappText}>
                Wish {item.Gender === 'FEMALE' ? 'Her' : 'Him'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.noPhoneContainer}>
              <Text style={styles.noPhoneText}>
                {daysUntil === '🎉 Today' ? 'Phone: N/A' : `Wish ${daysUntil}`}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const NoticeBoardRenderItem = ({ item }) => {
    const imageUrl = item.NoticeImage
      ? encodeURI(`${url}/${item.NoticeImage.replace(/\\/g, '/')}`)
      : null;

    return (
      <View style={styles.corporateNoticeCard}>
        {imageUrl && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              setNoticeUrl(imageUrl);
              setVisible(true);
            }}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.corporateNoticeImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}

        <View style={styles.corporateNoticeBody}>
          <View style={styles.corporateNoticeIcon}>
            <Ionicons name="paper-plane-outline" size={22} color="#005696" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.corporateNoticeTitle} numberOfLines={1}>
              {item.ShortNotice}
            </Text>

            <Text style={styles.corporateNoticeText} numberOfLines={2}>
              {item.LongNotice}
            </Text>

            <Text style={styles.corporateNoticeMeta} numberOfLines={1}>
              {item.NoticeDate} • By {item.Employee}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // ✅ Get paginated data
  //const paginatedData = myteam.slice(
  const paginatedData = useMemo(() => {
    return filteredMyTeam.slice(
      currentPage * itemsPerPage,
      (currentPage + 1) * itemsPerPage,
    );
  }, [filteredMyTeam, currentPage, itemsPerPage]);


  const renderTeamRow = useCallback(
    ({ item }) => (
      <View style={styles.corporateTableRow}>
        <Text style={[styles.corporateCell, { width: 105 }]}>
          {item.EmployeeNo}
        </Text>

        <View style={[styles.corporateNameCell, { width: 175 }]}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  Number(item.StartDay) === 1 ? '#22C55E' : '#EF4444',
              },
            ]}
          />

          <Text style={styles.corporateNameText} numberOfLines={2}>
            {item.EmployeeName}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => openPhoneModal(item)}
          style={[styles.corporateCell, { width: 130 }]}>
          <Text style={styles.corporatePhoneText}>{item.PhoneNo}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => openVisitDetailsModal(item)}
          style={[styles.corporateCell, { width: 120 }]}>
          <View style={styles.corporateViewBtn}>
            <Text style={styles.corporateViewBtnText}>View</Text>
          </View>
        </TouchableOpacity>

        <Text style={[styles.corporateCell, { width: 105 }]}>
          {item.Division}
        </Text>

        <Text style={[styles.corporateCell, { width: 145 }]} numberOfLines={2}>
          {item.EmployeeDesg}
        </Text>

        <Text style={[styles.corporateCell, { width: 170 }]} numberOfLines={2}>
          {item.Manager}
        </Text>
      </View>
    ),
    [openPhoneModal, openVisitDetailsModal],
  );

  // const openVisitDetailsModal = async item => {
  //   if (!netState?.isConnected) {
  //     Alert.alert('No Internet', 'Please check your internet connection.');
  //     return; // Stop execution completely
  //   }
  //   if (!item?.IDEmployee) return;
  //   const selectedEmployeeId = String(item?.IDEmployee || '').trim();
  //   const loggedInEmployeeId = useIDEmployee ; 
  //   console.log('Selected Employee ID:', selectedEmployeeId);
  //   console.log('Logged In Employee ID:', useIDEmployee);
  //   // 🔒 Access Control Logic
  //   if (!useManagerAccess) {
  //     if (selectedEmployeeId !== useIDEmployee) {
  //       Alert.alert(
  //         'Access Denied',
  //         "You are not authorized to view other employees' visit details.",
  //       );
  //       //console.log('Access Denied: Not authorized to view other employees.');
  //       return; // Stop execution
  //     }
  //   }

  //   setSelectedEmp(item);
  //   setVisitDetailsModalVisible(true);
  //   setLoadingVisitDetails(true);

  //   try {
  //     const url = `${BASE_URL}Dashboard/EmployeeReport?Businessid=${useBusinessID}&IDEmployee=${item.IDEmployee}`;
  //     console.log('Fetching visit details from:', url);
  //     const response = await fetch(url);
  //     if (!response.ok) {
  //       const body = await response.text();
  //       const requestError = new Error(`HTTP ${response.status}`);
  //       requestError.status = response.status;
  //       requestError.data = body;
  //       throw requestError;
  //     }
  //     const json = await response.json();
  //     //console.log('Raw API Response:', json);
  //     const isValidResponse =
  //       json &&
  //       typeof json === 'object' &&
  //       (json.WorkDetails || json.ReportCount);
  //     if (!isValidResponse) {
  //       throw new Error('Invalid API response structure');
  //     }
  //     if (isValidResponse) {
  //       setVisitReport(json.WorkDetails || []);
  //       setReportCount(json.ReportCount?.[0] || null);
  //     }
  //     //console.log('Visit details fetched successfully:', json);
  //   } catch (error) {
  //     traceApiError(
  //       'EmployeeReport',
  //       `${BASE_URL}Dashboard/EmployeeReport?Businessid=${useBusinessID}&IDEmployee=${item.IDEmployee}`,
  //       error,
  //     );
  //   } finally {
  //     setLoadingVisitDetails(false);
  //   }
  // };


  const openVisitDetailsModal = async item => {
    try {
      if (!netState?.isConnected) {
        Alert.alert('No Internet', 'Please check your internet connection.');
        return;
      }

      if (!item?.IDEmployee) {
        Alert.alert('Error', 'Employee ID not found.');
        return;
      }

      // ===============================
      // 1. Read logged-in user fallback
      // ===============================
      let loggedUser = null;

      try {
        const storedUser = await AsyncStorage.getItem('UserData');
        loggedUser = storedUser ? JSON.parse(storedUser) : null;
      } catch (error) {
        console.log('UserData read error:', error);
      }

      // ===============================
      // 2. Prepare selected employee
      // ===============================
      const selectedEmployeeId = Number(item?.IDEmployee || 0);
      const selectedEmployeeNo = String(item?.EmployeeNo || '').trim();

      // ===============================
      // 3. Prepare logged-in employee
      // ===============================
      const loggedInEmployeeId = Number(
        useIDEmployee || loggedUser?.IDEmployee || 0,
      );

      const loggedInEmployeeNo = String(
        useEmpNo || loggedUser?.Empno || '',
      ).trim();

      // ===============================
      // 4. Prepare manager access
      // ===============================
      const managerAccessValue =
        useManagerAccess !== '' &&
          useManagerAccess !== null &&
          useManagerAccess !== undefined
          ? useManagerAccess
          : loggedUser?.ManagerAccess;

      const isManager =
        managerAccessValue === true ||
        managerAccessValue === 'true' ||
        managerAccessValue === 'True' ||
        managerAccessValue === 1 ||
        managerAccessValue === '1';

      // ===============================
      // 5. Own user check
      // ===============================
      const isOwnEmployee =
        selectedEmployeeId === loggedInEmployeeId ||
        selectedEmployeeNo === loggedInEmployeeNo;

      console.log('VISIT ACCESS CHECK:', {
        selectedEmployeeId,
        loggedInEmployeeId,
        selectedEmployeeNo,
        loggedInEmployeeNo,
        managerAccessValue,
        isManager,
        isOwnEmployee,
        selectedEmployeeIdType: typeof selectedEmployeeId,
        loggedInEmployeeIdType: typeof loggedInEmployeeId,
      });

      // ===============================
      // 6. Access control
      // Manager can see all.
      // Normal user can see only own data.
      // ===============================
      if (!isManager && !isOwnEmployee) {
        Alert.alert(
          'Access Denied',
          "You are not authorized to view other employees' visit details.",
        );
        return;
      }

      // ===============================
      // 7. Prepare Business ID
      // ===============================
      let businessId = String(useBusinessID || '').trim();

      if (!businessId) {
        businessId = String(loggedUser?.BusinessID || '').trim();

        if (businessId) {
          setBusinessID(businessId);
        }
      }

      if (!businessId) {
        Alert.alert(
          'Error',
          'Business ID not found. Please logout and login again.',
        );
        return;
      }

      // Optional: update missing states again
      if (!useIDEmployee && loggedUser?.IDEmployee) {
        setIDEmployee(loggedUser.IDEmployee);
      }

      if (!useEmpNo && loggedUser?.Empno) {
        setEmpNo(loggedUser.Empno);
      }

      if (
        (useManagerAccess === '' ||
          useManagerAccess === null ||
          useManagerAccess === undefined) &&
        loggedUser?.ManagerAccess !== undefined
      ) {
        setuseManagerAccess(loggedUser.ManagerAccess);
      }

      // ===============================
      // 8. Open modal and call API
      // ===============================
      setSelectedEmp(item);
      setVisitDetailsModalVisible(true);
      setLoadingVisitDetails(true);

      const requestUrl = `${BASE_URL}Dashboard/EmployeeReport?Businessid=${businessId}&IDEmployee=${selectedEmployeeId}`;

      console.log('Fetching visit details from:', requestUrl);

      const response = await fetch(requestUrl);

      if (!response.ok) {
        const body = await response.text();
        const requestError = new Error(`HTTP ${response.status}`);
        requestError.status = response.status;
        requestError.data = body;
        throw requestError;
      }

      const json = await response.json();

      const isValidResponse =
        json &&
        typeof json === 'object' &&
        (json.WorkDetails || json.ReportCount);

      if (!isValidResponse) {
        throw new Error('Invalid API response structure');
      }

      setVisitReport(Array.isArray(json.WorkDetails) ? json.WorkDetails : []);
      setReportCount(
        Array.isArray(json.ReportCount) && json.ReportCount.length > 0
          ? json.ReportCount[0]
          : null,
      );

      console.log('Visit details loaded successfully');
    } catch (error) {
      traceApiError(
        'EmployeeReport',
        `${BASE_URL}Dashboard/EmployeeReport`,
        error,
      );

      Alert.alert('Error', 'Unable to load visit details.');
    } finally {
      setLoadingVisitDetails(false);
    }
  };



  const MIME_XLSX =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  const buildVisitWorkbookBase64 = () => {
    const today = new Date();
    const generatedOn = today.toLocaleString();

    // 🔹 Sheet Data Structure
    const sheetData = [];

    // Company Header
    sheetData.push(['ie.CRM Visit Report']);
    sheetData.push([]);

    // Employee & Summary Info
    sheetData.push(['Employee Name', selectedEmp?.EmployeeName || '']);
    sheetData.push(['Generated On', generatedOn]);
    sheetData.push(['Doctor Count', reportCount?.DoctorCount || 0]);
    sheetData.push(['Retailer Count', reportCount?.RetailerCount || 0]);
    sheetData.push([]);

    // Table Header
    sheetData.push([
      'SRL',
      'Employee No',
      'Employee Name',
      'Area',
      'Customer Name',
      'Visit Time',
      'Latitude',
      'Longitude',
    ]);

    // Table Rows
    visitReport.forEach(item => {
      sheetData.push([
        item.SRL,
        item.Employeeno,
        item.EmployeeName,
        item.Area,
        item.CustomerName,
        item.VisitTime,
        item.DoctorLat,
        item.DoctorLong,
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // 🔹 Column Width Auto Adjustment
    ws['!cols'] = [
      { wch: 6 },
      { wch: 15 },
      { wch: 20 },
      { wch: 18 },
      { wch: 28 },
      { wch: 22 },
      { wch: 15 },
      { wch: 15 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Visit Report');

    return XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  };

  const shareVisitExcel = async () => {
    try {
      if (!visitReport?.length) {
        Alert.alert('No Data', 'There is no visit data to export.');
        return;
      }

      const b64 = buildVisitWorkbookBase64();
      const fileName = `VisitReport_${selectedEmp?.EmployeeName
        }_${Date.now()}.xlsx`;
      const cachePath = `${RNFS.CachesDirectoryPath}/${fileName}`;

      await RNFS.writeFile(cachePath, b64, 'base64');

      const exists = await RNFS.exists(cachePath);
      if (!exists) throw new Error('File not created');

      const fileUrl =
        Platform.OS === 'android' ? `file://${cachePath}` : cachePath;

      try {
        await Share.open({
          url: fileUrl,
          type: MIME_XLSX,
          filename: fileName,
          failOnCancel: false,
          showAppsToView: true,
          saveToFiles: true,
        });
      } catch (shareErr) {
        if (Platform.OS === 'android') {
          await RNBlobUtil.android.actionViewIntent(cachePath, MIME_XLSX);
        } else {
          throw shareErr;
        }
      }
    } catch (e) {
      console.error('Visit Excel Share Error:', e);
      Alert.alert('Error', 'Failed to share Excel file');
    }
  };

  const cleanText = value => {
    if (value === null || value === undefined) return '';

    return String(value)
      .replace(/\u202F/g, ' ') // Narrow no-break space
      .replace(/\u00A0/g, ' ') // Non-breaking space
      .replace(/[^\x00-\xFF]/g, '') // Remove unsupported Unicode
      .replace(/[\u0000-\u001F]/g, '') // Remove control chars
      .trim();
  };

  const shareVisitPDF = async () => {
    try {
      if (!visitReport?.length) {
        Alert.alert('No Data', 'There is no visit data to export.');
        return;
      }

      const pdfDoc = await PDFDocument.create();

      const pageWidth = 842;
      const pageHeight = 595;
      const margin = 40;

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;

      // ================= HEADER =================

      page.drawText('ie.CRM Visit Report', {
        x: margin,
        y,
        size: 18,
        font: boldFont,
        color: rgb(0.05, 0.47, 0.47),
      });

      y -= 28;

      page.drawText('Employee Name: ' + cleanText(selectedEmp?.EmployeeName), {
        x: margin,
        y,
        size: 11,
        font,
      });

      y -= 15;

      page.drawText(
        'Employee No: ' + cleanText(selectedEmp?.Employeeno || useEmpNo),
        { x: margin, y, size: 11, font },
      );

      y -= 15;

      page.drawText('Division: ' + cleanText(useDivision), {
        x: margin,
        y,
        size: 11,
        font,
      });

      y -= 15;

      page.drawText('Designation: ' + cleanText(useDesignation), {
        x: margin,
        y,
        size: 11,
        font,
      });

      y -= 15;

      page.drawText('Headquarter: ' + cleanText(useHq), {
        x: margin,
        y,
        size: 11,
        font,
      });

      y -= 20;

      page.drawText(
        'Doctor Count: ' +
        cleanText(reportCount?.DoctorCount) +
        ' | Retailer Count: ' +
        cleanText(reportCount?.RetailerCount) +
        ' | Missed Call: ' +
        cleanText(reportCount?.RetailerMissedcallCount) +
        ' | RCPA Count: ' +
        cleanText(reportCount?.RCPACount),
        { x: margin, y, size: 11, font: boldFont },
      );

      y -= 35;

      // ================= TABLE CONFIG =================

      const columns = [
        { label: 'SRL', width: 60 },
        { label: 'Area', width: 220 },
        { label: 'Customer', width: 330 },
        { label: 'Visit Time', width: 170 },
      ];

      const wrapText = (text, maxWidth, fontSize = 9) => {
        const words = cleanText(text).split(' ');
        let lines = [];
        let currentLine = '';

        words.forEach(word => {
          const testLine = currentLine + word + ' ';
          const width = font.widthOfTextAtSize(testLine, fontSize);

          if (width > maxWidth - 12) {
            lines.push(currentLine);
            currentLine = word + ' ';
          } else {
            currentLine = testLine;
          }
        });

        lines.push(currentLine);
        return lines;
      };

      const drawHeaderRow = () => {
        let x = margin;

        columns.forEach(col => {
          page.drawRectangle({
            x,
            y: y - 22,
            width: col.width,
            height: 28,
            borderWidth: 1,
            borderColor: rgb(0.6, 0.6, 0.6),
            color: rgb(0.94, 0.97, 0.99),
          });

          page.drawText(col.label, {
            x: x + 10,
            y: y - 16,
            size: 11,
            font: boldFont,
          });

          x += col.width;
        });

        y -= 30;
      };

      drawHeaderRow();

      // ================= ROWS =================

      for (let item of visitReport) {
        const isEvenRow = item.SRL % 2 === 0;

        const rowData = [
          cleanText(item.SRL),
          cleanText((item.Area || '').replace(/\+/g, ', ')),
          cleanText(item.CustomerName),
          cleanText(item.VisitTime),
        ];

        let wrappedData = [];
        let rowHeight = 0;

        rowData.forEach((cell, index) => {
          const lines = wrapText(cell, columns[index].width);
          wrappedData.push(lines);
          rowHeight = Math.max(rowHeight, lines.length * 12 + 12);
        });

        if (y - rowHeight < margin) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
          drawHeaderRow();
        }

        let x = margin;

        wrappedData.forEach((lines, colIndex) => {
          page.drawRectangle({
            x,
            y: y - rowHeight,
            width: columns[colIndex].width,
            height: rowHeight,
            borderWidth: 1,
            borderColor: rgb(0.85, 0.85, 0.85),
            color: isEvenRow ? rgb(0.97, 0.98, 0.99) : undefined,
          });

          const lineHeight = 12;
          const textBlockHeight = lines.length * lineHeight;

          const startY = y - rowHeight / 2 + textBlockHeight / 2 - 6;

          lines.forEach((line, lineIndex) => {
            page.drawText(line.trim(), {
              x: x + 10,
              y: startY - lineIndex * lineHeight,
              size: 9,
              font,
            });
          });

          x += columns[colIndex].width;
        });

        y -= rowHeight + 6;
      }

      // ================= FOOTER =================

      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      const safeDate = cleanText(new Date().toLocaleString());

      pages.forEach((p, index) => {
        p.drawText(`Page ${index + 1} of ${totalPages}`, {
          x: pageWidth - 140,
          y: 20,
          size: 8,
          font,
        });

        p.drawText('Generated on: ' + safeDate, {
          x: margin,
          y: 20,
          size: 8,
          font,
        });
      });

      const pdfBytes = await pdfDoc.save();
      const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

      const fileName = `VisitReport_${Date.now()}.pdf`;
      const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;

      await RNFS.writeFile(filePath, pdfBase64, 'base64');

      const fileUrl =
        Platform.OS === 'android' ? `file://${filePath}` : filePath;

      await Share.open({
        url: fileUrl,
        type: 'application/pdf',
        filename: fileName,
        failOnCancel: false,
      });
    } catch (error) {
      console.log('PDF generation error:', error);
      Alert.alert('Error', 'Failed to generate PDF.');
    }
  };

  // const shareVisitPDF = async () => {
  //   try {
  //     if (!visitReport?.length) {
  //       Alert.alert('No Data', 'There is no visit data to export.');
  //       return;
  //     }

  //     const pdfDoc = await PDFDocument.create();

  //     const pageWidth = 842; // A4 Landscape
  //     const pageHeight = 595;
  //     const margin = 40;

  //     const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  //     const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  //     let page = pdfDoc.addPage([pageWidth, pageHeight]);
  //     let y = pageHeight - margin;

  //     // ================= HEADER =================

  //     page.drawText('ie.CRM Visit Report', {
  //       x: margin,
  //       y,
  //       size: 18,
  //       font: boldFont,
  //       color: rgb(0.05, 0.47, 0.47),
  //     });

  //     y -= 28;

  //     page.drawText(`Employee Name: ${selectedEmp?.EmployeeName || ''}`, {
  //       x: margin,
  //       y,
  //       size: 11,
  //       font,
  //     });

  //     y -= 15;

  //     page.drawText(`Employee No: ${selectedEmp?.Employeeno || useEmpNo}`, {
  //       x: margin,
  //       y,
  //       size: 11,
  //       font,
  //     });

  //     y -= 15;

  //     page.drawText(`Division: ${useDivision || ''}`, {
  //       x: margin,
  //       y,
  //       size: 11,
  //       font,
  //     });

  //     y -= 15;

  //     page.drawText(`Designation: ${useDesignation || ''}`, {
  //       x: margin,
  //       y,
  //       size: 11,
  //       font,
  //     });

  //     y -= 15;

  //     page.drawText(`Headquarter: ${useHq || ''}`, {
  //       x: margin,
  //       y,
  //       size: 11,
  //       font,
  //     });

  //     y -= 20;

  //     page.drawText(
  //       `Doctor Count: ${reportCount?.DoctorCount || 0}   |   Retailer Count: ${reportCount?.RetailerCount || 0
  //       }`,
  //       {
  //         x: margin,
  //         y,
  //         size: 11,
  //         font: boldFont,
  //       }
  //     );

  //     y -= 35;

  //     // ================= TABLE CONFIG =================

  //     const columns = [
  //       { label: 'SRL', width: 60 },
  //       { label: 'Area', width: 220 },
  //       { label: 'Customer', width: 330 },
  //       { label: 'Visit Time', width: 170 },
  //     ];

  //     const wrapText = (text, maxWidth, fontSize = 9) => {
  //       const words = text.split(' ');
  //       let lines = [];
  //       let currentLine = '';

  //       words.forEach(word => {
  //         const testLine = currentLine + word + ' ';
  //         const width = font.widthOfTextAtSize(testLine, fontSize);
  //         if (width > maxWidth - 12) {
  //           lines.push(currentLine);
  //           currentLine = word + ' ';
  //         } else {
  //           currentLine = testLine;
  //         }
  //       });

  //       lines.push(currentLine);
  //       return lines;
  //     };

  //     const drawHeaderRow = () => {
  //       let x = margin;

  //       columns.forEach(col => {
  //         page.drawRectangle({
  //           x,
  //           y: y - 22,
  //           width: col.width,
  //           height: 28,
  //           borderWidth: 1,
  //           borderColor: rgb(0.6, 0.6, 0.6),
  //           color: rgb(0.94, 0.97, 0.99),
  //         });

  //         page.drawText(col.label, {
  //           x: x + 10,
  //           y: y - 16,
  //           size: 11,
  //           font: boldFont,
  //         });

  //         x += col.width;
  //       });

  //       y -= 30;
  //     };

  //     drawHeaderRow();

  //     // ================= ROWS =================

  //     for (let item of visitReport) {
  //       const isEvenRow = item.SRL % 2 === 0;

  //       const rowData = [
  //         String(item.SRL || ''),
  //         (item.Area || '').replace(/\+/g, ', '),
  //         item.CustomerName || '',
  //         item.VisitTime || '',
  //       ];

  //       let wrappedData = [];
  //       let rowHeight = 0;

  //       rowData.forEach((cell, index) => {
  //         const lines = wrapText(String(cell), columns[index].width);
  //         wrappedData.push(lines);
  //         rowHeight = Math.max(rowHeight, lines.length * 12 + 12);
  //       });

  //       if (y - rowHeight < margin) {
  //         page = pdfDoc.addPage([pageWidth, pageHeight]);
  //         y = pageHeight - margin;
  //         drawHeaderRow();
  //       }

  //       let x = margin;

  //       wrappedData.forEach((lines, colIndex) => {
  //         page.drawRectangle({
  //           x,
  //           y: y - rowHeight,
  //           width: columns[colIndex].width,
  //           height: rowHeight,
  //           borderWidth: 1,
  //           borderColor: rgb(0.85, 0.85, 0.85),
  //           color: isEvenRow ? rgb(0.97, 0.98, 0.99) : undefined,
  //         });

  //         const lineHeight = 12;
  //         const textBlockHeight = lines.length * lineHeight;

  //         // ✅ PERFECT VERTICAL CENTERING
  //         const startY =
  //           y - (rowHeight / 2) + (textBlockHeight / 2) - 6;

  //         lines.forEach((line, lineIndex) => {
  //           page.drawText(line.trim(), {
  //             x: x + 10,
  //             y: startY - lineIndex * lineHeight,
  //             size: 9,
  //             font,
  //           });
  //         });

  //         x += columns[colIndex].width;
  //       });

  //       y -= rowHeight + 6;
  //     }

  //     // ================= FOOTER =================

  //     const pages = pdfDoc.getPages();
  //     const totalPages = pages.length;

  //     pages.forEach((p, index) => {
  //       p.drawText(
  //         `Page ${index + 1} of ${totalPages}`,
  //         {
  //           x: pageWidth - 140,
  //           y: 20,
  //           size: 8,
  //           font,
  //         }
  //       );

  //       p.drawText(
  //         `Generated on: ${new Date().toLocaleString()}`,
  //         {
  //           x: margin,
  //           y: 20,
  //           size: 8,
  //           font,
  //         }
  //       );
  //     });

  //     // ================= SAVE =================

  //     const pdfBytes = await pdfDoc.save();
  //     const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

  //     const fileName = `VisitReport_${Date.now()}.pdf`;
  //     const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;

  //     await RNFS.writeFile(filePath, pdfBase64, 'base64');

  //     const fileUrl =
  //       Platform.OS === 'android' ? `file://${filePath}` : filePath;

  //     await Share.open({
  //       url: fileUrl,
  //       type: 'application/pdf',
  //       filename: fileName,
  //       failOnCancel: false,
  //     });

  //   } catch (error) {
  //     console.log('PDF generation error:', error);
  //     Alert.alert('Error', 'Failed to generate PDF.');
  //   }
  // };

  const openPhoneModal = item => {
    console.log('Selected item:', selectedEmp);

    if (!item?.PhoneNo) return;

    setSelectedEmp(item); // full employee object
    setSelectedPhone(item.PhoneNo);
    setPhoneModalVisible(true);
  };

  const closePhoneModal = () => {
    setPhoneModalVisible(false);
    setSelectedPhone(null);
  };

  /* ---------- Actions ---------- */
  const openWhatsApp = phone => {
    Linking.openURL(`https://wa.me/91${phone}`);
    closePhoneModal();
  };

  const openSMS = phone => {
    Linking.openURL(`sms:${phone}`);
    closePhoneModal();
  };

  const makeCall = phone => {
    Linking.openURL(`tel:${phone}`);
    closePhoneModal();
  };

  const openInAppChat = async () => {
    try {
      closePhoneModal();

      const userStr = await AsyncStorage.getItem('UserData');
      if (!userStr) {
        Alert.alert('Error', 'User not logged in');
        return;
      }

      const user = JSON.parse(userStr);
      const myEmployeeId = user.IDEmployee.toString();
      const receiverEmployeeId = selectedEmp.IDEmployee.toString();

      // 🚫 PREVENT SELF CHAT
      if (myEmployeeId === receiverEmployeeId) {
        Alert.alert('Not Allowed', 'You cannot chat with yourself.');
        return;
      }

      // 🔐 Firebase login (on demand)
      await firebaseChatLogin(myEmployeeId);

      // 🚀 Navigate to chat screen
      navigation.navigate('ChatScreen', {
        receiverId: receiverEmployeeId,
        receiverName: selectedEmp.EmployeeName,
      });
    } catch (err) {
      console.error('Chat Login Error:', err);
      Alert.alert('Chat Error', 'Unable to open chat.');
    }
  };

  // ✅ this return is valid — it's inside the component DashBoard Loader
  if (loading) {
    return (
      <View style={styles.loader}>
        <LottieView
          source={require('../assets/Loading sand clock.json')}
          autoPlay
          loop
          style={{ width: 150, height: 150 }}
        />
        <Text style={styles.loaderText1}>Loading Dashboard...</Text>
      </View>
    );
  }

  const getIDYearIncentive = async businessID => {
    const turl =
      BASE_URL + 'Incentive/Configuration/Year?Businessid=' + businessID;
    console.log('turl', turl);
    var config = {
      method: 'get',
      url: turl,
    };
    axios(config)
      .then(function (response) {
        var count = Object.keys(response.data).length;
        let wtNameArray = [];
        for (var i = 0; i < count; i++) {
          wtNameArray.push({
            //value: response.data[i].Value,
            value: response.data[i].IDYear,
            label: response.data[i].Code,
          });
        }
        setIDyear(wtNameArray);
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };
  const getIDQuarterIncentive = async IDyear => {
    const turl =
      BASE_URL +
      'Incentive/Quarter/List?Businessid=' +
      useBusinessID +
      '&IDYear=' +
      IDyear;
    console.log(turl);
    var config = {
      method: 'get',
      url: turl,
    };
    axios
      .get(turl)
      .then(response => {
        const wtNameArray = response.data.data.map(item => ({
          value: item.IDQuarter,
          label: item.Name,
        }));

        setIDQuarter(wtNameArray);
      })
      .catch(function (error) {
        Alert.alert('Error', error.message);
      });
  };

  const getIncentiveData = IDQuarter => {
    const url =
      BASE_URL +
      'Incentive/Mppl/Incentive/Register?Businessid=' +
      useBusinessID +
      '&EmpNo=' +
      useEmpNo +
      '&IDYear=' +
      useIDyearvalue +
      '&IDQuarter=' +
      IDQuarter;

    console.log(url);

    axios.get(url).then(res => {
      const headers = res.data.data.Headers;
      const productList = res.data.data.Products;

      if (headers.length === 0 && productList.length === 0) {
        setDataFound(false);
        setProducts([]);
      } else {
        setDataFound(true);
        setTotalAmount(headers[0].TotalIncAmount);
        setProducts(productList);
      }
    });
  };

  const CorporateSection = ({
    title,
    subtitle,
    icon,
    actionText,
    onActionPress,
    children,
    style,
  }) => (
    <View style={[styles.corporateSectionCard, style]}>
      <View style={styles.corporateSectionHeader}>
        <View style={styles.corporateSectionTitleWrap}>
          <View style={styles.corporateSectionIconBox}>
            <Feather name={icon} size={17} color="#005696" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.corporateSectionTitle}>{title}</Text>
            {!!subtitle && (
              <Text style={styles.corporateSectionSubtitle}>{subtitle}</Text>
            )}
          </View>
        </View>

        {!!actionText && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onActionPress}
            style={styles.corporateSectionAction}>
            <Text style={styles.corporateSectionActionText}>{actionText}</Text>
            <Feather name="arrow-up-right" size={12} color="#005696" />
          </TouchableOpacity>
        )}
      </View>

      {children}
    </View>
  );

  const CorporateEmptyState = ({ text }) => (
    <View style={styles.corporateEmptyState}>
      <Feather name="inbox" size={22} color="#94A3B8" />
      <Text style={styles.corporateEmptyText}>{text}</Text>
    </View>
  );

  const isModuleNotLoaded = modules.length === 0 && moduleLoadMessage !== '';

  const getModuleConnectionText = () => {
    return moduleLoadMessage;
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingBottom: insets.bottom, // prevents overlap with system navigation bar
      }}>
      <StatusBar backgroundColor="#005696" barStyle="light-content" />
      {salesLoading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#005696" />
          <Text style={styles.Lodertext}>Loading Sale Data....</Text>
        </View>
      )}

      <ScrollView
        style={styles.modernPage}
        contentContainerStyle={styles.modernPageContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.heroCard}>
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />

          <View style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroLabel}>ie.CRM WORKSPACE</Text>
              <Text style={styles.heroTitle} numberOfLines={2}>
                Welcome, {useEmpname || 'User'}
              </Text>
              <Text style={styles.heroSubtitle} numberOfLines={1}>
                {useDesignation || 'Field Force'} • {useDivision || 'Division'}
              </Text>
            </View>

            {profilePicPath ? (
              <Image
                source={{ uri: `${url}/${profilePicPath}` }}
                style={styles.heroAvatar}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.heroAvatarFallback}>
                <Ionicons name="person-outline" size={28} color="#005696" />
              </View>
            )}
          </View>

          <View style={styles.heroBottom}>
            <View style={styles.heroInfoPill}>
              <Feather name="briefcase" size={14} color="#ffffff" />
              <Text style={styles.heroInfoText}>{useBusinessID}</Text>
            </View>

            <View style={styles.heroInfoPill}>
              <Feather
                name={netState?.isConnected ? 'wifi' : 'wifi-off'}
                size={14}
                color="#ffffff"
              />
              <Text style={styles.heroInfoText}>
                {netState?.isConnected ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
        </View>

        {isModuleNotLoaded && (
          <View style={styles.moduleWarningCard}>
            <View style={styles.moduleWarningIconBox}>
              <Feather name="alert-triangle" size={20} color="#B45309" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.moduleWarningTitle}>Service Alert</Text>
              <Text style={styles.moduleWarningMessage}>
                {getModuleConnectionText()}
              </Text>
            </View>
          </View>
        )}

        {!netState.isConnected && (
          <View style={styles.offlineCard}>
            <Feather name="wifi-off" size={18} color="#B91C1C" />
            <Text style={styles.offlineText}>
              No Internet connection. Some dashboard data may not refresh.
            </Text>
          </View>
        )}

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Modules</Text>
              <Text style={styles.sectionSubtitle}>
                {Array.isArray(modules) ? modules.length : 0} available modules
              </Text>
            </View>

            <View style={styles.sectionIconPill}>
              <Feather name="grid" size={18} color="#005696" />
            </View>
          </View>

          <FlatList
            data={Array.isArray(modules) ? modules : []}
            keyExtractor={(item, index) =>
              `${item?.IDMenu || item?.MainModuleSRL || item?.Module || 'module'}-${index}`
            }
            key={isTablet ? 'module-tablet-5-premium' : 'module-mobile-3-premium'}
            renderItem={renderItem}
            numColumns={isTablet ? 5 : 3}
            scrollEnabled={false}
            contentContainerStyle={styles.moduleList}
            columnWrapperStyle={styles.moduleColumnWrapper}
            ListEmptyComponent={
              <View style={styles.emptyModuleBox}>
                <Feather name="inbox" size={24} color="#94A3B8" />
                <Text style={styles.emptyModuleText}>No module available</Text>
              </View>
            }
          />
        </View>
      </ScrollView>


      <View
        style={styles.dashboardSwipeEdgeRight}
        {...dashboardTabSwipeResponder.panHandlers}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={openDashboardTab}
          style={styles.dashboardSwipePillRight}>
          <Feather name="chevrons-left" size={17} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {isDashboardTabOpen && (
        <View style={styles.dashboardTabLayer} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.dashboardTabBackdrop,
              { opacity: dashboardTabBackdropOpacity },
            ]}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={closeDashboardTab}
            />
          </Animated.View>

          <Animated.View
            {...dashboardTabCloseResponder.panHandlers}
            style={[
              styles.dashboardTabPanel,
              {
                width: dashboardTabWidth,
                transform: [{ translateX: dashboardTabTranslateX }],
              },
            ]}>
            <View style={styles.dashboardTabHeader}>
              <View>
                <Text style={styles.dashboardTabLabel}>Dashboard</Text>
                <Text style={styles.dashboardTabTitle}>Insights & Activity</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={closeDashboardTab}
                style={styles.dashboardTabCloseBtn}>
                <Feather name="x" size={18} color="#005696" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.dashboardTabContent}>

              {/* MOVE YOUR EXISTING LATER PAGE CONTENT HERE */}

              <View style={styles.pendingVisitCard}>
                <View style={styles.pendingIconBox}>
                  <Feather name="clock" size={20} color="#005696" />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.pendingTitle}>Pending Visits</Text>
                  <Text style={styles.pendingSubtitle}>
                    You have pending visits this week
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => Alert.alert('Notice', 'Quick Access is coming Soon .')}
                  style={styles.visitNowButton}>
                  <Text style={styles.visitNowText}>Visit Now</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.metricGridCompact}>
                <DashboardCard
                  title="RCPA AVG"
                  count={avgDashboardData.RCPAAvg}
                  icon="activity"
                />

                <DashboardCard
                  title="POB"
                  count={avgDashboardData.POB}
                  icon="shopping-bag"
                />

                <DashboardCard
                  title="DCR Doctor"
                  count={todayDashboardData.DCRDoctors}
                  icon="users"
                />

                <DashboardCard
                  title="DCR Party"
                  count={todayDashboardData.DCRParties}
                  icon="shopping-cart"
                />

                <DashboardCard
                  title="DCA"
                  count={avgDashboardData.DCall}
                  icon="pie-chart"
                />

                <DashboardCard
                  title="RCA"
                  count={avgDashboardData.RCall}
                  icon="bar-chart-2"
                />
              </View>

              {/* 
          Paste your existing:
          - Doctor Visit Frequency
          - Party Visit Frequency
          - Achievement
          - Incentive
          - Notice Board
          - Birthday
          - Team section
          here.
        */}


              {/* Keep your existing chart, achievement, incentive, notice board, birthday, team, and modal sections below this */}
              {/* <ScrollView
          style={{flex: 1, paddingHorizontal: 10}}
          contentContainerStyle={{paddingBottom: 30}}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }> */}
              <View style={styles.dashboardCorporateBody}>
                {DoctorVisitFrequency.length > 0 && (
                  <>
                    <View style={styles.visitChartStableCard}>
                      <View style={styles.visitChartHeader}>
                        <View style={styles.visitChartTitleWrap}>
                          <View style={styles.visitChartIconBox}>
                            <Feather name="bar-chart-2" size={17} color="#005696" />
                          </View>

                          <View style={{ flex: 1 }}>
                            <Text style={styles.visitChartTitle}>Doctor Visit Frequency</Text>
                            <Text style={styles.visitChartSubtitle}>Day-wise visit trend</Text>
                          </View>
                        </View>
                      </View>

                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.visitChartScroll}>
                        <View style={styles.visitChartBox}>
                          <BarChart
                            data={barData}
                            barWidth={22}
                            spacing={12}
                            initialSpacing={8}
                            showValuesOnTopOfBars={true}
                            roundedTop
                            showGradient
                            isAnimated={false}
                            noOfSections={5}
                            maxValue={50}
                            height={220}
                            width={Math.max(dashboardTabWidth - 70, 320)}
                            yAxisColor="#D8E5EF"
                            xAxisColor="#D8E5EF"
                            xAxisLabelTextStyle={styles.corporateAxisLabel}
                            yAxisTextStyle={styles.corporateYAxisLabel}
                          />
                        </View>
                      </ScrollView>
                    </View>

                    <View style={styles.visitChartStableCard}>
                      <View style={styles.visitChartHeader}>
                        <View style={styles.visitChartTitleWrap}>
                          <View style={styles.visitChartIconBox}>
                            <Feather name="trending-up" size={17} color="#005696" />
                          </View>

                          <View style={{ flex: 1 }}>
                            <Text style={styles.visitChartTitle}>Party Visit Frequency</Text>
                            <Text style={styles.visitChartSubtitle}>
                              Retailer / party visit trend
                            </Text>
                          </View>
                        </View>
                      </View>

                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.visitChartScroll}>
                        <View style={styles.visitChartBox}>
                          <BarChart
                            data={chartDataretailer}
                            barWidth={22}
                            spacing={12}
                            initialSpacing={8}
                            showValuesOnTopOfBars={true}
                            roundedTop
                            showGradient
                            isAnimated={false}
                            noOfSections={5}
                            maxValue={100}
                            height={220}
                            width={Math.max(dashboardTabWidth - 70, 320)}
                            yAxisColor="#D8E5EF"
                            xAxisColor="#D8E5EF"
                            xAxisLabelTextStyle={styles.corporateAxisLabel}
                            yAxisTextStyle={styles.corporateYAxisLabel}
                          />
                        </View>
                      </ScrollView>
                    </View>
                  </>
                )}

                <View style={styles.achievementCorporateCard}>
                  <View style={styles.achievementCorporateHeader}>
                    <View style={styles.achievementCorporateTitleWrap}>
                      <View style={styles.achievementCorporateIconBox}>
                        <Feather name="pie-chart" size={17} color="#005696" />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.achievementCorporateTitle}>Achievement</Text>
                        <Text style={styles.achievementCorporateSubtitle}>
                          {viewType} sales performance
                        </Text>
                      </View>
                    </View>

                    <Dropdown
                      style={styles.achievementDropdownStable}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      data={dropdownOptions}
                      labelField="label"
                      valueField="value"
                      value={viewType}
                      onChange={item => {
                        setViewType(item.value);
                      }}
                    />
                  </View>

                  <View style={styles.achievementSummaryRow}>
                    <View style={styles.achievementPercentBox}>
                      <Text style={styles.achievementPercentText}>{achievement || 0}%</Text>
                      <Text style={styles.achievementPercentLabel}>Achievement</Text>
                    </View>

                    <View style={styles.achievementAmountBox}>
                      <Text style={styles.achievementAmountLabel}>Sales Value</Text>
                      <Text style={styles.achievementAmountValue}>
                        ₹ {Number(saleData?.achieved || 0).toLocaleString('en-IN')}
                      </Text>

                      <View style={styles.achievementAmountDivider} />

                      <Text style={styles.achievementAmountLabel}>Target Value</Text>
                      <Text style={styles.achievementTargetValue}>
                        ₹ {Number(saleData?.target || 0).toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.achievementPieStableArea}>
                    <PieChart
                      donut
                      innerRadius={105}
                      radius={132}
                      data={pieData}
                      isAnimated={false}
                      centerLabelComponent={() => (
                        <View style={styles.achievementPieCenter}>
                          <Text style={styles.achievementPieCenterValue}>
                            {achievement || 0}%
                          </Text>
                          <Text style={styles.achievementPieCenterText}>Done</Text>
                        </View>
                      )}
                    />
                  </View>

                  <View style={styles.achievementLegendStable}>
                    <View style={styles.achievementLegendItem}>
                      <View style={[styles.achievementLegendDot, { backgroundColor: '#58D68D' }]} />
                      <Text style={styles.achievementLegendText}>Sales Value</Text>
                    </View>

                    <View style={styles.achievementLegendItem}>
                      <View style={[styles.achievementLegendDot, { backgroundColor: '#2E86DE' }]} />
                      <Text style={styles.achievementLegendText}>Target Value</Text>
                    </View>
                  </View>
                </View>

                {showMPPLData ? (
                  <CorporateSection
                    title="Incentive"
                    subtitle="Quarter-wise incentive summary"
                    icon="award">
                    <Dropdown
                      style={styles.corporateDropdown}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      inputSearchStyle={styles.inputSearchStyle}
                      iconStyle={styles.iconStyle}
                      data={useIDyear}
                      search
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      placeholder={!isFocus ? 'Select Year' : '...'}
                      searchPlaceholder="Search"
                      onFocus={() => setIsFocus(true)}
                      onBlur={() => setIsFocus(false)}
                      onChange={item => {
                        setIDyearValue(item.value);
                        setIsFocus(false);
                        getIDQuarterIncentive(item.value);
                      }}
                    />

                    <Dropdown
                      style={[styles.corporateDropdown, { marginTop: 10 }]}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      inputSearchStyle={styles.inputSearchStyle}
                      iconStyle={styles.iconStyle}
                      data={useIDQuarter}
                      search
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      placeholder={!isFocus ? 'Select Quarter' : '...'}
                      searchPlaceholder="Search"
                      onFocus={() => setIsFocus(true)}
                      onBlur={() => setIsFocus(false)}
                      onChange={item => {
                        setIDQuarterValue(item.value);
                        setIsFocus(false);
                        getIncentiveData(item.value);
                      }}
                    />

                    {!dataFound ? (
                      <CorporateEmptyState text="No incentive data found" />
                    ) : (
                      <>
                        <View style={styles.incentiveSummaryCard}>
                          <View>
                            <Text style={styles.incentiveLabel}>Total Incentive</Text>
                            <Text style={styles.incentiveValue}>₹ {totalAmount || 0}</Text>
                          </View>

                          <View style={styles.incentiveIconBox}>
                            <Feather name="trending-up" size={20} color="#67BC45" />
                          </View>
                        </View>

                        <TouchableOpacity
                          activeOpacity={0.85}
                          style={styles.corporatePrimaryButton}
                          onPress={() => setIncentiveModalVisible(true)}>
                          <Text style={styles.corporatePrimaryButtonText}>View Incentive</Text>
                          <Feather name="arrow-right" size={15} color="#FFFFFF" />
                        </TouchableOpacity>
                      </>
                    )}
                  </CorporateSection>
                ) : null}

                <CorporateSection
                  title="Notice Board"
                  subtitle="Latest announcements"
                  icon="send"
                  actionText="See All"
                  onActionPress={() =>
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'NoticeBoardList' }],
                    })
                  }>
                  <FlatList
                    data={noticeboard}
                    keyExtractor={item => item.IDNotice.toString()}
                    renderItem={({ item }) => <NoticeBoardRenderItem item={item} />}
                    scrollEnabled={false}
                    contentContainerStyle={{ paddingBottom: 4 }}
                    ListEmptyComponent={<CorporateEmptyState text="No notice available" />}
                  />
                </CorporateSection>

                <CorporateSection
                  title="Upcoming Birthdays"
                  subtitle="Team celebrations"
                  icon="gift"
                  actionText="See All"
                  onActionPress={() => navigation.navigate('BirthDay List')}>
                  <FlatList
                    data={Array.isArray(birthdays) ? birthdays : []}
                    keyExtractor={(item, index) =>
                      `${item.IDEmployee || item.EmployeeNo || item.Employee || 'birthday'}-${item.DOB || item.FormattedDOB || ''
                      }-${index}`
                    }
                    renderItem={BirthdayRenderItem}
                    scrollEnabled={false}
                    contentContainerStyle={{ paddingBottom: 4 }}
                    ListEmptyComponent={<CorporateEmptyState text="No birthday available" />}
                  />
                </CorporateSection>

                <View style={styles.teamStableCard}>
                  <View style={styles.teamStableHeader}>
                    <View style={styles.teamStableTitleWrap}>
                      <View style={styles.teamStableIconBox}>
                        <Feather name="users" size={17} color="#005696" />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.teamStableTitle}>Team</Text>
                        <Text style={styles.teamStableSubtitle}>
                          {filteredMyTeam.length || 0} employees found
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.corporateSearchBox}>
                    <Ionicons name="search" size={18} color="#7A8CA0" />

                    <TextInput
                      style={styles.corporateSearchInput}
                      placeholder="Search employee, division, manager"
                      placeholderTextColor="#94A3B8"
                      value={searchQuery}
                      onChangeText={handleSearch}
                    />
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    nestedScrollEnabled>
                    <View style={styles.corporateTable}>
                      <View style={styles.corporateTableHeader}>
                        <Text style={[styles.corporateHeaderCell, { width: 105 }]}>Emp No</Text>
                        <Text style={[styles.corporateHeaderCell, { width: 175 }]}>Employee</Text>
                        <Text style={[styles.corporateHeaderCell, { width: 130 }]}>Phone</Text>
                        <Text style={[styles.corporateHeaderCell, { width: 120 }]}>Work</Text>
                        <Text style={[styles.corporateHeaderCell, { width: 105 }]}>Division</Text>
                        <Text style={[styles.corporateHeaderCell, { width: 145 }]}>
                          Designation
                        </Text>
                        <Text style={[styles.corporateHeaderCell, { width: 170 }]}>Manager</Text>
                      </View>

                      <FlatList
                        data={paginatedData}
                        keyExtractor={(item, index) =>
                          `${item?.IDEmployee || item?.EmployeeNo || 'team'}-${index}`
                        }
                        renderItem={renderTeamRow}
                        scrollEnabled={false}
                        removeClippedSubviews={false}
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                        ListEmptyComponent={<CorporateEmptyState text="No team data found" />}
                      />
                    </View>
                  </ScrollView>

                  <View style={styles.corporatePagination}>
                    <TouchableOpacity
                      disabled={currentPage === 0}
                      onPress={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                      style={[
                        styles.paginationBtn,
                        currentPage === 0 && styles.paginationBtnDisabled,
                      ]}>
                      <Feather name="chevron-left" size={15} color="#FFFFFF" />
                      <Text style={styles.paginationBtnText}>Previous</Text>
                    </TouchableOpacity>

                    <Text style={styles.paginationText}>
                      Page {currentPage + 1} of{' '}
                      {Math.max(Math.ceil(filteredMyTeam.length / itemsPerPage), 1)}
                    </Text>

                    <TouchableOpacity
                      disabled={(currentPage + 1) * itemsPerPage >= filteredMyTeam.length}
                      onPress={() => setCurrentPage(prev => prev + 1)}
                      style={[
                        styles.paginationBtn,
                        (currentPage + 1) * itemsPerPage >= filteredMyTeam.length &&
                        styles.paginationBtnDisabled,
                      ]}>
                      <Text style={styles.paginationBtnText}>Next</Text>
                      <Feather name="chevron-right" size={15} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>


              </View>



            </ScrollView>
          </Animated.View>
        </View>
      )}






      <Modal
        transparent={true}
        animationType="fade"
        visible={isModalVisible}
        onRequestClose={toggleModal}>
        <View style={styles.alertModalOverlay}>
          <View style={styles.alertModalContainer}>
            {/* <View style={styles.iconContainer}>
                    <Text style={styles.errorIcon}>✖</Text>
                  </View>
                  <Text style={styles.modalTitle}>Error</Text> */}
            <Text style={styles.modalMessage}>
              {useModalMessage}.Go to Reports and clear your pending DCR.
            </Text>
            <TouchableOpacity onPress={toggleModal} style={styles.okButton}>
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <ProgressDialog visible={loading} message="Please Wait..." />
      {/* 🟢 ChatBot Icon Floating */}
      <TouchableOpacity
        style={[styles.chatIcon, { bottom: insets.bottom + 14 }]}
        onPress={() => setChatVisible(true)}>
        <AntDesign name="message1" size={28} color="#005696" />
      </TouchableOpacity>
      {/* 💬 ChatBot Modal */}
      <Modal
        visible={chatVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setChatVisible(false)}>
        <View style={styles.chatModalWrapper}>
          <View
            style={[
              styles.chatModal,
              { height: isKeyboardVisible ? '80%' : '50%' },
            ]}>
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                🤖 H.A.R.U.
              </Text>
              <TouchableOpacity onPress={() => setChatVisible(false)}>
                <Text style={{ fontSize: 18, color: 'red' }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.chatBox}
              contentContainerStyle={{ paddingBottom: 10 }}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() =>
                scrollViewRef.current?.scrollToEnd({ animated: true })
              }>
              {chatMessages.map((msg, i) => (
                <Text
                  key={i}
                  style={
                    msg.sender === 'user' ? styles.userMsg : styles.botMsg
                  }>
                  {msg.sender === 'user' ? '🧑: ' : '🤖: '}
                  {msg.text}
                </Text>
              ))}
              {isTyping && (
                <Text
                  style={{
                    color: 'gray',
                    fontStyle: 'italic',
                    marginVertical: 8,
                  }}>
                  🤖 H.A.R.U is typing...
                </Text>
              )}
            </ScrollView>

            {/* Input Row */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.chatInput}
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Type a message"
              />
              <TouchableOpacity onPress={handleSendChat} style={styles.sendBtn}>
                <Text style={{ color: 'white' }}>Send</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={startListening} style={styles.micBtn}>
                <Text style={{ color: 'white' }}>
                  {isListening ? '🎙️' : '🎤'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Phone Contact Modal */}
      <Modal
        transparent
        visible={phoneModalVisible}
        animationType="fade"
        onRequestClose={closePhoneModal}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              width: '80%',
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 20,
            }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                marginBottom: 15,
                textAlign: 'center',
              }}>
              Contact Options
            </Text>

            {/* WhatsApp */}
            <Pressable
              onPress={() => openWhatsApp(selectedPhone)}
              style={[
                styles.modalBtn,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}>
              <Icon name="whatsapp" size={18} color="#fff" />
              <Text style={[styles.modalBtnText, { marginLeft: 10 }]}>
                WhatsApp
              </Text>
            </Pressable>

            {/* Chat (SMS) */}
            <Pressable
              onPress={openInAppChat}
              style={[
                styles.modalBtn,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}>
              <Icon name="comment-dots" size={18} color="#fff" />
              <Text style={[styles.modalBtnText, { marginLeft: 10 }]}>Chat</Text>
            </Pressable>

            {/* Phone */}
            <Pressable
              onPress={() => makeCall(selectedPhone)}
              style={[
                styles.modalBtn,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}>
              <Icon name="phone-alt" size={16} color="#fff" />
              <Text style={[styles.modalBtnText, { marginLeft: 10 }]}>
                Phone Call
              </Text>
            </Pressable>

            {/* Cancel */}
            <Pressable
              onPress={closePhoneModal}
              style={[
                styles.modalBtn,
                {
                  backgroundColor: '#fc5a5aff',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}>
              <Icon name="times" size={16} color="#fff" />
              <Text style={{ color: '#fff', marginLeft: 10 }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Visit Details Modal*/}
      <Modal
        visible={visitDetailsModalVisible}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalOverlay1}>
          <View style={styles.modalContainer1}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Visit Details</Text>
                <Text style={styles.modalSubTitle}>
                  {selectedEmp?.EmployeeName}
                </Text>
              </View>

              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={shareVisitPDF}
                  style={styles.shareButton}
                  activeOpacity={0.85}>
                  <Feather name="share-2" size={16} color="#fff" />
                  <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setVisitDetailsModalVisible(false)}
                  style={styles.closeButton}>
                  <Feather name="x" size={18} color="#005696" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Summary Count */}
            {reportCount && (
              <>
                <View style={styles.summaryBox}>
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>
                      {reportCount.DoctorCount}
                    </Text>
                    <Text style={styles.summaryLabel}>Doctors</Text>
                  </View>

                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>
                      {reportCount.RetailerCount}
                    </Text>
                    <Text style={styles.summaryLabel}>Retailers</Text>
                  </View>
                </View>

                <View style={styles.summaryBox}>
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>
                      {reportCount.RetailerMissedcallCount}
                    </Text>
                    <Text style={styles.summaryLabel}>Missed Calls</Text>
                  </View>

                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>
                      {reportCount.RCPACount}
                    </Text>
                    <Text style={styles.summaryLabel}>RCPA</Text>
                  </View>
                </View>
              </>
            )}

            {/* Loader */}
            {loadingVisitDetails ? (
              <ActivityIndicator size="large" color="#0E7777" />
            ) : (
              <FlatList
                data={visitReport}
                keyExtractor={item => item.SRL.toString()}
                renderItem={({ item }) => (
                  <View style={styles.visitCard}>
                    <Text style={styles.customerName}>{item.CustomerName}</Text>
                    <Text style={styles.visitInfo}>Area: {item.Area}</Text>
                    <Text style={styles.visitInfo}>Time: {item.VisitTime}</Text>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* ✅ Modal Preview */}
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalContainernotice}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setVisible(false)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          {/* Full Image */}
          <Image
            source={{ uri: noticeurl }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CRMDashBoard;

const styles = StyleSheet.create({



  lottieWrapper: {
    marginTop: 5,
    marginBottom: 10,
    width: width,
    height: 300, // banner height
    overflow: 'hidden', // prevents covering tab
  },
  lottie: {
    width: '100%',
    height: '100%',
  },

  logoWrapper: {
    marginTop: 10,
    alignItems: 'center',
  },
  menu: {
    margin: 10,
    padding: 5,
    width: 150,
    height: 130,
    elevation: 5,
    // iOS SHADOW
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    borderRadius: 5,
  },

  gridView: {
    marginTop: 10,
    flex: 1,
    color: '',
  },
  itemContainer: {
    justifyContent: 'flex-end',
    borderRadius: 5,
    padding: 10,
    height: 150,
  },
  itemName: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  itemCode: {
    fontWeight: '600',
    fontSize: 12,
    color: '#ffffff',
  },

  button: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertModalContainer: {
    width: 300,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 5,
  },
  iconContainer: {
    backgroundColor: '#fbe4e4',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  errorIcon: {
    fontSize: 30,
    color: '#ff5252',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  okButton: {
    backgroundColor: '#00796b',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  okButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  chatIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'transparent', // transparent background
    padding: 15,
    borderRadius: 30,
    borderWidth: 1, // must add border width
    borderColor: '#005696', // correct RN border color
    elevation: 5,
    zIndex: 1000,
  },

  chatModalWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },

  chatModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    //height: '50%',
  },

  chatBox: {
    flex: 1,
    marginVertical: 5,
  },

  userMsg: {
    textAlign: 'right',
    color: '#007aff',
    marginVertical: 4,
  },

  botMsg: {
    textAlign: 'left',
    color: '#34c759',
    marginVertical: 4,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },

  sendBtn: {
    backgroundColor: '#007aff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  micBtn: {
    backgroundColor: '#ff8c00',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 5,
  },
  noData: {
    fontFamily: 'Roboto-BoldItalic',
    fontSize: 18,
    color: '#FF0000',
    textAlign: 'center',
    marginTop: 20,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  dashboardCard: {
    backgroundColor: '#e3f2fd',
    flex: 0.48,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    marginRight: 10,
  },
  titlequickaccess: {
    fontSize: 14,
    // fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  icon: {
    marginTop: 2,
    marginBottom: 4,
  },
  dashboardIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#76796bff',
    marginTop: 2,
    marginRight: 5,
    textAlign: 'center',
  },
  count: {
    fontSize: 24,
    color: '#005696',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  list: {
    justifyContent: 'center',
    gap: 5,
    //columnGap: 10,
    //rowGap: 10,
  },
  moduleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  loaderText1: {
    marginTop: 15,
    fontSize: 14,
    color: '#005696',
    fontFamily: 'Lato-Bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#ffffff',
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  Lodertext: {
    fontSize: 16,
    color: '#005696',
    marginTop: 10,
    fontStyle: 'italic',
    fontWeight: 'bold',
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 35,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#005696', // ⬅️ highlight avatar with border
    alignItems: 'flex-start',
    display: 'flex',
  },
  nameBirthday: {
    fontSize: 14,
    color: '#222',
    marginBottom: 4,
    fontFamily: 'Roboto-Medium',
    flexShrink: 1, // allow shrinking
    flexWrap: 'wrap', // allow wrapping
  },
  detailsBirthday: {
    fontSize: 10,
    color: '#555',
    fontFamily: 'Roboto-Regular',
    flexShrink: 1, // allow shrinking
    flexWrap: 'wrap', // allow wrapping
  },

  info: {
    justifyContent: 'center',
  },
  BirthdayCard: {
    height: height * 0.16, // ≈ 16 % of screen height
    //width: width * 0.9,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
    marginVertical: 12, // ⬅️ More gap between cards
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#444',
  },
  cardContentBirthday: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // instead of "center"
    padding: 10,
    flex: 1,
  },

  infobirthday: {
    //flex: 1,              // ⬅️ let it expand between avatar & button
    justifyContent: 'center',
    marginLeft: 10,
    // marginRight: 10,
    flexShrink: 0.5, // ⬅️ allow shrinking
    marginTop: 15,
    paddingTop: 5,
  },

  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#0E7777', // dark teal like your sample
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 10,
    marginLeft: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  iconContainerBirthday: {
    width: 28,
    height: 28,
    borderRadius: 16,
    backgroundColor: '#25D366', // WhatsApp green
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginLeft: -25,
  },
  whatsappText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },

  noPhoneContainer: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f8d7da',
    marginTop: 10,
    alignItems: 'center', // ⬅️ centers children horizontally
    justifyContent: 'center', // ⬅️ centers children vertically (if you give height)
  },

  noPhoneText: {
    color: '#721c24',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center', // ⬅️ centers multiline text
  },
  noticeCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  headerCell: {
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 8,
    borderRightWidth: 1,
    borderColor: '#ddd',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  cell: {
    padding: 8,
    textAlign: 'center',
    borderRightWidth: 1,
    borderColor: '#eee',
    flexWrap: 'wrap', // ✅ wrap long text
  },
  viewBtn: {
    justifyContent: 'center',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#2563eb',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    marginLeft: 15,
  },
  viewBtnText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
  },
  chartCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    // borderRadius: 12,
    // borderWidth: 1,
    // borderColor: "#dcdcdc",
    // shadowColor: "#000",
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
    margin: 10,
  },
  chartHeaderRow: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 5,
  },
  chartSubtitle: {
    fontSize: 16,
    marginVertical: 10,
    color: '#6c7a93',
  },
  chartDropdown: {
    width: 120,
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  chartLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 15,
  },
  chartLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  chartLegendText: {
    fontSize: 14,
    color: '#333',
  },
  modalBtn: {
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    marginBottom: 10,
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay1: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
  },

  modalContainer1: {
    flex: 0.88,
    backgroundColor: '#ffffff',
    marginHorizontal: 15,
    borderRadius: 18,
    padding: 18,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f5',
    paddingBottom: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#005696',
  },

  modalSubTitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* -------- Summary Section -------- */

  summaryBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: '#f4f8fb',
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: 'center',
  },

  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#005696',
  },

  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },

  /* -------- Visit Cards -------- */

  visitCard: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 2,
  },

  customerName: {
    fontWeight: '700',
    fontSize: 15,
    color: '#111827',
  },

  visitInfo: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 3,
  },

  /* -------- Share Button -------- */

  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#005696',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginRight: 10,
  },

  shareButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 6,
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
  modalContainernotice: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  fullImage: {
    width: '95%',
    height: '80%',
  },

  closeBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  nameCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 8,
  },
  moduleWarningCard: {
    width: '92%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E6',
    borderLeftWidth: 5,
    borderLeftColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 10,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },

  moduleWarningIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  moduleWarningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },

  moduleWarningMessage: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 18,
  },
  nameText: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    textAlign: 'center',
    justifyContent: 'center',
  },
  modernPage: {
    flex: 1,
    backgroundColor: '#EEF7FB',
  },

  modernPageContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 34,
  },

  heroCard: {
    minHeight: 178,
    borderRadius: 30,
    padding: 20,
    backgroundColor: '#005696',
    overflow: 'hidden',
    marginBottom: 16,

    shadowColor: '#005696',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 10,
  },

  heroGlowOne: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 120,
    backgroundColor: 'rgba(103,188,69,0.32)',
    right: -70,
    top: -65,
  },

  heroGlowTwo: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.12)',
    left: -55,
    bottom: -65,
  },

  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },

  heroLabel: {
    color: 'rgba(255,255,255,0.74)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.7,
    //textTransform: 'uppercase',
  },

  heroTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 7,
  },

  heroSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    marginTop: 5,
    fontWeight: '600',
  },

  heroAvatar: {
    width: 58,
    height: 58,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.65)',
  },

  heroAvatarFallback: {
    width: 58,
    height: 58,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroBottom: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 26,
    zIndex: 2,
  },

  heroInfoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },

  heroInfoText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 7,
  },

  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 26,
    padding: 16,
    marginBottom: 16,

    shadowColor: '#003D73',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.09,
    shadowRadius: 20,
    elevation: 5,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 19,
    color: '#16324F',
    fontWeight: '800',
  },

  sectionSubtitle: {
    color: '#7B8A9B',
    fontSize: 12.5,
    marginTop: 4,
    fontWeight: '600',
  },

  sectionIconPill: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: '#E8F2F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D7EAF5',
  },

  moduleList: {
    paddingTop: 2,
    paddingBottom: 4,
  },

  moduleColumnWrapper: {
    justifyContent: 'space-between',
  },

  moduleCardWrap: {
    width: isTablet ? '18.8%' : '31.6%',
    marginBottom: 12,
  },

  moduleCard: {
    minHeight: 118,
    borderRadius: 22,
    paddingHorizontal: 9,
    paddingTop: 13,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6EEF5',
    overflow: 'hidden',

    shadowColor: '#003D73',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },

  moduleAccent: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 72,
    height: 72,
    borderRadius: 40,
    //backgroundColor: 'rgba(9, 95, 224, 0.13)',
  },

  moduleIconOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  moduleIconBox: {
    width: 46,
    height: 46,
    borderRadius: 18,
    backgroundColor: '#EAF4FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D7EAF5',
  },

  moduleTitle: {
    color: '#16324F',
    fontSize: 13.5,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 15,
    minHeight: 30,
  },

  moduleFooter: {
    marginTop: 7,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F8EE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  moduleSubTitle: {
    color: '#67BC45',
    fontSize: 10,
    fontWeight: '800',
    marginRight: 3,
  },

  emptyModuleBox: {
    paddingVertical: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyModuleText: {
    marginTop: 8,
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },

  offlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 18,
    padding: 13,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  offlineText: {
    flex: 1,
    marginLeft: 10,
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '700',
  },

  pendingVisitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 14,
    marginBottom: 16,

    shadowColor: '#003D73',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },

  pendingIconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#E8F2F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  pendingTitle: {
    color: '#16324F',
    fontSize: 15,
    fontWeight: '800',
  },

  pendingSubtitle: {
    color: '#7B8A9B',
    fontSize: 12,
    marginTop: 3,
    fontWeight: '600',
  },

  visitNowButton: {
    backgroundColor: '#005696',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 15,
  },

  visitNowText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },

  metricGridCompact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  compactMetricCard: {
    width: '31.7%',
    minHeight: 92,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#E3EDF5',

    shadowColor: '#003D73',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },

  compactMetricTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  compactMetricIconBox: {
    width: 30,
    height: 30,
    borderRadius: 11,
    backgroundColor: '#EAF4FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  compactMetricDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#67BC45',
  },

  compactMetricCount: {
    color: '#102A43',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },

  compactMetricTitle: {
    color: '#60758A',
    fontSize: 10.5,
    fontWeight: '800',
    marginTop: 3,
    lineHeight: 13,
  },
  dashboardSwipeEdge: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 34,
    zIndex: 50,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  dashboardSwipePill: {
    width: 28,
    height: 78,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: '#005696',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#003D73',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 7,
  },

  dashboardTabLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },

  dashboardTabBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },

  dashboardTabPanel: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#F5F8FB',
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
    overflow: 'hidden',

    shadowColor: '#000000',
    shadowOffset: { width: -8, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 12,
  },

  dashboardTabHeader: {
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E3EDF5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dashboardTabLabel: {
    color: '#67BC45',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  dashboardTabTitle: {
    color: '#102A43',
    fontSize: 19,
    fontWeight: '900',
    marginTop: 3,
  },

  dashboardTabCloseBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#EAF4FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D7EAF5',
  },

  dashboardTabContent: {
    padding: 14,
    paddingBottom: 40,
  },
  dashboardSwipeEdgeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 34,
    zIndex: 50,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },

  dashboardSwipePillRight: {
    width: 28,
    height: 78,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    backgroundColor: '#005696',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#003D73',
    shadowOffset: { width: -4, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 7,
  },
  dashboardCorporateBody: {
    width: '100%',
    paddingBottom: 20,
  },

  corporateSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2EDF5',

    shadowColor: '#003D73',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },

  corporateSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  corporateSectionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  corporateSectionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#EAF4FA',
    borderWidth: 1,
    borderColor: '#D7EAF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  corporateSectionTitle: {
    color: '#102A43',
    fontSize: 15.5,
    fontWeight: '900',
  },

  corporateSectionSubtitle: {
    color: '#7A8CA0',
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 2,
  },

  corporateSectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF4FA',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7EAF5',
    marginLeft: 8,
  },

  corporateSectionActionText: {
    color: '#005696',
    fontSize: 11,
    fontWeight: '900',
    marginRight: 3,
  },

  corporateChartScroll: {
    paddingRight: 8,
  },

  corporateBarChartBox: {
    backgroundColor: '#F8FBFD',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E8F0F6',
  },

  corporateAxisLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
  },

  corporateYAxisLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
  },

  achievementTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  achievementScoreBox: {
    backgroundColor: '#F2F8EE',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#DDF1D5',
  },

  achievementScore: {
    color: '#238848',
    fontSize: 22,
    fontWeight: '900',
  },

  achievementScoreLabel: {
    color: '#6B7C8F',
    fontSize: 10.5,
    fontWeight: '800',
    marginTop: 1,
  },

  corporateDropdownSmall: {
    width: 120,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F8FBFD',
    borderWidth: 1,
    borderColor: '#DCE8F1',
    paddingHorizontal: 10,
  },

  achievementChartBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },

  pieCenterLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  pieCenterValue: {
    color: '#102A43',
    fontSize: 20,
    fontWeight: '900',
  },

  pieCenterText: {
    color: '#7A8CA0',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 1,
  },

  corporateLegendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    marginTop: 8,
  },

  corporateLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  corporateLegendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 6,
  },

  corporateLegendText: {
    color: '#60758A',
    fontSize: 11,
    fontWeight: '800',
  },

  corporateDropdown: {
    height: 46,
    borderRadius: 15,
    backgroundColor: '#F8FBFD',
    borderWidth: 1,
    borderColor: '#DCE8F1',
    paddingHorizontal: 12,
  },

  incentiveSummaryCard: {
    marginTop: 12,
    backgroundColor: '#F2F8EE',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DDF1D5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  incentiveLabel: {
    color: '#60758A',
    fontSize: 11.5,
    fontWeight: '800',
  },

  incentiveValue: {
    color: '#238848',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 3,
  },

  incentiveIconBox: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  corporatePrimaryButton: {
    marginTop: 12,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#005696',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  corporatePrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    marginRight: 7,
  },

  corporateNoticeCard: {
    backgroundColor: '#F8FBFD',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E4EDF3',
    overflow: 'hidden',
    marginBottom: 10,
  },

  corporateNoticeImage: {
    width: '100%',
    height: 135,
  },

  corporateNoticeBody: {
    flexDirection: 'row',
    padding: 12,
  },

  corporateNoticeIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#EAF4FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  corporateNoticeTitle: {
    color: '#102A43',
    fontSize: 13.5,
    fontWeight: '900',
  },

  corporateNoticeText: {
    color: '#60758A',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },

  corporateNoticeMeta: {
    color: '#005696',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 5,
  },

  corporateSearchBox: {
    height: 44,
    borderRadius: 15,
    backgroundColor: '#F8FBFD',
    borderWidth: 1,
    borderColor: '#DCE8F1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 12,
  },

  corporateSearchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#102A43',
    fontSize: 13,
    fontWeight: '700',
    paddingVertical: 8,
  },

  corporateTable: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2EDF5',
    backgroundColor: '#FFFFFF',
  },

  corporateTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#EAF4FA',
    borderBottomWidth: 1,
    borderBottomColor: '#D7EAF5',
  },

  corporateHeaderCell: {
    paddingVertical: 11,
    paddingHorizontal: 10,
    color: '#005696',
    fontSize: 11,
    fontWeight: '900',
  },

  corporateTableRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF3F7',
  },

  corporateCell: {
    minHeight: 48,
    paddingVertical: 10,
    paddingHorizontal: 10,
    color: '#475569',
    fontSize: 11.5,
    fontWeight: '700',
    justifyContent: 'center',
  },

  corporateNameCell: {
    minHeight: 48,
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  corporateNameText: {
    color: '#102A43',
    fontSize: 11.8,
    fontWeight: '900',
    flex: 1,
  },

  corporatePhoneText: {
    color: '#005696',
    fontSize: 11.5,
    fontWeight: '900',
  },

  corporateViewBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF4FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7EAF5',
  },

  corporateViewBtnText: {
    color: '#005696',
    fontSize: 11,
    fontWeight: '900',
  },

  corporatePagination: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  paginationBtn: {
    minHeight: 36,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: '#005696',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  paginationBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },

  paginationBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    marginHorizontal: 3,
  },

  paginationText: {
    color: '#60758A',
    fontSize: 11.5,
    fontWeight: '800',
  },

  corporateEmptyState: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  corporateEmptyText: {
    color: '#94A3B8',
    fontSize: 12.5,
    fontWeight: '800',
    marginTop: 7,
  },
  achievementCorporateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2EDF5',

    shadowColor: '#003D73',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },

  achievementCorporateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  achievementCorporateTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  achievementCorporateIconBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#EAF4FA',
    borderWidth: 1,
    borderColor: '#D7EAF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  achievementCorporateTitle: {
    color: '#102A43',
    fontSize: 15.5,
    fontWeight: '900',
  },

  achievementCorporateSubtitle: {
    color: '#7A8CA0',
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 2,
  },

  achievementDropdownStable: {
    width: 112,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F8FBFD',
    borderWidth: 1,
    borderColor: '#DCE8F1',
    paddingHorizontal: 10,
    marginLeft: 8,
  },

  achievementSummaryRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },

  achievementPercentBox: {
    width: 105,
    backgroundColor: '#F2F8EE',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDF1D5',
    justifyContent: 'center',
  },

  achievementPercentText: {
    color: '#238848',
    fontSize: 25,
    fontWeight: '900',
    lineHeight: 30,
  },

  achievementPercentLabel: {
    color: '#60758A',
    fontSize: 10.5,
    fontWeight: '800',
    marginTop: 2,
  },

  achievementAmountBox: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: '#F8FBFD',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E4EDF3',
  },

  achievementAmountLabel: {
    color: '#7A8CA0',
    fontSize: 10.5,
    fontWeight: '800',
  },

  achievementAmountValue: {
    color: '#102A43',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },

  achievementTargetValue: {
    color: '#005696',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },

  achievementAmountDivider: {
    height: 1,
    backgroundColor: '#E2EDF5',
    marginVertical: 8,
  },

  achievementPieStableArea: {
    width: '100%',
    height: 285,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  achievementPieCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  achievementPieCenterValue: {
    color: '#102A43',
    fontSize: 22,
    fontWeight: '900',
  },

  achievementPieCenterText: {
    color: '#7A8CA0',
    fontSize: 10.5,
    fontWeight: '800',
    marginTop: 2,
  },

  achievementLegendStable: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },

  achievementLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },

  achievementLegendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 6,
  },

  achievementLegendText: {
    color: '#60758A',
    fontSize: 11,
    fontWeight: '800',
  },
  visitChartStableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2EDF5',

    shadowColor: '#003D73',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },

  visitChartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  visitChartTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  visitChartIconBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#EAF4FA',
    borderWidth: 1,
    borderColor: '#D7EAF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  visitChartTitle: {
    color: '#102A43',
    fontSize: 15.5,
    fontWeight: '900',
  },

  visitChartSubtitle: {
    color: '#7A8CA0',
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 2,
  },

  visitChartScroll: {
    paddingRight: 8,
  },

  visitChartBox: {
    height: 265,
    backgroundColor: '#F8FBFD',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E8F0F6',
    overflow: 'hidden',
  },

  chartTopLabel: {
    color: '#005696',
    fontSize: 11,
    fontWeight: '900',
  },

  teamStableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2EDF5',

    shadowColor: '#003D73',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },

  teamStableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  teamStableTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  teamStableIconBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#EAF4FA',
    borderWidth: 1,
    borderColor: '#D7EAF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  teamStableTitle: {
    color: '#102A43',
    fontSize: 15.5,
    fontWeight: '900',
  },

  teamStableSubtitle: {
    color: '#7A8CA0',
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 2,
  },
});
