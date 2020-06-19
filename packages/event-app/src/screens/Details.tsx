import {useNavigationState} from '@react-navigation/native';
import Constants from 'expo-constants';
import * as Haptic from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import React, {useEffect, useState, useContext} from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import {View as AnimatableView} from 'react-native-animatable';
import Markdown from 'react-native-markdown-renderer';
import {Theme, useTheme} from 'react-native-paper';
import WebView from 'react-native-webview';

import AnimatedScrollView from '../components/AnimatedScrollView';
import CachedImage from '../components/CachedImage';
import CloseButton from '../components/CloseButton';
import ImageFadeIn from '../components/ImageFadeIn';
import NavigationBar from '../components/NavigationBar';
import SaveButton from '../components/SaveButton';
import {RegularText, BoldText, SemiBoldText} from '../components/StyledText';
import {Layout} from '../constants';
import DataContext from '../context/DataContext';
import {Talk, Speaker, Schedule} from '../typings/data';
import {AppProps} from '../typings/navigation';
import {getSpeakerTalk, convertUtcDateToEventTimezoneHour} from '../utils';
import useHeaderHeight from '../utils/useHeaderHeight';

function SavedButtonNavigationItem(props: {talk: Talk}) {
  return (
    <View
      style={{
        // gross dumb things
        paddingTop: Platform.OS === 'android' ? 30 : 0,
        marginTop: Layout.notchHeight > 0 ? -5 : 0,
      }}>
      <SaveButton talk={props.talk} />
    </View>
  );
}

export default function Details(props: AppProps<'Details'>) {
  const state = useNavigationState((state) => state);
  const data = useContext(DataContext);
  const headerHeight = useHeaderHeight();
  const theme: Theme = useTheme();
  const [scrollY] = useState(new Animated.Value(0));
  let _listener: string | null = null;

  useEffect(() => {
    if (Platform.OS === 'ios') {
      _listener = scrollY.addListener(({value}) => {
        if (value < -150) {
          Haptic.impact(Haptic.ImpactFeedbackStyle.Medium);
          props.navigation.goBack();
          if (_listener) {
            scrollY.removeListener(_listener);
            _listener = null;
          }
        }
      });
    }
    return function unmount() {
      if (_listener) {
        scrollY.removeListener(_listener);
        _listener = null;
      }
    };
  }, []);

  /* const _renderTruncatedFooter = handlePress => {
    return (
      <TouchableOpacity
        hitSlop={{top: 15, left: 15, right: 15, bottom: 15}}
        onPress={handlePress}>
        <SemiBoldText style={{color: theme.colors.primary, marginTop: 5}}>
          Read more
        </SemiBoldText>
      </TouchableOpacity>
    );
  };

  const _renderRevealedFooter = handlePress => {
    return (
      <TouchableOpacity
        hitSlop={{top: 15, left: 15, right: 15, bottom: 15}}
        onPress={handlePress}>
        <SemiBoldText style={{color: theme.colors.primary, marginTop: 5}}>
          Show less
        </SemiBoldText>
      </TouchableOpacity>
    );
  }; */

  const _handlePressSpeakerTwitter = async (twitter: string) => {
    if (Platform.OS === 'web') {
      WebBrowser.openBrowserAsync('https://twitter.com/' + twitter);
    } else {
      try {
        await Linking.openURL(`twitter://user?screen_name=` + twitter);
      } catch (e) {
        WebBrowser.openBrowserAsync('https://twitter.com/' + twitter);
      }
    }
  };

  function getScheduleSlotById(slotId: number): Schedule | undefined {
    if (data.event?.groupedSchedule) {
      const days = data.event.groupedSchedule.map((day) => {
        if (day?.slots) {
          return day.slots;
        }
      });
      const scheduleSlots = days.flat() as (Schedule | undefined)[];
      const scheduleSlot = scheduleSlots.find((slot) => slot?.id === slotId);
      return scheduleSlot;
    }
  }

  function getSpeakerById(SpeakerId: number): Speaker | undefined | null {
    if (data.event?.speakers) {
      const speaker = data.event.speakers.find(
        (speaker) => speaker?.id === SpeakerId
      );
      return speaker;
    }
  }

  const params = props.route.params || {};
  let speaker: Speaker | null | undefined = null;
  let speakers: Speaker[] = [];
  let talk: Schedule | Talk | undefined = undefined;
  let videoURL: string | null = null;
  let room: string | null = null;
  const talkScreen = params.scheduleId;
  if (talkScreen) {
    if (params.scheduleId) {
      talk = getScheduleSlotById(params.scheduleId);
      if (talk?.speakers && talk.speakers.length > 0) {
        speakers = talk.speakers as Speaker[];
      }
      if (talk?.youtubeId && talk.youtubeId !== '') {
        videoURL = talk.youtubeId;
      }
      if (talk?.room) {
        room = talk.room;
      }
    }
  } else if (params.speakerId) {
    speaker = getSpeakerById(params.speakerId);
    if (speaker?.talks && speaker.talks.length > 0) {
      talk = getSpeakerTalk(speaker);
    }
  }

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
            style={{
              transform: [{scale}, {translateX}, {translateY}],
            }}>
            <ImageFadeIn placeholderStyle={{backgroundColor: 'transparent'}}>
              {talkScreen ? (
                <View style={styles.headerRowSpeaker}>
                  {speakers
                    ? speakers.map((speaker, index) => (
                        <View key={index} style={styles.headerColumnSpeaker}>
                          {speaker.avatarUrl && (
                            <TouchableOpacity>
                              <CachedImage
                                source={{uri: speaker.avatarUrl}}
                                style={styles.avatarMultiple}
                              />
                            </TouchableOpacity>
                          )}
                          {speaker.name?.split(' ').map((name, index) => (
                            <View key={index}>
                              <TouchableOpacity key={index}>
                                <SemiBoldText fontSize="sm" TextColorAccent>
                                  {name}
                                </SemiBoldText>
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      ))
                    : null}
                </View>
              ) : (
                <>
                  {speaker?.avatarUrl && (
                    <CachedImage
                      source={{uri: speaker.avatarUrl}}
                      style={styles.avatar}
                    />
                  )}
                </>
              )}
            </ImageFadeIn>
          </Animated.View>
          {!talkScreen && speaker?.name ? (
            <SemiBoldText fontSize="sm" TextColorAccent>
              {speaker.name}
            </SemiBoldText>
          ) : null}
          {speaker?.twitter ? (
            <TouchableOpacity
              onPress={() =>
                _handlePressSpeakerTwitter(speaker?.twitter as string)
              }>
              <RegularText fontSize="sm" TextColorAccent>
                @{speaker.twitter}
              </RegularText>
            </TouchableOpacity>
          ) : null}
          {talk ? (
            <BoldText
              style={styles.talkTitleText}
              fontSize="lg"
              TextColorAccent>
              {talk.title}
            </BoldText>
          ) : null}
        </View>
        {videoURL ? (
          <View>
            <WebView
              source={{
                uri: `https://www.youtube.com/embed/${videoURL}`,
              }}
              startInLoadingState
              scalesPageToFit
              javaScriptEnabled
              style={{flex: 1, height: 240}}
            />
          </View>
        ) : null}
        <AnimatableView
          animation="fadeIn"
          useNativeDriver
          delay={Platform.OS === 'ios' ? 50 : 150}
          duration={500}
          style={styles.content}>
          {!talkScreen && speaker ? (
            <View>
              <SemiBoldText style={styles.sectionHeader} fontSize="md">
                Bio
              </SemiBoldText>
              <Markdown>{speaker.bio}</Markdown>
            </View>
          ) : null}
          {talk ? (
            <SemiBoldText style={styles.sectionHeader} fontSize="md">
              {talk && talk.type === 0 ? 'Talk description' : null}
              {talk && talk.type === 1 ? 'Workshop description' : null}
              {talk && talk.type === 6 ? 'Panel description' : null}
              {talk && talk.type !== 6 && talk.type !== 0 && talk.type !== 1
                ? 'Description'
                : null}
            </SemiBoldText>
          ) : null}
          {talk?.description ? (
            <Markdown>
              {talk.description.replace(
                '**Click here to see covered subjects**',
                ''
              )}
            </Markdown>
          ) : null}
          {talkScreen && speakers?.length > 0 && talk ? (
            <View>
              <SemiBoldText style={styles.sectionHeader} fontSize="md">
                {talk.type === 1 ? 'Trainers' : 'Speakers'}
              </SemiBoldText>

              {speakers.map((speaker, index) => (
                <View key={index}>
                  <SemiBoldText>{speaker.name}</SemiBoldText>
                  <Markdown>{speaker.bio}</Markdown>
                </View>
              ))}
            </View>
          ) : null}
          {room && talk ? (
            <View>
              <SemiBoldText style={styles.sectionHeader} fontSize="md">
                Time
              </SemiBoldText>
              <RegularText>
                {convertUtcDateToEventTimezoneHour(talk.startDate)}
              </RegularText>
              <RegularText fontSize="sm">{room}</RegularText>
            </View>
          ) : null}
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
            }}>
            <CloseButton onPress={() => props.navigation.goBack()} />
          </View>
        )}
        /* TODO (Handle save talk)
         renderRightButton={() => {
          talk ? <SavedButtonNavigationItem talk={talk} /> : null; 
        }} */
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
  avatarMultiple: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
  },
  content: {
    backgroundColor: '#fff',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerRowSpeaker: {
    flexDirection: 'row',
    height: 140,
  },
  headerColumnSpeaker: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  headerContainer: {
    paddingTop: Constants.statusBarHeight + Layout.notchHeight + 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  talkTitleText: {
    marginTop: 10,
  },
  sectionHeader: {
    marginTop: 15,
    marginBottom: 3,
  },
});