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

export type OrderStatus = 
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'ready_for_pickup'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export interface OrderPayment {
  id: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  amount: number;
  method: string;
  reference: string;
}

export interface OrderPickup {
  id: string;
  pickup_code: string;
  pickup_status: 'pending' | 'available' | 'picked_up' | 'cancelled';
}

export interface OrderShipping {
  id: string;
  status: 'pending' | 'processing' | 'in_transit' | 'delivered' | 'failed';
  tracking_number: string;
  carrier: string;
}
  
export interface OrderItem {
  id: string;
  product: {
    id: string;
    title: string;
    price: number;
    image: string | null;
  } | null;
  quantity: number;
  amount: number;
  subtotal: number;
  image: any;
}

export interface Order {
  id: string;
  status: OrderStatus;
  deliveryType: string;
  totalAmount: number;
  itemsCount: number;
  items: OrderItem[];
  payment: OrderPayment | null;
  pickup: OrderPickup | null;
  shipping: OrderShipping | null;
  createdDate: string;
  updatedDate: string;
}

export const ordersData: Order[] = [
  {
    id: "1",
    status: "ready_for_pickup",
    deliveryType: "pickup",
    totalAmount: 120.00,
    itemsCount: 10,
    items: [
      {
        id: "1",
        product: {
          id: "1",
          title: "King James Bible",
          price: 60.00,
          image: require("../assets/images/wishlist/image-1.jpg"),
        },
        quantity: 2,
        amount: 60.00,
        subtotal: 120.00,
        image: require("../assets/images/wishlist/image-1.jpg"),
      },
      {
        id: "2",
        product: {
          id: "2",
          title: "King James Bible",
          price: 60.00,
          image: require("../assets/images/wishlist/image-1.jpg"),
        },
        quantity: 2,
        amount: 60.00,
        subtotal: 120.00,
        image: require("../assets/images/wishlist/image-1.jpg"),
      },
      {
        id: "3",
        product: {
          id: "3",
          title: "King James Bible",
          price: 60.00,
          image: require("../assets/images/wishlist/image-1.jpg"),
        },
        quantity: 2,
        amount: 60.00,
        subtotal: 120.00,
        image: require("../assets/images/wishlist/image-1.jpg"),
      },
      {
        id: "4",
        product: {
          id: "4",
          title: "King James Bible",
          price: 60.00,
          image: require("../assets/images/wishlist/image-1.jpg"),
        },
        quantity: 2,
        amount: 60.00,
        subtotal: 120.00,
        image: require("../assets/images/wishlist/image-1.jpg"),
      },
      {
        id: "5",
        product: {
          id: "5",
          title: "King James Bible",
          price: 60.00,
          image: require("../assets/images/wishlist/image-1.jpg"),
        },
        quantity: 2,
        amount: 60.00,
        subtotal: 120.00,
        image: require("../assets/images/wishlist/image-1.jpg"),
      },
      {
        id: "6",
        product: {
          id: "6",
          title: "King James Bible",
          price: 60.00,
          image: require("../assets/images/wishlist/image-1.jpg"),
        },
        quantity: 2,
        amount: 60.00,
        subtotal: 120.00,
        image: require("../assets/images/wishlist/image-1.jpg"),
      },
      {
        id: "7",
        product: {
          id: "7",
          title: "King James Bible",
          price: 60.00,
          image: require("../assets/images/wishlist/image-1.jpg"),
        },
        quantity: 2,
        amount: 60.00,
        subtotal: 120.00,
        image: require("../assets/images/wishlist/image-1.jpg"),
      },
      {
        id: "8",
        product: {
          id: "8",
          title: "King James Bible",
          price: 60.00,
          image: require("../assets/images/wishlist/image-1.jpg"),
        },
        quantity: 2,
        amount: 60.00,
        subtotal: 120.00,
        image: require("../assets/images/wishlist/image-1.jpg"),
      },
      {
        id: "9",
        product: {
          id: "9",
          title: "King James Bible",
          price: 60.00,
          image: require("../assets/images/wishlist/image-1.jpg"),
        },
        quantity: 2,
        amount: 60.00,
        subtotal: 120.00,
        image: require("../assets/images/wishlist/image-1.jpg"),
      },
      {
        id: "10",
        product: {
          id: "10",
          title: "King James Bible",
          price: 60.00,
          image: require("../assets/images/wishlist/image-1.jpg"),
        },
        quantity: 2,
        amount: 60.00,
        subtotal: 120.00,
        image: require("../assets/images/wishlist/image-1.jpg"),
      },
    ],
    payment: {
      id: "pay1",
      status: "completed",
      amount: 120.00,
      method: "card",
      reference: "REF123456",
    },
    pickup: {
      id: "pickup1",
      pickup_code: "PICK123",
      pickup_status: "available",
    },
    shipping: null,
    createdDate: "2024-11-28T10:00:00.000Z",
    updatedDate: "2024-11-28T10:00:00.000Z",
  },
  {
    id: "2", 
    status: "processing",
    deliveryType: "shipping",
    totalAmount: 85.00,
    itemsCount: 1,
    items: [
      {
        id: "2",
        product: {
          id: "2",
          title: "Holy Scriptures",
          price: 85.00,
          image: require("../assets/images/wishlist/image-4.jpg"),
        },
        quantity: 1,
        amount: 85.00,
        subtotal: 85.00,
        image: require("../assets/images/wishlist/image-4.jpg"),
      }
    ],
    payment: {
      id: "pay2",
      status: "completed",
      amount: 85.00,
      method: "card",
      reference: "REF123457",
    },
    pickup: null,
    shipping: {
      id: "ship1",
      status: "in_transit",
      tracking_number: "TRACK123456",
      carrier: "DHL",
    },
    createdDate: "2024-11-27T10:00:00.000Z",
    updatedDate: "2024-11-27T10:00:00.000Z",
  },
  {
    id: "3",
    status: "completed",
    deliveryType: "shipping",
    totalAmount: 150.00,
    itemsCount: 2,
    items: [
      {
        id: "3",
        product: {
          id: "3",
          title: "King James Bible Gray",
          price: 75.00,
          image: require("../assets/images/wishlist/image-2.jpg"),
        },
        quantity: 2,
        amount: 75.00,
        subtotal: 150.00,
        image: require("../assets/images/wishlist/image-2.jpg"),
      }
    ],
    payment: {
      id: "pay3",
      status: "completed",
      amount: 150.00,
      method: "card",
      reference: "REF123458",
    },
    pickup: null,
    shipping: {
      id: "ship2",
      status: "delivered",
      tracking_number: "TRACK123457",
      carrier: "FedEx",
    },
    createdDate: "2024-11-26T10:00:00.000Z",
    updatedDate: "2024-11-26T10:00:00.000Z",
  },
  {
    id: "4",
    status: "cancelled",
    deliveryType: "pickup",
    totalAmount: 45.00,
    itemsCount: 1,
    items: [
      {
        id: "4",
        product: {
          id: "4",
          title: "Study Guide",
          price: 45.00,
          image: require("../assets/images/wishlist/image-3.jpg"),
        },
        quantity: 1,
        amount: 45.00,
        subtotal: 45.00,
        image: require("../assets/images/wishlist/image-3.jpg"),
      }
    ],
    payment: {
      id: "pay4",
      status: "refunded",
      amount: 45.00,
      method: "card",
      reference: "REF123459",
    },
    pickup: {
      id: "pickup2",
      pickup_code: "PICK124",
      pickup_status: "cancelled",
    },
    shipping: null,
    createdDate: "2024-11-25T10:00:00.000Z",
    updatedDate: "2024-11-25T10:00:00.000Z",
  },
  {
    id: "5",
    status: "processing",
    deliveryType: "shipping",
    totalAmount: 200.00,
    itemsCount: 2,
    items: [
      {
        id: "5",
        product: {
          id: "5",
          title: "Complete Bible Set",
          price: 100.00,
          image: require("../assets/images/wishlist/image-1.jpg"),
        },
        quantity: 2,
        amount: 100.00,
        subtotal: 200.00,
        image: require("../assets/images/wishlist/image-1.jpg"),
      }
    ],
    payment: {
      id: "pay5",
      status: "completed",
      amount: 200.00,
      method: "card",
      reference: "REF123460",
    },
    pickup: null,
    shipping: {
      id: "ship3",
      status: "processing",
      tracking_number: "TRACK123458",
      carrier: "UPS",
    },
    createdDate: "2024-11-24T10:00:00.000Z",
    updatedDate: "2024-11-24T10:00:00.000Z",
  }
];

export interface PickupStation {
  id: string;
  title: string;
  name: string;
  address: string;
  contact_phone: string;
  open_hours: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  beforePrice?: number | null;
  image: string | null;
  category: string;
  description: string;
  createdDate: string;
  updatedDate: string;
  quantity: number;
  subtotal: number;
  cartAddedDate: string;
}

export const cartItemsData: CartItem[] = [
  {
    id: "uuid-product-1",
    title: "King James Bible - Deluxe Edition",
    price: 25.99,
    beforePrice: 35.99,
    image: "https://example.com/storage/products/image1.jpg",
    category: "Bibles",
    description: "Beautiful leather-bound King James Bible with gold edges and ribbon marker",
    createdDate: "2024-01-15T18:00:00.000Z",
    updatedDate: "2024-11-28T18:00:00.000Z",
    quantity: 2,
    subtotal: 51.98,
    cartAddedDate: "2024-11-28T18:30:00.000Z"
  },
  {
    id: "uuid-product-2", 
    title: "Daily Devotional Journal",
    price: 9.99,
    beforePrice: null,
    image: "https://example.com/storage/products/image2.jpg",
    category: "Journals",
    description: "365-day devotional journal with scripture verses and reflection space",
    createdDate: "2024-01-25T17:00:00.000Z",
    updatedDate: "2024-11-22T17:00:00.000Z",
    quantity: 1,
    subtotal: 9.99,
    cartAddedDate: "2024-11-22T18:15:00.000Z"
  },
  {
    id: "uuid-product-3",
    title: "Children's Bible Stories",
    price: 14.99,
    beforePrice: 19.99,
    image: "https://example.com/storage/products/image3.jpg",
    category: "Children",
    description: "Beautifully illustrated bible stories for children of all ages",
    createdDate: "2024-03-20T18:00:00.000Z",
    updatedDate: "2024-11-26T18:00:00.000Z",
    quantity: 3,
    subtotal: 44.97,
    cartAddedDate: "2024-11-26T18:30:00.000Z"
  },
];

export interface IWishlist {
  id: string;
  title: string;
  price: number;
  beforePrice: number | null;
  image: string | null;
  category: string;
  description: string;
  createdDate: string;
  updatedDate: string;
  isInWishlist: boolean;
  wishlistAddedDate: string;
}