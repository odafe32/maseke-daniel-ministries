import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import { Sermons, SermonItem } from '@/src/screens/Home/Sermons/Sermons'
import { useRouter } from 'expo-router'
import { useLiveStatus } from '@/src/hooks/useLiveStatus';
import { useSermonCategories, useSermonTapes } from '@/src/hooks/useSermons';

interface FilterItem {
  type: 'filters';
}

const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return '1 day ago';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInWeeks === 1) {
    return '1 week ago';
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks} weeks ago`;
  } else if (diffInMonths === 1) {
    return '1 month ago';
  } else if (diffInMonths < 12) {
    return `${diffInMonths} months ago`;
  } else if (diffInYears === 1) {
    return '1 year ago';
  } else {
    return `${diffInYears} years ago`;
  }
}

export default function SermonsPage() {
  const router = useRouter();
  const { data: liveStream, refetch: refetchLive } = useLiveStatus();
  const hasLiveService = !!liveStream;
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showStickyFilters, setShowStickyFilters] = useState(false);
  const [filterY, setFilterY] = useState(0);

  const opacity = useRef(new Animated.Value(0)).current;

  // Sermon hooks
  const { categories, loadCategories } = useSermonCategories();
  const { tapes, loadTapes, loadMoreTapes, hasMore: hasMoreTapes, isLoading: isLoadingTapes } = useSermonTapes();

  // Load initial data
  useEffect(() => {
    loadCategories();
    loadTapes();
  }, [loadCategories, loadTapes]);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: showStickyFilters ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showStickyFilters, opacity]);

  // Create dynamic filters from categories
  const dynamicFilters = useMemo(() => {
    const categoryFilters = categories.map(cat => cat.name);
    return ['All', ...categoryFilters];
  }, [categories]);

  const allSermonItems: SermonItem[] = useMemo(() => {
    return tapes.map(tape => ({
      id: tape.id,
      title: tape.title,
      duration: tape.duration ? `${Math.floor(tape.duration / 60)}:${(tape.duration % 60).toString().padStart(2, '0')}` : '0:00',
      timeAgo: tape.sermon_date ? getTimeAgo(tape.sermon_date) : 'Unknown',
      category: tape.series?.category?.name || 'All',
      // Use series thumbnail URL
      thumbnailUrl: tape.series?.thumbnailUrl || tape.thumbnailUrl || 'https://via.placeholder.com/300x200',
      videoUrl: tape.video_stream_url || tape.video_embed_url || '',
      audioUrl: tape.audio_stream_url,
      description: tape.description || '',
      preacher: tape.preacher,
      categoryId: tape.series?.category?.id || '',
      isLiked: tape.is_liked,
      likesCount: tape.likes_count,
      views: tape.views,
    }));
  }, [tapes]);

  const filteredData = useMemo(() => {
    return allSermonItems.filter((item) => {
      const matchesCategory = activeFilter === 'All' || item.category === activeFilter;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allSermonItems, activeFilter, searchQuery]);

  const displayedData = filteredData;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      loadCategories(),
      loadTapes({ refresh: true }),
      refetchLive(),
    ]);
    setRefreshing(false);
  }, [loadCategories, loadTapes, refetchLive]);

  const handleLoadMore = useCallback(() => {
    if (hasMoreTapes) {
      loadMoreTapes();
    }
  }, [hasMoreTapes, loadMoreTapes]);

  const sermonRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < displayedData.length; i += 2) {
      rows.push({ left: displayedData[i], right: displayedData[i + 1] || null });
    }
    return rows;
  }, [displayedData]);

  const data = showStickyFilters ? sermonRows : [{ type: 'filters' } as FilterItem, ...sermonRows];

  const handleScroll = useCallback((event: { nativeEvent: { contentOffset: { y: number } } }) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowStickyFilters(scrollY > filterY + 50);
  }, [filterY]);

  return (
    <Sermons
      data={data}
      activeFilter={activeFilter}
      dropdownOpen={dropdownOpen}
      refreshing={refreshing}
      showStickyFilters={showStickyFilters}
      displayedData={displayedData}
      filteredData={filteredData}
      filters={dynamicFilters}
      onBack={() => router.back()}
      onRefresh={handleRefresh}
      onFilterChange={(filter) => setActiveFilter(filter)}
      onDropdownToggle={() => setDropdownOpen(prev => !prev)}
      onSearchChange={setSearchQuery}
      onLoadMore={handleLoadMore}
      onScroll={handleScroll}
      onFilterYChange={setFilterY}
      hasLiveService={hasLiveService}
      liveStream={liveStream}
      isLoading={isLoadingTapes}
    />
  )
}
