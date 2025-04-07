"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Settings,
  Eye,
  History,
  Edit,
  BarChart4,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { Badge } from "../../../components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import {
  SAMPLE_ACTIVITY_TYPES,
  SAMPLE_WEEKLY_RULESETS,
  type ActivityRule,
} from "../../../lib/types/activity-rules";
import { ActivityRuleEditor } from "./components/activity-rule-editor";

export default function ActivitiesPage() {
  const router = useRouter();

  const currentWeekRuleset = SAMPLE_WEEKLY_RULESETS.find(
    (ruleset) => ruleset.status === "published"
  );

  const draftRuleset = SAMPLE_WEEKLY_RULESETS.find(
    (ruleset) => ruleset.status === "draft"
  );

  // Get current rules for each activity
  const activityRules = SAMPLE_ACTIVITY_TYPES.map((activityType) => {
    const rule = currentWeekRuleset?.rules.find(
      (r) => r.activityTypeId === activityType.id
    );
    return {
      activityType,
      rule,
    };
  });

  const handleOpenSettings = (activityId: string) => {
    router.push(`/campaign/activities/${activityId}`);
  };

  const handleViewRuleHistory = (activityId: string) => {
    router.push(`/campaign/activities/${activityId}?tab=history`);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Link href="/campaign" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activities</h1>
          <p className="text-muted-foreground mt-1">
            Manage on-chain activities and their point allocation rules
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="all">All Activities</TabsTrigger>
          <TabsTrigger value="passive">Passive Activities</TabsTrigger>
          <TabsTrigger value="active">Active Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activityRules.map(({ activityType, rule }) => (
              <Card key={activityType.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-xl">
                      {activityType.name}
                    </CardTitle>
                    <Badge
                      variant={
                        activityType.category === "active"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {activityType.category}
                    </Badge>
                  </div>
                  <CardDescription>{activityType.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge
                        variant={rule?.isActive ? "default" : "destructive"}
                      >
                        {rule?.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Minimum Value:
                      </span>
                      <span>${rule?.minimumValue || "N/A"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Uses Multiplier:
                      </span>
                      <span>{rule?.multiplierApplied ? "Yes" : "No"}</span>
                    </div>
                    {(rule?.cappingRules?.dailyCap ||
                      rule?.cappingRules?.weeklyCap) && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Capping:</span>
                        <span>
                          {rule?.cappingRules?.dailyCap &&
                            `${rule.cappingRules.dailyCap}/day`}
                          {rule?.cappingRules?.dailyCap &&
                            rule?.cappingRules?.weeklyCap &&
                            ", "}
                          {rule?.cappingRules?.weeklyCap &&
                            `${rule.cappingRules.weeklyCap}/week`}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Version:</span>
                      <span>v{rule?.version || "1"}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewRuleHistory(activityType.id)}
                  >
                    <History className="h-4 w-4 mr-1" /> History
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleOpenSettings(activityType.id)}
                  >
                    <Settings className="h-4 w-4 mr-1" /> Settings
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="passive">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activityRules
              .filter(({ activityType }) => activityType.category === "passive")
              .map(({ activityType, rule }) => (
                <Card key={activityType.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-xl">
                        {activityType.name}
                      </CardTitle>
                      <Badge variant="secondary">passive</Badge>
                    </div>
                    <CardDescription>
                      {activityType.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge
                          variant={rule?.isActive ? "default" : "destructive"}
                        >
                          {rule?.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Minimum Value:
                        </span>
                        <span>${rule?.minimumValue || "N/A"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Uses Multiplier:
                        </span>
                        <span>{rule?.multiplierApplied ? "Yes" : "No"}</span>
                      </div>
                      {(rule?.cappingRules?.dailyCap ||
                        rule?.cappingRules?.weeklyCap) && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Capping:
                          </span>
                          <span>
                            {rule?.cappingRules?.dailyCap &&
                              `${rule.cappingRules.dailyCap}/day`}
                            {rule?.cappingRules?.dailyCap &&
                              rule?.cappingRules?.weeklyCap &&
                              ", "}
                            {rule?.cappingRules?.weeklyCap &&
                              `${rule.cappingRules.weeklyCap}/week`}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Version:</span>
                        <span>v{rule?.version || "1"}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewRuleHistory(activityType.id)}
                    >
                      <History className="h-4 w-4 mr-1" /> History
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleOpenSettings(activityType.id)}
                    >
                      <Settings className="h-4 w-4 mr-1" /> Settings
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activityRules
              .filter(({ activityType }) => activityType.category === "active")
              .map(({ activityType, rule }) => (
                <Card key={activityType.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-xl">
                        {activityType.name}
                      </CardTitle>
                      <Badge>active</Badge>
                    </div>
                    <CardDescription>
                      {activityType.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge
                          variant={rule?.isActive ? "default" : "destructive"}
                        >
                          {rule?.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Minimum Value:
                        </span>
                        <span>${rule?.minimumValue || "N/A"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Uses Multiplier:
                        </span>
                        <span>{rule?.multiplierApplied ? "Yes" : "No"}</span>
                      </div>
                      {(rule?.cappingRules?.dailyCap ||
                        rule?.cappingRules?.weeklyCap) && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Capping:
                          </span>
                          <span>
                            {rule?.cappingRules?.dailyCap &&
                              `${rule.cappingRules.dailyCap}/day`}
                            {rule?.cappingRules?.dailyCap &&
                              rule?.cappingRules?.weeklyCap &&
                              ", "}
                            {rule?.cappingRules?.weeklyCap &&
                              `${rule.cappingRules.weeklyCap}/week`}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Version:</span>
                        <span>v{rule?.version || "1"}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewRuleHistory(activityType.id)}
                    >
                      <History className="h-4 w-4 mr-1" /> History
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleOpenSettings(activityType.id)}
                    >
                      <Settings className="h-4 w-4 mr-1" /> Settings
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
