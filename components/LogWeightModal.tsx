import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

import { NeonButton } from '@/components/NeonButton';

const INPUT_OUTLINE_RESET = {
  outlineStyle: 'none',
  outlineWidth: 0,
  outlineColor: 'transparent',
} as object;

interface Props {
  visible: boolean;
  initialWeightKg?: number;
  onClose: () => void;
  onSubmit: (weightKg: number) => void;
}

export function LogWeightModal({ visible, initialWeightKg, onClose, onSubmit }: Props) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (visible) {
      setValue(initialWeightKg ? initialWeightKg.toFixed(1) : '');
    }
  }, [visible, initialWeightKg]);

  const numeric = Number(value);
  const valid = Number.isFinite(numeric) && numeric > 20 && numeric < 400;

  const handleSubmit = () => {
    if (!valid) return;
    onSubmit(numeric);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View
        entering={FadeIn.duration(180)}
        style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
      >
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <Animated.View entering={SlideInDown.duration(260)}>
            <View
              style={{
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                overflow: 'hidden',
                borderColor: 'rgba(0,255,135,0.32)',
                borderWidth: 1,
                paddingHorizontal: 24,
                paddingTop: 22,
                paddingBottom: 32,
              }}
            >
              <LinearGradient
                colors={['rgba(18,21,28,0.98)', 'rgba(5,6,10,0.98)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />

              <View
                style={{
                  alignSelf: 'center',
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: '#2B3142',
                  marginBottom: 18,
                }}
              />

              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_700Bold',
                  color: '#F5F7FA',
                  fontSize: 22,
                  letterSpacing: -0.4,
                }}
              >
                Log weight
              </Text>
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_500Medium',
                  color: '#00FF87',
                  fontSize: 13,
                  marginBottom: 18,
                  textShadowColor: 'rgba(0,255,135,0.5)',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 10,
                }}
              >
                Today's weigh-in 📊
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(5,6,10,0.6)',
                  borderColor: '#00FF87',
                  borderWidth: 1,
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  marginBottom: 18,
                  shadowColor: '#00FF87',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.3,
                  shadowRadius: 14,
                }}
              >
                <TextInput
                  value={value}
                  onChangeText={setValue}
                  placeholder="0.0"
                  placeholderTextColor="#5C6275"
                  keyboardType="decimal-pad"
                  inputMode="decimal"
                  autoFocus
                  selectionColor="#00FF87"
                  underlineColorAndroid="transparent"
                  selectTextOnFocus
                  style={[
                    {
                      flex: 1,
                      color: '#F5F7FA',
                      fontFamily: 'SpaceGrotesk_700Bold',
                      fontSize: 28,
                      letterSpacing: -0.5,
                    },
                    INPUT_OUTLINE_RESET,
                  ]}
                />
                <Text
                  style={{
                    color: '#00FF87',
                    fontFamily: 'SpaceGrotesk_600SemiBold',
                    fontSize: 16,
                    marginLeft: 8,
                  }}
                >
                  kg
                </Text>
              </View>

              <NeonButton label="Save" onPress={handleSubmit} disabled={!valid} />
              <NeonButton label="Cancel" variant="ghost" onPress={onClose} />
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}
