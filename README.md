# Grab Receipt Searcher

Google Apps Script to scan Gmail for Grab receipts (food, taxi, tips, mart) within a Manila-time date range, parse totals from email bodies, and log category counts/sums.

## Setup & Run
1. Create a new script at [script.google.com](https://script.google.com).
2. Paste all code files (.gs and appscript.json) from the repo.
3. **Gemini API Key (run once only):** Run `setGeminiKey()` function—it prompts for your key (get from Google AI Studio) and stores it securely. Must run once for AI mart analysis.
4. `listModels.gs` is optional (lists available Gemini models)—skip unless testing models.
5. Edit `startDate`/`endDate` in `printGrabEmails`.
6. **Run this function:** `printGrabEmails` → Check **Executions** or **Logs** for output.

**Note:** Requires Gmail access (auto-authorized). Logs to GAS Logger. AI optional via `analyzeMartReceiptContent`.
