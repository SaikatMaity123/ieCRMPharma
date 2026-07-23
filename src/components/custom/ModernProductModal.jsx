import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';

import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ModernProductModal = ({
  visible,
  dataList,
  onDeleteView,
  onvClose,
}) => {
  const renderItem = ({item, index}) => (
    <View style={styles.card}>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDeleteView(index)}>

        <AntDesign
          name="delete"
          size={20}
          color="#F44336"
        />

      </TouchableOpacity>

      <View style={styles.cardHeader}>

        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="package-variant"
            size={26}
            color="#fff"
          />
        </View>

        <View style={{flex:1}}>

          <Text style={styles.productName}>
            {item.selfprodName}
          </Text>

          <Text style={styles.smallTitle}>
            Product
          </Text>

        </View>

      </View>

      <View style={styles.divider}/>

      <View style={styles.row}>

        <MaterialCommunityIcons
          name="doctor"
          size={20}
          color="#1976D2"
        />

        <Text style={styles.label}>
          Doctor
        </Text>

        <Text style={styles.value}>
          {item.docName}
        </Text>

      </View>

      <View style={styles.row}>

        <MaterialCommunityIcons
          name="card-account-details-outline"
          size={20}
          color="#1976D2"
        />

        <Text style={styles.label}>
          Code
        </Text>

        <Text style={styles.value}>
          {item.docCode}
        </Text>

      </View>

      <View style={styles.row}>

        <MaterialCommunityIcons
          name="currency-inr"
          size={20}
          color="#43A047"
        />

        <Text style={styles.label}>
          MRP
        </Text>

        <View style={styles.priceBadge}>

          <Text style={styles.price}>
            ₹ {item.mrp}
          </Text>

        </View>

      </View>

    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide">

      <View style={styles.overlay}>

        <SafeAreaView style={styles.container}>

          <View style={styles.header}>

            <View>

              <Text style={styles.title}>
                Product Details
              </Text>

              <Text style={styles.subtitle}>
                Total Products : {dataList.length}
              </Text>

            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onvClose}>

              <AntDesign
                name="close"
                size={22}
                color="#333"
              />

            </TouchableOpacity>

          </View>

          <FlatList
            data={dataList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom:30}}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>

                <MaterialCommunityIcons
                  name="package-variant-closed"
                  size={70}
                  color="#B0BEC5"
                />

                <Text style={styles.emptyTitle}>
                  No Products Available
                </Text>

                <Text style={styles.emptyText}>
                  Product list will appear here.
                </Text>

              </View>
            }
          />

        </SafeAreaView>

      </View>

    </Modal>
  );
};

export default ModernProductModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  container: {
    backgroundColor: '#F5F7FB',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },

  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },

  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 5,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 5,
  },

  deleteButton: {
    position: 'absolute',
    top: 16,
    right: 16,

    width: 40,
    height: 40,
    borderRadius: 20,

    backgroundColor: '#FEECEC',

    justifyContent: 'center',
    alignItems: 'center',

    zIndex: 99,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,

    backgroundColor: '#1565C0',

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 15,
  },

  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    paddingRight: 45,
  },

  smallTitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
  },

  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 15,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 9,
  },

  label: {
    width: 80,
    marginLeft: 10,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },

  value: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '700',
  },

  priceBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 18,
  },

  price: {
    color: '#2E7D32',
    fontWeight: '700',
    fontSize: 15,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 70,
    paddingBottom: 50,
  },

  emptyTitle: {
    marginTop: 18,
    fontSize: 20,
    fontWeight: '700',
    color: '#475569',
  },

  emptyText: {
    marginTop: 8,
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
  },
});