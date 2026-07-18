window.AppPages = window.AppPages || {};

window.AppPages.activities = (function createActivitiesPage() {
  const GRADES = [1, 2, 3, 4, 5, 6];
  const DIFFICULTIES = [
    { value: 'easy', label: 'Fácil' },
    { value: 'medium', label: 'Medio' },
    { value: 'hard', label: 'Difícil' },
  ];
  const MIN_OPTIONS = 2;

  let containerRef = null;
  let activities = [];
  let subjectOptions = [];
  let filters = { grade: '', subject: '' };
  let editingActivity = null;
  let isModalOpen = false;
  let formErrors = [];
  let listAlert = null;
  let formOptions = [{ text: '' }, { text: '' }];
  let formCorrectIndex = 0;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char]));
  }

  function optionLetter(index) {
    return String.fromCharCode(97 + index);
  }

  function difficultyLabel(value) {
    const match = DIFFICULTIES.find((item) => item.value === value);
    return match ? match.label : 'Sin definir';
  }

  function renderAlert() {
    if (!listAlert) return '';
    const cssClass = listAlert.type === 'error' ? 'alert-error' : 'alert-success';
    return `<div class="alert ${cssClass}" role="status">${escapeHtml(listAlert.message)}</div>`;
  }

  function renderToolbar() {
    return `
      <div class="activities-toolbar">
        <div>
          <h1>Actividades</h1>
          <p>Banco de actividades de selección múltiple.</p>
        </div>
        <button type="button" class="btn btn-primary" data-action="new-activity">+ Nueva actividad</button>
      </div>
    `;
  }

  function renderFilters() {
    const gradeOptions = GRADES.map(
      (grade) => `<option value="${grade}" ${String(filters.grade) === String(grade) ? 'selected' : ''}>${grade}°</option>`
    ).join('');
    const subjectOptionsHtml = subjectOptions
      .map(
        (subject) =>
          `<option value="${escapeHtml(subject)}" ${filters.subject === subject ? 'selected' : ''}>${escapeHtml(subject)}</option>`
      )
      .join('');

    return `
      <div class="activities-filters">
        <div class="form-field">
          <label for="filter-grade">Grado</label>
          <select id="filter-grade" data-filter="grade">
            <option value="">Todos</option>
            ${gradeOptions}
          </select>
        </div>
        <div class="form-field">
          <label for="filter-subject">Asignatura</label>
          <select id="filter-subject" data-filter="subject">
            <option value="">Todas</option>
            ${subjectOptionsHtml}
          </select>
        </div>
      </div>
    `;
  }

  function renderTable() {
    if (activities.length === 0) {
      return '<div class="card activities-empty">No hay actividades que coincidan con los filtros.</div>';
    }

    const rows = activities
      .map((activity) => {
        const statusBadge = activity.isActive
          ? '<span class="badge badge-active">Activa</span>'
          : '<span class="badge badge-inactive">Inactiva</span>';
        const toggleLabel = activity.isActive ? 'Desactivar' : 'Activar';
        return `
          <tr>
            <td>${escapeHtml(activity.title)}</td>
            <td>${escapeHtml(activity.subject)}</td>
            <td>${activity.grade ?? 'Sin asignar'}</td>
            <td>${statusBadge}</td>
            <td>
              <div class="activities-actions">
                <button type="button" class="btn btn-secondary" data-action="edit" data-id="${activity.id}">Editar</button>
                <button type="button" class="btn btn-secondary" data-action="duplicate" data-id="${activity.id}">Duplicar</button>
                <button type="button" class="btn btn-secondary" data-action="toggle-active" data-id="${activity.id}">${toggleLabel}</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');

    return `
      <div class="card">
        <table class="activities-table">
          <thead>
            <tr><th>Título</th><th>Asignatura</th><th>Grado</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  function renderOptionRows() {
    return formOptions
      .map((option, index) => {
        const canRemove = formOptions.length > MIN_OPTIONS;
        return `
          <div class="option-row" data-option-row data-index="${index}">
            <input
              type="radio"
              name="correct-option"
              value="${index}"
              aria-label="Marcar la opción ${optionLetter(index).toUpperCase()} como correcta"
              ${index === formCorrectIndex ? 'checked' : ''}
            />
            <input
              type="text"
              data-option-text
              placeholder="Opción ${optionLetter(index).toUpperCase()}"
              value="${escapeHtml(option.text)}"
              maxlength="200"
            />
            <button type="button" class="btn btn-secondary" data-action="remove-option" data-index="${index}" ${canRemove ? '' : 'disabled'}>Quitar</button>
          </div>
        `;
      })
      .join('');
  }

  function renderModal() {
    if (!isModalOpen) return '';

    const activity = editingActivity;
    const title = activity ? 'Editar actividad' : 'Nueva actividad';
    const gradeOptions = GRADES.map(
      (grade) => `<option value="${grade}" ${activity && activity.grade === grade ? 'selected' : ''}>${grade}°</option>`
    ).join('');
    const difficultyOptionsHtml = DIFFICULTIES.map(
      (item) =>
        `<option value="${item.value}" ${activity && activity.difficulty === item.value ? 'selected' : ''}>${item.label}</option>`
    ).join('');
    const errorsHtml = formErrors.length
      ? `<div class="alert alert-error" role="alert">${formErrors.map((issue) => escapeHtml(issue.message)).join('<br>')}</div>`
      : '';

    return `
      <div class="modal-backdrop" data-action="backdrop">
        <div class="modal activities-modal" role="dialog" aria-modal="true" aria-labelledby="activity-modal-title">
          <h2 id="activity-modal-title">${title}</h2>
          ${errorsHtml}
          <form data-form="activity">
            <div class="form-field">
              <label for="activity-title">Título</label>
              <input id="activity-title" name="title" type="text" maxlength="120" required
                value="${escapeHtml(activity ? activity.title : '')}" />
            </div>
            <div class="form-field">
              <label for="activity-subject">Asignatura</label>
              <input id="activity-subject" name="subject" type="text" maxlength="60" required
                list="subject-suggestions"
                value="${escapeHtml(activity ? activity.subject : '')}" />
              <datalist id="subject-suggestions">
                ${subjectOptions.map((subject) => `<option value="${escapeHtml(subject)}"></option>`).join('')}
              </datalist>
            </div>
            <div class="form-field">
              <label for="activity-grade">Grado</label>
              <select id="activity-grade" name="grade">
                <option value="">Sin asignar</option>
                ${gradeOptions}
              </select>
            </div>
            <div class="form-field">
              <label for="activity-topic">Tema (opcional)</label>
              <input id="activity-topic" name="topic" type="text" maxlength="60"
                value="${escapeHtml(activity && activity.topic ? activity.topic : '')}" />
            </div>
            <div class="form-field">
              <label for="activity-difficulty">Dificultad (opcional)</label>
              <select id="activity-difficulty" name="difficulty">
                <option value="">Sin definir</option>
                ${difficultyOptionsHtml}
              </select>
            </div>
            <div class="form-field">
              <label for="activity-instruction">Instrucción</label>
              <textarea id="activity-instruction" name="instruction" rows="2" required>${escapeHtml(activity ? activity.instruction : '')}</textarea>
            </div>
            <div class="form-field">
              <label for="activity-question">Pregunta</label>
              <textarea id="activity-question" name="question" rows="2" required>${escapeHtml(activity ? activity.content.question : '')}</textarea>
            </div>
            <div class="form-field">
              <label>Opciones (marca la respuesta correcta)</label>
              <div data-slot="options">${renderOptionRows()}</div>
              <button type="button" class="btn btn-secondary" data-action="add-option">+ Agregar opción</button>
            </div>
            <div class="form-field">
              <label for="activity-feedback-correct">Retroalimentación si acierta (opcional)</label>
              <input id="activity-feedback-correct" name="feedbackCorrect" type="text" maxlength="200"
                value="${escapeHtml(activity && activity.feedback ? activity.feedback.correct : '')}" />
            </div>
            <div class="form-field">
              <label for="activity-feedback-incorrect">Retroalimentación si falla (opcional)</label>
              <input id="activity-feedback-incorrect" name="feedbackIncorrect" type="text" maxlength="200"
                value="${escapeHtml(activity && activity.feedback ? activity.feedback.incorrect : '')}" />
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Guardar</button>
              <button type="button" class="btn btn-secondary" data-action="cancel">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  function render(container) {
    containerRef = container;
    container.innerHTML = `
      ${renderToolbar()}
      ${renderAlert()}
      ${renderFilters()}
      <div data-slot="table">${renderTable()}</div>
      <div data-slot="modal">${renderModal()}</div>
    `;
    bindEvents();
  }

  function rerender() {
    if (containerRef) render(containerRef);
  }

  async function refreshSubjectOptions() {
    try {
      const all = await window.ActivityService.list({ includeInactive: true });
      const unique = Array.from(new Set(all.map((activity) => activity.subject))).sort((a, b) =>
        a.localeCompare(b, 'es')
      );
      subjectOptions = unique;
    } catch (error) {
      subjectOptions = [];
    }
  }

  async function refreshList() {
    try {
      activities = await window.ActivityService.list({
        grade: filters.grade || null,
        subject: filters.subject || null,
        includeInactive: true,
      });
    } catch (error) {
      listAlert = { type: 'error', message: 'No se pudo cargar el banco de actividades.' };
    }
    rerender();
  }

  function resetFormOptionsState() {
    formOptions = [{ text: '' }, { text: '' }];
    formCorrectIndex = 0;
  }

  function loadFormOptionsFromActivity(activity) {
    formOptions = activity.content.options.map((option) => ({ text: option.text }));
    const correctIndex = activity.content.options.findIndex(
      (option) => option.id === activity.solution.correctOptionId
    );
    formCorrectIndex = correctIndex >= 0 ? correctIndex : 0;
  }

  function openCreateForm() {
    editingActivity = null;
    formErrors = [];
    resetFormOptionsState();
    isModalOpen = true;
    rerender();
  }

  function openEditForm(activityId) {
    const activity = activities.find((item) => item.id === activityId) || null;
    editingActivity = activity;
    formErrors = [];
    if (activity) {
      loadFormOptionsFromActivity(activity);
    } else {
      resetFormOptionsState();
    }
    isModalOpen = true;
    rerender();
  }

  function closeForm() {
    isModalOpen = false;
    editingActivity = null;
    formErrors = [];
    rerender();
  }

  // Sincroniza el texto de las opciones y cuál está marcada como correcta
  // desde el DOM vivo hacia el estado del módulo. Debe llamarse ANTES de
  // agregar/quitar una fila y volver a renderizar, o el re-render (que
  // reemplaza todo el innerHTML) perdería lo que el docente ya había
  // escrito en las demás filas.
  function syncFormOptionsFromDom(form) {
    const rows = Array.from(form.querySelectorAll('[data-option-row]'));
    formOptions = rows.map((row) => ({ text: row.querySelector('[data-option-text]').value }));
    const checkedRadio = form.querySelector('input[name="correct-option"]:checked');
    formCorrectIndex = checkedRadio ? Number(checkedRadio.value) : 0;
  }

  // Actualiza solo el bloque de opciones dentro del formulario, en vez de
  // volver a renderizar todo el modal: un rerender() completo regenera
  // título/asignatura/instrucción/etc. a partir del estado (que para una
  // actividad nueva no guarda lo que el docente ya escribió ahí), borrando
  // todo lo demás que llevaba llenado.
  function updateOptionsSection(form) {
    const optionsSlot = form.querySelector('[data-slot="options"]');
    if (!optionsSlot) return;
    optionsSlot.innerHTML = renderOptionRows();
    optionsSlot.querySelectorAll('[data-action="remove-option"]').forEach((button) => {
      button.addEventListener('click', () => handleRemoveOption(form, Number(button.dataset.index)));
    });
  }

  function handleAddOption(form) {
    syncFormOptionsFromDom(form);
    formOptions.push({ text: '' });
    updateOptionsSection(form);
  }

  function handleRemoveOption(form, index) {
    syncFormOptionsFromDom(form);
    if (formOptions.length <= MIN_OPTIONS) return;
    formOptions.splice(index, 1);
    if (formCorrectIndex === index) {
      formCorrectIndex = 0;
    } else if (formCorrectIndex > index) {
      formCorrectIndex -= 1;
    }
    updateOptionsSection(form);
  }

  async function handleToggleActive(activityId) {
    const activity = activities.find((item) => item.id === activityId);
    if (!activity) return;

    if (activity.isActive) {
      const confirmed = window.confirm(`¿Desactivar "${activity.title}"? Podrás activarla nuevamente cuando quieras.`);
      if (!confirmed) return;
    }

    try {
      await window.ActivityService.setActive(activityId, !activity.isActive);
      listAlert = { type: 'success', message: 'El estado de la actividad se actualizó correctamente.' };
      await refreshList();
    } catch (error) {
      listAlert = { type: 'error', message: 'No se pudo actualizar el estado de la actividad.' };
      rerender();
    }
  }

  async function handleDuplicate(activityId) {
    try {
      await window.ActivityService.duplicate(activityId);
      listAlert = { type: 'success', message: 'Actividad duplicada correctamente.' };
      await refreshSubjectOptions();
      await refreshList();
    } catch (error) {
      listAlert = { type: 'error', message: 'No se pudo duplicar la actividad.' };
      rerender();
    }
  }

  // Lee los valores finales directamente del DOM (fuente de verdad en el
  // momento del envío), no del estado en memoria, que solo se usa para
  // llevar la cuenta de filas entre renders.
  function readFormValues(form) {
    const formData = new FormData(form);
    const grade = formData.get('grade');
    const difficulty = formData.get('difficulty');
    const feedbackCorrect = String(formData.get('feedbackCorrect') || '').trim();
    const feedbackIncorrect = String(formData.get('feedbackIncorrect') || '').trim();

    const rows = Array.from(form.querySelectorAll('[data-option-row]'));
    const options = rows.map((row, index) => ({
      id: optionLetter(index),
      text: row.querySelector('[data-option-text]').value.trim(),
    }));
    const checkedRadio = form.querySelector('input[name="correct-option"]:checked');
    const correctIndex = checkedRadio ? Number(checkedRadio.value) : -1;
    const correctOptionId = correctIndex >= 0 && options[correctIndex] ? options[correctIndex].id : null;

    return {
      title: String(formData.get('title') || '').trim(),
      subject: String(formData.get('subject') || '').trim(),
      grade: grade ? Number(grade) : null,
      topic: String(formData.get('topic') || '').trim() || null,
      difficulty: difficulty || null,
      instruction: String(formData.get('instruction') || '').trim(),
      content: { question: String(formData.get('question') || '').trim(), options },
      solution: { correctOptionId },
      feedback: feedbackCorrect || feedbackIncorrect ? { correct: feedbackCorrect, incorrect: feedbackIncorrect } : null,
    };
  }

  function validateClientSide(values) {
    if (!values.title) return 'El título es obligatorio.';
    if (!values.subject) return 'La asignatura es obligatoria.';
    if (!values.instruction) return 'La instrucción es obligatoria.';
    if (!values.content.question) return 'La pregunta es obligatoria.';
    if (values.content.options.some((option) => !option.text)) return 'Todas las opciones deben tener texto.';
    if (!values.solution.correctOptionId) return 'Marca cuál opción es la respuesta correcta.';
    return null;
  }

  async function handleFormSubmit(event) {
    event.preventDefault();
    const values = readFormValues(event.target);

    const clientError = validateClientSide(values);
    if (clientError) {
      formErrors = [{ field: 'general', message: clientError }];
      rerender();
      return;
    }

    try {
      if (editingActivity) {
        await window.ActivityService.update(editingActivity.id, values);
        listAlert = { type: 'success', message: 'Actividad actualizada correctamente.' };
      } else {
        await window.ActivityService.create(values);
        listAlert = { type: 'success', message: 'Actividad creada correctamente.' };
      }
      isModalOpen = false;
      editingActivity = null;
      formErrors = [];
      await refreshSubjectOptions();
      await refreshList();
    } catch (error) {
      formErrors = error.issues || [{ field: 'general', message: error.message }];
      rerender();
    }
  }

  function bindEvents() {
    containerRef.querySelector('[data-action="new-activity"]')?.addEventListener('click', openCreateForm);

    containerRef.querySelectorAll('[data-action="edit"]').forEach((button) => {
      button.addEventListener('click', () => openEditForm(button.dataset.id));
    });
    containerRef.querySelectorAll('[data-action="duplicate"]').forEach((button) => {
      button.addEventListener('click', () => handleDuplicate(button.dataset.id));
    });
    containerRef.querySelectorAll('[data-action="toggle-active"]').forEach((button) => {
      button.addEventListener('click', () => handleToggleActive(button.dataset.id));
    });

    const gradeFilter = containerRef.querySelector('[data-filter="grade"]');
    gradeFilter?.addEventListener('change', () => {
      filters.grade = gradeFilter.value;
      refreshList();
    });
    const subjectFilter = containerRef.querySelector('[data-filter="subject"]');
    subjectFilter?.addEventListener('change', () => {
      filters.subject = subjectFilter.value;
      refreshList();
    });

    containerRef.querySelector('[data-action="cancel"]')?.addEventListener('click', closeForm);

    const backdrop = containerRef.querySelector('[data-action="backdrop"]');
    backdrop?.addEventListener('click', (event) => {
      if (event.target === backdrop) closeForm();
    });

    const form = containerRef.querySelector('[data-form="activity"]');
    form?.addEventListener('submit', handleFormSubmit);

    form?.querySelector('[data-action="add-option"]')?.addEventListener('click', () => handleAddOption(form));
    form?.querySelectorAll('[data-action="remove-option"]').forEach((button) => {
      button.addEventListener('click', () => handleRemoveOption(form, Number(button.dataset.index)));
    });
  }

  return {
    async render(container) {
      render(container);
      await refreshSubjectOptions();
      await refreshList();
    },
    unmount() {
      containerRef = null;
      isModalOpen = false;
      editingActivity = null;
      formErrors = [];
      listAlert = null;
    },
  };
})();
