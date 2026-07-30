import { LoginPageContent } from "apps/web/app/login/LoginPageContent";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return <LoginPageContent error={error} />;
}
