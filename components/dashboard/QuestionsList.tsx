"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown, Filter, Search, Edit2, MessageSquare, MoreVertical, Info, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TrustScore from './TrustScore';
import { cn } from '@/lib/utils';

interface RfpQuestion {
  id: string;
  section: string;
  question: string;
  response?: string;
  trustScore: number;
  status: 'draft' | 'review' | 'approved';
  editor?: string;
  reviewer?: string;
  aiSources?: Array<{ id: string; score: number }>;
}

const mockQuestions: RfpQuestion[] = [
  {
    id: '1',
    section: '3.1 Implementation Strategy',
    question: 'Describe your approach to the implementation of the healthcare management system, including timeline, milestones, and resource allocation.',
    response: 'Our implementation approach follows a proven 5-phase methodology that ensures seamless integration with existing systems while minimizing disruption to operations. We begin with a comprehensive discovery phase to understand current workflows and pain points, followed by design, development, testing, and deployment phases. Key milestones include system architecture approval (Week 3), prototype demonstration (Week 8), user acceptance testing (Week 16), and final deployment (Week 20). Resource allocation is carefully planned with dedicated teams for technical implementation, data migration, training, and support.',
    trustScore: 98,
    status: 'approved',
    editor: 'Jane Smith',
    reviewer: 'Robert Johnson',
    aiSources: [
      { id: 'PIN-123', score: 0.92 },
      { id: 'PIN-456', score: 0.87 }
    ]
  },
  {
    id: '2',
    section: '5.3 Multitier Mapping',
    question: 'Explain how your solution implements multitier mapping across different healthcare specialties and departments.',
    response: 'Our solution implements multitier mapping through a flexible, hierarchical data model that accommodates the diverse needs of different healthcare specialties and departments. This model uses a combination of standard healthcare taxonomies (ICD-10, SNOMED CT) and customizable classification systems that allow for specialty-specific workflows while maintaining interoperability across the organization. Each department can configure their view and workflow while the underlying data structure ensures consistent reporting and analytics.',
    trustScore: 87,
    status: 'review',
    editor: 'Emily Wilson',
    aiSources: [
      { id: 'PIN-789', score: 0.85 }
    ]
  },
  {
    id: '3',
    section: '4.2 Security Compliance',
    question: 'Detail your approach to ensuring HIPAA compliance and data security throughout the system.',
    response: 'Our approach to HIPAA compliance and data security is comprehensive and built into every layer of the system. We implement role-based access controls (RBAC) with fine-grained permissions, end-to-end encryption for all data in transit and at rest using AES-256, and maintain detailed audit logs of all system actions. Regular security assessments include penetration testing, vulnerability scanning, and code reviews conducted by our dedicated security team. All staff undergo mandatory HIPAA training, and we maintain BAAs with all subcontractors.',
    trustScore: 96,
    status: 'approved',
    editor: 'Jane Smith',
    reviewer: 'John Doe',
    aiSources: [
      { id: 'PIN-012', score: 0.94 },
      { id: 'PIN-345', score: 0.91 }
    ]
  },
  {
    id: '4',
    section: '2.1 Technical Architecture',
    question: 'Provide an overview of the technical architecture of your proposed solution.',
    response: 'The technical architecture of our solution follows a modern microservices approach with a clear separation of concerns. The frontend is built on React with a responsive design, while the backend services are implemented using Node.js and Python, containerized with Docker and orchestrated by Kubernetes for scalability. Data persistence is handled by a combination of PostgreSQL for structured data and MongoDB for unstructured clinical documents. The system integrates with external services through a secure API gateway with comprehensive authentication mechanisms.',
    trustScore: 76,
    status: 'review',
    editor: 'Robert Johnson',
    aiSources: [
      { id: 'PIN-678', score: 0.78 }
    ]
  },
  {
    id: '5',
    section: '6.4 Training and Onboarding',
    question: 'Describe your training methodology and approach to user onboarding.',
    response: '',
    trustScore: 0,
    status: 'draft',
    aiSources: []
  },
];

export default function QuestionsList() {
  const [questions, setQuestions] = useState(mockQuestions);
  const [activeTab, setActiveTab] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSources, setShowSources] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(false);

  const filteredQuestions = questions.filter(q => {
    if (activeTab === 'all') return true;
    if (activeTab === 'draft') return q.status === 'draft';
    if (activeTab === 'review') return q.status === 'review';
    if (activeTab === 'approved') return q.status === 'approved';
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  const startEditing = (id: string) => {
    setEditingId(id);
  };

  const stopEditing = () => {
    setEditingId(null);
  };

  const toggleSources = (id: string) => {
    setShowSources(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const changeStatus = (id: string, status: 'draft' | 'review' | 'approved') => {
    setQuestions(
      questions.map(q => q.id === id ? { ...q, status } : q)
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>RFP Questions & Responses</CardTitle>
          <Button variant="outline" className="text-sm">
            <FileDown className="h-4 w-4 mr-2" />
            Export Responses
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search questions or responses..."
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                <SelectItem value="implementation">Implementation</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="training">Training</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">
              All
              <Badge className="ml-2 bg-secondary text-secondary-foreground" variant="secondary">
                {questions.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="draft">
              Draft
              <Badge className="ml-2 bg-secondary text-secondary-foreground" variant="secondary">
                {questions.filter(q => q.status === 'draft').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="review">
              In Review
              <Badge className="ml-2 bg-secondary text-secondary-foreground" variant="secondary">
                {questions.filter(q => q.status === 'review').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved
              <Badge className="ml-2 bg-secondary text-secondary-foreground" variant="secondary">
                {questions.filter(q => q.status === 'approved').length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Generating responses...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuestions.map((item) => (
                  <div
                    key={item.id}
                    className="border border-border rounded-lg overflow-hidden transition-all duration-200"
                  >
                    <div
                      className={cn(
                        "bg-card p-4 cursor-pointer",
                        expanded === item.id && "border-b border-border"
                      )}
                      onClick={() => toggleExpand(item.id)}
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-8">
                          <div className="text-xs text-muted-foreground mb-1">{item.section}</div>
                          <div className="font-medium line-clamp-2">{item.question}</div>
                        </div>
                        <div className="col-span-2 text-right flex items-center justify-end gap-1">
                          <TrustScore value={item.trustScore} />
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                        <div className="col-span-2 text-right">
                          <Badge
                            variant={
                              item.status === 'approved'
                                ? 'default'
                                : item.status === 'review'
                                ? 'secondary'
                                : 'outline'
                            }
                            className={
                              item.status === 'approved'
                                ? 'bg-emerald-500'
                                : ''
                            }
                          >
                            {item.status === 'approved'
                              ? 'Approved'
                              : item.status === 'review'
                              ? 'In Review'
                              : 'Draft'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {expanded === item.id && (
                      <div className="p-4 bg-background">
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold mb-2">Response</h4>
                          {editingId === item.id ? (
                            <Textarea
                              className="min-h-[120px] text-sm"
                              value={item.response || ''}
                              placeholder="Enter your response..."
                            />
                          ) : (
                            <div className="bg-card border border-border rounded-md p-3 text-sm min-h-[120px]">
                              {item.response || 'No response generated yet.'}
                            </div>
                          )}
                        </div>

                        <div className="mb-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSources(item.id);
                            }}
                            className="text-sm text-muted-foreground"
                          >
                            {showSources[item.id] ? (
                              <ChevronUp className="h-4 w-4 mr-1" />
                            ) : (
                              <ChevronDown className="h-4 w-4 mr-1" />
                            )}
                            AI Sources
                          </Button>
                          
                          {showSources[item.id] && item.aiSources && item.aiSources.length > 0 && (
                            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                              {item.aiSources.map((source, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <span className="font-mono">{source.id}</span>
                                  <span className="text-xs">(Score: {source.score.toFixed(2)})</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap justify-between items-center">
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            {item.editor && (
                              <div>
                                Editor: <span className="font-medium">{item.editor}</span>
                              </div>
                            )}
                            {item.reviewer && (
                              <div>
                                Reviewer: <span className="font-medium">{item.reviewer}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 mt-2 sm:mt-0">
                            {editingId === item.id ? (
                              <>
                                <Button variant="outline" size="sm" onClick={stopEditing}>
                                  Cancel
                                </Button>
                                <Button size="sm" onClick={stopEditing}>
                                  Save Changes
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditing(item.id);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Comment
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {item.status === 'draft' && (
                                      <DropdownMenuItem onClick={() => changeStatus(item.id, 'review')}>
                                        Submit for Review
                                      </DropdownMenuItem>
                                    )}
                                    {item.status === 'review' && (
                                      <>
                                        <DropdownMenuItem onClick={() => changeStatus(item.id, 'approved')}>
                                          Approve
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => changeStatus(item.id, 'draft')}>
                                          Send Back to Draft
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    {item.status === 'approved' && (
                                      <DropdownMenuItem onClick={() => changeStatus(item.id, 'review')}>
                                        Revoke Approval
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {filteredQuestions.length === 0 && (
                  <div className="text-center py-8 border border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground">No questions match your current filters.</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}