import { View, Text } from 'react-native'
import React from 'react'
import MasterDrawer from '../components/drawer/MasterDrawer'
import { AppProvider } from '../components/custom/AppContext'

const AppNavMaster = () => {
  return (
     <AppProvider>
    <MasterDrawer/>
    </AppProvider>
  )
}

export default AppNavMaster