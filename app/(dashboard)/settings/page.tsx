'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SettingsSection, SettingsItem, SubscriptionCard } from '@/components/settings';
import {
  User,
  Settings,
  CreditCard,
  Shield,
  Camera,
  Check,
  Trash2,
  Download,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

// Mock user data
const mockUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatarUrl: '',
  school: 'Westview High School',
  graduationYear: 2025,
  isPremium: false,
  connectedGoogle: true,
};

const mockPreferences = {
  practiceMode: 'random',
  questionsPerSession: 10,
  difficultyPreference: 'mixed',
  editorTheme: 'light',
  fontSize: 14,
  showKeyboardShortcuts: true,
  enableAnimations: true,
  enableSoundEffects: false,
  emailNotifications: true,
  dailyReminders: true,
  reminderTime: '18:00',
  weeklyProgress: true,
  publicProfile: false,
  shareWithTeachers: false,
};

export default function SettingsPage() {
  const [user, setUser] = useState(mockUser);
  const [preferences, setPreferences] = useState(mockPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [deleteType, setDeleteType] = useState<'progress' | 'account'>('progress');

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleDeleteConfirm = async () => {
    // Handle delete
    setShowDeleteDialog(false);
  };

  const handleExportData = () => {
    // Export user data as JSON
    const data = { user, preferences, progress: {} };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aceai-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-charcoal">Settings</h1>
        <p className="text-charcoal-light mt-1">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-cream-200 border border-cream-300 p-1">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-white data-[state=active]:text-charcoal gap-2"
          >
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="data-[state=active]:bg-white data-[state=active]:text-charcoal gap-2"
          >
            <Settings className="w-4 h-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger
            value="subscription"
            className="data-[state=active]:bg-white data-[state=active]:text-charcoal gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Subscription
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className="data-[state=active]:bg-white data-[state=active]:text-charcoal gap-2"
          >
            <Shield className="w-4 h-4" />
            Account
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-cream-300">
            <CardContent className="p-6">
              <SettingsSection title="Profile Photo">
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback className="bg-primary-100 text-primary-600 text-2xl">
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button
                      variant="outline"
                      className="border-cream-300 hover:bg-cream-100"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Change Photo
                    </Button>
                    <p className="text-xs text-charcoal-light mt-2">
                      JPG, PNG or GIF. Max 2MB.
                    </p>
                  </div>
                </div>
              </SettingsSection>
            </CardContent>
          </Card>

          <Card className="border-cream-300">
            <CardContent className="p-6">
              <SettingsSection title="Profile Information">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={user.name}
                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                        className="mt-1.5 border-cream-300 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Input
                          id="email"
                          value={user.email}
                          disabled
                          className="border-cream-300 bg-cream-50 text-charcoal-light"
                        />
                        <Badge className="bg-success-light text-success-dark border-0 flex-shrink-0">
                          <Check className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="school">School Name (Optional)</Label>
                      <Input
                        id="school"
                        value={user.school}
                        onChange={(e) => setUser({ ...user, school: e.target.value })}
                        placeholder="Enter your school name"
                        className="mt-1.5 border-cream-300 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="graduation">Graduation Year</Label>
                      <Select
                        value={user.graduationYear.toString()}
                        onValueChange={(v) =>
                          setUser({ ...user, graduationYear: parseInt(v) })
                        }
                      >
                        <SelectTrigger className="mt-1.5 border-cream-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[2024, 2025, 2026, 2027, 2028].map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="bg-primary-500 hover:bg-primary-600 text-white rounded-xl mt-4"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </SettingsSection>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card className="border-cream-300">
            <CardContent className="p-6">
              <SettingsSection
                title="Study Preferences"
                description="Customize your practice experience"
              >
                <SettingsItem label="Default Practice Mode">
                  <Select
                    value={preferences.practiceMode}
                    onValueChange={(v) =>
                      setPreferences({ ...preferences, practiceMode: v })
                    }
                  >
                    <SelectTrigger className="w-40 border-cream-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="random">Random</SelectItem>
                      <SelectItem value="weak">Weak Areas</SelectItem>
                      <SelectItem value="sequential">Sequential</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsItem>

                <SettingsItem label="Questions per Session">
                  <Select
                    value={preferences.questionsPerSession.toString()}
                    onValueChange={(v) =>
                      setPreferences({
                        ...preferences,
                        questionsPerSession: parseInt(v),
                      })
                    }
                  >
                    <SelectTrigger className="w-24 border-cream-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 15, 20].map((n) => (
                        <SelectItem key={n} value={n.toString()}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SettingsItem>

                <SettingsItem label="Difficulty Preference">
                  <Select
                    value={preferences.difficultyPreference}
                    onValueChange={(v) =>
                      setPreferences({ ...preferences, difficultyPreference: v })
                    }
                  >
                    <SelectTrigger className="w-32 border-cream-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mixed">Mixed</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsItem>
              </SettingsSection>
            </CardContent>
          </Card>

          <Card className="border-cream-300">
            <CardContent className="p-6">
              <SettingsSection
                title="Interface Preferences"
                description="Customize how the app looks and feels"
              >
                <SettingsItem label="Code Editor Theme">
                  <Select
                    value={preferences.editorTheme}
                    onValueChange={(v) =>
                      setPreferences({ ...preferences, editorTheme: v })
                    }
                  >
                    <SelectTrigger className="w-28 border-cream-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsItem>

                <SettingsItem label="Code Font Size">
                  <Select
                    value={preferences.fontSize.toString()}
                    onValueChange={(v) =>
                      setPreferences({ ...preferences, fontSize: parseInt(v) })
                    }
                  >
                    <SelectTrigger className="w-24 border-cream-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[12, 13, 14, 15, 16, 17, 18].map((n) => (
                        <SelectItem key={n} value={n.toString()}>
                          {n}px
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SettingsItem>

                <SettingsItem
                  label="Show Keyboard Shortcuts"
                  description="Display keyboard shortcuts in practice mode"
                >
                  <Switch
                    checked={preferences.showKeyboardShortcuts}
                    onCheckedChange={(v) =>
                      setPreferences({ ...preferences, showKeyboardShortcuts: v })
                    }
                    className="data-[state=checked]:bg-primary-500"
                  />
                </SettingsItem>

                <SettingsItem label="Enable Animations">
                  <Switch
                    checked={preferences.enableAnimations}
                    onCheckedChange={(v) =>
                      setPreferences({ ...preferences, enableAnimations: v })
                    }
                    className="data-[state=checked]:bg-primary-500"
                  />
                </SettingsItem>

                <SettingsItem label="Enable Sound Effects">
                  <Switch
                    checked={preferences.enableSoundEffects}
                    onCheckedChange={(v) =>
                      setPreferences({ ...preferences, enableSoundEffects: v })
                    }
                    className="data-[state=checked]:bg-primary-500"
                  />
                </SettingsItem>
              </SettingsSection>
            </CardContent>
          </Card>

          <Card className="border-cream-300">
            <CardContent className="p-6">
              <SettingsSection
                title="Notification Preferences"
                description="Control how we communicate with you"
              >
                <SettingsItem
                  label="Email Notifications"
                  description="Receive emails for streak milestones"
                >
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(v) =>
                      setPreferences({ ...preferences, emailNotifications: v })
                    }
                    className="data-[state=checked]:bg-primary-500"
                  />
                </SettingsItem>

                <SettingsItem
                  label="Daily Study Reminders"
                  description="Get reminded to practice each day"
                >
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={preferences.dailyReminders}
                      onCheckedChange={(v) =>
                        setPreferences({ ...preferences, dailyReminders: v })
                      }
                      className="data-[state=checked]:bg-primary-500"
                    />
                    {preferences.dailyReminders && (
                      <Input
                        type="time"
                        value={preferences.reminderTime}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            reminderTime: e.target.value,
                          })
                        }
                        className="w-28 border-cream-300"
                      />
                    )}
                  </div>
                </SettingsItem>

                <SettingsItem
                  label="Weekly Progress Summary"
                  description="Receive a summary of your progress each week"
                >
                  <Switch
                    checked={preferences.weeklyProgress}
                    onCheckedChange={(v) =>
                      setPreferences({ ...preferences, weeklyProgress: v })
                    }
                    className="data-[state=checked]:bg-primary-500"
                  />
                </SettingsItem>
              </SettingsSection>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
          <SubscriptionCard
            isPremium={user.isPremium}
            nextBillingDate={user.isPremium ? 'March 15, 2024' : undefined}
            paymentMethod={user.isPremium ? 'Card ending in 4242' : undefined}
            onUpgrade={() => console.log('Upgrade clicked')}
            onManage={() => console.log('Manage clicked')}
            onCancel={() => setShowCancelDialog(true)}
          />
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card className="border-cream-300">
            <CardContent className="p-6">
              <SettingsSection
                title="Connected Accounts"
                description="Manage your connected accounts and sign-in methods"
              >
                <SettingsItem
                  label="Google"
                  description={user.connectedGoogle ? 'Connected' : 'Not connected'}
                >
                  {user.connectedGoogle ? (
                    <Badge className="bg-success-light text-success-dark border-0">
                      <Check className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-cream-300"
                    >
                      Connect
                    </Button>
                  )}
                </SettingsItem>

                <SettingsItem
                  label="Email & Password"
                  description="Sign in with your email address"
                >
                  <Badge className="bg-success-light text-success-dark border-0">
                    <Check className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </SettingsItem>
              </SettingsSection>
            </CardContent>
          </Card>

          <Card className="border-cream-300">
            <CardContent className="p-6">
              <SettingsSection
                title="Privacy Settings"
                description="Control your privacy and data sharing"
              >
                <SettingsItem
                  label="Public Profile"
                  description="Allow others to see your profile on leaderboards"
                >
                  <Switch
                    checked={preferences.publicProfile}
                    onCheckedChange={(v) =>
                      setPreferences({ ...preferences, publicProfile: v })
                    }
                    className="data-[state=checked]:bg-primary-500"
                  />
                </SettingsItem>

                <SettingsItem
                  label="Share Progress with Teachers"
                  description="Allow your teachers to view your progress"
                >
                  <Switch
                    checked={preferences.shareWithTeachers}
                    onCheckedChange={(v) =>
                      setPreferences({ ...preferences, shareWithTeachers: v })
                    }
                    className="data-[state=checked]:bg-primary-500"
                  />
                </SettingsItem>
              </SettingsSection>
            </CardContent>
          </Card>

          <Card className="border-cream-300">
            <CardContent className="p-6">
              <SettingsSection
                title="Data Management"
                description="Export or delete your data"
              >
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={handleExportData}
                    className="border-cream-300 hover:bg-cream-100"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download My Data
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setDeleteType('progress');
                      setShowDeleteDialog(true);
                    }}
                    className="border-error text-error hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All Progress
                  </Button>

                  <button
                    onClick={() => {
                      setDeleteType('account');
                      setShowDeleteDialog(true);
                    }}
                    className="flex items-center gap-2 text-sm text-error hover:underline"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </button>
                </div>
              </SettingsSection>
            </CardContent>
          </Card>

          <Card className="border-cream-300">
            <CardContent className="p-6">
              <SettingsSection title="App Information">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-charcoal-light">Version</span>
                    <span className="text-charcoal">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-light">Last Updated</span>
                    <span className="text-charcoal">February 2024</span>
                  </div>
                </div>

                <div className="flex gap-4 mt-4">
                  <a
                    href="#"
                    className="text-sm text-primary-500 hover:underline flex items-center gap-1"
                  >
                    Privacy Policy
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="#"
                    className="text-sm text-primary-500 hover:underline flex items-center gap-1"
                  >
                    Terms of Service
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </SettingsSection>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-error">
              <AlertTriangle className="w-5 h-5" />
              {deleteType === 'progress' ? 'Delete All Progress?' : 'Delete Account?'}
            </DialogTitle>
            <DialogDescription>
              {deleteType === 'progress'
                ? 'This will permanently delete all your practice history, progress, and achievements. This action cannot be undone.'
                : 'This will permanently delete your account and all associated data. This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-cream-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className="bg-error hover:bg-red-600 text-white"
            >
              {deleteType === 'progress' ? 'Delete Progress' : 'Delete Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Subscription?</DialogTitle>
            <DialogDescription>
              You will lose access to premium features at the end of your billing period.
              Your progress will be saved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              className="border-cream-300"
            >
              Keep Premium
            </Button>
            <Button
              onClick={() => {
                setShowCancelDialog(false);
                // Handle cancellation
              }}
              className="bg-charcoal hover:bg-charcoal/90 text-white"
            >
              Cancel Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
