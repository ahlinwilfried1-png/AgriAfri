-- ==========================================
-- SYSTEME DE SYNCHRONISATION SUPABASE - AGRI_AFRI
-- COPIEZ-COLLEZ CE SCRIPT DANS VOTRE ÉDITEUR SQL SUPABASE
-- CLIQUEZ SUR "RUN" (EXÉCUTER)
-- ==========================================

-- Désactiver la RLS temporairement si vous voulez des autorisations anonymes ouvertes,
-- ou créer des policies complètes.

-- 1. Table des utilisateurs (users)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    phone TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    balance NUMERIC DEFAULT 0,
    "totalEarnings" NUMERIC DEFAULT 0,
    "totalReferralGains" NUMERIC DEFAULT 0,
    "referralCode" TEXT NOT NULL,
    "referredBy" TEXT,
    "signupDate" TEXT NOT NULL,
    blocked BOOLEAN DEFAULT false,
    role TEXT NOT NULL,
    "freeSpins" NUMERIC DEFAULT 0,
    email TEXT,
    password TEXT
);

-- 2. Table des produits (products) - Règle le problème du 404/sync des produits de stabilité modifié !
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    "durationDays" NUMERIC NOT NULL,
    "totalRevenue" NUMERIC NOT NULL,
    active BOOLEAN DEFAULT true,
    "iconName" TEXT NOT NULL,
    description TEXT,
    image TEXT,
    "openingTime" TEXT,
    "closingTime" TEXT,
    "availabilityDurationMinutes" NUMERIC,
    "manualClosed" BOOLEAN DEFAULT false,
    "manualOpened" BOOLEAN DEFAULT false
);

-- 3. Table des investissements / contrats actifs (investments)
CREATE TABLE IF NOT EXISTS public.investments (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    "totalYield" NUMERIC NOT NULL,
    "durationDays" NUMERIC NOT NULL,
    "daysPassed" NUMERIC DEFAULT 0,
    "purchaseDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    status TEXT NOT NULL
);

-- 4. Table des dépôts (deposits)
CREATE TABLE IF NOT EXISTS public.deposits (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userPhone" TEXT NOT NULL,
    "userFullName" TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    operator TEXT NOT NULL,
    "paymentProofImage" TEXT,
    date TEXT NOT NULL,
    status TEXT NOT NULL
);

-- 5. Table des retraits (withdrawals)
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userPhone" TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    "recipientPhone" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL
);

-- 6. Table des tickets d'assistance (tickets)
CREATE TABLE IF NOT EXISTS public.tickets (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userPhone" TEXT NOT NULL,
    "userFullName" TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    reply TEXT,
    "screenshotImage" TEXT,
    status TEXT NOT NULL,
    "messageStatus" TEXT DEFAULT 'NON_LU',
    date TEXT NOT NULL,
    messages JSONB DEFAULT '[]'::jsonb
);

-- 7. Table des avis de satisfaction client (reviews)
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    "authorName" TEXT NOT NULL,
    "authorAvatar" TEXT NOT NULL,
    rating NUMERIC NOT NULL,
    comment TEXT NOT NULL,
    date TEXT NOT NULL,
    "isVerified" BOOLEAN DEFAULT true,
    "imageUrl" TEXT
);

-- 8. Table des posts du forum communautaire (forum_posts)
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id TEXT PRIMARY KEY,
    "authorName" TEXT NOT NULL,
    "authorAvatar" TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    "imageUrl" TEXT,
    date TEXT NOT NULL,
    likes NUMERIC DEFAULT 0,
    "likedBy" JSONB DEFAULT '[]'::jsonb,
    comments JSONB DEFAULT '[]'::jsonb
);

-- 9. Table des notifications utilisateurs (notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    date TEXT NOT NULL,
    read BOOLEAN DEFAULT false
);

-- 10. Table des commissions de parrainage (commissions)
CREATE TABLE IF NOT EXISTS public.commissions (
    id TEXT PRIMARY KEY,
    "referrerId" TEXT NOT NULL,
    "referredId" TEXT NOT NULL,
    "referredName" TEXT NOT NULL,
    level NUMERIC NOT NULL,
    amount NUMERIC NOT NULL,
    date TEXT NOT NULL
);

-- 11. Table des paramètres globaux de l'application (settings)
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'global_config',
    "whatsappLink" TEXT NOT NULL,
    "telegramLink" TEXT NOT NULL,
    "withdrawStartHour" NUMERIC NOT NULL,
    "withdrawEndHour" NUMERIC NOT NULL,
    "minWithdrawAmount" NUMERIC NOT NULL,
    "commissionLevel1" NUMERIC NOT NULL,
    "commissionLevel2" NUMERIC NOT NULL,
    "commissionLevel3" NUMERIC NOT NULL,
    "homeWelcomeTitle" TEXT NOT NULL,
    "homeWelcomeDesc" TEXT NOT NULL,
    "requireStabilityToUnlockOthers" BOOLEAN DEFAULT false,
    "operatorPhones" JSONB DEFAULT '{}'::jsonb,
    "simulatedTime" TEXT
);

-- ==================================================
-- INSÉRER LA CONFIGURATION DE BASE PAR DÉFAUT SI NÉCESSAIRE
-- ==================================================
INSERT INTO public.settings (
    id, "whatsappLink", "telegramLink", "withdrawStartHour", "withdrawEndHour", 
    "minWithdrawAmount", "commissionLevel1", "commissionLevel2", "commissionLevel3", 
    "homeWelcomeTitle", "homeWelcomeDesc", "requireStabilityToUnlockOthers", "operatorPhones", "simulatedTime"
) VALUES (
    'global_config', 
    'https://wa.me/22500000000', 
    'https://t.me/agriafri_vip', 
    9, 
    18, 
    1000, 
    30, 
    2, 
    1, 
    'Investissez Responsable', 
    'AgriAfri est la première plateforme d''investissement participatif ouest-africaine pour l''agriculture durable.', 
    true, 
    '{"mobileMoney": "0102030405 - AgriAfri MTNi", "moovMoney": "0506070809 - AgriAfri Moovi", "flooz": "0708091011 - AgriAfri Floozi"}', 
    NULL
) ON CONFLICT (id) DO NOTHING;

-- Désactiver le contrôle RLS pour simplifier le prototypage sans authentification JWT complexe
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
