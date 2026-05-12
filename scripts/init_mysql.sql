-- EXECUTAR NO MYSQL DAS FILIAIS
-- Estrutura compatível com API Fiscal em Python (FastAPI)

CREATE DATABASE IF NOT EXISTS fiscal;
USE fiscal;

-- Tabela de NFC-e Autorizadas
CREATE TABLE IF NOT EXISTS nfce_autorizadas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chave_acesso VARCHAR(44) NOT NULL UNIQUE,
    modelo INT DEFAULT 65,
    numero_nfce INT NOT NULL,
    serie INT NOT NULL,
    data_emissao DATETIME NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    ativa TINYINT(1) DEFAULT 1,
    protocolo_autorizacao VARCHAR(255),
    data_autorizacao DATETIME,
    xml_base64 LONGTEXT, -- Armazenado apenas para download individual
    INDEX (data_emissao),
    INDEX (numero_nfce)
);

-- Tabela de Configurações SMTP
CREATE TABLE IF NOT EXISTS smtp_config (
    id INT PRIMARY KEY,
    host VARCHAR(255) NOT NULL,
    port INT NOT NULL,
    user VARCHAR(255) NOT NULL,
    pass VARCHAR(255) NOT NULL,
    tls TINYINT(1) DEFAULT 1,
    from_email VARCHAR(255) NOT NULL,
    to_email VARCHAR(255) NOT NULL
);

-- SEED DATA (EXEMPLO)
INSERT INTO nfce_autorizadas (chave_acesso, numero_nfce, serie, data_emissao, valor_total) 
VALUES ('35260112345678000189550010000010011345678901', 1001, 1, NOW(), 150.50);

INSERT INTO smtp_config (id, host, port, user, pass, from_email, to_email)
VALUES (1, 'smtp.example.com', 587, 'fiscal@example.com', 'secret', 'fiscal@example.com', 'contabil@empresa.com');
