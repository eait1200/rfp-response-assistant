import AppShell from '@/components/layout/AppShell';
import { FileUploadSection } from '@/components/upload/FileUploadSection';

export default function UploadPage() {
  return (
    <AppShell activeRoute="upload">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Upload RFP</h1>
        </div>
        
        <FileUploadSection />
      </div>
    </AppShell>
  );
}