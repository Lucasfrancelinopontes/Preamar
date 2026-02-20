
-- SQL tratado para inserir APENAS os dados restantes do dump (desembarques + filhos)
-- Premissa: pescadores e embarcações JÁ foram inseridos no banco.
-- Regras aplicadas:
-- 1) NÃO insere em `especies` nem em `usuarios`
-- 2) NÃO reinsere `pescadores` nem `embarcacoes`
-- 3) Insere/atualiza `desembarques` por `cod_desembarque` (unique) e captura o ID real
-- 4) Insere `desembarque_artes`, `capturas`, `individuos` referenciando os IDs capturados
-- 5) Não força IDs (PKs) nas tabelas filhas (auto-increment)

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

START TRANSACTION;

-- --------------------
-- Mapeamento (IDs já existentes)
-- Ajuste aqui se necessário (caso algum cpf/código seja diferente no banco).
-- --------------------
SET @p1 := (
  SELECT ID_pescador
  FROM pescadores
  WHERE cpf IN ('71550088424', '71550088423') OR nome = 'Claudio'
  ORDER BY (cpf = '71550088423') DESC, (cpf = '71550088424') DESC
  LIMIT 1
);
SET @p2 := (SELECT ID_pescador FROM pescadores WHERE cpf = '111.111.111-11' OR nome = 'José da Silva' LIMIT 1);
SET @p3 := (SELECT ID_pescador FROM pescadores WHERE cpf = '222.222.222-22' OR nome = 'Maria Santos' LIMIT 1);
SET @p4 := (SELECT ID_pescador FROM pescadores WHERE cpf = '333.333.333-33' OR nome = 'Pedro Oliveira' LIMIT 1);

SET @e1 := (SELECT ID_embarcacao FROM embarcacoes WHERE codigo_embarcacao = '453' LIMIT 1);
SET @e2 := (SELECT ID_embarcacao FROM embarcacoes WHERE codigo_embarcacao = 'JP-001' LIMIT 1);
SET @e3 := (SELECT ID_embarcacao FROM embarcacoes WHERE codigo_embarcacao = 'CB-002' LIMIT 1);
SET @e4 := (SELECT ID_embarcacao FROM embarcacoes WHERE codigo_embarcacao = 'CO-003' LIMIT 1);
SET @e5 := (SELECT ID_embarcacao FROM embarcacoes WHERE codigo_embarcacao = 'PB-001' LIMIT 1);
SET @e6 := (
  SELECT ID_embarcacao
  FROM embarcacoes
  WHERE codigo_embarcacao = 'nn' AND nome_embarcacao = 'arca'
  LIMIT 1
);
SET @e6 := COALESCE(@e6, (SELECT ID_embarcacao FROM embarcacoes WHERE codigo_embarcacao = 'nn' LIMIT 1));
SET @e7 := (SELECT ID_embarcacao FROM embarcacoes WHERE codigo_embarcacao = 'xx' LIMIT 1);
SET @e8 := (SELECT ID_embarcacao FROM embarcacoes WHERE codigo_embarcacao = '2010073550' LIMIT 1);

-- --------------------
-- Desembarques (UPSERT por cod_desembarque + captura do ID)
-- --------------------
INSERT INTO desembarques (
  cod_desembarque, cod_foto, municipio, municipio_code, localidade, localidade_code,
  data_coleta, consecutivo, ID_pescador, ID_embarcacao,
  data_saida, hora_saida, data_chegada, hora_desembarque, numero_tripulantes, pesqueiros,
  lat_ida, long_ida, lat_volta, long_volta,
  quadrante1, quadrante2, quadrante3,
  proprietario, apelido_proprietario, atuou_pesca, origem,
  desp_diesel, desp_gasolina, litros, gelo_kg, rancho_valor,
  destino_pescado, destino_apelido, destino_outros_qual,
  arte_obs, coletor, data_coletor, revisor, data_revisor, digitador, data_digitador,
  total_desembarque, createdAt, updatedAt
) VALUES (
  'João Pessoa-Seixas-12-11-25-01', NULL, 'João Pessoa', 'JP', 'Seixas', 'SX',
  '2025-11-12', 1, @p1, @e1,
  '2025-11-12 20:29:00', NULL, '2025-11-13 17:23:00', NULL, 345, '354',
  NULL, NULL, NULL, NULL,
  '123', '456', '346',
  NULL, NULL, NULL, NULL,
  0, 0, NULL, 354.00, 3543.00,
  'armador', NULL, NULL,
  NULL, NULL, '2025-11-13', NULL, NULL, NULL, NULL,
  NULL, '2025-11-13 17:25:12', '2025-11-13 17:25:12'
)
ON DUPLICATE KEY UPDATE
  ID_desembarque = LAST_INSERT_ID(ID_desembarque),
  updatedAt = VALUES(updatedAt);
SET @d1 := LAST_INSERT_ID();

INSERT INTO desembarques (
  cod_desembarque, cod_foto, municipio, municipio_code, localidade, localidade_code,
  data_coleta, consecutivo, ID_pescador, ID_embarcacao,
  data_saida, hora_saida, data_chegada, hora_desembarque, numero_tripulantes, pesqueiros,
  lat_ida, long_ida, lat_volta, long_volta,
  quadrante1, quadrante2, quadrante3,
  proprietario, apelido_proprietario, atuou_pesca, origem,
  desp_diesel, desp_gasolina, litros, gelo_kg, rancho_valor,
  destino_pescado, destino_apelido, destino_outros_qual,
  arte_obs, coletor, data_coletor, revisor, data_revisor, digitador, data_digitador,
  total_desembarque, createdAt, updatedAt
) VALUES (
  'JP-TU-10-10-25-01', NULL, 'JP', NULL, 'TU', NULL,
  '2025-11-13', 1, @p2, @e2,
  '2025-11-13 00:00:00', '05:00:00', '2025-11-13 00:00:00', '14:00:00', 2, 'Banco 1',
  NULL, NULL, NULL, NULL,
  NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  0, 0, NULL, NULL, NULL,
  NULL, NULL, NULL,
  NULL, 'Sistema Automático', '2025-11-13', NULL, NULL, NULL, NULL,
  195.00, '2025-11-13 17:33:07', '2025-11-13 17:33:07'
)
ON DUPLICATE KEY UPDATE
  ID_desembarque = LAST_INSERT_ID(ID_desembarque),
  updatedAt = VALUES(updatedAt);
SET @d2 := LAST_INSERT_ID();

INSERT INTO desembarques (
  cod_desembarque, cod_foto, municipio, municipio_code, localidade, localidade_code,
  data_coleta, consecutivo, ID_pescador, ID_embarcacao,
  data_saida, hora_saida, data_chegada, hora_desembarque, numero_tripulantes, pesqueiros,
  lat_ida, long_ida, lat_volta, long_volta,
  quadrante1, quadrante2, quadrante3,
  proprietario, apelido_proprietario, atuou_pesca, origem,
  desp_diesel, desp_gasolina, litros, gelo_kg, rancho_valor,
  destino_pescado, destino_apelido, destino_outros_qual,
  arte_obs, coletor, data_coletor, revisor, data_revisor, digitador, data_digitador,
  total_desembarque, createdAt, updatedAt
) VALUES (
  'JP-TU-09-10-25-02', NULL, 'JP', NULL, 'TU', NULL,
  '2025-11-12', 2, @p3, @e3,
  '2025-11-12 00:00:00', '05:00:00', '2025-11-12 00:00:00', '14:00:00', 3, 'Banco 2',
  NULL, NULL, NULL, NULL,
  NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  0, 0, NULL, NULL, NULL,
  NULL, NULL, NULL,
  NULL, 'Sistema Automático', '2025-11-12', NULL, NULL, NULL, NULL,
  234.00, '2025-11-13 17:33:07', '2025-11-13 17:33:07'
)
ON DUPLICATE KEY UPDATE
  ID_desembarque = LAST_INSERT_ID(ID_desembarque),
  updatedAt = VALUES(updatedAt);
SET @d3 := LAST_INSERT_ID();

INSERT INTO desembarques (
  cod_desembarque, cod_foto, municipio, municipio_code, localidade, localidade_code,
  data_coleta, consecutivo, ID_pescador, ID_embarcacao,
  data_saida, hora_saida, data_chegada, hora_desembarque, numero_tripulantes, pesqueiros,
  lat_ida, long_ida, lat_volta, long_volta,
  quadrante1, quadrante2, quadrante3,
  proprietario, apelido_proprietario, atuou_pesca, origem,
  desp_diesel, desp_gasolina, litros, gelo_kg, rancho_valor,
  destino_pescado, destino_apelido, destino_outros_qual,
  arte_obs, coletor, data_coletor, revisor, data_revisor, digitador, data_digitador,
  total_desembarque, createdAt, updatedAt
) VALUES (
  'JP-TU-08-10-25-03', NULL, 'JP', NULL, 'TU', NULL,
  '2025-11-11', 3, @p4, @e4,
  '2025-11-11 00:00:00', '05:00:00', '2025-11-11 00:00:00', '14:00:00', 4, 'Banco 3',
  NULL, NULL, NULL, NULL,
  NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  0, 0, NULL, NULL, NULL,
  NULL, NULL, NULL,
  NULL, 'Sistema Automático', '2025-11-11', NULL, NULL, NULL, NULL,
  273.00, '2025-11-13 17:33:07', '2025-11-13 17:33:07'
)
ON DUPLICATE KEY UPDATE
  ID_desembarque = LAST_INSERT_ID(ID_desembarque),
  updatedAt = VALUES(updatedAt);
SET @d4 := LAST_INSERT_ID();

INSERT INTO desembarques (
  cod_desembarque, cod_foto, municipio, municipio_code, localidade, localidade_code,
  data_coleta, consecutivo, ID_pescador, ID_embarcacao,
  data_saida, hora_saida, data_chegada, hora_desembarque, numero_tripulantes, pesqueiros,
  lat_ida, long_ida, lat_volta, long_volta,
  quadrante1, quadrante2, quadrante3,
  proprietario, apelido_proprietario, atuou_pesca, origem,
  desp_diesel, desp_gasolina, litros, gelo_kg, rancho_valor,
  destino_pescado, destino_apelido, destino_outros_qual,
  arte_obs, coletor, data_coletor, revisor, data_revisor, digitador, data_digitador,
  total_desembarque, createdAt, updatedAt
) VALUES (
  'JP-TU-07-10-25-04', NULL, 'JP', NULL, 'TU', NULL,
  '2025-11-10', 4, @p2, @e2,
  '2025-11-10 00:00:00', '05:00:00', '2025-11-10 00:00:00', '14:00:00', 2, 'Banco 4',
  NULL, NULL, NULL, NULL,
  NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  0, 0, NULL, NULL, NULL,
  NULL, NULL, NULL,
  NULL, 'Sistema Automático', '2025-11-10', NULL, NULL, NULL, NULL,
  312.00, '2025-11-13 17:33:07', '2025-11-13 17:33:07'
)
ON DUPLICATE KEY UPDATE
  ID_desembarque = LAST_INSERT_ID(ID_desembarque),
  updatedAt = VALUES(updatedAt);
SET @d5 := LAST_INSERT_ID();

INSERT INTO desembarques (
  cod_desembarque, cod_foto, municipio, municipio_code, localidade, localidade_code,
  data_coleta, consecutivo, ID_pescador, ID_embarcacao,
  data_saida, hora_saida, data_chegada, hora_desembarque, numero_tripulantes, pesqueiros,
  lat_ida, long_ida, lat_volta, long_volta,
  quadrante1, quadrante2, quadrante3,
  proprietario, apelido_proprietario, atuou_pesca, origem,
  desp_diesel, desp_gasolina, litros, gelo_kg, rancho_valor,
  destino_pescado, destino_apelido, destino_outros_qual,
  arte_obs, coletor, data_coletor, revisor, data_revisor, digitador, data_digitador,
  total_desembarque, createdAt, updatedAt
) VALUES (
  'JP-TU-06-10-25-05', NULL, 'JP', NULL, 'TU', NULL,
  '2025-11-09', 5, @p3, @e3,
  '2025-11-09 00:00:00', '05:00:00', '2025-11-09 00:00:00', '14:00:00', 3, 'Banco 5',
  NULL, NULL, NULL, NULL,
  NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  0, 0, NULL, NULL, NULL,
  NULL, NULL, NULL,
  NULL, 'Sistema Automático', '2025-11-09', NULL, NULL, NULL, NULL,
  351.00, '2025-11-13 17:33:07', '2025-11-13 17:33:07'
)
ON DUPLICATE KEY UPDATE
  ID_desembarque = LAST_INSERT_ID(ID_desembarque),
  updatedAt = VALUES(updatedAt);
SET @d6 := LAST_INSERT_ID();

INSERT INTO desembarques (
  cod_desembarque, cod_foto, municipio, municipio_code, localidade, localidade_code,
  data_coleta, consecutivo, ID_pescador, ID_embarcacao,
  data_saida, hora_saida, data_chegada, hora_desembarque, numero_tripulantes, pesqueiros,
  lat_ida, long_ida, lat_volta, long_volta,
  quadrante1, quadrante2, quadrante3,
  proprietario, apelido_proprietario, atuou_pesca, origem,
  desp_diesel, desp_gasolina, litros, gelo_kg, rancho_valor,
  destino_pescado, destino_apelido, destino_outros_qual,
  arte_obs, coletor, data_coletor, revisor, data_revisor, digitador, data_digitador,
  total_desembarque, createdAt, updatedAt
) VALUES (
  'JP-TU-05-10-25-06', NULL, 'JP', NULL, 'TU', NULL,
  '2025-11-08', 6, @p4, @e4,
  '2025-11-08 00:00:00', '05:00:00', '2025-11-08 00:00:00', '14:00:00', 4, 'Banco 6',
  NULL, NULL, NULL, NULL,
  NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  0, 0, NULL, NULL, NULL,
  NULL, NULL, NULL,
  NULL, 'Sistema Automático', '2025-11-08', NULL, NULL, NULL, NULL,
  390.00, '2025-11-13 17:33:07', '2025-11-13 17:33:07'
)
ON DUPLICATE KEY UPDATE
  ID_desembarque = LAST_INSERT_ID(ID_desembarque),
  updatedAt = VALUES(updatedAt);
SET @d7 := LAST_INSERT_ID();

INSERT INTO desembarques (
  cod_desembarque, cod_foto, municipio, municipio_code, localidade, localidade_code,
  data_coleta, consecutivo, ID_pescador, ID_embarcacao,
  data_saida, hora_saida, data_chegada, hora_desembarque, numero_tripulantes, pesqueiros,
  lat_ida, long_ida, lat_volta, long_volta,
  quadrante1, quadrante2, quadrante3,
  proprietario, apelido_proprietario, atuou_pesca, origem,
  desp_diesel, desp_gasolina, litros, gelo_kg, rancho_valor,
  destino_pescado, destino_apelido, destino_outros_qual,
  arte_obs, coletor, data_coletor, revisor, data_revisor, digitador, data_digitador,
  total_desembarque, createdAt, updatedAt
) VALUES (
  'JP-TU-04-10-25-07', NULL, 'JP', NULL, 'TU', NULL,
  '2025-11-07', 7, @p2, @e2,
  '2025-11-07 00:00:00', '05:00:00', '2025-11-07 00:00:00', '14:00:00', 2, 'Banco 7',
  NULL, NULL, NULL, NULL,
  NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  0, 0, NULL, NULL, NULL,
  NULL, NULL, NULL,
  NULL, 'Sistema Automático', '2025-11-07', NULL, NULL, NULL, NULL,
  429.00, '2025-11-13 17:33:07', '2025-11-13 17:33:07'
)
ON DUPLICATE KEY UPDATE
  ID_desembarque = LAST_INSERT_ID(ID_desembarque),
  updatedAt = VALUES(updatedAt);
SET @d8 := LAST_INSERT_ID();

INSERT INTO desembarques (
  cod_desembarque, cod_foto, municipio, municipio_code, localidade, localidade_code,
  data_coleta, consecutivo, ID_pescador, ID_embarcacao,
  data_saida, hora_saida, data_chegada, hora_desembarque, numero_tripulantes, pesqueiros,
  lat_ida, long_ida, lat_volta, long_volta,
  quadrante1, quadrante2, quadrante3,
  proprietario, apelido_proprietario, atuou_pesca, origem,
  desp_diesel, desp_gasolina, litros, gelo_kg, rancho_valor,
  destino_pescado, destino_apelido, destino_outros_qual,
  arte_obs, coletor, data_coletor, revisor, data_revisor, digitador, data_digitador,
  total_desembarque, createdAt, updatedAt
) VALUES (
  'JP-TU-03-10-25-08', NULL, 'JP', NULL, 'TU', NULL,
  '2025-11-06', 8, @p3, @e3,
  '2025-11-06 00:00:00', '05:00:00', '2025-11-06 00:00:00', '14:00:00', 3, 'Banco 8',
  NULL, NULL, NULL, NULL,
  NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  0, 0, NULL, NULL, NULL,
  NULL, NULL, NULL,
  NULL, 'Sistema Automático', '2025-11-06', NULL, NULL, NULL, NULL,
  468.00, '2025-11-13 17:33:07', '2025-11-13 17:33:07'
)
ON DUPLICATE KEY UPDATE
  ID_desembarque = LAST_INSERT_ID(ID_desembarque),
  updatedAt = VALUES(updatedAt);
SET @d9 := LAST_INSERT_ID();

INSERT INTO desembarques (
  cod_desembarque, cod_foto, municipio, municipio_code, localidade, localidade_code,
  data_coleta, consecutivo, ID_pescador, ID_embarcacao,
  data_saida, hora_saida, data_chegada, hora_desembarque, numero_tripulantes, pesqueiros,
  lat_ida, long_ida, lat_volta, long_volta,
  quadrante1, quadrante2, quadrante3,
  proprietario, apelido_proprietario, atuou_pesca, origem,
  desp_diesel, desp_gasolina, litros, gelo_kg, rancho_valor,
  destino_pescado, destino_apelido, destino_outros_qual,
  arte_obs, coletor, data_coletor, revisor, data_revisor, digitador, data_digitador,
  total_desembarque, createdAt, updatedAt
) VALUES (
  'JP-TU-02-10-25-09', NULL, 'JP', NULL, 'TU', NULL,
  '2025-11-05', 9, @p4, @e4,
  '2025-11-05 00:00:00', '05:00:00', '2025-11-05 00:00:00', '14:00:00', 4, 'Banco 9',
  NULL, NULL, NULL, NULL,
  NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  0, 0, NULL, NULL, NULL,
  NULL, NULL, NULL,
  NULL, 'Sistema Automático', '2025-11-05', NULL, NULL, NULL, NULL,
  507.00, '2025-11-13 17:33:07', '2025-11-13 17:33:08'
)
ON DUPLICATE KEY UPDATE
  ID_desembarque = LAST_INSERT_ID(ID_desembarque),
  updatedAt = VALUES(updatedAt);
SET @d10 := LAST_INSERT_ID();

INSERT INTO desembarques (
  cod_desembarque, cod_foto, municipio, municipio_code, localidade, localidade_code,
  data_coleta, consecutivo, ID_pescador, ID_embarcacao,
  data_saida, hora_saida, data_chegada, hora_desembarque, numero_tripulantes, pesqueiros,
  lat_ida, long_ida, lat_volta, long_volta,
  quadrante1, quadrante2, quadrante3,
  proprietario, apelido_proprietario, atuou_pesca, origem,
  desp_diesel, desp_gasolina, litros, gelo_kg, rancho_valor,
  destino_pescado, destino_apelido, destino_outros_qual,
  arte_obs, coletor, data_coletor, revisor, data_revisor, digitador, data_digitador,
  total_desembarque, createdAt, updatedAt
) VALUES (
  'JP-TU-01-10-25-10', NULL, 'JP', NULL, 'TU', NULL,
  '2025-11-04', 10, @p2, @e2,
  '2025-11-04 00:00:00', '05:00:00', '2025-11-04 00:00:00', '14:00:00', 2, 'Banco 10',
  NULL, NULL, NULL, NULL,
  NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  0, 0, NULL, NULL, NULL,
  NULL, NULL, NULL,
  NULL, 'Sistema Automático', '2025-11-04', NULL, NULL, NULL, NULL,
  546.00, '2025-11-13 17:33:08', '2025-11-13 17:33:08'
)
ON DUPLICATE KEY UPDATE
  ID_desembarque = LAST_INSERT_ID(ID_desembarque),
  updatedAt = VALUES(updatedAt);
SET @d11 := LAST_INSERT_ID();

INSERT INTO desembarques (
  cod_desembarque, cod_foto, municipio, municipio_code, localidade, localidade_code,
  data_coleta, consecutivo, ID_pescador, ID_embarcacao,
  data_saida, hora_saida, data_chegada, hora_desembarque, numero_tripulantes, pesqueiros,
  lat_ida, long_ida, lat_volta, long_volta,
  quadrante1, quadrante2, quadrante3,
  proprietario, apelido_proprietario, atuou_pesca, origem,
  desp_diesel, desp_gasolina, litros, gelo_kg, rancho_valor,
  destino_pescado, destino_apelido, destino_outros_qual,
  arte_obs, coletor, data_coletor, revisor, data_revisor, digitador, data_digitador,
  total_desembarque, createdAt, updatedAt
) VALUES (
  'TEST-1763055223699', NULL, 'JP', NULL, 'TU', NULL,
  '2025-11-13', 999, @p1, @e1,
  '2025-11-13 00:00:00', '06:00:00', '2025-11-13 00:00:00', '15:00:00', 2, 'Banco de Teste',
  NULL, NULL, NULL, NULL,
  NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  0, 0, NULL, NULL, NULL,
  NULL, NULL, NULL,
  NULL, 'Teste Automático', '2025-11-13', NULL, NULL, NULL, NULL,
  NULL, '2025-11-13 17:33:43', '2025-11-13 17:33:43'
)
ON DUPLICATE KEY UPDATE
  ID_desembarque = LAST_INSERT_ID(ID_desembarque),
  updatedAt = VALUES(updatedAt);
SET @d12 := LAST_INSERT_ID();

INSERT INTO desembarques (
  cod_desembarque, cod_foto, municipio, municipio_code, localidade, localidade_code,
  data_coleta, consecutivo, ID_pescador, ID_embarcacao,
  data_saida, hora_saida, data_chegada, hora_desembarque, numero_tripulantes, pesqueiros,
  lat_ida, long_ida, lat_volta, long_volta,
  quadrante1, quadrante2, quadrante3,
  proprietario, apelido_proprietario, atuou_pesca, origem,
  desp_diesel, desp_gasolina, litros, gelo_kg, rancho_valor,
  destino_pescado, destino_apelido, destino_outros_qual,
  arte_obs, coletor, data_coletor, revisor, data_revisor, digitador, data_digitador,
  total_desembarque, createdAt, updatedAt
) VALUES (
  'Lucena-Pontinha - Lucena-10-11-25-02', NULL, 'Lucena', 'LU', 'Pontinha - Lucena', 'PL',
  '2025-11-10', 2, @p1, @e1,
  '2025-11-10 17:36:00', NULL, '2025-11-13 17:36:00', NULL, 345, '354',
  NULL, NULL, NULL, NULL,
  '123', '456', '346',
  NULL, NULL, NULL, NULL,
  0, 0, NULL, 354.00, 3543.00,
  'atravessador', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  144.00, '2025-11-13 17:37:46', '2025-11-13 17:37:46'
)
ON DUPLICATE KEY UPDATE
  ID_desembarque = LAST_INSERT_ID(ID_desembarque),
  updatedAt = VALUES(updatedAt);
SET @d13 := LAST_INSERT_ID();

INSERT INTO desembarques (
  cod_desembarque, cod_foto, municipio, municipio_code, localidade, localidade_code,
  data_coleta, consecutivo, ID_pescador, ID_embarcacao,
  data_saida, hora_saida, data_chegada, hora_desembarque, numero_tripulantes, pesqueiros,
  lat_ida, long_ida, lat_volta, long_volta,
  quadrante1, quadrante2, quadrante3,
  proprietario, apelido_proprietario, atuou_pesca, origem,
  desp_diesel, desp_gasolina, litros, gelo_kg, rancho_valor,
  destino_pescado, destino_apelido, destino_outros_qual,
  arte_obs, coletor, data_coletor, revisor, data_revisor, digitador, data_digitador,
  total_desembarque, createdAt, updatedAt
) VALUES (
  'Lucena-Costinha-04-11-25-10', NULL, 'Lucena', 'LU', 'Costinha', 'CT',
  '2025-11-04', 10, @p1, @e1,
  '2025-11-04 19:46:00', NULL, '2025-11-13 17:44:00', NULL, 345, '354',
  NULL, NULL, NULL, NULL,
  '123', '456', '346',
  NULL, NULL, NULL, NULL,
  0, 0, NULL, 354.00, 3543.00,
  'consumidor', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  288.00, '2025-11-13 17:51:10', '2025-11-13 17:51:10'
)
ON DUPLICATE KEY UPDATE
  ID_desembarque = LAST_INSERT_ID(ID_desembarque),
  updatedAt = VALUES(updatedAt);
SET @d14 := LAST_INSERT_ID();

INSERT INTO desembarques (
  cod_desembarque, cod_foto, municipio, municipio_code, localidade, localidade_code,
  data_coleta, consecutivo, ID_pescador, ID_embarcacao,
  data_saida, hora_saida, data_chegada, hora_desembarque, numero_tripulantes, pesqueiros,
  lat_ida, long_ida, lat_volta, long_volta,
  quadrante1, quadrante2, quadrante3,
  proprietario, apelido_proprietario, atuou_pesca, origem,
  desp_diesel, desp_gasolina, litros, gelo_kg, rancho_valor,
  destino_pescado, destino_apelido, destino_outros_qual,
  arte_obs, coletor, data_coletor, revisor, data_revisor, digitador, data_digitador,
  total_desembarque, createdAt, updatedAt
) VALUES (
  'Lucena-Costinha-12-11-25-03', NULL, 'Lucena', 'LU', 'Costinha', 'CT',
  '2025-11-12', 3, @p1, @e1,
  '2025-11-12 17:55:00', NULL, '2025-11-13 17:55:00', NULL, 345, '354',
  NULL, NULL, NULL, NULL,
  '123', '456', '346',
  NULL, NULL, NULL, NULL,
  0, 0, NULL, 354.00, 3543.00,
  'consumidor', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  840.00, '2025-11-13 18:12:49', '2025-11-13 18:12:49'
)
ON DUPLICATE KEY UPDATE
  ID_desembarque = LAST_INSERT_ID(ID_desembarque),
  updatedAt = VALUES(updatedAt);
SET @d15 := LAST_INSERT_ID();

INSERT INTO desembarques (
  cod_desembarque, cod_foto, municipio, municipio_code, localidade, localidade_code,
  data_coleta, consecutivo, ID_pescador, ID_embarcacao,
  data_saida, hora_saida, data_chegada, hora_desembarque, numero_tripulantes, pesqueiros,
  lat_ida, long_ida, lat_volta, long_volta,
  quadrante1, quadrante2, quadrante3,
  proprietario, apelido_proprietario, atuou_pesca, origem,
  desp_diesel, desp_gasolina, litros, gelo_kg, rancho_valor,
  destino_pescado, destino_apelido, destino_outros_qual,
  arte_obs, coletor, data_coletor, revisor, data_revisor, digitador, data_digitador,
  total_desembarque, createdAt, updatedAt
) VALUES (
  'João Pessoa-Mercado de peixe de Tambaú-12-11-25-01', NULL, 'João Pessoa', 'JP', 'Mercado de peixe de Tambaú', 'TU',
  '2025-11-12', 1, NULL, @e1,
  '2025-11-12 23:49:00', NULL, '2025-11-13 18:44:00', NULL, 345, '354',
  NULL, NULL, NULL, NULL,
  '123', '456', '346',
  NULL, NULL, NULL, NULL,
  0, 0, NULL, 354.00, 3543.00,
  'armador', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  6480.00, '2025-11-13 18:46:22', '2025-11-13 18:46:22'
)
ON DUPLICATE KEY UPDATE
  ID_desembarque = LAST_INSERT_ID(ID_desembarque),
  updatedAt = VALUES(updatedAt);
SET @d16 := LAST_INSERT_ID();

INSERT INTO desembarques (
  cod_desembarque, cod_foto, municipio, municipio_code, localidade, localidade_code,
  data_coleta, consecutivo, ID_pescador, ID_embarcacao,
  data_saida, hora_saida, data_chegada, hora_desembarque, numero_tripulantes, pesqueiros,
  lat_ida, long_ida, lat_volta, long_volta,
  quadrante1, quadrante2, quadrante3,
  proprietario, apelido_proprietario, atuou_pesca, origem,
  desp_diesel, desp_gasolina, litros, gelo_kg, rancho_valor,
  destino_pescado, destino_apelido, destino_outros_qual,
  arte_obs, coletor, data_coletor, revisor, data_revisor, digitador, data_digitador,
  total_desembarque, createdAt, updatedAt
) VALUES (
  'Baía da Traição-Em frente do bar "do tubarão"-06-11-25-03', NULL, 'Baía da Traição', 'BT', 'Em frente do bar "do tubarão"', 'TB',
  '2025-11-06', 3, NULL, @e6,
  '2025-11-06 13:03:00', NULL, '2025-11-11 13:03:00', NULL, 3, '456',
  NULL, NULL, NULL, NULL,
  '456', '349', '567',
  NULL, NULL, NULL, NULL,
  0, 0, NULL, 354.00, 3543.00,
  'atravessador', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  420.00, '2025-11-18 13:20:21', '2025-11-18 13:20:21'
)
ON DUPLICATE KEY UPDATE
  ID_desembarque = LAST_INSERT_ID(ID_desembarque),
  updatedAt = VALUES(updatedAt);
SET @d17 := LAST_INSERT_ID();

INSERT INTO desembarques (
  cod_desembarque, cod_foto, municipio, municipio_code, localidade, localidade_code,
  data_coleta, consecutivo, ID_pescador, ID_embarcacao,
  data_saida, hora_saida, data_chegada, hora_desembarque, numero_tripulantes, pesqueiros,
  lat_ida, long_ida, lat_volta, long_volta,
  quadrante1, quadrante2, quadrante3,
  proprietario, apelido_proprietario, atuou_pesca, origem,
  desp_diesel, desp_gasolina, litros, gelo_kg, rancho_valor,
  destino_pescado, destino_apelido, destino_outros_qual,
  arte_obs, coletor, data_coletor, revisor, data_revisor, digitador, data_digitador,
  total_desembarque, createdAt, updatedAt
) VALUES (
  'BT PP 16 09 25 02', NULL, 'Baía da Traição', 'BT', 'Em frente às duas principais praças', 'PP',
  '2025-09-16', 2, NULL, @e7,
  '2025-09-16 09:30:00', NULL, '2025-09-16 20:40:00', NULL, 4, '1',
  NULL, NULL, NULL, NULL,
  '123', NULL, '123',
  NULL, NULL, NULL, NULL,
  0, 1, 50.00, 100.00, 180.00,
  NULL, NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  0.00, '2025-12-11 11:47:24', '2025-12-11 11:47:25'
)
ON DUPLICATE KEY UPDATE
  ID_desembarque = LAST_INSERT_ID(ID_desembarque),
  updatedAt = VALUES(updatedAt);
SET @d18 := LAST_INSERT_ID();

INSERT INTO desembarques (
  cod_desembarque, cod_foto, municipio, municipio_code, localidade, localidade_code,
  data_coleta, consecutivo, ID_pescador, ID_embarcacao,
  data_saida, hora_saida, data_chegada, hora_desembarque, numero_tripulantes, pesqueiros,
  lat_ida, long_ida, lat_volta, long_volta,
  quadrante1, quadrante2, quadrante3,
  proprietario, apelido_proprietario, atuou_pesca, origem,
  desp_diesel, desp_gasolina, litros, gelo_kg, rancho_valor,
  destino_pescado, destino_apelido, destino_outros_qual,
  arte_obs, coletor, data_coletor, revisor, data_revisor, digitador, data_digitador,
  total_desembarque, createdAt, updatedAt
) VALUES (
  'MR CP 16 09 25 01', NULL, 'Marcação', 'MR', 'Camurupim', 'CP',
  '2025-09-16', 1, NULL, @e8,
  '2025-09-16 10:25:00', NULL, '2025-09-16 21:30:00', NULL, 4, '1',
  NULL, NULL, NULL, NULL,
  '123', NULL, NULL,
  NULL, NULL, NULL, NULL,
  1, 0, 50.00, 50.00, 140.00,
  NULL, NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  0.00, '2025-12-11 11:55:59', '2025-12-11 11:55:59'
)
ON DUPLICATE KEY UPDATE
  ID_desembarque = LAST_INSERT_ID(ID_desembarque),
  updatedAt = VALUES(updatedAt);
SET @d19 := LAST_INSERT_ID();

INSERT INTO desembarques (
  cod_desembarque, cod_foto, municipio, municipio_code, localidade, localidade_code,
  data_coleta, consecutivo, ID_pescador, ID_embarcacao,
  data_saida, hora_saida, data_chegada, hora_desembarque, numero_tripulantes, pesqueiros,
  lat_ida, long_ida, lat_volta, long_volta,
  quadrante1, quadrante2, quadrante3,
  proprietario, apelido_proprietario, atuou_pesca, origem,
  desp_diesel, desp_gasolina, litros, gelo_kg, rancho_valor,
  destino_pescado, destino_apelido, destino_outros_qual,
  arte_obs, coletor, data_coletor, revisor, data_revisor, digitador, data_digitador,
  total_desembarque, createdAt, updatedAt
) VALUES (
  'BT PP 11 09 25 03', NULL, 'Baía da Traição', 'BT', 'Em frente às duas principais praças', 'PP',
  '2025-09-10', 3, NULL, @e6,
  '2025-09-10 09:00:00', NULL, '2025-09-11 22:00:00', NULL, 4, '1',
  NULL, NULL, NULL, NULL,
  '123', NULL, NULL,
  NULL, NULL, NULL, NULL,
  1, 0, 50.00, 100.00, 240.00,
  NULL, NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  0.00, '2025-12-11 12:14:35', '2025-12-11 12:14:35'
)
ON DUPLICATE KEY UPDATE
  ID_desembarque = LAST_INSERT_ID(ID_desembarque),
  updatedAt = VALUES(updatedAt);
SET @d20 := LAST_INSERT_ID();

INSERT INTO desembarques (
  cod_desembarque, cod_foto, municipio, municipio_code, localidade, localidade_code,
  data_coleta, consecutivo, ID_pescador, ID_embarcacao,
  data_saida, hora_saida, data_chegada, hora_desembarque, numero_tripulantes, pesqueiros,
  lat_ida, long_ida, lat_volta, long_volta,
  quadrante1, quadrante2, quadrante3,
  proprietario, apelido_proprietario, atuou_pesca, origem,
  desp_diesel, desp_gasolina, litros, gelo_kg, rancho_valor,
  destino_pescado, destino_apelido, destino_outros_qual,
  arte_obs, coletor, data_coletor, revisor, data_revisor, digitador, data_digitador,
  total_desembarque, createdAt, updatedAt
) VALUES (
  'BT PP 11 09 25 01', NULL, 'Baía da Traição', 'BT', 'Em frente às duas principais praças', 'PP',
  '2025-09-11', 1, NULL, @e6,
  '2025-09-11 10:00:00', NULL, '2025-09-11 20:00:00', NULL, 4, '1',
  NULL, NULL, NULL, NULL,
  '123', NULL, NULL,
  NULL, NULL, NULL, NULL,
  1, 0, 50.00, 50.00, 160.00,
  NULL, NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  0.00, '2025-12-11 12:33:53', '2025-12-11 12:33:53'
)
ON DUPLICATE KEY UPDATE
  ID_desembarque = LAST_INSERT_ID(ID_desembarque),
  updatedAt = VALUES(updatedAt);
SET @d21 := LAST_INSERT_ID();

INSERT INTO desembarques (
  cod_desembarque, cod_foto, municipio, municipio_code, localidade, localidade_code,
  data_coleta, consecutivo, ID_pescador, ID_embarcacao,
  data_saida, hora_saida, data_chegada, hora_desembarque, numero_tripulantes, pesqueiros,
  lat_ida, long_ida, lat_volta, long_volta,
  quadrante1, quadrante2, quadrante3,
  proprietario, apelido_proprietario, atuou_pesca, origem,
  desp_diesel, desp_gasolina, litros, gelo_kg, rancho_valor,
  destino_pescado, destino_apelido, destino_outros_qual,
  arte_obs, coletor, data_coletor, revisor, data_revisor, digitador, data_digitador,
  total_desembarque, createdAt, updatedAt
) VALUES (
  'BT PP 11 09 25 02', NULL, 'Baía da Traição', 'BT', 'Em frente às duas principais praças', 'PP',
  '2025-09-11', 2, NULL, @e6,
  '2025-09-11 10:00:00', NULL, '2025-09-11 20:20:00', NULL, 5, '1',
  NULL, NULL, NULL, NULL,
  '123', NULL, NULL,
  NULL, NULL, NULL, NULL,
  1, 0, 50.00, 50.00, 160.00,
  NULL, NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  0.00, '2025-12-11 14:15:32', '2025-12-11 14:15:32'
)
ON DUPLICATE KEY UPDATE
  ID_desembarque = LAST_INSERT_ID(ID_desembarque),
  updatedAt = VALUES(updatedAt);
SET @d22 := LAST_INSERT_ID();


-- --------------------
-- Tabelas filhas: remove registros existentes desses desembarques
-- (evita duplicar caso rode o script novamente)
-- --------------------
DELETE FROM desembarque_artes WHERE ID_desembarque IN (@d1,@d2,@d3,@d4,@d5,@d6,@d7,@d8,@d9,@d10,@d11,@d12,@d13,@d14,@d15,@d16,@d17,@d18,@d19,@d20,@d21,@d22);
DELETE FROM capturas WHERE ID_desembarque IN (@d1,@d2,@d3,@d4,@d5,@d6,@d7,@d8,@d9,@d10,@d11,@d12,@d13,@d14,@d15,@d16,@d17,@d18,@d19,@d20,@d21,@d22);
DELETE FROM individuos WHERE ID_desembarque IN (@d1,@d2,@d3,@d4,@d5,@d6,@d7,@d8,@d9,@d10,@d11,@d12,@d13,@d14,@d15,@d16,@d17,@d18,@d19,@d20,@d21,@d22);

-- --------------------
-- Artes do desembarque
-- --------------------
INSERT INTO desembarque_artes (ID_desembarque, arte, tamanho, unidade) VALUES
  (@d1, 'linha_mao', '12', NULL),
  (@d2, 'rede_fundeio', '100', 'm'),
  (@d3, 'linha_mao', '110', 'm'),
  (@d4, 'rede_fundeio', '120', 'm'),
  (@d5, 'linha_mao', '130', 'm'),
  (@d6, 'rede_fundeio', '140', 'm'),
  (@d7, 'linha_mao', '150', 'm'),
  (@d8, 'rede_fundeio', '160', 'm'),
  (@d9, 'linha_mao', '170', 'm'),
  (@d10, 'rede_fundeio', '180', 'm'),
  (@d11, 'linha_mao', '190', 'm'),
  (@d13, 'rede_fundeio', '12', NULL),
  (@d14, 'espinhel_mergulho', '12', NULL),
  (@d14, 'rede_fundeio', '12', NULL),
  (@d15, 'espinhel_mergulho', '12', NULL),
  (@d16, 'rede_fundeio', '1', NULL),
  (@d17, 'rede_boirea', '450', NULL),
  (@d17, 'linha_mao', '50', NULL),
  (@d18, 'covo', '1', NULL),
  (@d19, 'covo', '1', NULL),
  (@d20, 'covo', '1', NULL),
  (@d21, 'covo', '1', NULL),
  (@d22, 'covo', '1', NULL);


-- --------------------
-- Capturas
-- --------------------
INSERT INTO capturas (ID_desembarque, ID_especie, peso_kg, preco_kg, preco_total, comprimento_cm) VALUES
  (@d2, 24, 10.00, 12.00, 120.00, NULL),
  (@d2, 45, 5.00, 15.00, 75.00, NULL),
  (@d3, 24, 12.00, 12.00, 144.00, NULL),
  (@d3, 45, 6.00, 15.00, 90.00, NULL),
  (@d4, 24, 14.00, 12.00, 168.00, NULL),
  (@d4, 45, 7.00, 15.00, 105.00, NULL),
  (@d5, 24, 16.00, 12.00, 192.00, NULL),
  (@d5, 45, 8.00, 15.00, 120.00, NULL),
  (@d6, 24, 18.00, 12.00, 216.00, NULL),
  (@d6, 45, 9.00, 15.00, 135.00, NULL),
  (@d7, 24, 20.00, 12.00, 240.00, NULL),
  (@d7, 45, 10.00, 15.00, 150.00, NULL),
  (@d8, 24, 22.00, 12.00, 264.00, NULL),
  (@d8, 45, 11.00, 15.00, 165.00, NULL),
  (@d9, 24, 24.00, 12.00, 288.00, NULL),
  (@d9, 45, 12.00, 15.00, 180.00, NULL),
  (@d10, 24, 26.00, 12.00, 312.00, NULL),
  (@d10, 45, 13.00, 15.00, 195.00, NULL),
  (@d11, 24, 28.00, 12.00, 336.00, NULL),
  (@d11, 45, 14.00, 15.00, 210.00, NULL),
  (@d12, 8, 12.00, 12.00, 144.00, 12.00),
  (@d13, 5, 12.00, 12.00, 144.00, 12.00),
  (@d14, 12, 12.00, 12.00, 144.00, 200.00),
  (@d14, 61, 12.00, 12.00, 144.00, 12.00),
  (@d15, 4, 24.00, 35.00, 840.00, 345.00),
  (@d16, 4, 90.00, 20.00, 1800.00, NULL),
  (@d16, 16, 234.00, 20.00, 4680.00, NULL),
  (@d17, 2, 20.00, 21.00, 420.00, NULL);


-- --------------------
-- Indivíduos
-- --------------------
INSERT INTO individuos (ID_desembarque, ID_especie, comprimento_padrao_cm, peso_g, numero_individuo) VALUES
  (@d16, 4, NULL, 250.00, NULL),
  (@d16, 4, NULL, 2344.00, NULL),
  (@d16, 16, NULL, 234.00, NULL),
  (@d17, 2, NULL, 210.00, NULL),
  (@d17, 2, NULL, 234.00, NULL),
  (@d17, 2, NULL, 324.00, NULL);

-- --------------------
-- Remoção solicitada: desembarques contendo
-- "lucas francelino" OU "barba negra" OU "barba rosa"
-- (remove também registros nas tabelas filhas)
-- --------------------
DELETE d, da, c, i
FROM desembarques d
LEFT JOIN desembarque_artes da ON da.ID_desembarque = d.ID_desembarque
LEFT JOIN capturas c ON c.ID_desembarque = d.ID_desembarque
LEFT JOIN individuos i ON i.ID_desembarque = d.ID_desembarque
LEFT JOIN pescadores p ON p.ID_pescador = d.ID_pescador
LEFT JOIN embarcacoes e ON e.ID_embarcacao = d.ID_embarcacao
WHERE
  LOWER(COALESCE(p.nome, '')) LIKE '%lucas francelino%'
  OR LOWER(COALESCE(e.nome_embarcacao, '')) LIKE '%barba negra%'
  OR LOWER(COALESCE(e.nome_embarcacao, '')) LIKE '%barba rosa%'
  OR LOWER(COALESCE(d.proprietario, '')) LIKE '%lucas francelino%'
  OR LOWER(COALESCE(d.proprietario, '')) LIKE '%barba negra%'
  OR LOWER(COALESCE(d.proprietario, '')) LIKE '%barba rosa%';

COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
