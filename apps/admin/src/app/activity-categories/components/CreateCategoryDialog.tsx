import * as React from 'react';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { api } from '~/trpc/react';

type Dapp = {
  id: string;
  name: string;
  website: string;
  logoFileName: string | null;
};

type CreateCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dapps: Dapp[];
  onSuccess: () => void;
};

export const CreateCategoryDialog = ({
  open,
  onOpenChange,
  dapps,
  onSuccess,
}: CreateCategoryDialogProps) => {
  const [formData, setFormData] = React.useState({
    id: '',
    name: '',
    description: '',
    multiplier: false,
    showOnEarnPage: true,
    dappIds: [] as string[],
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const createCategoryMutation = api.admin.createActivityCategory.useMutation({
    onSuccess: () => {
      onSuccess();
      handleClose();
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    },
  });

  const handleClose = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      multiplier: false,
      showOnEarnPage: true,
      dappIds: [],
    });
    setErrors({});
    onOpenChange(false);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.id.trim()) {
      newErrors.id = 'ID is required';
    } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(formData.id)) {
      newErrors.id =
        'ID must start with a letter and contain only letters, numbers, and underscores';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createCategoryMutation.mutateAsync({
        id: formData.id,
        name: formData.name,
        description: formData.description || undefined,
        multiplier: formData.multiplier,
        showOnEarnPage: formData.showOnEarnPage,
        dappIds: formData.dappIds,
      });
    } catch (_error) {
      // Error handling is done in the mutation onError callback
    }
  };

  const handleDappToggle = (dappId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      dappIds: checked
        ? [...prev.dappIds, dappId]
        : prev.dappIds.filter((id) => id !== dappId),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Activity Category</DialogTitle>
          <DialogDescription>
            Create a new activity category that can be displayed on the Earn
            page.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 py-4">
            {/* ID Field */}
            <div className="space-y-2">
              <Label htmlFor="id">
                ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, id: e.target.value }))
                }
                placeholder="e.g., tradingVolume"
                className={errors.id ? 'border-destructive' : ''}
              />
              {errors.id && (
                <p className="text-destructive text-sm">{errors.id}</p>
              )}
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Trade on Radix DEXs"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-destructive text-sm">{errors.name}</p>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe what users can do to earn points in this category..."
                rows={3}
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="multiplier"
                  checked={formData.multiplier}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      multiplier: Boolean(checked),
                    }))
                  }
                />
                <Label htmlFor="multiplier">
                  Activities in this category count towards multiplier
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showOnEarnPage"
                  checked={formData.showOnEarnPage}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      showOnEarnPage: Boolean(checked),
                    }))
                  }
                />
                <Label htmlFor="showOnEarnPage">
                  Show this category on the Earn page
                </Label>
              </div>
            </div>

            {/* dApps Selection */}
            {dapps.length > 0 && (
              <div className="space-y-2">
                <Label>Associated dApps</Label>
                <div className="max-h-32 space-y-2 overflow-y-auto rounded-md border p-2">
                  {dapps.map((dapp) => (
                    <div key={dapp.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dapp-${dapp.id}`}
                        checked={formData.dappIds.includes(dapp.id)}
                        onCheckedChange={(checked) =>
                          handleDappToggle(dapp.id, Boolean(checked))
                        }
                      />
                      <Label
                        htmlFor={`dapp-${dapp.id}`}
                        className="flex items-center space-x-2 font-normal"
                      >
                        <span>{dapp.name}</span>
                        <span className="text-muted-foreground text-xs">
                          ({dapp.id})
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {errors.submit && (
            <p className="text-destructive text-sm">{errors.submit}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCategoryMutation.isPending}>
              {createCategoryMutation.isPending
                ? 'Creating...'
                : 'Create Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
