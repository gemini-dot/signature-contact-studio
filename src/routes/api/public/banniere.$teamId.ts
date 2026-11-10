import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

// Image (ou lien avec ?go=1) de la bannière en cours d'une équipe. Lecture publique via une fonction qui ne renvoie que l'image et le lien.
export const Route = createFileRoute("/api/public/banniere/$teamId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const url = new URL(request.url);
        if (!/^[0-9a-f-]{36}$/i.test(params.teamId)) return new Response("Not found", { status: 404 });
        const sb = createClient(process.env.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } });
        const { data } = await sb.rpc("current_team_banner", { _team: params.teamId });
        const b = data as { image_url: string; link_url: string } | null;
        const target = url.searchParams.get("go") ? b?.link_url || url.origin : b?.image_url;
        if (!target) return new Response(null, { status: 204 });
        return new Response(null, { status: 302, headers: { Location: target, "Cache-Control": "public, max-age=300" } });
      },
    },
  },
});
