import React from 'react';
import { ExamSession } from './ExamSession';

// LiveExam is essentially the same as ExamSession but could have enhanced features
// For now, we'll reuse the ExamSession component
const LiveExam: React.FC = () => {
    return <ExamSession />;
};

export default LiveExam;
