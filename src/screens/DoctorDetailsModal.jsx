// DoctorDetailsModal.jsx

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {BASE_URL, url} from '@env';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

const {width, height} = Dimensions.get('window');

const DoctorDetailsModal = ({
  visible,
  onClose,
  doctorId,
  employeeId,
  businessId,
}) => {
  const [activeTab, setActiveTab] = useState('details');

  const [loading, setLoading] = useState(false);

  const [doctorDetails, setDoctorDetails] = useState(null);

  const [visitHistory, setVisitHistory] = useState([]);

  useEffect(() => {
    if (!visible || !doctorId || !employeeId || !businessId) {
      return;
    }

    console.log('doctorId => ', doctorId);

    console.log('employeeId => ', employeeId);

    console.log('businessId => ', businessId);

    fetchDoctorDetails();

    fetchVisitHistory();
  }, [visible, doctorId, employeeId, businessId]);

  // ===============================
  // FETCH DOCTOR DETAILS
  // ===============================
  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);

      const url =
        BASE_URL +
        `DCR/CustomerDetails?Businessid=${businessId}&CustomerType=DOCTOR&IDCustomer=${doctorId}`;

      console.log('Doctor Details URL => ', url);

      const response = await axios.get(url);

      if (response.data.d.length > 0) {
        setDoctorDetails(response.data.d[0]);
      }
    } catch (error) {
      console.log('Doctor Details Error => ', error);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // FETCH VISIT HISTORY
  // ===============================
  const fetchVisitHistory = async () => {
    try {
      const url =
        BASE_URL +
        `DCR/EmployeewisevisitDates?Businessid=${businessId}&IDEmployee=${employeeId}&IDCustomer=${doctorId}`;

      console.log('Visit History URL => ', url);

      const response = await axios.get(url);

      setVisitHistory(response.data || []);
    } catch (error) {
      console.log('Visit History Error => ', error);
    }
  };

  // ===============================
  // RENDER DETAILS TAB
  // ===============================
  const renderDetails = () => {
    if (!doctorDetails) {
      return <Text style={styles.noDataText}>No Details Found</Text>;
    }

    const products = doctorDetails.Products
      ? doctorDetails.Products.split(',')
      : [];

    return (
      <View style={styles.detailsCard}>
        <Text style={styles.infoText}>
          <Text style={styles.label}>Customer : </Text>
          {doctorDetails.Customer}
        </Text>

        <Text style={styles.infoText}>
          <Text style={styles.label}>Code : </Text>
          {doctorDetails.Code}
        </Text>

        <Text style={styles.infoText}>
          <Text style={styles.label}>Other Code : </Text>
          {doctorDetails.OtherCode}
        </Text>

        <Text style={styles.infoText}>
          <Text style={styles.label}>Speciality : </Text>
          {doctorDetails.Speciality}
        </Text>

        <Text style={styles.infoText}>
          <Text style={styles.label}>Qualification : </Text>
          {doctorDetails.Qualification}
        </Text>

        <Text style={styles.infoText}>
          <Text style={styles.label}>Area : </Text>
          {doctorDetails.Area}
        </Text>

        <Text style={[styles.infoText, {marginTop: 10}]}>
          <Text style={styles.label}>Products :</Text>
        </Text>

        {products.map((item, index) => (
          <Text key={index} style={styles.productText}>
            {index + 1}. {item.trim()}
          </Text>
        ))}
      </View>
    );
  };

  // ===============================
  // RENDER VISIT HISTORY TAB
  // ===============================
  const renderVisitHistory = () => {
    if (visitHistory.length === 0) {
      return <Text style={styles.noDataText}>No Visit History Found</Text>;
    }

    return (
      <ScrollView horizontal>
        <View>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>Month</Text>

            <Text style={styles.headerCell}>Visits</Text>

            <Text style={[styles.headerCell, {width: 220}]}>Visit Dates</Text>

            <Text style={[styles.headerCell, {width: 220}]}>Remarks</Text>
          </View>

          {/* Rows */}
          {visitHistory.map((item, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                {
                  backgroundColor: index % 2 === 0 ? '#fff' : '#f4f7fb',
                },
              ]}>
              <Text style={styles.rowCell}>{item.MonthName}</Text>

              <Text style={styles.rowCell}>{item.visitcount}</Text>

              <View style={{width: 220, padding: 10}}>
                {item.visitDates.map((v, i) => {
                  const dates = v.visitedDates.split(',');

                  return dates.map((date, idx) => (
                    <Text key={idx} style={styles.dateText}>
                      {idx + 1}. {date}
                    </Text>
                  ));
                })}
              </View>

              <Text
                style={[
                  styles.rowCell,
                  {
                    width: 220,
                    color: '#6b0000',
                  },
                ]}>
                {item.Remarks}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* CLOSE BUTTON */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={28} color="#000" />
          </TouchableOpacity>

          {/* TABS */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'details' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('details')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'details' && styles.activeTabText,
                ]}>
                Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'history' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('history')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'history' && styles.activeTabText,
                ]}>
                Visit History
              </Text>
            </TouchableOpacity>
          </View>

          {/* BODY */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {loading ? (
              <ActivityIndicator
                size="large"
                color="#005baa"
                style={{marginTop: 40}}
              />
            ) : activeTab === 'details' ? (
              renderDetails()
            ) : (
              renderVisitHistory()
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default DoctorDetailsModal;

// =======================================
// STYLES
// =======================================

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: width * 0.96,
    height: height * 0.85,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
  },

  closeButton: {
    alignSelf: 'flex-end',
    padding: 5,
  },

  tabContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },

  tabButton: {
    flex: 1,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  activeTab: {
    backgroundColor: '#005baa',
  },

  tabText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#777',
  },

  activeTabText: {
    color: '#fff',
  },

  detailsCard: {
    backgroundColor: '#dff4ff',
    borderRadius: 20,
    padding: 20,
  },

  label: {
    fontWeight: 'bold',
    color: '#444',
  },

  infoText: {
    fontSize: 22,
    color: '#555',
    marginBottom: 18,
    lineHeight: 30,
  },

  productText: {
    fontSize: 20,
    color: '#555',
    marginLeft: 20,
    marginBottom: 12,
  },

  noDataText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#777',
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#d9e7fb',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

  headerCell: {
    width: 140,
    padding: 12,
    fontWeight: 'bold',
    fontSize: 20,
    color: '#002f6c',
    borderWidth: 0.5,
    borderColor: '#ccc',
  },

  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
  },

  rowCell: {
    width: 140,
    padding: 12,
    fontSize: 18,
    color: '#444',
    borderWidth: 0.5,
    borderColor: '#ddd',
  },

  dateText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
});
