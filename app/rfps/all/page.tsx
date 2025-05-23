'use client';
import { useRouter } from 'next/navigation';
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { MoreVertical, Trash2, Edit, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import RfpProjectCard from '@/components/rfp/RfpProjectCard';

export type RfpProject = {
  id: string;
  original_filename: string | null;
  status: string | null;
  uploaded_at: string | null;
  completed_at: string | null;
  total_questions: number;
  approved_questions: number;
  customer_name: string | null;
  accuracy_score: number;
};

// Dummy customer data for the dropdown
const DUMMY_CUSTOMERS = [
  "Customer Alpha",
  "Customer Beta",
  "Customer Gamma",
  "Customer Delta",
  "Customer Epsilon",
];

export default function AllRfpsPage() {
  const { user, loading: userLoading } = useSupabaseUser();
  const router = useRouter();
  const { toast } = useToast();
  const [projects, setProjects] = useState<RfpProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the edit dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentEditingProject, setCurrentEditingProject] = useState<RfpProject | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | undefined>(undefined);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      // Include both trust_score and confidence_score_calculated in the query
      const { data, error: queryError } = await supabase
        .from('rfp_projects')
        .select(`
          id,
          original_filename,
          status,
          uploaded_at,
          completed_at,
          customer_name,
          rfp_questions (id, status, trust_score, confidence_score_calculated)
        `)
        .order('uploaded_at', { ascending: false });

      if (queryError) {
        console.error("Error fetching projects:", queryError);
        setError('Failed to fetch projects: ' + queryError.message);
        setProjects([]);
      } else if (data) {
        const formattedProjects = data.map(p => {
          const questions = p.rfp_questions as unknown as Array<{
            id: string;
            status: string | null;
            trust_score: number | null;
            confidence_score_calculated: number | null;
          }>;
          
          let total_questions = 0;
          let approved_questions = 0;
          let accuracy_score = 0;
          
          if (Array.isArray(questions)) {
            total_questions = questions.length;
            approved_questions = questions.filter(q => q.status === 'Approved').length;
            
            // Calculate the average accuracy score using both trust_score and confidence_score_calculated
            const scores: number[] = [];
            
            questions.forEach(q => {
              if (q.trust_score !== null && q.trust_score !== undefined) {
                // Use trust_score if available (already 0-100)
                scores.push(q.trust_score);
              } else if (q.confidence_score_calculated !== null && q.confidence_score_calculated !== undefined) {
                // Convert confidence_score_calculated (0-1) to percentage (0-100)
                scores.push(Math.round(q.confidence_score_calculated * 100));
              }
            });
            
            if (scores.length > 0) {
              // Calculate average and round to nearest integer
              accuracy_score = Math.round(
                scores.reduce((sum, score) => sum + score, 0) / scores.length
              );
              
              // Ensure accuracy_score is between 0 and 100
              accuracy_score = Math.max(0, Math.min(100, accuracy_score));
              
              console.log(`Project ${p.id} (${p.original_filename}) has ${scores.length} confidence scores with average: ${accuracy_score}%`);
            } else {
              // Default to 50 if no confidence scores are available
              accuracy_score = 50;
              console.log(`Project ${p.id} (${p.original_filename}) has no confidence scores, using default: ${accuracy_score}%`);
            }
          }

          return {
            ...p,
            total_questions,
            approved_questions,
            accuracy_score
          } as RfpProject;
        });
        
        setProjects(formattedProjects);
      }
    } catch (e: any) {
      console.error("Exception fetching projects:", e);
      setError('An unexpected error occurred while fetching projects.');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!userLoading && user) {
      fetchProjects();
    }
  }, [user, userLoading, fetchProjects]);

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace('/auth/login');
    }
  }, [user, userLoading, router]);

  const handleCardClick = (projectId: string) => {
    router.push(`/rfps/${projectId}`);
  };

  const openEditDialog = (project: RfpProject, event: React.MouseEvent) => {
    event.stopPropagation();
    setCurrentEditingProject(project);
    setEditedTitle(project.original_filename || '');
    setSelectedCustomer(project.customer_name || undefined);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!currentEditingProject) return;
    setIsSavingEdit(true);
    try {
      const { error: updateError } = await supabase
        .from('rfp_projects')
        .update({
          original_filename: editedTitle,
          customer_name: selectedCustomer,
        })
        .match({ id: currentEditingProject.id });

      if (updateError) {
        throw updateError;
      }
      
      toast({ title: "Project Updated", description: "The project details have been saved." });
      setIsEditDialogOpen(false);
      fetchProjects();
    } catch (err: any) {
      console.error("Error updating project:", err);
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsSavingEdit(false);
    }
  };
  
  const handleDeleteProject = async (projectId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;

    const { error: deleteError } = await supabase
      .from('rfp_projects')
      .delete()
      .match({ id: projectId });

    if (deleteError) {
      console.error('Error deleting project:', deleteError);
      toast({ title: "Delete Failed", description: deleteError.message, variant: "destructive" });
    } else {
      toast({ title: "Project Deleted", description: "The project has been removed." });
      fetchProjects();
    }
  };

  if (userLoading || isLoading) {
    return (
      <AppShell activeRoute="all rfps">
        <div className="flex justify-center items-center min-h-[60vh]">
          <p className="text-lg text-gray-600">Loading projects...</p>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell activeRoute="all rfps">
        <div className="p-4 text-red-600 bg-red-100 border border-red-400 rounded-md">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activeRoute="all rfps">
      <div className="bg-slate-50 min-h-full">
        <div className="container mx-auto py-10 px-4 md:px-6">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-bold text-[#0076a9] font-raleway">All RFP Projects</h1>
            <Link href="/upload">
              <Button className="bg-[#ea931a] hover:bg-[#d9830a] text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-transform duration-150 ease-in-out transform hover:scale-105">
                Upload New RFP
              </Button>
            </Link>
          </div>

          {projects.length === 0 ? (
            <Card className="bg-white p-10 rounded-xl shadow-lg text-center text-[#838792]">
              <FileText className="mx-auto h-16 w-16 text-[#0076a9] mb-4" />
              <h3 className="text-xl font-semibold text-[#0076a9] mb-2">No RFP Projects Yet</h3>
              <p className="mb-6">It looks like you haven't uploaded any RFPs. Get started by uploading your first one!</p>
              <Link href="/upload" className="text-[#ea931a] hover:text-[#d9830a] font-semibold underline">Upload your first RFP</Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {projects.map((project) => (
                <RfpProjectCard 
                  key={project.id}
                  project={project}
                  onCardClick={handleCardClick}
                  onEdit={openEditDialog}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      {currentEditingProject && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent onClick={(e) => e.stopPropagation()} className="sm:max-w-[425px] bg-white rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-[#0076a9]">Edit Project Details</DialogTitle>
              <DialogDescription className="text-[#838792]">Modify the title and assign a customer to this RFP project.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-title" className="text-right text-[#838792]">Title</Label>
                <Input id="edit-title" value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} className="col-span-3 border-slate-300 focus:border-[#0076a9]" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-customer" className="text-right text-[#838792]">Customer</Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger className="col-span-3 border-slate-300 focus:border-[#0076a9] text-[#0076a9]"><SelectValue placeholder="Select a customer" /></SelectTrigger>
                  <SelectContent className="bg-white border-slate-300">
                    {DUMMY_CUSTOMERS.map(customer => (
                      <SelectItem key={customer} value={customer} className="hover:bg-slate-100 text-[#0076a9]">{customer}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-2">
              <DialogClose asChild><Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="text-[#838792] border-slate-300 hover:border-[#0076a9] hover:text-[#0076a9]">Cancel</Button></DialogClose>
              <Button type="submit" onClick={handleSaveEdit} disabled={isSavingEdit} className="bg-[#ea931a] hover:bg-[#d9830a] text-white font-semibold shadow-sm hover:shadow-md transition-transform duration-150 ease-in-out transform hover:scale-105">
                {isSavingEdit ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AppShell>
  );
}
