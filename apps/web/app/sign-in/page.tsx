import { LoginPageContent } from "apps/web/app/login/LoginPageContent";

type SignInPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { error } = await searchParams;

  return <LoginPageContent error={error} />;
}
