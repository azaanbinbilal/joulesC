import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { HydrationCard } from '@/components/HydrationCard';
import { MacroBar } from '@/components/MacroBar';
import { MacroRing } from '@/components/MacroRing';
import { NeonButton } from '@/components/NeonButton';
import { Screen } from '@/components/Screen';
import { StreakChip } from '@/components/StreakChip';
import { SuggestionsCard } from '@/components/SuggestionsCard';
import { buildGoalPlan, calcBMR, calcTDEE } from '@/lib/health';
import {
  addTotals,
  computeMacroTargets,
  emptyTotals,
  scalePer100g,
  type MacroTotals,
} from '@/lib/macros';
import { computeStreak } from '@/lib/streak';
import { generateSuggestions } from '@/lib/suggestions';
import { useActivityLogStore } from '@/store/activityLog';
import { todayISO, useFoodLogStore } from '@/store/foodLog';
import { useHydrationLogStore } from '@/store/hydrationLog';
import { useProfileStore } from '@/store/profile';
import type { ActivityEntry } from '@/types/activity';
import { MEAL_LABEL, MEAL_ORDER, type FoodEntry, type MealType } from '@/types/food';
import { DEFAULT_HYDRATION_GOAL_ML } from '@/types/hydration';

export default function Dashboard() {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const clearProfile = useProfileStore((s) => s.clearProfile);
  const entries = useFoodLogStore((s) => s.entries);
  const removeEntry = useFoodLogStore((s) => s.removeEntry);
  const activities = useActivityLogStore((s) => s.entries);
  const removeActivity = useActivityLogStore((s) => s.removeEntry);
  const hydrationEntries = useHydrationLogStore((s) => s.entries);
  const addHydration = useHydrationLogStore((s) => s.addEntry);
  const removeHydration = useHydrationLogStore((s) => s.removeEntry);

  const today = todayISO();
  const hydrationGoalMl = DEFAULT_HYDRATION_GOAL_ML;
  const todayEntries = useMemo(
    () => entries.filter((e) => e.date === today),
    [entries, today],
  );
  const todayActivities = useMemo(
    () => activities.filter((a) => a.date === today),
    [activities, today],
  );

  const weekStats = useMemo(() => {
    const start = new Date(today + 'T00:00:00');
    start.setDate(start.getDate() - 6);
    const y = start.getFullYear();
    const m = String(start.getMonth() + 1).padStart(2, '0');
    const d = String(start.getDate()).padStart(2, '0');
    const startDate = `${y}-${m}-${d}`;
    const weekEntries = entries.filter((e) => e.date >= startDate && e.date <= today);
    const weekActs = activities.filter((a) => a.date >= startDate && a.date <= today);
    const consumed = weekEntries.reduce(
      (s, e) => s + (e.per100g.kcal * e.grams) / 100,
      0,
    );
    const burned = weekActs.reduce((s, a) => s + a.kcalBurned, 0);
    const daysLogged = new Set(weekEntries.map((e) => e.date)).size;
    return { consumed, burned, daysLogged };
  }, [entries, activities, today]);

  const { target, totals, burnedKcal } = useMemo(() => {
    if (!profile) {
      return {
        target: null as null | ReturnType<typeof computeMacroTargets>,
        totals: emptyTotals(),
        burnedKcal: 0,
      };
    }
    const bmr = calcBMR(profile.weightKg, profile.heightCm, profile.age, profile.sex);
    const tdee = calcTDEE(bmr, profile.activity);
    let kcal = Math.round(tdee);
    const direction = profile.goal?.direction ?? 'maintain';
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
    const burned = todayActivities.reduce((s, a) => s + a.kcalBurned, 0);
    return { target: macroTarget, totals: summed, burnedKcal: burned };
  }, [profile, todayEntries, todayActivities]);

  const hydration = useMemo(() => {
    const todayMl = hydrationEntries
      .filter((e) => e.date === today)
      .reduce((s, e) => s + e.ml, 0);
    const todays = hydrationEntries.filter((e) => e.date === today);
    const lastTodayId = todays.length > 0 ? todays[todays.length - 1].id : null;
    return { todayMl, lastTodayId };
  }, [hydrationEntries, today]);

  const streakDays = useMemo(() => {
    const foodDates = new Set(entries.map((e) => e.date));
    const hydrationByDate = new Map<string, number>();
    for (const h of hydrationEntries) {
      hydrationByDate.set(h.date, (hydrationByDate.get(h.date) ?? 0) + h.ml);
    }
    return computeStreak({
      foodDates,
      hydrationTotalsByDate: hydrationByDate,
      hydrationGoalMl,
      today,
    });
  }, [entries, hydrationEntries, hydrationGoalMl, today]);

  const suggestions = useMemo(() => {
    if (!target) return [];
    return generateSuggestions({
      targets: target,
      totals,
      burnedKcal,
      recentEntries: todayEntries,
      hour: new Date().getHours(),
      weekKcalConsumed: weekStats.consumed,
      weekKcalBurned: weekStats.burned,
      weekDaysLogged: weekStats.daysLogged,
    });
  }, [target, totals, burnedKcal, todayEntries, weekStats]);

  if (!profile || !target) return null;

  const effectiveKcalTarget = target.kcal + burnedKcal;

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
        <Animated.View
          entering={FadeInDown.duration(450)}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <View style={{ flex: 1 }}>
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
              numberOfLines={1}
            >
              {profile.name || 'there'}
            </Text>
          </View>
          <View style={{ paddingBottom: 6, marginLeft: 12 }}>
            <StreakChip days={streakDays} />
          </View>
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
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <MacroRing
                size={200}
                strokeWidth={14}
                value={totals.kcal}
                target={effectiveKcalTarget}
              />
            </View>

            {burnedKcal > 0 ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignSelf: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255,200,87,0.12)',
                  borderColor: 'rgba(255,200,87,0.4)',
                  borderWidth: 1,
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  marginBottom: 14,
                }}
              >
                <Text style={{ fontSize: 14, marginRight: 4 }}>🔥</Text>
                <Text
                  style={{
                    fontFamily: 'SpaceGrotesk_600SemiBold',
                    color: '#FFC857',
                    fontSize: 12,
                  }}
                >
                  +{burnedKcal} kcal from activity
                </Text>
              </View>
            ) : null}

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

        <Animated.View
          entering={FadeInDown.delay(160).duration(500)}
          style={{ marginTop: 14 }}
        >
          <HydrationCard
            totalMl={hydration.todayMl}
            goalMl={hydrationGoalMl}
            onAdd={(ml) => addHydration({ ml })}
            onUndoLast={
              hydration.lastTodayId ? () => removeHydration(hydration.lastTodayId!) : null
            }
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(220).duration(500)}>
          <SuggestionsCard suggestions={suggestions} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(500)} style={{ marginTop: 18 }}>
          {MEAL_ORDER.map((meal) => (
            <MealSection
              key={meal}
              meal={meal}
              entries={entriesByMeal[meal]}
              onRemove={removeEntry}
            />
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(280).duration(500)} style={{ marginTop: 4 }}>
          <ActivitySection
            entries={todayActivities}
            burned={burnedKcal}
            onRemove={removeActivity}
          />
        </Animated.View>

        <View style={{ marginTop: 8, gap: 8 }}>
          <NeonButton label="+ Add food" onPress={() => router.push('/food-search')} />
          <NeonButton
            label="+ Log activity"
            variant="secondary"
            onPress={() => router.push('/activity-log')}
          />
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
  const isPureGramsLabel =
    !!entry.servingLabel && /^\d+\s*g$/.test(entry.servingLabel.replace(/\s/g, ''));
  const servingDisplay =
    entry.servingLabel && !isPureGramsLabel
      ? `${entry.servingLabel} · ${entry.grams}g`
      : `${entry.grams}g`;
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
          {servingDisplay} · {kcal} kcal · {protein}g P
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

function ActivitySection({
  entries,
  burned,
  onRemove,
}: {
  entries: ActivityEntry[];
  burned: number;
  onRemove: (id: string) => void;
}) {
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
          Activity 🔥
        </Text>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_500Medium',
            color: burned > 0 ? '#FFC857' : '#A0A6B8',
            fontSize: 12,
          }}
        >
          {entries.length === 0 ? 'No activity yet' : `${burned} kcal burned`}
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
            Log a workout to earn extra calorie budget.
          </Text>
        </View>
      ) : (
        entries.map((a) => (
          <ActivityRow key={a.id} entry={a} onRemove={() => onRemove(a.id)} />
        ))
      )}
    </View>
  );
}

function ActivityRow({
  entry,
  onRemove,
}: {
  entry: ActivityEntry;
  onRemove: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(18,21,28,0.85)',
        borderColor: '#1F2330',
        borderWidth: 1,
        borderLeftWidth: 4,
        borderLeftColor: '#FFC857',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: 'rgba(5,6,10,0.6)',
          borderColor: '#2B3142',
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 10,
        }}
      >
        <Text style={{ fontSize: 18 }}>{entry.emoji}</Text>
      </View>
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_600SemiBold',
            color: '#F5F7FA',
            fontSize: 13,
          }}
          numberOfLines={1}
        >
          {entry.name}
        </Text>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_400Regular',
            color: '#A0A6B8',
            fontSize: 11,
            marginTop: 2,
          }}
        >
          {entry.minutes} min ·{' '}
          <Text style={{ color: '#FFC857' }}>{entry.kcalBurned} kcal</Text>
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
