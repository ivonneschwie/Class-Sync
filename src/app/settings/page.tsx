'use client';
import { ThemeToggle } from '@/components/theme-toggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">
          Customize your application experience.
        </p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
            <CardTitle className="font-headline">Appearance</CardTitle>
            <CardDescription>
                Adjust the look and feel of the interface.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <ThemeToggle />
        </CardContent>
      </Card>
    </div>
  )
}
