import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, Trash2 } from 'lucide-react';
import useOSStore from '../../store/useOSStore';

export default function IngestApp() {
  const files = useOSStore((s) => s.files);
  const addFile = useOSStore((s) => s.addFile);
  const ingestFile = useOSStore((s) => s.ingestFile);
  const removeFile = useOSStore((s) => s.removeFile);
  const showMorph = useOSStore((s) => s.showMorph);
  const hideMorph = useOSStore((s) => s.hideMorph);
  const pushToast = useOSStore((s) => s.pushToast);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    for (const file of dropped) {
      addFile({ name: file.name, size: file.size, type: file.type || 'unknown' });
    }
    if (dropped.length > 0) {
      pushToast({ message: `${dropped.length} file(s) added`, type: 'success' });
    }
  }, [addFile, pushToast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    for (const file of selected) {
      addFile({ name: file.name, size: file.size, type: file.type || 'unknown' });
    }
    if (selected.length > 0) {
      pushToast({ message: `${selected.length} file(s) added`, type: 'success' });
    }
    e.target.value = '';
  };

  const handleIngest = (id: string, name: string) => {
    showMorph(`Ingesting ${name}...`, 'Learning structure from content');
    setTimeout(() => {
      ingestFile(id);
      hideMorph();
      pushToast({ message: `${name} ingested into substrate`, type: 'success' });
    }, 1500);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col h-full">
      <div
        className={`ingest-dropzone ${dragOver ? 'dragover' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={48} className="text-[var(--accent)] mx-auto mb-3" />
        <h3 className="text-[var(--text)] font-semibold mb-1">Drop files here</h3>
        <p className="text-xs text-[var(--text-muted)]">Books, code, photos, anything. The substrate learns structure.</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      <div className="mt-4 flex-1 overflow-y-auto">
        {files.length === 0 ? (
          <p className="text-center text-sm text-[var(--text-muted)] mt-8">No files yet. Drop some knowledge into the substrate.</p>
        ) : (
          files.map((file) => (
            <div key={file.id} className="ingest-file-item">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText size={18} className="text-[var(--accent-light)] flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{file.name}</div>
                  <div className="text-xs text-[var(--text-muted)]">{formatSize(file.size)} · {file.type}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!file.ingested ? (
                  <button
                    onClick={() => handleIngest(file.id, file.name)}
                    className="btn btn-primary btn-sm"
                  >
                    <Upload size={12} /> Ingest
                  </button>
                ) : (
                  <span className="text-xs text-[var(--success)] font-mono">INGESTED</span>
                )}
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-1.5 rounded hover:bg-[var(--danger)]/10 transition-colors"
                >
                  <Trash2 size={14} className="text-[var(--danger)]" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
