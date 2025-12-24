'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Moon, Sun, Monitor } from 'lucide-react';

export default function AppearancePage() {
    const { theme, setTheme } = useTheme();

    const themes = [
        {
            value: 'light',
            label: 'Light',
            description: 'Clean and bright interface',
            icon: Sun,
        },
        {
            value: 'dark',
            label: 'Dark',
            description: 'Easy on the eyes in low light',
            icon: Moon,
        },
        {
            value: 'system',
            label: 'System',
            description: 'Automatically switch based on system preference',
            icon: Monitor,
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Appearance</h3>
                <p className="text-sm text-muted-foreground">
                    Customize the appearance of the app. Choose your theme preference.
                </p>
            </div>
            <Separator />

            <div className="space-y-4">
                <div>
                    <h4 className="text-sm font-medium mb-4">Theme</h4>
                    <RadioGroup value={theme} onValueChange={setTheme} className="grid gap-4">
                        {themes.map((themeOption) => {
                            const Icon = themeOption.icon;
                            return (
                                <div key={themeOption.value} className="flex items-start space-x-3">
                                    <RadioGroupItem value={themeOption.value} id={themeOption.value} />
                                    <div className="flex-1 space-y-1">
                                        <Label
                                            htmlFor={themeOption.value}
                                            className="flex items-center cursor-pointer"
                                        >
                                            <Icon className="mr-2 h-4 w-4" />
                                            <span className="font-medium">{themeOption.label}</span>
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            {themeOption.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </RadioGroup>
                </div>

                <div className="pt-4">
                    <p className="text-sm text-muted-foreground">
                        Your theme preference will be saved automatically.
                    </p>
                </div>
            </div>
        </div>
    );
}
