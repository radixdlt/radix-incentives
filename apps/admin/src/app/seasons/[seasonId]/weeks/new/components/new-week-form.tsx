import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type ControllerRenderProps } from "react-hook-form";
import * as z from "zod";

import { Button } from "../../../../../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../../../components/ui/form";
import { Input } from "../../../../../../components/ui/input";
import { toast } from "../../../../../../components/ui/use-toast";

const FormSchema = z.object({
  weekName: z.string().min(2, {
    message: "Week name must be at least 2 characters.",
  }),
  // Add other fields as needed, e.g., start date, end date
});

type FormData = z.infer<typeof FormSchema>;

export function NewWeekForm({ seasonId }: { seasonId: string }) {
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      weekName: "",
    },
  });

  // TODO: Implement tRPC mutation for creating the week
  // const createWeekMutation = api.week.create.useMutation({
  //  onSuccess: () => {
  //   toast({ title: "Week created successfully" });
  //   // TODO: Add navigation logic, e.g., router.push(`/admin/seasons/${seasonId}/weeks`);
  //  },
  //  onError: (error) => {
  //   toast({ title: "Error creating week", description: error.message, variant: "destructive" });
  //  }
  // });

  function onSubmit(data: FormData) {
    console.log("Submitting week data:", data, "for season:", seasonId);
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
    // TODO: Call the mutation
    // createWeekMutation.mutate({ ...data, seasonId });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="weekName"
          render={({
            field,
          }: {
            field: ControllerRenderProps<FormData, "weekName">;
          }) => (
            <FormItem>
              <FormLabel>Week Name</FormLabel>
              <FormControl>
                <Input placeholder="Week 1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Add more form fields here */}
        <Button type="submit">Create Week</Button>
        {/* TODO: Add loading state createWeekMutation.isLoading */}
      </form>
    </Form>
  );
}
