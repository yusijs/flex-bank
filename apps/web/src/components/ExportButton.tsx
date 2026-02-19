import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportUrl } from '@/api/client';

export function ExportButton() {
  const handleExport = (format: 'xlsx' | 'csv') => {
    window.location.href = exportUrl(format);
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport('xlsx')}>
        <Download className="h-4 w-4" />
        Excel
      </Button>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport('csv')}>
        <Download className="h-4 w-4" />
        CSV
      </Button>
    </div>
  );
}

