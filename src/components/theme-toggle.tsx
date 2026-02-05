"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Laptop, Palette } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <div className="flex w-full items-center justify-between rounded-md border p-2">
      <p className="text-sm font-medium">Theme</p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-1.5 px-3">
            <Palette className="h-4 w-4" />
            <span>Change Theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            <Sun className="mr-2 h-4 w-4" />
            <span>Light</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            <Laptop className="mr-2 h-4 w-4" />
            <span>System</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setTheme("green")}>
            <div className="w-4 h-4 mr-2 rounded-full bg-[hsl(142,76%,36%)] border" />
            <span>Green</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark-green")}>
            <div className="w-4 h-4 mr-2 rounded-full bg-[hsl(142,71%,45%)] border" />
            <span>Dark Green</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("blue")}>
            <div className="w-4 h-4 mr-2 rounded-full bg-[hsl(221,83%,53%)] border" />
            <span>Blue</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark-blue")}>
            <div className="w-4 h-4 mr-2 rounded-full bg-[hsl(217,91%,60%)] border" />
            <span>Dark Blue</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("orange")}>
            <div className="w-4 h-4 mr-2 rounded-full bg-[hsl(25,95%,53%)] border" />
            <span>Orange</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark-orange")}>
            <div className="w-4 h-4 mr-2 rounded-full bg-[hsl(35,91%,55%)] border" />
            <span>Dark Orange</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
