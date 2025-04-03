-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
    
    -- Customer information
    customer_email TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    customer_address JSONB,
    
    -- Order details
    fragrance_id TEXT NOT NULL,
    fragrance_name TEXT NOT NULL,
    bottle_type TEXT NOT NULL,
    label_size TEXT NOT NULL,
    label_id UUID NOT NULL,
    label_image_url TEXT,
    original_image_url TEXT,
    
    -- Stripe information
    stripe_session_id TEXT,
    stripe_customer_id TEXT,
    
    -- Price information
    price INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'jpy',
    
    -- Additional information
    gift_box BOOLEAN DEFAULT false,
    message_card BOOLEAN DEFAULT false,
    message_text TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_customer_email_idx ON orders(customer_email);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own orders
CREATE POLICY "Users can view their own orders"
    ON orders FOR SELECT
    USING (auth.uid() = customer_email);

-- Allow users to create orders
CREATE POLICY "Users can create orders"
    ON orders FOR INSERT
    WITH CHECK (true);

-- Allow service role to update orders
CREATE POLICY "Service role can update orders"
    ON orders FOR UPDATE
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role'); 