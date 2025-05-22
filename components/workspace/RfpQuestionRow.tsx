'use client';

import type { Tables, TablesInsert } from '@/types/supabase';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, UserPlus, MessageCircle, Loader2, MoreHorizontal } from 'lucide-react';
import TrustScore from '@/components/ui/trust-score';
import AssigneePopover from '@/components/workspace/RfpRowAssigneePopover';
import EditResponseArea from '@/components/workspace/RfpRowEditResponseArea';
import CommentsSection, { RfpComment as CommentSectionRfpCommentType } from '@/components/workspace/RfpRowCommentsSection';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

interface RfpQuestionRowProps {
  question: Tables<'rfp_questions'>;
  onQuestionUpdate: (updatedQuestion: Tables<'rfp_questions'>) => void;
  isCommentSectionOpen: boolean;
  onToggleCommentSection: () => void;
}

export type RfpCommentRowType = CommentSectionRfpCommentType;

const ALL_STATUSES: Array<Tables<'rfp_questions'>['status']> = ["Draft", "In Review", "Approved"];

export default function RfpQuestionRow({
  question,
  onQuestionUpdate,
  isCommentSectionOpen,
  onToggleCommentSection,
}: RfpQuestionRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showAssignees, setShowAssignees] = useState(false);
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
      case 'Approved': return 'bg-emerald-500 text-white';
      case 'In Review': return 'bg-everstream-orange text-white';
      case 'Draft': return 'bg-blue-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const questionFont = 'font-raleway font-semibold text-base text-everstream-blue';
  const responseFont = 'font-work-sans text-sm';
  const responseToDisplay = (question.edited_answer?.trim() ? question.edited_answer : (question.ai_generated_answer?.trim() ? question.ai_generated_answer : 'No response generated yet.'));

  const fetchComments = useCallback(async () => {
    if (!question.id) return;
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
    if (commentsLoading) {
        fetchComments();
    }
  }, [fetchComments, commentsLoading]);

  useEffect(() => {
    if (isCommentSectionOpen) {
      setCommentsLoading(true);
      fetchComments();
    } else {
      if(comments.length > 0 && commentsLoading) {
        setCommentsLoading(false);
      }
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
    <Card className="bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={questionFont}>
                {question.section_header || `${question.original_sheet_name || ''} ${question.original_row_number || ''}`}
              </span>
            </div>
            <div className={questionFont + ' mb-1'}>{question.identified_question_text}</div>
            {isEditing ? (
              <EditResponseArea
                value={editableResponseText ?? ''}
                onChange={setEditableResponseText}
                onSave={handleSaveResponse}
                onCancel={handleCancelEdit}
                loading={loadingSaveResponse}
              />
            ) : (
              <div className={responseFont + ' text-muted-foreground whitespace-pre-line'}>{responseToDisplay}</div>
            )}
            {isCommentSectionOpen && (
              <CommentsSection
                questionId={question.id}
                comments={comments}
                setComments={setComments as React.Dispatch<React.SetStateAction<CommentSectionRfpCommentType[]>>}
                onClose={onToggleCommentSection}
              />
            )}
            <div className="mt-2 text-xs text-muted-foreground">
              <div>AI Sources: {question.sources_text || '--'}</div>
              <div>Editor: {question.editor_info || '--'} | Reviewer: {question.reviewer_info || '--'}</div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Button size="sm" variant="outline" onClick={handleEditClick} disabled={loadingStatusChange || loadingSaveResponse || isCommentSectionOpen}>
                Edit
              </Button>
              <Button size="sm" variant="outline" onClick={onToggleCommentSection} disabled={loadingStatusChange || loadingSaveResponse || isEditing}>
                <MessageCircle className="h-4 w-4 mr-1" />
                Comment
                {commentsLoading ? (
                  <Loader2 className="ml-1 h-3 w-3 animate-spin" />
                ) : comments.length > 0 && (
                  <span className="ml-1 bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs font-semibold">
                    {comments.length}
                  </span>
                )}
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 min-w-[320px] justify-end">
            <Badge className={`${getStatusTagClass(status)} px-2 py-0.5 text-xs font-medium rounded-full`}>
              {loadingStatusChange ? <Loader2 className="h-3 w-3 animate-spin" /> : (status || 'Unknown')}
            </Badge>
            <div className="flex items-center -space-x-2 relative">
              <AssigneePopover
                assigneeIds={question.assignee_ids}
                show={showAssignees}
                onOpen={() => setShowAssignees(true)}
                onClose={() => setShowAssignees(false)}
              />
              <Button
                size="icon"
                variant="ghost"
                className="ml-2"
                onClick={() => setShowAssignees((v) => !v)}
                aria-label="Assign users"
                disabled={loadingStatusChange || loadingSaveResponse}
              >
                <UserPlus className="h-5 w-5 text-everstream-blue" />
              </Button>
            </div>
            <div className="flex flex-col items-center">
              <TrustScore value={score} size="lg" showLabel={true} />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={loadingStatusChange || loadingSaveResponse}>
                  {loadingStatusChange ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-5 w-5" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled>Current: {status}</DropdownMenuItem>
                <DropdownMenuSeparator />
                {ALL_STATUSES.filter(s => s !== status).map(newStatus => (
                  <DropdownMenuItem
                    key={newStatus}
                    onClick={() => handleStatusChange(newStatus)}
                    disabled={loadingStatusChange}
                  >
                    {loadingStatusChange && status === newStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} 
                    Change to: {newStatus}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 