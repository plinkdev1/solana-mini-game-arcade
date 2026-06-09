-- Simplified: Just verify the game types exist, don't try to create game records
-- This script verifies that bubble_flush and chess game types are registered

SELECT 'Game Type Verification' as check_name;

-- Check if bubble_flush exists
SELECT COUNT(*) as bubble_flush_count FROM games WHERE game_type = 'bubble_flush' AND status = 'available';

-- Check if chess exists  
SELECT COUNT(*) as chess_count FROM games WHERE game_type = 'chess' AND status = 'available';

-- List all available game types
SELECT DISTINCT game_type, status FROM games WHERE status = 'available' ORDER BY game_type;
