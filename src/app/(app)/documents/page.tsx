import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { documents } from "@/lib/data";
import { Upload, Camera, FileText, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function DocumentsPage() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "processed":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Upload Documents</CardTitle>
          <CardDescription>
            Add receipts, utility bills, or mobile wallet statements to build your financial profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 border-2 border-dashed border-border rounded-lg text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Drag and drop files here</h3>
            <p className="mt-1 text-sm text-muted-foreground">or click to upload</p>
            <Button variant="outline" className="mt-4">
              <FileText className="mr-2 h-4 w-4" />
              Choose Files
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Supports: JPG, PNG, PDF
            </p>
          </div>
          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
                <span className="bg-card px-2 text-sm text-muted-foreground">or</span>
            </div>
          </div>
           <Button className="w-full" size="lg">
              <Camera className="mr-2 h-5 w-5" />
              Use Camera to Scan
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
                <TableHead className="hidden md:table-cell">Upload Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
