import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <CardTitle className="text-2xl">
                Registrazione completata!
              </CardTitle>
              <CardDescription>
                Controlla la tua email per confermare l&apos;account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Mail className="h-5 w-5 text-blue-500" />
                <p className="text-sm text-blue-700">
                  Abbiamo inviato un link di conferma alla tua email
                </p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                Dopo aver confermato la tua email, potrai accedere alla tua galleria di viaggio.
              </p>

              <div className="flex flex-col gap-2 pt-4">
                <Link href="/auth/login">
                  <Button className="w-full">
                    Vai al Login
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Torna alla Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
