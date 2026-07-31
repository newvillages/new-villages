-- Migration V7: Enable Row-Level Security (RLS) on public user tables
-- Safe execution excluding flyway_schema_history and capturing pooler exceptions
DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND tablename != 'flyway_schema_history'
    ) LOOP 
        BEGIN
            EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;'; 
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP; 
END $$;
