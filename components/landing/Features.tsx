'use client';

import { motion } from 'framer-motion';

const features = [
  {
    icon: '+',
    iconColor: '#ff4b54',
    title: 'Study Timeline',
    description: 'Visualize AP unit pacing, quiz dates, and exam deadlines at a glance.',
  },
  {
    icon: '*',
    iconColor: '#7d4dff',
    title: 'Subject Workspaces',
    description: 'Keep AP Bio, APUSH, Calc BC, and Lang prep neatly separated in one dashboard.',
  },
  {
    icon: '@',
    iconColor: '#31ad43',
    title: 'AI-Powered Feedback',
    description: 'Get instant, detailed explanations for every question with AI tutoring.',
  },
  {
    icon: '!',
    iconColor: '#f0832f',
    title: 'Smart Alerts',
    description: 'Get nudges when progress slips or when high-impact review windows open.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-16 px-8" style={{ background: '#efeff1' }}>
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
              <span
                className="inline-flex items-center px-4 py-2.5 rounded-full text-xl font-medium"
                style={{
                  border: '1.5px solid #d4d4da',
                  background: '#f3f3f6',
                  color: '#111217'
                }}
              >
                AI AP Study Hub
              </span>
              <h2
                className="mt-5 font-bold"
                style={{
                  fontSize: 'clamp(42px, 6vw, 78px)',
                  lineHeight: 1.03,
                  letterSpacing: '-0.04em',
                  color: '#111217'
                }}
              >
                All Your AP Prep, Organized Effortlessly
              </h2>
            </motion.div>

            {/* Feature Grid */}
            <div
              className="mt-10 grid grid-cols-1 sm:grid-cols-2"
              style={{ borderTop: '1px solid #d8d8de' }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="py-7 min-h-[220px]"
                  style={{
                    borderBottom: '1px solid #d8d8de',
                    borderRight: index % 2 === 0 ? '1px solid #d8d8de' : 'none',
                    paddingRight: index % 2 === 0 ? '30px' : '0',
                    paddingLeft: index % 2 === 1 ? '30px' : '0',
                  }}
                >
                  <div
                    className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-sm font-bold"
                    style={{
                      border: `2px solid ${feature.iconColor}`,
                      color: feature.iconColor
                    }}
                  >
                    {feature.icon}
                  </div>
                  <h3
                    className="mt-4 font-bold"
                    style={{
                      fontSize: 'clamp(28px, 3.5vw, 45px)',
                      lineHeight: 1.08,
                      letterSpacing: '-0.03em',
                      color: '#111217'
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="mt-2.5 max-w-[95%]"
                    style={{
                      fontSize: '20px',
                      lineHeight: 1.42,
                      color: '#4f505a'
                    }}
                  >
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
            className="rounded-[34px] p-5 min-h-[700px] relative"
            style={{
              background: '#f8f8fa',
              border: '1px solid #d9d9df'
            }}
          >
            <div
              className="rounded-3xl min-h-[610px] overflow-hidden"
              style={{
                border: '1px solid #dedee4',
                background: '#ffffff'
              }}
            >
              {/* Panel Top */}
              <div
                className="h-14 flex items-center gap-2.5 px-3.5"
                style={{
                  borderBottom: '1px solid #e2e2e7',
                  background: '#f7f7fa'
                }}
              >
                <div
                  className="flex-1 h-[34px] rounded-[10px]"
                  style={{
                    background: '#ececf1',
                    border: '1px solid #dfdfe6'
                  }}
                />
                <div
                  className="w-[88px] h-[34px] rounded-[10px]"
                  style={{ background: '#111217' }}
                />
              </div>

              {/* Panel Content */}
              <div className="grid grid-cols-[1fr_290px] min-h-[554px]">
                {/* Timeline */}
                <div className="p-3.5" style={{ background: '#fbfbfd' }}>
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div
                      key={i}
                      className="h-14 rounded-[10px] mb-2.5"
                      style={{
                        border: '1px solid #e6e6ec',
                        background: i % 2 === 0 ? '#f6f6fb' : '#ffffff'
                      }}
                    />
                  ))}
                </div>

                {/* Detail Pane */}
                <div
                  className="p-3.5 hidden lg:block"
                  style={{
                    background: '#f8f8fb',
                    borderLeft: '1px solid #e5e5ea'
                  }}
                >
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-[84px] rounded-xl mb-2.5"
                      style={{
                        border: '1px solid #e5e5eb',
                        background: '#ffffff'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div
              className="absolute w-[280px] h-[350px] left-9 bottom-6 rounded-[20px]"
              style={{
                border: '1.5px solid #f091a2',
                background: '#ffffff',
                boxShadow: '0 16px 30px rgba(45, 32, 70, 0.08)'
              }}
            >
              <div
                className="h-14 rounded-t-[18px]"
                style={{
                  borderBottom: '1px solid #ececf0',
                  background: '#fafafd'
                }}
              />
              <div className="p-3">
                <div className="h-3.5 rounded-full mb-2.5" style={{ background: '#e5e5eb' }} />
                <div className="h-3.5 rounded-full w-[72%] mb-2.5" style={{ background: '#e5e5eb' }} />
                <div className="h-3.5 rounded-full mb-2.5" style={{ background: '#e5e5eb' }} />
                <div className="h-3.5 rounded-full w-[85%]" style={{ background: '#e5e5eb' }} />
              </div>
            </div>

            <div
              className="absolute w-[306px] h-[470px] right-[-4px] top-24 rounded-[20px] hidden xl:block"
              style={{
                border: '1.5px solid #d8d8df',
                background: '#ffffff',
                boxShadow: '0 16px 30px rgba(45, 32, 70, 0.08)'
              }}
            >
              <div
                className="h-14 rounded-t-[18px]"
                style={{
                  borderBottom: '1px solid #ececf0',
                  background: '#fafafd'
                }}
              />
              <div className="p-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className={`h-3.5 rounded-full mb-2.5 ${i % 2 === 0 ? 'w-[72%]' : ''}`}
                    style={{ background: '#e5e5eb' }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
