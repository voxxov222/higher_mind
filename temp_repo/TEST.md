# Unit Testing - Astrologer Studio

This document explains the unit test suite for Astrologer Studio.

---

## Quick Start

```bash
bun run test:run    # Run all tests once
bun run test        # Watch mode (re-runs on file changes)
bun run test:ui     # Visual interface in browser
```

---

## Technology Stack

The testing suite is built with modern, standard tools for the React ecosystem:

| Tool                                                                                       | Purpose                                                 |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| **[Vitest](https://vitest.dev/)**                                                          | Fast Unit Test Runner (Vite-native, Jest-compatible)    |
| **[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)** | Component rendering and interaction testing             |
| **[@testing-library/jest-dom](https://github.com/testing-library/jest-dom)**               | Custom DOM element matchers (e.g., `toBeInTheDocument`) |
| **[jsdom](https://github.com/jsdom/jsdom)**                                                | Browser environment simulation for Node.js              |

---

## What Are Unit Tests?

Unit tests are automated checks that verify your code works correctly. When you run `bun run test:run`, the test suite executes **92 tests** that check various functions and components.

Tests verify two main things:

1. **Backend Utilities**: Date parsing, validation logic, data sanitization.
2. **Frontend Components**: Rendering, user interactions (clicks), error handling.

---

## Implemented Test Suite (92 Tests)

We verify both backend logic and frontend components. Here is a complete breakdown of coverage:

### 🛠️ Backend Utilities (56 Tests)

**1. Date & Time Handling** (`src/lib/utils/date.test.ts`) - **31 Tests**

- **Parsing**: Converts birth strings (YYYY-MM-DD + HH:MM) to UTC Date objects.
- **Validation**: Rejects invalid formats, future dates, and non-existent times (e.g., 25:00).
- **Formatting**:
  - _Display_: Localizes dates (EU `DD/MM/YYYY`, US `MM/DD/YYYY`, ISO).
  - _Forms_: Prepares dates for HTML `<input type="date">`.
  - _Time_: 12h (AM/PM) vs 24h format handling.
- **Edge Cases**: Midnight handling, mixed ISO strings, timezone offsets.

**2. Data Validation Schemas** (`src/lib/validation/validation.test.ts`) - **18 Tests**

- **Saved Charts**: Validates creation/update payloads (name limits, chart types).
- **Subjects**: Ensures birth data integrity and note length limits.
- **Security**: Verifies that invalid types or massive payloads are rejected by Zod before DB access.
- **Helpers**: Tests `validateBody` wrapper and error formatting utilities.

**3. Object Manipulation** (`src/lib/utils/object.test.ts`) - **7 Tests**

- **Security**: Tests `omitKeys` to ensuring passwords/sensitive data are stripped from responses.
- **Immutability**: Verifies original objects are never mutated during sanitization.

### ⚛️ Frontend Components (36 Tests)

**1. Button Component** (`src/components/ui/button.test.tsx`) - **18 Tests**

- **Visual Variants**: Default, Destructive, Outline, Secondary, Ghost, Link.
- **Sizes**: Default, Sm, Lg, Icon (square).
- **Interactions**: Click handlers firing, disabled state blocking clicks.
- **Polymorphism**: Tests `asChild` prop (rendering as `<a>` tag while keeping button styles).
- **A11y**: Forwards generic attributes (type, aria-label, etc.).

**2. Error Boundaries** (`src/components/ErrorBoundary.test.tsx`) - **10 Tests**

- **Recovery**: Catches render errors and displays fallback UI instead of white screen.
- **Customization**: Supports custom fallback components via props.
- **Safety**: Isolates errors so one broken widget doesn't crash the whole page.
- **Logging**: Verifies errors are logged to console (or monitoring service).

**3. Theme Provider** (`src/test/ThemeProvider.test.tsx`) - **5 Tests**

- **Context**: Verifies `next-themes` integration writes attributes correctly.
- **Rendering**: Ensures children (nested or single) render without visual regression.

**4. CSS Utilities** (`src/test/utils.test.ts`) - **3 Tests**

- **Class Merging**: Tests `cn()` for merging conditional Tailwind classes and resolving conflicts (e.g., `p-4` vs `p-2`).

---

## Test Configuration

### Files

| File                | Purpose                                                                             |
| ------------------- | ----------------------------------------------------------------------------------- |
| `vitest.config.ts`  | Main configuration: jsdom environment, path aliases (`@/`), coverage settings       |
| `src/test/setup.ts` | Runs before tests: loads jest-dom matchers, mocks `matchMedia` and `ResizeObserver` |

### Path Aliases

Tests use the same `@/` alias as the rest of the project:

```typescript
import { cn } from '@/lib/utils/cn' // Points to src/lib/utils/cn
```

---

## How to Read Test Results

### All Tests Pass

```
 ✓ src/test/lib/utils/date.test.ts (31)
 Test Files  7 passed (7)
```

### A Test Fails

```
 FAIL  src/test/lib/utils/date.test.ts > parseBirthDateTime > should parse valid date

 AssertionError: expected '2025-01-15' to equal '2025-01-16'
 ❯ src/test/lib/utils/date.test.ts:35:18
```

This tells you:

- **File**: `date.test.ts`
- **Test**: `parseBirthDateTime > should parse valid date`
- **Problem**: Expected `'2025-01-16'` but got `'2025-01-15'`
- **Line**: 35

---

## Adding New Tests

### 1. Create the test file

Mirror the source file structure:

- Source: `src/lib/utils/myHelper.ts`
- Test: `src/test/lib/utils/myHelper.test.ts`

### 2. Write the test

```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from '@/lib/utils/myHelper'

describe('myFunction', () => {
  it('should do something specific', () => {
    const result = myFunction('input')
    expect(result).toBe('expected')
  })
})
```

### 3. Run it

```bash
bun run test:run
```

---

## Testing React Components

Components need to be rendered before you can test them:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('should render text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should handle clicks', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)

    fireEvent.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
```

---

## Common Patterns Used

### Testing validation schemas (Zod)

```typescript
it('should reject empty name', () => {
  const result = schema.safeParse({ name: '' })
  expect(result.success).toBe(false)
})
```

### Testing functions that throw

```typescript
it('should throw for invalid input', () => {
  expect(() => myFunction('bad')).toThrow('Error message')
})
```

### Testing component variants

```typescript
it('should render destructive variant', () => {
  render(<Button variant="destructive">Delete</Button>)
  expect(screen.getByRole('button').className).toContain('bg-destructive')
})
```

---

## Quick Reference - Command Cheat Sheet

| Command                                   | What It Does                                                                                                                                       |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run test`                            | Starts tests in **watch mode**. Tests re-run automatically when you save a file. Good for active development. Press `q` to quit.                   |
| `bun run test:run`                        | Runs all tests **once** and exits. Shows pass/fail summary. Use this to verify everything works before committing.                                 |
| `bun run test:ui`                         | Opens a **visual web interface** in your browser. You can click on tests, see results, and re-run specific tests. Best for learning and debugging. |
| `bun run test:coverage`                   | Runs tests and generates a **coverage report** showing which lines of code are tested. Creates an HTML report in `coverage/` folder.               |
| `bun vitest run path/to/file.test.ts`     | Runs tests from a **specific file** only. Useful when working on one area.                                                                         |
| `bun vitest --watch path/to/file.test.ts` | Watches a **specific file** for changes and re-runs its tests.                                                                                     |

### Watch Mode Keyboard Shortcuts

When running `bun run test` (watch mode), these keys are available:

| Key     | Action                                      |
| ------- | ------------------------------------------- |
| `a`     | Run **all** tests                           |
| `f`     | Run only **failed** tests                   |
| `p`     | Filter by file **pattern** (type to search) |
| `t`     | Filter by **test name** pattern             |
| `q`     | **Quit** watch mode                         |
| `h`     | Show **help** with all shortcuts            |
| `Enter` | Re-run tests                                |

---

_Last updated: 2026-01-15_
