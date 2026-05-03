# AI Backlink Intelligence & Outreach Assistant

React + Vite frontend for an AI-guided backlink planning workflow.

## What works now

- Form-driven backlink generation instead of static cards
- Server-side OpenAI integration through `/api/generate-backlinks`
- Safe fallback mode when `OPENAI_API_KEY` is not configured
- Clear/reset flow for the full workspace
- CSV export, outreach draft modal, filters, and tracker preview

## Environment

Create a local `.env` file from `.env.example` and add:

```bash
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-5.5
```

If `OPENAI_API_KEY` is missing, the app still works in local fallback mode so the UI can be tested end to end.

## Get started

1. Install dependencies:

```bash
npm install
```

2. Run the app:

```bash
npm run dev
```

3. Open the local Vite URL.

## Notes

- The API key is intentionally kept server-side and is never exposed in browser code.
- Generated site metrics and contact routes are planning guidance unless you connect real SEO or crawling data sources later.
