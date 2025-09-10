'use client';

import { File, FileText, Loader2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { api } from '~/trpc/react';

type UploadResult = {
  success: boolean;
  message: string;
  processed?: number;
  inserted?: number;
  updated?: number;
  skipped?: number;
  errors?: Array<{ address: string; error: string }>;
};

export default function MarginAccountSeedingPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: marginAccountStats, refetch: refetchStats } =
    api.marginAccountSeeding.getStats.useQuery();

  const uploadCsvMutation = api.marginAccountSeeding.uploadCsv.useMutation({
    onSuccess: (result) => {
      setUploadResult(result);
      setIsUploading(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
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
        file.type !== 'text/csv' &&
        !file.name.toLowerCase().endsWith('.csv')
      ) {
        setUploadResult({
          success: false,
          message: 'Please select a CSV file',
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
    e: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadResult({
        success: false,
        message: 'Please select a CSV file',
      });
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const csvData = await selectedFile.text();
      uploadCsvMutation.mutate({ csvData });
    } catch (_error) {
      setUploadResult({
        success: false,
        message: 'Failed to read CSV file',
      });
      setIsUploading(false);
    }
  };

  const exampleCsv = `#,from_state_version,address
1,12345678,component_rdx1czaulwngn258tkk5xpvhgsyrfx5e4f7eu4pafhxe0hpkvafndtmwnk
2,12345679,component_rdx1cra2j3w7cv9zkrv4jehjz0qn3xffxdkstucxar4xy9kyu0tpxsvya6
3,12345680,component_rdx1cr3psyfptwkktqusfg8ngtupr4wwfg32kz2xvh9tqh4c7pwkvlk2kn`;

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">Margin Account Seeding</h1>
          <p className="mt-2 text-muted-foreground">
            Seed margin accounts from CSV to populate the margin accounts
            database
          </p>
        </div>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Current Database Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p className="font-bold text-2xl">
              {marginAccountStats?.count?.toLocaleString() ?? 'Loading...'}
            </p>
            <p className="text-muted-foreground">Margin accounts in database</p>
          </div>
        </CardContent>
      </Card>

      {/* Upload CSV Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Margin Account CSV
          </CardTitle>
          <CardDescription>
            Upload a CSV file containing margin account addresses. The system
            will query the blockchain for current ownership data and populate
            the database. Existing accounts with matching data will be skipped.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* CSV Format Example */}
          <div className="rounded-lg bg-muted p-4">
            <h4 className="mb-2 font-medium">Expected CSV Format:</h4>
            <pre className="overflow-x-auto text-muted-foreground text-sm">
              {exampleCsv}
            </pre>
            <p className="mt-2 text-muted-foreground text-sm">
              The CSV should contain an <code>address</code> column with margin
              account addresses starting with <code>component_</code>. The{' '}
              <code>#</code> and <code>from_state_version</code> columns are
              optional and will be ignored.
            </p>
          </div>

          {/* File Input */}
          <div className="space-y-4">
            <label htmlFor="csv-upload" className="font-medium text-sm">
              Select CSV File
            </label>
            <button
              type="button"
              className="relative w-full cursor-pointer rounded-lg border-2 border-border border-dashed bg-muted/20 p-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/40"
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
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              />
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    Click to select CSV file or drag and drop
                  </p>
                  <p className="mt-1 text-muted-foreground text-xs">
                    Supports .csv files only
                  </p>
                </div>
              </div>
            </button>

            {/* Selected File Info */}
            {selectedFile && (
              <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                <File className="h-5 w-5 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm">
                    {selectedFile.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
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
                      fileInputRef.current.value = '';
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing CSV...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Seed Margin Accounts
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {uploadResult && (
        <Alert variant={uploadResult.success ? 'default' : 'destructive'}>
          <AlertDescription>
            {uploadResult.message}
            {uploadResult.processed && (
              <div className="mt-2 space-y-1">
                <div className="font-medium">Processing Summary:</div>
                <div className="space-y-1 text-sm">
                  <div>
                    • Processed: {uploadResult.processed.toLocaleString()}
                  </div>
                  {uploadResult.inserted !== undefined && (
                    <div>
                      • Inserted: {uploadResult.inserted.toLocaleString()}
                    </div>
                  )}
                  {uploadResult.updated !== undefined && (
                    <div>
                      • Updated: {uploadResult.updated.toLocaleString()}
                    </div>
                  )}
                  {uploadResult.skipped !== undefined && (
                    <div>
                      • Skipped: {uploadResult.skipped.toLocaleString()}
                    </div>
                  )}
                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <div>
                      • Errors: {uploadResult.errors.length.toLocaleString()}
                    </div>
                  )}
                </div>
                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium text-sm">
                      View Errors ({uploadResult.errors.length})
                    </summary>
                    <div className="mt-2 max-h-40 overflow-y-auto rounded bg-muted p-2 text-xs">
                      {uploadResult.errors.map((error) => (
                        <div key={error.address} className="mb-1">
                          <strong>{error.address}:</strong> {error.error}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
