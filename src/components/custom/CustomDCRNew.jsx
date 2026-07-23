import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import React, {useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CustomDCRNew = ({
  selectionMode,
  option1,
  option2,
  option3,
  option4, // visualaids
  option5,
  onSelectSwitch,
}) => {
  const [getSelectionMode, setSelectionMode] = useState(selectionMode);

  const updateSwitchData = value => {
    setSelectionMode(value);
    onSelectSwitch(value);
  };

  const getIconName = option => {
    if (!option) return 'ellipse-outline';
    if (option.toLowerCase() === 'sample') return 'flask-outline';
    if (option.toLowerCase() === 'gift') return 'gift-outline';
    if (option.toLowerCase() === 'stage') return 'stats-chart-outline';
    if (option.toLowerCase() === 'campaign') return 'megaphone-outline';
    if (option.toLowerCase() === 'visualaids') return 'document-text-outline';
    return 'ellipse-outline';
  };

  const renderOption = (label, index) => (
    <TouchableOpacity
      key={index}
      activeOpacity={1}
      onPress={() => updateSwitchData(index)}
      // style={{
      //   flex: 1,
      //   backgroundColor: getSelectionMode === index ? '#005696' : '#e4e4e4',
      //   borderRadius: 10,
      //   justifyContent: 'center',
      //   alignItems: 'center',
      //   flexDirection: 'row',
      // }}
      style={{
        minWidth: 100,
        paddingHorizontal: 10,
        backgroundColor: getSelectionMode === index ? '#005696' : '#e4e4e4',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
      }}>
      <Ionicons
        name={getIconName(label)}
        size={15}
        color={getSelectionMode === index ? 'white' : '#005696'}
        style={{marginRight: 2}}
      />
      <Text
        style={{
          color: getSelectionMode === index ? 'white' : '#005696',
          fontSize: 12,
          fontFamily: 'Roboto-Medium',
        }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // return (
  //   <View
  //     style={{
  //       height: 44,
  //       width: '100%',
  //       backgroundColor: '#e4e4e4',
  //       borderRadius: 10,
  //       borderColor: '#005696',
  //       flexDirection: 'row',
  //     }}>
  //     {renderOption(option1, 1)}
  //     {renderOption(option2, 2)}
  //     {renderOption(option3, 3)}
  //     {renderOption(option4, 4)}
  //     {option5 ? renderOption(option5, 5) : null}
  //   </View>
  // );
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 2,
      }}>
      <View
        style={{
          height: 44,
          flexDirection: 'row',
          backgroundColor: '#e4e4e4',
          borderRadius: 10,
        }}>
        {renderOption(option1, 1)}
        {renderOption(option2, 2)}
        {renderOption(option3, 3)}
        {renderOption(option4, 4)}
        {option5 ? renderOption(option5, 5) : null}
      </View>
    </ScrollView>
  );
};

export default CustomDCRNew;
