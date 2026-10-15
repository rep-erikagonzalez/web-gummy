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
  { href: '#lo-que-pienso', label: 'Lo que pienso', dot: 'bloom' },
  { href: '#contacto', label: 'Contacto', dot: 'ink' },
]

export const stats = [
  { id: 'systems', fruit: 'berry', tone: 'berry', mark: 'Ing.', label: 'Ingeniería de Sistemas' },
  { id: 'masters', fruit: 'pear', tone: 'pear', mark: 'Posgrado', label: 'Maestría en dirección de TI' },
  { id: 'people', fruit: 'bloom', tone: 'bloom', value: 100, prefix: '+', label: 'personas certificadas' },
  { id: 'years', fruit: 'star', tone: 'star', value: 9, prefix: '+', label: 'años de experiencia' },
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
      title: 'Bachillerato Técnico en Programación de software',
      place: 'SENA',
      when: '2013',
      tone: 'star',
    },
  ],
  coursesTitle: 'Cursos',
  coursesNote: 'Un curso termina. Al día siguiente sale otra cosa.',
  courses: [
    {
      title: 'Ciberseguridad de Google',
      meta: '2025 · Certificado profesional · Google',
      tone: 'berry',
    },
    {
      title: 'Google AI Essentials',
      meta: '2025 · Curso · Google',
      tone: 'pear',
    },
    {
      title: 'Diplomado en Diseño de la Interacción UI-UX',
      meta: '2025 · Universidad del Quindío',
      tone: 'bloom',
    },
    {
      title: 'Diplomado en Diseño UX/UI-2',
      meta: '2024 · Universidad nacional de Colombia',
      tone: 'star',
    },
    {
      title: 'Diplomado en docencia y didáctica universitaria',
      meta: '2023 · Politécnico superior',
      tone: 'berry',
    },
  ],
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
        'En las entidades públicas, los documentos y trámites circulaban en papel y por correo, y era difícil saber en qué estado estaba cada uno.',
      did: 'Desarrollo y mantenimiento de Intraweb, una marca registrada: plataforma web de gestión documental para cualquier entidad pública, con radicación, flujos de aprobación, consulta y archivo digital.',
      tech: ['PHP', 'Laravel', 'Vue.js', 'Linux'],
      result: 'Hoy la usa cualquier entidad pública en su trabajo diario.',
      link: '',
    },
    {
      id: 'epa',
      name: 'Trámites y servicios en general',
      category: 'Sector público',
      fruit: 'pear',
      tone: 'pear',
      tags: ['publico'],
      problem: 'La ciudadanía necesitaba trámites y servicios más claros para gestionarlos.',
      did: 'He desarrollado una gran cantidad de trámites y servicios para la ciudadanía.',
      tech: ['Laravel', 'Ionic', 'JavaScript', 'AWS'],
      result: 'Esos trámites y servicios ya están disponibles para la ciudadanía.',
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
      tech: ['Herramientas digitales', 'IA aplicada', 'Servicios de Google'],
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
  favorites: [
    { id: 'cursor', name: 'Cursor' },
    { id: 'claude', name: 'Claude' },
    { id: 'gemini', name: 'Gemini' },
    { id: 'grok', name: 'Grok' },
  ],
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

export const thoughts = {
  label: 'Lo que pienso',
  intro:
    'No quiero hacer tecnología por hacer tecnología. Estas son algunas ideas que guían lo que hago.',
  items: [
    {
      number: '01',
      fruit: 'berry',
      tone: 'berry',
      title: 'La IA será una extensión del ser humano.',
      text: 'No viene a reemplazarnos. Viene a ampliar lo que ya somos: pensar más rápido, crear más lejos, recordar lo que se nos escapa. Como un lápiz o un libro, pero más cerca.',
    },
    {
      number: '02',
      fruit: 'pear',
      tone: 'pear',
      title: 'Los ingenieros tenemos el ego muy alto.',
      text: 'Me incluyo. A veces construimos para demostrar que sabemos, no para que alguien lo use. La industria tiene que cambiar, y ese cambio empieza desde dentro: escuchando más y presumiendo menos.',
    },
    {
      number: '03',
      fruit: 'star',
      tone: 'star',
      title: 'Un sistema que complica, falló.',
      text: 'La tecnología debe ayudar, no estorbar. Si alguien necesita un manual para hacer algo simple, el problema no es la persona: es el sistema.',
    },
    {
      number: '04',
      fruit: 'bloom',
      tone: 'bloom',
      title: 'Hoy una buena conversación con una IA puede valer más que muchas charlas vacías.',
      text: 'No reemplaza a nadie. Pero cuando encuentro curiosidad, paciencia y ganas de pensar, la aprovecho, venga de donde venga.',
    },
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
        { href: '#cursos', label: 'Cursos' },
        { href: '#lo-que-pienso', label: 'Lo que pienso' },
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
