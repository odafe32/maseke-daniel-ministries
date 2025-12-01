import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { BibleStorage, BibleData } from '../utils/bibleStorage';
import { bibleApi } from '../api/bibleApi';

interface BibleDownloadProgress {
  current: number;
  total: number;
  bookName: string;
  isComplete: boolean;
}

interface BibleDownloadManagerProps {
  onComplete: () => void;
  onCancel: () => void;
}

// Essential books to download on first launch (most commonly read)
const ESSENTIAL_BOOKS = [1, 40]; // Genesis, Matthew,

export function BibleDownloadManager({ onComplete, onCancel }: BibleDownloadManagerProps) {
  const [progress, setProgress] = useState<BibleDownloadProgress>({
    current: 0,
    total: ESSENTIAL_BOOKS.length, // Only essential books
    bookName: '',
    isComplete: false,
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startDownload = async () => {
    setIsDownloading(true);
    setError(null);

    try {
      // Download testaments first
      setProgress(prev => ({ ...prev, bookName: 'Loading testaments...' }));
      const testaments = await bibleApi.getTestaments();

      if (!testaments) {
        throw new Error('Failed to load testaments');
      }

      // Filter to only essential books
      const essentialBooks: any[] = [];
      const allChapters: Record<string, Record<string, string>> = {};

      // Find essential books from testaments
      for (const testament of testaments) {
        for (const book of testament.books) {
          if (ESSENTIAL_BOOKS.includes(book.id)) {
            essentialBooks.push(book);
          }
        }
      }

      // Download each essential book and its chapters
      for (let i = 0; i < essentialBooks.length; i++) {
        const book = essentialBooks[i];

        setProgress({
          current: i + 1,
          total: essentialBooks.length,
          bookName: book.name,
          isComplete: false,
        });

        // Download all chapters for this book
        const bookChapters: Record<string, string> = {};

        for (let chapterNum = 1; chapterNum <= book.chapters_count; chapterNum++) {
          try {
            const chapterResponse = await bibleApi.getChapter(book.id, chapterNum);

            if (chapterResponse && chapterResponse.body) {
              // Store the formatted chapter content directly
              bookChapters[chapterNum.toString()] = chapterResponse.body;
            }
          } catch (chapterError) {
            console.warn(`Failed to load chapter ${chapterNum} of ${book.name}:`, chapterError);
            // Continue with other chapters
          }
        }

        allChapters[`book_${book.id}`] = bookChapters;
      }

      // Save all data locally
      const bibleData: BibleData = {
        metadata: {
          version: '1.0',
          lastUpdated: new Date().toISOString(),
          totalBooks: essentialBooks.length,
          totalChapters: Object.keys(allChapters).reduce((sum, bookKey) =>
            sum + Object.keys(allChapters[bookKey]).length, 0
          ),
          totalVerses: Object.keys(allChapters).reduce((sum, bookKey) =>
            sum + Object.keys(allChapters[bookKey]).length * 20, 0 // Rough estimate: 20 verses per chapter
          ),
        },
        testaments,
        books: essentialBooks,
        chapters: allChapters,
      };

      await BibleStorage.saveBibleData(bibleData);

      setProgress(prev => ({ ...prev, isComplete: true }));
      setIsDownloading(false);

      // Show success message
      Alert.alert(
        'Essential Books Downloaded',
        `Downloaded ${bibleData.metadata.totalBooks} essential books with ${bibleData.metadata.totalChapters} chapters!\n\nYou can now access the bible offline. Other books will download automatically when you access them.`,
        [{ text: 'OK', onPress: onComplete }]
      );

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
      setIsDownloading(false);
    }
  };

  const handleCancel = () => {
    if (isDownloading) {
      Alert.alert(
        'Cancel Download',
        'Are you sure you want to cancel the download?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes',
            style: 'destructive',
            onPress: () => {
              setIsDownloading(false);
              onCancel();
            }
          }
        ]
      );
    } else {
      onCancel();
    }
  };

  const progressPercentage = Math.round((progress.current / progress.total) * 100);

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.title}>Download Bible Books</Text>
        <Text style={styles.subtitle}>
          For faster offline reading, you can download some frequently accessed books first. All other books will also be available offline automatically as you open them
        </Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {isDownloading && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Downloading: {progress.bookName}
            </Text>
            <Text style={styles.progressNumbers}>
              {progress.current} / {progress.total} essential books
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercentage}%` }
                ]}
              />
            </View>
            <Text style={styles.percentage}>{progressPercentage}%</Text>
            <ActivityIndicator size="small" color="#0C154C" style={styles.spinner} />
          </View>
        )}

        {!isDownloading && !progress.isComplete && (
          <TouchableOpacity style={styles.downloadButton} onPress={startDownload}>
            <Text style={styles.downloadButtonText}>Download Now</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.cancelButton, isDownloading && styles.cancelButtonDisabled]}
          onPress={handleCancel}
          disabled={isDownloading}
        >
          <Text style={[styles.cancelButtonText, isDownloading && styles.cancelButtonTextDisabled]}>
            {isDownloading ? 'Downloading, Please wait...' : 'Cancel'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0C154C',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
    fontSize: 14,
  },
  progressContainer: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C154C',
    marginBottom: 4,
  },
  progressNumbers: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0C154C',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0C154C',
  },
  spinner: {
    marginTop: 12,
  },
  downloadButton: {
    backgroundColor: '#0C154C',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelButtonDisabled: {
    opacity: 0.5,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  cancelButtonTextDisabled: {
    color: '#5b5b5bff',
  },
});
