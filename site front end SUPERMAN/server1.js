import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const PORT = 3000;
const publicPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');

app.use(express.json());
app.use(cors());
app.use(express.static(publicPath));

// Lista de usuários cadastrados em memória
const users = [];

// Entrega o front-end e mantém as APIs no mesmo servidor.
app.get('/', (req, res) => {
    return res.sendFile(path.join(publicPath, 'index.html'));
});

// Rota para listar usuários cadastrados
app.get('/usuarios', (req, res) => {
    return res.status(200).json(users);
});

// ROTA DE CADASTRO
app.post('/cadastro', (req, res) => {
    // Aceita 'nome' ou 'usuario' enviados pelo front-end
    const { usuario, nome, email, senha } = req.body;
    const nomeUsuario = usuario || nome;

    if (!nomeUsuario || !email || !senha) {
        return res.status(400).json({
            erro: "Preencha todos os campos!"
        });
    }

    // CORREÇÃO: .length em vez de .lenght
    if (senha.length < 6) {
        return res.status(400).json({
            erro: "A senha precisa ter 6 caracteres ou mais."
        });
    }

    // Verifica se o e-mail já existe na lista
    const emailExiste = users.find((busca) => busca.email === email);

    if (emailExiste) {
        return res.status(409).json({
            erro: "O e-mail já foi cadastrado!"
        });
    }

    console.log(`Recebido cadastro de ${nomeUsuario}, aguarde resposta...`);

    // Adiciona o novo usuário ao array
    users.push({ usuario: nomeUsuario, email, senha });

    setTimeout(() => {
        console.log(`O usuário cadastrado foi: ${nomeUsuario}`);
        return res.status(201).json({
            mensagem: "CADASTRO REALIZADO COM SUCESSO",
            perfil: `Usuário @${nomeUsuario} cadastrado com o e-mail ${email}`
        });
    }, 2000); // Reduzido para 2s para o teste no front-end não demorar tanto
});

// ROTA DE LOGIN (Adicionada para integrar com login.html)
app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({
            erro: "Informe o e-mail e a senha!"
        });
    }

    // Procura o usuário cadastrado
    const usuarioEncontrado = users.find((u) => u.email === email && u.senha === senha);

    if (!usuarioEncontrado) {
        return res.status(401).json({
            erro: "E-mail ou senha inválidos!"
        });
    }

    return res.status(200).json({
        mensagem: "LOGIN REALIZADO COM SUCESSO",
        usuario: usuarioEncontrado.usuario
    });
});

// ROTA DO CHATBOT
app.post('/chat', (req, res) => {
    const { historico } = req.body;

    if (!Array.isArray(historico) || historico.length === 0) {
        return res.status(400).json({
            erro: "Envie um historico com pelo menos uma mensagem."
        });
    }

    const ultimaMensagem = historico[historico.length - 1];
    const pergunta = String(ultimaMensagem?.content || '').toLowerCase();

    let resposta = 'Estou analisando a situação. Posso ajudar com heróis, vilões, poderes, história e segurança de Metrópolis.';

    if (pergunta.includes('oi') || pergunta.includes('olá') || pergunta.includes('ola') || pergunta.includes('bom dia') || pergunta.includes('boa tarde') || pergunta.includes('boa noite')) {
        resposta = 'Olá, cidadão! Como posso ajudar Metrópolis hoje?';
    } else if (pergunta.includes('quem é o superman') || pergunta.includes('quem e o superman') || pergunta.includes('quem é superman') || pergunta.includes('quem e superman') || pergunta.includes('who is superman')) {
        resposta = 'O Superman é o defensor da Terra, um herói kryptoniano que usa seus poderes para proteger a humanidade e lutar pela justiça.';
    } else if (pergunta.includes('quem é o lex') || pergunta.includes('quem e o lex') || pergunta.includes('lex luthor') || pergunta.includes('luthor')) {
        resposta = 'O Lex Luthor é um dos maiores inimigos do Superman. Ele é um estrategista brilhante, mas também um grande perigo para Metrópolis.';
    } else if (pergunta.includes('quais são os poderes') || pergunta.includes('quais sao os poderes') || pergunta.includes('poderes do superman') || pergunta.includes('poder do superman') || pergunta.includes('qual poder')) {
        resposta = 'O Superman possui força sobre-humana, voo, supervelocidade, visão de calor, visão de raio-X, sopro congelante e invulnerabilidade.';
    } else if (pergunta.includes('ele voa') || pergunta.includes('superman voa') || pergunta.includes('voa?') || pergunta.includes('voar')) {
        resposta = 'Sim! O Superman voa com grande facilidade e consegue percorrer longas distâncias em segundos.';
    } else if (pergunta.includes('de onde ele é') || pergunta.includes('de onde vem') || pergunta.includes('origem') || pergunta.includes('krypton')) {
        resposta = 'O Superman nasceu em Krypton e foi enviado à Terra, onde foi criado por Jonathan e Martha Kent.';
    } else if (pergunta.includes('onde ele mora') || pergunta.includes('onde mora') || pergunta.includes('metropolis') || pergunta.includes('metrópolis')) {
        resposta = 'Ele vive em Metrópolis, onde atua como protetor da cidade e da humanidade.';
    } else if (pergunta.includes('qual é o nome') || pergunta.includes('qual e o nome') || pergunta.includes('nome do superman')) {
        resposta = 'Seu nome verdadeiro é Kal-El, mas na Terra ele é conhecido como Clark Kent.';
    } else if (pergunta.includes('brainiac') || pergunta.includes('general zod') || pergunta.includes('zod')) {
        resposta = 'Brainiac e Zod são grandes ameaças para o Superman. Ambos representam risco para a paz e para a segurança da Terra.';
    } else if (pergunta.includes('lois') || pergunta.includes('lois lane')) {
        resposta = 'Lois Lane é a jornalista que acompanha as maiores histórias do Superman e vive ao seu lado como parte importante da vida do herói.';
    } else if (pergunta.includes('segurança') || pergunta.includes('proteger') || pergunta.includes('proteção')) {
        resposta = 'A segurança de Metrópolis é prioridade. O Superman vigia a cidade e atua para proteger as pessoas de ameaças e injustiças.';
    } else if (pergunta.includes('ajuda') || pergunta.includes('socorro') || pergunta.includes('como você pode ajudar')) {
        resposta = 'Posso responder sobre heróis, vilões, poderes, história, origem e segurança de Metrópolis.';
    } else if (pergunta.includes('não') || pergunta.includes('nao')) {
        resposta = 'Entendi. Posso explicar melhor sobre o Superman, Lex Luthor, Krypton ou a segurança de Metrópolis.';
    } else if (pergunta.includes('obrigado') || pergunta.includes('valeu')) {
        resposta = 'De nada, cidadão! Estou sempre pronto para proteger Metrópolis e responder suas perguntas.';
    }

    return res.status(200).json({
        mensagem: resposta,
        resposta,
        historico: [
            ...historico,
            { role: 'assistant', content: resposta }
        ]
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});