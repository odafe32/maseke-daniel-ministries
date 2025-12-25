import { BackHeader } from '@/src/components'
import { hp, wp } from '@/src/utils'
import React from 'react'
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SermonsHero } from './SermonsHero'
import { Feather } from '@expo/vector-icons'
import { getColor } from '@/src/utils'
import { useRouter } from 'expo-router'
import { LiveStream } from '@/src/api/liveApi'

export interface SermonItem {
  id: string;
  title: string;
  duration: string;
  timeAgo: string;
  category: 'All' | 'Sunday Service' | 'Weekday Service';
  image: string;
  videoUrl: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  description: string;
}

interface FilterItem {
  type: 'filters';
}

interface SermonRow {
  left: SermonItem;
  right: SermonItem | null;
}

type DataItem = FilterItem | SermonRow;

const filters = ['All', 'Sunday Service', 'Weekday Service'] as const;

export const SERMONS_DATA: SermonItem[] = [
  {
    id: '1',
    title: 'Overtaking The Takers // Day 1',
    duration: '1:02:34',
    timeAgo: '2d ago',
    category: 'Sunday Service',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=60',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description:
      'This sermon guides you through trusting God regardless of the opposition. Discover how to wait with hope and run with endurance.',
  },
  {
    id: '2',
    title: 'Overtaking The Takers // Day 2',
    duration: '1:04:12',
    timeAgo: '2d ago',
    category: 'Weekday Service',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=600&q=60',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    description:
      'Encounter a midweek booster that keeps your faith vibrant. Pastor Daniel unpacks keys for sustaining fire throughout the week.',
  },
  {
    id: '3',
    title: 'Overtaking The Takers // Day 3',
    duration: '59:18',
    timeAgo: '3d ago',
    category: 'Sunday Service',
    image: 'https://images.unsplash.com/photo-1507878866276-a947ef722fee?auto=format&fit=crop&w=600&q=60',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: 'Day 3 focuses on practical obedience. Learn how to align every area with the Word and see accelerated breakthroughs.',
  },
  {
    id: '4',
    title: 'Overtaking The Takers // Day 4',
    duration: '1:05:47',
    timeAgo: '3d ago',
    category: 'Weekday Service',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=60',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    description:
      'Continue the prophetic journey with impartations for divine speed. Testimonies and teachings that reposition you for success.',
  },
  {
    id: '5',
    title: 'Youth Revival Nights',
    duration: '48:29',
    timeAgo: '4d ago',
    category: 'All',
    image: 'https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?auto=format&fit=crop&w=600&q=60',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description:
      'Youth Revival Nights capture the hunger of the next generation. Worship, word, and declarations that stir revival.',
  },
  {
    id: '6',
    title: 'Midweek Encounter',
    duration: '55:06',
    timeAgo: '5d ago',
    category: 'Weekday Service',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=60',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    description:
      'Midweek Encounter delivers fresh strength for your journey. Receive prophetic direction and practical counsel.',
  },
];

interface SermonsProps {
  data: DataItem[];
  activeFilter: string;
  dropdownOpen: boolean;
  searchQuery: string;
  refreshing: boolean;
  showStickyFilters: boolean;
  displayedData: SermonItem[];
  filteredData: SermonItem[];
  onBack: () => void;
  onRefresh: () => Promise<void>;
  onFilterChange: (filter: string) => void;
  onDropdownToggle: () => void;
  onSearchChange: (query: string) => void;
  onLoadMore: () => void;
  onScroll?: (event: { nativeEvent: { contentOffset: { y: number } } }) => void;
  onFilterYChange?: (y: number) => void;
  liveStream?: LiveStream | null;
  hasLiveService?: boolean;
}

export const Sermons = ({
  data,
  activeFilter,
  dropdownOpen,
  searchQuery,
  refreshing,
  showStickyFilters,
  displayedData,
  filteredData,
  onBack,
  onRefresh,
  onFilterChange,
  onDropdownToggle,
  onSearchChange,
  onLoadMore,
  onScroll,
  onFilterYChange,
  liveStream,
  hasLiveService = false,
}: SermonsProps) => {
  const router = useRouter();

  const renderFilters = () => (
    <View style={styles.categoryRow}>
      <TouchableOpacity
        style={[styles.categorySelector, dropdownOpen && styles.categorySelectorActive]}
        onPress={onDropdownToggle}
        activeOpacity={0.85}
      >
        <View>
          <Text style={styles.selectorLabel}>Category</Text>
          <Text style={styles.selectorValue}>{activeFilter}</Text>
        </View>
        <Feather name={dropdownOpen ? 'chevron-up' : 'chevron-down'} size={16} color="#1F2A44" />
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchRow}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Feather name="search" size={16} color="rgba(22,33,57,0.45)" style={styles.searchIconInput} />
          <TextInput
            placeholder="Search sermons"
            placeholderTextColor="rgba(22,33,57,0.45)"
            style={styles.searchField}
            value={searchQuery}
            onChangeText={onSearchChange}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.searchButton} activeOpacity={0.8}>
          <Feather name="search" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: DataItem }) => {
    if ('type' in item && item.type === 'filters') {
      // Filters
      return (
        <View
          style={styles.filtersContainer}
          onLayout={(event) => onFilterYChange?.(event.nativeEvent.layout.y)}
        >
          {renderFilters()}
          {dropdownOpen && (
            <View style={styles.dropdown}>
              {filters.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <TouchableOpacity
                    key={filter}
                    style={[styles.dropdownItem, isActive && styles.dropdownItemActive]}
                    onPress={() => {
                      onFilterChange(filter);
                      onDropdownToggle();
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.dropdownLabel, isActive && styles.dropdownLabelActive]}>{filter}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          {renderSearchBar()}
        </View>
      );
    } else {
      // Sermon row
      const row = item as SermonRow;
      return (
        <View style={row.right ? styles.rowGap : styles.rowGapSingle}>
          <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => router.push(`/sermon-detail?id=${row.left.id}`)}>
            <Image source={{ uri: row.left.image }} style={styles.cardImage} />
            <Text style={styles.cardTitle} numberOfLines={2}>
              {row.left.title}
            </Text>
            <View style={styles.cardMetaRow}>
              <Text style={styles.cardMeta}>{row.left.duration}</Text>
              <View style={styles.dot} />
              <Text style={styles.cardMeta}>{row.left.timeAgo}</Text>
            </View>
          </TouchableOpacity>
          {row.right && (
            <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => router.push(`/sermon-detail?id=${row.right!.id}`)}>
              <Image source={{ uri: row.right.image }} style={styles.cardImage} />
              <Text style={styles.cardTitle} numberOfLines={2}>
                {row.right.title}
              </Text>
              <View style={styles.cardMetaRow}>
                <Text style={styles.cardMeta}>{row.right.duration}</Text>
                <View style={styles.dot} />
                <Text style={styles.cardMeta}>{row.right.timeAgo}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => index === 0 ? 'filters' : `row-${index}`}
        numColumns={1}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <>
            <BackHeader title="Sermons" onBackPress={onBack} />
          <SermonsHero
            hasLiveService={hasLiveService}
            liveStream={liveStream}
            onActionPress={() => router.push('/live')}
            offlineMessage="No live sermon available"
          />
          </>
        }
        ListFooterComponent={
          displayedData.length < filteredData.length ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={onLoadMore}
              activeOpacity={0.8}
            >
              <Text style={styles.loadMoreText}>Load More</Text>
            </TouchableOpacity>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[getColor().primary]}
            tintColor={getColor().primary}
            progressBackgroundColor={getColor().card}
          />
        }
      />
      {showStickyFilters && (
        <View style={styles.stickyFiltersContainer}>
          {renderFilters()}
          {dropdownOpen && (
            <View style={styles.dropdown}>
              {filters.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <TouchableOpacity
                    key={filter}
                    style={[styles.dropdownItem, isActive && styles.dropdownItemActive]}
                    onPress={() => {
                      onFilterChange(filter);
                      onDropdownToggle();
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.dropdownLabel, isActive && styles.dropdownLabelActive]}>{filter}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          {renderSearchBar()}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: wp(12),
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
    width: '48%',
    paddingHorizontal: wp(18),
    paddingVertical: hp(12),
    borderRadius: wp(20),
    borderWidth: 1,
    borderColor: 'rgba(46, 55, 77, 0.2)',
    backgroundColor: '#FBFBFD',
  },
  categorySelectorActive: {
    borderColor: '#4F6BFF',
    shadowColor: '#8FA6FF',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 4,
  },
  selectorLabel: {
    fontSize: 11,
    fontFamily: 'Geist-SemiBold',
    textTransform: 'uppercase',
    color: 'rgba(23,34,58,0.6)',
    letterSpacing: 0.8,
  },
  selectorValue: {
    fontSize: 16,
    fontFamily: 'Geist-Bold',
    color: '#151F36',
  },
  dropdown: {
    marginTop: hp(8),
    paddingVertical: hp(6),
    borderRadius: wp(18),
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(14,23,45,0.08)',
    shadowColor: '#0A1B44',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 14,
    elevation: 5,
  },
  dropdownItem: {
    paddingHorizontal: wp(20),
    paddingVertical: hp(10),
  },
  dropdownItemActive: {
    backgroundColor: '#E7EDFF',
  },
  dropdownLabel: {
    fontSize: 14,
    fontFamily: 'Geist-Medium',
    color: '#1F2A44',
  },
  dropdownLabelActive: {
    color: '#1E4DFF',
  },
  searchRow: {
    marginTop: hp(12),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: wp(18),
    borderWidth: 1,
    borderColor: 'rgba(21,31,54,0.12)',
    backgroundColor: '#fff',
    paddingHorizontal: wp(14),
    paddingVertical: hp(8),
  },
  searchIconInput: {
    marginRight: wp(8),
  },
  searchField: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Geist-Regular',
    color: '#151F36',
  },
  searchButton: {
    paddingHorizontal: wp(16),
    paddingVertical: hp(10),
    borderRadius: wp(18),
    backgroundColor: '#4F6BFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F6BFF',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  filtersContainer: {
    width: '100%',
    paddingHorizontal: hp(16),
    paddingTop: hp(16),
    gap: hp(16),
  },
  stickyFiltersContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: hp(16),
    paddingTop: hp(16),
    paddingBottom: hp(8),
    gap: hp(16),
    zIndex: 10,
    shadowColor: '#0A1B44',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 14,
    elevation: 5,
  },
  card: {
    width: wp(180),
    backgroundColor: '#fff',
    borderRadius: wp(10),
    borderWidth: 1,
    borderColor: 'rgba(11,22,43,0.06)',
    paddingBottom: hp(12),
    overflow: 'hidden',
    shadowColor: '#0A1B44',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: hp(108),
  },
  cardTitle: {
    paddingHorizontal: wp(14),
    marginTop: hp(10),
    fontSize: 13.5,
    fontFamily: 'Geist-SemiBold',
    color: '#1C2437',
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(6),
    paddingHorizontal: wp(14),
    marginTop: hp(6),
  },
  cardMeta: {
    fontSize: 12,
    fontFamily: 'Geist-Regular',
    color: 'rgba(28,36,55,0.6)',
  },
  dot: {
    width: wp(4),
    height: wp(4),
    borderRadius: wp(2),
    backgroundColor: 'rgba(28,36,55,0.4)',
  },
  rowGap: {
    flexDirection: 'row',
    gap: wp(12),
    marginBottom: hp(16),
  },
  rowGapSingle: {
    flexDirection: 'row',
    gap: wp(12),
    marginBottom: hp(16),
  },
  listContent: {
    gap: hp(16),
  },
  loadMoreButton: {
    paddingHorizontal: wp(20),
    paddingVertical: hp(12),
    borderRadius: wp(16),
    backgroundColor: '#4F6BFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F6BFF',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
    marginTop: hp(16),
    marginBottom: hp(16),
  },
  loadMoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
})
