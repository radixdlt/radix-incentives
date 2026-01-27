'use client';

import { useForm, useStore } from '@tanstack/react-form';
import { Option, pipe, Schema } from 'effect';
import {
  AccessControllerAddress,
  AccountAddress,
  ComponentAddress,
  FungibleResourceAddress,
  SeasonId,
} from 'shared/brandedTypes';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Skeleton } from '~/components/ui/skeleton';
import { Switch } from '~/components/ui/switch';
import { cn } from '~/lib/utils';
import { api } from '~/trpc/react';

const NONE_VALUE = '__none__';

type SeasonConfigFormProps = {
  seasonId: string;
};

// Schema for API response
const SeasonConfigSchema = Schema.Struct({
  seasonRewardComponentAddress: Schema.NullOr(Schema.String),
  adminAccount: Schema.NullOr(
    Schema.Struct({
      type: Schema.Literal('unsecurifiedAccount', 'securifiedAccount'),
      address: Schema.String,
      accessControllerAddress: Schema.optional(Schema.String),
    }),
  ),
  rewardsResourceAddress: Schema.NullOr(Schema.String),
  adminBadge: Schema.NullOr(
    Schema.Struct({
      type: Schema.Literal('fungibleResource'),
      resourceAddress: Schema.String,
    }),
  ),
  enableAutomaticRefill: Schema.Boolean,
});

type SeasonConfig = typeof SeasonConfigSchema.Type;

// Schema for form values
const FormValuesSchema = Schema.Struct({
  seasonRewardComponentAddress: Schema.String,
  adminAccountType: Schema.Union(
    Schema.Literal('unsecurifiedAccount'),
    Schema.Literal('securifiedAccount'),
    Schema.Literal(''),
  ),
  adminAccountAddress: Schema.String,
  adminAccountAccessController: Schema.String,
  rewardsResourceAddress: Schema.String,
  adminBadgeResourceAddress: Schema.String,
  enableAutomaticRefill: Schema.Boolean,
});

type FormValues = typeof FormValuesSchema.Type;

// Transform SeasonConfig to FormValues using Schema.transform
const ConfigToFormValuesSchema = Schema.transform(
  SeasonConfigSchema,
  FormValuesSchema,
  {
    strict: true,
    decode: (config) => ({
      seasonRewardComponentAddress: pipe(
        Option.fromNullable(config.seasonRewardComponentAddress),
        Option.getOrElse(() => ''),
      ),
      adminAccountType: pipe(
        Option.fromNullable(config.adminAccount?.type),
        Option.getOrElse(() => '' as const),
      ),
      adminAccountAddress: pipe(
        Option.fromNullable(config.adminAccount?.address),
        Option.getOrElse(() => ''),
      ),
      adminAccountAccessController: pipe(
        Option.fromNullable(
          config.adminAccount?.type === 'securifiedAccount'
            ? config.adminAccount.accessControllerAddress
            : null,
        ),
        Option.getOrElse(() => ''),
      ),
      rewardsResourceAddress: pipe(
        Option.fromNullable(config.rewardsResourceAddress),
        Option.getOrElse(() => ''),
      ),
      adminBadgeResourceAddress: pipe(
        Option.fromNullable(config.adminBadge?.resourceAddress),
        Option.getOrElse(() => ''),
      ),
      enableAutomaticRefill: config.enableAutomaticRefill,
    }),
    encode: (formValues) => ({
      seasonRewardComponentAddress:
        formValues.seasonRewardComponentAddress || null,
      adminAccount:
        formValues.adminAccountType === 'unsecurifiedAccount'
          ? {
              type: 'unsecurifiedAccount' as const,
              address: formValues.adminAccountAddress,
            }
          : formValues.adminAccountType === 'securifiedAccount'
            ? {
                type: 'securifiedAccount' as const,
                address: formValues.adminAccountAddress,
                accessControllerAddress:
                  formValues.adminAccountAccessController,
              }
            : null,
      rewardsResourceAddress: formValues.rewardsResourceAddress || null,
      adminBadge: formValues.adminBadgeResourceAddress
        ? {
            type: 'fungibleResource' as const,
            resourceAddress: formValues.adminBadgeResourceAddress,
          }
        : null,
      enableAutomaticRefill: formValues.enableAutomaticRefill,
    }),
  },
);

const extractFormValues = (config: SeasonConfig): FormValues =>
  Schema.decodeUnknownSync(ConfigToFormValuesSchema)(config);

export const SeasonConfigForm = ({ seasonId }: SeasonConfigFormProps) => {
  const brandedSeasonId = SeasonId.make(seasonId);

  const { data: config, isLoading } = api.season.getSeasonConfig.useQuery({
    seasonId: brandedSeasonId,
  });

  if (isLoading || !config) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Season Configuration</CardTitle>
          <CardDescription>
            Configure reward component and admin settings for this season.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return <SeasonConfigFormContent config={config} seasonId={brandedSeasonId} />;
};

type SeasonConfigFormContentProps = {
  config: SeasonConfig;
  seasonId: SeasonId;
};

const SeasonConfigFormContent = ({
  config,
  seasonId,
}: SeasonConfigFormContentProps) => {
  const utils = api.useUtils();

  const updateConfig = api.season.updateSeasonConfig.useMutation({
    onSuccess: async () => {
      toast.success('Season config updated successfully');
      await utils.season.getSeasonConfig.invalidate({ seasonId });
    },
    onError: (error) => {
      toast.error(`Failed to update config: ${error.message}`);
    },
  });

  const form = useForm({
    defaultValues: extractFormValues(config),
    onSubmit: async ({ value }) => {
      const adminAccount =
        value.adminAccountType === 'unsecurifiedAccount' &&
        value.adminAccountAddress
          ? ({
              type: 'unsecurifiedAccount' as const,
              address: AccountAddress.make(value.adminAccountAddress),
            } as const)
          : value.adminAccountType === 'securifiedAccount' &&
              value.adminAccountAddress &&
              value.adminAccountAccessController
            ? ({
                type: 'securifiedAccount' as const,
                address: AccountAddress.make(value.adminAccountAddress),
                accessControllerAddress: AccessControllerAddress.make(
                  value.adminAccountAccessController,
                ),
              } as const)
            : null;

      const adminBadge = value.adminBadgeResourceAddress
        ? ({
            type: 'fungibleResource' as const,
            resourceAddress: FungibleResourceAddress.make(
              value.adminBadgeResourceAddress,
            ),
          } as const)
        : null;

      updateConfig.mutate({
        seasonId,
        config: {
          seasonRewardComponentAddress: value.seasonRewardComponentAddress
            ? ComponentAddress.make(value.seasonRewardComponentAddress)
            : null,
          adminAccount,
          rewardsResourceAddress: value.rewardsResourceAddress
            ? FungibleResourceAddress.make(value.rewardsResourceAddress)
            : null,
          adminBadge,
          enableAutomaticRefill: value.enableAutomaticRefill,
        },
      });
    },
  });

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Season Configuration</CardTitle>
        <CardDescription>
          Configure reward component and admin settings for this season.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <form.Field name="seasonRewardComponentAddress">
            {(field) => (
              <div className="space-y-2">
                <Label
                  htmlFor={field.name}
                  className={cn(
                    field.state.meta.errors.length > 0 && 'text-destructive',
                  )}
                >
                  Season Reward Component Address
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="component_rdx1..."
                  disabled={isSubmitting}
                />
                <p className="text-muted-foreground text-sm">
                  The component address for the season reward smart contract.
                </p>
                {field.state.meta.errors.length > 0 && (
                  <p className="font-medium text-destructive text-sm">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="rewardsResourceAddress">
            {(field) => (
              <div className="space-y-2">
                <Label
                  htmlFor={field.name}
                  className={cn(
                    field.state.meta.errors.length > 0 && 'text-destructive',
                  )}
                >
                  Rewards Resource Address
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="resource_rdx1..."
                  disabled={isSubmitting}
                />
                <p className="text-muted-foreground text-sm">
                  The fungible resource address for rewards (e.g., XRD).
                </p>
                {field.state.meta.errors.length > 0 && (
                  <p className="font-medium text-destructive text-sm">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <div className="space-y-4 rounded-lg border p-4">
            <h4 className="font-medium text-sm">Admin Account</h4>

            <form.Field name="adminAccountType">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Account Type</Label>
                  <Select
                    value={field.state.value || NONE_VALUE}
                    onValueChange={(value) =>
                      field.handleChange(
                        value === NONE_VALUE
                          ? ''
                          : (value as
                              | 'unsecurifiedAccount'
                              | 'securifiedAccount'),
                      )
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>None</SelectItem>
                      <SelectItem value="unsecurifiedAccount">
                        Unsecurified Account
                      </SelectItem>
                      <SelectItem value="securifiedAccount">
                        Securified Account
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors.length > 0 && (
                    <p className="font-medium text-destructive text-sm">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Subscribe selector={(state) => state.values.adminAccountType}>
              {(adminAccountType) =>
                adminAccountType && (
                  <form.Field name="adminAccountAddress">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>Account Address</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="account_rdx1..."
                          disabled={isSubmitting}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="font-medium text-destructive text-sm">
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>
                )
              }
            </form.Subscribe>

            <form.Subscribe selector={(state) => state.values.adminAccountType}>
              {(adminAccountType) =>
                adminAccountType === 'securifiedAccount' && (
                  <form.Field name="adminAccountAccessController">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>
                          Access Controller Address
                        </Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="accesscontroller_rdx1..."
                          disabled={isSubmitting}
                        />
                        <p className="text-muted-foreground text-sm">
                          Required for securified accounts.
                        </p>
                        {field.state.meta.errors.length > 0 && (
                          <p className="font-medium text-destructive text-sm">
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>
                )
              }
            </form.Subscribe>
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <h4 className="font-medium text-sm">Admin Badge</h4>

            <form.Field name="adminBadgeResourceAddress">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Badge Resource Address</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="resource_rdx1..."
                    disabled={isSubmitting}
                  />
                  <p className="text-muted-foreground text-sm">
                    The fungible resource address for the admin badge.
                  </p>
                  {field.state.meta.errors.length > 0 && (
                    <p className="font-medium text-destructive text-sm">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <h4 className="font-medium text-sm">Automatic Refill</h4>

            <form.Field name="enableAutomaticRefill">
              {(field) => (
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor={field.name}>Enable Automatic Refill</Label>
                    <p className="text-muted-foreground text-sm">
                      When enabled, the vester pool will be automatically
                      refilled every 4 hours.
                    </p>
                  </div>
                  <Switch
                    id={field.name}
                    checked={field.state.value}
                    onCheckedChange={(checked) => field.handleChange(checked)}
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </form.Field>
          </div>

          <KillSwitchSection seasonId={seasonId} />

          <div className="flex justify-end">
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, formIsSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || updateConfig.isPending}
                >
                  {formIsSubmitting || updateConfig.isPending
                    ? 'Saving...'
                    : 'Save Configuration'}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const KillSwitchSection = ({ seasonId }: { seasonId: string }) => {
  const brandedSeasonId = SeasonId.make(seasonId);

  const toggleKillSwitch = api.season.toggleKillSwitch.useMutation({
    onSuccess: () => {
      toast.success('Kill switch toggled successfully');
    },
    onError: (error) => {
      toast.error(`Failed to toggle kill switch: ${error.message}`);
    },
  });

  return (
    <div className="space-y-4 rounded-lg border border-destructive p-4">
      <h4 className="font-medium text-destructive text-sm">Kill Switch</h4>
      <p className="text-muted-foreground text-sm">
        Emergency only. Toggling the kill switch will halt or resume all
        redemptions on the vester. Only use this if there is a critical issue
        that requires immediately stopping all claims.
      </p>
      <Button
        type="button"
        variant="destructive"
        disabled={toggleKillSwitch.isPending}
        onClick={() => toggleKillSwitch.mutate({ seasonId: brandedSeasonId })}
      >
        {toggleKillSwitch.isPending ? 'Toggling...' : 'Toggle Kill Switch'}
      </Button>
    </div>
  );
};
