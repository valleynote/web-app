-- Ensure extensions (also created via docker init.sql on fresh volumes)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Full-text search support on notes
ALTER TABLE "note" ADD COLUMN IF NOT EXISTS "searchVector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce("contentText", '')), 'B')
  ) STORED;

CREATE INDEX IF NOT EXISTS note_search_vector_idx ON "note" USING GIN ("searchVector");

-- Vector similarity index for RAG
CREATE INDEX IF NOT EXISTS note_chunk_embedding_hnsw
  ON note_chunk
  USING hnsw (embedding vector_cosine_ops);
