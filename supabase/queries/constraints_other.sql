SELECT tc.table_name, tc.constraint_name, tc.constraint_type, kcu.column_name, 
       ccu.table_name AS references_table, ccu.column_name AS references_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_schema = 'public' 
  AND tc.table_name IN ('cliente','endereco','carrinho','carrinho_item',
                        'pedido','pedido_item','pagamento','frete_regra',
                        'pedido_status_historico','atendimento','atendimento_mensagem',
                        'admin_user','auditoria','evento')
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name