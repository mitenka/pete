import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
  title: string;
  items: string[];
  gradient: [string, string];
  topInset: number;
  bottomInset: number;
}

const TOP_FADE_HEIGHT = 28;
// The see-through band at the top of the bottom fade; everything below it is
// fully opaque. Equal to CLOSE_BUTTON_MARGIN in App.tsx, so the opaque zone
// begins exactly at the close button's top edge and scrolled text dissolves
// before reaching it.
const BOTTOM_FADE_BAND = 32;

// Linear mix of two #rrggbb colors, t in [0..1].
function mixHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  let out = "#";
  for (const shift of [16, 8, 0]) {
    const v = Math.round(
      ((pa >> shift) & 0xff) * (1 - t) + ((pb >> shift) & 0xff) * t,
    );
    out += v.toString(16).padStart(2, "0");
  }
  return out;
}

export default function ListOverlay({
  title,
  items,
  gradient,
  topInset,
  bottomInset,
}: Props) {
  // Position of the scroll area within the (full-screen) overlay, so the
  // fades can be colored to match the background at their exact y (see
  // below). Fades appear one frame late, during the overlay's fade-in, which
  // is invisible.
  const [area, setArea] = useState<{ y: number; height: number } | null>(null);

  const [c0, c1] = gradient;

  let topFade = null;
  let bottomFade = null;
  if (area) {
    // The scroll area reaches the bottom of the screen, so its bottom edge is
    // the screen height. Because the background gradient runs strictly
    // vertically, the color at any y is a plain lerp between its two stops —
    // which lets each fade reproduce the exact background color at its
    // endpoints and blend seamlessly at any opacity.
    const screenHeight = area.y + area.height;
    const bgAt = (y: number) => mixHex(c0, c1, y / screenHeight);
    topFade = (
      <LinearGradient
        colors={[bgAt(area.y), bgAt(area.y + TOP_FADE_HEIGHT) + "00"]}
        style={[styles.fade, { top: 0, height: TOP_FADE_HEIGHT }]}
      />
    );
    // Transparent at the content's resting bottom edge (the scroll padding
    // line), opaque from the close button's top down to the screen bottom.
    const fadeTop = screenHeight - bottomInset;
    bottomFade = (
      <LinearGradient
        colors={[bgAt(fadeTop) + "00", bgAt(fadeTop + BOTTOM_FADE_BAND), c1]}
        locations={[0, BOTTOM_FADE_BAND / bottomInset, 1]}
        style={[styles.fade, { bottom: 0, height: bottomInset }]}
      />
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topInset + 32 }]}>
      {/* Vertical, unlike the diagonal card gradients — required by the fade
          math above. */}
      <LinearGradient colors={gradient} style={StyleSheet.absoluteFill} />
      <Text style={styles.title}>{title}</Text>
      <View
        style={styles.scrollArea}
        onLayout={(e) =>
          setArea({
            y: e.nativeEvent.layout.y,
            height: e.nativeEvent.layout.height,
          })
        }
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottomInset },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {items.map((item, i) => (
            <Text key={i} style={styles.item}>
              <Text style={styles.mark}>{"— "}</Text>
              {item}
            </Text>
          ))}
        </ScrollView>
        {topFade}
        {bottomFade}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700",
    color: "rgba(255,255,255,0.96)",
    // Most of the title-to-list gap lives in scrollContent's paddingTop, so
    // the resting first item clears the top fade.
    marginBottom: 4,
    marginHorizontal: 32,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    gap: 16,
    paddingHorizontal: 32,
    // Rest the first item below the top fade; text only slides under it once
    // the list is scrolled.
    paddingTop: TOP_FADE_HEIGHT,
  },
  fade: {
    position: "absolute",
    left: 0,
    right: 0,
    pointerEvents: "none",
  },
  item: {
    fontSize: 17,
    lineHeight: 26,
    color: "rgba(255,255,255,0.78)",
  },
  mark: {
    color: "rgba(255,255,255,0.35)",
    fontWeight: "600",
  },
});
