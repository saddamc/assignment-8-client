'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { clientFetch } from '@/lib/client-fetch';

interface PreferencesTabProps {
    profile: {
        locale?: string;
        emailNotifications?: boolean;
        smsNotifications?: boolean;
    };
    onSuccess?: () => void;
}

export function PreferencesTab({ profile, onSuccess }: PreferencesTabProps) {
    const [locale, setLocale] = useState(profile.locale || 'en');
    const [emailNotifications, setEmailNotifications] = useState(profile.emailNotifications ?? true);
    const [smsNotifications, setSmsNotifications] = useState(profile.smsNotifications ?? false);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await clientFetch('/user/preferences', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    locale,
                    emailNotifications,
                    smsNotifications,
                }),
            });
            const data = await res.json();

            if (data.success) {
                toast.success('Preferences updated successfully');
                onSuccess?.();
            } else {
                toast.error(data.message || 'Failed to update preferences');
            }
        } catch (error) {
            toast.error('Failed to update preferences');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Language */}
                    <div>
                        <Label htmlFor="locale">Language</Label>
                        <Select value={locale} onValueChange={setLocale}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Email Notifications */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="email-notifications"
                            checked={emailNotifications}
                            onCheckedChange={(checked) => setEmailNotifications(checked as boolean)}
                        />
                        <div>
                            <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive order updates and promotional emails
                            </p>
                        </div>
                    </div>

                    {/* SMS Notifications */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="sms-notifications"
                            checked={smsNotifications}
                            onCheckedChange={(checked) => setSmsNotifications(checked as boolean)}
                        />
                        <div>
                            <Label htmlFor="sms-notifications" className="font-medium">SMS Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive order updates via SMS
                            </p>
                        </div>
                    </div>

                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Preferences'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}