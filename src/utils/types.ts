export interface QuickAction {
  id: string;
  title: string;
  image: any;
  link: string;
}

export interface ProfileAction {
  id: string;
  label: string;
  icon: string;
  custom?: boolean;
  link?: string;
  badgeCount?: number;
}

export interface EditProfileFormProps {
  avatar: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onAvatarPress: () => void;
  onSave: () => void;
  onDelete: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  isAvatarLoading?: boolean;
}

export interface ProfileProps {
  avatar: string;
  name: string;
  email: string;
  actions: ProfileAction[];
  onBack: () => void;
  onActionPress: (link: string) => void;
  onLogout: () => void;
  onLogoutPress: () => void;
  onLogoutCancel: () => void;
  showLogoutModal: boolean;
  logoutLoading: boolean;
  onEditPress: () => void;
  isEditing: boolean;
  editForm: EditProfileFormProps;
}

export interface HomeProps {
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onCardPress: (link: string) => void;
  onProfilePress: () => void;
  onNotificationPress: () => void;
  notificationCount: number;
  quickActions: QuickAction[];
}

export interface WishlistItem {
  id: string;
  title: string;
  link: string;
  image: any;
  price: number;
  beforePrice?: number | null;
}

export interface WishlistProps {
  wishListData: WishlistItem[];
  onBack: () => void;
  loading?: boolean;
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