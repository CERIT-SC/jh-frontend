# Per-instance login pages

How the login page gets instance-specific content (logo, info text, button
label) while every instance keeps the same hub look — same palette, same
design-system components, same layout.

Two separate knobs exist:

- **`instance.brand`** — selects the palette (`<html data-theme>`) and the
  brand slots (header/footer/login *structure*). Palettes are code:
  design-system theme files, never runtime colors.
- **`instance.pages.login`** — selects the login *content* rendered by the
  shared login card. This is the day-to-day knob; it exists so that changing
  a paragraph does not require a frontend release.

CAS, for example, keeps `brand: "origin"` (origin palette and card) and
configures only `pages.login`.

## Wire format

The backend injects `template_vars["instance"]` into
`<script type="application/json" id="instance-config">` on every page. The
login-relevant part of that JSON:

```jsonc
{
  "version": 1,
  "brand": "origin",
  "pages": {
    "home": { "gpu_indicators": false, "resource_usage": false },
    "login": {
      "heading": "Welcome to JupyterHub",
      "subtitle": "Sign in to access your JupyterHub workspace",
      "logo": {
        "src": "/static/custom-images/bioconductor_logo.svg",
        "dark_src": "/static/custom-images/bioconductor_logo_dark.svg",
        "alt": "Bioconductor"
      },
      "paragraphs": [
        "It is necessary to be a valid member of bioconductor group to access the service."
      ],
      "links": [{ "label": "Documentation", "href": "https://docs.cerit.io" }],
      "button_text": "Sign in with MUNI"
    }
  }
}
```

Field rules (enforced by `src/routes/login/config/resolveLoginContent.ts`;
violations never block the sign-in button, they degrade to defaults and log
non-blocking problems):

| Field | Rule |
| --- | --- |
| `heading` | Nonempty string; whitespace-only/invalid → `Welcome to JupyterHub`. |
| `subtitle` | String; empty/whitespace hides it; non-string → default subtitle. |
| `logo` | Optional. `src` + `alt` required; both URLs must resolve to **same-origin** http(s) without credentials (the page CSP is `img-src 'self' data: blob:`). Relative paths resolve against the page URL. `dark_src` optional; invalid `dark_src` falls back to `src`. `data:`/`blob:`/remote logos are rejected by the application even where the CSP would allow them. A failed image load hides the image; sign-in is unaffected. |
| `paragraphs` | List of nonempty strings, rendered in order as **plain text** (React-escaped; HTML is never interpreted). Invalid entries dropped. |
| `links` | List of `{ label, href }`; href must resolve to http(s) — any origin, no credentials. Relative hrefs stored resolved. Invalid entries dropped. |
| `button_text` | Nonempty string; invalid → `Sign in`. Changes the label only — never the destination. |

Default semantics:

- **`pages.login` absent** → the active brand's own login slot renders
  (today's origin page with its MetaCentrum content).
- **`pages.login` present, even `{}`** → the shared generic card with
  defaults (`Welcome to JupyterHub` / default subtitle / `Sign in`, no
  paragraphs, no links, no logo). Origin membership text is **never**
  synthesized into a configured page.
- **`pages.login` malformed** (not an object) → generic defaults plus a
  logged problem.

## Editing the login page — every way

| What changes | Where to edit | Who | What rolls out |
| --- | --- | --- | --- |
| Heading, subtitle, paragraphs, quick links, button label | `instance.pages.login` in the hub's Helm values (the object passed to `template_vars["instance"]`) | Cluster ops | Backend configuration rollout only — no frontend release |
| Logo — bundled asset | Replace/add the file under `public/static/custom-images/` in this repo and point `logo.src` at `/static/custom-images/<file>` (optional `dark_src`) | Frontend dev | Frontend release (the file ships in the `static-files-images` ConfigMap) |
| Logo — ops-managed asset | Place the file on a same-origin static path served by the hub/ingress; point `logo.src` at that path | Cluster ops | Asset/backend rollout only — no frontend release. **Prerequisite:** verify the serving path first (same origin, reachable under the page CSP, correct base path in the actual chart). Do not point at an unverified path, and do not hand-edit the generated `static-files-images` ConfigMap — the next frontend release replaces it. |
| Revert an instance to the default hub login | Remove that instance's `pages.login` block from its Helm values | Cluster ops | Backend configuration rollout only |
| Preview locally without a cluster | Add/edit a fixture in `src/fixtures/instances/<name>.ts`; open `/login.html?instance=<name>` (or set `VITE_INSTANCE`; `npm run dev:login`, `npm run dev-cas:login`) | Frontend dev | Nothing deployed |
| Palette / theme | New design-system theme file + a `brand` id (`src/brands/<id>/` + registry); `<html data-theme>` follows `instance.brand` | Frontend dev | Frontend release. Never runtime colors. |
| Content beyond the schema (different structure, custom sections) | Brand `LoginPage` slot in `src/brands/<id>/` + registry entry (render the shared `LoginCard` with custom content) | Frontend dev | Frontend release. Keep the shared card for standard content. |
| Sign-in destination / auth behavior | Route entry `src/routes/login/login.tsx` (`link`) plus the backend's OAuth configuration | Frontend dev + ops | Frontend release and/or backend config. Deliberately outside the editorial schema; `button_text` never changes it. |

## Local preview

```bash
npm run dev:login                 # hub fixture (origin content)
npm run dev:login &               # then http://localhost:5173/login.html?instance=cas
npm run dev-cas:login             # VITE_INSTANCE=cas, shared build
```

`?instance=<name>` overrides `VITE_INSTANCE`; unknown names fall back to
`hub` with a console warning. Fixtures live in `src/fixtures/instances/` and
mirror the wire exactly (`wire` → `#spawn-options`, `instance` →
`#instance-config`).

## Deployment

1. **Frontend first.** Merges to `master` build `dist_hub/` and upload the
   ConfigMap YAML artifacts (`.github/workflows/deploy.yaml`; applying them
   to a cluster is a separate, operator-owned step). A frontend that knows
   `pages.login` behaves identically for backends that do not send it.
2. **Then the configuration.** Add the CAS `instance` block (with
   `pages.login`) to the CAS hub's Helm values and roll the backend.
   Old frontends ignore the new field — this order never breaks either side.
3. **Staging gate before production:** render the login page from the real
   backend and confirm — CAS copy and auth URL match the deployed legacy
   template; the logo returns 200 with no CSP violation; no MetaCentrum copy
   appears on CAS; direct login works; the origin instance is unchanged.
4. **Rollback:** remove the `pages.login` block (backend-only change) to
   restore the origin defaults, or redeploy the previous frontend/backend
   pair if CAS-specific access copy must remain visible during a frontend
   rollback.

The CAS paragraph and button label were taken from the checked-in legacy
React page (`cas/js/LoginPage.jsx`). Confirm them against the actually
deployed CAS Jinja template during the staging gate.
