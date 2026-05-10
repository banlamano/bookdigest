
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const EXPANSIONS: any = {
  "Me Before You": {
    "en": {
      "summary": "Jojo Moyes's *Me Before You* is a heart-wrenching and thought-provoking exploration of love, disability, and the right to die. The story follows Louisa Clark, an quirky and under-ambitious young woman in a small English town who lost her job at a cafe. In a desperate search for income, she takes a job as a caregiver for Will Traynor, a once-successful and adventurous man who became a quadriplegic following a motorcycle accident. Will is bitter and suicidal, but Lou's persistence and vibrancy slowly crack his shell. The novel is not a typical fairy-tale romance; it is a deep dive into the complex ethical dilemmas surrounding medical choice and the transformative power of human connection.\n\n### Why It Matters\nThis book sparked a global conversation about the quality of life and the autonomy of individuals with severe disabilities. It matters because it humanizes a often-marginalized population, portraying Will not just as a patient, but as a complex man with a rich past. For readers, it serves as a powerful reminder to live a 'big life' and to appreciate the freedom of movement and health. It challenges the cliché that 'love conquers all,' presenting a more nuanced reality where love is profound but sometimes not enough to change a person's fundamental desire for dignity.\n\n### The Final Takeaway\nLove can change everything, but it cannot always fix the unfixable. The true gift Louisa and Will gave each other was the courage to see the world differently—Lou to dream bigger, and Will to feel alive one last time.",
      "keyInsights": [
        { "title": "The Importance of Living a Large Life", "explanation": "Will's greatest regret isn't just his injury, but that Louisa is settling for a small, safe life when she has so much potential. He pushes her to expand her horizons.", "example": "Will encourages Lou to learn foreign languages, listen to classical music, and travel.", "impact": "Empowers individuals to move beyond their comfort zones." },
        { "title": "Autonomy and Dignity in Suffering", "explanation": "The novel tackles the difficult concept of 'the right to die.' Will believes that having control over his own ending is the only dignity he has left.", "example": "Will's unwavering decision to go to Dignitas despite Lou's efforts to show him life is worth living.", "impact": "Sparks ethical reflection on medical aid in dying." },
        { "title": "Happiness vs. Obligation", "explanation": "Louisa struggles with the idea that she can only be happy if she 'saves' Will. She eventually learns that a person's happiness is ultimately their own responsibility.", "example": "Lou realizing that she couldn't make Will want to live, but she could make his final months beautiful.", "impact": "Reduces codependency and promotes emotional maturity." },
        { "title": "Class and Opportunity", "explanation": "The contrast between the wealthy Traynors and the working-class Clarks highlights how socioeconomic backgrounds shape one's worldview and life choices.", "example": "Lou's family's reliance on her income prevents her from taking risks that Will takes for granted.", "impact": "Raises awareness of social mobility and economic constraints." }
      ],
      "chapters": [
        { "number": 1, "title": "The Cafe and the Castle", "summary": "Louisa loses her job and is introduced to the Traynor family's world at the local castle." },
        { "number": 2, "title": "First Encounters", "summary": "The rocky start between Lou and Will. Will's resentment and Lou's determination to stay." },
        { "number": 3, "title": "The Grand Plan", "summary": "Lou discovers Will's secret suicide pact and devises a plan to take him on adventures to change his mind." },
        { "number": 4, "title": "The Maze of Love", "summary": "The deepening emotional bond during their trips, culminating in their final holiday together." }
      ],
      "quotes": [
        "You only get one life. It's actually your duty to live it as fully as possible.",
        "Knowing you still have possibilities is a luxury.",
        "Push yourself. Don't settle. Just live well. Just live.",
        "You are scored on my heart, Clark. You were from the first day you walked in."
      ],
      "actionItems": [
        "Plan one 'adventure' this month that takes you out of your daily routine.",
        "Identify one area of your life where you are 'settling' and take one small step to change it.",
        "Have a deep conversation with a loved one about their definition of 'dignity'.",
        "Practice radical empathy by spending time with someone whose life experience is vastly different from yours."
      ]
    },
    "de": {
      "summary": "Jojo Moyes' 'Ein ganzes halbes Jahr' (Me Before You) ist eine herzzerreißende und tiefgründige Erkundung von Liebe, Behinderung und dem Recht auf Selbstbestimmung. Die Geschichte folgt Louisa Clark, einer skurrilen und wenig ehrgeizigen jungen Frau in einer englischen Kleinstadt, die nach dem Verlust ihres Jobs als Pflegekraft für Will Traynor eingestellt wird. Will, ein einst erfolgreicher und abenteuerlustiger Mann, ist seit einem Unfall querschnittsgelähmt und lebensmüde. Lou setzt alles daran, ihm zu zeigen, dass das Leben noch lebenswert ist. Der Roman ist kein typisches Märchen, sondern setzt sich kritisch mit den ethischen Dilemmata am Lebensende und der transformativen Kraft menschlicher Nähe auseinander.\n\n### Warum es wichtig ist\nDieses Buch hat eine weltweite Debatte über Lebensqualität und die Autonomie von Menschen mit schweren Behinderungen ausgelöst. Es ist wichtig, weil es Will nicht nur als Patienten zeigt, sondern als komplexen Menschen mit einer bedeutenden Vergangenheit. Für die Leser ist es ein eindringlicher Appell, das eigene Leben bewusster zu gestalten und die Freiheit der Gesundheit wertzuschätzen. Es fordert das Klischee 'Liebe besiegt alles' heraus und präsentiert eine Realität, in der Liebe tief, aber manchmal nicht genug ist, um das Schicksal zu ändern.\n\n### Die zentrale Erkenntnis\nLiebe kann die Sicht auf die Welt verändern, aber sie kann nicht alles wiedergutmachen. Das größte Geschenk, das Louisa und Will einander machten, war der Mut, über den eigenen Tellerrand hinauszuschauen – Lou, um größer zu träumen, und Will, um sich ein letztes Mal lebendig zu fühlen.",
      "keyInsights": [
        { "title": "Die Pflicht zum Leben", "explanation": "Will sieht in Louisa ein verschenktes Potenzial. Er lehrt sie, dass es eine Verschwendung ist, ein kleines Leben zu führen, wenn man alle Möglichkeiten der Welt hat.", "example": "Will drängt Louisa dazu, Fremdsprachen zu lernen und die Welt außerhalb ihrer Kleinstadt zu erkunden.", "impact": "Ermutigt dazu, Komfortzonen zu verlassen." },
        { "title": "Selbstbestimmung am Lebensende", "explanation": "Der Roman thematisiert das Recht auf einen würdevollen Tod. Will besteht darauf, dass die Kontrolle über sein Ende seine letzte verbliebene Freiheit ist.", "example": "Wills Entscheidung, trotz Louisas Liebe nach Dignitas zu gehen.", "impact": "Fördert die ethische Auseinandersetzung mit Sterbehilfe." },
        { "title": "Grenzen der Hilfe", "explanation": "Man kann niemanden 'retten', der nicht gerettet werden will. Wahre Liebe bedeutet manchmal auch, die schmerzhaften Entscheidungen des anderen zu akzeptieren.", "example": "Louisas schmerzhafter Prozess der Akzeptanz von Wills letztem Wunsch.", "impact": "Fördert emotionale Reife und Akzeptanz." }
      ],
      "chapters": [
        { "number": 1, "title": "Das Ende der Unschuld", "summary": "Louisa verliert ihren Job und tritt in die Welt der wohlhabenden Familie Traynor ein." },
        { "number": 2, "title": "Annäherungen", "summary": "Der schwierige Start zwischen der lebensfrohen Lou und dem zynischen Will." },
        { "number": 3, "title": "Der Plan", "summary": "Louisa erfährt von Wills Absichten und plant sechs Monate voller Abenteuer, um ihn umzustimmen." }
      ],
      "quotes": [
        "Man hat nur ein Leben. Es ist Pflicht, es so vollkommen wie möglich zu leben.",
        "Lebe einfach. Lebe gut. Lebe einfach.",
        "Du bist in mein Herz tätowiert, Clark."
      ],
      "actionItems": [
        "Finden Sie eine Sache, in der Sie sich 'eingerichtet' haben, und fordern Sie sich neu heraus.",
        "Sprechen Sie mit jemandem über das Thema Selbstbestimmung und Würde.",
        "Planen Sie eine Reise oder ein Erlebnis, das Sie schon lange aufgeschoben haben."
      ]
    }
  },
  "After You": {
    "en": {
      "summary": "The sequel to *Me Before You*, Jojo Moyes's *After You* follows Louisa Clark as she struggles to move on after Will Traynor's death. Lou is back in London, working a dead-end job at an airport bar and living in a state of suspended animation. She is haunted by Will's legacy and the guilt of not being able to save him. The story takes an unexpected turn when a figure from Will's past appears, forcing Lou to confront the complexities of grief, family secrets, and the difficulty of finding love again. It is a story about the messy, non-linear process of healing and the courage it takes to start over.\n\n### Why It Matters\nWhile many readers expected a neat resolution, *After You* is important because it portrays a realistic aftermath of trauma. It matters because it explores the 'third act' of a person's life that usually goes undocumented in romance novels: the part where you have to live with the choices you made. It tackles themes of grief-counseling, blended families, and the struggle to find one's individual identity after being part of a high-profile tragedy. It is a grounding read for anyone who has ever felt 'stuck' in their past.\n\n### The Final Takeaway\nHealing is not about forgetting; it's about learning to carry your scars while continuing to walk forward. Life doesn't end with a great loss; it just changes shape.",
      "keyInsights": [
        { "title": "Grief is Not a Straight Line", "explanation": "Louisa experiences setbacks, anger, and numbness long after she 'should' be over her loss. The novel validates the slow pace of recovery.", "example": "Lou's participation in the 'Moving On' support group reveals the diverse ways people process death.", "impact": "Normalizes the messy experience of long-term mourning." },
        { "title": "The Weight of Legacy", "explanation": "Will left Lou money and instructions to 'live well,' but this creates a burden of expectation that paralyzed her. Living for someone else is not the same as living for yourself.", "example": "Lou feeling like a failure because she isn't traveling the world like Will wanted.", "impact": "Encourages authentic living rather than living up to internal perceived pressures." },
        { "title": "The Power of Vulnerability", "explanation": "Connecting with Will's daughter, Lily, and a new love interest, Sam, requires Lou to open her heart again, risk-taking that feels terrifying in the wake of her loss.", "example": "Louisa's gradual reopening to Sam, the paramedic, despite her fear of another tragedy.", "impact": "Promotes the necessity of connection for true healing." }
      ],
      "chapters": [
        { "number": 1, "title": "The Fall", "summary": "Louisa's literal and metaphorical fall at work, leading her back to her family home to recover." },
        { "number": 2, "title": "The Stranger at the Door", "summary": "The arrival of Lily, Will's teenage daughter, which upends Lou's quiet life." },
        { "number": 3, "title": "Finding a Rhythm", "summary": "Lou balances her new job, her support group, and the challenges of caring for a rebellious teenager." },
        { "number": 4, "title": "The Choice", "summary": "Lou must decide if she will take a chance on a new life in New York or stay in the safety of her grief." }
      ],
      "quotes": [
        "You don't have to keep a person's life in a box just because they're gone.",
        "Moving on is the hardest thing I've ever had to do.",
        "Life is short. You have to grab it when you can."
      ],
      "actionItems": [
        "Join a community group or hobby class to build new connections.",
        "Write a letter to yourself about what 'living well' means to you, not anyone else.",
        "Practice one act of self-care that acknowledges your own progress in a difficult time."
      ]
    },
    "de": {
      "summary": "Die Fortsetzung von 'Ein ganzes halbes Jahr', 'Ein ganz neues Leben' (After You), begleitet Louisa Clark bei ihrem Versuch, nach Wills Tod wieder Tritt zu fassen. Lou arbeitet in einer Bar am Flughafen und lebt in einem Zustand der Erstarrung, geplagt von Schuldgefühlen und der Last von Wills Erbe. Alles ändert sich, als eine Person aus Wills Vergangenheit auftaucht und Lou zwingt, sich mit Trauer, Familiengeheimnissen und der Angst vor einer neuen Liebe auseinanderzusetzen. Es ist eine Geschichte über den mühsamen Prozess der Heilung und den Mut, noch einmal ganz von vorn anzufangen.\n\n### Warum es wichtig ist\nDas Buch ist wichtig, weil es den oft ungeschönten 'Tag danach' nach einer Tragödie zeigt. Es thematisiert, wie schwierig es ist, den Erwartungen anderer (und den eigenen) gerecht zu werden, wenn man einen geliebten Menschen verloren hat. Es bietet Trost für jeden, der sich in seiner Trauer festgefahren fühlt, und zeigt, dass das Leben auch nach dem größten Verlust weitergeht – nur eben anders.\n\n### Die zentrale Erkenntnis\nHeilung bedeutet nicht, zu vergessen, sondern zu lernen, mit den Narben weiterzugehen. Das Leben endet nicht mit dem Verlust; es findet nur eine neue Form.",
      "keyInsights": [
        { "title": "Trauer ist kein linearer Prozess", "explanation": "Louisa erlebt Rückschläge und Taubheit, lange nachdem sie 'darüber hinweg' sein sollte. Das Buch validiert das langsame Tempo der Genesung.", "example": "Louisas Teilnahme an einer Trauergruppe zeigt verschiedene Wege der Bewältigung.", "impact": "Normalisiert die Erfahrung langwieriger Trauer." },
        { "title": "Die Last der Erwartungen", "explanation": "Wills Wunsch, dass Lou 'gut leben' soll, wird für sie zu einer Belastung, da sie nicht weiß, was das für sie selbst bedeutet.", "example": "Louisas schlechtes Gewissen, weil sie nicht die Welt bereist, wie Will es sich gewünscht hätte.", "impact": "Ermutigt dazu, eigene Maßstäbe für Erfolg zu finden." }
      ],
      "chapters": [
        { "number": 1, "title": "Der Absturz", "summary": "Louisa landet nach einem Unfall wieder bei ihren Eltern und muss ihre Richtung finden." },
        { "number": 2, "title": "Die neue Mitbewohnerin", "summary": "Wills Tochter Lily taucht auf und wirbelt Louisas Welt durcheinander." },
        { "number": 3, "title": "Neuanfang", "summary": "Louisa wagt den Schritt in eine neue Beziehung und eine neue berufliche Chance." }
      ],
      "quotes": [
        "Man muss das Leben eines Menschen nicht in eine Schachtel sperren, nur weil er weg ist.",
        "Weiterzumachen ist das Schwerste, was ich je tun musste.",
        "Das Leben ist kurz. Man muss es packen, wenn man kann."
      ],
      "actionItems": [
        "Suchen Sie sich eine neue Aufgabe oder ein Hobby, das nichts mit Ihrer Vergangenheit zu tun hat.",
        "Definieren Sie für sich selbst, was 'gut leben' im Moment bedeutet.",
        "Gönnen Sie sich eine Auszeit, um Ihre eigenen Fortschritte zu würdigen."
      ]
    }
  },
  "Still Me": {
    "en": {
      "summary": "In the final installment of the trilogy, *Still Me*, Louisa Clark arrives in New York City, ready to start a new life and follow Will's final advice to 'live boldly.' She takes a job as a companion to Agnes Gopnik, the second wife of a high-society businessman. Lou finds herself navigating the glamorous and often cutthroat world of the Fifth Avenue elite, all while trying to maintain her long-distance relationship with Sam. The novel explores themes of self-discovery, the definition of home, and the search for one's true passion. Louisa must decide who she really is—the girl in the vintage clothes from a small town, or the sophisticated woman she is becoming in the heart of Manhattan.\n\n### Why It Matters\n*Still Me* is important because it is the payoff of Louisa's journey. It matters because it shows that growth is not just about leaving your hometown, but about finding where you truly belong. For readers, it provides a vivid and often humorous look at the cultural clashes between the UK and the US, and the internal clashes between our past and future selves. It celebrates the idea that you can reinvent yourself as many times as you need to until you find the version of 'you' that feels right. It is a triumphant conclusion to one of modern literature's most beloved characters.\n\n### The Final Takeaway\nYou are not a single, fixed version of yourself. You are the sum of your experiences, and you have the power to change your environment and your identity to match your evolving soul. Home is not a place; it's the person you become when you finally fully accept yourself.",
      "keyInsights": [
        { "title": "The Courage to Reinvent", "explanation": "Louisa arrives in NYC with nothing but her eccentric wardrobe and her memories. She learns that your past doesn't have to define your future if you are willing to work hard and be curious.", "example": "Lou transforming from a nervous outsider into a confidante within the competitive world of New York high society.", "impact": "Inspires confidence in starting over." },
        { "title": "Definition of Home", "explanation": "Lou oscillates between missing England and loving the energy of New York. She eventually discovers that home is where you are free to be your most authentic self.", "example": "Lou realizing that her new friends in NYC understand her in ways her family in Stortfold never could.", "impact": "Normalizes the search for belonging." },
        { "title": "Self-Worth vs. Status", "explanation": "Living among the ultra-wealthy shows Lou that money doesn't equate to happiness or character. She learns to value her own integrity over social standing.", "example": "Lou's refusal to lie for her employer, even when it puts her job at risk.", "impact": "Reinforces personal ethics and self-respect." }
      ],
      "chapters": [
        { "number": 1, "title": "Arrival in the Big Apple", "summary": "Louisa starts her new life in New York, working for the wealthy Gopnik family and dealing with culture shock." },
        { "number": 2, "title": "The Vintage Shop and the New Sam", "summary": "Lou finds a community in a vintage clothing store and struggles with her long-distance relationship with Sam." },
        { "number": 3, "title": "The Scandal", "summary": "A major rift in the Gopnik family puts Lou in a difficult position, forcing her to choose between loyalty and truth." },
        { "number": 4, "title": "Finding Jojo", "summary": "Lou discovers her own passion for writing and storytelling, realizing what she truly wants to do with her life." }
      ],
      "quotes": [
        "New York is a place where you can be anyone you want to be.",
        "Home is not where you're from, it's where you're free.",
        "I was no longer just the girl who had been 'after him'. I was just me."
      ],
      "actionItems": [
        "Spend a day exploring a part of your city you've never visited before.",
        "Try on a 'new version' of yourself by wearing or doing something out of character.",
        "Evaluate your current friendships: Do they support the person you are becoming?",
        "Write down your 'vision' for the next year in a completely new environment."
      ]
    },
    "de": {
      "summary": "Im abschließenden Teil der Trilogie, 'Mein Herz in zwei Welten' (Still Me), kommt Louisa Clark in New York an, bereit für ein neues Leben und Wills Rat zu folgen, 'mutig zu leben'. Sie wird Gesellschafterin von Agnes Gopnik, der Ehefrau eines wohlhabenden Geschäftsmannes an der Fifth Avenue. Lou muss sich in der glitzernden und harten Welt der New Yorker High Society zurechtfinden, während sie versucht, ihre Fernbeziehung zu Sam aufrechtzuerhalten. Der Roman erkundet Themen wie Selbstfindung, die Definition von Heimat und die Suche nach der wahren Bestimmung. Louisa muss entscheiden, wer sie wirklich ist: das Mädchen aus der Kleinstadt oder die selbstbewusste Frau in Manhattan.\n\n### Warum es wichtig ist\n'Mein Herz in zwei Welten' ist wichtig, weil es das Ziel von Louisas Entwicklung markiert. Es zeigt, dass Wachstum bedeutet, herauszufinden, wo man wirklich hingehört. Für die Leser bietet es einen humorvollen und lebendigen Einblick in den kulturellen Austausch und den inneren Konflikt zwischen Vergangenheit und Zukunft. Es feiert die Idee, dass man sich immer wieder neu erfinden kann, bis man die Version von sich selbst findet, die sich richtig anfühlt.\n\n### Die zentrale Erkenntnis\nDu bist keine feste, unveränderliche Version deiner selbst. Du hast die Macht, dein Umfeld und deine Identität so zu gestalten, dass sie zu deiner reifenden Seele passen. Heimat ist kein Ort, sondern der Zustand, in dem du dich endlich selbst annimmst.",
      "keyInsights": [
        { "title": "Mut zur Neuerfindung", "explanation": "Louisa beweist, dass die Vergangenheit die Zukunft nicht bestimmen muss, wenn man bereit ist, neugierig und fleißig zu sein.", "example": "Louisas Aufstieg in der New Yorker High Society durch ihre Authentizität und harte Arbeit.", "impact": "Gibt Mut für Neuanfänge." },
        { "title": "Was bedeutet Heimat?", "explanation": "Lou lernt, dass Heimat dort ist, wo man sein authentischstes Selbst leben kann, unabhängig von der Geografie.", "example": "Die Erkenntnis, dass sie in New York neue Seiten an sich entdeckt, die in England verborgen blieben.", "impact": "Fördert ein tieferes Verständnis von Zugehörigkeit." }
      ],
      "chapters": [
        { "number": 1, "title": "Ankunft im Big Apple", "summary": "Der Kulturschock in New York und Louisas Start in der Welt der Gopniks." },
        { "number": 2, "title": "Herausforderungen", "summary": "Die Schwierigkeiten einer Fernbeziehung und die Suche nach echten Freunden in der Großstadt." },
        { "number": 3, "title": "Die Entscheidung", "summary": "Lou muss wählen, ob sie in der Sicherheit ihres alten Lebens bleibt oder das Risiko in New York eingeht." }
      ],
      "quotes": [
        "In New York kann man sein, wer immer man will.",
        "Heimat ist nicht dort, wo man herkommt, sondern dort, wo man frei ist.",
        "Ich war nicht mehr nur das Mädchen danach. Ich war einfach ich."
      ],
      "actionItems": [
        "Machen Sie etwas, das völlig untypisch für Sie ist, um eine neue Facette an sich zu entdecken.",
        "Überlegen Sie, welches Umfeld Ihre persönliche Entwicklung am besten fördert.",
        "Schreiben Sie drei Dinge auf, die Sie an Ihrem 'neuen Selbst' lieben."
      ]
    }
  }
};

async function injectExpansions() {
  console.log('--- STARTING MANUAL INJECTION BATCH 1 (MOYES) ---');
  
  for (const [title, langs] of Object.entries(EXPANSIONS)) {
    for (const [lang, data] of Object.entries(langs as any)) {
      const d = data as any;
      const books = await prisma.book.findMany({
        where: { 
          OR: [
            { title, language: lang },
            { originalTitle: title, language: lang }
          ]
        }
      });

      for (const book of books) {
        console.log(`Updating "${book.title}" [${lang}] (ID: ${book.id})...`);
        await prisma.book.update({
          where: { id: book.id },
          data: {
            summary: d.summary,
            keyInsights: d.keyInsights,
            chapters: d.chapters,
            quotes: d.quotes,
            actionItems: d.actionItems
          }
        });
        console.log(`   ✅ Success!`);
      }
    }
  }
}

injectExpansions()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
