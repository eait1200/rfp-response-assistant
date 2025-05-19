"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FileText, FileOutput, UserCheck } from 'lucide-react';

export default function RfpOverview() {
  const stats = [
    {
      icon: <FileText className="h-6 w-6 text-everstream-blue" />,
      label: 'Total Questions',
      value: '127',
      bgColor: 'bg-everstream-blue/10',
    },
    {
      icon: <FileOutput className="h-6 w-6 text-emerald-600" />,
      label: 'Responses Generated',
      value: '98',
      bgColor: 'bg-emerald-100',
    },
    {
      icon: <UserCheck className="h-6 w-6 text-amber-600" />,
      label: 'Responses Approved',
      value: '43',
      bgColor: 'bg-amber-100',
    },
  ];

  const progressStats = [
    { label: 'Generated', value: 77 },
    { label: 'Reviewed', value: 56 },
    { label: 'Approved', value: 34 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className={`rounded-full p-3 mr-4 ${stat.bgColor}`}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-6">Completion Progress</h3>
          <div className="space-y-6">
            {progressStats.map((stat, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{stat.label}</span>
                  <span className="text-sm font-medium">{stat.value}%</span>
                </div>
                <Progress value={stat.value} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}