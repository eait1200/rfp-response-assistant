'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Check, User, Info } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
// import { useSupabaseUser } from '@/lib/useSupabaseUser'; // Current user context not directly needed for listing all users
import { useToast } from '@/hooks/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Tables } from '@/types/supabase';

// Updated UserProfile to match expected data from get_all_user_profiles
interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string; 
}

interface AttachmentsChecklistProps {
  question: Tables<'rfp_questions'>; // Changed to pass full question data
  onUpdateAssignee: (questionId: string, field: 'editor_id' | 'reviewer_id', value: string | null) => Promise<void>;
}

export default function AttachmentsChecklist({ 
  question,
  onUpdateAssignee 
}: AttachmentsChecklistProps) {
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updating, setUpdating] = useState<'editor' | 'reviewer' | null>(null);
  // const { user } = useSupabaseUser(); // Not directly used here for now
  const { toast } = useToast();

  // Fetch available users from the system
  useEffect(() => {
    async function fetchUsers() {
      setLoadingUsers(true);
      try {
        // In a real implementation, this would call supabase.rpc('get_all_user_profiles')
        // For now, we'll use mock data structured like the expected RPC response
        console.log("Fetching all users...");
        const { data: usersData, error: usersError } = await supabase.rpc('get_all_user_profiles');
        
        if (usersError && usersError.message) {
          console.error('Error fetching users:', usersError.message);
          throw new Error(usersError.message);
        } else if (usersError) {
          console.error('Error fetching users:', usersError);
          throw new Error('An unknown error occurred while fetching users.');
        }
        
        setAvailableUsers(usersData || []);

      } catch (error: any) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: `Failed to load available users: ${error.message}`,
          variant: "destructive"
        });
      } finally {
        setLoadingUsers(false);
      }
    }

    fetchUsers();
  }, [toast]);

  const getUserDisplayName = (userId: string | null): string => {
    if (!userId) return '--';
    const user = availableUsers.find(u => u.id === userId);
    if (!user) return 'Unknown User';
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
    return user.email;
  };

  const handleAssignUser = async (role: 'editor' | 'reviewer', userIdToAssign: string) => {
    setUpdating(role);
    try {
      await onUpdateAssignee(question.id, role === 'editor' ? 'editor_id' : 'reviewer_id', userIdToAssign);
      toast({
        title: "Success",
        description: `${getUserDisplayName(userIdToAssign)} has been assigned as ${role}`,
      });
    } catch (error) {
      console.error(`Error assigning ${role}:`, error);
      toast({
        title: "Error",
        description: `Failed to assign ${role}`,
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveUser = async (role: 'editor' | 'reviewer') => {
    setUpdating(role);
    try {
      await onUpdateAssignee(question.id, role === 'editor' ? 'editor_id' : 'reviewer_id', null);
      toast({
        title: "Success",
        description: `${role} has been removed`,
      });
    } catch (error) {
      console.error(`Error removing ${role}:`, error);
      toast({
        title: "Error",
        description: `Failed to remove ${role}`,
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  };
  
  const editorDisplayName = getUserDisplayName(question.editor_id);
  const reviewerDisplayName = getUserDisplayName(question.reviewer_id);

  return (
    <Card className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-[#0076a9] mb-4">Attachments checklist</h2>
        <p className="text-[#0076a9] font-medium mb-2">By responding to this RFI, please provide the following files:</p>
        <p className="text-muted-foreground mb-4">
          Everstream can furnish a variety of supporting documents as requested in an RFI. Typically, specific files such as 
          personnel CVs or solution roadmaps are provided as separate attachments tailored to your requirements to ensure 
          relevance. Furthermore, Everstream maintains key industry certifications, like SOC 2 Type 2, and evidence of such 
          certifications can also be supplied. This an edit.kjklkjhlkhk
        </p>
        
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

        <div className="flex items-center gap-4 mt-4">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline">
                <span className="font-medium text-muted-foreground mr-1">Editor:</span>
                <span className="text-[#0076a9] ml-1">{editorDisplayName}</span>
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-8 w-8 rounded-full ${question.editor_id ? 'bg-emerald-100 text-emerald-500 hover:bg-emerald-200' : 'bg-blue-100 text-blue-500 hover:bg-blue-200'}`}
                    disabled={updating !== null || loadingUsers}
                  >
                    {loadingUsers ? <div className="h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div> : (question.editor_id ? <Check className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="end">
                  <div className="space-y-1">
                    <p className="text-sm font-medium mb-2">Assign Editor</p>
                    {loadingUsers && <p className="text-xs text-muted-foreground p-2">Loading users...</p>}
                    {!loadingUsers && availableUsers.map(user => (
                      <Button 
                        key={user.id}
                        variant="ghost" 
                        className="w-full justify-start text-sm" // Adjusted for longer names/emails
                        onClick={() => handleAssignUser('editor', user.id)}
                        disabled={question.editor_id === user.id} // Disable if already assigned
                      >
                        <User className="h-4 w-4 mr-2" />
                        {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email}
                        {question.editor_id === user.id && <Check className="h-4 w-4 ml-auto text-emerald-500" />} 
                      </Button>
                    ))}
                    {!loadingUsers && availableUsers.length === 0 && <p className="text-xs text-muted-foreground p-2">No users found.</p>}
                    {question.editor_id && (
                      <>
                        <div className="border-t my-2"></div>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-sm text-red-500 hover:text-red-500 hover:bg-red-50"
                          onClick={() => handleRemoveUser('editor')}
                        >
                          Remove Editor
                        </Button>
                      </>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="w-px h-6 bg-gray-200"></div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline">
                <span className="font-medium text-muted-foreground mr-1">Reviewer:</span>
                <span className="text-[#0076a9] ml-1">{reviewerDisplayName}</span>
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-8 w-8 rounded-full ${question.reviewer_id ? 'bg-emerald-100 text-emerald-500 hover:bg-emerald-200' : 'bg-blue-100 text-blue-500 hover:bg-blue-200'}`}
                    disabled={updating !== null || loadingUsers}
                  >
                    {loadingUsers ? <div className="h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div> : (question.reviewer_id ? <Check className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="end">
                  <div className="space-y-1">
                    <p className="text-sm font-medium mb-2">Assign Reviewer</p>
                     {loadingUsers && <p className="text-xs text-muted-foreground p-2">Loading users...</p>}
                    {!loadingUsers && availableUsers.map(user => (
                      <Button 
                        key={user.id}
                        variant="ghost" 
                        className="w-full justify-start text-sm"
                        onClick={() => handleAssignUser('reviewer', user.id)}
                        disabled={question.reviewer_id === user.id} // Disable if already assigned
                      >
                        <User className="h-4 w-4 mr-2" />
                        {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email}
                        {question.reviewer_id === user.id && <Check className="h-4 w-4 ml-auto text-emerald-500" />} 
                      </Button>
                    ))}
                    {!loadingUsers && availableUsers.length === 0 && <p className="text-xs text-muted-foreground p-2">No users found.</p>}
                    {question.reviewer_id && (
                      <>
                        <div className="border-t my-2"></div>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-sm text-red-500 hover:text-red-500 hover:bg-red-50"
                          onClick={() => handleRemoveUser('reviewer')}
                        >
                          Remove Reviewer
                        </Button>
                      </>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        
      </CardContent>
    </Card>
  );
} 