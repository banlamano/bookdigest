-- Add language preference to User and EmailSubscriber so transactional
-- emails can be sent in the language the user chose at signup.

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "language" TEXT NOT NULL DEFAULT 'en';

ALTER TABLE "EmailSubscriber"
  ADD COLUMN IF NOT EXISTS "language" TEXT NOT NULL DEFAULT 'en';
