-- Remove renamed agent rows (canonical ids: reality_check, devils_advocate)
DELETE FROM agent_library WHERE id IN ('reality_check_biz', 'devils_mirror');
