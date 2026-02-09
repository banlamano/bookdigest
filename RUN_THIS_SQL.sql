-- Run this SQL in Render PostgreSQL database console
-- This will update all 18 books with AI-generated covers

UPDATE "Book" SET "coverImage" = '/ai-covers/74b0d5dc-6350-4b6e-9f44-39a66ff0c360.svg' WHERE id = '74b0d5dc-6350-4b6e-9f44-39a66ff0c360';
UPDATE "Book" SET "coverImage" = '/ai-covers/9abe3264-bb5c-4102-840c-8c1c21d2bf50.svg' WHERE id = '9abe3264-bb5c-4102-840c-8c1c21d2bf50';
UPDATE "Book" SET "coverImage" = '/ai-covers/b9066e33-441c-4efc-b0f8-4ed1a1332ea5.svg' WHERE id = 'b9066e33-441c-4efc-b0f8-4ed1a1332ea5';
UPDATE "Book" SET "coverImage" = '/ai-covers/ce14c6a7-6f8d-4d37-94d3-ca941942aa92.svg' WHERE id = 'ce14c6a7-6f8d-4d37-94d3-ca941942aa92';
UPDATE "Book" SET "coverImage" = '/ai-covers/641592d1-cf3a-4bea-ae4b-88ae283b40d5.svg' WHERE id = '641592d1-cf3a-4bea-ae4b-88ae283b40d5';
UPDATE "Book" SET "coverImage" = '/ai-covers/69611b75-ac8c-4a74-991c-946cde526044.svg' WHERE id = '69611b75-ac8c-4a74-991c-946cde526044';
UPDATE "Book" SET "coverImage" = '/ai-covers/0365165a-d499-4b47-9573-255c1dbe4ef4.svg' WHERE id = '0365165a-d499-4b47-9573-255c1dbe4ef4';
UPDATE "Book" SET "coverImage" = '/ai-covers/49b84f81-5286-4cc1-85fd-7302f20bfd9b.svg' WHERE id = '49b84f81-5286-4cc1-85fd-7302f20bfd9b';
UPDATE "Book" SET "coverImage" = '/ai-covers/74826407-8576-435c-bf77-80f497139c38.svg' WHERE id = '74826407-8576-435c-bf77-80f497139c38';
UPDATE "Book" SET "coverImage" = '/ai-covers/6295da35-0ecb-4f2c-82c7-921ed0ed428b.svg' WHERE id = '6295da35-0ecb-4f2c-82c7-921ed0ed428b';
UPDATE "Book" SET "coverImage" = '/ai-covers/89caadae-e349-4ecf-96c1-1046c832023d.svg' WHERE id = '89caadae-e349-4ecf-96c1-1046c832023d';
UPDATE "Book" SET "coverImage" = '/ai-covers/295f79b1-15bf-4ddb-88ff-bd804c497832.svg' WHERE id = '295f79b1-15bf-4ddb-88ff-bd804c497832';
UPDATE "Book" SET "coverImage" = '/ai-covers/0955331c-c786-4bad-8d73-2ab939c9a23d.svg' WHERE id = '0955331c-c786-4bad-8d73-2ab939c9a23d';
UPDATE "Book" SET "coverImage" = '/ai-covers/6cbb6b83-d106-413d-95f9-d5284a657726.svg' WHERE id = '6cbb6b83-d106-413d-95f9-d5284a657726';
UPDATE "Book" SET "coverImage" = '/ai-covers/3d9478ab-9967-4311-a2d4-039dd0fcf02c.svg' WHERE id = '3d9478ab-9967-4311-a2d4-039dd0fcf02c';
UPDATE "Book" SET "coverImage" = '/ai-covers/e6156973-00f0-4a0a-be4e-086c3a58b577.svg' WHERE id = 'e6156973-00f0-4a0a-be4e-086c3a58b577';
UPDATE "Book" SET "coverImage" = '/ai-covers/c1eb086f-b794-4a47-825a-a182ae2f3bb6.svg' WHERE id = 'c1eb086f-b794-4a47-825a-a182ae2f3bb6';
UPDATE "Book" SET "coverImage" = '/ai-covers/d70edb81-256b-43e2-9b70-7ab9bed02645.svg' WHERE id = 'd70edb81-256b-43e2-9b70-7ab9bed02645';

-- Verify the updates
SELECT id, title, author, "coverImage" 
FROM "Book" 
WHERE "coverImage" LIKE '/ai-covers/%';
