import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { hp, wp } from '@/src/utils';
import { images } from '@/src/constants/data';
import { LiveStream } from '@/src/api/liveApi';

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
  const displayTitle = liveStream?.title || title;
  const displayDescription = liveStream?.description || description;
  const displayMeta = liveStream ? `Live • ${liveStream.started_at ? new Date(liveStream.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}` : meta;
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
              <TouchableOpacity style={styles.ctaButton} onPress={onActionPress} activeOpacity={0.85}>
                <Text style={styles.ctaText}>{actionLabel}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.meta}>{displayMeta}</Text>
            <Text style={styles.description}>{displayDescription}</Text>
          </View>
        ) : (
          <View style={styles.fallbackBanner}>
            <View style={styles.dotMuted} />
            <Text style={styles.fallbackText}>{offlineMessage}</Text>
          </View>
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
  ctaText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
