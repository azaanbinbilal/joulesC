import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { MacroBar } from '@/components/MacroBar';
import { MacroRing } from '@/components/MacroRing';
import { NeonButton } from '@/components/NeonButton';
import { Screen } from '@/components/Screen';
import { buildGoalPlan, calcBMR, calcTDEE } from '@/lib/health';
import {
  addTotals,
  computeMacroTargets,
  emptyTotals,
  scalePer100g,
  type MacroTotals,
} from '@/lib/macros';
import { todayISO, useFoodLogStore } from '@/store/foodLog';
import { useProfileStore } from '@/store/profile';
import { MEAL_LABEL, MEAL_ORDER, type FoodEntry, type MealType } from '@/types/food';

export default function Dashboard() {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const clearProfile = useProfileStore((s) => s.clearProfile);
  const entries = useFoodLogStore((s) => s.entries);
  const removeEntry = useFoodLogStore((s) => s.removeEntry);

  const today = todayISO();
  const todayEntries = useMemo(
    () => entries.filter((e) => e.date === today),
    [entries, today],
  );

  const { target, totals, kcalTarget } = useMemo(() => {
    if (!profile) {
      return { target: null as null | ReturnType<typeof computeMacroTargets>, totals: emptyTotals(), kcalTarget: 0 };
    }
    const bmr = calcBMR(profile.weightKg, profile.heightCm, profile.age, profile.sex);
    const tdee = calcTDEE(bmr, profile.activity);
    let kcal = Math.round(tdee);
    let direction = profile.goal?.direction ?? 'maintain';
    if (profile.goal && profile.goal.direction !== 'maintain') {
      const plan = buildGoalPlan({
        currentWeightKg: profile.weightKg,
        targetWeightKg: profile.goal.targetWeightKg,
        weeks: profile.goal.weeks,
        tdee,
      });
      kcal = plan.dailyKcalTarget;
    }
    const macroTarget = computeMacroTargets(kcal, profile.weightKg, direction);
    const summed = todayEntries.reduce<MacroTotals>(
      (acc, e) => addTotals(acc, scalePer100g(e.per100g, e.grams)),
      emptyTotals(),
    );
    return { target: macroTarget, totals: summed, kcalTarget: kcal };
  }, [profile, todayEntries]);

  if (!profile || !target) return null;

  const entriesByMeal: Record<MealType, FoodEntry[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };
  todayEntries.forEach((e) => entriesByMeal[e.meal].push(e));

  return (
    <Screen>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(450)}>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_400Regular',
              color: '#A0A6B8',
              fontSize: 14,
            }}
          >
            Welcome back,
          </Text>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_700Bold',
              color: '#F5F7FA',
              fontSize: 30,
              letterSpacing: -0.5,
            }}
          >
            {profile.name || 'there'}
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(120).duration(500)}
          style={{ marginTop: 22 }}
        >
          <View
            style={{
              borderRadius: 24,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: 'rgba(0,255,135,0.28)',
              padding: 20,
              shadowColor: '#00FF87',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.32,
              shadowRadius: 22,
              elevation: 10,
            }}
          >
            <LinearGradient
              colors={['rgba(0,255,135,0.16)', 'rgba(0,229,255,0.06)', 'rgba(18,21,28,0.92)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={{ alignItems: 'center', marginBottom: 18 }}>
              <MacroRing
                size={200}
                strokeWidth={14}
                value={totals.kcal}
                target={target.kcal}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <MacroBar
                label="Protein"
                value={totals.protein}
                target={target.protein}
                colors={['#00FF87', '#00E5FF']}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
              <MacroBar
                label="Carbs"
                value={totals.carbs}
                target={target.carbs}
                colors={['#8A5CF6', '#00E5FF']}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
              <MacroBar
                label="Fat"
                value={totals.fat}
                target={target.fat}
                colors={['#FFC857', '#FF3DAC']}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
              <MacroBar
                label="Fiber"
                value={totals.fiber}
                target={target.fiber}
                colors={['#39FF8B', '#FFC857']}
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(220).duration(500)} style={{ marginTop: 18 }}>
          {MEAL_ORDER.map((meal) => (
            <MealSection
              key={meal}
              meal={meal}
              entries={entriesByMeal[meal]}
              onRemove={removeEntry}
            />
          ))}
        </Animated.View>

        <View style={{ marginTop: 8, gap: 8 }}>
          <NeonButton label="+ Add food" onPress={() => router.push('/food-search')} />
          <NeonButton label="Reset profile" variant="ghost" onPress={clearProfile} />
        </View>
      </ScrollView>
    </Screen>
  );
}

function MealSection({
  meal,
  entries,
  onRemove,
}: {
  meal: MealType;
  entries: FoodEntry[];
  onRemove: (id: string) => void;
}) {
  const mealKcal = entries.reduce(
    (s, e) => s + (e.per100g.kcal * e.grams) / 100,
    0,
  );

  return (
    <View style={{ marginBottom: 14 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_600SemiBold',
            color: '#F5F7FA',
            fontSize: 15,
            letterSpacing: 0.3,
          }}
        >
          {MEAL_LABEL[meal]}
        </Text>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_500Medium',
            color: '#A0A6B8',
            fontSize: 12,
          }}
        >
          {entries.length === 0 ? 'No items' : `${Math.round(mealKcal)} kcal`}
        </Text>
      </View>
      {entries.length === 0 ? (
        <View
          style={{
            borderColor: '#1F2330',
            borderWidth: 1,
            borderStyle: 'dashed',
            borderRadius: 12,
            paddingVertical: 14,
            paddingHorizontal: 14,
            backgroundColor: 'rgba(18,21,28,0.5)',
          }}
        >
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_400Regular',
              color: '#5C6275',
              fontSize: 12,
            }}
          >
            Nothing logged yet.
          </Text>
        </View>
      ) : (
        entries.map((e) => (
          <FoodRow key={e.id} entry={e} onRemove={() => onRemove(e.id)} />
        ))
      )}
    </View>
  );
}

function FoodRow({ entry, onRemove }: { entry: FoodEntry; onRemove: () => void }) {
  const kcal = Math.round((entry.per100g.kcal * entry.grams) / 100);
  const protein = ((entry.per100g.protein * entry.grams) / 100).toFixed(1);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(18,21,28,0.85)',
        borderColor: '#1F2330',
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
      }}
    >
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_600SemiBold',
            color: '#F5F7FA',
            fontSize: 13,
          }}
          numberOfLines={1}
        >
          {entry.description}
        </Text>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_400Regular',
            color: '#A0A6B8',
            fontSize: 11,
            marginTop: 2,
          }}
        >
          {entry.grams}g · {kcal} kcal · {protein}g P
        </Text>
      </View>
      <Pressable onPress={onRemove} hitSlop={10}>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_500Medium',
            color: '#5C6275',
            fontSize: 18,
          }}
        >
          ×
        </Text>
      </Pressable>
    </View>
  );
}
