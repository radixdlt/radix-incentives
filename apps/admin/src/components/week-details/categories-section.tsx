'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Edit, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import type { WeekDetailsData } from './types';

interface CategoriesSectionProps {
  weekData: WeekDetailsData;
  onUpdatePointsPool?: (categoryId: string, newPointsPool: number) => void;
  onUpdateMultiplier?: (activityId: string, newMultiplier: number) => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  weekData,
  onUpdatePointsPool,
  onUpdateMultiplier,
}) => {
  const categories = weekData.activityCategories || [];
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [editingPointsPool, setEditingPointsPool] = useState<string | null>(
    null,
  );
  const [editingValue, setEditingValue] = useState<string>('');
  const [editingMultiplier, setEditingMultiplier] = useState<string | null>(
    null,
  );
  const [editingMultiplierValue, setEditingMultiplierValue] =
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

  const startEditingPointsPool = (categoryId: string, currentValue: any) => {
    setEditingPointsPool(categoryId);
    const valueString =
      typeof currentValue === 'object' && currentValue.toString
        ? currentValue.toString()
        : currentValue.toString();
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

  const startEditingMultiplier = (activityId: string, currentValue: any) => {
    setEditingMultiplier(activityId);
    const valueString =
      typeof currentValue === 'object' && currentValue.toString
        ? currentValue.toString()
        : currentValue.toString();
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
      <h2 className="text-2xl font-semibold tracking-tight">
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">
                      {category.categoryId}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      ({category.activities.length} activities)
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {editingPointsPool === category.categoryId ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">
                          Points Pool:
                        </span>
                        <Input
                          type="number"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          className="w-32 h-8 text-sm"
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
                      <span className="text-sm text-muted-foreground">
                        Points Pool:{' '}
                        {Number(
                          category.pointsPool.toString(),
                        ).toLocaleString()}
                      </span>
                    )}
                    {onUpdatePointsPool && editingPointsPool !== category.categoryId && (
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
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent>
                  {category.activities.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        Activities ({category.activities.length})
                      </h4>
                      <div className="border rounded-lg overflow-hidden">
                        {category.activities
                          .sort((a, b) => a.id.localeCompare(b.id))
                          .map((activity, index) => (
                            <div
                              key={activity.id}
                              className={`p-3 flex items-center justify-between ${
                                index !== category.activities.length - 1
                                  ? 'border-b'
                                  : ''
                              }`}
                            >
                              <div>
                                <div className="font-medium">{activity.id}</div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-sm text-muted-foreground">
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
                                        className="w-20 h-6 text-sm"
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
                                  {onUpdateMultiplier && editingMultiplier !== activity.id && (
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
