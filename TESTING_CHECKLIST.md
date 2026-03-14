# Archive AI - Option 2.5 Testing Checklist

## Installation Steps

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open http://localhost:3000
```

## Feature Testing

### Dashboard Page (`/dashboard`)

#### Empty State
- [ ] Shows welcome message with upload CTA
- [ ] Bouncing animation on the ☰ icon
- [ ] "Upload your archive →" button has gradient and hover effect

#### With Data
- [ ] 3 stat cards appear with staggered animations
- [ ] StatCard values fade in and scale up on load
- [ ] StatCards have subtle hover glow effect
- [ ] Quick action cards (Generate, Re-voice, Browse) display in 3-column grid
- [ ] Quick action cards have hover scale (1.02x) and Y-axis shift
- [ ] Voice profile card appears with animated confidence meter
- [ ] Confidence meter width animates from 0% to target
- [ ] Theme badges have scale hover effect
- [ ] Engagement chart renders (if data exists)
- [ ] Top posts list shows with staggered entrance
- [ ] Each post card has hover highlight with color-matched background

### Generate Page (`/dashboard/generate`)

#### Layout
- **Desktop (1024px+)**:
  - [ ] Voice profile card is sticky on left side
  - [ ] Generation form is on right side
  - [ ] Split view maintains alignment as user scrolls
  
- **Tablet (768px-1023px)**:
  - [ ] Voice profile card on top
  - [ ] Generation form below
  - [ ] Full width responsive
  
- **Mobile (<768px)**:
  - [ ] Voice profile card on top
  - [ ] Generation form below
  - [ ] Single column layout
  - [ ] Touch targets are ≥44x44px

#### Animations
- [ ] Voice profile card fades in from left with slight scale
- [ ] Generation form fades in from right
- [ ] Recommendation box slides up with accent color
- [ ] Pill buttons have glow effect when selected
- [ ] Generate button scales on hover (not when disabled)
- [ ] Generated result fades in with scale animation
- [ ] Error message slides in from top
- [ ] Copy button shows "✓ Copied!" feedback for 2 seconds

#### Interactions
- [ ] Topic textarea is focusable and shows accent border on focus
- [ ] Format selection updates active style instantly
- [ ] Generate button is disabled when topic is empty
- [ ] Loading state shows spinner with "Generating in your voice..." text
- [ ] Generate button shows loading state during API call
- [ ] Result section shows with Regenerate and Copy buttons
- [ ] Regenerate button triggers a new generation
- [ ] Copy button copies full result text to clipboard

### Components

#### VoiceProfileCard
- [ ] Shows "No Voice Profile Yet" state when empty
- [ ] Loads with fade-in animation
- [ ] Confidence meter animates
- [ ] Theme badges scale on hover
- [ ] Responsive text sizing (mobile: smaller, desktop: larger)

#### StatCard
- [ ] Appears with fade-in + slide up animation
- [ ] Value text scales in slightly after label
- [ ] Hover effect: scale 1.02x with subtle border glow
- [ ] Gradient background visible
- [ ] Accent blob visible in top-right corner

#### PostCard
- [ ] Animates in on load
- [ ] Hover effect: scale 1.01x, border color changes
- [ ] Color-matched gradient overlay appears on hover
- [ ] Engagement metrics scale 1.15x on hover
- [ ] Type badge scales 1.1x on hover
- [ ] "TOP X%" badge appears with staggered entrance
- [ ] Re-voice button visible and clickable

#### Pill (Format Selector)
- [ ] Active pill shows glow shadow animation
- [ ] Inactive pill scales 1.05x on hover
- [ ] Selected pill has accent/10 background
- [ ] All pills have smooth transitions

### Mobile Responsiveness

#### Typography
- [ ] Dashboard title is `text-2xl` on mobile, `text-3xl` on desktop
- [ ] Subtitles are readable and properly scaled
- [ ] All text fits within viewport width
- [ ] No horizontal scrolling for text content

#### Spacing
- [ ] Padding scales: `p-6 md:p-8 lg:p-9`
- [ ] Gaps between cards are consistent
- [ ] Mobile: minimum padding maintains readability
- [ ] Desktop: generous padding for breathing room

#### Touch Interactions
- [ ] All buttons scale down to 0.95 on tap
- [ ] Buttons are easy to tap (≥44x44px)
- [ ] No hover states on mobile (uses tap instead)
- [ ] Smooth scrolling works on all sections

#### Orientation
- [ ] Portrait mode: full width columns
- [ ] Landscape mode: maintains 2-3 column grid
- [ ] Charts don't overflow on landscape tablet
- [ ] Sticky voice profile works in landscape

### Performance

- [ ] Page loads quickly (under 3s on 4G)
- [ ] Animations are smooth (60fps, no jank)
- [ ] No console errors on page load
- [ ] Voice profile loads lazily with spinner
- [ ] Data fetches happen in parallel (no waterfall)

### Cross-Browser Testing

- [ ] Chrome/Edge: Full support ✅
- [ ] Safari (desktop): Smooth animations ✅
- [ ] Safari (iOS): Touch responsive ✅
- [ ] Firefox: All features work ✅
- [ ] Chrome Mobile: Responsive layout ✅

### Accessibility

- [ ] All buttons are keyboard focusable (Tab key)
- [ ] Focus rings are visible (outline: 2px solid #7c6aef)
- [ ] Links have understandable text ("View all →")
- [ ] Color is not the only indicator (labels + badges)
- [ ] Animations don't interfere with screen readers

## Common Issues to Check

### If Animations Are Jittery
- [ ] Check that GPU acceleration is working
- [ ] Verify framer-motion is using transform/opacity only
- [ ] Check browser DevTools Performance tab

### If Mobile Layout Looks Wrong
- [ ] Clear browser cache (Shift+Ctrl+R)
- [ ] Check viewport meta tag in layout.js
- [ ] Test in device emulation mode (DevTools)

### If Voice Profile Card Doesn't Load
- [ ] Check network tab in DevTools
- [ ] Verify Supabase connection
- [ ] Look for error messages in console
- [ ] Confirm voice_profiles table has data

### If Copy Button Doesn't Work
- [ ] Check that result text is properly formatted
- [ ] Verify clipboard API is available (HTTPS/localhost)
- [ ] Look for permission issues in console

## Next Testing Phase (Post-Launch)

- [ ] Real user feedback collection
- [ ] A/B test with original dashboard
- [ ] Performance monitoring (Lighthouse)
- [ ] Conversion tracking on Generate CTA
- [ ] Error logging for failed generations

---

**Estimated Testing Time**: 30-45 minutes  
**Critical Path**: Dashboard + Generate pages + Mobile view  
**Nice-to-Have**: All browsers + accessibility pass
