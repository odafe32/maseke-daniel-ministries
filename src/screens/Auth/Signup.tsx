import React from "react";
import { Text, View } from "react-native";
import { AuthWrapper } from "@/src/components";

export const Signup = () => {
  const handleRefresh = async () => {
    // TODO: Implement refresh logic
  };

  return (
    <AuthWrapper onRefresh={handleRefresh}>
      <View>
        <Text>Signup</Text>
      </View>
    </AuthWrapper>
  );
};
