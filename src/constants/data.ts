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
    link: "/prayer-request",
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
  { id: "notes", label: "Saved notes", icon: "archive", custom: true, link: "/saved-notes" },
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

export type OrderStatus = 'completed' | 'cancelled' | 'processing' | 'available for pickup';

export interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: any;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
}

export const ordersData: Order[] = [
  {
    id: "1",
    orderNumber: "ORD31121",
    date: "2024-11-28",
    status: "available for pickup",
    totalAmount: 120.00,
    items: [
      {
        id: "1",
        title: "King James Bible",
        price: 60.00,
        quantity: 2,
        image: require("../assets/images/wishlist/image-1.jpg"),
      },
      {
        id: "2",
        title: "King James Bible",
        price: 60.00,
        quantity: 2,
        image: require("../assets/images/wishlist/image-1.jpg"),
      },
      {
        id: "3",
        title: "King James Bible",
        price: 60.00,
        quantity: 2,
        image: require("../assets/images/wishlist/image-1.jpg"),
      },
      {
        id: "4",
        title: "King James Bible",
        price: 60.00,
        quantity: 2,
        image: require("../assets/images/wishlist/image-1.jpg"),
      },
      {
        id: "5",
        title: "King James Bible",
        price: 60.00,
        quantity: 2,
        image: require("../assets/images/wishlist/image-1.jpg"),
      },
      {
        id: "6",
        title: "King James Bible",
        price: 60.00,
        quantity: 2,
        image: require("../assets/images/wishlist/image-1.jpg"),
      },
      {
        id: "7",
        title: "King James Bible",
        price: 60.00,
        quantity: 2,
        image: require("../assets/images/wishlist/image-1.jpg"),
      },
      {
        id: "8",
        title: "King James Bible",
        price: 60.00,
        quantity: 2,
        image: require("../assets/images/wishlist/image-1.jpg"),
      },
      {
        id: "9",
        title: "King James Bible",
        price: 60.00,
        quantity: 2,
        image: require("../assets/images/wishlist/image-1.jpg"),
      },
      {
        id: "10",
        title: "King James Bible",
        price: 60.00,
        quantity: 2,
        image: require("../assets/images/wishlist/image-1.jpg"),
      },
    ]
  },
  {
    id: "2", 
    orderNumber: "ORD31122",
    date: "2024-11-27",
    status: "processing",
    totalAmount: 85.00,
    items: [
      {
        id: "2",
        title: "Holy Scriptures",
        price: 85.00,
        quantity: 1,
        image: require("../assets/images/wishlist/image-4.jpg"),
      }
    ]
  },
  {
    id: "3",
    orderNumber: "ORD31123", 
    date: "2024-11-26",
    status: "completed",
    totalAmount: 150.00,
    items: [
      {
        id: "3",
        title: "King James Bible Gray",
        price: 75.00,
        quantity: 2,
        image: require("../assets/images/wishlist/image-2.jpg"),
      }
    ]
  },
  {
    id: "4",
    orderNumber: "ORD31124",
    date: "2024-11-25", 
    status: "cancelled",
    totalAmount: 45.00,
    items: [
      {
        id: "4",
        title: "Study Guide",
        price: 45.00,
        quantity: 1,
        image: require("../assets/images/wishlist/image-3.jpg"),
      }
    ]
  },
  {
    id: "5",
    orderNumber: "ORD31125",
    date: "2024-11-24",
    status: "processing",
    totalAmount: 200.00,
    items: [
      {
        id: "5",
        title: "Complete Bible Set",
        price: 100.00,
        quantity: 2,
        image: require("../assets/images/wishlist/image-1.jpg"),
      }
    ]
  }
];

