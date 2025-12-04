'use client';

import { useForm } from '@tanstack/react-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { api } from '~/trpc/react';

const emailSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export default function ShippingAddressPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');
  const utils = api.useUtils();

  const { data: userData, isLoading } = api.user.getUser.useQuery();
  const setEmail = api.user.setEmail.useMutation({
    onSuccess: () => {
      toast.success('Email saved successfully!');
      utils.user.getUser.invalidate();
      router.push(returnUrl ?? '/dashboard');
    },
    onError: () => {
      toast.error('Failed to save email. Please try again.');
    },
  });

  const form = useForm({
    defaultValues: {
      email: userData?.email ?? '',
    },
    onSubmit: async ({ value }) => {
      setEmail.mutate({ email: value.email });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <Card noHover>
          <CardContent>
            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => {
                  const result = emailSchema.shape.email.safeParse(value);
                  if (!result.success) {
                    return result.error.issues[0]?.message;
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="mt-4 space-y-2">
                  <Label htmlFor={field.name}>Email Address</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter your email address"
                    type="email"
                    autoComplete="email"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="font-medium text-destructive text-sm">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-4">
          {returnUrl && (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(returnUrl)}
              disabled={setEmail.isPending}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={setEmail.isPending}
            className="min-w-32"
          >
            {setEmail.isPending ? 'Saving...' : 'Submit'}
          </Button>
        </div>
      </form>
    </div>
  );
}
