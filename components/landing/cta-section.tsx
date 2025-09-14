"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Shield, Users, BarChart3 } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Ready to Transform
            <br />
            Compliance Monitoring?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Join regulatory authorities across India who trust our AI-powered platform for comprehensive Legal Metrology
            compliance monitoring.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-2 hover:border-primary/30 transition-all duration-300 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Secure & Compliant</h3>
                <p className="text-sm text-muted-foreground">
                  Enterprise-grade security with full regulatory compliance
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-accent/30 transition-all duration-300 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Expert Support</h3>
                <p className="text-sm text-muted-foreground">24/7 technical support and compliance expertise</p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-secondary/30 transition-all duration-300 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-12 h-12 text-secondary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Proven Results</h3>
                <p className="text-sm text-muted-foreground">99.9% accuracy with thousands of violations detected</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/sign-up">
              <Button
                size="lg"
                className="text-lg px-8 py-4 bg-primary hover:bg-primary/90 transform hover:scale-105 transition-all duration-300"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 border-2 hover:bg-card transform hover:scale-105 transition-all duration-300 bg-transparent"
              >
                View Demo
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground mt-8">
            No credit card required • 30-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  )
}
