
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const EXPANSIONS: any = {
  "The Book Thief": {
    "en": {
      "summary": "Markus Zusak's *The Book Thief* is an extraordinary and poetic novel set in Nazi Germany, uniquely narrated by Death. The story follows Liesel Meminger, a young girl sent to live with foster parents, Hans and Rosa Hubermann, in the fictional town of Molching. As the horrors of the war and the Holocaust unfold around her, Liesel finds solace and survival in books, which she steals and shares with others—including Max Vandenburg, a Jewish man hidden in the Hubermanns' basement. The novel is a profound exploration of the power of words to both destroy and heal, and the beauty that can exist even in the midst of absolute darkness.\n\n### Why It Matters\nThis book is significant for its unusual and deeply insightful narrative voice, which provides a detached yet empathetic perspective on human suffering. It matters because it explores the moral complexity of everyday Germans living under the Nazi regime, showing that courage can be found in the smallest acts of kindness and resistance. For readers, Liesel's journey is an exploration of the transformative power of literature and the enduring nature of the human spirit. It is a heart-wrenching and ultimately hopeful story that reminds us of the resilience required to maintain one's humanity in inhuman times. It is a major contribution to modern historical fiction.\n\n### The Final Takeaway\nWords carry the power of life and death; they can incite hate or inspire hope. Kindness in the face of cruelty is the ultimate form of resistance. Death may be inevitable, but the stories we leave behind and the lives we touch are what truly matter. Humanity is capable of both extreme ugliness and breathtaking beauty—sometimes in the same person.",
      "keyInsights": [
        { "title": "The Power of Literacy and Words", "explanation": "For Liesel, learning to read is an act of reclaiming her own identity and making sense of a chaotic world. Words are the 'stolen' treasures that provide meaning and connection when everything else is being taken away.", "example": "Liesel reading to the townspeople in the air-raid shelter to soothe their fears.", "impact": "Inspires a deeper appreciation for the value of education and literature." },
        { "title": "The Duality of Human Nature", "explanation": "Death's narration highlights how humans can be both 'ugly' and 'beautiful' simultaneously. The Hubermanns, for instance, are ordinary people who show extraordinary courage by hiding Max Vandenburg.", "example": "Hans Hubermann giving a piece of bread to a starving Jewish prisoner on a march—an act of small, public mercy with devastating consequences.", "impact": "Promotes a nuanced understanding of moral choices in difficult times." }
      ],
      "chapters": [
        { "number": 1, "title": "The Grave Digger's Handbook", "summary": "Liesel steals her first book at her brother's funeral and begins her journey into the world of words with Hans's help." },
        { "number": 2, "title": "The Hidden Secret", "summary": "Max Vandenburg, a Jewish boxer, arrives at the Hubermanns' home and is hidden in the basement, forming a deep bond with Liesel." },
        { "number": 3, "title": "The Word Shaker", "summary": "Liesel continues to steal books from the mayor's wife's library and develops her own skills as a storyteller." },
        { "number": 4, "title": "The Sky of Molching", "summary": "The war comes to Liesel's doorstep, leading to a tragic and emotionally resonant conclusion that brings her story full circle." }
      ],
      "quotes": [
        "I am haunted by humans.",
        "A small fact: You are going to die.",
        "When death tells a story, you really have to listen."
      ],
      "actionItems": [
        "Read a book you've been meaning to get to and share its core message with a friend.",
        "Perform one act of 'quiet resistance' against unkindness or prejudice in your daily life.",
        "Donate a book to a local school or library to share the power of literacy."
      ]
    },
    "de": {
      "summary": "Markus Zusaks 'Die Bücherdiebin' ist ein außergewöhnlicher und poetischer Roman, der im Dritten Reich spielt und auf einzigartige Weise vom Tod selbst erzählt wird. Im Zentrum steht Liesel Meminger, ein junges Mädchen, das bei Pflegeeltern in der Nähe von München aufwächst. Während der Schrecken des Krieges und des Holocausts findet Liesel Trost in Büchern, die sie stiehlt und mit anderen teilt – darunter auch Max, ein Jude, den ihre Pflegeeltern im Keller verstecken. Der Roman ist eine tiefgründige Erkundung der Macht der Worte, die sowohl zerstören als auch heilen können.\n\n### Warum es wichtig ist\nDas Buch besticht durch seine ungewöhnliche Erzählperspektive und bietet einen empathischen Blick auf das menschliche Leiden. Es zeigt die moralische Komplexität einfacher Menschen im nationalsozialistischen Deutschland und macht deutlich, dass Mut oft in kleinen Gesten der Mitmenschlichkeit liegt. Für die Leser ist Liesels Reise ein Zeugnis für die Kraft der Literatur und die Unbeugsamkeit des menschlichen Geistes.\n\n### Die zentrale Erkenntnis\nWorte haben die Macht über Leben und Tod; sie können Hass schüren oder Hoffnung geben. Menschlichkeit in Zeiten der Grausamkeit ist die höchste Form des Widerstands.",
      "keyInsights": [
        { "title": "Die Macht der Sprache", "explanation": "Liesels Weg vom Analphabetismus zur Geschichtenerzählerin ist ein Akt der Selbstermächtigung in einer unfreien Welt.", "impact": "Betont den Wert von Bildung und freiem Denken." }
      ],
      "chapters": [
        { "number": 1, "title": "Das Handbuch des Totengräbers", "summary": "Liesel stiehlt ihr erstes Buch und beginnt mit der Hilfe ihres Pflegevaters Hans das Lesen zu lernen." },
        { "number": 2, "title": "Der Mann im Keller", "summary": "Max findet Zuflucht bei den Hubermanns und es entsteht eine tiefe Freundschaft zwischen ihm und Liesel." },
        { "number": 3, "title": "Das Ende von Himmel Street", "summary": "Der Krieg fordert seinen Tribut und Liesel muss lernen, mit dem Verlust und der Kraft der Erinnerung umzugehen." }
      ],
      "quotes": [
        "Ich bin von den Menschen verfolgt.",
        "Eine kleine Tatsache: Du wirst sterben.",
        "Wenn der Tod eine Geschichte erzählt, sollte man zuhören."
      ],
      "actionItems": [
        "Schenken Sie jemandem ein Buch, das Sie persönlich berührt hat.",
        "Setzen Sie sich heute aktiv für jemanden ein, der weniger privilegiert ist als Sie."
      ]
    }
  },
  "All the Light We Cannot See": {
    "en": {
      "summary": "Anthony Doerr's *All the Light We Cannot See* is a stunning, Pulitzer Prize-winning novel set in France and Germany during World War II. It follows the converging lives of Marie-Laure LeBlanc, a blind French girl who flees Paris for the coastal town of Saint-Malo, and Werner Pfennig, a mathematically gifted German orphan who is forced into the Nazi military. Marie-Laure and her father carry a legendary diamond—the Sea of Flames—believed to be cursed, while Werner’s expertise in radio technology leads him to the very same place. The novel is a masterpiece of lyrical storytelling, exploring themes of resilience, the beauty of the invisible world, and the human capacity for goodness against the tide of history.\n\n### Why It Matters\nThis book is significant for its intricate, non-linear structure and its deep exploration of the concept of sight—both physical and metaphorical. It matters because it humanizes individuals on both sides of the conflict, showing how circumstances can trap people in roles they never intended for themselves. For readers, Marie-Laure's sensory-rich world and Werner's internal struggle provide a profound look at the choices we make when our morality is tested by overwhelming forces. It celebrates the power of innocence and the enduring nature of curiosity. It's a reminder that even in the darkest times, there is light that we cannot see.\n\n### The Final Takeaway\nYou don't need eyes to see the truth. Courage is not always about big gestures; it's about staying curious and kind when everything else is being stripped away. We are all radio waves, moving through the air, looking for a signal from someone else in the dark. The things we cannot see—love, hope, and human connection—are what carry us through the shadows of history.",
      "keyInsights": [
        { "title": "The Beauty of the Invisible World", "explanation": "Marie-Laure's blindness forces her to develop a deep connection with the sounds, textures, and rhythms of the world. This serves as a metaphor for the 'light' of the human spirit that remains invisible to those focused only on external power and survival.", "example": "Marie-Laure's intricate mental map of Saint-Malo and her love for the natural history of the sea.", "impact": "Deepens appreciation for sensory awareness." },
        { "title": "The Trap of Circumstance and Conscience", "explanation": "Werner's journey from a curious boy to a Nazi radio operator shows how easily a person's talents can be exploited by an evil regime. The novel explores the difficulty of maintaining one's morality when survival is at stake.", "example": "Werner's struggle to reconcile his love for science with the horrifying uses of his skills by the military.", "impact": "Sparks reflection on the ethics of science and individual agency." }
      ],
      "chapters": [
        { "number": 1, "title": "Paris and Zollverein", "summary": "The early lives of Marie-Laure and Werner are established in pre-war France and Germany." },
        { "number": 2, "title": "Saint-Malo", "summary": "The characters converge on the walled city in 1944, as the Allied bombardment begins." },
        { "number": 3, "title": "The Sea of Flames", "summary": "The mystery surrounding the cursed diamond and Marie-Laure's father's attempts to protect her." },
        { "number": 4, "title": "The Signal", "summary": "Marie-Laure's radio broadcasts bring her and Werner together in a single, life-changing encounter." }
      ],
      "quotes": [
        "Open your eyes and see what you can with them before they close forever.",
        "Don't you want to be alive before you die?",
        "Everything has a soul. You just have to find the signal."
      ],
      "actionItems": [
        "Spend 10 minutes 'seeing' with your secondary senses: Close your eyes and map your environment using only sound and touch.",
        "Read a short history of radio technology to understand its revolutionary impact during WWII.",
        "Practice one small act of integrity in a situation where the 'easy' choice is to conform."
      ]
    },
    "de": {
      "summary": "In 'Alles Licht, das wir nicht sehen' erzählt Anthony Doerr die Geschichte zweier Jugendlicher im Zweiten Weltkrieg: Marie-Laure, ein blindes französisches Mädchen, und Werner, ein technisch begabter deutscher Waise. Ihre Wege kreuzen sich in der belagerten Stadt Saint-Malo. Der Roman ist ein Meisterwerk der Sprache und erkundet Themen wie Widerstandskraft, die Schönheit des Unsichtbaren und das Überdauern der Menschlichkeit in finsteren Zeiten. Es ist eine Erinnerung daran, dass das Licht oft dort am hellsten leuchtet, wo wir es am wenigsten erwarten.\n\n### Warum es wichtig ist\nDas Buch besticht durch seine lyrische Sprache und die tiefgründige Figurengestaltung. Es zeigt, wie der Krieg Schicksale unaufhaltsam miteinander verwebt und wie wichtig es ist, sich seine Neugier und sein Gewissen zu bewahren. Für die Leser bietet Marie-Laures Welt der Sinne eine ganz neue Perspektive auf die Realität.\n\n### Die zentrale Erkenntnis\nMut bedeutet, neugierig zu bleiben, wenn die Welt versucht, einen abzustumpfen. Alles Licht, das wir nicht sehen – Hoffnung, Liebe und menschliche Verbindung – trägt uns durch die Schatten der Geschichte.",
      "keyInsights": [
        { "title": "Die Welt der Sinne", "explanation": "Marie-Laures Blindheit ermöglicht ihr eine tiefere Wahrnehmung des Unsichtbaren. Es ist ein Symbol für die 'innere Sicht' auf das Wesentliche im Leben.", "impact": "Fördert die Wertschätzung für nicht-visuelle Wahrnehmung." }
      ],
      "chapters": [
        { "number": 1, "title": "Paris / Brandenburg", "summary": "Die Einführung von Marie-Laure und Werner und ihre unterschiedlichen Kindheiten." },
        { "number": 2, "title": "Die Festungsstadt", "summary": "Die Belagerung von Saint-Malo und das Zusammentreffen der Schicksale." },
        { "number": 3, "title": "Das Leuchten", "summary": "Die Auflösung des Geheimnisses um das verfluchte Juwel und die Hoffnung auf Frieden." }
      ],
      "quotes": [
        "Augen auf und sehen, was man mit ihnen sehen kann, bevor sie sich für immer schließen.",
        "Willst du nicht lebendig sein, bevor du stirbst?"
      ],
      "actionItems": [
        "Führen Sie eine Achtsamkeitsübung durch, indem Sie sich nur auf Geräusche konzentrieren.",
        "Setzen Sie heute ein Zeichen der persönlichen Integrität."
      ]
    }
  },
  "Room": {
    "en": {
      "summary": "Emma Donoghue's *Room* is a deeply moving and harrowing story of survival, told through the eyes of five-year-old Jack. Jack was born in 'Room'—a shed where his mother, 'Ma,' has been held captive for seven years. To Jack, Room is the entire universe, while to Ma, it is a prison. When Jack turns five, Ma realizes they must escape, leading to a thrilling bid for freedom and the even more complex challenge of adjusting to the 'Outside' world. It is a powerful exploration of the resilience of the human spirit, the unconditional bond between parent and child, and the frightening but beautiful world beyond walls.\n\n### Why It Matters\nThis book is significant for its unique narrative voice—that of a child who finds wonder in the smallest details of a restricted world. It matters because it explores the themes of trauma, adaptation, and the definition of reality. For readers, it is a visceral experience of both confinement and liberation. It challenges our understanding of what makes a 'home' and highlights the incredible resourcefulness of mothers in protecting their children's minds as well as their bodies. It portrays the difficult and non-linear process of healing from extreme psychological and physical trauma. It is one of the most original and impactful books of the decade.\n\n### The Final Takeaway\nA mother's love can build a whole world out of a few square feet. Freedom is not just about leaving a room; it's about the courage to rebuild your identity on the outside. We are all 'in a room' of our own limited perceptions, and true growth comes from the bravery to step out and see the world as it truly is—big, frightening, and full of possibility.",
      "keyInsights": [
        { "title": "The Resilience of the Child Mind", "explanation": "Jack's perception of 'Room' as a magical and safe home illustrates how human beings, especially children, can find meaning and even joy in the most dire circumstances. Our internal narrative is a powerful tool for survival.", "example": "Jack's games and daily rituals involving 'Table,' 'Chair,' and 'Skylight'.", "impact": "Empowers parents to understand the importance of imaginative play." },
        { "title": "The Difficulty of Re-Entering Society", "explanation": "Leaving 'Room' is only the beginning of the battle. The novel shows that the 'Outside' is overwhelming and scary for someone who has lived in isolation. Adaptation is a slow and painful process that requires patience and support.", "example": "Jack's sensory overload upon seeing the actual world for the first time and his difficulty with spatial depth.", "impact": "Increases empathy for survivors of prolonged trauma." },
        { "title": "The Strength and Frailty of the Protector", "explanation": "While Ma is Jack's hero, the novel also shows her own deep psychological scars. Being a protector takes a massive toll on the survivor, and they need help just as much as those they protect.", "example": "Ma's struggle with depression and the pressure of being Jack's entire world during and after captivity.", "impact": "Fostered appreciation for the emotional labor of caregiving." }
      ],
      "chapters": [
        { "number": 1, "title": "Inside", "summary": "Jack explains his daily life in 'Room' and his belief that nothing else exists." },
        { "number": 2, "title": "The Plan", "summary": "Ma tells Jack the truth about the world and they devise a dangerous plan to escape." },
        { "number": 3, "title": "The Outside", "summary": "Jack escapes and Ma is rescued, leading to their first encounter with the massive, overwhelming world." },
        { "number": 4, "title": "Learning to Live", "summary": "The family deals with the aftermath of their trauma and begins the slow process of building a new life." }
      ],
      "quotes": [
        "In Room I was safe. Outside I'm scaring.",
        "I've been in Room for five years. That's a lot of things to know.",
        "Scary means something I don't know yet."
      ],
      "actionItems": [
        "Observe one object in your room with the 'eyes of a child'—as if you've never seen it before.",
        "Read an article on the 'psychology of survival' to understand how the mind adapts to confinement.",
        "Support a charity that helps survivors of domestic abuse or trafficking."
      ]
    },
    "de": {
      "summary": "In 'Raum' (Room) erzählt Emma Donoghue die erschütternde und zugleich hoffnungsvolle Geschichte des fünfjährigen Jack, der in Gefangenschaft in einem einzigen Raum geboren wurde. Für Jack ist 'Raum' das ganze Universum, für seine Mutter 'Ma' ist es ein Gefängnis. Nach ihrer riskanten Flucht müssen sie lernen, in der riesigen und oft beängstigenden 'Außenwelt' zu überleben. Der Roman ist eine kraftvolle Erforschung der Mutter-Kind-Bindung und des menschlichen Willens, selbst unter extremsten Bedingungen Menschlichkeit zu bewahren.\n\n### Warum es wichtig ist\nDas Buch besticht durch Jacks einzigartige Erzählstimme. Es zeigt, wie wir uns unsere eigene Realität erschaffen, um zu überleben. Es thematisiert die traumatische Belastung und den schwierigen Prozess der Resozialisierung. Für die Leser ist es eine tiefgreifende Erfahrung über Freiheit, Mut und die Fähigkeit, selbst nach dunkelster Zeit wieder Licht zu finden.\n\n### Die zentrale Erkenntnis\nMutterliebe kann aus wenigen Quadratmetern eine ganze Welt erschaffen. Freiheit beginnt im Kopf, aber die wahre Herausforderung liegt darin, die Mauern der Vergangenheit in der großen Welt abzubauen. Wir alle tragen unsere 'Räume' mit uns herum – wahres Wachstum bedeutet, hinauszutreten.",
      "keyInsights": [
        { "title": "Die Welt im Kleinen", "explanation": "Jacks Fähigkeit, dem Minimalen Bedeutung zu geben, zeigt die grenzenlose Phantasie und Anpassungsfähigkeit des Geistes.", "impact": "Inspiriert dazu, Dankbarkeit für das Alltägliche zu empfinden." }
      ],
      "chapters": [
        { "number": 1, "title": "Drinnen", "summary": "Jack erklärt seinen Alltag in 'Raum' und seine Sicht auf die Welt." },
        { "number": 2, "title": "Die Flucht", "summary": "Das riskante Manöver, das sie in die Freiheit führt." },
        { "number": 3, "title": "Draußen", "summary": "Der Schock der Freiheit und der mühsame Weg zurück in die Gesellschaft." },
        { "number": 4, "title": "Heilung", "summary": "Die Familie verarbeitet das Trauma und beginnt den langsamen Prozess des Aufbaus eines neuen Lebens." }
      ],
      "quotes": [
        "Scary bedeutet etwas, das ich noch nicht kenne.",
        "In 'Raum' war ich sicher. Draußen habe ich Angst."
      ],
      "actionItems": [
        "Helfen Sie einer Organisation, die Betroffene von Gewalt unterstützt.",
        "Sehen Sie die Dinge in Ihrem Zimmer heute einmal mit ganz neuen Augen."
      ]
    }
  },
  "Eleanor Oliphant Is Completely Fine": {
    "en": {
      "summary": "Gail Honeyman's *Eleanor Oliphant Is Completely Fine* is a beautiful and quirky story about a socially isolated woman who learns that 'completely fine' is not the same as truly living. Eleanor is a creatures of habit, sticking to a rigid weekly routine that includes excessive vodka consumption on the weekends to drown out her traumatic past. Her shell begins to crack when she and a bumbling IT colleague, Raymond, help an elderly man who has fallen in the street. This small act of kindness leads to a life-changing friendship that forces Eleanor to confront the dark secrets of her childhood and the loneliness she has long ignored. It is a story of humor, heart, and the profound power of human connection.\n\n### Why It Matters\nThis book is significant for its honest and often humorous portrayal of social anxiety and the impact of domestic trauma on adults. It matters because it explores the theme of 'the invisible person'—those among us who live quiet, isolated lives and are often overlooked by society. For readers, Eleanor's journey is an exploration of self-discovery and the importance of professional mental health support. It challenges the stigma surrounding loneliness and mental illness, showing that everyone deserves kindness and a chance at a meaningful life. It is a testament to the fact that even the most damaged person can find hope and a new beginning through the support of others.\n\n### The Final Takeaway\nIsolation is a survival mechanism, but connection is the key to thriving. Being 'completely fine' is a cage; true freedom comes from accepting your scars and opening your heart to others. Small acts of kindness can create ripples that change a person's entire life. You are never too broken to be healed, but sometimes you need a friend (and a therapist) to help you find the way back.",
      "keyInsights": [
        { "title": "The Difference Between Surviving and Living", "explanation": "Eleanor's rigid routine is a way of managing her pain, but it also prevents her from experiencing joy. True living requires the vulnerability to step outside our safety zones.", "example": "Eleanor's gradual attempt to try new things—like getting a haircut or attending a concert—as she builds her friendship with Raymond.", "impact": "Encourages self-reflection on one's own comfort zones." },
        { "title": "The Impact of Childhood Trauma on Adult Identity", "explanation": "The novel gradually reveals the source of Eleanor's scars and her 'Mummy' voice, illustrating how early abuse can shape an adult's entire reality. Healing requires naming the past and seeking professional help.", "example": "Eleanor's realization that she has been self-medicating and the start of her journey through psychotherapy.", "impact": "Increases empathy for trauma survivors and promotes mental health awareness." },
        { "title": "The Power of Non-Judgmental Friendship", "explanation": "Raymond's acceptance of Eleanor, with all her quirks and social failings, is the catalyst for her change. A single supportive person can provide the safety needed for a person to rebuild their life.", "example": "Raymond and Eleanor's unglamorous but steady support for each other through various life crises.", "impact": "Highlights the value of kindness and steady presence in relationships." }
      ],
      "chapters": [
        { "number": 1, "title": "The Rigid Life", "summary": "Eleanor explains her weekly routine and her belief that she is 'completely fine'." },
        { "number": 2, "title": "The Incident", "summary": "Eleanor and Raymond help an elderly man, leading to an unexpected friendship that breaks Eleanor's isolation." },
        { "number": 3, "title": "The Breakdown and Breakthrough", "summary": "The cracks in Eleanor's life widen, leading to a mental health crisis and the decision to finally seek help." },
        { "number": 4, "title": "A New Normal", "summary": "Eleanor begins to heal and discovers that life can be far more than just 'fine'." }
      ],
      "quotes": [
        "I was fine. I was completely fine. But fine is the most dangerous word in the English language.",
        "You're not a bad person, Eleanor. You're just a person who's had a lot of bad things happen to her.",
        "Loneliness is the new cancer—a silent killer."
      ],
      "actionItems": [
        "Reach out to one person who lives alone or whom you haven't spoken to in a while.",
        "Schedule a 'self-care' activity that specifically addresses your mental well-being (e.g. mindfulness or a relaxation session).",
        "If you're feeling 'stuck' in an area of your life, identify one professional or resource that could help you move forward."
      ]
    },
    "de": {
      "summary": "Gail Honeymans 'Ich, Eleanor Oliphant' ist ein berührender und humorvoller Roman über eine Frau, die lernt, dass 'alles okay' nicht dasselbe ist wie wahres Leben. Eleanor lebt nach einem strengen, einsamen Zeitplan, bis eine Begegnung mit ihrem Kollegen Raymond alles verändert. Gemeinsam helfen sie einem alten Mann und es entsteht eine Freundschaft, die Eleanors Schutzmauer zum Einsturz bringt. Sie muss sich den dunklen Schatten ihrer Kindheit stellen und erkennt, dass echte Heilung erst durch menschliche Nähe möglich wird. Es ist ein Buch voller Hoffnung und Tiefgang.\n\n### Warum es wichtig ist\nDer Roman thematisiert Einsamkeit und die Spätfolgen von Traumata auf ehrliche und respektvolle Weise. Er zeigt, dass hinter einer schrulligen Fassade oft eine tiefe Verletzlichkeit steckt. Für die Leser ist Eleanors Weg eine Ermutigung, sich Hilfe zu suchen und den Wert von echten, urteilsfreien Freundschaften zu schätzen. Es bricht das Stigma der psychischen Erkrankung und feiert die Kraft des Neuanfangs.\n\n### Die zentrale Erkenntnis\nEinsamkeit ist ein Überlebensmechanismus, aber Nähe ist der Schlüssel zum Leben. 'Alles okay' zu sein ist oft nur ein Käfig; die wahre Freiheit liegt darin, seine Wunden zu akzeptieren und Hilfe anzunehmen.",
      "keyInsights": [
        { "title": "Überleben vs. Erleben", "explanation": "Eleanor hat funktionale Strategien entwickelt, um durch den Tag zu kommen, aber sie hat vergessen, wie es sich anfühlt, wirklich glücklich zu sein.", "impact": "Regt dazu an, die eigene Lebensgestaltung zu hinterfragen." }
      ],
      "chapters": [
        { "number": 1, "title": "Die Routine", "summary": "Eleanor beschreibt ihr durchgetaktetes Leben und ihre Überzeugung, dass ihr nichts fehlt." },
        { "number": 2, "title": "Der Unfall", "summary": "Eine kleine Tat der Hilfsbereitschaft wird zum Wendepunkt in Eleanors Leben." },
        { "number": 3, "title": "Heilung", "summary": "Eleanor begibt sich auf den schmerzhaften, aber befreienden Weg der Therapie." }
      ],
      "quotes": [
        "Ich war okay. Ich war vollkommen okay. Aber 'okay' ist das gefährlichste Wort der Sprache.",
        "Einsamkeit ist das neue Krebgeschwür – ein stiller Killer."
      ],
      "actionItems": [
        "Melden Sie sich bei jemandem, der sich vielleicht einsam fühlt.",
        "Reflektieren Sie über Ihre eigenen Strategien im Umgang mit Stress."
      ]
    }
  }
};

async function injectExpansions() {
  console.log('--- STARTING MANUAL INJECTION BATCH 6 (MISC FICTION) ---');
  
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
