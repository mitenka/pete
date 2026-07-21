import type { Language } from "../i18n/translations";

export interface OverlayList {
  items: string[];
}

// Placeholder content — swap for the book's exact wording once the Russian
// text pass is done, then translate to en/sr same as everything else. No
// code changes needed then, just these arrays.
export const overlayLists: Record<
  Language,
  { rights: OverlayList; needs: OverlayList }
> = {
  en: {
    rights: {
      items: Array.from({ length: 12 }, (_, i) => `Placeholder right ${i + 1}`),
    },
    needs: {
      items: Array.from({ length: 12 }, (_, i) => `Placeholder need ${i + 1}`),
    },
  },
  ru: {
    rights: {
      items: Array.from(
        { length: 12 },
        (_, i) => `Плейсхолдер-право ${i + 1}`,
      ),
    },
    needs: {
      items: Array.from(
        { length: 12 },
        (_, i) => `Плейсхолдер-потребность ${i + 1}`,
      ),
    },
  },
  sr: {
    rights: {
      items: Array.from(
        { length: 12 },
        (_, i) => `Placeholder pravo ${i + 1}`,
      ),
    },
    needs: {
      items: Array.from(
        { length: 12 },
        (_, i) => `Placeholder potreba ${i + 1}`,
      ),
    },
  },
};
