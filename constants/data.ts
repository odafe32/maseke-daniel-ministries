export interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  image: any;
}

export const images = {
  logo: require("../assets/logo.png"),
  logovector: require("../assets/topvector.png"),
};

export const onboardingData: OnboardingItem[] = [
  {
    id: "1",
    title: "Watch Live Sermons",
    description:
      "Catch up with old devotionals or watch our live sermons from the comfort of your home",
    image: require("../assets/images/one.png"),
  },
  {
    id: "2",
    title: "Privately Share Prayer Requests",
    description:
      "Securely share your requests with Daddy from your device.",
    image: require("../assets/images/two.png"),
  },
  {
    id: "3",
    title: "Join The Community",
    description:
      "Fellowship with the lord and your brothers and sisters from anywhere ",
    image: require("../assets/images/three.png"),
  },
  {
    id: "4",
    title: "Give Privately and Securely",
    description:
      "Fellowship with the lord and your brothers and sisters from anywhere ",
    image: require("../assets/images/four.png"),
  },
];
