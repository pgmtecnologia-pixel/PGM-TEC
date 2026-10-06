/**
 * PGM Tecnologia — Lógica do formulário de briefing
 */

(function () {
  'use strict';

  // ----- Elementos do DOM -----
  const form = document.getElementById('briefing-form');
  if (!form) return;

  const stepsElements = document.querySelectorAll('.step-content');
  const btnNext = document.getElementById('btn-next');
  const btnPrev = document.getElementById('btn-prev');
  const btnSubmit = document.getElementById('btn-submit');
  const progressBar = document.getElementById('progress-bar');
  const stepLabel = document.getElementById('step-label');
  const briefingContainer = document.getElementById('briefing-container');
  const briefingIntro = document.getElementById('briefing-intro');
  const briefingSuccess = document.getElementById('briefing-success');
  
  // ----- Variáveis de Estado -----
  let currentStep = 1;
  const totalSteps = 6;
  const STORAGE_KEY = 'pgm_briefing_data';
  
  const stepNames = [
    "Empresa",
    "Landing Page",
    "Público",
    "Conteúdo",
    "Visual",
    "Finalização"
  ];

  // ----- Inicialização -----
  function init() {
    restoreData();
    setupDynamicFields();
    setupReferences();
    setupValidationListeners();
    updateUI();

    btnNext.addEventListener('click', handleNext);
    btnPrev.addEventListener('click', handlePrev);
    form.addEventListener('submit', handleSubmit);
    form.addEventListener('input', debounce(saveData, 500));
    form.addEventListener('change', saveData);
  }

  // ----- Navegação -----
  function handleNext() {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        currentStep++;
        updateUI();
        scrollToForm();
        saveData();
      }
    }
  }

  function handlePrev() {
    if (currentStep > 1) {
      currentStep--;
      updateUI();
      scrollToForm();
      saveData();
    }
  }

  function updateUI() {
    // Atualizar visibilidade das etapas
    stepsElements.forEach(step => {
      if (parseInt(step.getAttribute('data-step')) === currentStep) {
        step.hidden = false;
        // Pequeno atraso para a animação do CSS funcionar caso estivesse display:none
        setTimeout(() => step.classList.add('active'), 10);
      } else {
        step.hidden = true;
        step.classList.remove('active');
      }
    });

    // Atualizar botões
    btnPrev.hidden = currentStep === 1;
    
    if (currentStep === totalSteps) {
      btnNext.hidden = true;
      btnSubmit.hidden = false;
    } else {
      btnNext.hidden = false;
      btnSubmit.hidden = true;
    }

    // Atualizar barra de progresso
    const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
    progressBar.style.width = `${progress}%`;
    stepLabel.textContent = `Etapa ${currentStep} de ${totalSteps} · ${stepNames[currentStep - 1]}`;
  }

  function scrollToForm() {
    const yOffset = -90; // compensar header fixo
    const element = document.getElementById('briefing-container');
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  // ----- Validação -----
  function validateStep(stepNum) {
    const stepEl = document.querySelector(`.step-content[data-step="${stepNum}"]`);
    if (!stepEl) return true;

    const requiredElements = stepEl.querySelectorAll('[required]');
    let isValid = true;
    let firstInvalid = null;

    // Resetar estilos de erro
    stepEl.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
    stepEl.querySelectorAll('[aria-invalid="true"]').forEach(el => el.setAttribute('aria-invalid', 'false'));

    // Grupos de radio (fieldset)
    const radioGroups = {};

    requiredElements.forEach(el => {
      if (el.type === 'radio') {
        if (!radioGroups[el.name]) radioGroups[el.name] = [];
        radioGroups[el.name].push(el);
      } else if (el.type === 'checkbox') {
        if (!el.checked) {
          isValid = false;
          el.setAttribute('aria-invalid', 'true');
          el.closest('.form-group').classList.add('has-error');
          if (!firstInvalid) firstInvalid = el;
        }
      } else {
        if (!el.value.trim()) {
          isValid = false;
          el.setAttribute('aria-invalid', 'true');
          el.closest('.form-group').classList.add('has-error');
          if (!firstInvalid) firstInvalid = el;
        } else if (el.type === 'email' && !validateEmail(el.value)) {
          isValid = false;
          el.setAttribute('aria-invalid', 'true');
          el.closest('.form-group').classList.add('has-error');
          if (!firstInvalid) firstInvalid = el;
        }
      }
    });

    // Validar radio groups
    for (const name in radioGroups) {
      const radios = radioGroups[name];
      const isChecked = radios.some(r => r.checked);
      if (!isChecked) {
        isValid = false;
        const fieldset = radios[0].closest('fieldset');
        if (fieldset) fieldset.classList.add('has-error');
        if (!firstInvalid) firstInvalid = radios[0];
      }
    }

    if (!isValid && firstInvalid) {
      firstInvalid.focus();
    }

    return isValid;
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function setupValidationListeners() {
    form.addEventListener('input', e => {
      if (e.target.hasAttribute('aria-invalid')) {
        e.target.setAttribute('aria-invalid', 'false');
        const group = e.target.closest('.form-group') || e.target.closest('fieldset');
        if (group) group.classList.remove('has-error');
      }
    });
    form.addEventListener('change', e => {
      if (e.target.type === 'radio') {
        const fieldset = e.target.closest('fieldset');
        if (fieldset && fieldset.classList.contains('has-error')) {
          fieldset.classList.remove('has-error');
        }
      }
    });
  }

  // ----- Campos Condicionais ("Outro") -----
  function setupDynamicFields() {
    const conditions = [
      { trigger: 'lp_objetivo', value: 'Outro', target: 'lp_objetivo_outro_field', inputTarget: 'lp_objetivo_outro_texto' },
      { trigger: 'lp_acao', value: 'Outra', target: 'lp_acao_outra_field', inputTarget: 'lp_acao_outra_texto' },
      { trigger: 'pub_regiao', value: 'Outra região', target: 'pub_regiao_outra_field', inputTarget: 'pub_regiao_outra_texto' },
      { trigger: 'pub_importante', value: 'Outro', target: 'pub_importante_outro_field', inputTarget: 'pub_importante_outro_texto', isCheckbox: true },
      { trigger: 'cont_essenciais', value: 'Outra informação', target: 'cont_essenciais_outra_field', inputTarget: 'cont_essenciais_outra_texto', isCheckbox: true }
    ];

    conditions.forEach(cond => {
      const inputs = document.querySelectorAll(`[name="${cond.trigger}"]`);
      const targetWrap = document.getElementById(cond.target);
      const targetInput = document.getElementById(cond.inputTarget);
      
      if (!inputs.length || !targetWrap || !targetInput) return;

      const handleChange = () => {
        let isVisible = false;
        
        if (cond.isCheckbox) {
          const checkbox = document.querySelector(`[name="${cond.trigger}"][value="${cond.value}"]`);
          isVisible = checkbox && checkbox.checked;
        } else {
          const checkedRadio = document.querySelector(`[name="${cond.trigger}"]:checked`);
          isVisible = checkedRadio && checkedRadio.value === cond.value;
        }

        targetWrap.hidden = !isVisible;
        if (!isVisible) {
          targetInput.value = '';
          targetInput.removeAttribute('required');
        } else {
          targetInput.setAttribute('required', 'true');
        }
      };

      inputs.forEach(input => input.addEventListener('change', handleChange));
      
      // Trigger inicial para restore
      handleChange();
    });
  }

  // ----- Referências Dinâmicas -----
  let refCount = 1;
  const maxRefs = 3;
  function setupReferences() {
    const btnAddRef = document.getElementById('btn-add-ref');
    const container = document.getElementById('references-container');
    
    if (!btnAddRef || !container) return;

    btnAddRef.addEventListener('click', () => {
      if (refCount >= maxRefs) return;
      refCount++;
      
      const item = document.createElement('div');
      item.className = 'reference-item';
      item.innerHTML = `
        <button type="button" class="btn-remove-ref" aria-label="Remover referência" title="Remover referência">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <div class="form-group">
          <label for="vis_ref_url_${refCount}">URL do site</label>
          <input type="url" id="vis_ref_url_${refCount}" name="vis_ref_url_${refCount}" placeholder="https://...">
        </div>
        <div class="form-group">
          <label for="vis_ref_motivo_${refCount}">O que você gosta nesse site?</label>
          <input type="text" id="vis_ref_motivo_${refCount}" name="vis_ref_motivo_${refCount}">
        </div>
      `;
      
      container.appendChild(item);
      
      const btnRemove = item.querySelector('.btn-remove-ref');
      btnRemove.addEventListener('click', () => {
        item.remove();
        refCount--;
        btnAddRef.hidden = false;
        saveData();
      });

      if (refCount >= maxRefs) {
        btnAddRef.hidden = true;
      }
      
      saveData();
    });
  }

  // ----- Local Storage -----
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function saveData() {
    const formData = new FormData(form);
    const data = {
      step: currentStep,
      refCount: refCount,
      values: {}
    };

    for (let [key, value] of formData.entries()) {
      if (data.values[key]) {
        if (!Array.isArray(data.values[key])) {
          data.values[key] = [data.values[key]];
        }
        data.values[key].push(value);
      } else {
        data.values[key] = value;
      }
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Não foi possível salvar no localStorage.");
    }
  }

  function restoreData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      const data = JSON.parse(saved);
      if (data.step) currentStep = data.step;
      
      // Restaurar referências extras
      if (data.refCount && data.refCount > 1) {
        const btnAddRef = document.getElementById('btn-add-ref');
        for (let i = 2; i <= Math.min(data.refCount, 3); i++) {
          if(btnAddRef) btnAddRef.click();
        }
      }

      // Preencher campos
      if (data.values) {
        for (const [key, value] of Object.entries(data.values)) {
          const inputs = document.querySelectorAll(`[name="${key}"]`);
          if (!inputs.length) continue;

          if (inputs[0].type === 'radio') {
            const radio = document.querySelector(`[name="${key}"][value="${value}"]`);
            if (radio) radio.checked = true;
          } else if (inputs[0].type === 'checkbox') {
            const values = Array.isArray(value) ? value : [value];
            inputs.forEach(cb => {
              if (values.includes(cb.value)) cb.checked = true;
            });
          } else {
            inputs[0].value = value;
          }
        }
      }
    } catch (e) {
      console.warn("Não foi possível restaurar os dados do localStorage.");
    }
  }

  // ----- Envio do Formulário -----
  function handleSubmit(e) {
    e.preventDefault();

    if (!validateStep(currentStep)) return;

    const formData = new FormData(form);
    
    // Coletar dados
    const rawData = {};
    for (let [key, value] of formData.entries()) {
      if (rawData[key]) {
        if (!Array.isArray(rawData[key])) {
          rawData[key] = [rawData[key]];
        }
        rawData[key].push(value);
      } else {
        rawData[key] = value;
      }
    }

    submitBriefing(rawData);
  }

  function submitBriefing(data) {
    // 1. Organizar os dados
    const briefingObject = {
      empresa: {
        nome: data.empresa_nome || '',
        nomeFantasia: data.empresa_fantasia || '',
        cnpj: data.empresa_cnpj || '',
        segmento: data.empresa_segmento || '',
        cidadeEstado: data.empresa_cidade_estado || '',
        site: data.empresa_site || '',
        oQueFaz: data.empresa_o_que_faz || '',
        produtos: data.empresa_produtos || '',
        diferencial: data.empresa_diferencial || ''
      },
      landingPage: {
        objetivo: data.lp_objetivo === 'Outro' ? data.lp_objetivo_outro_texto : data.lp_objetivo,
        destaque: data.lp_destaque || '',
        acao: data.lp_acao === 'Outra' ? data.lp_acao_outra_texto : data.lp_acao,
        oferta: data.lp_oferta || '',
        prazo: data.lp_prazo || ''
      },
      publico: {
        quem: data.pub_quem || '',
        tipo: data.pub_tipo || '',
        regiao: data.pub_regiao === 'Outra região' ? data.pub_regiao_outra_texto : data.pub_regiao,
        problema: data.pub_problema || '',
        importante: (Array.isArray(data.pub_importante) ? data.pub_importante : [data.pub_importante]).filter(Boolean),
        importanteOutro: data.pub_importante_outro_texto || ''
      },
      conteudo: {
        essenciais: (Array.isArray(data.cont_essenciais) ? data.cont_essenciais : [data.cont_essenciais]).filter(Boolean),
        essenciaisOutro: data.cont_essenciais_outra_texto || '',
        beneficios: data.cont_beneficios || '',
        diferenciais: data.cont_diferenciais || '',
        obrigatorio: data.cont_obrigatorio || '',
        duvidas: data.cont_duvidas || ''
      },
      contato: {
        whatsapp: data.contato_whatsapp || '',
        telefone: data.contato_telefone || '',
        email: data.contato_email || '',
        horario: data.contato_horario || '',
        endereco: data.contato_endereco || '',
        instagram: data.contato_instagram || '',
        facebook: data.contato_facebook || '',
        linkedin: data.contato_linkedin || '',
        outraRede: data.contato_outra_rede || ''
      },
      visual: {
        identidade: data.vis_identidade || '',
        cores: data.vis_cores || '',
        coresEvitar: data.vis_cores_evitar || '',
        percepcao: (Array.isArray(data.vis_percepcao) ? data.vis_percepcao : [data.vis_percepcao]).filter(Boolean),
        referencias: [
          { url: data.vis_ref_url_1, motivo: data.vis_ref_motivo_1 },
          { url: data.vis_ref_url_2, motivo: data.vis_ref_motivo_2 },
          { url: data.vis_ref_url_3, motivo: data.vis_ref_motivo_3 }
        ].filter(ref => ref.url || ref.motivo),
        evitar: data.vis_evitar || '',
        observacao: data.vis_observacao || ''
      },
      responsavel: {
        nome: data.resp_nome || '',
        cargo: data.resp_cargo || '',
        email: data.resp_email || '',
        whatsapp: data.resp_whatsapp || '',
        concorrentes: data.resp_concorrentes || '',
        informacaoExtra: data.resp_extra || '',
        aceiteTermos: !!data.aceite_termos
      }
    };

    // 2. Registrar no console
    console.log("=== BRIEFING SUBMITTED ===");
    console.log(JSON.stringify(briefingObject, null, 2));

    // TODO: integrar envio do briefing ao backend quando disponível
    // fetch('/api/briefing', { method: 'POST', body: JSON.stringify(briefingObject) }) ...

    // 3. Limpar storage e exibir sucesso
    localStorage.removeItem(STORAGE_KEY);
    
    briefingIntro.hidden = true;
    briefingContainer.hidden = true;
    briefingSuccess.hidden = false;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Inicializar a aplicação
  init();

})();
