import {Ionicons} from '@expo/vector-icons';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import React, {useContext} from 'react';
import {Platform} from 'react-native';

import DataContext from '../context/DataContext';
import Screens from '../screens';
import {ScheduleDay} from '../typings/data';
import {
  ScheduleDayTabParamList,
  ScheduleNavigationProp,
} from '../typings/navigation';
import {occurence} from '../utils/array';

const Tab = createMaterialTopTabNavigator<ScheduleDayTabParamList>();

export default function DynamicScheduleNavigation({
  navigation,
}: {
  navigation: ScheduleNavigationProp;
}) {
  navigation.setOptions({
    headerRight: () => (
      <Ionicons
        name={Platform.OS === 'ios' ? 'ios-search' : 'md-search'}
        size={24}
        color="#FFF"
        style={{marginRight: 10}}
      />
    ),
  });
  const {event} = useContext(DataContext);
  let fullSchedule: ScheduleDay[] = [];
  if (event?.groupedSchedule) {
    fullSchedule = event.groupedSchedule as ScheduleDay[];
  }

  return (
    <Tab.Navigator
      tabBarOptions={{
        style: {backgroundColor: '#333'},
        activeTintColor: '#fff',
        scrollEnabled: true,
      }}>
      {fullSchedule.map((day: ScheduleDay, index: number) => {
        const dayOccurence = occurence(fullSchedule, 'title', day.title);
        let dayTitle: string = day?.title
          ? day.title.substring(0, 3).toUpperCase()
          : index.toString();
        if (dayOccurence > 1) {
          const monthDay = new Date(day.date).getDate();
          dayTitle += '-' + monthDay.toString();
        }
        return (
          <Tab.Screen
            key={index}
            name={`${event?.name}-${dayTitle}`}
            options={{title: dayTitle}}
            component={Screens.ScheduleDay}
            initialParams={{
              day: day.title ? day.title : '',
              date: day.date ? day.date : '',
            }}
          />
        );
      })}
    </Tab.Navigator>
  );
}
