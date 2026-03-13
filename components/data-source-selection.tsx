"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Plus, BarChart3, Mail, Search, ShoppingCart, Globe, Smartphone } from "lucide-react"
import { cn } from "@/lib/utils"

interface DataSource {
  id: string
  name: string
  category: string
  icon: React.ReactNode | string
  connected: boolean
  description: string
}

const dataSources: DataSource[] = [
  // Analytics
  {
    id: "ga4",
    name: "Google Analytics 4",
    category: "Analytics",
    icon: "/static/sources/40x40_analyticsdata.png",
    connected: true,
    description: "",
  },
  {
    id: "adobe",
    name: "Adobe Analytics",
    category: "Analytics",
    icon: "/static/sources/40x40_adobe_analytics.png",
    connected: false,
    description: "",
  },
  {
    id: "mixpanel",
    name: "Mixpanel",
    category: "Analytics",
    icon: "/static/sources/40x40_mixpanel.png",
    connected: false,
    description: "",
  },

  // Advertising
  {
    id: "google-ads",
    name: "Google Ads",
    category: "Advertising",
    icon: "/static/sources/40x40_google_ads_ql.png",
    connected: false,
    description: "",
  },
  {
    id: "facebook-ads",
    name: "Facebook Ads",
    category: "Advertising",
    icon: "/static/sources/40x40_facebook.png",
    connected: true,
    description: "",
  },
  {
    id: "linkedin-ads",
    name: "LinkedIn Ads",
    category: "Advertising",
    icon: "/static/sources/40x40_linkedin_ads.png",
    connected: false,
    description: "",
  },

  // Email Marketing
  {
    id: "klaviyo",
    name: "Klaviyo",
    category: "Email Marketing",
    icon: "/static/sources/40x40_klaviyo.png",
    connected: false,
    description: "",
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    category: "Email Marketing",
    icon: <Mail className="h-5 w-5" />,
    connected: false,
    description: "",
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    category: "Email Marketing",
    icon: <Mail className="h-5 w-5" />,
    connected: false,
    description: "",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    category: "Email Marketing",
    icon: "/static/sources/40x40_hubspot.png",
    connected: true,
    description: "",
  },

  // E-commerce
  {
    id: "shopify",
    name: "Shopify",
    category: "E-commerce",
    icon: "/static/sources/40x40_shopify_graphql.png",
    connected: false,
    description: "",
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    category: "E-commerce",
    icon: <ShoppingCart className="h-5 w-5" />,
    connected: false,
    description: "",
  },
  {
    id: "amazon",
    name: "Amazon Seller",
    category: "E-commerce",
    icon: "/static/sources/40x40_amazon_selling_partner.png",
    connected: false,
    description: "",
  },

  // Social Media
  {
    id: "instagram",
    name: "Instagram",
    category: "Social Media",
    icon: "/static/sources/40x40_instagram_organic.png",
    connected: false,
    description: "",
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    category: "Social Media",
    icon: "/static/sources/40x40_twitter.png",
    connected: false,
    description: "",
  },
  {
    id: "youtube",
    name: "YouTube",
    category: "Social Media",
    icon: "/static/sources/40x40_youtube_organic.png",
    connected: false,
    description: "",
  },
]

const categoryData = [
  { name: "Analytics", shortName: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { name: "Advertising", shortName: "Ads", icon: <Search className="h-4 w-4" /> },
  { name: "Email Marketing", shortName: "Email", icon: <Mail className="h-4 w-4" /> },
  { name: "E-commerce", shortName: "Commerce", icon: <ShoppingCart className="h-4 w-4" /> },
  { name: "Social Media", shortName: "Social", icon: <Globe className="h-4 w-4" /> },
]

export function DataSourceSelection() {
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>("All")
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const toggleSource = (sourceId: string) => {
    setSelectedSources((prev) => (prev.includes(sourceId) ? prev.filter((id) => id !== sourceId) : [...prev, sourceId]))
  }

  const scrollToCategory = (categoryName: string) => {
    setActiveCategory(categoryName)
    const element = categoryRefs.current[categoryName]
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const filteredDataSources = dataSources
    .filter(
      (source) => {
        // First apply search filter
        const matchesSearch = !searchQuery || 
          source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          source.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          source.description.toLowerCase().includes(searchQuery.toLowerCase())
        
        // Then apply category filter
        if (!matchesSearch) return false
        
        if (activeCategory === "All") return true
        if (activeCategory === "Connected") return source.connected
        return source.category === activeCategory
      }
    )
    .sort((a, b) => {
      // Sort connected sources first
      if (a.connected && !b.connected) return -1
      if (!a.connected && b.connected) return 1
      // If both have same connection status, maintain original order
      return 0
    })

  // Always show all categories, don't filter them
  const filteredCategories = categoryData

  const DataSourceCard = ({ source }: { source: DataSource }) => (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] relative",
        selectedSources.includes(source.id)
          ? "ring-2 ring-purple-500/50 border-purple-500/50 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10"
          : "hover:border-purple-300/50 bg-white dark:bg-card border-border/60",
        source.connected && !selectedSources.includes(source.id) && "border-primary/30",
      )}
      onClick={() => toggleSource(source.id)}
    >
      <CardHeader className="pb-4 pt-6">
        {/* Selection indicator */}
        <div className="absolute top-3 right-3">
          {selectedSources.includes(source.id) ? (
            <CheckCircle2 className="h-5 w-5 text-purple-500" />
          ) : (
            <Plus className="h-5 w-5 text-gray-400" />
          )}
        </div>

        {/* Connected badge */}
        {source.connected && (
          <div className="absolute top-3 left-3">
            <Badge className="text-xs bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-0">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          </div>
        )}

        {/* Centered icon/logo block */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className={cn(
            "p-4 rounded-lg transition-all duration-200 bg-gray-50 dark:bg-gray-900 border",
            selectedSources.includes(source.id)
              ? "border-purple-300 shadow-sm bg-purple-50"
              : source.connected 
                ? "border-green-200 bg-green-50/30"
                : "border-gray-200 dark:border-gray-700"
          )}>
            {typeof source.icon === 'string' ? (
              <img src={source.icon} alt={source.name} className="h-10 w-10" />
            ) : (
              <div className={cn(
                "text-2xl",
                selectedSources.includes(source.id) ? "text-purple-600" : 
                source.connected ? "text-green-600" : "text-gray-600"
              )}>
                {source.icon}
              </div>
            )}
          </div>
          
          {/* Name and category */}
          <div className="space-y-2">
            <CardTitle className="text-sm font-medium">{source.name}</CardTitle>
            <Badge variant="outline" className="text-xs">
              {categoryData.find((c) => c.name === source.category)?.shortName}
            </Badge>
          </div>
        </div>
      </CardHeader>
    </Card>
  )

  return (
    <div className="flex h-full">
      {/* Categories Sidebar */}
      <div className="w-64 min-w-64 bg-card">
        {/* Removed duplicate header */}

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative pt-6 pb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* Category Navigation */}
          <div className="space-y-1 pb-6">
            {/* All Category */}
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-11 text-left font-medium rounded-lg transition-all duration-300 ease-out cursor-pointer",
                activeCategory === "All"
                  ? "bg-gradient-to-r from-purple-50 to-purple-100/50 border border-purple-300/50 shadow-sm hover:from-purple-100 hover:to-purple-100 hover:border-purple-400/50"
                  : "hover:bg-gray-50 dark:hover:bg-gray-900/50",
              )}
              onClick={() => setActiveCategory("All")}
            >
              <div className="flex items-center justify-between w-full">
                <span className={cn(
                  "font-medium transition-colors duration-200",
                  activeCategory === "All" ? "text-purple-700" : "text-card-foreground",
                )}>
                  All
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{filteredDataSources.length}</span>
                </div>
              </div>
            </Button>
            
            {/* Connected Category */}
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-11 text-left font-medium rounded-lg transition-all duration-300 ease-out cursor-pointer",
                activeCategory === "Connected"
                  ? "bg-gradient-to-r from-purple-50 to-purple-100/50 border border-purple-300/50 shadow-sm hover:from-purple-100 hover:to-purple-100 hover:border-purple-400/50"
                  : "hover:bg-gray-50 dark:hover:bg-gray-900/50",
              )}
              onClick={() => setActiveCategory("Connected")}
            >
              <div className="flex items-center justify-between w-full">
                <span className={cn(
                  "font-medium transition-colors duration-200",
                  activeCategory === "Connected" ? "text-purple-700" : "text-card-foreground",
                )}>
                  Connected
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700">
                    {dataSources.filter(s => s.connected).length}
                  </Badge>
                </div>
              </div>
            </Button>
            
            {filteredCategories.map((category) => {
              const categoryCount = dataSources.filter((source) => source.category === category.name).length
              const connectedCount = dataSources.filter(
                (source) => source.category === category.name && source.connected,
              ).length
              const isActive = activeCategory === category.name

              return (
                <Button
                  key={category.name}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-11 text-left font-medium rounded-lg transition-all duration-300 ease-out cursor-pointer",
                    isActive
                      ? "bg-gradient-to-r from-purple-50 to-purple-100/50 border border-purple-300/50 shadow-sm hover:from-purple-100 hover:to-purple-100 hover:border-purple-400/50"
                      : "hover:bg-gray-50 dark:hover:bg-gray-900/50",
                  )}
                  onClick={() => scrollToCategory(category.name)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={cn(
                        "font-medium transition-colors duration-200",
                        isActive ? "text-purple-700" : "text-card-foreground",
                      )}
                    >
                      {category.shortName}
                    </span>
                    <div className="flex items-center gap-2">
                      {connectedCount > 0 && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700">
                          {connectedCount}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{categoryCount}</span>
                    </div>
                  </div>
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="p-6 pb-4 bg-background">
          {activeCategory === "All" ? (
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-heading font-medium text-foreground">All Data Sources</h3>
              <Badge variant="secondary" className="text-xs">
                {filteredDataSources.filter((s) => s.connected).length} connected
              </Badge>
            </div>
          ) : activeCategory === "Connected" ? (
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-heading font-medium text-foreground">Connected Sources</h3>
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                {filteredDataSources.length} sources
              </Badge>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-heading font-medium text-foreground">{activeCategory}</h3>
              <Badge variant="secondary" className="text-xs">
                {filteredDataSources.filter((s) => s.connected).length} connected
              </Badge>
            </div>
          )}
        </div>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeCategory === "All" || activeCategory === "Connected" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDataSources.map((source) => (
                <DataSourceCard key={source.id} source={source} />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {filteredCategories
                .filter((cat) => cat.name === activeCategory)
                .map((categoryInfo) => {
                  const categorySource = filteredDataSources.filter((source) => source.category === categoryInfo.name)
                  
                  return (
                    <div
                      key={categoryInfo.name}
                      ref={(el) => { categoryRefs.current[categoryInfo.name] = el }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categorySource.map((source) => (
                          <DataSourceCard key={source.id} source={source} />
                        ))}
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}