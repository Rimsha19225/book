/** Module Navigation Component for the Physical AI & Humanoid Robotics Textbook application */
import React, { useState, useEffect } from 'react';
import { getAllModules, getChaptersForModule } from '../../services/contentService';
import { Module, Chapter } from '../../services/contentService';
import './ModuleNavigation.css';

interface ModuleNavigationProps {
  onModuleSelect?: (moduleId: string) => void;
  onChapterSelect?: (moduleId: string, chapterId: string) => void;
  selectedModuleId?: string;
  selectedChapterId?: string;
}

const ModuleNavigation: React.FC<ModuleNavigationProps> = ({
  onModuleSelect,
  onChapterSelect,
  selectedModuleId,
  selectedChapterId
}) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  // Load modules on component mount
  useEffect(() => {
    loadModules();
  }, []);

  // Load chapters when a module is selected
  useEffect(() => {
    if (selectedModuleId) {
      loadChapters(selectedModuleId);
      setExpandedModule(selectedModuleId);
    }
  }, [selectedModuleId]);

  const loadModules = async () => {
    try {
      setLoading(true);
      const moduleData = await getAllModules();
      setModules(moduleData);
      setError(null);
    } catch (err) {
      console.error('Error loading modules:', err);
      setError('Failed to load modules. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadChapters = async (moduleId: string) => {
    try {
      setLoading(true);
      const chapterData = await getChaptersForModule(moduleId);
      setChapters(chapterData);
      setError(null);
    } catch (err) {
      console.error(`Error loading chapters for module ${moduleId}:`, err);
      setError(`Failed to load chapters for module ${moduleId}. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleClick = (moduleId: string) => {
    if (expandedModule === moduleId) {
      // If clicking the same module, collapse it
      setExpandedModule(null);
    } else {
      // Expand the clicked module
      setExpandedModule(moduleId);
    }

    if (onModuleSelect) {
      onModuleSelect(moduleId);
    }
  };

  const handleChapterClick = (moduleId: string, chapterId: string) => {
    if (onChapterSelect) {
      onChapterSelect(moduleId, chapterId);
    }
  };

  if (loading && modules.length === 0) {
    return <div className="module-navigation">Loading modules...</div>;
  }

  if (error) {
    return <div className="module-navigation-error">{error}</div>;
  }

  return (
    <div className="module-navigation">
      <h3 className="navigation-title">Textbook Contents</h3>

      <ul className="module-list">
        {modules.map((module) => (
          <li key={module.module_id} className="module-item">
            <button
              className={`module-button ${selectedModuleId === module.module_id ? 'selected' : ''}`}
              onClick={() => handleModuleClick(module.module_id)}
            >
              <span className="module-icon">
                {expandedModule === module.module_id ? '▼' : '▶'}
              </span>
              <span className="module-title">{module.title}</span>
              <span className="module-order">({module.order_index})</span>
            </button>

            {expandedModule === module.module_id && (
              <ul className="chapter-list">
                {chapters
                  .filter(chapter => selectedModuleId === module.module_id) // Only show chapters for the selected module
                  .map((chapter) => (
                    <li key={chapter.chapter_id} className="chapter-item">
                      <button
                        className={`chapter-button ${selectedChapterId === chapter.chapter_id ? 'selected' : ''}`}
                        onClick={() => handleChapterClick(module.module_id, chapter.chapter_id)}
                      >
                        <span className="chapter-title">{chapter.title}</span>
                        <span className="chapter-type">[{chapter.content_type}]</span>
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ModuleNavigation;