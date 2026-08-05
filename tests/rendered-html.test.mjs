import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Imprintly entry flow", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Imprintly – Impressum einfach erstellen<\/title>/i);
  assert.match(html, /Von Ihrer Website zum fertigen Impressum/);
  assert.match(html, /Welche Website sollen wir prüfen/);
  assert.match(html, /Website prüfen/);
  assert.match(html, /Kein Ersatz für eine Rechtsberatung/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("keeps API credentials server-side and uses a two-pass AI audit", async () => {
  const [page, route, envExample] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/analyze/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../.env.example", import.meta.url), "utf8"),
  ]);

  assert.match(page, /questionPlan/);
  assert.match(page, /KI-Prüfung des Fragenkatalogs/);
  assert.match(route, /website_business_dossier/);
  assert.match(route, /adaptive_imprint_question_plan/);
  assert.match(route, /criticalConfirmationFields/);
  assert.match(route, /AI Gateway analysis failed/);
  assert.match(envExample, /^OPENAI_API_KEY=$/m);
  assert.doesNotMatch(page, /OPENAI_API_KEY|AI_GATEWAY_API_KEY/);
  assert.doesNotMatch(route, /sk-proj-|NEXT_PUBLIC_OPENAI/i);
});
