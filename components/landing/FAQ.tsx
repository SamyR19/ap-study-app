'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const faqs = [
  {
    question: 'What AP subjects are supported?',
    answer:
      'Currently, AP Computer Science A is fully supported with MCQs, FRQs, and code execution. We\'re actively adding more subjects including AP Calculus, AP Physics, and AP History courses.',
  },
  {
    question: 'How does the AI feedback work?',
    answer:
      'Our AI analyzes your answers and provides detailed explanations for why an answer is correct or incorrect. For coding questions, it reviews your code structure, logic, and style.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      'Yes! You can cancel your Premium subscription at any time. You\'ll continue to have access until the end of your billing period.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'Yes! Premium comes with a 7-day free trial. You can try all features before being charged.',
  },
  {
    question: 'How are the practice questions created?',
    answer:
      'Our questions are written by AP teachers and tutors, following College Board guidelines. They\'re reviewed for accuracy and difficulty calibration.',
  },
  {
    question: 'Does it work on mobile?',
    answer:
      'Yes! AceAI is fully responsive and works on phones, tablets, and computers. The code editor for AP CSA is optimized for larger screens.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const leftColumn = faqs.filter((_, i) => i % 2 === 0);
  const rightColumn = faqs.filter((_, i) => i % 2 === 1);

  const FAQItem = ({ item, index }: { item: (typeof faqs)[0]; index: number }) => {
    const isOpen = openIndex === index;

    return (
      <div className="border-b border-cream-300">
        <button
          onClick={() => setOpenIndex(isOpen ? null : index)}
          className="w-full flex items-center justify-between gap-4 text-left py-5 px-1"
        >
          <span className="text-[clamp(16px,1.45vw,22px)] font-semibold leading-[1.35] text-charcoal">
            {item.question}
          </span>
          <span
            className={`text-4xl leading-none text-charcoal transition-transform duration-200 flex-shrink-0 ${
              isOpen ? 'rotate-45' : ''
            }`}
          >
            +
          </span>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="px-1 pb-4 text-[15px] leading-relaxed text-charcoal-light">
                {item.answer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <section id="faq" className="py-[94px] px-8 bg-cream-100">
      <div className="max-w-[1300px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="pill text-base px-3.5 py-2">FAQ</span>
          <h2 className="mt-4 text-[clamp(42px,5vw,72px)] leading-[1.06] tracking-[-0.04em]">
            Frequently asked questions
          </h2>
        </motion.div>

        {/* FAQ Grid */}
        <div className="grid md:grid-cols-2 gap-x-20 gap-y-0">
          <div className="border-t border-cream-300">
            {leftColumn.map((item, i) => (
              <FAQItem key={item.question} item={item} index={i * 2} />
            ))}
          </div>
          <div className="border-t border-cream-300">
            {rightColumn.map((item, i) => (
              <FAQItem key={item.question} item={item} index={i * 2 + 1} />
            ))}
          </div>
        </div>

        {/* Support CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-8 rounded-2xl border border-cream-300 bg-cream-50 p-6 flex items-center justify-between gap-4"
        >
          <div>
            <h3 className="text-[clamp(28px,2.2vw,40px)] leading-[1.2] tracking-[-0.03em] font-bold">
              Still have questions?
            </h3>
            <p className="mt-2 text-[clamp(15px,1.25vw,20px)] text-charcoal-light">
              We&apos;re here to help. Reach out and we&apos;ll get back to you within 24 hours.
            </p>
          </div>
          <Button className="rounded-xl text-[17px] py-3 px-5 bg-charcoal text-white hover:bg-charcoal/90 min-w-[140px]">
            Contact Us
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
