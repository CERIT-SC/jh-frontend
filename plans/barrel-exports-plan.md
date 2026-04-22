# Barrel Exports Implementation Plan

## Overview

This document outlines the implementation plan for adding `index.ts` barrel export files to simplify imports across the project. Currently, the project uses relative imports with deep paths (e.g., `../../../components/ui/Button/Button`), which are hard to maintain and read. The goal is to create barrel exports that work with the existing path aliases (`@components/*`, `@hooks/*`, `@utils/*`, etc.) configured in `tsconfig.json`.

### Current State

- Path aliases are configured in `tsconfig.json` but underutilized
- Imports use deep relative paths like `../../../components/ui/Button/Button`
- Some barrel exports already exist:
  - `src/hooks/index.ts` - exports `useAlerts`
  - `src/components/features/GPUStatusIndicator/index.ts` - exports GPUStatusIndicator components
  - `src/routes/spawn/data/formData.js` - exports form data

### Target State

- Clean imports using path aliases: `import { Button } from '@components/ui'`
- Consistent export patterns across all component directories
- No circular dependencies
- Type-safe exports for TypeScript files

---

## Proposed Index Files

### 1. src/components/ui/index.ts

**Exports:** All UI components from the `src/components/ui` directory.

```typescript
// UI Components
export { Button } from "./Button/Button";
export type { ButtonVariant, ButtonSize } from "./Button/Button";

export { Alert } from "./Alert";
export type { AlertItem } from "./Alert";

export { InfoBox } from "./InfoBox/InfoBox";
export type { InfoBoxProps } from "./InfoBox/InfoBox";

export { ProgressIndicator } from "./ProgressIndicator";
export type { StepInfo, ProgressIndicatorProps } from "./ProgressIndicator";
export { default as ProgressIndicatorDefault } from "./ProgressIndicator";

export { SummaryChips } from "./SummaryChips";
export type { SummaryChipItem, SummaryChipsProps } from "./SummaryChips";
export { default as SummaryChipsDefault } from "./SummaryChips";

export { ToggleCard } from "./ToggleCard";
export type { ToggleCardProps } from "./ToggleCard";
export { default as ToggleCardDefault } from "./ToggleCard";

export { DropDownButton } from "./DropDownButton/DropDownButton";
export type {
  DropDownButtonProps,
  DropDownOptionProps,
} from "./DropDownButton/DropDownButton";
export { DropDownOption } from "./DropDownButton/DropDownButton";

export { DropDownMenu } from "./DropDownMenu/DropDownMenu";
export type { DropDownMenuProps } from "./DropDownMenu/DropDownMenu";
export { default as DropDownMenuDefault } from "./DropDownMenu/DropDownMenu";

export { FieldHeader } from "./FieldHeader/FieldHeader";
export type { FieldHeaderProps } from "./FieldHeader/FieldHeader";

export { SliderCheckBox } from "./SliderCheckBox/SliderCheckBox";
export type { SliderCheckBoxProps } from "./SliderCheckBox/SliderCheckBox";

export { TileSelector } from "./TileSelector/TileSelector";
export type {
  TileSelectorProps,
  NumericTileSelectorProps,
  StringTileSelectorProps,
} from "./TileSelector/TileSelector";
export { StringTileSelector } from "./TileSelector/TileSelector";
export { default as TileSelectorDefault } from "./TileSelector/TileSelector";
```

### 2. src/components/layout/index.ts

**Exports:** All layout components from the `src/components/layout` directory.

```typescript
// Layout Components
export { JupyterHubHeader } from "./JupyterHubHeader";
export type { JupyterHubHeaderProps } from "./JupyterHubHeader";
export { default as JupyterHubHeaderDefault } from "./JupyterHubHeader";

export { EinfraFooter } from "./EinfraFooter";
export type { EinfraFooterProps } from "./EinfraFooter";

export { ModeToggle } from "./ModeToggle";
export type { ModeToggleProps } from "./ModeToggle";

export { ThemeProvider } from "./ThemeProvider";
export type { ThemeProviderProps } from "./ThemeProvider";
```

### 3. src/components/features/index.ts

**Exports:** All feature components from the `src/components/features` directory.

```typescript
// Feature Components
export { AnouncmentMessage } from "./AnouncmentMessage/AnouncmentMessage";
export type { AnouncmentMessageProps } from "./AnouncmentMessage/AnouncmentMessage";
export { default as AnouncmentMessageDefault } from "./AnouncmentMessage/AnouncmentMessage";

export { FormButton } from "./Form/FormButton";
export type { FormButtonProps } from "./Form/FormButton";

export { ProgressiveForm } from "./Form/ProgressiveForm";
export type {
  ProgressiveFormProps,
  ProgressTrackerProps,
  StepButtonsProps,
} from "./Form/ProgressiveForm";
export { default as ProgressiveFormDefault } from "./Form/ProgressiveForm";

export { GPUStatusIndicator } from "./GPUStatusIndicator/GPUStatusIndicator";
export type {
  GPUStatusIndicatorProps,
  GPUSquareProps,
  GPUStatus,
} from "./GPUStatusIndicator/GPUStatusIndicator";
export { GPUSquare } from "./GPUStatusIndicator/GPUStatusIndicator";
export { default as GPUStatusIndicatorDefault } from "./GPUStatusIndicator/GPUStatusIndicator";

export { ImageCard } from "./imageCard";
export type { CardProps as ImageCardProps } from "./imageCard";
export { default as ImageCardDefault } from "./imageCard";

export { OverviewPanel } from "./OverviewPanel";
export type { OverviewPanelProps } from "./OverviewPanel";

export { ServerCard } from "./ServerCard/ServerCard";
export type {
  CardProps as ServerCardProps,
  ServerCardVariant,
  ServerActionButtonsProps,
  EmptyCardProps,
} from "./ServerCard/ServerCard";
export { ServerCardInline } from "./ServerCard/ServerCard";
export { ServerCardCompact } from "./ServerCard/ServerCard";
export { EmptyServerCard } from "./ServerCard/ServerCard";
export { default as ServerCardDefault } from "./ServerCard/ServerCard";

export { SelectingCardsTabs } from "./ServerCard/selectingCardsTabs";
export type { SelectingCardTabsProps } from "./ServerCard/selectingCardsTabs";
export { default as SelectingCardsTabsDefault } from "./ServerCard/selectingCardsTabs";

// Deprecated - kept for backward compatibility
export { SelectableCard, SelectableCards } from "./ServerCard/SelectableCards";
export { default as SelectableCardsDefault } from "./ServerCard/SelectableCards";
```

### 4. src/api/index.ts (NEW)

**Exports:** All API modules from the `src/api` directory.

```typescript
// API Modules
export { JupyterHubApiClient, JupyterHubAPI } from "./JupyterHubAPI";
export type { JupyterHubApiClientConfig } from "./JupyterHubAPI";

export { GrafanaQuery } from "./GrafanaAPI";
export type { GrafanaQueryConfig, GrafanaResponse } from "./GrafanaAPI";

export { GPUIndicatorsAPI } from "./GPUIndicatorsAPI";
export type { GPUIndicator, GPUIndicatorConfig } from "./GPUIndicatorsAPI";
```

### 5. src/hooks/index.ts (EXISTING - Verify/Update)

**Current contents:**

```typescript
export { useAlerts } from "./useAlerts";
```

**Recommended update:**

```typescript
// Hooks
export { useAlerts } from "./useAlerts";
export type { UseAlertsReturn } from "./useAlerts";

export { useGPUStatus } from "./useGPUStatus";
export type { UseGPUStatusReturn, GPUStatusData } from "./useGPUStatus";
```

### 6. src/utils/index.ts

**Exports:** All utility functions from the `src/utils` directory.

```typescript
// Utility Functions
export { cn } from "./utils";
export { dateFormat } from "./utils";
export { dateFormatRelative } from "./utils";

export { triggerShineById, triggerShineMultiple } from "./shine";
export type { TriggerShineOptions } from "./shine";
```

### 7. src/routes/\*/index.ts (OPTIONAL)

Route-level barrel exports are optional and may not provide significant benefits since routes are typically imported by the router/vite config, not by other modules. However, if desired:

#### src/routes/spawn/index.ts

```typescript
export { FormPage } from "./FormPage";
export { default as FormPageDefault } from "./FormPage";
```

#### src/routes/home/index.ts

```typescript
export { HomePage } from "./HomePage";
export { default as HomePageDefault } from "./HomePage";
```

#### src/routes/login/index.ts

```typescript
export { LoginPage } from "./LoginPage";
export { default as LoginPageDefault } from "./LoginPage";
```

#### src/routes/spawn-pending/index.ts

```typescript
export { SpawnPending } from "./SpawnPending";
export { default as SpawnPendingDefault } from "./SpawnPending";
```

#### src/routes/not-running/index.ts

```typescript
export { NotRunning } from "./NotRunning";
export { default as NotRunningDefault } from "./NotRunning";
```

#### src/routes/token/index.ts

```typescript
export { TokenPage } from "./TokenPage";
export { default as TokenPageDefault } from "./TokenPage";
```

---

## Import Transformation Examples

| Before                                                                                                  | After                                                        |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `import { Button } from '../../../components/ui/Button/Button';`                                        | `import { Button } from '@components/ui';`                   |
| `import { Alert } from '../../components/ui/Alert';`                                                    | `import { Alert } from '@components/ui';`                    |
| `import { InfoBox } from '../components/ui/InfoBox/InfoBox';`                                           | `import { InfoBox } from '@components/ui';`                  |
| `import { JupyterHubHeader } from '../../components/layout/JupyterHubHeader';`                          | `import { JupyterHubHeader } from '@components/layout';`     |
| `import { EinfraFooter } from '../../components/layout/EinfraFooter';`                                  | `import { EinfraFooter } from '@components/layout';`         |
| `import { ThemeProvider } from '../../components/layout/ThemeProvider';`                                | `import { ThemeProvider } from '@components/layout';`        |
| `import { ServerCard } from '../../components/features/ServerCard/ServerCard';`                         | `import { ServerCard } from '@components/features';`         |
| `import { GPUStatusIndicator } from '../../components/features/GPUStatusIndicator/GPUStatusIndicator';` | `import { GPUStatusIndicator } from '@components/features';` |
| `import { ProgressiveForm } from '../../components/features/Form/ProgressiveForm';`                     | `import { ProgressiveForm } from '@components/features';`    |
| `import { useAlerts } from '../../hooks/useAlerts';`                                                    | `import { useAlerts } from '@hooks';`                        |
| `import { useGPUStatus } from '../api/GrafanaAPI';`                                                     | `import { useGPUStatus } from '@hooks';`                     |
| `import { GrafanaQuery } from '../../api/GrafanaAPI';`                                                  | `import { GrafanaQuery } from '@api';`                       |
| `import { JupyterHubApiClient } from '../../api/JupyterHubAPI';`                                        | `import { JupyterHubApiClient } from '@api';`                |
| `import { cn, dateFormat } from '../../../utils/utils';`                                                | `import { cn, dateFormat } from '@utils';`                   |
| `import { triggerShineById } from '../../utils/shine';`                                                 | `import { triggerShineById } from '@utils';`                 |
| `import { TileSelector } from '../../../components/ui/TileSelector/TileSelector';`                      | `import { TileSelector } from '@components/ui';`             |
| `import { DropDownMenu } from '../../../components/ui/DropDownMenu/DropDownMenu';`                      | `import { DropDownMenu } from '@components/ui';`             |
| `import { OverviewPanel } from '../../components/features/OverviewPanel';`                              | `import { OverviewPanel } from '@components/features';`      |

---

## Implementation Steps

### Phase 1: Create Barrel Export Files (No Breaking Changes)

Create all `index.ts` files first without modifying existing imports. This allows gradual migration.

1. **Create `src/components/ui/index.ts`**
   - Export all UI components with types
   - Include both named exports and default exports for compatibility

2. **Create `src/components/layout/index.ts`**
   - Export all layout components

3. **Create `src/components/features/index.ts`**
   - Export all feature components
   - Handle nested directories (Form/, ServerCard/)

4. **Create `src/api/index.ts`**
   - Export API classes and types

5. **Update `src/hooks/index.ts`**
   - Add `useGPUStatus` export

6. **Create `src/utils/index.ts`**
   - Export utility functions from both `utils.ts` and `shine.ts`

### Phase 2: Update Imports (Gradual Migration)

Update imports file by file, starting with least dependent files:

1. **Update route entry files first** (lowest dependency risk):
   - `src/routes/login/login.jsx`
   - `src/routes/token/token.jsx`
   - `src/routes/not-running/not_running.jsx`
   - `src/routes/spawn-pending/spawn_pending.jsx`
   - `src/routes/home/home.jsx`
   - `src/routes/spawn/form.jsx`

2. **Update route page components**:
   - `src/routes/login/LoginPage.jsx`
   - `src/routes/token/TokenPage.jsx`
   - `src/routes/not-running/NotRunning.jsx`
   - `src/routes/spawn-pending/SpawnPending.jsx`
   - `src/routes/home/HomePage.jsx`
   - `src/routes/spawn/FormPage.jsx`

3. **Update feature components**:
   - `src/components/features/OverviewPanel.tsx`
   - `src/components/features/ServerCard/*.tsx`
   - `src/components/features/Form/*.tsx`

4. **Update UI components** (if any cross-dependencies exist):
   - `src/components/ui/FieldHeader/FieldHeader.tsx` (uses InfoBox)
   - `src/components/ui/DropDownButton/DropDownButton.tsx` (uses InfoBox)

5. **Update hooks and utilities** (if needed):
   - `src/hooks/useGPUStatus.ts` (uses GrafanaAPI)

### Phase 3: Verification

1. Run TypeScript compiler: `tsc --noEmit`
2. Run linting: `eslint .`
3. Run tests (if available): `npm test` or `bun test`
4. Run Storybook to verify components render correctly
5. Test the application in development mode

---

## Potential Issues and Considerations

### 1. Circular Dependencies

**Risk:** Low to Medium

The current component structure appears to be well-organized with clear hierarchies:

- UI components → no internal dependencies (only @e-infra/design-system)
- Layout components → depend on UI components
- Feature components → depend on UI and Layout components

**Mitigation:**

- Do not import from parent directories in child barrel files
- Keep barrel files simple (only re-exports, no logic)
- If circular dependency occurs, use inline imports in specific functions instead of top-level imports

### 2. Default vs Named Exports

**Issue:** Some components use default exports, others use named exports.

**Current patterns:**

- `Button.tsx` - named export `Button`, no default
- `Alert.tsx` - named export `Alert`, no default
- `InfoBox.tsx` - named export `InfoBox`, no default
- `ProgressIndicator.tsx` - named + default export
- `JupyterHubHeader.tsx` - default export + named interface
- `EinfraFooter.tsx` - named export only
- `ServerCard.tsx` - multiple named exports + default

**Solution:** Barrel files should export both patterns for compatibility:

```typescript
export { Button } from "./Button/Button";
export { default as ButtonDefault } from "./Button/Button"; // if default exists
```

### 3. Type Exports

**Issue:** TypeScript types need to be exported separately or with `export type`.

**Solution:** Always export types explicitly:

```typescript
export { Button } from "./Button/Button";
export type { ButtonProps, ButtonVariant } from "./Button/Button";
```

### 4. CSS Imports

**Issue:** Some components import CSS files (e.g., `import './FieldHeader.css'`).

**Solution:** Barrel files should NOT import CSS. CSS imports stay in component files.

### 5. Story Files

**Issue:** Story files (`.stories.tsx`, `.stories.jsx`) should not be exported from barrel files.

**Solution:** Only export production components, not stories.

### 6. Deprecated Components

**Issue:** `SelectableCards.tsx` is marked as deprecated.

**Solution:** Still export but add JSDoc deprecation notice:

```typescript
/** @deprecated Use SelectingCardsTabs instead */
export { SelectableCard, SelectableCards } from "./ServerCard/SelectableCards";
```

### 7. Build Performance

**Issue:** Barrel files can cause more code to be bundled than necessary.

**Mitigation:** Modern bundlers (Vite, Webpack 5) support tree-shaking, so unused exports should be eliminated automatically.

### 8. Import Conflicts

**Issue:** When importing multiple components with same export names.

**Solution:** Use aliasing:

```typescript
import { Button as UIButton, Button as FormButton } from "@components/ui";
// Or better, import from specific paths when needed
```

---

## File Checklist

| Directory                   | File       | Status                 |
| --------------------------- | ---------- | ---------------------- |
| `src/components/ui/`        | `index.ts` | To create              |
| `src/components/layout/`    | `index.ts` | To create              |
| `src/components/features/`  | `index.ts` | To create              |
| `src/api/`                  | `index.ts` | To create              |
| `src/hooks/`                | `index.ts` | Exists (update needed) |
| `src/utils/`                | `index.ts` | To create              |
| `src/routes/spawn/`         | `index.ts` | Optional               |
| `src/routes/home/`          | `index.ts` | Optional               |
| `src/routes/login/`         | `index.ts` | Optional               |
| `src/routes/token/`         | `index.ts` | Optional               |
| `src/routes/spawn-pending/` | `index.ts` | Optional               |
| `src/routes/not-running/`   | `index.ts` | Optional               |

---

## Post-Implementation Benefits

1. **Cleaner imports:** `import { Button } from '@components/ui'` vs `import { Button } from '../../../components/ui/Button/Button'`
2. **Easier refactoring:** Moving files doesn't break imports if using path aliases
3. **Better discoverability:** IDE autocomplete shows all available exports from a module
4. **Consistent patterns:** Standardized export structure across the codebase
5. **Simplified maintenance:** Single source of truth for what each module exports
