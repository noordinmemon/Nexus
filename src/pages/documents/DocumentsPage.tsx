import React, { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Trash2, Download } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { uploadDocument, getMyDocuments, deleteDocument } from '../../api/documents';
import toast from 'react-hot-toast';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const data = await getMyDocuments();
      setDocuments(data);
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadDocument(file, file.name);
      toast.success('Document uploaded successfully');
      fetchDocuments();
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteDocument(id);
      toast.success('Document deleted');
      setDocuments(prev => prev.filter(doc => doc._id !== id));
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const getFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileType = (mimeType: string) => {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('word')) return 'Document';
    if (mimeType.includes('sheet')) return 'Spreadsheet';
    if (mimeType.includes('image')) return 'Image';
    return 'File';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage your important files</p>
        </div>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          />
          <Button
            leftIcon={<Upload size={18} />}
            onClick={handleUploadClick}
            isLoading={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Summary</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Files</span>
                <span className="font-medium text-gray-900">{documents.length}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">File Types</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">PDFs</span>
                  <span>{documents.filter(d => d.fileType?.includes('pdf')).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Documents</span>
                  <span>{documents.filter(d => d.fileType?.includes('word')).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Images</span>
                  <span>{documents.filter(d => d.fileType?.includes('image')).length}</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">
                All Documents ({documents.length})
              </h2>
            </CardHeader>
            <CardBody>
              {loading ? (
                <p className="text-center text-gray-500 py-8">Loading documents...</p>
              ) : documents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <FileText size={24} className="text-gray-500" />
                  </div>
                  <p className="text-gray-600">No documents yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Click "Upload Document" to add your first file
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map(doc => (
                    <div key={doc._id} className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="p-2 bg-primary-50 rounded-lg mr-4">
                        <FileText size={24} className="text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {doc.name}
                          </h3>
                          <Badge variant="secondary" size="sm">
                            {getFileType(doc.fileType)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>{getFileSize(doc.fileSize)}</span>
                          <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <a href={doc.url} target="_blank" rel="noreferrer">
                          <button className="p-2 rounded hover:bg-gray-100">
                            <Download size={18} />
                          </button>
                        </a>
                        <button
                          className="p-2 rounded hover:bg-gray-100 text-red-600"
                          onClick={() => handleDelete(doc._id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};