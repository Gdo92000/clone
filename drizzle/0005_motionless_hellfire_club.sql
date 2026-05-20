CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;
CREATE INDEX idx_branches_location ON "branches" USING GIST (ll_to_earth(latitude::double precision, longitude::double precision));
