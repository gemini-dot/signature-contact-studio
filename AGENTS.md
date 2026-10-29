<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Account pages live under `src/routes/_authenticated/` (client-only gate redirecting to `/connexion`); data access uses the browser client with RLS — why: no server secrets needed.
- Site admin is granted by the signup trigger from a fixed e-mail into `user_roles`; never check admin client-side only — why: prevents privilege escalation.
- Subscriptions/invoices are written only by SECURITY DEFINER RPCs (`subscribe_test`, `set_auto_renew`) in test mode until real Stripe is enabled — why: users cannot grant themselves a plan.
