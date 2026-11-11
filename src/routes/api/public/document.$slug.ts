import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

// Lien fixe vers le document clé (plaquette, grille tarifaire…) d'un membre payant. Le membre peut changer le fichier sans changer sa signature.
export const Route = createFileRoute("/api/public/document/$slug")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        if (!/^[a-z0-9-]{2,60}$/i.test(params.slug)) return new Response("Not found", { status: 404 });
        const sb = createClient(process.env["SUPABASE_URL"] ?? import.meta.env["VITE_SUPABASE_URL"], process.env["SUPABASE_PUBLISHABLE_KEY"] ?? import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"], { auth: { persistSession: false } });
        const { data } = await sb.rpc("get_member_document", { _slug: params.slug });
        const target = typeof data === "string" && data.startsWith("https://") ? data : null;
        if (!target) return Response.redirect(new URL(`/p/${params.slug}`, request.url).toString(), 302);
        return new Response(null, { status: 302, headers: { Location: target, "Cache-Control": "public, max-age=120" } });
      },
    },
  },
});
