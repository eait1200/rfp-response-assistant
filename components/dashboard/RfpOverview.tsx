"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, FileOutput, Edit, UserCheck, MessageSquare, DownloadCloud } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function RfpOverview() {
  const [tab, setTab] = useState("overview");
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Government Healthcare RFP 2023</h2>
          <p className="text-muted-foreground">Last updated: May 15, 2023</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Project
          </Button>
          <Button>
            <DownloadCloud className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="rounded-full bg-blue-100 p-3 mr-4">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">127</div>
                    <div className="text-muted-foreground">Total Questions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="rounded-full bg-emerald-100 p-3 mr-4">
                    <FileOutput className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">98</div>
                    <div className="text-muted-foreground">Responses Generated</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="rounded-full bg-amber-100 p-3 mr-4">
                    <UserCheck className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">43</div>
                    <div className="text-muted-foreground">Responses Approved</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-4">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Completion Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Generated</span>
                    <span className="text-sm font-medium">77%</span>
                  </div>
                  <Progress value={77} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Reviewed</span>
                    <span className="text-sm font-medium">56%</span>
                  </div>
                  <Progress value={56} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Approved</span>
                    <span className="text-sm font-medium">34%</span>
                  </div>
                  <Progress value={34} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">RFP Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Client</div>
                      <div>Department of Health Services</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Due Date</div>
                      <div>June 30, 2023</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">RFP ID</div>
                      <div>GOV-HEA-2023-0472</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Value</div>
                      <div>$1.2M - $1.8M</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold">Description</h3>
                  <p className="text-sm mt-2">
                    This RFP seeks proposals for the implementation of a comprehensive healthcare management system
                    for the Department of Health Services. The system should include patient management, billing,
                    reporting, and data analysis features.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold">Tags</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Healthcare</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Government</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">IT Services</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Software</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="collaborators">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Team Members</h3>
                  <Button variant="outline" size="sm">
                    Add Member
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {[
                    { name: 'John Doe', role: 'Project Lead', avatar: 'JD' },
                    { name: 'Jane Smith', role: 'Technical Writer', avatar: 'JS' },
                    { name: 'Robert Johnson', role: 'Subject Matter Expert', avatar: 'RJ' },
                    { name: 'Emily Wilson', role: 'Reviewer', avatar: 'EW' },
                  ].map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                          {member.avatar}
                        </div>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">{member.role}</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}