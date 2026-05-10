
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const EXPANSIONS: any = {
  "The Art of Racing in the Rain": {
    "en": {
      "summary": "Garth Stein's *The Art of Racing in the Rain* is a deeply moving and unconventional story of a family's struggles and triumphs, narrated by a wise and observant dog named Enzo. Enzo, who believes he will be reincarnated as a human in his next life, watches over his master, Denny Swift, a professional race car driver, as he navigates the challenges of marriage, fatherhood, and a devastating legal battle. The novel uses the metaphors of racing—such as the importance of balance, focus, and handling 'the rain'—to explore the complexities of the human condition and the enduring bond between humans and their canine companions.\n\n### Why It Matters\nThis book is significant for its unique narrative voice, which provides a philosophical and often humorous perspective on human behavior. It matters because it explores themes of loyalty, perseverance, and the struggle for justice against systemic obstacles. For readers, Enzo’s observations on life and death are both heart-breaking and profoundly uplifting. It challenges our understanding of animal consciousness and highlights the incredible emotional support that pets provide to their human families. It is a modern classic that continues to resonate with its emotional honesty and its beautiful, metaphorical storytelling.\n\n### The Final Takeaway\nYour life is the car, and you are the driver. You cannot control 'the rain' (the unforeseen tragedies), but you can control how you react to it and how you steer through it. True mastery is about keeping your eyes on the horizon and never giving up, no matter how difficult the track becomes. Loyalty and love are the ultimate anchors in a world that can be both beautiful and brutal.",
      "keyInsights": [
        { "title": "The Metaphor of Racing", "explanation": "Life, like racing, is not about speed, but about control and the ability to anticipate and react to changing conditions. Mastery comes from focus and the refusal to let setbacks define the outcome.", "example": "Denny's use of racing techniques—like looking where you want to go—to navigate his personal and legal challenges.", "impact": "Provides a framework for resilience." },
        { "title": "The Depth of Animal Consciousness", "explanation": "Enzo's narration suggests that animals perceive and understand far more than humans realize. This promotes a more empathetic and respectful relationship with the natural world.", "example": "Enzo's deep understanding of Denny's grief and his attempts to comfort him during their darkest moments.", "impact": "Increases empathy for and awareness of animal welfare." }
      ],
      "chapters": [
        { "number": 1, "title": "The Old Dog and his Master", "summary": "Enzo reflects on his life and his belief in reincarnation as he nears the end of his journey." },
        { "number": 2, "title": " DENNY AND EVE", "summary": "The early days of Denny's marriage and the challenges of balancing his passion for racing with his family life." },
        { "number": 3, "title": "The Legal Battle", "summary": "Denny faces a devastating accusation and a fight for the custody of his daughter, Zoe." },
        { "number": 4, "title": "The Final Lap", "summary": "Denny and Enzo find a new peace and the legacy of their bond is revealed in a surprising and redemptive conclusion." }
      ],
      "quotes": [
        "In racing, they say that your car goes where your eyes go.",
        "That which you manifest is before you.",
        "Your car goes where your eyes go. The driver who cannot tear his eyes away from the wall as he spins out of control will inevitably hit that wall."
      ],
      "actionItems": [
        "Spend 10 minutes observing your pet or a local animal and reflect on their perspective of the world.",
        "Identify one 'wall' in your life you are currently staring at and consciously shift your gaze to the 'horizon'.",
        "Acknowledge one person who has been a loyal 'navigator' in your life this week."
      ]
    },
    "de": {
      "summary": "In 'Enzo oder Die Kunst, ein Mensch zu sein' erzählt Garth Stein die Geschichte einer Familie aus der Sicht des Hundes Enzo. Enzo beobachtet seinen Besitzer Denny, einen Rennfahrer, durch alle Höhen und Tiefen des Lebens. Unter Verwendung von Metaphern aus dem Rennsport – wie dem Umgang mit Regen auf der Strecke – erkundet der Roman Themen wie Loyalität, Gerechtigkeit und das Unausweichliche. Es ist eine philosophische und herzerwärmende Erzählung über das, was es wirklich bedeutet, ein Mensch zu sein.\n\n### Warum es wichtig ist\nDas Buch besticht durch seine ungewöhnliche Erzählperspektive und bietet einen tiefen Blick in die Seele eines Tieres. Es zeigt, wie wir durch Krisen wachsen können, wenn wir den Fokus nicht verlieren. Für die Leser ist Enzo ein weiser Begleiter, der uns lehrt, dass wir unser Schicksal selbst steuern, auch wenn wir die 'Witterungsbedingungen' nicht kontrollieren können. Es ist eine Hommage an die bedingungslose Liebe zwischen Mensch und Hund.\n\n### Die zentrale Erkenntnis\nDas Leben ist wie ein Rennen: Man kann den Regen nicht verhindern, aber man kann lernen, darin zu fahren. Wahre Meisterschaft liegt darin, das Ziel im Auge zu behalten und niemals aufzugeben.",
      "keyInsights": [
        { "title": "Die Kunst der Fokussierung", "explanation": "Im Rennsport wie im Leben gilt: Das Auto fährt dorthin, wo man hinsieht. Wer auf das Hindernis starrt, wird es treffen.", "impact": "Hilft bei der Bewältigung von Lebenskrisen." }
      ],
      "chapters": [
        { "number": 1, "title": "Enzos Vision", "summary": "Der alte Hund bereitet sich auf seine Reinkarnation als Mensch vor." },
        { "number": 2, "title": "Das Rennen des Lebens", "summary": "Denny kämpft um seine Familie und seine Leidenschaft als Rennfahrer." },
        { "number": 3, "title": "Die letzte Runde", "summary": "Ein versöhnliches Ende, das den Kreis der Geschichte schließt." }
      ],
      "quotes": [
        "Das Auto fährt dorthin, wo deine Augen hinführen.",
        "Man muss den Regen auf der Strecke akzeptieren."
      ],
      "actionItems": [
        "Überlegen Sie, welches Ziel Sie aktuell aus den Augen verloren haben.",
        "Schätzen Sie die Loyalität der Menschen (und Tiere) in Ihrem Leben wert."
      ]
    }
  },
  "A Thousand Splendid Suns": {
    "en": {
      "summary": "Khaled Hosseini's *A Thousand Splendid Suns* is a sprawling and deeply moving novel set in Afghanistan, spanning thirty years of its turbulent history. It follows the interconnected lives of two women—Mariam, an illegitimate child forced into a marriage with a much older man, and Laila, a young girl whose family is destroyed by the war. Despite their initial jealousy and the brutal treatment they receive from their husband, the two women form an unbreakable bond of friendship and sisterhood. The novel is a stark and powerful exploration of the resilience of Afghan women, the cruelty of patriarchal control, and the enduring strength of the human spirit in the face of unimaginable suffering.\n\n### Why It Matters\nThis book is significant for its unflinching portrayal of the lives of women under the Taliban and the previous regimes in Afghanistan. It matters because it humanizes the statistics of war and oppression, focusing on the intimate emotional lives of those most affected by them. For readers, Mariam and Laila’s journey is a profound exploration of sacrifice, maternal love, and the possibility of hope in a world that seems determined to crush it. It challenges our understanding of strength and highlights the incredible courage required for women to survive and find agency in a society that offers them almost none. It is a masterpiece of historical and social commentary.\n\n### The Final Takeaway\nEven in the darkest of circumstances, the human spirit can find a way to love and protect. Bravery is not the absence of fear, but the decision to act in spite of it. We are capable of making the ultimate sacrifice for those we mother, whether they are our biological children or sisters found in suffering. There is a thousand splendid suns waiting to shine behind the clouds of every tragedy.",
      "keyInsights": [
        { "title": "The Strength of Female Solidarity", "explanation": "The relationship between Mariam and Laila transforms from one of rivals to one of protectors. Their bond is the only thing that allows them to survive their brutal environment, showing that cooperation and love are powerful tools of resistance.", "example": "Mariam's ultimate sacrifice to ensure a future for Laila and her children.", "impact": "Celebrates the power of sisterhood." },
        { "title": "The Impact of War on the Domestic Sphere", "explanation": "The novel illustrates how political instability directly translates into increased violence and restriction within the home. Personal safety is intimately tied to the stability of the larger society.", "example": "The drastic changes in Laila's life as Kabul shifts from a progressive city to a battleground for the Taliban.", "impact": "Increases awareness of the social consequences of conflict." },
        { "title": "The Enduring Power of Maternal Love", "explanation": "Maternal love is portrayed as a force that can transcend even the most horrific circumstances. It is the ultimate source of strength and hope in the novel.", "example": "Mariam's maternal feelings for Laila's children, which give her life new meaning.", "impact": "Deepens appreciation for the role of caregivers." }
      ],
      "chapters": [
        { "number": 1, "title": "Mariam's Childhood", "summary": "Mariam's early life as a 'harami' and her forced marriage to Rasheed." },
        { "number": 2, "title": "Laila's World", "summary": "Laila's childhood in a relatively progressive Kabul and the arrival of the war that changes everything." },
        { "number": 3, "title": "The Bond of Sacrifice", "summary": "The lives of the two women converge under Rasheed's roof, leading to a deep friendship and a plan to escape." },
        { "number": 4, "title": "Redemption and Return", "summary": "Mariam's sacrifice and Laila's eventual return to a changing Kabul to find peace and purpose." }
      ],
      "quotes": [
        "A man's accusing finger always finds a woman. Always. Remember that, Mariam.",
        "One could not count the moons that shimmer on her roofs, or the thousand splendid suns that hide behind her walls.",
        "To me, it's always been about the women."
      ],
      "actionItems": [
        "Support an organization that focuses on women's education and rights in Afghanistan.",
        "Acknowledge a woman in your life who has shown incredible 'quiet' strength.",
        "Read an article about the history of Kabul in the 1960s and 70s to better understand its former progressiveness."
      ]
    },
    "de": {
      "summary": "In 'Tausend strahlende Sonnen' erzählt Khaled Hosseini die Geschichte zweier Frauen, Mariam und Laila, deren Schicksale im kriegsgebeutelten Afghanistan untrennbar miteinander verwoben werden. Trotz ihrer unterschiedlichen Herkunft und der Grausamkeit ihres gemeinsamen Ehemannes finden sie ineinander eine tiefe geschwisterliche Verbundenheit. Der Roman ist ein erschütterndes und zugleich hoffnungsvolles Porträt der afghanischen Frauen und ihres unbändigen Willens zu überleben. Es ist eine Geschichte über Opferbereitschaft, mütterliche Liebe und das Licht, das selbst in dunkler Nacht niemals ganz erlischt.\n\n### Warum es wichtig ist\nDas Buch gibt den namenlosen Opfern des Krieges in Afghanistan eine Stimme. Es macht die systematische Unterdrückung von Frauen unter den verschiedenen Regimen greifbar und thematisiert universelle Fragen von Menschlichkeit und Würde. Es zeigt, dass wahre Stärke oft im Verborgenen liegt – in der gegenseitigen Unterstützung und dem Mut, für andere einzustehen.\n\n### Die zentrale Erkenntnis\nSelbst unter extremster Unterdrückung bleibt die Fähigkeit zu lieben unser mächtigstes Werkzeug. Eine einzige Tat der Aufopferung kann die Kette des Leids für die nächste Generation durchbrechen.",
      "keyInsights": [
        { "title": "Die Kraft der Solidarität", "explanation": "Die Bindung zwischen Mariam und Laila zeigt, dass Frauen gemeinsam stärker sind als die Systeme, die sie unterdrücken wollen.", "impact": "Plädiert für Zusammenhalt und gegenseitige Unterstützung." }
      ],
      "chapters": [
        { "number": 1, "title": "Mariams Schicksal", "summary": "Die Geschichte eines ungeliebten Kindes und der Beginn einer harten Ehe." },
        { "number": 2, "title": "Kabul im Krieg", "summary": "Lailas Welt bricht zusammen und sie findet Zuflucht bei Rasheed und Mariam." },
        { "number": 3, "title": "Licht in der Finsternis", "summary": "Der gemeinsame Kampf der Frauen und Mariams letzter Akt der Liebe." }
      ],
      "quotes": [
        "Man kann die Monde nicht zählen, die auf ihren Dächern schimmern, noch die tausend strahlenden Sonnen hinter ihren Mauern.",
        "Der anklagende Finger eines Mannes findet immer eine Frau."
      ],
      "actionItems": [
        "Schenken Sie einer Frau in Ihrem Umfeld für ihre Stärke Beachtung.",
        "Informieren Sie sich über Frauenrechtsprojekte weltweit."
      ]
    }
  },
  "The Giver of Stars": {
    "de": {
       "summary": "Jojo Moyes' 'Wie ein Leuchten in tiefer Nacht' (The Giver of Stars) basiert auf einer wahren Geschichte und führt uns in die Bergwelt Kentuckys während der Großen Depression. Es erzählt von einer Gruppe mutiger Frauen, der 'Pack Horse Librarians', die hoch zu Ross Bücher in die entlegensten Bergregionen bringen. Im Zentrum steht Alice Wright, eine Engländerin, die durch die Heirat mit einem Amerikaner in dieses harte Leben gerät. Gemeinsam mit der rebellischen Margery O'Hare kämpft sie gegen Vorurteile, Korruption und die raue Natur, um dem Volk Bildung und Hoffnung zu bringen. Ein Roman über weibliche Freundschaft, die befreiende Kraft von Büchern und den Mut, sich für das Richtige einzusetzen.\n\n### Warum es wichtig ist\nDas Buch würdigt ein faszinierendes Stück Geschichte und zeigt, wie wichtig der Zugang zu Information für die persönliche Freiheit ist. Es thematisiert die soziale Ausgrenzung in abgelegenen Regionen und den Kampf gegen patriarchalische Strukturen. Für die Leser ist es eine inspirierende Erinnerung daran, dass Bildung Barrieren einreißt und dass wahre Gemeinschaft dort entsteht, wo Menschen über sich hinauswachsen, um anderen zu helfen. Es feiert die Kraft der Bücher als Werkzeug für sozialen Wandel.\n\n### Die zentrale Erkenntnis\nBildung ist der Schlüssel zur Freiheit. Wenn wir uns zusammentun, um Wissen zu teilen, können wir selbst die härtesten Mauern aus Unwissenheit und Unterdrückung überwinden. Wahre Stärke liegt in der Gemeinschaft und dem Glauben an eine bessere Zukunft für alle.",
       "keyInsights": [
         { "title": "Bücher als Befreiung", "explanation": "Die Bibliothek auf Pferderücken zeigt, dass der Zugang zu Geschichten die Sichtweise der Menschen verändert und ihnen neue Träume ermöglicht.", "impact": "Fördert das Bewusstsein für Bildungsgerechtigkeit." },
         { "title": "Weiblicher Zusammenhalt", "explanation": "Die Frauen der Bibliothek unterstützen sich gegenseitig gegen eine feindselige Umwelt und beweisen, dass Solidarität mächtiger ist als soziale Rollenklischees.", "impact": "Inspiriert zu mehr Gemeinschaftssinn unter Frauen." }
       ],
       "chapters": [
         { "number": 1, "title": "Die Reise ins Ungewisse", "summary": "Alice verlässt England und beginnt ihr neues Leben im ländlichen Kentucky." },
         { "number": 2, "title": "Die Bergreiterinnen", "summary": "Die Gründung der Bibliothek und die ersten gefährlichen Ritte zu den einsamen Farmen." },
         { "number": 3, "title": "Gegenwind", "summary": "Die Frauen müssen ihre Mission gegen den Widerstand der mächtigen Männer im Tal verteidigen." },
         { "number": 4, "title": "Das Leuchten", "summary": "Ein triumphaler Sieg für die Gemeinschaft und der Beweis, dass Worte die Welt verändern können." }
       ],
       "quotes": [
         "Bücher bringen Licht in das dunkelste Tal.",
         "Es gibt keine Grenze für das, was Frauen gemeinsam erreichen können.",
         "Man erkennt den Wert eines Buches erst, wenn man es mit jemandem teilt, der noch nie eines besessen hat."
       ],
       "actionItems": [
         "Spenden Sie ein Buch an eine öffentliche Einrichtung.",
         "Unterstützen Sie eine lokale Bibliothek.",
         "Lesen Sie etwas über die reale Geschichte der Pack Horse Librarians."
       ]
    }
  }
};

async function injectExpansions() {
  console.log('--- STARTING MANUAL INJECTION BATCH 8 (FINAL 5) ---');
  
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
