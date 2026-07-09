import {
    View,
    Text,
    BackHandler,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    FlatList,
    TextInput,
    StatusBar,
} from 'react-native';
import React, { useEffect, useCallback, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Hrms_URL } from '@env';
import { Dropdown } from 'react-native-element-dropdown';
import KeyboardAwareLayout from '../components/custom/KeyboardAwareLayout';
import { Picker } from '@react-native-picker/picker';
import Feather from 'react-native-vector-icons/Feather';


const LeaveApproval = () => {
    const navigation = useNavigation();
    const [employeeData, setEmployeeData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [empemail, setEmpemail] = useState('');
    const [businessID, setBusinessID] = useState('');
    const [tenantId, settenantId] = useState('');
    const [userEmpNo, setuserEmpNo] = useState('');
    const [companyId, setCompanyId] = useState('');
    const [selectedLeaveStatus, setSelectedLeaveStatus] = useState('');
    const [remarks, setRemarks] = useState('');
    const [isDataVisible, setIsDataVisible] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [leaveRequestToEdit, setLeaveRequestToEdit] = useState(null); // Store the leave request being edited
    const [expandedApplicationId, setExpandedApplicationId] = useState(null); // Track expanded leave application

    const months = [
        { label: 'January', value: '01' },
        { label: 'February', value: '02' },
        { label: 'March', value: '03' },
        { label: 'April', value: '04' },
        { label: 'May', value: '05' },
        { label: 'June', value: '06' },
        { label: 'July', value: '07' },
        { label: 'August', value: '08' },
        { label: 'September', value: '09' },
        { label: 'October', value: '10' },
        { label: 'November', value: '11' },
        { label: 'December', value: '12' }
    ];
    //const tenantId = '6B1B6590-C5CA-4FD6-A0BB-FEBA6DB8FB14';

    const years = [
        { label: new Date().getFullYear().toString(), value: new Date().getFullYear() }
    ];

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'approvalDashboard' }],
                }); // <-- Your main screen
                return true;
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => {
                BackHandler.removeEventListener('hardwareBackPress', onBackPress);
            };
        }, [navigation]),
    );

    useEffect(() => {
        AsyncStorage.getItem('UserData').then(value => {
            if (value != null) {
                let user = JSON.parse(value);
                setEmpemail(user.Empemail);
                setuserEmpNo(user.Empno);
                settenantId(user.HRMSLeaveKey);
                setBusinessID(user.BusinessID.trim());
                let companyId;
                const businessID = user.BusinessID.trim();

                if (businessID === 'MEND-PVTL-890') {
                    companyId = 1;
                    setCompanyId(companyId);
                } else if (businessID === 'GENI-QST-536') {
                    companyId = 50;
                    setCompanyId(companyId);
                }

                const email = user.Empemail;
                fetchEmployeeData(user.HRMSLeaveKey, email);
            }
        });
    }, []);

    const fetchEmployeeData = async (companyId, email) => {
        setLoading(true);
        try {
            const url = `${Hrms_URL}EmployeeNameHierarchyWise?tenantId=${companyId}&email=${email}`;
            console.log('Fetching employee data from URL:', url);
            const response = await axios.get(url);
            const data = response.data;
            const formattedData = data.map(emp => ({
                label: emp.empname,
                value: emp.empno,
            }));
            setEmployeeData(formattedData);
        } catch (error) {
            console.error('Error fetching employee data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleShowData = async () => {
        if (!selectedMonth || !selectedYear || !selectedEmployee) {
            Alert.alert("Please select all fields");
            return;
        }

        setIsFetching(true);

        const url = `${Hrms_URL}OnSearchLeaveRequest?tenantId=${tenantId}&empNo=${selectedEmployee}&month=${selectedMonth}&year=${selectedYear}&appliedByEmpNo=${userEmpNo}`;
        console.log('Fetching leave data from URL:', url);
        try {
            const response = await axios.get(url);
            setLeaveRequests(response.data);
            setIsDataVisible(true); // Show data and hide form
        } catch (error) {
            console.error('Error fetching leave data:', error);
            Alert.alert('Error', 'Failed to fetch leave data');
        } finally {
            setIsFetching(false);
        }
    };


    const getStatusStyle = statusValue => {
        const status = String(statusValue || '').toUpperCase();

        if (status === 'APPROVED') return styles.statusApproved;
        if (status === 'REJECT') return styles.statusRejected;
        if (status === 'SUBMITTED') return styles.statusSubmitted;
        if (status === 'CANCELLED') return styles.statusCancelled;

        return styles.statusDefault;
    };

    const getLeaveIconStyle = leaveType => {
        const type = String(leaveType || '').toUpperCase();

        if (type.includes('CASUAL')) {
            return {
                box: styles.leaveIconCasualBox,
                icon: styles.leaveIconCasual,
            };
        }

        return {
            box: styles.leaveIconPrivilegeBox,
            icon: styles.leaveIconPrivilege,
        };
    };

    const renderLeaveRequest = ({ item }) => {
        const isExpanded = item.ApplicationID === expandedApplicationId;
        const status = String(item.ApplicationStatus || '').toUpperCase();

        return (
            <View style={styles.leaveCard}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleExpandApplication(item.ApplicationID)}
                >
                    <View style={styles.cardHeaderRow}>
                        <View style={styles.cardLeft}>
                            <Text style={styles.leaveType} numberOfLines={1}>
                                {item.LeaveType || '-'}
                            </Text>

                            <View style={styles.metaRow}>
                                <Text style={styles.metaText}>{item.LeaveDuration || '-'}</Text>
                                <Text style={styles.dot}>•</Text>
                                <Text style={styles.metaText}>{item.TotalDaysApplied || 0} Day</Text>
                            </View>

                            <Text style={styles.employeeText} numberOfLines={1}>
                                {item.AppliedBy || item.EmployeeName || '-'}
                            </Text>
                        </View>

                        <View style={styles.cardRight}>
                            <View style={[styles.statusPill, getStatusStyle(status)]}>
                                <Text style={[styles.statusText, getStatusStyle(status)]}>
                                    {item.ApplicationStatus || 'N/A'}
                                </Text>
                            </View>

                            <Feather
                                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color="#334155"
                            />
                        </View>
                    </View>

                    <View style={styles.dateStrip}>
                        <View style={styles.dateBox}>
                            <Text style={styles.smallLabel}>From</Text>
                            <Text style={styles.dateValue}>{item.FromDate || '-'}</Text>
                        </View>

                        <View style={styles.dateBox}>
                            <Text style={styles.smallLabel}>To</Text>
                            <Text style={styles.dateValue}>{item.ToDate || '-'}</Text>
                        </View>

                        <View style={styles.dateBox}>
                            <Text style={styles.smallLabel}>Applied</Text>
                            <Text style={styles.dateValue}>{item.ApplicationDate || '-'}</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.expandedBox}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Application ID</Text>
                            <Text style={styles.detailValue}>{item.ApplicationID || '-'}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Reason</Text>
                            <Text style={styles.detailValue}>{item.Reason || '-'}</Text>
                        </View>

                        {status === 'SUBMITTED' ? (
                            <>
                                <Text style={styles.inputLabel}>
                                    Remarks <Text style={styles.requiredStar}>*</Text>
                                </Text>

                                <TextInput
                                    style={styles.remarksInput}
                                    placeholder="Enter remarks"
                                    value={remarks}
                                    onChangeText={setRemarks}
                                    placeholderTextColor="#94a3b8"
                                />

                                <View style={styles.actionRow}>
                                    <TouchableOpacity
                                        style={styles.approveBtn}
                                        onPress={() => {
                                            setSelectedLeaveStatus('2');
                                            Alert.alert(
                                                'Confirmation',
                                                'Do you want to Approve?',
                                                [
                                                    { text: 'Cancel', style: 'cancel' },
                                                    { text: 'OK', onPress: () => handleSubmit(item.ApplicationID, '2') },
                                                ]
                                            );
                                        }}
                                    >
                                        <Feather name="check" size={15} color="#15803d" />
                                        <Text style={styles.approveText}>Approve</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.rejectBtn}
                                        onPress={() => {
                                            setSelectedLeaveStatus('3');
                                            Alert.alert(
                                                'Confirmation',
                                                'Do you want to Reject?',
                                                [
                                                    { text: 'Cancel', style: 'cancel' },
                                                    { text: 'OK', onPress: () => handleSubmit(item.ApplicationID, '3') },
                                                ]
                                            );
                                        }}
                                    >
                                        <Feather name="x" size={15} color="#dc2626" />
                                        <Text style={styles.rejectText}>Reject</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Remarks</Text>
                                <Text style={styles.detailValue}>
                                    {typeof item.Remarks === 'string' && item.Remarks.trim() !== ''
                                        ? item.Remarks
                                        : item.Remarks?.Remarks || item.Remarks?.remarks || 'No remarks'}
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    };

    const handleExpandApplication = (applicationId) => {
        // Toggle the expanded application ID (only one application can be expanded at a time)
        setExpandedApplicationId(prevId => (prevId === applicationId ? null : applicationId));
        setRemarks(''); // Reset remarks when expanding a new application
        setSelectedLeaveStatus(''); // Reset selected status when expanding a new application
    };

    const handleLeaveStatusChange = (leaveId, status) => {
        setSelectedLeaveStatus(status);  // Set selected status (Approve/Reject)
    };

    const getCurrentFinancialYear = () => {
        const year = new Date().getFullYear();
        return `${year}-${year + 1}`;
    };


    const handleSubmit = async (leaveId, statusId) => {
        console.log('Submitting leave request:', leaveId);
        console.log('Selected Leave Status:', statusId);
        console.log('BusinessId:', businessID);
        console.log('Remarks:', remarks);

        const financialYear = getCurrentFinancialYear();

        if (!statusId || !remarks.trim()) {
            Alert.alert('Validation ', 'Please write remarks then choose Approve or Reject .');
            return;
        }

        try {
            let url = '';

            if (businessID === 'GENI-QST-536') {
                url = `${Hrms_URL}UpdateLeaveStatusGeniquest?companyId=${companyId}&FinancialYear=${financialYear}&leaveApplicationId=${leaveId}&statusId=${statusId}&approveRemarks=${encodeURIComponent(remarks)}&email=${empemail}&action=${statusId === '2' ? 'approve' : 'reject'}`;
            } else {
                url = `${Hrms_URL}UpdateLeaveStatus?tenantId=${tenantId}&leaveApplicationId=${leaveId}&statusId=${statusId}&approveRemarks=${encodeURIComponent(remarks)}&email=${empemail}`;
            }

            console.log('Submitting leave status update:', url);

            const response = await axios.post(url);
            const result = response.data?.[0];

            console.log('UpdateLeaveStatus Response:', response.data);

            if (result?.Message === 'Leave application updated successfully.') {
                const updatedStatus = statusId === '2' ? 'APPROVED' : 'REJECT';

                Alert.alert(
                    'Success',
                    `Leave ${updatedStatus === 'APPROVED' ? 'Approved' : 'Rejected'} successfully`
                );

                setLeaveRequests(prevRequests =>
                    prevRequests.map(req =>
                        req.ApplicationID === leaveId
                            ? {
                                ...req,
                                ApplicationStatus: updatedStatus,
                                Remarks: remarks,
                            }
                            : req
                    )
                );

                setRemarks('');
                setSelectedLeaveStatus('');
                setExpandedApplicationId(null);

            } else {
                Alert.alert(
                    'Failed to update leave status',
                    result?.Message || 'Unexpected response from server'
                );
            }

        } catch (error) {
            console.error('Error updating leave status:', error);
            Alert.alert('Error', 'Failed to update leave status');
        }
    };


    const handleGoBack = () => {
        setIsDataVisible(false); // Hide data and show the form again
        setSelectedEmployee(null);
        setSelectedMonth(null);
        setSelectedYear(new Date().getFullYear());
    };

    return (
        <KeyboardAwareLayout>
            <StatusBar barStyle="light-content" backgroundColor="#005696" />

            <View style={styles.screen}>


                {loading ? (
                    <View style={styles.centerLoader}>
                        <ActivityIndicator size="large" color="#005696" />
                        <Text style={{ marginTop: 10, color: '#111827' }}>Loading...</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.filterCard}>
                            <View style={styles.filterField}>
                                <Text style={styles.filterLabel}>Employee</Text>
                                <Dropdown
                                    style={styles.dropdownBox}
                                    containerStyle={styles.dropdownContainer}
                                    data={employeeData}
                                    labelField="label"
                                    valueField="value"
                                    value={selectedEmployee}
                                    placeholder="Select Employee"
                                    search
                                    searchPlaceholder="Search employee..."
                                    onChange={item => setSelectedEmployee(item.value)}
                                    renderLeftIcon={() => (
                                        <Feather name="user" size={20} color="#111827" style={{ marginRight: 8 }} />
                                    )}
                                />
                            </View>

                            <View style={styles.filterField}>
                                <Text style={styles.filterLabel}>Month</Text>
                                <View style={styles.pickerCorporateBox}>
                                    <Feather name="calendar" size={18} color="#111827" style={{ marginLeft: 10 }} />
                                    <Picker
                                        selectedValue={selectedMonth}
                                        style={styles.pickerCorporate}
                                        onValueChange={itemValue => setSelectedMonth(itemValue)}
                                    >
                                        <Picker.Item label="Select Month" value={null} />
                                        {months.map(month => (
                                            <Picker.Item
                                                key={month.value}
                                                label={`${month.label} (${month.value})`}
                                                value={month.value}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            </View>

                            <View style={styles.filterFieldSmall}>
                                <Text style={styles.filterLabel}>Year</Text>
                                <Dropdown
                                    style={styles.dropdownBox}
                                    containerStyle={styles.dropdownContainer}
                                    data={years}
                                    labelField="label"
                                    valueField="value"
                                    value={selectedYear}
                                    placeholder="Year"
                                    onChange={item => setSelectedYear(item.value)}
                                    renderLeftIcon={() => (
                                        <Feather name="calendar" size={18} color="#111827" style={{ marginRight: 8 }} />
                                    )}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.searchButton}
                                onPress={handleShowData}
                                disabled={isFetching}
                            >
                                {isFetching ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Feather name="search" size={22} color="#fff" />
                                        <Text style={styles.searchButtonText}>Search</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        {isDataVisible && (
                            <View style={styles.listPanel}>
                                <View style={styles.listHeader}>
                                    <View style={styles.listTitleRow}>
                                        <Text style={styles.listTitle}>Leave Requests</Text>
                                        <View style={styles.countBadge}>
                                            <Text style={styles.countBadgeText}>{leaveRequests.length}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.sortRow}>
                                        <Text style={styles.sortText}>Sort by: Newest</Text>
                                        <Feather name="shuffle" size={18} color="#374151" />
                                    </View>
                                </View>

                                <FlatList
                                    data={leaveRequests}
                                    renderItem={renderLeaveRequest}
                                    keyExtractor={item => item.ApplicationID.toString()}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={styles.listContent}
                                    ListEmptyComponent={
                                        <View style={styles.emptyBox}>
                                            <Feather name="inbox" size={36} color="#9ca3af" />
                                            <Text style={styles.emptyText}>No leave requests found</Text>
                                        </View>
                                    }
                                />

                                <View style={styles.footerHint}>
                                    <Feather name="info" size={18} color="#4b5563" />
                                    <Text style={styles.footerHintText}>
                                        Tap on a request to view details and take action.
                                    </Text>
                                </View>
                            </View>
                        )}
                    </>
                )}
            </View>
        </KeyboardAwareLayout>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#f5f7fb',
    },

    header: {
        height: 84,
        backgroundColor: '#0047a8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 18,
        elevation: 6,
        shadowColor: '#003b8e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
    },

    headerTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: 0.2,
    },

    headerIconBtn: {
        width: 42,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
    },

    centerLoader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    filterCard: {
        marginHorizontal: 10,
        marginTop: 8,
        marginBottom: 8,
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#fff',
        elevation: 2,
    },

    filterField: {
        marginBottom: 8,
    },

    filterFieldSmall: {
        marginBottom: 8,
    },

    filterLabel: {
        fontSize: 11,
        color: '#475569',
        marginBottom: 4,
        fontWeight: '600',
    },

    dropdownBox: {
        height: 42,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },

    pickerCorporateBox: {
        height: 42,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
    },

    pickerCorporate: {
        flex: 1,
        height: 42,
        color: '#111827',
    },

    searchButton: {
        height: 42,
        borderRadius: 8,
        backgroundColor: '#005696',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },

    searchButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },

    listPanel: {
        flex: 1,
        marginHorizontal: 10,
        marginBottom: 8,
    },

    listHeader: {
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    listTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    listTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#111827',
    },

    countBadge: {
        marginLeft: 8,
        minWidth: 24,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#2563eb',
        alignItems: 'center',
        justifyContent: 'center',
    },

    countBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '800',
    },

    sortRow: {
        display: 'none',
    },

    listContent: {
        paddingBottom: 10,
    },

    leaveCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        elevation: 2,
        overflow: 'hidden',
    },

    cardHeaderRow: {
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center',
    },

    cardLeft: {
        flex: 1,
    },

    cardRight: {
        alignItems: 'flex-end',
        gap: 6,
    },

    leaveType: {
        fontSize: 13,
        fontWeight: '800',
        color: '#111827',
    },

    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 3,
    },

    metaText: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '600',
    },

    dot: {
        fontSize: 11,
        color: '#94a3b8',
        marginHorizontal: 5,
    },

    employeeText: {
        marginTop: 3,
        fontSize: 11,
        color: '#334155',
    },

    statusPill: {
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderWidth: 1,
    },

    statusText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },

    statusApproved: {
        backgroundColor: '#dcfce7',
        borderColor: '#86efac',
        color: '#15803d',
    },

    statusRejected: {
        backgroundColor: '#fee2e2',
        borderColor: '#fca5a5',
        color: '#dc2626',
    },

    statusSubmitted: {
        backgroundColor: '#dbeafe',
        borderColor: '#93c5fd',
        color: '#0756c9',
    },

    statusCancelled: {
        backgroundColor: '#fce7f3',
        borderColor: '#f9a8d4',
        color: '#be185d',
    },

    statusDefault: {
        backgroundColor: '#f1f5f9',
        borderColor: '#cbd5e1',
        color: '#475569',
    },

    dateStrip: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingVertical: 7,
        paddingHorizontal: 10,
    },

    dateBox: {
        flex: 1,
    },

    smallLabel: {
        fontSize: 10,
        color: '#64748b',
        marginBottom: 2,
    },

    dateValue: {
        fontSize: 12,
        color: '#0f172a',
        fontWeight: '700',
    },

    expandedBox: {
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        padding: 10,
        backgroundColor: '#fbfdff',
    },

    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 7,
        gap: 10,
    },

    detailLabel: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '600',
    },

    detailValue: {
        flex: 1,
        textAlign: 'right',
        fontSize: 12,
        color: '#111827',
        fontWeight: '700',
    },

    inputLabel: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '600',
        marginBottom: 5,
    },

    requiredStar: {
        color: '#dc2626',
    },

    remarksInput: {
        height: 38,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        fontSize: 12,
        color: '#111827',
    },

    actionRow: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 8,
    },

    approveBtn: {
        flex: 1,
        height: 36,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#16a34a',
        backgroundColor: '#f0fdf4',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 5,
    },

    approveText: {
        fontSize: 12,
        color: '#15803d',
        fontWeight: '800',
    },

    rejectBtn: {
        flex: 1,
        height: 36,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#dc2626',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 5,
    },

    rejectText: {
        fontSize: 12,
        color: '#dc2626',
        fontWeight: '800',
    },

    footerHint: {
        display: 'none',
    },
});

export default LeaveApproval;