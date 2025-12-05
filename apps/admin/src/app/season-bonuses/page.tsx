'use client';

import { File, FileText, Gift, Loader2, Upload } from 'lucide-react';
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

export default function SeasonBonusesPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: bonusStats, refetch: refetchStats } =
    api.seasonBonus.getSeasonBonusStats.useQuery();

  const uploadCsvMutation = api.seasonBonus.uploadCsv.useMutation({
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

  const exampleCsv = `user_id,season_id,season_bonus
00a04a65-6730-4e6b-8b46-e0ac93bab49b,d83eac55-6754-4bf6-8d3f-8ff5252f30ba,0.14532
2b25129e-ec6f-4001-b066-f1f2c3992062,d83eac55-6754-4bf6-8d3f-8ff5252f30ba,0.14398`;

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">Season Bonus Management</h1>
          <p className="mt-2 text-muted-foreground">
            Upload and manage season bonuses for users. Bonuses are applied as
            percentages on top of season points.
          </p>
        </div>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Current Season Bonus Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p className="font-bold text-2xl">
              {bonusStats?.count?.toLocaleString() ?? 'Loading...'}
            </p>
            <p className="text-muted-foreground">Total bonus records</p>
          </div>
        </CardContent>
      </Card>

      {/* Upload CSV Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Season Bonuses
          </CardTitle>
          <CardDescription>
            Upload a CSV file containing user season bonuses. On conflict
            (duplicate user_id + season_id), existing records will be
            overwritten.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* CSV Format Example */}
          <div className="rounded-lg bg-muted p-4">
            <h4 className="mb-2 font-medium">Expected CSV Format:</h4>
            <pre className="overflow-x-auto text-muted-foreground text-sm">
              {exampleCsv}
            </pre>
            <div className="mt-2 space-y-1 text-muted-foreground text-sm">
              <p>
                <strong>user_id:</strong> UUID of the user
              </p>
              <p>
                <strong>season_id:</strong> UUID of the season
              </p>
              <p>
                <strong>season_bonus:</strong> Bonus as a decimal (0.1 = 10%,
                max 0.2 = 20%)
              </p>
            </div>
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
                  <Gift className="h-6 w-6 text-primary" />
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
                Upload Season Bonuses
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
            {uploadResult.count && (
              <span className="ml-2 font-medium">
                ({uploadResult.count.toLocaleString()}{' '}
                {uploadResult.count === 1 ? 'entry' : 'entries'})
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
