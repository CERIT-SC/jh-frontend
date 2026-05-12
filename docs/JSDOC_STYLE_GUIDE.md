# JSDoc Style Guide

This document defines the consistent JSDoc commenting standards for the JupyterHub frontend codebase.

## Table of Contents

1. [General Principles](#general-principles)
2. [File Headers](#file-headers)
3. [Interfaces](#interfaces)
4. [Type Aliases](#type-aliases)
5. [Functions](#functions)
6. [Constants](#constants)
7. [Properties](#properties)
8. [Examples](#examples)

---

## General Principles

- **Always document** exported symbols (interfaces, types, functions, constants)
- **Use present tense** for descriptions (e.g., "Returns" not "Returned")
- **Be concise** but descriptive — explain _what_ and _why_, not _how_
- **Use sentence case** for descriptions (capitalize first letter, end with period for multi-line)
- **Single-line comments** use `/** Description */` format
- **Multi-line comments** align asterisks vertically

---

## File Headers

Add a file header comment only for files that:

- Contain multiple related exports forming a module
- Require context about the file's purpose
- Reference external documentation

```typescript
/**
 * @fileoverview Brief description of the file's purpose.
 *
 * Additional context if needed. Explain the module's role in the application.
 *
 * @see {@link https://example.com} External reference if applicable
 */
```

---

## Interfaces

### Declaration Comment

Use multi-line JSDoc for interfaces with a clear description:

```typescript
/**
 * Description of what the interface represents.
 * Explain its purpose and usage context.
 */
export interface MyInterface {
  // ...
}
```

For simple interfaces, single-line is acceptable:

```typescript
/** Simple configuration options for the feature. */
export interface FeatureConfig {
  // ...
}
```

### Property Comments

Document each property with a single-line comment on its own line:

```typescript
export interface UserConfig {
  /** Unique identifier for the user. */
  id: string;
  /** Display name shown in the UI. */
  displayName: string;
  /** Whether the user has admin privileges. */
  isAdmin: boolean;
  /** Optional profile image URL. */
  avatarUrl?: string;
}
```

---

## Type Aliases

Document type aliases with a single-line or multi-line comment:

```typescript
/** Union of all possible connection states. */
export type ConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

/**
 * Callback function signature for progress updates.
 * @param progress - Current progress percentage (0–100)
 * @param data - Additional progress event data
 */
export type ProgressCallback = (progress: number, data: ProgressEvent) => void;
```

---

## Functions

### Exported Functions

Always document exported functions with full JSDoc including `@param` and `@returns`:

````typescript
/**
 * Triggers a shine animation on an element by its ID.
 * Uses CSS animation that pulses the ring effect.
 *
 * @param elementId - The ID of the DOM element to animate
 * @param options - Configuration options for the animation
 * @param options.duration - Animation duration in milliseconds (default: 1500)
 * @param options.color - Color of the shine effect (default: "var(--primary)")
 * @param options.delay - Delay before starting animation in milliseconds (default: 0)
 *
 * @example
 * ```tsx
 * triggerShineById("my-element", { duration: 2000 });
 * ```
 */
export function triggerShineById(
  elementId: string,
  options: TriggerShineOptions = {},
): void {
  // ...
}
````

### Hook Functions

Document React hooks with return type description:

````typescript
/**
 * Manages alert state with push, remove, and clear operations.
 * Limits visible alerts to {@link MAX_VISIBLE_ALERTS} at any time.
 *
 * @returns Object containing alerts array and management callbacks
 *
 * @example
 * ```tsx
 * const { alerts, pushAlert, removeAlert } = useAlerts();
 * pushAlert("Success!", { variant: "success" });
 * ```
 */
export function useAlerts(): UseAlertsReturn {
  // ...
}
````

---

## Constants

Document exported constants with their purpose and valid values:

```typescript
/** Maximum number of alerts visible at any time. */
export const MAX_VISIBLE_ALERTS = 4;

/**
 * Default reconnection configuration for SSE streams.
 * Defines retry behavior with exponential backoff.
 */
export const DEFAULT_RECONNECT_CONFIG: EventSourceReconnectConfig = {
  maxAttempts: 5,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
};
```

---

## Properties

### Interface Properties

Place single-line comments above each property:

```typescript
export interface SpawnProgressEvent {
  /** Progress percentage (0–100). */
  progress?: number;
  /** Plain-text status message. */
  message?: string;
  /** HTML-formatted status message (sanitise before rendering). */
  html_message?: string;
  /** Whether the server is ready — triggers page reload. */
  ready?: boolean;
  /** Whether the spawn has failed — show error state. */
  failed?: boolean;
}
```

### Object Literal Properties

When defining object types inline, document if the object is complex:

```typescript
export interface Config {
  /** Reconnection settings with exponential backoff. */
  reconnect: {
    /** Maximum retry attempts. */
    maxAttempts: number;
    /** Initial delay in milliseconds. */
    initialDelay: number;
  };
}
```

---

## Examples

### Complete Example: Type File

```typescript
/**
 * @fileoverview Type definitions for spawn progress tracking.
 *
 * Contains types for SSE stream events and client-side event log entries.
 */

/**
 * Spawn progress event data received from the SSE stream.
 * Matches JupyterHub's server-progress API response shape.
 */
export interface SpawnProgressEvent {
  /** Progress percentage (0–100). */
  progress?: number;
  /** Plain-text status message. */
  message?: string;
  /** HTML-formatted status message (sanitise before rendering). */
  html_message?: string;
  /** Server is ready — triggers page reload. */
  ready?: boolean;
  /** Spawn has failed — show error state. */
  failed?: boolean;
  /** Allow additional JupyterHub-specific fields. */
  [key: string]: unknown;
}

/**
 * Enriched event stored in the local event log.
 * Adds client-side metadata not present in the raw SSE payload.
 */
export interface EventLogEntry {
  /** Unique ID for React key and lookups. */
  id: string;
  /** Monotonic index for stable ordering. */
  index: number;
  /** Client-side timestamp when the event was received. */
  timestamp: number;
  /** The raw progress value at this point. */
  progress: number;
  /** Display-ready message (plain text). */
  message: string;
  /** Original HTML message if provided by the server. */
  htmlMessage: string | null;
  /** Whether this event marked spawn failure. */
  isFailed: boolean;
  /** Whether this event marked spawn completion. */
  isReady: boolean;
}

/** Connection states for the SSE stream. */
export type ConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

/**
 * Configuration for the useEventSource reconnection behaviour.
 */
export interface EventSourceReconnectConfig {
  /** Maximum number of consecutive reconnection attempts. */
  maxAttempts: number;
  /** Initial delay in ms before the first reconnect attempt. */
  initialDelay: number;
  /** Upper bound in ms for the exponential backoff delay. */
  maxDelay: number;
  /** Multiplier applied to the delay after each attempt. */
  backoffMultiplier: number;
}

/** Default reconnection configuration. */
export const DEFAULT_RECONNECT_CONFIG: EventSourceReconnectConfig = {
  maxAttempts: 5,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
};

/** Maximum number of log entries retained in memory. */
export const MAX_EVENT_LOG_ENTRIES = 1000;
```

---

## Quick Reference

| Symbol Type        | Comment Style              | Required Tags                      |
| ------------------ | -------------------------- | ---------------------------------- |
| File header        | Multi-line                 | `@fileoverview`, `@see` (optional) |
| Interface          | Multi-line or single-line  | —                                  |
| Interface property | Single-line above property | —                                  |
| Type alias         | Single-line or multi-line  | `@param` for function types        |
| Function           | Multi-line                 | `@param`, `@returns`, `@example`   |
| Constant           | Single-line                | —                                  |
| React Hook         | Multi-line                 | `@returns`, `@example`             |

---

## Common Mistakes to Avoid

❌ **Don't** leave exported symbols undocumented:

```typescript
// Bad
export interface ApiResponse {
  message?: string;
}
```

✅ **Do** add descriptive comments:

```typescript
/** Generic API response structure. */
export interface ApiResponse {
  /** Optional status message from the server. */
  message?: string;
}
```

❌ **Don't** use inline comments after properties:

```typescript
// Bad
export interface Config {
  timeout: number; // Request timeout in ms
}
```

✅ **Do** place comments above properties:

```typescript
export interface Config {
  /** Request timeout in milliseconds. */
  timeout: number;
}
```

❌ **Don't** over-document obvious cases:

```typescript
// Bad
/** The user's name. */
name: string;
```

✅ **Do** add context when needed:

```typescript
/** Display name shown in the UI, derived from profile or email. */
name: string;
```
