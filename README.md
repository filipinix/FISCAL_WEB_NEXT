# Fiscal Web Next - Sistema de Automação Fiscal Local

## Visão Geral
Recriação moderna do sistema Fiscal Web, focado em performance, design técnico e operação 100% local. O sistema atua como um hub central que monitora APIs de filiais e automatiza a coleta de NFC-e.

## Estrutura do Projeto
- `/src`: Frontend React + Tailwind + Vite.
- `/server.ts`: Servidor Express centralizado (Hub).
- `/branch-api`: Exemplo de API para ser instalada nos servidores de filiais (MySQL).
- `/scripts`: Scripts SQL para preparação do banco de dados local.
- `/config.json`: Arquivo de configuração de filiais e SMTP.

## Tecnologias
- **Frontend**: React 19, TypeScript, Tailwind CSS, Recharts, Lucide React.
- **Backend**: Node.js, Express, JWT, Adm-Zip (Compactação), PDFKit (Relatórios), Nodemailer.
- **Database**: mysql2 (Filiais) / Local JSON (Config Hub).

## Como Instalar (Ambiente Local)
1. Execute o script `/scripts/init_mysql.sql` no seu servidor MySQL local.
2. Configure as filiais no `/config.json`.
3. Para as filiais, instale a API contida em `/branch-api`.
4. Inicie o sistema principal:
   ```bash
   npm install
   npm run dev
   ```

## Funcionalidades
- Dashboard com indicadores fiscais em tempo real.
- Exportação inteligente de XMLs em lote (.ZIP).
- Geração automática de relatórios de conferência em PDF.
- Identificação proativa de quebras de sequência numérica.
- Controle de status das APIs de cada unidade.

## Documentação Adicional
- [Documentação Técnica Completa](./DOCUMENTACAO.md) - Detalhes sobre regras de negócio, infraestrutura e melhorias.
- [Visão Geral do Projeto](./PROJECT_OVERVIEW.md) - Guia rápido para desenvolvedores e arquitetura.

---
© 2026 Fiscal Solution Systems - Versão 1.0.0
