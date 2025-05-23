'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AppShell from '@/components/layout/AppShell';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, UserCog, ShieldAlert, Trash2, Edit } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface UserDataFromApi {
  id: string;
  email: string | undefined;
  app_role: string | null;
  created_at: string;
}

export default function AdminUsersPage() {
  const { user: callingUser, loading: userLoading } = useSupabaseUser();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserDataFromApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isInviting, setIsInviting] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState<string | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState<string | null>(null); // userId of user being deleted
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<UserDataFromApi | null>(null);

  useEffect(() => {
    if (!userLoading && (!callingUser || callingUser.app_metadata.app_role !== 'admin')) {
      toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
      router.push('/dashboard'); 
    }
  }, [callingUser, userLoading, router, toast]);

  const fetchUsersList = useCallback(async () => {
    if (callingUser && callingUser.app_metadata.app_role === 'admin') {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data.users || []);
      } catch (error: any) {
        console.error("Error fetching users:", error);
        toast({ title: "Error fetching users", description: error.message, variant: "destructive" });
        setUsers([]);
      }
      setIsLoading(false);
    } else if (!userLoading) {
      setIsLoading(false);
      setUsers([]);
    }
  }, [callingUser, userLoading, toast]);

  useEffect(() => {
    if (!userLoading && callingUser) {
        fetchUsersList();
    }
  }, [callingUser, userLoading, fetchUsersList]);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) {
      toast({ title: "Email required", description: "Please enter an email to invite.", variant: "destructive" });
      return;
    }
    setIsInviting(true);
    try {
      const response = await fetch('/api/admin/invite-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to invite user');
      toast({ title: "Success", description: result.message });
      setInviteEmail('');
      setInviteRole('member');
      fetchUsersList();
    } catch (error: any) {
      toast({ title: "Invite Error", description: error.message, variant: "destructive" });
    }
    setIsInviting(false);
  };

  const handleChangeUserRole = async (userId: string, newRole: 'admin' | 'member') => {
    if (userId === callingUser?.id && newRole !== 'admin') {
      toast({ title: "Action Denied", description: "Admins cannot demote themselves.", variant: "destructive" });
      return;
    }
    setIsUpdatingRole(userId);
    
    const updateRoleWithRetry = async (retryCount = 0): Promise<boolean> => {
      try {
        const response = await fetch('/api/admin/update-user-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, newRole }),
        });
        const result = await response.json();
        
        if (!response.ok) {
          // If this is a "Database error loading user" and we can retry
          if (result.error?.includes('Database error loading user') && retryCount < 1) {
            console.log("Retrying role update due to database loading error...");
            // Wait a short time before retrying to give Supabase time to sync metadata
            await new Promise(resolve => setTimeout(resolve, 1500));
            return updateRoleWithRetry(retryCount + 1);
          }
          
          throw new Error(result.error || 'Failed to update role');
        }
        
        toast({ title: "Success", description: `User role updated to ${newRole}.` });
        return true;
      } catch (error: any) {
        // If this is the retry attempt, show an error toast
        if (retryCount > 0) {
          toast({ 
            title: "Role Update Error", 
            description: `${error.message} (after retry)`, 
            variant: "destructive" 
          });
        } else {
          toast({ title: "Role Update Error", description: error.message, variant: "destructive" });
        }
        return false;
      }
    };
    
    const success = await updateRoleWithRetry();
    if (success) {
      // Refresh the user list only if the update was successful
      try {
        await fetchUsersList();
      } catch (error) {
        console.error("Error refreshing user list after role update:", error);
      }
    }
    
    setIsUpdatingRole(null);
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === callingUser?.id) {
      toast({ title: "Action Denied", description: "Admins cannot delete themselves.", variant: "destructive" });
      return;
    }
    setIsDeletingUser(userId);
    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to delete user');
      toast({ title: "Success", description: 'User deleted successfully.' });
      fetchUsersList(); // Refresh the list
    } catch (error: any) {
      toast({ title: "Delete User Error", description: error.message, variant: "destructive" });
    }
    setIsDeletingUser(null);
    setShowDeleteConfirm(null); // Close confirmation dialog
  };

  const navigateToUserProfileEdit = (userId: string) => {
    router.push(`/profile?userId=${userId}`);
  };

  if (userLoading || isLoading) {
    return <AppShell activeRoute="admin/users"><div className="flex justify-center items-center min-h-[60vh]"><p>Loading admin console...</p></div></AppShell>;
  }

  if (!callingUser || callingUser.app_metadata.app_role !== 'admin') {
    return <AppShell activeRoute="admin/users"><div className="flex justify-center items-center min-h-[60vh]"><p>Access Denied. Redirecting...</p></div></AppShell>;
  }

  return (
    <AppShell activeRoute="admin/users"> 
      <div className="container mx-auto py-8 px-4 md:px-6">
        <h1 className="text-3xl font-bold mb-8 font-raleway">Admin: User Management</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Invite New User</CardTitle>
            <CardDescription>Send an invitation email to a new user to join the platform.</CardDescription>
          </CardHeader>
          <form onSubmit={handleInviteUser}>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="invite-email" className="mb-1 block">Email</Label>
                <Input 
                  id="invite-email" 
                  type="email" 
                  placeholder="Enter email to invite"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="invite-role" className="mb-1 block">Role to Assign</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger id="invite-role" className="w-full md:w-[180px]">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                disabled={isInviting || (isUpdatingRole !== null) || (isDeletingUser !== null)}
                className="bg-everstream-orange hover:bg-everstream-orange/90 text-white"
              >
                {isInviting ? 'Sending Invitation...' : 'Invite User'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>List of all registered users in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.app_role === 'admin' ? 'default' : 'secondary'}>
                          {u.app_role || 'member'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              disabled={isUpdatingRole === u.id || isDeletingUser === u.id || u.id === callingUser?.id}
                            >
                              <span className="sr-only">Open menu</span>
                              {(isUpdatingRole === u.id || isDeletingUser === u.id) ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div> : <MoreHorizontal className="h-4 w-4" />}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigateToUserProfileEdit(u.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {u.app_role !== 'admin' && (
                              <DropdownMenuItem onClick={() => handleChangeUserRole(u.id, 'admin')}>
                                <ShieldAlert className="mr-2 h-4 w-4" />
                                Promote to Admin
                              </DropdownMenuItem>
                            )}
                            {u.app_role === 'admin' && u.id !== callingUser?.id && (
                              <DropdownMenuItem onClick={() => handleChangeUserRole(u.id, 'member')}>
                                <UserCog className="mr-2 h-4 w-4" />
                                Demote to Member
                              </DropdownMenuItem>
                            )}
                            {u.id !== callingUser?.id && <DropdownMenuSeparator />}
                            {u.id !== callingUser?.id && (
                              <DropdownMenuItem 
                                onClick={() => setShowDeleteConfirm(u)}
                                className="text-red-600 focus:text-red-700 focus:bg-red-50"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">No users found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      {showDeleteConfirm && (
        <AlertDialog open onOpenChange={() => setShowDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user 
                <span className="font-semibold"> {showDeleteConfirm.email} </span> 
                and remove their data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDeleteConfirm(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => handleDeleteUser(showDeleteConfirm.id)} 
                className="bg-red-600 hover:bg-red-700"
                disabled={isDeletingUser === showDeleteConfirm.id}
              >
                {isDeletingUser === showDeleteConfirm.id ? "Deleting..." : "Yes, delete user"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </AppShell>
  );
} 