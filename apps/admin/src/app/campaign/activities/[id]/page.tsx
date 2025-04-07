"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, History, Edit, BarChart4, Save } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
import { Badge } from "../../../../components/ui/badge";
import {
  SAMPLE_ACTIVITY_TYPES,
  SAMPLE_WEEKLY_RULESETS,
  type ActivityRule,
} from "../../../../lib/types/activity-rules";
import { ActivityRuleEditor } from "../components/activity-rule-editor";

interface ActivitySettingsPageProps {
  params: {
    id: string;
  };
}

export default function ActivitySettingsPage({
  params,
}: ActivitySettingsPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("rules");
  const [editingCurrentRule, setEditingCurrentRule] = useState(false);
  const [editingDraftRule, setEditingDraftRule] = useState(false);
  const [openRuleHistory, setOpenRuleHistory] = useState(false);

  const activityId = params.id;

  // Get tab from URL query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tabParam = searchParams.get("tab");
    if (tabParam && ["rules", "history", "analytics"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  const activityType = SAMPLE_ACTIVITY_TYPES.find(
    (activity) => activity.id === activityId
  );

  const currentWeekRuleset = SAMPLE_WEEKLY_RULESETS.find(
    (ruleset) => ruleset.status === "published"
  );

  const draftRuleset = SAMPLE_WEEKLY_RULESETS.find(
    (ruleset) => ruleset.status === "draft"
  );

  const currentRule = currentWeekRuleset?.rules.find(
    (rule) => rule.activityTypeId === activityId
  );

  const draftRule = draftRuleset?.rules.find(
    (rule) => rule.activityTypeId === activityId
  );

  const handleRuleSave = (
    updatedRule: Partial<ActivityRule>,
    isDraft: boolean
  ) => {
    console.log(`Saving ${isDraft ? "draft" : "current"} rule:`, updatedRule);
    // In a real app, save the rule to the backend

    if (isDraft) {
      setEditingDraftRule(false);
    } else {
      setEditingCurrentRule(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  if (!activityType) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Link href="/campaign/activities" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Activity Not Found
            </h1>
            <p className="text-muted-foreground mt-1">
              The requested activity could not be found
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/campaign/activities">Back to Activities</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/campaign/activities" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {activityType.name}
              </h1>
              <Badge
                variant={
                  activityType.category === "active" ? "default" : "secondary"
                }
              >
                {activityType.category}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {activityType.description}
            </p>
          </div>
        </div>
        <Button onClick={() => router.push("/campaign/activities")}>
          Back to Activities
        </Button>
      </div>

      <Tabs
        defaultValue="rules"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Rules Tab Content */}
        <TabsContent value="rules" className="space-y-6">
          {editingCurrentRule || editingDraftRule ? (
            <div className="bg-card p-6 border rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">
                  {editingDraftRule ? "Create Draft Rule" : "Edit Current Rule"}
                </h2>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingCurrentRule(false);
                    setEditingDraftRule(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
              <ActivityRuleEditor
                rule={editingDraftRule ? null : currentRule || null}
                activityType={activityType}
                weekNumber={
                  editingDraftRule
                    ? (draftRuleset?.weekNumber || 0) + 1
                    : currentWeekRuleset?.weekNumber || 1
                }
                seasonNumber={
                  editingDraftRule
                    ? draftRuleset?.seasonNumber || 1
                    : currentWeekRuleset?.seasonNumber || 1
                }
                onClose={() => {
                  setEditingCurrentRule(false);
                  setEditingDraftRule(false);
                }}
                onSave={(updatedRule) =>
                  handleRuleSave(updatedRule, editingDraftRule)
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="flex items-center justify-between">
                    Current Rule
                    <Badge className="ml-2">{`Week ${currentWeekRuleset?.weekNumber || "?"}`}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Active from{" "}
                    {currentWeekRuleset
                      ? formatDate(currentWeekRuleset.effectiveFrom)
                      : "—"}
                    to{" "}
                    {currentWeekRuleset
                      ? formatDate(currentWeekRuleset.effectiveTo)
                      : "—"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentRule ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-sm font-medium">Status</div>
                          <div className="text-sm p-2 rounded bg-muted mt-1">
                            {currentRule.isActive ? "Active" : "Inactive"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Min Value</div>
                          <div className="text-sm p-2 rounded bg-muted mt-1">
                            ${currentRule.minimumValue}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Max Value</div>
                          <div className="text-sm p-2 rounded bg-muted mt-1">
                            {currentRule.maximumValue
                              ? `$${currentRule.maximumValue}`
                              : "No limit"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            Uses Multiplier
                          </div>
                          <div className="text-sm p-2 rounded bg-muted mt-1">
                            {currentRule.multiplierApplied ? "Yes" : "No"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Daily Cap</div>
                          <div className="text-sm p-2 rounded bg-muted mt-1">
                            {currentRule.cappingRules?.dailyCap
                              ? `${currentRule.cappingRules.dailyCap} points`
                              : "No cap"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Weekly Cap</div>
                          <div className="text-sm p-2 rounded bg-muted mt-1">
                            {currentRule.cappingRules?.weeklyCap
                              ? `${currentRule.cappingRules.weeklyCap} points`
                              : "No cap"}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-4 border-t pt-4">
                        <div>Version: v{currentRule.version}</div>
                        <div>Created: {formatDate(currentRule.createdAt)}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                      No rule defined for this activity
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button
                    variant="outline"
                    className="mr-2"
                    onClick={() => setActiveTab("history")}
                  >
                    <History className="h-4 w-4 mr-1" /> View History
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => setEditingCurrentRule(true)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit Rule
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Draft Changes
                    <Badge variant="outline" className="ml-2">
                      {`Week ${(draftRuleset?.weekNumber || 0) + 1}`}
                    </Badge>
                  </CardTitle>
                  <CardDescription>Changes for upcoming week</CardDescription>
                </CardHeader>
                <CardContent>
                  {draftRule ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-sm font-medium">Status</div>
                          <div className="text-sm p-2 rounded bg-muted mt-1">
                            {draftRule.isActive ? "Active" : "Inactive"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Min Value</div>
                          <div className="text-sm p-2 rounded bg-muted mt-1">
                            ${draftRule.minimumValue}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Max Value</div>
                          <div className="text-sm p-2 rounded bg-muted mt-1">
                            {draftRule.maximumValue
                              ? `$${draftRule.maximumValue}`
                              : "No limit"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            Uses Multiplier
                          </div>
                          <div className="text-sm p-2 rounded bg-muted mt-1">
                            {draftRule.multiplierApplied ? "Yes" : "No"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Daily Cap</div>
                          <div className="text-sm p-2 rounded bg-muted mt-1">
                            {draftRule.cappingRules?.dailyCap
                              ? `${draftRule.cappingRules.dailyCap} points`
                              : "No cap"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Weekly Cap</div>
                          <div className="text-sm p-2 rounded bg-muted mt-1">
                            {draftRule.cappingRules?.weeklyCap
                              ? `${draftRule.cappingRules.weeklyCap} points`
                              : "No cap"}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-4 border-t pt-4">
                        <div>Version: v{draftRule.version}</div>
                        <div>Status: Draft</div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-muted-foreground mb-4">
                          No draft changes yet
                        </p>
                        <Button onClick={() => setEditingDraftRule(true)}>
                          <Edit className="h-4 w-4 mr-1" /> Create Draft
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
                {draftRule && (
                  <CardFooter className="border-t pt-4 flex justify-end">
                    <Button
                      variant="default"
                      onClick={() => setEditingDraftRule(true)}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit Draft
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          )}
        </TabsContent>

        {/* History Tab Content */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Rule History</h2>
          </div>

          <div className="space-y-4">
            {SAMPLE_WEEKLY_RULESETS.map((ruleset) => {
              const activityRule = ruleset.rules.find(
                (r) => r.activityTypeId === activityId
              );

              if (!activityRule) return null;

              return (
                <Card key={ruleset.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">
                            Week {ruleset.weekNumber}, Season{" "}
                            {ruleset.seasonNumber}
                          </Badge>
                          <Badge
                            variant={
                              ruleset.status === "published"
                                ? "default"
                                : ruleset.status === "draft"
                                  ? "outline"
                                  : "secondary"
                            }
                          >
                            {ruleset.status.charAt(0).toUpperCase() +
                              ruleset.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {formatDate(ruleset.effectiveFrom)} to{" "}
                          {formatDate(ruleset.effectiveTo)}
                        </div>
                      </div>
                      <Badge variant="outline">v{activityRule.version}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <div className="text-sm font-medium">Min Value</div>
                        <div className="text-sm p-2 rounded bg-muted mt-1">
                          ${activityRule.minimumValue}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Max Value</div>
                        <div className="text-sm p-2 rounded bg-muted mt-1">
                          {activityRule.maximumValue
                            ? `$${activityRule.maximumValue}`
                            : "No limit"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          Uses Multiplier
                        </div>
                        <div className="text-sm p-2 rounded bg-muted mt-1">
                          {activityRule.multiplierApplied ? "Yes" : "No"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Daily Cap</div>
                        <div className="text-sm p-2 rounded bg-muted mt-1">
                          {activityRule.cappingRules?.dailyCap
                            ? `${activityRule.cappingRules.dailyCap} points`
                            : "No cap"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Weekly Cap</div>
                        <div className="text-sm p-2 rounded bg-muted mt-1">
                          {activityRule.cappingRules?.weeklyCap
                            ? `${activityRule.cappingRules.weeklyCap} points`
                            : "No cap"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Status</div>
                        <div className="text-sm p-2 rounded bg-muted mt-1">
                          {activityRule.isActive ? "Active" : "Inactive"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Analytics Tab Content */}
        <TabsContent value="analytics">
          <div className="h-[400px] flex items-center justify-center border rounded-lg">
            <div className="text-center">
              <BarChart4 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Analytics Coming Soon
              </h3>
              <p className="text-muted-foreground">
                Detailed activity analytics will be available here in a future
                update.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
