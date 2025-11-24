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

export interface VerifyProps {
  code: string;
  isLoading: boolean;
  timer: number;
  onCodeChange: (value: string) => void;
  onCodeComplete: (value: string) => void;
  onVerify: () => void;
  onResend: () => void;
  onBack?: () => void;
  onRefresh: () => void;
}