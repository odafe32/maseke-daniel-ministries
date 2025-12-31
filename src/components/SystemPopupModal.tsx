import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Share,
  ImageBackground,
} from 'react-native';
import { Icon } from './icons/Icon';
import { SystemPopup } from '../api/systemPopupApi';
import { API_URL } from '../env';

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
  const [imageAspectRatio, setImageAspectRatio] = useState<number>(1);

  if (!popup) return null;

  const getImageUrl = (imagePath: string) => {
    // If the image path already includes the full URL, return it as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // Otherwise, construct the full URL
    return `${API_URL.replace('/api', '')}/storage/${imagePath}`;
  };

  const handleImageLoad = (event: any) => {
    const { width: imgWidth, height: imgHeight } = event.nativeEvent.source;
    if (imgWidth && imgHeight) {
      setImageAspectRatio(imgHeight / imgWidth);
    }
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

  // Render image popup with image as background
  if (popup.type === 'image' && popup.image) {
    const modalWidth = width - 40;
    const calculatedHeight = modalWidth * imageAspectRatio;
    // Ensure minimum height to accommodate button (at least 350px)
    const imageHeight = Math.max(calculatedHeight || 400, 350);

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={[styles.imageModalContainer, { width: modalWidth }]}>
            <ImageBackground
              source={{ uri: getImageUrl(popup.image) }}
              style={[styles.imageBackground, { height: imageHeight }]}
              resizeMode="cover"
              onLoad={handleImageLoad}
            >
              {/* Button at the bottom */}
              <View style={styles.imageButtonContainer}>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.imageButtonText}>{popup.action_button_title}</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>
        </View>
      </Modal>
    );
  }

  // Render text popup
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
    padding: 20,
  },
  modalContainer: {
    width: width - 40,
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  contentContainer: {
    padding: 24,
  },
  scrollContent: {
    paddingBottom: 8,
    minHeight: 100,
    maxHeight: 400,
  },
  yearBadge: {
    alignSelf: 'center',
    backgroundColor: '#0C154C',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  yearText: {
    fontFamily: 'Geist-SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  title: {
    fontFamily: 'Geist-Bold',
    fontSize: 20,
    color: '#0C154C',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },
  quoteIconContainer: {
    alignSelf: 'center',
    marginVertical: 12,
  },
  text: {
    fontFamily: 'Geist-Regular',
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  imageModalContainer: {
    maxWidth: 400,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  imageBackground: {
    width: '100%',
    minHeight: 300,
    justifyContent: 'flex-end',
  },
  imageButtonContainer: {
    padding: 24,
    paddingBottom: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  imageButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  imageButtonText: {
    fontFamily: 'Geist-SemiBold',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  decorativeLine: {
    width: 80,
    height: 4,
    backgroundColor: '#0C154C',
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 12,
  },
  button: {
    backgroundColor: '#0C154C',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#0C154C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontFamily: 'Geist-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  shareButton: {
    paddingVertical: 12,
    marginTop: 8,
  },
  shareText: {
    fontFamily: 'Geist-Medium',
    fontSize: 14,
    color: '#4A72D4',
    textAlign: 'center',
    textDecorationLine: "underline"
  },
});

export default SystemPopupModal;
