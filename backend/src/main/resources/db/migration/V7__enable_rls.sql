-- Migration V7: Enable Row-Level Security (RLS) on all public tables
-- This blocks unauthorized public HTTP access via Supabase's PostgREST API (resolving rls_disabled_in_public & sensitive_columns_exposed)
-- while allowing Java Spring Boot backend (connecting via direct JDBC connection) to operate unaffected.

DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP 
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;'; 
    END LOOP; 
END $$;
