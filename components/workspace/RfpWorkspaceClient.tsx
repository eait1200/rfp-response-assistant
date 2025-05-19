'use client';

import { useState } from 'react';
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
import RfpQuestionsList from './RfpQuestionsList';
import type { Tables } from '@/types/supabase';

interface RfpWorkspaceClientProps {
  project: Tables<'rfp_projects'>;
  questions: Tables<'rfp_questions'>[];
}

export default function RfpWorkspaceClient({ project, questions }: RfpWorkspaceClientProps) {
  const [activeTab, setActiveTab] = useState('questions');

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

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard"
          className="text-everstream-gray hover:text-everstream-blue flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Title Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{project.original_filename || 'RFP Workspace'}</h1>
          <p className="text-muted-foreground">Last updated: {/* TODO: map from project */}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Project
          </Button>
          <Button className="bg-everstream-orange hover:bg-everstream-orange/90">
            <FileDown className="h-4 w-4 mr-2" />
            Export Responses
          </Button>
        </div>
      </div>

      {/* Consolidated Project Context Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: RFP Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              {/* Project Lead at Top */}
              <div className="flex items-center justify-between mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Client</div>
                    <div className="font-medium">{client}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Due Date</div>
                    <div className="font-medium">{dueDate}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-everstream-blue/5 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-everstream-blue text-white flex items-center justify-center text-sm font-medium">
                    {typeof projectLead === 'string' ? projectLead.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '--'}
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Project Lead</div>
                    <div className="text-sm font-medium">{projectLead}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-sm text-muted-foreground">RFP ID</div>
                  <div className="font-medium">{rfpId}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Value</div>
                  <div className="font-medium">{value}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Description</div>
                  <p className="text-sm">{description}</p>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {tags.length > 0 ? tags.map((tag) => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-everstream-blue/10 text-everstream-blue text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    )) : <span className="text-muted-foreground">--</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Project Status */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Total Questions */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-5 w-5 text-everstream-blue" />
                    <div>
                      <div className="text-3xl font-bold font-raleway">{totalQuestions}</div>
                      <div className="text-sm text-muted-foreground">Total Questions</div>
                    </div>
                  </div>
                </div>

                {/* Draft Responses */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <ClipboardList className="h-5 w-5 text-everstream-blue/75" />
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold font-raleway text-everstream-blue">
                          {draftCount}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          of {totalQuestions}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">Draft</div>
                    </div>
                  </div>
                  <Progress 
                    value={totalQuestions ? (draftCount / totalQuestions) * 100 : 0} 
                    className="h-1.5 bg-secondary"
                  />
                </div>

                {/* In Review Responses */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="h-5 w-5 text-everstream-orange" />
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold font-raleway text-everstream-orange">
                          {inReviewCount}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          of {totalQuestions}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">In Review</div>
                    </div>
                  </div>
                  <Progress 
                    value={totalQuestions ? (inReviewCount / totalQuestions) * 100 : 0} 
                    className="h-1.5 bg-secondary"
                    indicatorClassName="bg-everstream-orange"
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
                        <span className="text-sm text-muted-foreground">
                          of {totalQuestions}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">Approved</div>
                    </div>
                  </div>
                  <Progress 
                    value={totalQuestions ? (approvedCount / totalQuestions) * 100 : 0} 
                    className="h-1.5 bg-secondary"
                    indicatorClassName="bg-emerald-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Area */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="questions">Questions & Responses</TabsTrigger>
          <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
        </TabsList>

        <TabsContent value="questions">
          <div className="space-y-4">
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search questions or responses..."
                      className="pl-8"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <RfpQuestionsList questions={questions} />
          </div>
        </TabsContent>

        <TabsContent value="collaborators">
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Team Members</h3>
                <Button>Add Member</Button>
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
                    className="flex items-center justify-between p-4 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-everstream-blue text-white font-medium">
                        {member.initials}
                      </div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">{member.role}</div>
                      </div>
                    </div>
                    <Button variant="outline">Message</Button>
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