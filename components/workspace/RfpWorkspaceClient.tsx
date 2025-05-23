'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, FileDown, Edit2, Filter, Search, FileText, ClipboardList,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import RfpQuestionsList from './RfpQuestionsList';
import AttachmentsChecklist from './AttachmentsChecklist';
import type { Tables } from '@/types/supabase';

interface RfpWorkspaceClientProps {
  project: Tables<'rfp_projects'>;
  questions: Tables<'rfp_questions'>[];
}

export default function RfpWorkspaceClient({ project, questions: initialQuestions }: RfpWorkspaceClientProps) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [activeTab, setActiveTab] = useState('questions');
  const [openCommentSectionId, setOpenCommentSectionId] = useState<string | null>(null);
  const { toast } = useToast();

  // Map project fields
  const client = project.client_name || '--';
  const dueDate = project.due_date ? new Date(project.due_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '--';
  const rfpId = project.display_rfp_id || '--';
  const value = project.value_range || '--';
  const description = project.description || '--';
  const tags = Array.isArray(project.tags) ? project.tags : [];
  const projectLead = project.project_lead_id || '--';

  // Dynamic question status counts
  const totalQuestions = questions.length;
  const draftCount = questions.filter(q => q.status === 'Draft').length;
  const inReviewCount = questions.filter(q => q.status === 'In Review').length;
  const approvedCount = questions.filter(q => q.status === 'Approved').length;

  // Find the attachments checklist question, if any
  const attachmentsQuestion = questions.find(q => 
    q.identified_question_text.toLowerCase().includes('attachments checklist') || 
    q.identified_question_text.toLowerCase().includes('provide the following files')
  );

  const handleToggleCommentSection = (questionId: string) => {
    setOpenCommentSectionId(prevId => (prevId === questionId ? null : questionId));
  };

  // Centralized function to update local question state
  const updateLocalQuestionState = useCallback((updatedQuestion: Partial<Tables<'rfp_questions'> & { id: string }>) => {
    setQuestions(prevQuestions =>
      prevQuestions.map(q =>
        q.id === updatedQuestion.id ? { ...q, ...updatedQuestion } : q
      )
    );
  }, []);

  // Generalized handler for updating assignees (editor_id or reviewer_id)
  const handleUpdateAssignee = useCallback(async (questionId: string, field: 'editor_id' | 'reviewer_id', userId: string | null) => {
    try {
      const response = await fetch('/api/rfp-questions/update-assignee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          field,
          value: userId // API expects 'value' for the userId or null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update assignee');
      }

      const { updatedQuestion } = await response.json();
      if (updatedQuestion) {
        updateLocalQuestionState(updatedQuestion);
        toast({
          title: "Assignee Updated",
          description: `${field === 'editor_id' ? 'Editor' : 'Reviewer'} for question updated.`
        });
      } else {
        throw new Error('No updated question data returned from API.');
      }
    } catch (error: any) {
      console.error('Error updating assignee:', error);
      toast({
        title: "Error",
        description: `Failed to update ${field === 'editor_id' ? 'editor' : 'reviewer'}: ${error.message}`,
        variant: "destructive"
      });
      // Potentially re-throw or handle more gracefully depending on desired UX
    }
  }, [toast, updateLocalQuestionState]);

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard"
          className="text-[#838792] hover:text-[#0076a9] flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Title Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0076a9] font-raleway">{project.original_filename || 'RFP Workspace'}</h1>
          <p className="text-[#838792] text-sm">Last updated: {/* TODO: map from project */}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-slate-300 text-[#838792] hover:text-[#0076a9] hover:border-[#0076a9]">
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Project
          </Button>
          <Button className="bg-[#ea931a] hover:bg-[#d9830a] text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-transform duration-150 ease-in-out transform hover:scale-105">
            <FileDown className="h-4 w-4 mr-2" />
            Export Responses
          </Button>
        </div>
      </div>

      {/* Consolidated Project Context Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: RFP Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out">
            <CardContent className="p-6">
              {/* Project Lead at Top */}
              <div className="flex items-center justify-between mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-medium text-[#838792]">Client</div>
                    <div className="text-sm text-[#0076a9] font-medium">{client}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#838792]">Due Date</div>
                    <div className="text-sm text-[#0076a9] font-medium">{dueDate}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-[#0076a9]/5 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-[#0076a9] text-white flex items-center justify-center text-sm font-medium">
                    {typeof projectLead === 'string' ? projectLead.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '--'}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#838792]">Project Lead</div>
                    <div className="text-sm text-[#0076a9] font-medium">{projectLead}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-xs font-medium text-[#838792]">RFP ID</div>
                  <div className="text-sm text-[#0076a9] font-medium">{rfpId}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-[#838792]">Value</div>
                  <div className="text-sm text-[#0076a9] font-medium">{value}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs font-medium text-[#838792] mb-1">Description</div>
                  <p className="text-sm text-gray-700">{description}</p>
                </div>

                <div>
                  <div className="text-xs font-medium text-[#838792] mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {tags.length > 0 ? tags.map((tag) => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-[#0076a9]/10 text-[#0076a9] text-xs rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    )) : <span className="text-sm text-[#838792]">--</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Project Status */}
        <div className="space-y-6">
          <Card className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out">
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Total Questions */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-5 w-5 text-[#0076a9]" />
                    <div>
                      <div className="text-3xl font-bold font-raleway text-[#0076a9]">{totalQuestions}</div>
                      <div className="text-sm text-[#838792]">Total Questions</div>
                    </div>
                  </div>
                </div>

                {/* Draft Responses */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <ClipboardList className="h-5 w-5 text-[#0076a9]/75" />
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold font-raleway text-[#0076a9]">
                          {draftCount}
                        </span>
                        <span className="text-sm text-[#838792]">
                          of {totalQuestions}
                        </span>
                      </div>
                      <div className="text-sm text-[#838792]">Draft</div>
                    </div>
                  </div>
                  <Progress 
                    value={totalQuestions ? (draftCount / totalQuestions) * 100 : 0} 
                    className="w-full h-2.5 bg-slate-200 rounded-full [&>div]:bg-[#0076a9]"
                  />
                </div>

                {/* In Review Responses */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="h-5 w-5 text-[#ea931a]" />
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold font-raleway text-[#ea931a]">
                          {inReviewCount}
                        </span>
                        <span className="text-sm text-[#838792]">
                          of {totalQuestions}
                        </span>
                      </div>
                      <div className="text-sm text-[#838792]">In Review</div>
                    </div>
                  </div>
                  <Progress 
                    value={totalQuestions ? (inReviewCount / totalQuestions) * 100 : 0} 
                    className="w-full h-2.5 bg-slate-200 rounded-full [&>div]:bg-[#ea931a]"
                  />
                </div>

                {/* Approved Responses */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold font-raleway text-emerald-500">
                          {approvedCount}
                        </span>
                        <span className="text-sm text-[#838792]">
                          of {totalQuestions}
                        </span>
                      </div>
                      <div className="text-sm text-[#838792]">Approved</div>
                    </div>
                  </div>
                  <Progress 
                    value={totalQuestions ? (approvedCount / totalQuestions) * 100 : 0} 
                    className="w-full h-2.5 bg-slate-200 rounded-full [&>div]:bg-emerald-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Area */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-100 rounded-lg p-1">
          <TabsTrigger 
            value="questions" 
            className="data-[state=active]:bg-white data-[state=active]:text-[#0076a9] data-[state=active]:shadow-md data-[state=active]:font-medium rounded-md px-4 py-2 text-[#838792] transition-all"
          >
            Questions & Responses
          </TabsTrigger>
          <TabsTrigger 
            value="collaborators"
            className="data-[state=active]:bg-white data-[state=active]:text-[#0076a9] data-[state=active]:shadow-md data-[state=active]:font-medium rounded-md px-4 py-2 text-[#838792] transition-all"
          >
            Collaborators
          </TabsTrigger>
          <TabsTrigger 
            value="attachments"
            className="data-[state=active]:bg-white data-[state=active]:text-[#0076a9] data-[state=active]:shadow-md data-[state=active]:font-medium rounded-md px-4 py-2 text-[#838792] transition-all"
          >
            Attachments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#0076a9]">All Questions ({totalQuestions})</h2>
            <div className="flex items-center gap-2">
              <Input type="search" placeholder="Search questions..." className="max-w-xs" />
              <Button variant="outline" className="border-slate-300 text-[#838792]"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
            </div>
          </div>
          <RfpQuestionsList 
            questions={questions}
            openCommentSectionId={openCommentSectionId}
            onToggleCommentSection={handleToggleCommentSection}
            onQuestionUpdate={updateLocalQuestionState} 
            onUpdateAssignee={handleUpdateAssignee} 
          />
        </TabsContent>

        <TabsContent value="attachments" className="mt-6">
          {attachmentsQuestion ? (
            <AttachmentsChecklist 
              question={attachmentsQuestion}
              onUpdateAssignee={handleUpdateAssignee}
            />
          ) : (
            <p className="text-muted-foreground">No attachments checklist found for this RFP.</p>
          )}
        </TabsContent>

        <TabsContent value="collaborators">
          <Card className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[#0076a9]">Team Members</h3>
                <Button className="bg-[#ea931a] hover:bg-[#d9830a] text-white">Add Member</Button>
              </div>

              <div className="space-y-4">
                {[
                  { name: 'John Doe', role: 'Project Lead', initials: 'JD' },
                  { name: 'Jane Smith', role: 'Technical Writer', initials: 'JS' },
                  { name: 'Robert Johnson', role: 'Subject Matter Expert', initials: 'RJ' },
                  { name: 'Emily Wilson', role: 'Reviewer', initials: 'EW' },
                ].map((member, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-[#0076a9]/20 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0076a9] text-white font-medium">
                        {member.initials}
                      </div>
                      <div>
                        <div className="font-medium text-[#0076a9]">{member.name}</div>
                        <div className="text-sm text-[#838792]">{member.role}</div>
                      </div>
                    </div>
                    <Button variant="outline" className="border-slate-300 text-[#838792] hover:text-[#0076a9] hover:border-[#0076a9]">Message</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 