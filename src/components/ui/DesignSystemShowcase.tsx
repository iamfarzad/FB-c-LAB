import { useState } from 'react'
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Input,
  Textarea,
  Badge,
  Loading,
  Skeleton
} from '@/components/ui'
import { Section } from '@/components/layout/Section'
import { Star, Heart, MessageCircle, Share2, Download } from 'lucide-react'

function DesignSystemShowcase() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <Section variant="accent" size="xl">
        <div className="text-center space-y-6">
          <Badge variant="secondary" className="mb-4">Design System v1.0</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            AI Assistant Pro
            <span className="block text-muted-foreground text-2xl md:text-3xl mt-2">
              Design System Showcase
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive collection of unified components, tokens, and patterns for building consistent user interfaces.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="primary" size="lg">
              Get Started
            </Button>
            <Button variant="outline" size="lg">
              <Download className="w-4 h-4 mr-2" />
              Documentation
            </Button>
          </div>
        </div>
      </Section>

      {/* Components Grid */}
      <Section>
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Component Library</h2>
            <p className="text-muted-foreground">
              Explore our unified component system with consistent styling and behavior.
            </p>
          </div>

          {/* Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>
                Versatile button components with multiple variants and sizes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Variants</h4>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Sizes</h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">
                    <Star className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">States</h4>
                <div className="flex flex-wrap gap-3">
                  <Button loading>Loading</Button>
                  <Button disabled>Disabled</Button>
                  <Button>
                    <Heart className="w-4 h-4 mr-2" />
                    With Icon
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Card</CardTitle>
                <CardDescription>
                  A simple card with header and content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This is the main content area of the card. It can contain any type of content.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interactive Card</CardTitle>
                <CardDescription>
                  Card with actions and badges
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Badge variant="success">Active</Badge>
                  <Badge variant="secondary">New</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Cards can include interactive elements and status indicators.
                </p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="outline" size="sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Comment
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loading Card</CardTitle>
                <CardDescription>
                  Demonstrating loading states
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton width="100%" height="20px" />
                  <Skeleton width="80%" height="20px" />
                  <Skeleton width="60%" height="20px" />
                </div>
                <Loading variant="spinner" text="Loading content..." />
              </CardContent>
            </Card>
          </div>

          {/* Forms */}
          <Card>
            <CardHeader>
              <CardTitle>Form Components</CardTitle>
              <CardDescription>
                Input fields with labels, validation, and consistent styling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <Textarea
                  label="Message"
                  placeholder="Tell us about your project..."
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                />
                <div className="flex gap-3">
                  <Button type="submit" loading={loading}>
                    Send Message
                  </Button>
                  <Button type="button" variant="outline">
                    Save Draft
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Badges and Loading States */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Badges</CardTitle>
                <CardDescription>
                  Status indicators and labels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Variants</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Error</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Sizes</h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge size="sm">Small</Badge>
                    <Badge size="md">Medium</Badge>
                    <Badge size="lg">Large</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loading States</CardTitle>
                <CardDescription>
                  Various loading indicators and animations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Loading variant="spinner" text="Spinner loading..." />
                  <Loading variant="dots" text="Dots loading..." />
                  <Loading variant="pulse" text="Pulse loading..." />
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Skeleton Placeholders</h4>
                  <div className="space-y-2">
                    <Skeleton width="100%" height="16px" />
                    <Skeleton width="75%" height="16px" />
                    <Skeleton width="50%" height="16px" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <Section variant="muted">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Ready to build?</h3>
          <p className="text-muted-foreground mb-6">
            Start using our design system components in your project today.
          </p>
          <Button variant="primary">
            Get Started
          </Button>
        </div>
      </Section>
    </div>
  )
}

export { DesignSystemShowcase } 