/**
 * @fileoverview Prisma database seed script.
 *
 * Creates realistic dummy data including:
 * - 4 users (2 admins, 2 members)
 * - 2 workspaces
 * - Goals, milestones, activity updates
 * - Announcements with reactions and comments
 * - Action items across kanban statuses
 * - Audit log entries
 *
 * Run with: node prisma/seed.js  OR  npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/** Hashes a plain-text password */
async function hash(password) {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ─── Clean existing data ─────────────────────────────────────────────────
  console.log('🗑️  Cleaning existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.actionItem.deleteMany();
  await prisma.activityUpdate.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  // ─── Users ───────────────────────────────────────────────────────────────
  console.log('👥 Creating users...');

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alex Rivera',
        email: 'alex@demo.com',
        passwordHash: await hash('Password1'),
        bio: 'Product lead with a passion for shipping great software.',
        avatarUrl: 'https://api.dicebear.com/8.x/avataaars/svg?seed=alex',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Sam Chen',
        email: 'sam@demo.com',
        passwordHash: await hash('Password1'),
        bio: 'Full-stack engineer. Coffee aficionado.',
        avatarUrl: 'https://api.dicebear.com/8.x/avataaars/svg?seed=sam',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Jordan Lee',
        email: 'jordan@demo.com',
        passwordHash: await hash('Password1'),
        bio: 'UX designer who writes code.',
        avatarUrl: 'https://api.dicebear.com/8.x/avataaars/svg?seed=jordan',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Morgan Kim',
        email: 'morgan@demo.com',
        passwordHash: await hash('Password1'),
        bio: 'Data-driven marketer.',
        avatarUrl: 'https://api.dicebear.com/8.x/avataaars/svg?seed=morgan',
      },
    }),
  ]);

  const [alex, sam, jordan, morgan] = users;
  console.log(`   ✓ Created ${users.length} users`);

  // ─── Workspaces ──────────────────────────────────────────────────────────
  console.log('🏢 Creating workspaces...');

  const productWorkspace = await prisma.workspace.create({
    data: {
      name: 'Product Team',
      description: 'Where great products are born. Q3 launch planning and execution.',
      accentColor: '#6366f1',
    },
  });

  const marketingWorkspace = await prisma.workspace.create({
    data: {
      name: 'Marketing Hub',
      description: 'Campaign planning, brand strategy, and growth initiatives.',
      accentColor: '#f43f5e',
    },
  });

  console.log(`   ✓ Created 2 workspaces`);

  // ─── Workspace Members ───────────────────────────────────────────────────
  console.log('🔗 Assigning workspace members...');

  await prisma.workspaceMember.createMany({
    data: [
      // Product Team
      { userId: alex.id, workspaceId: productWorkspace.id, role: 'ADMIN' },
      { userId: sam.id, workspaceId: productWorkspace.id, role: 'ADMIN' },
      { userId: jordan.id, workspaceId: productWorkspace.id, role: 'MEMBER' },
      { userId: morgan.id, workspaceId: productWorkspace.id, role: 'MEMBER' },
      // Marketing Hub
      { userId: morgan.id, workspaceId: marketingWorkspace.id, role: 'ADMIN' },
      { userId: alex.id, workspaceId: marketingWorkspace.id, role: 'MEMBER' },
      { userId: jordan.id, workspaceId: marketingWorkspace.id, role: 'MEMBER' },
    ],
  });

  // ─── Goals ───────────────────────────────────────────────────────────────
  console.log('🎯 Creating goals...');

  const goals = await Promise.all([
    prisma.goal.create({
      data: {
        workspaceId: productWorkspace.id,
        ownerId: alex.id,
        title: 'Launch v2.0 of the Core Platform',
        description: 'Complete redesign and rebuild of the core product with new features, improved performance, and a polished UI.',
        status: 'IN_PROGRESS',
        progress: 65,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    }),
    prisma.goal.create({
      data: {
        workspaceId: productWorkspace.id,
        ownerId: sam.id,
        title: 'API Performance Optimization',
        description: 'Reduce average API response time by 40% through query optimization, caching, and infrastructure improvements.',
        status: 'IN_PROGRESS',
        progress: 80,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      },
    }),
    prisma.goal.create({
      data: {
        workspaceId: productWorkspace.id,
        ownerId: jordan.id,
        title: 'Redesign Onboarding Flow',
        description: 'Create a frictionless onboarding experience that gets users to their first aha moment within 5 minutes.',
        status: 'NOT_STARTED',
        progress: 0,
        dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      },
    }),
    prisma.goal.create({
      data: {
        workspaceId: productWorkspace.id,
        ownerId: alex.id,
        title: 'Mobile App Beta Release',
        description: 'Ship the first beta version of the iOS and Android companion app.',
        status: 'COMPLETED',
        progress: 100,
        dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
    }),
    prisma.goal.create({
      data: {
        workspaceId: marketingWorkspace.id,
        ownerId: morgan.id,
        title: 'Q3 Brand Campaign Launch',
        description: 'Execute a multi-channel brand awareness campaign targeting our core demographic.',
        status: 'IN_PROGRESS',
        progress: 45,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.goal.create({
      data: {
        workspaceId: marketingWorkspace.id,
        ownerId: morgan.id,
        title: 'Content Marketing Strategy',
        description: 'Develop and execute a content strategy to drive organic traffic by 50%.',
        status: 'AT_RISK',
        progress: 20,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // overdue risk
      },
    }),
  ]);

  const [platformGoal, apiGoal, onboardingGoal, mobileGoal, brandGoal] = goals;
  console.log(`   ✓ Created ${goals.length} goals`);

  // ─── Milestones ──────────────────────────────────────────────────────────
  console.log('🏁 Creating milestones...');

  await prisma.milestone.createMany({
    data: [
      { goalId: platformGoal.id, title: 'Backend API complete', progress: 100, completed: true },
      { goalId: platformGoal.id, title: 'Frontend components built', progress: 80, completed: false },
      { goalId: platformGoal.id, title: 'QA & bug fixes', progress: 30, completed: false },
      { goalId: platformGoal.id, title: 'Production deployment', progress: 0, completed: false },
      { goalId: apiGoal.id, title: 'Query analysis & N+1 fixes', progress: 100, completed: true },
      { goalId: apiGoal.id, title: 'Redis caching layer', progress: 90, completed: false },
      { goalId: apiGoal.id, title: 'Load testing & benchmarks', progress: 50, completed: false },
      { goalId: brandGoal.id, title: 'Creative brief approved', progress: 100, completed: true },
      { goalId: brandGoal.id, title: 'Ad creatives designed', progress: 60, completed: false },
      { goalId: brandGoal.id, title: 'Channels booked', progress: 0, completed: false },
    ],
  });

  // ─── Activity Updates ─────────────────────────────────────────────────────
  console.log('📝 Creating activity updates...');

  await prisma.activityUpdate.createMany({
    data: [
      {
        goalId: platformGoal.id,
        authorId: alex.id,
        content: 'Completed the backend API for the new workspace module. All endpoints tested and documented.',
      },
      {
        goalId: platformGoal.id,
        authorId: sam.id,
        content: 'Frontend component library is 80% complete. Starting on the dashboard views next.',
      },
      {
        goalId: platformGoal.id,
        authorId: jordan.id,
        content: 'Design tokens and component specs finalized. Handed off to engineering.',
      },
      {
        goalId: apiGoal.id,
        authorId: sam.id,
        content: 'Identified 12 N+1 query issues. Fixed 10 of them — seeing 35% improvement in benchmarks already!',
      },
      {
        goalId: apiGoal.id,
        authorId: sam.id,
        content: 'Redis caching layer is live in staging. Response times down to avg 45ms from 180ms.',
      },
    ],
  });

  // ─── Announcements ────────────────────────────────────────────────────────
  console.log('📢 Creating announcements...');

  const announcements = await Promise.all([
    prisma.announcement.create({
      data: {
        workspaceId: productWorkspace.id,
        authorId: alex.id,
        title: '🚀 v2.0 Sprint Kickoff — All Hands Recap',
        content: '<p>Hey team! We had an incredible kickoff session today. Here are the key decisions:</p><ul><li>We\'re targeting <strong>July 31st</strong> for the v2.0 release</li><li>Daily standups move to 9:30 AM starting Monday</li><li>Each squad owns their module end-to-end</li></ul><p>Let\'s make this happen! 💪</p>',
        isPinned: true,
      },
    }),
    prisma.announcement.create({
      data: {
        workspaceId: productWorkspace.id,
        authorId: sam.id,
        title: '⚡ API is Now 40% Faster in Staging',
        content: '<p>Big win today — our API optimization work is paying off. Average response time dropped from <strong>180ms to 45ms</strong> in staging.</p><p>Key improvements:</p><ul><li>Fixed 12 N+1 query issues</li><li>Added Redis caching for hot paths</li><li>Database index optimizations</li></ul><p>Deploying to production next week after load testing.</p>',
        isPinned: false,
      },
    }),
    prisma.announcement.create({
      data: {
        workspaceId: productWorkspace.id,
        authorId: alex.id,
        title: '📱 Mobile Beta is Live!',
        content: '<p>Huge milestone — our mobile beta is officially out! 🎉</p><p>Download links have been shared with the beta test group. We\'re collecting feedback for the next 2 weeks before the public launch.</p><p>Great work everyone — especially @jordan for the stunning UI work!</p>',
        isPinned: false,
      },
    }),
    prisma.announcement.create({
      data: {
        workspaceId: marketingWorkspace.id,
        authorId: morgan.id,
        title: '📊 Q3 Campaign Brief — Please Review',
        content: '<p>The Q3 brand campaign brief is ready for review. Please read through and add your comments by EOD Friday.</p><p>Key points:</p><ul><li>Target audience: Tech-forward professionals, 25-40</li><li>Primary channels: LinkedIn, YouTube, Podcast sponsorships</li><li>Budget: $45,000</li><li>KPI: 30% brand recall increase</li></ul>',
        isPinned: true,
      },
    }),
  ]);

  const [kickoffAnnouncement, apiAnnouncement, mobileAnnouncement] = announcements;

  // ─── Reactions ────────────────────────────────────────────────────────────
  console.log('😊 Adding reactions...');

  await prisma.reaction.createMany({
    data: [
      { announcementId: kickoffAnnouncement.id, userId: sam.id, emoji: '🚀' },
      { announcementId: kickoffAnnouncement.id, userId: jordan.id, emoji: '🚀' },
      { announcementId: kickoffAnnouncement.id, userId: morgan.id, emoji: '👍' },
      { announcementId: kickoffAnnouncement.id, userId: sam.id, emoji: '🔥' },
      { announcementId: apiAnnouncement.id, userId: alex.id, emoji: '🎉' },
      { announcementId: apiAnnouncement.id, userId: jordan.id, emoji: '🔥' },
      { announcementId: mobileAnnouncement.id, userId: sam.id, emoji: '🎉' },
      { announcementId: mobileAnnouncement.id, userId: jordan.id, emoji: '❤️' },
      { announcementId: mobileAnnouncement.id, userId: morgan.id, emoji: '👍' },
    ],
  });

  // ─── Comments ─────────────────────────────────────────────────────────────
  console.log('💬 Adding comments...');

  await prisma.comment.createMany({
    data: [
      {
        announcementId: kickoffAnnouncement.id,
        authorId: sam.id,
        content: "Pumped for this! Let's get it done. @jordan the Figma specs look amazing btw.",
      },
      {
        announcementId: kickoffAnnouncement.id,
        authorId: jordan.id,
        content: 'Thanks @sam! Happy to do a walkthrough anytime. Can we schedule a design review this week?',
      },
      {
        announcementId: apiAnnouncement.id,
        authorId: alex.id,
        content: 'This is massive. 40% improvement is ahead of target. Great work @sam!',
      },
      {
        announcementId: mobileAnnouncement.id,
        authorId: jordan.id,
        content: 'So excited to see this ship! The feedback from beta users has been phenomenal.',
      },
    ],
  });

  // ─── Action Items ─────────────────────────────────────────────────────────
  console.log('✅ Creating action items...');

  await prisma.actionItem.createMany({
    data: [
      // Platform goal items
      {
        workspaceId: productWorkspace.id,
        goalId: platformGoal.id,
        assigneeId: sam.id,
        title: 'Implement JWT refresh token rotation',
        description: 'Ensure refresh tokens are rotated on each use to prevent replay attacks.',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        workspaceId: productWorkspace.id,
        goalId: platformGoal.id,
        assigneeId: jordan.id,
        title: 'Design the new dashboard layout',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        workspaceId: productWorkspace.id,
        goalId: platformGoal.id,
        assigneeId: sam.id,
        title: 'Build Kanban board component',
        description: 'Drag-and-drop kanban with column status updates via Socket.io.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        workspaceId: productWorkspace.id,
        goalId: platformGoal.id,
        assigneeId: jordan.id,
        title: 'Polish mobile responsive layouts',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        workspaceId: productWorkspace.id,
        goalId: platformGoal.id,
        assigneeId: alex.id,
        title: 'Set up Railway deployment pipeline',
        status: 'IN_REVIEW',
        priority: 'URGENT',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
      {
        workspaceId: productWorkspace.id,
        goalId: platformGoal.id,
        assigneeId: sam.id,
        title: 'Write API documentation (Swagger)',
        status: 'TODO',
        priority: 'LOW',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      },
      {
        workspaceId: productWorkspace.id,
        goalId: platformGoal.id,
        assigneeId: jordan.id,
        title: 'Create onboarding tutorial modals',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      // API goal items
      {
        workspaceId: productWorkspace.id,
        goalId: apiGoal.id,
        assigneeId: sam.id,
        title: 'Run production load test',
        description: 'k6 load test targeting 500 concurrent users for 10 minutes.',
        status: 'TODO',
        priority: 'URGENT',
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      },
      // Marketing items
      {
        workspaceId: marketingWorkspace.id,
        goalId: brandGoal.id,
        assigneeId: morgan.id,
        title: 'Finalize ad copy for LinkedIn',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        workspaceId: marketingWorkspace.id,
        goalId: brandGoal.id,
        assigneeId: jordan.id,
        title: 'Design banner ads (5 sizes)',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // ─── Audit Logs ───────────────────────────────────────────────────────────
  console.log('📋 Creating audit log entries...');

  await prisma.auditLog.createMany({
    data: [
      {
        workspaceId: productWorkspace.id,
        actorId: alex.id,
        action: 'WORKSPACE_CREATED',
        entityType: 'Workspace',
        entityId: productWorkspace.id,
        entityTitle: productWorkspace.name,
      },
      {
        workspaceId: productWorkspace.id,
        actorId: alex.id,
        action: 'GOAL_CREATED',
        entityType: 'Goal',
        entityId: platformGoal.id,
        entityTitle: platformGoal.title,
      },
      {
        workspaceId: productWorkspace.id,
        actorId: sam.id,
        action: 'GOAL_CREATED',
        entityType: 'Goal',
        entityId: apiGoal.id,
        entityTitle: apiGoal.title,
      },
      {
        workspaceId: productWorkspace.id,
        actorId: alex.id,
        action: 'GOAL_STATUS_CHANGED',
        entityType: 'Goal',
        entityId: mobileGoal.id,
        entityTitle: mobileGoal.title,
        metadata: { from: 'IN_PROGRESS', to: 'COMPLETED' },
      },
      {
        workspaceId: productWorkspace.id,
        actorId: alex.id,
        action: 'ANNOUNCEMENT_PINNED',
        entityType: 'Announcement',
        entityId: kickoffAnnouncement.id,
        entityTitle: kickoffAnnouncement.title,
      },
      {
        workspaceId: productWorkspace.id,
        actorId: alex.id,
        action: 'MEMBER_INVITED',
        entityType: 'User',
        entityId: morgan.id,
        entityTitle: morgan.email,
      },
    ],
  });

  console.log('\n✅ Seed complete! Demo accounts:');
  console.log('   📧 alex@demo.com  | 🔑 Password1  (Admin — Product Team)');
  console.log('   📧 sam@demo.com   | 🔑 Password1  (Admin — Product Team)');
  console.log('   📧 jordan@demo.com| 🔑 Password1  (Member)');
  console.log('   📧 morgan@demo.com| 🔑 Password1  (Admin — Marketing Hub)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
