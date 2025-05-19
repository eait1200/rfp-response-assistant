"use client";

import { useState } from 'react';
import { FileUp, X, AlertCircle, CheckCircle2, FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface FileItemProps {
  name: string;
  progress?: number;
  status: UploadStatus;
  onRemove?: () => void;
}

function FileItem({ name, progress = 0, status, onRemove }: FileItemProps) {
  const statusColors = {
    idle: 'bg-everstream-blue',
    uploading: 'bg-everstream-blue',
    success: 'bg-emerald-500',
    error: 'bg-red-500',
  };
  
  const statusIcons = {
    idle: <FileIcon className="h-5 w-5 text-everstream-blue" />,
    uploading: <FileIcon className="h-5 w-5 text-everstream-blue" />,
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
  };

  return (
    <div className="bg-white border border-border rounded-lg p-4 mb-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {statusIcons[status]}
          <span className="font-medium">{name}</span>
        </div>
        {onRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove} className="h-6 w-6 p-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="h-2 bg-secondary overflow-hidden rounded-full">
        <div 
          className={cn("h-full transition-all", statusColors[status])} 
          style={{ width: `${status === 'success' ? 100 : status === 'error' ? progress : progress}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between mt-2 text-sm">
        {status === 'uploading' && (
          <>
            <span>Uploading...</span>
            <span>{progress}%</span>
          </>
        )}
        {status === 'success' && <span className="text-emerald-500">Upload Successful!</span>}
        {status === 'error' && (
          <>
            <span className="text-red-500">Upload failed! Please try again.</span>
            <Button variant="outline" size="sm" className="text-sm h-7 px-2">
              Try Again
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export const FileUploadSection = function FileUploadSection() {
  const [files, setFiles] = useState<Array<{ name: string; status: UploadStatus; progress: number }>>([]);

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-12 text-center">
          <div className="bg-everstream-orange/10 p-3 rounded-full mb-4">
            <FileUp className="h-6 w-6 text-everstream-orange" />
          </div>
          
          <h3 className="text-xl font-semibold mb-2">Upload RFP File</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Drag and drop your RFP Excel files here, or click to browse files. We support .xlsx, .xls, and .csv formats.
          </p>
          
          <Button className="mb-2 bg-everstream-orange hover:bg-everstream-orange/90">
            <FileUp className="h-4 w-4 mr-2" />
            Browse Files
          </Button>
          
          <p className="text-xs text-muted-foreground">
            Maximum file size: 10MB
          </p>
        </div>
        
        {files.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">Uploaded Files</h4>
            {files.map((file, index) => (
              <FileItem 
                key={index}
                name={file.name}
                status={file.status}
                progress={file.progress}
                onRemove={() => removeFile(index)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}