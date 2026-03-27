import { Brain, Search, Globe, Terminal, CheckCircle2, Database, FileText } from "lucide-react"
import type { ThoughtStep, Session } from "@/types/sessions"
import type { ThoughtStepType } from "@/types/sessions"

export const THOUGHT_STEP_TYPE_CONFIG: Record<
  ThoughtStepType,
  { icon: typeof Brain; color: string; bgColor: string; label: string }
> = {
  thinking: { icon: Brain, color: "text-violet-600 dark:text-violet-400", bgColor: "bg-violet-100 dark:bg-violet-900/40", label: "Thinking" },
  web_search: { icon: Search, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/40", label: "Web Search" },
  browsing: { icon: Globe, color: "text-cyan-600 dark:text-cyan-400", bgColor: "bg-cyan-100 dark:bg-cyan-900/40", label: "Browsing" },
  tool_use: { icon: Terminal, color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-100 dark:bg-orange-900/40", label: "Tool Use" },
  conclusion: { icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-100 dark:bg-emerald-900/40", label: "Conclusion" },
  query: { icon: Database, color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-100 dark:bg-amber-900/40", label: "Query" },
  artifact: { icon: FileText, color: "text-primary", bgColor: "bg-primary/10", label: "Artifact" },
}

export const MOCK_THOUGHT_STEPS: ThoughtStep[] = [
  {
    id: "step-1",
    type: "thinking",
    title: "Understanding the request",
    content: "The user wants to analyze Q4 vs Q1 ad spend across channels. I need to pull data from Google Ads, Meta Ads, and LinkedIn Ads connections.",
    status: "completed",
    timestamp: new Date("2025-03-10T10:00:00"),
    duration: 1200,
  },
  {
    id: "step-2",
    type: "query",
    title: "Querying Google Ads data",
    content: "SELECT campaign_name, spend, impressions, clicks FROM google_ads WHERE quarter IN ('Q4-2024', 'Q1-2025') GROUP BY campaign_name, quarter",
    status: "completed",
    timestamp: new Date("2025-03-10T10:00:01"),
    duration: 3400,
    metadata: { query: "Google Ads Q4 vs Q1 spend comparison" },
  },
  {
    id: "step-3",
    type: "web_search",
    title: "Searching for industry benchmarks",
    content: "Looking up average ad spend growth rates for Q4 to Q1 transitions in e-commerce.",
    status: "completed",
    timestamp: new Date("2025-03-10T10:00:05"),
    duration: 2100,
    metadata: {
      query: "e-commerce ad spend Q4 vs Q1 industry benchmarks 2025",
      results: [
        "Average Q4 to Q1 spend decrease: 15-25% across retail",
        "Social media ad costs drop 18% in January on average",
      ],
    },
  },
  {
    id: "step-4",
    type: "browsing",
    title: "Reading benchmark report",
    content: "Analyzing the detailed benchmark report to compare against our client's performance.",
    status: "completed",
    timestamp: new Date("2025-03-10T10:00:07"),
    duration: 4500,
    metadata: { url: "https://admetrics.example.com/benchmarks/2025-report" },
  },
  {
    id: "step-5",
    type: "thinking",
    title: "Comparing data patterns",
    content: "Google Ads spend dropped 22% Q4 to Q1, which is within the industry benchmark range of 15-25%. Meta Ads showed a smaller drop of 8%, suggesting better retention. LinkedIn held steady at -3%.",
    status: "completed",
    timestamp: new Date("2025-03-10T10:00:12"),
    duration: 1800,
  },
  {
    id: "step-6",
    type: "artifact",
    title: "Creating comparison chart",
    content: "Generating a side-by-side bar chart comparing Q4 and Q1 spend by channel with industry benchmark overlay.",
    status: "completed",
    timestamp: new Date("2025-03-10T10:00:14"),
    duration: 2200,
    metadata: { artifactId: "cross-channel-dashboard" },
  },
  {
    id: "step-7",
    type: "conclusion",
    title: "Summary",
    content: "Q4 to Q1 ad spend decreased 22% for Google Ads (within industry norm), 8% for Meta Ads (outperforming), and 3% for LinkedIn (stable). Recommend shifting 10% of Q1 Google budget to Meta given its stronger retention.",
    status: "completed",
    timestamp: new Date("2025-03-10T10:00:16"),
    duration: 1500,
  },
]

const ACTIVE_THOUGHT_STEPS: ThoughtStep[] = [
  {
    id: "s2-step-1",
    type: "thinking",
    title: "Analyzing conversion data",
    content: "Pulling conversion rate data for the past 2 weeks to identify the drop.",
    status: "completed",
    timestamp: new Date("2025-03-12T14:30:01"),
    duration: 1000,
  },
  {
    id: "s2-step-2",
    type: "query",
    title: "Running conversion funnel query",
    content: "SELECT step, count(*) as users, conversion_rate FROM funnel_events WHERE date BETWEEN '2025-03-01' AND '2025-03-12' GROUP BY step ORDER BY step_order",
    status: "completed",
    timestamp: new Date("2025-03-12T14:30:02"),
    duration: 2800,
    metadata: { query: "Conversion funnel week-over-week" },
  },
  {
    id: "s2-step-3",
    type: "web_search",
    title: "Checking for platform outages",
    content: "Searching for any known issues with Shopify checkout or payment processing during this period.",
    status: "active",
    timestamp: new Date("2025-03-12T14:30:05"),
    metadata: {
      query: "Shopify checkout issues March 2025",
      results: [
        "Minor Shopify API latency reported March 8-9",
      ],
    },
  },
  {
    id: "s2-step-4",
    type: "browsing",
    title: "Reading Shopify status page",
    content: "Checking the Shopify status page for details on the reported incident.",
    status: "pending",
    timestamp: new Date("2025-03-12T14:30:08"),
    metadata: { url: "https://status.shopify.com" },
  },
]

export const MOCK_SESSIONS: Session[] = [
  {
    id: "session-1",
    title: "Compare Q4 vs Q1 ad spend by channel",
    status: "completed",
    createdAt: new Date("2025-03-10T10:00:00"),
    updatedAt: new Date("2025-03-10T10:00:16"),
    messages: [
      {
        id: "msg-1",
        role: "user",
        content: "Compare Q4 vs Q1 ad spend by channel and tell me which channels are underperforming",
        timestamp: new Date("2025-03-10T10:00:00"),
      },
      {
        id: "msg-2",
        role: "assistant",
        content: "I've analyzed the ad spend across all channels for Q4 2024 vs Q1 2025.\n\n**Key findings:**\n- Google Ads spend decreased 22% (within industry benchmark of 15-25%)\n- Meta Ads only dropped 8% — outperforming the industry average\n- LinkedIn held steady at just -3%\n\n**Recommendation:** Consider shifting 10% of the Q1 Google Ads budget to Meta, given its stronger audience retention during the seasonal transition.",
        timestamp: new Date("2025-03-10T10:00:16"),
        thoughtSteps: MOCK_THOUGHT_STEPS,
      },
    ],
    thoughtSteps: MOCK_THOUGHT_STEPS,
    relatedArtifacts: ["cross-channel-dashboard"],
    relatedItems: [
      { id: "cross-channel-dashboard", title: "Cross Channel Dashboard", type: "dashboard" },
    ],
    agentModel: "think",
  },
  {
    id: "session-2",
    title: "Why did conversion rate drop last week?",
    status: "active",
    createdAt: new Date("2025-03-12T14:30:00"),
    updatedAt: new Date("2025-03-12T14:35:00"),
    messages: [
      {
        id: "msg-3",
        role: "user",
        content: "Our conversion rate dropped significantly last week. Can you investigate what happened?",
        timestamp: new Date("2025-03-12T14:30:00"),
      },
    ],
    thoughtSteps: ACTIVE_THOUGHT_STEPS,
    relatedArtifacts: [],
    relatedItems: [
      { id: "marketing-performance-dashboard", title: "Marketing Performance", type: "dashboard" },
    ],
    agentModel: "think",
  },
  {
    id: "session-3",
    title: "Build cohort analysis for new users",
    status: "paused",
    createdAt: new Date("2025-03-08T09:00:00"),
    updatedAt: new Date("2025-03-08T09:15:00"),
    messages: [
      {
        id: "msg-4",
        role: "user",
        content: "Create a cohort analysis showing retention for users acquired in the last 6 months",
        timestamp: new Date("2025-03-08T09:00:00"),
      },
      {
        id: "msg-5",
        role: "assistant",
        content: "I've started building the cohort analysis. The initial data pull is complete, but I need to verify the user acquisition source mapping. I've paused for your input on which sources to include.",
        timestamp: new Date("2025-03-08T09:15:00"),
      },
    ],
    thoughtSteps: [
      {
        id: "s3-step-1",
        type: "thinking",
        title: "Planning cohort structure",
        content: "Need to define cohorts by acquisition month, then track weekly/monthly retention. Will group by acquisition source.",
        status: "completed",
        timestamp: new Date("2025-03-08T09:00:01"),
        duration: 900,
      },
      {
        id: "s3-step-2",
        type: "query",
        title: "Pulling user acquisition data",
        content: "SELECT user_id, acquisition_date, source FROM users WHERE acquisition_date >= '2024-09-01'",
        status: "completed",
        timestamp: new Date("2025-03-08T09:00:02"),
        duration: 5200,
        metadata: { query: "User acquisition last 6 months" },
      },
    ],
    relatedArtifacts: [],
    relatedItems: [
      { id: "cohort-analysis", title: "Cohort Analysis", type: "query" },
    ],
    agentModel: "fast",
  },
]
