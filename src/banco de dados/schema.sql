CREATE DATABASE pdv;

DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL NOT NULL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL NOT NULL PRIMARY KEY,
  descricao TEXT NOT NULL
);

INSERT INTO categorias
(descricao)
VALUES
('Informática'),
('Celulares'),
('Beleza e Perfumaria'),
('Livros e Papelaria'),
('Brinquedos'),
('Moda'),
('Bebê'),
('Games');

DROP TABLE IF EXISTS produtos;
DROP TABLE IF EXISTS clientes;

CREATE TABLE IF NOT EXISTS produtos (
  id SERIAL NOT NULL PRIMARY KEY,
  descricao TEXT NOT NULL,
  quantidade_estoque INTEGER NOT NULL,
  valor INTEGER NOT NULL,
  categoria_id INTEGER NOT NULL,
  FOREIGN KEY (categoria_id) REFERENCES categorias (id)
);

CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL NOT NULL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  cpf TEXT NOT NULL UNIQUE,
  usuario_id INTEGER NOT NULL,
  cep TEXT,
  rua TEXT,
  numero TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
);

DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS pedido_produtos;

CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL NOT NULL PRIMARY KEY,
  cliente_id INTEGER NOT NULL,
  observacao TEXT,
  valor_total INTEGER NOT NULL,
  FOREIGN KEY (cliente_id) REFERENCES clientes (id)
);

CREATE TABLE IF NOT EXISTS pedido_produtos (
  id SERIAL NOT NULL PRIMARY KEY,
  pedido_id INTEGER NOT NULL,
  produto_id INTEGER NOT NULL,
  quantidade_produto INTEGER NOT NULL,
  valor_produto INTEGER NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos (id),
  FOREIGN KEY (produto_id) REFERENCES produtos (id)
);

ALTER TABLE produtos ADD produto_imagem TEXT



