import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { NeonButton } from '@/components/NeonButton';
import { Screen } from '@/components/Screen';
import { SegmentedControl } from '@/components/SegmentedControl';
import {
  applyFilter,
  dominantMacro,
  FILTER_OPTIONS,
  foodEmoji,
  isCleanData,
  MACRO_COLOR,
  macroSplit,
  SUGGESTION_CHIPS,
  type SearchFilter,
} from '@/lib/foodVisual';
import {
  findMatchingPreset,
  getServingPresets,
  type ServingPreset,
} from '@/lib/servingPresets';
import { searchFoods, type USDASearchResult } from '@/lib/usda';
import { useFoodLogStore } from '@/store/foodLog';
import type { MealType } from '@/types/food';

const INPUT_OUTLINE_RESET = {
  outlineStyle: 'none',
  outlineWidth: 0,
  outlineColor: 'transparent',
} as object;

function pickDefaultMeal(): MealType {
  const h = new Date().getHours();
  if (h < 11) return 'breakfast';
  if (h < 15) return 'lunch';
  if (h < 21) return 'dinner';
  return 'snack';
}

function isPureGramsLabel(label: string): boolean {
  return /^\d+\s*g$/.test(label.replace(/\s/g, ''));
}

export default function FoodSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<USDASearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<USDASearchResult | null>(null);
  const [grams, setGrams] = useState('100');
  const [servingLabel, setServingLabel] = useState<string | null>(null);
  const [meal, setMeal] = useState<MealType>(pickDefaultMeal());
  const [filter, setFilter] = useState<SearchFilter>('all');

  const addEntry = useFoodLogStore((s) => s.addEntry);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setError(null);
      return;
    }
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);

    const t = setTimeout(() => {
      searchFoods({ query: q, pageSize: 25, signal: ctrl.signal })
        .then((r) => {
          if (!ctrl.signal.aborted) setResults(r);
        })
        .catch((e: unknown) => {
          if (ctrl.signal.aborted) return;
          setError(e instanceof Error ? e.message : 'Search failed.');
          setResults([]);
        })
        .finally(() => {
          if (!ctrl.signal.aborted) setLoading(false);
        });
    }, 350);

    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  const cleanResults = useMemo(() => results.filter(isCleanData), [results]);
  const filteredResults = useMemo(
    () => cleanResults.filter((r) => applyFilter(r, filter)),
    [cleanResults, filter],
  );

  const presets = useMemo<ServingPreset[]>(
    () => (selected ? getServingPresets(selected.description) : []),
    [selected],
  );

  const gramsNum = Number(grams);
  const safeGrams = Number.isFinite(gramsNum) && gramsNum > 0 ? gramsNum : 0;
  const valid = !!selected && safeGrams > 0 && safeGrams < 5000;

  const previewMacros = useMemo(() => {
    if (!selected) return null;
    const scale = safeGrams / 100;
    return {
      kcal: selected.per100g.kcal * scale,
      protein: selected.per100g.protein * scale,
      carbs: selected.per100g.carbs * scale,
      fat: selected.per100g.fat * scale,
      fiber: selected.per100g.fiber * scale,
    };
  }, [selected, safeGrams]);

  const onPickPreset = (p: ServingPreset) => {
    setGrams(String(p.grams));
    setServingLabel(p.label);
  };

  const onChangeCustomGrams = (v: string) => {
    setGrams(v);
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) {
      const matched = findMatchingPreset(presets, n);
      setServingLabel(matched ? matched.label : null);
    } else {
      setServingLabel(null);
    }
  };

  const onSelectResult = (r: USDASearchResult, active: boolean) => {
    if (active) {
      setSelected(null);
      setServingLabel(null);
      return;
    }
    setSelected(r);
    const newPresets = getServingPresets(r.description);
    const first = newPresets[0];
    setGrams(String(first.grams));
    setServingLabel(first.label);
  };

  const onAdd = () => {
    if (!selected || !valid) return;
    addEntry({
      fdcId: selected.fdcId,
      description: selected.description,
      brand: selected.brand,
      meal,
      grams: safeGrams,
      servingLabel: servingLabel ?? undefined,
      per100g: selected.per100g,
    });
    router.back();
  };

  const buttonLabel = useMemo(() => {
    if (!selected) return 'Pick a food';
    if (servingLabel && !isPureGramsLabel(servingLabel)) {
      return `Add ${servingLabel} (${safeGrams}g) to ${meal}`;
    }
    return `Add ${safeGrams}g to ${meal}`;
  }, [selected, servingLabel, safeGrams, meal]);

  const showSuggestions = query.trim().length < 2;
  const showFilters = !showSuggestions && cleanResults.length > 0;

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
          Add food
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
          color: '#00FF87',
          fontSize: 14,
          marginBottom: 14,
          textShadowColor: 'rgba(0,255,135,0.5)',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 12,
        }}
      >
        What did you eat? 👀
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(18,21,28,0.85)',
          borderColor: '#1F2330',
          borderWidth: 1,
          borderRadius: 14,
          paddingHorizontal: 16,
          paddingVertical: 12,
          marginBottom: 12,
        }}
      >
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search foods... e.g. banana, paneer, oats"
          placeholderTextColor="#5C6275"
          autoFocus
          selectionColor="#00FF87"
          underlineColorAndroid="transparent"
          selectTextOnFocus
          style={[
            {
              flex: 1,
              color: '#F5F7FA',
              fontFamily: 'SpaceGrotesk_500Medium',
              fontSize: 16,
            },
            INPUT_OUTLINE_RESET,
          ]}
        />
        {loading ? <ActivityIndicator color="#00FF87" /> : null}
      </View>

      {showSuggestions ? (
        <View style={{ marginBottom: 8 }}>
          <Text style={LABEL}>Quick add</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingRight: 16 }}
          >
            {SUGGESTION_CHIPS.map((c, i) => (
              <Animated.View
                key={c.label}
                entering={FadeInDown.delay(i * 40).duration(360)}
              >
                <Pressable
                  onPress={() => setQuery(c.query)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(18,21,28,0.9)',
                    borderColor: '#2B3142',
                    borderWidth: 1,
                    borderRadius: 999,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                  }}
                >
                  <Text style={{ fontSize: 16, marginRight: 6 }}>{c.emoji}</Text>
                  <Text
                    style={{
                      fontFamily: 'SpaceGrotesk_600SemiBold',
                      color: '#F5F7FA',
                      fontSize: 13,
                    }}
                  >
                    {c.label}
                  </Text>
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {showFilters ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingRight: 16, marginBottom: 4 }}
          style={{ marginBottom: 6, flexGrow: 0 }}
        >
          {FILTER_OPTIONS.map((opt) => {
            const active = filter === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setFilter(opt.value)}
                style={{
                  borderRadius: 999,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: active ? '#00FF87' : '#2B3142',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  backgroundColor: active ? 'transparent' : 'rgba(18,21,28,0.9)',
                }}
              >
                {active ? (
                  <LinearGradient
                    colors={['rgba(0,255,135,0.18)', 'rgba(0,229,255,0.06)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                ) : null}
                <Text
                  style={{
                    fontFamily: 'SpaceGrotesk_600SemiBold',
                    color: active ? '#00FF87' : '#A0A6B8',
                    fontSize: 12,
                  }}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      {error ? (
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_500Medium',
            color: '#FF3DAC',
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          {error}
        </Text>
      ) : null}

      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        {!showSuggestions && filteredResults.length === 0 && !loading ? (
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_400Regular',
              color: '#5C6275',
              fontSize: 14,
              textAlign: 'center',
              marginTop: 24,
            }}
          >
            {cleanResults.length === 0
              ? 'No results. Try a simpler keyword.'
              : 'No matches for this filter. Try "All".'}
          </Text>
        ) : null}

        {filteredResults.map((r, i) => {
          const active = selected?.fdcId === r.fdcId;
          const dom = dominantMacro(r.per100g);
          const split = macroSplit(r.per100g);
          const emoji = foodEmoji(r.description);
          return (
            <Animated.View key={r.fdcId} entering={FadeInDown.delay(i * 25).duration(280)}>
              <View
                style={{
                  backgroundColor: 'rgba(18,21,28,0.85)',
                  borderColor: active ? '#00FF87' : '#1F2330',
                  borderWidth: 1,
                  borderLeftWidth: 4,
                  borderLeftColor: MACRO_COLOR[dom],
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 10,
                  shadowColor: '#00FF87',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: active ? 0.35 : 0,
                  shadowRadius: 14,
                  elevation: active ? 6 : 0,
                }}
              >
                <Pressable onPress={() => onSelectResult(r, active)} style={{ flexDirection: 'row' }}>
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
                      {r.description}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'SpaceGrotesk_400Regular',
                        color: '#A0A6B8',
                        fontSize: 11,
                        marginTop: 4,
                      }}
                    >
                      {r.brand ? `${r.brand} · ` : ''}
                      {Math.round(r.per100g.kcal)} kcal ·{' '}
                      <Text style={{ color: MACRO_COLOR.protein }}>
                        {r.per100g.protein.toFixed(1)}P
                      </Text>{' '}
                      ·{' '}
                      <Text style={{ color: MACRO_COLOR.carbs }}>
                        {r.per100g.carbs.toFixed(1)}C
                      </Text>{' '}
                      ·{' '}
                      <Text style={{ color: MACRO_COLOR.fat }}>
                        {r.per100g.fat.toFixed(1)}F
                      </Text>{' '}
                      / 100g
                    </Text>
                    {split ? (
                      <View
                        style={{
                          flexDirection: 'row',
                          height: 4,
                          borderRadius: 2,
                          overflow: 'hidden',
                          backgroundColor: '#1F2330',
                          marginTop: 8,
                        }}
                      >
                        <View
                          style={{
                            width: `${split.proteinPct}%`,
                            backgroundColor: MACRO_COLOR.protein,
                          }}
                        />
                        <View
                          style={{
                            width: `${split.carbsPct}%`,
                            backgroundColor: MACRO_COLOR.carbs,
                          }}
                        />
                        <View
                          style={{
                            width: `${split.fatPct}%`,
                            backgroundColor: MACRO_COLOR.fat,
                          }}
                        />
                      </View>
                    ) : null}
                  </View>
                </Pressable>

                {active ? (
                  <Animated.View entering={FadeIn.duration(220)} style={{ marginTop: 14 }}>
                    <Text style={LABEL}>Serving</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: 8, paddingRight: 16 }}
                      style={{ marginBottom: 12, flexGrow: 0 }}
                    >
                      {presets.map((p) => {
                        const activeChip = servingLabel === p.label;
                        return (
                          <Pressable
                            key={p.label}
                            onPress={() => onPickPreset(p)}
                            style={{
                              borderRadius: 999,
                              overflow: 'hidden',
                              borderWidth: 1,
                              borderColor: activeChip ? '#00FF87' : '#2B3142',
                              paddingHorizontal: 14,
                              paddingVertical: 9,
                              backgroundColor: activeChip
                                ? 'transparent'
                                : 'rgba(5,6,10,0.6)',
                              shadowColor: '#00FF87',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: activeChip ? 0.4 : 0,
                              shadowRadius: 12,
                            }}
                          >
                            {activeChip ? (
                              <LinearGradient
                                colors={[
                                  'rgba(0,255,135,0.22)',
                                  'rgba(0,229,255,0.08)',
                                ]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={StyleSheet.absoluteFill}
                              />
                            ) : null}
                            <Text
                              style={{
                                fontFamily: 'SpaceGrotesk_600SemiBold',
                                color: activeChip ? '#00FF87' : '#A0A6B8',
                                fontSize: 13,
                              }}
                            >
                              {p.label}
                            </Text>
                            {p.label !== `${p.grams}g` ? (
                              <Text
                                style={{
                                  fontFamily: 'SpaceGrotesk_400Regular',
                                  color: activeChip ? '#00FF87' : '#5C6275',
                                  fontSize: 10,
                                  marginTop: 1,
                                }}
                              >
                                {p.grams}g
                              </Text>
                            ) : null}
                          </Pressable>
                        );
                      })}
                    </ScrollView>

                    <Text style={LABEL}>Custom grams</Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: 'rgba(5,6,10,0.6)',
                        borderColor: servingLabel ? '#2B3142' : '#00FF87',
                        borderWidth: 1,
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        marginBottom: 12,
                        shadowColor: '#00FF87',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: servingLabel ? 0 : 0.35,
                        shadowRadius: 14,
                      }}
                    >
                      <TextInput
                        value={grams}
                        onChangeText={onChangeCustomGrams}
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
                            fontSize: 18,
                          },
                          INPUT_OUTLINE_RESET,
                        ]}
                      />
                      <Text
                        style={{
                          color: '#00FF87',
                          fontFamily: 'SpaceGrotesk_600SemiBold',
                          fontSize: 14,
                          marginLeft: 8,
                        }}
                      >
                        g
                      </Text>
                    </View>

                    {previewMacros ? (
                      <View
                        style={{
                          borderRadius: 14,
                          overflow: 'hidden',
                          borderWidth: 1,
                          borderColor: 'rgba(0,255,135,0.28)',
                          padding: 14,
                          marginBottom: 12,
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
                          This adds
                        </Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'baseline',
                            marginTop: 2,
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: 'SpaceGrotesk_700Bold',
                              color: '#00FF87',
                              fontSize: 32,
                              letterSpacing: -1,
                              textShadowColor: 'rgba(0,255,135,0.5)',
                              textShadowOffset: { width: 0, height: 0 },
                              textShadowRadius: 14,
                            }}
                          >
                            {Math.round(previewMacros.kcal)}
                          </Text>
                          <Text
                            style={{
                              fontFamily: 'SpaceGrotesk_500Medium',
                              color: '#A0A6B8',
                              fontSize: 13,
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
                            fontSize: 12,
                            marginTop: 4,
                            lineHeight: 18,
                          }}
                        >
                          <Text style={{ color: '#F5F7FA' }}>
                            {previewMacros.protein.toFixed(1)}g
                          </Text>{' '}
                          protein ·{' '}
                          <Text style={{ color: '#F5F7FA' }}>
                            {previewMacros.carbs.toFixed(1)}g
                          </Text>{' '}
                          carbs ·{' '}
                          <Text style={{ color: '#F5F7FA' }}>
                            {previewMacros.fat.toFixed(1)}g
                          </Text>{' '}
                          fat ·{' '}
                          <Text style={{ color: '#F5F7FA' }}>
                            {previewMacros.fiber.toFixed(1)}g
                          </Text>{' '}
                          fiber
                        </Text>
                      </View>
                    ) : null}

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

                    <NeonButton label={buttonLabel} onPress={onAdd} disabled={!valid} />
                  </Animated.View>
                ) : null}
              </View>
            </Animated.View>
          );
        })}
        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  );
}

const LABEL = {
  fontFamily: 'SpaceGrotesk_500Medium',
  color: '#A0A6B8',
  fontSize: 11,
  letterSpacing: 2,
  textTransform: 'uppercase',
  marginBottom: 8,
} as const;
