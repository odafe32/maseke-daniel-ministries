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

export interface ProfileProps {
  avatar: string;
  name: string;
  email: string;
  actions: ProfileAction[];
  onBack: () => void;
  onActionPress: (link: string) => void;
}

export interface HomeProps {
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onCardPress: (link: string) => void;
  onProfilePress: () => void;
  quickActions: QuickAction[];
}
