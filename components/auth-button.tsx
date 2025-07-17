import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { User } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (

    <div className="flex items-center gap-4">
      <div className="hidden sm:flex items-center gap-4">
        Hey, {user.user_metadata.username || user.email}!
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="rounded-full w-8 h-8 p-0">
            <User className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="end">
          <div className="space-y-3">
            <div className="text-sm">
              <p className="text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
            <div className="border-t pt-3">
              <LogoutButton />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ) : (
    <div className="flex gap-2">
        <Button asChild size="sm" variant="outline">
        <Link href="/auth/login">Sign in</Link>
      </Button>
        <Button asChild size="sm" variant="default">
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
