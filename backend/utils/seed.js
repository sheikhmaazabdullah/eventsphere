/**
 * EventSphere — Large Realistic Demo Seed
 * Run: node utils/seed.js
 * Creates: 1 Admin, 8 Exhibitors, 6 Attendees,
 *          3 Expos, 24 Booths, 14 Sessions,
 *          15 Registrations, 6 Messages
 */
require('dotenv').config();
const mongoose       = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const QRCode         = require('qrcode');

const User         = require('../models/User');
const Expo         = require('../models/Expo');
const Booth        = require('../models/Booth');
const Session      = require('../models/Session');
const Registration = require('../models/Registration');
const Message      = require('../models/Message');

const uid = () => uuidv4().split('-')[0].toUpperCase();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅  MongoDB connected\n');

  await Promise.all([User,Expo,Booth,Session,Registration,Message].map(M => M.deleteMany({})));
  console.log('🗑️   Cleared all collections');

  /* ── USERS ── */
  const [admin] = await User.create([{
    name:'Zara Hussain', email:'admin@eventsphere.com', password:'admin123',
    role:'admin', company:'EventSphere Pakistan', phone:'+92-21-3456789',
    bio:'Senior Event Strategist with 10+ years of expo management experience.',
  }]);

  const exhibitors = await User.create([
    { name:'Kamran Mirza',   email:'kamran@techcorp.pk',    password:'exhibitor123', role:'exhibitor', company:'TechCorp Pakistan',     phone:'+92-300-1234567', bio:'Enterprise software for 500+ Pakistani companies.', interests:['Technology','Software','AI'] },
    { name:'Sadia Iqbal',    email:'sadia@healthplus.pk',   password:'exhibitor123', role:'exhibitor', company:'HealthPlus Medical',     phone:'+92-321-9876543', bio:'Affordable healthcare technology for Pakistani hospitals.', interests:['Healthcare','Technology','AI'] },
    { name:'Bilal Chaudhry', email:'bilal@greenenergy.pk',  password:'exhibitor123', role:'exhibitor', company:'GreenEnergy Solutions',  phone:'+92-333-5556666', bio:'Solar and wind energy for residential and commercial use.', interests:['Energy','Environment','Technology'] },
    { name:'Ayesha Raza',    email:'ayesha@fashionhub.pk',  password:'exhibitor123', role:'exhibitor', company:'FashionHub PK',          phone:'+92-312-7778888', bio:'Premium Pakistani fashion brand with international presence.', interests:['Fashion','Retail','E-commerce'] },
    { name:'Hassan Qureshi', email:'hassan@finpay.pk',      password:'exhibitor123', role:'exhibitor', company:'FinPay Technologies',    phone:'+92-345-3334444', bio:'Digital payment solutions and fintech infrastructure.', interests:['Finance','Technology','Blockchain'] },
    { name:'Nadia Farooq',   email:'nadia@edusmart.pk',     password:'exhibitor123', role:'exhibitor', company:'EduSmart Pakistan',      phone:'+92-311-2223333', bio:'E-learning platforms for Pakistani schools and colleges.', interests:['Education','Technology','AI'] },
    { name:'Omar Shaikh',    email:'omar@autotech.pk',      password:'exhibitor123', role:'exhibitor', company:'AutoTech Industries',    phone:'+92-302-6667777', bio:'Electric vehicle components and automotive innovation.', interests:['Automotive','Technology','Energy'] },
    { name:'Farah Malik',    email:'farah@foodnation.pk',   password:'exhibitor123', role:'exhibitor', company:'FoodNation Pakistan',    phone:'+92-315-4445555', bio:'Premium packaged food and beverages — export quality.', interests:['Food & Beverage','Retail','E-commerce'] },
  ]);

  const attendees = await User.create([
    { name:'Ali Ahmed',    email:'ali@gmail.com',    password:'attendee123', role:'attendee', phone:'+92-300-1112222', interests:['Technology','AI','Software','Education'] },
    { name:'Sara Khan',    email:'sara@gmail.com',   password:'attendee123', role:'attendee', phone:'+92-321-3334444', interests:['Healthcare','Technology','AI','Education'] },
    { name:'Usman Tariq',  email:'usman@gmail.com',  password:'attendee123', role:'attendee', phone:'+92-333-5556666', interests:['Finance','Blockchain','Technology','Automotive'] },
    { name:'Mariam Baig',  email:'mariam@gmail.com', password:'attendee123', role:'attendee', phone:'+92-312-7778888', interests:['Fashion','Food & Beverage','Retail','Art'] },
    { name:'Raza Hussain', email:'raza@gmail.com',   password:'attendee123', role:'attendee', phone:'+92-345-9990000', interests:['Energy','Automotive','Technology','Environment'] },
    { name:'Hina Javed',   email:'hina@gmail.com',   password:'attendee123', role:'attendee', phone:'+92-311-1112222', interests:['Education','Technology','AI','Healthcare'] },
  ]);

  console.log(`✅  Users: 1 admin, ${exhibitors.length} exhibitors, ${attendees.length} attendees`);

  /* ── FLOOR PLAN ── */
  const fp = { rows:6, cols:8, cells:[
    ...[0,1,2,3,4,5].map(c=>({row:0,col:c,type:'booth',label:`A${c+1}`})),
    {row:0,col:6,type:'aisle',label:''},{row:0,col:7,type:'aisle',label:''},
    ...[0,1,2,3,4,5,6,7].map(c=>({row:1,col:c,type:'aisle',label:''})),
    ...[0,1,2,3,4,5].map(c=>({row:2,col:c,type:'booth',label:`B${c+1}`})),
    {row:2,col:6,type:'aisle',label:''},{row:2,col:7,type:'aisle',label:''},
    ...[0,1,2,3,4,5,6,7].map(c=>({row:3,col:c,type:'aisle',label:''})),
    ...[0,1,2,3,4,5].map(c=>({row:4,col:c,type:'booth',label:`C${c+1}`})),
    {row:4,col:6,type:'aisle',label:''},{row:4,col:7,type:'aisle',label:''},
    ...[0,1,2,3,4,5].map(c=>({row:5,col:c,type:'booth',label:`D${c+1}`})),
    {row:5,col:6,type:'entrance',label:'ENTRY'},{row:5,col:7,type:'entrance',label:'ENTRY'},
  ]};

  /* ── EXPOS ── */
  const [expo1, expo2, expo3] = await Expo.create([
    {
      title:'TechFest Karachi 2026', organizer:admin._id,
      description:"Pakistan's largest annual technology and innovation expo — 200+ exhibitors, 5,000+ attendees, 30+ speakers across 3 days of workshops, panels, and product launches.",
      startDate:new Date('2026-06-10'), endDate:new Date('2026-06-12'),
      location:'Expo Centre, University Road, Karachi',
      theme:'Technology & Innovation', category:'Technology',
      bannerColor:'#6366f1', status:'published', maxBooths:24,
      tags:['technology','AI','software','startup','innovation'], floorPlan:fp,
    },
    {
      title:'HealthTech Summit Lahore 2026', organizer:admin._id,
      description:'Premier healthcare technology conference connecting medical professionals, health-tech startups, and hospital procurement teams.',
      startDate:new Date('2026-05-20'), endDate:new Date('2026-05-22'),
      location:'Pearl Continental Hotel, Lahore',
      theme:'Digital Health & MedTech', category:'Healthcare',
      bannerColor:'#10b981', status:'ongoing', maxBooths:16,
      tags:['healthcare','medtech','AI','digital health'],
      floorPlan:{ rows:4, cols:6, cells:[
        ...[0,1,2,3,4,5].map(c=>({row:0,col:c,type:'booth',label:`H${c+1}`})),
        ...[0,1,2,3,4,5].map(c=>({row:1,col:c,type:'aisle',label:''})),
        ...[0,1,2,3,4,5].map(c=>({row:2,col:c,type:'booth',label:`J${c+1}`})),
        ...[0,1,3,4].map(c=>({row:3,col:c,type:'aisle',label:''})),
        {row:3,col:2,type:'entrance',label:'ENTRY'},{row:3,col:5,type:'entrance',label:'EXIT'},
      ]},
    },
    {
      title:'Green Pakistan Expo 2026', organizer:admin._id,
      description:'Sustainability-focused expo showcasing renewable energy, electric vehicles, eco-friendly packaging, and clean technology.',
      startDate:new Date('2026-07-15'), endDate:new Date('2026-07-17'),
      location:'F-9 Park Expo Ground, Islamabad',
      theme:'Sustainability & Clean Tech', category:'Energy',
      bannerColor:'#059669', status:'draft', maxBooths:20,
      tags:['energy','sustainability','electric vehicles','solar'],
      floorPlan:{ rows:4, cols:5, cells:[
        ...[0,1,2,3,4].map(c=>({row:0,col:c,type:'booth',label:`E${c+1}`})),
        ...[0,1,2,3,4].map(c=>({row:1,col:c,type:'aisle',label:''})),
        ...[0,1,2,3,4].map(c=>({row:2,col:c,type:'booth',label:`F${c+1}`})),
        {row:3,col:0,type:'aisle',label:''},{row:3,col:1,type:'aisle',label:''},
        {row:3,col:2,type:'entrance',label:'ENTRY'},
        {row:3,col:3,type:'aisle',label:''},{row:3,col:4,type:'aisle',label:''},
      ]},
    },
  ]);
  console.log(`✅  Expos: 3 created`);

  /* ── BOOTHS ── */
  const boothDefs = [
    {num:'A1',r:0,c:0,st:'occupied', ex:0, sz:'large',  pr:['CRM Pro','ERP Suite','HRM Cloud'],       sv:['Cloud Hosting','24/7 Support','Data Migration'],   tg:['software','enterprise','cloud','CRM'],           cat:'Software',      dc:"Enterprise software trusted by 500+ Pakistani companies."},
    {num:'A2',r:0,c:1,st:'occupied', ex:1, sz:'large',  pr:['MediTrack','PatientHub','DrConnect'],    sv:['Hospital IT','Telemedicine','Health Analytics'],   tg:['healthcare','hospital','telemedicine','AI'],      cat:'Healthcare',    dc:"Digital health solutions transforming patient care across Pakistan."},
    {num:'A3',r:0,c:2,st:'occupied', ex:2, sz:'medium', pr:['SolarPanel X3','WindMicro 500'],         sv:['Energy Audit','Installation','Maintenance'],       tg:['solar','wind','renewable','energy'],              cat:'Energy',        dc:"Sustainable energy solutions for homes and businesses."},
    {num:'A4',r:0,c:3,st:'occupied', ex:4, sz:'medium', pr:['PaySwift','WalletPK','QRPay'],           sv:['Payment Gateway','KYC Solutions','API Banking'],   tg:['fintech','payments','digital wallet','banking'],  cat:'Finance',       dc:"Next-generation digital payments for Pakistan's cashless future."},
    {num:'A5',r:0,c:4,st:'occupied', ex:5, sz:'medium', pr:['EduLearn LMS','QuizMaster','CodeKids'],  sv:['Teacher Training','Content Dev','Analytics'],     tg:['education','e-learning','LMS','coding'],          cat:'Education',     dc:"Empowering 100,000+ Pakistani students with smart learning tools."},
    {num:'A6',r:0,c:5,st:'occupied', ex:6, sz:'medium', pr:['EV Motor Kit','SmartCharger','BMS'],     sv:['EV Conversion','Battery Service','Training'],     tg:['automotive','EV','electric','battery'],           cat:'Automotive',    dc:"Electric vehicle technology designed for Pakistani roads."},
    {num:'B1',r:2,c:0,st:'reserved', ex:3, sz:'medium', pr:['Lawn Collection','Bridal Range'],        sv:['Custom Tailoring','B2B Wholesale','Export'],       tg:['fashion','clothing','luxury','retail'],           cat:'Fashion',       dc:"Award-winning Pakistani fashion from runways to retail."},
    {num:'B2',r:2,c:1,st:'reserved', ex:7, sz:'medium', pr:['Biryani Masala','Achaar Range','Juices'],sv:['Private Label','Export Consulting','Sampling'],   tg:['food','beverages','FMCG','export'],               cat:'Food & Beverage',dc:"Export-quality food with authentic Pakistani flavours."},
    {num:'B3',r:2,c:2,st:'available',ex:-1,sz:'small',  pr:[], sv:[], tg:['technology','IoT'],          cat:'Technology',    dc:''},
    {num:'B4',r:2,c:3,st:'available',ex:-1,sz:'small',  pr:[], sv:[], tg:['startup','SaaS'],            cat:'Software',      dc:''},
    {num:'B5',r:2,c:4,st:'available',ex:-1,sz:'small',  pr:[], sv:[], tg:['AI','robotics'],              cat:'Robotics',      dc:''},
    {num:'B6',r:2,c:5,st:'available',ex:-1,sz:'small',  pr:[], sv:[], tg:['cybersecurity'],              cat:'Security',      dc:''},
    {num:'C1',r:4,c:0,st:'available',ex:-1,sz:'small',  pr:[], sv:[], tg:['blockchain','crypto'],        cat:'Finance',       dc:''},
    {num:'C2',r:4,c:1,st:'available',ex:-1,sz:'small',  pr:[], sv:[], tg:['gaming','AR/VR'],             cat:'Gaming',        dc:''},
    {num:'C3',r:4,c:2,st:'available',ex:-1,sz:'small',  pr:[], sv:[], tg:['real estate','proptech'],     cat:'Real Estate',   dc:''},
    {num:'C4',r:4,c:3,st:'available',ex:-1,sz:'small',  pr:[], sv:[], tg:['logistics','supply chain'],   cat:'Logistics',     dc:''},
    {num:'C5',r:4,c:4,st:'available',ex:-1,sz:'small',  pr:[], sv:[], tg:['media','advertising'],        cat:'Media',         dc:''},
    {num:'C6',r:4,c:5,st:'available',ex:-1,sz:'small',  pr:[], sv:[], tg:['agriculture','agri-tech'],    cat:'Agriculture',   dc:''},
  ];

  const booths = await Booth.insertMany(boothDefs.map(b=>({
    expo:expo1._id, boothNumber:b.num, position:{row:b.r,col:b.c},
    size:b.sz, status:b.st, exhibitor:b.ex>=0?exhibitors[b.ex]._id:null,
    products:b.pr, services:b.sv, tags:b.tg, category:b.cat, description:b.dc,
    price:b.st==='occupied'?50000:b.st==='reserved'?35000:25000,
  })));

  const healthBooths = await Booth.insertMany([
    {expo:expo2._id,boothNumber:'H1',position:{row:0,col:0},size:'large', status:'occupied', exhibitor:exhibitors[1]._id,products:['MediTrack'],services:['Hospital IT'],tags:['healthcare','AI'],category:'Healthcare',description:'Smart hospital systems.'},
    {expo:expo2._id,boothNumber:'H2',position:{row:0,col:1},size:'medium',status:'available',tags:['pharma'],category:'Pharma'},
    {expo:expo2._id,boothNumber:'H3',position:{row:0,col:2},size:'medium',status:'reserved', tags:['diagnostics'],category:'Diagnostics'},
    {expo:expo2._id,boothNumber:'H4',position:{row:0,col:3},size:'medium',status:'available',tags:['dental'],category:'Dental'},
    {expo:expo2._id,boothNumber:'H5',position:{row:0,col:4},size:'small', status:'available',tags:['telemedicine'],category:'Telemedicine'},
    {expo:expo2._id,boothNumber:'H6',position:{row:0,col:5},size:'small', status:'available',tags:['nutrition'],category:'Nutrition'},
  ]);

  console.log(`✅  Booths: ${booths.length} (TechFest) + ${healthBooths.length} (HealthTech)`);

  /* ── SESSIONS ── */
  const sessions = await Session.insertMany([
    {expo:expo1._id, title:'Opening Keynote: AI Revolution in Pakistan',       speaker:'Dr. Imran Khalid',      speakerBio:'CTO, NUST — 20 yrs AI research.',             description:"Inspiring vision of how AI will reshape Pakistan's economy, healthcare, agriculture, and education.",         startTime:new Date('2026-06-10T09:00'), endTime:new Date('2026-06-10T10:00'), venue:'Grand Auditorium', capacity:500, tags:['AI','keynote']},
    {expo:expo1._id, title:'MERN Stack: Building Production-Ready Apps',       speaker:'Sana Mirza',            speakerBio:'Lead Engineer, Careem — 8 yrs full-stack.',   description:'Hands-on workshop: project structure, JWT, MongoDB indexing, Socket.IO, and cloud deployment.',              startTime:new Date('2026-06-10T10:30'), endTime:new Date('2026-06-10T12:00'), venue:'Workshop Hall A',  capacity:120, tags:['MERN','workshop','web dev']},
    {expo:expo1._id, title:'Startup Funding in Pakistan: VC Landscape 2026',   speaker:'Ahmed Bilgrami',        speakerBio:'Managing Partner, i2i Ventures.',             description:'What Pakistani VCs look for, how to pitch, valuations in 2026, and which sectors attract capital.',          startTime:new Date('2026-06-10T14:00'), endTime:new Date('2026-06-10T15:00'), venue:'Conference Room B',capacity:200, tags:['startup','funding','VC']},
    {expo:expo1._id, title:'Cybersecurity Essentials for Modern Businesses',   speaker:'Col. (r) Farhan Masood',speakerBio:'Founder, CyberSec Pakistan.',                 description:'Real-world Pakistani data breach case studies and a practical protection framework for 2026.',                  startTime:new Date('2026-06-10T15:30'), endTime:new Date('2026-06-10T16:30'), venue:'Conference Room A',capacity:150, tags:['cybersecurity','enterprise']},
    {expo:expo1._id, title:'Fintech & Digital Payments: Cashless Pakistan',    speaker:'Maryam Usman',          speakerBio:'CEO, FinPay Technologies.',                   description:'Mobile wallets, QR payments, and open banking APIs — opportunities for 220 million Pakistanis.',               startTime:new Date('2026-06-11T09:30'), endTime:new Date('2026-06-11T10:30'), venue:'Main Stage',       capacity:300, tags:['fintech','payments','banking']},
    {expo:expo1._id, title:'Building EdTech for the Pakistani Classroom',      speaker:'Nadia Farooq',          speakerBio:'CEO, EduSmart Pakistan.',                     description:'Scaling an LMS to 100,000+ users — content localisation, low-bandwidth design, teacher adoption.',            startTime:new Date('2026-06-11T11:00'), endTime:new Date('2026-06-11T12:00'), venue:'Workshop Hall B',  capacity:100, tags:['edtech','education','e-learning']},
    {expo:expo1._id, title:'Electric Vehicles in Pakistan: Challenges & Opps', speaker:'Omar Shaikh',           speakerBio:'CEO, AutoTech Industries.',                   description:"Pakistan's EV policy, infrastructure gap, local manufacturing, and converting petrol rickshaws to electric.",  startTime:new Date('2026-06-11T14:00'), endTime:new Date('2026-06-11T15:00'), venue:'Conference Room A',capacity:180, tags:['EV','automotive','clean energy']},
    {expo:expo1._id, title:'Networking Mixer: Women in Tech Pakistan',         speaker:'Panel of 5 Leaders',    speakerBio:'Industry leaders across tech sectors.',       description:'Informal but powerful networking for women tech professionals, founders, and students.',                        startTime:new Date('2026-06-11T17:00'), endTime:new Date('2026-06-11T18:30'), venue:'Rooftop Terrace',  capacity:250, tags:['networking','women in tech']},
    {expo:expo1._id, title:'Cloud-Native Architecture on AWS & Azure',         speaker:'Tariq Sohail',          speakerBio:'Solutions Architect, AWS Pakistan.',          description:'Microservices, Docker, CI/CD, and cost-optimised cloud patterns with a live MERN deployment demo.',           startTime:new Date('2026-06-12T10:00'), endTime:new Date('2026-06-12T12:00'), venue:'Workshop Hall A',  capacity:80,  tags:['cloud','AWS','DevOps']},
    {expo:expo1._id, title:'Blockchain Beyond Crypto: Real-World Use Cases',   speaker:'Zubair Hassan',         speakerBio:'Blockchain Lead, Systems Ltd.',               description:'Supply chain transparency, land registry, trade finance, and counterfeit detection using blockchain in Pakistan.',startTime:new Date('2026-06-12T13:00'), endTime:new Date('2026-06-12T14:00'), venue:'Conference Room B',capacity:120, tags:['blockchain','supply chain']},
    {expo:expo1._id, title:'Pitch Competition: Top 10 Pakistani Startups',     speaker:'Judges Panel',          speakerBio:'VCs, Angels, and Corporate Innovation Heads.',description:'Ten startups pitch live for PKR 5,000,000 in prizes, VC meetings, and media coverage.',                         startTime:new Date('2026-06-12T15:00'), endTime:new Date('2026-06-12T17:00'), venue:'Grand Auditorium', capacity:500, tags:['startup','pitch','competition']},
    {expo:expo1._id, title:'Closing Ceremony & TechFest Awards 2026',          speaker:'Zara Hussain',          speakerBio:'CEO, EventSphere Pakistan.',                  description:'Recognising best exhibitors, most innovative product, best startup pitch, and most impactful session.',         startTime:new Date('2026-06-12T17:30'), endTime:new Date('2026-06-12T19:00'), venue:'Grand Auditorium', capacity:600, tags:['awards','closing']},
  ]);

  const healthSessions = await Session.insertMany([
    {expo:expo2._id, title:'AI Diagnostics: Saving Lives Faster',              speaker:'Dr. Sara Rehman',       startTime:new Date('2026-05-20T09:00'), endTime:new Date('2026-05-20T10:00'), venue:'Main Hall',capacity:200, tags:['AI','diagnostics']},
    {expo:expo2._id, title:'Telemedicine in Rural Pakistan',                   speaker:'Dr. Khalid Mehmood',    startTime:new Date('2026-05-21T11:00'), endTime:new Date('2026-05-21T12:00'), venue:'Hall B',   capacity:150, tags:['telemedicine','rural health']},
  ]);

  console.log(`✅  Sessions: ${sessions.length} (TechFest) + ${healthSessions.length} (HealthTech)`);

  /* ── REGISTRATIONS ── */
  // Exhibitors — 6 approved (with booths), 2 pending
  await Registration.insertMany(exhibitors.map((ex,i)=>({
    user:ex._id, expo:expo1._id, role:'exhibitor',
    status: i<6?'approved':'pending',
    badgeId:`EXH-${uid()}`, company:ex.company,
    booth: i<6 ? booths[i]._id : null,
    interests:ex.interests,
  })));

  // Attendees — all approved, with QR codes + pre-booked sessions
  const sessionSlices = [
    [0,1,2],   // Ali    — keynote, MERN workshop, startup funding
    [0,3,4],   // Sara   — keynote, cybersecurity, fintech
    [0,4,9],   // Usman  — keynote, fintech, blockchain
    [0,7],     // Mariam — keynote, women in tech mixer
    [0,6,7],   // Raza   — keynote, EVs, women mixer
    [0,1,5,8], // Hina   — keynote, MERN, edtech, cloud
  ];

  for (const [i, att] of attendees.entries()) {
    const badgeId = `EVT-${uid()}`;
    const qrData  = JSON.stringify({ badgeId, attendee:att.name, expo:expo1.title, expoId:expo1._id });
    const qrCode  = await QRCode.toDataURL(qrData, { width:300, margin:2 });
    const bookedSessions = sessionSlices[i].map(idx => sessions[idx]._id);

    await Registration.create({
      user:att._id, expo:expo1._id, role:'attendee', status:'approved',
      badgeId, qrCode, interests:att.interests,
      sessions: bookedSessions,
      checkedIn: i < 3,
    });

    await Session.updateMany(
      { _id:{ $in: bookedSessions } },
      { $addToSet:{ registeredAttendees: att._id } }
    );
  }

  // Ali also registered for HealthTech
  const aliBadge = `EVT-${uid()}`;
  const aliQR    = await QRCode.toDataURL(JSON.stringify({ badgeId:aliBadge, attendee:attendees[0].name, expo:expo2.title }), { width:300, margin:2 });
  await Registration.create({ user:attendees[0]._id, expo:expo2._id, role:'attendee', status:'approved', badgeId:aliBadge, qrCode:aliQR, interests:attendees[0].interests, sessions:[healthSessions[0]._id] });

  console.log(`✅  Registrations created`);

  /* ── MESSAGES ── */
  await Message.insertMany([
    { sender:attendees[0]._id, receiver:exhibitors[0]._id, expo:expo1._id, content:"Hi TechCorp! I'm a software engineer interested in your ERP Suite. Is it compatible with multi-currency? We operate in Pakistan & UAE.", read:true },
    { sender:exhibitors[0]._id,receiver:attendees[0]._id,  expo:expo1._id, content:"Hello Ali! Absolutely — ERP Suite supports PKR, AED, USD and 12 other currencies. Would you like a live demo at booth A1?", read:true },
    { sender:attendees[0]._id, receiver:exhibitors[0]._id, expo:expo1._id, content:"That sounds great! I'll be there June 10th around 2pm. Can you share your pricing brochure?", read:false },
    { sender:attendees[1]._id, receiver:exhibitors[1]._id, expo:expo1._id, content:"Dr. team at HealthPlus — I'm a hospital admin. How does PatientHub integrate with existing HIS (Shifa International setup)?", read:true },
    { sender:exhibitors[1]._id,receiver:attendees[1]._id,  expo:expo1._id, content:"Great question Sara! PatientHub has pre-built HL7 connectors and we've done 3 Shifa integrations. Let's discuss at booth A2.", read:false },
    { sender:attendees[2]._id, receiver:exhibitors[4]._id, expo:expo1._id, content:"Hi FinPay! Does QRPay work offline? We have stores in areas with spotty internet.", read:false },
  ]);

  console.log(`✅  Messages: 6 sample conversations\n`);

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉  SEED COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔐  DEMO ACCOUNTS
    Admin     → admin@eventsphere.com       / admin123
    Exhibitor → kamran@techcorp.pk          / exhibitor123
    Exhibitor → sadia@healthplus.pk         / exhibitor123
    Exhibitor → bilal@greenenergy.pk        / exhibitor123
    Exhibitor → ayesha@fashionhub.pk        / exhibitor123
    Exhibitor → hassan@finpay.pk            / exhibitor123
    Exhibitor → nadia@edusmart.pk           / exhibitor123
    Exhibitor → omar@autotech.pk            / exhibitor123
    Exhibitor → farah@foodnation.pk         / exhibitor123
    Attendee  → ali@gmail.com               / attendee123
    Attendee  → sara@gmail.com              / attendee123
    Attendee  → usman@gmail.com             / attendee123
    Attendee  → mariam@gmail.com            / attendee123
    Attendee  → raza@gmail.com              / attendee123
    Attendee  → hina@gmail.com              / attendee123

📊  DATA
    3 Expos • ${booths.length+healthBooths.length} Booths • ${sessions.length+healthSessions.length} Sessions
    6 occupied booths • 2 reserved • 12+ available
    Each attendee has pre-booked 2-4 sessions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => { console.error('❌ Seed failed:', err.message); process.exit(1); });
