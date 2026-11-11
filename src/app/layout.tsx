import { Footer } from "@/components/common/Footer";
import { Navbar } from "@/components/common/Navbar";
import { PageTitleUpdater } from "@/components/common/PageTitleUpdater";
import { VisitorTracker } from "@/components/common/VisitorTracker";
import { AppSplashLoader } from "@/components/common/AppSplashLoader";
import { AuthProvider } from "@/context/AuthContext";
import { QueryProvider } from "@/providers/QueryProvider";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: {
		default: "Home | Rise Abroad Education",
		template: "%s | Rise Abroad Education",
	},
	description:
		"Official Higher Study Admissions Portal for International Students by Rise Abroad Education. Explore top universities in UK, Canada, Cyprus, Germany, and USA with direct application processing.",
	icons: {
		icon: "/favicon.svg",
		shortcut: "/favicon.svg",
		apple: "/favicon.svg",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="dark app-splash-active">
			<body className="min-h-screen bg-[#070d1f] text-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white app-splash-active">
				<QueryProvider>
					<AuthProvider>
						<AppSplashLoader />
						<VisitorTracker />
						<PageTitleUpdater />
						<Navbar />
						<main className="flex-1">{children}</main>
						<Footer />
					</AuthProvider>
				</QueryProvider>
			</body>
		</html>
	);
}
