/** Textbook Page Component for the Physical AI & Humanoid Robotics Textbook application */
import React, { useState, useEffect } from 'react';
import { LearningPathProvider, useLearningPath } from '../contexts/LearningPathContext.tsx';
import ContentRenderer from '../components/Textbook/ContentRenderer';
import ModuleNavigation from '../components/Textbook/ModuleNavigation';
import ProgressIndicator from '../components/Textbook/ProgressIndicator';
import LearningPathNavigation from '../components/Textbook/LearningPathNavigation';
import { getAllModules, getChaptersForModule, getChapterContent } from '../services/contentService';
import { Module, Chapter } from '../services/contentService';
import { getLearningPathForStudent } from '../services/contentService'; // Assuming we have this function
import '../css/custom.css';

// Inner component that has access to the learning path context
const TextbookPageContent: React.FC = () => {
  const { learningPath, setLearningPath, updateChapterStatus, setCurrentLocation } = useLearningPath();
  const [modules, setModules] = useState<Module[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const moduleData = await getAllModules();
      setModules(moduleData);

      // Load learning path data
      // In a real app, you would fetch this based on the logged-in student
      // For now, we'll use a placeholder student ID
      const studentId = "placeholder-student-id";
      // const pathData = await getLearningPathForStudent(studentId);
      // setLearningPath(pathData);

      // If there are modules, select the first one by default
      if (moduleData.length > 0) {
        const firstModule = moduleData[0];
        setSelectedModule(firstModule);

        const chapterData = await getChaptersForModule(firstModule.module_id);
        setChapters(chapterData);

        // If there are chapters, select the first one by default
        if (chapterData.length > 0) {
          const firstChapter = chapterData[0];
          setSelectedChapter(firstChapter);

          // Load the content for the first chapter
          const chapterContent = await getChapterContent(firstModule.module_id, firstChapter.chapter_id);
          setContent(chapterContent);
        }
      }
      setError(null);
    } catch (err) {
      console.error('Error loading textbook data:', err);
      setError('Failed to load textbook content. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleModuleSelect = async (moduleId: string) => {
    try {
      setLoading(true);
      const module = modules.find(m => m.module_id === moduleId) || null;
      setSelectedModule(module);

      if (module) {
        const chapterData = await getChaptersForModule(moduleId);
        setChapters(chapterData);

        // Select the first chapter of the module by default
        if (chapterData.length > 0) {
          const firstChapter = chapterData[0];
          setSelectedChapter(firstChapter);

          // Load content for the selected chapter
          const chapterContent = await getChapterContent(moduleId, firstChapter.chapter_id);
          setContent(chapterContent);

          // Update current location in learning path
          setCurrentLocation(moduleId, firstChapter.chapter_id);
        } else {
          setContent('');
          setCurrentLocation(moduleId, null);
        }
      }
      setError(null);
    } catch (err) {
      console.error(`Error loading chapters for module ${moduleId}:`, err);
      setError(`Failed to load chapters for module. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  const handleChapterSelect = async (moduleId: string, chapterId: string) => {
    try {
      setLoading(true);
      const chapter = chapters.find(c => c.chapter_id === chapterId) || null;
      setSelectedChapter(chapter);

      if (chapter) {
        // Load content for the selected chapter
        const chapterContent = await getChapterContent(moduleId, chapterId);
        setContent(chapterContent);

        // Update current location in learning path
        setCurrentLocation(moduleId, chapterId);
      }
      setError(null);
    } catch (err) {
      console.error(`Error loading content for chapter ${chapterId}:`, err);
      setError(`Failed to load chapter content. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  const handleTextSelect = (selectedText: string) => {
    // This could trigger an action, like showing the chatbot with the selected text context
    console.log('Selected text:', selectedText);
  };

  if (loading && modules.length === 0) {
    return (
      <div className="textbook-container">
        <div className="loading">Loading textbook content...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="textbook-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="textbook-container textbook-content">
      <div className="textbook-header">
        <h1>Physical AI & Humanoid Robotics Textbook</h1>
        <div className="header-controls">
          <ProgressIndicator size="small" showPercentage={true} showModules={true} />
        </div>
      </div>

      <div className="textbook-layout">
        <div className="navigation-column">
          <ModuleNavigation
            onModuleSelect={handleModuleSelect}
            onChapterSelect={handleChapterSelect}
            selectedModuleId={selectedModule?.module_id}
            selectedChapterId={selectedChapter?.chapter_id}
          />
          <LearningPathNavigation
            onModuleSelect={handleModuleSelect}
            onChapterSelect={handleChapterSelect}
            currentModuleId={selectedModule?.module_id}
            currentChapterId={selectedChapter?.chapter_id}
          />
        </div>

        <div className="content-column">
          {selectedModule && selectedChapter ? (
            <>
              <div className="content-header">
                <h2>{selectedModule.title}</h2>
                <h3>{selectedChapter.title}</h3>
              </div>

              {content ? (
                <ContentRenderer
                  content={content}
                  moduleId={selectedModule.module_id}
                  chapterId={selectedChapter.chapter_id}
                  onTextSelect={handleTextSelect}
                />
              ) : (
                <div className="no-content">No content available for this chapter.</div>
              )}
            </>
          ) : (
            <div className="welcome-message">
              <h2>Welcome to the Physical AI & Humanoid Robotics Textbook</h2>
              <p>Select a module and chapter from the navigation panel to begin your learning journey.</p>
              <p>This interactive textbook covers the fundamentals of:</p>
              <ul>
                <li>ROS 2 (Robot Operating System)</li>
                <li>Gazebo and Unity simulation environments</li>
                <li>NVIDIA Isaac robotics platform</li>
                <li>Vision-Language-Action (VLA) models</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TextbookPage: React.FC = () => {
  return (
    <LearningPathProvider>
      <TextbookPageContent />
    </LearningPathProvider>
  );
};

export default TextbookPage;