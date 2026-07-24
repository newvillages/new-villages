-- Update seeded administrator email and full name to match New Villages rebranding
UPDATE users 
SET full_name = 'New Villages Admin', email = 'admin@newvillages.ca' 
WHERE email = 'admin@onevillage.ca';

UPDATE users 
SET full_name = 'New Villages Admin' 
WHERE full_name = 'OneVillage Admin';
