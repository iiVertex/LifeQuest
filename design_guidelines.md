# AI Lifestyle Companion - Design Guidelines

## Design Philosophy & Tone
**Design DNA**: Fusion of Notion + Duolingo + Apple Health + ChatGPT — minimal interface that feels "alive"
- **Tone**: Calm, premium, trustworthy, motivating
- **Core Emotions**: Clarity, motivation, intelligence, progress
- **Golden Rule**: No clutter. Every pixel must communicate intent or state
- **Reference Inspiration**: Orgo App (structure & clarity), Adaptly (conversational UX), Disney AI Assistant (personality & tone)

## Color System
**Base Palette**:
- Neutral: #F7F8FA (light background), #EAEAEA (mid gray), #121212 (dark)

**Focus Area Accents** (color-coded by category):
- Driving: Blue #3A7BD5
- Health: Green #4CAF50
- Financial: Gold #FFB300

**Feedback Colors**:
- Success: Emerald #2ECC71
- Warning: Amber #F39C12
- Error: Red #E74C3C
- Info: Cyan #00BCD4

**Gradient Usage**: Only for subtle depth — never garish. Use adaptive glow for positive changes (green shift in simulator).

## Typography
**Font Family**: Inter / SF Pro / Manrope (geometric, clean, readable)

**Weight Hierarchy**:
- Headings: 600–700
- Body text: 400
- Labels/Buttons: 500

**Spacing Principles**:
- Generous white space
- Short, punchy copy
- Large readable headings
- 8pt baseline grid with 16–24px card padding

## Layout & Spacing
**Tailwind Spacing Units**: Primary units are 2, 4, 8, 12, 16, 20, 24
- Card padding: p-4 to p-6
- Section margins: my-8 to my-12
- Grid gaps: gap-4 to gap-6

**Container Strategy**:
- Cards: Rounded 16–24px corners, soft shadows (rgba(0,0,0,0.08))
- Modular card-based layout throughout
- Three main vertical zones per screen (stacked cleanly)

## Component Library

### Navigation
**Floating Bottom Nav**: Blur + shadow effect, color-coded active icons
- Icons: Home | Missions | Simulator | Social | Profile
- Always visible, adaptive glow on active state

### Cards & Containers
**Mission Cards**: 
- Horizontal scrollable format
- Icon + title + progress ring (circular, 75% style)
- Time remaining indicator
- Tap expands with upward curve motion

**Skill Tree Nodes**:
- Circular badges with XP numbers
- Completed: filled gradient ring
- Locked: gray + subtle lock icon
- AI-recommended: soft pulse animation

### Buttons
**Primary CTA**: Rounded 16px, soft shadows, accent gradient
- Hover/press states with smooth transitions
- When over images: blurred background, no additional hover effects needed

**Secondary Actions**: Outline style with accent color border

### Icons
**Style**: Lucide / Feather icons (line-based, consistent stroke)
- Use for category identification (Driving/Health/Finance)
- Micro-animations on interaction
- Small icons in notification dots

### Progress Visualizations
**XP Bar**: Radial/circular gradient bar with subtle glow
**Progress Rings**: Around avatars and mission cards showing completion %
**Skill Trees**: Branching structure with glowing next-recommended node

## Motion & Animation
**Animation Library**: Framer Motion principles — soft ease-out transitions, no bouncy effects

**Key Animations**:
- **Level-up**: Soft pulse + shimmer, controlled particle effect
- **Tab transitions**: Horizontal slide
- **AI assistant popup**: Scale from bottom center
- **Mission start**: Card expands with upward curve
- **Scenario simulation**: Dynamic value animation with gradient shift
- **Reward earned**: Particle-like confetti or shimmer (controlled, not noisy)

**Transition Timing**: Smooth in-out easing, 200-400ms duration

## Screen-Specific Layouts

### Onboarding (5 Screens)
1. **Welcome**: Logo fade-in, soft gradient background, single CTA
2. **AI Quiz**: One question per card, progress bar top center, color-coded focus icons
3. **Avatar**: Theme toggle (Light/Dark), avatar picker
4. **Integrations**: Optional link cards with skip button
5. **Summary**: Completion state with "Enter Dashboard" CTA

### Dashboard (3 Zones)
**Top**: Profile circle + XP level + quick stats (XP, streak days, level)
**Mid**: Horizontal scrolling mission cards with progress rings
**Bottom**: AI Feed card ("Next Best Action") + floating action buttons

**Background**: Soft blurred gradient based on user's primary focus color

### Mission & Skill Trees
**Layout**: 
- Top tabs for categories (Driving/Health/Finance)
- Mid: Visual tree with circular node badges
- Bottom drawer: Mission details modal

### Social/Collaborative
**Team Overview**: Friend avatars in row with XP rings, collaborative mission cards
**Minimal Chat**: Simple bubble UI for comments, muted notification dots

### Scenario Simulator
**Input Screen**: Sliders with real-time XP projection
**Output**: Animated chart/lifestyle score bar, AI summary text, "Convert to Mission" CTA
**Visual**: Apple Health–like simplicity

### Rewards Dashboard
**Tabs**: Coins | Badges | Partner Deals
**Layout**: XP circular gradient bar, grid of achievement badges, horizontal carousel for partner offers

### Profile & Settings
**Sections**: Profile summary, customization, linked apps, privacy, data insights
**Style**: Clean tabs, toggle switches, transparent data contribution visualization

## Images
**Avatar System**: Customizable user avatars (circular chips throughout UI)
**Mission Icons**: Category-specific icons for Driving/Health/Finance challenges
**Background Effects**: Subtle AI particle effects or soft gradients (never distracting photos)
**No Hero Images**: This is a dashboard-focused app, not marketing-style layouts

## Accessibility & Responsiveness
- High-contrast typography maintained throughout
- Touch targets minimum 44px
- Color-coding always paired with icons/text
- Smooth responsive scaling from mobile to desktop
- Notification settings for frequency and tone control

## Critical Design Principles
1. **UI Must Breathe**: White space carries emotional weight
2. **Never Overload**: Minimal text and icons per screen
3. **AI as Invisible Guide**: Not a chatbot interface, but ambient intelligence
4. **Premium Not Playful**: Sophisticated gamification, not childish
5. **Adaptive Intelligence**: UI responds to user behavior and progress
6. **Modular Clarity**: Card-based system with consistent spacing