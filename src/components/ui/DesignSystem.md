# AI Assistant Pro - Design System

## Overview
This design system provides a unified set of components, tokens, and guidelines for building consistent user interfaces across the AI Assistant Pro application.

## Design Tokens

### Colors
Our color system uses HSL values for better manipulation and consistency across light and dark themes.

#### Light Theme
- **Background**: `hsl(0 0% 100%)` - Pure white
- **Foreground**: `hsl(222.2 84% 4.9%)` - Dark slate
- **Primary**: `hsl(222.2 47.4% 11.2%)` - Dark blue-gray
- **Secondary**: `hsl(210 40% 96%)` - Light gray-blue
- **Muted**: `hsl(210 40% 96%)` - Subtle background
- **Accent**: `hsl(210 40% 96%)` - Highlight color
- **Destructive**: `hsl(0 84.2% 60.2%)` - Error red
- **Border**: `hsl(214.3 31.8% 91.4%)` - Light border

#### Dark Theme
- **Background**: `hsl(222.2 84% 4.9%)` - Dark slate
- **Foreground**: `hsl(210 40% 98%)` - Near white
- **Primary**: `hsl(210 40% 98%)` - Light text
- **Secondary**: `hsl(217.2 32.6% 17.5%)` - Dark gray
- **Muted**: `hsl(217.2 32.6% 17.5%)` - Subtle dark
- **Accent**: `hsl(217.2 32.6% 17.5%)` - Dark highlight
- **Destructive**: `hsl(0 62.8% 30.6%)` - Dark red
- **Border**: `hsl(217.2 32.6% 17.5%)` - Dark border

### Typography
- **Font Family**: Inter (sans-serif), Space Mono (monospace)
- **Font Sizes**: Following Tailwind's scale (text-xs to text-9xl)
- **Font Weights**: 300 (light), 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Spacing
- **Base Unit**: 0.25rem (4px)
- **Scale**: 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64, 72, 80, 96
- **Custom**: 18 (4.5rem), 88 (22rem)

### Border Radius
- **Small**: `calc(var(--radius) - 4px)`
- **Medium**: `calc(var(--radius) - 2px)`
- **Large**: `var(--radius)` (0.5rem)

## Components

### Button
Versatile button component with multiple variants and sizes.

**Variants:**
- `primary` - Main action button
- `secondary` - Secondary actions
- `outline` - Outlined button
- `ghost` - Minimal button
- `destructive` - Dangerous actions

**Sizes:**
- `sm` - Small (h-8)
- `md` - Medium (h-9) - Default
- `lg` - Large (h-10)
- `icon` - Square icon button (h-9 w-9)

### Card
Container component for grouping related content.

**Sub-components:**
- `CardHeader` - Top section with title/description
- `CardTitle` - Main heading
- `CardDescription` - Subtitle text
- `CardContent` - Main content area
- `CardFooter` - Bottom section for actions

### Input & Textarea
Form input components with consistent styling and error states.

**Features:**
- Label integration
- Error state handling
- Focus ring styling
- Accessibility support

### Badge
Small status indicators and labels.

**Variants:**
- `default` - Primary badge
- `secondary` - Secondary badge
- `destructive` - Error/warning badge
- `outline` - Outlined badge
- `success` - Success state
- `warning` - Warning state

### Loading & Skeleton
Loading states and placeholder components.

**Loading Variants:**
- `spinner` - Rotating spinner
- `dots` - Animated dots
- `pulse` - Pulsing circle

**Skeleton:**
- Animated placeholder for content loading

## Layout Components

### Container
Responsive container with max-width constraints.

**Sizes:**
- `sm` - max-w-2xl
- `md` - max-w-4xl
- `lg` - max-w-6xl
- `xl` - max-w-7xl (default)
- `full` - max-w-full

### Section
Page section wrapper with consistent spacing.

**Variants:**
- `default` - Standard background
- `accent` - Subtle accent background
- `muted` - Muted background

**Sizes:**
- `sm` - py-8 sm:py-12
- `md` - py-12 sm:py-16
- `lg` - py-16 sm:py-20 (default)
- `xl` - py-20 sm:py-24

## Animations

### Built-in Animations
- `fade-in` - Fade in effect
- `fade-in-up` - Fade in with upward motion
- `fade-in-scale` - Fade in with scale
- `float` - Floating animation
- `pulse-slow` - Slow pulse
- `shimmer` - Shimmer effect
- `bounce-gentle` - Gentle bounce

### Hover Effects
- Scale transforms on buttons
- Color transitions
- Shadow changes
- Icon rotations

## Accessibility

### Focus Management
- Visible focus rings
- Keyboard navigation support
- Screen reader compatibility

### Color Contrast
- WCAG AA compliant color combinations
- High contrast mode support

### Semantic HTML
- Proper heading hierarchy
- Landmark regions
- Form labels and descriptions

## Usage Guidelines

### Component Composition
```tsx
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Example Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="primary">Action</Button>
      </CardContent>
    </Card>
  )
}
```

### Theme Integration
Components automatically adapt to light/dark themes using CSS variables.

### Responsive Design
- Mobile-first approach
- Breakpoint-aware components
- Touch-friendly interactions

## Best Practices

1. **Consistency**: Use design tokens for all styling
2. **Accessibility**: Include proper ARIA labels and keyboard support
3. **Performance**: Lazy load non-critical components
4. **Maintainability**: Keep components focused and composable
5. **Testing**: Test components in both light and dark themes

## Future Enhancements

- [ ] Additional component variants
- [ ] Animation presets
- [ ] Color palette expansion
- [ ] Component documentation site
- [ ] Storybook integration 