'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  BookOpen,
  User,
  School,
  ClipboardList,
  Brain,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AP_CSA_TOPICS } from '@/data/topics';

type Step = 'classes' | 'profile' | 'units' | 'assessment';

interface OnboardingData {
  apClasses: string[];
  gradeLevel: string;
  age: string;
  birthday: string;
  highSchool: string;
  completedUnits: string[];
}

const gradeOptions = [
  { value: '9', label: '9th Grade (Freshman)' },
  { value: '10', label: '10th Grade (Sophomore)' },
  { value: '11', label: '11th Grade (Junior)' },
  { value: '12', label: '12th Grade (Senior)' },
];

const apClasses = [
  { id: 'ap-csa', name: 'AP Computer Science A', available: true, icon: '💻' },
  { id: 'ap-csp', name: 'AP Computer Science Principles', available: false, icon: '🖥️' },
  { id: 'ap-calc-ab', name: 'AP Calculus AB', available: false, icon: '📐' },
  { id: 'ap-calc-bc', name: 'AP Calculus BC', available: false, icon: '📊' },
  { id: 'ap-physics-1', name: 'AP Physics 1', available: false, icon: '⚛️' },
  { id: 'ap-bio', name: 'AP Biology', available: false, icon: '🧬' },
  { id: 'ap-chem', name: 'AP Chemistry', available: false, icon: '🧪' },
  { id: 'ap-stats', name: 'AP Statistics', available: false, icon: '📈' },
];

// Get unique units from topics
const getUnits = () => {
  const unitMap = new Map<number, { id: number; name: string; topics: number }>();
  AP_CSA_TOPICS.forEach(topic => {
    if (!unitMap.has(topic.unitNumber)) {
      unitMap.set(topic.unitNumber, {
        id: topic.unitNumber,
        name: `Unit ${topic.unitNumber}: ${getUnitName(topic.unitNumber)}`,
        topics: 0,
      });
    }
    const unit = unitMap.get(topic.unitNumber)!;
    unit.topics++;
  });
  return Array.from(unitMap.values()).sort((a, b) => a.id - b.id);
};

function getUnitName(unit: number): string {
  const unitNames: Record<number, string> = {
    1: 'Primitive Types',
    2: 'Using Objects',
    3: 'Boolean Expressions and if Statements',
    4: 'Iteration',
    5: 'Writing Classes',
    6: 'Array',
    7: 'ArrayList',
    8: '2D Array',
    9: 'Inheritance',
    10: 'Recursion',
  };
  return unitNames[unit] || `Unit ${unit}`;
}

const steps: { id: Step; title: string; icon: React.ElementType }[] = [
  { id: 'classes', title: 'AP Classes', icon: BookOpen },
  { id: 'profile', title: 'About You', icon: User },
  { id: 'units', title: 'Progress', icon: ClipboardList },
  { id: 'assessment', title: 'Assessment', icon: Brain },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('classes');
  const [isLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    apClasses: [],
    gradeLevel: '',
    age: '',
    birthday: '',
    highSchool: '',
    completedUnits: [],
  });

  const units = getUnits();
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const toggleClass = (classId: string) => {
    const isSelected = data.apClasses.includes(classId);
    if (isSelected) {
      updateData({ apClasses: data.apClasses.filter(c => c !== classId) });
    } else {
      updateData({ apClasses: [...data.apClasses, classId] });
    }
  };

  const toggleUnit = (unitId: string) => {
    const isSelected = data.completedUnits.includes(unitId);
    if (isSelected) {
      updateData({ completedUnits: data.completedUnits.filter(u => u !== unitId) });
    } else {
      updateData({ completedUnits: [...data.completedUnits, unitId] });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'classes':
        return data.apClasses.length > 0;
      case 'profile':
        return data.gradeLevel && data.age && data.birthday && data.highSchool.trim();
      case 'units':
        return true; // Can proceed even with no units selected
      case 'assessment':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const handleStartAssessment = () => {
    // Save onboarding data to localStorage for now
    localStorage.setItem('onboardingData', JSON.stringify(data));
    // Navigate to assessment
    router.push('/onboarding/assessment');
  };

  return (
    <div className="min-h-screen gradient-bg-hero">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        backgroundColor: isCompleted
                          ? '#6B9E78'
                          : isActive
                          ? '#E07856'
                          : '#E8E4DD',
                      }}
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                        isActive || isCompleted ? 'text-white' : 'text-charcoal-light'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </motion.div>
                    <span
                      className={cn(
                        'text-xs mt-2 font-medium',
                        isActive ? 'text-charcoal' : 'text-charcoal-light'
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'w-16 md:w-24 h-1 mx-2 rounded-full transition-colors',
                        index < currentStepIndex ? 'bg-success' : 'bg-cream-300'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Card */}
        <Card className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <AnimatePresence mode="wait">
            {/* Step 1: Select AP Classes */}
            {currentStep === 'classes' && (
              <motion.div
                key="classes"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-charcoal">
                    Which AP classes are you taking?
                  </h1>
                  <p className="mt-2 text-charcoal-light">
                    Select all that apply. More subjects coming soon!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {apClasses.map((apClass) => {
                    const isSelected = data.apClasses.includes(apClass.id);
                    return (
                      <motion.button
                        key={apClass.id}
                        onClick={() => apClass.available && toggleClass(apClass.id)}
                        disabled={!apClass.available}
                        whileHover={apClass.available ? { scale: 1.02 } : {}}
                        whileTap={apClass.available ? { scale: 0.98 } : {}}
                        className={cn(
                          'relative p-4 rounded-xl border-2 text-left transition-all',
                          apClass.available
                            ? isSelected
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-cream-300 hover:border-cream-400 bg-white'
                            : 'border-cream-200 bg-cream-100 opacity-60 cursor-not-allowed'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{apClass.icon}</span>
                          <div className="flex-1">
                            <p className="font-medium text-charcoal">{apClass.name}</p>
                            {!apClass.available && (
                              <p className="text-xs text-charcoal-muted">Coming Soon</p>
                            )}
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 2: Profile Information */}
            {currentStep === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-charcoal">Tell us about yourself</h1>
                  <p className="mt-2 text-charcoal-light">
                    This helps us personalize your learning experience
                  </p>
                </div>

                <div className="space-y-5 max-w-md mx-auto">
                  {/* Grade Level */}
                  <div className="space-y-2">
                    <Label className="text-charcoal font-medium">Grade Level</Label>
                    <Select
                      value={data.gradeLevel}
                      onValueChange={(value) => updateData({ gradeLevel: value })}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-cream-300 bg-cream-100">
                        <SelectValue placeholder="Select your grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Age */}
                  <div className="space-y-2">
                    <Label className="text-charcoal font-medium">Age</Label>
                    <Select
                      value={data.age}
                      onValueChange={(value) => updateData({ age: value })}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-cream-300 bg-cream-100">
                        <SelectValue placeholder="Select your age" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 8 }, (_, i) => i + 13).map((age) => (
                          <SelectItem key={age} value={age.toString()}>
                            {age} years old
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Birthday */}
                  <div className="space-y-2">
                    <Label className="text-charcoal font-medium">Birthday</Label>
                    <Input
                      type="date"
                      value={data.birthday}
                      onChange={(e) => updateData({ birthday: e.target.value })}
                      className="h-11 rounded-xl border-cream-300 bg-cream-100 focus:border-primary-500"
                    />
                  </div>

                  {/* High School */}
                  <div className="space-y-2">
                    <Label className="text-charcoal font-medium">High School</Label>
                    <div className="relative">
                      <School className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-light" />
                      <Input
                        type="text"
                        placeholder="Enter your high school name"
                        value={data.highSchool}
                        onChange={(e) => updateData({ highSchool: e.target.value })}
                        className="h-11 pl-10 rounded-xl border-cream-300 bg-cream-100 focus:border-primary-500 placeholder:text-charcoal-muted"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Unit Selection */}
            {currentStep === 'units' && (
              <motion.div
                key="units"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-charcoal">
                    What have you learned so far?
                  </h1>
                  <p className="mt-2 text-charcoal-light">
                    Select the units you&apos;ve already covered in class
                  </p>
                </div>

                <div className="space-y-3">
                  {units.map((unit, index) => {
                    const isSelected = data.completedUnits.includes(unit.id.toString());
                    return (
                      <motion.button
                        key={unit.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => toggleUnit(unit.id.toString())}
                        className={cn(
                          'w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4',
                          isSelected
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-cream-300 hover:border-cream-400 bg-white'
                        )}
                      >
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg',
                            isSelected
                              ? 'bg-primary-500 text-white'
                              : 'bg-cream-200 text-charcoal'
                          )}
                        >
                          {unit.id}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-charcoal">{unit.name}</p>
                          <p className="text-sm text-charcoal-light">
                            {unit.topics} topics
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="w-5 h-5 text-primary-500" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                <p className="text-center text-sm text-charcoal-muted mt-6">
                  Don&apos;t worry if you haven&apos;t started yet - just click Next!
                </p>
              </motion.div>
            )}

            {/* Step 4: Assessment Introduction */}
            {currentStep === 'assessment' && (
              <motion.div
                key="assessment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Sparkles className="w-10 h-10 text-primary-500" />
                </motion.div>

                <h1 className="text-2xl font-bold text-charcoal mb-3">
                  Let&apos;s See Where You&apos;re At!
                </h1>
                <p className="text-charcoal-light mb-8 max-w-md mx-auto">
                  We&apos;ll give you a quick 15-question assessment mixing multiple choice
                  and free response questions to understand your current skill level.
                </p>

                <div className="bg-cream-100 rounded-xl p-6 mb-8 max-w-md mx-auto">
                  <h3 className="font-semibold text-charcoal mb-4">Assessment Details</h3>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-bold">15</span>
                      </div>
                      <span className="text-charcoal">Questions total</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-bold">10</span>
                      </div>
                      <span className="text-charcoal">Multiple choice questions</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 font-bold">5</span>
                      </div>
                      <span className="text-charcoal">Free response questions</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                        <span className="text-amber-600 font-bold">~</span>
                      </div>
                      <span className="text-charcoal">Takes about 20-30 minutes</span>
                    </div>
                  </div>
                </div>

                {data.completedUnits.length > 0 && (
                  <p className="text-sm text-charcoal-light mb-6">
                    Questions will cover Units{' '}
                    {data.completedUnits.sort((a, b) => Number(a) - Number(b)).join(', ')}
                  </p>
                )}

                <Button
                  onClick={handleStartAssessment}
                  disabled={isLoading}
                  className="bg-primary-500 hover:bg-primary-600 text-white rounded-xl px-8 h-12 text-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      Start Assessment
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                <button
                  onClick={() => router.push('/dashboard')}
                  className="block mx-auto mt-4 text-sm text-charcoal-light hover:text-charcoal transition-colors"
                >
                  Skip for now
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {currentStep !== 'assessment' && (
            <div className="flex justify-between mt-8 pt-6 border-t border-cream-200">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStepIndex === 0}
                className="border-cream-300 text-charcoal hover:bg-cream-100 rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-primary-500 hover:bg-primary-600 text-white rounded-xl"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
