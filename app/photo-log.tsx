import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { NeonButton } from '@/components/NeonButton';
import { PhotoFoodCard } from '@/components/PhotoFoodCard';
import { Screen } from '@/components/Screen';
import { SegmentedControl } from '@/components/SegmentedControl';
import { analyzeFoodPhoto, type VisionFoodItem } from '@/lib/geminiVision';
import { useFoodLogStore } from '@/store/foodLog';
import type { MealType } from '@/types/food';

interface PickedImage {
  uri: string;
  base64: string;
  mimeType: string;
}

function pickDefaultMeal(): MealType {
  const h = new Date().getHours();
  if (h < 11) return 'breakfast';
  if (h < 15) return 'lunch';
  if (h < 21) return 'dinner';
  return 'snack';
}

export default function PhotoLog() {
  const router = useRouter();
  const addEntry = useFoodLogStore((s) => s.addEntry);

  const [image, setImage] = useState<PickedImage | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [items, setItems] = useState<VisionFoodItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [grams, setGrams] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [meal, setMeal] = useState<MealType>(pickDefaultMeal());

  const resetResults = () => {
    setItems([]);
    setError(null);
    setGrams({});
    setSelected(new Set());
  };

  const onPick = async (source: 'camera' | 'library') => {
    setError(null);
    const perm =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError(
        source === 'camera'
          ? 'Camera permission was denied.'
          : 'Photo library permission was denied.',
      );
      return;
    }
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            base64: true,
            quality: 0.7,
            allowsEditing: false,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            base64: true,
            quality: 0.7,
            allowsEditing: false,
          });
    if (result.canceled || !result.assets || result.assets.length === 0) return;
    const asset = result.assets[0];
    if (!asset.base64) {
      setError('Could not read image data — try again.');
      return;
    }
    setImage({
      uri: asset.uri,
      base64: asset.base64,
      mimeType: asset.mimeType ?? 'image/jpeg',
    });
    resetResults();
  };

  const onAnalyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    setError(null);
    try {
      const res = await analyzeFoodPhoto({
        imageBase64: image.base64,
        mimeType: image.mimeType,
      });
      if (res.items.length === 0) {
        setError("Couldn't identify any food in this photo. Try a clearer shot.");
        setItems([]);
        return;
      }
      const nextGrams: Record<number, string> = {};
      const nextSelected = new Set<number>();
      res.items.forEach((it, idx) => {
        nextGrams[idx] = String(Math.round(it.estimatedGrams));
        nextSelected.add(idx);
      });
      setItems(res.items);
      setGrams(nextGrams);
      setSelected(nextSelected);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const selectedItems = useMemo(
    () =>
      items
        .map((it, idx) => ({ it, idx }))
        .filter(({ idx }) => selected.has(idx)),
    [items, selected],
  );

  const totalKcal = useMemo(() => {
    let sum = 0;
    selectedItems.forEach(({ it, idx }) => {
      const g = Number(grams[idx]);
      if (Number.isFinite(g) && g > 0) sum += (it.per100g.kcal * g) / 100;
    });
    return Math.round(sum);
  }, [selectedItems, grams]);

  const canAdd = selectedItems.length > 0 && !analyzing;

  const onAddAll = () => {
    selectedItems.forEach(({ it, idx }) => {
      const g = Number(grams[idx]);
      if (!Number.isFinite(g) || g <= 0) return;
      addEntry({
        fdcId: 0,
        description: it.name,
        meal,
        grams: g,
        per100g: it.per100g,
      });
    });
    router.back();
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
        <Text
          style={{
            flex: 1,
            fontFamily: 'SpaceGrotesk_700Bold',
            color: '#F5F7FA',
            fontSize: 26,
            letterSpacing: -0.5,
          }}
        >
          Snap food
        </Text>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_500Medium',
              color: '#A0A6B8',
              fontSize: 15,
            }}
          >
            Close
          </Text>
        </Pressable>
      </View>
      <Text
        style={{
          fontFamily: 'SpaceGrotesk_500Medium',
          color: '#00E5FF',
          fontSize: 14,
          marginBottom: 14,
          textShadowColor: 'rgba(0,229,255,0.5)',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 12,
        }}
      >
        Let the camera do the logging 📸
      </Text>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
        <View
          style={{
            borderRadius: 20,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: image ? 'rgba(0,255,135,0.32)' : '#1F2330',
            backgroundColor: 'rgba(18,21,28,0.6)',
            aspectRatio: 4 / 3,
            marginBottom: 12,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {image ? (
            <Image
              source={{ uri: image.uri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <Text style={{ fontSize: 38, marginBottom: 6 }}>🍽️</Text>
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_500Medium',
                  color: '#A0A6B8',
                  fontSize: 13,
                  textAlign: 'center',
                }}
              >
                Snap a photo of your meal, or pick one from your library.
              </Text>
            </View>
          )}
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
          <Pressable
            onPress={() => onPick('camera')}
            style={{
              flex: 1,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#2B3142',
              backgroundColor: 'rgba(18,21,28,0.85)',
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 22 }}>📷</Text>
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_600SemiBold',
                color: '#F5F7FA',
                fontSize: 13,
                marginTop: 4,
              }}
            >
              Camera
            </Text>
          </Pressable>
          <Pressable
            onPress={() => onPick('library')}
            style={{
              flex: 1,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#2B3142',
              backgroundColor: 'rgba(18,21,28,0.85)',
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 22 }}>🖼️</Text>
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_600SemiBold',
                color: '#F5F7FA',
                fontSize: 13,
                marginTop: 4,
              }}
            >
              Library
            </Text>
          </Pressable>
        </View>

        {error ? (
          <View
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: 'rgba(255,61,172,0.45)',
              backgroundColor: 'rgba(255,61,172,0.08)',
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_500Medium',
                color: '#FF3DAC',
                fontSize: 12,
              }}
            >
              {error}
            </Text>
          </View>
        ) : null}

        {image && items.length === 0 && !analyzing ? (
          <NeonButton label="Analyze photo" onPress={onAnalyze} />
        ) : null}

        {analyzing ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 14,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: 'rgba(0,229,255,0.35)',
              backgroundColor: 'rgba(0,229,255,0.06)',
              marginBottom: 12,
            }}
          >
            <ActivityIndicator color="#00E5FF" />
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_500Medium',
                color: '#00E5FF',
                fontSize: 13,
                marginLeft: 10,
              }}
            >
              Analyzing your photo with Gemini…
            </Text>
          </View>
        ) : null}

        {items.length > 0 ? (
          <Animated.View entering={FadeIn.duration(280)}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                marginBottom: 10,
                marginTop: 4,
              }}
            >
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_500Medium',
                  color: '#A0A6B8',
                  fontSize: 11,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                }}
              >
                Detected items
              </Text>
              <Pressable onPress={onAnalyze} hitSlop={8}>
                <Text
                  style={{
                    fontFamily: 'SpaceGrotesk_600SemiBold',
                    color: '#00E5FF',
                    fontSize: 12,
                  }}
                >
                  Re-analyze
                </Text>
              </Pressable>
            </View>

            {items.map((it, idx) => (
              <Animated.View key={idx} entering={FadeInDown.delay(idx * 50).duration(280)}>
                <PhotoFoodCard
                  item={it}
                  grams={grams[idx] ?? String(Math.round(it.estimatedGrams))}
                  selected={selected.has(idx)}
                  onGramsChange={(v) => setGrams((g) => ({ ...g, [idx]: v }))}
                  onToggleSelect={() =>
                    setSelected((s) => {
                      const next = new Set(s);
                      if (next.has(idx)) next.delete(idx);
                      else next.add(idx);
                      return next;
                    })
                  }
                />
              </Animated.View>
            ))}

            <View
              style={{
                borderRadius: 14,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: 'rgba(0,255,135,0.28)',
                padding: 14,
                marginVertical: 14,
              }}
            >
              <LinearGradient
                colors={[
                  'rgba(0,255,135,0.14)',
                  'rgba(0,229,255,0.05)',
                  'rgba(18,21,28,0.92)',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_500Medium',
                  color: '#A0A6B8',
                  fontSize: 10,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                }}
              >
                Selected total
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 2 }}>
                <Text
                  style={{
                    fontFamily: 'SpaceGrotesk_700Bold',
                    color: '#00FF87',
                    fontSize: 28,
                    letterSpacing: -1,
                    textShadowColor: 'rgba(0,255,135,0.5)',
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 14,
                  }}
                >
                  {totalKcal}
                </Text>
                <Text
                  style={{
                    fontFamily: 'SpaceGrotesk_500Medium',
                    color: '#A0A6B8',
                    fontSize: 12,
                    marginLeft: 6,
                  }}
                >
                  kcal · {selectedItems.length} item{selectedItems.length === 1 ? '' : 's'}
                </Text>
              </View>
            </View>

            <SegmentedControl<MealType>
              label="Meal"
              options={[
                { value: 'breakfast', label: 'Breakfast' },
                { value: 'lunch', label: 'Lunch' },
                { value: 'dinner', label: 'Dinner' },
                { value: 'snack', label: 'Snack' },
              ]}
              value={meal}
              onChange={setMeal}
            />

            <NeonButton
              label={`Add ${selectedItems.length} item${
                selectedItems.length === 1 ? '' : 's'
              } to ${meal}`}
              onPress={onAddAll}
              disabled={!canAdd}
            />
          </Animated.View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
