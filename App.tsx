import { useRef, useState } from "react";
import {
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  type SharedValue,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { steps } from "./src/data/steps";
import StepCard from "./src/components/StepCard";
import BreathingCircle from "./src/components/BreathingCircle";

const PAGE_COUNT = steps.length;

function Dot({
  index,
  scrollX,
  width,
}: {
  index: number;
  scrollX: SharedValue<number>;
  width: number;
}) {
  const style = useAnimatedStyle(() => {
    const input = [(index - 1) * width, index * width, (index + 1) * width];
    return {
      opacity: interpolate(
        scrollX.value,
        input,
        [0.3, 1, 0.3],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          scale: interpolate(
            scrollX.value,
            input,
            [1, 1.5, 1],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });
  return <Animated.View style={[styles.dot, style]} />;
}

function Deck() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollX = useSharedValue(0);
  const [breathingVisible, setBreathingVisible] = useState(false);
  const lastPage = useRef(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / width);
    if (page !== lastPage.current) {
      lastPage.current = page;
      Haptics.selectionAsync();
    }
  };

  return (
    <View style={styles.root}>
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        onMomentumScrollEnd={onMomentumEnd}
        scrollEventThrottle={16}
      >
        {steps.map((step, i) => (
          <StepCard
            key={step.id}
            step={step}
            index={i}
            scrollX={scrollX}
            onBreathe={() => setBreathingVisible(true)}
          />
        ))}
      </Animated.ScrollView>

      <View
        style={[styles.pagination, { bottom: insets.bottom + 24 }]}
        pointerEvents="none"
      >
        {Array.from({ length: PAGE_COUNT }).map((_, i) => (
          <Dot key={i} index={i} scrollX={scrollX} width={width} />
        ))}
      </View>

      <Modal
        visible={breathingVisible}
        animationType="fade"
        transparent={false}
        onRequestClose={() => setBreathingVisible(false)}
      >
        <View style={styles.breathingScreen}>
          <LinearGradient
            colors={["#163a72", "#0d2a55"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <BreathingCircle />
          <Pressable
            onPress={() => setBreathingVisible(false)}
            style={[styles.closeButton, { bottom: insets.bottom + 32 }]}
          >
            <Text style={styles.closeText}>Закрыть</Text>
          </Pressable>
        </View>
      </Modal>

      <StatusBar style="light" />
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <Deck />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#12101f",
  },
  pagination: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  breathingScreen: {
    flex: 1,
  },
  closeButton: {
    position: "absolute",
    alignSelf: "center",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  closeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
});
