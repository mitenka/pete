import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Step } from '../data/steps';

interface Props {
  step: Step;
  index: number;
  scrollX: SharedValue<number>;
  onBreathe: () => void;
}

export default function StepCard({ step, index, scrollX, onBreathe }: Props) {
  const { width } = useWindowDimensions();

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
      <Animated.View style={[styles.content, contentStyle]}>
        <Text style={styles.number}>{step.id}</Text>
        <Text style={styles.title}>{step.title}</Text>
        <View style={styles.bodyBlock}>
          {step.body.map((paragraph, i) => (
            <Text key={i} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </View>
        {step.breathing && (
          <Pressable
            onPress={onBreathe}
            style={({ pressed }) => [styles.breatheButton, pressed && styles.breathePressed]}
          >
            <Text style={styles.breatheText}>Подышать вместе</Text>
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
    marginTop: 28,
    alignSelf: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 14,
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
    fontWeight: '600',
    color: 'rgba(255,255,255,0.95)',
  },
});
