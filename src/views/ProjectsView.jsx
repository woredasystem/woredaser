import { useLanguage } from '../hooks/useLanguage'
import { useProjects } from '../hooks/useProjects'
import PublicPageLayout from '../components/layout/PublicPageLayout'
import ProjectCard from '../components/ProjectCard'

export default function ProjectsView({ onBack, onProjectClick }) {
  const { lang } = useLanguage()
  const { projects, loading } = useProjects()

  return (
    <PublicPageLayout
      title={lang === 'am' ? 'ፕሮጀክቶች' : lang === 'om' ? 'Pirojektoota' : 'Projects'}
      subtitle={
        lang === 'am'
          ? 'በወረዳው ላይ እየተካሄዱ ያሉ የልማት እና የማህበረሰብ ፕሮጀክቶች'
          : lang === 'om'
            ? 'Pirojektoota guddinaa fi hawaasaa woredaa keessatti'
            : 'Development and community initiatives across our woreda'
      }
      onBack={onBack}
      maxWidth="max-w-7xl"
    >
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <p className="text-center text-mayor-navy/60 font-amharic py-16">
          {lang === 'am' ? 'ፕሮጀክት አልተጨመረም' : 'No projects published yet'}
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              variant="grid"
              onClick={() => onProjectClick?.(project.id)}
            />
          ))}
        </div>
      )}
    </PublicPageLayout>
  )
}
