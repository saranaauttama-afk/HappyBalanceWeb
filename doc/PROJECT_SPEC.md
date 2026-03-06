# Happy Balance Web App – PROJECT SPEC

## Project Goal

Build a **mobile-first wellness web application** based on the storyboard.

The first version should:

- run in a mobile browser
- store data in Google Sheets
- use Google Apps Script as backend
- deploy free
- look like a mobile app

The goal is to create a **working MVP first**, then improve later.

---

# Tech Stack

Frontend

React  
Vite  
TypeScript  
Tailwind CSS

Optional UI helpers

shadcn/ui  
lucide-react icons

Backend

Google Apps Script (Web App API)

Database

Google Sheets

Deployment

Cloudflare Pages (primary)  
Vercel (backup)

Development

VS Code  
Codex AI

---

# Language Strategy

The storyboard is Thai but development will be **English first**.

Reasons:

- easier coding
- easier debugging
- better naming
- Codex works better

All UI text must be centralized.

Example

src/i18n/en.ts  
src/i18n/th.ts

Example usage

text.login  
text.createAccount  
text.goals  

Thai translation will be added later.

---

# Application Architecture

User (Mobile Browser)
        │
        ▼
React + Tailwind
        │
        │ REST API
        ▼
Google Apps Script
        │
        ▼
Google Sheets

Frontend handles UI.

Apps Script exposes REST endpoints.

Sheets act as database.

---

# Core Application Sections

Auth Flow

Welcome  
Login  
Forgot Password  
Terms & Privacy  
Register

Main App

Home Dashboard  
Goals Overview  
Goal Category  
Goal Activity  
Appointments  
Profile

---

# Route Structure

Public Routes

/

 /login  
 /forgot-password  
 /terms  
 /register

App Routes

/home  
/goals  
/goals/:category  
/goals/:category/:activity  
/appointments  
/profile

For MVP authentication can be simulated with a demo user.

---

# Shared UI Components

Create reusable components early.

MobileShell  
AuthShell  
AppHeader  
BottomNav  
PrimaryButton  
SecondaryButton  
InfoCard  
SectionTitle  
ProgressCard  
MenuListItem  
EmptyState

---

# Folder Structure

```
src/

  app/
    layout/
    routes/

  components/
    ui/
    shared/

  features/

    auth/
      welcome/
      login/
      forgot-password/
      terms/
      register/

    home/

    goals/
      overview/
      category-detail/
      activity-detail/

    appointments/

    profile/

  services/
    api.ts
    goals.service.ts
    logs.service.ts
    profile.service.ts

  types/
    models.ts

  i18n/
    en.ts
    th.ts
```

---

# Database Schema

Google Sheets tabs

users

id  
email  
full_name  
phone  
created_at  
updated_at

goals

id  
user_id  
category  
activity  
current_value  
target_value  
status  
created_at  
updated_at

daily_logs

id  
user_id  
log_date  
mood  
energy  
stress  
note  
created_at  
updated_at

appointments

id  
user_id  
appointment_date  
type  
status  
note  
created_at  
updated_at

---

# API Design

Google Apps Script Web App

Endpoints handled by doGet and doPost

GET

?action=getUser  
?action=listGoals  
?action=listDailyLogs  

POST

?action=createGoal  
?action=createDailyLog  
?action=updateProfile  

Response format

```
{
  success: true,
  data: {}
}
```

---

# UI Screens

Unique screens from storyboard

Welcome  
Login  
Forgot Password  
Terms  
Register  

Home Dashboard  

Goals Overview  
Goal Category Detail  
Goal Activity Detail  

Appointments  

Profile

---

# Mobile UX Rules

Mobile-first

Center layout like phone screen

Max width around 420-480px

Use rounded cards

Use soft spacing

Use fixed bottom navigation

Keep tap targets large

Avoid clutter

---

# Bottom Navigation

Home  
Goals  
Appointments  
Profile

Bottom nav is visible only in authenticated screens.

---

# Development Phases

Phase 1 – Project Setup

Create Vite project  
Install Tailwind  
Create routing  
Create layout  
Create bottom navigation

Phase 2 – Core Screens

Home  
Goals  
Goal Category  
Goal Activity  
Profile

Phase 3 – Backend

Create Google Apps Script API  
Connect React services

Phase 4 – Deployment

Deploy to Cloudflare Pages  
Test mobile UX

---

# Definition of MVP Done

MVP is complete when:

Web app is deployed

Mobile browser works well

Home loads user data

Goals can be created

Daily logs can be saved

Profile loads correctly

---

# Development Rules

Always mobile-first

Reuse components before creating new ones

Avoid large libraries

Keep TypeScript types strict

Keep UI consistent

Do not redesign outside this spec

Work one screen at a time

---

# Codex Prompt Template

Use this prompt when working with Codex

```
You are helping build a mobile-first wellness web app called Happy Balance.

Stack:

React
Vite
TypeScript
Tailwind CSS
Google Apps Script backend
Google Sheets database

Use PROJECT_SPEC.md as the system specification.

Implement the application step by step.

Rules:

Mobile-first layout
Reuse components
Type-safe code
Minimal dependencies
List files before modifying them
Do not redesign outside the spec
```

---

# Starter Task for Codex

First task

Create shared layout components:

MobileShell  
AuthShell  
AppHeader  
BottomNav  

Use React + TypeScript + Tailwind.

Then start implementing screens one by one.

---

# Future Improvements

Thai localization

Real authentication

Analytics

Notification system

Improved calendar

Advanced goal tracking

---

# Final Note

Focus on shipping a **working mobile-first MVP first**.

Improve later.

Do not try to build everything at once.