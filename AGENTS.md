<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- Tool metadata lives only in `src/lib/tools.ts`; each tool's UI is registered by slug in `src/components/tools/registry.ts` and rendered by the single `/tools/$slug` route — keeps 50 tools consistent and adds a tool in two edits.
- All tool processing runs client-side (canvas, pdf-lib, pdfjs, JSZip, Web Audio, MediaRecorder); no uploads, no AI — product rule from the brief.
- Shared tool controls use the design-system Button through kit.tsx, and the tool-workspace frame owns common containment and preview styling — keeps all tools visually consistent without changing processing.
- Shared processing validation and secure random sampling live in tool-processing.ts and have regression tests; accepted uploads are checked by FileDrop before processing to prevent invalid or stale downloads.
- The admin route reports unavailable configuration without mock authentication or settings; real administration requires enabled Cloud and secure authorization.
- Tool workspaces are lazily registered by module; processing dependencies load only in the actions that need them, so unrelated tools never fetch PDF, archive, QR, barcode, or GIF engines.
- Browser preferences use guarded, validated storage helpers; files remain transient browser state, so denied storage never prevents tool use.
- Media jobs cancel on unmount and release workers, streams, canvases, and object URLs; previews use blobs where practical to avoid Base64 memory duplication.
- User-supplied regex runs in a terminable worker with a timeout, so pathological expressions cannot freeze navigation.
