import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Use the same RfpComment type as in RfpQuestionRow
export type RfpComment = {
  id: string;
  question_id: string;
  user_display_name: string;
  comment_text: string;
  created_at: string;
  // Add any other fields as needed
};

interface CommentsSectionProps {
  questionId: string;
  comments: RfpComment[];
  setComments: (comments: RfpComment[]) => void;
  onClose: () => void;
}

export default function CommentsSection({ questionId, comments, setComments, onClose }: CommentsSectionProps) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handlePostComment() {
    if (!comment.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/rfp-comments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          commentText: comment,
          // userDisplayName: 'John Doe', // No longer needed, derived server-side
        }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.comment) {
          setComments([...comments, result.comment]);
          setComment('');
          toast({ title: 'Comment posted!', description: 'Your comment has been added.' });
        } else {
          toast({ title: 'Error', description: result.error || 'Failed to post comment.', variant: 'destructive' });
        }
      } else {
        const errorData = await res.text();
        toast({ title: 'Error', description: errorData || 'Failed to post comment.', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to post comment.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-accordion-down">
      <div className="font-semibold text-everstream-blue mb-2">Comments</div>
      <div className="space-y-3 mb-3">
        {comments.map((c) => (
          <div key={c.id} className="flex items-start gap-2">
            <div className="h-7 w-7 rounded-full bg-everstream-blue text-white flex items-center justify-center text-xs font-medium">
              {c.user_display_name ? c.user_display_name.split(' ').map((n: string) => n[0]).join('') : 'U'}
            </div>
            <div>
              <div className="font-work-sans text-xs text-gray-700">
                {c.user_display_name || 'User'} <span className="text-gray-400">{c.created_at ? new Date(c.created_at).toLocaleString() : ''}</span>
              </div>
              <div className="font-work-sans text-sm text-gray-800">{c.comment_text}</div>
            </div>
          </div>
        ))}
      </div>
      <textarea
        className="w-full min-h-[50px] border rounded p-2 font-work-sans text-sm mb-2 focus:ring-2 focus:ring-everstream-blue"
        placeholder="Add a comment..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        disabled={loading}
      />
      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="outline" onClick={onClose} disabled={loading}>Close</Button>
        <Button size="sm" className="bg-everstream-orange text-white hover:bg-orange-600" onClick={handlePostComment} disabled={loading || !comment.trim()}>{loading ? 'Posting...' : 'Post Comment'}</Button>
      </div>
    </div>
  );
} 