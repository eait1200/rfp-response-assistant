"use client";

import type { Tables } from '@/types/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import TrustScore from '@/components/ui/trust-score';

interface RfpQuestionsListProps {
  questions: Tables<'rfp_questions'>[];
}

export default function RfpQuestionsList({ questions }: RfpQuestionsListProps) {
  if (!questions || questions.length === 0) {
    return <div className="p-8 text-muted-foreground">No questions found for this RFP.</div>;
  }

  return (
    <div className="space-y-4">
      {questions.map((q) => {
        // Trust score color logic
        let trustColor = 'text-gray-500';
        if (q.confidence_score_calculated !== null) {
          if (q.confidence_score_calculated >= 0.8) trustColor = 'text-emerald-600';
          else if (q.confidence_score_calculated >= 0.6) trustColor = 'text-yellow-600';
          else trustColor = 'text-red-600';
        }
        // Status color
        let statusColor =
          q.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
          q.status === 'In Review' ? 'bg-amber-100 text-amber-700' :
          q.status === 'Draft' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700';
        // Assignee initials placeholder
        let assigneeInitials = (q.assignee_ids && q.assignee_ids.length > 0)
          ? q.assignee_ids.map((uuid, idx) => (
              <div key={idx} className="h-8 w-8 rounded-full bg-everstream-blue text-white flex items-center justify-center text-sm font-medium ring-2 ring-white">
                DB
              </div>
            ))
          : <div className="h-8 w-8 rounded-full bg-everstream-blue text-white flex items-center justify-center text-sm font-medium ring-2 ring-white opacity-50">--</div>;
        return (
          <Card key={q.id} className="bg-white">
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-everstream-blue">
                    {q.section_header || `${q.original_sheet_name || ''} ${q.original_row_number || ''}`}
                  </span>
                  <Badge className={statusColor}>{q.status || 'Unknown'}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-xs ${trustColor}`}>{q.confidence_score_calculated !== null ? `${Math.round(q.confidence_score_calculated * 100)}%` : '--'}</span>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="mb-2">
                <div className="font-medium text-base mb-1">{q.identified_question_text}</div>
                <div className="text-sm text-muted-foreground">{q.ai_generated_answer}</div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex -space-x-2">{assigneeInitials}</div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">Edit</Button>
                  <Button size="sm" variant="outline">Comment</Button>
                  <Button size="sm" variant="ghost">More</Button>
                </div>
              </div>
              {/* AI Sources, Editor/Reviewer info, etc. */}
              <div className="mt-2 text-xs text-muted-foreground">
                <div>AI Sources: {q.sources_text || '--'}</div>
                <div>Editor: {q.editor_info || '--'} | Reviewer: {q.reviewer_info || '--'}</div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}