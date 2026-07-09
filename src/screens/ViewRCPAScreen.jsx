import {
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    FlatList,
    StatusBar,
    BackHandler,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import React, {
    useCallback,
    useEffect,
    useState,
    useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BASE_URL } from '@env';
import LottieView from 'lottie-react-native';
import NetInfo from '@react-native-community/netinfo';

const ViewRCPAScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [rcpaList, setRcpaList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [isOnline, setIsOnline] = useState(true);
    const [search, setSearch] = useState('');
    const [userData, setUserData] = useState(null);

    const hasFetchedOnce = useRef(false);

    const toggleExpand = (id) => {
        setExpandedId(prev => (prev === id ? null : id));
    };

    /* ---------- BACK HANDLER ---------- */
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                navigation.navigate('AppNavDCRScreen');
                return true;
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () =>
                BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [navigation]),
    );

    /* ---------- NETINFO (STATE ONLY) ---------- */
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const connected =
                state.isConnected === true &&
                state.isInternetReachable !== false;

            setIsOnline(connected);
        });

        return () => unsubscribe();
    }, []);

    /* ---------- SINGLE API TRIGGER ---------- */
    useEffect(() => {
        if (!isOnline) return;

        if (!hasFetchedOnce.current) {
            hasFetchedOnce.current = true;
            loadUserAndFetchRCPA();
        }
    }, [isOnline]);

    const loadUserAndFetchRCPA = async () => {
        try {
            setLoading(true);

            const storedUser = await AsyncStorage.getItem('UserData');
            if (!storedUser) return;

            const parsedUser = JSON.parse(storedUser);
            setUserData(parsedUser);

            const employeeId = parsedUser.IDEmployee;
            const businessId = parsedUser.BusinessID?.trim();

            await fetchRCPADetails(employeeId, businessId);
        } catch (error) {
            console.log('User Load Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRCPADetails = async (employeeId, businessId) => {
        try {
            const url = `${BASE_URL}RCPA/RCPADailyDetail?IDEmployee=${employeeId}&Businessid=${businessId}`;
            console.log('Fetching RCPA from URL:', url);
            const response = await axios.get(url);

            if (Array.isArray(response.data)) {
                setRcpaList(response.data);
                setFilteredList(response.data);
            } else {
                setRcpaList([]);
                setFilteredList([]);
            }
        } catch (error) {
            console.log('RCPA API Error:', error);
            setRcpaList([]);
            setFilteredList([]);
        }
    };

    /* ---------- SEARCH ---------- */
    const onSearch = (text) => {
        setSearch(text);

        if (!text) {
            setFilteredList(rcpaList);
            return;
        }

        const q = text.toLowerCase();
        const filtered = rcpaList.filter(item =>
            item.RCPANO?.toLowerCase().includes(q) ||
            item.Retailer?.toLowerCase().includes(q) ||
            item.Area?.toLowerCase().includes(q),
        );

        setFilteredList(filtered);
    };

    /* ---------- PRODUCTS ---------- */
    const renderOwnProducts = (items = []) =>
        items.map((item, index) => (
            <Text key={index} style={styles.subText}>
                • {item.SelfProduct} ({item.SelfProductDoctors})
            </Text>
        ));

    const renderCompProducts = (items = []) =>
        items.map((item, index) => (
            <Text key={index} style={styles.subText}>
                • {item.CompProduct} ({item.CompProductDoctors})
            </Text>
        ));

    /* ---------- LIST ITEM ---------- */
    const renderItem = ({ item }) => {
        const isExpanded = expandedId === item.IDRCPA;

        return (
            <View style={styles.cardCompact}>
                <View style={styles.rowBetween}>
                    <Text style={styles.rcpaNo}>{item.RCPANO}</Text>
                    <Text style={styles.subDate}>{item.RCPADate}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="business-outline" size={14} color="#64748b" />
                    <Text style={styles.infoText}>{item.Retailer}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={14} color="#64748b" />
                    <Text style={styles.infoText}>{item.Area}</Text>
                </View>

                <TouchableOpacity
                    style={styles.detailBtn}
                    onPress={() => toggleExpand(item.IDRCPA)}
                >
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color="#005696"
                    />
                    <Text style={styles.detailText}>
                        {isExpanded ? 'Hide' : 'Details'}
                    </Text>
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.expandBox}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="cube-outline" size={15} color="#005696" />
                            <Text style={styles.sectionTitle}>Own Products</Text>
                        </View>
                        {renderOwnProducts(item.OwnProductDetails)}

                        <View style={styles.sectionHeader}>
                            <Ionicons name="briefcase-outline" size={15} color="#b91c1c" />
                            <Text style={[styles.sectionTitle, { color: '#b91c1c' }]}>
                                Competitor Products
                            </Text>
                        </View>
                        {renderCompProducts(item.CompProductDetails)}
                    </View>
                )}
            </View>
        );
    };

    /* ---------- UI ---------- */
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />

            {/* SEARCH */}
            <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={18} color="#64748b" />
                <TextInput
                    placeholder="Search RCPA / Retailer / Area"
                    value={search}
                    onChangeText={onSearch}
                    style={styles.searchInput}
                />
            </View>

            {!isOnline ? (
                <Text style={styles.offlineText}>
                    You are offline. Please connect to the internet to view RCPA data.
                </Text>
            ) : loading ? (
                <View style={styles.loaderContainer}>
                    <LottieView
                        source={require('../assets/Loading animation blue.json')}
                        autoPlay
                        loop
                        style={{ width: 150, height: 150 }}
                    />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            ) : filteredList.length === 0 ? (
                <Text style={styles.empty}>No RCPA data found</Text>
            ) : (
                <FlatList
                    data={filteredList}
                    keyExtractor={(item) => item.IDRCPA.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </SafeAreaView>
    );
};

export default ViewRCPAScreen;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f7fb',
    },
    /* ---------- LIST CARD ---------- */
    cardCompact: {
        backgroundColor: '#fff',
        marginHorizontal: 12,
        marginTop: 10,
        borderRadius: 10,
        padding: 12,
        elevation: 2,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    subDate: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },

    detailBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#cfe3f1',
        backgroundColor: '#f1f7fc',
        marginTop: 10,
    },

    detailText: {
        fontSize: 12,
        marginLeft: 4,
        color: '#005696',
        fontWeight: '600',
    },

    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },

    infoText: {
        fontSize: 13,
        color: '#1e293b',
        marginLeft: 6,
        flex: 1,
    },

    expandBox: {
        marginTop: 10,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },

    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 6,
        color: '#005696',
    },

    /* ---------- TEXT ---------- */
    label: {
        marginTop: 10,
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
    },
    value: {
        fontSize: 14,
        color: '#1e293b',
        marginTop: 2,
    },

    subText: {
        fontSize: 13,
        color: '#334155',
        marginLeft: 8,
        marginTop: 2,
    },
    rcpaNo: {
        fontSize: 16,
        fontWeight: '700',
        color: '#005696',
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

    /* ---------- STATES ---------- */
    empty: {
        textAlign: 'center',
        marginTop: 40,
        color: '#64748b',
        fontSize: 14,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 12,
        paddingHorizontal: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },

    searchInput: {
        flex: 1,
        marginLeft: 6,
        fontSize: 14,
        color: '#1e293b',
    },

    offlineText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 14,
        color: '#b91c1c',
        paddingHorizontal: 20,
    },

});
