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
      body: [
        "A flashback pulls you into a timeless part of the psyche that feels as helpless and hopeless as you did in childhood.",
        "But the feelings and sensations you’re experiencing now are memories. They cannot hurt you in the present.",
      ],
    },
    {
      title: "Remind yourself: “I feel afraid, but I’m not in danger”",
      body: [
        "“I am here, in the present, and I am safe.”",
        "Remember: you are not in that past where it was dangerous.",
      ],
    },
    {
      title: "Own your right to boundaries",
      body: [
        "Remind yourself: you don’t have to let anyone treat you badly.",
        "You can leave dangerous situations and protest unfair treatment.",
      ],
    },
    {
      title: "Support your inner child",
      body: [
        "Your inner child needs to know that you love them unconditionally.",
        "Tell them: “You can come to me for comfort and protection whenever you feel scared and alone.”",
      ],
    },
    {
      title: "Dispel the idea that the flashback is forever",
      body: [
        "In childhood, fear and abandonment felt endless — a safe future was impossible to imagine.",
        "Remember: the flashback will pass. It has before.",
      ],
    },
    {
      title: "You are in an adult body",
      body: [
        "You have allies, skills, and resources to protect yourself that you didn’t have as a child.",
        "Feeling small and fragile is a sign of a flashback, not reality.",
      ],
    },
    {
      title: "Come back into your body",
      body: [
        "Fear is just energy in the body. It won’t harm you if you don’t run from it or fight it.",
        "Gently ask your body to relax: feel each large muscle group and release the tension.",
        "Breathe deeply and slowly. Holding your breath signals danger to the body.",
        "Slow down: rushing pushes you toward a flight response.",
        "Find a safe place: wrap yourself in a blanket, hug a pillow, lie down.",
      ],
    },
    {
      title: "Resist the inner critic",
      body: [
        "The critic exaggerates catastrophes and demands perfection. Stop these thoughts.",
        "Refuse to shame, hate, or abandon yourself.",
        "Channel the anger of self-criticism into a “NO” to unfair attacks on yourself.",
      ],
    },
    {
      title: "Let yourself grieve",
      body: [
        "Flashbacks are a chance to release old, unexpressed pain: fear, hurt, abandonment.",
        "Acknowledge and comfort the childhood experience of helplessness. That feeling was real — back then.",
        "Healthy grieving turns tears into self-compassion, and anger into self-protection.",
      ],
    },
    {
      title: "Don’t stay alone too long",
      body: [
        "Spending time alone is fine. But don’t let shame isolate you.",
        "Feeling shame doesn’t mean you are shameful.",
        "Tell people close to you about your flashbacks; ask them to help you talk through and feel them.",
      ],
    },
    {
      title: "Learn to recognize your triggers",
      body: [
        "When possible, avoid unsafe people, places, and activities.",
        "If a trigger is unavoidable, prepare in advance using these steps.",
      ],
    },
    {
      title: "Figure out what you’re flashing back to",
      body: [
        "Flashbacks point to old wounds that are still waiting to be acknowledged and healed.",
        "They show which needs went unmet in childhood — and hint at how to meet them now.",
      ],
    },
    {
      title: "Be patient with yourself",
      body: [
        "Recovery is a slow process. Your body needs time in the present for the adrenaline to fade.",
        "Don’t scold yourself for having a flashback. It’s not a setback — it’s part of the journey.",
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
      body: ["Опасности нет.", "Здесь, в настоящем, ты в безопасности."],
    },
    {
      title: "Защищай свои права и границы",
      body: [
        "Ты {свободен|свободна} покидать опасные ситуации и протестовать против несправедливого обращения.",
      ],
    },
    {
      title: "Поговори с внутренним ребёнком",
      body: [
        "Ему важно знать, что ты любишь его безусловно и что он может прийти к тебе за утешением и защитой.",
      ],
    },
    {
      title: "Деконструируй представление о «вечных проблемах»",
      body: [
        "В детстве страх и заброшенность представлялись бесконечными.",
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
        "Ощущай страх, но не реагируй на него.",
        "Замедлись. Дыши глубоко и медленно.",
      ],
    },
    {
      title: "Сопротивляйся внутреннему критику",
      body: [
        "Используй остановку мысли.",
        "Направь гнев самоатаки на критика.",
        "Откажись стыдить и ненавидеть себя. Сострадай себе.",
      ],
    },
    {
      title: "Позволь себе горевать",
      body: [
        "Здоровое горевание способно превратить слёзы в самосострадание, а гнев — в самозащиту.",
      ],
    },
    {
      title: "Культивируй безопасные отношения",
      body: [
        "Бери время побыть {одному|одной}, когда это нужно, но не давай стыду изолировать тебя.",
        "Расскажи близким о флешбэках и попроси их помочь тебе проговаривать и проживать их.",
      ],
    },
    {
      title: "Учись распознавать триггеры",
      body: [
        "Избегай небезопасных людей, мест, занятий и провоцирующих мыслительных процессов.",
        "Если триггер неизбежен — подготовься заранее.",
      ],
    },
    {
      title: "Выясни, к чему ты возвращаешься",
      body: [
        "Флэшбеки указывают на старые раны, которые ещё ждут признания и исцеления.",
        "Они показывают, какие потребности не были удовлетворены в детстве.",
      ],
    },
    {
      title: "Будь {терпелив|терпелива}",
      body: [
        "Восстановление — медленный процесс.",
        "Не ругай себя за флэшбек. Это не откат назад, это часть пути.",
      ],
    },
  ],
  sr: [
    {
      title: "Reci sebi: „Imam flešbek“",
      body: [
        "Flešbek te odvodi u bezvremeni deo psihe koji se oseća jednako bespomoćno i beznadežno kao u detinjstvu.",
        "Ali osećanja i senzacije koje sada doživljavaš jesu sećanja. Ona ne mogu da ti naškode u sadašnjosti.",
      ],
    },
    {
      title: "Podseti se: „Plašim se, ali nisam u opasnosti“",
      body: [
        "„Ovde sam, u sadašnjosti, na sigurnom.“",
        "Zapamti: sada nisi u onoj prošlosti u kojoj je bilo opasno.",
      ],
    },
    {
      title: "Priznaj sebi pravo na granice",
      body: [
        "Podseti se: ne moraš da dozvoliš nikome da se loše ophodi prema tebi.",
        "Možeš da napuštaš opasne situacije i da se buniš protiv nepravednog postupanja.",
      ],
    },
    {
      title: "Podrži unutrašnje dete",
      body: [
        "Tvoje unutrašnje dete treba da zna da ga voliš bezuslovno.",
        "Reci mu: „Možeš da dođeš kod mene po utehu i zaštitu kad god se uplašiš i osetiš usamljeno.“",
      ],
    },
    {
      title: "Razbij misao da flešbek traje večno",
      body: [
        "U detinjstvu su se strah i napuštenost činili beskrajnim — sigurnu budućnost je bilo nemoguće zamisliti.",
        "Zapamti: flešbek će proći. Već je prolazio i ranije.",
      ],
    },
    {
      title: "Ti si u odraslom telu",
      body: [
        "Imaš saveznike, veštine i resurse da se zaštitiš — kojih u detinjstvu nije bilo.",
        "Osećaj da si {mali|mala} i {krhak|krhka} znak je flešbeka, a ne stvarnost.",
      ],
    },
    {
      title: "Vrati se u svoje telo",
      body: [
        "Strah je samo energija u telu. Neće ti naškoditi ako ne bežiš od njega i ne boriš se s njim.",
        "Nežno zamoli telo da se opusti: oseti svaku veliku grupu mišića i otpusti napetost.",
        "Diši duboko i polako. Zadržavanje daha telu signalizira opasnost.",
        "Uspori: žurba te gura ka reakciji bekstva.",
        "Pronađi sigurno mesto: umotaj se u ćebe, zagrli jastuk, prilegni.",
      ],
    },
    {
      title: "Odupri se unutrašnjem kritičaru",
      body: [
        "Kritičar preuveličava katastrofe i zahteva savršenstvo. Zaustavljaj te misli.",
        "Odbij da se stidiš, mrziš i napuštaš sebe.",
        "Usmeri bes samokritike u „NE“ nepravednim napadima na sebe.",
      ],
    },
    {
      title: "Dozvoli sebi da tuguješ",
      body: [
        "Flešbekovi su prilika da ispustiš staru, neizraženu bol: strah, povredu, napuštenost.",
        "Priznaj i uteši dečje iskustvo bespomoćnosti. To osećanje je bilo stvarno — tada.",
        "Zdravo tugovanje pretvara suze u saosećanje prema sebi, a bes u zaštitu sebe.",
      ],
    },
    {
      title: "Ne ostaj predugo sam",
      body: [
        "Sasvim je u redu provesti vreme nasamo. Ali ne dozvoli da te stid izoluje.",
        "Osećati stid ne znači biti {sraman|sramna}.",
        "Reci bliskima o flešbekovima, zamoli ih da ti pomognu da ih izgovoriš i proživiš.",
      ],
    },
    {
      title: "Nauči da prepoznaješ okidače",
      body: [
        "Kad je moguće, izbegavaj nesigurne ljude, mesta i aktivnosti.",
        "Ako je okidač neizbežan — pripremi se unapred, oslanjajući se na ove korake.",
      ],
    },
    {
      title: "Otkrij u šta se vraćaš",
      body: [
        "Flešbekovi ukazuju na stare rane koje još čekaju da budu priznate i isceljene.",
        "Pokazuju koje potrebe nisu bile zadovoljene u detinjstvu — i nagoveštavaju kako da ih zadovoljiš sada.",
      ],
    },
    {
      title: "Budi {strpljiv|strpljiva} prema sebi",
      body: [
        "Oporavak je spor proces. Telu treba vreme u sadašnjosti da adrenalin nestane.",
        "Ne grdi sebe što si {imao|imala} flešbek. To nije nazadovanje — to je deo puta.",
      ],
    },
  ],
};
