# Backend Preamar - Sistema de Monitoramento de Desembarque

Sistema para registro e análise de desembarques pesqueiros

## Estrutura do Banco de Dados

### Tabelas Principais

1. **pescadores** - Dados dos pescadores
2. **embarcacoes** - Dados das embarcações
3. **especies** - Catálogo de espécies (pré-populado)
4. **petrechos** - Tipos de petrechos de pesca
5. **desembarques** - Registro principal de cada desembarque
6. **desembarque_artes** - Artes de pesca utilizadas em cada desembarque
7. **capturas** - Peso e preço das capturas por espécie
8. **individuos** - Medidas individuais de peixes (comprimento e peso)

### Relacionamentos

- Um **pescador** pode ter vários **desembarques**
- Uma **embarcação** pode ter vários **desembarques**
- Um **desembarque** pode ter várias **artes de pesca**
- Um **desembarque** pode ter várias **capturas** (por espécie)
- Um **desembarque** pode ter vários **indivíduos** medidos
- Uma **captura** pertence a uma **espécie**
- Um **indivíduo** pertence a uma **espécie**

## Instalação

```bash
# Instalar dependências
npm install

# Copiar arquivo de configuração
cp .env.example .env

# Editar .env com suas configurações do banco de dados
```

## Configuração do Banco de Dados

1. Criar banco de dados MariaDB:
```sql
CREATE DATABASE preamar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Sincronizar modelos (cria tabelas):
```bash
# Sincronização normal (não altera dados existentes)
npm run db:sync

# Sincronização com alteração de estrutura
npm run db:sync:alter

# Sincronização completa (APAGA TODOS OS DADOS E RECRIA)
npm run db:sync:force
```

### Scripts de Manutenção

#### Atualizar Schema do Banco de Dados
Se você atualizou os modelos Sequelize mas o banco de dados ainda não reflete essas mudanças:

```bash
# Via NPM (recomendado)
npm run db:update-schema

# Ou diretamente
node scripts/atualizarSchemaNativo.js
```

Este script:
- ✅ Adiciona novas colunas automaticamente (lat_ida, long_ida, lat_volta, long_volta)
- ✅ Preserva dados existentes
- ✅ Usa driver MariaDB nativo (evita bugs do Sequelize)
- ⚠️ **Recomendação:** Faça backup antes de executar em produção

#### Migrar Coordenadas DMS para Decimal
Se você tinha dados nas colunas antigas de coordenadas (lat_deg1, lat_min1, etc.) e precisa convertê-los para o novo formato decimal:

```bash
# Via NPM (recomendado)
npm run db:migrate-coords

# Ou diretamente
node scripts/migrarCoordenadasNativo.js
```

Este script:
- ✅ Converte coordenadas DMS (Graus, Minutos, Segundos) para formato Decimal
- ✅ Atualiza as colunas `lat_ida`, `long_ida`, `lat_volta`, `long_volta`
- ✅ Preserva os dados originais nas colunas antigas
- ✅ Usa transação para garantir integridade
- ℹ️ Execute apenas se tiver dados antigos para migrar

#### Popular Espécies
Popula a tabela de espécies a partir do JSON:

```bash
npm run db:populate-especies
```

#### Corrigir Enum de Destino
Corrige valores do enum de destino do pescado:

```bash
npm run db:fix-enum
```

## Executar o Servidor

```bash
# Modo produção
npm start

# Modo desenvolvimento (com nodemon)
npm run dev
```

## Rotas da API

### Municipios e Espécies (JSON estático)
- `GET /api/municipios` - Lista municípios e localidades
- `GET /api/especies` - Lista espécies

### Desembarques
- `POST /api/desembarques` - Criar novo desembarque
- `GET /api/desembarques` - Listar desembarques (com filtros)
- `GET /api/desembarques/:id` - Buscar desembarque específico
- `PUT /api/desembarques/:id` - Atualizar desembarque
- `DELETE /api/desembarques/:id` - Deletar desembarque
- `GET /api/desembarques/estatisticas` - Estatísticas

### Pescadores
- `GET /api/pescadores` - Listar pescadores
- `POST /api/pescadores` - Criar pescador
- `GET /api/pescadores/:id` - Buscar pescador

### Embarcações
- `GET /api/embarcacoes` - Listar embarcações
- `POST /api/embarcacoes` - Criar embarcação
- `GET /api/embarcacoes/:id` - Buscar embarcação

## Exemplo de Payload para Criar Desembarque

```json
{
  "pescador": {
    "nome": "João da Silva",
    "apelido": "Joãozinho",
    "cpf": "123.456.789-00",
    "nascimento": "1980-05-15",
    "municipio": "João Pessoa"
  },
  "embarcacao": {
    "nome_embarcacao": "Estrela do Mar",
    "codigo_embarcacao": "JP001",
    "proprietario": "José Santos",
    "rgp": "RGP123",
    "comprimento": 12.5,
    "capacidade": 1000,
    "hp": 90,
    "tipo": "barco"
  },
  "desembarque": {
    "cod_desembarque": "JP-2023-001",
    "municipio": "João Pessoa",
    "localidade": "Tambaú",
    "data_coleta": "2023-10-10",
    "data_saida": "2023-10-08",
    "hora_saida": "05:00",
    "data_chegada": "2023-10-10",
    "hora_desembarque": "16:00",
    "numero_tripulantes": 3,
    "pesqueiros": "Alto mar"
  },
  "artes": [
    {
      "arte": "rede_boirea",
      "tamanho": "100",
      "unidade": "m"
    }
  ],
  "capturas": [
    {
      "ID_especie": 1,
      "peso_kg": 50.5,
      "preco_kg": 15.00
    }
  ],
  "individuos": [
    {
      "ID_especie": 1,
      "comprimento_padrao_cm": 45.5,
      "peso_g": 950,
      "numero_individuo": 1
    }
  ]
}
```

## Filtros Disponíveis na Listagem

```
GET /api/desembarques?municipio=JP&localidade=TU&data_inicio=2025-01-01&data_fim=2025-12-31&page=1&limit=50
```

## Estrutura de Resposta Padrão

```json
{
  "success": true,
  "message": "Mensagem de sucesso",
  "data": { /* dados */ },
  "pagination": { /* apenas em listagens */ }
}
```

## Códigos de Municípios

- MT - Mataraca
- BT - Baía da Traição
- MR - Marcação
- LU - Lucena
- CB - Cabedelo
- JP - João Pessoa
- CO - Conde
- PI - Pitimbu

## Notas Importantes

1. O campo `cod_desembarque` deve seguir o formato: `MUNICIPIO-LOCALIDADE-DIA-MES-ANO-CONSECUTIVO`
2. **Coordenadas são armazenadas em formato DECIMAL** (lat_ida, long_ida, lat_volta, long_volta)
   - Antiga estrutura DMS (12 colunas) foi substituída por 4 colunas decimais
   - Latitude: DECIMAL(10, 8) - precisão de ~1.1mm
   - Longitude: DECIMAL(11, 8) - precisão de ~1.1mm
3. O total do desembarque é calculado automaticamente com base nas capturas
4. CPF do pescador deve ser único no sistema
5. Código da embarcação deve ser único no sistema
6. **Validação de Peso e Comprimento:**
   - Peso máximo: 1.000.000g (1 tonelada) no frontend, até ~100 ton no backend
   - Comprimento máximo: 500cm (5 metros) no frontend, até ~100m no backend