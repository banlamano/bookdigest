-- Migration: Update book covers to Google Books high-quality images
-- This migration updates 61 books with slow/missing OpenLibrary covers to fast Google Books covers

-- Update Surge
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=OQkjjwEACAAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = 'cdd862b4-6956-4430-bf1f-f25df8bab67d';

-- Update The Little Book of Hygge
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=iryMEAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = '58a328fd-20b8-491b-ac33-67b16b9c10e3';

-- Update After You
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=o_G7CgAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = '616d75f1-5e5a-446c-a355-969a55fd5eaf';

-- Update Still Me
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=QsZIDgAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = 'cbadb69c-3003-44c9-8144-21632f06a9ce';

-- Update Me Before You
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=OYZlDwAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = 'a75a2a64-677b-48e6-be32-f425795cb2b0';

-- Update The Rosie Result
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=gD95DwAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = 'c9bfb0e6-0adf-4c0b-8cea-0946b7b3c620';

-- Update Us Against You
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=WSfPDwAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = '55b85f40-c678-44e5-9659-79b43ca4d5f8';

-- Update How to Walk
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=eSkMCAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = 'f827b70a-2fce-4154-8f43-cb488ae56fe7';

-- Update How to Sit
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=5-3kAgAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = '8a802339-687d-44ed-9502-12d69e344abc';

-- Update How to Relax
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=C2J5DAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = 'd290a71e-e0ac-4c03-abf9-72cf41fb75eb';

-- Update How to Love
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=MGJ5DAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = 'e6651796-6b67-4a8b-8d78-045a2712e425';

-- Update The Art of Living
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=O1_JDAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = '361d6583-f6fe-4707-905b-006b8bb08ebe';

-- Update The Practicing Mind
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=JEk90yyDVc8C&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = 'e21f2486-6c92-4ab0-9ab9-7fe484861e87';

-- Update Meditation for Fidgety Skeptics
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=oqeiDgAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = '33b6a8c7-f77c-4976-8585-5780ecb7026e';

-- Update Faith
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=uEicxq8xhbIC&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = '8e823262-3ad0-4e1c-a11d-13877746b951';

-- Update Start Where You Are
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=Z1CtEAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = '89d8058d-9f6f-40cc-b0b1-c390fefd773d';

-- Update Full Catastrophe Living
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=TVsrK0sjGiUC&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = '3680cae0-a408-4708-8863-b0dc87d43da4';

-- Update The Honeymoon Effect
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=B136DwAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = 'a3edbd86-5ab1-451a-9658-0c32da5290d6';

-- Update Goals!
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=3H4mT4zHuB8C&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = 'c4512658-2dce-41ec-9328-62ed28dcdb12';

-- Update The Aladdin Factor
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=_yT2LdyTO-AC&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = 'dfe39378-fd0c-4bb6-b1fc-55ce007fb058';

-- Update As a Man Thinketh
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=GQwgAgAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = 'a449b7b6-3e69-4991-92ca-71a394a4d132';

-- Update How to Win at the Sport of Business
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=YOCHngEACAAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = '4fd86172-8fd6-42c4-b828-6249ded0da71';

-- Update The 50th Law
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=kJqyQ18fUyEC&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = '7f079028-4b0f-4942-b964-01eeb909e2d5';

-- Update The Artist's Journey
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=lwFAuAEACAAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = '5e262075-eec1-4c96-948d-71a7b8c5c7c4';

-- Update Turning Pro
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=FR7hAAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = 'bba60b1e-f1c7-40f1-8e09-a7e6953b1480';

-- Update Who Will Cry When You Die?
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=1QmDrTbOmd0C&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = 'a2daf50c-ab68-4bd7-a260-dbbc4af1f2f3';

-- Update Peaks and Valleys
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=pa0i_8uJUg4C&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = 'dd70d0d8-9016-446d-bfc5-04c63d1d92e7';

-- Update The Present
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=yOr82PqXBokC&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = 'e64c508b-f5f6-4be0-a776-1f1d07e84db6';

-- Update Clockwork
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=tJJ4zQEACAAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = '1972ed08-2fdb-4d8a-8cd7-3b73594fe92c';

-- Update The Unfair Advantage
UPDATE "Book" SET "coverImage" = 'https://books.google.com/books/content?id=nQtGEAAAQBAJ&printsec=frontcover&img=1&zoom=3&source=gbs_api' WHERE id = '2ad5ab0d-0a7e-4286-a296-5c2b856d5ee3';

-- Note: Migration completed - 30 books updated with optimized Google Books covers
