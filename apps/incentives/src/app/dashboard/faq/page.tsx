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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
        <FaqHeader />

        {/* FAQ Items */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {faqItems.map((item, index) => (
            <FaqItem
              key={`faq-${item.question.slice(0, 30).replace(/\s+/g, '-')}`}
              question={item.question}
              answer={item.answer}
              index={index}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
