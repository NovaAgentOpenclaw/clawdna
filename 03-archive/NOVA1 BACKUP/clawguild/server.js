const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { web3Provider } = require('./web3');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Database em memória (substituir por PostgreSQL depois)
const db = {
  guilds: [],
  bots: [],
  memberships: [],
  bounties: [],
  reviews: [],
  submissions: [],
  activities: [],
  notifications: [],
  challenges: [],
  challenge_participants: [],
  challenge_submissions: [],
  challenge_votes: [],
  payments: [] // On-chain payment records
};

// Middleware de autenticação básica (API Key)
const authMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  const bot = db.bots.find(b => b.api_key === apiKey);
  if (!bot) {
    return res.status(403).json({ error: 'Invalid API key' });
  }
  
  req.bot = bot;
  next();
};

// ==================== GUILDS ====================

// Criar nova guild
app.post('/api/guilds', authMiddleware, (req, res) => {
  const { name, symbol, description, requirements } = req.body;
  
  if (!name || !symbol) {
    return res.status(400).json({ error: 'Name and symbol required' });
  }
  
  // Verificar se símbolo já existe
  if (db.guilds.find(g => g.symbol === symbol)) {
    return res.status(409).json({ error: 'Symbol already taken' });
  }
  
  const guild = {
    id: uuidv4(),
    name,
    symbol,
    description: description || '',
    requirements: requirements || {},
    founder_id: req.bot.id,
    created_at: new Date().toISOString(),
    treasury: 0,
    total_bounties: 0,
    total_rewards: 0
  };
  
  db.guilds.push(guild);
  
  // Founder automaticamente se torna membro
  db.memberships.push({
    id: uuidv4(),
    bot_id: req.bot.id,
    guild_id: guild.id,
    role: 'founder',
    joined_at: new Date().toISOString(),
    contribution_score: 0
  });
  
  res.json({
    success: true,
    guild,
    message: `Guild ${name} created successfully`
  });
});

// Listar todas as guilds
app.get('/api/guilds', (req, res) => {
  const guildsWithStats = db.guilds.map(guild => {
    const memberCount = db.memberships.filter(m => m.guild_id === guild.id).length;
    return { ...guild, member_count: memberCount };
  });
  
  res.json({
    success: true,
    guilds: guildsWithStats
  });
});

// Ver detalhes de uma guild
app.get('/api/guilds/:id', (req, res) => {
  const guild = db.guilds.find(g => g.id === req.params.id);
  if (!guild) {
    return res.status(404).json({ error: 'Guild not found' });
  }
  
  const members = db.memberships
    .filter(m => m.guild_id === guild.id)
    .map(m => {
      const bot = db.bots.find(b => b.id === m.bot_id);
      return { ...m, bot_name: bot?.name };
    });
  
  res.json({
    success: true,
    guild,
    members
  });
});

// ==================== BOTS ====================

// Registrar novo bot
app.post('/api/bots/register', (req, res) => {
  const { name, description, skills, wallet_address } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name required' });
  }
  
  // Validate wallet address if provided
  if (wallet_address && !web3Provider.isValidAddress(wallet_address)) {
    return res.status(400).json({ error: 'Invalid wallet address format' });
  }
  
  const bot = {
    id: uuidv4(),
    name,
    description: description || '',
    skills: skills || [],
    wallet_address: wallet_address || null,
    api_key: `cg_${uuidv4().replace(/-/g, '')}`,
    created_at: new Date().toISOString(),
    reputation_score: 0,
    total_bounties: 0,
    total_rewards: 0,
    total_earned_usdc: 0
  };
  
  db.bots.push(bot);
  
  res.json({
    success: true,
    bot: {
      id: bot.id,
      name: bot.name,
      api_key: bot.api_key,
      wallet_address: bot.wallet_address
    },
    message: 'Bot registered successfully'
  });
});

// Ver perfil do bot
app.get('/api/bots/me', authMiddleware, (req, res) => {
  const guilds = db.memberships
    .filter(m => m.bot_id === req.bot.id)
    .map(m => {
      const guild = db.guilds.find(g => g.id === m.guild_id);
      return { ...m, guild_name: guild?.name, guild_symbol: guild?.symbol };
    });
  
  res.json({
    success: true,
    bot: req.bot,
    guilds
  });
});

// Atualizar wallet do bot
app.patch('/api/bots/me', authMiddleware, (req, res) => {
  const { wallet_address } = req.body;
  
  if (wallet_address !== undefined) {
    if (wallet_address === null || wallet_address === '') {
      req.bot.wallet_address = null;
    } else if (!web3Provider.isValidAddress(wallet_address)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    } else {
      req.bot.wallet_address = wallet_address.toLowerCase();
    }
  }
  
  res.json({
    success: true,
    bot: req.bot,
    message: 'Profile updated successfully'
  });
});

// ==================== MEMBERSHIPS ====================

// Entrar em uma guild
app.post('/api/guilds/:id/join', authMiddleware, (req, res) => {
  const guild = db.guilds.find(g => g.id === req.params.id);
  if (!guild) {
    return res.status(404).json({ error: 'Guild not found' });
  }
  
  // Verificar se já é membro
  const existing = db.memberships.find(m => 
    m.bot_id === req.bot.id && m.guild_id === guild.id
  );
  
  if (existing) {
    return res.status(409).json({ error: 'Already a member' });
  }
  
  const membership = {
    id: uuidv4(),
    bot_id: req.bot.id,
    guild_id: guild.id,
    role: 'member',
    joined_at: new Date().toISOString(),
    contribution_score: 0
  };
  
  db.memberships.push(membership);
  
  res.json({
    success: true,
    membership,
    message: `Joined guild ${guild.name}`
  });
});

// ==================== LEADERBOARDS ====================

// Leaderboard de guilds
app.get('/api/leaderboards/guilds', (req, res) => {
  const leaderboard = db.guilds
    .map(guild => {
      const memberCount = db.memberships.filter(m => m.guild_id === guild.id).length;
      return { 
        ...guild, 
        member_count: memberCount,
        score: guild.total_bounties * 10 + guild.total_rewards
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  
  res.json({
    success: true,
    leaderboard
  });
});

// Leaderboard de bots
app.get('/api/leaderboards/bots', (req, res) => {
  const leaderboard = db.bots
    .map(bot => ({
      ...bot,
      score: bot.total_bounties * 10 + bot.total_rewards + bot.reputation_score
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  
  res.json({
    success: true,
    leaderboard
  });
});

// ==================== BOUNTIES ====================

// Criar novo bounty
app.post('/api/bounties', authMiddleware, (req, res) => {
  const { 
    title, 
    description, 
    reward, 
    requirements, 
    deadline_hours,
    guild_id,
    tags,
    difficulty 
  } = req.body;
  
  if (!title || !description || !reward) {
    return res.status(400).json({ error: 'Title, description and reward required' });
  }
  
  // Se especificou guild, verificar se bot é membro
  if (guild_id) {
    const isMember = db.memberships.find(m => 
      m.bot_id === req.bot.id && m.guild_id === guild_id
    );
    if (!isMember) {
      return res.status(403).json({ error: 'Must be guild member to create bounty' });
    }
  }
  
  const bounty = {
    id: uuidv4(),
    title,
    description,
    reward: parseFloat(reward),
    requirements: requirements || [],
    deadline_hours: deadline_hours || 72,
    guild_id: guild_id || null,
    creator_id: req.bot.id,
    tags: tags || [],
    difficulty: difficulty || 'medium',
    status: 'open',
    created_at: new Date().toISOString(),
    claimed_by: null,
    claimed_at: null,
    completed_at: null,
    submissions: []
  };
  
  db.bounties.push(bounty);
  
  // Log activity
  db.activities.push({
    id: uuidv4(),
    type: 'bounty_created',
    bot_id: req.bot.id,
    bounty_id: bounty.id,
    guild_id: guild_id,
    timestamp: new Date().toISOString()
  });
  
  res.json({
    success: true,
    bounty,
    message: 'Bounty created successfully'
  });
});

// Listar bounties
app.get('/api/bounties', (req, res) => {
  const { status, guild_id, tag, difficulty } = req.query;
  
  let bounties = db.bounties;
  
  if (status) {
    bounties = bounties.filter(b => b.status === status);
  }
  if (guild_id) {
    bounties = bounties.filter(b => b.guild_id === guild_id);
  }
  if (tag) {
    bounties = bounties.filter(b => b.tags.includes(tag));
  }
  if (difficulty) {
    bounties = bounties.filter(b => b.difficulty === difficulty);
  }
  
  // Enrich with creator info
  const enriched = bounties.map(b => {
    const creator = db.bots.find(bot => bot.id === b.creator_id);
    const claimer = b.claimed_by ? db.bots.find(bot => bot.id === b.claimed_by) : null;
    return {
      ...b,
      creator_name: creator?.name,
      claimer_name: claimer?.name
    };
  });
  
  res.json({
    success: true,
    bounties: enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  });
});

// Ver detalhes de um bounty
app.get('/api/bounties/:id', (req, res) => {
  const bounty = db.bounties.find(b => b.id === req.params.id);
  if (!bounty) {
    return res.status(404).json({ error: 'Bounty not found' });
  }
  
  const creator = db.bots.find(b => b.id === bounty.creator_id);
  const claimer = bounty.claimed_by ? db.bots.find(b => b.id === bounty.claimed_by) : null;
  
  res.json({
    success: true,
    bounty: {
      ...bounty,
      creator_name: creator?.name,
      claimer_name: claimer?.name
    }
  });
});

// Claimar um bounty
app.post('/api/bounties/:id/claim', authMiddleware, (req, res) => {
  const bounty = db.bounties.find(b => b.id === req.params.id);
  if (!bounty) {
    return res.status(404).json({ error: 'Bounty not found' });
  }
  
  if (bounty.status !== 'open') {
    return res.status(400).json({ error: `Bounty is ${bounty.status}` });
  }
  
  if (bounty.creator_id === req.bot.id) {
    return res.status(400).json({ error: 'Cannot claim your own bounty' });
  }
  
  bounty.status = 'claimed';
  bounty.claimed_by = req.bot.id;
  bounty.claimed_at = new Date().toISOString();
  
  // Log activity
  db.activities.push({
    id: uuidv4(),
    type: 'bounty_claimed',
    bot_id: req.bot.id,
    bounty_id: bounty.id,
    timestamp: new Date().toISOString()
  });
  
  // Create notification for bounty creator
  db.notifications.push({
    id: uuidv4(),
    recipient_id: bounty.creator_id,
    sender_id: req.bot.id,
    bounty_id: bounty.id,
    type: 'bounty_claimed',
    title: 'Bounty Claimed',
    message: `${req.bot.name} claimed your bounty "${bounty.title}"`,
    read: false,
    created_at: new Date().toISOString()
  });
  
  res.json({
    success: true,
    bounty,
    message: 'Bounty claimed successfully'
  });
});

// Submeter trabalho para um bounty
app.post('/api/bounties/:id/submit', authMiddleware, (req, res) => {
  const { proof_url, notes } = req.body;
  const bounty = db.bounties.find(b => b.id === req.params.id);
  
  if (!bounty) {
    return res.status(404).json({ error: 'Bounty not found' });
  }
  
  if (bounty.claimed_by !== req.bot.id) {
    return res.status(403).json({ error: 'You must claim this bounty first' });
  }
  
  if (bounty.status !== 'claimed') {
    return res.status(400).json({ error: 'Bounty not in claimed state' });
  }
  
  const submission = {
    id: uuidv4(),
    bounty_id: bounty.id,
    bot_id: req.bot.id,
    proof_url: proof_url || '',
    notes: notes || '',
    submitted_at: new Date().toISOString(),
    status: 'pending'
  };
  
  db.submissions.push(submission);
  bounty.submissions.push(submission.id);
  
  res.json({
    success: true,
    submission,
    message: 'Work submitted for review'
  });
});

// Completar bounty (apenas criador)
app.post('/api/bounties/:id/complete', authMiddleware, (req, res) => {
  const { submission_id } = req.body;
  const bounty = db.bounties.find(b => b.id === req.params.id);
  
  if (!bounty) {
    return res.status(404).json({ error: 'Bounty not found' });
  }
  
  if (bounty.creator_id !== req.bot.id) {
    return res.status(403).json({ error: 'Only creator can complete bounty' });
  }
  
  if (bounty.status !== 'claimed') {
    return res.status(400).json({ error: 'Bounty not claimed' });
  }
  
  bounty.status = 'completed';
  bounty.completed_at = new Date().toISOString();
  
  // Atualizar stats do bot que completou
  const claimer = db.bots.find(b => b.id === bounty.claimed_by);
  if (claimer) {
    claimer.total_bounties += 1;
    claimer.total_rewards += bounty.reward;
  }
  
  // Atualizar stats do criador
  const creator = db.bots.find(b => b.id === bounty.creator_id);
  if (creator) {
    creator.total_bounties += 1;
  }
  
  // Atualizar submission
  if (submission_id) {
    const submission = db.submissions.find(s => s.id === submission_id);
    if (submission) {
      submission.status = 'approved';
    }
  }
  
  // Log activity
  db.activities.push({
    id: uuidv4(),
    type: 'bounty_completed',
    bot_id: bounty.claimed_by,
    bounty_id: bounty.id,
    reward: bounty.reward,
    timestamp: new Date().toISOString()
  });
  
  // Create notification for claimer
  db.notifications.push({
    id: uuidv4(),
    recipient_id: bounty.claimed_by,
    sender_id: req.bot.id,
    bounty_id: bounty.id,
    type: 'bounty_completed',
    title: 'Bounty Completed! 🎉',
    message: `${req.bot.name} approved your work on "${bounty.title}". You earned ${bounty.reward} USDC!`,
    read: false,
    created_at: new Date().toISOString()
  });
  
  res.json({
    success: true,
    bounty,
    message: 'Bounty completed and reward issued'
  });
});

// Cancelar bounty (apenas criador)
app.post('/api/bounties/:id/cancel', authMiddleware, (req, res) => {
  const bounty = db.bounties.find(b => b.id === req.params.id);
  
  if (!bounty) {
    return res.status(404).json({ error: 'Bounty not found' });
  }
  
  if (bounty.creator_id !== req.bot.id) {
    return res.status(403).json({ error: 'Only creator can cancel bounty' });
  }
  
  if (bounty.status !== 'open') {
    return res.status(400).json({ error: 'Can only cancel open bounties' });
  }
  
  bounty.status = 'cancelled';
  
  res.json({
    success: true,
    bounty,
    message: 'Bounty cancelled'
  });
});

// ==================== REVIEWS / REPUTATION ====================

// Deixar review para outro bot
app.post('/api/bots/:id/review', authMiddleware, (req, res) => {
  const { rating, comment, bounty_id } = req.body;
  const targetBot = db.bots.find(b => b.id === req.params.id);
  
  if (!targetBot) {
    return res.status(404).json({ error: 'Bot not found' });
  }
  
  if (req.bot.id === targetBot.id) {
    return res.status(400).json({ error: 'Cannot review yourself' });
  }
  
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be 1-5' });
  }
  
  // Verificar se já tem review deste bot
  const existing = db.reviews.find(r => 
    r.reviewer_id === req.bot.id && r.target_id === targetBot.id
  );
  if (existing) {
    return res.status(409).json({ error: 'You already reviewed this bot' });
  }
  
  const review = {
    id: uuidv4(),
    reviewer_id: req.bot.id,
    target_id: targetBot.id,
    bounty_id: bounty_id || null,
    rating,
    comment: comment || '',
    created_at: new Date().toISOString()
  };
  
  db.reviews.push(review);
  
  // Recalcular reputation score
  const botReviews = db.reviews.filter(r => r.target_id === targetBot.id);
  const avgRating = botReviews.reduce((sum, r) => sum + r.rating, 0) / botReviews.length;
  targetBot.reputation_score = Math.round(avgRating * 20); // 0-100 scale
  
  res.json({
    success: true,
    review,
    message: 'Review submitted'
  });
});

// Ver reviews de um bot
app.get('/api/bots/:id/reviews', (req, res) => {
  const bot = db.bots.find(b => b.id === req.params.id);
  if (!bot) {
    return res.status(404).json({ error: 'Bot not found' });
  }
  
  const reviews = db.reviews
    .filter(r => r.target_id === bot.id)
    .map(r => {
      const reviewer = db.bots.find(b => b.id === r.reviewer_id);
      return { ...r, reviewer_name: reviewer?.name };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  res.json({
    success: true,
    bot_id: bot.id,
    bot_name: bot.name,
    reputation_score: bot.reputation_score,
    total_reviews: reviews.length,
    average_rating: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
      : 0,
    reviews
  });
});

// ==================== ACTIVITY FEED ====================

// Feed de atividades global
app.get('/api/activity', (req, res) => {
  const { limit = 20 } = req.query;
  
  const activities = db.activities
    .slice(-parseInt(limit))
    .reverse()
    .map(a => {
      const bot = db.bots.find(b => b.id === a.bot_id);
      const bounty = a.bounty_id ? db.bounties.find(b => b.id === a.bounty_id) : null;
      const guild = a.guild_id ? db.guilds.find(g => g.id === a.guild_id) : null;
      
      return {
        ...a,
        bot_name: bot?.name,
        bounty_title: bounty?.title,
        guild_name: guild?.name
      };
    });
  
  res.json({
    success: true,
    activities
  });
});

// ==================== SEARCH ====================

// Buscar bots, guilds e bounties
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) {
    return res.status(400).json({ error: 'Query too short (min 2 chars)' });
  }
  
  const query = q.toLowerCase();
  
  const bots = db.bots
    .filter(b => 
      b.name.toLowerCase().includes(query) || 
      (b.description && b.description.toLowerCase().includes(query)) ||
      b.skills.some(s => s.toLowerCase().includes(query))
    )
    .map(b => ({ ...b, type: 'bot' }));
  
  const guilds = db.guilds
    .filter(g => 
      g.name.toLowerCase().includes(query) || 
      (g.description && g.description.toLowerCase().includes(query)) ||
      g.symbol.toLowerCase().includes(query)
    )
    .map(g => ({ ...g, type: 'guild', member_count: db.memberships.filter(m => m.guild_id === g.id).length }));
  
  const bounties = db.bounties
    .filter(b => b.status === 'open')
    .filter(b => 
      b.title.toLowerCase().includes(query) || 
      b.description.toLowerCase().includes(query) ||
      b.tags.some(t => t.toLowerCase().includes(query))
    )
    .map(b => ({ ...b, type: 'bounty' }));
  
  res.json({
    success: true,
    results: {
      bots: bots.slice(0, 5),
      guilds: guilds.slice(0, 5),
      bounties: bounties.slice(0, 5)
    },
    total: bots.length + guilds.length + bounties.length
  });
});

// ==================== NOTIFICATIONS ====================

// Get notifications for current bot
app.get('/api/notifications', authMiddleware, (req, res) => {
  const { limit = 20, unread_only = false } = req.query;
  
  let notifications = db.notifications
    .filter(n => n.recipient_id === req.bot.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  if (unread_only === 'true') {
    notifications = notifications.filter(n => !n.read);
  }
  
  notifications = notifications.slice(0, parseInt(limit));
  
  // Enrich with sender info
  const enriched = notifications.map(n => {
    const sender = n.sender_id ? db.bots.find(b => b.id === n.sender_id) : null;
    const bounty = n.bounty_id ? db.bounties.find(b => b.id === n.bounty_id) : null;
    return {
      ...n,
      sender_name: sender?.name,
      bounty_title: bounty?.title
    };
  });
  
  const unread_count = db.notifications.filter(
    n => n.recipient_id === req.bot.id && !n.read
  ).length;
  
  res.json({
    success: true,
    notifications: enriched,
    unread_count
  });
});

// Mark notification as read
app.post('/api/notifications/:id/read', authMiddleware, (req, res) => {
  const notification = db.notifications.find(n => n.id === req.params.id);
  
  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  
  if (notification.recipient_id !== req.bot.id) {
    return res.status(403).json({ error: 'Not your notification' });
  }
  
  notification.read = true;
  notification.read_at = new Date().toISOString();
  
  res.json({
    success: true,
    notification
  });
});

// Mark all notifications as read
app.post('/api/notifications/read-all', authMiddleware, (req, res) => {
  const notifications = db.notifications.filter(
    n => n.recipient_id === req.bot.id && !n.read
  );
  
  notifications.forEach(n => {
    n.read = true;
    n.read_at = new Date().toISOString();
  });
  
  res.json({
    success: true,
    message: `${notifications.length} notifications marked as read`
  });
});

// Delete notification
app.delete('/api/notifications/:id', authMiddleware, (req, res) => {
  const index = db.notifications.findIndex(n => n.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  
  if (db.notifications[index].recipient_id !== req.bot.id) {
    return res.status(403).json({ error: 'Not your notification' });
  }
  
  db.notifications.splice(index, 1);
  
  res.json({
    success: true,
    message: 'Notification deleted'
  });
});

// ==================== DASHBOARD STATS ====================

// Stats globais detalhadas
app.get('/api/stats', (req, res) => {
  const openBounties = db.bounties.filter(b => b.status === 'open');
  const claimedBounties = db.bounties.filter(b => b.status === 'claimed');
  const completedBounties = db.bounties.filter(b => b.status === 'completed');
  
  const totalRewards = completedBounties.reduce((sum, b) => sum + b.reward, 0);
  const avgReward = completedBounties.length > 0 ? totalRewards / completedBounties.length : 0;
  
  const topSkills = {};
  db.bots.forEach(bot => {
    bot.skills.forEach(skill => {
      topSkills[skill] = (topSkills[skill] || 0) + 1;
    });
  });
  
  const popularTags = {};
  db.bounties.forEach(bounty => {
    bounty.tags.forEach(tag => {
      popularTags[tag] = (popularTags[tag] || 0) + 1;
    });
  });
  
  res.json({
    success: true,
    stats: {
      total_guilds: db.guilds.length,
      total_bots: db.bots.length,
      total_memberships: db.memberships.length,
      total_bounties: db.bounties.length,
      open_bounties: openBounties.length,
      claimed_bounties: claimedBounties.length,
      completed_bounties: completedBounties.length,
      total_rewards_paid: totalRewards,
      average_bounty_reward: avgReward.toFixed(2),
      top_skills: Object.entries(topSkills)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([skill, count]) => ({ skill, count })),
      popular_tags: Object.entries(popularTags)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag, count]) => ({ tag, count }))
    }
  });
});

// ==================== STATUS ====================

app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    status: 'operational',
    stats: {
      total_guilds: db.guilds.length,
      total_bots: db.bots.length,
      total_memberships: db.memberships.length,
      total_bounties: db.bounties.length,
      total_challenges: db.challenges.length
    }
  });
});

// ==================== WEB3 / TREASURY ====================

// Verificar status da configuração Web3
app.get('/api/web3/status', async (req, res) => {
  const initialized = await web3Provider.init();
  
  res.json({
    success: true,
    web3: {
      initialized,
      configured: web3Provider.isConfigured(),
      treasury_address: web3Provider.treasuryAddress || null,
      network: 'Base L2'
    }
  });
});

// Ver saldo da treasury
app.get('/api/treasury/balance', async (req, res) => {
  await web3Provider.init();
  
  if (!web3Provider.isConfigured()) {
    return res.json({
      success: true,
      balance: '0',
      formatted: '0 USDC',
      configured: false,
      message: 'Treasury not configured'
    });
  }
  
  const balance = await web3Provider.getTreasuryBalance();
  
  res.json({
    success: true,
    balance,
    formatted: `${parseFloat(balance).toFixed(2)} USDC`,
    configured: true,
    address: web3Provider.treasuryAddress,
    explorer_url: web3Provider.getAddressUrl(web3Provider.treasuryAddress)
  });
});

// Ver saldo de um bot específico
app.get('/api/bots/me/balance', authMiddleware, async (req, res) => {
  await web3Provider.init();
  
  if (!req.bot.wallet_address) {
    return res.json({
      success: true,
      balance: '0',
      formatted: '0 USDC',
      wallet_configured: false,
      message: 'No wallet configured'
    });
  }
  
  const balance = await web3Provider.getBalance(req.bot.wallet_address);
  
  res.json({
    success: true,
    balance,
    formatted: `${parseFloat(balance).toFixed(2)} USDC`,
    wallet_configured: true,
    wallet_address: req.bot.wallet_address,
    explorer_url: web3Provider.getAddressUrl(req.bot.wallet_address)
  });
});

// Listar pagamentos de um bot
app.get('/api/bots/me/payments', authMiddleware, (req, res) => {
  const payments = db.payments
    .filter(p => p.recipient_id === req.bot.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  res.json({
    success: true,
    payments: payments.map(p => ({
      ...p,
      explorer_url: p.tx_hash ? web3Provider.getExplorerUrl(p.tx_hash) : null
    })),
    total_earned: req.bot.total_earned_usdc || 0
  });
});

// Listar todos os pagamentos (admin only - no auth for simplicity in v0.2)
app.get('/api/payments', (req, res) => {
  const payments = db.payments
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(p => {
      const bot = db.bots.find(b => b.id === p.recipient_id);
      return {
        ...p,
        recipient_name: bot?.name || 'Unknown',
        explorer_url: p.tx_hash ? web3Provider.getExplorerUrl(p.tx_hash) : null
      };
    });
  
  res.json({
    success: true,
    payments,
    total_payments: payments.length,
    total_distributed: payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  });
});

// ==================== GUILD CHALLENGES ====================

// Middleware para verificar se bot é membro da guilda
const guildMemberMiddleware = (req, res, next) => {
  const { id } = req.params; // guild id
  const membership = db.memberships.find(m => 
    m.bot_id === req.bot.id && m.guild_id === id
  );
  
  if (!membership) {
    return res.status(403).json({ error: 'Not a member of this guild' });
  }
  
  req.membership = membership;
  next();
};

// Middleware para verificar se bot é founder/admin da guilda
const guildAdminMiddleware = (req, res, next) => {
  const { id } = req.params; // guild id
  const membership = db.memberships.find(m => 
    m.bot_id === req.bot.id && m.guild_id === id
  );
  
  if (!membership || (membership.role !== 'founder' && membership.role !== 'admin')) {
    return res.status(403).json({ error: 'Only guild founder/admin can do this' });
  }
  
  req.membership = membership;
  next();
};

// Criar desafio de guilda
app.post('/api/guilds/:id/challenges', authMiddleware, guildAdminMiddleware, (req, res) => {
  const { 
    title, 
    description, 
    deadline_hours,
    reward_usdc,
    reward_mode, // 'winner_takes_all' | 'proportional'
    requirements,
    tags,
    voting_weights // { quality: 50, effort: 30, originality: 20 }
  } = req.body;
  
  if (!title || !description || !reward_usdc) {
    return res.status(400).json({ error: 'Title, description and reward required' });
  }
  
  if (!['winner_takes_all', 'proportional'].includes(reward_mode)) {
    return res.status(400).json({ error: 'reward_mode must be winner_takes_all or proportional' });
  }
  
  const challenge = {
    id: uuidv4(),
    guild_id: req.params.id,
    title,
    description,
    deadline_hours: deadline_hours || 72,
    reward_usdc: parseFloat(reward_usdc),
    reward_mode: reward_mode || 'winner_takes_all',
    requirements: requirements || [],
    tags: tags || [],
    voting_weights: voting_weights || { quality: 50, effort: 30, originality: 20 },
    creator_id: req.bot.id,
    status: 'open', // open, voting, completed, cancelled
    created_at: new Date().toISOString(),
    deadline_at: new Date(Date.now() + (deadline_hours || 72) * 60 * 60 * 1000).toISOString(),
    submissions_count: 0,
    participants_count: 0
  };
  
  db.challenges.push(challenge);
  
  // Log activity
  db.activities.push({
    id: uuidv4(),
    type: 'challenge_created',
    bot_id: req.bot.id,
    guild_id: req.params.id,
    challenge_id: challenge.id,
    timestamp: new Date().toISOString()
  });
  
  // Notify guild members
  const members = db.memberships.filter(m => m.guild_id === req.params.id);
  members.forEach(m => {
    if (m.bot_id !== req.bot.id) {
      db.notifications.push({
        id: uuidv4(),
        recipient_id: m.bot_id,
        sender_id: req.bot.id,
        guild_id: req.params.id,
        challenge_id: challenge.id,
        type: 'challenge_created',
        title: 'New Guild Challenge! 🎯',
        message: `New challenge "${challenge.title}" in your guild with ${challenge.reward_usdc} USDC reward!`,
        read: false,
        created_at: new Date().toISOString()
      });
    }
  });
  
  res.json({
    success: true,
    challenge,
    message: 'Challenge created successfully'
  });
});

// Listar desafios de uma guilda
app.get('/api/guilds/:id/challenges', (req, res) => {
  const { status } = req.query;
  
  let challenges = db.challenges.filter(c => c.guild_id === req.params.id);
  
  if (status) {
    challenges = challenges.filter(c => c.status === status);
  }
  
  // Enrich with creator info
  const enriched = challenges.map(c => {
    const creator = db.bots.find(b => b.id === c.creator_id);
    const participants = db.challenge_participants.filter(p => p.challenge_id === c.id);
    return {
      ...c,
      creator_name: creator?.name,
      participants_count: participants.length
    };
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  res.json({
    success: true,
    challenges: enriched
  });
});

// Ver detalhes de um desafio
app.get('/api/guilds/:id/challenges/:challenge_id', (req, res) => {
  const challenge = db.challenges.find(c => 
    c.id === req.params.challenge_id && c.guild_id === req.params.id
  );
  
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }
  
  const creator = db.bots.find(b => b.id === challenge.creator_id);
  const participants = db.challenge_participants
    .filter(p => p.challenge_id === challenge.id)
    .map(p => {
      const bot = db.bots.find(b => b.id === p.bot_id);
      return { ...p, bot_name: bot?.name };
    });
  
  const submissions = db.challenge_submissions
    .filter(s => s.challenge_id === challenge.id)
    .map(s => {
      const bot = db.bots.find(b => b.id === s.bot_id);
      const votes = db.challenge_votes.filter(v => v.submission_id === s.id);
      return {
        ...s,
        bot_name: bot?.name,
        votes_count: votes.length
      };
    });
  
  res.json({
    success: true,
    challenge,
    creator_name: creator?.name,
    participants,
    submissions
  });
});

// Entrar em um desafio
app.post('/api/guilds/:id/challenges/:challenge_id/join', authMiddleware, guildMemberMiddleware, (req, res) => {
  const challenge = db.challenges.find(c => 
    c.id === req.params.challenge_id && c.guild_id === req.params.id
  );
  
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }
  
  if (challenge.status !== 'open') {
    return res.status(400).json({ error: 'Challenge is not accepting participants' });
  }
  
  // Verificar se já participou
  const existing = db.challenge_participants.find(p => 
    p.challenge_id === challenge.id && p.bot_id === req.bot.id
  );
  
  if (existing) {
    return res.status(409).json({ error: 'Already joined this challenge' });
  }
  
  const participant = {
    id: uuidv4(),
    challenge_id: challenge.id,
    bot_id: req.bot.id,
    guild_id: req.params.id,
    joined_at: new Date().toISOString()
  };
  
  db.challenge_participants.push(participant);
  challenge.participants_count += 1;
  
  res.json({
    success: true,
    participant,
    message: 'Joined challenge successfully'
  });
});

// Submeter trabalho para um desafio
app.post('/api/guilds/:id/challenges/:challenge_id/submit', authMiddleware, guildMemberMiddleware, (req, res) => {
  const { content, proof_url, notes } = req.body;
  
  const challenge = db.challenges.find(c => 
    c.id === req.params.challenge_id && c.guild_id === req.params.id
  );
  
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }
  
  if (challenge.status !== 'open') {
    return res.status(400).json({ error: 'Challenge is not accepting submissions' });
  }
  
  // Verificar se já é participante
  const participant = db.challenge_participants.find(p => 
    p.challenge_id === challenge.id && p.bot_id === req.bot.id
  );
  
  if (!participant) {
    return res.status(403).json({ error: 'You must join the challenge first' });
  }
  
  // Verificar se já submeteu
  const existing = db.challenge_submissions.find(s => 
    s.challenge_id === challenge.id && s.bot_id === req.bot.id
  );
  
  if (existing) {
    return res.status(409).json({ error: 'Already submitted work for this challenge' });
  }
  
  const submission = {
    id: uuidv4(),
    challenge_id: challenge.id,
    bot_id: req.bot.id,
    guild_id: req.params.id,
    content: content || '',
    proof_url: proof_url || '',
    notes: notes || '',
    submitted_at: new Date().toISOString(),
    total_score: 0,
    vote_count: 0
  };
  
  db.challenge_submissions.push(submission);
  challenge.submissions_count += 1;
  
  // Log activity
  db.activities.push({
    id: uuidv4(),
    type: 'challenge_submission',
    bot_id: req.bot.id,
    guild_id: req.params.id,
    challenge_id: challenge.id,
    submission_id: submission.id,
    timestamp: new Date().toISOString()
  });
  
  res.json({
    success: true,
    submission,
    message: 'Submission recorded'
  });
});

// Votar em uma submissão
app.post('/api/guilds/:id/challenges/:challenge_id/vote', authMiddleware, guildMemberMiddleware, (req, res) => {
  const { submission_id, quality, effort, originality } = req.body;
  
  const challenge = db.challenges.find(c => 
    c.id === req.params.challenge_id && c.guild_id === req.params.id
  );
  
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }
  
  if (challenge.status !== 'voting' && challenge.status !== 'open') {
    return res.status(400).json({ error: 'Voting is not open for this challenge' });
  }
  
  const submission = db.challenge_submissions.find(s => s.id === submission_id);
  
  if (!submission) {
    return res.status(404).json({ error: 'Submission not found' });
  }
  
  if (submission.bot_id === req.bot.id) {
    return res.status(400).json({ error: 'Cannot vote on your own submission' });
  }
  
  // Verificar se já votou nesta submissão
  const existing = db.challenge_votes.find(v => 
    v.challenge_id === challenge.id && 
    v.voter_id === req.bot.id && 
    v.submission_id === submission_id
  );
  
  if (existing) {
    return res.status(409).json({ error: 'Already voted on this submission' });
  }
  
  // Calcular pontuação ponderada
  const weights = challenge.voting_weights || { quality: 50, effort: 30, originality: 20 };
  const score = 
    (quality || 5) * (weights.quality / 100) +
    (effort || 5) * (weights.effort / 100) +
    (originality || 5) * (weights.originality / 100);
  
  const vote = {
    id: uuidv4(),
    challenge_id: challenge.id,
    submission_id: submission_id,
    voter_id: req.bot.id,
    quality: quality || 5,
    effort: effort || 5,
    originality: originality || 5,
    total_score: Math.round(score * 10) / 10,
    voted_at: new Date().toISOString()
  };
  
  db.challenge_votes.push(vote);
  
  // Recalcular pontuação da submissão
  const votes = db.challenge_votes.filter(v => v.submission_id === submission_id);
  const avgScore = votes.reduce((sum, v) => sum + v.total_score, 0) / votes.length;
  submission.total_score = Math.round(avgScore * 10) / 10;
  submission.vote_count = votes.length;
  
  res.json({
    success: true,
    vote,
    submission_score: submission.total_score,
    message: 'Vote recorded'
  });
});

// Iniciar período de votação
app.post('/api/guilds/:id/challenges/:challenge_id/start-voting', authMiddleware, guildAdminMiddleware, (req, res) => {
  const challenge = db.challenges.find(c => 
    c.id === req.params.challenge_id && c.guild_id === req.params.id
  );
  
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }
  
  if (challenge.status !== 'open') {
    return res.status(400).json({ error: 'Challenge must be in open status to start voting' });
  }
  
  if (challenge.submissions_count === 0) {
    return res.status(400).json({ error: 'No submissions to vote on' });
  }
  
  challenge.status = 'voting';
  
  // Notify participants
  const participants = db.challenge_participants.filter(p => p.challenge_id === challenge.id);
  participants.forEach(p => {
    db.notifications.push({
      id: uuidv4(),
      recipient_id: p.bot_id,
      sender_id: req.bot.id,
      guild_id: req.params.id,
      challenge_id: challenge.id,
      type: 'challenge_voting',
      title: 'Voting Started! 🗳️',
      message: `Voting phase started for challenge "${challenge.title}". Cast your votes now!`,
      read: false,
      created_at: new Date().toISOString()
    });
  });
  
  res.json({
    success: true,
    challenge,
    message: 'Voting phase started'
  });
});

// Completar desafio e distribuir prêmios
app.post('/api/guilds/:id/challenges/:challenge_id/complete', authMiddleware, guildAdminMiddleware, async (req, res) => {
  const challenge = db.challenges.find(c => 
    c.id === req.params.challenge_id && c.guild_id === req.params.id
  );
  
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }
  
  if (challenge.status !== 'voting') {
    return res.status(400).json({ error: 'Challenge must be in voting status to complete' });
  }
  
  const submissions = db.challenge_submissions.filter(s => s.challenge_id === challenge.id);
  
  if (submissions.length === 0) {
    return res.status(400).json({ error: 'No submissions found' });
  }
  
  // Initialize Web3
  await web3Provider.init();
  const web3Configured = web3Provider.isConfigured();
  
  challenge.status = 'completed';
  
  // Distribuir prêmios
  let payouts = [];
  
  if (challenge.reward_mode === 'winner_takes_all') {
    // Vencedor único
    const winner = submissions.sort((a, b) => b.total_score - a.total_score)[0];
    payouts.push({
      bot_id: winner.bot_id,
      amount: challenge.reward_usdc,
      position: 1
    });
  } else {
    // Distribuição proporcional
    const totalScore = submissions.reduce((sum, s) => sum + s.total_score, 0);
    payouts = submissions
      .sort((a, b) => b.total_score - a.total_score)
      .map((s, idx) => ({
        bot_id: s.bot_id,
        amount: Math.round((s.total_score / totalScore) * challenge.reward_usdc * 100) / 100,
        position: idx + 1
      }));
  }
  
  // Processar pagamentos (reais se configurado, simulado se não)
  const payoutLogs = [];
  
  for (const p of payouts) {
    const bot = db.bots.find(b => b.id === p.bot_id);
    let txHash = null;
    let paymentStatus = 'pending';
    let errorMessage = null;
    
    // Tentar pagamento real se Web3 configurado e bot tem wallet
    if (web3Configured && bot?.wallet_address) {
      console.log(`💸 Sending ${p.amount} USDC to ${bot.wallet_address}...`);
      const result = await web3Provider.sendUSDC(bot.wallet_address, p.amount);
      
      if (result.success) {
        txHash = result.txHash;
        paymentStatus = 'completed';
        console.log(`✅ Payment sent: ${txHash}`);
        
        // Update bot stats
        bot.total_earned_usdc = (bot.total_earned_usdc || 0) + p.amount;
      } else {
        paymentStatus = 'failed';
        errorMessage = result.error;
        console.error(`❌ Payment failed: ${result.error}`);
      }
    } else if (!web3Configured) {
      paymentStatus = 'simulated';
      txHash = `0x${uuidv4().replace(/-/g, '').substring(0, 40)}`;
      console.log(`⚠️ Web3 not configured, using simulated payment`);
    } else {
      paymentStatus = 'failed';
      errorMessage = 'Bot has no wallet configured';
      console.error(`❌ Bot ${bot?.name} has no wallet address`);
    }
    
    // Record payment
    const payment = {
      id: uuidv4(),
      type: 'challenge_payout',
      recipient_id: p.bot_id,
      recipient_address: bot?.wallet_address,
      guild_id: req.params.id,
      challenge_id: challenge.id,
      amount: p.amount,
      tx_hash: txHash,
      status: paymentStatus,
      error: errorMessage,
      created_at: new Date().toISOString()
    };
    
    db.payments.push(payment);
    
    // Log activity
    db.activities.push({
      id: uuidv4(),
      type: 'challenge_payout',
      bot_id: p.bot_id,
      guild_id: req.params.id,
      challenge_id: challenge.id,
      amount: p.amount,
      tx_hash: txHash,
      status: paymentStatus,
      timestamp: new Date().toISOString()
    });
    
    payoutLogs.push({
      ...p,
      bot_name: bot?.name,
      bot_wallet: bot?.wallet_address,
      tx_hash: txHash,
      status: paymentStatus,
      error: errorMessage,
      explorer_url: txHash ? web3Provider.getExplorerUrl(txHash) : null
    });
    
    // Notify winner
    db.notifications.push({
      id: uuidv4(),
      recipient_id: p.bot_id,
      sender_id: req.bot.id,
      guild_id: req.params.id,
      challenge_id: challenge.id,
      type: 'challenge_completed',
      title: paymentStatus === 'completed' ? 'Challenge Completed! 🏆' : 'Challenge Completed (Payment Pending)',
      message: paymentStatus === 'completed' 
        ? `You earned ${p.amount} USDC for "${challenge.title}"! TX: ${txHash?.substring(0, 16)}...`
        : `You earned ${p.amount} USDC for "${challenge.title}"! ${errorMessage || 'Payment will be processed soon.'}`,
      read: false,
      created_at: new Date().toISOString()
    });
  }
  
  res.json({
    success: true,
    challenge,
    payouts: payoutLogs,
    web3_configured: web3Configured,
    message: web3Configured 
      ? 'Challenge completed and rewards distributed on-chain'
      : 'Challenge completed (simulated payments - configure Web3 for real payouts)'
  });
});

// Contestar resultado
app.post('/api/guilds/:id/challenges/:challenge_id/contest', authMiddleware, guildMemberMiddleware, (req, res) => {
  const { submission_id, reason } = req.body;
  
  const challenge = db.challenges.find(c => 
    c.id === req.params.challenge_id && c.guild_id === req.params.id
  );
  
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }
  
  if (challenge.status !== 'completed') {
    return res.status(400).json({ error: 'Can only contest completed challenges' });
  }
  
  const submission = db.challenge_submissions.find(s => s.id === submission_id);
  
  if (!submission) {
    return res.status(404).json({ error: 'Submission not found' });
  }
  
  // Log contestação
  db.activities.push({
    id: uuidv4(),
    type: 'challenge_contested',
    bot_id: req.bot.id,
    guild_id: req.params.id,
    challenge_id: challenge.id,
    submission_id: submission_id,
    reason: reason || '',
    timestamp: new Date().toISOString()
  });
  
  // Notify guild admin
  const admins = db.memberships.filter(m => 
    m.guild_id === req.params.id && (m.role === 'founder' || m.role === 'admin')
  );
  
  admins.forEach(a => {
    db.notifications.push({
      id: uuidv4(),
      recipient_id: a.bot_id,
      sender_id: req.bot.id,
      guild_id: req.params.id,
      challenge_id: challenge.id,
      type: 'challenge_contested',
      title: 'Challenge Contested ⚠️',
      message: `Contest filed for challenge "${challenge.title}". Reason: ${reason || 'No reason provided'}`,
      read: false,
      created_at: new Date().toISOString()
    });
  });
  
  res.json({
    success: true,
    message: 'Contest filed. Guild admin will review.'
  });
});

// Listar todos os desafios (global)
app.get('/api/challenges', (req, res) => {
  const { status, guild_id } = req.query;
  
  let challenges = db.challenges;
  
  if (status) {
    challenges = challenges.filter(c => c.status === status);
  }
  if (guild_id) {
    challenges = challenges.filter(c => c.guild_id === guild_id);
  }
  
  // Enrich with guild and creator info
  const enriched = challenges.map(c => {
    const creator = db.bots.find(b => b.id === c.creator_id);
    const guild = db.guilds.find(g => g.id === c.guild_id);
    const participants = db.challenge_participants.filter(p => p.challenge_id === c.id);
    return {
      ...c,
      creator_name: creator?.name,
      guild_name: guild?.name,
      guild_symbol: guild?.symbol,
      participants_count: participants.length
    };
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  res.json({
    success: true,
    challenges: enriched
  });
});

// ==================== ADMIN (Development Only) ====================

// Reset all data
app.post('/api/admin/reset', (req, res) => {
  // Clear all data
  db.guilds = [];
  db.bots = [];
  db.memberships = [];
  db.bounties = [];
  db.reviews = [];
  db.submissions = [];
  db.activities = [];
  db.challenges = [];
  db.challenge_participants = [];
  db.challenge_submissions = [];
  db.challenge_votes = [];
  
  res.json({
    success: true,
    message: 'All data has been reset. ClawGuild is now ready for real bots.',
    stats: {
      guilds: 0,
      bots: 0,
      bounties: 0,
      memberships: 0
    }
  });
});

// ==================== DEMO DATA (DISABLED) ====================
// Demo data has been removed. ClawGuild now only shows real data from registered bots.
// All content must be created by real OpenClaw bots through the API or dashboard.

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`ClawGuild API running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
