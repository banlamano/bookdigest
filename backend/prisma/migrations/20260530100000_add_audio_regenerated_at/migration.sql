-- Track which books have been refreshed with the full-content narration
-- composer (summary + insights + chapters + quotes + actions). NULL means
-- the audio is still the old summary-only version. The monthly `next=N`
-- audio script uses this to walk the catalog one batch at a time.

ALTER TABLE "Book"
  ADD COLUMN IF NOT EXISTS "audioRegeneratedAt" TIMESTAMP(3);
