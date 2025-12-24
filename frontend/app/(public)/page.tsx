'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { InfoCard } from '@/components/InfoCard';
import { Calendar, Heart, Vote, Users, BookOpen, Trophy, AlertCircle, GraduationCap, CreditCard, Book } from 'lucide-react';
import api from '@/lib/axios';
import { Announcement } from '@/types';
import { cn } from '@/lib/utils';
import { HeroCarousel } from '@/components/home/HeroCarousel';

export default function Home() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data } = await api.get<Announcement[]>('/announcements/');
        setAnnouncements(data.slice(0, 5)); // Show top 5
      } catch (err) {
        console.error('Error fetching announcements:', err);
      }
    };

    fetchAnnouncements();
  }, []);

  // Auto-rotate announcements
  useEffect(() => {
    if (announcements.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [announcements.length]);

  return (
    <div className="flex flex-col">

      {/* Hero Section with Carousel */}
      <HeroCarousel />

      {/* About Section */}
      <section id="about" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">About DASA</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our mission, values, and commitment to serving the Dagomba student community at KNUST
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoCard
              icon={Users}
              title="Our Mission"
              description="To foster unity among Dagomba students at KNUST, promote our rich cultural heritage, and support academic excellence through collaborative programs and initiatives."
            />
            <InfoCard
              icon={BookOpen}
              title="Our History"
              description="Established decades ago, DASA has been a cornerstone of student life at KNUST, bringing together Dagomba students from across the Northern Region and beyond."
            />
            <InfoCard
              icon={Trophy}
              title="Our Vision"
              description="To be the leading cultural student association at KNUST, empowering members to excel academically while preserving and celebrating Dagomba traditions."
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Offer</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore the various services and opportunities available to DASA members
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Events Card */}
            <div className="group relative overflow-hidden rounded-lg border bg-card p-6 hover:shadow-lg transition-all">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Calendar className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Events</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Stay updated with cultural celebrations, academic seminars, and social gatherings.
              </p>
              <Link href="/events" className="text-primary font-medium hover:underline text-sm">
                View Events →
              </Link>
            </div>

            {/* Academic Library Card */}
            <div className="group relative overflow-hidden rounded-lg border bg-card p-6 hover:shadow-lg transition-all">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <GraduationCap className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Academic Library</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Access past questions, slides, and resources for all levels and courses.
              </p>
              <Link href="/academics" className="text-primary font-medium hover:underline text-sm">
                Browse Resources →
              </Link>
            </div>

            {/* Membership ID Card */}
            <div className="group relative overflow-hidden rounded-lg border bg-card p-6 hover:shadow-lg transition-all">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <CreditCard className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Membership ID</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Your digital pass for DASA events and activities. Always at your fingertips.
              </p>
              <Link href="/id-card" className="text-primary font-medium hover:underline text-sm">
                View ID Card →
              </Link>
            </div>

            {/* Constitution Card */}
            <div className="group relative overflow-hidden rounded-lg border bg-card p-6 hover:shadow-lg transition-all">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Book className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Know Your Rights</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Read the DASA Constitution and understand your rights and responsibilities.
              </p>
              <Link href="/constitution" className="text-primary font-medium hover:underline text-sm">
                Read Constitution →
              </Link>
            </div>

            {/* Welfare Card */}
            <div className="group relative overflow-hidden rounded-lg border bg-card p-6 hover:shadow-lg transition-all">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Heart className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Welfare</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Access support services, mentorship programs, and emergency assistance.
              </p>
              <Link href="/welfare" className="text-primary font-medium hover:underline text-sm">
                Learn More →
              </Link>
            </div>

            {/* Elections Card */}
            <div className="group relative overflow-hidden rounded-lg border bg-card p-6 hover:shadow-lg transition-all">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Vote className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Elections</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Participate in fair and transparent elections. View candidates and cast your vote.
              </p>
              <Link href="/elections" className="text-primary font-medium hover:underline text-sm">
                Go to Elections →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-primary-foreground/90">
            Be part of something bigger. Connect with fellow Dagomba students and make your mark at KNUST.
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="cursor-pointer">
              Register Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
