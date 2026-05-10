
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const EXPANSIONS: any = {
  "Where the Crawdads Sing": {
    "en": {
      "summary": "Delia Owens's *Where the Crawdads Sing* is a mesmerizing coming-of-age story and a thrilling murder mystery set in the marshlands of North Carolina. It follow Kaya Clark, the 'Marsh Girl,' who survives alone for years in the wild after being abandoned by her family. When the town's golden boy, Chase Andrews, is found dead, the suspicion immediately falls on the reclusive Kya. The novel is a beautiful exploration of isolation, the resilience of the human spirit, and the deep connection between humans and the natural world. It is a story of prejudice, survival, and the profound secrets hidden in the shadows of the marsh.\n\n### Why It Matters\nThis book is significant for its lyrical and immersive descriptions of nature, making the marsh a central character in the story. It matters because it explores the devastating effects of social isolation and the strength required to overcome them. For readers, Kaya's journey from a frightened child to a self-sufficient naturalist is an inspiration. It challenges our understanding of 'civilization' versus 'nature' and prompts us to reflect on how we judge those who live on the fringes of society. It is a haunting and unforgettable read that blends multiple genres seamlessly.\n\n### The Final Takeaway\nIsolation can be a crucible that reveals the true strength of the human heart. Nature is both a harsh teacher and a faithful companion for those who listen to its rhythms. Behind every surface lies a far deeper and more complex reality than others can perceive. We are all, at some level, products of our environments, but we are also capable of rising above them.",
      "keyInsights": [
        { "title": "The Resilience of the Isolated Spirit", "explanation": "Kya's ability to survive and educate herself in the marsh without a social safety net is a testament to human adaptability. Loneliness can be a powerful driver of observation and creativity.", "example": "Kaya becoming a published naturalist by documenting the flora and fauna of her environment.", "impact": "Inspires self-reliance and lifelong learning." },
        { "title": "The Dangers of Social Prejudice", "explanation": "The townspeople's immediate suspicion of Kaya based on her lifestyle reveals how bias shapes our perception of justice. Prejudice often blinds us to the truth of a person's character.", "example": "The trial of Kya, which is as much a trial of her way of life as it is of the evidence.", "impact": "Promotes awareness of unconscious bias and social exclusion." },
        { "title": "Nature as a Sanctuary and Teacher", "explanation": "For Kaya, the marsh provides both physical sustenance and emotional comfort. The novel shows that our connection to the natural world can be a vital part of our identity and survival.", "example": "Kaya's relationship with the gulls and the knowledge she gains from observing the marsh's inhabitants.", "impact": "Deepens appreciation for environmental connection." }
      ],
      "chapters": [
        { "number": 1, "title": "The Marsh Girl", "summary": "Kaya is abandoned by her family and learns to survive on her own in the Carolina marshlands." },
        { "number": 2, "title": "Chase Andrews", "summary": "The town's golden boy is found dead, setting off a chain of events that will put Kaya on trial." },
        { "number": 3, "title": "The Naturalist", "summary": "A kind-hearted boy named Tate helps Kaya learn to read and write, opening a new world for her." },
        { "number": 4, "title": "The Verdict", "summary": "Kaya faces her accusers and the truth about Chase Andrews' death is finally revealed." }
      ],
      "quotes": [
        "Nature is a cruel teacher, but she is a faithful one.",
        "A marsh is not a swamp. Marsh is a space of light, where grass grows in water, and water flows into the sky.",
        "There are some things you can't learn in a book. You have to learn them from the gulls and the tide."
      ],
      "actionItems": [
        "Spend an hour observing a local ecosystem (even a park) without any distractions.",
        "Read a book about local flora and fauna to better understand the nature around you.",
        "Reflect on a time you felt like an outsider and find one positive lesson you learned from that experience."
      ]
    },
    "de": {
      "summary": "In 'Der Gesang der Flusskrebse' (Where the Crawdads Sing) erzählt Delia Owens eine fesselnde Geschichte über das Erwachsenwerden und einen mysteriösen Mordfall in den Marschen von North Carolina. Kaya Clark, das 'Marschmädchen', lebt seit ihrer Kindheit allein und isoliert in der Wildnis. Als der beliebte Chase Andrews tot aufgefunden wird, gerät die eigenbrötlerische Kaya sofort unter Verdacht. Der Roman ist eine poetische Erkundung von Einsamkeit, der Kraft des Überlebenswillens und der tiefen Verbundenheit mit der Natur.\n\n### Warum es wichtig ist\nDas Buch besticht durch seine atmosphärischen Naturbeschreibungen und thematisiert die verheerenden Folgen sozialer Ausgrenzung. Es fordert unsere Vorurteile heraus und zeigt, wie wir Menschen beurteilen, die am Rande der Gesellschaft leben. Kayas Weg von der verlassenen Tochter zur angesehenen Naturforscherin ist ein Zeugnis menschlicher Resilienz.\n\n### Die zentrale Erkenntnis\nEinsamkeit kann eine Schule der Aufmerksamkeit und Stärke sein. Die Natur ist für den, der sie versteht, sowohl Zuflucht als auch Lehrerin. Hinter der Oberfläche verbirgt sich oft eine Komplexität, die für Außenstehende unsichtbar bleibt.",
      "keyInsights": [
        { "title": "Resilienz durch Naturverbundenheit", "explanation": "Kaya findet in der Marsch nicht nur Nahrung, sondern auch emotionalen Halt. Die Beobachtung der Natur ersetzt ihr die menschliche Gemeinschaft.", "impact": "Fördert das Verständnis für alternative Lebenswege." }
      ],
      "chapters": [
        { "number": 1, "title": "Das Marschmädchen", "summary": "Kaya wird von ihrer Familie verlassen und muss lernen, allein in der Wildnis zu überleben." },
        { "number": 2, "title": "Der Tote", "summary": "Chase Andrews wird tot aufgefunden und die Stadt sucht einen Sündenbock." },
        { "number": 3, "title": "Das Urteil", "summary": "Kaya steht vor Gericht und die wahre Geschichte wird enthüllt." }
      ],
      "quotes": [
        "Die Natur ist eine grausam, aber treue Lehrerin.",
        "Ein Marsch ist kein Sumpf. Er ist ein Ort des Lichts."
      ],
      "actionItems": [
        "Beobachten Sie ein lokales Ökosystem ganz bewusst.",
        "Hinterfragen Sie ein Vorurteil, das Sie über jemanden haben, der 'anders' lebt."
      ]
    }
  },
  "The Curious Incident of the Dog in the Night-Time": {
    "en": {
      "summary": "Mark Haddon's *The Curious Incident of the Dog in the Night-Time* is a groundbreaking novel narrated by Christopher Boone, a 15-year-old boy with autism. When Christopher discovers his neighbor's dog, Wellington, murdered with a pitchfork, he decides to embark on a detective mission to find the culprit. Written as a 'mystery' novel by Christopher himself, the story evolves into a deep exploration of the complexities of human relationships, family secrets, and the overwhelming nature of the world for someone who perceives it with hyper-logical intensity and a different set of social rules.\n\n### Why It Matters\nThis book is significant for its unique and authentic-feeling First-person perspective of an individual on the autism spectrum. It matters because it doesn't portray autism as a 'disease' to be cured, but as a different mental 'operating system' with its own set of challenges and remarkable abilities. For readers, it provides a window into a mind that values truth and logic over social conventions, forcing us to re-evaluate our own assumptions about 'normal' behavior. It is a powerful lesson in empathy, showing the courage required for a neurodiverse person to navigate a world that is often sensory-overloading and unpredictable.\n\n### The Final Takeaway\nDifferent doesn't mean less. A different way of perceiving the world can be a source of incredible insight and strength. The true mystery isn't just who killed the dog, but how we learn to understand and accept each other across the gaps in our perceptions.",
      "keyInsights": [
        { "title": "The Power of Hyper-Logic", "explanation": "Christopher's mind is a landscape of numbers, patterns, and absolute truths. While this makes social interactions difficult, it also allows for incredible clarity and solving complex problems that others find overwhelming.", "example": "Christopher's ability to navigate the complex London underground system by following its logical map during a moment of crisis.", "impact": "Celebrates the strengths of neurodiverse thinking." },
        { "title": "The Complexity of Truth and Secrets", "explanation": "Christopher's inability to lie and his literal interpretation of information expose the complicated web of half-truths and lies that adults use to maintain their lives. Truth is sometimes more painful than a lie, but it is necessary for authentic connection.", "example": "Christopher's discovery of his father's letters, which reveals a major family secret that had been hidden 'for his own good'.", "impact": "Promotes honesty in communication." },
        { "title": "Overcoming Sensory Overload", "explanation": "The world for someone with autism can be a chaotic and painful barrage of sensory input. The novel highlights the incredible courage required to push through this to reach a goal.", "example": "Christopher's journey to London, which represents a massive triumph over his own fears and physical limitations.", "impact": "Increases understanding of sensory processing differences." }
      ],
      "chapters": [
        { "number": 1, "title": "The Murder of Wellington", "summary": " Christopher finds the dead dog and decides to launch an investigation against his father's wishes." },
        { "number": 2, "title": "The Detective and his Book", "summary": " Christopher explains his unique way of thinking and starts writing a detective novel about the incident." },
        { "number": 3, "title": "Uncovering Secrets", "summary": "The investigation leads Christopher to discover the truth about his mother and his father's deception." },
        { "number": 4, "title": "Heading to London", "summary": "Christopher courageously travels alone to the big city, proving he can navigate a chaotic world on his own terms." }
      ],
      "quotes": [
        "I find people confusing. This is for two main reasons. The first is that people do a lot of talking without using any words.",
        "The world is full of obvious things which nobody by any chance ever observes.",
        "And I know I can do this because I went to London on my own, and because I solved the mystery of Who Killed Wellington? and I found my mother and I was brave and I wrote a book and that means I can do anything."
      ],
      "actionItems": [
        "Practice 'literal thinking' for 15 minutes: Only process information exactly as it is given, without assuming subtext.",
        "Identify one area in your home or workspace that is sensory-overloading and find a way to simplify it.",
        "Praise someone whose way of thinking is different from yours for a specific insight they provided."
      ]
    },
    "de": {
      "summary": "Mark Haddons 'Supergute Tage oder Die sonderbare Welt des Christopher Boone' ist ein wegweisender Roman, erzählt aus der Sicht des 15-jährigen Christopher, der die Welt durch die Linse des Autismus wahrnimmt. Als Christopher den toten Hund seiner Nachbarin findet, beschließt er, den Fall wie sein Vorbild Sherlock Holmes zu lösen. Was als Kriminalroman beginnt, entwickelt sich zu einer tiefgründigen Reise in das Innere eines Geistes, der Wahrheit und Logik über alles liebt und mit den emotionalen Lügen der Erwachsenen konfrontiert wird. Das Buch ist eine kraftvolle Lektion in Empathie und zeigt den Mut, den es erfordert, in einer chaotischen Welt nach eigenen Regeln zu leben.\n\n### Warum es wichtig ist\nDer Roman bietet eine authentische und respektvolle Inneneinsicht in eine neurodivergente Denkweise. Er zeigt Autismus nicht als Defizit, sondern als eine andere Art der Weltwahrnehmung. In Columbus erleben wir den Alltag als eine Überflutung von Eindrücken, die durch Logik gezähmt werden müssen. Es erinnert uns daran, dass 'normal' eine Frage der Perspektive ist.\n\n### Die zentrale Erkenntnis\nAnderssein ist kein Mangel, sondern eine Quelle einzigartiger Einsichten. Die wahre Herausforderung besteht darin, Brücken zwischen unseren unterschiedlichen Wahrnehmungen zu bauen.",
      "keyInsights": [
        { "title": "Die Stärke der Logik", "explanation": "Christopher nutzt Muster und Zahlen, um der Welt Sinn zu verleihen. Was für andere chaotisch ist, wird für ihn berechenbar.", "impact": "Fördert die Wertschätzung für neurodiverse Stärken." },
        { "title": "Wahrheit um jeden Preis", "explanation": "Dons Unfähigkeit zu lügen entlarvt die diplomatischen Lügen der Erwachsenenwelt.", "impact": "Plädiert für mehr Ehrlichkeit in der Kommunikation." }
      ],
      "chapters": [
        { "number": 1, "title": "Der tote Hund", "summary": "Christopher findet Wellington und beginnt seine Ermittlungen gegen den Rat seines Vaters." },
        { "number": 2, "title": "Die Entdeckung", "summary": "Durch seine Nachforschungen stößt Christopher auf Familiengeheimnisse, die sein Weltbild erschüttern." },
        { "number": 3, "title": "Die Reise nach London", "summary": "Christopher überwindet seine größten Ängste und reist allein in eine ihm fremde Welt." }
      ],
      "quotes": [
        "Menschen sind verwirrend. Vor allem, weil sie viel reden, ohne Worte zu benutzen.",
        "Die Welt ist voller Dinge, die offensichtlich sind, die aber niemand jemals beobachtet."
      ],
      "actionItems": [
        "Vermeiden Sie heute in einem Gespräch alle Ironie und Metaphern und sprechen Sie ganz direkt.",
        "Anerkennen Sie die Leistung von jemandem an, der eine für Sie triviale soziale Situation mit großem Aufwand gemeistert hat."
      ]
    }
  }
};

async function injectExpansions() {
  console.log('--- STARTING MANUAL INJECTION BATCH 5 (OWENS & HADDON) ---');
  
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
