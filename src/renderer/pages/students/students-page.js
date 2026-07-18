window.AppPages = window.AppPages || {};

window.AppPages.students = (function createStudentsPage() {
  const AVATARS = [
    { id: 'cat-01', label: 'Gato', emoji: '🐱' },
    { id: 'dog-01', label: 'Perro', emoji: '🐶' },
    { id: 'fox-01', label: 'Zorro', emoji: '🦊' },
    { id: 'owl-01', label: 'Búho', emoji: '🦉' },
    { id: 'bear-01', label: 'Oso', emoji: '🐻' },
    { id: 'rabbit-01', label: 'Conejo', emoji: '🐰' },
  ];

  let containerRef = null;
  let students = [];
  let editingStudent = null;
  let isModalOpen = false;
  let formErrors = [];
  let listAlert = null;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char]));
  }

  function avatarEmoji(avatarId) {
    const avatar = AVATARS.find((item) => item.id === avatarId);
    return avatar ? avatar.emoji : '🙂';
  }

  function renderAlert() {
    if (!listAlert) return '';
    const cssClass = listAlert.type === 'error' ? 'alert-error' : 'alert-success';
    return `<div class="alert ${cssClass}" role="status">${escapeHtml(listAlert.message)}</div>`;
  }

  function renderToolbar() {
    return `
      <div class="students-toolbar">
        <div>
          <h1>Estudiantes</h1>
          <p>Crea y administra los perfiles de tus estudiantes.</p>
        </div>
        <button type="button" class="btn btn-primary" data-action="new-student">+ Nuevo estudiante</button>
      </div>
    `;
  }

  function renderTable() {
    if (students.length === 0) {
      return '<div class="card students-empty">Todavía no hay estudiantes registrados.</div>';
    }

    const rows = students
      .map((student) => {
        const statusBadge = student.isActive
          ? '<span class="badge badge-active">Activo</span>'
          : '<span class="badge badge-inactive">Inactivo</span>';
        const toggleLabel = student.isActive ? 'Desactivar' : 'Activar';
        return `
          <tr>
            <td><span class="student-avatar">${avatarEmoji(student.avatar)}</span>${escapeHtml(student.displayName)}</td>
            <td>${student.grade ?? 'Sin asignar'}</td>
            <td>${statusBadge}</td>
            <td>
              <div class="students-actions">
                <button type="button" class="btn btn-secondary" data-action="edit" data-id="${student.id}">Editar</button>
                <button type="button" class="btn btn-secondary" data-action="toggle-active" data-id="${student.id}">${toggleLabel}</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');

    return `
      <div class="card">
        <table class="students-table">
          <thead>
            <tr><th>Nombre</th><th>Grado</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  function renderModal() {
    if (!isModalOpen) return '';

    const student = editingStudent;
    const title = student ? 'Editar estudiante' : 'Nuevo estudiante';
    const avatarOptions = AVATARS.map(
      (avatar) => `<option value="${avatar.id}" ${student && student.avatar === avatar.id ? 'selected' : ''}>${avatar.emoji} ${avatar.label}</option>`
    ).join('');
    const gradeOptions = [1, 2, 3, 4, 5, 6]
      .map((grade) => `<option value="${grade}" ${student && student.grade === grade ? 'selected' : ''}>${grade}°</option>`)
      .join('');
    const errorsHtml = formErrors.length
      ? `<div class="alert alert-error" role="alert">${formErrors.map((issue) => escapeHtml(issue.message)).join('<br>')}</div>`
      : '';

    return `
      <div class="modal-backdrop" data-action="backdrop">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="student-modal-title">
          <h2 id="student-modal-title">${title}</h2>
          ${errorsHtml}
          <form data-form="student">
            <div class="form-field">
              <label for="student-name">Nombre visible o apodo</label>
              <input id="student-name" name="displayName" type="text" maxlength="60" required
                value="${escapeHtml(student ? student.displayName : '')}" />
            </div>
            <div class="form-field">
              <label for="student-grade">Grado</label>
              <select id="student-grade" name="grade">
                <option value="">Sin asignar</option>
                ${gradeOptions}
              </select>
            </div>
            <div class="form-field">
              <label for="student-avatar">Avatar</label>
              <select id="student-avatar" name="avatar">
                ${avatarOptions}
              </select>
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
      <div data-slot="table">${renderTable()}</div>
      <div data-slot="modal">${renderModal()}</div>
    `;
    bindEvents();
  }

  function rerender() {
    if (containerRef) render(containerRef);
  }

  async function refreshList() {
    try {
      students = await window.StudentService.list({ includeInactive: true });
    } catch (error) {
      listAlert = { type: 'error', message: 'No se pudo cargar la lista de estudiantes.' };
    }
    rerender();
  }

  function openCreateForm() {
    editingStudent = null;
    formErrors = [];
    isModalOpen = true;
    rerender();
  }

  function openEditForm(studentId) {
    editingStudent = students.find((student) => student.id === studentId) || null;
    formErrors = [];
    isModalOpen = true;
    rerender();
  }

  function closeForm() {
    isModalOpen = false;
    editingStudent = null;
    formErrors = [];
    rerender();
  }

  async function handleToggleActive(studentId) {
    const student = students.find((item) => item.id === studentId);
    if (!student) return;

    if (student.isActive) {
      const confirmed = window.confirm(`¿Desactivar a ${student.displayName}? Podrás activarlo nuevamente cuando quieras.`);
      if (!confirmed) return;
    }

    try {
      await window.StudentService.setActive(studentId, !student.isActive);
      listAlert = { type: 'success', message: 'El estado del estudiante se actualizó correctamente.' };
      await refreshList();
    } catch (error) {
      listAlert = { type: 'error', message: 'No se pudo actualizar el estado del estudiante.' };
      rerender();
    }
  }

  function readFormValues(form) {
    const formData = new FormData(form);
    const grade = formData.get('grade');
    return {
      displayName: String(formData.get('displayName') || '').trim(),
      grade: grade ? Number(grade) : null,
      avatar: formData.get('avatar') || null,
    };
  }

  async function handleFormSubmit(event) {
    event.preventDefault();
    const values = readFormValues(event.target);

    if (!values.displayName) {
      formErrors = [{ field: 'displayName', message: 'El nombre visible es obligatorio.' }];
      rerender();
      return;
    }

    try {
      if (editingStudent) {
        await window.StudentService.update(editingStudent.id, values);
        listAlert = { type: 'success', message: 'Estudiante actualizado correctamente.' };
      } else {
        await window.StudentService.create(values);
        listAlert = { type: 'success', message: 'Estudiante creado correctamente.' };
      }
      isModalOpen = false;
      editingStudent = null;
      formErrors = [];
      await refreshList();
    } catch (error) {
      formErrors = error.issues || [{ field: 'general', message: error.message }];
      rerender();
    }
  }

  function bindEvents() {
    containerRef.querySelector('[data-action="new-student"]')?.addEventListener('click', openCreateForm);

    containerRef.querySelectorAll('[data-action="edit"]').forEach((button) => {
      button.addEventListener('click', () => openEditForm(button.dataset.id));
    });

    containerRef.querySelectorAll('[data-action="toggle-active"]').forEach((button) => {
      button.addEventListener('click', () => handleToggleActive(button.dataset.id));
    });

    containerRef.querySelector('[data-action="cancel"]')?.addEventListener('click', closeForm);

    const backdrop = containerRef.querySelector('[data-action="backdrop"]');
    backdrop?.addEventListener('click', (event) => {
      if (event.target === backdrop) closeForm();
    });

    containerRef.querySelector('[data-form="student"]')?.addEventListener('submit', handleFormSubmit);
  }

  return {
    render(container) {
      render(container);
      refreshList();
    },
    unmount() {
      containerRef = null;
      isModalOpen = false;
      editingStudent = null;
      formErrors = [];
      listAlert = null;
    },
  };
})();
