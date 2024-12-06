-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: angelcosmeticos
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Temporary view structure for view `vw_saida_estoque`
--

DROP TABLE IF EXISTS `vw_saida_estoque`;
/*!50001 DROP VIEW IF EXISTS `vw_saida_estoque`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_saida_estoque` AS SELECT 
 1 AS `saida_id`,
 1 AS `nome_produto`,
 1 AS `quantidade`,
 1 AS `data_saida`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_saidas_estoque`
--

DROP TABLE IF EXISTS `vw_saidas_estoque`;
/*!50001 DROP VIEW IF EXISTS `vw_saidas_estoque`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_saidas_estoque` AS SELECT 
 1 AS `saida_id`,
 1 AS `nome_produto`,
 1 AS `quantidade`,
 1 AS `data_saida`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_entradas_estoque`
--

DROP TABLE IF EXISTS `vw_entradas_estoque`;
/*!50001 DROP VIEW IF EXISTS `vw_entradas_estoque`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_entradas_estoque` AS SELECT 
 1 AS `entrada_id`,
 1 AS `nome_produto`,
 1 AS `quantidade`,
 1 AS `data_entrada`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_usuarios_completo`
--

DROP TABLE IF EXISTS `vw_usuarios_completo`;
/*!50001 DROP VIEW IF EXISTS `vw_usuarios_completo`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_usuarios_completo` AS SELECT 
 1 AS `id`,
 1 AS `nome`,
 1 AS `email`,
 1 AS `senha`,
 1 AS `logradouro`,
 1 AS `numero`,
 1 AS `complemento`,
 1 AS `bairro`,
 1 AS `cidade`,
 1 AS `estado`,
 1 AS `cep`,
 1 AS `telefone`,
 1 AS `idade`,
 1 AS `genero`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_estoque_atual`
--

DROP TABLE IF EXISTS `vw_estoque_atual`;
/*!50001 DROP VIEW IF EXISTS `vw_estoque_atual`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_estoque_atual` AS SELECT 
 1 AS `produto_id`,
 1 AS `nome_produto`,
 1 AS `estoque_atual`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `vw_saida_estoque`
--

/*!50001 DROP VIEW IF EXISTS `vw_saida_estoque`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_saida_estoque` AS select `s`.`id` AS `saida_id`,`p`.`nome_produto` AS `nome_produto`,`s`.`quantidade` AS `quantidade`,`s`.`data_saida` AS `data_saida` from (`saidas_estoque` `s` join `produtos` `p` on((`s`.`produto_id` = `p`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_saidas_estoque`
--

/*!50001 DROP VIEW IF EXISTS `vw_saidas_estoque`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_saidas_estoque` AS select `s`.`id` AS `saida_id`,`p`.`nome_produto` AS `nome_produto`,`s`.`quantidade` AS `quantidade`,`s`.`data_saida` AS `data_saida` from (`saidas_estoque` `s` join `produtos` `p` on((`s`.`produto_id` = `p`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_entradas_estoque`
--

/*!50001 DROP VIEW IF EXISTS `vw_entradas_estoque`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_entradas_estoque` AS select `e`.`id` AS `entrada_id`,`p`.`nome_produto` AS `nome_produto`,`e`.`quantidade` AS `quantidade`,`e`.`data_entrada` AS `data_entrada` from (`entradas_estoque` `e` join `produtos` `p` on((`e`.`produto_id` = `p`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_usuarios_completo`
--

/*!50001 DROP VIEW IF EXISTS `vw_usuarios_completo`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_usuarios_completo` AS select `u`.`id` AS `id`,`u`.`nome` AS `nome`,`u`.`email` AS `email`,`u`.`senha` AS `senha`,`e`.`logradouro` AS `logradouro`,`e`.`numero` AS `numero`,`e`.`complemento` AS `complemento`,`e`.`bairro` AS `bairro`,`e`.`cidade` AS `cidade`,`e`.`estado` AS `estado`,`e`.`cep` AS `cep`,`c`.`telefone` AS `telefone`,`c`.`idade` AS `idade`,`c`.`genero` AS `genero` from ((`usuarios` `u` left join `enderecos` `e` on((`u`.`id` = `e`.`entidade_id`))) left join `cadastro` `c` on((`u`.`id` = `c`.`usuario_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_estoque_atual`
--

/*!50001 DROP VIEW IF EXISTS `vw_estoque_atual`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_estoque_atual` AS select `p`.`id` AS `produto_id`,`p`.`nome_produto` AS `nome_produto`,`e`.`quantidade` AS `estoque_atual` from (`produtos` `p` join `estoque` `e` on((`p`.`id` = `e`.`produto_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-12-06  3:43:36
