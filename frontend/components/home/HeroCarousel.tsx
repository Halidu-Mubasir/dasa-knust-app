'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useAuthStore } from '@/store/useAuthStore';

// Image paths (Next.js public folder or static imports)
const heroImages = [
  '/img16.jpg',
  '/img17.jpg',
  '/img18.jpg',
];

export function HeroCarousel() {
  const { isAuthenticated } = useAuthStore();

  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );

  return (
    <section className="relative w-full h-[500px] sm:h-[600px] md:h-[80vh] overflow-hidden">
      {/* Background Carousel */}
      <Carousel
        opts={{ loop: true, align: 'start' }}
        plugins={[plugin.current]}
        className="w-full h-full"
      >
        <CarouselContent className="h-full">
          {heroImages.map((img, index) => (
            <CarouselItem key={index} className="relative w-full h-full">
              <div className="relative w-full h-full">
                <img
                  src={img}
                  alt={`Hero ${index + 1}`}
                  className="w-full h-full object-cover brightness-50"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Arrows - Positioned higher on mobile */}
        <CarouselPrevious className="absolute left-2 sm:left-4 top-[35%] sm:top-1/2 -translate-y-1/2 z-30 bg-transparent border-white text-white hover:bg-white/20 hover:text-white" />
        <CarouselNext className="absolute right-2 sm:right-4 top-[35%] sm:top-1/2 -translate-y-1/2 z-30 bg-transparent border-white text-white hover:bg-white/20 hover:text-white" />
      </Carousel>

      {/* Hero Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-center items-center z-20 text-center -mt-48 top-[45] px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-3 md:mb-6 text-white animate-in fade-in slide-in-from-bottom-4 duration-1000">
          Welcome to DASA KNUST
        </h1>
        <p className="text-base sm:text-xl md:text-2xl mb-5 md:mb-8 max-w-2xl mx-auto text-white/90 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150 px-2">
          Dagomba Student Association - Promoting Unity, Culture, and Academic Excellence
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          {/* Show Login button only when user is not authenticated */}
          {!isAuthenticated && (
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto cursor-pointer"
              >
                Login
              </Button>
            </Link>
          )}
          <Link href="#about">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white hover:text-primary cursor-pointer"
            >
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
