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
- Paid member features (profile/vCard, verified badge, live status) live in `member_profiles`; a trigger sets `verified_at`/e-mail from the confirmed account and public pages read only through `get_member_profile` — why: members cannot forge their certification.
- Team Smart Banners are served by `/api/public/banniere/$teamId` (302 to the current image, `?go=1` to its link) via `current_team_banner` — why: signatures keep one fixed URL while the image changes.
- Member uploads go to the private `member-media` bucket under `<userId>/…` (upload allowed only when `is_booking_eligible`) and are stored as 10-year signed URLs — why: workspace blocks public buckets, public pages still need the image.
- Plan rights are enforced in the database (profile/status writes via `is_booking_eligible`, banner writes via `team_has_plan`), the UI lock is only cosmetic — why: blocks API bypass.
- Team onboarding uses a per-team token in `team_join_links` (admin-only read); joining goes only through `join_team` (confirmed e-mail, active Équipe plan, seat limit) — why: a leaked link cannot exceed paid seats or bypass the plan.
- Member PDF documents are served through the fixed `/api/public/document/$slug` redirect via `get_member_document` (paid members only) — why: signatures keep one link while the file changes.
- Signature count is capped by the `signature_quota` trigger (Free = 1, paid = 20) — why: multi-variant signatures are a paid right enforced in the database.
