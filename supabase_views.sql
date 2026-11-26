-- Create Monthly Stats View
-- Joins matches so match_entries with NULL date/season_id still inherit from their parent match.
CREATE OR REPLACE VIEW player_monthly_stats AS
SELECT 
  me.playerid as player_id,
  COALESCE(me.season_id, m.season_id) as season_id,
  EXTRACT(YEAR FROM COALESCE(me.date, m.date)) as year,
  EXTRACT(MONTH FROM COALESCE(me.date, m.date)) - 1 as month_index, -- JavaScript months are 0-indexed (0=January, 11=December)
  COUNT(me.id) as appearances,
  COUNT(CASE WHEN me.result = 'win' THEN 1 END) as wins,
  COUNT(CASE WHEN me.result = 'draw' THEN 1 END) as draws,
  COUNT(CASE WHEN me.result = 'loss' THEN 1 END) as losses,
  COALESCE(SUM(me.goals), 0) as goals,
  COALESCE(SUM(me.goalsconceded), 0) as goalsconceded,
  COUNT(CASE WHEN me.cleansheet = true THEN 1 END) as cleansheets,
  COALESCE(SUM(me.hattricks), 0) as hattricks,
  COUNT(CASE WHEN me.motm = true THEN 1 END) as motmcount
FROM match_entries me
LEFT JOIN matches m ON m.id = me.matchid
WHERE COALESCE(me.date, m.date) IS NOT NULL
GROUP BY 
  me.playerid, 
  COALESCE(me.season_id, m.season_id), 
  EXTRACT(YEAR FROM COALESCE(me.date, m.date)), 
  EXTRACT(MONTH FROM COALESCE(me.date, m.date));


-- Create Weekly Stats View
-- Joins matches so match_entries with NULL date/season_id still inherit from their parent match.
CREATE OR REPLACE VIEW player_weekly_stats AS
SELECT 
  me.playerid as player_id,
  COALESCE(me.season_id, m.season_id) as season_id,
  EXTRACT(YEAR FROM COALESCE(me.date, m.date)) as year,
  EXTRACT(MONTH FROM COALESCE(me.date, m.date)) - 1 as month_index,
  CASE 
    WHEN EXTRACT(DAY FROM COALESCE(me.date, m.date)) <= 7 THEN 1
    WHEN EXTRACT(DAY FROM COALESCE(me.date, m.date)) <= 14 THEN 2
    WHEN EXTRACT(DAY FROM COALESCE(me.date, m.date)) <= 21 THEN 3
    ELSE 4
  END as week,
  COUNT(me.id) as appearances,
  COUNT(CASE WHEN me.result = 'win' THEN 1 END) as wins,
  COUNT(CASE WHEN me.result = 'draw' THEN 1 END) as draws,
  COUNT(CASE WHEN me.result = 'loss' THEN 1 END) as losses,
  COALESCE(SUM(me.goals), 0) as goals,
  COALESCE(SUM(me.goalsconceded), 0) as goalsconceded,
  COUNT(CASE WHEN me.cleansheet = true THEN 1 END) as cleansheets,
  COALESCE(SUM(me.hattricks), 0) as hattricks,
  COUNT(CASE WHEN me.motm = true THEN 1 END) as motmcount
FROM match_entries me
LEFT JOIN matches m ON m.id = me.matchid
WHERE COALESCE(me.date, m.date) IS NOT NULL
GROUP BY 
  me.playerid, 
  COALESCE(me.season_id, m.season_id), 
  EXTRACT(YEAR FROM COALESCE(me.date, m.date)), 
  EXTRACT(MONTH FROM COALESCE(me.date, m.date)),
  CASE 
    WHEN EXTRACT(DAY FROM COALESCE(me.date, m.date)) <= 7 THEN 1
    WHEN EXTRACT(DAY FROM COALESCE(me.date, m.date)) <= 14 THEN 2
    WHEN EXTRACT(DAY FROM COALESCE(me.date, m.date)) <= 21 THEN 3
    ELSE 4
  END;

GRANT SELECT ON player_monthly_stats, player_weekly_stats TO anon, authenticated;
