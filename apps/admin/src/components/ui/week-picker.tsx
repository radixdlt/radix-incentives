"use client";

import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format, startOfWeek, endOfWeek } from "date-fns";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

interface WeekPickerProps {
  selectedWeek: { start: Date; end: Date } | undefined;
  onWeekSelect: (week: { start: Date; end: Date } | undefined) => void;
}

export function WeekPicker({ selectedWeek, onWeekSelect }: WeekPickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    selectedWeek?.start
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(undefined);
      onWeekSelect(undefined);
      return;
    }

    setSelectedDate(date);
    
    // Create a UTC date from the selected date
    const utcDate = new Date(Date.UTC(
      date.getFullYear(), 
      date.getMonth(), 
      date.getDate()
    ));
    
    // Calculate Monday start manually
    const dayOfWeek = utcDate.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days; otherwise go back (dayOfWeek - 1) days
    
    const mondayStart = new Date(utcDate);
    mondayStart.setUTCDate(utcDate.getUTCDate() - daysToSubtract);
    mondayStart.setUTCHours(0, 0, 0, 0);
    
    // Calculate Sunday end (6 days after Monday start)
    const sundayEnd = new Date(mondayStart);
    sundayEnd.setUTCDate(mondayStart.getUTCDate() + 6);
    sundayEnd.setUTCHours(23, 59, 59, 999);

    onWeekSelect({
      start: mondayStart,
      end: sundayEnd,
    });
  };

  const displayText = selectedWeek
    ? `${format(selectedWeek.start, "MMM d")} - ${format(selectedWeek.end, "MMM d, yyyy")}`
    : "Pick a week";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal px-3",
            !selectedWeek && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          initialFocus
          weekStartsOn={1}
          modifiers={{
            selected_week: selectedWeek?.start
              ? (date) => {
                  // Calculate Monday start for the given date
                  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
                  const dayOfWeek = utcDate.getUTCDay();
                  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                  const weekStart = new Date(utcDate);
                  weekStart.setUTCDate(utcDate.getUTCDate() - daysToSubtract);
                  weekStart.setUTCHours(0, 0, 0, 0);
                  
                  return weekStart.getTime() === selectedWeek.start.getTime();
                }
              : () => false,
          }}
          modifiersStyles={{
            selected_week: {
              backgroundColor: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
            },
          }}
        />
      </PopoverContent>
    </Popover>
  );
}