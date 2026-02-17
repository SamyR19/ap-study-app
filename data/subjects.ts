// AP Subjects and Topics Data

export const AP_SUBJECTS = {
  'ap-computer-science-a': {
    name: 'AP Computer Science A',
    topics: [
      'Primitive Types',
      'Using Objects',
      'Boolean Expressions and if Statements',
      'Iteration',
      'Writing Classes',
      'Array',
      'ArrayList',
      '2D Array',
      'Inheritance',
      'Recursion',
    ],
  },
  'ap-calculus-ab': {
    name: 'AP Calculus AB',
    topics: [
      'Limits and Continuity',
      'Differentiation: Definition and Fundamental Properties',
      'Differentiation: Composite, Implicit, and Inverse Functions',
      'Contextual Applications of Differentiation',
      'Analytical Applications of Differentiation',
      'Integration and Accumulation of Change',
      'Differential Equations',
      'Applications of Integration',
    ],
  },
  'ap-physics-1': {
    name: 'AP Physics 1',
    topics: [
      'Kinematics',
      'Dynamics',
      'Circular Motion and Gravitation',
      'Energy',
      'Momentum',
      'Simple Harmonic Motion',
      'Torque and Rotational Motion',
    ],
  },
  'ap-us-history': {
    name: 'AP US History',
    topics: [
      'Period 1: 1491-1607',
      'Period 2: 1607-1754',
      'Period 3: 1754-1800',
      'Period 4: 1800-1848',
      'Period 5: 1844-1877',
      'Period 6: 1865-1898',
      'Period 7: 1890-1945',
      'Period 8: 1945-1980',
      'Period 9: 1980-Present',
    ],
  },
} as const;

export type SubjectKey = keyof typeof AP_SUBJECTS;
