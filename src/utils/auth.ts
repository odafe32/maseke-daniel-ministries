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

export interface ForgotPasswordProps {
  email: string;
  emailError?: string;
  isLoading: boolean;
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
  onSignupPress: () => void;
  onBack?: () => void;
  onRefresh: () => void;
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

export interface SignupProps {
  email: string;
  fullName: string;
  emailError?: string;
  fullNameError?: string;
  isLoading: boolean;
  onEmailChange: (value: string) => void;
  onFullNameChange: (value: string) => void;
  onSubmit: () => void;
  onSignupWithGoogle: () => void;
  onLoginPress: () => void;
  onBack?: () => void;
  onRefresh: () => void;
}

export interface CreatePasswordProps {
  password: string;
  confirmPassword: string;
  isLoading: boolean;
  passwordError?: string;
  confirmPasswordError?: string;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onTogglePasswordVisibility: () => void;
  onToggleConfirmVisibility: () => void;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onSubmit: () => void;
  onBack?: () => void;
  onRefresh: () => void;
}