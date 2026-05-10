
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const EXPANSIONS: any = {
  "The Rosie Project": {
    "en": {
      "summary": "Graeme Simsion's *The Rosie Project* is a hilarious and heart-warming novel about Don Tillman, a socially awkward genetics professor who decides it's time to find a wife. To do so, he creates 'The Wife Project'—a 16-page questionnaire intended to filter out anyone who is unpunctual, smokes, or is otherwise incompatible with his highly structured life. Enter Rosie Jarman, who is everything Don is NOT: disorganized, fiery, and completely unsuitable. Yet, as Don helps Rosie search for her biological father, he discovers that love cannot be calculated by an algorithm. The book is a brilliant exploration of neurodiversity, the unpredictability of human emotion, and the beauty of being 'perfectly imperfect.'\n\n### Why It Matters\nThis book is significant for its positive and relatable portrayal of characters on the autism spectrum (though never explicitly labeled). It matters because it shifts the focus from 'disability' to a unique, often beneficial way of seeing the world. For readers, it’s a masterclass in voice and character development, showing how a rigid worldview can be softened by a genuine connection. It challenges our ideas of what a 'perfect partner' looks like, reminding us that compatibility isn't about matching checkboxes, but about how two people help each other grow. It is a feel-good read that also provides deep insights into the logic of human relationships.\n\n### The Final Takeaway\nLove doesn't follow a logical questionnaire. Sometimes the person who is most 'wrong' on paper is the one who is most 'right' for your life. Acceptance—of yourself and others—is the ultimate formula for happiness.",
      "keyInsights": [
        { "title": "The Fallacy of the Perfect Partner", "explanation": "Don't search for a mirror image of your own habits. True partnership often involves complementary differences that allow both people to expand their worldviews.", "example": "Rosie forces Don to improvise and adapt, which ultimately makes him more resilient and happy.", "impact": "Prevents rigid expectations in dating." },
        { "title": "Neurodiversity as a Superpower", "explanation": "Don's logical, detail-oriented brain makes him an exceptional scientist. While he struggles with social cues, his honesty and dedication are his greatest strengths.", "example": "Don's ability to efficiently organize complex data helps Rosie solve the mystery of her parentage.", "impact": "Promotes acceptance of diverse cognitive styles." },
        { "title": "The Power of Adaptation", "explanation": "Even the most rigid person can change when they find a motivation that is stronger than their fear of chaos. Love is a powerful catalyst for neuroplasticity.", "example": "Don learning to dance and socialise to win over Rosie.", "impact": "Encourages personal growth at any age." }
      ],
      "chapters": [
        { "number": 1, "title": "The Wife Project", "summary": "Don Tillman launches his scientific search for a compatible mate, filtering out the 'unsuitable'." },
        { "number": 2, "title": "The Father Project", "summary": " Rosie enters Don's life, and they embark on a quest to find her biological father using DNA testing." },
        { "number": 3, "title": "Social Experiments", "summary": "Don navigates various social situations (like a cocktail party) with varying degrees of success and comedy." },
        { "number": 4, "title": "The Discovery", "summary": "Don realizes that his feelings for Rosie are more important than his data, leading to a romantic and logical conclusion." }
      ],
      "quotes": [
        "I may find it difficult to understand social cues, but I am excellent at genetics.",
        "Humans often fail to see what is right in front of them because they are looking for something else.",
        "Rosie is the world's most incompatible woman. And I am in love with her."
      ],
      "actionItems": [
        "Challenge one of your rigid daily routines this week by doing something spontaneous.",
        "List three things you previously considered 'deal-breakers' in a partner and rethink them.",
        "Perform a small act of service for someone whose personality is the opposite of yours."
      ]
    },
    "de": {
      "summary": "Graeme Simsions 'Das Rosie-Projekt' ist ein humorvoller und herzerwärmender Roman über Don Tillman, einen brillanten, aber sozial unbeholfenen Genetik-Professor, der beschließt, dass es Zeit zum Heiraten ist. Er entwickelt das 'Ehefrau-Projekt' – einen 16-seitigen Fragebogen, um alle unpünktlichen oder unlogischen Kandidatinnen auszusortieren. Dann trifft er auf Rosie Jarman, die absolut nicht in sein Raster passt: Sie ist chaotisch, raucht und ist völlig unplanbar. Doch während Don ihr hilft, ihren leiblichen Vater zu finden, lernt er, dass die Liebe keinem Algorithmus folgt. Das Buch ist eine wunderbare Feier der Neurodiversität und der Unvorhersehbarkeit des Lebens.\n\n### Warum es wichtig ist\nDas Buch bietet eine erfrischende Perspektive auf Charaktere, die die Welt 'anders' sehen (oft mit dem Asperger-Syndrom assoziiert). Es zeigt, dass Eigenheiten keine Hindernisse für tiefe Bindungen sein müssen, sondern oft eine Bereicherung darstellen. Es erinnert uns daran, dass Kompatibilität nicht darin besteht, Kästchen anzukreuzen, sondern darin, wie zwei Menschen sich gegenseitig ergänzen und stützen.\n\n### Die zentrale Erkenntnis\nLiebe lässt sich nicht berechnen. Oft ist die Person, die auf dem Papier am 'falschesten' erscheint, genau diejenige, die dein Leben vervollständigt.",
      "keyInsights": [
        { "title": "Der Irrtum des perfekten Partners", "explanation": "Suche nicht nach einer Kopie deiner selbst. Wahre Partnerschaft wächst durch Unterschiede, die uns herausfordern.", "example": "Rosie zwingt Don zur Improvisation, was ihn letztlich glücklicher macht.", "impact": "Verhindert zu starre Erwartungen in der Partnerwahl." },
        { "title": "Andere Denkweisen als Stärke", "explanation": "Dons logischer Verstand macht ihn zu einem exzellenten Wissenschaftler. Seine Ehrlichkeit ist seine größte Tugend.", "example": "Seine strukturierte Art hilft Rosie, das Geheimnis ihrer Herkunft zu lüften.", "impact": "Fördert die Akzeptanz von Vielfalt." }
      ],
      "chapters": [
        { "number": 1, "title": "Das Ehefrau-Projekt", "summary": "Don startet seine wissenschaftliche Suche nach der idealen Frau." },
        { "number": 2, "title": "Das Vater-Projekt", "summary": "Don und Rosie suchen gemeinsam nach ihrem leiblichen Vater." },
        { "number": 3, "title": "Gefühle vs. Logik", "summary": "Don erkennt, dass Daten nicht alles sind, wenn es um das Herz geht." }
      ],
      "quotes": [
        "Ich verstehe soziale Signale vielleicht nicht, aber in Genetik bin ich exzellent.",
        "Rosie ist die unpassendste Frau der Welt. Und ich liebe sie."
      ],
      "actionItems": [
        "Durchbrechen Sie diese Woche eine feste Gewohnheit und tun Sie etwas Spontanes.",
        "Hinterfragen Sie ein Vorurteil, das Sie gegenüber jemandem haben, der 'anders' denkt."
      ]
    }
  },
  "The Rosie Effect": {
    "en": {
      "summary": "In the sequel *The Rosie Effect*, Don and Rosie are now married and living in New York. The ultimate test of Don's structured life arrives when Rosie announces she is pregnant. Don, in his typical fashion, approaches fatherhood as a series of technical challenges to be mastered, creating 'The Budding Project' to research every possible aspect of child-rearing. However, his secret research and logical approach to emotional problems lead to a series of misunderstandings that threaten his marriage. The novel explores the stressors of early parenthood and the continued journey of a neurodiverse individual navigating the complex waters of adult responsibility.\n\n### Why It Matters\nThis book is a realistic look at how major life changes can destabilize even the most solid relationships. It matters because it humanizes the anxiety that many first-time parents feel, but through a unique, hyper-logical lens. It highlights the importance of honesty and communication over 'solving' problems behind a partner's back. For readers, it’s a lesson in the difference between preparation and presence—showing that being a good partner means showing up emotionally, not just having the best plan.\n\n### The Final Takeaway\nYou cannot research your way out of the chaos of parenthood. Being a father (and a husband) is about connection, not just information. Sometimes the best plan is to simply listen to the person you love.",
      "keyInsights": [
        { "title": "Preparation vs. Presence", "explanation": "No amount of academic research can replace being emotionally available for your partner during a crisis. Plans are good, but empathy is better.", "example": "Don's secret research on pregnancy causes Rosie to feel isolated and untrusted.", "impact": "Improves relationship communication." },
        { "title": "The Fear of Failure in Parenting", "explanation": "The pressure to be a 'perfect' parent often leads to over-thinking and stress. Acceptance of one's own limitations is key to a healthy family dynamic.", "example": "Don's obsession with avoiding every possible risk to the baby.", "impact": "Reduces parental anxiety." }
      ],
      "chapters": [
        { "number": 1, "title": "The Announcement", "summary": "Rosie is pregnant, and Don's world of carefully managed risks is upended." },
        { "number": 2, "title": "New York Complications", "summary": "Navigating the high-stakes world of New York academia while preparing for a baby." },
        { "number": 3, "title": "The Breaking Point", "summary": "Don's secrets lead to a crisis in his marriage and a near-arrest for his unusual research methods." },
        { "number": 4, "title": "The Reset", "summary": "Don learns that he must prioritize Rosie's emotional needs over his logical solutions to find harmony again." }
      ],
      "quotes": [
        "Parenthood is a biological process that is remarkably resistant to logic.",
        "I was focused on the baby. I forgot about the mother.",
        "Everything was under control. Until it wasn't."
      ],
      "actionItems": [
        "Identify one project you are keeping secret from your partner and share it today.",
        "Practice 'active listening' without trying to solve the problem for 10 minutes.",
        "Acknowledge one fear you have about a major life change coming up."
      ]
    },
    "de": {
      "summary": "In 'Die Rosie-Effekt' sind Don und Rosie verheiratet und leben in New York. Die größte Herausforderung für Dons strukturiertes Leben tritt ein, als Rosie schwanger wird. Don nähert sich der Vaterschaft auf seine typische Weise: als eine Kette von technischen Problemen, die gelöst werden müssen. Er gründet 'Das Knospen-Projekt', um jedes Detail der Kindererziehung zu beforschen. Doch sein logischer Ansatz und seine heimlichen Recherchen führen zu massiven Missverständnissen, die seine Ehe gefährden. Der Roman thematisiert den Stress der frühen Elternschaft und den lebenslangen Lernprozess eines neurodiversen Menschen in einer Welt der Gefühle.\n\n### Warum es wichtig ist\nDas Buch zeigt realistisch, wie große Lebensumbrüche selbst stabilste Beziehungen belasten können. Es ist wichtig, weil es die Ängste werdender Eltern durch eine einzigartige, hyper-logische Linse betrachtet. Es betont die Wichtigkeit von Offenheit und Kommunikation gegenüber dem Versuch, Probleme 'hinter dem Rücken' des Partners zu lösen. Es ist eine Lektion darin, dass man als Partner emotional präsent sein muss, nicht nur bestens informiert.\n\n### Die zentrale Erkenntnis\nMan kann sich nicht aus dem Chaos der Elternschaft 'herausforschen'. Vatersein ist eine Frage der Verbindung, nicht nur der Information.",
      "keyInsights": [
        { "title": "Vorbereitung vs. Präsenz", "explanation": "Keine Studie ersetzt die emotionale Verfügbarkeit für den Partner. Pläne sind gut, Empathie ist besser.", "example": "Dons heimliches Forschen führt dazu, dass Rosie sich isoliert fühlt.", "impact": "Verbessert die Beziehungsdynamik." }
      ],
      "chapters": [
        { "number": 1, "title": "Die Nachricht", "summary": "Rosie ist schwanger und Dons Welt der Risiko-Minimierung steht Kopf." },
        { "number": 2, "title": "Chaos in New York", "summary": "Dons Versuche, die Vaterschaft wissenschaftlich zu meistern, führen zu absurden Situationen." }
      ],
      "quotes": [
        "Vaterschaft ist ein biologischer Prozess, der weitgehend resistent gegen Logik ist.",
        "Ich war auf das Baby konzentriert. Ich habe die Mutter vergessen."
      ],
      "actionItems": [
        "Sprechen Sie heute mit Ihrem Partner über eine Sorge, die Sie bisher für sich behalten haben.",
        "Hören Sie einfach nur zu, ohne sofort eine Lösung anzubieten."
      ]
    }
  },
  "The Rosie Result": {
    "en": {
      "summary": "The final book in the trilogy, *The Rosie Result*, sees Don, Rosie, and their eleven-year-old son Hudson moving back to Australia. Hudson is struggling with fitting in at school, and Don recognizes many of his own traits in his son. He decides to create 'The Hudson Project'—a series of methods to help Hudson navigate a world that isn't built for people like them. However, as Don tries to optimize his son's life, he is forced to confront the fundamental question: Is there something wrong with Hudson, or is there something wrong with the society that refuses to accommodate him? The novel is a powerful conclusion that moves beyond comedy to tackle the deeper and more emotional issues of parenting in the context of neurodiversity.\n\n### Why It Matters\n*The Rosie Result* is a crucial read for parents, educators, and anyone interested in the social model of disability. It matters because it shifts the focus from 'fixing' the individual to building a more inclusive and understanding world. For readers, it’s a moving exploration of the fear every parent has of their child being 'different' and the even more powerful love that drives them to protect that difference. It explores themes of identity, labels, and the ethical implications of seeking a diagnosis. It is the most mature and impactful book in the series, providing a satisfying and meaningful wrap-up to the Tillman family saga.\n\n### The Final Takeaway\nYour child doesn't need to be 'fixed'; they need to be understood. Mastery is not about conforming to the world, but about having the support and self-knowledge to navigate the world on your own terms. True resilience comes from a deep sense of self-worth and a community that accepts you as you are.",
      "keyInsights": [
        { "title": "The Social Model of Disability", "explanation": "It's not Hudson's brain that is 'the problem,' but the school environment and social expectations that don't allow him to thrive. True solutions focus on shifting the environment, not just the person.", "example": "Don finding alternative school settings that value Hudson's unique way of learning.", "impact": "Sparks advocacy for inclusivity." },
        { "title": "Self-Knowledge is Freedom", "explanation": "Knowing your own cognitive 'operating system'—the strengths and the quirks—is the first step toward living a successful and happy life. Labels can be powerful tools of self-understanding, but they are not the whole story.", "example": "Don and Hudson sharing a moment of clear understanding about how their minds work during a difficult social situation.", "impact": "Empowers people with neurodiversity to own their identity." },
        { "title": "Parental Love and Acceptance", "explanation": "The ultimate test for a parent is to accept a child for who they are, not for who you want them to be. Love means letting go of the 'perfect' vision to embrace the 'real' child.", "example": "Don realizing that Hudson doesn't need to be his mini-me, but his own person.", "impact": "Deepens the bond between parents and unconventional children." }
      ],
      "chapters": [
        { "number": 1, "title": "Australia Again", "summary": "The family returns to Melbourne and Hudson faces the challenges of a new school." },
        { "number": 2, "title": "The Glass Office", "summary": "Don creates a new business to help Hudson and himself while navigating academic politics." },
        { "number": 3, "title": "The Diagnosis Debate", "summary": "Don and Rosie struggle with whether and how to seek a formal label for Hudson." },
        { "number": 4, "title": "The Results", "summary": "The family finds a new balance, proving that neurodiversity is a gift when the right support is in place." }
      ],
      "quotes": [
        "Is there something wrong with identifying a problem if that is the first step to solving it?",
        "Hudson is not a project. He is my son.",
        "There is no one right way to be a human being."
      ],
      "actionItems": [
        "Read one article on the 'social model of disability' today.",
        "Identify one area where you are trying to 'fix' someone rather than understanding them.",
        "Write down three strengths of someone you previously viewed as 'difficult'."
      ]
    },
    "de": {
      "summary": "Im abschließenden Teil der Trilogie, 'Das Rosie-Resultat', ziehen Don, Rosie und ihr elfjähriger Sohn Hudson zurück nach Australien. Hudson hat Schwierigkeiten, sich in der Schule anzupassen, und Don erkennt seine eigenen Züge in seinem Sohn wieder. Er startet 'Das Hudson-Projekt' – eine Sammlung von Methoden, um seinem Sohn zu helfen, in einer Welt zurechtzukommen, die nicht für Menschen wie sie gemacht ist. Doch Don muss sich fragen: Stimmt etwas mit Hudson nicht, oder stimmt etwas mit der Gesellschaft nicht, die ihn nicht akzeptiert? Der Roman ist ein kraftvoller Abschluss, der tiefgehende Fragen zu Identität, Etiketten und Inklusion aufwirft.\n\n### Warum es wichtig ist\n'Das Rosie-Resultat' ist ein wichtiges Buch für Eltern, Lehrer und alle, die sich für das Thema Inklusion interessieren. Es ist wichtig, weil es zeigt, dass es nicht darum geht, das Kind zu 'reparieren', sondern eine Welt zu schaffen, in der es sich entfalten kann. Es ist eine berührende Erzählung über die Angst vor dem 'Anderssein' und die Kraft der bedingungslosen Liebe. Es thematisiert den Wert von Selbstkenntnis und die ethischen Fragen rund um Diagnosen.\n\n### Die zentrale Erkenntnis\nDein Kind muss nicht 'geheilt' werden; es muss verstanden werden. Resilience entsteht durch Selbstvertrauen und eine Gemeinschaft, die dich so annimmt, wie du bist.",
      "keyInsights": [
        { "title": "Das soziale Modell von Behinderung", "explanation": "Nicht Hudsons Denken ist das Problem, sondern das Umfeld, das ihn nicht versteht. Echte Lösungen verändern das System, nicht nur das Individuum.", "example": "Don sucht Schulen, die Hudsons einzigartige Art zu lernen schätzen.", "impact": "Fördert Inklusionsbemühungen." }
      ],
      "chapters": [
        { "number": 1, "title": "Zurück in Australien", "summary": "Der Umzug nach Melbourne und Hudsons Schwierigkeiten in der neuen Schule." },
        { "number": 2, "title": "Das neue Projekt", "summary": "Don versucht Hudson beizubringen, wie man sich sozial 'tarnen' kann, bevor er lernt, dass Authentizität wichtiger ist." }
      ],
      "quotes": [
        "Hudson ist kein Projekt. Er ist mein Sohn.",
        "Es gibt nicht den einen richtigen Weg, ein Mensch zu sein."
      ],
      "actionItems": [
        "Informieren Sie sich über neurodivergente Denkweisen.",
        "Fragen Sie sich: Versuche ich jemanden zu belehren oder zu verstehen?"
      ]
    }
  }
};

async function injectExpansions() {
  console.log('--- STARTING MANUAL INJECTION BATCH 2 (ROSIE) ---');
  
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
