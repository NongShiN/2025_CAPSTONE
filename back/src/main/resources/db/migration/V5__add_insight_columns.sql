-- user 테이블에 user_insight 컬럼 추가
ALTER TABLE users
ADD COLUMN IF NOT EXISTS user_insight TEXT;

-- chat_history 테이블에 새로운 컬럼들 추가
ALTER TABLE chat_history
ADD COLUMN IF NOT EXISTS session_insight TEXT,
ADD COLUMN IF NOT EXISTS selected_supervisor VARCHAR(255),
ADD COLUMN IF NOT EXISTS pf_rating INTEGER,
ADD COLUMN IF NOT EXISTS ipt_log TEXT,
ADD COLUMN IF NOT EXISTS cbt_basic_insight TEXT,
ADD COLUMN IF NOT EXISTS cbt_cd_insight TEXT; 