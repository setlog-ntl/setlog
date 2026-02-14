'use client';

import { motion } from 'framer-motion';
import type { ExperienceItem } from '@/lib/config';
import { useLocale } from '@/lib/i18n';

interface Props {
  experience: ExperienceItem[];
}

export function ExperienceTimeline({ experience }: Props) {
  const { locale, t } = useLocale();

  return (
    <section id="experience" className="py-20 sm:py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          className="text-3xl font-bold mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          {t('experience.title')}
        </motion.h2>

        <div className="relative ml-4 sm:ml-8">
          {/* Timeline line */}
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500/30" />

          <div className="space-y-8">
            {experience.map((item, i) => {
              const title = locale === 'en' && item.titleEn ? item.titleEn : item.title;
              const company = locale === 'en' && item.companyEn ? item.companyEn : item.company;
              const period = locale === 'en' && item.periodEn ? item.periodEn : item.period;
              const description = locale === 'en' && item.descriptionEn ? item.descriptionEn : item.description;

              return (
                <motion.div
                  key={i}
                  className="relative pl-8"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  {/* Node dot */}
                  <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-blue-500 -translate-x-[5px] ring-4 ring-gray-950 dark:ring-gray-950" />

                  <div className="p-4 rounded-xl border border-gray-800 dark:border-gray-800 bg-gray-900/50 dark:bg-gray-900/50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                      <h3 className="font-semibold text-gray-100">
                        {title}
                      </h3>
                      <span className="font-mono text-xs text-gray-500">
                        {period}
                      </span>
                    </div>
                    <p className="text-sm text-blue-400/80 mb-2">
                      {company}
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-400">
                      {description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
