import { useState } from 'react';
import { taskApi } from '../services/api';
import { Download, FileText, FileSpreadsheet, Code, CheckSquare } from 'lucide-react';

const ExportTasks = () => {
  const [format, setFormat] = useState('json');
  const [includeCompleted, setIncludeCompleted] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');

  const handleExport = async () => {
    setIsExporting(true);
    setError('');

    try {
      const response = await taskApi.exportTasks(format, includeCompleted);

      if (format === 'json') {
        // For JSON, create downloadable file from response data
        const jsonStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        downloadFile(blob, `tasks-${Date.now()}.json`);
      } else {
        // For CSV and PDF, response.data is already a blob
        const extension = format === 'csv' ? 'csv' : 'pdf';
        downloadFile(response.data, `tasks-${Date.now()}.${extension}`);
      }
    } catch (err) {
      console.error('Export error:', err);
      setError(err.response?.data?.message || 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const formatOptions = [
    {
      value: 'csv',
      label: 'CSV',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      description: 'Spreadsheet format',
      color: 'bg-green-100 text-green-700 border-green-200'
    },
    {
      value: 'pdf',
      label: 'PDF',
      icon: <FileText className="w-5 h-5" />,
      description: 'Printable report',
      color: 'bg-red-100 text-red-700 border-red-200'
    },
    {
      value: 'json',
      label: 'JSON',
      icon: <Code className="w-5 h-5" />,
      description: 'Structured data',
      color: 'bg-blue-100 text-blue-700 border-blue-200'
    }
  ];

  return (
    <div className="bg-white/80 backdrop-blur border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
      <div className="flex items-center gap-2">
        <Download className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold text-slate-900">Export Tasks</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Format Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Select Format
        </label>
        <div className="grid grid-cols-3 gap-3">
          {formatOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFormat(option.value)}
              className={`p-4 border-2 rounded-xl transition-all ${
                format === option.value
                  ? option.color + ' border-2'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                {option.icon}
                <span className="font-semibold text-sm">{option.label}</span>
                <span className="text-xs text-slate-500">{option.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="border border-slate-200 rounded-xl p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={includeCompleted}
            onChange={(e) => setIncludeCompleted(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">
              Include completed tasks
            </span>
          </div>
        </label>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Download className="w-5 h-5" />
        {isExporting ? 'Exporting...' : `Export as ${format.toUpperCase()}`}
      </button>

      {/* Info */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-xs text-slate-600">
          <strong>Export Formats:</strong>
        </p>
        <ul className="text-xs text-slate-600 mt-2 space-y-1 ml-4">
          <li>• <strong>CSV</strong> - Open in Excel, Google Sheets</li>
          <li>• <strong>PDF</strong> - Print-ready formatted report</li>
          <li>• <strong>JSON</strong> - Import into other apps</li>
        </ul>
      </div>
    </div>
  );
};

export default ExportTasks;