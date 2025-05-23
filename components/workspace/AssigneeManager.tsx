'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Check, User, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
}

interface AssigneeManagerProps {
  questionId: string;
  currentEditorId: string | null;
  currentReviewerId: string | null;
  onUpdateAssignee: (questionId: string, field: 'editor_id' | 'reviewer_id', userId: string | null) => Promise<void>;
}

export default function AssigneeManager({
  questionId,
  currentEditorId,
  currentReviewerId,
  onUpdateAssignee,
}: AssigneeManagerProps) {
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isUpdatingEditor, setIsUpdatingEditor] = useState(false);
  const [isUpdatingReviewer, setIsUpdatingReviewer] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUsers() {
      setLoadingUsers(true);
      try {
        // console.log("AssigneeManager: Fetching all users...");
        // Replace with actual RPC call:
        const { data: usersData, error: usersError } = await supabase.rpc('get_all_user_profiles');
        
        if (usersError && usersError.message) {
          throw new Error(usersError.message);
        } else if (usersError) {
          throw new Error('An unknown error occurred while fetching users.');
        }
        setAvailableUsers(usersData || []);
      } catch (error: any) {
        console.error('Error fetching users in AssigneeManager:', error);
        toast({
          title: "Error Loading Users",
          description: error.message || "Could not fetch user list.",
          variant: "destructive",
        });
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchUsers();
  }, [toast]);

  const getUserDisplayName = (userId: string | null): string => {
    if (!userId) return 'Unassigned';
    const user = availableUsers.find(u => u.id === userId);
    if (!user) return 'Unknown';
    return user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email;
  };

  const getInitials = (userId: string | null): string => {
    if (!userId) return '';
    const user = availableUsers.find(u => u.id === userId);
    if (!user) return '?'; // Fallback for unknown user

    if (user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    } else if (user.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '?'; // Default fallback
  };

  const handleAssign = async (role: 'editor' | 'reviewer', userIdToAssign: string | null) => {
    if (role === 'editor') setIsUpdatingEditor(true);
    if (role === 'reviewer') setIsUpdatingReviewer(true);

    try {
      await onUpdateAssignee(questionId, role === 'editor' ? 'editor_id' : 'reviewer_id', userIdToAssign);
      toast({
        title: "Success",
        description: `${userIdToAssign ? getUserDisplayName(userIdToAssign) : 'User'} ${userIdToAssign ? 'assigned' : 'removed'} as ${role}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to update ${role}: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      if (role === 'editor') setIsUpdatingEditor(false);
      if (role === 'reviewer') setIsUpdatingReviewer(false);
    }
  };

  const renderAssigneeButton = (
    type: 'editor' | 'reviewer',
    currentUserId: string | null,
    isUpdating: boolean
  ) => {
    const initials = getInitials(currentUserId);
    const icon = currentUserId ? <span className="text-xs font-semibold">{initials}</span> : <UserPlus className="h-4 w-4" />;
    const buttonColor = currentUserId 
      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
      : 'bg-gray-200 text-gray-600 hover:bg-gray-300';

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`h-9 w-9 rounded-full ${buttonColor} flex items-center justify-center`}
            disabled={isUpdating || loadingUsers}
            title={currentUserId ? `Assigned: ${getUserDisplayName(currentUserId)}` : `Assign ${type}`}
          >
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-60 p-2" align="end">
          <div className="space-y-1">
            <p className="text-sm font-medium p-2">{`Assign ${type.charAt(0).toUpperCase() + type.slice(1)}`}</p>
            {loadingUsers && <div className="flex items-center justify-center p-2"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> <span className='ml-2 text-sm text-muted-foreground'>Loading users...</span></div>}
            {!loadingUsers && availableUsers.map(user => (
              <Button
                key={user.id}
                variant="ghost"
                className={`w-full justify-start text-sm h-9 ${currentUserId === user.id ? 'bg-slate-100' : ''}`}
                onClick={() => handleAssign(type, user.id)}
                disabled={currentUserId === user.id || isUpdating}
              >
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className='truncate'>{user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email}</span>
                {currentUserId === user.id && <Check className="h-4 w-4 ml-auto text-emerald-500" />}
              </Button>
            ))}
            {!loadingUsers && availableUsers.length === 0 && <p className="text-xs text-muted-foreground p-2 text-center">No users found.</p>}
            {currentUserId && (
              <>
                <div className="border-t my-1"></div>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-9 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleAssign(type, null)}
                  disabled={isUpdating}
                >
                  Remove {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex flex-col items-center">
        {renderAssigneeButton('editor', currentEditorId, isUpdatingEditor)}
        <span className="text-xs text-muted-foreground mt-1">Editor</span>
      </div>
      <div className="flex flex-col items-center">
        {renderAssigneeButton('reviewer', currentReviewerId, isUpdatingReviewer)}
        <span className="text-xs text-muted-foreground mt-1">Reviewer</span>
      </div>
    </div>
  );
} 