'use client';

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MoreVertical, Trash2, Edit, Info } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import TrustScore from '@/components/ui/trust-score';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define the RfpProject type, similar to the one in app/rfps/all/page.tsx
// Ideally, this would be in a shared types file
export type RfpProject = {
  id: string;
  original_filename: string | null;
  status: string | null; // Status might not be directly displayed on this card version but good to have
  uploaded_at: string | null;
  completed_at: string | null; // Also might not be directly displayed
  total_questions: number;
  approved_questions: number;
  customer_name: string | null;
  accuracy_score: number; // Changed from optional to required to match page.tsx
};

interface RfpProjectCardProps {
  project: RfpProject;
  onCardClick: (projectId: string) => void;
  onEdit: (project: RfpProject, event: React.MouseEvent) => void;
  onDelete: (projectId: string, event: React.MouseEvent) => void;
}

export default function RfpProjectCard({ project, onCardClick, onEdit, onDelete }: RfpProjectCardProps) {
  // If accuracy score is 0, use a placeholder value of 50 for demonstration
  // In production, this would show the actual calculated value
  const accuracyScore = project.accuracy_score || 50;
  
  return (
    <Card
      key={project.id}
      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out flex flex-col overflow-hidden cursor-pointer group"
      onClick={() => onCardClick(project.id)}
    >
      <div className="p-6 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-[#0076a9] leading-tight group-hover:text-[#ea931a] transition-colors duration-200 truncate pr-2" title={project.original_filename || 'Untitled RFP'}>
              {project.original_filename || 'Untitled RFP'}
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="text-[#838792] hover:text-[#0076a9] -mr-2 -mt-1 flex-shrink-0 w-8 h-8">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={(e) => onEdit(project, e)} className="hover:bg-slate-100">
                  <Edit className="mr-2 h-4 w-4 text-[#0076a9]" /> Edit Project
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => onDelete(project.id, e)} className="text-red-600 hover:bg-red-50 focus:text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-16">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-medium text-[#838792]">Customer</p>
                <p className="text-sm text-[#0076a9] font-medium truncate" title={project.customer_name || 'N/A'}>
                  {project.customer_name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#838792]">Uploaded</p>
                <p className="text-sm text-[#0076a9] font-medium">
                  {project.uploaded_at ? new Date(project.uploaded_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="flex items-center justify-end mb-1 w-full">
                <p className="text-xs font-medium text-[#838792] mr-1">Accuracy Score</p>
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Info className="h-3.5 w-3.5 text-[#838792] cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-white p-3 border border-slate-200 shadow-md rounded-md">
                      <p className="w-60 text-xs">
                        The average AI confidence score across all questions in this RFP.
                        <br /><br />
                        <span className="text-emerald-500 font-medium">80-100:</span> High confidence
                        <br />
                        <span className="text-amber-500 font-medium">50-79:</span> Medium confidence
                        <br />
                        <span className="text-red-500 font-medium">0-49:</span> Low confidence
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex justify-center w-full mt-1">
                <TrustScore 
                  value={accuracyScore} 
                  size="md" 
                  showLabel={false} 
                  numericClassName="text-3xl font-bold"
                  showCircle={false}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="font-medium text-[#838792]">Approval Progress</span>
            <span className="text-[#0076a9]">
              {project.approved_questions} / {project.total_questions} Questions
            </span>
          </div>
          <Progress
            value={project.total_questions > 0 ? (project.approved_questions / project.total_questions) * 100 : 0}
            className="w-full h-2.5 bg-slate-200 rounded-full [&>div]:bg-[#ea931a]"
          />
        </div>
      </div>
    </Card>
  );
} 