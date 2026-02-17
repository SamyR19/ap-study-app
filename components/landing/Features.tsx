'use client';

import { motion } from 'framer-motion';
import { Brain, Code, BarChart3, Zap } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Feedback',
    description:
      'Get instant, detailed explanations for every question. Our AI tutor helps you understand concepts, not just memorize answers.',
    color: 'text-error',
  },
  {
    icon: Code,
    title: 'Code Execution',
    description:
      'Write and run Java code directly in the browser for AP CSA. Test your solutions against real test cases.',
    color: 'text-purple-600',
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description:
      'Track your mastery across topics and units. Identify weak areas and focus your study time effectively.',
    color: 'text-success',
  },
  {
    icon: Zap,
    title: 'Adaptive Practice',
    description:
      'Questions adapt to your skill level. Start easy and work up to exam-level difficulty at your own pace.',
    color: 'text-primary-500',
  },
];

export function Features() {
  return (
    <section id="features" className="py-16 px-8 bg-cream-100">
      <div className="max-w-[1300px] mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Left: Text Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="pill">Features</span>
              <h2 className="mt-5 text-[clamp(42px,6vw,78px)] leading-[1.03] tracking-[-0.04em]">
                Everything you need to ace your APs
              </h2>
            </motion.div>

            {/* Feature Grid */}
            <div className="mt-10 grid grid-cols-2 border-t border-cream-300">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`py-7 pr-6 border-b border-cream-300 min-h-[220px] ${
                    index % 2 === 0 ? 'border-r border-cream-300 pr-7' : 'pl-7'
                  }`}
                >
                  <div
                    className={`w-[34px] h-[34px] rounded-[10px] border-2 flex items-center justify-center ${feature.color}`}
                    style={{ borderColor: 'currentColor' }}
                  >
                    <feature.icon className="w-4 h-4" />
                  </div>
                  <h3 className="mt-4 text-[45px] leading-[1.08] tracking-[-0.03em] font-bold">
                    {feature.title}
                  </h3>
                  <p className="mt-2.5 text-xl leading-[1.42] text-charcoal-light max-w-[95%]">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-cream-200 border border-cream-300 rounded-[34px] p-5 min-h-[700px] relative"
          >
            <div className="border border-cream-300 rounded-3xl bg-white min-h-[610px] overflow-hidden">
              {/* Panel Top */}
              <div className="h-14 border-b border-cream-300 bg-cream-100 flex items-center gap-2.5 px-3.5">
                <div className="flex-1 h-[34px] rounded-[10px] bg-cream-200 border border-cream-300" />
              </div>

              {/* Panel Content */}
              <div className="grid grid-cols-[1fr_290px] min-h-[554px]">
                {/* Timeline */}
                <div className="p-3.5 bg-cream-50">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className={`h-14 border border-cream-300 rounded-[10px] mb-2.5 ${
                        i % 2 === 0 ? 'bg-cream-100' : 'bg-white'
                      }`}
                    />
                  ))}
                </div>

                {/* Detail Pane */}
                <div className="bg-cream-100 border-l border-cream-300 p-3.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-[84px] rounded-xl border border-cream-300 bg-white mb-2.5"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute w-[280px] h-[350px] left-9 bottom-6 rounded-[20px] border-[1.5px] border-primary-300 bg-white shadow-lg">
              <div className="h-14 border-b border-cream-200 bg-cream-50 rounded-t-[18px]" />
              <div className="p-3">
                <div className="h-3.5 rounded-full bg-cream-300 mb-2.5" />
                <div className="h-3.5 rounded-full bg-cream-300 w-[72%] mb-2.5" />
                <div className="h-3.5 rounded-full bg-cream-300 mb-2.5" />
                <div className="h-3.5 rounded-full bg-cream-300 w-[85%]" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
