
-- Tiles table: one row per captured cell
CREATE TABLE public.tiles (
  id BIGSERIAL PRIMARY KEY,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  owner_id TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  color TEXT NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (x, y)
);

CREATE INDEX tiles_owner_id_idx ON public.tiles(owner_id);

ALTER TABLE public.tiles ENABLE ROW LEVEL SECURITY;

-- Public board: anyone can read
CREATE POLICY "Anyone can view tiles"
  ON public.tiles FOR SELECT
  USING (true);

-- Anyone can capture a tile
CREATE POLICY "Anyone can insert tiles"
  ON public.tiles FOR INSERT
  WITH CHECK (true);

-- Anyone can recapture (overwrite) any tile
CREATE POLICY "Anyone can update tiles"
  ON public.tiles FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Realtime
ALTER TABLE public.tiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tiles;
