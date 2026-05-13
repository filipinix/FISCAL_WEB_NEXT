# Documentação Técnica Completa — Projeto Fiscal Web (Versão Atual)

## Visão Geral do Projeto

O projeto **Fiscal Web** é um sistema web para:

* Importação automática de XMLs fiscais
* Consulta por período
* Geração de relatórios PDF
* Download de XMLs compactados
* Envio de relatórios por e-mail
* Controle de notas autorizadas e canceladas
* Identificação de falhas de sequência de numeração fiscal
* Dashboard web moderno
* Estrutura preparada para futura integração via API

O sistema atualmente trabalha com:

* NFC-e (modelo 65)
* NF-e (modelo 55)
* Eventos de cancelamento (`procEventoNFe`)
* Banco MySQL
* Backend Python + Flask
* Frontend HTML/Jinja + Bootstrap
* Geração de PDF
* Compactação ZIP

---

# Objetivo Principal do Sistema

O sistema tem como objetivo:

1. Ler XMLs fiscais automaticamente
2. Organizar no banco de dados
3. Permitir consultas por período
4. Gerar relatórios fiscais completos
5. Identificar inconsistências fiscais
6. Facilitar auditorias
7. Permitir futura arquitetura multiempresa/multifilial
8. Migrar futuramente de leitura direta MySQL para APIs REST

---

# Arquitetura Atual do Projeto

## Stack Principal

| Camada        | Tecnologia           |
| ------------- | -------------------- |
| Backend       | Python 3.13          |
| Web Framework | Flask                |
| Banco         | MySQL                |
| ORM           | SQLAlchemy (parcial) |
| Frontend      | HTML + Bootstrap     |
| Relatórios    | ReportLab            |
| XML           | ElementTree          |
| Compactação   | zipfile              |
| Emails        | SMTP                 |
| Execução      | Windows              |

---

# Estrutura Atual do Projeto

```text
fiscal_web/
│
├── dashboard/
│   ├── app.py
│   ├── templates/
│   ├── static/
│
├── services/
│   ├── relatorios.py
│   ├── xml_reader.py
│   ├── email_service.py
│   ├── pdf_service.py
│
├── database/
│   ├── conexao.py
│   ├── models.py
│
├── monitor/
│   ├── monitor_xml.py
│
├── utils/
│
├── exports/
│
├── logs/
│
├── config.py
│
├── requirements.txt
│
└── run.py
```

---

# Funcionamento Geral

# 1. Monitor XML

O monitor lê pastas contendo XMLs fiscais.

Tipos aceitos:

## NFC-e/NF-e autorizadas

```xml
<mod>55</mod>
<mod>65</mod>
```

## Eventos cancelados

```xml
<procEventoNFe>
```

---

# 2. Importação Banco

Os XMLs são convertidos em registros no MySQL.

Tabela principal:

```sql
nfce
```

Tabela cancelamentos:

```sql
nfce_canceladas
```

---

# Estrutura Importante do Banco

# Tabela `nfce`

Armazena:

* chave
* número
* série
* modelo
* valor
* XML base64
* data emissão
* status
* destinatário
* empresa

Campos importantes:

```sql
chave
numero
serie
modelo
valor_total
xml_base64
status
data_emissao
cnpj_emitente
razao_emitente
fantasia_emitente
```

---

# Tabela `nfce_canceladas`

Armazena:

* XML cancelamento
* chave relacionada
* protocolo cancelamento
* justificativa
* data cancelamento

Campos:

```sql
chave
xml_base64
protocolo
justificativa
data_cancelamento
```

---

# XMLs Tratados

# XML Autorizado

Tags utilizadas:

```xml
<mod>
<serie>
<nNF>
<vNF>
<dhEmi>
<CNPJ>
<xNome>
<xFant>
```

---

# XML Cancelamento

Formato:

```xml
<procEventoNFe>
```

Tags importantes:

```xml
<chNFe>
<tpEvento>110111</tpEvento>
<xEvento>Cancelamento registrado</xEvento>
<nProt>
<xJust>
```

---

# Regra Atual de Cancelamentos

## Processo:

1. Sistema lê XML cancelamento
2. Extrai:

```xml
<chNFe>
```

3. Procura XML original na listagem
4. Obtém:

* valor total
* modelo
* série
* número

5. Soma no grupo de canceladas

---

# Regras Implementadas

# 1. Soma Autorizadas

Somatório de:

```sql
status = 'AUTORIZADA'
```

---

# 2. Soma Canceladas

Somatório baseado em:

```sql
status = 'CANCELADA'
```

ou existência em:

```sql
nfce_canceladas
```

---

# 3. Separação por Modelo

Separado em:

## NF-e

```xml
<mod>55</mod>
```

## NFC-e

```xml
<mod>65</mod>
```

---

# 4. Numerações Faltantes

## Funcionamento

Sistema identifica:

* menor número da série
* maior número da série

Depois verifica lacunas.

Exemplo:

```text
100
101
102
105
106
```

Resultado:

```text
Faltando:
103
104
```

---

# Regras da Verificação

Agrupamento:

```text
(modelo + série)
```

---

# Página de Faltantes

Nova página implementada:

```text
/num_faltantes
```

Ela:

* usa período selecionado
* mostra:

  * modelo
  * série
  * menor número
  * maior número
  * quantidade encontrada
  * quantidade faltando
  * lista completa

---

# Dashboard Atual

Tela inicial contém:

## Contadores

* total XMLs
* autorizadas
* canceladas
* valor total

---

# Novo Botão

Implementado:

```text
Ver Numerações Faltantes
```

---

# Download ZIP

Sistema gera ZIP contendo:

```text
XML/
   NFe/
   NFCe/
```

Agora também:

```text
xml_cancelados/
```

---

# Estrutura ZIP Atual

```text
XML/
├── NFe/
│   ├── autorizados/
│   └── xml_cancelados/
│
├── NFCe/
│   ├── autorizados/
│   └── xml_cancelados/
```

---

# Geração PDF

PDF atual contém:

## Empresa

* Razão social
* Fantasia
* CNPJ

---

# Totais

* autorizadas
* canceladas
* quantidade

---

# Numerações Faltantes

Mostra:

```text
Série 1:
Faltando:
80368
80369
80370
```

---

# E-mail

## Assunto Atual

Agora inclui:

```text
Nome Empresa - CNPJ
```

---

# Corpo Atual

Contém:

* Razão
* Fantasia
* CNPJ
* totais
* canceladas
* faltantes

---

# Limite 5000 Registros

## Problema Antigo

Listagem limitava:

```python
limit=5000
```

---

# Correção Aplicada

Agora:

```python
limit=None
```

SQL não usa LIMIT.

---

# Objetivos Futuros do Projeto

# 1. Multi Filiais

## Objetivo

Permitir várias empresas/filiais no mesmo sistema.

---

# Estrutura Recomendada

Tabela:

```sql
filiais
```

Campos:

```sql
id
cnpj
razao
fantasia
api_url
api_token
ativo
```

---

# Relacionamento

Todas notas devem possuir:

```sql
filial_id
```

---

# Fluxo Futuro

Cada filial:

* possui API própria
* sincroniza separadamente
* gera relatórios independentes

---

# 2. Troca MySQL Direto por API

## Problema Atual

Sistema acessa banco diretamente.

Isso dificulta:

* segurança
* cloud
* multiempresa
* escalabilidade

---

# Objetivo Futuro

Backend fiscal separado.

Fiscal Web consumirá:

```text
REST API
```

---

# Arquitetura Recomendada

## API Fiscal

Endpoints:

```http
GET /notas
GET /canceladas
GET /empresa
GET /xml/{chave}
```

---

# Autenticação

Recomendado:

```text
Bearer Token
```

---

# Estrutura JSON Recomendada

## Notas

```json
{
  "chave": "",
  "numero": "",
  "serie": "",
  "modelo": "",
  "valor_total": 0,
  "status": "",
  "data_emissao": ""
}
```

---

# Cancelamentos

```json
{
  "chave": "",
  "protocolo": "",
  "justificativa": "",
  "data_cancelamento": ""
}
```

---

# Serviço Recomendado

Criar:

```text
services/api_client.py
```

---

# Exemplo

```python
class ApiFiscal:

    def listar_notas(self, inicio, fim):
        pass

    def listar_canceladas(self, inicio, fim):
        pass

    def baixar_xml(self, chave):
        pass
```

---

# Melhorias Futuras Importantes

# 1. Cache

Usar Redis.

---

# 2. Fila

Celery/RQ.

---

# 3. Assinatura Digital

Validar certificados.

---

# 4. Controle Usuários

Login:

* admin
* auditor
* operador

---

# 5. Logs

Tabela:

```sql
logs_sistema
```

---

# 6. Auditoria

Registrar:

* download
* envio email
* alteração filtros

---

# 7. Dashboard Moderno

Migrar para:

* React
* Tailwind
* SPA

---

# 8. API Própria do Sistema

Criar API do próprio Fiscal Web.

---

# Regras Críticas do Projeto

# XML Cancelado

Sempre:

1. localizar chave original
2. pegar valor original
3. somar canceladas

---

# Nunca remover XMLs cancelados

Eles precisam permanecer:

* download
* auditoria
* fiscalização

---

# Regra das Sequências

Sempre considerar:

```text
modelo + série
```

Nunca somente número.

---

# Performance

# Problema Atual

Leitura total sem paginação.

---

# Melhoria Futura

Paginação server-side.

---

# Índices Necessários

```sql
INDEX(chave)
INDEX(data_emissao)
INDEX(modelo)
INDEX(serie)
INDEX(numero)
```

---

# Recomendação de Refatoração

Separar:

```text
controllers/
services/
repositories/
models/
```

---

# Padrão Recomendado

Arquitetura:

```text
Clean Architecture
```

ou:

```text
DDD leve
```

---

# Dependências Prováveis

```text
Flask
PyMySQL
SQLAlchemy
ReportLab
lxml
requests
python-dotenv
```

---

# Observações Importantes

## XMLs grandes

Evitar:

```python
ET.parse()
```

Preferir:

```python
iterparse()
```

---

# Base64

Atualmente XMLs são armazenados em:

```sql
LONGTEXT
```

Pode futuramente migrar para:

* MinIO
* S3
* Storage externo

---

# Estado Atual do Projeto

## Já Funciona

✅ Importação XML
✅ Cancelamentos
✅ PDF
✅ Email
✅ ZIP
✅ Numeração faltante
✅ Dashboard
✅ Consulta período
✅ Separação NF-e/NFC-e
✅ Soma canceladas
✅ Nome empresa no PDF/email
✅ XML cancelado separado

---

# Pendências Futuras

🔲 Multiempresa
🔲 API REST
🔲 Login usuários
🔲 Controle permissões
🔲 Cache
🔲 Fila processamento
🔲 Deploy cloud
🔲 Docker
🔲 React frontend moderno
🔲 Relatórios avançados
🔲 Assinatura digital
🔲 Monitor automático Windows Service

---

# Instrução Para Outros Agentes IA

Este projeto:

* é um sistema fiscal empresarial
* não pode perder XMLs
* precisa preservar auditoria
* precisa considerar cancelamentos
* precisa validar sequências fiscais
* trabalha com NF-e e NFC-e
* deve futuramente abandonar acesso direto MySQL
* deve migrar para arquitetura API-first
* precisa suportar múltiplas filiais
* precisa ser altamente confiável

Toda nova implementação deve:

1. preservar compatibilidade fiscal
2. manter rastreabilidade
3. manter XML original intacto
4. nunca alterar chave fiscal
5. validar cancelamentos
6. respeitar modelo+série
7. manter desempenho em grandes volumes
