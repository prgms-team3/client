import LoginForm from './login-form';

export default function LoginPage() {
  const apiBaseUrl = process.env.API_BASE_URL!;
  return <LoginForm apiBaseUrl={apiBaseUrl} />;
}
