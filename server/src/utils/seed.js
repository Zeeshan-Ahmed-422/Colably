import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';

/**
 * Seeds a baseline dataset for demos.
 * Wipes existing rows so it's safe to re-run.
 */
async function run() {
  console.log('[seed] wiping data...');
  // Order matters because of FK constraints
  await prisma.message.deleteMany({});
  await prisma.deliverable.deleteMany({});
  await prisma.collaboration.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.socialHandle.deleteMany({});
  await prisma.user.deleteMany({});

  const hash = (plain) => bcrypt.hash(plain, 10);

  await prisma.user.create({
    data: {
      name: 'Platform Admin',
      email: 'admin@icp.test',
      password: await hash('admin1234'),
      role: 'admin',
    },
  });

  const brand = await prisma.user.create({
    data: {
      name: 'Aurora Cosmetics',
      email: 'brand@icp.test',
      password: await hash('brand1234'),
      role: 'brand',
      companyName: 'Aurora Cosmetics',
      website: 'https://aurora.example',
      industry: 'Beauty & Personal Care',
      description: 'Clean-beauty brand looking for authentic creators.',
    },
  });

  const noraHandles = [
    { platform: 'instagram', handle: '@nora.iqbal', followers: 120000, engagementRate: 4.2 },
    { platform: 'tiktok',    handle: '@nora.iqbal', followers: 65000,  engagementRate: 6.5 },
  ];
  await prisma.user.create({
    data: {
      name: 'Nora Iqbal',
      email: 'nora@icp.test',
      password: await hash('nora1234'),
      role: 'influencer',
      bio: 'Fashion + lifestyle creator. Karachi-based.',
      location: 'Karachi, PK',
      niches: ['fashion', 'lifestyle'],
      totalFollowers: noraHandles.reduce((s, h) => s + h.followers, 0),
      handles: { create: noraHandles },
    },
  });

  const liamHandles = [
    { platform: 'youtube',   handle: 'LiamChenFit', followers: 230000, engagementRate: 3.1 },
    { platform: 'instagram', handle: '@liamchen',   followers: 80000,  engagementRate: 5.0 },
  ];
  await prisma.user.create({
    data: {
      name: 'Liam Chen',
      email: 'liam@icp.test',
      password: await hash('liam1234'),
      role: 'influencer',
      bio: 'Fitness coach, tech gadgets, daily routines.',
      location: 'Singapore',
      niches: ['fitness', 'tech'],
      totalFollowers: liamHandles.reduce((s, h) => s + h.followers, 0),
      handles: { create: liamHandles },
    },
  });

  const mayaHandles = [
    { platform: 'instagram', handle: '@maya.bites', followers: 47000,  engagementRate: 7.2 },
    { platform: 'tiktok',    handle: '@mayabites',  followers: 102000, engagementRate: 8.4 },
  ];
  await prisma.user.create({
    data: {
      name: 'Maya Rivera',
      email: 'maya@icp.test',
      password: await hash('maya1234'),
      role: 'influencer',
      bio: 'Food & travel storytelling. Always hungry, always packing.',
      location: 'Mexico City',
      niches: ['food', 'travel'],
      totalFollowers: mayaHandles.reduce((s, h) => s + h.followers, 0),
      handles: { create: mayaHandles },
    },
  });

  const c1 = await prisma.campaign.create({
    data: {
      brandId: brand.id,
      title: 'Summer Glow Launch — Reels & Stories',
      description:
        'Promote our new SPF50 day-cream. Looking for beauty/lifestyle creators with engaged audiences. Authentic, story-driven content preferred.',
      budget: 1500,
      platforms: ['instagram', 'tiktok'],
      niches: ['beauty', 'lifestyle', 'fashion'],
      minFollowers: 20000,
      deliverablesTemplate: ['1 Reel (30s+)', '3 Stories with sticker', 'Usage rights — 30 days'],
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      status: 'open',
    },
  });

  const c2 = await prisma.campaign.create({
    data: {
      brandId: brand.id,
      title: 'Founder Q&A — Long-form YouTube',
      description: 'Sit-down format with our founder. Looking for one YouTube creator (200k+ subs).',
      budget: 4500,
      platforms: ['youtube'],
      niches: ['lifestyle', 'tech'],
      minFollowers: 150000,
      deliverablesTemplate: ['1 long-form video (8-12 min)', '1 community-post teaser'],
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
      status: 'open',
    },
  });

  console.log('[seed] done.');
  console.log('  admin   admin@icp.test / admin1234');
  console.log('  brand   brand@icp.test / brand1234');
  console.log('  nora    nora@icp.test  / nora1234');
  console.log('  liam    liam@icp.test  / liam1234');
  console.log('  maya    maya@icp.test  / maya1234');
  console.log(`  campaigns: ${c1.title}, ${c2.title}`);
  await prisma.$disconnect();
}

run().catch(async (err) => {
  console.error('[seed] failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
