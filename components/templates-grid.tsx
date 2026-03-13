"use client"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"

interface Template {
  id: string
  title: string
  prompt: string
  color: string
  image: string
  tag: string
  date: string
}

interface Template6Card {
  id: string
  title: string
  description: string
  prompts: string[]
  color: string
  count: number
}

export const templates: Template[] = [
  {
    id: "cross-channel",
    title: "Cross-channel Performance",
    prompt: "Show me a comprehensive cross-channel marketing performance dashboard with key metrics and insights.",
    color: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-200/30 hover:border-blue-300/60",
    image: "/friendly-chat-conversation.png",
    tag: "Analytics",
    date: "Dec 15",
  },
  {
    id: "google-ads",
    title: "Google Ads Discovery",
    prompt:
      "Create a Google Ads discovery dashboard showing campaign performance, keywords, and optimization opportunities.",
    color: "bg-green-500/10 hover:bg-green-500/20 border-green-200/30 hover:border-green-300/60",
    image: "/programming-code-development.png",
    tag: "Google Ads",
    date: "Dec 14",
  },
  {
    id: "meta-ads",
    title: "Meta Ads Discovery",
    prompt: "Build a Meta Ads discovery dashboard with audience insights, ad performance, and creative analysis.",
    color: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-200/30 hover:border-purple-300/60",
    image: "/creative-writing-storytelling.png",
    tag: "Meta Ads",
    date: "Dec 13",
  },
  {
    id: "creatives",
    title: "Creatives Performance",
    prompt: "Design a creative performance dashboard tracking ad creative metrics, engagement, and conversion rates.",
    color: "bg-orange-500/10 hover:bg-orange-500/20 border-orange-200/30 hover:border-orange-300/60",
    image: "/education-learning-books-study.png",
    tag: "Creatives",
    date: "Dec 12",
  },
  {
    id: "conversions",
    title: "Conversions Analytics",
    prompt: "Create a conversion analytics dashboard showing funnel performance, attribution, and ROI metrics.",
    color: "bg-red-500/10 hover:bg-red-500/20 border-red-200/30 hover:border-red-300/60",
    image: "/mathematics-equations-calculations.png",
    tag: "Conversions",
    date: "Dec 11",
  },
  {
    id: "attribution",
    title: "Attribution Modeling",
    prompt: "Build an attribution modeling dashboard to analyze customer journey and touchpoint effectiveness.",
    color: "bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-200/30 hover:border-yellow-300/60",
    image: "/brainstorming-ideas-lightbulb-innovation.png",
    tag: "Attribution",
    date: "Dec 10",
  },
  {
    id: "audience",
    title: "Audience Insights",
    prompt:
      "Design an audience insights dashboard with demographic data, behavior patterns, and segmentation analysis.",
    color: "bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-200/30 hover:border-indigo-300/60",
    image: "/professional-email-business-communication.png",
    tag: "Audience",
    date: "Dec 9",
  },
  {
    id: "roi-analysis",
    title: "ROI Analysis",
    prompt:
      "Create a comprehensive ROI analysis dashboard showing campaign profitability and budget optimization insights.",
    color: "bg-teal-500/10 hover:bg-teal-500/20 border-teal-200/30 hover:border-teal-300/60",
    image: "/document-summary-text-analysis.png",
    tag: "ROI",
    date: "Dec 8",
  },
]

// Templates for 6-card variant with logical data pipeline flow
export const templates6Cards = [
  {
    id: "extract",
    title: "Extract",
    description: "Data extraction and ingestion",
    prompts: [
      "Extract customer data",
      "Pull transaction data",
      "Import marketing data"
    ],
    color: "bg-blue-500/10 border-blue-200/30",
    count: 12,
  },
  {
    id: "explore",
    title: "Explore",
    description: "Data discovery and structure",
    prompts: [
      "Explore available tables",
      "Understand data schemas",
      "Identify key relationships"
    ],
    color: "bg-gray-500/10 border-gray-200/30",
    count: 8,
  },
  {
    id: "transform",
    title: "Transform",
    description: "Data cleaning and processing",
    prompts: [
      "Clean raw data",
      "Normalize data formats",
      "Handle missing values"
    ],
    color: "bg-green-500/10 border-green-200/30",
    count: 15,
  },
  {
    id: "load",
    title: "Load",
    description: "Data storage and warehousing",
    prompts: [
      "Load to data warehouses",
      "Set up database schemas",
      "Automate data pipelines"
    ],
    color: "bg-orange-500/10 border-orange-200/30",
    count: 6,
  },
  {
    id: "govern",
    title: "Govern",
    description: "Data governance and security",
    prompts: [
      "Set access controls",
      "Monitor data quality",
      "Track data lineage"
    ],
    color: "bg-red-500/10 border-red-200/30",
    count: 9,
  },
  {
    id: "analyze",
    title: "Analyze",
    description: "Data insights and analytics",
    prompts: [
      "Find data patterns",
      "Analyze customer behavior",
      "Identify key metrics"
    ],
    color: "bg-purple-500/10 border-purple-200/30",
    count: 24,
  },
]

interface TemplatesGridProps {
  onTemplateSelect: (prompt: string) => void
  templates?: Template[]
}

export function TemplatesGrid({ onTemplateSelect, templates: templatesProp }: TemplatesGridProps) {
  const templatesToUse = templatesProp || templates

  return (
    <div className="w-full max-w-7xl mx-auto mt-48 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6"
      >
        <h2 className="text-lg font-semibold text-foreground">Templates</h2>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {templatesToUse.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
          >
            <Card
              className={`cursor-pointer transition-all duration-300 ease-out hover:scale-105 active:scale-95 border ${template.color} dark:bg-card/50 group h-56 overflow-hidden p-0`}
              onClick={() => onTemplateSelect(template.prompt)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onTemplateSelect(template.prompt)
                }
              }}
              aria-label={`Select ${template.title} template`}
            >
              <div className="flex flex-col h-full">
                <div className="relative h-44">
                  <img
                    src={template.image || "/placeholder.svg"}
                    alt={template.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-background/80 text-foreground backdrop-blur-sm">
                      {template.tag}
                    </span>
                  </div>
                </div>

                <div className="p-2 bg-background/95 backdrop-blur-sm flex-1 flex flex-col justify-center">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground text-xs truncate">{template.title}</h3>
                    <div className="text-xs text-muted-foreground ml-2 shrink-0">{template.date}</div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

// 6-card variant component with simplified design
export function TemplatesGrid6Cards({ onTemplateSelect }: { onTemplateSelect: (prompt: string) => void }) {
  return (
    <div className="w-full max-w-7xl mx-auto mt-16 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-4"
      >
        <h2 className="text-lg font-medium text-foreground text-left">Get Started</h2>
      </motion.div>

      <motion.div
        className="grid grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {templates6Cards.map((template, index) => (
          <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
            >
              <Card className="border border-border/20 dark:bg-card/50 h-auto min-h-[200px] p-6 overflow-hidden rounded-xl shadow-sm relative">
                <div className={`absolute left-0 top-0 bottom-0 w-32 rounded-l-xl z-0 pointer-events-none ${
                  template.id === 'extract' ? 'bg-gradient-to-br from-blue-500/4 via-blue-500/2 to-transparent' :
                  template.id === 'explore' ? 'bg-gradient-to-br from-gray-500/4 via-gray-500/2 to-transparent' :
                  template.id === 'transform' ? 'bg-gradient-to-br from-green-500/4 via-green-500/2 to-transparent' :
                  template.id === 'load' ? 'bg-gradient-to-br from-orange-500/4 via-orange-500/2 to-transparent' :
                  template.id === 'govern' ? 'bg-gradient-to-br from-red-500/4 via-red-500/2 to-transparent' :
                  template.id === 'analyze' ? 'bg-gradient-to-br from-purple-500/4 via-purple-500/2 to-transparent' :
                  'bg-gradient-to-br from-teal-500/4 via-teal-500/2 to-transparent'
                }`}></div>
                <div className="absolute top-3 right-3 z-10">
                  <div className="bg-background/80 backdrop-blur-sm border border-border/20 rounded-full px-2 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                    {template.count}
                  </div>
                </div>
                <div className="flex flex-col h-full">
                  {/* Header with title */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-base text-foreground">
                      {template.title}
                    </h3>
                  </div>

                  {/* Action Buttons */}
                  <div className="mb-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => onTemplateSelect(`Create a new ${template.title.toLowerCase()} solution`)}
                        className="bg-purple-950 text-white px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-purple-900 hover:scale-105 transition-all duration-200 cursor-pointer"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => onTemplateSelect(`Explore all ${template.title.toLowerCase()} capabilities`)}
                        className="bg-secondary text-secondary-foreground px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-secondary/80 hover:scale-105 transition-all duration-200 cursor-pointer"
                      >
                        See all
                      </button>
                    </div>
                  </div>

                  {/* Prompts */}
                  <div className="flex-1">
                    <div className="space-y-1">
                      {template.prompts.map((prompt, promptIndex) => (
                        <div
                          key={promptIndex}
                          onClick={() => onTemplateSelect(prompt)}
                          className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-150 leading-relaxed"
                        >
                          {prompt}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
