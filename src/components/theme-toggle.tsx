"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Laptop } from "lucide-react"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <div className="flex w-full items-center justify-between rounded-md border p-2">
      <p className="text-sm font-medium">Theme</p>
      <div className="flex items-center gap-1 rounded-md bg-muted p-1">
        <Button
          variant={theme === "light" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setTheme("light")}
          className="gap-1.5"
        >
          <Sun className="h-4 w-4" />
          Light
        </Button>
        <Button
          variant={theme === "dark" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setTheme("dark")}
          className="gap-1.5"
        >
          <Moon className="h-4 w-4" />
          Dark
        </Button>
        <Button
          variant={theme === "system" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setTheme("system")}
          className="gap-1.5"
        >
          <Laptop className="h-4 w-4" />
          System
        </Button>
      </div>
    </div>
  )
}
