"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface RfpProject {
  id: string;
  name: string;
  uploadDate: string;
  lastUpdated: string;
  status: 'processing' | 'pending_review' | 'completed';
  progress: number;
}

const mockRfps: RfpProject[] = [
  {
    id: '1',
    name: 'Government_RFP_2023.xlsx',
    uploadDate: '2024-03-15',
    lastUpdated: '2024-03-20',
    status: 'completed',
    progress: 100
  },
  {
    id: '2',
    name: 'Healthcare_RFP_2024.xlsx',
    uploadDate: '2024-03-18',
    lastUpdated: '2024-03-18',
    status: 'processing',
    progress: 45
  },
  {
    id: '3',
    name: 'Tech_Services_RFP.xlsx',
    uploadDate: '2024-03-19',
    lastUpdated: '2024-03-19',
    status: 'pending_review',
    progress: 75
  }
];

const RfpList = () => {
  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search RFPs..."
              className="pl-8"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {mockRfps.map((rfp) => (
            <Link 
              key={rfp.id}
              href={`/rfps/${rfp.id}`}
              className="block transition-colors hover:bg-everstream-blue/5"
            >
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{rfp.name}</h3>
                  <div className={cn(
                    "px-2 py-1 text-xs rounded-full",
                    rfp.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                    rfp.status === 'processing' ? "bg-blue-100 text-blue-700" :
                    "bg-amber-100 text-amber-700"
                  )}>
                    {rfp.status.replace('_', ' ').charAt(0).toUpperCase() + rfp.status.slice(1)}
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground gap-4">
                  <span>Uploaded: {rfp.uploadDate}</span>
                  <span>Last Updated: {rfp.lastUpdated}</span>
                </div>
                
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="text-sm font-medium">{rfp.progress}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-everstream-blue transition-all"
                      style={{ width: `${rfp.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RfpList;