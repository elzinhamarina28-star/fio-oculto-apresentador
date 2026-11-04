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
