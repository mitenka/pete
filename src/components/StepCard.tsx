import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OverlayKind, Step } from '../data/steps';
import { useLocale } from '../i18n/LocaleProvider';

interface Props {
  step: Step;
  index: number;
  scrollX: SharedValue<number>;
  onOpenOverlay: (kind: OverlayKind) => void;
}

// Kept in sync with the breatheButton/breatheText styles below: the button is
// absolutely positioned over the card, so cards that have one reserve
// BUTTON_CLEARANCE of bottom padding (plus the safe-area inset the button
// rides on) to keep long body text from running underneath it.
const BUTTON_PADDING_V = 14;
const BUTTON_LINE_HEIGHT = 20;
const BUTTON_HEIGHT = BUTTON_PADDING_V * 2 + BUTTON_LINE_HEIGHT;
const BUTTON_BOTTOM = 64;
const BUTTON_CLEARANCE = BUTTON_BOTTOM + BUTTON_HEIGHT + 24;

export default function StepCard({ step, index, scrollX, onOpenOverlay }: Props) {
  const { width } = useWindowDimensions();
  const { t } = useLocale();
  const insets = useSafeAreaInsets();

  const contentStyle = useAnimatedStyle(() => {
    const input = [(index - 1) * width, index * width, (index + 1) * width];
    return {
      opacity: interpolate(scrollX.value, input, [0, 1, 0], Extrapolation.CLAMP),
      transform: [
        {
          translateX: interpolate(
            scrollX.value,
            input,
            [width * 0.25, 0, -width * 0.25],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  return (
    <View style={[styles.page, { width }]}>
      <LinearGradient
        colors={step.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View
        style={[
          styles.content,
          step.overlay && { paddingBottom: insets.bottom + BUTTON_CLEARANCE },
          contentStyle,
        ]}
      >
        <Text style={styles.number}>{step.id}</Text>
        <Text style={styles.title}>{step.title}</Text>
        <View style={styles.bodyBlock}>
          {step.body.map((paragraph, i) => (
            <Text key={i} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </View>
        {step.overlay && (
          <Pressable
            onPress={() => onOpenOverlay(step.overlay!)}
            style={({ pressed }) => [
              styles.breatheButton,
              { bottom: insets.bottom + BUTTON_BOTTOM },
              pressed && styles.breathePressed,
            ]}
          >
            <Text style={styles.breatheText}>
              {{ breathing: t.breathe, rights: t.rightsButton, needs: t.needsButton }[step.overlay]}
            </Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 96,
    paddingBottom: 120,
  },
  number: {
    fontSize: 64,
    fontWeight: '200',
    color: 'rgba(255,255,255,0.35)',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.96)',
    marginBottom: 24,
  },
  bodyBlock: {
    gap: 16,
    flexShrink: 1,
  },
  paragraph: {
    fontSize: 17,
    lineHeight: 26,
    color: 'rgba(255,255,255,0.78)',
  },
  breatheButton: {
    position: 'absolute',
    left: 32,
    paddingHorizontal: 24,
    paddingVertical: BUTTON_PADDING_V,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  breathePressed: {
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  breatheText: {
    fontSize: 16,
    lineHeight: BUTTON_LINE_HEIGHT,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.95)',
  },
});
