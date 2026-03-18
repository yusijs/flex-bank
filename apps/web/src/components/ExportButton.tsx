import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportApi } from '@/api/client';

export function ExportButton() {
  const handleExport = async (format: 'xlsx' | 'csv') => {
    const result = await exportApi.generate(format);
    const blob = new Blob([result.data.buffer as ArrayBuffer], { type: result.contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.filename;
    a.click();
    URL.revokeObjectURL(url);
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
