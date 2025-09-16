'use client';

import * as React from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Separator } from '~/components/ui/separator';
import { Textarea } from '~/components/ui/textarea';
import { api } from '~/trpc/react';

export default function ActivityCategoriesPage() {
  const { data: categories, isLoading: categoriesLoading } =
    api.activityCategory.list.useQuery();
  const { data: dapps, isLoading: dappsLoading } =
    api.dapps.getDapps.useQuery();

  const utils = api.useUtils();
  const updateCategoryMutation = api.activityCategory.update.useMutation({
    onSuccess: () => {
      utils.activityCategory.list.invalidate();
    },
  });

  const [editingCategory, setEditingCategory] = React.useState<string | null>(
    null,
  );
  const [editData, setEditData] = React.useState<{
    name: string;
    description: string;
    dappIds: string[];
    showOnEarnPage: boolean;
    multiplier: boolean;
    icon: string;
    color: string;
  }>({
    name: '',
    description: '',
    dappIds: [],
    showOnEarnPage: true,
    multiplier: false,
    icon: 'FileText',
    color: 'bg-slate-500/10 text-slate-600',
  });

  if (categoriesLoading || dappsLoading) {
    return (
      <div className="container mx-auto py-6 pr-6 pl-6">
        <p>Loading...</p>
      </div>
    );
  }

  const startEditing = (category: any) => {
    setEditingCategory(category.id);
    setEditData({
      name: category.name || '',
      description: category.description || '',
      dappIds: category.dappIds || [],
      showOnEarnPage: category.showOnEarnPage ?? true,
      multiplier: category.multiplier ?? false,
      icon: category.icon || 'FileText',
      color: category.color || 'bg-slate-500/10 text-slate-600',
    });
  };

  const saveChanges = async () => {
    if (!editingCategory) return;

    await updateCategoryMutation.mutateAsync({
      id: editingCategory,
      data: editData,
    });

    setEditingCategory(null);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditData({
      name: '',
      description: '',
      dappIds: [],
      showOnEarnPage: true,
      multiplier: false,
      icon: 'FileText',
      color: 'bg-slate-500/10 text-slate-600',
    });
  };

  const toggleDapp = (dappId: string) => {
    setEditData((prev) => ({
      ...prev,
      dappIds: prev.dappIds.includes(dappId)
        ? prev.dappIds.filter((id) => id !== dappId)
        : [...prev.dappIds, dappId],
    }));
  };

  return (
    <div className="container mx-auto py-6 pr-6 pl-6">
      <div className="mb-6">
        <h1 className="font-bold text-3xl tracking-tight">
          Activity Categories
        </h1>
        <p className="text-muted-foreground">
          Manage activity categories for the earn page and multiplier system.
        </p>
      </div>

      <Separator className="my-6" />

      <div className="grid gap-6">
        {categories?.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{category.name}</span>
                <div className="flex gap-2">
                  {editingCategory === category.id ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelEdit}
                        disabled={updateCategoryMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={saveChanges}
                        disabled={updateCategoryMutation.isPending}
                      >
                        Save
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(category)}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editingCategory === category.id ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editData.description}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="icon">Icon (Lucide Icon Name)</Label>
                    <Input
                      id="icon"
                      value={editData.icon}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          icon: e.target.value,
                        }))
                      }
                      placeholder="e.g., Coins, Wallet, Droplet"
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Color Classes</Label>
                    <Input
                      id="color"
                      value={editData.color}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          color: e.target.value,
                        }))
                      }
                      placeholder="e.g., bg-green-500/10 text-green-600"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showOnEarnPage"
                      checked={editData.showOnEarnPage}
                      onCheckedChange={(checked) =>
                        setEditData((prev) => ({
                          ...prev,
                          showOnEarnPage: !!checked,
                        }))
                      }
                    />
                    <Label htmlFor="showOnEarnPage">Show on Earn Page</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="multiplier"
                      checked={editData.multiplier}
                      onCheckedChange={(checked) =>
                        setEditData((prev) => ({
                          ...prev,
                          multiplier: !!checked,
                        }))
                      }
                    />
                    <Label htmlFor="multiplier">Has Multiplier</Label>
                  </div>
                  <div>
                    <Label>Associated dApps</Label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {dapps?.map((dapp) => (
                        <div
                          key={dapp.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`dapp-${dapp.id}`}
                            checked={editData.dappIds.includes(dapp.id)}
                            onCheckedChange={() => toggleDapp(dapp.id)}
                          />
                          <Label htmlFor={`dapp-${dapp.id}`}>{dapp.name}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm">
                    <strong>ID:</strong> {category.id}
                  </p>
                  <p className="text-sm">
                    <strong>Description:</strong>{' '}
                    {category.description || 'No description'}
                  </p>
                  <p className="text-sm">
                    <strong>Show on Earn Page:</strong>{' '}
                    {category.showOnEarnPage ? 'Yes' : 'No'}
                  </p>
                  <p className="text-sm">
                    <strong>Has Multiplier:</strong>{' '}
                    {category.multiplier ? 'Yes' : 'No'}
                  </p>
                  <p className="text-sm">
                    <strong>Associated dApps:</strong>{' '}
                    {category.dappIds?.length
                      ? category.dappIds
                          .map(
                            (id: string) =>
                              dapps?.find((d) => d.id === id)?.name || id,
                          )
                          .join(', ')
                      : 'None'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
