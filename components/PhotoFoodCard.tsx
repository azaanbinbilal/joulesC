import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { foodEmoji, MACRO_COLOR } from '@/lib/foodVisual';
import type { VisionFoodItem } from '@/lib/geminiVision';

const INPUT_OUTLINE_RESET = {
  outlineStyle: 'none',
  outlineWidth: 0,
  outlineColor: 'transparent',
} as object;

interface Props {
  item: VisionFoodItem;
  grams: string;
  selected: boolean;
  onGramsChange: (value: string) => void;
  onToggleSelect: () => void;
}

function safeNumber(grams: string): number {
  const n = Number(grams);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function PhotoFoodCard({
  item,
  grams,
  selected,
  onGramsChange,
  onToggleSelect,
}: Props) {
  const g = safeNumber(grams);
  const scale = g / 100;
  const kcal = item.per100g.kcal * scale;
  const protein = item.per100g.protein * scale;
  const carbs = item.per100g.carbs * scale;
  const fat = item.per100g.fat * scale;
  const emoji = foodEmoji(item.name);
  const conf = Math.round(item.confidence * 100);

  return (
    <View
      style={{
        backgroundColor: 'rgba(18,21,28,0.85)',
        borderColor: selected ? '#00FF87' : '#1F2330',
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        shadowColor: '#00FF87',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: selected ? 0.32 : 0,
        shadowRadius: 14,
        elevation: selected ? 6 : 0,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'rgba(5,6,10,0.6)',
            borderColor: '#2B3142',
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 22 }}>{emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_600SemiBold',
              color: '#F5F7FA',
              fontSize: 14,
            }}
            numberOfLines={2}
          >
            {item.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <View
              style={{
                borderRadius: 999,
                borderWidth: 1,
                borderColor: 'rgba(0,229,255,0.35)',
                paddingHorizontal: 8,
                paddingVertical: 2,
                backgroundColor: 'rgba(0,229,255,0.1)',
              }}
            >
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_600SemiBold',
                  color: '#00E5FF',
                  fontSize: 10,
                  letterSpacing: 0.5,
                }}
              >
                {conf}% confidence
              </Text>
            </View>
          </View>
        </View>
        <Text
          onPress={onToggleSelect}
          suppressHighlighting
          style={{
            fontFamily: 'SpaceGrotesk_700Bold',
            color: selected ? '#00FF87' : '#5C6275',
            fontSize: 18,
            paddingLeft: 10,
          }}
        >
          {selected ? '✓' : '○'}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(5,6,10,0.55)',
          borderColor: selected ? '#00FF87' : '#2B3142',
          borderWidth: 1,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          marginTop: 12,
        }}
      >
        <TextInput
          value={grams}
          onChangeText={onGramsChange}
          keyboardType="numeric"
          inputMode="numeric"
          selectionColor="#00FF87"
          underlineColorAndroid="transparent"
          selectTextOnFocus
          style={[
            {
              flex: 1,
              color: '#F5F7FA',
              fontFamily: 'SpaceGrotesk_700Bold',
              fontSize: 16,
            },
            INPUT_OUTLINE_RESET,
          ]}
        />
        <Text
          style={{
            color: '#00FF87',
            fontFamily: 'SpaceGrotesk_600SemiBold',
            fontSize: 13,
            marginLeft: 8,
          }}
        >
          g
        </Text>
      </View>

      <View
        style={{
          marginTop: 12,
          borderRadius: 12,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: 'rgba(0,255,135,0.22)',
          padding: 12,
        }}
      >
        <LinearGradient
          colors={[
            'rgba(0,255,135,0.10)',
            'rgba(0,229,255,0.04)',
            'rgba(18,21,28,0.92)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_700Bold',
              color: '#00FF87',
              fontSize: 22,
              letterSpacing: -0.5,
            }}
          >
            {Math.round(kcal)}
          </Text>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_500Medium',
              color: '#A0A6B8',
              fontSize: 12,
              marginLeft: 6,
            }}
          >
            kcal
          </Text>
        </View>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_500Medium',
            color: '#A0A6B8',
            fontSize: 11,
            marginTop: 4,
          }}
        >
          <Text style={{ color: MACRO_COLOR.protein }}>{protein.toFixed(1)}P</Text>
          {'  ·  '}
          <Text style={{ color: MACRO_COLOR.carbs }}>{carbs.toFixed(1)}C</Text>
          {'  ·  '}
          <Text style={{ color: MACRO_COLOR.fat }}>{fat.toFixed(1)}F</Text>
        </Text>
      </View>
    </View>
  );
}
