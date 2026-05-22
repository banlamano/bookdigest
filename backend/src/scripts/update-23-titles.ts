import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const translations: Record<string, string> = {
  "79e26fe5-e3d3-42cc-baa6-44628141c6bd": "Bogleheads' Leitfaden zum Investieren",
  "522a3210-9716-4ed8-9d2a-df0e68059381": "Die Farbe des Gesetzes",
  "0ccf90c9-7489-440a-bb56-0e8c6ca718d2": "Der Dhandho-Investor",
  "eb3007ba-f1ab-4091-b3d8-2b744f80ed88": "Wie man im Geschäft gewinnt",
  "908215f1-9137-4c28-aafb-d1fdf40d04a3": "1776",
  "619820a7-2746-4b6d-89e2-1f613b4470dc": "Surge: Der Aufschwung",
  "9d8280d5-4917-479a-a18d-cf0ae59cc783": "Play Bigger: Wie Piraten und Träumer Branchen dominieren",
  "72c5f98d-8150-42e3-b886-b9d56d478dcf": "Klein anfangen, klein bleiben",
  "d4fd5e40-377f-40be-b51d-c0c19212abf9": "Die Gaben unperfekter Elternschaft",
  "78b2829d-d199-44c5-958f-fb27bd694714": "Der effektive Manager",
  "f38f88e0-c2a9-4269-b0a7-15949745bb4a": "Sicherheitsmarge",
  "f41d07e0-b4b5-4eb7-abeb-b31f81ca58ac": "Kündigen wie ein Millionär",
  "2ecd0d5c-6844-48a6-9067-ac2ea6e477e9": "Meditation für unruhige Skeptiker",
  "6b40dd45-01e9-4c71-942f-2133f939757e": "Alexander Hamilton",
  "f5f534c1-1501-4365-b680-4ab8942f703c": "The Power: Die Kraft",
  "bafa5884-d41d-483c-96f5-e1e10f221122": "Broke Millennial",
  "310ead9c-820a-466c-affe-0c358a388478": "Die Kunst der Arbeit",
  "33a1723c-a54b-4520-a552-86f9446a5675": "Die Reise des Künstlers",
  "72e39c70-c891-4712-8639-ef337277816f": "Gebrandmarkt",
  "4de3dd4d-ccdd-4a2f-bda5-2c0f5f58858d": "Experten-Geheimnisse",
  "9135852e-d734-474f-9aaf-02e723e7809c": "Der automatische Kunde",
  "b00c5742-1f8a-45b7-9736-3814b8da0ade": "Eine Fülle an gesundem Menschenverstand",
  "c5b898f1-df7c-451d-9234-2d09f41f7d30": "Die Kraft der Verletzlichkeit"
};

async function main() {
  console.log('Updating 23 German titles...');
  for (const [id, germanTitle] of Object.entries(translations)) {
    const book = await prisma.book.findUnique({ where: { id }, select: { title: true } });
    if (book) {
      await prisma.book.update({
        where: { id },
        data: { title: germanTitle }
      });
      console.log(`Updated "${book.title}" -> "${germanTitle}"`);
    }
  }
  console.log('Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
