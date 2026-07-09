import {
    View,
    Text,
    StatusBar,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView, Animated, Easing, BackHandler,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '@env';
import { Dropdown } from 'react-native-element-dropdown';
import KeyboardAwareLayout from '../components/custom/KeyboardAwareLayout';
import LottieView from 'lottie-react-native';

const PreCallAnalysis = ({ navigation }) => {
    const [selectedType, setSelectedType] = useState(null);
    const [loading, setLoading] = useState(false);
    const [customerList, setCustomerList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [searchText, setSearchText] = useState('');

    const [businessID, setBusinessID] = useState('');
    const [employeeID, setEmployeeID] = useState('');

    const [customerDetails, setCustomerDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const [visitDates, setVisitDates] = useState([]);
    const [visitLoading, setVisitLoading] = useState(false);

    const [activeTab, setActiveTab] = useState('DETAILS'); // DETAILS or VISITS
    const tabAnim = useState(new Animated.Value(0))[0]; // 0 = DETAILS, 1 = VISITS


    const dropdownData = [
        { label: 'DOCTOR', value: 'DOCTOR' },
        { label: 'RETAILER', value: 'RETAILER' }
    ];

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


    useEffect(() => {
        const fetchData = async () => {
            try {
                const value = await AsyncStorage.getItem('UserData');
                if (value) {
                    const user = JSON.parse(value);
                    setBusinessID(user.BusinessID);
                    setEmployeeID(user.IDEmployee);

                    if (selectedType) {
                        setLoading(true);
                        const url = `${BASE_URL}DCR/EmployeeWiseCustomerList?Businessid=${user.BusinessID}&IDEmployee=${user.IDEmployee}&Type=${selectedType}`;
                        const response = await axios.get(url);

                        if (response.data?.d) {
                            setCustomerList(response.data.d);
                            setFilteredList([]); // hide until typing
                            setSearchText('');
                            setCustomerDetails(null);
                            setVisitDates([]);
                        } else {
                            setCustomerList([]);
                            setFilteredList([]);
                        }
                    }
                }
            } catch (error) {
                console.log('Error:', error);
                setCustomerList([]);
                setFilteredList([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedType]);

    const handleSearch = text => {
        setSearchText(text);
        if (text.length === 0) {
            setFilteredList([]);
        } else {
            const filtered = customerList.filter(item =>
                item.Customer.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredList(filtered);
        }
    };

    const handleSelectCustomer = async item => {
        setSearchText(item.Customer);
        setFilteredList([]);
        setActiveTab('DETAILS'); // reset to details tab
        tabAnim.setValue(0);

        // 1️⃣ Customer Details
        try {
            setDetailsLoading(true);
            const detailsUrl = `${BASE_URL}DCR/CustomerDetails?Businessid=${businessID}&CustomerType=${selectedType}&IDCustomer=${item.IDCustomer}`;
            console.log('Fetching Customer Details from URL:', detailsUrl);
            const detailsResponse = await axios.get(detailsUrl);
            if (detailsResponse.data?.d && detailsResponse.data.d.length > 0) {
                setCustomerDetails(detailsResponse.data.d[0]);
            } else {
                setCustomerDetails(null);
            }
        } catch (error) {
            console.log('Error fetching customer details:', error);
            setCustomerDetails(null);
        } finally {
            setDetailsLoading(false);
        }

        // 2️⃣ Employee-wise Visit Dates
        try {
            setVisitLoading(true);
            const visitUrl = `${BASE_URL}DCR/EmployeewisevisitDates?Businessid=${businessID}&IDEmployee=${employeeID}&IDCustomer=${item.IDCustomer}`;
            console.log('Fetching Visit Dates from URL:', visitUrl);
            const visitResponse = await axios.get(visitUrl);
            if (Array.isArray(visitResponse.data)) {
                setVisitDates(visitResponse.data);
            } else {
                setVisitDates([]);
            }
        } catch (error) {
            console.log('Error fetching visit dates:', error);
            setVisitDates([]);
        } finally {
            setVisitLoading(false);
        }
    };

    const switchTab = (tab) => {
        setActiveTab(tab);

        Animated.timing(tabAnim, {
            toValue: tab === 'DETAILS' ? 0 : 1,
            duration: 250,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    };

    const COL_MONTH = { flex: 1 };
    const COL_VISITS = { width: 70 };
    const COL_DATES = { flex: 2 };
    const COL_REMARKS = { width: 120 };


    const formatMonthShort = (monthName) => {
        const [month, year] = monthName.split(' ');
        return `${month.substring(0, 3)} ${year.slice(-2)}`;
    };


    const sortedVisitDates = [...visitDates].sort((a, b) => {
        const yearA = parseInt(a.MonthName.split(' ')[1], 10);
        const yearB = parseInt(b.MonthName.split(' ')[1], 10);

        if (yearA !== yearB) {
            return yearB - yearA; // Year DESC
        }

        return b.MonthNumber - a.MonthNumber; // Month DESC
    });


    return (
        <KeyboardAwareLayout>
            <>
                <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />
                <View style={styles.container}>
                    {/* <Text style={styles.heading}>Pre Call Analysis</Text> */}

                    <Dropdown
                        data={dropdownData}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Type"
                        value={selectedType}
                        onChange={item => {
                            setSelectedType(item.value);
                            setSearchText('');
                            setCustomerDetails(null);
                            setVisitDates([]);
                        }}
                        style={styles.dropdown}
                        placeholderStyle={styles.placeholder}
                        selectedTextStyle={styles.selectedText}
                    />

                    {loading && <View style={styles.loader}>
                        <LottieView
                            source={require('../assets/Davsan.json')}
                            autoPlay
                            loop
                            style={{ width: 150, height: 150 }}
                        />
                    </View>}

                    {customerList.length > 0 && (
                        <>
                            <TextInput
                                placeholder={`Search ${selectedType}`}
                                value={searchText}
                                onChangeText={handleSearch}
                                style={styles.searchInput}
                            />

                            {filteredList.length > 0 && (
                                <ScrollView style={styles.searchResults}>
                                    {filteredList.map(item => (
                                        <TouchableOpacity
                                            key={item.IDCustomer}
                                            style={styles.card}
                                            onPress={() => handleSelectCustomer(item)}
                                        >
                                            <Text style={styles.customerName}>{item.Customer}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}
                        </>
                    )}

                    {detailsLoading && <View style={styles.loader}>
                        <LottieView
                            source={require('../assets/Davsan.json')}
                            autoPlay
                            loop
                            style={{ width: 150, height: 150 }}
                        />
                    </View>}

                    {customerDetails && (
                        <>
                            {/* Tabs */}
                            <View style={styles.tabContainer}>

                                {/* Animated Slider */}
                                <Animated.View
                                    style={[
                                        styles.tabSlider,
                                        {
                                            left: tabAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ['0%', '50%'],
                                            })
                                        }
                                    ]}
                                />

                                {/* DETAILS TAB */}
                                <TouchableOpacity
                                    style={styles.tab}
                                    onPress={() => switchTab('DETAILS')}
                                >
                                    <Text style={[
                                        styles.tabText,
                                        activeTab === 'DETAILS' && styles.activeTabText
                                    ]}>
                                        Details
                                    </Text>
                                </TouchableOpacity>

                                {/* VISITS TAB */}
                                <TouchableOpacity
                                    style={styles.tab}
                                    onPress={() => switchTab('VISITS')}
                                >
                                    <Text style={[
                                        styles.tabText,
                                        activeTab === 'VISITS' && styles.activeTabText
                                    ]}>
                                        Visit History
                                    </Text>
                                </TouchableOpacity>
                            </View>


                            {/* Tab Content */}
                            {activeTab === 'DETAILS' && (
                                <View style={styles.detailsCard}>
                                    <Text style={styles.detailText}>
                                        <Text style={{ fontWeight: 'bold' }}>Customer:</Text> {customerDetails.Customer}
                                    </Text>
                                    <Text style={styles.detailText}>
                                        <Text style={{ fontWeight: 'bold' }}>Code:</Text> {customerDetails.Code}
                                    </Text>
                                    <Text style={styles.detailText}>
                                        <Text style={{ fontWeight: 'bold' }}>Other Code:</Text> {customerDetails.OtherCode}
                                    </Text>
                                    <Text style={styles.detailText}>
                                        <Text style={{ fontWeight: 'bold' }}>Speciality:</Text> {customerDetails.Speciality}
                                    </Text>
                                    <Text style={styles.detailText}>
                                        <Text style={{ fontWeight: 'bold' }}>Qualification:</Text> {customerDetails.Qualification}
                                    </Text>
                                    <Text style={styles.detailText}>
                                        <Text style={{ fontWeight: 'bold' }}>Area:</Text> {customerDetails.Area}
                                    </Text>
                                    <Text style={styles.detailText}>
                                        <Text style={{ fontWeight: 'bold' }}>Products:</Text>
                                    </Text>

                                    {customerDetails.Products.split(",").map((item, idx) => (
                                        <Text key={idx} style={{ marginLeft: 15, marginBottom: 3 }}>
                                            <Text style={{ fontWeight: 'bold' }}>{idx + 1}. </Text>
                                            {item.trim()}
                                        </Text>
                                    ))}

                                </View>
                            )}

                            {activeTab === 'VISITS' && (
                                <>
                                    {visitLoading && (
                                        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
                                    )}

                                    {!visitLoading && visitDates.length > 0 && (
                                        <View style={styles.tableContainer}>

                                            {/* HEADER */}
                                            <View style={[styles.tableRow, styles.tableHeader]}>
                                                <Text style={[styles.tableHeaderText, styles.cell, COL_MONTH]}>
                                                    Month
                                                </Text>
                                                <Text style={[styles.tableHeaderText, styles.cell, COL_VISITS]}>
                                                    Visits
                                                </Text>
                                                <Text style={[styles.tableHeaderText, styles.cell, COL_DATES]}>
                                                    Visit Dates
                                                </Text>
                                                <Text style={[styles.tableHeaderText, styles.cell, COL_REMARKS]}>
                                                    Remarks
                                                </Text>
                                            </View>

                                            {/* ROWS */}
                                            {sortedVisitDates.map((month, index) => (
                                                <View
                                                    key={index}
                                                    style={[
                                                        styles.tableRow,
                                                        { backgroundColor: index % 2 === 0 ? "#ffffff" : "#f7faff" }
                                                    ]}
                                                >
                                                    {/* Month */}
                                                    <Text style={[styles.tableCell, styles.cell, COL_MONTH]}>
                                                        {formatMonthShort(month.MonthName)}
                                                    </Text>

                                                    {/* Visit Count */}
                                                    <Text
                                                        style={[
                                                            styles.tableCell,
                                                            styles.cell,
                                                            COL_VISITS,
                                                            { textAlign: "center" }
                                                        ]}
                                                    >
                                                        {month.visitcount}
                                                    </Text>

                                                    {/* Visit Dates */}
                                                    <View style={[styles.tableCell, styles.cell, COL_DATES]}>
                                                        {month.visitDates?.[0]?.visitedDates
                                                            ?.split(",")
                                                            .map((item, idx) => (
                                                                <Text key={idx} style={styles.visitDateText}>
                                                                    <Text style={styles.visitIndex}>{idx + 1}. </Text>
                                                                    {item.trim()}
                                                                </Text>
                                                            ))}
                                                    </View>

                                                    {/* Remarks */}
                                                    <Text style={[styles.tableCell, styles.cell, COL_REMARKS]}>
                                                        {month.Remarks || "- -"}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </>

                            )}

                        </>
                    )}
                </View>
            </>
        </KeyboardAwareLayout>
    );
};

export default PreCallAnalysis;

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
        backgroundColor: '#fff'
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: '#ffffff',
    },
    heading: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20
    },
    dropdown: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10
    },
    placeholder: {
        color: '#999'
    },
    selectedText: {
        color: '#333'
    },
    searchInput: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginTop: 20,
        paddingHorizontal: 10
    },
    searchResults: {
        //maxHeight: 200,
        marginTop: 15,
    },
    card: {
        padding: 12,
        backgroundColor: '#e8f3ff',
        borderRadius: 8,
        marginBottom: 10
    },
    customerName: {
        fontSize: 16
    },
    tabContainer: {
        flexDirection: 'row',
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        position: 'relative',
        overflow: 'hidden',
        height: 45,
    },

    tab: {
        width: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },

    tabSlider: {
        position: 'absolute',
        width: '50%',
        height: '100%',
        backgroundColor: '#005696',
        borderRadius: 10,
        zIndex: 1,
    },

    tabText: {
        fontSize: 15,
        color: '#777',
        fontWeight: '500',
    },

    activeTabText: {
        color: '#fff',
        fontWeight: '600',
    },

    detailsCard: {
        marginTop: 10,
        padding: 16,
        backgroundColor: '#d1f0ff',
        borderRadius: 8
    },
    detailText: {
        fontSize: 15,
        marginBottom: 8
    },
    visitCard: {
        marginTop: 10,
        padding: 16,
        backgroundColor: '#fff2e6',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ffd6b3'
    },
    tableContainer: {
        marginTop: 15,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        overflow: "hidden"
    },

    tableHeader: {
        backgroundColor: "#e6f0ff",
    },

    tableRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },

    cell: {
        padding: 8,
        borderRightWidth: 1,
        borderColor: "#ccc",
    },

    tableHeaderText: {
        fontWeight: "700",
        fontSize: 14,
        padding: 10,
        color: "#003366",
    },

    tableCell: {
        fontSize: 14,
        color: "#5a1111ff",
        padding: 10,
        minHeight: 45,
        justifyContent: "center",
    },
    visitDateText: {
        fontSize: 12,
        marginBottom: 3,
    },

    visitIndex: {
        fontWeight: '700',
    },

});
