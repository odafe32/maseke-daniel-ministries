import { ImageSourcePropType } from 'react-native';

export interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
}

export const images = {
  logo: require("../assets/logo.png"),
  logovector: require("../assets/topvector.png"),
  HeroSection: require("../assets/images/sermonhero.jpg"),
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

export const avatarUri = "https://i.ibb.co/sd4F4kcQ/images.png";

export const quickActions = [
  {
    id: "sermons",
    title: "Sermons",
    image: require("../assets/images/sermons.jpg"),
    link: "/sermons",
  },
  {
    id: "devotionals",
    title: "Devotionals",
    image: require("../assets/images/devotionals.jpg"),
    link: "/devotionals",
  },
  {
    id: "bible",
    title: "Bible",
    image: require("../assets/images/bible.jpg"),
    link: "/bible",
  },
  {
    id: "prayer",
    title: "Prayer requests",
    image: require("../assets/images/prayer.jpg"),
    link: "/prayer-request",
  },
  {
    id: "giving",
    title: "Giving",
    image: require("../assets/images/giving.jpg"),
    link: "/give",
  },
  {
    id: "store",
    title: "Visit Store",
    image: require("../assets/images/store.jpg"),
    link: "/store",
  },
];


export const profileActions = [
  { id: "notes", label: "Saved notes", icon: "archive", custom: true, link: "/saved-notes" },
  { id: "orders", label: "My orders", icon: "shopping-bag", link: "/orders" },
  { id: "wishlist", label: "My wishlists", icon: "heart", link: "/wishlists" },
  { id: "prayer-request", label: "Prayer requests", icon: "message-circle", link: "/prayer-request" },
  { id: "store", label: "Visit Store", icon: "shopping-cart", link: "/store" },
  { id: "notifications", label: "Notifications", icon: "bell", badgeCount: 5, link: "/notifications" },
  { id: "change-password", label: "Change Password", icon: "lock", link: "/change-password" },
  { id: "help", label: "Help", icon: "life-buoy", link: "/help" },
  { id: "about", label: "About", icon: "info", link: "/about" },
  { id: "privacy", label: "Privacy Policy", icon: "shield", link: "/privacy-policy" },
  { id: "settings", label: "Settings", icon: "settings", link: "/settings" },
  { id: "logout", label: "Logout", icon: "log-out", link: undefined },
];

export type NoteType = 'devotional' | 'bible';

export interface SavedNote {
  id: string;
  type: NoteType;
  text: string;
  date: string;
}

export const savedNotesData: SavedNote[] = [
  {
    id: '1',
    type: 'devotional',
    text: 'Today\'s devotional reminded me about the importance of patience in our daily walk with God. Sometimes we need to wait for His timing.',
    date: '2024-01-15'
  },
  {
    id: '2',
    type: 'bible',
    text: 'Jeremiah 29:11 - "For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future." This verse gives me so much hope.',
    date: '2024-01-12'
  },
  {
    id: '3',
    type: 'devotional',
    text: 'The message about forgiveness really touched my heart today. I need to let go of past hurts and embrace God\'s grace.',
    date: '2024-01-10'
  },
  {
    id: '4',
    type: 'bible',
    text: 'Proverbs 3:5-6 - Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
    date: '2024-01-08'
  },
  {
    id: '5',
    type: 'devotional',
    text: 'Learning about prayer has changed my perspective. It\'s not just asking, but also listening to God\'s voice.',
    date: '2024-01-05'
  },
  {
    id: '6',
    type: 'bible',
    text: 'Psalm 23:1 - The LORD is my shepherd; I shall not want. A reminder that God provides all we need.',
    date: '2024-01-03'
  },
];
