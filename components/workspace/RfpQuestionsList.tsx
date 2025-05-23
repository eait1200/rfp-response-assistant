"use client";

import type { Tables } from '@/types/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import TrustScore from '@/components/ui/trust-score';
import RfpQuestionRow from './RfpQuestionRow';

interface RfpQuestionsListProps {
  questions: Tables<'rfp_questions'>[];
  onQuestionUpdate: (updatedQuestion: Tables<'rfp_questions'>) => void;
  openCommentSectionId: string | null;
  onToggleCommentSection: (questionId: string) => void;
  onUpdateAssignee: (questionId: string, field: 'editor_id' | 'reviewer_id', userId: string | null) => Promise<void>;
}

export default function RfpQuestionsList({
  questions,
  onQuestionUpdate,
  openCommentSectionId,
  onToggleCommentSection,
  onUpdateAssignee,
}: RfpQuestionsListProps) {
  if (!questions || questions.length === 0) {
    return <div className="p-8 text-muted-foreground">No questions found for this RFP.</div>;
  }

  return (
    <div className="space-y-4">
      {questions.map((q) => (
        <RfpQuestionRow 
          key={q.id} 
          question={q} 
          onQuestionUpdate={onQuestionUpdate} 
          isCommentSectionOpen={q.id === openCommentSectionId}
          onToggleCommentSection={() => onToggleCommentSection(q.id)}
          onUpdateAssignee={onUpdateAssignee}
        />
      ))}
    </div>
  );
}