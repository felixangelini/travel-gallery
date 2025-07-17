import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import Link from 'next/link';

export default async function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        leftComponents={
          <>
            <Link href="/gallery" className=" opacity-80 hover:text-blue-600   transition-opacity">
              My Gallery
            </Link>
          </>
        }
      />
      
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 