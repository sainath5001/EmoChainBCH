import type { Metadata } from 'next'
import './globals.css'

// Using system font instead of Google Fonts to avoid network issues
// const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'EmoChain - Proof of Emotion Rewards',
    description: 'Earn BCH rewards by proving your emotions on Bitcoin Cash Chipnet',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className="font-sans">{children}</body>
        </html>
    )
}


