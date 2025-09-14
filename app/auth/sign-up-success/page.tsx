import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">AC</span>
            </div>
            <h1 className="text-2xl font-bold">Compliance Monitor</h1>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Account Created!</CardTitle>
              <CardDescription>Your compliance officer account has been successfully created</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Please check your email to verify your account before signing in. Once verified, you'll have access to
                the compliance monitoring dashboard.
              </p>
              <Button asChild className="w-full">
                <Link href="/auth/login">Return to Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
