import { useEffect, useState } from "react";
import { AccessibilityInfo, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  ReduceMotion,
  type SharedValue,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useLocale } from "../i18n/LocaleProvider";

const INHALE_MS = 4000;
const HOLD_MS = 4000;
const EXHALE_MS = 8000;

const PETAL_COUNT = 6;
const PETAL_SIZE = 110;
const TRAVEL = 64;
const AREA = PETAL_SIZE + TRAVEL * 2 + 24;
const RING_SIZE = PETAL_SIZE + TRAVEL * 2 + 14;
const ROTATION_MS = 90000;

type Phase = "inhale" | "hold" | "exhale";

function Petal({
  index,
  progress,
}: {
  index: number;
  progress: SharedValue<number>;
}) {
  const angle = (index * 360) / PETAL_COUNT;
  const style = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${angle}deg` },
      { translateY: -progress.value * TRAVEL },
      { scale: interpolate(progress.value, [0, 1], [0.92, 1]) },
    ],
  }));
  return <Animated.View style={[styles.petal, style]} />;
}

export default function BreathingCircle() {
  const { t } = useLocale();
  const labels: Record<Phase, string> = {
    inhale: t.inhale,
    hold: t.hold,
    exhale: t.exhale,
  };
  const progress = useSharedValue(0);
  const rotation = useSharedValue(0);
  const labelOpacity = useSharedValue(0);
  const [phase, setPhase] = useState<Phase>("inhale");
  const reducedMotion = useReducedMotion();

  // The slow flower spin is purely decorative — skip it entirely when the
  // system asks for reduced motion.
  useEffect(() => {
    if (reducedMotion) return;
    rotation.value = withRepeat(
      withTiming(360, { duration: ROTATION_MS, easing: Easing.linear }),
      -1,
    );
    return () => {
      rotation.value = 0;
    };
  }, [rotation, reducedMotion]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const run = (current: Phase) => {
      if (cancelled) return;
      // Fade the previous word out and down, swap the text while it's invisible,
      // then float the new word up into place — no hard cut between phases.
      labelOpacity.value = withSequence(
        withTiming(
          0,
          { duration: 220, easing: Easing.in(Easing.cubic) },
          (finished) => {
            if (finished) runOnJS(setPhase)(current);
          },
        ),
        withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) }),
      );
      // The label alone isn't enough for screen-reader users to follow the
      // rhythm — speak each phase as it starts.
      AccessibilityInfo.announceForAccessibility(labels[current]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // The petal swell is the breathing pacer itself, not decoration: under
      // system reduced motion Reanimated would snap it to the end value and the
      // exercise would stop making sense, so it must keep animating.
      if (current === "inhale") {
        progress.value = withTiming(1, {
          duration: INHALE_MS,
          easing: Easing.inOut(Easing.quad),
          reduceMotion: ReduceMotion.Never,
        });
        timer = setTimeout(() => run("hold"), INHALE_MS);
      } else if (current === "hold") {
        timer = setTimeout(() => run("exhale"), HOLD_MS);
      } else {
        progress.value = withTiming(0, {
          duration: EXHALE_MS,
          easing: Easing.inOut(Easing.quad),
          reduceMotion: ReduceMotion.Never,
        });
        timer = setTimeout(() => run("inhale"), EXHALE_MS);
      }
    };

    run("inhale");
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [progress]);

  const flowerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.value, [0, 1], [1, 1.25]) }],
    opacity: interpolate(progress.value, [0, 1], [0.95, 0.65]),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
    transform: [
      { translateY: interpolate(labelOpacity.value, [0, 1], [6, 0]) },
    ],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.circleArea}>
        <View style={styles.ringMax} />
        <Animated.View style={[styles.flower, flowerStyle]}>
          {Array.from({ length: PETAL_COUNT }).map((_, i) => (
            <Petal key={i} index={i} progress={progress} />
          ))}
        </Animated.View>
        <Animated.View style={[styles.core, coreStyle]} />
      </View>
      <Animated.Text style={[styles.label, labelStyle]}>
        {labels[phase]}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  circleArea: {
    width: AREA,
    height: AREA,
    alignItems: "center",
    justifyContent: "center",
  },
  ringMax: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  flower: {
    width: AREA,
    height: AREA,
    alignItems: "center",
    justifyContent: "center",
  },
  petal: {
    position: "absolute",
    width: PETAL_SIZE,
    height: PETAL_SIZE,
    borderRadius: PETAL_SIZE / 2,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  core: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  label: {
    marginTop: 36,
    fontSize: 30,
    fontWeight: "600",
    color: "rgba(255,255,255,0.95)",
    letterSpacing: 1.5,
  },
});
