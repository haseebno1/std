"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { saveSettings } from "@/lib/api"

export function SettingsForm() {
  const [activeTab, setActiveTab] = useState("general")
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    general: {
      companyName: "Your Company",
      defaultTemplate: "template1",
      cardSize: "standard",
      enableBatchProcessing: true,
    },
    appearance: {
      theme: "light",
      primaryColor: "#0070f3",
      logoUrl: "/placeholder.svg?height=100&width=200",
    },
    notifications: {
      emailNotifications: true,
      emailAddress: "admin@example.com",
      notifyOnCardGeneration: true,
      notifyOnTemplateChanges: false,
    },
  })

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      await saveSettings(settings)
      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={settings.general.companyName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: {
                        ...settings.general,
                        companyName: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultTemplate">Default Template</Label>
                <Select
                  value={settings.general.defaultTemplate}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      general: {
                        ...settings.general,
                        defaultTemplate: value,
                      },
                    })
                  }
                >
                  <SelectTrigger id="defaultTemplate">
                    <SelectValue placeholder="Select default template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="template1">Professional ID Card</SelectItem>
                    <SelectItem value="template2">Standard ID Card</SelectItem>
                    <SelectItem value="template3">Enterprise Badge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardSize">Card Size</Label>
                <Select
                  value={settings.general.cardSize}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      general: {
                        ...settings.general,
                        cardSize: value,
                      },
                    })
                  }
                >
                  <SelectTrigger id="cardSize">
                    <SelectValue placeholder="Select card size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (CR80)</SelectItem>
                    <SelectItem value="custom">Custom Size</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="batchProcessing">Batch Processing</Label>
                  <p className="text-sm text-muted-foreground">Enable batch processing of employee cards</p>
                </div>
                <Switch
                  id="batchProcessing"
                  checked={settings.general.enableBatchProcessing}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      general: {
                        ...settings.general,
                        enableBatchProcessing: checked,
                      },
                    })
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={settings.appearance.theme}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      appearance: {
                        ...settings.appearance,
                        theme: value,
                      },
                    })
                  }
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={settings.appearance.primaryColor}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        appearance: {
                          ...settings.appearance,
                          primaryColor: e.target.value,
                        },
                      })
                    }
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={settings.appearance.primaryColor}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        appearance: {
                          ...settings.appearance,
                          primaryColor: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={settings.appearance.logoUrl}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      appearance: {
                        ...settings.appearance,
                        logoUrl: e.target.value,
                      },
                    })
                  }
                />
                <div className="mt-2 p-4 border rounded-md flex items-center justify-center">
                  <img
                    src={settings.appearance.logoUrl || "/placeholder.svg"}
                    alt="Logo Preview"
                    className="max-h-16"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        emailNotifications: checked,
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailAddress">Email Address</Label>
                <Input
                  id="emailAddress"
                  type="email"
                  value={settings.notifications.emailAddress}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        emailAddress: e.target.value,
                      },
                    })
                  }
                  disabled={!settings.notifications.emailNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifyCardGeneration">Card Generation</Label>
                  <p className="text-sm text-muted-foreground">Notify when cards are generated</p>
                </div>
                <Switch
                  id="notifyCardGeneration"
                  checked={settings.notifications.notifyOnCardGeneration}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        notifyOnCardGeneration: checked,
                      },
                    })
                  }
                  disabled={!settings.notifications.emailNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifyTemplateChanges">Template Changes</Label>
                  <p className="text-sm text-muted-foreground">Notify when templates are modified</p>
                </div>
                <Switch
                  id="notifyTemplateChanges"
                  checked={settings.notifications.notifyOnTemplateChanges}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        notifyOnTemplateChanges: checked,
                      },
                    })
                  }
                  disabled={!settings.notifications.emailNotifications}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

