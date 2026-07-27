import type { Language } from "../i18n/translations";

export type OverlayKind = "breathing" | "rights" | "needs";

// Language-independent structure: order, colors, and which full-screen
// overlay (if any) a step's button opens. Translators never touch this.
export interface StepMeta {
  id: number;
  gradient: [string, string];
  overlay?: OverlayKind;
}

// Translatable text for a single step.
export interface StepText {
  title: string;
  body: string[];
}

// What a screen actually renders: structure + text for the current language.
export interface Step extends StepMeta, StepText {}

export const stepMeta: StepMeta[] = [
  { id: 1, gradient: ["#3b1535", "#241038"] },
  { id: 2, gradient: ["#3a1644", "#1f1240"] },
  { id: 3, gradient: ["#33184f", "#191243"], overlay: "rights" },
  { id: 4, gradient: ["#2b1c5c", "#161347"] },
  { id: 5, gradient: ["#232462", "#131a4d"] },
  { id: 6, gradient: ["#1d2c6b", "#102050"] },
  { id: 7, gradient: ["#163a72", "#0d2a55"], overlay: "breathing" },
  { id: 8, gradient: ["#10477a", "#0a3360"] },
  { id: 9, gradient: ["#0b5380", "#073d63"] },
  { id: 10, gradient: ["#085e82", "#054762"] },
  { id: 11, gradient: ["#076a7e", "#045061"] },
  { id: 12, gradient: ["#0a7372", "#055756"], overlay: "needs" },
  { id: 13, gradient: ["#0d7a58", "#075c42"] },
];

// One array of 13 StepText per language, in the same order as stepMeta.
export const stepText: Record<Language, StepText[]> = {
  en: [
    {
      title: "Say to yourself: “I’m having a flashback”",
      body: ["What you’re living through is a memory. It can’t hurt you now."],
    },
    {
      title: "Remind yourself: “I feel afraid, but I’m not in danger”",
      body: ["There is no danger.", "Here, in the present, you are safe."],
    },
    {
      title: "Own your right and need to have boundaries",
      body: [
        "You are free to leave dangerous situations and to protest unfair treatment.",
      ],
    },
    {
      title: "Speak reassuringly to your inner child",
      body: [
        "They need to know that you love them unconditionally, and that they can come to you for comfort and protection.",
      ],
    },
    {
      title: "Deconstruct eternity thinking",
      body: [
        "In childhood, fear and abandonment seemed endless.",
        "Remember that the flashback will pass, as it has many times before.",
      ],
    },
    {
      title: "You are in an adult body",
      body: [
        "Now you have allies, skills, and resources to protect yourself that you never had as a child.",
      ],
    },
    {
      title: "Ease back into your body",
      body: [
        "Feel the fear, but don’t act on it.",
        "Slow down. Breathe deeply and slowly.",
      ],
    },
    {
      title: "Resist the inner critic",
      body: [
        "Stop the thought when you recognize the critic’s voice.",
        "Turn the anger of self-criticism against the critic itself.",
        "Refuse to shame or hate yourself. Be compassionate with yourself.",
      ],
    },
    {
      title: "Allow yourself to grieve",
      body: [
        "Healthy grieving can turn tears into self-compassion, and anger into self-protection.",
      ],
    },
    {
      title: "Cultivate safe relationships",
      body: [
        "Be alone if you need to, but don’t let shame isolate you.",
        "Tell the people close to you about your flashbacks and ask them to help you talk them through and live through them.",
      ],
    },
    {
      title: "Learn to identify your triggers",
      body: [
        "Avoid unsafe people, places, activities, and thoughts that spin you up.",
        "If a trigger is unavoidable — prepare in advance.",
      ],
    },
    {
      title: "Figure out what you’re flashing back to",
      body: [
        "Flashbacks point to old wounds that are still waiting to be acknowledged and healed.",
        "They show which needs went unmet in childhood.",
      ],
    },
    {
      title: "Be patient with a slow recovery",
      body: [
        "Recovery is a slow process.",
        "Don’t scold yourself for a flashback. It’s not a setback — it’s part of the journey.",
      ],
    },
  ],
  ru: [
    {
      title: "Скажи вслух: «У меня флешбэк»",
      body: [
        "То, что ты проживаешь, — это воспоминания. Они не могут навредить тебе сейчас.",
      ],
    },
    {
      title: "Напомни себе: «Сейчас я в безопасности»",
      body: ["Опасности нет.", "Здесь, в настоящем, ты в безопасности."],
    },
    {
      title: "Защищай свои права и границы",
      body: [
        "Ты {волен|вольна} покидать опасные ситуации и протестовать против несправедливого обращения.",
      ],
    },
    {
      title: "Поговори с внутренним ребёнком",
      body: [
        "Ему важно знать, что ты любишь его безусловно и что он может прийти к тебе за утешением и защитой.",
      ],
    },
    {
      title: "Оспорь мысль, что это навсегда",
      body: [
        "В детстве страх и заброшенность казались бесконечными.",
        "Помни, что флешбэк пройдёт, как проходил уже много раз.",
      ],
    },
    {
      title: "Ты во взрослом теле",
      body: [
        "Теперь у тебя есть союзники, навыки и ресурсы для защиты, которых никогда не было в детстве.",
      ],
    },
    {
      title: "Ласково попроси тело расслабиться",
      body: [
        "Ощущай страх, но не реагируй на него.",
        "Замедлись. Дыши глубоко и медленно.",
      ],
    },
    {
      title: "Сопротивляйся внутреннему критику",
      body: [
        "Останавливай мысль, когда узнаёшь голос критика.",
        "Разверни гнев самокритики против самого критика.",
        "Откажись стыдить и ненавидеть себя. Сострадай себе.",
      ],
    },
    {
      title: "Позволь себе горевать",
      body: [
        "Здоровое горевание способно превратить слёзы в самосострадание, а гнев — в самозащиту.",
      ],
    },
    {
      title: "Опирайся на безопасные отношения",
      body: [
        "Побудь {один|одна}, если это нужно, но не давай стыду изолировать тебя.",
        "Расскажи близким о флешбэках и попроси помочь тебе проговаривать и проживать их.",
      ],
    },
    {
      title: "Учись распознавать триггеры",
      body: [
        "Избегай небезопасных людей, мест, занятий и мыслей, которые тебя раскручивают.",
        "Если триггер неизбежен — подготовься заранее.",
      ],
    },
    {
      title: "Выясни, к чему ты возвращаешься",
      body: [
        "Флешбэки указывают на старые раны, которые ещё ждут признания и исцеления.",
        "Они показывают, какие потребности не были удовлетворены в детстве.",
      ],
    },
    {
      title: "Будь {терпелив|терпелива} к себе",
      body: [
        "Восстановление — медленный процесс.",
        "Не ругай себя за флешбэк. Это не откат назад, а часть пути.",
      ],
    },
  ],
  sr: [
    {
      title: "Reci naglas: „Imam flešbek“",
      body: [
        "Ono što proživljavaš — to su sećanja. Ne mogu da ti naškode sada.",
      ],
    },
    {
      title: "Podseti se: „Sada sam na sigurnom“",
      body: ["Nema opasnosti.", "Ovde, u sadašnjosti, na sigurnom si."],
    },
    {
      title: "Štiti svoja prava i granice",
      body: [
        "{Slobodan|Slobodna} si da napuštaš opasne situacije i da se buniš protiv nepravednog postupanja.",
      ],
    },
    {
      title: "Razgovaraj sa unutrašnjim detetom",
      body: [
        "Njemu je važno da zna da ga voliš bezuslovno i da može da dođe kod tebe po utehu i zaštitu.",
      ],
    },
    {
      title: "Ospori misao da je ovo zauvek",
      body: [
        "U detinjstvu su strah i napuštenost izgledali beskrajno.",
        "Zapamti da će flešbek proći, kao što je prolazio već mnogo puta.",
      ],
    },
    {
      title: "Ti si u odraslom telu",
      body: [
        "Sada imaš saveznike, veštine i resurse za zaštitu, kojih u detinjstvu nikada nije bilo.",
      ],
    },
    {
      title: "Nežno zamoli telo da se opusti",
      body: [
        "Oseti strah, ali ne reaguj na njega.",
        "Uspori. Diši duboko i polako.",
      ],
    },
    {
      title: "Odupri se unutrašnjem kritičaru",
      body: [
        "Zaustavi misao kada prepoznaš glas kritičara.",
        "Okreni bes samokritike protiv samog kritičara.",
        "Odbij da se stidiš i mrziš sebe. Saosećaj sa sobom.",
      ],
    },
    {
      title: "Dozvoli sebi da tuguješ",
      body: [
        "Zdravo tugovanje može da pretvori suze u saosećanje prema sebi, a bes — u zaštitu sebe.",
      ],
    },
    {
      title: "Osloni se na sigurne odnose",
      body: [
        "Budi {sam|sama} kada ti je potrebno, ali ne dozvoli da te stid izoluje.",
        "Reci bliskima o flešbekovima i zamoli ih da ti pomognu da ih izgovoriš i proživiš.",
      ],
    },
    {
      title: "Nauči da prepoznaješ okidače",
      body: [
        "Izbegavaj nesigurne ljude, mesta, aktivnosti i misli koje te raspaljuju.",
        "Ako je okidač neizbežan — pripremi se unapred.",
      ],
    },
    {
      title: "Otkrij u šta se vraćaš",
      body: [
        "Flešbekovi ukazuju na stare rane koje još čekaju priznanje i isceljenje.",
        "Pokazuju koje potrebe nisu bile zadovoljene u detinjstvu.",
      ],
    },
    {
      title: "Budi {strpljiv|strpljiva} prema sebi",
      body: [
        "Oporavak je spor proces.",
        "Ne grdi sebe zbog flešbeka. To nije nazadovanje, već deo puta.",
      ],
    },
  ],
};
