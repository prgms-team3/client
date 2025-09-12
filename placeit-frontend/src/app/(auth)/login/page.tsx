import LoginForm from './login-form';

export default function LoginPage() {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'https://placeit-server-332546556871.asia-northeast1.run.app';

  return <LoginForm apiBaseUrl={apiBaseUrl} />;
}
