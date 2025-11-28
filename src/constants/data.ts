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

export const avatarUri = "https://i.pravatar.cc/150?img=15";

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
    link: "/prayer-requests",
  },
  {
    id: "giving",
    title: "Giving",
    image: require("../assets/images/giving.jpg"),
    link: "/giving",
  },
  {
    id: "store",
    title: "Visit Store",
    image: require("../assets/images/store.jpg"),
    link: "/store",
  },
];


export const profileActions = [
  { id: "notes", label: "Saved notes", icon: "archive", custom: true, link: "/notes" },
  { id: "orders", label: "My orders", icon: "shopping-bag", link: "/orders" },
  { id: "wishlist", label: "My wishlists", icon: "heart", link: "/wishlists" },
  { id: "help", label: "Help", icon: "life-buoy", link: "/help" },
  { id: "about", label: "About", icon: "info", link: "/about" },
  { id: "privacy", label: "Privacy Policy", icon: "shield", link: "/privacy-policy" },
  { id: "settings", label: "Settings", icon: "settings", link: "/settings" },
];


export const settingsData = [
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Enable or disable app notifications',
    value: true,
  },
  {
    id: 'sermon-alerts',
    title: 'Sermon Alerts',
    description: 'Receive alerts when a live sermon starts',
    value: true,
  },
  {
    id: 'autoplay-sermon',
    title: 'Autoplay Sermon',
    description: 'Automatically play the next sermon in a series',
    value: false,
  },
  {
    id: 'devotional-reminders',
    title: 'Daily Devotional reminders',
    description: 'Get reminders to read the devotional',
    value: true,
  },
  {
    id: 'stay-logged-in',
    title: 'Stay Logged In',
    description: 'Keep your account signed in on this device.',
    value: true,
  },
];

export const wishListData = [
  {
    id: "1",
    title: "King James Bible",
    link: "/",
    image: require("../assets/images/wishlist/image-1.jpg"),
    price: 10.00,
    beforePrice: 15.00,
  },
  {
    id: "2",
    title: "King James Bible Gray",
    link: "/",
    image: require("../assets/images/wishlist/image-2.jpg"),
    price: 8,
    beforePrice: null,
  },
  {
    id: "3",
    title: "King James Bible",
    link: "/",
    image: require("../assets/images/wishlist/image-3.jpg"),
    price: 10.00,
    beforePrice: 15.00,
  },
  {
    id: "4",
    title: "Holy Scriptures",
    link: "/",
    image: require("../assets/images/wishlist/image-4.jpg"),
    price: 8.00,
    beforePrice: null,
  },
];

