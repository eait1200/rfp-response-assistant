"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, FileUp } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { RfpProject } from '@/app/dashboard/page';

interface DashboardProps {
  projects: RfpProject[];
  error: string | null;
}

export default function Dashboard({ projects, error }: DashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight font-raleway">My RFP Projects</h1>
        <Link href="/upload">
          <Button className="bg-everstream-orange hover:bg-everstream-orange/90">
            <FileUp className="h-4 w-4 mr-2" />
            Upload New RFP
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search RFPs..."
                className="pl-8"
                disabled
              />
            </div>
            <Button variant="outline" size="icon" disabled>
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="col-span-full">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-destructive mb-4">{error}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          // Map status to color
          let statusColor =
            project.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
            project.status === 'processing' ? 'bg-blue-100 text-blue-700' :
            project.status === 'pending_review' ? 'bg-amber-100 text-amber-700' :
            'bg-gray-100 text-gray-700';

          // Format dates
          const uploaded = project.uploaded_at ? new Date(project.uploaded_at).toLocaleDateString() : 'N/A';
          const completed = project.completed_at ? new Date(project.completed_at).toLocaleDateString() : null;

          return (
            <Link 
              key={project.id}
              href={`/rfps/${project.id}`}
              className="block transition-colors hover:bg-everstream-blue/5"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-raleway font-semibold mb-1">{project.original_filename || 'Untitled RFP'}</h3>
                      {/* You can add more info here if needed */}
                    </div>
                    <div className={cn("px-2 py-1 text-xs rounded-full", statusColor)}>
                      {project.status ? project.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Unknown'}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground gap-4">
                      <span>Uploaded: {uploaded}</span>
                      <span>
                        {completed ? `Completed: ${completed}` : `Last Updated: ${uploaded}`}
                      </span>
                    </div>

                    {/* Placeholder for progress bar and stats */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-sm font-medium">--%</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-everstream-blue transition-all"
                          style={{ width: `0%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-x-4 text-sm">
                        <span>-- Questions</span>
                        {/* <span className="text-amber-600">-- Issues</span> */}
                      </div>
                      <div className="flex -space-x-2">
                        {/* Placeholder for assignee initials */}
                        <div className="h-8 w-8 rounded-full bg-everstream-blue text-white flex items-center justify-center text-sm font-medium ring-2 ring-white opacity-50">
                          --
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}

        {(!projects || projects.length === 0) && !error && (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No RFP projects found. You can upload a new one via the 'Upload RFP' page!</p>
                <Link href="/upload">
                  <Button className="bg-everstream-orange hover:bg-everstream-orange/90">
                    <FileUp className="h-4 w-4 mr-2" />
                    Upload RFP
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}