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
}

export interface EditProfileFormProps {
  avatar: string;
  name: string;
  email: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
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
