import React from 'react';
import { Feather } from '@expo/vector-icons';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { hp, wp } from '@/src/utils';

interface SermonItem {
  id: string;
  title: string;
  duration: string;
  timeAgo: string;
  category: 'All' | 'Sunday Service' | 'Weekday Service';
  thumbnailUrl?: string;
}

const filters = ['All', 'Sunday Service', 'Weekday Service'] as const;

interface SermonsListProps {
  onSeeAllPress?: () => void;
  activeFilter: (typeof filters)[number];
  setActiveFilter: React.Dispatch<React.SetStateAction<(typeof filters)[number]>>;
  dropdownOpen: boolean;
  setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  displayedData: SermonItem[];
  totalItems: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  ref?: React.RefObject<View | null>;
  onLayoutY: (y: number) => void;
  onCardPress?: (id: string) => void;
}

export const SermonsList = ({ onSeeAllPress, activeFilter, setActiveFilter, dropdownOpen, setDropdownOpen, searchQuery, setSearchQuery, displayedData, totalItems, setPage, ref, onLayoutY, onCardPress }: SermonsListProps) => {

  const showFilters = true;

  const renderItem = ({ item }: { item: SermonItem }) => {
    const CardComponent = onCardPress ? TouchableOpacity : View;
    const cardProps = onCardPress ? { onPress: () => onCardPress(item.id), activeOpacity: 0.85 } : {};
    
    return (
      <CardComponent style={styles.card} {...cardProps}>
        <Image source={item.thumbnailUrl ? { uri: item.thumbnailUrl } : require('@/src/assets/images/fallback.png')} style={styles.cardImage} />
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.cardMetaRow}>
          <Text style={styles.cardMeta}>{item.duration}</Text>
          <View style={styles.dot} />
          <Text style={styles.cardMeta}>{item.timeAgo}</Text>
        </View>
      </CardComponent>
    );
  };

  return (
    <View style={styles.container} ref={ref} onLayout={(event) => onLayoutY(event.nativeEvent.layout.y)}>
      {showFilters && (
        <View style={styles.categoryRow}>
          <TouchableOpacity
            style={[styles.categorySelector, dropdownOpen && styles.categorySelectorActive]}
            onPress={() => setDropdownOpen((prev) => !prev)}
            activeOpacity={0.85}
          >
            <View>
              <Text style={styles.selectorLabel}>Category</Text>
              <Text style={styles.selectorValue}>{activeFilter}</Text>
            </View>
            <Feather name={dropdownOpen ? 'chevron-up' : 'chevron-down'} size={16} color="#1F2A44" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onSeeAllPress} hitSlop={hp(8)}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
      )}
      {showFilters && dropdownOpen && (
        <View style={styles.dropdown}>
          {filters.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.dropdownItem, isActive && styles.dropdownItemActive]}
                onPress={() => {
                  setActiveFilter(filter);
                  setDropdownOpen(false);
                }}
                activeOpacity={0.85}
              >
                <Text style={[styles.dropdownLabel, isActive && styles.dropdownLabelActive]}>{filter}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {showFilters && (
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <View style={styles.searchInput}>
              <Feather name="search" size={16} color="rgba(22,33,57,0.45)" style={styles.searchIconInput} />
              <TextInput
                placeholder="Search sermons"
                placeholderTextColor="rgba(22,33,57,0.45)"
                style={styles.searchField}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
            </View>
            <TouchableOpacity style={styles.searchButton} activeOpacity={0.8}>
              <Feather name="search" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={displayedData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={true}
        columnWrapperStyle={styles.rowGap}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={() => { if (displayedData.length < totalItems) setPage((prev) => prev + 1); }}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: hp(16),
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: wp(12),
  },
  categorySelector: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
    width: '48%',
    paddingHorizontal: wp(18),
    paddingVertical: hp(5),
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
    textTransform: 'uppercase',
    color: 'rgba(23,34,58,0.6)',
    letterSpacing: 0.8,
  },
  selectorValue: {
    fontSize: 16,
    fontWeight: '700',
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
    color: '#1F2A44',
    fontWeight: '600',
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
    paddingVertical: hp(4),
  },
  searchIconInput: {
    marginRight: wp(8),
  },
  searchField: {
    flex: 1,
    fontSize: 14,
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
  seeAll: {
    color: '#1E4DFF',
    fontWeight: '600',
    fontSize: 13,
  },
  listContent: {
    gap: hp(16),
  },
  rowGap: {
    gap: wp(12),
    marginBottom: hp(16),
  },
  card: {
    flex: 1,
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
    fontWeight: '700',
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
    color: 'rgba(28,36,55,0.6)',
  },
  dot: {
    width: wp(4),
    height: wp(4),
    borderRadius: wp(2),
    backgroundColor: 'rgba(28,36,55,0.4)',
  },
});
