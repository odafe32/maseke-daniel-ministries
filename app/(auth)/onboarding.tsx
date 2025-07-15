import { SafeAreaWrapper } from "@/components/SafeAreaWrapper";
import { Button } from "@/components/ui/Button";
import { PaginationDots } from "@/components/ui/PaginationDots";
import { TextLink } from "@/components/ui/TextLink";
import { ThemeText } from "@/components/ui/ThemeText";
import { onboardingData } from "@/constants/data";
import { getColor, hp, wp } from "@/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  View,
  ViewToken,
} from "react-native";

const { width } = Dimensions.get("window");

interface ViewableItemsChanged {
  viewableItems: ViewToken[];
  changed: ViewToken[];
}

const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const colors = getColor();

  const handleViewableItemsChanged = ({
    viewableItems,
  }: ViewableItemsChanged) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const renderItem = ({ item }: { item: (typeof onboardingData)[0] }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.titleContainer}>
          <ThemeText variant="bodySmall" style={styles.welcomeText}>
            Welcome to Oga&apos;bai
          </ThemeText>
          <ThemeText variant="h1">{item.title}</ThemeText>
        </View>
        <View style={styles.imageContainer}>
          <Image
            source={item.image}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </View>
    );
  };

  const markOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  const handleGetStarted = async () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      //   await markOnboardingComplete();
      router.push("/signup");
    }
  };

  const handleLogin = async () => {
    // await markOnboardingComplete();
    router.push("/login");
  };

  return (
    <SafeAreaWrapper>
      <StatusBar style="dark" />
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      <View style={styles.footer}>
        <PaginationDots
          length={onboardingData.length}
          activeIndex={currentIndex}
        />
        <Button
          title={
            currentIndex === onboardingData.length - 1 ? "Get Started" : "Next"
          }
          onPress={handleGetStarted}
        />
        <TextLink text="Have an account? Login" onPress={handleLogin} />
      </View>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    paddingHorizontal: wp(24),
  },
  titleContainer: {
    marginTop: hp(20),
    marginBottom: hp(20),
  },
  welcomeText: {
    color: "#98A2B3",
    marginBottom: hp(8),
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: hp(400),
  },
  footer: {
    paddingHorizontal: wp(24),
    paddingBottom: hp(40),
  },
});

export default OnboardingScreen;
