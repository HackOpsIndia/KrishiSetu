# KrishiSetu Git & GitHub Collaboration Workflow

**Organization:** [HackOpsIndia](https://github.com/HackOpsIndia)  
**Repository:** [https://github.com/HackOpsIndia/KrishiSetu](https://github.com/HackOpsIndia/KrishiSetu)  
**Competition:** Smart India Hackathon (SIH) 2026 — Problem Statement SIH26132  

---

## 1. Core Architecture & Branch Topology

KrishiSetu uses a structured, trunk-based Gitflow topology designed for 6 developers working simultaneously without merge collisions:

```
feature/farmer-fpo       (Rama)               ──┐
feature/buyer            (Aman Kesarwani)     ──┤
feature/backend          (Jatin Joshi)        ──┼──> [PR + Code Review] ──> develop ──> [Release PR] ──> main (v1.0.0-sih)
feature/auth-admin       (Bhavishya Gangola)  ──┤
feature/ui-qa-docs       (Riya Adhikari)      ──┤
feature/integration-release (Ananya Pandey)   ──┘
```

### Branch Roles
- **`main` (Protected / Production Baseline)**:
  Contains only thoroughly tested, deployable, canonical SIH demo builds. Nobody pushes directly to `main`.
- **`develop` (Integration Trunk)**:
  The single source of truth for daily integration. All feature branches branch off `develop` and merge back into `develop` via pull requests.
- **`feature/*` (Dedicated Member Branches)**:
  Assigned to specific team members according to the [Team Matrix](file:///./docs/TEAM.md).

---

## 2. Commit Identity vs GitHub Authentication (CRITICAL)

Many developers mistake Git commit author config for GitHub authentication:

| Concept | What It Controls | How to Configure |
|---|---|---|
| **Git Commit Identity** | Name and email attached to Git commits (`git log`). | `git config --local user.name "..."`<br>`git config --local user.email "..."` |
| **GitHub Authentication** | The actual GitHub account authorized to push/pull to `HackOpsIndia/KrishiSetu`. | `gh auth login`<br>`gh auth switch --user <username>` |

> [!WARNING]
> Running `git config user.name "Rama"` does **NOT** authenticate you as Rama on GitHub!  
> You **MUST** ensure `gh api user --jq '.login'` returns your actual GitHub username before pushing.

---

## 3. Team Member Authentication & Branch Setup

Each developer must configure both identities on their workstation before pushing.

### 1. Ananya Pandey (Team Leader)
- **GitHub Username:** `Ananyapandey-dev`
- **Email:** `ananyapandey.dev.in@gmail.com`
- **Branch:** `feature/integration-release`
- **Terminal Setup:**
  ```bash
  # 1. Switch or login GitHub account
  gh auth switch --user Ananyapandey-dev   # or 'gh auth login'
  gh api user --jq '.login'               # Must output: Ananyapandey-dev

  # 2. Set repository Git identity
  git checkout feature/integration-release
  git config --local user.name "Ananya Pandey"
  git config --local user.email "ananyapandey.dev.in@gmail.com"

  # 3. Push branch
  git push -u origin feature/integration-release
  ```

### 2. Rama (Farmer & FPO Lead)
- **GitHub Username:** `ramako7777-spec`
- **Email:** `ramako7777@gmail.com`
- **Branch:** `feature/farmer-fpo`
- **Terminal Setup:**
  ```bash
  # 1. Switch or login GitHub account
  gh auth switch --user ramako7777-spec   # or 'gh auth login'
  gh api user --jq '.login'               # Must output: ramako7777-spec

  # 2. Set repository Git identity
  git checkout feature/farmer-fpo
  git config --local user.name "Rama"
  git config --local user.email "ramako7777@gmail.com"

  # 3. Push branch
  git push -u origin feature/farmer-fpo
  ```

### 3. Aman Kesarwani (Buyer Workflow Lead)
- **GitHub Username:** `amankesarwani01`
- **Email:** `amankesarwani516@gmail.com`
- **Branch:** `feature/buyer`
- **Terminal Setup:**
  ```bash
  # 1. Switch or login GitHub account
  gh auth switch --user amankesarwani01   # or 'gh auth login'
  gh api user --jq '.login'               # Must output: amankesarwani01

  # 2. Set repository Git identity
  git checkout feature/buyer
  git config --local user.name "Aman Kesarwani"
  git config --local user.email "amankesarwani516@gmail.com"

  # 3. Push branch
  git push -u origin feature/buyer
  ```

### 4. Jatin Joshi (Backend & Engine Lead)
- **GitHub Username:** `jatinjoshi200803-stack`
- **Email:** `jatinjoshi200803@gmail.com`
- **Branch:** `feature/backend`
- **Terminal Setup:**
  ```bash
  # 1. Switch or login GitHub account
  gh auth switch --user jatinjoshi200803-stack   # or 'gh auth login'
  gh api user --jq '.login'                      # Must output: jatinjoshi200803-stack

  # 2. Set repository Git identity
  git checkout feature/backend
  git config --local user.name "Jatin Joshi"
  git config --local user.email "jatinjoshi200803@gmail.com"

  # 3. Push branch
  git push -u origin feature/backend
  ```

### 5. Bhavishya Gangola (Auth & Admin Lead)
- **GitHub Username:** `bhavishyagangola-dev`
- **Email:** `bhavishyagangola12@gmail.com`
- **Branch:** `feature/auth-admin`
- **Terminal Setup:**
  ```bash
  # 1. Switch or login GitHub account
  gh auth switch --user bhavishyagangola-dev   # or 'gh auth login'
  gh api user --jq '.login'                     # Must output: bhavishyagangola-dev

  # 2. Set repository Git identity
  git checkout feature/auth-admin
  git config --local user.name "Bhavishya Gangola"
  git config --local user.email "bhavishyagangola12@gmail.com"

  # 3. Push branch
  git push -u origin feature/auth-admin
  ```

### 6. Riya Adhikari (UI/QA & Documentation Lead)
- **GitHub Username:** `Nurizz07`
- **Email:** `riyaadhikari361@gmail.com`
- **Branch:** `feature/ui-qa-docs`
- **Terminal Setup:**
  ```bash
  # 1. Switch or login GitHub account
  gh auth switch --user Nurizz07   # or 'gh auth login'
  gh api user --jq '.login'        # Must output: Nurizz07

  # 2. Set repository Git identity
  git checkout feature/ui-qa-docs
  git config --local user.name "Riya Adhikari"
  git config --local user.email "riyaadhikari361@gmail.com"

  # 3. Push branch
  git push -u origin feature/ui-qa-docs
  ```

---

## 4. Shared Machine Account Switching Safety

If teammates share a development machine during the hackathon:
1. **Always verify active account before committing or pushing:**
   ```bash
   gh api user --jq '.login'
   ```
2. **If it shows someone else's username, switch:**
   ```bash
   gh auth switch --user <your-github-username>
   ```
3. **If your account is not on the machine:**
   ```bash
   gh auth login -w -p https
   ```
   *Follow the browser prompt. Never paste raw personal tokens into the terminal or chat.*
4. **Update local repo commit author:**
   ```bash
   git config --local user.name "<Your Name>"
   git config --local user.email "<Your Email>"
   ```

---

## 5. Pull Request & Merging Workflow

1. **Keep branch updated with develop:**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/<your-branch>
   git merge develop
   ```
2. **Verify tests and build pass locally:**
   ```bash
   npm test
   npm run build
   ```
3. **Push feature branch:**
   ```bash
   git push origin feature/<your-branch>
   ```
4. **Create Pull Request against `develop`:**
   ```bash
   gh pr create --base develop --head feature/<your-branch> --title "feat(<area>): <concise description>" --body "Closes #<issue>"
   ```
5. **Review & Merge:**
   - At least 1 review required.
   - Team Leader Ananya Pandey reviews and approves final integration.
   - Use `Squash and Merge` or `Merge Commit` preserving commit history.

---

## 6. Security & Secret Zero-Tolerance Policy

- Never commit `.env` or `.env.local` files.
- Never commit database credentials, SMTP passwords, Google OAuth client secrets, or JWT secrets.
- Use `.env.example` with template keys only (`mock`, `localhost`, etc.).
- If any secret is accidentally staged, unstage immediately:
  ```bash
  git reset HEAD <file>
  ```
