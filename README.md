# ValleyNote

AI-powered notebook SaaS by **Moonlight Valley LLC** (`valleynote.com`).

Built from the ValleyNote Technical Brief on top of the Botwise landing design system (colors, fonts, layout, assets). Landing copy is ValleyNote; image assets stay as placeholders until brand art is provided.

## Stack

- Next.js 16 (App Router) + TypeScript
- PostgreSQL 16 + pgvector
- Redis
- Better Auth (email/password)
- Prisma 7
- Tailwind CSS (Botwise tokens)

## Local setup

```bash
npm install
cp .env.example .env   # if needed
npm run db:up          # Postgres :5433, Redis :6380
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Useful scripts

| Script | Purpose |
|--------|---------|
| `npm run db:up` | Start Postgres + Redis via Docker Compose |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:studio` | Prisma Studio |
| `npm run build` | Generate client + production build |

## Milestone status

1. **Setup** — Docker, DB, auth, settings shell, landing copy ✅
2. **Notebook core** — editor, notebooks, tags, search, images, video embeds, voice notes ✅
3. **AI v1** — writing assistant, summarize, quotas, auto-title/tag/tasks ✅
4. **RAG** — embeddings on save, hybrid Ask my notes, persisted chat ✅
5. Billing — Whop embedded checkout + plan limits UI
6. Polish — sharing, export, admin
7. Hardening — backups, tests, production deploy

### AI extras

```bash
npm run ai:reindex   # backfill note embeddings (needs OPENROUTER_API_KEY or OPENAI_API_KEY)
```

Set `AI_TRANSCRIPTION_MODEL` (default `openai/whisper-1`) for voice notes.

## Design rules

- Keep Botwise layout / colors / fonts / animations.
- Change landing **text** only; leave image assets until replacements are provided.
- Hide fake stats and testimonials until real data exists.
