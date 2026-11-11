# Image badges and GPU indicators

These settings are emitted by the backend as JSON. They configure display,
not authorization or GPU allocation.

## Image badges

In `spawn_options.image`, define badges separately from the images that use them:

```python
"badge_config": {
    "rstudio": {
        "abbr": "RSt",                       # chip label
        "name": "RStudio",                   # tooltip heading
        "description": "RStudio IDE installed.", # tooltip body
        "color": "accent-1",                 # optional preset
    },
},
"categories": [{
    "key": "images",
    "name": "Images",
    "images": [{
        "value": "registry.example/rstudio:1",
        "name": "RStudio notebook",
        "badges": ["rstudio"],
        "version": "1",                      # optional version chip
    }],
}],
```

The badge ID (`rstudio`) is independent of its displayed abbreviation (`RSt`).
`badges: []` explicitly disables feature badges. Omitting `badges` keeps the
existing name-keyword heuristic. Unknown badge IDs are skipped with a
non-blocking configuration warning.

Allowed `color` values are `neutral`, `accent-1`, `accent-2`, `accent-3`,
`accent-4`, and `accent-5`. Accent presets map to the design system's
corresponding `chart-*` background at 50% opacity with its `text-text` foreground;
the actual palette is theme-dependent. Neutral uses the raised surface style.
The frontend contains fixed CSS classes: no generated colors, arbitrary CSS,
or hex values from the backend. Unknown colors produce a non-blocking warning
and use neutral. If color is omitted, existing badge IDs keep their original
styles; new IDs use neutral.

Backends must preserve the optional `color` property when emitting
`badge_config`; backends that filter badge properties need that addition too.
The CAS development fixture demonstrates an ID different from its abbreviation
and an explicit color preset (`?instance=cas`).

## GPU service availability

GPU availability belongs to the **spawn page**, not the home page.
`spawn_options.resources.gpu.enabled` controls GPU choices;
`spawn_options.resources.gpu.live_status` additionally controls the live
availability widget, refresh action, and requests to `/services/prometheus/gpus`.
GPU choices can remain enabled even when the metrics service is not deployed.

Set `live_status` to `false` in namespaces without that service: disabled means
neither a live widget nor a GPU-service request. Live status is off unless
explicitly enabled. An enabled widget retains its loading, error, and
manual-refresh UI.

The home page does not render or fetch GPU availability. The existing
`instance.pages.home.gpu_indicators` key is retained for wire compatibility
but has no effect; setting it to true does not add a widget.
`instance.pages.home.resource_usage` separately controls the home
resource-usage service.
