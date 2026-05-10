import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const chaptersData: Record<string, any[]> = {
  "The Giver of Stars": [
    {
      "number": 1,
      "title": "Der Beginn einer neuen Reise",
      "summary": "Alice Wright, gebürtige Engländerin, versucht der erdrückenden Atmosphäre ihres Elternhauses zu entfliehen, indem sie den wohlhabenden und attraktiven Amerikaner Bennett Van Cleve heiratet. Sie hofft auf ein aufregendes neues Leben in den Vereinigten Staaten. Doch nach ihrer Ankunft in Baileyville, einer isolierten und vom Bergbau geprägten Kleinstadt in Kentucky, stellt sie schnell fest, dass die Realität weit von ihren Träumen entfernt ist. Ihr neues Zuhause wird von Bennetts dominantem und tyrannischem Vater kontrolliert, der jeden Aspekt ihres Lebens bestimmt. Die erhoffte Freiheit bleibt aus, stattdessen findet sich Alice in einer fremden Umgebung wieder, in der sie zunehmend vereinsamt und sich in der Ehe mit dem emotional distanzierten Bennett gefangen fühlt."
    },
    {
      "number": 2,
      "title": "Die Packhorse Librarians",
      "summary": "Mitten in ihrer Verzweiflung erfährt Alice von einem neuen Projekt der WPA (Works Progress Administration) unter der Regierung Roosevelt: der fahrenden Bibliothek (Packhorse Library Project). Sie meldet sich kurzerhand als ehrenamtliche Bibliothekarin, sehr zum Missfallen ihres Schwiegervaters. Dort lernt sie Margery O’Hare kennen, eine starke, unabhängige und rebellische Frau, die sich den strengen Konventionen der patriarchalischen Gesellschaft in Kentucky widersetzt. Margery wird nicht nur zur treibenden Kraft des Projekts, sondern auch zu einer wichtigen Freundin für Alice. Durch die Arbeit und das Reiten auf Pferden und Maultieren, um Bücher in die entlegensten und ärmsten Gebiete der Appalachen zu bringen, entdeckt Alice eine neue Form der Selbstbestimmtheit."
    },
    {
      "number": 3,
      "title": "Unterschiedliche Frauen, gemeinsames Ziel",
      "summary": "Das Team der fahrenden Bibliothek wächst und es schließen sich weitere Frauen an, die alle aus sehr unterschiedlichen Lebenssituationen kommen. Neben Alice und Margery gehören auch Beth, die aus armen Verhältnissen stammt, Izzy, die wegen einer Behinderung oft gemieden wird, und Sophia, eine gebildete schwarze Frau, zur Gruppe. In den stark rassistisch geprägten und segregierten Südstaaten ist die Zusammenarbeit mit Sophia ein mutiger Schritt, der Margerys starke Überzeugungen unterstreicht. Die Frauen lernen, trotz ihrer verschiedenen Hintergründe und der anfänglichen Skepsis, zusammenzuarbeiten. Die Bibliothek wird zu einem Zufluchtsort für sie, an dem sie nicht nur Bücher sortieren, sondern auch eine tiefe, unverbrüchliche Schwesternschaft und Solidarität aufbauen."
    },
    {
      "number": 4,
      "title": "Der Kampf gegen Vorurteile",
      "summary": "Während das Projekt erste Erfolge feiert und den Menschen in den Bergen Zugang zu Wissen und Geschichten verschafft, stößt die fahrende Bibliothek auf massiven Widerstand in Baileyville. Konservative Kräfte im Dorf, angeführt von Alices mächtigem Schwiegervater Mr. Van Cleve, sehen in der Bildung der einfachen Leute, insbesondere der Frauen und Minderheiten, eine direkte Bedrohung ihrer Machtstrukturen. Sie beginnen, das Projekt öffentlich zu diskreditieren und argumentieren, dass Bücher wie ein bestimmtes medizinisches Aufklärungsbuch obszön und moralisch schädlich seien. Die Bibliothekarinnen müssen sich gegen sexistische Anfeindungen, Rassismus und Verleumdungskampagnen wehren, was ihren Zusammenhalt jedoch nur weiter stärkt."
    },
    {
      "number": 5,
      "title": "Glaube, Bildung und Freiheit",
      "summary": "Die Fahrten in die Berge sind hart und oft gefährlich. Die Frauen müssen tückische Wetterbedingungen bewältigen, wilde Flüsse überqueren und sich gegenüber misstrauischen Bergbewohnern behaupten. Dennoch erleben sie hautnah die transformative Kraft der Literatur. Sie bringen nicht nur klassische Romane oder Kochrezepte zu den Menschen, sondern auch Hoffnung, Trost und das Gefühl, nicht vergessen worden zu sein. Für viele isolierte Familien sind die Bibliothekarinnen der einzige Kontakt zur Außenwelt. Alice lernt auf diesen Ritten Rachels und andere hilfsbedürftige Menschen kennen. Sie versteht nun, dass Freiheit nicht nur ein geografischer Ort ist, sondern maßgeblich durch Wissen, Bildung und freies Denken entsteht."
    },
    {
      "number": 6,
      "title": "Die Krise und ein furchtbares Verbrechen",
      "summary": "Die angespannte Situation in Baileyville eskaliert nach einer Reihe dramatischer Ereignisse im Bergwerk, das der Van Cleve Familie gehört. Gleichzeitig gerät Margery ins Visier der Justiz: Ein stadtbekannter Mann wird tot aufgefunden, und Margery, die für ihr aufrührerisches Verhalten bekannt ist, wird des Mordes beschuldigt. Die Beweislage scheint durch gezielte Falschaussagen und Korruption stark gegen sie manipuliert zu sein. Da Margery auch noch unverheiratet schwanger ist, richtet sich der moralische Zorn der konservativen Dorfbevölkerung noch härter gegen sie. Margery kommt ins Gefängnis und steht vor einem Prozess, der ihr das Leben oder zumindest die Freiheit kosten könnte, was das Bibliotheksteam schwer trifft."
    },
    {
      "number": 7,
      "title": "Zusammenhalt in der Dunkelheit",
      "summary": "Alice, Beth, Sophia und Izzy sind gezwungen, die Bibliothek unter widrigsten Umständen am Laufen zu halten, während sie gleichzeitig alles daransetzen, ihre Freundin Margery zu retten. Alice bricht endgültig mit ihrem Ehemann Bennett und verlässt das Van Cleve Anwesen, womit sie jeglichen finanziellen und gesellschaftlichen Schutz aufgibt. Ein junger Anwalt nimmt sich Margerys Fall an, doch die Vorurteile der Jury scheinen unüberwindbar. Während des Prozesses wird nicht nur Margerys Leben auf den Prüfstand gestellt, sondern auch die Unabhängigkeitsbestrebungen aller Bibliothekarinnen. Die Frauen beweisen außergewöhnlichen Mut, sich gegen das Patriarchat und die korrupten Machenschaften der Bergwerksbesitzer zu erheben."
    },
    {
      "number": 8,
      "title": "Gerechtigkeit und Neuanfang",
      "summary": "In einem spannungsgeladenen Gerichtsverfahren kommt durch intensive Recherchearbeit und den unerwarteten Mut bisher stiller Zeugen die wahre Todesursache des Mannes ans Licht. Margery wird im letzten Moment freigesprochen und das Netz aus Lügen und Erpressung der Familie Van Cleve bricht zusammen. Mit dem Freispruch festigt sich nicht nur Margerys Freiheit, sondern auch die Position der fahrenden Bibliothek in der Gemeinde. Alice erkennt, dass Kentucky nun ihre wahre Heimat geworden ist und sie hier – umgeben von echten Freunden und einer sinnvollen Aufgabe – das erfüllte Leben gefunden hat, das sie in England immer gesucht hatte. Die Geschichte endet mit einem hoffnungsvollen Ausblick auf die bleibende Macht von Büchern und Freundschaft."
    }
  ],
  "So Good They Can't Ignore You": [
    {
      "number": 1,
      "title": "Die Leidenschafts-Hypothese ist falsch",
      "summary": "Im ersten Kapitel des Buches demontiert Cal Newport konsequent eine der populärsten Karriere-Empfehlungen unserer Zeit: 'Folge stets deiner Leidenschaft'. Newport bezeichnet dies als die 'Leidenschafts-Hypothese' und argumentiert anhand von Studien und realen Beispielen, dass sie nicht nur inkorrekt, sondern extrem gefährlich für die Karriereplanung ist. Menschen, die in ihren Job einsteigen, mit der festen Überzeugung, sofort eine tiefe Passion spüren zu müssen, sind oft ungeduldig, schnell frustriert und wechseln ständig den Arbeitsplatz. Er zeigt auf, dass echtes, anhaltendes Interesse an einer Arbeit meist erst im Laufe der Zeit durch wachsende Kompetenz und Erfolgserlebnisse entsteht, anstatt eine intrinsische, von Anfang an vorhandene magische Eigenschaft zu sein. Seine Schlussfolgerung: Hören Sie auf, sich zu fragen, was die Welt für Sie und Ihre Leidenschaft tun kann."
    },
    {
      "number": 2,
      "title": "Werden Sie so gut, dass man Sie nicht ignorieren kann",
      "summary": "Newport schlägt eine grundlegende Veränderung der mentalen Einstellung vor: Weg vom 'Leidenschafts-Mindset' (What can the world offer me?) hin zum 'Handwerker-Mindset' (What can I offer the world?). Die Handwerker-Mentalität fokussiert sich unermüdlich auf den Wert, den man produziert. Indem man sich darauf konzentriert, in seiner Tätigkeit erstklassige Arbeit zu leisten und kontinuierlich besser zu werden, erzeugt man automatisch berufliches Kapital. Der Titel des Buches stammt vom Komiker Steve Martin, dessen Ratschlag an angehende Entertainer war: 'Sei einfach so unfassbar gut, dass sie dich nicht länger ignorieren können.' Dieses unerbittliche Streben nach beruflicher Exzellenz schützt davor, sich in Träumereien über den perfekten Job zu verlieren und zwingt einen stattdessen in die produktive Realität harter Arbeit."
    },
    {
      "number": 3,
      "title": "Der Aufbau von Karriere-Kapital (Career Capital)",
      "summary": "Die grundlegende These dieses Kapitels ist, dass großartige berufliche Eigenschaften – wie extreme Autonomie, Kreativität, finanzielle Unabhängigkeit und Einfluss – selten und extrem wertvoll sind. Nach den simplen Gesetzen von Angebot und Nachfrage muss man, um diese wertvollen Dinge zu erhalten, etwas von gleichem Wert im Tausch anbieten. Dieses 'Tauschmittel' nennt Newport 'Karriere-Kapital'. Karriere-Kapital besteht aus seltenen und wertvollen Fähigkeiten. Wenn man durch intensives Lernen, stundenlange harte Arbeit und Praxis in einem bestimmten Bereich hochgradig spezialisiert wird, häuft man dieses Kapital an. Zuerst müssen diese Fähigkeiten aufgebaut werden, erst danach kann dieses hart erarbeitete Kapital eingesetzt werden, um die Konditionen des eigenen Traumjobs aktiv zu gestalten."
    },
    {
      "number": 4,
      "title": "Die Bedeutung der bewussten Praxis (Deliberate Practice)",
      "summary": "Um Karriere-Kapital aufzubauen, reicht es nicht aus, einfach nur viel Zeit abzusitzen oder routinehafte Aufgaben auszuführen. Newport stützt sich auf die Erkenntnisse der Expertiseforschung (insbesondere von K. Anders Ericsson) und betont die unbedingte Notwendigkeit von 'Deliberate Practice' (Bewusstem Üben). Das bedeutet, dass man seine eigene Komfortzone regelmäßig und gezielt verlassen muss. Man muss sich auf seine Schwächen konzentrieren, ständiges schonungsloses Feedback einfordern und kognitiv an die absolut möglichen Grenzen gehen. Diese Art des Übens ist oft unangenehm, frustrierend und anstrengend, weshalb die meisten Menschen ihr aus dem Weg gehen. Genau deshalb führt bewusste Praxis zu seltenen und wertvollen Fähigkeiten, die andere nicht besitzen."
    },
    {
      "number": 5,
      "title": "Die Macht der Autonomie auf dem Arbeitsmarkt",
      "summary": "Einer der stärksten Faktoren für berufliche Zufriedenheit ist Kontrolle und Autonomie – also das Recht zu entscheiden, was man tut, wann man es tut und wie man es tut. Newport nennt dies das 'Traumjob-Elixier'. Autonomie ist ein perfektes Beispiel für eine seltene und wertvolle Eigenschaft, die man sich durch angesammeltes Karriere-Kapital 'kaufen' muss. Er führt zahlreiche Beispiele von Programmierern und Managern auf, die aufgrund ihrer überragenden Fähigkeiten so unverzichtbar für ihr Unternehmen geworden waren, dass sie in der Lage waren, radikale Arbeitszeiten oder Remote-Arbeit durchzusetzen. Ohne das ausreichende Karriere-Kapital führt der bloße Wunsch nach Autonomie oft ins finanzielle Desaster."
    },
    {
      "number": 6,
      "title": "Die Kontroll-Fallen, die es zu vermeiden gilt",
      "summary": "Das Streben nach Autonomie und Kontrolle ist nicht ungefährlich. Newport identifiziert zwei wesentliche Kontroll-Fallen (Control Traps). Die erste Falle schnappt zu, wenn jemand versucht, volle Kontrolle oder Selbstständigkeit zu erlangen, bevor er überhaupt genug Karriere-Kapital erworben hat (Beispiel: Ein Hobby-Blogger kündigt seinen Job, ohne dass sein Blog Gewinne abwirft). Die zweite Falle tritt ein, wenn man bereits viel Karriere-Kapital besitzt und nun versucht, dieses gegen mehr Kontrolle einzutauschen. In diesem Moment wird der aktuelle Arbeitgeber oft extrem expansiv und bekämpft den Drang nach Autonomie (da der Mitarbeiter so wertvoll ist). Man muss den Widerstand des Arbeitgebers in dieser Phase aktiv überwinden, ohne sich vom bisherigen Erfolg weichkochen zu lassen."
    },
    {
      "number": 7,
      "title": "Die Suche nach einem übergeordneten Lebenszweck (Mission)",
      "summary": "Eine Mission ist ein vereinigendes, zentrales Ziel für die Karriere. Eine berufliche Mission führt zu Arbeit, die Energie spendet, eine tiefe Bedeutung hat und bemerkenswerte Ergebnisse produziert. Allerdings warnt Newport eindringlich davor, nach einer großen Mission zu suchen oder eine solche zu deklarieren, bevor man die absoluten Grundlagen der eigenen Nische verstanden hat. Relevante, bahnbrechende Missionen entstehen fast immer erst an der 'angrenzenden Möglichen' (Adjacent Possible), dem äußersten Rand der aktuellen Grenze eines Fachgebiets. Man kann diese Grenze nur sehen – und damit großartige Ideen haben –, wenn man zuerst die Jahre harter Arbeit investiert hat, um das Gebiet auf Weltklasse-Niveau zu durchdringen."
    },
    {
      "number": 8,
      "title": "Kleine Wetten und das Purpurkühe-Gesetz",
      "summary": "Sobald man an dem Punkt ist, an dem eine Mission sichtbar wird, gibt Newport sehr operative Strategien für die Umsetzung. Er empfiehlt 'Kleine Wetten' (Little Bets) – kleine, schnelle, extrem fokussierte Experimente, die schnelles Feedback aus der realen Welt liefern und entweder mit einem klaren Erfolg oder Misserfolg enden. Anstatt Jahre in einen großen Masterplan zu stecken, testet man seine Hypothesen kontinuierlich in Wochenprojekten. Darauf aufbauend folgt das 'Gesetz der Bemerkenswerten' (The Law of Remarkability): Ein Projekt im Rahmen einer großen Mission muss so gut und außergewöhnlich gestaltet sein, dass andere Menschen von sich aus den drang haben, positiv darüber zu sprechen. Es muss auf einer Plattform veröffentlicht werden, die die Sichtbarkeit katalysiert. Erst durch diese konsequente Anwendung von Handwerker-Mindset, Karriere-Kapital und kleinen Wetten lässt sich wahre, tiefe berufliche Erfüllung finden."
    }
  ]
};

async function fixChapters() {
  for (const [title, chapters] of Object.entries(chaptersData)) {
    const book = await prisma.book.findFirst({
        where: { title, language: 'de' }
    });
    
    if (book) {
      await prisma.book.update({
        where: { id: book.id },
        data: { chapters }
      });
      console.log(`✅ Fixed chapters for: ${title}`);
    }
  }
}

fixChapters().then(() => prisma.$disconnect());
