import { Navbar } from "@/components/navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Camera, MapPin, Heart } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <Navbar />
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold">
                Welcome to your{" "}
                <span className="text-blue-600">Travel Gallery</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Document your most precious memories, organize your travel photos
                and relive the emotions of your special moments.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/gallery">
                <Button size="lg" className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Start Exploring
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Camera className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold">Upload Your Photos</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Easily add your travel photos with titles, descriptions and custom tags.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">Organize by Location</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Categorize your photos by destination and date to easily find your memories.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold">Relive the Moments</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Navigate through your personal gallery and rediscover the emotions of your travels.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
