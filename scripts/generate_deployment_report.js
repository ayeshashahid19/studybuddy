/**
 * StudyBuddy — Deployment Readiness Report (PDF)
 * Run: node scripts/generate_deployment_report.js
 * Output: StudyBuddy_Deployment_Readiness_Report.pdf
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import PDFDocument from 'pdfkit'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUTPUT = path.join(ROOT, 'StudyBuddy_Deployment_Readiness_Report.pdf')

const META = {
  title: 'StudyBuddy — Deployment Readiness Report',
  subtitle: 'Pre-Production Analysis for Online Tutoring Marketplace',
  date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  stack: 'MongoDB · Express 5 · React 19 · Vite 6 · Socket.io',
}

const COLORS = {
  primary: '#6C63FF',
  dark: '#1A1A2E',
  muted: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  border: '#E5E7EB',
  bg: '#F9FAFB',
}

function createDoc() {
  const stream = fs.createWriteStream(OUTPUT)
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 56, bottom: 56, left: 56, right: 56 },
    bufferPages: true,
    info: {
      Title: META.title,
      Author: 'StudyBuddy Project Team',
      Subject: 'Deployment Readiness Report',
      Keywords: 'StudyBuddy, MERN, deployment, tutoring marketplace',
    },
  })

  doc.pipe(stream)
  return { doc, stream }
}

function ensureSpace(doc, height = 80) {
  if (doc.y + height > doc.page.height - doc.page.margins.bottom) {
    doc.addPage()
  }
}

function drawHeaderFooter(doc) {
  const range = doc.bufferedPageRange()
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i)

    if (i === 0) continue

    doc.save()
    doc.strokeColor(COLORS.border).lineWidth(0.5)
    doc.moveTo(56, 42).lineTo(doc.page.width - 56, 42).stroke()
    doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.muted)
    doc.text('StudyBuddy — Deployment Readiness Report', 56, 28, { lineBreak: false })
    doc.font('Helvetica').text(`Page ${i + 1}`, doc.page.width - 56 - 40, 28, { lineBreak: false })
    doc.restore()
  }
}

function coverPage(doc) {
  doc.rect(0, 0, doc.page.width, 180).fill(COLORS.primary)
  doc.fillColor('#FFFFFF')
  doc.font('Helvetica-Bold').fontSize(28).text('StudyBuddy', 56, 72)
  doc.fontSize(16).font('Helvetica').text('Deployment Readiness Report', 56, 108)
  doc.fontSize(11).text(META.subtitle, 56, 132, { width: doc.page.width - 112 })

  doc.fillColor(COLORS.dark)
  doc.y = 220
  doc.font('Helvetica').fontSize(11).fillColor(COLORS.muted)
  doc.text(`Report Date: ${META.date}`)
  doc.text(`Technology Stack: ${META.stack}`)
  doc.text('Document Type: Pre-Production Deployment Analysis')
  doc.moveDown(1.5)

  doc.font('Helvetica-Bold').fontSize(14).fillColor(COLORS.dark).text('Executive Summary')
  doc.moveDown(0.4)
  doc.font('Helvetica').fontSize(10).fillColor('#374151').text(
    'StudyBuddy is a feature-complete MVP for an online tutoring marketplace supporting students, tutors, and administrators. The platform includes tutor discovery, session booking, mock checkout with a 10% platform fee, real-time notifications, and admin governance tools.',
    { align: 'justify', lineGap: 3 }
  )
  doc.moveDown(0.6)
  doc.text(
    'Verdict: Suitable for demo or staging deployment after critical security fixes. Not ready for real-money production without live payment integration, security hardening, and production infrastructure.',
    { align: 'justify', lineGap: 3 }
  )
}

function h1(doc, text) {
  ensureSpace(doc, 48)
  doc.moveDown(0.8)
  doc.font('Helvetica-Bold').fontSize(16).fillColor(COLORS.dark).text(text)
  doc.moveDown(0.15)
  doc.strokeColor(COLORS.primary).lineWidth(2)
  doc.moveTo(56, doc.y).lineTo(160, doc.y).stroke()
  doc.moveDown(0.5)
}

function h2(doc, text) {
  ensureSpace(doc, 36)
  doc.moveDown(0.5)
  doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.primary).text(text)
  doc.moveDown(0.3)
}

function h3(doc, text) {
  ensureSpace(doc, 28)
  doc.font('Helvetica-Bold').fontSize(10.5).fillColor(COLORS.dark).text(text)
  doc.moveDown(0.2)
}

function body(doc, text) {
  ensureSpace(doc, 40)
  doc.font('Helvetica').fontSize(10).fillColor('#374151').text(text, { align: 'justify', lineGap: 3 })
  doc.moveDown(0.35)
}

function bullet(doc, text) {
  ensureSpace(doc, 24)
  const y = doc.y
  doc.font('Helvetica').fontSize(10).fillColor(COLORS.primary).text('•', 56, y, { lineBreak: false })
  doc.fillColor('#374151').text(text, 68, y, { width: doc.page.width - 124, align: 'left', lineGap: 2 })
  doc.moveDown(0.15)
}

function statusTable(doc, rows) {
  const colWidths = [140, 70, 295]
  const startX = 56
  let y = doc.y + 4

  ensureSpace(doc, 30 + rows.length * 22)

  doc.font('Helvetica-Bold').fontSize(9)
  ;['Area', 'Status', 'Notes'].forEach((header, i) => {
    const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0)
    doc.rect(x, y, colWidths[i], 20).fill(COLORS.bg)
    doc.fillColor(COLORS.dark).text(header, x + 6, y + 6, { width: colWidths[i] - 12 })
  })

  y += 20
  doc.font('Helvetica').fontSize(9)

  rows.forEach((row, rowIndex) => {
    const rowHeight = 22
    row.forEach((cell, i) => {
      const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0)
      if (rowIndex % 2 === 0) {
        doc.rect(x, y, colWidths[i], rowHeight).fill('#FFFFFF')
      }
      doc.fillColor(i === 1 ? (cell.includes('✅') ? COLORS.success : cell.includes('❌') ? COLORS.danger : COLORS.warning) : '#374151')
      doc.text(cell, x + 6, y + 6, { width: colWidths[i] - 12 })
    })
    doc.strokeColor(COLORS.border).lineWidth(0.5)
    doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowHeight).stroke()
    y += rowHeight
  })

  doc.y = y + 8
}

function simpleTable(doc, headers, rows, colWidths) {
  const startX = 56
  let y = doc.y + 4
  const tableWidth = colWidths.reduce((a, b) => a + b, 0)

  ensureSpace(doc, 30 + rows.length * 24)

  headers.forEach((header, i) => {
    const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0)
    doc.rect(x, y, colWidths[i], 20).fill(COLORS.bg)
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COLORS.dark).text(header, x + 5, y + 6, { width: colWidths[i] - 10 })
  })

  y += 20
  rows.forEach((row, rowIndex) => {
    const rowHeight = Math.max(22, ...row.map((cell, i) => {
      return doc.heightOfString(String(cell), { width: colWidths[i] - 10, fontSize: 8.5 }) + 12
    }))

    row.forEach((cell, i) => {
      const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0)
      doc.font('Helvetica').fontSize(8.5).fillColor('#374151').text(String(cell), x + 5, y + 6, { width: colWidths[i] - 10 })
    })

    doc.strokeColor(COLORS.border).lineWidth(0.5).rect(startX, y, tableWidth, rowHeight).stroke()
    y += rowHeight
  })

  doc.y = y + 8
}

function checklist(doc, items) {
  items.forEach((item) => bullet(doc, `[ ] ${item}`))
}

function buildReport(doc) {
  coverPage(doc)
  doc.addPage()

  h1(doc, '1. Readiness Overview')
  statusTable(doc, [
    ['Core features', '✅ Ready', 'Booking → payment → confirmation flow works'],
    ['UI/UX', '✅ Good', 'Professional checkout, dashboards, admin panel'],
    ['Authentication', '⚠️ Partial', 'JWT works; role registration needs hardening'],
    ['Payments', '❌ Mock only', 'Test cards only; no live payment gateway'],
    ['Security', '⚠️ Needs work', 'CORS, secrets, rate limiting gaps'],
    ['DevOps', '❌ Missing', 'No Docker, CI/CD, or deployment docs'],
    ['Documentation', '❌ Missing', 'README is default Vite template'],
  ])

  h1(doc, '2. Project Architecture')
  body(doc, 'StudyBuddy follows a classic MERN-style split architecture:')
  bullet(doc, 'Frontend: React 19 + Vite 6 (port 5173 in development)')
  bullet(doc, 'Backend: Express 5 + Socket.io (port 5003 in local configuration)')
  bullet(doc, 'Database: MongoDB (study database)')
  bullet(doc, 'API prefix: /api — auth, tutors, bookings, payments, reviews, students, admin')
  bullet(doc, 'Real-time: Socket.io events for booking confirmed, cancelled, and completed')
  doc.moveDown(0.3)
  body(doc, 'Key frontend routes include public pages (/login, /register), student flows (/tutors, /booking/:tutorId), tutor dashboard, and admin management (/dashboard/admin, /admin/users, /admin/tutors).')

  h1(doc, '3. Feature Inventory')
  simpleTable(doc,
    ['Module', 'Status', 'Details'],
    [
      ['Authentication', 'Complete', 'Register, login, JWT, bcrypt password hashing'],
      ['Student flow', 'Complete', 'Search, profile, booking, payment, dashboard'],
      ['Tutor flow', 'Complete', 'Profile setup, approval, sessions, earnings'],
      ['Admin flow', 'Complete', 'Users, tutors, approvals, audit logs, 10% profit'],
      ['Booking system', 'Complete', 'Slots, conflict checks, status lifecycle'],
      ['Payments', 'Mock only', 'Test cards; no real payment processor'],
      ['Platform fee (10%)', 'Complete', 'Calculated server-side; shown at checkout'],
      ['Reviews', 'Complete', 'Post-session student reviews'],
      ['Meeting links', 'Simulated', 'Mock Zoom URLs generated on payment'],
    ],
    [110, 70, 325]
  )

  h1(doc, '4. Critical Blockers')
  h2(doc, '4.1 Payments Are Mock-Only')
  body(doc, 'The payment controller uses hardcoded test card numbers (4111111111111111 for success, 4000000000000002 for decline). The @paypal/checkout-server-sdk package is installed but not integrated. Real money cannot be collected in production.')
  body(doc, 'Action: Integrate Stripe or PayPal before accepting live payments. Retain mock mode for development only.')

  h2(doc, '4.2 Environment Secrets Not Protected')
  body(doc, '.gitignore does not exclude .env or backend/.env files. JWT secrets and database URIs could be committed to version control.')
  body(doc, 'Action: Add .env files to .gitignore, rotate JWT_SECRET if ever committed, and provide .env.example templates.')

  h2(doc, '4.3 CORS Fully Open on REST API')
  body(doc, 'Express uses app.use(cors()) without origin restriction, while Socket.io correctly limits origins to CLIENT_URL. Any website can call the REST API in production.')
  body(doc, 'Action: Restrict CORS to process.env.CLIENT_URL with credentials enabled.')

  h2(doc, '4.4 Admin Role Registration Loophole')
  body(doc, 'The registration UI only offers student and tutor roles, but POST /api/auth/register accepts any role from the request body, including admin.')
  body(doc, 'Action: Whitelist roles on the server to student and tutor only. Create admin accounts manually or via a secure seed script.')

  h2(doc, '4.5 No Production Hosting Configuration')
  body(doc, 'Missing Dockerfile, docker-compose, CI/CD pipeline, deployment README, health check endpoint, process manager configuration, and reverse proxy setup for SPA routing.')

  h1(doc, '5. High-Priority Issues')
  h3(doc, 'Port configuration inconsistency')
  simpleTable(doc, ['Location', 'Default Port'], [
    ['backend/server.js', '5000'],
    ['vite.config.js proxy', '5003'],
    ['src/services/api.js', '5003'],
    ['SocketContext.jsx fallback', '5000'],
  ], [250, 255])
  body(doc, 'Action: Standardize PORT, VITE_API_URL, VITE_SOCKET_URL, and CLIENT_URL across all environments.')

  h3(doc, 'MongoDB is local-only')
  body(doc, 'Current MONGODB_URI points to mongodb://localhost:27017/study. Production requires MongoDB Atlas or another managed database with IP allowlisting and strong credentials.')

  h3(doc, 'SPA routing in production')
  body(doc, 'BrowserRouter requires the host to serve index.html for all client-side routes. Configure fallback routing on Vercel, Netlify, or Nginx.')

  h3(doc, 'Admin time-range filter non-functional')
  body(doc, 'Admin dashboard sends ?range=week|month|year but getPlatformStats ignores the parameter and always returns the last 7 days.')

  h3(doc, 'Tutor approval role assignment')
  body(doc, 'approveTutor sets isApproved but may not set User.role to tutor, causing booking failures for approved tutors.')

  h3(doc, 'Avatar upload incomplete')
  body(doc, 'tutorController references req.file and /uploads/ but multer middleware and static file serving are not configured.')

  h1(doc, '6. Security Assessment')
  simpleTable(doc, ['Control', 'Status'], [
    ['Password hashing (bcrypt)', 'Implemented'],
    ['JWT on protected routes', 'Implemented'],
    ['RBAC (student/tutor/admin)', 'Partial — register loophole'],
    ['Payment authorization', 'Implemented'],
    ['Audit logs', 'Implemented'],
    ['Rate limiting', 'Not implemented'],
    ['Helmet (HTTP headers)', 'Not implemented'],
    ['Input validation library', 'Manual checks only'],
    ['HTTPS enforcement', 'Deployment responsibility'],
    ['Secrets in environment variables', 'Partial — not gitignored'],
  ], [250, 255])

  h1(doc, '7. Environment Variables')
  h2(doc, 'Backend (backend/.env)')
  simpleTable(doc, ['Variable', 'Required', 'Notes'], [
    ['MONGODB_URI', 'Yes', 'MongoDB Atlas connection string in production'],
    ['JWT_SECRET', 'Yes', 'Long random string (32+ characters)'],
    ['JWT_EXPIRE', 'Yes', 'e.g. 7d or 30d'],
    ['PORT', 'Yes', 'Host-assigned or fixed e.g. 5003'],
    ['CLIENT_URL', 'Yes', 'Production frontend URL for CORS/Socket.io'],
    ['NODE_ENV', 'Recommended', 'Set to production'],
  ], [120, 60, 325])

  h2(doc, 'Frontend (root .env — build-time)')
  simpleTable(doc, ['Variable', 'Required', 'Example'], [
    ['VITE_API_URL', 'Yes', 'https://api.yourdomain.com/api'],
    ['VITE_SOCKET_URL', 'Yes', 'https://api.yourdomain.com'],
  ], [120, 60, 325])
  body(doc, 'Note: Vite embeds VITE_* variables at build time. Rebuild the frontend when these values change.')

  h1(doc, '8. Recommended Deployment Architecture')
  h2(doc, 'Option A — Split Hosting (Recommended)')
  simpleTable(doc, ['Component', 'Service', 'Notes'], [
    ['Frontend', 'Vercel / Netlify / Cloudflare Pages', 'npm run build → serve dist/'],
    ['Backend', 'Render / Railway / Fly.io', 'npm start in backend/'],
    ['Database', 'MongoDB Atlas', 'M0 free tier suitable for staging'],
    ['Domain & SSL', 'Cloudflare', 'DNS + HTTPS'],
  ], [100, 160, 245])

  h2(doc, 'Option B — Single VPS')
  bullet(doc, 'Nginx: SSL termination, /api → Node, / → static dist/, /socket.io → WebSocket proxy')
  bullet(doc, 'PM2 for Node process management')
  bullet(doc, 'MongoDB Atlas (avoid self-hosting DB initially)')

  h1(doc, '9. Pre-Deployment Checklist')
  h2(doc, 'Must Do')
  checklist(doc, [
    'Fix admin registration API role whitelist',
    'Add .env to .gitignore and rotate secrets',
    'Restrict CORS to CLIENT_URL',
    'Set up MongoDB Atlas',
    'Configure all production environment variables',
    'Run npm run build and verify success',
    'Configure SPA fallback routing',
    'Align PORT, VITE_API_URL, VITE_SOCKET_URL, CLIENT_URL',
    'Replace mock payments or label site as demo-only',
  ])

  h2(doc, 'Should Do')
  checklist(doc, [
    'Add helmet and express-rate-limit',
    'Fix tutor approval role assignment',
    'Add GET /api/health endpoint',
    'Write deployment README and .env.example files',
    'Remove debug console.log from production',
    'Fix or remove admin time-range filter UI',
  ])

  h1(doc, '10. Build & Deploy Commands')
  body(doc, 'Frontend: npm install && npm run build (outputs to dist/)')
  body(doc, 'Backend: cd backend && npm install && npm start')
  body(doc, 'Preview: npm run preview (test production frontend build locally)')

  h1(doc, '11. Post-Deployment Verification')
  checklist(doc, [
    'Register as student and tutor',
    'Admin approves tutor application',
    'Student searches, books, and completes checkout',
    'Checkout shows 10% platform fee and correct total',
    'Payment succeeds and booking is confirmed',
    'Admin dashboard reflects updated platform profit',
    'Tutor receives booking; student gets meeting link',
    'Socket notifications fire on booking events',
    'Direct URL access works for all routes',
    '401 responses redirect to login when token expires',
  ])

  h1(doc, '12. Revenue Model Summary')
  simpleTable(doc, ['Item', 'Calculation', 'Example ($50/hr × 1hr)'], [
    ['Session subtotal', 'hourly rate × duration', '$50.00'],
    ['Platform fee', '10% of subtotal', '$5.00'],
    ['Student pays', 'subtotal + platform fee', '$55.00'],
    ['Admin profit', 'sum of platform fees (paid bookings)', '$5.00'],
    ['Tutor earnings', 'session subtotal (completed sessions)', '$50.00'],
  ], [120, 180, 205])

  h1(doc, '13. Final Recommendation')
  simpleTable(doc, ['Deployment Type', 'Ready?'], [
    ['University demo / portfolio', 'Yes — after critical security fixes (Section 4)'],
    ['Beta with test users (no real money)', 'Yes — with mock payments clearly labeled'],
    ['Production with real payments', 'No — requires live gateway, security hardening, monitoring'],
  ], [250, 255])

  doc.moveDown(0.5)
  h2(doc, 'Minimum Path to Staging (1–2 days)')
  bullet(doc, 'MongoDB Atlas + production environment variables')
  bullet(doc, 'Security fixes: CORS, role whitelist, .gitignore')
  bullet(doc, 'Deploy frontend and backend to separate hosts')
  bullet(doc, 'End-to-end testing on staging URL')

  h2(doc, 'Minimum Path to Production (1–2 weeks)')
  bullet(doc, 'All staging requirements above')
  bullet(doc, 'Stripe or PayPal live integration')
  bullet(doc, 'Rate limiting, Helmet, structured logging, error monitoring')
  bullet(doc, 'Deployment documentation and MongoDB backup strategy')

  doc.moveDown(1)
  doc.font('Helvetica-Oblique').fontSize(9).fillColor(COLORS.muted).text(
    `Generated automatically on ${META.date} · StudyBuddy Deployment Readiness Report · Confidential`,
    { align: 'center' }
  )
}

function generateReport() {
  return new Promise((resolve, reject) => {
    const { doc, stream } = createDoc()
    buildReport(doc)
    drawHeaderFooter(doc)
    doc.end()

    stream.on('finish', () => {
      try {
        const stats = fs.statSync(OUTPUT)
        console.log(`Report generated: ${OUTPUT}`)
        console.log(`File size: ${(stats.size / 1024).toFixed(1)} KB`)
        resolve(OUTPUT)
      } catch (error) {
        reject(error)
      }
    })

    stream.on('error', reject)
    doc.on('error', reject)
  })
}

generateReport().catch((error) => {
  console.error('Failed to generate report:', error)
  process.exit(1)
})
