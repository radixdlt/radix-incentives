'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Textarea } from '~/components/ui/textarea';
import { api } from '~/trpc/react';

const EditCategorySchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  multiplier: z.boolean(),
  showOnEarnPage: z.boolean(),
  dappIds: z.array(z.string()),
});

type EditCategoryFormData = z.infer<typeof EditCategorySchema>;

type Dapp = {
  id: string;
  name: string;
  website: string;
  logoFileName: string | null;
};

type Category = {
  id: string;
  name: string;
  description?: string | null;
  multiplier: boolean;
  showOnEarnPage: boolean;
  dappIds: string[];
  dapps?: Dapp[];
};

type EditCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  dapps: Dapp[];
  onSuccess: () => void;
};

export const EditCategoryDialog = ({
  open,
  onOpenChange,
  category,
  dapps,
  onSuccess,
}: EditCategoryDialogProps) => {
  const updateMutation = api.admin.updateActivityCategory.useMutation({
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
    },
  });

  const form = useForm<EditCategoryFormData>({
    resolver: zodResolver(EditCategorySchema),
    defaultValues: {
      id: '',
      name: '',
      description: '',
      multiplier: false,
      showOnEarnPage: true,
      dappIds: [],
    },
  });

  // Update form values when category changes
  React.useEffect(() => {
    if (category) {
      form.reset({
        id: category.id,
        name: category.name,
        description: category.description || '',
        multiplier: category.multiplier,
        showOnEarnPage: category.showOnEarnPage,
        dappIds: category.dappIds || [],
      });
    }
  }, [category, form]);

  const onSubmit = async (data: EditCategoryFormData) => {
    await updateMutation.mutateAsync({
      id: data.id,
      name: data.name,
      description: data.description || null,
      multiplier: data.multiplier,
      showOnEarnPage: data.showOnEarnPage,
      dappIds: data.dappIds,
    });
  };

  const selectedDapps = dapps.filter((dapp) =>
    form.watch('dappIds').includes(dapp.id),
  );

  const availableDapps = dapps.filter(
    (dapp) => !form.watch('dappIds').includes(dapp.id),
  );

  const addDapp = (dappId: string) => {
    const currentIds = form.getValues('dappIds');
    form.setValue('dappIds', [...currentIds, dappId]);
  };

  const removeDapp = (dappId: string) => {
    const currentIds = form.getValues('dappIds');
    form.setValue(
      'dappIds',
      currentIds.filter((id) => id !== dappId),
    );
  };

  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Activity Category</DialogTitle>
          <DialogDescription>
            Make changes to the activity category. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category ID</FormLabel>
                    <FormControl>
                      <Input {...field} disabled className="font-mono" />
                    </FormControl>
                    <FormDescription>
                      The unique identifier for this category
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Category name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe what activities this category includes..."
                      className="min-h-20 resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="multiplier"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Multiplier Category</FormLabel>
                      <FormDescription>
                        This category provides multipliers rather than base
                        points
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="showOnEarnPage"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Show on Earn Page</FormLabel>
                      <FormDescription>
                        Display this category on the main earn page
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormLabel>Related dApps</FormLabel>

              {/* Selected dApps */}
              {selectedDapps.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium text-sm">Selected dApps:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDapps.map((dapp) => (
                      <Badge
                        key={dapp.id}
                        variant="default"
                        className="flex items-center gap-2 pr-1"
                      >
                        {dapp.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeDapp(dapp.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Add dApp */}
              {availableDapps.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium text-sm">Add dApp:</p>
                  <Select onValueChange={addDapp}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a dApp to add..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDapps.map((dapp) => (
                        <SelectItem key={dapp.id} value={dapp.id}>
                          {dapp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {dapps.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  No dApps available. Create dApps first to associate them with
                  categories.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
