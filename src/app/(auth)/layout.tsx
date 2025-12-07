"use client";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return <main className="light min-h-screen bg-white text-black">{children}</main>;
};

export default AuthLayout;
