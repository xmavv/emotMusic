import { Songs } from "@/app/spiderchart/songs";

export default function Layout({ children }: LayoutProps<"/spiderchart">) {
  return (
    <main className="h-screen w-screen grid grid-cols-4">
      <Songs />
      <div className="col-span-3">{children}</div>
    </main>
  );
}
