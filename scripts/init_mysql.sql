-- EXECUTAR NO MYSQL DAS FILIAIS
-- Estrutura mínima para integração com Fiscal Web Next

CREATE DATABASE IF NOT EXISTS fiscal_local;
USE fiscal_local;

-- Tabela de Configurações da Filial
CREATE TABLE IF NOT EXISTS config_api (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filial_id INT NOT NULL,
    chave_api VARCHAR(255),
    ultima_sincronizacao DATETIME
);

-- Tabela de NFC-e Autorizadas
CREATE TABLE IF NOT EXISTS nfc_autorizadas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chave VARCHAR(44) NOT NULL UNIQUE,
    numero INT NOT NULL,
    serie INT NOT NULL,
    data_emissao DATETIME NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    xml_caminho VARCHAR(255),
    status VARCHAR(20) DEFAULT 'AUTORIZADA',
    INDEX (data_emissao),
    INDEX (numero)
);

-- Tabela de NFC-e Canceladas
CREATE TABLE IF NOT EXISTS nfc_canceladas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chave VARCHAR(44) NOT NULL UNIQUE,
    numero INT NOT NULL,
    serie INT NOT NULL,
    data_cancelamento DATETIME NOT NULL,
    motivo TEXT,
    INDEX (data_cancelamento)
);

-- SEED DATA (EXEMPLO)
INSERT INTO nfc_autorizadas (chave, numero, serie, data_emissao, valor_total) 
VALUES ('35260112345678000189550010000010011345678901', 1001, 1, NOW(), 150.50);

INSERT INTO nfc_canceladas (chave, numero, serie, data_cancelamento, motivo)
VALUES ('35260112345678000189550010000009911345678901', 999, 1, NOW(), 'Erro na forma de pagamento');
