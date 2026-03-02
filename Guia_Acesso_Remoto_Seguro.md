# Guia de Acesso Remoto Seguro ao Servidor Interno

Este documento detalha os métodos mais seguros e recomendados para acessar remotamente a sua máquina local (`192.168.18.58`) e a aplicação **Controle** de fora da sua rede Wi-Fi, sem expor o servidor diretamente à internet pública (evitando abrir portas no roteador).

---

## Método 1: Cloudflare Tunnels (Zero Trust) - ⭐ Altamente Recomendado
Como você mencionou em mensagens anteriores que já utiliza o Cloudflare com Proxy Reverso, o **Cloudflare Tunnels** é, disparado, a melhor e mais segura opção para a aplicação Web.

Neste método, você instala um agente na sua máquina (o `cloudflared`). Esse agente cria uma conexão segura *de dentro para fora* com a rede da Cloudflare. Você não precisa abrir nenhuma porta no seu roteador.

### Vantagens:
*   Não precisa abrir portas (Port Forwarding).
*   Força HTTPS automático (Certificado SSL gratuito).
*   Proteção anti-DDoS e firewall da Cloudflare integrados.
*   Você pode acessar o painel pelo seu domínio (ex: `controle.seudominio.com`).

### Como configurar:
1.  **Crie o Túnel no Cloudflare:**
    *   Vá no painel Zero Trust do Cloudflare (dash.teams.cloudflare.com).
    *   Acesse **Access > Tunnels** e clique em **Create a tunnel**.
    *   Dê um nome (ex: `Servidor-Local`) e escolha as opções.
2.  **Instale no seu Ubuntu/Linux Local (`192.168.18.58`):**
    *   O painel do Cloudflare vai te dar um comando exato para rodar no seu servidor. Geralmente é algo como:
    *   `curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb`
    *   `sudo dpkg -i cloudflared.deb`
    *   `sudo cloudflared service install eyJh...[seu_token_gigante_aqui]`
3.  **Roteie o Tráfego:**
    *   No painel do Cloudflare Tunnels, adicione um **Public Hostname**.
    *   Subdomínio: `controle` (ex: `controle.seusite.com.br`)
    *   Service: `HTTP` -> `localhost:3333` (a porta do app Docker).

---

## Método 2: Tailscale / ZeroTier (VPN Mesh Segura)
Se você precisa de acesso **SSH via Terminal** e acesso à rede completa remotamente, não apenas ver a página Web, uma VPN P2P como o Tailscale é a solução perfeita.

O Tailscale cria uma rede virtual segura. É como se o seu Mac remanescente fora de casa estivesse no mesmo cabo do seu servidor 192.168.18.58.

### Vantagens:
*   Configuração em 2 minutos. Basta instalar e fazer login com o Google.
*   Conexões são criptografadas de ponta a ponta (WireGuard).
*   Permite acessar via SSH usando um IP fixo do Tailscale (ex: `ssh gabriel@100.x.y.z`).
*   Gratuito e não abre portas.

### Como configurar:
1.  Habilite a conta no [Tailscale.com](https://tailscale.com/).
2.  **No Servidor (`192.168.18.58`):**
    *   Conecte-se e rode: `curl -fsSL https://tailscale.com/install.sh | sh`
    *   Rode `sudo tailscale up` -> Clique no link gerado e autentique com a mesma conta.
3.  **No seu Mac (Notebook Remoto):**
    *   Baixe o aplicativo Tailscale na App Store ou pelo site.
    *   Faça o login.
4.  **Acessando Diretamente:**
    *   Sucesso! O painel web admin do Tailscale validou que os seus dois dispositivos estão conectados na mesma "Tailnet". O IP fixo do seu Servidor Ubuntu agora é **`100.98.21.108`**.
    *   Sempre que estiver fora de casa, basta abrir o Terminal do Mac e plugar: `ssh gabriel@100.98.21.108`.
    *   Se precisar testar a aplicação em homologação burlando o Cloudflare: `http://100.98.21.108:3333`.

---

## Resumo e Recomendação: Use os dois combinados!
Na arquitetura moderna, o padrão "Zero Trust" recomenda usar **ambos** para propósitos diferentes:

1.  **Para o App Web (Kanban Controle):** Use o **Cloudflare Tunnels**. Assim, a aplicação estará sempre disponível e rápida para você acessar em qualquer celular ou notebook do mundo digitando `controle.seu-dominio.com` e roteará pelo Proxy seguro deles.
2.  **Para Acesso SSH/Raiz do Servidor:** Use o **Tailscale**. Você manterá a porta 22 bloqueada ao mundo exterior, e só poderá puxar os arquivos e programar (`ssh gabriel@192.168.18.58`) se o seu Tailscale estiver logado na sua própria conta.

### Nota Importante de Segurança
*Nunca* (jamais!) acesse as configurações do seu roteador (MEO, Vivo, Claro, etc.) e faça um Port Forwarding (Redirecionamento de Portas) das portas `22` (SSH) ou `3306` (Banco de Dados) para internet aberta. Botnets chinesas e russas sondam esses IPs e invadem equipamentos expostos em minutos. Os métodos listados acima bloqueiam esse estilo de ataque.
