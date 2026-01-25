# 🤝 How to Work Together (The Survival Guide)

Since there are **two of you** working on this project (You & Your Friend), you must follow these rules to avoid "Merge Conflicts" (the red errors).

---

## 🛑 Rule #1: The Golden Rule
> **"ALWAYS Pull before you start working."**

Before you type a single line of code in the morning (or night):
1.  Open your terminal.
2.  Run: `git pull --rebase origin main`
3.  *Now* you can start coding.

**Why?** If your friend pushed changes while you were sleeping, you need them on your computer *before* you add your own.

---

## 📢 Rule #2: Communicate ("The Traffic Light")
You are both admins. If you both edit `main.js` at the same time, Git will get confused.

**Simple System:**
*   **You (User):** "I am working on the **Admin Panel** and **Templates** today."
*   **Friend:** "Okay, I will work on the **CSS** and **Music Player**."

If you work on *different files*, you will almost NEVER have conflicts.

---

## 💾 Rule #3: Save Often
Don't wait 3 days to push. Push every few hours.

1.  I did some work.
2.  `git add .`
3.  `git commit -m "added cool music feature"`
4.  `git pull --rebase origin main` (Just to check if friend pushed anything recently)
5.  `git push origin main`

---

## 🆘 Rule #4: If things break...
If you see `Merge conflict` or `<<<<<<< HEAD`:
1.  **Don't Panic.** nothing is deleted.
2.  Open the file (e.g., `main.js`).
3.  Look for the `<<<<<<<` markers.
4.  Pick the code you want to keep.
5.  Delete the markers.
6.  Save, Commit, Push.

*(See `GIT_HELP.md` for the exact commands for this!)*
