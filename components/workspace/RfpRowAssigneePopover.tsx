import { useRef, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface AssigneePopoverProps {
  assigneeIds?: string[] | null;
  show: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const dummyUsers = [
  { id: '1', name: 'Jane Doe', initials: 'JD' },
  { id: '2', name: 'Alex Smith', initials: 'AS' },
  { id: '3', name: 'Chris Lee', initials: 'CL' },
];

export default function AssigneePopover({ assigneeIds, show, onOpen, onClose }: AssigneePopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show) return;
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [show, onClose]);

  return (
    <div className="flex items-center gap-1">
      {/* Assignee Initials */}
      {(assigneeIds && assigneeIds.length > 0) ? (
        assigneeIds.slice(0, 2).map((id, idx) => (
          <div key={idx} className="h-8 w-8 rounded-full bg-everstream-blue text-white flex items-center justify-center text-sm font-medium ring-2 ring-white">
            {/* Placeholder: always 'JD' for now */}
            JD
          </div>
        ))
      ) : (
        <div className="h-8 w-8 rounded-full bg-everstream-blue text-white flex items-center justify-center text-sm font-medium ring-2 ring-white opacity-50">--</div>
      )}
      {/* + icon if more */}
      {assigneeIds && assigneeIds.length > 2 && (
        <div className="h-8 w-8 rounded-full bg-everstream-orange text-white flex items-center justify-center text-xs font-bold ring-2 ring-white">+{assigneeIds.length - 2}</div>
      )}
      {/* Popover for assigning users */}
      {show && (
        <div ref={popoverRef} className="absolute z-20 left-10 top-0 bg-white border rounded-lg shadow-lg p-4 w-56">
          <div className="font-semibold mb-2 text-everstream-blue">Assign Users</div>
          <div className="space-y-2 mb-4">
            {dummyUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                <div className="h-7 w-7 rounded-full bg-everstream-blue text-white flex items-center justify-center text-xs font-medium">{user.initials}</div>
                <span className="text-sm font-work-sans">{user.name}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
            <Button size="sm" className="bg-everstream-orange text-white hover:bg-orange-600">Assign</Button>
          </div>
        </div>
      )}
    </div>
  );
} 