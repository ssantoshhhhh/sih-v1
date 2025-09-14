"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Search, Brain, AlertCircle, FileText } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Data Collection",
    description:
      "Automated web scraping and data extraction from e-commerce platforms using advanced crawling technology.",
    color: "bg-primary",
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description:
      "Machine learning algorithms analyze product data against Legal Metrology Rules 2011 for compliance validation.",
    color: "bg-accent",
  },
  {
    icon: AlertCircle,
    title: "Violation Detection",
    description:
      "Real-time identification of compliance violations with detailed categorization and severity assessment.",
    color: "bg-secondary",
  },
  {
    icon: FileText,
    title: "Report Generation",
    description:
      "Comprehensive reports and dashboards for regulatory authorities with actionable insights and recommendations.",
    color: "bg-primary",
  },
]

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("slide-in")
          }
        })
      },
      { threshold: 0.2 },
    )

    const steps = sectionRef.current?.querySelectorAll(".step-card")
    steps?.forEach((step) => observer.observe(step))

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-r from-muted via-background to-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our AI-powered system follows a streamlined process to ensure comprehensive compliance monitoring and
            violation detection.
          </p>
        </div>

        <div className="relative">
          {/* Connection Lines */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-secondary transform -translate-y-1/2 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <Card className="step-card opacity-0 translate-x-8 transition-all duration-700 hover:scale-105 mb-4 border-2 hover:border-primary/30 bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div
                      className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg`}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-primary mb-2">{String(index + 1).padStart(2, "0")}</div>
                    <h3 className="text-xl font-semibold mb-4 text-card-foreground">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>

                {index < steps.length - 1 && (
                  <div className="lg:hidden flex items-center justify-center mt-4 mb-4">
                    <ArrowRight className="w-6 h-6 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .slide-in {
          opacity: 1 !important;
          transform: translateX(0) !important;
        }
      `}</style>
    </section>
  )
}
