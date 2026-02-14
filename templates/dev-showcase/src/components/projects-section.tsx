'use client';

import { motion } from 'framer-motion';
import { Star, GitFork, ExternalLink } from 'lucide-react';
import type { ProjectItem } from '@/lib/config';
import { useLocale } from '@/lib/i18n';

const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  Dockerfile: '#384d54',
  HTML: '#e34c26',
  CSS: '#563d7c',
};

interface Props {
  projects: ProjectItem[];
}

export function ProjectsSection({ projects }: Props) {
  const { locale, t } = useLocale();

  return (
    <section id="projects" className="py-20 sm:py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          className="text-3xl font-bold mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          {t('projects.title')}
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, i) => {
            const desc = locale === 'en' && project.descriptionEn ? project.descriptionEn : project.description;
            return (
              <motion.a
                key={i}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-xl border border-gray-800 dark:border-gray-800 bg-gray-900 dark:bg-gray-900 hover:border-blue-500/50 transition-colors group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-mono text-sm font-semibold text-blue-400 group-hover:text-blue-300 truncate">
                    {project.name}
                  </h3>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-600 shrink-0 ml-2" />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-400 mb-3 line-clamp-2">
                  {desc}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          languageColors[project.language] || '#6b7280',
                      }}
                    />
                    {project.language}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {project.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="w-3 h-3" />
                    {project.forks}
                  </span>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
