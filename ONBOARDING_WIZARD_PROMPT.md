# Prompt for Claude: Create Onboarding Wizard for Smart Algos Trading Platform

## Context
I need you to create a comprehensive, professional onboarding wizard for my Smart Algos Trading Platform - a SaaS fintech platform for algorithmic trading. The platform targets institutional hedge funds and professional traders with a $5,000+ pricing tier.

## Technical Stack
- **Frontend**: React 18 with React Router v6
- **Styling**: Tailwind CSS with dark mode support
- **Animation**: Framer Motion (already installed)
- **Icons**: Lucide React (already installed)
- **State Management**: React Context API (AuthContext, ThemeContext)
- **File Structure**: Components in `client/src/components/`, Pages in `client/src/pages/`

## Requirements

### 1. **Component Structure**
Create a reusable `OnboardingWizard` component that:
- Uses a step-by-step flow with progress indicator
- Supports skip functionality (users can skip steps or exit)
- Saves progress to localStorage
- Can be triggered on first login or manually from settings
- Uses Framer Motion for smooth transitions between steps

### 2. **Onboarding Steps (5-7 steps)**

#### Step 1: Welcome & Platform Overview
- Welcome message personalized with user's first name
- Brief overview of platform capabilities:
  - Trading signals and market analysis
  - EA Marketplace (Expert Advisors)
  - Portfolio management
  - HFT (High-Frequency Trading) bots
- Visual tour of key features with icons/illustrations
- Call-to-action: "Get Started" button

#### Step 2: Dashboard Tour
- Highlight key dashboard sections:
  - Portfolio summary cards
  - Active EAs section
  - Trading signals widget
  - Quick stats
- Interactive tooltips/spotlights pointing to actual dashboard elements
- Show how to navigate between sections

#### Step 3: EA Marketplace Introduction
- Explain what Expert Advisors are
- Show how to browse, filter, and purchase EAs
- Highlight subscription models (weekly/monthly/yearly)
- Demo of EA detail page features
- Security and escrow information

#### Step 4: Trading Signals & Markets
- Explain trading signals feature
- Show how to subscribe to signals
- Market data and analysis tools
- Risk disclaimers and compliance notices
- How to use signals for trading decisions

#### Step 5: Portfolio Management
- How to create and manage portfolios
- Performance tracking and analytics
- Risk assessment features
- Setting up alerts and notifications

#### Step 6: Security & Account Setup (Optional)
- Two-factor authentication setup (if not already enabled)
- API key management
- Security best practices
- Audit trail access

#### Step 7: Final Step - Get Started
- Summary of what they've learned
- Quick links to key features
- Option to enable email notifications
- "Complete Setup" button that marks onboarding as complete

### 3. **Design Requirements**
- **Color Scheme**: Use existing color palette (purple/pink/blue gradients, Spotify-like dark theme support)
- **Typography**: Inter/Roboto fonts (already configured)
- **Spacing**: Use 8/16/24px grid system
- **Components**: 
  - Use existing UI components (Card, Button, Input) from `client/src/components/UI/`
  - Create new wizard-specific components if needed
- **Responsive**: Must work on desktop, tablet, and mobile
- **Accessibility**: WCAG AA compliant, keyboard navigation support

### 4. **User Experience Features**
- **Progress Indicator**: Show current step (e.g., "Step 2 of 7")
- **Navigation**: 
  - Previous/Next buttons
  - Skip button (optional)
  - Exit/Close button (saves progress)
- **Animations**: 
  - Smooth transitions between steps
  - Highlight animations for featured elements
  - Fade-in effects for content
- **Persistence**: 
  - Save completion status in localStorage
  - Option to restart onboarding from Settings
  - Don't show again if completed

### 5. **Integration Points**
- **AuthContext**: Check if user is new (based on account creation date or first login)
- **Settings Page**: Add "Restart Onboarding" option in Preferences tab
- **Dashboard**: Show onboarding wizard on first visit for new users
- **App.js**: Add route for onboarding wizard (optional, if needed as standalone page)

### 6. **Technical Implementation Details**
- Create component: `client/src/components/Onboarding/OnboardingWizard.js`
- Create hook: `client/src/hooks/useOnboarding.js` (optional, for state management)
- Use existing utilities:
  - `client/src/utils/formatting.js` for date formatting
  - `client/src/components/UI/Card.js` for containers
  - `client/src/components/UI/Button.js` for actions
- Integration with existing routes:
  - Dashboard (`/dashboard`)
  - EA Marketplace (`/ea-marketplace`)
  - Signals (`/signals`)
  - Portfolio (`/portfolio`)
  - Settings (`/settings`)

### 7. **Code Quality Standards**
- Use TypeScript-style JSDoc comments for functions
- Follow existing code patterns and naming conventions
- Use functional components with hooks
- Proper error handling
- Clean, readable, maintainable code
- Responsive design with Tailwind breakpoints
- Dark mode support using `dark:` classes

### 8. **Example Code Pattern to Follow**
```javascript
// Example structure (you can improve this)
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { X, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

const OnboardingWizard = ({ isOpen, onClose, onComplete }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  
  // Steps configuration
  const steps = [
    { id: 'welcome', title: 'Welcome to Smart Algos', component: WelcomeStep },
    // ... more steps
  ];
  
  // Implementation...
};
```

### 9. **Additional Features to Consider**
- **Tooltips/Spotlights**: Use a library like `react-joyride` or create custom spotlight effect
- **Video Tutorials**: Optional video embeds for complex features
- **Interactive Demos**: Allow users to interact with features during onboarding
- **Progress Persistence**: Save which steps user has seen
- **Skip Options**: Allow skipping individual steps or entire sections
- **Completion Reward**: Show success message or achievement badge

### 10. **Files to Create/Modify**
**New Files:**
- `client/src/components/Onboarding/OnboardingWizard.js` (main component)
- `client/src/components/Onboarding/OnboardingStep.js` (reusable step wrapper)
- `client/src/components/Onboarding/ProgressIndicator.js` (progress bar/navigation)
- `client/src/components/Onboarding/steps/WelcomeStep.js`
- `client/src/components/Onboarding/steps/DashboardTourStep.js`
- `client/src/components/Onboarding/steps/EAMarketplaceStep.js`
- `client/src/components/Onboarding/steps/SignalsStep.js`
- `client/src/components/Onboarding/steps/PortfolioStep.js`
- `client/src/components/Onboarding/steps/SecurityStep.js`
- `client/src/components/Onboarding/steps/CompleteStep.js`

**Files to Modify:**
- `client/src/pages/Dashboard/Dashboard.js` - Trigger onboarding for new users
- `client/src/pages/Settings/Settings.js` - Add "Restart Onboarding" button
- `client/src/App.js` - Add onboarding route if needed

### 11. **Success Criteria**
The onboarding wizard should:
- ✅ Be visually appealing and professional
- ✅ Guide users through key platform features
- ✅ Be skippable but encourage completion
- ✅ Save progress and allow resumption
- ✅ Work seamlessly with existing dark/light themes
- ✅ Be responsive across all device sizes
- ✅ Follow platform's design system and color palette
- ✅ Integrate smoothly with existing authentication and routing

### 12. **Deliverables**
Please provide:
1. Complete onboarding wizard component with all steps
2. Integration code for Dashboard and Settings pages
3. Proper styling with Tailwind CSS
4. Animation effects using Framer Motion
5. localStorage persistence logic
6. Clear documentation/comments in code

### 13. **Design Inspiration**
- Use modern fintech onboarding patterns (like Stripe, Plaid, or TradingView)
- Professional, clean, and trustworthy appearance
- Smooth animations and transitions
- Clear call-to-actions
- Progress indicators that show completion status

---

**Please create a comprehensive, production-ready onboarding wizard that helps new users understand and navigate the Smart Algos Trading Platform effectively. The wizard should feel professional, polished, and aligned with the platform's $5,000+ SaaS hedge fund target audience.**

