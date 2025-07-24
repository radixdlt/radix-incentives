'use client';

import { useState } from 'react';
import { api } from '~/trpc/react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { AlertCircle, CheckCircle2, Database, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { toast } from 'sonner';

export default function SeedPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const seedMutation = api.seed.seedAll.useMutation({
    onMutate: () => {
      setIsSeeding(true);
      setResult(null);
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success(data.message);
    },
    onError: (error) => {
      setResult({ success: false, message: error.message });
      toast.error(error.message);
    },
    onSettled: () => {
      setIsSeeding(false);
    },
  });

  const handleSeed = () => {
    seedMutation.mutate();
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Database Seeding</h1>
        <p className="text-muted-foreground mt-2">
          Seed the database with initial data for development and testing
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Seed Database
            </CardTitle>
            <CardDescription>
              This will update the database with the latest activities, activity categories, and DApp configurations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSeed}
              disabled={isSeeding}
              variant="default"
              size="lg"
              className="w-full sm:w-auto"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding Database...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Seed Database
                </>
              )}
            </Button>

            {result && (
              <Alert className="mt-4" variant={result.success ? 'default' : 'destructive'}>
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>{result.success ? 'Success' : 'Error'}</AlertTitle>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seeding Information</CardTitle>
            <CardDescription>
              What data will be updated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">Activities</h4>
                <p className="text-sm text-muted-foreground">
                  Updates all supported DeFi activities (Ociswap, DefiPlaza, CaviarNine, Root Finance, Surge, Weft Finance, etc.)
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Activity Categories</h4>
                <p className="text-sm text-muted-foreground">
                  Updates activity category configurations with proper multipliers and settings
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">DApps</h4>
                <p className="text-sm text-muted-foreground">
                  Updates DApp integrations and protocol configurations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}