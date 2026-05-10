
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const EXPANSIONS: any = {
  "The Nightingale": {
    "en": {
      "summary": "Kristin Hannah's *The Nightingale* is a sweeping and deeply emotional historical novel set in Nazi-occupied France during World War II. It tells the story of two sisters—Vianne and Isabelle—each of whom fights her own battle for survival and freedom. Vianne, the elder sister, must protect her daughter and survive the presence of a German officer billeted in her home, while Isabelle, younger and rebellious, joins the French Resistance. The novel explores the often-overlooked role of women in the war, highlighting their courage, sacrifice, and the impossible choices they were forced to make to keep their families alive.\n\n### Why It Matters\nThis book is significant because it shifts the focus from the battlefield to the home front, showing that war is not just fought by soldiers in uniform. It matters because it explores the moral complexities of collaboration, resistance, and the endurance of the human spirit. For readers, it is a powerful exploration of sisterly love and the strength of character in the face of absolute evil. It reminds us of the resilience required to maintain one's humanity when the world has gone dark. It is a profoundly moving tribute to the unsung heroes of history.\n\n### The Final Takeaway\nWar is not the end of love; it is the ultimate test of it. Courage comes in many forms—from carrying a secret message across the Pyrenees to simply making it through another day with your dignity intact. We are capable of far more than we imagine when our loved ones are at stake.",
      "keyInsights": [
        { "title": "The Strength of Quiet Resistance", "explanation": "Vianne represents the millions of women who resisted in small, hidden ways—hiding Jewish children, stealing supplies, and maintained hope under occupation. This 'quiet' courage was just as vital as the active combat of the Resistance.", "example": "Vianne risking her life to hide and save 19 Jewish children in a local orphanage.", "impact": "Validates the importance of everyday resilience." },
        { "title": "The Price of Freedom", "explanation": "Isabelle's journey through the French Resistance (the 'Nightingale' route) shows the high physical and emotional cost of choosing to fight back. Freedom is never free; it is bought with the lives and safety of those brave enough to pursue it.", "example": "Isabelle guiding downed Allied airmen across the dangerous peaks of the Pyrenees.", "impact": "Deepens appreciation for historical sacrifices." }
      ],
      "chapters": [
        { "number": 1, "title": "The Occupation Begins", "summary": " France falls to the Nazis and the town of Carriveau is changed forever. Vianne's husband is sent to the front." },
        { "number": 2, "title": "Isabelle and the Resistance", "summary": " Isabelle joins the underground movement, taking on the code name 'The Nightingale'." },
        { "number": 3, "title": "Survival at Home", "summary": "Vianne deals with the requisitioning of her home and the increasing brutality of the occupation." },
        { "number": 4, "title": "The Reunion", "summary": "The sisters' paths cross again as the war nears its end, leading to a heart-breaking and redemptive conclusion." }
      ],
      "quotes": [
        "In love we find out who we want to be; in war we find out who we are.",
        "Men tell stories. Women get on with it.",
        "If I have learned anything in this long life of mine, it is this: In love we find out who we want to be; in war we find out who we are."
      ],
      "actionItems": [
        "Research one female figure from the French Resistance to learn more about their contributions.",
        "Reflect on a situation where you had to show 'quiet courage' and validate that strength.",
        "Write a letter of appreciation to a sibling or close friend who has supported you during a difficult time."
      ]
    },
    "de": {
      "summary": "Kristin Hannahs 'Die Nachtigall' ist ein epischer und zutiefst bewegender historischer Roman, der im besetzten Frankreich während des Zweiten Weltkriegs spielt. Er erzählt die Geschichte zweier Schwestern – Vianne und Isabelle –, die jede auf ihre Weise um Überleben und Freiheit kämpfen. Vianne, die ältere Schwester, muss ihre Tochter beschützen und die Anwesenheit eines deutschen Offiziers in ihrem Haus ertragen, während die rebellische Isabelle sich der Résistance anschließt. Der Roman beleuchtet die oft übersehene Rolle der Frauen im Krieg und feiert ihren Mut und ihre Opferbereitschaft.\n\n### Warum es wichtig ist\nDas Buch ist wichtig, weil es den Blick weg vom Schlachtfeld hin zur Heimatfront lenkt. Es zeigt, dass Krieg nicht nur von Soldaten geführt wird. Es thematisiert die moralischen Grauzonen zwischen Kollaboration und Widerstand und die unglaubliche Kraft der geschwisterlichen Liebe. Es ist ein Denkmal für die unbesungenen Heldinnen der Geschichte.\n\n### Die zentrale Erkenntnis\nMut hat viele Gesichter – vom Schmuggeln von Nachrichten über die Grenze bis hin zum täglichen Überlebenskampf unter Besatzung. Wir sind zu viel mehr fähig, als wir glauben, wenn es um das Leben unserer Liebsten geht.",
      "keyInsights": [
        { "title": "Die Stärke des leisen Widerstands", "explanation": "Vianne zeigt, dass das Verstecken von Kindern und das Bewahren von Menschlichkeit eine Form des Kampfes ist, die Mut erfordert.", "example": "Vianne rettet jüdische Kinder vor der Deportation, indem sie sie in einem Waisenhaus versteckt.", "impact": "Würdigt die Alltagshelden der Geschichte." }
      ],
      "chapters": [
        { "number": 1, "title": "Der Einmarsch", "summary": "Die Deutschen besetzen Frankreich und das Leben in Carriveau ändert sich radikal." },
        { "number": 2, "title": "Die Nachtigall", "summary": "Isabelle schließt sich dem Widerstand an und rettet abgeschossene Piloten." },
        { "number": 3, "title": "Das Ende des Krieges", "summary": "Die Schwestern werden wieder zusammengeführt und die Last der Erlebnisse wird sichtbar." }
      ],
      "quotes": [
        "In der Liebe erfahren wir, wer wir sein möchten; im Krieg erfahren wir, wer wir sind.",
        "Männer erzählen Geschichten. Frauen machen einfach weiter."
      ],
      "actionItems": [
        "Informieren Sie sich über die Geschichte der Résistance in Frankreich.",
        "Denken Sie über eine Situation nach, in der Sie 'stillen Mut' bewiesen haben."
      ]
    }
  },
  "The Great Alone": {
    "en": {
      "summary": "Kristin Hannah's *The Great Alone* is a visceral and haunting story of survival, set against the breathtaking but brutal landscape of Alaska in the 1970s. Ernt Allbright, a former POW returning from Vietnam, decides to move his wife Cora and daughter Leni to the wild frontier to start a new life. As winter approaches and the darkness descends, the family discovers that the dangers of the Alaskan wilderness are matched only by the dangers within their own home. It is a story of love, obsession, and the resilience of a young girl forced to grow up in an environment where one mistake can mean death.\n\n### Why It Matters\nThis novel is a powerful exploration of the lingering effects of war (PTSD) on families and the cyclical nature of domestic abuse. It matters because it showcases the incredible mental and physical toughness required to live in the wild, while also portraying the emotional toughness needed to escape a toxic environment. For readers, it is an immersive experience that brings the Alaskian wilderness to life, making it a character in its own right. It is a testament to the bond between mother and daughter and the strength it takes to find a home when the world feels hostile.\n\n### The Final Takeaway\nSurvival is as much about emotional resilience as it is about physical preparedness. You can survive the harshest winters and the most dangerous predators, but the hardest battle is often reclaiming your own life from the people you love. Strength is not just about staying; sometimes, it’s about the courage to leave.",
      "keyInsights": [
        { "title": "The Nature of Resilience", "explanation": "Leni's journey shows that humans have an incredible capacity to adapt to extreme hardship. Resilience is built through necessity and the deep desire to protect those we love.", "example": "Leni learning to hunt, build, and survive the isolation of the Alaskan 'Great Alone'.", "impact": "Inspires endurance in difficult circumstances." },
        { "title": "The Impact of Trauma on Family", "explanation": "Ernt's untreated PTSD drives the family's choices and creates a volatile and dangerous home. The novel illustrates how trauma can be inherited and how it shapes the lives of those close to the survivor.", "example": "The family moving to Alaska to escape Ernt's demons, only to find they brought them along.", "impact": "Increases empathy for families dealing with mental health issues." }
      ],
      "chapters": [
        { "number": 1, "title": "Heading North", "summary": "The Allbrights leave for Alaska, seeking a fresh start and a way to escape Ernt's past." },
        { "number": 2, "title": "The First Winter", "summary": "The family learns the harsh reality of living 'off the grid' and the danger of the long darkness." },
        { "number": 3, "title": "Obsession and Ice", "summary": "Ernt's behavior becomes increasingly erratic and violent as the isolation takes its toll." },
        { "number": 4, "title": "The Escape", "summary": "Leni must make a choice between her loyalty to her family and her own survival." }
      ],
      "quotes": [
        "Alaska doesn't forgive mistakes.",
        "A girl is like a piece of paper. You can fold it and fold it, but it's still there.",
        "Love and fear are the same thing. They both make you do things you never thought you could."
      ],
      "actionItems": [
        "Learn one basic survival skill (like starting a fire or orienting with a compass).",
        "If you or someone you know is dealing with PTSD, look up local support resources today.",
        "Spend time in nature and observe its power and indifference to humanity."
      ]
    },
    "de": {
      "summary": "In 'Liebe und Schmerz' (The Great Alone) erzählt Kristin Hannah eine fesselnde Überlebensgeschichte vor der Kulisse Alaskas in den 1970er Jahren. Ernt Allbright, ein traumatisierter Vietnam-Veteran, zieht mit seiner Frau Cora und Tochter Leni in die Wildnis, um neu anzufangen. Doch während der harte Winter einzieht, erkennen sie, dass die Gefahr in ihrem eigenen Haus genauso groß ist wie die in der unberechenbaren Natur. Es ist eine Geschichte über Liebe, Obsession und die Kraft einer jungen Frau, die lernt, dass Überleben mehr bedeutet als nur Nahrung zu finden.\n\n### Warum es wichtig ist\nDer Roman thematisiert eindringlich die Folgen von PTBS und häuslicher Gewalt. Er zeigt die physische Härte des Lebens in Alaska und die emotionale Härte, die nötig ist, um sich aus einer toxischen Beziehung zu befreien. Es ist ein Buch über die Verbindung zwischen Mutter und Tochter und den Mut, sich ein eigenes Leben aufzubauen, wenn alles um einen herum zusammenbricht.\n\n### Die zentrale Erkenntnis\nÜberleben erfordert emotionale Resilienz ebenso wie physische Vorbereitung. Der härteste Kampf ist oft der gegen die Menschen, die man liebt. Wahre Stärke bedeutet manchmal, den Mut zum Aufbruch zu haben.",
      "keyInsights": [
        { "title": "Resilienz durch Notwendigkeit", "explanation": "Leni lernt in der Wildnis, dass der Mensch sich an fast alles anpassen kann, wenn er muss. Diese Anpassungsfähigkeit rettet ihr Leben.", "impact": "Inspiriert dazu, Krisen als Entwicklungschancen zu sehen." }
      ],
      "chapters": [
        { "number": 1, "title": "Auf nach Norden", "summary": "Der Umzug nach Alaska als vermeintliche Rettung für die Familie." },
        { "number": 2, "title": "Die Dunkelheit", "summary": "Der erste Winter in der Isolation offenbart Ernts wahres Gesicht." },
        { "number": 3, "title": "Befreiung", "summary": "Leni findet die Kraft, sich ihrem Schicksal entgegenzustellen." }
      ],
      "quotes": [
        "Alaska verzeiht keine Fehler.",
        "Liebe und Angst sind dasselbe. Beide bringen dich dazu, Dinge zu tun, von denen du nie dachtest, dass du sie könntest."
      ],
      "actionItems": [
        "Informieren Sie sich über Unterstützungsangebote für Menschen mit PTBS.",
        "Verbringen Sie Zeit in der Natur, um ihre ursprüngliche Kraft zu spüren."
      ]
    }
  },
  "The Four Winds": {
    "en": {
      "summary": "Kristin Hannah's *The Four Winds* is an epic tale of hope and survival set during the Great Depression and the Dust Bowl in Texas. Elsa Martinelli, a woman who has always felt like an outsider, marries into a farming family. When a catastrophic drought and dust storms threaten to destroy everything they hold dear, Elsa must choose between staying to protect the land she loves or heading west to California in search of a better life for her children. The novel is a stark and moving portrayal of a defining moment in American history and an individual's courage to fight for her dignity and her family in the face of absolute hardship.\n\n### Why It Matters\nThis book is significant because it brings the human impact of the Dust Bowl to life, exploring themes of economic displacement, migration, and the resilience of the American spirit. It matters because it portrays the often-overlooked struggle of migrant workers during the Depression, highlighting the systemic obstacles they faced. For readers, Elsa's journey from a shy, unloved daughter to a fierce, protective mother is a powerful inspiration. It reminds us that courage is not the absence of fear, but the decision that something else—like your children's survival—is more important than that fear. It's a tribute to the endurance of mothers throughout history.\n\n### The Final Takeaway\nHope is a fragile thing, but it is the only thing that can carry you through the worst of times. Your past doesn't define your strength; it's the choices you make when everything else is stripped away that reveal who you really are. Courage is a series of small, daily decisions to keep going.",
      "keyInsights": [
        { "title": "The Resilience of the Land and Local Spirit", "explanation": "The bond between the farmer and the soil is profound. The Dust Bowl shows that nature can be a cruel partner, but that our survival depends on how we adapt to its changes.", "example": "Elsa's family desperately trying to save their livestock and crops during the peak of the drought.", "impact": "Encourages a respect for the environment and agricultural heritage." },
        { "title": "The Migrant Struggle and Human Rights", "explanation": "The transition to California reveals that 'The Promised Land' was often a place of exploitation and hostility for the desperate. The novel highlights the importance of labor rights and collective action.", "example": "Elsa's experiences picking cotton in grueling conditions while living in a shanty town.", "impact": "Increases awareness of socioeconomic injustice and migration." }
      ],
      "chapters": [
        { "number": 1, "title": "The Great Drought", "summary": "Texas is hit by the worst drought in history, and Elsa's life on the farm begins to crumble." },
        { "number": 2, "title": "The Decision", "summary": "Elsa chooses to leave her home and head west to save her family from starvation." },
        { "number": 3, "title": "California Reality", "summary": "The harsh truth of the migrant camps and the struggle for work and fair wages." },
        { "number": 4, "title": "The Legacy of Hope", "summary": "Elsa's final stand for her children's future and the lasting impact of her courage." }
      ],
      "quotes": [
        "Hope is a kind of courage.",
        "A warrior believes in something. He's not just a man with a gun.",
        "Be brave. It's the only way to live."
      ],
      "actionItems": [
        "Read a historical account of the Dust Bowl to understand the actual events.",
        "Identify one area in your life where you feel like an 'outsider' and find one way to use that perspective as a strength.",
        "Acknowledge the strength of a mother or guardian in your life today."
      ]
    },
    "de": {
      "summary": "In 'Die Vier Winde' erzählt Kristin Hannah eine epische Geschichte von Hoffnung und Überleben während der Großen Depression und der Staubstürme (Dust Bowl) in Texas. Elsa Martinelli muss sich entscheiden: Bleibt sie auf dem Land, das sie liebt, oder wagt sie den unsicheren Weg nach Kalifornien, um ihre Kinder zu retten? Der Roman ist ein ungeschöntes Porträt eines prägenden Moments der amerikanischen Geschichte und zeigt den Mut einer Frau, für die Würde ihrer Familie zu kämpfen. Es ist eine Hommage an die unzähligen Mütter, die in Krisenzeiten über sich hinausgewachsen sind.\n\n### Warum es wichtig ist\nDas Buch macht die menschlichen Auswirkungen der Weltwirtschaftskrise greifbar. Es thematisiert Vertreibung, Migration und die systemischen Hindernisse, denen Wanderarbeiter gegenüberstanden. Elsas Entwicklung von der schüchternen Tochter zur kämpferischen Mutter ist eine Inspiration für jeden Leser. Es erinnert daran, dass Mut nicht die Abwesenheit von Angst ist, sondern die Entscheidung, dass etwas anderes wichtiger ist als die Angst.\n\n### Die zentrale Erkenntnis\nHoffnung ist zerbrechlich, aber sie ist das Einzige, was uns durch die dunkelsten Zeiten trägt. Unsere Identität wird durch die Entscheidungen definiert, die wir treffen, wenn uns alles andere genommen wurde.",
      "keyInsights": [
        { "title": "Der Kampf der Migranten", "explanation": "Der Weg nach Kalifornien zeigt, dass das vermeintliche 'Gelobte Land' oft nur Ausbeutung und Feindseligkeit für die Verzweifelten bereithielt.", "impact": "Schaukelt das Bewusstsein für soziale Ungerechtigkeit hoch." }
      ],
      "chapters": [
        { "number": 1, "title": "Die Dürre", "summary": "Texas wird von verheerenden Staubstürmen heimgesucht und die Lebensgrundlage der Martinellis schwindet." },
        { "number": 2, "title": "Aufbruch", "summary": "Elsa verlässt ihre Heimat und macht sich auf die gefährliche Reise nach Westen." },
        { "number": 3, "title": "Hoffnung", "summary": "Elsas Kampf für eine bessere Zukunft ihrer Kinder und der Preis der Veränderung." }
      ],
      "quotes": [
        "Hoffnung ist eine Form von Mut.",
        "Sei tapfer. Nur so kann man leben."
      ],
      "actionItems": [
        "Informieren Sie sich über die Geschichte der Dust Bowl und der Großen Depression.",
        "Setzen Sie heute eine kleine Geste der Unterstützung für jemanden in einer Notlage."
      ]
    }
  }
};

async function injectExpansions() {
  console.log('--- STARTING MANUAL INJECTION BATCH 3 (HANNAH) ---');
  
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
