'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    <div className="min-h-screen bg-cream-50">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="h-1 bg-cream-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-sm text-charcoal-light mt-2">
            Step {currentStepIndex + 1} of {steps.length}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-8 md:p-12">
          <AnimatePresence mode="wait">
            {/* Step 1: Select AP Classes */}
            {currentStep === 'classes' && (
              <motion.div
                key="classes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-3xl font-bold text-charcoal mb-2">
                  Which AP classes are you taking?
                </h1>
                <p className="text-charcoal-light mb-8">
                  Select all that apply. More subjects coming soon!
                </p>

                <div className="space-y-3">
                  {apClasses.map((apClass) => {
                    const isSelected = data.apClasses.includes(apClass.id);
                    return (
                      <button
                        key={apClass.id}
                        onClick={() => apClass.available && toggleClass(apClass.id)}
                        disabled={!apClass.available}
                        className={cn(
                          'w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4',
                          apClass.available
                            ? isSelected
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-cream-300 hover:border-charcoal-light/40 bg-white'
                            : 'border-cream-200 bg-cream-100 opacity-50 cursor-not-allowed'
                        )}
                      >
                        <span className="text-2xl">{apClass.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-charcoal">{apClass.name}</p>
                          {!apClass.available && (
                            <p className="text-xs text-charcoal-light">Coming Soon</p>
                          )}
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 2: Profile Information */}
            {currentStep === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-3xl font-bold text-charcoal mb-2">
                  Tell us about yourself
                </h1>
                <p className="text-charcoal-light mb-8">
                  This helps us personalize your learning experience.
                </p>

                <div className="space-y-6">
                  {/* Grade Level */}
                  <div>
                    <Label className="text-sm text-charcoal font-medium mb-2 block">Grade Level</Label>
                    <Select
                      value={data.gradeLevel}
                      onValueChange={(value) => updateData({ gradeLevel: value })}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-cream-300 bg-cream-50 focus:border-charcoal">
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
                  <div>
                    <Label className="text-sm text-charcoal font-medium mb-2 block">Age</Label>
                    <Select
                      value={data.age}
                      onValueChange={(value) => updateData({ age: value })}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-cream-300 bg-cream-50 focus:border-charcoal">
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
                  <div>
                    <Label className="text-sm text-charcoal font-medium mb-2 block">Birthday</Label>
                    <Input
                      type="date"
                      value={data.birthday}
                      onChange={(e) => updateData({ birthday: e.target.value })}
                      className="h-12 rounded-xl border-cream-300 bg-cream-50 focus:border-charcoal"
                    />
                  </div>

                  {/* High School */}
                  <div>
                    <Label className="text-sm text-charcoal font-medium mb-2 block">High School</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Lincoln High School"
                      value={data.highSchool}
                      onChange={(e) => updateData({ highSchool: e.target.value })}
                      className="h-12 rounded-xl border-cream-300 bg-cream-50 focus:border-charcoal placeholder:text-charcoal-light/50"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Unit Selection */}
            {currentStep === 'units' && (
              <motion.div
                key="units"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-3xl font-bold text-charcoal mb-2">
                  What have you learned so far?
                </h1>
                <p className="text-charcoal-light mb-8">
                  Select the units you&apos;ve already covered in class.
                </p>

                <div className="space-y-3">
                  {units.map((unit) => {
                    const isSelected = data.completedUnits.includes(unit.id.toString());
                    return (
                      <button
                        key={unit.id}
                        onClick={() => toggleUnit(unit.id.toString())}
                        className={cn(
                          'w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4',
                          isSelected
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-cream-300 hover:border-charcoal-light/40 bg-white'
                        )}
                      >
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center font-bold',
                            isSelected
                              ? 'bg-primary-500 text-white'
                              : 'bg-cream-200 text-charcoal'
                          )}
                        >
                          {unit.id}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-charcoal">{unit.name}</p>
                          <p className="text-sm text-charcoal-light">{unit.topics} topics</p>
                        </div>
                        {isSelected && (
                          <Check className="w-5 h-5 text-primary-500" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <p className="text-center text-sm text-charcoal-light mt-6">
                  Don&apos;t worry if you haven&apos;t started yet - just click Next!
                </p>
              </motion.div>
            )}

            {/* Step 4: Assessment Introduction */}
            {currentStep === 'assessment' && (
              <motion.div
                key="assessment"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-primary-500" />
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-charcoal mb-2">
                  Ready for a quick assessment?
                </h1>
                <p className="text-charcoal-light mb-8">
                  We&apos;ll give you 15 questions to understand your skill level.
                </p>

                <div className="bg-cream-50 rounded-xl p-6 mb-8 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white border border-cream-200 flex items-center justify-center">
                      <span className="text-charcoal font-bold">15</span>
                    </div>
                    <span className="text-charcoal">Questions total</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white border border-cream-200 flex items-center justify-center">
                      <span className="text-charcoal font-bold">10</span>
                    </div>
                    <span className="text-charcoal">Multiple choice</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white border border-cream-200 flex items-center justify-center">
                      <span className="text-charcoal font-bold">5</span>
                    </div>
                    <span className="text-charcoal">Free response</span>
                  </div>
                </div>

                {data.completedUnits.length > 0 && (
                  <p className="text-sm text-charcoal-light mb-6">
                    Covering Units {data.completedUnits.sort((a, b) => Number(a) - Number(b)).join(', ')}
                  </p>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={handleStartAssessment}
                    disabled={isLoading}
                    className="flex-1 bg-charcoal hover:bg-charcoal/90 text-white rounded-xl h-12"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Preparing...
                      </>
                    ) : (
                      'Start Assessment'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                    className="border-cream-300 text-charcoal hover:bg-cream-50 rounded-xl h-12"
                  >
                    Skip
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {currentStep !== 'assessment' && (
            <div className="flex justify-between mt-10 pt-6 border-t border-cream-200">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStepIndex === 0}
                className="text-charcoal-light hover:text-charcoal hover:bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-charcoal hover:bg-charcoal/90 text-white rounded-xl px-6"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
