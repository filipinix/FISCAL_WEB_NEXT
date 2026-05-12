# Fiscal Web Next - Visão Técnica do Projeto

Este documento serve como guia completo para qualquer desenvolvedora ou IA (como Claude, ChatGPT ou Gemini) que venha a continuar ou modificar este projeto.

## 📌 Visão Geral
O **Fiscal Web Next** é um Hub Centralizado de monitoramento fiscal. Ele foi projetado para se conectar a múltiplas APIs locais (instaladas em cada filial física da empresa) que extraem dados diretamente de bancos de dados MySQL/MariaDB locais (onde as NFC-es são geradas).

### 🎯 Problema que resolve
Muitas empresas têm sistemas legados onde cada loja guarda seus dados de venda localmente. O Fiscal Web Next unifica essa visão em um dashboard moderno ("Single Pane of Glass"), permitindo auditoria, exportação de lotes XML e detecção de anomalias (quebra de sequência) em tempo real.

## 🛠️ Stack Tecnológica
- **Frontend**: React 18 + Vite + TypeScript.
- **Styling**: Tailwind CSS + Shadcn UI.
- **Gráficos**: Recharts (Dashboard).
- **Backend**: Node.js (Express) servindo como Proxy e Orquestrador.
- **Animações**: Motion (Animate.css).
- **Ícones**: Lucide React.

## 🏗️ Arquitetura de Dados
O sistema não possui um banco de dados central pesado. Ele utiliza um arquivo de configuração (`data/config.json`) para mapear as filiais.
- **Proxy Fiscal**: O backend em `server.ts` age como um túnel. Quando o usuário seleciona uma filial no Dashboard, o Hub faz uma requisição para a `api_url` cadastrada daquela unidade.
- **Consistência**: O sistema espera que cada API de filial siga o mesmo contrato de interface para as rotas `/nfe` e `/health`.

## 📂 Estrutura de Pastas
- `/src/pages`:
  - `Login.tsx`: Autenticação local (simulada por enquanto).
  - `Dashboard.tsx`: Visualização de KPIS e Gráficos de faturamento.
  - `Filiais.tsx`: Gerenciamento dos endpoints (URLs) de cada unidade.
  - `Relatorios.tsx`: Ferramenta para gerar pacotes ZIP/XML por período.
  - `Configuracoes.tsx`: Gestão de parâmetros globais e servidor SMTP.
- `/src/components`: Componentes reutilizáveis (Sidebar, Layout, UI).
- `/server.ts`: O "cérebro" do sistema que gerencia as chamadas entre o Hub e as filiais.

## 🚀 Como Continuar o Desenvolvimento
Sugestões para as próximas fases:
1. **Integração Real com MySQL**: No código das APIs das filiais (não incluído aqui, mas esperado), implementar a query real no banco local.
2. **Sistema de Alertas Push**: Implementar WebSockets para avisar o Hub assim que uma nota for cancelada na loja.
3. **Download Real de XML**: Atualmente o download em `/relatorios` é simulado. É necessário integrar com um serviço de bucket (S3/Cloud Storage) ou gerar o ZIP em memória no backend.
4. **Auth JWT**: Trocar o login simples por um sistema de Token JWT robusto.

## 🔌 Integração com API Python (FastAPI)
O frontend foi atualizado para ser 100% compatível com a API Python que você forneceu.
As chaves de dados agora utilizam o padrão da sua API:
- `numero_nfce` em vez de `numero`
- `chave_acesso` em vez de `chave`
- `valor_total` em vez de `valor`
- `data_emissao` em vez de `emissao`
- `ativa` (booleano) para o status da nota.

Além disso, a API agora suporta o CRUD completo de configurações SMTP (`/api/smtp`), permitindo que o Hub centralize as credenciais de disparo de e-mail.

### Como conectar sua API real:
1. No arquivo `data/config.json`, mude a `api_url` para o endereço onde sua API Python está rodando (ex: `http://localhost:8000`).
2. O Hub (`server.ts`) fará o roteamento automático.

## 💻 Execução Local
1. Instale o Node.js.
2. Execute o arquivo `INSTALL.bat` no Windows ou `npm install && npm start` no terminal.
3. Acesse `http://localhost:3000`.

---
*Projeto desenvolvido com foco em UI/UX moderna, modo escuro nativo e alta performance.*
