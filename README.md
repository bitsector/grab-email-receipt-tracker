# Grab Receipt Searcher

Google Apps Script to scan Gmail for Grab receipts (food, taxi, tips, mart) within a Manila-time date range, parse totals from email bodies, and log category counts/sums in PHP.

## Setup & Run
1. Create a new script at [script.google.com](https://script.google.com).
2. Paste the code (functions: `printGrabEmails`, parsers).
3. Edit `startDate`/`endDate` in `printGrabEmails`.
4. Run `printGrabEmails` → Check **Executions** or **Logs** for output.

**Note:** Requires Gmail access; logs to GAS Logger.
