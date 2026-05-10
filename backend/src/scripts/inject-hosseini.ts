
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const EXPANSIONS: any = {
  "The Kite Runner": {
    "en": {
      "summary": "Khaled Hosseini's *The Kite Runner* is a powerful and haunting story of friendship, betrayal, and redemption. Set against the backdrop of a changing Afghanistan, it follows Amir, a young boy from a wealthy family in Kabul, and Hassan, the son of his father's servant. A single act of cowardice by Amir during a kite-fighting tournament changes the course of their lives forever. Years later, living in America, Amir receives a call that offers him 'a way to be good again,' leading him back to a Taliban-controlled Afghanistan to confront his past and seek forgiveness. It is a deeply moving exploration of the complex bond between fathers and sons, and the enduring power of guilt and redemption.\n\n### Why It Matters\nThis book is significant for its vivid and humanizing portrayal of Afghanistan, introducing many Western readers to its culture and history before and during the Soviet and Taliban eras. It matters because it tackles universal themes of sacrifice, loyalty, and the difficulty of living with one's own mistakes. For readers, it is an emotional journey that challenges our understanding of courage and the possibility of second chances. It reminds us that our past is always with us, but that it is never too late to try and make things right. It is a modern classic that continues to resonate with its honesty and emotional depth.\n\n### The Final Takeaway\nTrue redemption is not about erasing the past, but about finding the courage to face it and taking responsibility for our actions. A single moment of choice can define a lifetime, but a lifetime of effort can lead to forgiveness. There is always a way to be good again.",
      "keyInsights": [
        { "title": "The Weight of Guilt and the Path to Redemption", "explanation": "Amir's guilt over his childhood betrayal of Hassan shapes his entire adult life. His journey back to Afghanistan is a literal and metaphorical path toward self-forgiveness and making amends.", "example": "Amir risking his life to rescue Hassan's son, Sohrab, from the Taliban.", "impact": "Encourages ownership of one's past." },
        { "title": "The Complexity of Father-Son Relationships", "explanation": "The desire for paternal approval is a primary motivator for Amir. The novel explores how fathers' secrets and expectations can both burden and inspire their children.", "example": "Amir's struggle to earn 'Baba's' respect and the eventual discovery of Baba's own flaws.", "impact": "Deepens understanding of family dynamics." },
        { "title": "The Impact of History on Individual Lives", "explanation": "The political upheavals in Afghanistan—from the fall of the monarchy to the rise of the Taliban—are not just background; they are forces that displace families and destroy lives. Personal stories are inextricably linked to the larger tide of history.", "example": "Amir and Baba's flight to America as refugees following the Soviet invasion.", "impact": "Increases awareness of global displacement and refugee experiences." }
      ],
      "chapters": [
        { "number": 1, "title": "The Kite Tournament", "summary": "Amir wins the tournament but betrays Hassan in a moment of fear that will haunt him forever." },
        { "number": 2, "title": "Flight from Kabul", "summary": "The Soviet invasion forces Amir and Baba to flee their homeland for a new life in California." },
        { "number": 3, "title": "The Call of the Past", "summary": "Rahim Khan's call from Pakistan prompts Amir to return to the region to find Hassan's son." },
        { "number": 4, "title": "For You, a Thousand Times Over", "summary": "Amir confronts the Taliban and brings Sohrab to America, finally finding a sense of peace." }
      ],
      "quotes": [
        "For you, a thousand times over.",
        "There is a way to be good again.",
        "It may be unfair, but what happens in a few days, sometimes even a single day, can change the course of a whole lifetime."
      ],
      "actionItems": [
        "Learn more about the history and culture of Afghanistan through a non-fiction source.",
        "Identify one past mistake you haven't fully forgiven yourself for and take one step toward self-compassion.",
        "Practice 'radical loyalty' to a friend or family member this week."
      ]
    },
    "de": {
      "summary": "Khaled Hosseinis 'Der Drachenläufer' ist eine bewegende Geschichte über Freundschaft, Verrat und die Hoffnung auf Erlösung. Vor der Kulisse eines sich wandelnden Afghanistans erzählt der Roman von Amir und Hassan, zwei Jungen aus unterschiedlichen sozialen Schichten in Kabul. Ein feiger Verrat Amirs zerstört ihre Freundschaft und prägt sein gesamtes weiteres Leben. Jahre später, als Amir in den USA lebt, erhält er die Chance, seine Schuld wiedergutzumachen. Er kehrt in das von den Taliban beherrschte Afghanistan zurück, um Hassan's Sohn zu retten. Es ist eine tiefgründige Erkundung der Vater-Sohn-Beziehung und der unendlichen Kraft der Vergebung.\n\n### Warum es wichtig ist\nDas Buch ist wichtig, weil es Afghanistan ein menschliches Gesicht gibt und dem Leser die Kultur und Tragödie des Landes näherbringt. Es thematisiert universelle Fragen von Loyalität und der Last der eigenen Vergangenheit. Es zeigt, dass es nie zu spät ist, das Richtige zu tun, auch wenn der Weg dorthin schmerzhaft ist.\n\n### Die zentrale Erkenntnis\nWahre Erlösung bedeutet, sich der eigenen Vergangenheit zu stellen und Verantwortung zu übernehmen. Es gibt immer einen Weg, wieder gut zu sein.",
      "keyInsights": [
        { "title": "Die Last der Schuld", "explanation": "Amirs Kindheitstrauma beeinflusst jede seiner Entscheidungen als Erwachsener. Erst durch Taten der Aufopferung findet er Frieden.", "impact": "Fördert die Auseinandersetzung mit persönlicher Verantwortung." }
      ],
      "chapters": [
        { "number": 1, "title": "Der Winter des Turniers", "summary": "Amir gewinnt den Drachen-Wettbewerb, verliert aber seine Unschuld durch einen Akt des Verrats." },
        { "number": 2, "title": "Exil in Kalifornien", "summary": "Amir und sein Vater bauen sich nach der Flucht vor den Sowjets ein neues Leben auf." },
        { "number": 3, "title": "Rückkehr nach Kabul", "summary": "Amir stellt sich der Gefahr der Taliban, um die Vergangenheit zu sühnen." }
      ],
      "quotes": [
        "Für dich, tausendmal lieber.",
        "Es gibt immer einen Weg, wieder gut zu sein."
      ],
      "actionItems": [
        "Informieren Sie sich über die aktuelle humanitäre Lage in Afghanistan.",
        "Überlegen Sie, ob es jemanden gibt, dem Sie eine Entschuldigung schulden."
      ]
    }
  },
  "And the Mountains Echoed": {
    "en": {
      "summary": "Khaled Hosseini's *And the Mountains Echoed* is a multi-generational family saga that explores the far-reaching consequences of a single, desperate decision. The story begins in a poor Afghan village in 1952, where a father, unable to support his family, makes the agonizing choice to sell his young daughter Pari to a wealthy, childless couple in Kabul. The novel then follows the lives of Pari, her brother Abdullah, and several other characters across decades and continents—from Paris to San Francisco to Greece. It is a stunning meditation on the ways we love, hurt, betray, and honor each other, and how the echoes of our past can follow us across generations.\n\n### Why It Matters\nThis book is significant for its intricate, non-linear structure that mirrors the complexity of human memory and experience. It matters because it explores the definition of family beyond blood relations, focusing on the chosen bonds that sustain us. For readers, it is an exploration of the moral ambiguity of difficult choices and the ripple effects they create. It portrays a broad spectrum of the human condition—from the sacrifices of the impoverished to the search for identity in the diaspora. It is a deeply empathetic work that challenges us to see the world through the eyes of those whose lives were shaped by choices they didn't make.\n\n### The Final Takeaway\nWe are all connected by the stories we tell and the people we lose. A single act can break a heart, but its consequences can weave together the lives of strangers across the globe. Loving someone often means letting them go so they can survive.",
      "keyInsights": [
        { "title": "The Sacrifice of Separation", "explanation": "The central event—the separation of Pari and Abdullah—illustrates how poverty and necessity can force families into impossible choices. The pain of this loss resonates through every character's life, showing that trauma has a long memory.", "example": "Abdullah spending his life in California still haunted by the memory of the sister he lost.", "impact": "Increases empathy for families separated by circumstance." },
        { "title": "The Complexity of Identity and Belonging", "explanation": "As characters move across the globe, they struggle to reconcile their Afghan heritage with their new environments. The novel asks: Who are we when our original world is taken from us?", "example": "Pari growing up in Paris, sensing a 'phantom limb' in her life without knowing the truth of her past.", "impact": "Deepens understanding of the immigrant and diaspora experience." },
        { "title": "The Power of Storytelling", "explanation": "The novel itself is a collection of interconnected stories. It illustrates how narratives are the only things that truly bridge the gap between people and across time.", "example": "The many perspectives—from a Greek doctor to an Afghan stepmother—that build a complete picture of the family's history.", "impact": "Highlights the unifying power of human narrative." }
      ],
      "chapters": [
        { "number": 1, "title": "The Story of the Giant", "summary": "A father tells his children a myth that foreshadows the difficult sacrifice he is about to make." },
        { "number": 2, "title": "The Hand that Gives", "summary": "Pari is taken to Kabul, starting a chain of events that will span fifty years and multiple continents." },
        { "number": 3, "title": "Echoes in Paris", "summary": "Pari grows up in France, haunted by a feeling of incompleteness as she navigates her adult life." },
        { "number": 4, "title": "The Final Reunion", "summary": "The threads of the story come together in a poignant and emotionally complex conclusion." }
      ],
      "quotes": [
        "I suspect the truth is that we are waiting, all of us, as against hope, for something that probably won’t happen.",
        "A story is like a moving train: no matter where you hop onboard, you are bound to reach your destination sooner or later.",
        "They say if you want to know how a person is, look at how they treat their subordinates, not their equals."
      ],
      "actionItems": [
        "Write down one family story you want to ensure is passed down to the next generation.",
        "Donate to a reputable charity that supports family reunification or refugee services.",
        "Reach out to a family member you haven't spoken to in a while to strengthen your connection."
      ]
    },
    "de": {
      "summary": "In 'Traumsammler' (And the Mountains Echoed) webt Khaled Hosseini ein meisterhaftes Geflecht aus Geschichten über Familie, Verlust und die unsichtbaren Fäden, die uns verbinden. Beginnend mit der schmerzhaften Trennung der Geschwister Pari und Abdullah im Jahr 1952 in Afghanistan, folgt der Roman den Spuren der Familienmitglieder über Jahrzehnte und Kontinente hinweg. Von Kabul über Paris bis nach Kalifornien zeigt Hosseini, wie eine einzige verzweifelte Entscheidung das Leben vieler Menschen für immer verändern kann. Es ist eine Meditation über die Kraft der Liebe und das Echo der Vergangenheit.\n\n### Warum es wichtig ist\nDas Buch besticht durch seine komplexe Struktur, die zeigt, wie individuelle Schicksale weltweit miteinander verwoben sind. Es thematisiert Identität in der Diaspora und die moralische Mehrdeutigkeit schwieriger Entscheidungen. Es erinnert uns daran, dass wir die Summe unserer Geschichten und der Menschen sind, die wir verloren haben.\n\n### Die zentrale Erkenntnis\nWir sind alle durch die Geschichten verbunden, die wir erzählen, und die Menschen, die wir vermissen. Eine Tat kann ein Herz brechen, aber ihre Folgen können die Leben von Fremden über den ganzen Globus hinweg verweben.",
      "keyInsights": [
        { "title": "Das Echo des Verlusts", "explanation": "Die Trennung von Geschwistern aus purer Not zeigt die Grausamkeit des Schicksals, aber auch die unzerstörbare emotionale Bindung.", "impact": "Fördert Empathie für Migrationsschicksale." }
      ],
      "chapters": [
        { "number": 1, "title": "Die Geschichte vom Riesen", "summary": "Ein Vater bereitet seine Kinder durch ein Märchen auf das Unausweichliche vor." },
        { "number": 2, "title": "Trennung", "summary": "Pari wird nach Kabul verkauft, ein Ereignis, das die Familie zerreißt." },
        { "number": 3, "title": "Späte Begegnungen", "summary": "Die Lebenswege kreuzen sich Jahrzehnte später in einer Welt, die sich völlig verändert hat." }
      ],
      "quotes": [
        "Eine Geschichte ist wie ein fahrender Zug: Egal wo man einsteigt, man erreicht sein Ziel.",
        "Wir alle warten auf etwas, das wahrscheinlich nie passieren wird."
      ],
      "actionItems": [
        "Bewahren Sie eine Familienerinnerung schriftlich auf.",
        "Setzen Sie ein Zeichen der Verbundenheit mit Ihrer eigenen Familie."
      ]
    }
  }
};

async function injectExpansions() {
  console.log('--- STARTING MANUAL INJECTION BATCH 4 (HOSSEINI) ---');
  
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
