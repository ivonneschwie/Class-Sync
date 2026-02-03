'use client';
import { ProfileForm } from '@/components/profile-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold font-headline">My Profile</h1>
        <p className="text-muted-foreground">
          View and update your personal information.
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Profile Details</CardTitle>
            <CardDescription>
                This is how your information will appear in the app.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <ProfileForm />
        </CardContent>
      </Card>
    </div>
  )
}
