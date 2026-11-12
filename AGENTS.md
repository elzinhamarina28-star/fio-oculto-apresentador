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

- Presenter: renderers implement `PresenterRendererProps` (src/lib/presenter/types.ts) and are driven by `usePresenter` commands; swap SpriteRig for a rigged/Live2D renderer without changing the control panel. Reactions are manual-test only until a real live integration exists.
- Cinematic events use one session-scoped serialized queue subscribed to validated `fio:live-event` messages; the existing assistant owns audio activation and closing speech to prevent duplicate effects and voice. Profiles and gift-ID associations remain session-only until persistence is explicitly implemented.
- Preserve original layered artwork; cinematic motion transforms existing layers without synthesizing missing limbs. Gift IDs must come from operator/TikFinity input, never invented catalog IDs.
- Seed-san VRM preview is an initial visual integration only. The source model has no embedded animation clips; do not mark walking, running, sitting, standing transitions, or dances as implemented until licensed clips are integrated and visually tested. Keep SpriteRig as fallback. The current preview loads Three.js/three-vrm and the pinned official VRM asset remotely; replace this with locally managed dependencies/assets only after regenerating and validating the Bun lockfile.
