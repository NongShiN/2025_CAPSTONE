-- chat_history 테이블에서 남아있는 오래된 컬럼들 제거
ALTER TABLE chat_history
DROP COLUMN IF EXISTS severity,
DROP COLUMN IF EXISTS cognitive_distortion,
DROP COLUMN IF EXISTS insight; 