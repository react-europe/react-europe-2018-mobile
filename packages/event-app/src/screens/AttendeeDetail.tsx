import Constants from 'expo-constants';
import React, {useState, useContext} from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {View as AnimatableView} from 'react-native-animatable';
import {useTheme, Theme} from 'react-native-paper';
import {useRecoilState, useSetRecoilState} from 'recoil';

import AnimatedScrollView from '../components/AnimatedScrollView';
import GravatarImage from '../components/GravatarImage';
import ImageFadeIn from '../components/ImageFadeIn';
import NavigationBar from '../components/NavigationBar';
import PrimaryButton from '../components/PrimaryButton';
import {RegularText, SemiBoldText} from '../components/StyledText';
import {Layout} from '../constants';
import DataContext from '../context/DataContext';
import {contactState} from '../context/contactState';
import {Attendee} from '../typings/data';
import {MenuTabProps} from '../typings/navigation';
import {openTwitter, getContactTwitter, getContacts} from '../utils';
import {saveContactOnDevice, saveNewContact} from '../utils/storage';
import useHeaderHeight from '../utils/useHeaderHeight';

export default function AttendeeDetail(props: MenuTabProps<'AttendeeDetail'>) {
  const headerHeight = useHeaderHeight();
  const theme: Theme = useTheme();
  const [scrollY] = useState(new Animated.Value(0));
  const setContacts = useSetRecoilState(contactState);
  const {event} = useContext(DataContext);

  const _handlePressTwitter = () => {
    const {attendee}: {attendee: Attendee} = props.route.params;
    const twitter = getContactTwitter(attendee);
    openTwitter(twitter);
  };

  /* const _handlePressEmail = () => {
    const {
      attendee: {email: emailTo},
    } = props.route.params;
    const {tickets} = props;
    let fromName = {firstName: '', lastName: ''};
    if (tickets && tickets[0] && tickets[0].firstName) {
      fromName = tickets[0];
    }
    sendEmail(emailTo, fromName);
  }; */

  const _handleAddToContacts = async () => {
    const {attendee}: {attendee: Attendee} = props.route.params;
    let userContacts: Attendee[] = [];
    if (event?.slug) {
      userContacts = await getContacts(event.slug);
      const newContatcts = await saveNewContact(
        attendee,
        userContacts,
        event.slug
      );
      setContacts(newContatcts);
      await saveContactOnDevice(attendee);
      props.navigation.navigate('Contacts');
    }
  };

  const params = props.route.params || {};
  const attendee = params.attendee;

  if (!attendee || !attendee.email) {
    props.navigation.goBack();
    return null;
  }

  const twitter = getContactTwitter(attendee);

  const scale = scrollY.interpolate({
    inputRange: [-300, 0, 1],
    outputRange: [2, 1, 1],
    extrapolate: 'clamp',
  });
  const translateX = 0;
  const translateY = scrollY.interpolate({
    inputRange: [-300, 0, 1],
    outputRange: [-50, 1, 1],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 30, 200],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={{flex: 1, backgroundColor: '#fff', overflow: 'hidden'}}>
      {Platform.OS === 'ios' ? (
        <Animated.View
          style={{
            position: 'absolute',
            top: -350,
            left: 0,
            right: 0,
            height: 400,
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: [1, 0, 0],
                }),
              },
            ],
            backgroundColor: theme.colors.primary,
          }}
        />
      ) : null}
      <AnimatedScrollView
        style={{flex: 1, backgroundColor: 'transparent'}}
        scrollEventThrottle={1}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {contentOffset: {y: scrollY}},
            },
          ],
          {useNativeDriver: true}
        )}>
        <View
          style={[
            styles.headerContainer,
            {backgroundColor: theme.colors.primary},
          ]}>
          <Animated.View
            style={{transform: [{scale}, {translateX}, {translateY}]}}>
            <ImageFadeIn placeholderStyle={{backgroundColor: 'transparent'}}>
              {attendee.email && (
                <GravatarImage style={styles.avatar} email={attendee.email} />
              )}
            </ImageFadeIn>
          </Animated.View>
          <SemiBoldText fontSize="md" TextColorAccent>
            {attendee.firstName} {attendee.lastName}
          </SemiBoldText>
          {twitter ? (
            <TouchableOpacity onPress={_handlePressTwitter}>
              <RegularText fontSize="md" TextColorAccent>
                @{twitter}
              </RegularText>
            </TouchableOpacity>
          ) : null}
        </View>
        <AnimatableView
          animation="fadeIn"
          useNativeDriver
          delay={50}
          duration={250}
          style={styles.content}>
          <View>
            <PrimaryButton onPress={_handleAddToContacts}>
              <SemiBoldText fontSize="md" TextColorAccent>
                Add to contacts
              </SemiBoldText>
            </PrimaryButton>
          </View>
        </AnimatableView>
      </AnimatedScrollView>

      <NavigationBar
        animatedBackgroundOpacity={headerOpacity}
        style={[
          Platform.OS === 'android'
            ? {height: headerHeight + Constants.statusBarHeight}
            : null,
        ]}
        renderLeftButton={() => (
          <View
            style={{
              // gross dumb things
              paddingTop: Platform.OS === 'android' ? 30 : 0,
              marginTop: Layout.notchHeight > 0 ? -5 : 0,
            }}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  content: {
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContainer: {
    paddingTop: Constants.statusBarHeight + Layout.notchHeight + 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
