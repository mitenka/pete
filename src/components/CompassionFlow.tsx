import { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  Easing,
  ReduceMotion,
  type SharedValue,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useLocale } from "../i18n/LocaleProvider";
import type { CompassionStage } from "../data/compassion";

// One guiding breath of the intro (hand on heart, three of these). Unlike the
// 4-4-8 breathing exercise there's no hold: this is grounding, not pacing.
const INTRO_INHALE_MS = 4000;
const INTRO_EXHALE_MS = 6000;
const INTRO_BREATHS = 3;

// The hint stays hidden at first so each phrase gets a quiet moment before
// the UI suggests moving on — the pause is what sets the flow's slow pace.
const HINT_DELAY_MS = 2800;

// Which variant each slot showed last run, so the next run avoids repeating
// it. Same AsyncStorage as the language/gender preferences.
const STORAGE_KEY_PICKS = "compassion.picks";

// The glow is three stacked circles. It starts cool, close to the overlay's
// blue gradient, and warms toward amber as the practice moves from
// acknowledging pain toward acceptance — progress without a progress bar.
const GLOW_LAYERS = [
  { size: 300, cool: "rgba(180,205,255,0.07)", warm: "rgba(255,205,150,0.07)" },
  { size: 200, cool: "rgba(180,205,255,0.10)", warm: "rgba(255,205,150,0.10)" },
  { size: 110, cool: "rgba(190,210,255,0.16)", warm: "rgba(255,215,170,0.16)" },
];
const HALO_SIZE = GLOW_LAYERS[0].size;
// A full-screen warm wash over the gradient, faint until the finale.
const TINT_COLOR = "#ffb070";
const TINT_MAX = 0.12;
// On the ending screen the glow swells past the screen edges and the wash
// deepens — the light the practice built up fills the room.
const FINALE_SCALE = 2.4;
const FINALE_TINT = 0.14;
const FINALE_MS = 4000;

interface Props {
  // Bottom offset that clears the close button, for the tap hint.
  hintBottom: number;
}

interface Screen {
  text: string;
  // Index into `compassion.stages`; undefined for the intro and the ending.
  stage?: number;
}

// One variant index per slot across all stages (0 for fixed phrases). Given
// last run's picks, a slot never repeats the variant it showed then, so two
// runs in a row read differently. Stored picks may be stale or malformed
// (text edited between app versions), so anything out of range is ignored.
function pickVariants(
  stages: CompassionStage[],
  previous: unknown[] = [],
): number[] {
  const picks: number[] = [];
  for (const stage of stages) {
    for (const slot of stage.phrases) {
      if (!Array.isArray(slot) || slot.length < 2) {
        picks.push(0);
        continue;
      }
      const avoid = previous[picks.length];
      const hasAvoid =
        Number.isInteger(avoid) &&
        (avoid as number) >= 0 &&
        (avoid as number) < slot.length;
      let pick = Math.floor(Math.random() * (slot.length - (hasAvoid ? 1 : 0)));
      if (hasAvoid && pick >= (avoid as number)) pick += 1;
      picks.push(pick);
    }
  }
  return picks;
}

function GlowCircle({
  size,
  cool,
  warm,
  glow,
}: {
  size: number;
  cool: string;
  warm: string;
  glow: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(glow.value, [0, 1], [cool, warm]),
  }));
  return (
    <Animated.View
      style={[
        styles.glowCircle,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    />
  );
}

export default function CompassionFlow({ hintBottom }: Props) {
  const { compassion } = useLocale();

  // Picked synchronously so the flow works at once; the mount effect below
  // re-picks against last run's choices while the intro is still showing.
  const [picks, setPicks] = useState(() => pickVariants(compassion.stages));

  // Screen sequence: breathing intro, one phrase per tap, then the ending.
  const screens = useMemo(() => {
    const list: Screen[] = [{ text: compassion.intro }];
    let slot = 0;
    compassion.stages.forEach((stage, stageIndex) => {
      for (const phrase of stage.phrases) {
        const text = Array.isArray(phrase)
          ? (phrase[picks[slot]] ?? phrase[0])
          : phrase;
        list.push({ text, stage: stageIndex });
        slot += 1;
      }
    });
    list.push({ text: compassion.ending });
    return list;
  }, [compassion, picks]);
  const last = screens.length - 1;

  const [index, setIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  const glow = useSharedValue(0);
  const ambient = useSharedValue(0);
  const pulse = useSharedValue(0);
  const finale = useSharedValue(0);
  const textOpacity = useSharedValue(1);
  const hintOpacity = useSharedValue(0);

  // Where the flow is headed, updated synchronously on tap — `index` lags by
  // one text-fade, so rapid taps would otherwise re-target the same screen.
  const target = useRef(0);
  const cancelIntro = useRef<() => void>(() => {});

  const transitionTo = (next: number) => {
    glow.value = withTiming(next / last, {
      duration: 1400,
      easing: Easing.inOut(Easing.quad),
    });
    hintOpacity.value = withTiming(0, { duration: 200 });
    // Same no-hard-cut swap as the breathing label: fade out and down, change
    // the text while invisible, float the new one up.
    textOpacity.value = withSequence(
      withTiming(
        0,
        { duration: 240, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(setIndex)(next);
        },
      ),
      withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }),
    );
  };

  // Load last run's picks and re-pick to avoid them. The intro lasts 30s and
  // the read takes milliseconds, so the phrases are settled long before the
  // first one shows; if the user taps through first, this run just goes with
  // the initial picks. Whatever ends up shown is what the next run avoids.
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY_PICKS)
      .then((raw) => {
        if (cancelled) return;
        let previous: unknown[] = [];
        try {
          const parsed = raw ? JSON.parse(raw) : [];
          if (Array.isArray(parsed)) previous = parsed;
        } catch {}
        let shown = picks;
        if (target.current === 0) {
          shown = pickVariants(compassion.stages, previous);
          setPicks(shown);
        }
        return AsyncStorage.setItem(STORAGE_KEY_PICKS, JSON.stringify(shown));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // The three guiding breaths, then the flow advances on its own.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    cancelIntro.current = () => {
      cancelled = true;
      clearTimeout(timer);
      pulse.value = withTiming(0, { duration: 600 });
    };
    const breatheOnce = (remaining: number) => {
      if (cancelled) return;
      if (remaining === 0) {
        if (target.current === 0) {
          target.current = 1;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          transitionTo(1);
        }
        return;
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // The pulse paces the breaths, so it must keep animating under system
      // reduced motion — same rule as the breathing exercise's petals.
      pulse.value = withSequence(
        withTiming(1, {
          duration: INTRO_INHALE_MS,
          easing: Easing.inOut(Easing.quad),
          reduceMotion: ReduceMotion.Never,
        }),
        withTiming(0, {
          duration: INTRO_EXHALE_MS,
          easing: Easing.inOut(Easing.quad),
          reduceMotion: ReduceMotion.Never,
        }),
      );
      timer = setTimeout(
        () => breatheOnce(remaining - 1),
        INTRO_INHALE_MS + INTRO_EXHALE_MS,
      );
    };
    breatheOnce(INTRO_BREATHS);
    return () => cancelIntro.current();
  }, []);

  // The slow ambient swell is purely decorative — skip it under reduced motion.
  useEffect(() => {
    if (reducedMotion) return;
    ambient.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3600, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 3600, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
    return () => {
      ambient.value = 0;
    };
  }, [ambient, reducedMotion]);

  const screen = screens[index];
  const stageLabel =
    screen.stage === undefined
      ? undefined
      : compassion.stages[screen.stage].label;
  // The caption is spoken only when a new stage begins; on later screens of
  // the same stage it would just be noise before every phrase.
  const stageBegins =
    screen.stage !== undefined && screens[index - 1]?.stage !== screen.stage;

  useEffect(() => {
    // Announcements carry the content for screen-reader users; visuals alone
    // won't, since phrases appear at the user's own pace.
    AccessibilityInfo.announceForAccessibility(
      stageBegins ? `${stageLabel}. ${screen.text}` : screen.text,
    );
    if (index > 0 && index < last) {
      hintOpacity.value = withDelay(
        HINT_DELAY_MS,
        withTiming(1, { duration: 600 }),
      );
    }
    if (index === last) {
      finale.value = withTiming(1, {
        duration: FINALE_MS,
        easing: Easing.inOut(Easing.quad),
      });
    }
  }, [index]);

  const onTap = () => {
    if (target.current >= last) return;
    // Tapping during the intro skips the remaining breaths — nobody should
    // ever feel locked into the practice.
    if (target.current === 0) cancelIntro.current();
    const from = screens[target.current].stage;
    target.current += 1;
    const to = screens[target.current].stage;
    if (to !== undefined && to !== from) {
      // A new stage: a firmer tick and one slow exhale of the glow mark the
      // threshold, so the structure is felt without being read.
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      pulse.value = withSequence(
        withTiming(0.5, { duration: 700, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      );
    } else {
      Haptics.selectionAsync();
    }
    transitionTo(target.current);
  };

  const tintStyle = useAnimatedStyle(() => ({
    opacity: glow.value * TINT_MAX + finale.value * FINALE_TINT,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.7 + glow.value * 0.3,
    transform: [
      {
        scale:
          1 +
          glow.value * 0.22 +
          ambient.value * 0.05 +
          pulse.value * 0.16 +
          finale.value * FINALE_SCALE,
      },
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [
      { translateY: interpolate(textOpacity.value, [0, 1], [8, 0]) },
    ],
  }));

  const hintStyle = useAnimatedStyle(() => ({
    opacity: hintOpacity.value,
  }));

  const spoken = screen.text.replace(/\n/g, " ");
  return (
    <Pressable
      style={styles.container}
      onPress={onTap}
      accessible
      accessibilityRole="button"
      accessibilityLabel={stageLabel ? `${stageLabel}. ${spoken}` : spoken}
      accessibilityHint={index < last ? compassion.hint : undefined}
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.tint, tintStyle]}
        pointerEvents="none"
      />
      <View style={styles.glowArea} pointerEvents="none">
        <Animated.View style={[styles.glowCenter, glowStyle]}>
          {GLOW_LAYERS.map((layer) => (
            <GlowCircle key={layer.size} glow={glow} {...layer} />
          ))}
        </Animated.View>
      </View>
      <Animated.View style={[styles.textBlock, textStyle]}>
        {stageLabel !== undefined && (
          <Text style={styles.stageLabel}>{stageLabel}</Text>
        )}
        <Text style={styles.phrase}>{screen.text}</Text>
      </Animated.View>
      <Animated.Text style={[styles.hint, { bottom: hintBottom }, hintStyle]}>
        {compassion.hint}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
  },
  tint: {
    backgroundColor: TINT_COLOR,
  },
  glowArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  glowCenter: {
    width: HALO_SIZE,
    height: HALO_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  glowCircle: {
    position: "absolute",
  },
  textBlock: {
    alignItems: "center",
  },
  stageLabel: {
    fontSize: 13,
    letterSpacing: 2,
    textTransform: "uppercase",
    textAlign: "center",
    color: "rgba(255,255,255,0.55)",
    marginBottom: 16,
  },
  phrase: {
    fontSize: 24,
    lineHeight: 34,
    fontWeight: "500",
    letterSpacing: 0.3,
    textAlign: "center",
    color: "rgba(255,255,255,0.95)",
  },
  hint: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
  },
});
