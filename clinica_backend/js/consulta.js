document.addEventListener("DOMContentLoaded", () => {
  const campoCpf = document.getElementById("cpf");
  const botaoConsultar = document.getElementById("btnConsultar");
  const resultado = document.getElementById("resultado");

  const API_BASE = "https://clinica-saude-backend-hpzl.onrender.com";

  campoCpf.addEventListener("input", () => {
    let valor = campoCpf.value.replace(/\D/g, "");
    valor = valor.slice(0, 11);
    campoCpf.value = valor;
    resultado.innerHTML = "";
  });

  botaoConsultar.addEventListener("click", () => consultarAgendamento(true));

  function setBotaoConsultarCarregando(carregando) {
    if (carregando) {
      botaoConsultar.disabled = true;
      botaoConsultar.textContent = "⏳ Aguarde, conectando ao servidor...";
    } else {
      botaoConsultar.disabled = false;
      botaoConsultar.textContent = "Consultar";
    }
  }

  function setBotaoCancelarCarregando(botao, carregando) {
    if (carregando) {
      botao.disabled = true;
      botao.textContent = "⏳ Aguarde, cancelando...";
    } else {
      botao.disabled = false;
      botao.textContent = "Cancelar Selecionados";
    }
  }

  function mostrarMensagemResultado(texto, tipo) {
    resultado.innerHTML = `<div class="alert alert-${tipo} mt-3">${texto}</div>`;
  }

  function consultarAgendamento(mostrarAlertaSemResultados = true) {
    const cpf = campoCpf.value.trim();

    resultado.innerHTML = "";

    if (!cpf) {
      alert("Digite o CPF para consultar.");
      return;
    }

    if (cpf.length !== 11) {
      alert("O CPF deve conter exatamente 11 números.");
      return;
    }

    setBotaoConsultarCarregando(true);
    mostrarMensagemResultado("⏳ Conectando ao servidor, aguarde alguns segundos...", "info");

    fetch(`${API_BASE}/consultar_agendamento.php?cpf=${encodeURIComponent(cpf)}`)
      .then((res) => res.json())
      .then((dados) => {
        if (dados.length === 0) {
          if (mostrarAlertaSemResultados) {
            mostrarMensagemResultado("Não existe agendamento para este CPF!", "warning");
          }
          return;
        }

        let html = `
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title mb-3">Agendamentos Encontrados</h5>
              <form id="formCancelarSelecionados">
                <table class="table table-bordered table-hover align-middle">
                  <thead class="table-dark">
                    <tr>
                      <th style="width: 80px;">Selecionar</th>
                      <th>Paciente</th>
                      <th>Médico</th>
                      <th>Especialidade</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
        `;

        dados.forEach((a) => {
          html += `
            <tr>
              <td class="text-center">
                <input type="checkbox" name="selecionados[]" value="${a.id}" />
              </td>
              <td>${a.nome}</td>
              <td>${a.medico}</td>
              <td>${a.especialidade}</td>
              <td>${a.data}</td>
            </tr>
          `;
        });

        html += `
                  </tbody>
                </table>
                <button type="submit" id="btnCancelar" class="btn btn-danger">
                  Cancelar Selecionados
                </button>
              </form>
            </div>
          </div>
        `;

        resultado.innerHTML = html;

        const formCancelar = document.getElementById("formCancelarSelecionados");

        formCancelar.addEventListener("submit", (event) => {
          event.preventDefault();

          const marcados = document.querySelectorAll('input[name="selecionados[]"]:checked');
          const btnCancelar = document.getElementById("btnCancelar");

          if (marcados.length === 0) {
            alert("Selecione pelo menos um agendamento para cancelar.");
            return;
          }

          const confirmar = confirm("Confirma o cancelamento do(s) agendamento(s) selecionado(s)?");

          if (!confirmar) {
            return;
          }

          const formData = new URLSearchParams();
          marcados.forEach((checkbox) => {
            formData.append("selecionados[]", checkbox.value);
          });

          setBotaoCancelarCarregando(btnCancelar, true);

          fetch(`${API_BASE}/cancelar_agendamento.php`, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData.toString(),
          })
            .then((res) => res.json())
            .then((resultadoCancelamento) => {
              if (resultadoCancelamento.sucesso) {
                mostrarMensagemResultado("✅ " + resultadoCancelamento.mensagem, "success");
              } else {
                setBotaoCancelarCarregando(btnCancelar, false);
                mostrarMensagemResultado(resultadoCancelamento.mensagem || "Erro ao cancelar agendamento.", "danger");
              }
            })
            .catch((erro) => {
              console.error(erro);
              setBotaoCancelarCarregando(btnCancelar, false);
              mostrarMensagemResultado(
                "⚠️ O servidor demorou para responder. Verifique sua conexão e tente novamente.",
                "warning",
              );
            });
        });
      })
      .catch((erro) => {
        console.error(erro);
        mostrarMensagemResultado(
          "⚠️ O servidor demorou para responder. Verifique sua conexão e tente novamente.",
          "warning",
        );
      })
      .finally(() => {
        setBotaoConsultarCarregando(false);
      });
  }
});
