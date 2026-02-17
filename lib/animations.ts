import { Variants, Transition } from 'framer-motion';

// ============================================
// BASIC TRANSITIONS
// ============================================

export const defaultTransition: Transition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1], // Smooth ease
};

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export const bounceTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 10,
};

// ============================================
// FADE VARIANTS
// ============================================

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

// ============================================
// SCALE VARIANTS
// ============================================

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const scaleInBounce: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: bounceTransition,
  },
  exit: { opacity: 0, scale: 0.8 },
};

export const popIn: Variants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25,
    },
  },
  exit: { opacity: 0, scale: 0.5 },
};

// ============================================
// SLIDE VARIANTS
// ============================================

export const slideUp: Variants = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
};

export const slideDown: Variants = {
  initial: { y: '-100%' },
  animate: { y: 0 },
  exit: { y: '-100%' },
};

export const slideLeft: Variants = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
};

export const slideRight: Variants = {
  initial: { x: '-100%' },
  animate: { x: 0 },
  exit: { x: '-100%' },
};

// ============================================
// STAGGER VARIANTS (for lists)
// ============================================

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const staggerItemScale: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
};

// ============================================
// INTERACTIVE VARIANTS
// ============================================

export const hoverLift = {
  initial: { y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  hover: {
    y: -4,
    boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
    transition: defaultTransition,
  },
  tap: { y: -2 },
};

export const hoverScale = {
  initial: { scale: 1 },
  hover: { scale: 1.02, transition: defaultTransition },
  tap: { scale: 0.98 },
};

export const hoverGrow = {
  initial: { scale: 1 },
  hover: { scale: 1.05, transition: defaultTransition },
  tap: { scale: 0.95 },
};

export const buttonPress = {
  initial: { scale: 1 },
  hover: { scale: 1.01 },
  tap: { scale: 0.98 },
};

// ============================================
// FEEDBACK ANIMATIONS
// ============================================

export const shake: Variants = {
  initial: { x: 0 },
  animate: {
    x: [0, -10, 10, -10, 10, -5, 5, 0],
    transition: { duration: 0.5 },
  },
};

export const pulse: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: { duration: 0.3 },
  },
};

export const wiggle: Variants = {
  initial: { rotate: 0 },
  animate: {
    rotate: [0, -5, 5, -5, 5, 0],
    transition: { duration: 0.4 },
  },
};

export const celebrate: Variants = {
  initial: { scale: 1, rotate: 0 },
  animate: {
    scale: [1, 1.2, 1],
    rotate: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.5 },
  },
};

// ============================================
// PAGE TRANSITIONS
// ============================================

export const pageTransition: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export const pageSlideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};

// ============================================
// MODAL VARIANTS
// ============================================

export const modalOverlay: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.15 },
  },
};

export const modalSlideUp: Variants = {
  initial: { opacity: 0, y: '100%' },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 },
  },
  exit: {
    opacity: 0,
    y: '100%',
    transition: { duration: 0.2 },
  },
};

// ============================================
// PROGRESS ANIMATIONS
// ============================================

export const progressFill = (percentage: number): Variants => ({
  initial: { width: 0 },
  animate: {
    width: `${percentage}%`,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
  },
});

export const countUp = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Check for reduced motion preference
export const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Get motion-safe variants (returns static for reduced motion)
export const getMotionSafeVariants = (variants: Variants): Variants => {
  if (shouldReduceMotion()) {
    return {
      initial: variants.animate,
      animate: variants.animate,
      exit: variants.animate,
    };
  }
  return variants;
};

// Stagger delay helper
export const getStaggerDelay = (index: number, baseDelay = 0.1): number => {
  return index * baseDelay;
};
