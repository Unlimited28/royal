import React from 'react';
import { ExamSession } from './ExamSession';

// LiveExamEnhanced could have additional features like auto-save, better analytics, etc.
// For now, we'll reuse the ExamSession component
export const LiveExamEnhanced: React.FC = () => {
    return <ExamSession />;
};
