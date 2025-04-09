"use client";

import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../components/ui/form";
import { Input } from "../../../../components/ui/input";
import { Switch } from "../../../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import type {
  ActivityRule,
  ActivityType,
} from "../../../../lib/types/activity-rules";

interface ActivityRuleEditorProps {
  rule: ActivityRule | null;
  activityType: ActivityType | null;
  weekNumber: number;
  seasonNumber: number;
  onClose: () => void;
  onSave: (rule: Partial<ActivityRule>) => void;
}

export function ActivityRuleEditor({
  rule,
  activityType,
  weekNumber,
  seasonNumber,
  onClose,
  onSave,
}: ActivityRuleEditorProps) {
  const [formData, setFormData] = useState<Partial<ActivityRule>>(
    rule || {
      activityTypeId: activityType?.id || "",
      multiplierApplied: true,
      minimumValue: 0,
      maximumValue: null,
      cappingRules: {},
      isActive: true,
    }
  );

  const handleChange = <T extends keyof Partial<ActivityRule>>(
    field: T,
    value: Partial<ActivityRule>[T]
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!activityType) {
    return <div>No activity selected</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <FormItem>
            <FormLabel>Activity Type</FormLabel>
            <div className="p-2 border rounded-md bg-muted">
              {activityType.name}
            </div>
            <FormDescription>{activityType.description}</FormDescription>
          </FormItem>

          <div className="grid grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Minimum Value ($)</FormLabel>
              <Input
                type="number"
                value={formData.minimumValue}
                onChange={(e) =>
                  handleChange("minimumValue", Number(e.target.value))
                }
              />
              <FormDescription>
                Minimum USD value for the activity to qualify
              </FormDescription>
            </FormItem>

            <FormItem>
              <FormLabel>Maximum Value ($)</FormLabel>
              <Input
                type="number"
                value={formData.maximumValue || ""}
                onChange={(e) =>
                  handleChange(
                    "maximumValue",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                placeholder="No limit"
              />
              <FormDescription>
                Optional maximum USD value for points calculation
              </FormDescription>
            </FormItem>
          </div>
        </div>

        <div className="space-y-4">
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel>Apply Multiplier</FormLabel>
              <FormDescription>
                Apply user's XRD holding multiplier to these points
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={formData.multiplierApplied}
                onCheckedChange={(checked) =>
                  handleChange("multiplierApplied", checked)
                }
              />
            </FormControl>
          </FormItem>

          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel>Active</FormLabel>
              <FormDescription>
                Whether this rule is currently active for this activity
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange("isActive", checked)}
              />
            </FormControl>
          </FormItem>

          <FormItem>
            <FormLabel>Daily Cap (Points)</FormLabel>
            <Input
              type="number"
              value={formData.cappingRules?.dailyCap || ""}
              onChange={(e) => {
                const value = e.target.value
                  ? Number(e.target.value)
                  : undefined;
                handleChange("cappingRules", {
                  ...formData.cappingRules,
                  dailyCap: value,
                });
              }}
              placeholder="No cap"
            />
            <FormDescription>
              Maximum points earned per day from this activity
            </FormDescription>
          </FormItem>

          <FormItem>
            <FormLabel>Weekly Cap (Points)</FormLabel>
            <Input
              type="number"
              value={formData.cappingRules?.weeklyCap || ""}
              onChange={(e) => {
                const value = e.target.value
                  ? Number(e.target.value)
                  : undefined;
                handleChange("cappingRules", {
                  ...formData.cappingRules,
                  weeklyCap: value,
                });
              }}
              placeholder="No cap"
            />
            <FormDescription>
              Maximum points earned per week from this activity
            </FormDescription>
          </FormItem>
        </div>
      </div>

      <div className="mt-4 p-4 border rounded-md bg-muted">
        <div className="font-medium mb-2">Rule Information</div>
        <div className="text-sm text-muted-foreground space-y-1">
          <div>
            Week: {weekNumber}, Season: {seasonNumber}
          </div>
          {rule && <div>Current Version: v{rule.version}</div>}
          {rule && <div>Created: {rule.createdAt.toLocaleDateString()}</div>}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">{rule ? "Update Rule" : "Create Rule"}</Button>
      </div>
    </form>
  );
}
