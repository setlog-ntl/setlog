'use client';

import { motion } from 'framer-motion';
import { useLocale } from '@/lib/i18n';

interface Props {
  username: string;
}

export function GithubGraph({ username }: Props) {
  const { t } = useLocale();

  return (
    <section className="py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="rounded-xl border border-gray-800 dark:border-gray-800 p-4 bg-gray-900/50 overflow-x-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={`https://ghchart.rshah.org/3b82f6/${username}`}
            alt={`${username} ${t('github.alt')}`}
            className="w-full max-w-full"
            loading="lazy"
          />
        </motion.div>
      </div>
    </section>
  );
}
