import "./globals.css";
import { AuthProviderWrapper } from "@/components/auth/auth-provider";

export const metadata = {
    title: "Spread Book",
    description: "Spread Book - Your intelligent spreadsheet companion",
};

export default function RootLayout({ children }) {
    return (
        <html
            lang="en"
            className="h-full antialiased"
        >
            <body className="min-h-full flex flex-col">
                <AuthProviderWrapper>{children}</AuthProviderWrapper>
            </body>
        </html>
    );
}
