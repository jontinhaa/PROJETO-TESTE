# 🏭 Hydro MPSA - Offline Video Player

Um Progressive Web App (PWA) desenvolvido como estudo de caso para resolver problemas de conectividade durante visitas técnicas na área de controle de processo da mineradora Hydro Paragominas.

Situação: Funcional, entretanto não finalizado. 

---

## 📖 Sobre o Projeto

Durante visitas técnicas na planta industrial da Hydro Paragominas, a conexão com a internet costuma ser instável ou inexistente devido à infraestrutura e localização da usina. Isso dificultava o acesso a materiais audiovisuais explicativos sobre os processos industriais (como moinhos e peneiras).

Para contornar esse gargalo, este projeto propõe uma solução rápida, prática e offline-first: um sistema onde o visitante baixa os vídeos previamente (quando há rede) e, ao longo da visita, apenas **escaneia QR Codes** espalhados pelas instalações para reproduzir o conteúdo diretamente do armazenamento local do dispositivo, sem depender de internet.

## 🚀 Funcionalidades

* **Download Antecipado:** Pré-carregamento de vídeos em cache local de forma assíncrona.
* **Leitor de QR Code Integrado:** Escaneamento ágil utilizando a própria câmera do dispositivo móvel para acionar vídeos específicos.
* **Mapa Tátil/Atalhos:** Interface alternativa para acionar os vídeos manualmente (Moinho, Peneira) caso o QR Code não possa ser lido.
* **Funcionamento 100% Offline:** Garantia de disponibilidade do conteúdo no momento da visita.
* **Player Seguro:** Controle de mídia sem opção de download indesejado (`controlsList="nodownload"`) e gestão de memória com `URL.createObjectURL()`.

## 🛠️ Tecnologias Utilizadas

* **HTML5, CSS3 e JavaScript (Vanilla)**
* **IndexedDB API:** Banco de dados no navegador utilizado para armazenar os arquivos de vídeo de forma segura (em formato `Blob`), evitando travamentos e contornando os limites de tamanho do `localStorage`.
* **Service Workers (PWA):** Interceptação de requisições de rede para criar um *App Shell*. Arquivos estáticos (HTML, CSS, JS, Manifest) são cacheados, permitindo que a própria interface abra sem internet.
* **[Html5Qrcode](https://github.com/mebjas/html5-qrcode):** Biblioteca leve para leitura de QR Codes nativa no browser.

## 🧠 Arquitetura Didática

Este projeto separa responsabilidades de cache para otimizar o desempenho:

1. **App Shell no Service Worker (`sw.js`):**
   Armazena apenas os arquivos fundamentais para a tela carregar (`index.html`, `manifest.json`, `leitor.js`). O SW garante que o aplicativo abra instantaneamente, mesmo em modo avião.
2. **Mídia Pesada no IndexedDB:**
   Vídeos não são cacheados pelo Service Worker para não sobrecarregar a memória de navegação padrão. Eles são transformados em `Blob` via `fetch` e injetados em uma Object Store no IndexedDB. Quando solicitados, o sistema gera uma URL temporária (`URL.createObjectURL`), reproduz o vídeo e a destrói (`URL.revokeObjectURL`) ao fechar, gerenciando bem a memória RAM do celular.

## ⚙️ Como Executar o Projeto

Para testar o funcionamento offline e o Service Worker, é necessário rodar a aplicação em um servidor local (por questões de segurança do navegador, PWA e câmera não funcionam usando o protocolo `file://`).

1. Clone o repositório:
   ```bash
   git clone [https://github.com/SEU-USUARIO/hydro-mpsa-offline.git](https://github.com/SEU-USUARIO/hydro-mpsa-offline.git)
2. Inicie um servidor local. Se estiver usando o VS Code, recomendamos a extensão Live Server. Como alternativa via terminal (Node.js):
   npx http-server -c-1
4. Acesse o IP local gerado através do navegador do seu celular (ex: `http://192.168.x.x:8080`).
5. Clique em **BAIXAR VÍDEOS**.
6. Desligue o Wi-Fi e os Dados Móveis (ou ative o Modo Avião).
7. Recarregue a página, clique no Mapa Tátil ou abra o Scanner e comprove o funcionamento offline!

## 📌 Próximos Passos (Evolução)

- [ ] Implementar aviso de cota de armazenamento caso o celular não tenha espaço para os vídeos.
- [ ] Criar painel dinâmico para os gestores cadastrarem novos vídeos no banco.
- [ ] Melhorar o feedback visual durante o download (barra de progresso real baseada no tamanho do blob).

---
*Projeto desenvolvido para fins de estudo em Engenharia de Software.*
