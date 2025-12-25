import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import { Sermons, SermonItem, SERMONS_DATA } from '@/src/screens/Home/Sermons/Sermons'
import { useRouter } from 'expo-router'
import { useLiveStatus } from '@/src/hooks/useLiveStatus';

const filters = ['All', 'Sunday Service', 'Weekday Service'] as const;

interface FilterItem {
  type: 'filters';
}

export default function SermonsPage() {
  const router = useRouter();
  const { data: liveStream, refetch: refetchLive } = useLiveStatus();
  const hasLiveService = !!liveStream;
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>('All');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [showStickyFilters, setShowStickyFilters] = useState(false);
  const [filterY, setFilterY] = useState(0);

  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: showStickyFilters ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showStickyFilters, opacity]);

  const itemsPerPage = 6;

  const filteredData = useMemo(() => {
    return SERMONS_DATA.filter((item: SermonItem) => {
      const matchesCategory = activeFilter === 'All' || item.category === activeFilter;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  const displayedData = useMemo(() => {
    return filteredData.slice(0, page * itemsPerPage);
  }, [filteredData, page]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchLive();
    setRefreshing(false);
  };

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
      searchQuery={searchQuery}
      refreshing={refreshing}
      showStickyFilters={showStickyFilters}
      displayedData={displayedData}
      filteredData={filteredData}
      onBack={() => router.back()}
      onRefresh={handleRefresh}
      onFilterChange={(filter) => setActiveFilter(filter as (typeof filters)[number])}
      onDropdownToggle={() => setDropdownOpen(prev => !prev)}
      onSearchChange={setSearchQuery}
      onLoadMore={() => setPage(prev => prev + 1)}
      onScroll={handleScroll}
      onFilterYChange={setFilterY}
      hasLiveService={hasLiveService}
      liveStream={liveStream}
    />
  )
}
