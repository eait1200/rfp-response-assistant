'use client';

import type { Tables } from '@/types/supabase';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2, MoreHorizontal, Info } from 'lucide-react';
import TrustScore from '@/components/ui/trust-score';
import EditResponseArea from '@/components/workspace/RfpRowEditResponseArea';
import CommentsSection, { RfpComment as CommentSectionRfpCommentType } from '@/components/workspace/RfpRowCommentsSection';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import AssigneeManager from './AssigneeManager';

interface RfpQuestionRowProps {
  question: Tables<'rfp_questions'>;
  onQuestionUpdate: (updatedQuestion: Tables<'rfp_questions'>) => void;
  isCommentSectionOpen: boolean;
  onToggleCommentSection: () => void;
  onUpdateAssignee: (questionId: string, field: 'editor_id' | 'reviewer_id', userId: string | null) => Promise<void>;
}

export type RfpCommentRowType = CommentSectionRfpCommentType;

const ALL_STATUSES: Array<Tables<'rfp_questions'>['status']> = ["Draft", "In Review", "Approved"];

export default function RfpQuestionRow({
  question,
  onQuestionUpdate,
  isCommentSectionOpen,
  onToggleCommentSection,
  onUpdateAssignee,
}: RfpQuestionRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(question.status || 'Draft');
  const [loadingStatusChange, setLoadingStatusChange] = useState(false);
  const [loadingSaveResponse, setLoadingSaveResponse] = useState(false);
  const [editableResponseText, setEditableResponseText] = useState<string | undefined>(undefined);
  const [comments, setComments] = useState<RfpCommentRowType[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const { toast } = useToast();

  const score = question.confidence_score_calculated !== null ? Math.round(question.confidence_score_calculated * 100) : 0;

  const getStatusTagClass = (currentStatus: string | null) => {
    switch (currentStatus) {
      case 'Approved': return 'bg-emerald-500 text-white hover:bg-emerald-600';
      case 'In Review': return 'bg-everstream-orange text-white hover:bg-orange-500';
      case 'Draft': return 'bg-blue-500 text-white hover:bg-blue-600';
      default: return 'bg-gray-400 text-white hover:bg-gray-500';
    }
  };

  const questionFont = 'font-raleway font-semibold text-base text-everstream-blue';
  const responseFont = 'font-work-sans text-sm';
  const responseToDisplay = (question.edited_answer?.trim() ? question.edited_answer : (question.ai_generated_answer?.trim() ? question.ai_generated_answer : 'No response generated yet.'));

  const fetchComments = useCallback(async () => {
    if (!question.id) return;
    setCommentsLoading(true);
    try {
      const { data, error } = await supabase
        .from('rfp_comments')
        .select('id, question_id, user_display_name, comment_text, created_at, user_id')
        .eq('question_id', question.id)
        .order('created_at', { ascending: true });
      if (error) {
        console.error('Supabase error fetching comments:', error);
        toast({ title: 'Error fetching comments', description: error.message, variant: 'destructive' });
        setComments([]);
      } else if (data) {
        setComments(data as RfpCommentRowType[]);
      }
    } catch (err: any) {
      console.error('Catch block error fetching comments:', err);
      toast({ title: 'Error', description: err.message || 'Failed to load comments.', variant: 'destructive' });
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, [question.id, toast]);

  useEffect(() => {
    if (isCommentSectionOpen || commentsLoading) {
        fetchComments();
    }
  }, [isCommentSectionOpen, fetchComments]);

  useEffect(() => {
    setStatus(question.status || 'Draft');
  }, [question.status]);

  async function handleStatusChange(newStatus: Tables<'rfp_questions'>['status']) {
    if (newStatus === status) return;
    setLoadingStatusChange(true);
    try {
      const res = await fetch('/api/rfp-questions/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: question.id, newStatus }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.question) {
          onQuestionUpdate(result.question);
          toast({ title: `Status updated to ${newStatus}!`, description: 'The status has been saved.' });
        } else {
          toast({ title: 'Error', description: result.error || 'Failed to update status.', variant: 'destructive' });
        }
      } else {
        const errorData = await res.text();
        toast({ title: 'Error', description: errorData || 'Failed to update status.', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update status.', variant: 'destructive' });
    } finally {
      setLoadingStatusChange(false);
    }
  }

  function handleEditClick() {
    setEditableResponseText(question.edited_answer?.trim() ? question.edited_answer : (question.ai_generated_answer || ''));
    setIsEditing(true);
  }

  async function handleSaveResponse() {
    if (typeof editableResponseText !== 'string') return;
    setLoadingSaveResponse(true);
    try {
      const res = await fetch('/api/rfp-questions/update-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: question.id, editedAnswer: editableResponseText }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.question) {
          onQuestionUpdate(result.question);
          setIsEditing(false);
          toast({ title: 'Response saved!', description: 'Your changes have been saved.' });
        } else {
          toast({ title: 'Error saving response', description: result.error || 'Failed to save response.', variant: 'destructive' });
        }
      } else {
        const errorData = await res.text();
        toast({ title: 'Error saving response', description: errorData || 'Failed to save response.', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save response.', variant: 'destructive' });
    } finally {
      setLoadingSaveResponse(false);
    }
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setEditableResponseText(undefined);
  }
  
  return (
    <Card className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className={`${questionFont} truncate`}>{question.section_header || `${question.original_sheet_name || 'Sheet'} ${question.original_row_number || '-'}`}</div>
            <Badge className={`${getStatusTagClass(status)} px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap`}>
              {loadingStatusChange ? <Loader2 className="h-3 w-3 animate-spin" /> : (status || 'Unknown')}
            </Badge>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700" disabled={loadingStatusChange || loadingSaveResponse}>
                {loadingStatusChange ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-5 w-5" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuSeparator />
              {ALL_STATUSES.map(s => (
                <DropdownMenuItem 
                  key={s} 
                  onClick={() => handleStatusChange(s)}
                  disabled={s === status || loadingStatusChange}
                  className="text-sm"
                >
                  Mark as {s}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onToggleCommentSection} disabled={isEditing} className="text-sm">
                  View/Add Comments
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEditClick} disabled={isEditing || isCommentSectionOpen} className="text-sm">
                  Edit Response
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-sm text-red-600 focus:text-red-600 focus:bg-red-50">
                Delete Question
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className={`${questionFont} mb-2 leading-tight`}>{question.identified_question_text}</div>
        
        <div className="flex gap-4 items-start mb-3">
          <div className="flex-1">
            {isEditing ? (
              <EditResponseArea
                value={editableResponseText ?? ''}
                onChange={setEditableResponseText}
                onSave={handleSaveResponse}
                onCancel={handleCancelEdit}
                loading={loadingSaveResponse}
              />
            ) : (
              <div className={`${responseFont} text-gray-700 whitespace-pre-line`}>{responseToDisplay}</div>
            )}
          </div>
          
          <div className="flex-shrink-0 mt-1">
            <TrustScore value={score} size="md" showLabel={true} numericClassName="text-xl" />
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mb-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-pointer hover:text-gray-700 transition-colors">
                  <Info className="h-3 w-3" />
                  <span className="underline decoration-dotted">AI Sources & Justification</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-md p-3" side="bottom" align="start">
                <div className="space-y-2">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">AI Sources:</h4>
                    <p className="text-xs text-gray-600">{question.sources_text || 'No sources provided'}</p>
                  </div>
                  {question.justification && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Justification:</h4>
                      <p className="text-xs text-gray-600">{question.justification}</p>
                    </div>
                  )}
                  {!question.justification && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Justification:</h4>
                      <p className="text-xs text-gray-400 italic">No justification provided</p>
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center justify-between gap-4 mt-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap pl-0">
            <Button 
              size="sm" 
              variant="outline"
              className="border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900"
              onClick={handleEditClick} 
              disabled={loadingStatusChange || loadingSaveResponse || isCommentSectionOpen}
            >
              Edit Response
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900"
              onClick={onToggleCommentSection} 
              disabled={loadingStatusChange || loadingSaveResponse || isEditing}
            >
              <MessageCircle className="h-4 w-4 mr-1.5" />
              Comments
              {commentsLoading ? (
                <Loader2 className="ml-1.5 h-3 w-3 animate-spin" />
              ) : comments.length > 0 && (
                <span className="ml-1.5 bg-gray-200 text-gray-600 rounded-full px-1.5 py-0.5 text-xs font-medium">
                  {comments.length}
                </span>
              )}
            </Button>
          </div>
          
          <div className="pr-0">
            <AssigneeManager 
              questionId={question.id}
              currentEditorId={question.editor_id || null}
              currentReviewerId={question.reviewer_id || null}
              onUpdateAssignee={onUpdateAssignee}
            />
          </div>
        </div>

        {isCommentSectionOpen && (
          <div className="mt-4 border-t pt-4">
            <CommentsSection
              questionId={question.id}
              comments={comments}
              setComments={setComments as React.Dispatch<React.SetStateAction<CommentSectionRfpCommentType[]>>}
              onClose={onToggleCommentSection}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
} 