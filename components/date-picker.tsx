"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { format } from "date-fns"
import { it } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: string; // formato ISO YYYY-MM-DD
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export function DatePicker({ 
  value, 
  onChange, 
  label, 
  placeholder = "Select date",
  disabled = false,
  className = "",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  
  // Converti la stringa ISO in Date per il calendario (evitando problemi di fuso orario)
  const date = value ? (() => {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  })() : undefined

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Converti la Date in formato ISO YYYY-MM-DD evitando problemi di fuso orario
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const isoDate = `${year}-${month}-${day}`;
      onChange(isoDate)
    } else {
      onChange('')
    }
    setOpen(false)
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <Label className="px-1 text-sm dark:text-gray-600 font-medium">
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between font-normal"
            disabled={disabled}
          >
            {date ? (
              format(date, 'dd MMMM yyyy', { locale: it })
            ) : (
              <span className="text-muted-foreground dark:text-white">{placeholder}</span>
            )}
            <ChevronDownIcon className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            locale={it}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
} 