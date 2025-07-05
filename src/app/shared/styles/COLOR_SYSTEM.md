# Color System Documentation

This document explains how to use the centralized color system in the typing practice application.

## Overview

All colors used throughout the application are now centralized in `_colors.scss`. This ensures consistency and makes it easy to maintain and update the color scheme.

## File Structure

```
src/app/shared/styles/
├── _colors.scss          # Main color definitions
├── _index.scss           # Imports all shared styles
└── COLOR_SYSTEM.md       # This documentation
```

## How to Use

### 1. Import the Color System

In any component's SCSS file, import the shared styles:

```scss
@import '../../../shared/styles';
```

Or if you're in a feature component:

```scss
@import '../../shared/styles';
```

### 2. Using SCSS Variables

You can use SCSS variables directly in your component styles:

```scss
.my-component {
  background-color: $primary-color;
  color: $text-primary;
  border: 1px solid $border-color;
}
```

### 3. Using CSS Custom Properties

You can also use CSS custom properties (CSS variables) which are automatically available:

```scss
.my-component {
  background-color: var(--primary-color);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
```

### 4. Using Mixins

The color system includes utility mixins for common patterns:

```scss
.my-button {
  @include gradient-primary;
  @include primary-transparency(0.1);
}
```

## Available Colors

### Primary Colors
- `$primary-color` / `--primary-color`: `#667eea` (Main brand color)
- `$primary-color-alt` / `--primary-color-alt`: `#2563eb` (Alternative primary)
- `$primary-hover` / `--primary-hover`: `#1d4ed8` (Hover state)
- `$secondary-color` / `--secondary-color`: `#764ba2` (Secondary brand color)
- `$accent-color` / `--accent-color`: `#f093fb` (Accent color)

### Semantic Colors
- `$success-color` / `--success-color`: `#10b981` (Success states)
- `$success-color-alt` / `--success-color-alt`: `#48bb78` (Alternative success)
- `$success-color-light` / `--success-color-light`: `#68d391` (Light success)
- `$warning-color` / `--warning-color`: `#f59e0b` (Warning states)
- `$warning-color-alt` / `--warning-color-alt`: `#d97706` (Alternative warning)
- `$error-color` / `--error-color`: `#ef4444` (Error states)
- `$error-color-alt` / `--error-color-alt`: `#dc2626` (Alternative error)
- `$error-color-light` / `--error-color-light`: `#f56565` (Light error)

### Text Colors
- `$text-primary` / `--text-primary`: `#2d3748` (Main text)
- `$text-primary-alt` / `--text-primary-alt`: `#1e293b` (Alternative primary text)
- `$text-secondary` / `--text-secondary`: `#64748b` (Secondary text)
- `$text-secondary-alt` / `--text-secondary-alt`: `#475569` (Alternative secondary text)
- `$text-muted` / `--text-muted`: `#94a3b8` (Muted text)
- `$text-light` / `--text-light`: `#e2e8f0` (Light text for dark backgrounds)
- `$text-dark` / `--text-dark`: `#1a202c` (Dark text)

### Background Colors
- `$bg-primary` / `--bg-primary`: `#ffffff` (Main background)
- `$bg-secondary` / `--bg-secondary`: `#f7fafc` (Secondary background)
- `$bg-secondary-alt` / `--bg-secondary-alt`: `#f8fafc` (Alternative secondary background)
- `$bg-tertiary` / `--bg-tertiary`: `#f1f5f9` (Tertiary background)
- `$bg-dark` / `--bg-dark`: `#1a202c` (Dark background)
- `$bg-dark-secondary` / `--bg-dark-secondary`: `#2d3748` (Secondary dark background)
- `$bg-dark-tertiary` / `--bg-dark-tertiary`: `#4a5568` (Tertiary dark background)

### Border Colors
- `$border-color` / `--border-color`: `#e2e8f0` (Main border color)
- `$border-hover` / `--border-hover`: `#cbd5e1` (Border hover state)
- `$border-dark` / `--border-dark`: `#2d3748` (Dark border)

### Neutral Colors
- `$gray-100` / `--gray-100`: `#f1f1f1`
- `$gray-200` / `--gray-200`: `#c1c1c1`
- `$gray-300` / `--gray-300`: `#a8a8a8`
- `$gray-400` / `--gray-400`: `#a0aec0`
- `$gray-500` / `--gray-500`: `#cbd5e0`

### Status Colors (for alerts, notifications)
- `$success-bg` / `--success-bg`: `#dcfce7` (Success background)
- `$success-text` / `--success-text`: `#166534` (Success text)
- `$warning-bg` / `--warning-bg`: `#fef3c7` (Warning background)
- `$warning-text` / `--warning-text`: `#92400e` (Warning text)
- `$error-bg` / `--error-bg`: `#fecaca` (Error background)
- `$error-text` / `--error-text`: `#991b1b` (Error text)
- `$info-bg` / `--info-bg`: `#f3e8ff` (Info background)
- `$info-text` / `--info-text`: `#7c3aed` (Info text)

## Available Mixins

### Gradient Mixins
- `@include gradient-primary` - Primary gradient
- `@include gradient-success` - Success gradient
- `@include gradient-warning` - Warning gradient
- `@include gradient-error` - Error gradient
- `@include gradient-dark` - Dark gradient

### Transparency Mixins
- `@include primary-transparency($opacity)` - Primary color with transparency
- `@include success-transparency($opacity)` - Success color with transparency
- `@include warning-transparency($opacity)` - Warning color with transparency
- `@include error-transparency($opacity)` - Error color with transparency

## Dark Theme Support

The color system automatically supports dark themes. When the `data-theme="dark"` attribute is set on the root element, the CSS custom properties will automatically switch to dark theme values.

## Migration Guide

### Before (Hardcoded Colors)
```scss
.my-component {
  background-color: #667eea;
  color: #2d3748;
  border: 1px solid #e2e8f0;
}
```

### After (Using Color System)
```scss
@import '../../../shared/styles';

.my-component {
  background-color: $primary-color;
  color: $text-primary;
  border: 1px solid $border-color;
}
```

## Best Practices

1. **Always use the color system** - Don't hardcode hex values
2. **Use semantic color names** - Choose colors based on their purpose, not their appearance
3. **Use CSS custom properties for dynamic theming** - They work better with JavaScript
4. **Use SCSS variables for static styles** - They're more performant
5. **Use mixins for complex patterns** - They ensure consistency

## Adding New Colors

To add a new color:

1. Add the SCSS variable in `_colors.scss`
2. Add the corresponding CSS custom property in the `:root` block
3. Add it to the dark theme overrides if needed
4. Update this documentation

Example:
```scss
// In _colors.scss
$new-color: #123456;

:root {
  --new-color: #{$new-color};
}
``` 