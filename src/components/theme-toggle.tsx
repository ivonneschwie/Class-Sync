"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { useColorTheme } from "@/components/color-theme-provider"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Laptop } from "lucide-react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { colorTheme, setColorTheme } = useColorTheme();

  const colorThemes = [
    { name: 'default', label: 'Default', color: 'hsl(250 80% 65%)' },
    { name: 'red',     label: 'Red',     color: 'hsl(0 85% 55%)' },
    { name: 'orange',  label: 'Orange',  color: 'hsl(25 95% 55%)' },
    { name: 'yellow',  label: 'Yellow',  color: 'hsl(45 95% 45%)' },
    { name: 'lime',    label: 'Lime',    color: 'hsl(85 80% 45%)' },
    { name: 'green',   label: 'Green',   color: 'hsl(140 70% 40%)' },
    { name: 'teal',    label: 'Teal',    color: 'hsl(175 75% 40%)' },
    { name: 'cyan',    label: 'Cyan',    color: 'hsl(195 90% 45%)' },
    { name: 'blue',    label: 'Blue',    color: 'hsl(215 90% 55%)' },
    { name: 'violet',  label: 'Violet',  color: 'hsl(270 75% 60%)' },
    { name: 'fuchsia', label: 'Fuchsia', color: 'hsl(300 80% 60%)' },
    { name: 'pink',    label: 'Pink',    color: 'hsl(330 85% 60%)' },
    { name: 'rose',    label: 'Rose',    color: 'hsl(345 85% 55%)' },
    { name: 'zinc',    label: 'Zinc',    color: 'hsl(240 5% 45%)' },
    { name: 'slate',   label: 'Slate',   color: 'hsl(215 15% 45%)' },
    { name: 'stone',   label: 'Stone',   color: 'hsl(25 10% 45%)' },
  ] as const;

  return (
    <div className="space-y-6">
        <div className="space-y-2">
            <Label>Mode</Label>
            <RadioGroup
                value={theme}
                onValueChange={setTheme}
                className="grid grid-cols-3 gap-2"
                >
                <div>
                    <RadioGroupItem value="light" id="light" className="peer sr-only" />
                    <Label
                    htmlFor="light"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                    <Sun className="mb-2 h-5 w-5" />
                    Light
                    </Label>
                </div>
                <div>
                    <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                    <Label
                    htmlFor="dark"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                    <Moon className="mb-2 h-5 w-5" />
                    Dark
                    </Label>
                </div>
                <div>
                    <RadioGroupItem value="system" id="system" className="peer sr-only" />
                    <Label
                    htmlFor="system"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                    <Laptop className="mb-2 h-5 w-5" />
                    System
                    </Label>
                </div>
            </RadioGroup>
        </div>
        
        <div className="space-y-2">
            <Label>Accent Color</Label>
            <div className="flex flex-wrap gap-3">
            {colorThemes.map((ct) => (
                <Button
                key={ct.name}
                variant="outline"
                size="icon"
                title={ct.label}
                onClick={() => setColorTheme(ct.name)}
                className={cn("h-8 w-8 rounded-full border-2", colorTheme === ct.name && "border-ring ring-2 ring-ring")}
                style={{ backgroundColor: ct.color }}
                >
                <span className="sr-only">{ct.label}</span>
                </Button>
            ))}
            </div>
      </div>
    </div>
  )
}
