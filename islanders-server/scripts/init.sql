CREATE TABLE IF NOT EXISTS games (
    game_id UUID NOT NULL DEFAULT gen_random_uuid(),
    version INTEGER NOT NULL,
    world JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (game_id, version)
);
