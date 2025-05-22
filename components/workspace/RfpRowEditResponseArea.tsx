import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface EditResponseAreaProps {
  value: string;
  onChange: (val: string) => void;
  onSave: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function EditResponseArea({ value, onChange, onSave, onCancel, loading }: EditResponseAreaProps) {
  return (
    <div className="space-y-2">
      <textarea
        className="w-full min-h-[80px] border rounded p-2 font-work-sans text-sm focus:ring-2 focus:ring-everstream-blue"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={loading}
      />
      <div className="flex gap-2 justify-end">
        <Button
          size="sm"
          className="bg-everstream-orange text-white hover:bg-orange-600"
          onClick={onSave}
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </div>
  );
} 