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
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  type SharedValue,
  interpolate,
  runOnJS,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { stepMeta } from "./src/data/steps";
import StepCard from "./src/components/StepCard";
import BreathingCircle from "./src/components/BreathingCircle";
import { LocaleProvider, useLocale } from "./src/i18n/LocaleProvider";
import { LANGUAGES, LANGUAGE_NAMES } from "./src/i18n/translations";

const PAGE_COUNT = stepMeta.length;

const SPRING = { damping: 42, stiffness: 400 };

const DOTS_PAD_H = 28;
const DOTS_PAD_V = 18;

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
  const { t, language, setLanguage, steps } = useLocale();
  const scrollX = useSharedValue(0);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const [breathingVisible, setBreathingVisible] = useState(false);
  const lastPage = useRef(0);
  const [stripWidth, setStripWidth] = useState(1);
  const scrubPage = useSharedValue(-1);

  const tickPage = (page: number) => {
    lastPage.current = page;
    Haptics.selectionAsync();
  };

  const dotsPan = Gesture.Pan()
    .activeOffsetX([-2, 2])
    .failOffsetY([-14, 14])
    .onChange((e) => {
      const page = Math.min(
        PAGE_COUNT - 1,
        Math.max(0, Math.floor(((e.x - DOTS_PAD_H) / stripWidth) * PAGE_COUNT)),
      );
      if (page !== scrubPage.value) {
        scrubPage.value = page;
        scrollTo(scrollRef, page * width, 0, false);
        runOnJS(tickPage)(page);
      }
    })
    .onEnd(() => {
      scrubPage.value = -1;
    });

  const dotsTap = Gesture.Tap()
    .maxDuration(10000)
    .onEnd((e) => {
      const page = Math.min(
        PAGE_COUNT - 1,
        Math.max(0, Math.floor(((e.x - DOTS_PAD_H) / stripWidth) * PAGE_COUNT)),
      );
      scrollTo(scrollRef, page * width, 0, true);
      runOnJS(tickPage)(page);
    });

  const dotsGesture = Gesture.Exclusive(dotsPan, dotsTap);

  const menuHeight = insets.top + 232;
  const translateY = useSharedValue(0);
  const menuOpenSV = useSharedValue(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const onMenuToggle = (open: boolean) => {
    setMenuOpen(open);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const closeMenu = () => {
    menuOpenSV.value = false;
    setMenuOpen(false);
    translateY.value = withSpring(0, SPRING);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const pan = Gesture.Pan()
    .activeOffsetY([-16, 16])
    .failOffsetX([-12, 12])
    .onChange((e) => {
      const base = menuOpenSV.value ? menuHeight : 0;
      translateY.value = Math.min(
        Math.max(base + e.translationY, 0),
        menuHeight,
      );
    })
    .onEnd((e) => {
      const open =
        e.velocityY > 400
          ? true
          : e.velocityY < -400
            ? false
            : translateY.value > menuHeight / 2;
      if (open !== menuOpenSV.value) {
        menuOpenSV.value = open;
        runOnJS(onMenuToggle)(open);
      }
      translateY.value = withSpring(open ? menuHeight : 0, SPRING);
    });

  const menuStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value - menuHeight }],
  }));

  const deckStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderTopLeftRadius: interpolate(
      translateY.value,
      [0, menuHeight],
      [0, 28],
      Extrapolation.CLAMP,
    ),
    borderTopRightRadius: interpolate(
      translateY.value,
      [0, menuHeight],
      [0, 28],
      Extrapolation.CLAMP,
    ),
  }));

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
      <Animated.View
        style={[
          styles.menu,
          { height: menuHeight, paddingTop: insets.top + 16 },
          menuStyle,
        ]}
      >
        <Text style={styles.menuTitle}>{t.menuTitle}</Text>
        <Text style={styles.menuCredit}>{t.menuCredit}</Text>
        <View style={styles.langRow}>
          {LANGUAGES.map((lang) => {
            const active = lang === language;
            return (
              <Pressable
                key={lang}
                onPress={() => {
                  if (!active) {
                    setLanguage(lang);
                    Haptics.selectionAsync();
                  }
                }}
                style={[styles.langPill, active && styles.langPillActive]}
              >
                <Text
                  style={[styles.langText, active && styles.langTextActive]}
                >
                  {LANGUAGE_NAMES[lang]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.deck, deckStyle]}>
          <Animated.ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={scrollHandler}
            onMomentumScrollEnd={onMomentumEnd}
            scrollEventThrottle={16}
          >
            <LinearGradient
              colors={steps[0].gradient}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[styles.overscrollFill, { width, left: -width }]}
            />
            <LinearGradient
              colors={steps[steps.length - 1].gradient}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[
                styles.overscrollFill,
                { width, left: PAGE_COUNT * width },
              ]}
            />
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

          <View style={[styles.pagination, { bottom: insets.bottom + 6 }]}>
            <GestureDetector gesture={dotsGesture}>
              <View style={styles.dotsTouch}>
                <View
                  style={styles.dotsRow}
                  onLayout={(e) => setStripWidth(e.nativeEvent.layout.width)}
                >
                  {Array.from({ length: PAGE_COUNT }).map((_, i) => (
                    <Dot key={i} index={i} scrollX={scrollX} width={width} />
                  ))}
                </View>
              </View>
            </GestureDetector>
          </View>

          {menuOpen && (
            <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu} />
          )}
        </Animated.View>
      </GestureDetector>

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
            <Text style={styles.closeText}>{t.close}</Text>
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
        <LocaleProvider>
          <Deck />
        </LocaleProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#12101f",
  },
  menu: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    justifyContent: "center",
    gap: 8,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  menuCredit: {
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.45)",
  },
  langRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  langPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  langPillActive: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  langText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
  },
  langTextActive: {
    color: "rgba(255,255,255,0.95)",
  },
  deck: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#12101f",
  },
  overscrollFill: {
    position: "absolute",
    top: 0,
    bottom: 0,
  },
  pagination: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  dotsTouch: {
    paddingHorizontal: DOTS_PAD_H,
    paddingVertical: DOTS_PAD_V,
  },
  dotsRow: {
    flexDirection: "row",
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
