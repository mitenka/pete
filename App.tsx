import { useEffect, useRef, useState } from "react";
import {
  BackHandler,
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
  withTiming,
} from "react-native-reanimated";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { stepMeta, type OverlayKind } from "./src/data/steps";
import StepCard from "./src/components/StepCard";
import BreathingCircle from "./src/components/BreathingCircle";
import ListOverlay from "./src/components/ListOverlay";
import { LocaleProvider, useLocale } from "./src/i18n/LocaleProvider";
import { GENDERS, GENDER_LABELS, LANGUAGES } from "./src/i18n/translations";

const PAGE_COUNT = stepMeta.length;

const SPRING = { damping: 42, stiffness: 400 };

const DOTS_PAD_H = 28;
const DOTS_PAD_V = 18;

// Kept in sync with the closeButton/closeText styles below so ListOverlay
// can reserve exactly enough scroll clearance from the very first render —
// measuring it at runtime via onLayout raced with the initial paint (worst
// on Android, where insets.bottom is often 0) and left text peeking through
// the button.
const CLOSE_BUTTON_PADDING_V = 12;
const CLOSE_BUTTON_LINE_HEIGHT = 20;
const CLOSE_BUTTON_HEIGHT = CLOSE_BUTTON_PADDING_V * 2 + CLOSE_BUTTON_LINE_HEIGHT;
const CLOSE_BUTTON_BOTTOM = 32;
const CLOSE_BUTTON_MARGIN = 32;

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
  const { t, language, setLanguage, gender, setGender, gendered, steps, overlays } =
    useLocale();
  const scrollX = useSharedValue(0);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  // The overlay (breathing / rights / needs) is an in-tree view (not a native
  // Modal), so gestures underneath resume the moment it fades out. It mounts
  // only while open, which stops BreathingCircle's animation/timers/haptics
  // when closed.
  const [overlay, setOverlay] = useState<OverlayKind | null>(null);
  const overlayOpacity = useSharedValue(0);

  const openOverlay = (kind: OverlayKind) => {
    setOverlay(kind);
    overlayOpacity.value = withTiming(1, { duration: 280 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const closeOverlay = () => {
    overlayOpacity.value = withTiming(0, { duration: 220 }, (finished) => {
      if (finished) runOnJS(setOverlay)(null);
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Android hardware back closes the overlay instead of backgrounding the app.
  useEffect(() => {
    if (!overlay) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      closeOverlay();
      return true;
    });
    return () => sub.remove();
  }, [overlay]);

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

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <View style={styles.root}>
      <Animated.View
        style={[
          styles.menu,
          { height: menuHeight, paddingTop: insets.top + 16 },
          menuStyle,
        ]}
      >
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>{t.menuTitle}</Text>
          <Text style={styles.menuCredit}>{t.menuCredit}</Text>
        </View>
        <View style={styles.controls}>
          <View style={styles.segment}>
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
                  style={[
                    styles.segmentItem,
                    active && styles.segmentItemActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      active && styles.segmentTextActive,
                    ]}
                  >
                    {lang.toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {gendered && (
            <View style={styles.segment}>
              {GENDERS.map((g) => {
                const active = g === gender;
                return (
                  <Pressable
                    key={g}
                    onPress={() => {
                      if (!active) {
                        setGender(g);
                        Haptics.selectionAsync();
                      }
                    }}
                    style={[
                      styles.segmentItem,
                      active && styles.segmentItemActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        active && styles.segmentTextActive,
                      ]}
                    >
                      {GENDER_LABELS[language][g]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
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
                onOpenOverlay={openOverlay}
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

      {overlay && (
        <Animated.View style={[styles.overlayScreen, overlayStyle]}>
          {overlay === "breathing" ? (
            <>
              <LinearGradient
                colors={steps.find((s) => s.overlay === overlay)!.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <BreathingCircle />
            </>
          ) : (
            <ListOverlay
              title={overlay === "rights" ? t.rightsButton : t.needsButton}
              items={overlays[overlay].items}
              gradient={steps.find((s) => s.overlay === overlay)!.gradient}
              topInset={insets.top}
              bottomInset={
                insets.bottom +
                CLOSE_BUTTON_BOTTOM +
                CLOSE_BUTTON_HEIGHT +
                CLOSE_BUTTON_MARGIN
              }
            />
          )}
          <Pressable
            onPress={closeOverlay}
            style={[styles.closeButton, { bottom: insets.bottom + CLOSE_BUTTON_BOTTOM }]}
          >
            <Text style={styles.closeText}>{t.close}</Text>
          </Pressable>
        </Animated.View>
      )}

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
    paddingBottom: 22,
    justifyContent: "space-between",
  },
  menuText: {
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
  controls: {
    flexDirection: "row",
    gap: 10,
  },
  segment: {
    flexDirection: "row",
    alignSelf: "flex-start",
    padding: 3,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  segmentItem: {
    minWidth: 46,
    paddingVertical: 7,
    alignItems: "center",
    borderRadius: 9,
  },
  segmentItemActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: "rgba(255,255,255,0.5)",
  },
  segmentTextActive: {
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
  overlayScreen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  closeButton: {
    position: "absolute",
    alignSelf: "center",
    paddingHorizontal: 28,
    paddingVertical: CLOSE_BUTTON_PADDING_V,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  closeText: {
    fontSize: 16,
    lineHeight: CLOSE_BUTTON_LINE_HEIGHT,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
});
