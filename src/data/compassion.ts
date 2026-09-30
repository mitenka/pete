import type { Language } from "../i18n/translations";

// Text for the guided self-compassion flow (step 8): the breathing intro,
// then labelled stages of phrase slots (one screen per slot, advanced by
// tap), then the ending. Everything passes through resolveGender, so ru/sr
// use {m|f} markers.
//
// A slot is either a fixed phrase or a list of variants, one of which is
// picked when the flow opens. The first slot of every stage is a fixed anchor
// so each run starts familiar; the variants keep later runs fresh. Variant
// counts must match across languages — the pick is stored as an index.
export type CompassionSlot = string | string[];

export interface CompassionStage {
  // Short caption shown above the phrases of this stage.
  label: string;
  phrases: CompassionSlot[];
}

export interface CompassionText {
  // Shown during the three guiding breaths at the start.
  intro: string;
  stages: CompassionStage[];
  // The final screen; the flow rests here until closed.
  ending: string;
  // The tap-to-continue hint under the phrases.
  hint: string;
}

export const compassionText: Record<Language, CompassionText> = {
  en: {
    intro: "Put a hand on your heart.\nLet’s take three slow breaths.",
    stages: [
      {
        label: "Acknowledge",
        phrases: [
          "This hurts right now.\nThis is a hard moment.",
          [
            "I don’t have to pretend I’m fine.",
            "I’m allowed to feel what I feel.",
            "I can name this — and not drown in it.",
          ],
        ],
      },
      {
        label: "Not alone",
        phrases: [
          "I’m not alone in this.\nSo many people have felt the same.",
          [
            "Pain is part of being human.\nI’m not broken.",
            "Right now someone else is going through this too.\nWe’re in it together.",
            "I’m struggling, the way everyone struggles sometimes.\nIt doesn’t make me any less.",
          ],
        ],
      },
      {
        label: "The critic",
        phrases: [
          "This voice inside isn’t me.\nIt’s an old voice, and it doesn’t own me.",
          [
            "This is a flashback. It will pass.\nI refuse to shame myself.",
            "I won’t argue with it.\nI just won’t listen to it.",
            "This anger isn’t for me.\nLet it fall on the critic.",
          ],
        ],
      },
      {
        label: "Kindness",
        phrases: [
          "I’m doing the best I can.",
          [
            "I deserve kindness.\nEspecially now.",
            "I’ll talk to myself\nthe way I’d talk to a friend.",
            "I’m allowed to be kind to myself.\nRight now.",
          ],
        ],
      },
      {
        label: "The child",
        phrases: [
          "Picture yourself as a child.\nHold them and say:",
          [
            "I see you. I’m here.\nNone of this was your fault.",
            "I’m sorry you had to go through that.\nYou didn’t deserve it.",
            "You are good.\nYou were always good.",
          ],
          "I’m grown up now.\nI’ll protect you.\nI won’t leave you.",
        ],
      },
      {
        label: "Wishes",
        phrases: [
          "May I be safe.\nMay I be at peace.",
          [
            "May I be kind to myself.\nMay I accept myself as I am.",
            "May the pain ease.\nMay I feel lighter.",
            "May I be as kind to myself\nas I want to be to others.",
          ],
        ],
      },
    ],
    ending: "Stay here for as long as you like.",
    hint: "Tap when you’re ready",
  },
  ru: {
    intro: "Положи руку на сердце.\nСделаем три медленных вдоха.",
    stages: [
      {
        label: "Признать",
        phrases: [
          "Сейчас мне больно.\nЭто тяжёлый момент.",
          [
            "Я не {обязан|обязана} делать вид, что всё в порядке.",
            "Мне можно чувствовать то, что я чувствую.",
            "Я могу назвать это — и не утонуть в этом.",
          ],
        ],
      },
      {
        label: "Не {один|одна}",
        phrases: [
          "Я не {один|одна} в этом.\nМногие люди чувствовали то же самое.",
          [
            "Боль — часть человеческой жизни.\nЯ не {сломан|сломана}.",
            "Прямо сейчас кто-то ещё переживает то же самое.\nМы в этом вместе.",
            "Мне трудно, как бывает трудно всем.\nЭто не делает меня хуже.",
          ],
        ],
      },
      {
        label: "Критик",
        phrases: [
          "Этот голос внутри — не я.\nЭто старый голос, и он мне не хозяин.",
          [
            "Это флешбэк. Он пройдёт.\nЯ отказываюсь себя стыдить.",
            "Я не буду с ним спорить.\nЯ просто не буду его слушать.",
            "Эта злость — не мне.\nПусть достанется критику.",
          ],
        ],
      },
      {
        label: "Доброта",
        phrases: [
          "Я делаю всё, что могу.",
          [
            "Я заслуживаю доброты.\nОсобенно сейчас.",
            "Я буду говорить с собой так,\nкак {говорил|говорила} бы с другом.",
            "Мне можно быть {добрым|доброй} к себе.\nПрямо сейчас.",
          ],
        ],
      },
      {
        label: "Ребёнок",
        phrases: [
          "Вспомни себя {маленьким|маленькой}.\nОбними {его|её} и скажи:",
          [
            "Я тебя вижу. Я рядом.\nТы ни в чём не {виноват|виновата}.",
            "Мне жаль, что тебе пришлось через это пройти.\nТы этого не {заслуживал|заслуживала}.",
            "Ты {хороший|хорошая}.\nТы всегда {был|была} {хорошим|хорошей}.",
          ],
          "Теперь я {взрослый|взрослая}.\nЯ тебя защищу.\nЯ тебя не оставлю.",
        ],
      },
      {
        label: "Пожелания",
        phrases: [
          "Пусть я буду в безопасности.\nПусть я буду {спокоен|спокойна}.",
          [
            "Пусть я буду {добр|добра} к себе.\nПусть я приму себя {таким|такой}, {какой|какая} я есть.",
            "Пусть боль утихнет.\nПусть мне станет легче.",
            "Пусть я буду {добр|добра} к себе так же,\nкак хочу быть {добрым|доброй} к другим.",
          ],
        ],
      },
    ],
    ending: "Останься в этом столько, сколько захочешь.",
    hint: "Коснись экрана, когда будешь {готов|готова}",
  },
  sr: {
    intro: "Stavi ruku na srce.\nHajde da udahnemo tri puta, polako.",
    stages: [
      {
        label: "Priznati",
        phrases: [
          "Sada me boli.\nOvo je težak trenutak.",
          [
            "Ne moram da se pretvaram da je sve u redu.",
            "Smem da osećam ono što osećam.",
            "Mogu ovo da imenujem — i da se ne utopim u tome.",
          ],
        ],
      },
      {
        label: "Nisi {sam|sama}",
        phrases: [
          "Nisam {sam|sama} u ovome.\nMnogi ljudi su osećali isto.",
          [
            "Bol je deo ljudskog života.\nNisam {slomljen|slomljena}.",
            "Baš sada neko drugi prolazi kroz isto.\nU ovome smo zajedno.",
            "Teško mi je, kao što svima ponekad bude teško.\nTo me ne čini {gorim|gorom}.",
          ],
        ],
      },
      {
        label: "Kritičar",
        phrases: [
          "Ovaj glas u meni nisam ja.\nTo je stari glas i on mi nije gospodar.",
          [
            "Ovo je flešbek. Proći će.\nOdbijam da se stidim sebe.",
            "Neću se raspravljati s njim.\nJednostavno ga neću slušati.",
            "Ovaj bes nije za mene.\nNeka ide kritičaru.",
          ],
        ],
      },
      {
        label: "Dobrota",
        phrases: [
          "Radim najbolje što mogu.",
          [
            "Zaslužujem dobrotu.\nPosebno sada.",
            "Razgovaraću sa sobom onako\nkako bih {razgovarao|razgovarala} s prijateljem.",
            "Smem da budem {dobar|dobra} prema sebi.\nBaš sada.",
          ],
        ],
      },
      {
        label: "Dete",
        phrases: [
          "Seti se sebe kao deteta.\nZagrli ga i reci:",
          [
            "Vidim te. Tu sam.\nNi za šta nisi {kriv|kriva}.",
            "Žao mi je što si {morao|morala} kroz to da prođeš.\nNisi to {zaslužio|zaslužila}.",
            "{Dobar|Dobra} si.\nUvek si {bio|bila} {dobar|dobra}.",
          ],
          "Sada sam {odrastao|odrasla}.\nZaštitiću te.\nNeću te ostaviti.",
        ],
      },
      {
        label: "Želje",
        phrases: [
          "Neka budem {siguran|sigurna}.\nNeka budem {miran|mirna}.",
          [
            "Neka budem {dobar|dobra} prema sebi.\nNeka prihvatim sebe {takvog kakav|takvu kakva} sam.",
            "Neka bol utihne.\nNeka mi bude lakše.",
            "Neka budem {dobar|dobra} prema sebi\nkoliko želim da budem prema drugima.",
          ],
        ],
      },
    ],
    ending: "Ostani u ovome koliko god želiš.",
    hint: "Dodirni ekran kad budeš {spreman|spremna}",
  },
};
