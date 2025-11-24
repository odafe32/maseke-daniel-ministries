export interface LoginProps {
  email: string;
  password: string;
  showPassword: boolean;
  emailError?: string;
  passwordError?: string;
  isLoading: boolean;
  loginMethod: 'traditional' | 'email-only';
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onEmailOnlySelect: () => void;
  onTraditionalSelect: () => void;
  onEmailOnlyLogin: () => void;
  onTraditionalLogin: () => void;
  onRefresh: () => void;
  onSignupPress: () => void;
  onForgotPasswordPress: () => void;
}