function multipleChoiceOption(id, text) {
  return { id, text };
}

// Actividades demostrativas de multiple-choice (ver docs/MVP.md, "Contenido
// inicial", y ADR-023). Se siembran con source 'system' para distinguirlas
// de las actividades creadas por el docente ('teacher').
const DEMO_ACTIVITIES = [
  {
    title: 'Suma básica: 2 + 3',
    subject: 'Matemáticas',
    grade: 1,
    topic: 'suma',
    difficulty: 'easy',
    instruction: 'Selecciona la respuesta correcta.',
    content: {
      question: '¿Cuánto es 2 + 3?',
      options: [multipleChoiceOption('a', '4'), multipleChoiceOption('b', '5'), multipleChoiceOption('c', '6')],
    },
    solution: { correctOptionId: 'b' },
    feedback: { correct: '¡Muy bien!', incorrect: 'Inténtalo nuevamente.' },
  },
  {
    title: 'Resta básica: 5 - 2',
    subject: 'Matemáticas',
    grade: 1,
    topic: 'resta',
    difficulty: 'easy',
    instruction: 'Selecciona la respuesta correcta.',
    content: {
      question: '¿Cuánto es 5 - 2?',
      options: [multipleChoiceOption('a', '2'), multipleChoiceOption('b', '3'), multipleChoiceOption('c', '4')],
    },
    solution: { correctOptionId: 'b' },
    feedback: { correct: '¡Correcto!', incorrect: 'Vuelve a intentarlo.' },
  },
  {
    title: 'Suma de dos cifras: 14 + 8',
    subject: 'Matemáticas',
    grade: 2,
    topic: 'suma',
    difficulty: 'medium',
    instruction: 'Selecciona la respuesta correcta.',
    content: {
      question: '¿Cuánto es 14 + 8?',
      options: [multipleChoiceOption('a', '20'), multipleChoiceOption('b', '21'), multipleChoiceOption('c', '22')],
    },
    solution: { correctOptionId: 'c' },
    feedback: { correct: '¡Excelente!', incorrect: 'Revisa la suma con cuidado.' },
  },
  {
    title: 'Multiplicación: 4 x 3',
    subject: 'Matemáticas',
    grade: 3,
    topic: 'multiplicación',
    difficulty: 'medium',
    instruction: 'Selecciona la respuesta correcta.',
    content: {
      question: '¿Cuánto es 4 x 3?',
      options: [multipleChoiceOption('a', '10'), multipleChoiceOption('b', '12'), multipleChoiceOption('c', '14')],
    },
    solution: { correctOptionId: 'b' },
    feedback: { correct: '¡Muy bien!', incorrect: 'Inténtalo nuevamente.' },
  },
  {
    title: 'Identificar una vocal',
    subject: 'Español',
    grade: 1,
    topic: 'vocales',
    difficulty: 'easy',
    instruction: 'Selecciona la respuesta correcta.',
    content: {
      question: '¿Cuál de estas letras es una vocal?',
      options: [multipleChoiceOption('a', 'B'), multipleChoiceOption('b', 'A'), multipleChoiceOption('c', 'T')],
    },
    solution: { correctOptionId: 'b' },
    feedback: { correct: '¡Muy bien!', incorrect: 'Inténtalo nuevamente.' },
  },
  {
    title: 'Sinónimo de "feliz"',
    subject: 'Español',
    grade: 2,
    topic: 'sinónimos',
    difficulty: 'medium',
    instruction: 'Selecciona la respuesta correcta.',
    content: {
      question: '¿Cuál palabra significa lo mismo que "feliz"?',
      options: [
        multipleChoiceOption('a', 'Triste'),
        multipleChoiceOption('b', 'Contento'),
        multipleChoiceOption('c', 'Enojado'),
      ],
    },
    solution: { correctOptionId: 'b' },
    feedback: { correct: '¡Correcto!', incorrect: 'Vuelve a intentarlo.' },
  },
  {
    title: 'Ortografía: árbol',
    subject: 'Español',
    grade: 2,
    topic: 'ortografía',
    difficulty: 'medium',
    instruction: 'Selecciona la respuesta correcta.',
    content: {
      question: '¿Cuál palabra está bien escrita?',
      options: [
        multipleChoiceOption('a', 'Árbol'),
        multipleChoiceOption('b', 'Arvol'),
        multipleChoiceOption('c', 'Arbol'),
      ],
    },
    solution: { correctOptionId: 'a' },
    feedback: { correct: '¡Muy bien!', incorrect: 'Revisa la ortografía.' },
  },
  {
    title: 'Antónimo de "grande"',
    subject: 'Español',
    grade: 3,
    topic: 'antónimos',
    difficulty: 'medium',
    instruction: 'Selecciona la respuesta correcta.',
    content: {
      question: '¿Cuál palabra significa lo contrario de "grande"?',
      options: [
        multipleChoiceOption('a', 'Enorme'),
        multipleChoiceOption('b', 'Pequeño'),
        multipleChoiceOption('c', 'Alto'),
      ],
    },
    solution: { correctOptionId: 'b' },
    feedback: { correct: '¡Excelente!', incorrect: 'Inténtalo nuevamente.' },
  },
];

// Datos demostrativos: solo en desarrollo (app empaquetada nunca los siembra)
// y solo si la tabla correspondiente está vacía, según docs/MVP.md.
// Los estudiantes demo se identifican con el sufijo "(demo)" en el nombre
// visible porque la tabla `students` no tiene una columna `source` como
// `activities` (ver ADR-019). Las actividades demo sí usan `source: 'system'`
// porque esa columna existe en `activities` (ver ADR-023).
function seedDemoDataIfNeeded({ db, studentRepository, activityRepository, isDev }) {
  if (!isDev) return;

  const studentCount = db.prepare('SELECT COUNT(*) AS count FROM students').get().count;
  if (studentCount === 0) {
    studentRepository.create({ displayName: 'Sofía (demo)', grade: 2, avatar: 'cat-01' });
    studentRepository.create({ displayName: 'Mateo (demo)', grade: 3, avatar: 'fox-01' });
  }

  const activityCount = db.prepare('SELECT COUNT(*) AS count FROM activities').get().count;
  if (activityCount === 0) {
    for (const activity of DEMO_ACTIVITIES) {
      activityRepository.create(
        { ...activity, feedback: activity.feedback ?? null, settings: null },
        { source: 'system' }
      );
    }
  }
}

module.exports = { seedDemoDataIfNeeded };
