
'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Document, Transaction } from '@/lib/types';
import {
  Upload,
  Camera,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  X,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { categorizeTransaction } from '@/ai/flows/categorize-transactions';

const initialDocuments: Document[] = [];
const initialTransactions: Transaction[] = [];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const newFiles = Array.from(selectedFiles);
    // You might want to add validation for file types and size here
    setFilesToUpload((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileSelect(e.dataTransfer.files);
  }, []);

  const removeFile = (index: number) => {
    setFilesToUpload((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };
  
  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (filesToUpload.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No files selected',
        description: 'Please select files to upload.',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const newDocuments: Document[] = [];
    const newTransactions: Transaction[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const docId = `doc${Date.now()}${i}`;
      
      const currentDocument: Document = {
        id: docId,
        name: file.name,
        uploadDate: new Date().toISOString().split('T')[0],
        type: file.type.startsWith('image/') ? 'receipt' : 'utility bill',
        status: 'pending',
      };
      
      setDocuments(prev => [currentDocument, ...prev]);
      
      try {
        const dataUri = await fileToDataUri(file);
        
        // This is a simplified call. In a real app, you might extract more details.
        const result = await categorizeTransaction({
          merchantName: "Unknown", 
          amount: 0,
          description: file.name,
        });

        const newTransaction: Transaction = {
          id: `txn${Date.now()}${i}`,
          date: new Date().toISOString().split('T')[0],
          merchant: result.subcategory || "AI Processed",
          amount: 0, // Amount would ideally come from OCR
          type: result.category === 'income' ? 'income' : 'expense',
          category: result.category,
          status: 'cleared',
        };
        newTransactions.push(newTransaction);
        
        setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'processed' } : d));

      } catch (error) {
        console.error("AI processing failed for", file.name, error);
        setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'failed' } : d));
      }
      
      setUploadProgress(((i + 1) / filesToUpload.length) * 100);
    }

    setTransactions(prev => [...newTransactions, ...prev]);
    setIsUploading(false);
    setFilesToUpload([]);

    toast({
      title: 'Upload complete',
      description: `${filesToUpload.length} document(s) have been processed.`,
    });
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'processed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Upload Documents</CardTitle>
          <CardDescription>
            Add receipts, utility bills, or mobile wallet statements to build
            your financial profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className="p-6 border-2 border-dashed border-border rounded-lg text-center cursor-pointer hover:border-primary transition-colors"
            onDragOver={onDragOver}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              multiple
              accept="image/jpeg,image/png,application/pdf"
            />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">
              Drag and drop files here
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              or click to upload
            </p>
            <Button variant="outline" className="mt-4 pointer-events-none">
              <FileText className="mr-2 h-4 w-4" />
              Choose Files
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Supports: JPG, PNG, PDF
            </p>
          </div>
          {filesToUpload.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Files to upload:</h4>
              <div className="space-y-2">
                {filesToUpload.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-md border"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate text-sm">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeFile(index)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              {isUploading && (
                <div className='space-y-2 pt-2'>
                  <Progress value={uploadProgress} />
                  <p className="text-sm text-muted-foreground text-center">Processing...</p>
                </div>
              )}
              <Button onClick={handleUpload} disabled={isUploading} className='w-full'>
                <Upload className="mr-2 h-4 w-4" />
                Upload & Process {filesToUpload.length} file(s)
              </Button>
            </div>
          )}

          <div className="relative">
            <Separator />
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-2 text-sm text-muted-foreground">
                or
              </span>
            </div>
          </div>
          <Button className="w-full" size="lg" disabled>
            <Camera className="mr-2 h-5 w-5" />
            Use Camera to Scan (Coming Soon)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Upload History</CardTitle>
          <CardDescription>
            View the status of your previously uploaded documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">
                  Upload Date
                </TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.name}</TableCell>
                    <TableCell className="hidden sm:table-cell capitalize">
                      {doc.type}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {doc.uploadDate}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(doc.status)}>
                        {getStatusIcon(doc.status)}
                        <span className="ml-2 capitalize">{doc.status}</span>
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No documents uploaded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

    