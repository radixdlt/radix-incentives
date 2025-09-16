'use client';

import {
  Check,
  ChevronDown,
  ChevronUp,
  Edit,
  ExternalLink,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import type { WeekDetailsData } from './types';

interface CategoriesSectionProps {
  weekData: WeekDetailsData;
  seasonId?: string;
  weekId?: string;
  activityUserCounts?: { activityId: string; numberOfAccounts: number }[];
  onUpdatePointsPool?: (categoryId: string, newPointsPool: number) => void;
  onUpdateMultiplier?: (activityId: string, newMultiplier: number) => void;
  onUpdateLowerBoundsPercentage?: (
    categoryId: string,
    newLowerBoundsPercentage: string,
  ) => void;
  onUpdateOutlierThresholdPercentage?: (
    categoryId: string,
    newOutlierThresholdPercentage: string,
  ) => void;
  onUpdateEnableOutlierDetection?: (
    categoryId: string,
    enableOutlierDetection: boolean,
  ) => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  weekData,
  seasonId,
  weekId,
  activityUserCounts,
  onUpdatePointsPool,
  onUpdateMultiplier,
  onUpdateLowerBoundsPercentage,
  onUpdateOutlierThresholdPercentage,
  onUpdateEnableOutlierDetection,
}) => {
  const categories = weekData.activityCategories || [];
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  // Helper function to get user count for an activity
  const getUserCount = (activityId: string): number => {
    const countData = activityUserCounts?.find(
      (count) => count.activityId === activityId,
    );
    return countData?.numberOfAccounts || 0;
  };
  const [editingPointsPool, setEditingPointsPool] = useState<string | null>(
    null,
  );
  const [editingValue, setEditingValue] = useState<string>('');
  const [editingMultiplier, setEditingMultiplier] = useState<string | null>(
    null,
  );
  const [editingMultiplierValue, setEditingMultiplierValue] =
    useState<string>('');
  const [editingLowerBounds, setEditingLowerBounds] = useState<string | null>(
    null,
  );
  const [editingLowerBoundsValue, setEditingLowerBoundsValue] =
    useState<string>('');
  const [editingOutlierThreshold, setEditingOutlierThreshold] = useState<
    string | null
  >(null);
  const [editingOutlierThresholdValue, setEditingOutlierThresholdValue] =
    useState<string>('');

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const startEditingPointsPool = (
    categoryId: string,
    currentValue: number | string | { toString(): string },
  ) => {
    setEditingPointsPool(categoryId);
    const valueString = String(currentValue);
    setEditingValue(Number(valueString).toLocaleString());
  };

  const cancelEditingPointsPool = () => {
    setEditingPointsPool(null);
    setEditingValue('');
  };

  const savePointsPool = (categoryId: string) => {
    // Remove commas and parse the number
    const cleanValue = editingValue.replace(/,/g, '');
    const newValue = Number.parseFloat(cleanValue);
    if (!Number.isNaN(newValue) && newValue >= 0 && onUpdatePointsPool) {
      onUpdatePointsPool(categoryId, newValue);
    }
    setEditingPointsPool(null);
    setEditingValue('');
  };

  const startEditingMultiplier = (
    activityId: string,
    currentValue: number | string | { toString(): string },
  ) => {
    setEditingMultiplier(activityId);
    const valueString = String(currentValue);
    setEditingMultiplierValue(valueString);
  };

  const cancelEditingMultiplier = () => {
    setEditingMultiplier(null);
    setEditingMultiplierValue('');
  };

  const saveMultiplier = (activityId: string) => {
    const newValue = Number.parseFloat(editingMultiplierValue);
    if (!Number.isNaN(newValue) && newValue >= 0 && onUpdateMultiplier) {
      onUpdateMultiplier(activityId, newValue);
    }
    setEditingMultiplier(null);
    setEditingMultiplierValue('');
  };

  const startEditingLowerBounds = (
    categoryId: string,
    currentValue: number | string | { toString(): string },
  ) => {
    setEditingLowerBounds(categoryId);
    const valueString = String(currentValue);
    setEditingLowerBoundsValue(valueString);
  };

  const cancelEditingLowerBounds = () => {
    setEditingLowerBounds(null);
    setEditingLowerBoundsValue('');
  };

  const saveLowerBounds = (categoryId: string) => {
    const cleanValue = editingLowerBoundsValue.trim();
    if (cleanValue && onUpdateLowerBoundsPercentage) {
      onUpdateLowerBoundsPercentage(categoryId, cleanValue);
    }
    setEditingLowerBounds(null);
    setEditingLowerBoundsValue('');
  };

  const startEditingOutlierThreshold = (
    categoryId: string,
    currentValue: number | string | { toString(): string },
  ) => {
    setEditingOutlierThreshold(categoryId);
    const valueString = String(currentValue);
    setEditingOutlierThresholdValue(valueString);
  };

  const cancelEditingOutlierThreshold = () => {
    setEditingOutlierThreshold(null);
    setEditingOutlierThresholdValue('');
  };

  const saveOutlierThreshold = (categoryId: string) => {
    const cleanValue = editingOutlierThresholdValue.trim();
    if (cleanValue && onUpdateOutlierThresholdPercentage) {
      onUpdateOutlierThresholdPercentage(categoryId, cleanValue);
    }
    setEditingOutlierThreshold(null);
    setEditingOutlierThresholdValue('');
  };

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No activity categories assigned to this week yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-2xl tracking-tight">
        Activity Categories
      </h2>

      {categories
        .filter((category) => category.categoryId !== 'common')
        .sort((a, b) => a.categoryId.localeCompare(b.categoryId))
        .map((category) => {
          const isExpanded = expandedCategories.has(category.categoryId);

          return (
            <Card key={category.categoryId} className="border">
              <CardHeader
                className="cursor-pointer"
                onClick={() => toggleCategory(category.categoryId)}
              >
                <div className="space-y-3">
                  {/* Category ID and activity count on top row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">
                        {category.categoryId}
                      </CardTitle>
                      <div className="text-muted-foreground text-sm">
                        ({category.activities.length} activities)
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>

                  {/* Configuration items on second row */}
                  <div className="flex flex-wrap items-center gap-4">
                    {editingOutlierThreshold === category.categoryId ? (
                      <div
                        className={`flex items-center gap-1 ${
                          !category.enableOutlierDetection ? 'opacity-50' : ''
                        }`}
                      >
                        <span className="text-muted-foreground text-sm">
                          Outlier Threshold:
                        </span>
                        <Input
                          type="text"
                          value={editingOutlierThresholdValue}
                          onChange={(e) =>
                            setEditingOutlierThresholdValue(e.target.value)
                          }
                          className="h-8 w-20 text-sm"
                          onClick={(e) => e.stopPropagation()}
                          disabled={!category.enableOutlierDetection}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter') {
                              saveOutlierThreshold(category.categoryId);
                            } else if (e.key === 'Escape') {
                              cancelEditingOutlierThreshold();
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          disabled={!category.enableOutlierDetection}
                          onClick={(e) => {
                            e.stopPropagation();
                            saveOutlierThreshold(category.categoryId);
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelEditingOutlierThreshold();
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className={`flex items-center gap-1 ${
                          !category.enableOutlierDetection ? 'opacity-50' : ''
                        }`}
                      >
                        <span className="text-muted-foreground text-sm">
                          Outlier Threshold:{' '}
                          {category.outlierThresholdPercentage?.toString() ||
                            '0.05'}
                        </span>
                        {onUpdateOutlierThresholdPercentage &&
                          editingOutlierThreshold !== category.categoryId && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                              disabled={!category.enableOutlierDetection}
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditingOutlierThreshold(
                                  category.categoryId,
                                  category.outlierThresholdPercentage || '0.05',
                                );
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                      </div>
                    )}
                    {onUpdateEnableOutlierDetection ? (
                      <Button
                        size="sm"
                        variant={
                          category.enableOutlierDetection
                            ? 'default'
                            : 'outline'
                        }
                        className={`h-8 px-3 font-medium text-sm ${
                          category.enableOutlierDetection
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateEnableOutlierDetection(
                            category.categoryId,
                            !category.enableOutlierDetection,
                          );
                        }}
                      >
                        Outlier Detection:{' '}
                        {category.enableOutlierDetection
                          ? 'Enabled'
                          : 'Disabled'}
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        Outlier Detection:{' '}
                        {category.enableOutlierDetection
                          ? 'Enabled'
                          : 'Disabled'}
                      </span>
                    )}
                    {editingLowerBounds === category.categoryId ? (
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground text-sm">
                          Lower Bounds %:
                        </span>
                        <Input
                          type="text"
                          value={editingLowerBoundsValue}
                          onChange={(e) =>
                            setEditingLowerBoundsValue(e.target.value)
                          }
                          className="h-8 w-20 text-sm"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter') {
                              saveLowerBounds(category.categoryId);
                            } else if (e.key === 'Escape') {
                              cancelEditingLowerBounds();
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            saveLowerBounds(category.categoryId);
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelEditingLowerBounds();
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground text-sm">
                          Lower Bounds:{' '}
                          {category.lowerBoundsPercentage?.toString() || '0'}
                        </span>
                        {onUpdateLowerBoundsPercentage &&
                          editingLowerBounds !== category.categoryId && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditingLowerBounds(
                                  category.categoryId,
                                  category.lowerBoundsPercentage || '0',
                                );
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                      </div>
                    )}
                    {editingPointsPool === category.categoryId ? (
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground text-sm">
                          Points Pool:
                        </span>
                        <Input
                          type="number"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          className="h-8 w-32 text-sm"
                          min="0"
                          step="0.01"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter') {
                              savePointsPool(category.categoryId);
                            } else if (e.key === 'Escape') {
                              cancelEditingPointsPool();
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            savePointsPool(category.categoryId);
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelEditingPointsPool();
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        Points Pool:{' '}
                        {Number(
                          category.pointsPool.toString(),
                        ).toLocaleString()}
                      </span>
                    )}
                    {onUpdatePointsPool &&
                      editingPointsPool !== category.categoryId && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingPointsPool(
                              category.categoryId,
                              category.pointsPool,
                            );
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                  </div>
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent>
                  {category.activities.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="font-medium text-muted-foreground text-sm uppercase tracking-wide">
                        Activities ({category.activities.length})
                      </h4>
                      <div className="overflow-hidden rounded-lg border">
                        {category.activities
                          .sort((a, b) => a.id.localeCompare(b.id))
                          .map((activity, index) => (
                            <div
                              key={activity.id}
                              className={`flex items-center justify-between p-3 ${
                                index !== category.activities.length - 1
                                  ? 'border-b'
                                  : ''
                              }`}
                            >
                              <div>
                                <div className="font-medium">{activity.id}</div>
                                <div className="text-muted-foreground text-xs">
                                  {getUserCount(activity.id)} user
                                  {getUserCount(activity.id) !== 1 ? 's' : ''}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-muted-foreground text-sm">
                                  {editingMultiplier === activity.id ? (
                                    <div className="flex items-center gap-1">
                                      <span>Multiplier:</span>
                                      <Input
                                        type="number"
                                        value={editingMultiplierValue}
                                        onChange={(e) =>
                                          setEditingMultiplierValue(
                                            e.target.value,
                                          )
                                        }
                                        className="h-6 w-20 text-sm"
                                        min="0"
                                        step="0.1"
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            saveMultiplier(activity.id);
                                          } else if (e.key === 'Escape') {
                                            cancelEditingMultiplier();
                                          }
                                        }}
                                      />
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0"
                                        onClick={() =>
                                          saveMultiplier(activity.id)
                                        }
                                      >
                                        <Check className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0"
                                        onClick={cancelEditingMultiplier}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <span>
                                      Multiplier:{' '}
                                      {Number(
                                        activity.multiplier.toString(),
                                      ).toLocaleString()}
                                      x
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  {seasonId && weekId && (
                                    <Button size="sm" variant="outline" asChild>
                                      <Link
                                        href={`/seasons/${seasonId}/weeks/${weekId}/activities/${activity.id}`}
                                      >
                                        <ExternalLink className="mr-1 h-3 w-3" />
                                        AP
                                      </Link>
                                    </Button>
                                  )}
                                  {onUpdateMultiplier &&
                                    editingMultiplier !== activity.id && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 w-8 p-0"
                                        onClick={() =>
                                          startEditingMultiplier(
                                            activity.id,
                                            activity.multiplier,
                                          )
                                        }
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">
                      No activities assigned to this category.
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
    </div>
  );
};
