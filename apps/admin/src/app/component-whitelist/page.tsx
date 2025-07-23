"use client";

import { useState, useRef } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Loader2, Upload, FileText, File } from "lucide-react";

export default function ComponentWhitelistPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: whitelistStats, refetch: refetchStats } =
    api.componentWhitelist.getWhitelistStats.useQuery();

  const uploadCsvMutation = api.componentWhitelist.uploadCsv.useMutation({
    onSuccess: (result) => {
      setUploadResult(result);
      setIsUploading(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      refetchStats();
    },
    onError: (error) => {
      setUploadResult({
        success: false,
        message: error.message,
      });
      setIsUploading(false);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (
        file.type !== "text/csv" &&
        !file.name.toLowerCase().endsWith(".csv")
      ) {
        setUploadResult({
          success: false,
          message: "Please select a CSV file",
        });
        return;
      }
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleFileInputClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileInputKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadResult({
        success: false,
        message: "Please select a CSV file",
      });
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const csvData = await selectedFile.text();
      uploadCsvMutation.mutate({ csvData });
    } catch (error) {
      setUploadResult({
        success: false,
        message: "Failed to read CSV file",
      });
      setIsUploading(false);
    }
  };

  const exampleCsv = `#,matched_component,count
1,component_rdx1czaulwngn258tkk5xpvhgsyrfx5e4f7eu4pafhxe0hpkvafndtmwnk,1946834
2,component_rdx1cra2j3w7cv9zkrv4jehjz0qn3xffxdkstucxar4xy9kyu0tpxsvya6,644833
3,component_rdx1cr3psyfptwkktqusfg8ngtupr4wwfg32kz2xvh9tqh4c7pwkvlk2kn,520451`;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Component Whitelist Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage the component whitelist for activity point calculations
          </p>
        </div>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Current Whitelist Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p className="text-2xl font-bold">
              {whitelistStats?.count?.toLocaleString() ?? "Loading..."}
            </p>
            <p className="text-muted-foreground">Components in whitelist</p>
          </div>
        </CardContent>
      </Card>

      {/* Upload CSV Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Component Whitelist
          </CardTitle>
          <CardDescription>
            Upload a CSV file containing component addresses. This will replace
            the entire existing whitelist.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* CSV Format Example */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Expected CSV Format:</h4>
            <pre className="text-sm text-muted-foreground overflow-x-auto">
              {exampleCsv}
            </pre>
            <p className="text-sm text-muted-foreground mt-2">
              The CSV should contain a <code>matched_component</code> column
              with component addresses starting with <code>component_</code>.
            </p>
          </div>

          {/* File Input */}
          <div className="space-y-4">
            <label htmlFor="csv-upload" className="text-sm font-medium">
              Select CSV File
            </label>
            <button
              type="button"
              className="relative w-full border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-8 text-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40"
              aria-label="Select CSV File"
              onClick={handleFileInputClick}
              onKeyDown={handleFileInputKeyDown}
            >
              <input
                id="csv-upload"
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              />
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Click to select CSV file or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports .csv files only
                  </p>
                </div>
              </div>
            </button>

            {/* Selected File Info */}
            {selectedFile && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <File className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                    setUploadResult(null);
                  }}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={isUploading || !selectedFile}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing CSV...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload & Replace Whitelist
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {uploadResult && (
        <Alert variant={uploadResult.success ? "default" : "destructive"}>
          <AlertDescription>
            {uploadResult.message}
            {uploadResult.count && (
              <span className="ml-2 font-medium">
                ({uploadResult.count.toLocaleString()} components)
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
