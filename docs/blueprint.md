# **App Name**: CreditWise

## Core Features:

- User Authentication: Secure signup and login functionality using JWT-based authentication.
- Document Upload & OCR: Allows users to upload financial documents (receipts, statements) and automatically extract data using OCR technology like Tesseract.js. Users upload via filepicker, and photos taken with their mobile device.
- Transaction Categorization: AI-powered categorization of transactions (income/expenses) based on OCR data and user corrections, using a tool for reasoning about which category is most relevant. Manual adjustment of the categories are saved and reused.
- Credit Score Calculation: Calculate a credit score (0-1000) based on factors like income consistency, expense management, and bill payment history.
- Dashboard Overview: Display the user's credit score, financial health metrics (average monthly income, expense breakdown), and recent transactions in a visually appealing dashboard.
- PDF Credit Report: Generate a detailed PDF credit report with a score breakdown, income/expense analysis, and recommendations for improvement.
- Secure Sharing: Create shareable links for credit reports, with options for password protection and access tracking.

## Style Guidelines:

- Primary color: HSL(49, 100%, 50%) – A vibrant yellow (#FFDA63) evokes optimism and approachability in personal finance.
- Background color: HSL(53, 26%, 92%) – A very light yellow (#F7F4EC) maintains warmth without distracting from data presentation.
- Accent color: HSL(19, 92%, 51%) – A bright orange (#F1711E) is used sparingly for key calls to action and highlighting important information, guiding user attention.
- Headline font: 'Poppins', a geometric sans-serif for headlines and user interface elements. Body font: 'PT Sans', a more humanist sans-serif that can be used in longer blocks of text, giving the site a cleaner appearance than would arise from the exclusive use of the geometric 'Poppins'.
- Use clear and simple icons from a consistent set (e.g., Font Awesome or Material Icons) to represent transaction categories and financial metrics.
- Mobile-first, responsive layout with a clean and intuitive design. Prioritize key information above the fold. Ensure excellent rendering on common low-end Android devices.
- Subtle transitions and animations (using Framer Motion) to enhance the user experience, such as loading indicators and score updates. Keep it fast!