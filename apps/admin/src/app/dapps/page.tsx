'use client';

import { Plus, Trash2 } from 'lucide-react';
import type * as React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Separator } from '~/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Textarea } from '~/components/ui/textarea';
import { api } from '~/trpc/react';

type Resource = {
  title: string;
  url: string;
};

type DappFormData = {
  id: string;
  name: string;
  website: string;
  description: string;
  longDescription: string;
  tags: string[];
  resources: Resource[];
  showOnEarnPage: boolean;
};

const initialFormData: DappFormData = {
  id: '',
  name: '',
  website: '',
  description: '',
  longDescription: '',
  tags: [],
  resources: [],
  showOnEarnPage: true,
};

export default function DAppsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDapp, setEditingDapp] = useState<string | null>(null);
  const [formData, setFormData] = useState<DappFormData>(initialFormData);
  const [tagInput, setTagInput] = useState('');
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');

  const { data: dapps, isLoading } = api.dapps.getDapps.useQuery();
  const utils = api.useUtils();

  const createMutation = api.dapps.create.useMutation({
    onSuccess: () => {
      toast.success('DApp created successfully');
      utils.dapps.getDapps.invalidate();
      closeDialog();
    },
    onError: (error) => {
      toast.error(`Failed to create DApp: ${error.message}`);
    },
  });

  const updateMutation = api.dapps.update.useMutation({
    onSuccess: () => {
      toast.success('DApp updated successfully');
      utils.dapps.getDapps.invalidate();
      closeDialog();
    },
    onError: (error) => {
      toast.error(`Failed to update DApp: ${error.message}`);
    },
  });

  const deleteMutation = api.dapps.delete.useMutation({
    onSuccess: () => {
      toast.success('DApp deleted successfully');
      utils.dapps.getDapps.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to delete DApp: ${error.message}`);
    },
  });

  const openCreateDialog = () => {
    setEditingDapp(null);
    setFormData(initialFormData);
    setDialogOpen(true);
  };

  const openEditDialog = (dapp: {
    id: string;
    name: string;
    website: string;
    description?: string | null;
    longDescription?: string | null;
    tags?: string[];
    resources?: Resource[];
    showOnEarnPage?: boolean;
  }) => {
    setEditingDapp(dapp.id);
    setFormData({
      id: dapp.id,
      name: dapp.name,
      website: dapp.website,
      description: dapp.description || '',
      longDescription: dapp.longDescription || '',
      tags: dapp.tags || [],
      resources: dapp.resources || [],
      showOnEarnPage: dapp.showOnEarnPage ?? true,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingDapp(null);
    setFormData(initialFormData);
    setTagInput('');
    setResourceTitle('');
    setResourceUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingDapp) {
      updateMutation.mutate({
        id: editingDapp,
        data: {
          name: formData.name,
          website: formData.website,
          description: formData.description || null,
          longDescription: formData.longDescription || null,
          tags: formData.tags,
          resources: formData.resources,
          showOnEarnPage: formData.showOnEarnPage,
        },
      });
    } else {
      createMutation.mutate({
        id: formData.id,
        name: formData.name,
        website: formData.website,
        description: formData.description || null,
        longDescription: formData.longDescription || null,
        tags: formData.tags,
        resources: formData.resources,
        showOnEarnPage: formData.showOnEarnPage,
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this DApp?')) {
      deleteMutation.mutate({ id });
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const addResource = () => {
    if (resourceTitle.trim() && resourceUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        resources: [
          ...prev.resources,
          { title: resourceTitle.trim(), url: resourceUrl.trim() },
        ],
      }));
      setResourceTitle('');
      setResourceUrl('');
    }
  };

  const removeResource = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 pr-6 pl-6">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 pr-6 pl-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">DApps</h1>
          <p className="text-muted-foreground">
            Manage DApps for the incentives platform
          </p>
        </div>
        <Button type="button" onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add DApp
        </Button>
      </div>

      <Separator className="my-6" />

      <Card>
        <CardHeader>
          <CardTitle>All DApps</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Resources</TableHead>
                <TableHead>Visible</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dapps?.map((dapp) => (
                <TableRow key={dapp.id}>
                  <TableCell className="font-mono text-sm">{dapp.id}</TableCell>
                  <TableCell className="font-medium">{dapp.name}</TableCell>
                  <TableCell>
                    <a
                      href={dapp.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {dapp.website}
                    </a>
                  </TableCell>
                  <TableCell>
                    {dapp.tags && dapp.tags.length > 0
                      ? dapp.tags.join(', ')
                      : 'None'}
                  </TableCell>
                  <TableCell>
                    {dapp.resources && dapp.resources.length > 0
                      ? `${dapp.resources.length} resource${dapp.resources.length > 1 ? 's' : ''}`
                      : 'None'}
                  </TableCell>
                  <TableCell>
                    {dapp.showOnEarnPage ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(dapp)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(dapp.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDapp ? 'Edit DApp' : 'Add New DApp'}
            </DialogTitle>
            <DialogDescription>
              {editingDapp
                ? 'Update the DApp information below.'
                : 'Fill in the information for the new DApp.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingDapp && (
              <div>
                <Label htmlFor="id">ID *</Label>
                <Input
                  id="id"
                  value={formData.id}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, id: e.target.value }))
                  }
                  required
                  placeholder="e.g., ociswap"
                />
              </div>
            )}

            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                placeholder="e.g., Ociswap"
              />
            </div>

            <div>
              <Label htmlFor="website">Website *</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, website: e.target.value }))
                }
                required
                placeholder="https://example.com"
              />
            </div>

            <div>
              <Label htmlFor="description">Short Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description for cards"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="longDescription">Long Description</Label>
              <Textarea
                id="longDescription"
                value={formData.longDescription}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    longDescription: e.target.value,
                  }))
                }
                placeholder="Detailed description for detail page"
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="showOnEarnPage"
                checked={formData.showOnEarnPage}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    showOnEarnPage: !!checked,
                  }))
                }
              />
              <Label htmlFor="showOnEarnPage">Show on Earn Page</Label>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>Resources</Label>
              <div className="space-y-2">
                <Input
                  value={resourceTitle}
                  onChange={(e) => setResourceTitle(e.target.value)}
                  placeholder="Resource title"
                />
                <div className="flex gap-2">
                  <Input
                    value={resourceUrl}
                    onChange={(e) => setResourceUrl(e.target.value)}
                    placeholder="Resource URL"
                    type="url"
                  />
                  <Button type="button" variant="outline" onClick={addResource}>
                    Add
                  </Button>
                </div>
              </div>
              {formData.resources.length > 0 && (
                <div className="mt-2 space-y-2">
                  {formData.resources.map((resource, index) => (
                    <div
                      key={`${resource.url}-${resource.title}`}
                      className="flex items-center justify-between rounded-md border p-2"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{resource.title}</p>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground text-xs hover:underline"
                        >
                          {resource.url}
                        </a>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeResource(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingDapp ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
