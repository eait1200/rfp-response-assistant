'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import AppShell from '@/components/layout/AppShell';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  app_role: string;
  updated_at: string;
}

export default function ProfilePage() {
  const { user, loading: userLoading } = useSupabaseUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const userId = searchParams.get('userId');
  const isEditingOtherUser = userId && userId !== user?.id;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fullName, setFullName] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      router.replace('/auth/login');
    }
  }, [user, userLoading, router]);

  // Redirect if trying to access another user's profile without admin rights
  useEffect(() => {
    if (!userLoading && user && isEditingOtherUser && user.app_metadata?.app_role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit other user profiles.",
        variant: "destructive",
      });
      router.replace('/profile');
    }
  }, [user, userLoading, isEditingOtherUser, router, toast]);

  // Fetch user profile
  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        try {
          // Use the userId from the query param if available, otherwise use the current user's ID
          const targetUserId = userId || user.id;
          const response = await fetch(`/api/user/profile${targetUserId ? `?userId=${targetUserId}` : ''}`);
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch profile');
          }
          
          const data = await response.json();
          if (data.profile) {
            setProfile(data.profile);
            setIsOwnProfile(data.isOwnProfile);
            
            // Set form values
            const currentFirstName = data.profile.first_name || '';
            const currentLastName = data.profile.last_name || '';
            setFirstName(currentFirstName);
            setLastName(currentLastName);
            setFullName(`${currentFirstName} ${currentLastName}`.trim());
          } else {
            // Handle case where profile might be null but user exists
            // This might happen if the profiles table entry is missing
            setProfile(null); 
            setFirstName('');
            setLastName('');
            setFullName('');
            if (user.email) { // Fallback for display if profile is missing
                 setProfile(prev => ({
                    ...(prev || {}), // Keep other potential fields if any
                    id: user.id,
                    email: user.email,
                    app_role: user.app_metadata?.app_role || 'member',
                    updated_at: user.updated_at || new Date().toISOString(),
                    first_name: null, // Explicitly null
                    last_name: null, // Explicitly null
                }) as UserProfile);
            }
             toast({
                title: 'Profile data incomplete',
                description: 'Could not load full profile details. Some information might be missing.',
                variant: 'default',
            });
          }
        } catch (error: any) {
          console.error('Error fetching profile:', error);
          toast({
            title: 'Error loading profile',
            description: error.message,
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    if (!userLoading && user) {
      fetchProfile();
    }
  }, [user, userLoading, userId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const targetUserId = userId || user.id;
      
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: targetUserId,
          firstName,
          lastName,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      const data = await response.json();
      
      // Update local profile state with new data
      setProfile(prev => {
        const updatedProfile = prev ? { ...prev, first_name: firstName, last_name: lastName } : ({
          id: targetUserId, // Ensure ID is set if prev was null
          email: user.email || '', // Fallback for email
          app_role: user.app_metadata?.app_role || 'member', // Fallback for role
          updated_at: new Date().toISOString(),
          first_name: firstName,
          last_name: lastName,
        } as UserProfile);
        setFullName(`${firstName} ${lastName}`.trim());
        return updatedProfile;
      });
      
      toast({
        title: 'Profile Updated',
        description: 'The profile has been updated successfully.',
      });
      
      if (isEditingOtherUser) {
        // If admin edited another user, go back to the user list
        router.push('/admin/users');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const navigateBack = () => {
    if (isEditingOtherUser) {
      router.push('/admin/users');
    }
  };

  if (userLoading || isLoading) {
    return (
      <AppShell activeRoute="profile">
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-everstream-blue" />
          <p className="ml-2 text-lg">Loading profile...</p>
        </div>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell activeRoute="profile">
        <div className="flex justify-center items-center min-h-[60vh]">
          <p className="text-lg">Redirecting to login...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activeRoute="profile">
      <div className="container mx-auto py-8 px-4 md:px-6">
        {isEditingOtherUser && (
          <div className="mb-4">
            <Button variant="ghost" onClick={navigateBack} className="flex items-center text-sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to User Management
            </Button>
          </div>
        )}
      
        <h1 className="text-3xl font-bold mb-8 font-raleway">
          {isEditingOtherUser ? `Edit Profile: ${profile?.email}` : 'Your Profile'}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Basic account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-muted-foreground">Full Name</Label>
                  <div id="fullName" className="text-base mt-1">{profile?.first_name || profile?.last_name ? fullName : (user.email ? 'N/A' : 'Loading...')}</div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-muted-foreground">Email</Label>
                  <div id="email" className="text-base mt-1">{profile?.email || user.email}</div>
                </div>
                <div>
                  <Label htmlFor="role" className="text-muted-foreground">Role</Label>
                  <div id="role" className="text-base mt-1 capitalize">{profile?.app_role || user.app_metadata?.app_role || 'Member'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {isEditingOtherUser && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={navigateBack}
                  >
                    Cancel
                  </Button>
                )}
                <Button 
                  type="submit" 
                  disabled={isSaving} 
                  className="bg-everstream-orange hover:bg-everstream-orange/90 text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </AppShell>
  );
} 