export const config = {
  email: 'ejgonzalez971@gmail.com',
  location: 'Quindío, Colombia',
  linkedin: '', // vacío = no se muestra el enlace
  github: '', // vacío = no se muestra el enlace
  formspreeId: '', // vacío = el formulario usa mailto como alternativa
}

export const nav = [
  { href: '#sobre-mi', label: 'Sobre mí', dot: 'berry' },
  { href: '#que-hago', label: 'Qué hago', dot: 'pear' },
  { href: '#proyectos', label: 'Proyectos', dot: 'bloom' },
  { href: '#ecosistema', label: 'Ecosistema IA', dot: 'star' },
  { href: '#contacto', label: 'Contacto', dot: 'ink' },
]

export const stats = [
  { id: 'systems', fruit: 'berry', tone: 'berry', mark: 'Ing.', label: 'Ingeniería de Sistemas' },
  { id: 'masters', fruit: 'pear', tone: 'pear', mark: 'MSc', label: 'Maestría en dirección de TI' },
  { id: 'people', fruit: 'bloom', tone: 'bloom', value: 100, prefix: '+', label: 'personas certificadas' },
  { id: 'years', fruit: 'star', tone: 'star', value: 9, prefix: '+', label: 'años de experiencia' },
  { id: 'courses', fruit: 'berry', tone: 'berry', value: 4, label: 'cursos de formación digital' },
]

export const about = {
  title: 'Sobre mí',
  photoAlt: 'Erika González',
  photoFallback: '[Foto: /images/erika.png]',
  bio: 'Llevo años entre código, bases de datos, webs y proyectos. Me gusta aprender, probar y dejar las cosas un poco más simples. No tengo una fórmula: pruebo, me equivoco y vuelvo a intentar.',
  studiesTitle: 'Formación',
  studies: [
    {
      title: 'Maestría en Dirección y Gestión de Tecnologías de la Información (TI)',
      place: 'Universidad Internacional de La Rioja',
      when: 'En curso',
      tone: 'berry',
    },
    {
      title: 'Ingeniería de Sistemas',
      place: 'Universidad Nacional Abierta y a Distancia',
      when: '2017–2021',
      tone: 'pear',
    },
    {
      title: 'Tecnología en Análisis y Desarrollo de Sistemas de Información',
      place: 'SENA',
      when: '2014–2016',
      tone: 'bloom',
    },
    {
      title: 'Bachillerato Técnico en Programación Informática',
      place: 'Colegio Ciudad Cuba / SENA',
      when: '2013',
      tone: 'star',
    },
  ],
  beliefTitle: 'Cómo veo la tecnología',
  beliefLine: 'No quiero hacer tecnología por hacer tecnología.',
  belief:
    'La tecnología vale cuando alguien la usa sin pensar en ella. Prefiero una solución simple que funcione a una brillante que nadie entiende. Escucho primero, construyo después y vuelvo a ajustar hasta que encaje en la vida real de quien la va a usar.',
  principles: [
    { label: 'Simple antes que brillante', tone: 'berry' },
    { label: 'Primero escuchar', tone: 'pear' },
    { label: 'Probar, fallar, ajustar', tone: 'star' },
  ],
}

export const services = {
  title: 'Qué hago',
  items: [
    {
      id: 'software',
      fruit: 'berry',
      tone: 'berry',
      title: 'Software y sitios que alguien va a abrir',
      text: 'Desarrollo web, landings, de la idea a algo usable.',
    },
    {
      id: 'systems',
      fruit: 'pear',
      tone: 'pear',
      title: 'Sistemas que se hablan',
      text: 'APIs, integraciones, liderazgo técnico.',
    },
    {
      id: 'teach',
      fruit: 'star',
      tone: 'star',
      title: 'Aprendo y lo enseño',
      text: 'Formación digital, IA aplicada.',
    },
  ],
}

export const projects = {
  title: 'Proyectos',
  filterLabel: 'Filtrar proyectos',
  labels: {
    problem: 'Problema',
    did: 'Qué hice',
    result: 'Resultado',
  },
  filters: [
    { id: 'todos', label: 'Todos' },
    { id: 'publico', label: 'Sector público' },
    { id: 'integraciones', label: 'Integraciones' },
    { id: 'ia', label: 'IA' },
    { id: 'formacion', label: 'Formación' },
  ],
  items: [
    {
      id: 'intraweb',
      name: 'Intraweb',
      category: 'Sector público',
      fruit: 'berry',
      tone: 'berry',
      tags: ['publico'],
      problem:
        'En la alcaldía, los documentos y trámites circulaban en papel y por correo, y era difícil saber en qué estado estaba cada uno.',
      did: 'Desarrollo y mantenimiento de una plataforma web de gestión documental: radicación, flujos de aprobación, consulta y archivo digital.',
      tech: ['PHP', 'Laravel', 'Vue.js', 'Linux'],
      result: 'Hoy la usan la alcaldía y otras entidades públicas del Quindío en su trabajo diario.',
      link: '',
    },
    {
      id: 'epa',
      name: 'Mantenimientos EPA',
      category: 'Sector público',
      fruit: 'pear',
      tone: 'pear',
      tags: ['publico'],
      problem: 'La programación y el registro de mantenimientos dependían de hojas de cálculo y reportes manuales.',
      did: 'Sistema para programar, registrar y consultar mantenimientos, con una app móvil para que el personal en campo reporte desde el sitio.',
      tech: ['Laravel', 'Ionic', 'JavaScript', 'AWS'],
      result: 'Seguimiento centralizado y un historial consultable de cada mantenimiento.',
      link: '',
    },
    {
      id: 'ia-dev',
      name: 'IA en el desarrollo',
      category: 'IA',
      fruit: 'star',
      tone: 'star',
      tags: ['ia'],
      problem: 'Pasar de una idea a un prototipo usable tomaba demasiado tiempo.',
      did: 'Incorporé asistentes de IA a mi flujo de trabajo: prototipado, revisión de código, documentación y pruebas.',
      tech: ['Cursor', 'Claude', 'Gemini', 'Git'],
      result: 'Ciclos más cortos de idea a prototipo. Esta web es un ejemplo: diseñada y construida con IA.',
      link: '',
    },
    {
      id: 'google',
      name: 'Integraciones con Google',
      category: 'Integraciones',
      fruit: 'bloom',
      tone: 'bloom',
      tags: ['integraciones'],
      problem: 'Información repetida en varias herramientas que no se comunicaban entre sí.',
      did: 'Integraciones entre sistemas propios y Google Workspace: inicio de sesión con Google, Drive, Calendar y Sheets.',
      tech: ['Google APIs', 'OAuth 2.0', 'PHP', 'JavaScript'],
      result: 'Menos trabajo manual y datos sincronizados entre herramientas.',
      link: '',
    },
    {
      id: 'formacion',
      name: 'Formación digital',
      category: 'Formación',
      fruit: 'berry',
      tone: 'berry',
      tags: ['formacion'],
      problem: 'Muchas personas querían usar mejor la tecnología en su trabajo, pero no sabían por dónde empezar.',
      did: 'Diseñé e impartí 4 cursos de formación digital, prácticos y pensados para aplicar desde el primer día.',
      tech: ['Herramientas digitales', 'IA aplicada', 'WordPress'],
      result: 'Más de 100 personas certificadas.',
      link: '',
    },
  ],
}

export const tools = {
  title: 'Con qué construyo',
  more: 'y lo que siga saliendo',
  code: ['PHP', 'Java', 'JavaScript', 'Laravel', 'Vue.js', 'Ionic', 'HTML', 'CSS'],
  practice: ['AWS', 'Azure', 'Linux', 'Git', 'WordPress', 'Scrum', 'Google APIs'],
}

export const ecosystem = {
  badge: 'En construcción',
  title: 'Un ecosistema de IAs para mi día a día.',
  subtitle:
    'No es una empresa. Es un experimento que crece conmigo: una IA para cada tarea, conectadas entre sí.',
  logTitle: 'Bitácora del experimento',
  favoritesTitle: 'Mis IAs favoritas',
  favorites: ['Cursor', 'Claude', 'Gemini', 'Grok'],
  assistants: [
    {
      id: 'agenda',
      name: 'Agenda',
      verb: 'Organizar',
      fruit: 'berry',
      tone: 'berry',
      status: 'En uso',
      statusTone: 'use',
      description: 'Ordena tareas, prioridades y recordatorios para que la semana no me gane.',
      examples: ['planificar la semana', 'priorizar pendientes', 'recordar entregas'],
    },
    {
      id: 'mentora',
      name: 'Mentora',
      verb: 'Aprender',
      fruit: 'pear',
      tone: 'pear',
      status: 'En uso',
      statusTone: 'use',
      description: 'Me ayuda a estudiar: resume lecturas, crea fichas y me pregunta lo que aprendí.',
      examples: ['resúmenes de la maestría', 'fichas de repaso', 'explicar conceptos difíciles'],
    },
    {
      id: 'chispa',
      name: 'Chispa',
      verb: 'Crear',
      fruit: 'bloom',
      tone: 'bloom',
      status: 'En pruebas',
      statusTone: 'test',
      description: 'Borradores, ideas y primeras versiones de textos, diseños y prototipos.',
      examples: ['primeros borradores', 'lluvia de ideas', 'prototipos de interfaz'],
    },
    {
      id: 'engranaje',
      name: 'Engranaje',
      verb: 'Automatizar',
      fruit: 'star',
      tone: 'star',
      status: 'En idea',
      statusTone: 'idea',
      description: 'Se encarga de lo repetitivo: mover datos, generar reportes y responder lo de siempre.',
      examples: ['reportes automáticos', 'mover datos entre herramientas', 'respuestas frecuentes'],
    },
  ],
  log: [
    { id: 'day-one', when: 'Día uno', text: 'La idea: dejar de usar IA suelta y armar un sistema propio.' },
    { id: 'now', when: 'Ahora', text: 'Agenda y Mentora funcionan a diario; Chispa en pruebas.' },
    { id: 'next', when: 'Lo siguiente', text: 'Que Engranaje conecte a las demás.' },
  ],
}

export const contact = {
  title: '¿HABLAMOS?',
  text: 'Un proyecto, una idea o una pregunta sobre tecnología. No tengo todas las respuestas, pero sí puedo pensarlas contigo.',
  topicLabel: '¿Sobre qué quieres hablar?',
  topics: ['Un proyecto', 'Una idea', 'Formación', 'Solo saludar'],
  fields: {
    name: 'Nombre',
    email: 'Correo',
    message: 'Mensaje',
  },
  errors: {
    name: 'Escribe tu nombre.',
    email: 'Escribe un correo válido.',
    topic: 'Elige de qué quieres hablar.',
    message: 'Cuéntame un poco más.',
  },
  submit: 'Enviar',
  sending: 'Enviando…',
  success: '¡Recibido! Te respondo pronto.',
  error: 'No pude enviar el mensaje. Puedes escribirme directamente:',
  copied: '¡Copiado!',
  copyFail: 'No pude copiarlo. Selecciona el correo y cópialo a mano.',
  honeypot: 'No rellenar',
  social: {
    linkedin: 'LinkedIn',
    github: 'GitHub',
  },
}

export const footer = {
  name: 'ERIKA GONZÁLEZ',
  tagline: 'Ingeniera de Sistemas. Tecnología, proyectos e IA. Construyendo, aprendiendo y probando.',
  credit: 'Esta web fue diseñada y desarrollada con IA.',
  rightsName: 'Erika González',
  toTop: 'Volver arriba',
  columns: [
    {
      title: 'Recorrido',
      links: [
        { href: '#sobre-mi', label: 'Sobre mí' },
        { href: '#formacion', label: 'Formación' },
        { href: '#tecnologia', label: 'Cómo veo la tecnología' },
      ],
    },
    {
      title: 'Oficio',
      links: [
        { href: '#que-hago', label: 'Qué hago' },
        { href: '#proyectos', label: 'Proyectos' },
        { href: '#herramientas', label: 'Herramientas' },
      ],
    },
    {
      title: 'Ahora',
      links: [
        { href: '#ecosistema', label: 'Ecosistema de IAs' },
        { href: '#contacto', label: 'Contacto' },
      ],
    },
  ],
}
