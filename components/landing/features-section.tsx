"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Zap, Eye, BarChart3, Users, Globe, Brain, AlertTriangle, CheckCircle } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Detection",
    description:
      "Advanced machine learning algorithms automatically detect compliance violations across e-commerce platforms.",
    color: "text-primary",
  },
  {
    icon: Eye,
    title: "Real-time Monitoring",
    description: "Continuous 24/7 surveillance of product listings with instant violation alerts and notifications.",
    color: "text-accent",
  },
  {
    icon: Shield,
    title: "Legal Metrology Compliance",
    description: "Comprehensive coverage of Indian Legal Metrology Rules 2011 with automated rule validation.",
    color: "text-secondary",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Detailed reports and analytics dashboard for tracking compliance trends and violation patterns.",
    color: "text-primary",
  },
  {
    icon: Users,
    title: "Multi-Role Access",
    description: "Role-based access control for administrators, officers, and auditors with customized permissions.",
    color: "text-accent",
  },
  {
    icon: Globe,
    title: "Platform Integration",
    description: "Seamless integration with major e-commerce platforms including Amazon, Flipkart, and more.",
    color: "text-secondary",
  },
  {
    icon: Zap,
    title: "Instant Alerts",
    description: "Real-time notifications for critical violations with automated escalation workflows.",
    color: "text-primary",
  },
  {
    icon: AlertTriangle,
    title: "Violation Management",
    description: "Complete violation lifecycle management from detection to resolution with audit trails.",
    color: "text-accent",
  },
  {
    icon: CheckCircle,
    title: "Compliance Reports",
    description: "Generate comprehensive compliance reports for regulatory submissions and audits.",
    color: "text-secondary",
  },
]

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in")
          }
        })
      },
      { threshold: 0.1 },
    )

    const cards = sectionRef.current?.querySelectorAll(".feature-card")
    cards?.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-b from-background to-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive compliance monitoring solution with cutting-edge AI technology designed specifically for Legal
            Metrology enforcement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="feature-card opacity-0 translate-y-8 transition-all duration-700 hover:scale-105 hover:shadow-xl border-2 hover:border-primary/20 bg-card/50 backdrop-blur-sm"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-8 text-center">
                <div className="mb-6 flex justify-center">
                  <div className={`p-4 rounded-full bg-gradient-to-br from-card to-muted ${feature.color}`}>
                    <feature.icon className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-card-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <style jsx>{`
        .animate-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </section>
  )
}
