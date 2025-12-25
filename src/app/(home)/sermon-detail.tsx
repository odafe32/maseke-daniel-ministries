import React, { useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SermonDetail } from '@/src/screens/Home/Sermons/SermonDetail'
import { SERMONS_DATA, SermonItem } from '@/src/screens/Home/Sermons/Sermons'
import { View, Modal, TouchableOpacity, Text, Alert, Clipboard, ToastAndroid, Platform, StyleSheet } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { hp, wp } from '@/src/utils'
import * as Linking from 'expo-linking'

export default function SermonDetailPage() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const [refreshing, setRefreshing] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  const sermon = SERMONS_DATA.find((s: SermonItem) => s.id === id)

  if (!sermon) {
    router.back()
    return null
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      // Custom refresh logic here
    } finally {
      setRefreshing(false)
    }
  }

  const handleShare = () => {
    setShowShareModal(true)
  }

  const handleWhatsAppShare = async () => {
    const message = `Check out this sermon: ${sermon.title || 'Amazing Sermon'}\n\n${sermon.description || 'Listen to this inspiring message'}\n\nWatch here: ${Linking.createURL('/sermon', { queryParams: { id: sermon.id } })}`
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`
    
    try {
      await Linking.openURL(whatsappUrl)
    } catch (error) {
      Alert.alert('Error', 'WhatsApp is not installed on your device')
    }
    setShowShareModal(false)
  }

  const handleCopyLink = async () => {
    const link = Linking.createURL('/sermon', { queryParams: { id: sermon.id } })
    Clipboard.setString(link)

    if (Platform.OS === 'android') {
      ToastAndroid.show('Link copied to clipboard!', ToastAndroid.SHORT)
    } else {
      // For iOS, show a brief alert that acts like a toast
      Alert.alert('', 'Link copied to clipboard!', [{ text: 'OK', style: 'default' }], { cancelable: true })
    }

    setShowShareModal(false)
  }

  return (
    <View style={{ flex: 1 }}>
      <SermonDetail 
        sermon={sermon} 
        onClose={() => router.back()} 
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onShare={handleShare}
      />
      
      <Modal visible={showShareModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowShareModal(false)}
        >
          <View style={styles.shareModal}>
            <Text style={styles.shareModalTitle}>Share Sermon</Text>
            <TouchableOpacity style={styles.shareOption} onPress={handleWhatsAppShare}>
              <Feather name="message-circle" size={24} color="#25D366" />
              <Text style={styles.shareOptionText}>Share on WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareOption} onPress={handleCopyLink}>
              <Feather name="link" size={24} color="#4F6BFF" />
              <Text style={styles.shareOptionText}>Copy Link</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowShareModal(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  shareModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: wp(20),
    borderTopRightRadius: wp(20),
    padding: wp(20),
    paddingBottom: hp(40),
  },
  shareModalTitle: {
    fontSize: 18,
    fontFamily: 'Geist-Bold',
    color: '#0C154C',
    textAlign: 'center',
    marginBottom: hp(20),
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(15),
    paddingHorizontal: wp(10),
    borderRadius: wp(12),
    backgroundColor: '#F7F8FC',
    marginBottom: hp(10),
    gap: wp(15),
  },
  shareOptionText: {
    fontSize: 16,
    fontFamily: 'Geist-Medium',
    color: '#38445D',
  },
  cancelButton: {
    marginTop: hp(10),
    paddingVertical: hp(12),
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontFamily: 'Geist-Medium',
    color: '#FF3B30',
  },
})
