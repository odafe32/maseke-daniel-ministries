import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  Share,
} from 'react-native';
import { Icon } from './icons/Icon';
import { SystemPopup } from '../api/systemPopupApi';
import { API_URL } from '../env';
import { fs, hp, wp } from '../utils';

const { width } = Dimensions.get('window');

interface SystemPopupModalProps {
  visible: boolean;
  popup: SystemPopup | null;
  onClose: () => void;
}

const SystemPopupModal: React.FC<SystemPopupModalProps> = ({
  visible,
  popup,
  onClose,
}) => {
  if (!popup) return null;

  const getImageUrl = (imagePath: string) => {
    // If the image path already includes the full URL, return it as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // Otherwise, construct the full URL
    return `${API_URL.replace('/api', '')}/storage/${imagePath}`;
  };

  const handleShare = async () => {
    try {
      if (popup.type === 'text') {
        // For text popups, share the title and text content
        const content = popup.title && popup.text
          ? `${popup.title}\n\n${popup.text}`
          : popup.title || popup.text || '';

        await Share.share({
          message: content,
        });
      } else if (popup.type === 'image' && popup.image) {
        // For image popups, share the image URL
        await Share.share({
          message: popup.title || 'Check out this image',
          url: getImageUrl(popup.image),
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.contentContainer}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {popup.type === 'text' ? (
                <>
                  {/* Year Badge */}
                  <View style={styles.yearBadge}>
                    <Text style={styles.yearText}>{new Date().getFullYear()}</Text>
                  </View>

                  {popup.title && (
                    <Text style={styles.title}>{popup.title}</Text>
                  )}

                  {/* Quote Icon */}
                  {popup.title && popup.text && (
                    <View style={styles.quoteIconContainer}>
                      <Icon name="quote" color="#0C154C" size={24} />
                    </View>
                  )}

                  {popup.text && (
                    <Text style={styles.text}>{popup.text}</Text>
                  )}
                </>
              ) : (
                popup.image && (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: getImageUrl(popup.image) }}
                      style={styles.image}
                      resizeMode="contain"
                    />
                  </View>
                )
              )}
            </ScrollView>

            <View style={styles.decorativeLine} />

            <TouchableOpacity
              style={styles.button}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{popup.action_button_title}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Text style={styles.shareText}>Share with family and friends</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(20),
  },
  modalContainer: {
    width: width - 40,
    maxWidth: wp(400),
    backgroundColor: '#FFFFFF',
    borderRadius: wp(20),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  contentContainer: {
    padding: wp(24),
  },
  scrollContent: {
    paddingBottom: wp(8),
    minHeight: hp(100),
    maxHeight: wp(400),
  },
  yearBadge: {
    alignSelf: 'center',
    backgroundColor: '#0C154C',
    paddingHorizontal: wp(16),
    paddingVertical: wp(6),
    borderRadius: wp(20),
    marginBottom: hp(16),
  },
  yearText: {
    fontFamily: 'Geist-SemiBold',
    fontSize: fs(12),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  title: {
    fontFamily: 'Geist-Bold',
    fontSize: fs(20),
    color: '#0C154C',
    textAlign: 'center',
    marginBottom: hp(12),
    lineHeight: hp(28),
  },
  quoteIconContainer: {
    alignSelf: 'center',
    marginVertical: hp(12),
  },
  text: {
    fontFamily: 'Geist-Regular',
    fontSize: fs(15),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: hp(22),
    marginBottom: hp(8),
  },
  imageContainer: {
    width: '100%',
    minHeight: hp(200),
    maxHeight: hp(350),
    marginBottom: hp(8),
    borderRadius: wp(12),
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  decorativeLine: {
    width: wp(80),
    height: hp(4),
    backgroundColor: '#0C154C',
    borderRadius: wp(10),
    alignSelf: 'center',
    marginTop: hp(12),
  },
  button: {
    backgroundColor: '#0C154C',
    paddingVertical: wp(16),
    paddingHorizontal: wp(24),
    borderRadius: wp(12),
    marginTop: hp(20),
    shadowColor: '#0C154C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontFamily: 'Geist-SemiBold',
    fontSize: fs(16),
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  shareButton: {
    paddingVertical: wp(12),
    marginTop: hp(8),
  },
  shareText: {
    fontFamily: 'Geist-Medium',
    fontSize: fs(14),
    color: '#4A72D4',
    textAlign: 'center',
    textDecorationLine: "underline"
  },
});

export default SystemPopupModal;
