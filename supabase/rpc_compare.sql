SELECT
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_function_identity_arguments(p.oid) AS arguments,
    p.prorettype::regtype AS return_type,
    p.prosecdef AS security_definer,
    p.proconfig AS function_config
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
      'imagem_definir_principal',
      'produto_imagem_definir_principal'
  )
ORDER BY p.proname;