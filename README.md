# Tic-Tac-Toe

Um jogo da velha moderno e responsivo, desenvolvido com **React** no frontend e um servidor **Node.js** para multiplayer em tempo real com **Socket.io**. O projeto possui uma interface inspirada na estética retrô/arcade.

---

## Funcionalidades

- **Modo Single Player**: Jogue localmente contra a CPU.
- **Modo Multiplayer**: Crie salas privadas ou junte-se a uma sala existente usando um código único (`Game ID`). Jogue em tempo real via WebSockets.
- **Sistema de Rounds**: Defina a quantidade de rounds (1, 3, 5 ou 7 rodadas) para a partida.
- **Placar (Scoreboard)**: Acompanhe as vitórias de cada jogador em tempo real.
- **Histórico de Jogadas (Turn Log)**: Exibição passo a passo de cada movimento realizado.
- **Design Retrô**: Estilo visual limpo, nostálgico e responsivo.

---

## Tecnologias Utilizadas

### Frontend
- **React 19**
- **Vite** (Build tool rápida)
- **Socket.io-client** (Comunicação bidirecional em tempo real)
- **CSS3** (Estilização customizada com visual retrô)

### Backend
- **Node.js**
- **Express**
- **Socket.io** (Servidor WebSocket)
- **UUID** (Geração de IDs de sala únicos)

---

## Pré-requisitos

Para rodar este projeto localmente, você precisará ter instalado em sua máquina:
- **Node.js** (Versão 18.0.0 ou superior)
- **npm** (Gerenciador de pacotes do Node)

---

## Como Rodar o Projeto Localmente

Siga o passo a passo abaixo para colocar o projeto em execução:

### 1. Clonar ou baixar o repositório
Abra o terminal na pasta onde deseja colocar o projeto.

### 2. Configurar e rodar o Servidor (Backend)
Abra uma janela de terminal e execute:

```bash
# Entre na pasta do servidor
cd server

# Instale as dependências
npm install

# Inicie o servidor
npm start
```
O servidor backend iniciará e estará escutando na porta **3001** (`http://localhost:3001`).

### 3. Configurar e rodar o Cliente (Frontend)
Abra **outra** janela de terminal e execute:

```bash
# Entre na pasta do cliente
cd client

# Instale as dependências
npm install

# Inicie a aplicação em modo de desenvolvimento
npm run dev
```
O servidor do Vite iniciará e fornecerá um link local, geralmente **`http://localhost:5173`**.

### 4. Acessar o Jogo
1. Abra o navegador no endereço indicado pelo terminal do frontend (geralmente [http://localhost:5173](http://localhost:5173)).
2. Para testar o modo multiplayer localmente:
   - Abra duas janelas do navegador (uma delas pode ser em modo anônimo).
   - Na primeira janela, clique em **MULTIPLAYER**, insira seu nome e clique em **CREATE GAME**. Copie o `Game ID` gerado.
   - Na segunda janela, clique em **MULTIPLAYER**, insira outro nome, cole o `Game ID` no campo correspondente e clique em **JOIN GAME**.
   - Divirta-se!

---

## Variáveis de Ambiente (Opcional)

No frontend (`client`), a conexão com o backend utiliza a variável de ambiente `VITE_SERVER_URL`. Se não for fornecida, o app se conectará por padrão a `http://localhost:3001`.

Caso queira hospedar o backend online, configure no arquivo `.env` do client (ou nas variáveis da plataforma de deploy):
```env
VITE_SERVER_URL=https://seu-servidor-backend.com
```

---

## Licença

Este projeto está sob a licença MIT. Consulte o arquivo [LICENSE](file:///c:/Users/mgand/Desktop/tictactoe/tic-tac-toe-react/LICENSE) para mais detalhes.