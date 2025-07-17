# Travel Gallery App

A modern travel photo gallery built with Next.js, Prisma, and Supabase.

## Architecture

- **Frontend**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Styling**: Tailwind CSS + shadcn/ui

## Features

- 📸 Upload and manage travel photos
- 🏷️ Tag photos for easy organization
- 📍 Add locations to photos
- 📅 Date-based photo organization
- 🔍 Filter photos by tags, locations, and dates
- 👤 User authentication and private galleries
- 🖼️ Fullscreen photo viewing with smooth animations

## Tech Stack

### Database & ORM
- **Prisma**: Type-safe database client and migrations
- **PostgreSQL**: Primary database (hosted on Supabase)

### Authentication & Storage
- **Supabase Auth**: User authentication
- **Supabase Storage**: Image file storage

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern UI components
- **Lucide React**: Icon library

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (protected)/       # Protected routes
│   │   └── gallery/       # Photo gallery
│   ├── auth/              # Authentication pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── *.tsx             # Custom components
├── lib/                   # Shared utilities
│   ├── actions/          # Server actions
│   │   ├── photo-actions.ts
│   │   ├── tag-actions.ts
│   │   └── location-actions.ts
│   ├── services/         # Business logic
│   │   ├── prisma-photo-service.ts
│   │   ├── prisma-tag-service.ts
│   │   └── prisma-location-service.ts
│   ├── hooks/            # Custom React hooks
│   ├── prisma/           # Prisma configuration
│   └── supabase/         # Supabase configuration
├── prisma/               # Database schema and migrations
└── supabase/             # Supabase configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase account
- PostgreSQL database

### Environment Variables

Create a `.env.local` file:

```env
# Supabase (for auth and storage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Database (for Prisma)
DATABASE_URL=your_database_url
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd travel-gallery
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Set up Supabase Storage**
   
   Create a storage bucket in your Supabase project:
   
   - Go to your [Supabase Dashboard](https://supabase.com)
   - Navigate to **Storage** in the sidebar
   - Click **"New bucket"**
   - Configure the bucket:
     - **Name**: `travel-photos`
     - **Public bucket**: ✅ (checked)
     - **File size limit**: `50MB`
     - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`
   - Click **"Create bucket"**

5. **Apply Storage Policies**
   
   Run this SQL in the **SQL Editor** of your Supabase project:
   
   ```sql
   -- Enable Row Level Security for storage.objects
   ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

   -- Policy to allow users to upload files to their own folder
   CREATE POLICY "Users can upload files to their own folder" ON storage.objects
   FOR INSERT WITH CHECK (
     bucket_id = 'travel-photos' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );

   -- Policy to allow users to view their own files
   CREATE POLICY "Users can view their own files" ON storage.objects
   FOR SELECT USING (
     bucket_id = 'travel-photos' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );

   -- Policy to allow users to update their own files
   CREATE POLICY "Users can update their own files" ON storage.objects
   FOR UPDATE USING (
     bucket_id = 'travel-photos' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );

   -- Policy to allow users to delete their own files
   CREATE POLICY "Users can delete their own files" ON storage.objects
   FOR DELETE USING (
     bucket_id = 'travel-photos' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

6. **Start the development server**
   ```bash
   pnpm dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The app uses a clean, normalized database schema:

- **users**: User accounts (managed by Supabase Auth)
- **travel_photos**: Photo metadata and information
- **tags**: Reusable tags for photo organization
- **locations**: Reusable locations for photo organization
- **photo_tags**: Many-to-many relationship between photos and tags

## Key Features

### Photo Management
- Drag & drop photo upload
- Batch upload with individual metadata
- Automatic image optimization
- Secure file storage

### Organization
- Tag-based photo categorization
- Location tracking
- Date-based filtering
- Search and filter capabilities

### User Experiences
- Responsive design
- Smooth animations
- Fullscreen photo viewing
- Intuitive navigation

## Development

### Database Changes

1. **Update the schema** in `prisma/schema.prisma`
2. **Create a migration**:
   ```bash
   npx prisma migrate dev --name description
   ```
3. **Generate the client**:
   ```bash
   npx prisma generate
   ```

## Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DATABASE_URL`
3. **Configure build settings** (if needed):
   - Build Command: `prisma generate && next build`
   - Install Command: `pnpm install`
4. **Deploy** automatically on push to main branch

**Note**: The project includes a `vercel.json` file that automatically configures the build process for Prisma.


## License

MIT License - see LICENSE file for details.
