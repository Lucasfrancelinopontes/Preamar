-- Adiciona a coluna idd e replica os valores atuais de ID_especie
ALTER TABLE especies
ADD COLUMN idd INT NULL AFTER ID_especie;

-- Preenche idd para registros já existentes
UPDATE especies
SET idd = ID_especie
WHERE idd IS NULL;

-- Garante unicidade do idd para evitar duplicidades na edição/cadastro
ALTER TABLE especies
ADD UNIQUE INDEX ux_especies_idd (idd);
