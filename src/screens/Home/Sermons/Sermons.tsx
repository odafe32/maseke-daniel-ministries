import { BackHeader } from '@/src/components'
import { hp, wp } from '@/src/utils'
import React, { useState, useEffect } from 'react'
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
import { Skeleton } from '@/src/components/Skeleton'
import { useSermonStore } from '@/src/stores/sermonStore'

export interface SermonItem {
  id: string;
  title: string;
  duration: string;
  timeAgo: string;
  category: string; 
  thumbnailUrl: string;
  videoUrl: string;
  audioUrl?: string;
  description: string;
  preacher?: string;
  categoryId: string;
  isLiked?: boolean;
  likesCount?: number;
  views?: number;
}

interface FilterItem {
  type: 'filters';
}

interface SermonRow {
  left: SermonItem;
  right: SermonItem | null;
}

type DataItem = FilterItem | SermonRow;

interface SermonsProps {
  data: DataItem[];
  activeFilter: string;
  dropdownOpen: boolean;
  refreshing: boolean;
  showStickyFilters: boolean;
  displayedData: SermonItem[];
  filteredData: SermonItem[];
  filters?: string[]; // Dynamic filters from API
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
  isLoading?: boolean;
}

export const Sermons = ({
  data,
  activeFilter,
  dropdownOpen,
  refreshing,
  showStickyFilters,
  displayedData,
  filteredData,
  filters = ['All', 'Sunday Service', 'Weekday Service'],
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
  isLoading = false,
}: SermonsProps) => {
  const router = useRouter();
  const [inputSearchQuery, setInputSearchQuery] = useState('');

  const isSermonAvailableOffline = useSermonStore(state => state.isSermonAvailableOffline);

  const skeletonData = Array.from({ length: 6 }, (_, i) => ({ id: i }));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderSkeletonItem = ({ item }: { item: { id: number } }) => (
    <View style={styles.rowGap}>
      <View style={styles.skeletonCard}>
        <Skeleton width="100%" height={hp(108)} borderRadius={wp(10)} />
        <Skeleton height={hp(20)} style={{ marginHorizontal: wp(14), marginTop: hp(10) }} />
        <Skeleton height={hp(15)} style={{ marginHorizontal: wp(14), marginTop: hp(6) }} />
        <Skeleton height={hp(15)} style={{ marginHorizontal: wp(14), marginTop: hp(6) }} />
      </View>
      <View style={styles.skeletonCard}>
        <Skeleton width="100%" height={hp(108)} borderRadius={wp(10)} />
        <Skeleton height={hp(20)} style={{ marginHorizontal: wp(14), marginTop: hp(10) }} />
        <Skeleton height={hp(15)} style={{ marginHorizontal: wp(14), marginTop: hp(6) }} />
        <Skeleton height={hp(15)} style={{ marginHorizontal: wp(14), marginTop: hp(6) }} />
      </View>
    </View>
  );

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
            value={inputSearchQuery}
            onChangeText={setInputSearchQuery}
            returnKeyType="search"
          />
          {inputSearchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setInputSearchQuery('');
                onSearchChange('');
              }}
              style={styles.closeIcon}
              activeOpacity={0.7}
            >
              <Feather name="x" size={16} color="rgba(22,33,57,0.45)" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} activeOpacity={0.8} onPress={() => onSearchChange(inputSearchQuery)}>
          <Feather name="search" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const SermonCard = ({ sermon }: { sermon: SermonItem }) => {
    const [isOffline, setIsOffline] = useState(false);
    
    useEffect(() => {
      const checkOffline = async () => {
        const offline = await isSermonAvailableOffline(sermon.id);
        setIsOffline(offline);
      };
      checkOffline();
    }, [sermon.id]);
    
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => router.push({ pathname: '(home)/sermon-detail', params: { id: sermon.id } })}>
        <View style={styles.cardImageContainer}>
          <Image source={sermon.thumbnailUrl ? { uri: sermon.thumbnailUrl } : require('@/src/assets/images/fallback.png')} style={styles.cardImage} />
          {isOffline && (
            <View style={styles.offlineIndicator}>
              <Feather name="download" size={12} color="#fff" />
            </View>
          )}
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {sermon.title}
        </Text>
        <Text style={styles.cardPreacher} numberOfLines={1}>
          {sermon.preacher}
        </Text>
        <View style={styles.cardMetaRow}>
          <Text style={styles.cardMeta}>{sermon.duration}</Text>
          <View style={styles.dot} />
          <Text style={styles.cardMeta}>{sermon.timeAgo}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const sermonData = data.filter(item => !('type' in item)) as SermonRow[];

  const renderItem = ({ item }: { item: SermonRow }) => {
    const row = item;
    return (
      <View style={row.right ? styles.rowGap : styles.rowGapSingle}>
        <SermonCard sermon={row.left} />
        {row.right && <SermonCard sermon={row.right} />}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <>
          <BackHeader title="Sermons" onBackPress={onBack} />
          <SermonsHero
            hasLiveService={hasLiveService}
            liveStream={liveStream}
            onActionPress={() => router.push('/live')}
            offlineMessage="No live sermon available"
          />
          <View style={styles.filtersContainer}>
            {renderFilters()}
            {renderSearchBar()}
          </View>
          <FlatList
            data={skeletonData}
            renderItem={renderSkeletonItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <>
          <FlatList
           data={sermonData}
  renderItem={renderItem}
  keyExtractor={(item, index) => `row-${index}`}
  numColumns={1}
  contentContainerStyle={styles.listContent}
  showsVerticalScrollIndicator={false}
  onScroll={onScroll}
  scrollEventThrottle={16}
  keyboardShouldPersistTaps="always"
  keyboardDismissMode="on-drag"
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No sermons available</Text>
            <Text style={styles.emptySubtext}>Check back later for new Sermons</Text>
          </View>
        }
        ListHeaderComponent={
          <>
            <BackHeader title="Sermons" onBackPress={onBack} />
            <SermonsHero
              hasLiveService={hasLiveService}
              liveStream={liveStream}
              onActionPress={() => router.push('/live')}
              offlineMessage="No live sermon available"
            />
            <View style={styles.filtersContainer} onLayout={(event) => onFilterYChange?.(event.nativeEvent.layout.y)}>
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
        <View style={styles.stickyFiltersContainer} pointerEvents="box-none">
          {renderSearchBar()}
        </View>
      )}
      </>
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
  closeIcon: {
    marginLeft: wp(8),
  },
  searchButton: {
    paddingHorizontal: wp(16),
    paddingVertical: hp(10),
    borderRadius: wp(18),
    backgroundColor: '#001891ff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#001891ff',
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
  cardImageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: hp(108),
  },
  offlineIndicator: {
    position: 'absolute',
    top: hp(8),
    right: wp(8),
    backgroundColor: '#4CAF50',
    borderRadius: wp(12),
    width: wp(24),
    height: wp(24),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  cardTitle: {
    paddingHorizontal: wp(14),
    marginTop: hp(10),
    fontSize: 13.5,
    fontFamily: 'Geist-SemiBold',
    color: '#1C2437',
  },
  cardPreacher: {
    paddingHorizontal: wp(14),
    marginTop: hp(4),
    fontSize: 12,
    fontFamily: 'Geist-Medium',
    color: '#4F6BFF',
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
  skeletonCard: {
    width: wp(180),
    backgroundColor: '#fff',
    borderRadius: wp(10),
    paddingBottom: hp(12),
    overflow: 'hidden',
    shadowColor: '#0A1B44',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(50),
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Geist-Bold',
    color: '#1C2437',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Geist-Regular',
    color: 'rgba(28,36,55,0.6)',
    textAlign: 'center',
    marginTop: hp(8),
  },
})
