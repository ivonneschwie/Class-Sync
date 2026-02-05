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
    { name: 'default', label: 'Default', color: 'hsl(242 80% 70%)' },
    { name: 'green', label: 'Green', color: 'hsl(142 76% 36%)' },
    { name: 'blue', label: 'Blue', color: 'hsl(221 83% 53%)' },
    { name: 'orange', label: 'Orange', color: 'hsl(25 95% 53%)' },
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
