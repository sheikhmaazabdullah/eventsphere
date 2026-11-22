🚀 Steps to Run in Your Browser
Step 1 — Install Prerequisites
Download and install (if not already done):

Node.js v18+ → https://nodejs.org (choose LTS)
MongoDB Community → https://www.mongodb.com/try/download/community

Step 2 — Extract the ZIP
Unzip EventSphere_Complete_Project.zip anywhere, e.g. Desktop
Step 3 — Start MongoDB
bash# Windows: MongoDB runs as a service after install — it's already running
# OR start manually:
mongod
Step 4 — Setup & Run the Backend
Open Terminal 1 (Command Prompt / PowerShell):
bashcd eventsphere/backend
npm install
copy .env.example .env        # Windows
# (or: cp .env.example .env   on Mac/Linux)
npm run dev
You should see: ✅ MongoDB Connected and ✅ EventSphere server running on port 5000
Step 5 — Seed Demo Data (one time only)
In the same terminal (or a new one inside backend/):
bashnode utils/seed.js
This creates 3 demo accounts + a published expo with booths and sessions.
Step 6 — Setup & Run the Frontend
Open Terminal 2:
bashcd eventsphere/frontend
npm install
npm run dev
You should see: Local: http://localhost:5173
Step 7 — Open in Browser
Go to: http://localhost:5173
Use these demo logins:








🧪 Complete Step-by-Step Testing Flow
🔴 PHASE 1 — Admin Testing
Login: admin@eventsphere.com / admin123
StepWhat to doWhat you should see1Go to Dashboard3 expos, 8+ users, stat cards, charts populated2Go to Expo ManagementTechFest (published), HealthTech (ongoing), Green Pakistan (draft)3Click Floor Plan on TechFest6×8 grid with 6 rose booths, 2 amber, rest green4Draw 2 new booths on empty cells, click Save PlanNew booth cells appear, saved to DB5Click Exhibitors on TechFestTable with 6 approved + 2 pending (Ayesha, Farah)6Approve Ayesha's pending applicationStatus turns green, assign her booth B17Click Sessions on TechFest12 sessions grouped across 3 days8Add a new session (any title)Appears as a new card9Go to AnalyticsCharts show booth occupancy, registration breakdown10Change TechFest status to ongoingBadge changes colour on expo card

🟡 PHASE 2 — Exhibitor Testing
Login: kamran@techcorp.pk / exhibitor123
StepWhat to doWhat you should see1Go to DashboardRegistered in TechFest, status Approved, Booth A12Click Reserve Booth → Booth ManagementFloor plan — booth A1 highlighted with your ring3Click an available booth (green)Confirmation panel appears4Try clicking an occupied boothNo action — cursor shows not-allowed5Edit booth details — add products/tagsSave Details → booth is updated in real-time6Go to ProfileUpdate bio and interest tags7Go to MessagesSee Ali Ahmed's conversation thread8Reply to Ali's messageMessage appears in thread instantly
Now open a second browser tab, log in as Admin and navigate to Floor Plan — you should see Kamran's booth update in real time.

🟢 PHASE 3 — Attendee Testing
Login: ali@gmail.com / attendee123
StepWhat to doWhat you should see1Go to DashboardTechFest + HealthTech registrations, pre-booked sessions shown2Click Badge on TechFestQR badge with Ali's name, expo, dates, unique badge ID3Click Download as PNGSaves badge image to your Downloads folder4Click Sessions on TechFest12 sessions — first 3 already booked (green)5Book "Cloud-Native Architecture" sessionTurns green immediately, seat count decreases6Cancel a sessionReverts to blue "Book" button7Click AI Match on TechFestTechCorp, EduSmart, AutoTech ranked highest (match Ali's interests)8Click Edit interests → remove "AI", add "Fashion"Recommendations re-rank instantly9Click Tour on TechFestFloor plan with 6 occupied/reserved booths10Hover over booth A1Quick preview: TechCorp, occupied11Click Start Virtual TourAuto-tours through booths A1→A2→A3→A4→A5→A6→B1→B2 with pulse animation12Click skip-forward buttonJumps to next booth13Click Browse EventsTechFest + HealthTech shown (both published/ongoing)14Register for HealthTech Summit (as new expo)QR badge generated, added to dashboard

🔄 PHASE 4 — Real-Time Testing (two browsers)
StepBrowser 1Browser 21Login as kamran@techcorp.pk → Booth Management → TechFest floor planLogin as ali@gmail.com → Virtual Tour → TechFest2Both screens show the same floor plan✅3Browser 1: Reserve an available boothBrowser 2: That booth turns amber without refresh4Login as kamran@techcorp.pk → MessagesLogin as ali@gmail.com → open a different tab5Ali sends a message via Browser 2Message appears in Kamran's chat instantly

🧪 PHASE 5 — Test Different Attendee AI Profiles
LoginInterestsExpected Top Matchessara@gmail.comHealthcare, AIHealthPlus (A2), TechCorp (A1)usman@gmail.comFinance, BlockchainFinPay (A4), then TechCorpmariam@gmail.comFashion, FoodFashionHub (B1), FoodNation (B2)raza@gmail.comEnergy, AutomotiveGreenEnergy (A3), AutoTech (A6)hina@gmail.comEducation, AIEduSmart (A5), HealthPlus (A2)