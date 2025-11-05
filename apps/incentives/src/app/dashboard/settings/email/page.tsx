'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
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

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  // Update form when shipping address is loaded
  useEffect(() => {
    if (userData) {
      form.reset({
        email: userData.email ?? '',
      });
    }
  }, [userData, form]);

  const onSubmit = async (values: EmailFormValues) => {
    setEmail.mutate({ email: values.email });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Card noHover>
            <CardContent>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email address"
                        type="email"
                        {...field}
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
      </Form>
    </div>
  );
}
