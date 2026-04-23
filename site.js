(function(){
  var AI_SYSTEM_PROMPT = "You are Tamer\u0027s professional AI assistant embedded in his CV website. Answer questions about Tamer Abdel Hamid Mahmoud El Sayed based ONLY on the following profile. Be concise, professional, and friendly. Speak in third person about Tamer. Keep answers under 150 words. If asked something not covered, invite them to contact Tamer at tamer.h@hotmail.com.\\n\\nPROFILE:\\n- Full name: Tamer Abdel Hamid Mahmoud El Sayed\\n- Location: New Cairo, Egypt | Mobile: +2 010 05305451 | Email: tamer.h@hotmail.com\\n- LinkedIn: http://eg.linkedin.com/in/tamerh\\n- Title: Document \u0026 Data Control Manager | Digital Transformation Expert | Power BI | SQL Server | Process Automation\\n- Experience: 25+ years in Document Control, Data Management, Digital Transformation across multinational construction mega-projects (power plants, oil \u0026 gas, airports, buildings)\\n- Current role: Head of Document-Data Control Technical Support at Consolidated Contractors Intl. Co. (CCIC) since October 2011. Managing 7 projects \u0026 4 offices across Egypt.\\n- Key technical skills: SQL Server (T-SQL, CTEs, Stored Procedures, performance tuning), Power BI (DAX, dashboards, data modeling), Python, VBA, Power Automate, SharePoint, Primavera P6, Aconex (Oracle), ETL pipelines, Data Governance, MDM\\n- Education: Bachelor\u0027s Degree in Accounting, Faculty of Commerce, Benha University, 1998\\n- Key certifications: Google Data Analytics Professional Certificate (2024), MCDBA Microsoft Certified Database Administrator (2005), Udacity Front End Web Development Nanodegree (2021), Power BI Microsoft/edX (2016), Transact-SQL Microsoft/edX (2015), Governance \u0026 Digital Transformation Nile University (2024), AI \u0026 Digital Transformation NTI (2024), Docker/Kubernetes/OpenShift IBM/Coursera (2024)\\n- Notable projects: Data Warehouse optimization (DWH 500K+ records), Power BI executive dashboards for construction KPIs, Document Control automation (Python PDF renamer, SQL spell-checker, Excel VBA ADO integration)\\n- Past employers: CCIC Egypt (2011-present), CCIC Libya Sebha Airport EUR 280M (2009), PARACON Egypt (2008-2009), CCIC Saudi Arabia KFDP USD 500M (2007-2008), CCIC Saudi Arabia KPF USD 580M (2005-2007), CCIC Cairo North Power Plant (2002-2005), Orascom City Stars USD 340M (1999-2002)\\n- Languages: Arabic (Native), English (Very Good)\\n- Volunteering: Member of Digital Transformation Committee Egypt \u0026 North Africa; CCC Corporate Social Responsibility member";
  var AI_WORKER_URL = 'https://tamer-cv-ai.tamer-h.workers.dev/chat';

  function resolveAsset(path) {
    if (!path) return path;
    if (/^(https?:|data:|\/|\.\/|\.\.\/)/i.test(path)) return path;
    if (/^cert\//i.test(path) || /^powerbi_files\//i.test(path) || /^case_files\//i.test(path)) return path;
    if (/^(cert-|cert-in-|cert-vo-)/i.test(path)) return 'cert/' + path;
    if (/^project[0-9]+_/i.test(path)) return 'powerbi_files/' + path;
    if (/^case[0-9]+_/i.test(path)) return 'case_files/' + path;
    return path;
  }

  function normalizeAssetAttributes() {
    document.querySelectorAll('img[src]').forEach(function(img) {
      img.src = resolveAsset(img.getAttribute('src'));
    });

    document.querySelectorAll('.cert-link[data-img]').forEach(function(card) {
      card.setAttribute('data-img', resolveAsset(card.getAttribute('data-img')));
    });
  }

  function initCertOverlay() {
    var overlay = document.getElementById('cert-overlay');
    var img = document.getElementById('cert-img');
    var closeBtn = document.getElementById('cert-close');
    if (!overlay || !img || !closeBtn) return;

    document.querySelectorAll('.cert-link').forEach(function(el){
      el.addEventListener('click', function(){
        var src = resolveAsset(el.getAttribute('data-img'));
        if(!src) return;
        img.src = src;
        overlay.classList.add('active');
        if(typeof trackCertView !== 'undefined') {
          var nameEl = el.querySelector('.cert-name');
          trackCertView(nameEl ? nameEl.textContent : src);
        }
        document.body.style.overflow = 'hidden';
      });

      el.addEventListener('keydown', function(e){
        if(e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          el.click();
        }
      });
    });

    function closeLightbox() {
      overlay.classList.remove('active');
      img.src = '';
      document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', function(e){
      if(e.target === overlay) closeLightbox();
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && overlay.classList.contains('active')) closeLightbox();
    });
  }

  function initDashOverlay() {
    var overlay = document.getElementById('dash-overlay');
    var dashImg = document.getElementById('dash-img');
    var dashTitle = document.getElementById('dash-title');
    var dashCounter = document.getElementById('dash-counter');
    if (!overlay || !dashImg || !dashTitle || !dashCounter) return;

    var dashImages = [];
    var dashTitles = [];
    var dashIndex = 0;

    window.togglePbProject = function(id) {
      var el = document.getElementById(id);
      if (el) el.classList.toggle('open');
    };

    function renderDash() {
      if (!dashImages.length) return;
      dashImg.src = dashImages[dashIndex];
      dashTitle.textContent = dashTitles[dashIndex] || 'Dashboard screenshot';
      dashCounter.textContent = (dashIndex + 1) + ' / ' + dashImages.length;
    }

    window.openDash = function(images, titles, idx) {
      dashImages = (images || []).map(resolveAsset);
      dashTitles = titles || [];
      dashIndex = idx || 0;
      renderDash();
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    window.closeDash = function() {
      overlay.classList.remove('active');
      dashImg.src = '';
      document.body.style.overflow = '';
    };

    window.dashNav = function(dir) {
      if (!dashImages.length) return;
      dashIndex = (dashIndex + dir + dashImages.length) % dashImages.length;
      renderDash();
    };

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) window.closeDash();
    });

    document.addEventListener('keydown', function(e) {
      if (!overlay.classList.contains('active')) return;
      if (e.key === 'Escape') window.closeDash();
      if (e.key === 'ArrowRight') window.dashNav(1);
      if (e.key === 'ArrowLeft') window.dashNav(-1);
    });
  }

  function initCvModal() {
    var modal = document.getElementById('cv-modal');
    if (!modal) return;

    window.openCvModal = function() {
      var emailInput = document.getElementById('cv-email-input');
      var err = document.getElementById('cv-email-err');
      var formArea = document.getElementById('cv-form-area');
      var successArea = document.getElementById('cv-success-area');
      var btn = document.getElementById('cv-send-btn');

      modal.style.display = 'flex';
      if (emailInput) emailInput.value = '';
      if (err) err.style.display = 'none';
      if (formArea) formArea.style.display = 'block';
      if (successArea) successArea.style.display = 'none';
      if (btn) {
        btn.textContent = 'Send Me the CV';
        btn.disabled = false;
      }
      setTimeout(function(){
        if (emailInput) emailInput.focus();
      }, 100);
    };

    window.closeCvModal = function() {
      modal.style.display = 'none';
    };

    function showCvSuccess(email) {
      document.getElementById('cv-form-area').style.display = 'none';
      document.getElementById('cv-success-msg').textContent =
        "A copy of Tamer's CV will be sent to " + email + " shortly.";
      document.getElementById('cv-success-area').style.display = 'block';
    }

    function cvFallback() {
      var btn = document.getElementById('cv-send-btn');
      var errEl = document.getElementById('cv-email-err');
      if (btn) {
        btn.textContent = 'Send Me the CV';
        btn.disabled = false;
      }
      if (errEl) {
        errEl.textContent = 'Something went wrong. Please email tamer.h@hotmail.com directly.';
        errEl.style.display = 'block';
      }
    }

    window.submitCvRequest = function() {
      var emailEl = document.getElementById('cv-email-input');
      var errEl = document.getElementById('cv-email-err');
      var btn = document.getElementById('cv-send-btn');
      if (!emailEl || !errEl || !btn) return;

      var email = emailEl.value.trim();
      var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(!email || !re.test(email)) {
        errEl.textContent = 'Please enter a valid email address.';
        errEl.style.display = 'block';
        emailEl.focus();
        return;
      }

      errEl.style.display = 'none';
      btn.textContent = 'Sending...';
      btn.disabled = true;

      if(typeof gtag !== 'undefined') {
        gtag('event', 'cv_request', { event_category: 'CV', event_label: email });
      }

      var EMAILJS_SERVICE = 'service_7ps80uw';
      var EMAILJS_TEMPLATE = 'template_8jhoofo';
      var EMAILJS_KEY = '-YJ6hZKYOMlC8Iy7d';

      if(EMAILJS_SERVICE !== 'YOUR_SERVICE_ID' && typeof emailjs !== 'undefined') {
        emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
          requester_email: email,
          to_email: 'tamer.h@hotmail.com'
        }, EMAILJS_KEY)
          .then(function() { showCvSuccess(email); })
          .catch(cvFallback);
      } else {
        btn.textContent = 'Send Me the CV';
        btn.disabled = false;
        errEl.textContent = 'Email service not configured yet. Please contact tamer.h@hotmail.com directly.';
        errEl.style.display = 'block';
      }
    };

    modal.addEventListener('click', function(e){
      if(e.target === modal) window.closeCvModal();
    });
  }

  function initAiModal() {
    var widget = document.getElementById('ai-widget');
    if (!widget) return;

    var input = document.getElementById('ai-input');
    var closeBtn = widget.querySelector('[data-ai-close]');
    var toggleBtn = widget.querySelector('[data-ai-toggle]');
    var openClass = 'active';

    function focusInput() {
      setTimeout(function() {
        if (input) input.focus();
      }, 120);
    }

    function syncState() {
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-expanded', widget.classList.contains(openClass) ? 'true' : 'false');
      }
    }

    window.openAiModal = function(prefill) {
      widget.classList.add(openClass);

      if (typeof prefill === 'string' && input) {
        input.value = prefill;
      }

      syncState();
      focusInput();
    };

    window.closeAiModal = function() {
      widget.classList.remove(openClass);
      syncState();
    };

    window.toggleAiModal = function() {
      if (widget.classList.contains(openClass)) {
        window.closeAiModal();
      } else {
        window.openAiModal();
      }
    };

    document.querySelectorAll('[data-ai-open]').forEach(function(trigger) {
      trigger.addEventListener('click', function(e) {
        e.preventDefault();
        window.openAiModal(trigger.getAttribute('data-ai-prompt') || '');
      });
    });

    if (toggleBtn) {
      toggleBtn.addEventListener('click', window.toggleAiModal);
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', window.closeAiModal);
    }

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && widget.classList.contains(openClass)) {
        window.closeAiModal();
      }
    });

    syncState();
  }

  function initAiAssistant() {
    var msgs = document.getElementById('ai-messages');
    var input = document.getElementById('ai-input');
    var send = document.getElementById('ai-send');
    if (!msgs || !input || !send) return;

    var history = [];

    function scrollDown() {
      msgs.scrollTop = msgs.scrollHeight;
    }

    function addMsg(text, role) {
      var item = document.createElement('div');
      item.className = 'msg ' + role;
      item.textContent = text;
      msgs.appendChild(item);
      scrollDown();
      return item;
    }

    window.askSuggestion = function(btn) {
      input.value = btn.textContent;
      window.sendAiMessage();
    };

    window.sendAiMessage = async function() {
      var text = input.value.trim();
      if (!text || send.disabled) return;

      input.value = '';
      send.disabled = true;
      addMsg(text, 'user');
      if (typeof trackAiQuery !== 'undefined') trackAiQuery(text);
      history.push({ role: 'user', content: text });
      var typing = addMsg('Thinking...', 'typing');

      try {
        var res = await fetch(AI_WORKER_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ system: AI_SYSTEM_PROMPT, messages: history })
        });

        if (!res.ok) {
          typing.remove();
          addMsg('Server error (' + res.status + '). Please try again.', 'bot');
          send.disabled = false;
          input.focus();
          return;
        }

        var data = await res.json();
        if (data.error) {
          typing.remove();
          addMsg('Error: ' + data.error, 'bot');
          send.disabled = false;
          input.focus();
          return;
        }

        var reply = (data.reply && data.reply.trim()) ? data.reply : 'Sorry, no response received.';
        typing.remove();
        addMsg(reply, 'bot');
        history.push({ role: 'assistant', content: reply });
      } catch (e) {
        typing.remove();
        addMsg('Could not reach the assistant (' + e.message + '). Please try again.', 'bot');
      }

      send.disabled = false;
      input.focus();
    };

    input.addEventListener('keydown', function(e){
      if (e.key === 'Enter') window.sendAiMessage();
    });
  }

  normalizeAssetAttributes();
  initCertOverlay();
  initDashOverlay();
  initCvModal();
  initAiModal();
  initAiAssistant();
})();






