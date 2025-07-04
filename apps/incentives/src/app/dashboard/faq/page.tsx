'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { FaqNavigation } from './components/faq-navigation';
import { FaqHeader } from './components/faq-header';
import { FaqItem } from './components/faq-item';
import { ContactSection } from './components/contact-section';
import { faqItems } from './components/faq-data';

export default function FaqPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-4xl">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <FaqHeader />
        </div>

        {/* FAQ Items */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-3 sm:space-y-4 mb-8 sm:mb-12"
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
