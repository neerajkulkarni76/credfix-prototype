export const userProfile = {
  firstName: 'Sunil', lastName: 'Singh', phone: '7742147525',
  email: 'sunilsingh11@gmail.com', creditScore: 624, totalDebt: 285600,
}

export const loans = [
  { id: 1, type: 'Personal Loan', bank: 'Bajaj Finserv', amount: 86200, accountNumber: 'BFL-9384021', alert: 'Legal Notice Received!', recommended: true },
  { id: 2, type: 'Personal Loan', bank: 'HDFC Bank', amount: 53200, accountNumber: 'XXXX-1234', alert: null, recommended: false },
  { id: 3, type: 'Credit Card', bank: 'Axis Bank', amount: 146200, accountNumber: 'XXXX-5678', alert: null, recommended: false },
]

export const recentConversations = [
  { id: 1, title: 'Settlement Assistance for Bajaj Finance', subtitle: 'Negotiated to ₹48,500 · Saved ₹37,700', status: 'Active', date: 'Today', icon: '🤝', path: 'chat/settlement' },
  { id: 2, title: 'Legal Notice Reply - HDFC Bank', subtitle: 'Reply drafted & sent · Section 138', status: 'Sent', date: 'Today', icon: '⚖️', path: 'chat/legal' },
  { id: 3, title: 'Improve Your Credit Score', subtitle: '12-month roadmap to 780+', status: 'In progress', date: 'Yesterday', icon: '📈', path: '(tabs)' },
  { id: 4, title: 'Call Analysis from the HDFC Bank', subtitle: 'RBI violations flagged · Notice drafted', status: 'Review', date: '6 June', icon: '📞', path: 'neytra-screens/insights' },
  { id: 5, title: 'Axis Bank Credit Card Settlement', subtitle: 'Exploring options · ₹1,46,200 outstanding', status: 'In progress', date: '4 June', icon: '🤝', path: 'chat/settlement' },
  { id: 6, title: 'IDFC First Bank - EMI Restructuring', subtitle: 'Bank offered 12-month moratorium', status: 'Review', date: '2 June', icon: '🤝', path: 'chat/settlement' },
  { id: 7, title: 'Recovery Agent Visit Report', subtitle: 'Documented visit · RBI complaint filed', status: 'Sent', date: '28 May', icon: '📞', path: 'neytra-screens' },
  { id: 8, title: 'Kotak Mahindra Settlement', subtitle: 'Settled at ₹28,000 · Saved ₹42,000', status: 'Active', date: '15 May', icon: '🤝', path: 'chat/settlement' },
]

export const callHistory = [
  { id: 1, number: '+91 1408 858 481', status: 'handled' as const, bank: 'HDFC Bank', time: '2:26 PM', date: 'Today' },
  { id: 2, number: '+91 8989 542 564', status: 'allowed' as const, bank: null, time: '1:47 PM', date: 'Today', extra: 'Add to Contacts +' },
  { id: 3, number: '+91 9876 123 456', status: 'handled' as const, bank: 'Bajaj Finserv', time: '11:30 AM', date: 'Today' },
  { id: 4, number: '+91 7700 345 678', status: 'handled' as const, bank: 'Axis Bank', time: '10:15 AM', date: 'Today' },
  { id: 5, number: '+91 8892 954 335', status: 'handled' as const, bank: 'HDFC Bank', time: '2:26 PM', date: '12 June 2026' },
  { id: 6, number: '+91 9988 776 655', status: 'allowed' as const, bank: null, time: '4:10 PM', date: '12 June 2026', extra: 'Utility' },
  { id: 7, number: '+91 8892 954 335', status: 'verify' as const, bank: null, time: '2:26 PM', date: '11 June 2026', extra: 'Someone you know' },
  { id: 8, number: '+91 7654 321 098', status: 'handled' as const, bank: 'IDFC Bank', time: '9:45 AM', date: '11 June 2026' },
  { id: 9, number: '+91 8892 954 335', status: 'handled' as const, bank: 'HDFC Bank', time: '3:15 PM', date: '10 June 2026' },
  { id: 10, number: '+91 9123 456 789', status: 'allowed' as const, bank: null, time: '11:00 AM', date: '10 June 2026', extra: 'Family' },
  { id: 11, number: '+91 8765 432 100', status: 'handled' as const, bank: 'TVS Credit', time: '2:26 PM', date: '9 June 2026' },
  { id: 12, number: '+91 7788 990 011', status: 'handled' as const, bank: 'Kotak Mahindra', time: '10:30 AM', date: '8 June 2026' },
]

export const recentCalls = callHistory.slice(0, 5)

export const fdList = [
  { id: 1, amount: 10000, status: 'Active' as const, date: '27 March 2026', interestRate: 7.5, daysRemaining: 287 },
  { id: 2, amount: 8000, status: 'Active' as const, date: '22 March 2026', interestRate: 7.5, daysRemaining: 282 },
  { id: 3, amount: 12000, status: 'Active' as const, date: '08 March 2026', interestRate: 7.25, daysRemaining: 268 },
  { id: 4, amount: 12000, status: 'Pending' as const, date: '08 March 2026', interestRate: 7.5, daysRemaining: 268 },
  { id: 5, amount: 5000, status: 'Active' as const, date: '15 February 2026', interestRate: 7.25, daysRemaining: 247 },
  { id: 6, amount: 15000, status: 'Active' as const, date: '01 January 2026', interestRate: 7.0, daysRemaining: 202 },
]

export const neytraStats = { callsToday: 14, callsThisMonth: 600, hrsSaved: 10 }

export type EmailCategory = 'Collection Reminder' | 'Repayment Reminder' | 'Legal Notice' | 'NOC' | 'Settlement Offer' | 'Closure Confirmation'

export interface LenderEmail {
  id: number
  from: string
  lender: string
  subject: string
  snippet: string
  body: string
  category: EmailCategory
  date: string
  time: string
  critical: boolean
  hasRisiThread: boolean
  risiThreadPath?: string
  unread: boolean
  attachments?: { name: string; size: string }[]
}

export const lenderEmails: LenderEmail[] = [
  {
    id: 1, from: 'recovery@bajajfinserv.in', lender: 'Bajaj Finserv',
    subject: 'Final Notice: Overdue Personal Loan Account BFL-9384021',
    snippet: 'Dear Customer, this is a final reminder regarding your outstanding personal loan of ₹86,200. Immediate action is required to avoid further legal proceedings...',
    body: `Dear Customer,

This is a FINAL REMINDER regarding your overdue Personal Loan account BFL-9384021.

Outstanding Amount: ₹86,200
Days Past Due: 127 days
Last Payment Received: 08 February 2026

Despite our repeated attempts to reach you via phone calls and previous email reminders, we have not received any payment towards the outstanding balance on your account.

Please note that if the outstanding amount is not settled within the next 7 working days, we will be compelled to initiate the following actions:

1. Report the default to CIBIL, Experian, and other credit bureaus
2. Initiate legal proceedings under applicable laws
3. Engage third-party recovery agents for field collection
4. Levy additional penal interest at 3% per month

We strongly urge you to clear the outstanding amount immediately to avoid further consequences. You may make the payment through our app, net banking, or by visiting your nearest Bajaj Finserv branch.

For any queries or to discuss a payment plan, please contact our recovery helpline at 1800-102-3456.

Regards,
Recovery Department
Bajaj Finserv Limited`,
    category: 'Collection Reminder', date: 'Today', time: '10:32 AM',
    critical: true, hasRisiThread: true, risiThreadPath: 'chat/settlement', unread: true,
  },
  {
    id: 2, from: 'legal@hdfcbank.com', lender: 'HDFC Bank',
    subject: 'Legal Notice u/s 138 NI Act — Account XXXX-1234',
    snippet: 'Please find attached the legal notice issued under Section 138 of the Negotiable Instruments Act. You are required to respond within 15 days...',
    body: `LEGAL NOTICE

To,
Sunil Singh
[Address on file]

Subject: Legal Notice under Section 138 of the Negotiable Instruments Act, 1881

Dear Sir,

Under instructions from and on behalf of my client HDFC Bank Limited, I hereby serve upon you the following Legal Notice:

My client states that you had availed a Personal Loan bearing Account No. XXXX-1234 for a sum of ₹53,200 (Rupees Fifty Three Thousand Two Hundred Only). As per the terms of the loan agreement dated 15 September 2025, you were required to make monthly EMI payments of ₹4,430.

My client further states that the cheque / ECS mandate bearing reference number 847291 dated 12 March 2026 for ₹4,430 issued by you towards repayment was dishonoured / returned unpaid by the banker with the remarks "Insufficient Funds."

You are hereby called upon to pay the said sum of ₹53,200 along with accrued interest and charges within 15 days from the date of receipt of this notice, failing which my client shall be constrained to initiate criminal proceedings under Section 138 of the Negotiable Instruments Act, 1881, and civil recovery proceedings.

Please treat this notice as final and govern yourself accordingly.

Advocate Rajesh Kumar
On behalf of HDFC Bank Limited
Date: 14 June 2026`,
    category: 'Legal Notice', date: 'Today', time: '9:15 AM',
    critical: true, hasRisiThread: true, risiThreadPath: 'chat/legal', unread: true,
    attachments: [{ name: 'Legal_Notice_HDFC_Section138.pdf', size: '245 KB' }],
  },
  {
    id: 3, from: 'settlements@bajajfinserv.in', lender: 'Bajaj Finserv',
    subject: 'One-Time Settlement Offer — Save up to 45%',
    snippet: 'We are pleased to offer you a one-time settlement of ₹47,410 against your outstanding balance of ₹86,200. This offer is valid until 25 June 2026...',
    body: `Dear Valued Customer,

We understand that financial difficulties can arise unexpectedly, and we would like to offer you an opportunity to resolve your outstanding dues with Bajaj Finserv.

SETTLEMENT OFFER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━
Account Number: BFL-9384021
Outstanding Amount: ₹86,200
Settlement Amount: ₹47,410
You Save: ₹38,790 (45% waiver)
Offer Valid Until: 25 June 2026

PAYMENT OPTIONS
━━━━━━━━━━━━━━━━━━━━━━━━
Option A: Lump sum payment of ₹47,410
Option B: 3 monthly instalments of ₹15,804 each

HOW TO ACCEPT
━━━━━━━━━━━━━━━━━━━━━━━━
1. Reply to this email with "I ACCEPT" along with your preferred payment option
2. Call our settlement desk at 1800-102-3456
3. Visit your nearest Bajaj Finserv branch with a valid ID

Upon successful payment, we will:
• Issue a No Objection Certificate (NOC) within 7 working days
• Update your credit bureau records to reflect "Settled" status
• Provide a closure letter for your records

This is a limited-time offer and will expire on 25 June 2026. Post expiry, the full outstanding amount of ₹86,200 will be due.

Warm regards,
Settlement Cell
Bajaj Finserv Limited`,
    category: 'Settlement Offer', date: 'Yesterday', time: '4:48 PM',
    critical: true, hasRisiThread: true, risiThreadPath: 'chat/settlement', unread: true,
  },
  {
    id: 4, from: 'collections@axisbank.com', lender: 'Axis Bank',
    subject: 'Reminder: Credit Card Payment Overdue — XXXX-5678',
    snippet: 'Your credit card outstanding of ₹1,46,200 is overdue by 47 days. Please make the minimum payment of ₹7,310 to avoid additional late fees...',
    body: `Dear Cardholder,

This is a reminder that your Axis Bank Credit Card ending XXXX-5678 has an overdue balance.

ACCOUNT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━
Total Outstanding: ₹1,46,200
Minimum Amount Due: ₹7,310
Payment Due Date: 28 April 2026
Days Overdue: 47 days

Late payment charges of ₹1,300 have been applied to your account. An additional penal interest of 3.5% per month (42% p.a.) is being charged on the outstanding amount.

To avoid further charges and impact on your credit score, please make at least the minimum payment immediately.

PAYMENT METHODS
• Axis Mobile App / Internet Banking
• NEFT to account: 917020XXXX5678
• UPI: axicard.5678@axisbank
• Nearest Axis Bank branch or ATM

If you are facing financial difficulty, please reach out to our customer care at 1860-419-5555 to discuss restructuring options.

Regards,
Collections Department
Axis Bank Limited`,
    category: 'Repayment Reminder', date: 'Yesterday', time: '2:10 PM',
    critical: false, hasRisiThread: false, unread: true,
  },
  {
    id: 5, from: 'noreply@idfcfirstbank.com', lender: 'IDFC First Bank',
    subject: 'EMI Due Reminder — Loan A/C 934821',
    snippet: 'This is a gentle reminder that your EMI of ₹4,850 for loan account 934821 is due on 18 June 2026. Please ensure sufficient balance...',
    body: `Dear Customer,

Greetings from IDFC First Bank!

This is a gentle reminder that your upcoming EMI is due shortly.

EMI DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━
Loan Account: 934821
EMI Amount: ₹4,850
Due Date: 18 June 2026
EMI Number: 8 of 24

Please ensure sufficient balance in your linked bank account (XXXX-7823) for auto-debit on the due date.

If you have already made the payment, please ignore this reminder. It may take 2-3 business days for the payment to reflect in our records.

For any assistance, please call us at 1800-419-4332 or visit www.idfcfirstbank.com.

Warm regards,
IDFC First Bank
Customer Service Team`,
    category: 'Repayment Reminder', date: '12 June', time: '11:00 AM',
    critical: false, hasRisiThread: false, unread: false,
  },
  {
    id: 6, from: 'legal@axisbank.com', lender: 'Axis Bank',
    subject: 'Pre-Arbitration Notice — Credit Card Account',
    snippet: 'We are initiating pre-arbitration proceedings for your credit card account XXXX-5678. Kindly settle the outstanding amount within 7 working days...',
    body: `PRE-ARBITRATION NOTICE

To,
Sunil Singh
[Address on file]

Ref: Credit Card Account No. XXXX-5678

Dear Sir,

We refer to the above-mentioned credit card account wherein the total outstanding dues amount to ₹1,46,200 (Rupees One Lakh Forty Six Thousand Two Hundred Only).

Despite multiple reminders through calls, SMS, and emails, the above amount remains unpaid. The account is classified as NPA (Non-Performing Asset) as per RBI guidelines.

This is to inform you that as a final step before initiating formal arbitration proceedings, we are issuing this Pre-Arbitration Notice as mandated under the Arbitration and Conciliation Act, 1996.

You are hereby given a final opportunity of 7 working days from the receipt of this notice to:
1. Clear the entire outstanding amount of ₹1,46,200, OR
2. Contact our settlement team to negotiate a mutually agreeable settlement

Failure to respond within the stipulated time will result in:
• Filing of arbitration proceedings
• Attachment of assets as per court orders
• Reporting to all credit bureaus with "Wilful Default" remarks

Settlement Desk Contact: 1860-500-5555 (Mon-Sat, 9 AM - 6 PM)
Email: settlement.desk@axisbank.com

Legal Department
Axis Bank Limited
Date: 11 June 2026`,
    category: 'Legal Notice', date: '11 June', time: '3:22 PM',
    critical: true, hasRisiThread: true, risiThreadPath: 'chat/legal', unread: false,
    attachments: [{ name: 'Pre_Arbitration_Notice_Axis.pdf', size: '312 KB' }],
  },
  {
    id: 7, from: 'closure@kotakmahindra.com', lender: 'Kotak Mahindra',
    subject: 'Loan Closure Confirmation & NOC — A/C 776291',
    snippet: 'We are pleased to confirm that your personal loan account 776291 has been closed. Please find attached your No Objection Certificate (NOC)...',
    body: `Dear Customer,

Congratulations! We are pleased to confirm that your Personal Loan account has been successfully closed.

CLOSURE DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━
Account Number: 776291
Loan Type: Personal Loan
Original Loan Amount: ₹70,000
Settlement Amount Paid: ₹28,000
Date of Closure: 08 June 2026
Status: CLOSED — Settled

NO OBJECTION CERTIFICATE (NOC)
Please find attached the No Objection Certificate (NOC) for your records. This confirms that Kotak Mahindra Bank has no further claims on your account and all dues have been cleared.

IMPORTANT NOTES
• Your credit bureau records will be updated within 30-45 days to reflect the closure
• The status will be reported as "Settled" (not "Closed")
• Please retain this NOC and the attached document for your records
• If you need a physical copy, please visit your nearest branch with valid ID

We value your relationship with Kotak Mahindra Bank. If you need any financial assistance in the future, please do not hesitate to reach out.

Best regards,
Loan Servicing Team
Kotak Mahindra Bank`,
    category: 'NOC', date: '10 June', time: '10:05 AM',
    critical: false, hasRisiThread: false, unread: false,
    attachments: [
      { name: 'NOC_Kotak_776291.pdf', size: '189 KB' },
      { name: 'Closure_Letter_776291.pdf', size: '156 KB' },
    ],
  },
  {
    id: 8, from: 'settlements@hdfcbank.com', lender: 'HDFC Bank',
    subject: 'Settlement Proposal for Personal Loan — XXXX-1234',
    snippet: 'As discussed, we can offer a settlement amount of ₹38,400 against the outstanding of ₹53,200 (28% waiver). Please confirm by 20 June...',
    body: `Dear Mr. Singh,

Further to our telephonic conversation on 08 June 2026, we are pleased to present you with a settlement offer for your Personal Loan account.

SETTLEMENT PROPOSAL
━━━━━━━━━━━━━━━━━━━━━━━━
Account Number: XXXX-1234
Outstanding Amount: ₹53,200
Proposed Settlement: ₹38,400
Waiver: ₹14,800 (28%)
Offer Validity: 20 June 2026

TERMS & CONDITIONS
1. The settlement amount of ₹38,400 must be paid in a single lump sum
2. Payment must be received by 20 June 2026
3. Upon receipt of payment, a No Dues Certificate will be issued within 15 working days
4. Credit bureau records will be updated to "Settled" status within 45 days
5. This offer is subject to management approval and may be withdrawn at any time

TO ACCEPT THIS OFFER
Please reply to this email with "ACCEPTED" or call our settlement desk at 1800-103-5555.

Payment can be made via NEFT/RTGS to:
Bank: HDFC Bank
Account: 50100XXXX1234
IFSC: HDFC0001234

Regards,
Settlement Cell
HDFC Bank Limited`,
    category: 'Settlement Offer', date: '9 June', time: '5:30 PM',
    critical: false, hasRisiThread: false, unread: false,
  },
  {
    id: 9, from: 'recovery@tvscredit.com', lender: 'TVS Credit',
    subject: 'Immediate Payment Required — Vehicle Loan EMI',
    snippet: 'Your vehicle loan EMI of ₹3,200 is overdue by 32 days. Non-payment may result in vehicle repossession as per the loan agreement...',
    body: `Dear Borrower,

This is an urgent reminder regarding the overdue EMI on your Vehicle Loan account.

ACCOUNT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━
Loan Account: TVS-VL-882941
Vehicle: Honda Activa 6G (MH-12-XX-7823)
EMI Amount: ₹3,200
Due Date: 12 May 2026
Days Overdue: 32 days
Late Charges Accrued: ₹480

IMPORTANT WARNING
As per the terms of your loan agreement, non-payment beyond 60 days may result in:
• Vehicle repossession without further notice
• Legal action for recovery of outstanding dues
• Permanent negative impact on your credit score

We urge you to make the payment immediately to avoid these consequences.

PAYMENT OPTIONS
• TVS Credit App
• UPI: tvsloan.882941@tvscredit
• NEFT: Account 44501XXXX882941, IFSC: TVSC0001234
• Visit nearest TVS Credit branch

If you are unable to make the full payment, please call us at 044-6611-2345 to discuss options.

Recovery Department
TVS Credit Services Limited`,
    category: 'Collection Reminder', date: '7 June', time: '9:45 AM',
    critical: false, hasRisiThread: false, unread: false,
  },
  {
    id: 10, from: 'noreply@bajajfinserv.in', lender: 'Bajaj Finserv',
    subject: 'Account Closure & NOC — Personal Loan BFL-7721',
    snippet: 'Congratulations! Your personal loan BFL-7721 has been successfully closed after settlement. Your NOC is attached for your records...',
    body: `Dear Customer,

We are happy to inform you that your Personal Loan account BFL-7721 with Bajaj Finserv has been successfully closed.

ACCOUNT CLOSURE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━
Account Number: BFL-7721
Loan Type: Personal Loan
Original Loan Amount: ₹1,20,000
Total Paid (Settlement): ₹62,400
Settlement Savings: ₹57,600
Date of Closure: 04 June 2026
Final Status: CLOSED — Settled

The attached No Objection Certificate (NOC) confirms that Bajaj Finserv has no further claim on this account.

NEXT STEPS
• Your CIBIL / Experian records will be updated within 30-45 days
• The account will reflect as "Settled" in your credit report
• Please save the NOC for future reference (home loan, car loan applications, etc.)

If you have any questions, please contact us at 1800-102-3456 or reply to this email.

Thank you for choosing Bajaj Finserv.

Loan Servicing Department
Bajaj Finserv Limited`,
    category: 'Closure Confirmation', date: '5 June', time: '2:15 PM',
    critical: false, hasRisiThread: false, unread: false,
    attachments: [{ name: 'NOC_BajajFinserv_BFL7721.pdf', size: '201 KB' }],
  },
]
