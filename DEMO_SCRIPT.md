# 🎬 EventSphere — Demo Video Script
## Timestamped Narration for Screen Recording
**Student:** Sheikh Maaz Abdullah | **Enrollment:** 1335472 | **Duration:** ~18 minutes

---

## ⚠️ Before Recording — Setup Checklist
- [ ] Both servers running (backend :5000, frontend :5173)
- [ ] MongoDB has at least one seeded expo with booths and sessions
- [ ] Three browser tabs ready: Admin, Exhibitor, Attendee (use Incognito for extra sessions)
- [ ] Screen resolution: 1920×1080, browser at 100% zoom
- [ ] Microphone tested, background noise removed
- [ ] OBS or screen recorder ready

---

## [00:00 – 00:40] INTRODUCTION

**[Show: Landing page — http://localhost:5173]**

> "Hello! My name is Sheikh Maaz Abdullah, Enrollment Number 1335472, studying ADSE at Aptech FB Area, Karachi.
>
> This is my Semester 5 eProject — **EventSphere**, a full-stack Expo Management Platform built with the MERN stack: MongoDB, Express, React, and Node.js.
>
> EventSphere allows organisations to manage trade shows and expos end-to-end — from creating events and designing booth floor plans, to generating QR badges for attendees and providing AI-powered exhibitor recommendations. Let me walk you through the complete system."

**[Scroll slowly down the landing page showing features section and stats]**

> "The platform supports three distinct user roles: Administrators who organise events, Exhibitors who showcase products, and Attendees who browse and attend. All interfaces are fully responsive, built with Tailwind CSS, and use Socket.IO for real-time updates."

---

## [00:40 – 02:00] REGISTRATION — THREE ROLES

**[Navigate to /register]**

> "Let's start by registering accounts. The registration process has three steps. First, you select your role."

**[Click 'Organiser' role]**

> "I'll create an Admin account first. Notice the role-specific description on each card."

**[Click Continue, fill: Name='TechFest Admin', email='admin@demo.com', password='admin123', company='TechFest Events', click Continue]**

> "Step two collects basic information — name, email, password, and for organisers, a company name. Passwords are hashed using bcrypt before being stored — never in plain text."

**[Click 'Create Account' — lands on Admin Dashboard]**

> "Registration is complete. A JWT token is generated and stored, and we're automatically redirected to the Admin dashboard. Now let me also show Exhibitor and Attendee registration."

**[Open Incognito tab → /register → choose Exhibitor → fill details → show interest tags for Attendee role]**

> "For Attendees, Step 3 lets them pick industry interests — Technology, Healthcare, AI, and so on. These tags feed our AI recommendation engine later."

---

## [02:00 – 04:30] ADMIN — CREATING AN EXPO

**[Switch to Admin tab → /admin/expos]**

> "Back on the Admin portal. Let me create a new expo by clicking 'Create Expo'."

**[Click 'Create Expo' button — modal opens]**

> "The creation form asks for a title, description, dates, location, theme, maximum booth count, and a colour theme for the event banner."

**[Fill: Title='TechFest Karachi 2026', Description='Annual technology and innovation expo', Start='2026-06-10', End='2026-06-12', Location='Expo Centre, Karachi', Theme='Technology & Innovation', MaxBooths=24, pick a colour]**

> "I'll set the status to Published so attendees can see and register for it."

**[Click Create — expo card appears]**

> "The expo is created instantly. Notice the colour-coded banner and status badge. Now let me design the floor plan."

---

## [04:30 – 06:30] ADMIN — FLOOR PLAN EDITOR

**[Click 'Floor Plan' button on the expo card → /admin/expos/:id/floor]**

> "This is the Floor Plan Editor — one of the most unique features of EventSphere. I have a drawing toolbar on the left and a grid canvas on the right."

**[Select 'Booth' tool — click several grid cells to create booths]**

> "I'll paint booths across the grid. Each booth gets an automatic label like A1, B2 based on its row and column."

**[Switch to 'Aisle' tool — draw some aisles between booth rows]**

> "Now I'll add aisles for visitor walkways."

**[Switch to 'Entrance' tool — click a cell at the bottom]**

> "And an entrance at the main access point. The grid gives a visual overview of the entire expo hall layout."

**[Click 'Save Plan']**

> "Clicking Save Plan persists the layout to MongoDB and creates the corresponding Booth documents. In a real deployment, booth status changes — like when an exhibitor reserves a space — would appear here in real-time via Socket.IO."

---

## [06:30 – 07:30] ADMIN — SESSION MANAGEMENT

**[Navigate to /admin/expos/:id/sessions]**

> "The Session Manager lets organisers schedule talks, workshops, and panels within an expo."

**[Click 'Add Session' → fill: Title='Future of AI in Pakistan', Speaker='Dr. Imran Khalid', Start and End times, Capacity=150, Tags='AI, technology']**

> "Each session has a title, speaker, time slot, venue, capacity, and searchable tags. I'll add a couple more sessions to fill out the schedule."

---

## [07:30 – 09:00] ADMIN — EXHIBITOR APPROVALS

**[Navigate to /admin/expos/:id/exhibitors]**

> "This is the Exhibitor Manager. It shows all applications from companies that want to exhibit at this event."

**[Show the pending registrations]**

> "Pending applications are waiting for approval. I can approve, reject, or reset any application."

**[Click the green approve button on one exhibitor]**

> "Approved! The exhibitor gets a real-time notification. After approval, I can also assign them a specific booth from the floor plan."

**[Use the booth assignment dropdown]**

> "I'll assign booth A1 to this exhibitor. The floor plan updates in real-time — any connected browser watching the floor plan will see this change immediately."

---

## [09:00 – 09:30] ADMIN — ANALYTICS

**[Navigate to /admin/analytics]**

> "The Analytics page gives a platform-wide view. I can see total expos, users, registrations, booth occupancy rates, and charts showing registrations by role and expo creation trends over time."

---

## [09:30 – 11:00] EXHIBITOR PORTAL

**[Switch to Exhibitor browser tab → /exhibitor]**

> "Now let's look at the Exhibitor Portal. After logging in, the exhibitor sees their dashboard — registered expos, approval status, and quick actions."

**[Click 'Reserve Booth' → navigate to booth management page]**

> "The exhibitor can see the live floor plan with colour-coded booth status. Green booths are available. Let me click one to reserve it."

**[Click an available booth → confirmation panel appears → click Reserve]**

> "Booth reserved! If you had the Admin tab open side by side, you'd see the booth status change from green to amber in real-time — that's Socket.IO at work."

**[Fill the booth details form — products, services, tags]**

> "The exhibitor fills in their booth profile — products, services, category, and keyword tags. These tags are crucial because they power the AI recommender for attendees."

---

## [11:00 – 13:30] ATTENDEE PORTAL — BROWSE & REGISTER

**[Switch to Attendee browser tab → /attendee/events]**

> "In the Attendee portal, the Browse Events page shows all published expos. I'll register for TechFest Karachi 2026."

**[Click 'Register & Get Badge']**

> "On registration, the backend generates a unique Badge ID using UUID, and creates a QR code data URL using the qrcode library. The attendee is now approved and ready to attend."

---

## [13:30 – 14:30] QR BADGE — INNOVATIVE FEATURE 1

**[Navigate to /attendee/badge/:expoId]**

> "This is the QR Badge — one of our three innovative features. Each badge is completely unique to the attendee-expo combination."

**[Zoom in on badge card]**

> "The badge shows the attendee's name, expo details, a unique badge ID, event dates, and a QR code. Scanning the QR code reveals all the encoded information — attendee name, expo, badge ID, and user ID."

**[Click Download as PNG]**

> "The badge can be downloaded as a PNG image for printing or saving to a phone's photo album."

**[Click Print Badge]**

> "Or printed directly. This is used for physical check-in at the expo entrance."

---

## [14:30 – 16:00] AI RECOMMENDATIONS — INNOVATIVE FEATURE 2

**[Navigate to /attendee/recommendations/:expoId]**

> "This is the AI Exhibitor Recommender — our second innovative feature. No external AI service is used. I implemented a content-based filtering algorithm using Jaccard Similarity."

**[Pause on the algorithm explanation banner]**

> "The algorithm tokenises the attendee's interest tags — like 'Technology', 'AI' — and the exhibitor's product and service tags into word sets. It then calculates the Jaccard coefficient: the size of the intersection divided by the union. The result is a percentage match score."

**[Scroll through recommendation cards]**

> "Exhibitors are ranked from highest to lowest match. The match bar turns green for high matches, amber for medium. Matching tags are highlighted in green so the attendee can see exactly why a recommendation was made."

**[Click 'Edit' on the interests section — toggle some tags — click Save & Refresh]**

> "Attendees can update their interests at any time, and the recommendations refresh instantly."

---

## [16:00 – 17:30] VIRTUAL TOUR — INNOVATIVE FEATURE 3

**[Navigate to /attendee/tour/:expoId]**

> "Our third and final innovative feature — the Virtual Floor Tour. This lets attendees explore the expo floor before attending in person."

**[Hover over different booths on the floor grid]**

> "Hovering over any booth shows a quick preview — the booth number, exhibitor name, and status."

**[Click a booth]**

> "Clicking selects it and opens a full detail panel showing the exhibitor's company, products, services, and tags."

**[Click 'Start Virtual Tour']**

> "Clicking Start Virtual Tour activates auto-tour mode. Every 3 seconds, the tour advances to the next occupied booth, highlighting it with an animated pulse ring and displaying its details in the panel."

**[Let tour run through 3-4 booths]**

> "This gives attendees a full walkthrough of who's exhibiting and what they offer — all before setting foot in the venue."

**[Use pause, skip forward, and zoom controls]**

> "Attendees can pause, manually skip forward or backward, and even zoom the floor plan in or out for a better view."

---

## [17:30 – 18:00] CLOSING

**[Show the landing page one final time]**

> "That concludes the demo of EventSphere — a complete MERN stack expo management platform featuring JWT authentication with role-based access, a floor plan editor with real-time Socket.IO updates, QR badge generation, Jaccard-similarity AI recommendations, and an interactive virtual tour.
>
> The full source code, MongoDB schemas, API documentation, and eProject report are included in the submission package.
>
> Thank you for watching. This is Sheikh Maaz Abdullah, Enrollment 1335472, Aptech FB Area, Karachi."

---

## 📝 Recording Tips
- Speak at a steady pace — pause 1 second between major actions
- Use cursor highlighting tool if available
- Record in one take where possible; if you stop, resume at a natural section break
- Total target: **15–18 minutes**
- Export as: **MP4, 1080p, H.264**
