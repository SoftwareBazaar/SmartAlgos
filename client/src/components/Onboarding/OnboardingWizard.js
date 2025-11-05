import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check, Sparkles, Home, ShoppingBag, Activity, Wallet, Shield, Settings, CheckCircle } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Step Components
import WelcomeStep from './steps/WelcomeStep';
import DashboardTourStep from './steps/DashboardTourStep';
import EAMarketplaceStep from './steps/EAMarketplaceStep';
import SignalsStep from './steps/SignalsStep';
import PortfolioStep from './steps/PortfolioStep';
import SecurityStep from './steps/SecurityStep';
import CompletionStep from './steps/CompletionStep';

const ONBOARDING_STORAGE_KEY = 'algosmart_onboarding_completed';
const ONBOARDING_STEP_KEY = 'algosmart_onboarding_current_step';

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to Smart Algos',
    icon: Sparkles,
    component: WelcomeStep,
  },
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    icon: Home,
    component: DashboardTourStep,
  },
  {
    id: 'ea-marketplace',
    title: 'EA Marketplace',
    icon: ShoppingBag,
    component: EAMarketplaceStep,
  },
  {
    id: 'signals',
    title: 'Trading Signals',
    icon: Activity,
    component: SignalsStep,
  },
  {
    id: 'portfolio',
    title: 'Portfolio Management',
    icon: Wallet,
    component: PortfolioStep,
  },
  {
    id: 'security',
    title: 'Security & Settings',
    icon: Shield,
    component: SecurityStep,
  },
  {
    id: 'completion',
    title: 'You\'re All Set!',
    icon: CheckCircle,
    component: CompletionStep,
  },
];

const OnboardingWizard = ({ onComplete, show = true }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Check if onboarding should be shown
  useEffect(() => {
    if (!show) return;
    
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (completed === 'true') {
      if (onComplete) onComplete();
      return;
    }

    // Restore current step if wizard was closed mid-way
    const savedStep = localStorage.getItem(ONBOARDING_STEP_KEY);
    if (savedStep) {
      const stepIndex = parseInt(savedStep, 10);
      if (stepIndex >= 0 && stepIndex < steps.length) {
        setCurrentStep(stepIndex);
      }
    }
  }, [show, onComplete]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      localStorage.setItem(ONBOARDING_STEP_KEY, nextStep.toString());
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      localStorage.setItem(ONBOARDING_STEP_KEY, prevStep.toString());
    }
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    localStorage.removeItem(ONBOARDING_STEP_KEY);
    if (onComplete) onComplete();
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    localStorage.removeItem(ONBOARDING_STEP_KEY);
    if (onComplete) onComplete();
  };

  const handleJumpToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
    localStorage.setItem(ONBOARDING_STEP_KEY, stepIndex.toString());
  };

  if (!show) return null;

  // Validate current step index
  if (currentStep < 0 || currentStep >= steps.length) {
    console.error('[OnboardingWizard] Invalid step index:', currentStep);
    return null;
  }

  const currentStepData = steps[currentStep];
  if (!currentStepData || !currentStepData.component) {
    console.error('[OnboardingWizard] Invalid step data:', currentStepData);
    return null;
  }

  const CurrentStepComponent = currentStepData.component;
  
  // Validate that CurrentStepComponent is actually a React component
  if (typeof CurrentStepComponent !== 'function') {
    console.error('[OnboardingWizard] Invalid component type:', typeof CurrentStepComponent, CurrentStepComponent);
    return null;
  }

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden"
      >
        <Card className="bg-white dark:bg-gray-800 border-2 border-primary-500/20 shadow-2xl">
          {/* Header */}
          <div className="relative p-6 border-b border-gray-200 dark:border-gray-700">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary-500/10 dark:bg-primary-400/20 rounded-lg">
                  {React.createElement(currentStepData.icon, { className: "h-6 w-6 text-primary-600 dark:text-primary-400" })}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentStepData.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Step {currentStep + 1} of {steps.length}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Skip onboarding"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-center space-x-2 mt-6">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => handleJumpToStep(index)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    index === currentStep
                      ? 'bg-primary-500 text-white scale-110'
                      : completedSteps.has(index)
                      ? 'bg-primary-500/20 text-primary-600 dark:text-primary-400 hover:bg-primary-500/30'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  disabled={index > currentStep && !completedSteps.has(index)}
                >
                  {completedSteps.has(index) ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    React.createElement(step.icon, { className: "h-3 w-3" })
                  )}
                  <span className="hidden sm:inline">{step.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {typeof CurrentStepComponent === 'function' 
                  ? React.createElement(CurrentStepComponent, {
                      user: user || null,
                      onNavigate: navigate || (() => {}),
                      onComplete: handleComplete
                    })
                  : null
                }
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              {!isFirstStep && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  icon={ChevronLeft}
                  iconPosition="left"
                >
                  Previous
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-gray-500 dark:text-gray-400"
              >
                Skip Tour
              </Button>
              {isLastStep ? (
                <Button
                  variant="primary"
                  onClick={handleComplete}
                  icon={CheckCircle}
                  iconPosition="right"
                >
                  Get Started
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  icon={ChevronRight}
                  iconPosition="right"
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

// Hook to check if onboarding should be shown
export const useOnboarding = () => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    setShouldShow(completed !== 'true');
  }, []);

  const markAsCompleted = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    localStorage.removeItem(ONBOARDING_STEP_KEY);
    setShouldShow(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    localStorage.removeItem(ONBOARDING_STEP_KEY);
    setShouldShow(true);
  };

  return { shouldShow, markAsCompleted, resetOnboarding };
};

export default OnboardingWizard;

