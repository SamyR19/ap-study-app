'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: 'What is AceAI?',
    answer: 'AceAI is an AI-powered AP study platform with adaptive practice, timelines, and rubric-based feedback for all AP subjects.',
  },
  {
    question: 'How does AceAI improve AP performance?',
    answer: 'It prioritizes weak topics, adjusts difficulty, and recommends the next best review action each day based on your progress.',
  },
  {
    question: 'Is AceAI easy to use?',
    answer: 'Yes. Students can start with one subject and follow a guided plan in minutes. The interface is designed to be intuitive and distraction-free.',
  },
  {
    question: 'Can I study with classmates on AceAI?',
    answer: 'Yes, you can share notes, comments, and study progress with your AP study group through peer study rooms.',
  },
  {
    question: 'Is AceAI suitable for new AP students?',
    answer: 'Absolutely. Plans are beginner-friendly and scale up as your accuracy grows. The adaptive system meets you where you are.',
  },
  {
    question: 'How can I track AP prep progress?',
    answer: 'Use course dashboards to monitor unit completion, score trends, and exam readiness across all your AP subjects.',
  },
  {
    question: 'Can I manage multiple AP subjects at once?',
    answer: 'Yes. The Pro plan provides one place to manage every AP class you are taking with cross-subject analytics.',
  },
  {
    question: 'Does AceAI include FRQ scoring automation?',
    answer: 'Yes. FRQs are scored against rubric criteria with revision guidance, sample solutions, and detailed feedback.',
  },
  {
    question: 'Is there a mobile version of AceAI?',
    answer: 'AceAI works in modern mobile browsers and keeps your progress synced automatically across all devices.',
  },
  {
    question: 'How secure is my data?',
    answer: 'We use encrypted transport, secure authentication, and strict data access policies to protect your information.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const leftColumn = faqs.filter((_, i) => i < 5);
  const rightColumn = faqs.filter((_, i) => i >= 5);

  const FAQItem = ({ item, index }: { item: (typeof faqs)[0]; index: number }) => {
    const isOpen = openIndex === index;

    return (
      <div style={{ borderBottom: '1px solid #d4d4db' }}>
        <button
          onClick={() => setOpenIndex(isOpen ? null : index)}
          className="w-full flex items-center justify-between gap-4 text-left py-5 px-1"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <span
            className="font-semibold"
            style={{
              fontSize: 'clamp(16px, 1.45vw, 22px)',
              lineHeight: 1.35,
              color: '#1e1f27'
            }}
          >
            {item.question}
          </span>
          <span
            className="flex-shrink-0 transition-transform duration-200"
            style={{
              fontSize: '36px',
              lineHeight: 1,
              color: '#1c1d24',
              transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)'
            }}
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
              <p
                className="px-1 pb-4"
                style={{
                  fontSize: '15px',
                  lineHeight: 1.5,
                  color: '#575861',
                  margin: 0
                }}
              >
                {item.answer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <section id="faq" className="py-[94px] px-8" style={{ background: '#efeff1' }}>
      <div className="max-w-[1300px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span
            className="inline-flex items-center px-3.5 py-2 rounded-full text-base font-medium"
            style={{
              border: '1.5px solid #d4d4da',
              background: '#f3f3f6',
              color: '#111217'
            }}
          >
            FAQs
          </span>
          <h2
            className="mt-4 font-bold"
            style={{
              fontSize: 'clamp(42px, 5vw, 72px)',
              lineHeight: 1.06,
              letterSpacing: '-0.04em',
              color: '#111217'
            }}
          >
            Frequently Asked Questions
          </h2>
        </motion.div>

        {/* FAQ Grid */}
        <div className="grid md:grid-cols-2 gap-x-20 gap-y-0">
          <div style={{ borderTop: '1px solid #d4d4db' }}>
            {leftColumn.map((item, i) => (
              <FAQItem key={item.question} item={item} index={i} />
            ))}
          </div>
          <div style={{ borderTop: '1px solid #d4d4db' }}>
            {rightColumn.map((item, i) => (
              <FAQItem key={item.question} item={item} index={i + 5} />
            ))}
          </div>
        </div>

        {/* Support CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-8 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4"
          style={{
            border: '1px solid #d6d6dd',
            background: '#fbfbfc'
          }}
        >
          <div>
            <h3
              className="font-bold"
              style={{
                fontSize: 'clamp(28px, 2.2vw, 40px)',
                lineHeight: 1.2,
                letterSpacing: '-0.03em',
                color: '#111217',
                margin: 0
              }}
            >
              Have Questions? We&apos;re Here to Help!
            </h3>
            <p
              className="mt-2"
              style={{
                fontSize: 'clamp(15px, 1.25vw, 20px)',
                color: '#666770',
                margin: 0
              }}
            >
              Reach out to our support team for setup guidance or AP plan recommendations.
            </p>
          </div>
          <a
            href="mailto:hello@aceai.study"
            className="rounded-xl font-medium transition-colors"
            style={{
              fontSize: '17px',
              padding: '12px 22px',
              background: '#111217',
              color: '#ffffff',
              border: '1.6px solid #16171e',
              textDecoration: 'none',
              minWidth: '140px',
              textAlign: 'center'
            }}
          >
            Contact Us
          </a>
        </motion.div>
      </div>
    </section>
  );
}
