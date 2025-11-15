-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    password_hash TEXT,
    role TEXT CHECK (role IN ('freelancer', 'client', 'admin')),
    verified BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP DEFAULT NOW(),
    profile_data JSONB
);

-- JOBS TABLE
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    title TEXT,
    description TEXT,
    client_id INTEGER REFERENCES users(id),
    posted_at TIMESTAMP DEFAULT NOW(),
    status TEXT CHECK (status IN ('open', 'awarded', 'completed', 'cancelled')),
    budget NUMERIC,
    deadline TIMESTAMP
);

-- APPLICATIONS / OFFERS TABLE
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id),
    freelancer_id INTEGER REFERENCES users(id),
    bid_amount NUMERIC,
    proposed_deadline TIMESTAMP,
    proposal_text TEXT,
    status TEXT DEFAULT 'pending'
);

-- PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id),
    sender_id INTEGER REFERENCES users(id),
    receiver_id INTEGER REFERENCES users(id),
    amount NUMERIC,
    payment_method TEXT,
    status TEXT CHECK (status IN ('pending', 'completed', 'refunded')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id TEXT,
    sender_id INTEGER REFERENCES users(id),
    receiver_id INTEGER REFERENCES users(id),
    content TEXT,
    sent_at TIMESTAMP DEFAULT NOW()
);

-- REVIEWS / RATINGS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    reviewer_id INTEGER REFERENCES users(id),
    subject_id INTEGER REFERENCES users(id),
    job_id INTEGER REFERENCES jobs(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
