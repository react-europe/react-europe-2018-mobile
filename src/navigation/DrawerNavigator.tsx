import {createDrawerNavigator} from '@react-navigation/drawer';
import React from 'react';
/* import {useWindowDimensions} from 'react-native'; */
import {useTheme} from 'react-native-paper';

import Screens from '../screens';
import Attendees from '../screens/Attendees';
import Speakers from '../screens/Speakers';
import Sponsors from '../screens/Sponsors';
import ContactsNavigator from './ContactsNavigator';
import ProfileNavigator from './ProfileNavigator';
import ScheduleNavigator from './ScheduleNavigator';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const {colors} = useTheme();
  /* const dimensions = useWindowDimensions(); */
  const isLargeScreen = true;

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContentOptions={{activeTintColor: colors.primary}}
      drawerPosition="left"
      drawerType={isLargeScreen ? 'permanent' : 'back'}
      openByDefault>
      <Drawer.Screen name="Home" component={Screens.Home} />
      <Drawer.Screen name="Profile" component={ProfileNavigator} />
      <Drawer.Screen name="Schedule" component={ScheduleNavigator} />
      <Drawer.Screen name="Contacts" component={ContactsNavigator} />
      <Drawer.Screen name="Speakers" component={Speakers} />
      <Drawer.Screen name="Sponsors" component={Sponsors} />
      <Drawer.Screen name="Attendees" component={Attendees} />
    </Drawer.Navigator>
  );
}
