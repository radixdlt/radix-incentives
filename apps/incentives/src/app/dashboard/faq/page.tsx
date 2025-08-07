'use client';

import { motion } from 'framer-motion';
import { faqItems } from './components/faq-data';
import { FaqHeader } from './components/faq-header';
import { FaqItem } from './components/faq-item';

export default function FaqPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <FaqHeader />
        </div>

        {/* FAQ Items */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 space-y-3 sm:mb-12 sm:space-y-4"
        >
          {faqItems.map((item, index) => (
            <motion.div
              key={`faq-${item.question.slice(0, 30).replace(/\s+/g, '-')}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: 0.1 + index * 0.05,
                ease: 'easeOut',
              }}
            >
              <FaqItem
                question={item.question}
                answer={item.answer}
                index={index}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
