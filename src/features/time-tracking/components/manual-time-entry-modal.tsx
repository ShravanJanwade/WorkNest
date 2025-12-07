"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { useCreateTimeEntry } from "../api/use-create-time-entry";
import { createTimeEntrySchema } from "../schemas";

import { ResponsiveModal } from "@/components/responsive-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface ManualTimeEntryModalProps {
  taskId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z
  .object({
    date: z.date({
      required_error: "Date is required",
    }),
    hours: z.string().transform((v) => (v === "" ? "0" : v)),
    minutes: z.string().transform((v) => (v === "" ? "0" : v)),
    description: z.string().optional(),
    billable: z.boolean().default(true),
  })
  .refine(
    (data) => {
      const h = parseInt(data.hours || "0");
      const m = parseInt(data.minutes || "0");
      return h > 0 || m > 0;
    },
    {
      message: "Duration must be greater than 0",
      path: ["minutes"],
    },
  );

export const ManualTimeEntryModal = ({ taskId, open, onOpenChange }: ManualTimeEntryModalProps) => {
  const { mutate, isPending } = useCreateTimeEntry();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      hours: "0",
      minutes: "0",
      description: "",
      billable: true,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const hours = parseInt(values.hours || "0");
    const minutes = parseInt(values.minutes || "0");
    const totalMinutes = hours * 60 + minutes;

    const startTime = values.date.toISOString();

    mutate(
      {
        json: {
          taskId,
          startTime,
          duration: totalMinutes,
          description: values.description,
          billable: values.billable,
        },
      },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <Card className="w-full h-full border-none shadow-none">
        <CardHeader className="flex p-7">
          <CardTitle className="text-xl font-bold">Log Time</CardTitle>
        </CardHeader>
        <div className="px-7">
          <div className="h-px bg-gray-200" />
        </div>
        <CardContent className="p-7">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="hours"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Hours</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="1" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minutes"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Minutes</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="59" step="1" placeholder="0" {...field} />
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
                        placeholder="What were you working on?"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Billable</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <div className="pt-4 flex items-center justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  Log Time
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </ResponsiveModal>
  );
};
