-- Migration 001: Add email verification, OTP fields, avatar to users and otp fields to password_reset_tokens

DO $$ 
BEGIN
    -- users table columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email_verified') THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email_verified_at') THEN
        ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='verification_otp_hash') THEN
        ALTER TABLE users ADD COLUMN verification_otp_hash VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='verification_otp_expires_at') THEN
        ALTER TABLE users ADD COLUMN verification_otp_expires_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='verification_attempts') THEN
        ALTER TABLE users ADD COLUMN verification_attempts INT DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='avatar_url') THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
    END IF;

    -- password_reset_tokens columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='password_reset_tokens' AND column_name='otp_hash') THEN
        ALTER TABLE password_reset_tokens ADD COLUMN otp_hash VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='password_reset_tokens' AND column_name='attempts') THEN
        ALTER TABLE password_reset_tokens ADD COLUMN attempts INT DEFAULT 0;
    END IF;

    -- Existing admin user should have email_verified = true
    UPDATE users SET email_verified = true WHERE role = 'admin' AND email_verified = false;
END $$;
