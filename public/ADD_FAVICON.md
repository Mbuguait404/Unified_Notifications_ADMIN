Place your branded favicon file here:

- Filename: `favicon.ico`
- Path: `admin/public/favicon.ico`

Steps:
1. Export or obtain your .ico file (multiple sizes inside the ICO are fine).
2. Copy it to `admin/public` and name it `favicon.ico`.
3. Restart the Next.js dev server if it's running.

Notes:
- The app will prefer `/favicon.ico` (default) and fall back to the other icons defined in `admin/app/layout.tsx`.
- If you want a different name or path, update the `icons` entry in `admin/app/layout.tsx`.