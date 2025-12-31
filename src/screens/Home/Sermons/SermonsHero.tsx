import React, { useState, useEffect } from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { hp, wp } from '@/src/utils';
import { images } from '@/src/constants/data';
import { LiveStream } from '@/src/api/liveApi';
import { HomeImageSection } from '../HomeImageSection';
import { useAdsStore } from '../../../stores/adsStore';

const HERO_IMAGE = images.HeroSection;

interface SermonsHeroProps {
  title?: string;
  meta?: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  hasLiveService?: boolean;
  offlineMessage?: string;
  liveStream?: LiveStream | null;
}

export const SermonsHero = ({
  title = 'Sunday Service Live',
  meta = 'Service • 24 mins',
  description = 'This live is for reverence',
  actionLabel = 'Watch now',
  hasLiveService = true,
  offlineMessage = 'No live sermon available',
  onActionPress,
  liveStream,
}: SermonsHeroProps) => {
  const { ads, loading: adsLoading } = useAdsStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // ← NEW: Loading state

  const displayTitle = liveStream?.title || title;
  const displayDescription = liveStream?.description || description;
  const displayMeta = liveStream ? `Live • ${liveStream.started_at ? new Date(liveStream.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}` : meta;

  // Carousel logic for offline state
  useEffect(() => {
    if (hasLiveService) return;

    const carouselInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 2);
    }, 10000); 

    return () => clearInterval(carouselInterval);
  }, [hasLiveService]);

  // ← NEW: Handle watch now with loading state
  const handleWatchNow = async () => {
    if (!onActionPress || isLoading) return;
    
    setIsLoading(true);
    try {
      await onActionPress();
    } finally {
      // Reset loading after a short delay to show feedback
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  return (
    <ImageBackground source={HERO_IMAGE} style={styles.hero} imageStyle={styles.heroImage}>
      <View style={styles.overlay}>
        {hasLiveService ? (
          <View style={styles.contentCard}>
            <View style={styles.headerRow}>
              <View style={styles.titleRow}>
                <View style={styles.dot} />
                <Text style={styles.title} numberOfLines={1}>
                  {displayTitle}
                </Text>
              </View>
              {/* ← UPDATED: Button with loading state */}
              <TouchableOpacity 
                style={[styles.ctaButton, isLoading && styles.ctaButtonLoading]} 
                onPress={handleWatchNow} 
                activeOpacity={0.85}
                disabled={isLoading} // ← Disable while loading
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.ctaText}>{actionLabel}</Text>
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.meta}>{displayMeta}</Text>
            <Text style={styles.description}>{displayDescription}</Text>
          </View>
        ) : (
          <>
            {currentSlide === 0 && (
              <View style={styles.adsContainer}>
                <HomeImageSection
                  imageUris={ads.map(ad => ad.image)}
                  durations={ads.map(ad => ad.display_duration * 1000)}
                  loading={adsLoading}
                />
              </View>
            )}
            <View style={styles.fallbackBanner}>
              <View style={styles.dotMuted} />
              <Text style={styles.fallbackText}>{offlineMessage}</Text>
            </View>
          </>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    height: hp(220),
    borderRadius: wp(8),
    overflow: 'hidden',
  },
  heroImage: {
    borderRadius: wp(8),
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  adsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentCard: {
    paddingVertical: hp(12),
    paddingHorizontal: hp(14),
    borderRadius: wp(8),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: wp(16),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    flexShrink: 1,
  },
  dot: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: '#FF3B30',
    marginTop: hp(2),
  },
  meta: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: hp(4),
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
  },
  fallbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: hp(8),
    paddingHorizontal: wp(14),
    borderRadius: wp(8),
    margin: wp(10),
  },
  fallbackText: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '500',
  },
  dotMuted: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: '#B2B8C5',
  },
  ctaButton: {
    paddingHorizontal: wp(20),
    paddingVertical: hp(8),
    borderRadius: wp(5),
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.65)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    minWidth: wp(110),
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ← NEW: Loading state style
  ctaButtonLoading: {
    opacity: 0.7,
  },
  ctaText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});