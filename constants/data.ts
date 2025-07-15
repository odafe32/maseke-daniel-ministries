export interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  image: any;
}

export const onboardingData: OnboardingItem[] = [
  {
    id: "1",
    title: "Manage Your Inventory with Ease",
    description:
      "Track your products, monitor stock levels, and get notifications for low inventory in real-time.",
    image: require("../assets/images/inventory.png"),
  },
  {
    id: "2",
    title: "Seamless Point of Sale (POS) for Your Business",
    description:
      "Process transactions quickly, track sales performance, and manage customer purchases effortlessly.",
    image: require("../assets/images/pos.png"),
  },
  {
    id: "3",
    title: "Secure and Convenient Wallet for Transactions",
    description:
      "Manage all your financial transactions safely and efficiently in one place.",
    image: require("../assets/images/wallet.png"),
  },
];
