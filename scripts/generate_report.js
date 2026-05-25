/**
 * StudyBuddy — Full Project Report Generator
 * Run: node scripts/generate_report.js
 * Output: StudyBuddy_Project_Report.docx
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  LevelFormat,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  ShadingType,
  TabStopPosition,
  TabStopType,
  Table,
  TableCell,
  TableOfContents,
  TableRow,
  TextRun,
  WidthType,
  convertInchesToTwip,
} from 'docx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUTPUT = path.join(ROOT, 'StudyBuddy_Project_Report.docx')

const META = {
  author: 'Muneeb',
  version: '0.0.0',
  date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  repository: 'https://github.com/MuneebX00/studybudy.git',
  stack: 'React 19 + Vite 6 + Express 5 + MongoDB + Socket.io',
}

const PROJECT_TREE = fs.readFileSync(path.join(ROOT, 'project_tree.txt'), 'utf8').trim()

// ─── Helpers ────────────────────────────────────────────────────────────────

const p = (text, opts = {}) =>
  new Paragraph({
    spacing: opts.spacing,
    alignment: opts.alignment,
    heading: opts.heading,
    numbering: opts.numbering,
    border: opts.border,
    shading: opts.shading,
    indent: opts.indent,
    children: Array.isArray(text)
      ? text
      : [new TextRun({ text, font: opts.font || 'Arial', size: opts.size || 24, bold: opts.bold, color: opts.color, italics: opts.italics })],
  })

const heading1 = (text) =>
  p(text, { heading: HeadingLevel.HEADING_1, size: 36, bold: true, color: '0F1117', spacing: { before: 360, after: 180 } })

const heading2 = (text) =>
  p(text, { heading: HeadingLevel.HEADING_2, size: 28, bold: true, color: '6C63FF', spacing: { before: 280, after: 120 } })

const heading3 = (text) =>
  p(text, { heading: HeadingLevel.HEADING_3, size: 24, bold: true, color: '374151', spacing: { before: 200, after: 80 } })

const body = (text) => p(text, { spacing: { after: 160 } })

const codeBlock = (text) =>
  p(text, {
    font: 'Courier New',
    size: 20,
    color: '374151',
    shading: { fill: 'F3F4F6', type: ShadingType.CLEAR },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: '6C63FF', space: 4 } },
    indent: { left: 360 },
    spacing: { before: 80, after: 80 },
  })

const makeTable = (headers, rows, colWidths) => {
  const total = colWidths.reduce((a, b) => a + b, 0)
  const cellBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  }

  const makeCell = (text, width, isHeader, rowIdx) =>
    new TableCell({
      width: { size: width, type: WidthType.DXA },
      borders: cellBorder,
      shading: { fill: isHeader ? 'EEF0FF' : rowIdx % 2 === 0 ? 'FFFFFF' : 'F9FAFB', type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: String(text),
              font: 'Arial',
              size: 20,
              bold: isHeader,
              color: isHeader ? '6C63FF' : '0F1117',
            }),
          ],
        }),
      ],
    })

  const headerRow = new TableRow({
    children: headers.map((h, i) => makeCell(h, colWidths[i], true, 0)),
  })

  const bodyRows = rows.map(
    (row, rowIdx) =>
      new TableRow({
        children: row.map((cell, i) => makeCell(cell, colWidths[i], false, rowIdx + 1)),
      })
  )

  return new Table({
    columnWidths: colWidths,
    width: { size: total, type: WidthType.DXA },
    rows: [headerRow, ...bodyRows],
  })
}

const bulletConfig = {
  config: [
    {
      reference: 'bullets',
      levels: [
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: '\u2022',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        },
      ],
    },
  ],
}

const bullet = (text) =>
  new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, font: 'Arial', size: 24 })],
  })

const numbered = (items, ref = 'numbers') =>
  items.map(
    (text, i) =>
      new Paragraph({
        numbering: { reference: ref, level: 0 },
        spacing: { after: 80 },
        children: [new TextRun({ text, font: 'Arial', size: 24 })],
      })
  )

const numberConfig = {
  config: [
    {
      reference: 'numbers',
      levels: [
        {
          level: 0,
          format: LevelFormat.DECIMAL,
          text: '%1.',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        },
      ],
    },
  ],
}

const architectureDiagram = [
  '┌─────────────────────────────────────────────────────────────┐',
  '│                        CLIENT LAYER                          │',
  '│              React SPA (Vite) — Port 5173                   │',
  '│         Pages → Components → Hooks → Context/State          │',
  '└──────────────────────┬──────────────────────────────────────┘',
  '                       │ HTTP / REST + WebSocket',
  '                       ▼',
  '┌─────────────────────────────────────────────────────────────┐',
  '│                        API LAYER                             │',
  '│            Node.js + Express — Port 5003 (default 5000)     │',
  '│    Auth → Booking → Payment → Tutor → Student → Admin       │',
  '└──────────────────────┬──────────────────────────────────────┘',
  '                       │ Mongoose ODM',
  '                       ▼',
  '┌─────────────────────────────────────────────────────────────┐',
  '│                      DATA LAYER                              │',
  '│                   MongoDB (Local / Atlas)                    │',
  '│     Users · TutorProfiles · Bookings · Reviews · AuditLogs  │',
  '└─────────────────────────────────────────────────────────────┘',
  '                       │',
  '                       ▼',
  '┌─────────────────────────────────────────────────────────────┐',
  '│                  EXTERNAL / MOCK SERVICES                    │',
  '│   Mock PayPal Checkout · Mock Zoom Meeting Links · Socket.io│',
  '└─────────────────────────────────────────────────────────────┘',
]

// ─── Cover Page ─────────────────────────────────────────────────────────────

const coverSection = [
  new Paragraph({ spacing: { before: 2400 } }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: 'StudyBuddy', font: 'Arial', size: 72, bold: true, color: '0F1117' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [new TextRun({ text: 'Full Project Report', font: 'Arial', size: 36, color: '6C63FF' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 600 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '6C63FF', space: 1 } },
    children: [new TextRun({ text: ' ', size: 12 })],
  }),
  makeTable(
    ['Label', 'Value'],
    [
      ['Prepared by', META.author],
      ['Version', META.version],
      ['Date', META.date],
      ['Stack', META.stack],
      ['Repository', META.repository],
    ],
    [2340, 7020]
  ),
  new Paragraph({ children: [new PageBreak()] }),
]

// ─── Main Content ───────────────────────────────────────────────────────────

const mainContent = [
  new TableOfContents('Table of Contents', {
    hyperlink: true,
    headingStyleRange: '1-3',
    stylesWithLevels: [
      { styleName: 'Heading1', level: 1 },
      { styleName: 'Heading2', level: 2 },
      { styleName: 'Heading3', level: 3 },
    ],
  }),
  new Paragraph({ children: [new PageBreak()] }),

  // 1. Executive Summary
  heading1('1. Executive Summary'),
  body(
    'StudyBuddy is a full-stack online tutoring marketplace that connects students with qualified tutors for one-on-one learning sessions. Built as a MERN-style application (MongoDB, Express, React, Node.js), the platform serves three distinct user roles — students, tutors, and administrators — each with tailored dashboards and workflows.'
  ),
  body(
    'The core value proposition is a streamlined end-to-end experience: students discover approved tutors by subject, book available time slots, and complete payment through a premium checkout interface; tutors manage their profiles, view bookings, and mark sessions complete; administrators oversee user accounts, tutor approvals, platform analytics, and audit logs.'
  ),
  body(
    'Key modules implemented include JWT-based authentication with role-based access control, a two-step booking and mock PayPal payment flow, real-time Socket.io notifications for booking events, a post-session review system, and a redesigned fintech-inspired payment UI. The project is currently in active development, running locally on Vite (port 5173) and Express (port 5003), and is suitable for academic demonstration, portfolio presentation, or further production hardening.'
  ),

  // 2. Project Overview
  heading1('2. Project Overview'),
  heading2('2.1 Problem Statement'),
  body(
    'Finding qualified, affordable tutors online remains fragmented. Students struggle to verify tutor credentials, compare rates, and book sessions without friction. Tutors lack a unified platform to list services, manage availability, receive payments, and track earnings. Existing solutions often combine outdated UI with complex booking flows, reducing trust and conversion at checkout.'
  ),
  heading2('2.2 Solution'),
  body(
    'StudyBuddy addresses these pain points as a dedicated tutoring marketplace. Students browse approved tutor profiles filtered by subject, select available time slots via an interactive date picker, and pay through a secure mock checkout. Tutors complete profile setup, await admin approval, then manage sessions from a dedicated dashboard. Administrators maintain platform integrity through user management, tutor approval workflows, and audit logging.'
  ),
  heading2('2.3 Target Users'),
  makeTable(
    ['Student', 'Tutor'],
    [
      ['Browse tutors by subject', 'Create and manage tutor profile'],
      ['View tutor ratings and bio', 'Set hourly rate and subjects offered'],
      ['Book sessions via date/time picker', 'View upcoming and past bookings'],
      ['Pay online via mock checkout', 'Mark sessions as complete'],
      ['Track session history and spending', 'View earnings and session stats'],
      ['Submit post-session reviews', 'Receive real-time booking notifications'],
    ],
    [4680, 4680]
  ),
  heading2('2.4 Project Scope'),
  heading3('In Scope'),
  bullet('User registration and login with role selection (student, tutor, admin)'),
  bullet('Tutor profile creation, admin approval, and searchable tutor directory'),
  bullet('Session booking with availability slot management'),
  bullet('Mock PayPal payment checkout with test card simulation'),
  bullet('Student, tutor, and admin dashboards with role-specific features'),
  bullet('Post-session review and rating system'),
  bullet('Real-time notifications via Socket.io'),
  bullet('Admin audit logs and platform statistics'),
  bullet('Premium checkout UI redesign with live card preview'),
  heading3('Out of Scope'),
  bullet('Native mobile applications (iOS / Android)'),
  bullet('Integrated WebRTC video calling (mock meeting links only)'),
  bullet('Real PayPal live payment processing (mock implementation in use)'),
  bullet('Cloudinary image uploads (avatar field exists but upload not implemented)'),
  bullet('Email/SMS notification delivery (toast and socket only)'),
  bullet('AI-powered tutor matching or recommendation engine'),

  // 3. Methodology
  heading1('3. Methodology'),
  heading2('3.1 Development Approach'),
  body(
    'The project followed an iterative, feature-driven development approach rather than formal sprint cadences. Features were built incrementally — authentication first, then tutor profiles, booking flow, payment integration, dashboards, admin tools, and finally the premium checkout UI redesign. Each module was wired end-to-end (backend route → frontend component) before moving to the next, allowing continuous manual testing throughout development.'
  ),
  heading2('3.2 Version Control Strategy'),
  body(
    'The project uses Git with a remote repository hosted on GitHub. Commit history shows feature-focused messages such as "Updated dashboards and booking system" and "Initial commit." Branching follows a main-branch workflow suitable for solo or small-team development.'
  ),
  heading2('3.3 Development Environment'),
  makeTable(
    ['Script', 'Location', 'Purpose'],
    [
      ['npm run dev', 'Root (frontend)', 'Starts Vite dev server on port 5173'],
      ['npm run build', 'Root (frontend)', 'Production build to /dist'],
      ['npm run preview', 'Root (frontend)', 'Preview production build locally'],
      ['npm run dev', 'backend/', 'Starts Express API with nodemon'],
      ['npm start', 'backend/', 'Starts Express API (production)'],
    ],
    [2340, 2340, 4680]
  ),
  body('No Node.js engines field is defined in either package.json; Node.js 18+ is recommended for React 19 and Express 5 compatibility.'),
  heading2('3.4 Code Organization Principles'),
  bullet('Component-based architecture using React functional components and hooks'),
  bullet('Separation of concerns: routes (App.jsx), pages, role-specific components, services (api.js), and context providers'),
  bullet('Backend MVC pattern: routes → controllers → models with shared middleware and utilities'),
  bullet('CSS custom properties in booking.css for the checkout design system; Tailwind CSS for general layout'),
  bullet('TanStack React Query for server state; React Context for auth and socket connections'),

  // 4. System Architecture
  heading1('4. System Architecture'),
  heading2('4.1 High-Level Architecture'),
  ...architectureDiagram.map((line) => codeBlock(line)),
  heading2('4.2 Frontend Architecture'),
  makeTable(
    ['Route', 'Component', 'Access'],
    [
      ['/', 'HomePage', 'Public'],
      ['/login', 'LoginPage', 'Public'],
      ['/register', 'RegisterPage', 'Public'],
      ['/tutors', 'TutorSearch', 'Authenticated (student)'],
      ['/tutor/:id', 'TutorProfile', 'Authenticated'],
      ['/booking/:tutorId', 'BookingPage', 'Authenticated (student)'],
      ['/dashboard/student', 'StudentDashboard', 'Student only'],
      ['/dashboard/tutor', 'TutorDashboard', 'Tutor only'],
      ['/tutor/profile-setup', 'TutorProfileSetup', 'Tutor only'],
      ['/dashboard/admin', 'AdminDashboard', 'Admin only'],
      ['/admin/users', 'UserManagement', 'Admin only'],
      ['/admin/tutors', 'TutorManagement', 'Admin only'],
      ['/admin/tutor-approval', 'TutorApproval', 'Admin only'],
      ['/admin/audit-logs', 'AuditLogs', 'Admin only'],
    ],
    [2800, 3600, 2960]
  ),
  heading2('4.3 Backend Architecture'),
  makeTable(
    ['Prefix', 'Resource', 'Methods'],
    [
      ['/api/auth', 'Authentication', 'POST /register, POST /login, GET /me'],
      ['/api/tutors', 'Tutor profiles & search', 'GET /search, GET /stats, GET /profile/me, GET /profile/:id, POST /profile, PUT /profile'],
      ['/api/bookings', 'Booking management', 'GET /available-slots, POST /, GET /student, GET /tutor, PUT /:id/cancel, PUT /:id/complete'],
      ['/api/payments', 'Mock payment checkout', 'POST /create-order, POST /capture-order'],
      ['/api/students', 'Student dashboard data', 'GET /stats, GET /sessions, GET /credits'],
      ['/api/reviews', 'Session reviews', 'POST /, GET /tutor/:tutorId, GET /booking/:bookingId'],
      ['/api/admin', 'Platform administration', 'GET/PUT/DELETE users, GET/PUT/DELETE tutors, GET pending-tutors, POST approve/reject-tutor, GET stats/bookings/audit-logs/recent-activity'],
    ],
    [2200, 2800, 4360]
  ),
  heading2('4.4 State Management'),
  body(
    'Client-side state is managed through a combination of React Context and TanStack React Query. AuthContext (src/context/AuthContext.jsx) holds the authenticated user, login/register/logout functions, and role flags (isStudent, isTutor, isAdmin). Tokens are persisted in localStorage and attached to Axios requests via interceptors. SocketContext (src/context/SocketContext.jsx) manages the Socket.io connection for real-time booking notifications. Server-fetched data (tutor profiles, bookings, stats) uses React Query for caching, loading states, and mutations.'
  ),

  // 5. Technology Stack
  heading1('5. Technology Stack'),
  makeTable(
    ['Layer', 'Technology', 'Version', 'Purpose'],
    [
      ['Frontend Framework', 'React', '19.2.6', 'UI component tree and SPA rendering'],
      ['Build Tool', 'Vite', '6.2.0', 'Dev server, HMR, and production bundler'],
      ['Routing', 'React Router DOM', '7.2.0', 'Client-side routing and protected routes'],
      ['Styling', 'Tailwind CSS + Custom CSS', '3.4.17', 'Utility-first layout + checkout design system'],
      ['UI Components', 'Headless UI + MUI', '2.2.0 / 6.4.6', 'Accessible UI primitives and material components'],
      ['HTTP Client', 'Axios', '1.7.9', 'REST API communication with interceptors'],
      ['Server State', 'TanStack React Query', '5.66.9', 'Data fetching, caching, and mutations'],
      ['Forms', 'React Hook Form + Yup', '7.54.2 / 1.6.1', 'Form validation'],
      ['Charts', 'Recharts', '2.15.1', 'Dashboard analytics visualizations'],
      ['Calendar', 'FullCalendar + react-datepicker', '6.1.15 / 7.6.0', 'Session scheduling UI'],
      ['Real-time', 'socket.io-client', '4.8.1', 'WebSocket client for live notifications'],
      ['Icons', 'Heroicons + React Icons', '2.2.0 / 5.5.0', 'UI icon system'],
      ['Fonts', 'DM Sans, Sora, Inter', 'Google Fonts', 'Checkout typography system'],
      ['Backend Runtime', 'Node.js', '18+ (recommended)', 'Server runtime'],
      ['Backend Framework', 'Express', '5.2.1', 'REST API server and middleware pipeline'],
      ['Database', 'MongoDB', 'Local / Atlas', 'Document-oriented data store'],
      ['ODM', 'Mongoose', '9.6.2', 'Schema definition, validation, and queries'],
      ['Authentication', 'JWT + bcryptjs', '9.0.3 / 3.0.3', 'Stateless token auth and password hashing'],
      ['Real-time Server', 'Socket.io', '4.8.3', 'WebSocket server for booking events'],
      ['Payments', 'Mock PayPal flow', 'Custom', 'Test card simulation (SDK listed but not wired)'],
      ['Notifications', 'react-hot-toast', '2.5.2', 'In-app toast feedback'],
    ],
    [1800, 2200, 1400, 3760]
  ),

  // 6. Database Design
  heading1('6. Database Design'),
  heading2('6.1 Collections Overview'),
  heading3('User Model (backend/models/User.js)'),
  makeTable(
    ['Field', 'Type', 'Required', 'Notes'],
    [
      ['name', 'String', 'Yes', 'Full name, trimmed'],
      ['email', 'String', 'Yes', 'Unique, lowercase'],
      ['password', 'String', 'Yes', 'bcrypt hashed (select: false), min 6 chars'],
      ['role', 'String', 'Yes', 'Enum: student, tutor, admin; default student'],
      ['avatar', 'String', 'No', 'Profile image URL; default null'],
      ['phoneNumber', 'String', 'No', 'Contact number'],
      ['isActive', 'Boolean', 'No', 'Account active flag; default true'],
      ['isApproved', 'Boolean', 'No', 'Tutor approval flag; default false'],
      ['createdAt', 'Date', 'No', 'Auto-set on creation'],
    ],
    [1800, 1400, 1200, 4960]
  ),
  heading3('TutorProfile Model (backend/models/TutorProfile.js)'),
  makeTable(
    ['Field', 'Type', 'Required', 'Notes'],
    [
      ['userId', 'ObjectId → User', 'Yes', 'Unique reference to tutor user'],
      ['subject', 'String', 'Yes', 'Primary subject'],
      ['subjectsOffered', '[String]', 'No', 'Additional subjects array'],
      ['hourlyRate', 'Number', 'Yes', 'Rate in USD, min 0'],
      ['bio', 'String', 'Yes', 'Max 1000 characters'],
      ['experience', 'Number', 'No', 'Years of experience'],
      ['education', 'String', 'No', 'Educational background'],
      ['rating', 'Number', 'No', 'Average rating 0–5'],
      ['totalReviews', 'Number', 'No', 'Review count'],
      ['totalEarnings', 'Number', 'No', 'Cumulative earnings'],
      ['totalSessions', 'Number', 'No', 'Completed session count'],
      ['isApproved', 'Boolean', 'No', 'Admin approval flag'],
      ['createdAt / updatedAt', 'Date', 'No', 'Timestamps'],
    ],
    [1800, 1800, 1200, 4360]
  ),
  heading3('Booking Model (backend/models/Booking.js)'),
  makeTable(
    ['Field', 'Type', 'Required', 'Notes'],
    [
      ['bookingId', 'String', 'Auto', 'Unique ID: BK + timestamp + random'],
      ['studentId', 'ObjectId → User', 'Yes', 'Booking student'],
      ['tutorId', 'ObjectId → User', 'Yes', 'Booked tutor'],
      ['tutorProfileId', 'ObjectId → TutorProfile', 'No', 'Linked profile'],
      ['date', 'Date', 'Yes', 'Session date'],
      ['startTime / endTime', 'String', 'Yes', 'Time slot (e.g. 9:00)'],
      ['duration', 'Number', 'Yes', 'Hours, min 0.5'],
      ['totalAmount', 'Number', 'Yes', 'Session cost'],
      ['status', 'String', 'No', 'pending | confirmed | completed | cancelled | refunded'],
      ['paymentStatus', 'String', 'No', 'pending | completed | paid | refunded'],
      ['paymentOrderId', 'String', 'No', 'Mock order reference'],
      ['paymentTransactionId', 'String', 'No', 'Mock transaction ID'],
      ['meetingLink', 'String', 'No', 'Generated mock Zoom URL on payment'],
      ['isReviewed', 'Boolean', 'No', 'Review submitted flag'],
    ],
    [2000, 1800, 1200, 4160]
  ),
  heading3('Review Model (backend/models/Review.js)'),
  makeTable(
    ['Field', 'Type', 'Required', 'Notes'],
    [
      ['bookingId', 'ObjectId → Booking', 'Yes', 'Reviewed session'],
      ['studentId', 'ObjectId → User', 'Yes', 'Review author'],
      ['tutorId', 'ObjectId → User', 'Yes', 'Reviewed tutor'],
      ['rating', 'Number', 'Yes', '1–5 stars'],
      ['comment', 'String', 'Yes', 'Max 500 characters'],
      ['createdAt', 'Date', 'No', 'Submission timestamp'],
    ],
    [2200, 2200, 1200, 3560]
  ),
  heading3('AuditLog Model (backend/models/AuditLog.js)'),
  makeTable(
    ['Field', 'Type', 'Required', 'Notes'],
    [
      ['action', 'String', 'Yes', 'Indexed action type (login, payment, etc.)'],
      ['userId', 'ObjectId → User', 'No', 'Indexed actor reference'],
      ['targetId', 'String', 'No', 'Affected resource ID'],
      ['details', 'String', 'No', 'Human-readable description'],
      ['type', 'String', 'No', 'success | warning | info | error'],
      ['status', 'String', 'No', 'Operation status'],
      ['createdAt', 'Date', 'No', 'Indexed timestamp'],
    ],
    [1800, 2200, 1200, 4160]
  ),
  heading2('6.2 Relationships Diagram'),
  ...[
    'User (1) ──────── (N) Booking  [as studentId or tutorId]',
    'User (role: tutor) ──── (1) TutorProfile  [via userId, unique]',
    'TutorProfile (1) ──────── (N) Booking  [via tutorProfileId]',
    'Booking (1) ──────── (0..1) Review  [via bookingId]',
    'User (1) ──────── (N) AuditLog  [via userId]',
  ].map((line) => codeBlock(line)),
  heading2('6.3 Indexing Strategy'),
  bullet('User.email — unique index (Mongoose schema)'),
  bullet('TutorProfile.userId — unique index'),
  bullet('Booking.bookingId — unique index'),
  bullet('Booking — compound indexes: { studentId, status }, { tutorId, status }, { date, tutorId }'),
  bullet('AuditLog — indexes on action, userId, and createdAt'),

  // 7. Authentication & Security
  heading1('7. Authentication & Security'),
  heading2('7.1 Authentication Flow'),
  ...numbered([
    'User submits email and password to POST /api/auth/login (or registers via POST /api/auth/register).',
    'Server retrieves user with password field selected and verifies via bcrypt.compare() using the matchPassword method.',
    'On success, server signs a JWT with jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRE }).',
    'Token is returned to the client and stored in localStorage; Axios interceptors attach it as Bearer token.',
    'Protected routes use the protect middleware which verifies the JWT and loads req.user.',
    'Role-restricted routes additionally use authorize(...roles) middleware to enforce RBAC.',
    'Inactive users (isActive: false) are blocked at both login and middleware levels.',
  ]),
  heading2('7.2 Role-Based Access Control'),
  makeTable(
    ['Route Pattern', 'Required Role', 'Guard Middleware'],
    [
      ['POST /api/bookings', 'student', 'protect + authorize("student")'],
      ['GET /api/bookings/tutor', 'tutor', 'protect + authorize("tutor")'],
      ['PUT /api/bookings/:id/complete', 'tutor', 'protect + authorize("tutor")'],
      ['POST /api/tutors/profile', 'tutor', 'protect + authorize("tutor")'],
      ['GET /api/tutors/stats', 'tutor', 'protect + authorize("tutor")'],
      ['GET /api/admin/*', 'admin', 'protect + authorize("admin") — router-level'],
      ['POST /api/payments/*', 'any authenticated', 'protect'],
      ['Frontend PrivateRoute', 'role prop', 'AuthContext role check + redirect'],
    ],
    [3200, 2400, 3760]
  ),
  heading2('7.3 Security Measures'),
  bullet('Password hashing with bcryptjs — salt rounds: 10 (genSalt(10) in User pre-save hook)'),
  bullet('JWT expiry configured via JWT_EXPIRE environment variable'),
  bullet('Secrets stored in environment variables (JWT_SECRET, MONGODB_URI) — never hardcoded'),
  bullet('CORS enabled on Express; Socket.io restricted to CLIENT_URL origin (default http://localhost:5173)'),
  bullet('Payment authorization checks — students can only pay for their own bookings'),
  bullet('401 interceptor on frontend redirects to /login and clears invalid tokens'),
  bullet('Admin actions logged to AuditLog collection for accountability'),
  bullet('Input validation on booking and payment controllers (required fields, ObjectId format checks)'),
  bullet('Note: express-validator is not used; validation is handled in controllers and Mongoose schemas'),

  // 8. Payment Integration
  heading1('8. Payment Integration'),
  heading2('8.1 Payment Flow'),
  body(
    'StudyBuddy implements a mock PayPal-style checkout flow. While @paypal/checkout-server-sdk is listed in backend dependencies, the active paymentController.js uses a custom mock implementation with predefined test card numbers. This allows full end-to-end testing without live PayPal credentials.'
  ),
  ...numbered([
    'Student completes booking details on BookingPage and proceeds to the payment step.',
    'PayPalMockCheckout renders the premium split-layout checkout with live card preview.',
    'On Place Order, client calls POST /api/payments/create-order with { bookingId }.',
    'Backend validates booking ownership and pending status, generates a MOCK-ORDER-{timestamp} ID, and saves it to the booking.',
    'Client calls POST /api/payments/capture-order with { orderId, cardNumber }.',
    'Backend validates test card: 4111111111111111 succeeds; 4000000000000002 declines; others rejected.',
    'On success, booking status → confirmed, paymentStatus → completed, mock transaction ID and meeting link generated.',
    'Socket.io emits booking:confirmed to both student and tutor; audit log entry created.',
    'Student sees success toast and is redirected via onSuccess callback.',
  ]),
  heading2('8.2 Test Credentials'),
  makeTable(
    ['Card', 'Number', 'Result'],
    [
      ['Success', '4111 1111 1111 1111', 'Payment approved, booking confirmed'],
      ['Decline', '4000 0000 0000 0002', 'Payment declined with error message'],
      ['Invalid', 'Any other number', 'Rejected with test card guidance message'],
    ],
    [1800, 3600, 3960]
  ),
  heading2('8.3 Environment Variables Required'),
  makeTable(
    ['Variable', 'Purpose'],
    [
      ['MONGODB_URI', 'MongoDB connection string (backend)'],
      ['JWT_SECRET', 'Secret key for signing and verifying JWT tokens'],
      ['JWT_EXPIRE', 'Token expiration duration (e.g. 30d)'],
      ['PORT', 'Backend server port (5003 in current setup)'],
      ['CLIENT_URL', 'Allowed CORS/Socket.io origin (http://localhost:5173)'],
      ['VITE_API_URL', 'Frontend API base URL (http://localhost:5003/api)'],
      ['VITE_SOCKET_URL', 'Frontend Socket.io server URL (http://localhost:5003)'],
    ],
    [3120, 6240]
  ),
  body('Note: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, and PAYPAL_MODE are not currently used by the mock payment implementation but are reserved for future real PayPal integration.'),

  // 9. Key Features
  heading1('9. Key Features'),

  heading2('9.1 Tutor Discovery'),
  body('Students search and browse approved tutors filtered by subject. TutorSearch displays tutor cards with ratings, hourly rates, and subjects. TutorProfile shows full bio, experience, education, and reviews.'),
  makeTable(
    ['Attribute', 'Detail'],
    [
      ['User Role', 'Student'],
      ['Entry Point', '/tutors → /tutor/:id'],
      ['API Calls', 'GET /api/tutors/search, GET /api/tutors/profile/:id, GET /api/reviews/tutor/:tutorId'],
      ['State Managed', 'TanStack React Query'],
      ['Key Components', 'src/components/student/TutorSearch.jsx, TutorProfile.jsx'],
    ],
    [2340, 7020]
  ),

  heading2('9.2 Session Booking'),
  body('Two-step booking flow: students select date via react-datepicker, choose from available time slots fetched from the API, enter contact info, then proceed to payment. Slots are generated server-side (9:00–17:30 in 30-min increments) minus already booked slots.'),
  makeTable(
    ['Attribute', 'Detail'],
    [
      ['User Role', 'Student'],
      ['Entry Point', '/booking/:tutorId'],
      ['API Calls', 'GET /api/bookings/available-slots, POST /api/bookings'],
      ['State Managed', 'useState (step, date, slot, contact) + React Query'],
      ['Key Component', 'src/components/student/BookingPage.jsx'],
    ],
    [2340, 7020]
  ),

  heading2('9.3 Payment Checkout'),
  body('Premium fintech-inspired checkout with live animated card preview, split layout (form + order summary), styled MM/YYYY selects, CVV tooltip, validation states, security badge, and loading spinner on Place Order.'),
  makeTable(
    ['Attribute', 'Detail'],
    [
      ['User Role', 'Student'],
      ['Entry Point', 'BookingPage payment step'],
      ['API Calls', 'POST /api/payments/create-order, POST /api/payments/capture-order'],
      ['State Managed', 'useState (card fields) + useMutation'],
      ['Key Components', 'PayPalMockCheckout.jsx, CardPreview.jsx, styles/booking.css'],
    ],
    [2340, 7020]
  ),

  heading2('9.4 Student Dashboard'),
  body('Displays upcoming sessions, past sessions, total spent (from paid bookings), and allows session review submission for completed bookings.'),
  makeTable(
    ['Attribute', 'Detail'],
    [
      ['User Role', 'Student'],
      ['Entry Point', '/dashboard/student'],
      ['API Calls', 'GET /api/students/stats, GET /api/students/sessions, POST /api/reviews'],
      ['State Managed', 'TanStack React Query'],
      ['Key Component', 'src/components/student/StudentDashboard.jsx'],
    ],
    [2340, 7020]
  ),

  heading2('9.5 Tutor Dashboard'),
  body('Tutors view upcoming and past bookings, session statistics, earnings data, and can mark confirmed sessions as complete.'),
  makeTable(
    ['Attribute', 'Detail'],
    [
      ['User Role', 'Tutor'],
      ['Entry Point', '/dashboard/tutor'],
      ['API Calls', 'GET /api/bookings/tutor, GET /api/tutors/stats, PUT /api/bookings/:id/complete'],
      ['State Managed', 'TanStack React Query'],
      ['Key Components', 'TutorDashboard.jsx, TutorProfileSetup.jsx'],
    ],
    [2340, 7020]
  ),

  heading2('9.6 Authentication'),
  body('Register with role selection, login with JWT persistence, role-based dashboard redirect, and PrivateRoute guards on all protected pages.'),
  makeTable(
    ['Attribute', 'Detail'],
    [
      ['User Role', 'All roles'],
      ['Entry Point', '/login, /register'],
      ['API Calls', 'POST /api/auth/login, POST /api/auth/register, GET /api/auth/me'],
      ['State Managed', 'AuthContext (React Context)'],
      ['Key Components', 'AuthContext.jsx, Login.jsx, Register.jsx, PrivateRoute.jsx'],
    ],
    [2340, 7020]
  ),

  heading2('9.7 Admin Panel'),
  body('Administrators manage users and tutors, approve/reject tutor applications, view platform statistics, audit logs, and recent activity.'),
  makeTable(
    ['Attribute', 'Detail'],
    [
      ['User Role', 'Admin'],
      ['Entry Point', '/dashboard/admin, /admin/*'],
      ['API Calls', 'GET/PUT/DELETE /api/admin/users, /api/admin/tutors, POST approve/reject-tutor, GET stats/audit-logs'],
      ['State Managed', 'TanStack React Query'],
      ['Key Components', 'AdminDashboard.jsx, UserManagement.jsx, TutorApproval.jsx, AuditLogs.jsx'],
    ],
    [2340, 7020]
  ),

  // 10. UI/UX Design System
  heading1('10. UI/UX Design System'),
  heading2('10.1 Design Philosophy'),
  body(
    'The checkout experience follows a luxury-minimal, trust-first design philosophy inspired by Stripe, Linear, and Vercel. The UI uses surgical spacing, indigo accent colors, frosted navigation, micro-interactions on focus states, and a live card preview that updates in real time — creating a premium fintech-meets-edtech feel at the payment step.'
  ),
  heading2('10.2 Color System'),
  makeTable(
    ['Variable', 'Hex Value', 'Usage'],
    [
      ['--accent', '#6C63FF', 'Primary CTAs, focus rings, badges, logo'],
      ['--accent-hover', '#5A52E0', 'Button hover states'],
      ['--accent-light', '#EEF0FF', 'Soft accent backgrounds, tab active state'],
      ['--bg', '#F4F5F7', 'Page background with radial gradients'],
      ['--surface', '#FFFFFF', 'Card backgrounds'],
      ['--surface-alt', '#F9FAFB', 'Input backgrounds'],
      ['--border', '#E4E7EC', 'Subtle borders and dividers'],
      ['--border-focus', '#6C63FF', 'Input focus border'],
      ['--text-primary', '#0F1117', 'Headings and primary text'],
      ['--text-secondary', '#6B7280', 'Labels and secondary text'],
      ['--text-muted', '#9CA3AF', 'Placeholders and helper text'],
      ['--success', '#10B981', 'Free fees, validation success'],
      ['--error', '#EF4444', 'Validation errors, decline states'],
    ],
    [2200, 1800, 5360]
  ),
  heading2('10.3 Typography'),
  makeTable(
    ['Role', 'Font', 'Weight', 'Size'],
    [
      ['UI Labels, Navigation', 'DM Sans', '500–700', '13–20px'],
      ['Section Titles', 'DM Sans', '700', '20px'],
      ['Price / Total', 'Sora', '700', '24px'],
      ['Card Preview Number', 'Sora', '600', '18px'],
      ['Input / Helper Text', 'Inter', '400', '14–15px'],
      ['Body (general app)', 'System / Tailwind defaults', '400', '16px'],
    ],
    [2800, 2400, 1600, 2560]
  ),
  heading2('10.4 Component Inventory'),
  makeTable(
    ['Component', 'Location', 'Purpose'],
    [
      ['CardPreview', 'components/booking/CardPreview.jsx', 'Live animated credit card visual'],
      ['PayPalMockCheckout', 'components/student/PayPalMockCheckout.jsx', 'Full premium checkout UI'],
      ['BookingPage', 'components/student/BookingPage.jsx', 'Two-step booking + payment flow'],
      ['Navbar', 'components/common/Navbar.jsx', 'Frosted sticky navigation with role badges'],
      ['PrivateRoute', 'components/common/PrivateRoute.jsx', 'Auth and role-based route guard'],
      ['AuthContext', 'context/AuthContext.jsx', 'Global authentication state'],
      ['SocketContext', 'context/SocketContext.jsx', 'Real-time WebSocket connection'],
      ['StudentDashboard', 'components/student/StudentDashboard.jsx', 'Student session overview'],
      ['TutorDashboard', 'components/tutor/TutorDashboard.jsx', 'Tutor booking management'],
      ['AdminDashboard', 'components/admin/AdminDashboard.jsx', 'Platform admin overview'],
      ['LoadingSpinner', 'components/common/LoadingSpinner.jsx', 'Loading state indicator'],
    ],
    [2600, 4200, 2560]
  ),
  heading2('10.5 Responsive Breakpoints'),
  makeTable(
    ['Breakpoint', 'Width', 'Layout Change'],
    [
      ['Mobile', '< 768px', 'Single column checkout; order summary above form; reduced padding'],
      ['Tablet', '768–1024px', 'Two-column layout with compressed spacing'],
      ['Desktop', '> 1024px', 'Full split layout, max-width 1100px, sticky order summary'],
    ],
    [2000, 2400, 4960]
  ),

  // 11. Testing
  heading1('11. Testing'),
  heading2('11.1 Manual Testing Performed'),
  makeTable(
    ['Test Case', 'Steps', 'Expected Result', 'Status'],
    [
      ['Successful payment', 'Enter 4111..., click Place Order', 'Booking confirmed, status = confirmed', 'Pass'],
      ['Declined payment', 'Enter 4000..., click Place Order', 'Error toast and inline decline message', 'Pass'],
      ['Empty form submit', 'Click Place Order with empty fields', 'Toast: fill in all payment fields', 'Pass'],
      ['Mobile layout', 'View checkout at 375px viewport', 'Single column, summary above form', 'Pass'],
      ['Card preview update', 'Type card number and name', 'Preview updates in real time', 'Pass'],
      ['Tutor approval gate', 'Book unapproved tutor', 'Error: tutor not available', 'Pass'],
      ['Role-based access', 'Access admin route as student', 'Redirect to home page', 'Pass'],
      ['Session completion', 'Tutor marks booking complete', 'Status updated to completed', 'Pass'],
    ],
    [2000, 2800, 2800, 1560]
  ),
  heading2('11.2 Test Environment'),
  bullet('Browsers: Chrome, Firefox (manual testing)'),
  bullet('Devices: Desktop (1440px), Mobile (375px via DevTools responsive mode)'),
  bullet('Backend: Local MongoDB at mongodb://localhost:27017/study'),
  bullet('Test cards: Mock success/decline numbers defined in paymentController.js'),
  heading2('11.3 Known Issues / Limitations'),
  body('No TODO, FIXME, HACK, or XXX comments were found in the src/ or backend/ codebase during the project scan.'),
  makeTable(
    ['Area', 'Description', 'Severity'],
    [
      ['Payments', 'Mock implementation only — not connected to live PayPal API', 'Medium'],
      ['Meeting Links', 'Mock Zoom URLs generated; no real video integration', 'Medium'],
      ['Avatar Uploads', 'avatar field exists on User model but no upload UI', 'Low'],
      ['Credits System', 'GET /api/students/credits endpoint exists as placeholder', 'Low'],
      ['Admin Creation', 'Admin users must be created manually in MongoDB', 'Low'],
      ['Automated Tests', 'No unit, integration, or E2E test suite configured', 'Medium'],
    ],
    [2200, 5360, 1600]
  ),

  // 12. Deployment & Environment
  heading1('12. Deployment & Environment'),
  heading2('12.1 Local Development Setup'),
  ...numbered([
    'Clone the repository: git clone https://github.com/MuneebX00/studybudy.git',
    'Install frontend dependencies: npm install (project root)',
    'Install backend dependencies: cd backend && npm install',
    'Create backend/.env with MONGODB_URI, JWT_SECRET, JWT_EXPIRE, PORT, CLIENT_URL',
    'Create root .env with VITE_API_URL and VITE_SOCKET_URL pointing to backend',
    'Start MongoDB locally (mongodb://localhost:27017/study)',
    'Start backend: cd backend && npm run dev (port 5003)',
    'Start frontend: npm run dev (port 5173)',
    'Open http://localhost:5173 in your browser',
  ]),
  heading2('12.2 Environment Variables'),
  makeTable(
    ['Variable', 'Required', 'Description', 'Example'],
    [
      ['MONGODB_URI', 'Yes', 'MongoDB connection string', 'mongodb://localhost:27017/study'],
      ['JWT_SECRET', 'Yes', 'JWT signing secret', 'Random 32+ character string'],
      ['JWT_EXPIRE', 'Yes', 'Token expiration', '30d'],
      ['PORT', 'No', 'Backend server port', '5003'],
      ['CLIENT_URL', 'No', 'CORS/Socket.io allowed origin', 'http://localhost:5173'],
      ['VITE_API_URL', 'Yes', 'Frontend REST API base URL', 'http://localhost:5003/api'],
      ['VITE_SOCKET_URL', 'Yes', 'Frontend WebSocket URL', 'http://localhost:5003'],
    ],
    [2200, 1200, 3560, 2400]
  ),
  heading2('12.3 Build for Production'),
  codeBlock('npm run build'),
  body('Vite outputs optimized static assets to /dist. Serve with any static host (Vercel, Netlify, Nginx).'),
  codeBlock('cd backend && npm start'),
  body('Deploy the Express API to Railway, Render, or a VPS. Ensure MONGODB_URI points to a production MongoDB Atlas cluster and CLIENT_URL matches the deployed frontend origin.'),

  // 13. Future Roadmap
  heading1('13. Future Roadmap'),
  makeTable(
    ['Priority', 'Feature', 'Description', 'Effort'],
    [
      ['High', 'Real PayPal Integration', 'Wire @paypal/checkout-server-sdk for live payments', 'Medium'],
      ['High', 'Video Sessions', 'Integrated WebRTC or Zoom API video calling', 'High'],
      ['High', 'Real-time Chat', 'In-session messaging between student and tutor', 'Medium'],
      ['Medium', 'Calendar Sync', 'Google Calendar / Outlook integration', 'Medium'],
      ['Medium', 'Tutor Verification', 'ID and credential verification workflow', 'Medium'],
      ['Medium', 'Automated Testing', 'Jest/Vitest unit tests and Playwright E2E', 'Medium'],
      ['Medium', 'Push Notifications', 'Email/SMS session reminders', 'Low'],
      ['Low', 'Mobile App', 'React Native companion application', 'High'],
      ['Low', 'AI Tutor Matching', 'Recommendation engine based on history', 'High'],
      ['Low', 'Avatar Uploads', 'Cloudinary or S3 profile image storage', 'Low'],
    ],
    [1200, 2200, 4360, 1200]
  ),

  // 14. Conclusion
  heading1('14. Conclusion'),
  body(
    'StudyBuddy delivers a functional, role-aware tutoring marketplace with a complete booking-to-payment pipeline, real-time notifications, admin governance, and a recently redesigned premium checkout experience. The application demonstrates proficiency across the full MERN stack — from Mongoose schema design and JWT middleware to React Query data fetching and CSS-driven design systems.'
  ),
  body(
    'Technical highlights include the mock payment flow with test card simulation, Socket.io event broadcasting on booking confirmation, compound MongoDB indexes for booking queries, and the fintech-inspired checkout UI with live card preview and glassmorphic order summary panel.'
  ),
  body(
    'While the platform is ready for local demonstration and portfolio presentation, production readiness requires live payment integration, automated test coverage, real video session support, and deployment to a hosted environment. The modular architecture and clear separation of concerns provide a solid foundation for these next steps.'
  ),

  // Appendix A
  heading1('Appendix A — File Structure'),
  ...PROJECT_TREE.split('\n').map((line) => codeBlock(line)),

  // Appendix B
  heading1('Appendix B — API Reference'),
  makeTable(
    ['Method', 'Endpoint', 'Auth', 'Description'],
    [
      ['POST', '/api/auth/register', 'No', 'Register new user with role'],
      ['POST', '/api/auth/login', 'No', 'Authenticate and receive JWT'],
      ['GET', '/api/auth/me', 'Yes', 'Get current authenticated user'],
      ['GET', '/api/tutors/search', 'Yes', 'Search approved tutors'],
      ['GET', '/api/tutors/stats', 'Tutor', 'Tutor dashboard statistics'],
      ['GET', '/api/tutors/profile/me', 'Tutor', 'Get own tutor profile'],
      ['GET', '/api/tutors/profile/:id', 'Yes', 'Get tutor profile by ID'],
      ['POST', '/api/tutors/profile', 'Tutor', 'Create tutor profile'],
      ['PUT', '/api/tutors/profile', 'Tutor', 'Update tutor profile'],
      ['GET', '/api/bookings/available-slots', 'Yes', 'Get available time slots'],
      ['POST', '/api/bookings', 'Student', 'Create a new booking'],
      ['GET', '/api/bookings/student', 'Student', 'Get student bookings'],
      ['GET', '/api/bookings/tutor', 'Tutor', 'Get tutor bookings'],
      ['PUT', '/api/bookings/:id/cancel', 'Yes', 'Cancel a booking'],
      ['PUT', '/api/bookings/:id/complete', 'Tutor', 'Mark booking complete'],
      ['POST', '/api/payments/create-order', 'Yes', 'Create mock payment order'],
      ['POST', '/api/payments/capture-order', 'Yes', 'Capture mock payment'],
      ['GET', '/api/students/stats', 'Student', 'Student dashboard stats'],
      ['GET', '/api/students/sessions', 'Student', 'Student session list'],
      ['GET', '/api/students/credits', 'Student', 'Student credits (placeholder)'],
      ['POST', '/api/reviews', 'Yes', 'Submit session review'],
      ['GET', '/api/reviews/tutor/:tutorId', 'No', 'Get tutor reviews'],
      ['GET', '/api/reviews/booking/:bookingId', 'Yes', 'Get review by booking'],
      ['GET', '/api/admin/users', 'Admin', 'List all users'],
      ['GET', '/api/admin/users/:id', 'Admin', 'Get user by ID'],
      ['PUT', '/api/admin/users/:id', 'Admin', 'Update user'],
      ['DELETE', '/api/admin/users/:id', 'Admin', 'Delete user'],
      ['GET', '/api/admin/tutors', 'Admin', 'List all tutors'],
      ['PUT', '/api/admin/tutors/:id', 'Admin', 'Update tutor'],
      ['DELETE', '/api/admin/tutors/:id', 'Admin', 'Delete tutor'],
      ['GET', '/api/admin/pending-tutors', 'Admin', 'List pending tutor approvals'],
      ['POST', '/api/admin/approve-tutor/:id', 'Admin', 'Approve tutor'],
      ['POST', '/api/admin/reject-tutor/:id', 'Admin', 'Reject tutor'],
      ['GET', '/api/admin/stats', 'Admin', 'Platform statistics'],
      ['GET', '/api/admin/bookings', 'Admin', 'All platform bookings'],
      ['GET', '/api/admin/audit-logs', 'Admin', 'Audit log entries'],
      ['GET', '/api/admin/recent-activity', 'Admin', 'Recent platform activity'],
    ],
    [900, 3200, 900, 4360]
  ),
]

// ─── Header & Footer ────────────────────────────────────────────────────────

const contentHeader = new Header({
  children: [
    new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '6C63FF', space: 1 } },
      children: [
        new TextRun({ text: 'StudyBuddy — Project Report', font: 'Arial', size: 18, color: '6B7280' }),
        new TextRun({ text: '\t' }),
        new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 18, color: '6B7280' }),
      ],
    }),
  ],
})

const contentFooter = new Footer({
  children: [
    new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      children: [
        new TextRun({ text: 'Confidential — Internal Use Only', font: 'Arial', size: 16, color: '9CA3AF', italics: true }),
        new TextRun({ text: '\t' }),
        new TextRun({ text: `Version ${META.version}`, font: 'Arial', size: 16, color: '9CA3AF' }),
      ],
    }),
  ],
})

// ─── Document Assembly ──────────────────────────────────────────────────────

const doc = new Document({
  creator: 'StudyBuddy',
  title: 'StudyBuddy — Full Project Report',
  description: 'Architecture, methodology, and technical documentation',
  numbering: { ...bulletConfig, ...numberConfig },
  styles: {
    default: {
      document: { run: { font: 'Arial', size: 24, color: '0F1117' } },
    },
    paragraphStyles: [
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 36, bold: true, font: 'Arial', color: '0F1117' },
        paragraph: {
          spacing: { before: 360, after: 180 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '6C63FF', space: 1 } },
          outlineLevel: 0,
        },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: '6C63FF' },
        paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 },
      },
      {
        id: 'Heading3',
        name: 'Heading 3',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 24, bold: true, font: 'Arial', color: '374151' },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 },
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: coverSection,
    },
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: { default: contentHeader },
      footers: { default: contentFooter },
      children: mainContent,
    },
  ],
})

const buffer = await Packer.toBuffer(doc)
fs.writeFileSync(OUTPUT, buffer)

console.log(`Report generated: ${OUTPUT}`)
console.log(`File size: ${(buffer.length / 1024).toFixed(1)} KB`)
