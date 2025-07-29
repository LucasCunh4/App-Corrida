// REGISTRO DO SERVICE WORKER (VERSÃO CORRIGIDA E MAIS ROBUSTA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .then(registration => {
                console.log('Service Worker registrado com sucesso, escopo:', registration.scope);
            })
            .catch(registrationError => {
                console.log('Falha ao registrar o Service Worker:', registrationError);
            });
    });
}

// O resto do seu código continua aqui abaixo...
document.addEventListener('DOMContentLoaded', () => {
    // ...
});

document.addEventListener('DOMContentLoaded', () => {

    // --- FUNÇÕES GLOBAIS (HELPERS) ---
    function formatarTempoDecimalParaMinSeg(decimalMinutes) {
        if (isNaN(decimalMinutes) || decimalMinutes === null) return "0 min 0 seg";
        const minutos = Math.floor(decimalMinutes);
        const segundos = Math.round((decimalMinutes - minutos) * 60);
        return `${minutos} min ${segundos} seg`;
    }

    // --- LÓGICA GERAL (MENU E OVERLAY) ---
    const botaoMenu = document.getElementById('botao-menu');
    const menuLateral = document.querySelector('.menu-lateral');
    const overlay = document.getElementById('overlay');
    function fecharMenu() {
        if (menuLateral) menuLateral.classList.remove('menu-aberto');
        if (overlay) overlay.classList.remove('ativo');
    }
    if (botaoMenu && menuLateral && overlay) {
        botaoMenu.addEventListener('click', () => {
            menuLateral.classList.toggle('menu-aberto');
            overlay.classList.toggle('ativo');
        });
        overlay.addEventListener('click', fecharMenu);
    }

    // --- LÓGICA DA TELA INICIAL ---
    const displayKmTotal = document.querySelector('.km-total-display');
    if (displayKmTotal) {
        const treinos = JSON.parse(localStorage.getItem('meus_treinos')) || [];
        const kmTotal = treinos.reduce((total, treino) => total + parseFloat(treino.distancia || 0), 0);
        displayKmTotal.textContent = `${kmTotal.toFixed(2)} km`;
        if (treinos.length > 0) {
            const ultimaCorrida = treinos[treinos.length - 1];
            document.querySelector('.card-ultima-corrida p:nth-of-type(1)').textContent = `Tipo: ${ultimaCorrida.tipo}`;
            document.querySelector('.card-ultima-corrida p:nth-of-type(2)').textContent = `Distância: ${ultimaCorrida.distancia} km`;
            document.querySelector('.card-ultima-corrida p:nth-of-type(3)').textContent = `Tempo: ${formatarTempoDecimalParaMinSeg(ultimaCorrida.tempoTotal)}`;
            document.querySelector('.card-ultima-corrida p:nth-of-type(4)').textContent = `Pace Médio: ${ultimaCorrida.pace}`;
        }
        const seletorPeriodo = document.getElementById('seletor-periodo');
        if(seletorPeriodo){
            seletorPeriodo.addEventListener('click', (e) => {
                if(e.target.tagName === 'BUTTON'){
                    if(seletorPeriodo.querySelector('.ativo')) {
                        seletorPeriodo.querySelector('.ativo').classList.remove('ativo');
                    }
                    e.target.classList.add('ativo');
                }
            });
        }
    }

    // --- LÓGICA DA PÁGINA DE REGISTRO ---
    const formRegistro = document.querySelector('form');
    if (formRegistro && formRegistro.querySelector('#tempo-total-min')) {
        const distanciaInput = document.getElementById('distancia');
        const tempoTotalMinInput = document.getElementById('tempo-total-min');
        const tempoTotalSegInput = document.getElementById('tempo-total-seg');
        const tipoTreinoSelect = document.getElementById('tipo-treino');
        const paceDisplay = document.querySelector('.pace-display strong');
        const cansacoSlider = document.getElementById('cansaco');
        const valorCansacoDisplay = document.getElementById('valor-cansaco');
        const motivoParadaSelect = document.getElementById('motivo-parada');
        const campoOutroMotivo = document.getElementById('campo-outro-motivo');

        function calcularPace() {
            const distancia = parseFloat(distanciaInput.value);
            const minutos = parseFloat(tempoTotalMinInput.value) || 0;
            let segundos = parseFloat(tempoTotalSegInput.value) || 0;
            if (segundos > 59) { segundos = 59; tempoTotalSegInput.value = 59; }
            const tempoTotalEmMinutos = minutos + (segundos / 60);

            if (distancia > 0 && tempoTotalEmMinutos > 0) {
                const paceDecimal = tempoTotalEmMinutos / distancia;
                const paceMinutos = Math.floor(paceDecimal);
                const paceSegundos = Math.round((paceDecimal - paceMinutos) * 60);
                const segundosFormatados = paceSegundos.toString().padStart(2, '0');
                paceDisplay.textContent = `${paceMinutos}'${segundosFormatados}" /km`;
            } else {
                paceDisplay.textContent = "--'--\" /km";
            }
        }

        function atualizarCoresCansaco() {
            const valor = parseInt(cansacoSlider.value);
            const porcentagem = (valor / 10) * 100;
            valorCansacoDisplay.textContent = valor;
            const corVerde = [40, 167, 69], corAmarela = [255, 193, 7], corVermelha = [255, 0, 0];
            let corFinal;
            if (valor < 5) {
                const fator = valor / 5.0;
                const r = corVerde[0] + fator * (corAmarela[0] - corVerde[0]);
                const g = corVerde[1] + fator * (corAmarela[1] - corVerde[1]);
                const b = corVerde[2] + fator * (corAmarela[2] - corVerde[2]);
                corFinal = `rgb(${r}, ${g}, ${b})`;
            } else {
                const fator = (valor - 5) / 5.0;
                const r = corAmarela[0] + fator * (corVermelha[0] - corAmarela[0]);
                const g = corAmarela[1] + fator * (corVermelha[1] - corAmarela[1]);
                const b = corAmarela[2] + fator * (corVermelha[2] - corAmarela[2]);
                corFinal = `rgb(${r}, ${g}, ${b})`;
            }
            const corDeFundoDaTrilha = `var(--cor-primaria)`;
            cansacoSlider.style.background = `linear-gradient(to right, ${corFinal} ${porcentagem}%, ${corDeFundoDaTrilha} ${porcentagem}%)`;
            cansacoSlider.style.setProperty('--thumb-color', corFinal);
        }

        function verificarMotivoParada() {
            if (motivoParadaSelect.value === 'outro') {
                campoOutroMotivo.style.display = 'block';
            } else {
                campoOutroMotivo.style.display = 'none';
            }
        }

        const urlParams = new URLSearchParams(window.location.search);
        if(urlParams.has('tempoTotalSegundos')) {
            const tempoTotalSegundos = parseInt(urlParams.get('tempoTotalSegundos'));
            const tipoTreino = urlParams.get('tipo');
            const distancia = urlParams.get('distancia');
            if (!isNaN(tempoTotalSegundos)) {
                tempoTotalMinInput.value = Math.floor(tempoTotalSegundos / 60);
                tempoTotalSegInput.value = tempoTotalSegundos % 60;
            }
            if (distancia) distanciaInput.value = distancia;
            if (tipoTreino) tipoTreinoSelect.value = tipoTreino;
            calcularPace();
        }

        formRegistro.addEventListener('submit', (event) => {
            event.preventDefault();
            const minutos = parseFloat(tempoTotalMinInput.value) || 0;
            const segundos = parseFloat(tempoTotalSegInput.value) || 0;
            const tempoTotalEmMinutos = minutos + (segundos / 60);
            const novoTreino = {
                id: Date.now(),
                data: new Date().toLocaleDateString('pt-BR', {timeZone: 'America/Sao_Paulo'}),
                tipo: tipoTreinoSelect.value,
                distancia: parseFloat(distanciaInput.value || 0).toFixed(2),
                tempoTotal: tempoTotalEmMinutos.toFixed(2),
                pace: paceDisplay.textContent,
                cansaco: cansacoSlider.value
            };
            const treinosSalvos = JSON.parse(localStorage.getItem('meus_treinos')) || [];
            treinosSalvos.push(novoTreino);
            localStorage.setItem('meus_treinos', JSON.stringify(treinosSalvos));
            window.location.href = 'historico.html';
        });
        
        distanciaInput.addEventListener('input', calcularPace);
        tempoTotalMinInput.addEventListener('input', calcularPace);
        tempoTotalSegInput.addEventListener('input', calcularPace);
        cansacoSlider.addEventListener('input', atualizarCoresCansaco);
        motivoParadaSelect.addEventListener('change', verificarMotivoParada);
        
        verificarMotivoParada();
        atualizarCoresCansaco();
        calcularPace();
    }

    // --- LÓGICA DA PÁGINA DE HISTÓRICO ---
    const listaHistorico = document.getElementById('lista-historico');
    if (listaHistorico) {
        const carregarHistorico = () => {
            const treinos = JSON.parse(localStorage.getItem('meus_treinos')) || [];
            listaHistorico.innerHTML = '';
            if (treinos.length === 0) {
                listaHistorico.innerHTML = '<p>Você ainda não registrou nenhum treino.</p>';
            } else {
                treinos.slice().reverse().forEach(treino => {
                    const cardTreino = document.createElement('div');
                    cardTreino.className = 'card-treino';
                    cardTreino.innerHTML = `
                        <button class="botao-excluir" data-id="${treino.id}">&times;</button>
                        <h3>${treino.tipo} - ${treino.data}</h3>
                        <p><strong>Distância:</strong> ${treino.distancia} km</p>
                        <p><strong>Tempo Total:</strong> ${formatarTempoDecimalParaMinSeg(treino.tempoTotal)}</p>
                        <p><strong>Pace Médio:</strong> ${treino.pace}</p>
                        <p><strong>Cansaço:</strong> ${treino.cansaco}/10</p>
                    `;
                    listaHistorico.appendChild(cardTreino);
                });
            }
        };
        listaHistorico.addEventListener('click', (e) => {
            if (e.target.classList.contains('botao-excluir')) {
                const treinoId = e.target.getAttribute('data-id');
                const confirmar = confirm('Tem certeza que deseja excluir este treino? Esta ação não pode ser desfeita.');
                if (confirmar) {
                    let treinos = JSON.parse(localStorage.getItem('meus_treinos')) || [];
                    treinos = treinos.filter(t => t.id.toString() !== treinoId);
                    localStorage.setItem('meus_treinos', JSON.stringify(treinos));
                    carregarHistorico();
                }
            }
        });
        carregarHistorico();
    }

    // --- LÓGICA DA PÁGINA DE RANKINGS ---
    const rankingDistanciaEl = document.getElementById('ranking-distancia');
    if (rankingDistanciaEl) {
        const treinos = JSON.parse(localStorage.getItem('meus_treinos')) || [];
        const preencherRanking = (elementoLista, dados, chaveValor, ordem = 'desc') => {
            elementoLista.innerHTML = '';
            const treinosOrdenados = [...dados].sort((a, b) => {
                let valorA, valorB;
                if (chaveValor === 'pace') {
                    const paceParaNumero = (paceStr) => { const partes = paceStr.match(/(\d+)'(\d+)/); return partes ? parseFloat(`${partes[1]}.${partes[2]}`) : 999; };
                    valorA = paceParaNumero(a.pace);
                    valorB = paceParaNumero(b.pace);
                } else {
                    valorA = parseFloat(a[chaveValor]);
                    valorB = parseFloat(b[chaveValor]);
                }
                return ordem === 'desc' ? valorB - valorA : valorA - valorB;
            });
            const top5 = treinosOrdenados.slice(0, 5);
            if (top5.length === 0) {
                elementoLista.innerHTML = '<li>Sem dados suficientes.</li>';
            } else {
                top5.forEach(treino => {
                    const item = document.createElement('li');
                    let unidade = '';
                    let valorExibido = treino[chaveValor];
                    if (chaveValor === 'distancia') unidade = 'km';
                    if (chaveValor === 'tempoTotal') {
                        unidade = '';
                        valorExibido = formatarTempoDecimalParaMinSeg(treino.tempoTotal);
                    }
                    if (chaveValor === 'pace') unidade = '/km';
                    item.innerHTML = `<div><span class="valor-ranking">${valorExibido} ${unidade}</span><span class="data-ranking">em ${treino.data}</span></div>`;
                    elementoLista.appendChild(item);
                });
            }
        };
        preencherRanking(document.getElementById('ranking-distancia'), treinos, 'distancia', 'desc');
        preencherRanking(document.getElementById('ranking-tempo'), treinos, 'tempoTotal', 'desc');
        preencherRanking(document.getElementById('ranking-pace'), treinos, 'pace', 'asc');
    }

    // --- LÓGICA DA PÁGINA DE GRÁFICOS ---
    const graficoDistanciaCanvas = document.getElementById('graficoDistancia');
    if (graficoDistanciaCanvas) {
        const treinos = JSON.parse(localStorage.getItem('meus_treinos')) || [];
        if(treinos.length > 0) {
            const labels = treinos.map(treino => treino.data);
            const dadosDistancia = treinos.map(treino => parseFloat(treino.distancia));
            const paceParaNumero = (paceStr) => { if (!paceStr) return 0; const partes = paceStr.match(/(\d+)'(\d+)/); if (!partes) return 0; return parseFloat(`${partes[1]}.${(partes[2] / 60 * 100).toFixed(0)}`); };
            const dadosPace = treinos.map(treino => paceParaNumero(treino.pace));
            new Chart(graficoDistanciaCanvas, { type: 'line', data: { labels: labels, datasets: [{ label: 'Distância em km', data: dadosDistancia, borderColor: 'rgba(83, 114, 240, 1)', backgroundColor: 'rgba(83, 114, 240, 0.2)', borderWidth: 2, tension: 0.2 }] }, options: { scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } } });
            const graficoPaceCanvas = document.getElementById('graficoPace');
            new Chart(graficoPaceCanvas, { type: 'line', data: { labels: labels, datasets: [{ label: 'Pace (min/km)', data: dadosPace, borderColor: 'rgba(142, 68, 173, 1)', backgroundColor: 'rgba(142, 68, 173, 0.2)', borderWidth: 2, tension: 0.2 }] }, options: { scales: { y: { reverse: true } }, plugins: { legend: { display: false } } } });
        }
    }
    
    // --- LÓGICA DA PÁGINA DE CRIAÇÃO DE DESAFIOS ---
    const formCriarDesafio = document.getElementById('form-criar-desafio');
    if (formCriarDesafio) {
        const duracaoSelect = document.getElementById('desafio-duracao');
        const dataPersonalizadaCheck = document.getElementById('data-personalizada-check');
        const dataFimInput = document.getElementById('desafio-data-fim');

        dataPersonalizadaCheck.addEventListener('change', () => {
            if (dataPersonalizadaCheck.checked) {
                dataFimInput.style.display = 'block';
                duracaoSelect.disabled = true;
            } else {
                dataFimInput.style.display = 'none';
                duracaoSelect.disabled = false;
            }
        });

        formCriarDesafio.addEventListener('submit', (e) => {
            e.preventDefault();
            const desafios = JSON.parse(localStorage.getItem('meus_desafios')) || [];
            
            const dataCriacao = new Date();
            dataCriacao.setHours(0, 0, 0, 0);
            let dataFim = new Date(dataCriacao);

            if (dataPersonalizadaCheck.checked) {
                if (dataFimInput.value) {
                    const [ano, mes, dia] = dataFimInput.value.split('-');
                    dataFim = new Date(ano, mes - 1, dia);
                }
            } else {
                const duracao = duracaoSelect.value;
                if (duracao === '1-semana') dataFim.setDate(dataFim.getDate() + 7);
                if (duracao === '1-mes') dataFim.setMonth(dataFim.getMonth() + 1);
                if (duracao === '1-ano') dataFim.setFullYear(dataFim.getFullYear() + 1);
            }

            const novoDesafio = {
                id: Date.now(),
                titulo: document.getElementById('desafio-titulo').value,
                tipo: document.getElementById('desafio-tipo').value,
                meta: document.getElementById('desafio-meta').value,
                dataCriacao: dataCriacao.toISOString(),
                dataFim: dataFim.toISOString()
            };

            desafios.push(novoDesafio);
            localStorage.setItem('meus_desafios', JSON.stringify(desafios));
            window.location.href = 'desafios.html';
        });
    }

    // --- LÓGICA DA PÁGINA DE LISTAGEM DE DESAFIOS ---
    const listaDesafiosEl = document.getElementById('lista-desafios');
    if (listaDesafiosEl) {
        const treinos = JSON.parse(localStorage.getItem('meus_treinos')) || [];
        
        const parseDataTreino = (dataString) => {
            const [dia, mes, ano] = dataString.split('/');
            return new Date(ano, mes - 1, dia);
        };

        const carregarDesafios = () => {
            const desafios = JSON.parse(localStorage.getItem('meus_desafios')) || [];
            listaDesafiosEl.innerHTML = '<h2>Meus Desafios</h2>';

            if (desafios.length === 0) {
                listaDesafiosEl.innerHTML += '<p>Você ainda não criou nenhum desafio.</p>';
                return;
            }

            desafios.forEach(desafio => {
                const dataCriacao = new Date(desafio.dataCriacao);
                const dataFim = new Date(desafio.dataFim);

                const treinosValidos = treinos.filter(treino => {
                    const dataTreino = parseDataTreino(treino.data);
                    return dataTreino >= dataCriacao && dataTreino <= dataFim;
                });

                let progressoAtual = 0;
                if (desafio.tipo === 'distancia') {
                    progressoAtual = treinosValidos.reduce((total, treino) => total + parseFloat(treino.distancia || 0), 0);
                } else if (desafio.tipo === 'quantidade') {
                    progressoAtual = treinosValidos.length;
                }

                const meta = parseFloat(desafio.meta);
                const porcentagem = Math.min((progressoAtual / meta) * 100, 100);
                const diasRestantes = Math.ceil((dataFim - new Date()) / (1000 * 60 * 60 * 24));

                const cardDesafio = document.createElement('div');
                cardDesafio.className = 'card-desafio';
                cardDesafio.innerHTML = `
                    <button class="botao-excluir" data-id="${desafio.id}">&times;</button>
                    <h3>${desafio.titulo}</h3>
                    <div class="progresso-info">
                        <span>${progressoAtual.toFixed(desafio.tipo === 'distancia' ? 2 : 0)} / ${meta} ${desafio.tipo === 'distancia' ? 'km' : 'treinos'}</span>
                        <span>${diasRestantes >= 0 ? diasRestantes + ' dias restantes' : 'Finalizado'}</span>
                    </div>
                    <div class="progresso-barra-fundo">
                        <div class="progresso-barra-preenchimento" style="width: ${porcentagem}%;"></div>
                    </div>
                `;
                listaDesafiosEl.appendChild(cardDesafio);
            });
        };

        listaDesafiosEl.addEventListener('click', (e) => {
            if (e.target.classList.contains('botao-excluir')) {
                const desafioId = e.target.getAttribute('data-id');
                const confirmar = confirm('Tem certeza que deseja excluir este desafio?');
                if (confirmar) {
                    let desafios = JSON.parse(localStorage.getItem('meus_desafios')) || [];
                    desafios = desafios.filter(d => d.id.toString() !== desafioId);
                    localStorage.setItem('meus_desafios', JSON.stringify(desafios));
                    carregarDesafios();
                }
            }
        });
        carregarDesafios();
    }

    // --- LÓGICA DA PÁGINA DO TREINADOR ---
    const paginaTreinador = document.getElementById('configuracao');
    if (paginaTreinador) {
        // Código completo da página do treinador para garantir que funcione
        const botaoIniciar = document.getElementById('iniciar-treino');
        const inputCorridaMin = document.getElementById('tempo-corrida-min');
        const inputCorridaSeg = document.getElementById('tempo-corrida-seg');
        const inputCaminhadaMin = document.getElementById('tempo-caminhada-min');
        const inputCaminhadaSeg = document.getElementById('tempo-caminhada-seg');
        const grupoCiclos = document.getElementById('grupo-ciclos');
        const inputCiclos = document.getElementById('ciclos');
        const checkboxCiclosInfinitos = document.getElementById('ciclos-infinitos');
        const secaoTreinoAtivo = document.getElementById('treino-ativo');
        const displayStatus = document.getElementById('status-ciclo');
        const displayContadorCiclos = document.getElementById('contador-ciclos');
        const displayTempo = document.getElementById('tempo-display');
        const containerBolinhas = document.querySelector('.bolinhas-progresso');
        const botaoParar = document.getElementById('botao-parar');
        const modal = document.getElementById('modal-confirmacao');
        const modalTexto = document.getElementById('modal-texto');
        const botaoConfirmarModal = document.getElementById('modal-botao-confirmar');
        const botaoCancelarModal = document.getElementById('modal-botao-cancelar');
        let timerInterval, tempoTotalCorridoSegundos = 0, currentTimer, acaoConfirmar;

        checkboxCiclosInfinitos.addEventListener('change', () => {
            grupoCiclos.style.display = checkboxCiclosInfinitos.checked ? 'none' : 'block';
        });

        function resetarTreinador() {
            clearInterval(timerInterval);
            document.body.className = '';
            paginaTreinador.style.display = 'block';
            secaoTreinoAtivo.style.display = 'none';
            tempoTotalCorridoSegundos = 0;
            currentTimer = null;
        }

        function finalizarTreino(parcial = false) {
            clearInterval(timerInterval);
            modalTexto.textContent = 'Deseja salvar este treino?';
            botaoConfirmarModal.textContent = 'Sim, Salvar';
            botaoCancelarModal.textContent = 'Não, Descartar';
            modal.style.display = 'flex';
            let tempoFinal = parcial ? tempoTotalCorridoSegundos + (currentTimer.duracao - currentTimer.restante) : tempoTotalCorridoSegundos;

            acaoConfirmar = () => {
                const distancia = prompt('Qual foi a distância total percorrida (em km)?');
                if (distancia && !isNaN(distancia) && distancia > 0) {
                    const url = `registrar-treino.html?tempoTotalSegundos=${tempoFinal}&tipo=Intervalado&distancia=${distancia}`;
                    window.location.href = url;
                } else {
                    alert('Distância inválida. O treino não foi salvo.');
                    resetarTreinador();
                    modal.style.display = 'none';
                }
            };
        }
        
        botaoParar.addEventListener('click', () => {
            clearInterval(timerInterval);
            modalTexto.textContent = 'Tem certeza que deseja parar o treino?';
            botaoConfirmarModal.textContent = 'Sim, Parar';
            botaoCancelarModal.textContent = 'Continuar Treino';
            modal.style.display = 'flex';
            
            acaoConfirmar = () => finalizarTreino(true);
        });

        botaoCancelarModal.addEventListener('click', () => {
            modal.style.display = 'none';
            if (currentTimer && botaoCancelarModal.textContent === 'Continuar Treino') {
                iniciarContagem(currentTimer.restante, currentTimer.callback);
            } else if (botaoCancelarModal.textContent === 'Não, Descartar') {
                resetarTreinador();
            }
        });

        botaoConfirmarModal.addEventListener('click', () => {
            if (acaoConfirmar) acaoConfirmar();
        });

        function iniciarContagem(duracao, callback) {
            currentTimer = { duracao: duracao, restante: duracao, callback: callback };
            const formatarTempo = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
            displayTempo.textContent = formatarTempo(currentTimer.restante);

            timerInterval = setInterval(() => {
                currentTimer.restante--;
                displayTempo.textContent = formatarTempo(currentTimer.restante);
                if (currentTimer.restante <= 0) {
                    clearInterval(timerInterval);
                    tempoTotalCorridoSegundos += duracao;
                    callback();
                }
            }, 1000);
        }

        botaoIniciar.addEventListener('click', () => {
            const corridaMin = parseInt(inputCorridaMin.value) || 0;
            const corridaSeg = parseInt(inputCorridaSeg.value) || 0;
            const tempoCorridaSeg = (corridaMin * 60) + corridaSeg;
            const caminhadaMin = parseInt(inputCaminhadaMin.value) || 0;
            const caminhadaSeg = parseInt(inputCaminhadaSeg.value) || 0;
            const tempoCaminhadaSeg = (caminhadaMin * 60) + caminhadaSeg;
            const totalCiclos = checkboxCiclosInfinitos.checked ? Infinity : parseInt(inputCiclos.value);
            let cicloAtual = 1;

            paginaTreinador.style.display = 'none';
            secaoTreinoAtivo.style.display = 'flex';
            
            if (!checkboxCiclosInfinitos.checked && totalCiclos > 0) {
                containerBolinhas.innerHTML = '';
                for (let i = 0; i < totalCiclos; i++) {
                    const bolinha = document.createElement('div');
                    bolinha.className = 'bolinha';
                    containerBolinhas.appendChild(bolinha);
                }
            } else { containerBolinhas.innerHTML = ''; }

            function iniciarFaseCorrida() {
                document.body.className = 'fase-corrida';
                displayStatus.textContent = 'Corrida Forte';
                if (checkboxCiclosInfinitos.checked) {
                    displayContadorCiclos.textContent = `Ciclo ${cicloAtual}`;
                } else {
                    displayContadorCiclos.textContent = `${cicloAtual} / ${totalCiclos}`;
                }
                iniciarContagem(tempoCorridaSeg, iniciarFaseCaminhada);
            }

            function iniciarFaseCaminhada() {
                document.body.className = 'fase-caminhada';
                displayStatus.textContent = 'Corrida Leve/Caminhada';
                iniciarContagem(tempoCaminhadaSeg, () => {
                    if (!checkboxCiclosInfinitos.checked) {
                        containerBolinhas.children[cicloAtual - 1].classList.add('concluida');
                    }
                    cicloAtual++;
                    if (cicloAtual > totalCiclos) {
                        finalizarTreino(false);
                        return;
                    }
                    iniciarFaseCorrida();
                });
            }
            iniciarFaseCorrida();
        });
    }
});
