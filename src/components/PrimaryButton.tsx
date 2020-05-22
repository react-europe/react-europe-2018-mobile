import '@expo/match-media';
import React from 'react';
import {StyleSheet} from 'react-native';
import {View} from 'react-native-animatable';
import {RectButton} from 'react-native-gesture-handler';
import {Theme, useTheme} from 'react-native-paper';

import useScreenWidth from '../utils/useScreenWidth';

type Props = {
  onPress: () => void;
  children: React.ReactNode;
};

export default function PrimaryButton(props: Props) {
  const {colors}: Theme = useTheme();
  const isSmallScreen = useScreenWidth();

  if (isSmallScreen) {
    return (
      <RectButton
        style={[styles.PrimaryButton, {backgroundColor: colors.primary}]}
        onPress={props.onPress}>
        {props.children}
      </RectButton>
    );
  }

  return (
    <View style={[styles.centerContainer]}>
      <RectButton
        style={[
          styles.PrimaryButton,
          {backgroundColor: colors.primary},
          styles.PrimaryButtonWeb,
        ]}
        onPress={props.onPress}>
        {props.children}
      </RectButton>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    alignItems: 'center',
  },
  PrimaryButtonWeb: {
    width: '400px',
  },
  PrimaryButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    marginTop: 10,
    overflow: 'hidden',
    borderRadius: 3,
    flexDirection: 'row',
  },
});
