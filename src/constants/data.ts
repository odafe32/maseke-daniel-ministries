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
}

export interface OrderPayment {
  id: string;
  status: string;
  amount: number;
  method: string;
  reference: string | null;
}

export interface OrderPickup {
  id: string;
  pickup_code: string | null;
  pickup_status: string | null;
}

export interface OrderShipping {
  id: string;
  status: string | null;
  tracking_number: string | null;
  carrier: string | null;
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
    status: "available for pickup",
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

export interface StoreProduct {
  id: string;
  title: string;
  price: number;
  beforePrice?: number | null;
  image: string | null;
  category: string;
  description: string;
  stockCount: number;
  createdDate: string;
  updatedDate: string;
  isInWishlist: boolean;
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

export const storeProducts: StoreProduct[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    title: "King James Bible - Deluxe Edition",
    price: 25.99,
    beforePrice: 35.99,
    image: require("../assets/images/wishlist/image-1.jpg"),
    category: "Bibles",
    description: "Beautiful leather-bound King James Bible with gold edges and ribbon marker",
    stockCount: 45,
    createdDate: "2024-01-15",
    updatedDate: "2024-11-28",
    isInWishlist: false
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    title: "Holy Scriptures with Commentary",
    price: 18.99,
    beforePrice: null,
    image: require("../assets/images/wishlist/image-4.jpg"),
    category: "Bibles",
    description: "Complete Holy Scriptures with detailed commentary and study notes",
    stockCount: 32,
    createdDate: "2024-02-20",
    updatedDate: "2024-11-25",
    isInWishlist: true
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    title: "Study Guide for New Testament",
    price: 12.99,
    beforePrice: 19.99,
    image: require("../assets/images/wishlist/image-3.jpg"),
    category: "Study Guides",
    description: "Comprehensive study guide for the New Testament with questions and answers",
    stockCount: 67,
    createdDate: "2024-03-10",
    updatedDate: "2024-11-20",
    isInWishlist: false
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    title: "Daily Devotional Journal",
    price: 9.99,
    beforePrice: null,
    image: require("../assets/images/wishlist/image-2.jpg"),
    category: "Journals",
    description: "365-day devotional journal with scripture verses and reflection space",
    stockCount: 89,
    createdDate: "2024-01-25",
    updatedDate: "2024-11-22",
    isInWishlist: true
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    title: "Prayer Book Collection",
    price: 15.99,
    beforePrice: 22.99,
    image: require("../assets/images/wishlist/image-1.jpg"),
    category: "Prayer Books",
    description: "Collection of powerful prayers for different occasions and needs",
    stockCount: 28,
    createdDate: "2024-04-05",
    updatedDate: "2024-11-18",
    isInWishlist: false
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    title: "Bible Atlas and Maps",
    price: 29.99,
    beforePrice: null,
    image: require("../assets/images/wishlist/image-4.jpg"),
    category: "Reference",
    description: "Detailed bible maps and historical atlas for better understanding",
    stockCount: 15,
    createdDate: "2024-02-15",
    updatedDate: "2024-11-15",
    isInWishlist: false
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    title: "Children's Bible Stories",
    price: 14.99,
    beforePrice: 19.99,
    image: require("../assets/images/wishlist/image-3.jpg"),
    category: "Children",
    description: "Beautifully illustrated bible stories for children of all ages",
    stockCount: 94,
    createdDate: "2024-03-20",
    updatedDate: "2024-11-26",
    isInWishlist: true
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440008",
    title: "Worship Music Collection",
    price: 19.99,
    beforePrice: null,
    image: require("../assets/images/wishlist/image-2.jpg"),
    category: "Music",
    description: "Collection of uplifting worship songs and hymns",
    stockCount: 56,
    createdDate: "2024-05-12",
    updatedDate: "2024-11-19",
    isInWishlist: false
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440009",
    title: "Bible Cover - Premium Leather",
    price: 22.99,
    beforePrice: 32.99,
    image: require("../assets/images/wishlist/image-1.jpg"),
    category: "Accessories",
    description: "Handcrafted leather bible cover with zipper and pen holder",
    stockCount: 38,
    createdDate: "2024-06-08",
    updatedDate: "2024-11-21",
    isInWishlist: false
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    title: "Theology Textbook",
    price: 34.99,
    beforePrice: null,
    image: require("../assets/images/wishlist/image-4.jpg"),
    category: "Study Guides",
    description: "Comprehensive theology textbook for students and scholars",
    stockCount: 12,
    createdDate: "2024-04-18",
    updatedDate: "2024-11-17",
    isInWishlist: true
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440011",
    title: "Christian Living Guide",
    price: 16.99,
    beforePrice: 24.99,
    image: require("../assets/images/wishlist/image-3.jpg"),
    category: "Christian Living",
    description: "Practical guide to applying biblical principles in daily life",
    stockCount: 73,
    createdDate: "2024-03-15",
    updatedDate: "2024-11-23",
    isInWishlist: false
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440012",
    title: "Bible Study Software",
    price: 39.99,
    beforePrice: null,
    image: require("../assets/images/wishlist/image-2.jpg"),
    category: "Digital",
    description: "Advanced bible study software with multiple translations and tools",
    stockCount: 8,
    createdDate: "2024-07-22",
    updatedDate: "2024-11-16",
    isInWishlist: true
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440013",
    title: "Missionary Stories Collection",
    price: 13.99,
    beforePrice: 18.99,
    image: require("../assets/images/wishlist/image-1.jpg"),
    category: "Inspiration",
    description: "Inspiring stories of missionaries and their work around the world",
    stockCount: 41,
    createdDate: "2024-05-30",
    updatedDate: "2024-11-14",
    isInWishlist: false
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440014",
    title: "Church History Book",
    price: 27.99,
    beforePrice: null,
    image: require("../assets/images/wishlist/image-4.jpg"),
    category: "Reference",
    description: "Comprehensive history of the Christian church from ancient times",
    stockCount: 19,
    createdDate: "2024-04-12",
    updatedDate: "2024-11-13",
    isInWishlist: false
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440015",
    title: "Bible Promise Cards",
    price: 7.99,
    beforePrice: 12.99,
    image: require("../assets/images/wishlist/image-3.jpg"),
    category: "Gift Items",
    description: "Set of 50 beautifully designed bible promise cards for encouragement",
    stockCount: 156,
    createdDate: "2024-08-14",
    updatedDate: "2024-11-27",
    isInWishlist: true
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440016",
    title: "Marriage and Family Guide",
    price: 18.99,
    beforePrice: null,
    image: require("../assets/images/wishlist/image-2.jpg"),
    category: "Christian Living",
    description: "Biblical principles for building strong marriages and families",
    stockCount: 52,
    createdDate: "2024-06-25",
    updatedDate: "2024-11-24",
    isInWishlist: false
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440017",
    title: "Youth Ministry Handbook",
    price: 21.99,
    beforePrice: 29.99,
    image: require("../assets/images/wishlist/image-1.jpg"),
    category: "Ministry",
    description: "Complete handbook for youth ministry leaders and volunteers",
    stockCount: 24,
    createdDate: "2024-09-10",
    updatedDate: "2024-11-20",
    isInWishlist: true
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440018",
    title: "Bible Prophecy Study",
    price: 23.99,
    beforePrice: null,
    image: require("../assets/images/wishlist/image-4.jpg"),
    category: "Study Guides",
    description: "In-depth study of biblical prophecy and end times",
    stockCount: 33,
    createdDate: "2024-07-08",
    updatedDate: "2024-11-12",
    isInWishlist: false
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440019",
    title: "Christian Fiction Novel",
    price: 11.99,
    beforePrice: 16.99,
    image: require("../assets/images/wishlist/image-3.jpg"),
    category: "Fiction",
    description: "Inspirational Christian fiction novel with powerful message",
    stockCount: 87,
    createdDate: "2024-10-05",
    updatedDate: "2024-11-25",
    isInWishlist: false
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440020",
    title: "Discipleship Training Manual",
    price: 26.99,
    beforePrice: null,
    image: require("../assets/images/wishlist/image-2.jpg"),
    category: "Discipleship",
    description: "Complete manual for training new disciples and church leaders",
    stockCount: 21,
    createdDate: "2024-08-20",
    updatedDate: "2024-11-18",
    isInWishlist: true
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440021",
    title: "Bible Dictionary",
    price: 31.99,
    beforePrice: 42.99,
    image: require("../assets/images/wishlist/image-1.jpg"),
    category: "Reference",
    description: "Comprehensive bible dictionary with detailed explanations",
    stockCount: 16,
    createdDate: "2024-05-18",
    updatedDate: "2024-11-19",
    isInWishlist: false
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440022",
    title: "Worship Leader Guide",
    price: 19.99,
    beforePrice: null,
    image: require("../assets/images/wishlist/image-4.jpg"),
    category: "Worship",
    description: "Complete guide for worship leaders and music ministers",
    stockCount: 35,
    createdDate: "2024-09-28",
    updatedDate: "2024-11-21",
    isInWishlist: true
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440023",
    title: "Christian Parenting Book",
    price: 14.99,
    beforePrice: 21.99,
    image: require("../assets/images/wishlist/image-3.jpg"),
    category: "Christian Living",
    description: "Biblical principles for effective Christian parenting",
    stockCount: 64,
    createdDate: "2024-07-15",
    updatedDate: "2024-11-22",
    isInWishlist: false
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440024",
    title: "Bible Concordance",
    price: 28.99,
    beforePrice: null,
    image: require("../assets/images/wishlist/image-2.jpg"),
    category: "Reference",
    description: "Complete bible concordance for easy scripture finding",
    stockCount: 29,
    createdDate: "2024-06-30",
    updatedDate: "2024-11-17",
    isInWishlist: false
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440025",
    title: "Spiritual Warfare Guide",
    price: 17.99,
    beforePrice: 25.99,
    image: require("../assets/images/wishlist/image-1.jpg"),
    category: "Spiritual Growth",
    description: "Understanding spiritual warfare and standing firm in faith",
    stockCount: 48,
    createdDate: "2024-08-05",
    updatedDate: "2024-11-11",
    isInWishlist: false
  },
];