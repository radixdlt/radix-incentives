"use client";

import React, { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Save, Eye } from "lucide-react";

export default function NotificationsPage() {
  const { data: config, refetch } = api.config.getPublicConfig.useQuery();
  const updateNotification = api.config.updateNotificationSettings.useMutation({
    onSuccess: () => {
      toast.success("Notification settings updated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to update notification settings");
      console.error(error);
    },
  });

  const [message, setMessage] = useState(config?.notification?.message || "");
  const [enabled, setEnabled] = useState(config?.notification?.enabled || false);

  // Update local state when data loads
  React.useEffect(() => {
    if (config?.notification) {
      setMessage(config.notification.message);
      setEnabled(config.notification.enabled);
    }
  }, [config]);

  const handleSave = () => {
    if (!message.trim() && enabled) {
      toast.error("Message cannot be empty when notification is enabled");
      return;
    }

    updateNotification.mutate({
      message: message.trim(),
      enabled,
    });
  };

  const handleReset = () => {
    if (config?.notification) {
      setMessage(config.notification.message);
      setEnabled(config.notification.enabled);
    }
  };

  const hasChanges = 
    message !== (config?.notification?.message || "") ||
    enabled !== (config?.notification?.enabled || false);

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
          <p className="text-muted-foreground">
            Manage the notification bar that appears at the top of the application
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Notification Bar Configuration
          </CardTitle>
          <CardDescription>
            Configure the notification message and visibility for all users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
            <Label htmlFor="enabled" className="text-sm font-medium">
              Show notification bar
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Notification Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your notification message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              On mobile devices, long messages will scroll horizontally to ensure readability.
            </p>
          </div>

          {message && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div 
                className="p-3 rounded-lg border text-sm text-white font-medium text-center"
                style={{
                  background: 'rgba(225, 52, 176, 0.5)',
                }}
              >
                {message}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={updateNotification.isPending || (!hasChanges)}
              className="flex items-center gap-2"
            >
              {updateNotification.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
            
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges}
            >
              Reset
            </Button>

            {hasChanges && (
              <p className="text-sm text-muted-foreground">
                You have unsaved changes
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
          <CardDescription>
            Current notification bar configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <span className={`text-sm px-2 py-1 rounded-full ${
                config?.notification?.enabled 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
              }`}>
                {config?.notification?.enabled ? 'Visible' : 'Hidden'}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium">Message:</span>
              <span className="text-sm text-right max-w-md">
                {config?.notification?.message || 'No message set'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}