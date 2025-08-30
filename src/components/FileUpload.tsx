import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, File, X, Check } from 'lucide-react';
import { uploadFile } from '../lib/firebase';
import { FileUploadProgress } from '../types';

interface FileUploadProps {
  onFilesUploaded: (urls: string[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFilesUploaded, 
  maxFiles = 5,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']
}) => {
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([]);
  const [error, setError] = useState('');

  const handleFileSelect = useCallback(async (files: FileList) => {
    setError('');
    
    if (files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const fileArray = Array.from(files);
    const initialProgress: FileUploadProgress[] = fileArray.map(file => ({
      file,
      progress: 0
    }));
    
    setUploadProgress(initialProgress);

    try {
      const uploadPromises = fileArray.map(async (file, index) => {
        const path = `applications/${Date.now()}-${file.name}`;
        
        const url = await uploadFile(file, path, (progress) => {
          setUploadProgress(prev => 
            prev.map((item, i) => 
              i === index ? { ...item, progress } : item
            )
          );
        });
        
        setUploadProgress(prev => 
          prev.map((item, i) => 
            i === index ? { ...item, url: url, progress: 100 } : item
          )
        );
        
        return url;
      });

      const urls = await Promise.all(uploadPromises);
      onFilesUploaded(urls);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
    }
  }, [maxFiles, onFilesUploaded]);

  const removeFile = (index: number) => {
    setUploadProgress(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">Drop files here or click to upload</p>
              <p className="text-sm text-gray-500">
                Supports: {acceptedTypes.join(', ')} (Max {maxFiles} files)
              </p>
            </div>
            <input
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <Button 
              type="button" 
              variant="outline" 
              className="mt-4"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              Select Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {uploadProgress.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Upload Progress</h4>
          {uploadProgress.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <File className="h-4 w-4" />
                    <span className="text-sm font-medium truncate">
                      {item.file.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.progress === 100 && item.url ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <Progress value={item.progress} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{Math.round(item.progress)}%</span>
                  <span>{(item.file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;